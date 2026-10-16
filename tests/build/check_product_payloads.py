"""Inspect a completed Android build for product exclusion and retained payloads."""

import argparse
import hashlib
import importlib
import json
import os
from pathlib import Path
import re
import sys
import subprocess
import zipfile

REMOVED_CLASSES = (
    "org/chromium/chrome/browser/brave_news/",
    "org/chromium/chrome/browser/crypto_wallet/",
    "org/chromium/chrome/browser/app/domain/",
    "org/chromium/chrome/browser/BraveRewards",
    "org/chromium/chrome/browser/BraveAdsNativeHelper",
    "org/chromium/chrome/browser/rewards/",
    "org/chromium/chrome/browser/notifications/BraveAds",
    "org/chromium/chrome/browser/ntp/SponsoredRichMediaWebView",
)
REQUIRED_CLASSES = (
    "org/chromium/chrome/browser/tv/TvHomePage.class",
    "org/chromium/chrome/browser/vpn/BraveVpnNativeWorker.class",
    "org/chromium/chrome/browser/brave_leo/BraveLeoMojomHelper.class",
    "org/chromium/chrome/browser/shields/FilterListServiceFactory.class",
)
REQUIRED_RESOURCES = (
    "IDR_BRAVE_ADBLOCK_BUNDLED_CATALOG",
    "IDR_BRAVE_ADBLOCK_BUNDLED_RESOURCES",
    "IDR_BRAVE_ADBLOCK_BUNDLED_DEFAULT",
    "IDR_BRAVE_ADBLOCK_BUNDLED_PRIVACY",
    "IDR_BRAVE_ADBLOCK_BUNDLED_FIRST_PARTY",
    "IDR_BRAVE_ADBLOCK_BUNDLED_COOKIES",
    "IDR_BRAVE_ADBLOCK_BUNDLED_MOBILE",
    "IDR_AI_CHAT_UI_HTML",
    "IDR_AI_CHAT_UNTRUSTED_CONVERSATION_UI_HTML",
)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def check_entries(names: set[str], baseline: set[str]) -> None:
    require(any(n.endswith("/libchrome.so") for n in names), "browser library missing")
    require(any(n.endswith("/libwg-go.so") for n in names), "VPN WireGuard library missing")
    browser_libraries = {n for n in names if n.endswith("/libchrome.so")}
    baseline_libraries = {n for n in baseline if n.endswith("/libchrome.so")}
    require(browser_libraries == baseline_libraries, "baseline and candidate browser ABIs differ")
    require(all(n.replace("/libchrome.so", "/libwg-go.so") in names for n in browser_libraries),
            "VPN library missing for a browser ABI")
    require("assets/brave_resources.pak" in names, "Brave resource pack missing")
    require("assets/ntp_news_optin_icon_animation.json" not in names, "News animation retained")
    locales = {n for n in names if n.startswith("assets/locales/")}
    expected = {n for n in baseline if n.startswith("assets/locales/")}
    require(bool(expected), "baseline locale assets missing")
    require(locales == expected, "browser locale coverage changed")


