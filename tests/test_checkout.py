import json
import os
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
        self.source = self.project / "brave"
        self.git(self.project, "clone", str(self.remote), str(self.source))
        self.git(self.project, "init", "-q")
        self.lock = {
            "repository": str(self.remote),
            "tag": "v1.0.0",
            "commit": self.commit,
            "chromium": "100.0.0.0",
        }
        self.write_lock()
        self.record_source()
        self.workspace = self.root / "build"
        self.checkout = self.workspace / "src" / "brave"

    def write_lock(self) -> None:
        (self.project / "upstream.json").write_text(json.dumps(self.lock))

    def record_source(self) -> None:
        self.git(self.project, "add", "brave", "upstream.json")
        self.git(self.project, "commit", "-qm", "Pin source")

    def git(self, cwd: Path, *args: str) -> str:
        return subprocess.run(
            ["git", "-c", "user.name=Test", "-c", "user.email=test@example.invalid",
             "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", *args],
            cwd=cwd, check=True, capture_output=True, text=True,
        ).stdout

    def run_checkout(self, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(self.project / "tools" / "checkout.py"),
             str(self.workspace)],
            capture_output=True, text=True, env=env,
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

    def test_advances_to_committed_fork_source_and_preserves_build_outputs(self) -> None:
        self.assertEqual(self.run_checkout().returncode, 0)
        cache = self.workspace / "src/out/android_Debug/keep.o"
        cache.parent.mkdir(parents=True)
        cache.write_text("compiled object")
        (self.source / "tv.txt").write_text("direct source edit")
        self.git(self.source, "add", "tv.txt")
        self.git(self.source, "commit", "-qm", "TV source change")
        self.record_source()
        result = self.run_checkout()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue((self.checkout / "tv.txt").exists())
        self.assertEqual((self.checkout / "tv.txt").read_text(), "direct source edit")
        self.assertEqual(cache.read_text(), "compiled object")

    def test_dirty_source_is_rejected_before_creating_workspace(self) -> None:
        (self.source / "package.json").write_text("unfinished edit")
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("uncommitted", result.stderr)
        self.assertFalse(self.workspace.exists())

    def test_unrecorded_source_revision_is_rejected(self) -> None:
        self.git(self.source, "commit", "--allow-empty", "-qm", "Unpinned change")
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("submodule", result.stderr)
        self.assertFalse(self.workspace.exists())

    def test_missing_submodule_is_rejected_without_cloning_upstream(self) -> None:
        shutil.rmtree(self.source)
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("submodule", result.stderr)
        self.assertFalse(self.workspace.exists())

    def test_wrong_upstream_ancestry_is_rejected(self) -> None:
        self.lock["commit"] = "0" * 40
        self.write_lock()
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.workspace.exists())

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

    def test_symlink_cannot_put_source_inside_the_project(self) -> None:
        original = self.git(self.source, "rev-parse", "HEAD")
        self.workspace.mkdir()
        (self.workspace / "src").symlink_to(self.project, target_is_directory=True)
        result = self.run_checkout()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.git(self.source, "rev-parse", "HEAD"), original)

    def test_missing_git_fails_before_creating_a_workspace(self) -> None:
        empty_path = self.root / "empty-bin"
        empty_path.mkdir()
        result = self.run_checkout(env={**os.environ, "PATH": str(empty_path)})
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Git", result.stderr)
        self.assertFalse(self.workspace.exists())


if __name__ == "__main__":
    unittest.main()
