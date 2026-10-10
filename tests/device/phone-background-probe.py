"""Verify a live listener closes on background without killing the browser.

Usage: python3 tests/device/phone-background-probe.py TV_EMULATOR PHONE_EMULATOR TV_IP:PORT
The phone and TV must already share their virtual Wi-Fi network.
"""
import ipaddress
import re
import subprocess
import sys
import time

serial, phone, host = sys.argv[1:]
for device in (serial, phone):
    assert re.fullmatch(r"emulator-\d+", device), "This regression is emulator-only"
address, port = host.split(":")
assert ipaddress.IPv4Address(address).is_private
assert 0 < int(port) < 65536
package = "com.brave.browser_default"


def adb(*args: str) -> str:
    return subprocess.run(["adb", "-s", serial, *args], capture_output=True,
                          text=True, timeout=10, check=True).stdout.strip()


def listener_response() -> tuple[bytes, bytes, int]:
    with subprocess.Popen(["adb", "-s", phone, "shell", "toybox", "nc", "-w", "7",
                           "-W", "7", address, port], stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE) as client:
        assert client.stdin is not None
        client.stdin.write(f"GET / HTTP/1.1\r\nHost: {host}\r\n\r\n".encode())
        client.stdin.flush()
        try:
            client.wait(timeout=8)
        finally:
            if client.poll() is None:
                client.kill()
        output, errors = client.communicate()
        return output, errors, client.returncode


output, errors, status = listener_response()
assert status == 0 and not errors and output.startswith(b"HTTP/1.1 200"), "Start the listener first"
pid = adb("shell", "pidof", package)
assert pid, "Browser must be running"
adb("shell", "input", "keyevent", "3")
deadline = time.monotonic() + 5
while True:
    activities = adb("shell", "dumpsys", "activity", "activities")
    resumed = [line for line in activities.splitlines() if "topResumedActivity=" in line]
    if resumed and all(package not in line for line in resumed):
        break
    assert time.monotonic() < deadline, "Brave did not leave the foreground"
    time.sleep(0.1)
output, errors, status = listener_response()
assert not output and status != 0 and b"connection refused" in errors.lower(), (
    "Expected connection refusal, not an accepted connection, timeout or ADB failure", errors
)
assert adb("shell", "pidof", package) == pid, "Backgrounding killed the browser"
print("PASS: foreground departure, listener closure and browser process survival")
