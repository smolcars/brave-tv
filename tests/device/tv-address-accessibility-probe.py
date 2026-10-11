"""Inspect the native TV editor's hint/actions; requires a released agent-device lease."""

import re
import subprocess
import sys

assert len(sys.argv) in (2, 3) and re.fullmatch(r"emulator-\d+", sys.argv[1]), "Pass an explicit emulator serial"
check_error = len(sys.argv) == 3
assert not check_error or sys.argv[2] == "--error", "Optional flag is --error"
result = subprocess.run(
    ["adb", "-s", sys.argv[1], "shell", "am", "instrument", "-w",
     *(["-e", "checkError", "true"] if check_error else []),
     "org.bravetv.remoteime.test/.EditorAccessibilityProbe"],
    check=True, capture_output=True, text=True, timeout=30,
)
expected_results = [
    "INSTRUMENTATION_RESULT: editorCount=1",
    "INSTRUMENTATION_RESULT: nativeHintMatches=true",
    "INSTRUMENTATION_RESULT: nativeSetTextAction=true",
]
if check_error:
    expected_results += [
        "INSTRUMENTATION_RESULT: nativeErrorPresent=true",
        "INSTRUMENTATION_RESULT: nativeErrorLiveRegion=true",
    ]
expected_results.append("INSTRUMENTATION_CODE: -1")
for expected in expected_results:
    assert expected in result.stdout.splitlines(), f"Missing native acceptance: {expected}"
acceptance = "Native editor hint/text actions" + (" and polite error live region" if check_error else "")
print(acceptance + " pass; no editor contents captured.")
