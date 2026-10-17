import json
from pathlib import Path
import sys
import tempfile
import unittest
import struct
from typing import Any
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from build_play_release import read_config
from package_play_release import check_elf, check_manifest, strip_signatures
from verify_play_apks import check_apk_manifest


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


class PlayBundleValidationTests(unittest.TestCase):
    def test_apk_manifest_checks_the_leanback_alias_in_the_binary_tree(self) -> None:
        config = {"packageName": "com.nitesh.rhenium", "versionName": "0.1.0",
                  "versionCodes": {"arm": 1001, "arm64": 1002}}
        badging = "package: name='com.nitesh.rhenium' versionCode='1002' versionName='0.1.0' compileSdkVersion='37'"
        tree = '''E: manifest (line=1)
  E: application (line=4)
    E: activity-alias (line=122)
      A: http://schemas.android.com/apk/res/android:name(0x01010003)="org.chromium.chrome.browser.tv.TvLauncher"
      A: http://schemas.android.com/apk/res/android:exported(0x01010010)=true
        E: intent-filter (line=123)
          E: action (line=124)
            A: http://schemas.android.com/apk/res/android:name(0x01010003)="android.intent.action.MAIN"
          E: category (line=126)
            A: http://schemas.android.com/apk/res/android:name(0x01010003)="android.intent.category.LEANBACK_LAUNCHER"
    E: activity-alias (line=129)'''
        check_apk_manifest(badging, tree, config, "arm64")
        for manifest, xmltree in ((badging + "\napplication-debuggable", tree),
                                  (badging.replace("1002", "1001"), tree),
                                  (badging, tree.replace("=true", "=false")),
                                  (badging, tree.replace("LEANBACK_LAUNCHER", "LAUNCHER"))):
            with self.subTest(manifest=manifest), self.assertRaises(ValueError):
                check_apk_manifest(manifest, xmltree, config, "arm64")

    def test_native_architecture_and_16k_load_alignment(self) -> None:
        ident = b"\x7fELF\x02\x01\x01" + bytes(9)
        header = struct.pack("<16sHHIQQQIHHHHHH", ident, 3, 183, 1, 0, 64, 0, 0, 64, 56, 1, 0, 0, 0)
        def segment(alignment: int, offset: int = 0) -> bytes:
            return struct.pack("<IIQQQQQQ", 1, 5, offset, 0, 0, 120, 120, alignment)
        self.assertEqual(check_elf(header + segment(16384), "arm64-v8a"), [16384])
        for payload in (header + segment(4096), header + segment(16384, 4096), header[:64], b"not an ELF"):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                check_elf(payload, "arm64-v8a")
        with self.assertRaises(ValueError):
            check_elf(header + segment(16384), "armeabi-v7a")

    def test_only_jar_signatures_are_removed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / "source.aab", Path(directory) / "unsigned.aab"
            with zipfile.ZipFile(source, "w") as archive:
                archive.writestr("META-INF/MANIFEST.MF", "old digest")
                archive.writestr("META-INF/OLD.RSA", "old signature")
                archive.writestr("META-INF/services/service", "keep metadata")
                archive.writestr("base/lib/arm64-v8a/libchrome.so", b"native bytes")
            strip_signatures(source, output)
            with zipfile.ZipFile(output) as archive:
                self.assertEqual(set(archive.namelist()), {"META-INF/services/service", "base/lib/arm64-v8a/libchrome.so"})
                self.assertEqual(archive.read("base/lib/arm64-v8a/libchrome.so"), b"native bytes")
            with self.assertRaises(FileExistsError):
                strip_signatures(source, output)

    def test_release_manifest_rejects_debug_and_wrong_identity(self) -> None:
        config = {"packageName": "com.nitesh.rhenium", "versionName": "0.1.0",
                  "versionCodes": {"arm": 1001, "arm64": 1002}}
        xml = '''<manifest xmlns:android="http://schemas.android.com/apk/res/android"
          package="com.nitesh.rhenium" android:versionCode="1002" android:versionName="0.1.0">
          <uses-feature android:name="android.hardware.touchscreen" android:required="false"/>
          <application android:debuggable="false"><activity-alias android:name="org.chromium.chrome.browser.tv.TvLauncher">
          <intent-filter><category android:name="android.intent.category.LEANBACK_LAUNCHER"/></intent-filter>
          </activity-alias></application></manifest>'''
        self.assertFalse(check_manifest(xml, config, "arm64")["debuggable"])
        for invalid in (xml.replace('debuggable="false"', 'debuggable="true"'),
                        xml.replace('com.nitesh.rhenium', 'com.brave.browser'),
                        xml.replace('required="false"', 'required="true"')):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                check_manifest(invalid, config, "arm64")
