# First TV input patch

Historical prototype and artifact record. Development now uses the [real source fork](source-workflow.md); the patch-export workflow has been retired.

Status: the TV patch builds with blocking Android static analysis and installs on the Android TV API 36 emulator. A demonstrated first-run focus trap was corrected; the same remote replay fails on the original APK and passes on the correction. All onboarding pages can now be completed with D-pad/OK. Cursor visibility, precise field clicks, native keyboard/Back, nested scrolling and tab-detach cleanup now pass controlled emulator regressions. The public input-policy tests also pass on the JVM. Physical-TV, website, video and performance acceptance remain open. This is not a completed MVP or a release APK.

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

## Onboarding correction artifact

- Preserved APK: `~/.cache/brave-tv/artifacts/tv-onboarding-v1.97.56-x64-debug-20261009/BraveMonox64.apk`.
- Size: **853,918,489 bytes**; SHA-256: `bebe3b30b2e686d19e53ca382926e5e383c2f7360f03a971828e8c15d00f76ca`.
- Implementation commit: `6ae4d9b5ed545cde200a457a0b29229cebc6269d`. Upstream pins, package, version and ABI match the original prototype above.
- `brave-tv-onboarding-j4.service` exited 0. Log/timing prefix: `~/.cache/brave-tv/logs/build-tv-onboarding-x64-20261009-r1`. The incremental build took **3m33s**, including blocking lint/Error Prone, with four jobs and the same 18/22 GiB memory thresholds. This timing includes cache reuse.
- SDK `apksigner` verified the v2 signature. The artifact directory preserves the exact patch, both GN argument files, signature result and `provenance.json`.
- All nine repository tests and strict Python typechecking passed through `nix flake check`; source whitespace and reverse-patch checks passed. The [latest implementation review](input-review.md#onboarding-focus-correction-review) found no Standards or Spec issues.
- Nix ADB installed the APK without uninstalling or clearing data. The first-page replay passed, then D-pad/OK completed the remaining pages, deselected diagnostic/product-insight sharing and reached TV controls. See [runtime evidence and limits](device-tests.md#emulator-run-9-october-2026).
- At this earlier artifact, the local fixture loaded with guest Vulkan disabled and Back reached TV controls. Pointer visibility/input was unresolved; the correction below records the subsequent diagnosis and executed checks.

## Cursor correction artifact

- Preserved APK: `~/.cache/brave-tv/artifacts/tv-cursor-v1.97.56-x64-debug-20261009-r3/BraveMonox64.apk`.
- Size: **853,917,577 bytes**; SHA-256: `9c6f655903b78b542bebf0b0abd07914e3085d3863f32d6885073a3cb2245629`.
- Implementation commit: `937ac535839aa74f2cfbf6fc554f53822ca65faf`. Package/version, x86_64 ABI and upstream pins match the preceding artifacts.
- `brave-tv-cursor-j4-r3.service` exited 0. Log/timing prefix: `~/.cache/brave-tv/logs/build-tv-cursor-x64-20261009-r3`. The incremental build took **3m33s**, with blocking lint/Error Prone and the established four-job, 18/22 GiB limits. Native build outputs were reused.
- SDK `apksigner` verified the v2 signature. The artifact preserves the exact patch, both GN argument files, signature result and provenance with their hashes and the implementation commit. Earlier diagnostic builds remain separately preserved.
- All nine repository tests and strict Python typechecking passed through Nix. Source whitespace, reverse-patch and Java formatting checks passed. Separate [Standards and Spec reviews](input-review.md#cursor-correction-review) found no actionable code findings in this implementation commit.
- Installed with `adb install -r`, preserving the profile. The original rendering assertion fails and the corrected screenshot passes; narrow-field focus and cursor cleanup on tab replacement also have demonstrated failing and passing runs. A non-alphabetic D-pad test device drives the adapter; helper alphabetic-keyboard events retain normal browser behavior. Full [runtime evidence](device-tests.md#cursor-correction-run-9-october-2026) and [repeatable checks](../tests/device/README.md) describe the test boundary.

## Chromecast ARM artifact

- Preserved APK: `~/.cache/brave-tv/artifacts/tv-chromecast-v1.97.56-arm-static-20261009/BraveMonoarm.apk`.
- Size: **366,860,417 bytes** (349.9 MiB); SHA-256: `4da845e3672c6c3f7ea89a4e61e5d66da00b3349ee87a32ac433bc69dd45c825`.
- Implementation commit: `d5c4de11320677602b562b8848b96a3557bb4a05`, including the earlier cursor correction. Locked upstream revisions are unchanged.
- Package `com.brave.browser_default`, version `1.97.0`, code `429700000`, minimum API 29, target API 37, ABI **armeabi-v7a**. This matches the connected Android 14 Chromecast. It is an optimized Static development build with development signing, not a public release.
- The initial build failed at the final link after 5h18m37s. The factory-interface correction removed its reference to desktop-only tooltip destruction. The cached retry completed in 29.55 seconds, including successful native link and APK packaging. See [build evidence](build.md#chromecast-arm-development-build).
- SDK `apksigner` verified the v2 signature. The artifact directory contains the exact patch, both GN argument files, badging, signature result and provenance with source/configuration hashes. The original failed object remains available for the regression's failing case.
- The compiled-object regression, nine repository tests, strict Python typechecking and C++ formatting passed. The [latest-commit Standards and Spec reviews](input-review.md#optimized-android-link-correction-review) found no issues. Android analysis passed as blocking build steps.

The unchanged APK installed and launched into onboarding on the physical Chromecast after the user freed 1.26 GiB. The physical remote advances the first setup page, but subsequent browser launches repeatedly freeze, including without typing. See the [physical-device results](device-tests.md#chromecast-installation-9-october-2026). URL-to-video, Shields, lifecycle, performance and the second physical-device gate remain open.

### Non-debuggable Chromecast artifact

- Preserved APK: `~/.cache/brave-tv/artifacts/tv-chromecast-v1.97.56-arm-static-nodebug-20261009/BraveMonoarm.apk`.
- Size: **366,860,419 bytes**; SHA-256: `a74f8932adef3bdf6b83af3eff2951b85862ef3ca587d5f4de520060a73676b2`.
- Same source patch, package, version, ABI and signing certificate as the ARM artifact above. `--gn=debuggable_apks:false` is the only build-configuration change. The manifest is the only changed ZIP entry; SHA-256 comparison confirms all DEX files and native libraries are identical. Signature verification passed and the APK is no longer marked debuggable.
- The cached build passed in **1m35.03s** wall time (Siso: 1m27.57s, 11 executed steps). Logs: `~/.cache/brave-tv/logs/build-tv-chromecast-arm-nodebug-20261009-r1.{log,time}`. The artifact directory preserves the exact patch, GN arguments, manifest, signature, badging and provenance.
- This is the current physical-TV test artifact. Installing it initially failed due to storage, both as an update and after the user uninstalled the previous APK. A device restart recovered additional space, and installation then succeeded. The user uninstallation means profile preservation across an update was not verified.
- Onboarding completes with D-pad/OK. Initial startup and a final cold launch recorded no new ANR over 51.7 and 51.0 seconds respectively; the earlier debuggable build repeatedly froze within 13–16 seconds without typing. The user confirms physical-remote navigation to `example.com`, visible cursor movement and one click from one held/released OK. A later screenshot shows additional clicks, form text and scrolling mode. See the [physical run](device-tests.md#non-debuggable-chromecast-run-9-october-2026) for the test boundary and comparison caveat.

## Implementation

The [historical TV patch](https://github.com/smolcars/brave-tv/blob/4bf9245e27dc6e45c1be8e9eaa4e5611277d228c/patches/0001-tv-input.patch), now committed as ordinary source in `brave/`, adds a TV launcher alias and an initial vector banner, and connects a TV-only controller to Brave's existing activity. The launcher routes through Chromium's first-run dispatcher. The existing optional-touchscreen declaration is retained. No engine, Shields enforcement, profile storage or certificate handling is replaced.

The native controls dialog opens the existing address bar or browser menu, reloads the current page, and enters cursor/scroll mode when a webpage is present. Native pages continue to use native focus. On television UI mode, the onboarding pager now prefers focusable descendants so existing controls can receive D-pad focus. The contents of the browser menu, tab switcher and Shields settings still need TV adaptation.

| Context | D-pad | OK | Back |
| --- | --- | --- | --- |
| TV controls | Move native selection | Activate the selected control | Delegate to browser history/exit |
| Page cursor | Move the visible cursor | Click once on release | Open TV controls |
| Page scrolling | Scroll at the current cursor location | Return to cursor mode | Open TV controls |
| Keyboard / native modal / fullscreen UI | Preserve upstream handling | Preserve upstream handling | Preserve upstream handling first |

No Menu button is required to open TV controls. Alphabetic hardware keyboards and system keys retain upstream handling. The mode hint is drawn over the webpage; it is not a replacement for accessibility testing. A web page's CloseWatcher must not prevent escaping to the TV controls.

`TvRemoteInput` owns the interaction policy. `TvBrowserControls` draws the cursor in a non-interactive sibling view and delivers scoped mouse hover/wheel events and touchscreen taps through the active content view's compositor parent. It uses the existing Android Back dispatcher. Native pages, native focus, Find UI and visible browser scrims take priority. The JVM tests check observable cursor/click/scroll/focus requests, including canceled clicks, viewport changes and missing content. They do **not** execute the Android adapter or prove that a real page receives those events. The [input review and controlled regression procedure](input-review.md) record the source corrections and outstanding Android checks.

## Build the tracked source

Do not change the build checkout while a build is running. From this project:

```sh
nix develop
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
cd "$HOME/.cache/brave-tv/workspace/src/brave"
SISO_LIMITS=local=4 pnpm run build Debug --target_os=android --target_arch=x64 --target_android_output_format=apk --gn=android_static_analysis:on
```

The checkout helper advances a clean build checkout to the committed fork revision; it refuses dirty or divergent checkouts. Do not reset those checkouts or rerun forceful upstream synchronization to make the check pass. Reusing the same build directory retains unaffected native compilation outputs.

Use the [resource-limited service](build.md#resume-with-host-resource-limits) for long builds on this builder. The pinned upstream wrapper does not enforce `--ninja=j:N` in offline mode.

For development, edit and commit normal files under `brave/` following the [source workflow](source-workflow.md). Run the upstream formatter, source whitespace checks, focused tests and blocking Android analysis. The old patch worktree remains historical evidence, not the development entry point.

The prototype launcher name and banner are temporary. The Android package, other app labels and signing still use upstream development defaults; independent release identity and safe upgrade testing remain checklist work.

## Direct-home diagnostic artifact (9 October)

Source `32c6f8d4b` built with blocking Android analysis in 7m24s (wrapper 7m28s), using the existing cache and four-job/18–22 GiB limits. Observed cgroup peak: 15,327,477,760 bytes (14.27 GiB). APK: `~/.cache/brave-tv/artifacts/tv-simple-home-32c6f8d4b-x64-debug-20261009/BraveMonox64.apk`, 852,922,262 bytes, SHA-256 `cf05c537c4381cb2ac3c0e422f611d669b956a6d61956b418a4d7e48b1765121`. Its v2 signature verifies; the artifact directory preserves GN args and provenance. Log prefix: `build-simple-browser-x64-20261009-r8`.

This is a **failing diagnostic APK**, not an accepted candidate. The profile-preserving update installs, but direct startup aborts twice in the referral delegate because disabled startup leaves its profile observer attached. The native-home replay fails at its first focus wait. Source `0304bcec2` prevents Android referral service construction; its cached build and runtime verification are pending.


## Current native-home emulator artifact (9 October)

Source `cca46e564` includes the redesigned native home and Android analytics-collector shutdown. The cached blocking build passes in 4m58.73s; signature verification and profile-preserving emulator update pass. APK: `~/.cache/brave-tv/artifacts/tv-collector-shutdown-cca46e564-x64-debug-20261009/BraveMonox64.apk`, 852,947,082 bytes; SHA-256 `5deb87191f60f72b52f71620fc3284e67cb61679aaf3601fa4a74a6eb346e852`. This x64 Debug artifact is for the emulator, not the Chromecast.

Home/menu/panel navigation, search-provider changes, the local search-collector regression and network-blocking fixture pass. See [executed checks and remaining limits](device-tests.md#collector-shutdown-with-the-redesigned-home-9-october-2026). The new-tab overlay transition, remaining branding, traffic audit and broader site/video/hardware acceptance remain open.
