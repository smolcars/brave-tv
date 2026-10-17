"""Build the two upstream standalone ARM bundles without exposing signing keys."""

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
from typing import Any

from checkout import PROJECT, prepare


def read_config(path: Path) -> dict[str, Any]:
    config = json.loads(path.read_text())
    if not re.fullmatch(r"[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}", config["packageName"]):
        raise ValueError("Invalid release package name")
    if config["packageName"].startswith(("com.brave.", "org.chromium.")):
        raise ValueError("A release must use Rhenium's own package name")
    if not re.fullmatch(r"\d+\.\d+\.\d+", config["versionName"]):
        raise ValueError("Invalid release version name")
    codes = config["versionCodes"]
    if set(codes) != {"arm", "arm64"} or not all(
        type(code) is int and 0 < code <= 2_100_000_000 for code in codes.values()
    ) or codes["arm"] >= codes["arm64"]:
        raise ValueError("ARM64 needs a higher, unique version code than ARM32")
    return dict(config)


def build_command(config: dict[str, Any], arch: str) -> list[str]:
    return [
        "pnpm", "run", "build", "Release", "--target_os=android",
        f"--target_arch={arch}", "--target_android_output_format=aab",
        "--channel=release", "--skip_signing", "--target=brave",
        "-C", f"android_Play_{arch}",
        f"--gn=chrome_public_manifest_package:{config['packageName']}",
        f"--gn=android_override_version_code:{json.dumps(str(config['versionCodes'][arch]))}",
        f"--android_override_version_name={config['versionName']}",
        "--gn=android_static_analysis:on", "--gn=debuggable_apks:false",
        "--gn=symbol_level:0",
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workspace", type=Path)
    parser.add_argument("evidence", type=Path)
    parser.add_argument("--arch", choices=("arm", "arm64"), action="append")
    args = parser.parse_args()
    config = read_config(PROJECT / "release/android.json")
    source = prepare(args.workspace)
    evidence = args.evidence.expanduser().resolve()
    if evidence.is_relative_to(PROJECT):
        raise ValueError("Keep build evidence and binaries outside the repository")
    evidence.mkdir(parents=True, exist_ok=True)
    limits = os.environ.get("SISO_LIMITS", "local=4,step=4")
    provenance = {
        "project": subprocess.check_output(["git", "-C", str(PROJECT), "rev-parse", "HEAD"], text=True).strip(),
        "source": subprocess.check_output(["git", "-C", str(source), "rev-parse", "HEAD"], text=True).strip(),
        "upstream": json.loads((PROJECT / "upstream.json").read_text()),
        "release": config,
        "sisoLimits": limits,
    }
    (evidence / "source.json").write_text(json.dumps(provenance, indent=2) + "\n")
    env = dict(os.environ, SISO_LIMITS=limits)
    for arch in args.arch or ["arm64", "arm"]:
        command = build_command(config, arch)
        (evidence / f"command-{arch}.json").write_text(json.dumps(command, indent=2) + "\n")
        print(f"Building {arch}; log: {evidence / f'build-{arch}.log'}", flush=True)
        with (evidence / f"build-{arch}.log").open("a") as log:
            subprocess.run(
                ["time", "-v", "-o", str(evidence / f"build-{arch}.time"), *command],
                cwd=source, env=env, stdout=log, stderr=subprocess.STDOUT, check=True,
            )
        print(f"Build passed: {arch}", flush=True)


if __name__ == "__main__":
    main()