def breakdown(apk: Path) -> dict[str, int]:
    sizes = {"apk": apk.stat().st_size, "native": 0, "dex": 0, "assets": 0, "other": 0}
    with zipfile.ZipFile(apk) as archive:
        for entry in archive.infolist():
            group = (
                "native" if entry.filename.startswith("lib/") else
                "dex" if entry.filename.endswith(".dex") else
                "assets" if entry.filename.startswith("assets/") else "other"
            )
            sizes[group] += entry.compress_size
    return sizes


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Chromium src with its pinned grit reader")
    parser.add_argument("output", type=Path, help="completed Android output directory")
    parser.add_argument("apk", type=Path)
    parser.add_argument("baseline", type=Path, help="matching ABI and packaging baseline APK")
    args = parser.parse_args()
    sys.path.insert(0, str(args.source / "brave/script"))
    sys.path.insert(0, str(args.source / "tools/grit"))
    data_pack = importlib.import_module("grit.format.data_pack")
    with zipfile.ZipFile(args.baseline) as baseline, zipfile.ZipFile(args.apk) as apk:
        check_entries(set(apk.namelist()), set(baseline.namelist()))
        packed = data_pack.ReadDataPackFromString(apk.read("assets/brave_resources.pak")).resources

    header = args.output / "gen/components/grit/brave_components_resources.h"
    ids = {name: int(value) for name, value in re.findall(r"#define (IDR_\w+) (\d+)", header.read_text())}
    for name in REQUIRED_RESOURCES:
        require(name in ids and bool(packed.get(ids[name])), f"required packed resource missing: {name}")
    forbidden = ("IDR_WALLET_", "IDR_BRAVE_WALLET_", "IDR_BRAVE_NEWS_", "IDR_ADS_INTERNALS_")
    require(not any(name.startswith(forbidden) and value in packed for name, value in ids.items()),
            "removed product resources remain in the packed resource index")

    jar = args.output / "obj/chrome/android/chrome_java.javac.jar"
    with zipfile.ZipFile(jar) as archive:
        classes = set(archive.namelist())
    require(not any(c.startswith(REMOVED_CLASSES) for c in classes), "removed implementation remains in Java input to R8")
    require(all(c in classes for c in REQUIRED_CLASSES), "retained implementation missing from Java input to R8")

    flags: dict[str, int] = {}
    for path in (args.output / "gen/brave/components").rglob("buildflags.h"):
        for name, value in re.findall(r"#define BUILDFLAG_INTERNAL_(ENABLE_\w+)\(\) \(([01])\)", path.read_text()):
            flags[name] = int(value)
    for feature in ("BRAVE_NEWS", "BRAVE_WALLET", "BRAVE_REWARDS", "BRAVE_ADS"):
        require(flags.get("ENABLE_" + feature) == 0, f"{feature} compiled build flag is not disabled")
    for feature in ("AI_CHAT", "BRAVE_VPN"):
        require(flags.get("ENABLE_" + feature) == 1, f"{feature} compiled build flag is not enabled")

    environment = os.environ.copy()
    environment["PYTHONPATH"] = str(args.source.resolve() / "brave/script") + os.pathsep + environment.get("PYTHONPATH", "")
    graph = subprocess.check_output(
        [str(args.source.resolve() / "buildtools/linux64/gn"), "desc",
         str(args.output.resolve()), "//brave:brave", "deps", "--all"],
        cwd=args.source, env=environment, text=True,
    )
    require("ERROR" not in graph, "GN dependency inspection failed")
    targets = set(graph.splitlines())
    for target in (
        "//brave/components/brave_shields/core/common/adblock/rs:rust_lib",
        "//brave/components/ai_chat/core/browser:browser",
        "//brave/components/brave_vpn/browser:browser",
    ):
        require(target in targets, f"required implementation absent from build graph: {target}")
    for target in (
        "//brave/components/brave_news/renderer:renderer",
        "//brave/components/brave_news/browser:browser",
        "//brave/components/brave_wallet/browser:browser",
        "//brave/browser/brave_rewards:brave_rewards_impl",
        "//brave/browser/brave_ads:impl",
        "//brave/components/brave_ads/core:core",
        "//brave/components/brave_adaptive_captcha:brave_adaptive_captcha",
        "//brave/browser/ui/webui/new_tab_takeover/android:new_tab_takeover",
    ):
        require(target not in targets, f"removed implementation remains in build graph: {target}")

    candidate_sizes = breakdown(args.apk)
    baseline_sizes = breakdown(args.baseline)
    with args.apk.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    print(json.dumps({"passed": True, "apk": str(args.apk), "sha256": digest,
                      "baseline_bytes": baseline_sizes, "candidate_bytes": candidate_sizes,
                      "delta_bytes": {k: candidate_sizes[k] - baseline_sizes[k] for k in candidate_sizes},
                      "flags": {k: flags[k] for k in sorted(flags) if k in {
                          "ENABLE_BRAVE_NEWS", "ENABLE_BRAVE_WALLET", "ENABLE_BRAVE_REWARDS",
                          "ENABLE_BRAVE_ADS", "ENABLE_AI_CHAT", "ENABLE_BRAVE_VPN"}}}, indent=2))


if __name__ == "__main__":
    main()
