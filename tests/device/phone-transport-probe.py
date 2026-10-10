"""Probe the real TV listener directly from a phone emulator on shared Wi-Fi.

Usage: python3 tests/device/phone-transport-probe.py PHONE_EMULATOR TV_IP:TV_PORT
ADB launches netcat on the phone; remote traffic does not use port forwarding.
"""
import ipaddress
import json
import re
import subprocess
import sys
import time

serial, host = sys.argv[1:]
assert re.fullmatch(r"emulator-[0-9]+", serial), "Only emulator serials are allowed"
address, port = host.split(":")
assert ipaddress.IPv4Address(address).is_private
assert 0 < int(port) < 65536
origin = f"http://{host}"
netcat = ["adb", "-s", serial, "shell", "toybox", "nc", "-w", "7", "-W", "7"]


def request(method: str, path: str, body: str = "", **headers: str) -> bytes:
    fields = {"Host": host, "Origin": origin, "Content-Type": "application/json",
              "Content-Length": str(len(body.encode())), "Connection": "close"}
    fields.update(headers)
    wire = f"{method} {path} HTTP/1.1\r\n" + "".join(f"{k}: {v}\r\n" for k, v in fields.items()) + "\r\n" + body
    with subprocess.Popen(netcat + [address, port], stdin=subprocess.PIPE,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE) as client:
        assert client.stdin is not None
        client.stdin.write(wire.encode())
        client.stdin.flush()
        try:
            client.wait(timeout=8)
        finally:
            if client.poll() is None:
                client.kill()
        output, errors = client.communicate()
        assert not errors, errors.decode(errors="replace")
        return output


asset = request("GET", "/")
assert asset.startswith(b"HTTP/1.1 200")
assert b"Content-Security-Policy:" in asset and b"no-store" in asset
unauthorized = request("POST", "/api", '{"v":1,"op":"state","token":"invalid"}')
assert json.loads(unauthorized.split(b"\r\n\r\n", 1)[1]) == {"error": "revoked"}
for method, path, body, headers in [
    ("GET", "/", "", {"Host": "attacker.example"}),
    ("POST", "/api", "{}", {"Origin": "http://attacker.example"}),
    ("POST", "/api", "{}", {"Origin": "null"}),
    ("POST", "/api", "{}", {"Origin": ""}),
    ("GET", "/", "", {"Connection": "Upgrade", "Upgrade": "websocket",
                          "Sec-WebSocket-Version": "13",
                          "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ=="}),
    ("POST", "/api", "{}", {"Sec-Fetch-Site": "cross-site"}),
    ("GET", "/", "", {"Cookie": "session=not-accepted"}),
    ("GET", "/api", "", {}),
    ("POST", "/unknown", "{}", {}),
    ("POST", "/api", "{", {}),
    ("POST", "/api", '{"a":' * 10 + "0" + "}" * 10, {}),
    ("POST", "/api", json.dumps({"v": 1, "text": "x" * 9000}), {}),
]:
    assert not request(method, path, body, **headers), f"Unexpected response: {method} {path} {list(headers)}"

clients = [subprocess.Popen(netcat + [address, port], stdin=subprocess.PIPE,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE) for _ in range(5)]
try:
    started = time.monotonic()
    for client in clients:
        client.wait(timeout=max(0.1, 8 - (time.monotonic() - started)))
        assert client.stdout is not None
        assert client.stdout.read() == b"", "Idle socket unexpectedly produced data"
    assert time.monotonic() - started < 7, "Idle sockets outlived their deadline"
finally:
    for client in clients:
        if client.poll() is None:
            client.kill()
        client.communicate()
print("PASS: assets, unauthenticated state rejection, Host/Origin/method/parser bounds and idle socket deadline")
