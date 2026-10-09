"""Advance an external build checkout to the committed Brave source submodule."""

import argparse
import json
from pathlib import Path
import re
import shutil
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
    checkout = (workspace / "src" / "brave").resolve()
    if any(path.is_relative_to(PROJECT) or any(c.isspace() for c in str(path))
           for path in (workspace, checkout)):
        raise ValueError("Use an external workspace path without whitespace.")
    if shutil.which("git") is None:
        raise ValueError("Git is required; enter the project's nix develop shell first.")

    source = PROJECT / "brave"
    if not (source / ".git").exists():
        raise ValueError("Initialize the brave source submodule first: git submodule update --init.")
    revision = git(source, "rev-parse", "HEAD")
    if revision != git(PROJECT, "rev-parse", "HEAD:brave"):
        raise ValueError("Commit the source submodule revision in the project before building.")
    if git(source, "status", "--porcelain", "--untracked-files=normal"):
        raise ValueError("Source submodule has uncommitted changes; commit them before building.")
    git(source, "merge-base", "--is-ancestor", lock["commit"], revision)
    package = json.loads((source / "package.json").read_text())
    if package["config"]["projects"]["chrome"]["tag"] != lock["chromium"]:
        raise ValueError("Chromium version does not match upstream.json; left unchanged.")

    if not checkout.exists():
        checkout.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["git", "clone", "--no-hardlinks", "--no-checkout", "--",
             str(source), str(checkout)],
            check=True,
        )
        git(checkout, "checkout", "--detach", revision)
        return checkout
    if Path(git(checkout, "rev-parse", "--show-toplevel")).resolve() != checkout:
        raise ValueError("Build source is not its own Git checkout; left unchanged.")
    if git(checkout, "status", "--porcelain", "--untracked-files=normal"):
        raise ValueError("Build checkout has uncommitted changes; left unchanged.")
    if git(checkout, "rev-parse", "HEAD") != revision:
        git(checkout, "fetch", "--no-tags", str(source), revision)
        git(checkout, "merge-base", "--is-ancestor", "HEAD", revision)
        git(checkout, "merge", "--ff-only", revision)
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
