import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]


class CheckoutTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.project = self.root / "project"
        (self.project / "tools").mkdir(parents=True)
        for script in (ROOT / "tools").glob("*.py"):
            shutil.copy2(script, self.project / "tools" / script.name)
        self.remote = self.root / "upstream"
        self.remote.mkdir()
        self.git(self.remote, "init", "-q")
        package = {
            "version": "1.0.0",
            "config": {"projects": {"chrome": {"tag": "100.0.0.0"}}},
        }
        (self.remote / "package.json").write_text(json.dumps(package))
        self.git(self.remote, "add", "package.json")
        self.git(self.remote, "commit", "-qm", "Fixture upstream")
        self.commit = self.git(self.remote, "rev-parse", "HEAD").strip()
        self.git(self.remote, "tag", "v1.0.0")
        self.lock = {
            "repository": str(self.remote),
            "tag": "v1.0.0",
            "commit": self.commit,
            "chromium": "100.0.0.0",
        }
        self.write_lock()
        self.workspace = self.root / "build"
        self.checkout = self.workspace / "src" / "brave"

    def write_lock(self) -> None:
        (self.project / "upstream.json").write_text(json.dumps(self.lock))

    def git(self, cwd: Path, *args: str) -> str:
        return subprocess.run(
            ["git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid",
             "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", *args],
            cwd=cwd, check=True, capture_output=True, text=True,
        ).stdout

    def run_checkout(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(self.project / "tools" / "checkout.py"),
             str(self.workspace)],
            capture_output=True, text=True,
        )

    def test_checkout_can_be_repeated_without_changing_the_pinned_source(self) -> None:
        first = self.run_checkout()
        self.assertEqual(first.returncode, 0, first.stderr)
        second = self.run_checkout()
        self.assertEqual(second.returncode, 0, second.stderr)
        self.assertEqual(self.git(self.checkout, "rev-parse", "HEAD").strip(), self.commit)

    def test_existing_edits_are_preserved_and_reported(self) -> None:
        self.assertEqual(self.run_checkout().returncode, 0)
        changed = self.checkout / "package.json"
        changed.write_text("local changes\n")
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("uncommitted", result.stderr)
        self.assertEqual(changed.read_text(), "local changes\n")

    def test_chromium_version_must_match_the_lock(self) -> None:
        self.lock["chromium"] = "101.0.0.0"
        self.write_lock()
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Chromium", result.stderr)

    def test_invalid_lock_fails_before_creating_a_workspace(self) -> None:
        self.lock["commit"] = "not-a-commit"
        self.write_lock()
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.workspace.exists())
        self.assertIn("Invalid source lock", result.stderr)

    def test_build_workspace_must_be_outside_the_project_without_whitespace(self) -> None:
        for workspace in (self.project / "build", self.root / "build workspace"):
            with self.subTest(workspace=workspace):
                self.workspace = workspace
                result = self.run_checkout()
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(workspace.exists())

    def test_wrong_revision_is_not_reset(self) -> None:
        self.assertEqual(self.run_checkout().returncode, 0)
        self.git(self.checkout, "commit", "--allow-empty", "-qm", "Local work")
        head = self.git(self.checkout, "rev-parse", "HEAD")
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.git(self.checkout, "rev-parse", "HEAD"), head)


if __name__ == "__main__":
    unittest.main()
