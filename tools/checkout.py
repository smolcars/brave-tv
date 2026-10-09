"""Prepare or verify the pinned Brave checkout without resetting existing work."""

import argparse
import json
from pathlib import Path
import re
import subprocess
import sys


PROJECT = Path(__file__).resolve().parents[1]


def git(checkout: Path, *args: str) -> str:
    return subprocess.run(
        ["git", "-C", str(checkout), *args],
        check=True, capture_output=True, text=True,
    ).stdout.strip()


def prepare(workspace: Path) -> Path:
    lock = json.loads((PROJECT / "upstream.json").read_text())
    if (
        not isinstance(lock, dict)
        or any(not isinstance(lock.get(key), str) or not lock[key]
               for key in ("repository", "tag", "commit", "chromium"))
        or not re.fullmatch(r"[a-f0-9]{40}", lock["commit"])
        or not re.fullmatch(r"v\d+\.\d+\.\d+", lock["tag"])
        or not re.fullmatch(r"\d+\.\d+\.\d+\.\d+", lock["chromium"])
    ):
        raise ValueError("Invalid source lock in upstream.json.")
    workspace = workspace.expanduser().resolve()
    if workspace.is_relative_to(PROJECT) or any(c.isspace() for c in str(workspace)):
        raise ValueError("Use an external workspace path without whitespace.")
    checkout = workspace / "src" / "brave"
    if not checkout.exists():
        checkout.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", lock["tag"],
             "--", lock["repository"], str(checkout)],
            check=True,
        )
    if git(checkout, "rev-parse", "HEAD") != lock["commit"]:
        raise ValueError("Checkout revision does not match upstream.json; left unchanged.")
    if git(checkout, "status", "--porcelain", "--untracked-files=normal"):
        raise ValueError("Checkout has uncommitted changes; left unchanged.")
    package = json.loads((checkout / "package.json").read_text())
    if package["config"]["projects"]["chrome"]["tag"] != lock["chromium"]:
        raise ValueError("Chromium version does not match upstream.json; left unchanged.")
    return checkout


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workspace", type=Path, help="External build workspace")
    args = parser.parse_args()
    try:
        print(prepare(args.workspace))
    except (OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f"Checkout failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
