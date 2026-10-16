from pathlib import Path
import subprocess
import sys
import unittest

from build.check_product_payloads import check_entries


class ProductPayloadTests(unittest.TestCase):
    def setUp(self) -> None:
        self.names = {
            "lib/armeabi-v7a/libchrome.so",
            "lib/armeabi-v7a/libwg-go.so",
            "assets/brave_resources.pak",
            "assets/locales/en-US.pak",
            "assets/locales/fr.pak",
        }

    def test_retained_payload_and_locales(self) -> None:
        check_entries(self.names, self.names)

    def test_missing_native_resources_and_locales_fail(self) -> None:
        for name in self.names:
            with self.subTest(name=name), self.assertRaises(ValueError):
                check_entries(self.names - {name}, self.names)

    def test_removed_payload_and_empty_baseline_fail(self) -> None:
        with self.assertRaisesRegex(ValueError, "News"):
            check_entries(self.names | {"assets/ntp_news_optin_icon_animation.json"}, self.names)
        with self.assertRaisesRegex(ValueError, "baseline"):
            check_entries(self.names, set())

    def test_different_abi_fails(self) -> None:
        other_abi = {name.replace("armeabi-v7a", "arm64-v8a") for name in self.names}
        with self.assertRaisesRegex(ValueError, "ABIs"):
            check_entries(other_abi, self.names)

    def test_missing_build_inputs_fail_closed(self) -> None:
        script = Path(__file__).parent / "build/check_product_payloads.py"
        result = subprocess.run(
            [sys.executable, str(script), "/missing/source", "/missing/output",
             "/missing/apk", "/missing/baseline"],
            capture_output=True, text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('"passed": true', result.stdout)
