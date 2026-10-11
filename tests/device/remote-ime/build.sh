#!/usr/bin/env bash
# Run inside nix develop. Build artifacts and synthetic test signing key stay outside Git.
set -euo pipefail
sdk=${ANDROID_SDK_ROOT:?Set ANDROID_SDK_ROOT}
platform=${ANDROID_TEST_PLATFORM:-android-35}
build_tools=${ANDROID_TEST_BUILD_TOOLS:-35.0.1}
out=${1:?Pass an external output directory}
mkdir -p "$out/classes"
fixture=$(cd -- "$(dirname -- "$0")" && pwd)
javac --release 8 -classpath "$sdk/platforms/$platform/android.jar" -d "$out/classes" "$fixture/RemoteIme.java" "$fixture/EditorAccessibilityProbe.java" "$fixture/PanelPerformanceProbe.java"
jar cf "$out/classes.jar" -C "$out/classes" .
"$sdk/build-tools/$build_tools/d8" --lib "$sdk/platforms/$platform/android.jar" --output "$out" "$out/classes.jar"
"$sdk/build-tools/$build_tools/aapt" package -f -M "$fixture/AndroidManifest.xml" -S "$fixture/res" -I "$sdk/platforms/$platform/android.jar" -F "$out/remote-ime.apk"
(cd "$out" && zip -q remote-ime.apk classes.dex)
if [ ! -f "$out/test.keystore" ]; then
  keytool -genkeypair -keystore "$out/test.keystore" -storepass android -keypass android -alias test -dname CN=EmulatorFixture -keyalg RSA -validity 30
fi
"$sdk/build-tools/$build_tools/apksigner" sign --ks "$out/test.keystore" --ks-pass pass:android "$out/remote-ime.apk"
