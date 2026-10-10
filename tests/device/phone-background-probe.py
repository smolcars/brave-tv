"""With an active phone listener, verify background teardown preserves the browser.

Usage: python3 tests/device/phone-background-probe.py emulator-SERIAL
The caller must start and confirm the listener before running this probe.
"""
import re
import subprocess
import sys
import time

serial = sys.argv[1]
assert re.fullmatch(r"emulator-\d+", serial), "This regression is emulator-only"
package = "com.brave.browser_default"


def adb(*args: str) -> str:
    result = subprocess.run(["adb", "-s", serial, *args], capture_output=True,
                            text=True, timeout=10, check=False)
    return result.stdout.strip()


pid = adb("shell", "pidof", package)
assert pid, "Browser must be running with a local listener"
adb("shell", "input", "keyevent", "3")
time.sleep(2)
assert adb("shell", "pidof", package) == pid, "Backgrounding the listener killed the browser"
print("PASS: browser process survives listener teardown")
