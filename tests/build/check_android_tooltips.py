"""Check that an Android factory object does not depend on desktop tooltip code."""

import argparse
from pathlib import Path
import subprocess


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Chromium src directory")
    parser.add_argument("object", type=Path, help="Android ads_service_factory.o")
    args = parser.parse_args()
    nm = args.source / "third_party/llvm-build/Release+Asserts/bin/llvm-nm"
    symbols = subprocess.check_output(
        [str(nm), "--undefined-only", "--demangle", str(args.object)], text=True
    )
    forbidden = [
        line.strip()
        for line in symbols.splitlines()
        if "brave_ads::AdsTooltipsController" in line
        or "brave_ads::AdsTooltipsDelegateImpl" in line
    ]
    if forbidden:
        raise SystemExit("FAIL: Android depends on desktop tooltips:\n" + "\n".join(forbidden))
    print("PASS: Android factory has no unresolved desktop tooltip references")


if __name__ == "__main__":
    main()
