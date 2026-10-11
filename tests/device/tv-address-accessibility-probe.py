"""Inspect the native TV editor's hint/actions; requires a released agent-device lease."""

import re
import subprocess
import sys

assert len(sys.argv) == 2 and re.fullmatch(r"emulator-\d+", sys.argv[1]), "Pass an explicit emulator serial"
result = subprocess.run(
    ["adb", "-s", sys.argv[1], "shell", "am", "instrument", "-w",
     "org.bravetv.remoteime.test/.EditorAccessibilityProbe"],
    check=True, capture_output=True, text=True, timeout=30,
)
for expected in (
    "INSTRUMENTATION_RESULT: editorCount=1",
    "INSTRUMENTATION_RESULT: nativeHintMatches=true",
    "INSTRUMENTATION_RESULT: nativeSetTextAction=true",
    "INSTRUMENTATION_CODE: -1",
):
    assert expected in result.stdout.splitlines(), f"Missing native acceptance: {expected}"
print("Native editor hint and text actions pass; no editor contents captured.")
