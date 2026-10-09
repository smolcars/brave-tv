# First TV input patch

Status: the TV patch built successfully at 06:25 EDT on 9 October 2026, including blocking Android static analysis. The public input-policy tests pass on the JVM. Launcher behavior, first run, actual focus, pointer delivery, nested scrolling and video remain unverified. This is not a completed MVP or a release APK.

The first compile failed after 40 seconds because the adapter imported JSpecify's `Nullable`, which is absent from this target's classpath. It now uses the surrounding code's existing AndroidX annotation. The retry passed Android Java compilation and produced the APK in 2m24s. However, 328 static-analysis tasks were still queued; service teardown terminated the background server (lint reported signal -15). Those checks must not be treated as passing.

The first blocking run (`build-tv-debug-x64-20261009-060803.*`) failed lint on an oversized vector and two manifest-only resource references. The banner now uses 160×90dp intrinsic dimensions, keeping its 320×180 viewport/artwork. The label/banner references were verified in the packaged APK before adding two exact resource exceptions beside Brave's existing manifest exceptions; unused-resource checks remain enabled.

That retry (`build-tv-debug-x64-20261009-061444.*`) passed launcher lint but Error Prone required explicit parentheses around the existing URL-change-and-SELECT condition. The grouping is now explicit without changing precedence or behavior. The rebuilt APK's signature, TV launcher/category and 160×90dp banner were independently verified.

Successful build: `brave-tv-prototype-j4-r5.service`; log/timing prefix `~/.cache/brave-tv/logs/build-tv-debug-x64-20261009-062100`. It sets `android_static_analysis="on"`, so checks finish as blocking build steps and propagate failures. The service exited successfully and is no longer running. Earlier attempts remain under `build-tv-debug-x64-20261009-055842.*` and `build-tv-debug-x64-20261009-060024.*`. All use the baseline output cache and the resource limits documented in [build.md](build.md).

The generated merged manifest contains the exported TV launcher alias, `MAIN`/`LEANBACK_LAUNCHER`, the TV banner/label and `android.hardware.touchscreen` marked optional. This confirms manifest integration; actual TV launcher behavior is still untested.

## Completed prototype artifact

- Preserved APK: `~/.cache/brave-tv/artifacts/tv-prototype-v1.97.56-x64-debug-20261009/BraveMonox64.apk`.
- Size: **853,918,581 bytes** (about 814 MiB); this is an unoptimized Debug build, not an expected release size.
- SHA-256: `251d8f23eff70e8a7e89fc6657ccf0467ab4e8f6a268418bd9759a6860f44e4f`.
- Build completed at **06:25 EDT**, exit 0. The final resumed command took **3m59s**, reusing native outputs and checks from earlier attempts; this is not a clean-build timing.
- Implementation commit: `1e1c5940f4cb492ddc5d66885def16d280bcf4c9`; Brave/Chromium pins remain those in [build.md](build.md).
- The blocking `chrome_java__errorprone` and `chrome_public_apk__lint` targets passed. `nix flake check` passed all nine repository tests and strict Python typechecking. Source whitespace and reverse-patch checks passed.
- SDK `apksigner` verified the v2 signature. APK inspection confirmed the TV launcher/category and the banner's 160×90dp intrinsic size / 320×180 viewport.
- Metadata: package `com.brave.browser_default`, version `1.97.0` / code `429700008`, minimum API 29 (Android 10), target API 37, ABI **x86_64**. This APK targets an emulator; it is not suitable for the user's physical streaming stick.
- The artifact directory contains `provenance.json`, the exact downstream patch, `args.gn`, manifest/banner dumps, badging and signature results. Provenance records hashes for both GN argument files, the patch and flake lock, plus source revisions, commands, limits and logs. The baseline APK remains separately preserved.

Next gate: enable device access, install on an Android TV emulator, then build for the confirmed physical-device ABI and run the [remote regression procedure](input-review.md#regression-procedure-and-resolution-evidence). The user has a remote-equipped streaming stick reporting Android TV OS 14; exact model/ABI remain to be read from the device. No installation, Shields update/blocking, video or performance result has been recorded.

## Implementation

[`0001-tv-input.patch`](../patches/0001-tv-input.patch) adds a TV launcher alias and an initial vector banner, and connects a TV-only controller to Brave's existing activity. The launcher routes through Chromium's first-run dispatcher. The existing optional-touchscreen declaration is retained. No engine, Shields enforcement, profile storage or certificate handling is replaced.

The native controls dialog opens the existing address bar or browser menu, reloads the current page, and enters cursor/scroll mode when a webpage is present. Native pages continue to use native focus. This does not yet adapt the contents of the browser menu, tab switcher, Shields settings or onboarding screens.

| Context | D-pad | OK | Back |
| --- | --- | --- | --- |
| TV controls | Move native selection | Activate the selected control | Delegate to browser history/exit |
| Page cursor | Move the visible cursor | Click once on release | Open TV controls |
| Page scrolling | Scroll at the current cursor location | Return to cursor mode | Open TV controls |
| Keyboard / native modal / fullscreen UI | Preserve upstream handling | Preserve upstream handling | Preserve upstream handling first |

No Menu button is required to open TV controls. Alphabetic hardware keyboards and system keys retain upstream handling. The mode hint is drawn over the webpage; it is not a replacement for accessibility testing. A web page's CloseWatcher must not prevent escaping to the TV controls.

`TvRemoteInput` owns the interaction policy. `TvBrowserControls` delivers scoped mouse hover/wheel events and touchscreen taps to the active Chromium content view, and uses the existing Android Back dispatcher. Native pages, native focus, Find UI and visible browser scrims take priority. The JVM tests check observable cursor/click/scroll/focus requests, including canceled clicks, viewport changes and missing content. They do **not** execute the Android adapter or prove that a real page receives those events. The [input review and controlled regression procedure](input-review.md) record the source corrections and outstanding Android checks.

## Apply after the baseline build finishes

Do not edit source while the unmodified build is running. From this project:

```sh
nix develop
export TV_PROJECT="$PWD"
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
git -C "$HOME/.cache/brave-tv/workspace/src/brave" apply --check --whitespace=error-all "$TV_PROJECT/patches/0001-tv-input.patch"
git -C "$HOME/.cache/brave-tv/workspace/src/brave" apply --whitespace=error-all "$TV_PROJECT/patches/0001-tv-input.patch"
cd "$HOME/.cache/brave-tv/workspace/src/brave"
SISO_LIMITS=local=4 pnpm run build Debug --target_os=android --target_arch=x64 --target_android_output_format=apk --gn=android_static_analysis:on
```

The checkout helper intentionally refuses the now-modified checkout on subsequent calls. Do not reset it or rerun forceful upstream synchronization to make that check pass. Preserve the unmodified APK and its provenance before applying the patch. Reusing the same build directory should retain unaffected native compilation outputs.

Use the [resource-limited service](build.md#resume-with-host-resource-limits) for long builds on this builder. The pinned upstream wrapper does not enforce `--ninja=j:N` in offline mode.

For development, edit the patch in a separate Brave worktree at the pinned commit, mark new files with `git add -N`, then export `git diff --binary` to the patch file. Keep unrelated formatting changes out of the diff. Run the upstream Java formatter on new Java files, `git diff --check` in that worktree, the apply check above against the clean baseline, and `nix flake check` in this project.

The prototype launcher name and banner are temporary. The Android package, other app labels and signing still use upstream development defaults; independent release identity and safe upgrade testing remain checklist work.
