"""On TV native home with Address focused and the experiment enabled, check D-pad access."""
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

serial = sys.argv[1]
assert re.fullmatch(r"emulator-\d+", serial), "Emulator-only regression"


def adb(*args: str) -> str:
    return subprocess.run(["adb", "-s", serial, "shell", *args], capture_output=True,
                          text=True, timeout=10, check=True).stdout


def hierarchy() -> ET.Element:
    result = adb("uiautomator", "dump", "/data/local/tmp/phone-home-window.xml")
    assert "dumped to" in result, "Native hierarchy is not ready"
    return ET.fromstring(adb("cat", "/data/local/tmp/phone-home-window.xml"))


def focused(label: str) -> None:
    deadline = time.monotonic() + 5
    while True:
        tree = hierarchy()
        names = [n.get("text") for n in tree.iter("node") if n.get("focused") == "true"]
        if label in names:
            return
        assert time.monotonic() < deadline, f"Expected focus {label!r}, got {names}"


if sys.argv[2:] == ["--close-last-tab"]:
    # Precondition: exactly one disposable normal home tab, no dialog.
    adb("input", "keyevent", "4")
    matches = [n for n in hierarchy().iter("node") if n.get("text") == "Close tab"]
    assert len(matches) == 1, "Expected native Close tab action"
    bounds = matches[0].get("bounds")
    assert bounds is not None
    x1, y1, x2, y2 = map(int, re.findall(r"\d+", bounds))
    adb("input", "tap", str((x1 + x2) // 2), str((y1 + y2) // 2))
    adb("input", "keyevent", "23")

focused("Address or search")
for key, label in [(20, "Use your phone"), (20, "Project and source on GitHub"),
                   (19, "Use your phone"), (19, "Address or search"),
                   (22, "Browser controls"), (20, "Use your phone")]:
    adb("input", "keyevent", str(key))
    focused(label)
print("PASS: D-pad reaches the phone home action and returns through both rows")
