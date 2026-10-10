from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class PhoneRemoteTests(unittest.TestCase):
    def test_session_authorization_expiry_and_replay(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            sources = [
                ROOT / "brave/android/java/org/chromium/chrome/browser/tv/TvRemoteSession.java",
                ROOT / "brave/tools/tv/remote-tests/TvRemoteSessionTest.java",
            ]
            subprocess.run(["javac", "-Xlint:all", "-Werror", "-d", directory,
                            *map(str, sources)], check=True, capture_output=True)
            subprocess.run(["java", "-ea", "-cp", directory,
                            "org.chromium.chrome.browser.tv.TvRemoteSessionTest"],
                           check=True, capture_output=True)
