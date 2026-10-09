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

In the Nix shell, select the emulator serial returned by the device tooling before using ADB. Verify the preserved APK against the [recorded SHA-256](tv-prototype.md#completed-prototype-artifact), then install it without uninstalling or clearing data:

```sh
adb devices -l
export TV_SERIAL='replace-with-the-open-emulator-serial'
sha256sum "$HOME/.cache/brave-tv/artifacts/tv-prototype-v1.97.56-x64-debug-20261009/BraveMonox64.apk"
adb -s "$TV_SERIAL" install -r "$HOME/.cache/brave-tv/artifacts/tv-prototype-v1.97.56-x64-debug-20261009/BraveMonox64.apk"
adb -s "$TV_SERIAL" reverse tcp:8000 tcp:8000
python3 -m http.server 8000 --bind 127.0.0.1 --directory tests/pages
```

Follow the [input regression procedure](input-review.md#regression-procedure-and-resolution-evidence) at `http://127.0.0.1:8000/remote-input.html`. Record device properties, exact steps, failures and evidence in [device-tests.md](device-tests.md). Diagnostic text injection or touch input does not count as remote-only acceptance. Stop the fixture server and remove the ADB reverse mapping when done.

An emulator run cannot establish physical-TV performance, hardware video decoding, DRM support or the MVP's two-device acceptance criteria.
