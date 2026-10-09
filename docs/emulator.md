# Android TV emulator through Nix

The optional `tv-emulator-sdk` flake package supplies SDK Command-line Tools 20.0, an emulator package and the Android TV API 36 x86-64 image (revision 4), pinned by the existing `flake.lock`. It uses Google's Android SDK license and permits the SDK's unfree packages only in this separate package set. It does not change Chromium's build SDK or download the image for ordinary development-shell checks.

The current Linux host has working KVM access. Its original Android Emulator 35.3.11 rejects T3's `imagefile:` camera launch arguments; the Nix SDK includes emulator 36.5.11, which accepts them. The SDK also needs an emulator package because `avdmanager create avd` refuses an SDK without one. Earlier pinned TV images offer x86/arm64 rather than the ABI required by our x86-64 APK.

## One-time setup

From this repository, build the optional SDK and retain the output link as its Nix garbage-collection root:

```sh
nix build .#tv-emulator-sdk --out-link "$HOME/.cache/brave-tv/emulator-sdk"
nix develop
export TV_SDK="$HOME/.cache/brave-tv/emulator-sdk/libexec/android-sdk"
"$HOME/.cache/brave-tv/emulator-sdk/bin/sdkmanager" --version
"$HOME/.cache/brave-tv/emulator-sdk/bin/avdmanager" list device
```

T3 detects the existing SDK at `~/Android/Sdk`. Add only the missing components below. `ln -sT` refuses to overwrite an existing destination; inspect any existing link instead of replacing an installed component. Keep the external SDK output link for as long as the AVD uses it.

```sh
mkdir -p "$HOME/Android/Sdk/cmdline-tools" "$HOME/Android/Sdk/system-images/android-36"
ln -sT "$TV_SDK/cmdline-tools/20.0" "$HOME/Android/Sdk/cmdline-tools/latest"
ln -sT "$TV_SDK/system-images/android-36/android-tv" "$HOME/Android/Sdk/system-images/android-36/android-tv"
# Preserve the original emulator before selecting the Nix binary for T3.
test ! -e "$HOME/Android/Sdk/emulator.before-brave-tv" && \
  mv -T "$HOME/Android/Sdk/emulator" "$HOME/Android/Sdk/emulator.before-brave-tv" && \
  ln -sT "$TV_SDK/emulator" "$HOME/Android/Sdk/emulator"
printf 'no\n' | "$HOME/.cache/brave-tv/emulator-sdk/bin/avdmanager" create avd \
  --name brave_tv_api36 --package 'system-images;android-36;android-tv;x86_64' \
  --device tv_1080p
```

Do not add `--force`: a pre-existing AVD may contain test data. Use `avdmanager list avd` to inspect it. The generated AVD uses the Nix image; writable device state lives under `~/.android/avd`, outside this repository.

## Open and validate

Use T3's `device_list`, then `device_open` for `brave_tv_api36`. T3 installs its versioned device helpers and returns the exact `agent-device` launcher plus host/session flags. Retain those flags on every interaction command. Use its snapshots and remote buttons for behavioral checks, and `device_screenshot` for visual evidence.

