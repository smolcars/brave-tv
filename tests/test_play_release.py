import json
from pathlib import Path
import sys
import tempfile
import unittest
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from build_play_release import read_config


class PlayReleaseConfigTests(unittest.TestCase):
    def check_config(self, config: dict[str, Any]) -> dict[str, Any]:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "android.json"
            path.write_text(json.dumps(config))
            return read_config(path)

    def test_rejects_upstream_identity_and_invalid_codes(self) -> None:
        config = {"packageName": "com.nitesh.rhenium", "versionName": "0.1.0",
                  "versionCodes": {"arm": 1001, "arm64": 1002}}
        self.assertEqual(self.check_config(config), config)
        for package in ("com.brave.browser", "org.chromium.chrome", "bad;command"):
            with self.subTest(package=package), self.assertRaises(ValueError):
                self.check_config(dict(config, packageName=package))
        for codes in ({"arm": 1002, "arm64": 1001}, {"arm": 1, "arm64": 1},
                      {"arm": 1, "arm64": True}, {"arm": 1, "arm64": 2_100_000_001}):
            with self.subTest(codes=codes), self.assertRaises(ValueError):
                self.check_config(dict(config, versionCodes=codes))
