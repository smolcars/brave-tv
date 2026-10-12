"""Read-only native upgrade comparison on the preserved TV baseline emulator.

Run after native UI checks and Home/background have saved the normal model.
This compares persisted metadata, not UI, history, site storage or process-relaunch acceptance.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shlex
import subprocess
from typing import Any


PACKAGE = "com.brave.browser_default"
AVD = "brave_tv_onboarding_api36"
COOKIE_LIST = "AC023D22-AE88-4060-A978-4FEEEC4221693"


def compare_preserved(before: dict[str, Any], after: dict[str, Any]) -> None:
    """Compare only the seeded native data; artifact versions intentionally differ."""
    for field in ("normalTabs", "group", "bookmarks", "search", "shields", "filter"):
        if field not in before or field not in after or before[field] != after[field]:
            raise ValueError(f"Native upgrade changed {field}")


def read_snapshot(serial: str, workspace: Path, output: Path) -> dict[str, Any]:
    if not re.fullmatch(r"emulator-\d+", serial):
        raise ValueError("Explicit nonphysical emulator serial required")
    adb = ["adb", "-s", serial]

    def command(*args: str) -> bytes:
        return subprocess.run(
            adb + list(args), check=True, capture_output=True, timeout=20
        ).stdout

    if command("emu", "avd", "name").decode().splitlines() != [AVD, "OK"]:
        raise ValueError("Preserved baseline AVD required")

    def native_file(path: str, limit: int) -> bytes:
        result = command("exec-out", shlex.join(["run-as", PACKAGE, "head", "-c", str(limit + 1), path]))
        if not result or len(result) > limit:
            raise ValueError("Native fixture file size bound")
        return result

    src = workspace / "src"
    build = src / "out/android_Debug"
    jars = [
        build / "obj/chrome/browser/tabpersistence/java.javac.jar",
        build / "obj/chrome/browser/tabpersistence/flatbuffer_java.javac.jar",
        build / "obj/third_party/flatbuffers/flatbuffers_java.javac.jar",
        build / "obj/base/tristate_java.javac.jar",
        src / "third_party/android_sdk/public/platforms/android-37.0/android.jar",
    ]
    if not all(jar.is_file() for jar in jars):
        raise ValueError("Retained compiled Chromium metadata readers required")
    helper = Path(__file__).with_name("NativeUpgradeMetadata.java")
    classes = output.parent / ("native-upgrade-reader-" + hashlib.sha256(helper.read_bytes()).hexdigest()[:12])
    classes.mkdir(parents=True, exist_ok=True)
    classpath = ":".join(str(jar) for jar in jars)
    subprocess.run(
        [str(src / "third_party/jdk/current/bin/javac"), "-cp", classpath,
         "-d", str(classes), str(helper)],
        check=True, capture_output=True, timeout=20,
    )

    def native_read(mode: str, data: bytes) -> list[str]:
        return subprocess.run(
            [str(src / "third_party/jdk/current/bin/java"), "-cp",
             str(classes) + ":" + classpath, "NativeUpgradeMetadata", mode],
            input=data, check=True, capture_output=True, timeout=20,
        ).stdout.decode().splitlines()

    active = native_read("active", native_file("app_tabs/0/tab_state0", 65536))
    tabs: list[dict[str, Any]] = []
    tokens: dict[int, str] = {}
    for line in active:
        parts = line.split("\t")
        if len(parts) != 3 or not re.fullmatch(r"\d+", parts[0]) or parts[1] not in ("true", "false"):
            raise ValueError("Native normal metadata format")
        tab_id = int(parts[0])
        tabs.append({"id": tab_id, "selected": parts[1] == "true", "ownedUrl": parts[2]})
        token = native_read("tab", native_file(f"app_tabs/0/flatbufferv1_tab{tab_id}", 4 * 1024 * 1024))
        if len(token) != 1 or not re.fullmatch(r"none|[A-F0-9]{32}", token[0]):
            raise ValueError("Native normal group token format")
        if tab_id in tokens:
            raise ValueError("Duplicate normal tab ID")
        tokens[tab_id] = token[0]
    if not 1 <= len(tabs) <= 64 or sum(tab["selected"] for tab in tabs) != 1:
        raise ValueError("One selected normal fixture tab required")
    groups = {token for token in tokens.values() if token != "none"}
    if len(groups) != 1:
        raise ValueError("One preserved fixture group required")
    group_token = groups.pop()
    prefs = json.loads(native_file("app_chrome/Default/Preferences", 4 * 1024 * 1024))
    local = json.loads(native_file("app_chrome/Local State", 4 * 1024 * 1024))
    bookmark_file = json.loads(native_file("app_chrome/Default/Bookmarks", 4 * 1024 * 1024))
    bookmarks = []

    def walk(node: dict[str, Any]) -> None:
        if node.get("type") == "url" and node.get("url", "").startswith("http://127.0.0.1:18088/"):
            bookmarks.append({key: node[key] for key in ("id", "name", "url")})
        for child in node.get("children", []):
            walk(child)

    for root in bookmark_file["roots"].values():
        walk(root)
    provider = prefs["default_search_provider_data"]["template_url_data"]
    native_shields = prefs["profile"]["content_settings"]["exceptions"]["braveShields"]
    return {
        "normalTabs": tabs,
        "group": {"token": group_token, "activeMembers": [tab for tab, token in tokens.items() if token == group_token]},
        "bookmarks": sorted(bookmarks, key=lambda item: int(item["id"])),
        "search": {"name": provider["short_name"], "prepopulateId": provider["prepopulate_id"]},
        "shields": {"ownedPattern": "127.0.0.1,*", "nativeSetting": native_shields["127.0.0.1,*"]["setting"]},
        "filter": {"uuid": COOKIE_LIST, "enabled": local["brave"]["ad_block"]["regional_filters"][COOKIE_LIST]["enabled"]},
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("serial")
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--apk", type=Path, required=True)
    parser.add_argument("--source", required=True)
    parser.add_argument("--baseline", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--record-baseline", action="store_true")
    args = parser.parse_args()
    if not re.fullmatch(r"emulator-\d+", args.serial) or not re.fullmatch(r"[a-f0-9]{40}", args.source):
        raise ValueError("Explicit emulator and committed source SHA required")
    if args.output.resolve() == args.baseline.resolve():
        raise ValueError("Preserve the before-upgrade evidence")
    adb = ["adb", "-s", args.serial]
    identity = subprocess.check_output(adb + ["emu", "avd", "name"], timeout=20).decode().splitlines()
    if identity != [AVD, "OK"]:
        raise ValueError("Preserved baseline AVD required")
    provenance = json.loads(args.apk.with_name("provenance.json").read_text())
    if provenance.get("source") != args.source:
        raise ValueError("Artifact provenance source mismatch")
    with args.apk.open("rb") as apk:
        apk_sha = hashlib.file_digest(apk, "sha256").hexdigest()
    paths = subprocess.check_output(adb + ["shell", "pm", "path", "--user", "0", PACKAGE], timeout=20).decode().splitlines()
    if len(paths) != 1 or not paths[0].startswith("package:/data/app/"):
        raise ValueError("One installed native APK required")
    installed = subprocess.check_output(
        adb + ["shell", shlex.join(["sha256sum", paths[0][8:]])], timeout=20
    ).decode().split()[0]
    if installed != apk_sha:
        raise ValueError("Installed APK differs from preserved artifact")
    snapshot = read_snapshot(args.serial, args.workspace, args.output)
    if not args.record_baseline:
        before = json.loads(args.baseline.read_text())
        compare_preserved(before["snapshot"], snapshot)
    result = {
        "phase": "baseline-recorded" if args.record_baseline else "native-metadata-preserved",
        "avd": AVD, "source": args.source, "installedSha256": installed,
        "snapshot": snapshot, "uiHistorySiteStorageAndRelaunchAcceptance": "separate-pending",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps({"phase": result["phase"], "normalTabs": len(snapshot["normalTabs"]), "source": args.source}))


if __name__ == "__main__":
    main()
