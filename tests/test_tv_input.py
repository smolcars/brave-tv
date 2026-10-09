from pathlib import Path
import subprocess
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SOURCE = "android/java/org/chromium/chrome/browser/tv/TvRemoteInput.java"


class TvInputTests(unittest.TestCase):
    def test_remote_events_through_the_public_input_interface(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            commands = [
                ["git", "apply", f"--include={SOURCE}",
                 str(ROOT / "patches" / "0001-tv-input.patch")],
                ["javac", "-Xlint:all", "-Werror", "-d", str(output / "classes"),
                 str(output / SOURCE), str(ROOT / "tests/java/TvRemoteInputTest.java")],
                ["java", "-ea", "-cp", str(output / "classes"), "TvRemoteInputTest"],
            ]
            for command in commands:
                result = subprocess.run(command, cwd=output, capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
