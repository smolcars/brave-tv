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


def focused(label: str) -> None:
    deadline = time.monotonic() + 5
    while True:
        adb("uiautomator", "dump", "/data/local/tmp/phone-home-window.xml")
        tree = ET.fromstring(adb("cat", "/data/local/tmp/phone-home-window.xml"))
        names = [n.get("text") for n in tree.iter("node") if n.get("focused") == "true"]
        if label in names:
            return
        assert time.monotonic() < deadline, f"Expected focus {label!r}, got {names}"


focused("Address or search")
for key, label in [(20, "Use your phone"), (20, "Project and source on GitHub"),
                   (19, "Use your phone"), (19, "Address or search"),
                   (22, "Browser controls"), (20, "Use your phone")]:
    adb("input", "keyevent", str(key))
    focused(label)
print("PASS: D-pad reaches the phone home action and returns through both rows")