In the Nix shell, select the emulator serial returned by the device tooling before using ADB. Verify the current APK against the [recorded SHA-256](tv-prototype.md#onboarding-correction-artifact), then install it without uninstalling or clearing data:

```sh
adb devices -l
export TV_SERIAL='replace-with-the-open-emulator-serial'
sha256sum "$HOME/.cache/brave-tv/artifacts/tv-onboarding-v1.97.56-x64-debug-20261009/BraveMonox64.apk"
adb -s "$TV_SERIAL" install -r "$HOME/.cache/brave-tv/artifacts/tv-onboarding-v1.97.56-x64-debug-20261009/BraveMonox64.apk"
adb -s "$TV_SERIAL" reverse tcp:8000 tcp:8000
python3 -m http.server 8000 --bind 127.0.0.1 --directory tests/pages
```

Follow the [input regression procedure](input-review.md#regression-procedure-and-resolution-evidence) at `http://127.0.0.1:8000/remote-input.html`. Record device properties, exact steps, failures and evidence in [device-tests.md](device-tests.md). Diagnostic text injection or touch input does not count as remote-only acceptance. Stop the fixture server and remove the ADB reverse mapping when done.

The consent-page replays are historical and have been removed after the direct-launch redesign. Use the [direct first-launch checks](../tests/device/README.md#direct-first-launch) and `replay tests/device/tv-home.ad` with a normal native home tab. Preserve the isolated incomplete profile for upgrade testing; never reset an existing profile to meet a replay precondition.

On this TV image, agent-device selected its helper input method, which hid the native TV keyboard. Before claiming keyboard coverage, inspect `adb -s "$TV_SERIAL" shell settings get secure default_input_method` and restore the image's existing keyboard if needed:

```sh
adb -s "$TV_SERIAL" shell ime set com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME
```

That component is specific to this image; inspect `ime list -s` on other devices. Use `tv-remote` for native-focus checks; use the D-pad-only source below for the TV cursor adapter. Focus snapshots can lag input injection: the onboarding replay waits up to three seconds for the observed focus property before pressing OK. Avoid a separate `uiautomator dump` while agent-device owns the automation connection.

## Web navigation diagnostic configuration

On this host, the default emulator launch repeatedly exited with signal 11 when Chromium created a Vulkan device. A cold boot with guest Vulkan disabled loaded the same fixture successfully. This isolates a usable input-test configuration; it does not establish the underlying graphics bug or Vulkan compatibility. Keep the APK unchanged for this comparison.

When the AVD is stopped, launch the Nix emulator with captured output, then call `device_list` and `device_open` to attach T3 to `emulator-5554`:

```sh
nix develop --command systemd-run --user --unit=brave-tv-emulator-gl --service-type=exec \
  --setenv="ANDROID_SDK_ROOT=$HOME/Android/Sdk" \
  --setenv="ANDROID_HOME=$HOME/Android/Sdk" \
  --property="StandardOutput=append:$HOME/.cache/brave-tv/logs/emulator-web-navigation-gl.log" \
  --property="StandardError=append:$HOME/.cache/brave-tv/logs/emulator-web-navigation-gl.log" \
  "$HOME/.cache/brave-tv/emulator-sdk/libexec/android-sdk/emulator/emulator" \
  -avd brave_tv_api36 -no-audio -no-window -gpu auto -feature -Vulkan \
  -no-snapshot-load -no-boot-anim -port 5554
```

The current session already has this unit running; do not launch a second copy. `-no-snapshot-load` cold-boots existing disk data without wiping it. A prior quick-boot snapshot had restored a state predating APK installation after the crash. Inspect the installed package and onboarding state after any restore; never clear the profile to force a test precondition.

Agent-device's Android `tv-remote` currently uses `input keyevent`. On this emulator its virtual input device is classified as an alphabetic keyboard, which the TV adapter deliberately preserves. Native onboarding and Back checks can pass without exercising cursor input. The cursor regressions now use Android's `uinput` command to register a temporary non-alphabetic D-pad device (keyboard type 1), with no root access or image modification. It unregisters on process exit. Follow the [device regression instructions](../tests/device/README.md); keep the normal keyboard exclusion in the adapter. Neither source substitutes for the physical remote.

An emulator run cannot establish physical-TV performance, hardware video decoding, DRM support or the MVP's two-device acceptance criteria.


## Isolated TV onboarding profile

`brave_tv_onboarding_api36` is a second API 36 TV AVD at 1920×1080/320 dpi, created without `--force` on 9 October to verify first-run UI without resetting the main profile. It uses the same Nix SDK/image and guest-Vulkan-disabled configuration, with port 5556. Its unit is `brave-tv-onboarding-emulator.service`, with a 5 GiB high/6 GiB maximum memory cap; the initial 4 GiB cap was raised after first boot reached that limit. The existing AVD and Chromecast remain preserved. Logs: `~/.cache/brave-tv/logs/emulator-onboarding.log`.

Opening the second emulator coincided with the shared ADB server ceasing to answer even `adb devices` (10-second timeout) and snapshots on the original emulator. Restarting that diagnostic server restored both emulators and the paired Chromecast; no emulator or application data was reset. Recreate the test-only reverse/DevTools forwards after an ADB server restart. This is a tooling recovery, not a Brave crash or app-performance result.

The ADB stall recurred with both emulators running and was not resolved permanently by a server restart. Subsequent verification uses one emulator at a time: stop the active emulator service without clearing its AVD, then start the other. The first-run APK was installed on the isolated AVD, but its initial T3 launch/snapshot timed out before a usable baseline capture. Do not count that attempt as onboarding coverage.

The later ADB stall also reproduced with only the onboarding emulator running, so concurrency is not established as its cause. The wedged server was the host SDK's `platform-tools/adb` (35.0.2-12147458). After stopping that server and explicitly starting `adb start-server` through `nix develop`, device listing, snapshots and remote replay resumed using the Nix android-tools server. This is an observed recovery, not a proven root cause. Both profiles and APKs were preserved.
