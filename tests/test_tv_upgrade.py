import copy
import unittest
from typing import Any

from device.tv_upgrade_check import compare_preserved, read_snapshot


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
        from pathlib import Path

        with self.assertRaisesRegex(ValueError, "nonphysical"):
            read_snapshot("192.0.2.1:5555", Path("unused"), Path("unused"))


if __name__ == "__main__":
    unittest.main()
