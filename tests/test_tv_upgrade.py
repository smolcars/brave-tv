import copy
import hashlib
from pathlib import Path
import tempfile
import unittest
from typing import Any

from device.tv_upgrade_check import compare_preserved, read_snapshot, verify_artifact


class UpgradeComparisonTests(unittest.TestCase):
    def setUp(self) -> None:
        self.baseline: dict[str, Any] = {
            "normalTabs": [{"id": 3, "selected": True, "ownedUrl": "http://127.0.0.1:18088/privacy.html"}],
            "group": {"token": "A" * 32, "activeMembers": [3]},
            "bookmarks": [{"id": "5", "name": "Fixture", "url": "http://127.0.0.1:18088/privacy.html"}],
            "search": {"name": "DuckDuckGo", "prepopulateId": 501},
            "shields": {"ownedPattern": "127.0.0.1,*", "nativeSetting": 2},
            "filter": {"uuid": "fixture-list", "enabled": False},
        }

    def test_preserved_metadata_accepts_only_identical_seeded_data(self) -> None:
        compare_preserved(self.baseline, copy.deepcopy(self.baseline))

    def test_missing_and_changed_native_data_are_rejected(self) -> None:
        for field in self.baseline:
            with self.subTest(field=field, mutation="missing"):
                changed = copy.deepcopy(self.baseline)
                del changed[field]
                with self.assertRaisesRegex(ValueError, field):
                    compare_preserved(self.baseline, changed)
            with self.subTest(field=field, mutation="changed"):
                changed = copy.deepcopy(self.baseline)
                changed[field] = None
                with self.assertRaisesRegex(ValueError, field):
                    compare_preserved(self.baseline, changed)

    def test_normal_tab_identity_selection_and_url_changes_are_rejected(self) -> None:
        for key, value in (("id", 4), ("selected", False), ("ownedUrl", "http://127.0.0.1:18088/other.html")):
            with self.subTest(key=key):
                changed = copy.deepcopy(self.baseline)
                changed["normalTabs"][0][key] = value
                with self.assertRaisesRegex(ValueError, "normalTabs"):
                    compare_preserved(self.baseline, changed)

    def test_physical_serial_is_rejected_before_device_access(self) -> None:
        with self.assertRaisesRegex(ValueError, "nonphysical"):
            read_snapshot("192.0.2.1:5555", Path("unused"), Path("unused"))

    def test_artifact_bytes_are_bound_to_recorded_source_hash_and_size(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            apk = Path(directory) / "BraveMonox64.apk"
            apk.write_bytes(b"owned host artifact fixture")
            record = {"sha256": hashlib.sha256(apk.read_bytes()).hexdigest(), "bytes": apk.stat().st_size}
            manifests: list[dict[str, Any]] = [{"source": "fixture-source", **record}, {"source": "fixture-source", "artifacts": {apk.name: record}}]
            for manifest in manifests:
                with self.subTest(schema=manifest):
                    self.assertEqual(verify_artifact(manifest, apk, "fixture-source"), record["sha256"])
                    with self.assertRaisesRegex(ValueError, "source"):
                        verify_artifact(manifest, apk, "other-source")
                    for field, value in (("sha256", "wrong-hash"), ("bytes", 0)):
                        bad = copy.deepcopy(manifest)
                        bad.get("artifacts", {}).get(apk.name, bad)[field] = value
                        with self.assertRaisesRegex(ValueError, "hash or size"):
                            verify_artifact(bad, apk, "fixture-source")


if __name__ == "__main__":
    unittest.main()
