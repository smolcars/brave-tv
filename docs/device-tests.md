# Device and website test matrix

Status: emulator input regressions pass as recorded below. The initial debuggable Chromecast APK repeatedly froze; the current non-debuggable test APK installs and passes initial startup and physical-remote input checks. See [build evidence](build.md) and [prototype status](tv-prototype.md). Broad website, sustained-video and performance coverage remain open.

## What hardware is needed

Start with an Android TV or Google TV running Android 10 or newer and its ordinary D-pad/OK/Back remote. A built-in TV or an external streaming device is suitable. We need the model and Android version from its Settings → About screen before choosing an APK architecture. An external keyboard or mouse can help investigate stock Brave, but cannot count toward remote-only acceptance.

The completed MVP requires two physical devices: a modest device and a faster device. We can start development with one. An emulator helps check installation and input integration; it does not establish real TV performance, hardware decoding or DRM compatibility. Do not buy hardware until the source build works and the first device's limitations are known.

On 9 October the user identified a **Google Chromecast with a remote, running Android 14**, connected only to the TV. Wireless ADB subsequently confirmed product/device `sabrina`, API 34 and **`armeabi-v7a,armeabi`**; build for 32-bit ARM. T3 opened the physical device in its Device panel. Its reported OS meets the prototype's Android 10 minimum. The x64 development APK is for an emulator, not this physical target. No second device has been chosen.

For installation and logs, the developer computer must be able to reach the TV through Android Debug Bridge (ADB), over a supported USB or local-network connection. Enabling developer options/debugging and accepting the computer's debugging prompt happens on the device. Settings vary by manufacturer; use its instructions. Disable debugging when testing is finished. The Chromecast is now paired over wireless debugging. Pairing material and device addresses are not committed.

On 9 October, at the user's request, `enableDeviceSupport` and `enableAgentDeviceAccess` were set to `true` in T3's watched `~/.t3/userdata/settings.json`, preserving other settings and making a private backup first. The installed T3 CLI has no dedicated device command. A subsequent “continue” turn still reported device access disabled; both flags remained enabled and no project override disabled them. The existing session retains its old capabilities. T3's command palette provides **Restart agent session**, whose next-message behavior starts a fresh session; use it, then recheck `device_list`. The settings file is watched, so a server-wide restart is not required for the settings change. Saving the flags does not prove helper installation, emulator availability or a physical-device connection.

| Field | Modest device | Faster device |
| --- | --- | --- |
| Manufacturer and model | Google Chromecast with remote; HD/4K variant TBD | TBD |
| Android version / API | Android 14 / API 34 (ADB-confirmed) | TBD |
| Supported ABIs | `armeabi-v7a,armeabi` | TBD |
| RAM / available storage | About 1.9 GiB / 1.26 GiB before successful installation; 933 MiB after launch | TBD |
| Display resolution / scaling | 3840×2160 physical; 1920×1080 override; 320 dpi | TBD |
| Remote buttons | Physical D-pad/OK supports address entry, cursor movement and clicks; full native-priority matrix pending | TBD |
| Connection method | Wireless ADB; T3 Device panel attached | TBD |
| Official Brave baseline | Not run | Not run |
| Unmodified source build | Not run | Not run |
| TV adaptation build | Non-debuggable ARM installation, startup and basic remote input pass; sustained testing pending | Not run |

Once device access is enabled and the computer is authorized, the Nix shell provides ADB. Select a specific serial to avoid accidentally testing a different device:

```sh
adb devices -l
export TV_SERIAL='replace-with-the-device-serial'
adb -s "$TV_SERIAL" shell getprop ro.product.model
adb -s "$TV_SERIAL" shell getprop ro.build.version.release
adb -s "$TV_SERIAL" shell getprop ro.build.version.sdk
adb -s "$TV_SERIAL" shell getprop ro.product.cpu.abilist
adb -s "$TV_SERIAL" shell cat /proc/meminfo
adb -s "$TV_SERIAL" shell wm size
adb -s "$TV_SERIAL" shell wm density
```

Do not assume a 64-bit processor means the installed Android OS accepts arm64 APKs. Select the build from the reported ABI list. Never uninstall a tester's browser or clear its data to get an upgrade test to pass.

## Emulator run: 9 October 2026

After the user restarted T3, device access became available. The missing SDK Command-line Tools and TV system image were provisioned through the optional Nix package. T3's camera arguments failed on the original emulator 35.3.11; emulator 36.5.11 accepted them. The original installation was preserved as `~/Android/Sdk/emulator.before-brave-tv`. See [emulator setup](emulator.md).

- AVD: `brave_tv_api36`, model `sdk_google_atv64_x86_64`, Android 16/API 36, reported ABIs `x86_64,arm64-v8a`.
- Display: 1920×1080 at 320 dpi; UI mode `0x24` (television/night); about 2 GiB guest RAM. KVM is enabled. This does not represent either physical-device target.
- T3 `device_open` succeeded; the emulator was visible in the Device panel. Interaction used its returned `agent-device` launcher/config/session and `tv-remote` commands.
- Original prototype SHA-256 matched `251d8f23eff70e8a7e89fc6657ccf0467ab4e8f6a268418bd9759a6860f44e4f`. Nix ADB `install -r` succeeded. Launch reached Brave's Web Discovery onboarding page.
- **FAIL on the original prototype:** D-pad directions and OK could not leave the full-screen onboarding list. The “Maybe later” focus assertion in `tests/device/onboarding-focus.ad` failed. Home worked, and the activity hierarchy confirmed the buttons themselves were focusable. The [correction plan](engineering-plan.md#first-runtime-correction-onboarding-focus) records the cause and intended fix.
- Original failure evidence: `~/.cache/brave-tv/logs/first-run-focus-before.{json,png}` and `emulator-first-boot.log`. An attempted standalone `uiautomator dump` conflicted with agent-device's active automation service; its crash log is a diagnostic-tool failure, not a Brave crash.
- **PASS on the correction:** `tests/device/onboarding-focus.ad` fails at its focus wait against the original APK and passes all eight steps in 3.4 seconds against the corrected APK. Both installs used `install -r`, without clearing data or uninstalling. Logs: `~/.cache/brave-tv/logs/onboarding-regression-{original,fixed}.log`. The [corrected artifact](tv-prototype.md#onboarding-correction-artifact) records its checksum and build provenance.
- D-pad/OK then completed the interruption-blocking page and the final settings page. Both diagnostic reporting and product insights could be deselected; “Start browsing” reached the native TV controls dialog. This verifies the observed onboarding flow, not every first-run variant or non-TV behavior.
- TV controls opened the omnibox. After restoring the system TV keyboard (agent-device had selected its helper IME), D-pad/OK switched keyboard layouts, deleted a character, entered `127.1:8000` and submitted it. Brave interpreted this shorthand as a search, so this is evidence of remote text entry/submission, not successful URL navigation or search-result loading.
- The emulator exited during webpage navigation. Reopening loaded its earlier `default_boot` snapshot without the app; reinstalling the preserved APK and replaying onboarding succeeded again. No app data was deliberately cleared. A controlled launch with T3's same emulator arguments captured a host SIGSEGV (`Result=core-dump`, `ExecMainStatus=11`, peak memory 4,575,703,040 bytes), immediately after Vulkan instance/device creation for Chromium. Log: `~/.cache/brave-tv/logs/emulator-web-navigation-r2.log`. The inspected kernel log contains no OOM event. This is an emulator-process failure; its exact graphics cause is unconfirmed.
- **Diagnostic workaround:** the same installed APK loads `http://127.0.0.1:8000/remote-input.html` after starting the emulator with `-feature -Vulkan -no-snapshot-load`. The service remains running and no app rebuild was involved. The URL was opened through agent-device's deep-link command, not entered with the remote, so this is not an end-to-end URL-navigation pass. Log: `~/.cache/brave-tv/logs/emulator-web-navigation-gl.log`; [launch instructions](emulator.md#web-navigation-diagnostic-configuration).
- **PASS, limited Back check:** from the fixture, Back returns to TV controls. Screenshot: `~/.cache/brave-tv/logs/fixture-back-controls.png`. CloseWatcher was not enabled for this check.
- **Original pointer failure (resolved in the next run):** choosing “Page cursor” showed no visible cursor/hint. Five Down presses scrolled the document; OK left the counter at zero. Agent-device 0.21.12 implements these buttons with `adb shell input keyevent`; the emulator's virtual device reports `KEYBOARD | DPAD` and alphabetic keyboard type 2. The adapter explicitly preserves alphabetic keyboard handling. This provides a concrete input-source mismatch to investigate, not evidence that a physical remote behaves the same way. Input metadata: `~/.cache/brave-tv/logs/emulator-input-devices.txt`.
- At the end of this earlier run, click/hold, explicit/nested scrolling, CloseWatcher/native-modal priority, lifecycle recovery and URL-to-video were unverified. The next run below resolves only the checks explicitly listed there.

## Cursor correction run: 9 October 2026

Same API 36 emulator, 1920×1080/320 dpi, guest Vulkan disabled. [Final x64 artifact](tv-prototype.md#cursor-correction-artifact): implementation `937ac53`, APK SHA-256 `9c6f655903b78b542bebf0b0abd07914e3085d3863f32d6885073a3cb2245629`. Installation preserved the browser profile. Fixture URLs were opened by diagnostic deep link, not remote URL entry. Commands and preconditions are in [tests/device](../tests/device/README.md).

- **Input source isolated:** agent-device's alphabetic virtual keyboard bypasses the adapter by design. A temporary D-pad-only device registered using Android's `uinput` reports keyboard type 1 and delivers clicks on the original onboarding APK. The final `keyboard-fallback.ad` replay passes with the counter remaining zero; no keyboard filter was removed.
- **Cursor visibility, FAIL → PASS:** JDB found valid page dimensions, coordinates and draw calls. A `ViewOverlay` drawable disappeared over the compositor surface; the same drawable on a normal view rendered. `CursorScreenshot.java` fails against `pointer-original.png` and passes against `pointer-r3.png` at 960,700. Holding OK for one second and releasing yields `Clicks: 1`. The fixture text was made directly observable to the snapshot helper.
- **Precise clicks, FAIL → PASS:** the large click target hid a vertical input offset. On `precise-input.html`, OK at the centered cursor visibly over the narrow field failed `id="entry" focused=true` before the parent-dispatch correction. The unchanged replay passes afterward and opens the native TV keyboard. D-pad-source OK types `Q`; Back dismisses the keyboard while retaining the field, and the following Back opens TV controls. Evidence: `precise-before-static.log`, `precise-before.png`, `precise-typed.json`, `precise-after-back.png`.
- **Tab cleanup, FAIL → PASS:** the initial sibling-view build left a ghost cursor after a diagnostic deep link opened another tab. The absence assertion fails on `cursor-detach-before.png`. With detach cleanup, the presence assertion passes before the transition and the absence assertion passes after it (`cursor-detach-r3-{before,after}.png`).
- **Explicit/nested scrolling, PASS:** at cursor 960,700, six Down wheel steps bring the nested box under the pointer. Eight more reveal “Nested scroll end” while the outer input bounds (334,258,732×130) and nested container bounds (96,612,1728×462) stay identical. The before/after JSON assertion passes. Evidence: `nested-r3-{before,after}.json`.
- All evidence paths above are under `~/.cache/brave-tv/logs/`. One deliberately suspended early debugger session caused an input-dispatch ANR; it is diagnostic interference, not an uninstrumented app failure. Later probes resumed automatically; temporary debug scripts are isolated in that logs directory. No production diagnostic logging was added.

CloseWatcher/native-modal combinations, lifecycle recovery, successful remote URL-to-video navigation, public website compatibility, Shields resources, hardware decoding and performance remain unverified. These local emulator results do not establish physical-remote acceptance. The subsequent Chromecast attempt is recorded below. The temporary input device and fixture server were stopped, test port mappings removed, and the native TV keyboard restored.

## Chromecast installation: 9 October 2026

- Google Chromecast (`sabrina`), Android 14/API 34, 32-bit ARM, with T3's Device panel attached over wireless ADB. Android reports the physical Chromecast Remote as `KEYBOARD | DPAD`, non-alphabetic keyboard type 1; the injected virtual keyboard is type 2. This confirms input classification, not successful app interaction.
- [ARM artifact](tv-prototype.md#chromecast-arm-artifact): implementation `d5c4de1`, APK SHA-256 `4da845e3672c6c3f7ea89a4e61e5d66da00b3349ee87a32ac433bc69dd45c825`, 349.9 MiB. Signature, ABI and TV launch metadata inspection passed.
- **Initial storage failures:** `agent-device install`, using the returned physical-device launcher/config/session, failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE: Failed to override installation location`. The first attempt started with roughly 900 MiB free. After the user removed more apps, a retry with 1.06 GiB free failed identically. Android's integrity check passed before each installation-location failure; neither attempt installed Brave.
- Android's installation estimate includes the APK and native libraries, and its allocation policy preserves a low-storage reserve. The device reports a 207.3 MiB reserve; this APK contains 185.1 MiB of native libraries. Aiming for 1.3 GiB free before retrying is an estimate with headroom, not a measured minimum. References: Android 14 [installed-size calculation](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-14.0.0_r1/core/java/com/android/internal/content/InstallLocationUtils.java#444) and [allocation policy](https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-14.0.0_r1/services/core/java/com/android/server/StorageManagerService.java).
- **Installation and initial launch, PASS:** after further user cleanup, `/data` reported 1,317,940 KiB free (1.26 GiB). The unchanged APK installed successfully at 14:12 EDT through `agent-device`; Android confirms package/version/ABI and the Leanback launcher category. Opening the package reached the first Web Discovery onboarding screen with both consent buttons visible. This does not yet prove launch from the TV home-screen tile or completion with the physical remote. Available storage after launch was 955,252 KiB (933 MiB).
- **Initial memory sample:** during onboarding, the main browser process reported 134,634 KiB PSS (131.5 MiB) and 178,008 KiB RSS (173.8 MiB). This is one setup-screen sample, not a browsing/video peak or a whole-session budget. Evidence: `~/.cache/brave-tv/logs/chromecast-onboarding-memory-20261009.txt`.
- The user confirmed that the physical Chromecast remote highlights “Maybe later” and advances to the next setup page. The complete onboarding sequence was not recorded, but subsequent launches reached TV controls. The TV home-screen app list also exposes “TV Browser (prototype)”.
- **Browser startup, FAIL:** the user reported apparent crashes during address entry. Uninstrumented Android records show repeated foreground `ChromeTabbedActivity` input-dispatch ANRs. A controlled relaunch, sending no address or keyboard input, produces a fresh five-second focus-event timeout within 16.2 seconds. This isolates a startup freeze before address entry. Captured traces vary between UI inflation, window-class loading/verification and observer callbacks; no single blocking call is established. The installed package initially reports ART `run-from-apk`, with no usable dexopt artifact.
- Explicit per-package ART verification (`cmd package compile -m verify --primary-dex -v com.brave.browser_default`) succeeds and changes ART status to `verify`. The identical launch probe still produces a fresh ANR within 13.0 seconds. Missing preverification alone does not explain the failure. Requesting `speed` compilation instead reports actual filter `verify` and `SKIPPED`, consistent with Android's restriction on debuggable apps.
- The [non-debuggable candidate](tv-prototype.md#non-debuggable-chromecast-artifact) builds and verifies; the manifest is its only changed ZIP entry. Installing it as an update fails with insufficient storage. The user then uninstalled the initial APK and requested a fresh installation. Android reported 998,748 KiB available (975 MiB), and that attempt also failed with insufficient storage. The failed installer directories checked were absent. The Chromecast was restarted once to check for reclaimed storage after uninstallation. Its previous ADB port then refused connections; enabling wireless debugging restored discovery and the existing pairing worked without a new code. The successful follow-up is recorded below.
- Evidence remains outside Git under `~/.cache/brave-tv/logs/`: `chromecast-browser-anr-dropbox-20261009.txt`, `chromecast-browser-anr-after-verify-20261009.txt`, `chromecast-startup-probe-{before,after}-20261009.txt` and `chromecast-art-verified-20261009.txt`. No app data was cleared by the agent. The original Google TV keyboard was restored after helper launches. Browser responsiveness and page interaction were blocked at this stage; the follow-up below records the subsequent checks.

## Non-debuggable Chromecast run: 9 October 2026

- After the restart, available storage was 1,123,180 KiB (1.07 GiB), about 120 MiB more than immediately after uninstallation. `agent-device install` succeeded with the [non-debuggable APK](tv-prototype.md#non-debuggable-chromecast-artifact), SHA-256 `a74f8932adef3bdf6b83af3eff2951b85862ef3ca587d5f4de520060a73676b2`. Android's package flags exclude `DEBUGGABLE`, and ART reports `verify` with reason `install`. No forced `speed` compilation was performed on this installed candidate.
- **Onboarding and initial startup, PASS:** the existing first-page replay passes, then D-pad/OK reaches the browser controls. Crash sharing was already off; product-insight sharing was deselected. The native Google TV keyboard was restored after helper launches. The startup observer records no new ANR over 51.7 seconds; opening the address bar near the end of that interval also succeeds. Evidence: `chromecast-startup-probe-nodebug-20261009.txt`.
- **Physical address entry, PASS (user-confirmed):** the user enters `example.com` with the physical remote and confirms that the page loads without freezing. The subsequent system check reports no ANR since boot. The main browser process at this stage reports 140,209 KiB PSS (136.9 MiB) and 259,712 KiB RSS (253.6 MiB); this excludes separate renderer/GPU processes and is not a peak-memory measurement. Evidence: `chromecast-nodebug-example-{anr,art,memory}-20261009.txt`.
- **Physical cursor/click and basic form interaction, PASS:** the local `remote-input.html` fixture was opened through a diagnostic deep link over an ADB reverse mapping to port 18080. The user reports a visible, movable cursor and exactly one click from a held/released OK. By the later screenshot, the user has clicked several more times, entered `Qqq` in the form, scrolled the page and entered scrolling mode. The exact `Clicks: 1` wait therefore times out on the later count of 9; the user confirms these were additional clicks, not nine clicks from one hold. Evidence: `chromecast-nodebug-cursor.png`. The one-click result is user-confirmed; the screenshot independently establishes subsequent page interaction.
- **Final cold launch, PASS:** after the interaction checks, a separate relaunch sends no address or keyboard input and records no new ANR over 51.0 seconds. Android reports no ANR since boot. Evidence: `chromecast-startup-probe-nodebug-final-20261009.txt`.
- After testing, the browser was opened on `https://example.com`, the native Google TV keyboard restored, and the temporary fixture server and its ADB reverse mapping stopped.
- This passing run followed user uninstallation and a device restart, so it is not a fully isolated experiment attributing all improvement to the debugging flag. Native code and DEX hashes are unchanged. The earlier failure is no longer observed in the initial checks; long sessions, full Back/native-modal priority, narrow-field and nested-scroll assertions on physical hardware, video, Shields and the second-device gate remain open.

## Proposed website flows

### Direct-source fork baseline, 9 October 2026

Source fork `1a2963063` / project migration `5ecc685` installed over the API 36 emulator's existing package with `adb install -r`; no profile clear or uninstallation. The controlled fixture at reversed localhost port 18081 passes the D-pad-only held/released OK assertion (`Clicks: 1`) and `CursorScreenshot.java` reports a visible cursor at 960,700. Screenshot: `~/.cache/brave-tv/logs/fork-baseline-cursor-20261009.png`.

The current emulator has a separate protection failure: the registered Ad Block Resources Library directory contains no files, and `chrome://components` reports version `0.0.0.0` / Update error for the resource library and list catalog. This does not establish a YouTube-specific root cause. The reported physical symptom is video ads before/during playback. Further network-blocking, resource-update and scriptlet checks remain required.

These are initial engineering defaults, awaiting the user's preferred sites. “Core candidate” means a proposed MVP requirement, not a confirmed compatibility claim. Exploratory flows help identify limits and do not imply support for a paid service or DRM system. Use disposable test accounts only when sign-in is necessary; do not record passwords, cookies or private URLs in logs.

Run each flow first on stock Brave, then the unmodified source build, then the TV adaptation, with Shields defaults. Repeat a failing flow with a documented per-site override only when useful for diagnosis. A successful override does not count as default-protection success.

| # | Site / entry URL | Specific remote-only task | Priority |
| --- | --- | --- | --- |
| 1 | https://search.brave.com/ | Enter a query, submit, open a result, return with Back. | Core candidate |
| 2 | https://www.google.com/ | Complete any consent screen, search, open and return from a result. | Exploratory |
| 3 | https://duckduckgo.com/ | Edit an existing query and select a result without losing focus. | Exploratory |
| 4 | https://en.wikipedia.org/ | Search for a long article, follow its contents links and scroll both ways. | Core candidate |
| 5 | https://www.bbc.com/ | Navigate a consent dialog and read an article without a focus trap. | Core candidate |
| 6 | https://www.theguardian.com/ | Open an article, dismiss overlays and return to browser controls. | Exploratory |
| 7 | https://news.ycombinator.com/ | Open a small text link, read comments and navigate back. | Core candidate |
| 8 | https://github.com/brave/brave-core | Open a source file and scroll a wide code view. | Core candidate |
| 9 | https://developer.mozilla.org/ | Search for documentation and navigate an in-page sidebar. | Core candidate |
| 10 | https://www.reddit.com/ | Read a public discussion, expand replies and escape sign-in prompts. | Exploratory |
| 11 | https://stackoverflow.com/ | Find a question and scroll code blocks without trapping the pointer. | Exploratory |
| 12 | https://www.openstreetmap.org/ | Search a place, select a result and return from the interactive map to controls. | Exploratory |
| 13 | https://www.youtube.com/ | Search, play a public video, seek, toggle available captions and exit fullscreen. | Core candidate |
| 14 | https://vimeo.com/ | Play a public video and operate the player overlay. Select and record a specific video during baseline testing. | Exploratory |
| 15 | https://archive.org/details/movies | Choose a public video, play/pause and recover after a network interruption. | Core candidate |
| 16 | https://shaka-player-demo.appspot.com/demo/ | Select an unencrypted adaptive-stream sample, play and seek. Record the asset and codecs. | Core candidate |
| 17 | https://www.twitch.tv/ | Open a public live stream and recover controls after entering fullscreen. | Exploratory |
| 18 | https://www.netflix.com/ | Check sign-in and playback only with an authorized account; record DRM errors separately. | Exploratory |
| 19 | https://www.disneyplus.com/ | Check sign-in and playback only with an authorized account; record DRM/resolution limits. | Exploratory |
| 20 | https://httpbin.org/forms/post | Complete text and option fields, submit and inspect the echoed result; use invented data. | Core candidate |

Add controlled local fixtures for nested scrolling, iframe input, popup/dialog escape, keyboard dismissal, and a known blocked resource with cosmetic/scriptlet checks. Public sites and ad counters alone cannot prove these behaviors. Fixture implementation follows the validated input design.

## Record every run

Use one record per build, device and flow. Keep the official APK version distinct from our Brave/Chromium source pins. A failure report needs enough information to reproduce it without account secrets.

```text
Date:
Device / Android / ABI / display:
Build identity, version and source revision:
APK SHA-256:
Flow number and exact public URL / video asset:
Shields state and filter-resource status:
Expected outcome:
Observed result: NOT RUN / PASS / FAIL / BLOCKED
Remote buttons and steps:
First failing step / recovery path:
Cold-start time / memory / video observations, if applicable:
Log or screenshot path, with private data removed:
```

Record startup and memory measurements before setting budgets. For video, distinguish a picture appearing from sustained playback, hardware decoding, frame drops and A/V sync. Run the separate 30-minute session and sleep/wake checks from the [MVP checklist](mvp-todo.md); a short successful clip cannot replace them.


## Source-fork panels and Shields: 9 October 2026

Source `362d9e85e` built with blocking Android checks in 5m11s using the existing x64 cache, four jobs and 18/22 GiB memory limits. The observed cgroup peak was 16,999,616,512 bytes (15.83 GiB). The APK is preserved at `~/.cache/brave-tv/artifacts/tv-shields-362d9e85e-x64-debug-20261009/BraveMonox64.apk`, 856,933,159 bytes, SHA-256 `f5a11b2513635df0b9562b97e363b28959fbb57c4248d30d3d838497a42fe5fa`. Signature verification and emulator `install -r` passed without profile clearing. Logs: `build-shields-x64-20261009-r3.{log,time}`. Earlier bundle attempts failed on GRIT declarations/relative paths; those were corrected without clearing caches.

The native-panel 16-step D-pad replay passes after the focus-in-touch-mode correction. The 1080p screenshot shows every browser-control row, a filled selected button, readable labels and no clipped bottom row. Tab/private-panel entry and Back restore selection. NTP recovery after Home/resume preserves the native omnibox's first Back, then the next Back opens controls. Incognito authentication remains unverified: this TV emulator explicitly rejects lock-screen setup. Source review checks the existing reauthentication handoff; it is not a substitute for that runtime test.

The previously installed source `058431555` fails the local Shields probe: ad request loaded, control loaded, cosmetic element visible, scriptlet absent. On `362d9e85e`, the harmless real-list `/showbanner.js` request fails with `ERR_BLOCKED_BY_CLIENT` while the control loads; temporary custom rules hide the probe and execute the bundled set-constant scriptlet. Putting Shields down through the native TV panel reverses all three; putting Shields up restores them. After allowing upstream asynchronous preference persistence and restarting, protection works from the generated, bundle-versioned DAT caches. An immediate force-stop following a site toggle lost the last change; do not claim abrupt-kill durability.

Component delivery remains unavailable: catalog/resource components reported version 0.0.0.0/update errors and empty directories; the configured unauthenticated updater request returned 403. The bundled fallback fixes missing initial data, not update-service access. Signed downloaded data still takes precedence in source. Bundles refresh with APK updates; live component replacement, independent filter updates and locale-list delivery remain unverified.

The native Content Filters screen now lists cookie notices and mobile prompts. The request-specific, fresh-document probe verifies cookie blocking enabled and its removal when disabled. Re-enabling fails on `362d9e85e`: UI switch on, persisted preference false, cookie request still loaded. The original adapter captured the initial boolean in its listener. Source `c7bde129e` reads the current checked state; its build and repeat-cycle acceptance are in progress. The diagnostic itself was corrected after review to await a new loader/load event and match exact request IDs/URLs, rather than accepting stale page state or unrelated failures. No YouTube fix is claimed from these local results.


Source `c7bde129e` passed the blocking cached build in 4m34s (wrapper 4m37s). Its preserved APK is `~/.cache/brave-tv/artifacts/tv-filter-toggle-c7bde129e-x64-debug-20261009/BraveMonox64.apk`, 856,933,147 bytes, SHA-256 `481071f286a5570be7fa144be428fd85b5baa98c99f9aab6ec9f8937f2d28387`; signature verification and update installation passed. The corrected request-specific probe passes cookie-list off → on → off → on without rebinding the settings screen. The preference is saved as enabled, and cookie blocking passes after Home/persistence/relaunch. General ad blocking remains active throughout. The temporary custom filters were removed through native settings afterward and the original Google TV keyboard restored.

YouTube sample on the bundled build: the signed-out mobile site played `aqz-KE-bpKQ` (Big Buck Bunny) at 640×360 with readyState 4 and no media error. Ten diagnostic samples over 45 seconds show advancing content time and no `.ad-showing` state or visible ad text. Android media play/pause was observed to pause playback. This short single-video sample does not reproduce the user's pre/midroll symptom or establish universal ad blocking, seeking/fullscreen usability, higher-resolution decoding, or sustained performance. Page-control accessibility hit targets were unreliable in this sample; use the actual remote pointer for further playback UI acceptance.


## Native bookmarks: 9 October 2026

Source `40b075224` passed the blocking x64 build in 8m14s, with observed cgroup peak 14,159,020,032 bytes (13.19 GiB). Artifact: `~/.cache/brave-tv/artifacts/tv-bookmarks-40b075224-x64-debug-20261009/BraveMonox64.apk`, 856,927,411 bytes, SHA-256 `7b4ec7d544dd1d815394ab4022a8486f6c8b187f20b78dcce692c3f0f67704ef`. Signature verification and profile-preserving update installation passed.

The D-pad-only bookmark workflow adds the dedicated fixture to Mobile bookmarks, opens its action panel, cancels removal with Cancel initially focused, opens the saved URL from a different normal tab, and finds the bookmark after Home/persistence/relaunch. The existing bookmark JSON independently contains exactly that saved fixture. Confirming removal returns to an empty Mobile bookmarks folder; Back returns to the root and then browser controls. The test profile's folder was empty before testing; no pre-existing bookmark was removed. A second, fresh fixture tab passes all 38 steps of `tests/device/tv-bookmarks.ad` in 6.3s, including creation and cleanup. Its initial version failed solely because the replay parser does not accept shell single-quote syntax; escaped double quotes fix that parser failure.

Native-panel replay also passes all 16 steps on `c7bde129e`, and the non-alphabetic uinput fixture delivers exactly one click from a held OK with a visible cursor at 960,700. The native Google TV keyboard is restored. Bookmark pagination, managed-policy behavior, locked-private behavior and non-HTTP bookmark URLs remain unverified on-device. The first emulator is stopped with its disk/profile preserved before switching to onboarding testing; this avoids the observed concurrent-emulator ADB stall.

## Direct-home upgrade diagnostic (9 October 2026)

The isolated API 36 profile still had incomplete onboarding, P3A and metrics reporting enabled, Web Discovery disabled and search-default version 35. Updating to source `32c6f8d4b` with `adb install -r` succeeds without clearing data. Two launches abort with `referrals_service_delegate.cc:57`: `!profile_manager_observation_.IsObserving()`. The existing `tv-home.ad` replay fails at step 2 (initial address focus); the TV launcher is visible after the abort. Log: `~/.cache/brave-tv/logs/simple-home-runtime-20261009.logcat`; selected pre-update preferences are preserved in `simple-home-before-prefs.json`.

The failure occurs before home acceptance. Do not infer Google default, reporting migration, attribution, keyboard or Shields success from this build. The Android referral-factory correction must pass the same launch/replay before continuing those checks.


## Direct-home upgrade acceptance (9 October 2026)

Source `4be36e7dc` passes the cached blocking x64 build in 3m36s and signature verification. The APK updates the preserved `brave_tv_onboarding_api36` profile without clearing it. `tv-home.ad` passes all 13 steps; `tv-panel.ad` passes all 16 steps on a loaded webpage. The referral abort is absent from these launches. The initial home address button is focused automatically; controls and attribution actions are reachable by D-pad.

The corrected provider list passes Brave → Google → DuckDuckGo → Google focus checks. Selecting Brave for normal tabs survives Home/relaunch. Selecting Google independently for private tabs leaves normal tabs set to Brave; normal tabs are restored to Google afterward. Native Google TV keyboard D-pad/OK enters `q`, activates Go and loads Google search results. Back dismisses the keyboard, and the next Back opens private browser controls. The private native home labels the session and explains its history/privacy limits. These checks do not establish fresh-profile defaults or private-tab persistence across process death.

The license action loads `chrome://credits/` with 1,058 generated notices and no `generate_about_credits` placeholder. The home source action loads `https://github.com/smolcars/brave-tv` successfully. Existing search-default version 35 is preserved. The persisted P3A, user-experience metrics, stats reporting and Web Discovery preferences are all false after testing. This verifies migration and UI behavior, not a complete traffic audit.

Artifact: `~/.cache/brave-tv/artifacts/tv-simple-home-4be36e7dc-x64-debug-20261009/BraveMonox64.apk`, 853,107,409 bytes, SHA-256 `d64b305faddaf6fb8d47417d117577f54da184959d5897577bb94b4935fbe43c`. Provenance, GN args and signature results are alongside it; build log prefix is `build-simple-browser-x64-20261009-r11`. All evidence is from the API 36 x64 emulator, not the Chromecast.

Three relaunch samples on `4be36e7dc` reached focused native-home controls in 3,722 / 2,453 / 2,129 ms through the device tool (median 2,453 ms). After a 10-second settle, browser-process PSS was 296,443 / 304,729 / 302,458 KiB (289.5–297.6 MiB), RSS 519,632 / 528,824 / 526,368 KiB. These are tool-inclusive emulator timings and browser-process memory, not whole-browser or physical-device budgets. The earlier onboarding measurements use a different workload and are not a controlled before/after speed comparison. External evidence: `native-home-perf-4be36e7dc.jsonl`, `onboarding-native-home-4be36e7dc-mem-*.txt` and `native-home-4be36e7dc.png` under the logs directory.


## Redesigned native home on a fresh profile (9 October 2026)

Source `1a976a373` passes the cached x64 build with blocking lint/Error Prone in 7m22.96s (961 executed steps), four workers and the established 18/22 GiB limits. Observed peak: 16,295,301,120 bytes (15.18 GiB). Signature verification passes. Artifact: `~/.cache/brave-tv/artifacts/tv-home-design-1a976a373-x64-debug-20261009/BraveMonox64.apk`, 853,104,290 bytes, SHA-256 `2185165cff65dd0447a37e2e9219c7ac7b514bdae3e308aeec702f68107aa8c4`; GN args, signature and provenance are preserved alongside it. Build log prefix: `build-simple-browser-x64-20261009-r12`.

The never-installed `brave_tv_clean_api36` profile launches directly to native home without onboarding. Google is selected for both normal and newly created private tabs; the new search-default version is 36. Persisted P3A, user-experience metrics and stats-reporting preferences are false. Web Discovery is compiled out; its absent fresh-profile preference is not described as an explicitly persisted false value.

The redesigned home passes its 20-step D-pad replay, including initial focus, horizontal cards, vertical links and controls entry. The toolbar menu now activates with D-pad center and passes its 12-step replay. The replay's approach moves through the new controls card; its menu-focus/Select/panel assertion is unchanged from the failing case. The normal home is visually inspected at 1920×1080: heading, action labels, attribution and footer fit without clipping, and only the selected card has the bright fill. Screenshots: `home-design-fresh-1a976a373.png` and `home-design-final-1a976a373.png` under the external logs directory. Private-home labels and four-direction focus checks pass, but its screenshot is black because Android's secure-window protection remains enabled; private visual acceptance is not claimed.

On this APK the 16-step panel replay passes. Fresh-profile Shields blocks the exact ad and cookie-list fixture requests with `ERR_BLOCKED_BY_CLIENT` while the control loads. Native Shields down allows them; up blocks them again. This does not repeat the separate cosmetic/scriptlet custom-filter test or establish YouTube coverage. The non-alphabetic uinput test delivers exactly one click after held OK, and the pixel check confirms the cursor at 960,700. The precise-input test focuses the narrow field, opens the native TV keyboard and receives `Q` from D-pad Select; Back dismisses the keyboard and then returns to controls. The sampled log contains no matching browser fatal exception, fatal signal or ANR. Logs: `home-design-fresh-20261009.logcat` and `home-design-cursor-1a976a373.png`.

All fourteen project tests, strict checks through `nix flake check`, and the four native-page JVM verification paths pass. The existing upgrade-test AVD remains preserved and stopped. Full traffic auditing, broader site/video acceptance and Chromecast validation remain open.


## Collector shutdown with the redesigned home (9 October 2026)

Source `cca46e564` passes the cached x64 build with blocking lint/Error Prone in 4m58.73s (63 executed steps). Observed cgroup peak is 19,334,283,264 bytes (18.01 GiB), below the 22 GiB cap. Signature verification and `adb install -r` succeed on the preserved `brave_tv_clean_api36` profile. Artifact: `~/.cache/brave-tv/artifacts/tv-collector-shutdown-cca46e564-x64-debug-20261009/BraveMonox64.apk`, 852,947,082 bytes, SHA-256 `5deb87191f60f72b52f71620fc3284e67cb61679aaf3601fa4a74a6eb346e852`; provenance, GN args and signature output are alongside it. Log prefix: `build-simple-browser-x64-20261009-r13`.

Before updating, the real `Brave.Search.DefaultEngine.4` native histogram exists and disabled-mode assertion fails. After updating/relaunching, the same probe passes with `present:false`. Native D-pad changes normal search Google → Brave → Google, and a second native histogram request still returns no sample. This verifies that particular local collector, not all Chromium metrics or outgoing traffic. Android process/profile/search collectors are excluded at their factories; broader analytics and promotional-service auditing remains open.

The final APK passes the 20-step home, 12-step toolbar-menu and 16-step browser-panel replays. A first home replay was started immediately after navigation and restored the earlier diagnostic page; after waiting for the actual home heading, the replay passes. The Shields probe initially times out on a background restored tab; activating its fixture tab makes the same cookie-on probe pass: ad/cookie requests fail with `ERR_BLOCKED_BY_CLIENT`, while the control loads. Neither failed setup attempt is counted as acceptance.

Final native screenshot `~/.cache/brave-tv/logs/home-design-final-cca46e564.png` is visually inspected at 1920×1080: all labels fit, attribution remains visible and the selected search card has a distinct bright fill. A separate new-tab action briefly left controls over the destination and missed the home-heading wait; reopening the activity shows the correct native home. Reproduce and refine that transition before accepting all tab flows. The native Google TV keyboard is restored. No physical-TV run or complete traffic audit is claimed.


## New-tab handoff and neutral toolbar (9 October 2026)

On source `cca46e564`, `tv-new-tab.ad` fails twice at step 12: after New tab the controls panel covers the destination, so the home heading is absent. `tv-private-new-tab.ad` fails equivalently at step 16, waiting for the private-session notice. Both follow the real remote path and do not reopen the activity after New tab. Source `82b9b507c` removes the explicit reopening of controls after tab creation.

Combined source `11353a858` passes the cached build with blocking Android analysis in 7m36.82s (wrapper 7m40.31s, 972 executed steps), with observed peak 14,172,385,280 bytes (13.20 GiB). Its signature verifies and it installs as a profile-preserving update. APK: `~/.cache/brave-tv/artifacts/tv-toolbar-11353a858-x64-debug-20261009/BraveMonox64.apk`, 852,966,399 bytes, SHA-256 `073e5137a32dc429e66972d95d004b28b95a889a6c6d2fccfc39e3b0ce7a3dd8`. Build log prefix: `build-simple-browser-x64-20261009-r14`; provenance and GN args accompany the artifact.

On that APK, normal New tab passes all 13 steps and private New tab all 17. Closing the empty private test tab by D-pad returns to normal home with search focused. Normal home passes 20 steps, the menu replay passes 11 with the disabled home protection icon correctly skipped, and the browser panel passes 16. Existing web fixture tabs remain available. The toolbar protection icon opens the native TV panel by a device-tool reference tap; D-pad Select toggles protection off/on. The cookie-on → down → cookie-on request-specific probe passes, with ad/cookie requests blocked only when protection is on and the control always loading. This is not a D-pad-only toolbar-protection entry claim.

The home screenshot shows the neutral shield and disabled native-page state, but focused tabs/menu show double outlines: Chromium's existing circular ring plus the added rounded rectangle. These screenshots (`toolbar-home-11353a858.png`, `toolbar-focus-11353a858.png`, `toolbar-tab-focus-11353a858.png` under external logs) diagnose the visual defect. Source `942dca26f` removes only the extra foregrounds; its final screenshot verification is pending. The sampled `toolbar-11353a858-20261009.logcat` contains no matching browser fatal exception, fatal signal or ANR. Native Google TV IME is restored. Fourteen project tests, strict Nix checks and the native-page JVM checks pass.


Final toolbar artifact `942dca26f` passes the cached blocking build in 3m33.18s (wrapper 3m36.56s, 16 executed steps). Observed cgroup peak: 15,540,535,296 bytes (14.47 GiB), below the 22 GiB cap. Signature verification and profile-preserving update installation pass. APK: `~/.cache/brave-tv/artifacts/tv-toolbar-942dca26f-x64-debug-20261009/BraveMonox64.apk`, 852,950,251 bytes, SHA-256 `995375f1cf1460d65c7154c05fddfac6c0023a81bdf4958cd52bfd7cde843e0d`. Log prefix: `build-simple-browser-x64-20261009-r15`.

On this final APK, normal new-tab (13 steps), private new-tab (17) and toolbar-menu (11) replays pass. Closing the private test tab returns to normal home with search focused. Both final focus screenshots, `toolbar-focus-942dca26f.png` and `toolbar-tab-focus-942dca26f.png`, are inspected: only one native circular focus ring remains, and the neutral shield is dimmed on home. `toolbar-home-942dca26f.png` records the final home with search focused. Strict Nix checks pass for the final source. Earlier protection and panel checks above apply to the immediately preceding APK; the final source delta only removes the added foregrounds. Hardware, complete rebranding, native toolbar tab-list entry, broader tab restoration and traffic auditing remain open.

### Native toolbar tabs diagnostic (10 October 2026 UTC)

Source `ef6cabbb4` builds with blocking analysis in 3m40.86s (55 steps), observed
peak 14,822,092,800 bytes (13.80 GiB). Preserved artifact:
`~/.cache/brave-tv/artifacts/tv-tabs-ef6cabbb4-x64-debug-20261010/BraveMonox64.apk`,
852,965,955 bytes, SHA-256
`7ba7d25154f7219f6403509310ce39158ce15aced2b987bfa721577e4c102124`.
Signature verification and profile-preserving emulator update pass. The initial
10-step toolbar-tabs replay passes native-list entry. Spec review found that
reselecting the active home leaves toolbar focus; the extended 16-step replay
reproduces failure on its final search-focus assertion. This is diagnostic
acceptance only, pending the correction and full tab flows.

### Native history and selected-home focus (10 October 2026 UTC)

Source `cad19c086` passes the blocking cached build in 7m36.97s (962 steps),
observed peak 15,106,527,232 bytes (14.07 GiB). Artifact:
`~/.cache/brave-tv/artifacts/tv-history-cad19c086-x64-debug-20261010/BraveMonox64.apk`,
852,976,864 bytes, SHA-256
`f7ee964b6f72a657892132a4a13fd62bf00ed16a40db73f4fb6cf11baf654fb8`.
Signature and profile-preserving update pass. The previously failing 16-step
`tv-toolbar-tabs.ad` now passes, including current-home search focus.

History loads the preserved profile's real visits. A dedicated long-query
fixture opens through the native detail panel; Cancel starts focused and returns
without deleting. Confirmed removal refreshes after native completion, and the
fixture stays absent on closing/reopening history. The screenshot
`~/.cache/brave-tv/logs/history-confirm-cad19c086.png` visibly shows title, date
and site despite the long URL. Six disposable pagination visits bring the list
to nine entries: More visits reaches the ninth, and Previous visits returns.
This exercises UI paging within a query batch, not native continuation beyond
the bridge's batch limit.

Runtime found that unkeyed history rows matched the panel's zero preferred-action
sentinel and initially focused the last row. Source `7759740ca` corrects this;
rebuild/runtime acceptance remains pending. Privacy/home-bookmark source
`85e02d812` is building separately. Android user 10, named `TV privacy checks`,
was created for isolated destructive checks; owner user 0 remains intact and
active. The loopback privacy fixture passes HTTP header/counter smoke checks;
browser clearing acceptance is still pending.

### Native privacy and home bookmarks (10 October 2026 UTC)

Source `85e02d812` builds with blocking analysis in 7m29.59s (963 steps),
observed peak 15,020,863,488 bytes (13.99 GiB). Artifact:
`~/.cache/brave-tv/artifacts/tv-privacy-home-85e02d812-x64-debug-20261010/BraveMonox64.apk`,
852,990,668 bytes, SHA-256
`3bbad5c61d64c2727021f72d4e48f26085e357170540954ee3ee761e965b2f45`.
Signature/update pass. Home (20 steps) and direct bookmarks (10 steps) pass.
Screenshot `home-bookmarks-85e02d812.png` reveals a baseline offset in the
wrapped controls card; `872f16da5` fixes the row alignment, pending screenshot.

The default-focus correction `7759740ca` builds in 3m30.07s (16 steps), with
blocking analysis. Its artifact is
`~/.cache/brave-tv/artifacts/tv-panel-focus-7759740ca-x64-debug-20261010/BraveMonox64.apk`,
852,990,660 bytes, SHA-256
`e538c96a4950d05365233fb84a7e64ed371c6690f700c84bca7a6e652a622d25`.
Signature/update pass. Cgroup memory peak was not captured for this run.

Privacy checks run on this APK exclusively in newly created Android user 10,
with disposable local history/storage/cache and a bookmark. Normal owner user 0
was not cleared. Setup uses fixture/CDP diagnostics; all native confirmation and
settings actions use D-pad. Each destructive confirmation starts on Cancel.
Cancel leaves its target data present. Confirmed history deletion yields the
native empty-history state, while the cookie, localStorage, cached response and
bookmark remain. Confirmed site-data deletion removes cookie/localStorage while
the cached response remains `Network fetch 3`. Confirmed cache deletion changes
the next response to `Network fetch 4`; Cancel previously kept it at 3. Reload
still sees empty site storage and cached response 4. The bookmark remains after
all three operations. Completion messages appear only after the native callbacks.
Private controls show History disabled, and private Settings excludes clearing.
The private test tab was closed. The sampled 2,000-line log contains no matched
fatal exception, fatal signal, failed CHECK or ANR marker; this is not a sustained
run. Delayed completion with exit/reopen and policy-managed clearing remain open.

Tab paging reached the second page of a 15-tab fixture set. Selecting the current
home there restored search focus. After Home and process relaunch, all nine loaded
fixture tabs were retained alongside an active home; five unused blank homes were
removed. Chromium's `TabPersistenceUtils.shouldSkipTab` intentionally excludes
ungrouped, unpinned native new-tab pages. Only tabs created for these checks were
closed afterward, restoring the two original web fixtures plus a fresh home.


Alignment source `872f16da5` passes blocking build in 3m38.69s (16 steps),
observed peak 15,328,387,072 bytes (14.28 GiB). Artifact:
`~/.cache/brave-tv/artifacts/tv-home-alignment-872f16da5-x64-debug-20261010/BraveMonox64.apk`,
852,990,624 bytes, SHA-256
`7a4a6198396564801c5ef9502f994ee6594192c74bf1b3faa81a9c5a1fc5b1a1`.
Signature/update pass; home (20), home bookmarks (10) and toolbar tabs (16)
replays all pass. `home-aligned-872f16da5.png` shows all three cards aligned,
with the controls label readable on two lines. On owner user 0's multi-entry
history, the first row now receives initial focus. Home/app return while the
history panel is open dismisses it and restores the previous home-card focus
without reopening history. User 10 is stopped and preserved; owner user 0 is
active. Synthetic delayed callbacks remain untested.

## Native content filters (10 October 2026 UTC)

Source `b289ae6db` passes the cached blocking x64 build in 7m32.56s
(962 Siso steps); observed cgroup peak is 15,248,793,600 bytes. Preserved APK:
`~/.cache/brave-tv/artifacts/tv-filters-b289ae6db-x64-debug-20261010/BraveMonox64.apk`,
853,005,218 bytes, SHA-256
`248be96be42daaaa8a2d4499fc6bde3dac30913e796e01f8346d8ee37d2859ce`.
Signature verification and the profile-preserving update pass on emulator-5558.

The original replay fails on the old APK at the cookie-list assertion. Its
first new-build run also fails because Down is sent before Settings acquires
focus. Root `e8d9705` synchronizes those transitions and fixes the localized
Content Filters capitalization; all 20 steps then pass. Both toggles retain
cookie-row focus, and Back restores Content Filters focus in Settings.

Request-specific probes on normal `shields.html` pass: cookie-list on blocks
`/1_cookie.js` with `ERR_BLOCKED_BY_CLIENT`; off permits that exact request;
Home, persistence time and process relaunch retain off. A new private tab's
native filter panel also shows off. Enabling there and closing only that test
private tab restores blocking in the normal tab. The ordinary ad fixture stays
blocked and the control script loads throughout. These probes do not require
temporary custom cosmetic/scriptlet rules and do not establish YouTube results.
The original enabled preference is restored. Private Settings still omits
Clear browsing data. More/Previous lists are disabled for the two-entry bundled
catalog; larger-catalog paging and connection failures are not runtime-tested.

Signed component delivery remains unresolved; this panel is not an update
service. Bundled list data still refreshes with browser builds.


## Neutral launcher artwork (10 October 2026 UTC)

Source `33e4873c7` passes the cached blocking x64 build in 1m44.33s (50 Siso
steps). Observed peak: 13,722,005,504 bytes. Preserved APK:
`~/.cache/brave-tv/artifacts/tv-launcher-33e4873c7-x64-debug-20261010/BraveMonox64.apk`,
853,005,216 bytes, SHA-256
`55b57bf933130ae680ec7ba1dacabcf5abaa730917cf0c6f3f93d70a4c23c23a`.
Signature and profile-preserving installation pass. The restored cookie-list
on state still blocks its exact request after update/restart.

`launcher-33e4873c7.png` and `launcher-favorite-33e4873c7.png` in the external
logs directory were visually inspected at 1920×1080. The new navy/mint screen
and cursor render in Android TV's app picker and favorites row without the
BT monogram. D-pad selection launches the browser and restores its fixture tab.
The existing temporary label and application identity remain; this is not a
production branding/signing decision.


## Bounded background traffic sample (10 October 2026 UTC)

Installed source `33e4873c7`, owner emulator profile: Android's existing debug
command-line mechanism enabled default-redaction NetLog for one process. The
flag file and debug-app setting were initially absent/unset; both were restored
and the browser relaunched afterward. Raw logs remain outside Git at
`~/.cache/brave-tv/logs/netlog-{startup,navigation-search}-33e4873c7.json`.
The capture was copied while live; the parser reads complete events and ignores
an unfinished tail, so this is a bounded sample rather than an exhaustive trace.

The final capture contains 21,393 complete events over 130.016 seconds. Startup
shows 15 request starts to `go-updater.brave.com/extensions`, all HTTP 403, plus
the local fixture. After idle native home, address-bar navigation to example.com
and the disposable Google query “android tv browser test,” the cumulative
request starts are: updater 16, loopback 3, example.com 3, www.google.com 35,
fonts.gstatic.com 2, www.gstatic.com 10, and ogads-pa.clients6.google.com 2.
The latter requests identify `https://www.google.com` as their initiator. The
updater identifies no web origin; all 16 updater responses are HTTP 403.
The example page loaded securely; an obsolete “Example Domain” heading wait
failed because the served page text has changed. Google displays the entered
query. Address text was injected through ADB for this traffic diagnostic, not
claimed as physical-remote typing acceptance.

No Brave reporting host appears in this window. This does not establish absence
of delayed reporting, all local metrics or all promotional services. Source
inspection confirms TV startup skips the existing promotional initialization
block and the retention receiver already rejects TV. A separate Rewards
onboarding notification entry remains reachable in source; the planned
`8164e10cd` correction is awaiting build/runtime verification. Component service
authorization and independent update delivery remain unresolved.

## Notification suppression and video observations (10 October UTC)

Source `8164e10cd` builds with blocking analysis in 4m43.51s (Siso 4m40.02s),
using four workers and the existing 18/22 GiB limits. Observed cgroup peak:
14,294,921,216 bytes. Preserved artifact:
`~/.cache/brave-tv/artifacts/tv-notifications-8164e10cd-x64-debug-20261010/BraveMonox64.apk`,
853,005,148 bytes, SHA-256
`0c0584fd5d4fbd5f1f5eeaef3f43959d8356a2fbb6b5048b7fc68e6b735ff9c3`.
Signature verification and profile-preserving install pass. Startup reaches
browser controls and resumes the YouTube tab; the crash buffer is empty and
the notification dump contains no active browser/Rewards onboarding notification.
This is not an injected legacy-notification cancellation test.

On source `33e4873c7`, the official Blender Big Buck Bunny YouTube page
(`https://m.youtube.com/watch?v=aqz-KE-bpKQ`) plays 640×360 video, duration
634.601 seconds, readyState 4, without a media error. The non-alphabetic uinput
remote enters fullscreen through the site's visible control; Back exits it
and playback continues. Screenshot `youtube-fullscreen-pass-33e4873c7.png` in
the external logs directory confirms fullscreen. The browser cursor and hint
remain visible over video, a polish issue to address. Tapping the mobile
timeline does not seek, motivating the native playback panel.

Sampled DOM states through approximately 233 seconds of content show no
`.ad-showing`; this neither reproduces the user's pre/midroll symptom nor proves
universal YouTube ad blocking. The page was not signed in. On the succeeding
notification build, the read-only media probe reports actual playback at
182.815 seconds, readyState 4, no error, 5,489 total frames and 112 dropped.
This emulator sample is not hardware decoding or sustained-performance acceptance.

First playback implementation `07c33b653` fails Java header compilation because
the pinned Chromium uses the `TabObserver` interface rather than
`EmptyTabObserver`. The corrected build `9ece2a633` is pending verification.

The local `dialogs.html` fixture on `8164e10cd` demonstrates a native-modal
focus failure: D-pad keys leave `compositor_view_holder` focused while alert,
confirmation, prompt and location-permission dialogs remain visible. Corrected
non-alphabetic uinput events reproduce the confirmation failure. An earlier
diagnostic command contained malformed event arrays and is excluded as evidence.
Back closes the alert, returns `false` from confirmation and `null` from prompt;
it also dismisses location permission without granting it. The permission
screenshot `dialog-focus-fail-8164e10cd.png` is preserved in external logs.
The fixture is touch/agent-ref initiated; remote interaction under test is the
native dialog. Source `9d78aa3e4` is the planned focus correction, awaiting build.

## Native playback diagnostic (10 October UTC)

Source `9ece2a633` builds with blocking analysis in 7m50.95s (Siso 7m46.39s,
708 steps), with an observed cgroup peak of 13,674,426,368 bytes. Artifact:
`~/.cache/brave-tv/artifacts/tv-playback-9ece2a633-x64-debug-20261010/BraveMonox64.apk`,
852,999,534 bytes, SHA-256
`0ea4d92df80fc784b9565c954400fbd469f9d30b7bd402edc0be251870b36b28`.
Signature verification and profile-preserving install pass. This is a diagnostic
artifact with a known no-media crash, not an accepted candidate.

Opening Playback on the session-less local dialog page crashes twice with
`MediaSession.isControllable()` on null. `tv-playback-empty.ad` fails at step 9
waiting for the panel's Browser controls footer. Native JNI returns
`MediaSessionImpl::GetIfExists`, despite the Java non-null annotation. The
nullable-session correction is `57002766b`, pending the next runtime run.

With the existing YouTube tab selected, muted autoplay has a noncontrollable
session and all playback actions are disabled. Unmuting on the page makes the
native controls usable. D-pad Select pauses at 52.532832s, changes the focused
button to Play, and leaves the panel open. Seek forward advances to 57.532832s;
Seek backward restores 52.532832s, verified by read-only page assertions.
The initial +10s expectation fails: this site's handler uses five seconds,
confirming why the button wording must not promise ten. Resume changes the
focused button to Pause and media time progresses to 60.338453s. Screenshot
`playback-9ece2a633.png` was visually checked. Back restores Playback focus.
A diagnostic navigation in the same tab/WebContents to the local dialog page
closes the old playback panel and exposes the new page.

The dialog-focus build at `9d78aa3e4` fails Java compilation because
`View.addFocusables` requires `ArrayList<View>`, not its `List<View>` interface.
Source `77e234039` fixes that declaration and includes the no-media correction.
The cached retry is in progress; neither failure is counted as accepted.

## No-media and native dialog checks (10 October UTC)

Source `77e234039` passes blocking analysis in 4m19.12s (Siso 4m16.01s,
16 steps). Observed cgroup peak: 13,143,293,952 bytes. Artifact:
`~/.cache/brave-tv/artifacts/tv-media-dialogs-77e234039-x64-debug-20261010/BraveMonox64.apk`,
852,997,842 bytes, SHA-256
`a7c8a21db1649cea27ec0ac687cb07ba75ae8eae86c1b10f64aa76db3ab84e09`.
Signature and profile-preserving update pass. The formerly crashing no-media
replay now passes all 11 steps; Play and both seek buttons are disabled, with
Browser controls focused, and Back restores Playback focus.

The native alert replay fails on `9ece2a633` at initial OK focus. On `77e234039`
it passes that focus and dismissal check but fails the final Back-to-controls
assertion by exiting to the launcher. Source `681e99ced` corrects return focus,
including queued-dialog and separate-window guards; its build is pending.

On `77e234039`, confirmations initially focus Cancel. Select returns false;
Right → OK → Select returns true. Prompts focus their editor; after restoring
the real TV IME from the automation helper, D-pad Select opens the keyboard,
Select types `q`, Back hides the keyboard, and Down → Right → Select submits
`Sampleq`. Location permission initially focuses Block; Select denies it, and
the page Permissions API confirms `denied`. The fixture's earlier timeout result
is not used as evidence of refusal. No coordinates were collected. The screenshot
`dialog-block-focus-77e234039.png` shows a visible but subdued native focus fill;
stronger TV focus contrast remains polish work.

## Dialog return and idle cursor (10 October UTC)

Source `681e99ced` passes blocking analysis in 3m34.84s (Siso 3m31.28s),
observed cgroup peak 14,530,093,056 bytes. Preserved artifact:
`~/.cache/brave-tv/artifacts/tv-modal-return-681e99ced-x64-debug-20261010/BraveMonox64.apk`,
852,997,246 bytes, SHA-256
`e3fc5be47d91ace48d7bec4283a015221536e31a21207f61e5e8db206d45d679`.
Signature verification and profile-preserving update pass. The native alert
replay now passes all five steps, including Back to browser controls.

The preceding `77e234039` cursor remains visible after four idle seconds;
`cursor-idle-fail-77e234039.png` fails the absent-cursor pixel assertion.
On `681e99ced`, the initial two-held-press replay produces `Clicks: 2`, failing
the expected one. Review then strengthens that replay by separating the
wake-only assertion from the visible held-click assertion.

Source `c1f0762ed` passes blocking analysis in 3m35.34s (Siso 3m32.36s,
16 steps), observed cgroup peak 15,236,648,960 bytes. Preserved artifact:
`~/.cache/brave-tv/artifacts/tv-idle-cursor-c1f0762ed-x64-debug-20261010/BraveMonox64.apk`,
852,996,574 bytes, SHA-256
`8548e7d4be717737a4ca7c32f85ae74dc34730aafe0c5885b994baa6459cc5dd`.
Signature verification and profile-preserving update pass. On the actual
non-alphabetic uinput remote, `dpad-idle-wake.jsonl` leaves `Clicks: 0` and the
separate `dpad-held-click.jsonl` produces `Clicks: 1`. The idle screenshot
`cursor-idle-pass-c1f0762ed.png` passes absence at 960,700. Further fullscreen
and lifecycle checks remain separate from these local input results.

The visible cursor pixel check also passes during a five-second held OK on
`c1f0762ed`; release increments the existing count from one to two exactly once.
The 16-step native browser-panel replay passes. A loopback connection failure
and a self-signed TLS fixture display their upstream error/warning pages, and
Back opens browser controls from each. On the certificate warning, the real
uinput pointer activates Back to safety and returns to the native home. The
certificate was never accepted or added to trust storage. Diagnostic TLS keys
and screenshots stay outside Git.

The local Chromium bear clip plays at 1280×720 with audio, readyState 4 and no
media error. Real uinput movement/clicks activate Play, captions and Fullscreen.
`media-fullscreen-idle-c1f0762ed.png` visibly shows captions with no cursor/hint;
the absent-cursor pixel check passes. Back exits fullscreen while playback
continues, confirmed by the read-only media probe. Native Playback correctly
leaves controls disabled for this 2.747-second transient clip. Chromium's
five-second persistent-content threshold explains the result; the fixture now
uses an existing 24-second clip for the independent native-panel checks.

## Strong native dialog focus (10 October UTC)

Source `360b81ac7` passes blocking analysis in 3m44.71s (Siso 3m41.28s,
16 steps), observed cgroup peak 14,669,373,440 bytes. Preserved artifact:
`~/.cache/brave-tv/artifacts/tv-dialog-outline-360b81ac7-x64-debug-20261010/BraveMonox64.apk`,
852,996,186 bytes, SHA-256
`1e4266358dfe4018efc788da57747aeeb90319c73e2896f04fe6d11861f202a8`.
Signature verification and profile-preserving install pass. Confirmation starts
on Cancel; Right moves the bright outline to OK and removes it from Cancel,
and Select returns true. Prompt starts in the editor, Down reaches Cancel and
Select returns `Prompt canceled`. The five-step alert replay passes again.
Screenshots `dialog-cancel-outline-360b81ac7.png` and
`dialog-ok-outline-360b81ac7.png` were visually compared with the earlier subdued
fill. Location refusal and remaining media/lifecycle checks follow separately.

On `360b81ac7`, a separate localhost permission origin initially focuses Block
with the new bright outline. D-pad Select refuses location; the Permissions API
returns `denied`. Screenshot `permission-block-outline-360b81ac7.png` was visually
checked. Existing origin permissions were not reset.

The longer MP4 initially reports a growing duration and seekable [0,0] through
Python's plain HTTP server. Native Play/Pause works but seeks are disabled;
an early directional/seek attempt therefore toggles Play instead and fails the
page-state assertion. The byte-range server's real HTTP checks pass, and after
relaunch the same browser reports duration 24.109333 and seekable [0,24.109333].
Both native seek buttons become enabled. With focus asserted before each action,
Pause → repeated Seek backward reaches 0, Seek forward reaches exactly 10,
Seek backward returns to 0, and Play resumes at 0.128108. The read-only probe
confirms each state with readyState 4 and no media error. No product seek policy
was changed for this fixture correction.

Home while Playback is open closes that panel; ordinary app reopen exposes the
page and Back restores browser controls with Playback selected. Playback is
still active on immediate return (an exploratory paused-state assertion fails;
pause-on-Home was not the specified behavior). Explicit native Pause works,
and switching to the preserved Shields tab leaves the old media paused.

Aggressive protection mode persists after Home and a process restart on the
Shields fixture. Switching back to Standard crashes twice on `360b81ac7`;
`tv-shields-standard.ad` fails at step 14 and the captured native abort names
`SetAdControlType` receiving `ControlType::DEFAULT`. Source `d88cef8a9` corrects
the shared Java conversion; cached build and replay are pending. Standard-mode
persistence must not yet be marked accepted.

The 14 project tests and strict mypy pass. Plain `nix flake check` fails because
Nix 2.25.3 omits the source submodule. The documented explicit Git flake URL with
`?submodules=1` passes both flake checks without upgrading Nix or duplicating
source. This validates project tooling, not the pending Android mode correction.

## Standard protection crash regression (10 October UTC)

Source `d88cef8a9` passes the cached blocking x64 build in 3m33.51s
(wrapper 3m36.93s), observed cgroup peak 14,695,120,896 bytes. Preserved
artifact `tv-standard-shields-d88cef8a9-x64-debug-20261010/BraveMonox64.apk`
is 852,996,166 bytes, SHA-256
`c0a01cad00f63eb52bb2d7572da1ebd313a8331a01e62c0e3a9484707880c763`;
signature verification and profile-preserving install pass.

The 16-step `tv-shields-standard.ad` replay passes (5.3s), where the old
`360b81ac7` aborts at step 14. Native D-pad selection then changes Standard
to Aggressive and back to Standard without exiting the protection panel.
Restart persistence and actual request blocking are checked separately below.

The Standard-mode cookie-on request probe passes: the control script loads and
both `/showbanner.js` and `/1_cookie.js` fail specifically with
`ERR_BLOCKED_BY_CLIENT`. Temporary cosmetic/scriptlet rules remain removed.
Home followed by normal relaunch and the 12-step persistence check retains
Standard (disabled current action, Aggressive focused as the alternative).

## TV popup tab strip (10 October UTC)

Source `266425387` passes blocking x64 build in 1m31.37s (wrapper 1m34.84s),
observed peak 11,915,833,344 bytes. Artifact
`tv-tab-strip-266425387-x64-debug-20261010/BraveMonox64.apk` is
852,996,118 bytes, SHA-256
`ce4c6372c38a4a787aaf895eb30073eb89dc8b9e39abbef0bc5943d65fb79f0e`.
Signature verification and preserving update pass. The native tab list retains
all 11 tabs, including the popup child on its second page. Selecting that tab
and returning from the diagnostic history to its original bookmark page shows
no phone group strip. Before/after images are
`phone-group-strip-before-61d.png` (installed source 360b81ac7) and
`phone-group-strip-after-266425387.png` under the external logs directory.
Both were visually inspected. The 16-step native-panel replay passes after
relaunch (3.8s), including normal/private tab entry and Back focus restoration.
Group persistence itself is preserved by source review; no grouping prefs or
profile files were modified by the test.

## Android startup analytics shutdown (10 October UTC)

Source `2b20fbc7a` passes the cached blocking x64 build in 1m31.55s
(wrapper 1m35.07s), observed peak 18,369,216,512 bytes. Artifact
`tv-startup-metrics-2b20fbc7a-x64-debug-20261010/BraveMonox64.apk` is
852,996,118 bytes, SHA-256
`fe6ef7f41022f4cb24104bebcb8af4804b6beceef7988e1c14d079376ac5e6eb`.
Signature verification and profile-preserving update pass.

On source `d88cef8a9`, the foreground exact native
`Brave.Core.CrashReportsEnabled` probe passes `enabled` and fails `disabled`
with present=true. After the new build/restart it passes `disabled`,
present=false; its native histogram page is empty. The cookie-on request
probe still passes (control loaded, both ad/cookie requests specifically
blocked by client). Initial probes against discarded background pages timed
out; after installation the DevTools socket also appeared only after leaving
the initial panel and loading a page. Neither diagnostic failure was counted
as a product pass. No new browser crash appears in the crash buffer.

This establishes the bounded startup collector removal, not all analytics
call sites or reporting traffic. Promotional service audit remains open.

## Promotional AdsService shutdown (10 October UTC)

Source `57ebe9bbc` passes cached x64 blocking build in 32.13s, observed peak
17,205,739,520 bytes. Artifact
`tv-no-ads-service-57ebe9bbc-x64-debug-20261010/BraveMonox64.apk` is
852,996,118 bytes, SHA-256
`8f468f80db281cffdf1ef027d8e47aeffe08f3b299f9f5c907341dcb82e3561a`.
Signature and preserving install pass. Before the update, native
`chrome://ads-internals` shows Service Status Running; afterward its General
page no longer has the Service/Status section, consistent with the handler's
empty response for a missing service. This diagnostic doesn't replace the
remaining navigation/private/blocking checks.

The update also exposes a remaining Rewards signup modal above the browser
controls. Back dismisses it without enrollment. Screenshot
`ads-service-dialog-57ebe9bbc.png` was inspected and retained externally.
The shared Rewards support shutdown is the next planned correction. The
agent-device “React Native overlay” hint on ads-internals is a heuristic false
positive from the page's ordinary warning text; this browser is not React Native.

## Promotional services and native home follow-up (10 October UTC)

Source `3696a9154` passes blocking x64 build in 11m08.71s (wrapper
11m11.71s), observed peak 18,454,167,552 bytes. Artifact
`tv-no-promotional-services-3696a9154-x64-debug-20261010/BraveMonox64.apk`
is 852,996,334 bytes, SHA-256
`879820e13d6a454b2555703f77eaab51d33981a0ae245b660142303d2e9c4a66`.
Signature verification and preserving installation pass. The native panel replay
passes 16 steps in 4.3s; Settings shows Google selected, and Back restores its
focus. The cookie-on request probe passes with the control loaded and ad/cookie
requests blocked by client, without custom test rules enabled.

A private-new-tab replay first fails at step 6: Right/Select from home enters
the address field instead of browser controls. Immediate retry passes all
17 steps in 4.7s. Keep this intermittent focus failure open for reproduction.
The private panel disables History. Closing the owned private blank tab exposes
an inactive-tab auto-delete promotion over normal home, motivating the guard
below. The test did not dismiss it or set a retention decision. An accidental
normal-tab Close while navigating was immediately undone; all 12 tabs returned.

Source `68404c30c` passes blocking build in 44.86s (wrapper 48.48s).
Last observed memory peak was 9,354,117,120 bytes, not a captured final peak.
Artifact `tv-no-sponsored-home-68404c30c-x64-debug-20261010/BraveMonox64.apk`
is 852,799,726 bytes, SHA-256
`f401fe9eb5c4fbbcb839abff57866dab9f3e4d82e1f741e55d3549ee2afd5398`.
Signature and preserving install pass. The home replay passes 20 steps in 4.2s.
Google and Brave Search queries load. Direct old `chrome://new-tab-takeover`
navigation shows a blank WebView without the prior controller being registered;
no crash was observed, but error/Back acceptance was not completed.

Source `c8957a6c3` passes blocking build in 26.06s (wrapper 30.27s), with
18/22 GiB limits and four workers; no final memory peak was captured.
Artifact `tv-no-tab-promo-c8957a6c3-x64-debug-20261010/BraveMonox64.apk`
is 852,799,698 bytes, SHA-256
`d80c39c1f565fd472a39f3415c5eea9054fa4adca98f70402be7eb7df48e5ef1`.
Signature, preserving install, launch and ordinary-media playback probe pass.
The actual bytecode adapter regression fails on the old implementation and
passes with the guard (TV no initialization, phone initialization preserved,
missing upstream hook rejected). Full Nix checks pass after the diagnostic
variable-type correction. Android instrumentation/profile/menu tests are not
executed by these APK builds. Private-close-to-home runtime acceptance remains
pending while the uninterrupted playback run uses this APK.

## Bounded startup/search traffic sample (10 October UTC)

Source `68404c30c`: default-redaction NetLog records 62,764 complete events
across 160.096 seconds of startup, Google search and Brave Search. The temporary
command-line file and persistent debug-app setting were absent beforehand and
restored afterward. Raw logs remain outside Git in the private build logs:
`netlog-search-68404c30c-final.json`; summary is
`netlog-search-68404c30c-summary.json`.

All 12 `go-updater.brave.com` component requests receive HTTP 403. This supports
implementing a separately authenticated fork-owned filter feed. No separate
Brave reporting host appears in this bounded window. Brave Search initiates
nine `/api/feedback` requests and one `/api/chatllm/with_ask/run_tool` request
from its own origin; its website also shows its own usage-metrics notice.
Google-origin requests include its page services. These website requests are
not evidence of a browser collector; no website consent preference was changed.
The sample cannot establish absence of every delayed collector or service.

## Native independent-filter checks (10 October UTC)

The host-only focused test target builds with the cached Android output's
`clang_x64` toolchain, through Nix and the established four-worker, 18/22 GiB
cgroup. The initial GN invocations lacked the Python module path (the Nix shell
reinitializes it); exporting `PYTHONPATH=.../src/brave/script` inside the shell
fixes that. GN then caught duplicate host/Android runner output names, corrected
by generating this standalone runner only for the host. The normal Shields
unit-test source set retains the cases for Android.

Source `65ef6c4ea` focused build succeeds in 1m52.62s, with an observed
cgroup peak of 6,411,182,080 bytes. All seven native parser tests pass. Source
`485926bb1` adds real temporary-file storage cases; all ten pass. Source
`f3938b1c0` extends those checks through the actual resource/filter/version
loaders; all ten pass. Corrected source `8d52513b1` additionally checks legacy
DAT-prefix rejection; all ten pass before starting the blocking APK build.
Logs are `filter-verifier-host-r4*`, `filter-store-host-r1*`, and
`filter-provider-host-r1*`/`r2*` under the external logs directory. These checks
exercise real Chromium crypto, parsers and atomic file writes; they do not
establish Android runtime, network delivery or public-feed acceptance.

## Thirty-minute ordinary playback and promotion acceptance (10 October UTC)

Installed source `c8957a6c3`, 02:43:42–03:13:42 UTC: the local 24.109-second,
427×240 MP4 loops for 30 minutes. All 61 half-minute samples report complete
browser/renderer/GPU/zygote PSS and successful playing/ready/no-media-error state.
Whole-process PSS starts at 746.72 MiB, ranges 684.73–747.54 MiB, and ends at
693.57 MiB. Video frame count rises from 580 to 53,637; cumulative dropped
frames rise from 1 to 3. No new crash-buffer record appears during the window,
and activity manager reports no ANR since boot. Logs and per-PID memory samples:
`~/.cache/brave-tv/logs/sustained-c8957a6c3/`.

This establishes uninterrupted ordinary playback without sustained PSS growth
in this x64 Debug emulator. It is not adaptive streaming, audio-sync, DRM,
mixed browsing/lifecycle stress, or Chromecast memory acceptance. Native host
builds ran on the computer during part of the sample.

Afterward the 17-step private-new-tab replay passes in 5.1s. Closing its owned
private blank tab returns to normal native home with Address or search focused,
12 normal tabs retained and no inactive-tab promotion. The exact archived count
remains 6, and both archive-auto-delete enabled/decision preference keys remain
absent before and after. No retention preference was fabricated. An earlier
attempt restarted before Home navigation had completed and failed its home
precondition on the old media URL; it is not a successful replay or the earlier
step-6 intermittent focus issue.

Before installing the independent-provider APK, both actual `engine0.dat` and
`engine1.dat` files have the legacy `Brave-TV adblock 22dd05…b014b70e` prefix.
This supplies the real migration case for the subsequent installation.

## Independent snapshot provider emulator acceptance (10 October UTC)

Source `8d52513b1` passes the blocking x64 build in 1m21.54s (wrapper
1m25.64s). Last observed cgroup peak is 10,932,215,808 bytes, not the final peak.
Artifact `tv-independent-filters-8d52513b1-x64-debug-20261010/BraveMonox64.apk`
is 852,799,698 bytes, SHA-256
`f64b244cee8117258b6f134d61775b9654ce7d975fa704ac7471065730796220`.
V2 signature verification and profile-preserving installation pass.

After a real page loads, both previously legacy DAT files are replaced with
`TV independent packaged` followed by the APK snapshot identity. The actual
cookie-on probe passes: the control loads and the ad/cookie requests are blocked
by client. A signed sequence-1 bundle is then copied into the previously absent
application cache as a controlled fixture. Both active DAT files retain the
packaged prefix during that process. After restart, both carry
`TV signed adblock 2e9e8c9d4753a5a8c7264d3512931df6ceab2cb150fc7153ec691f5d5ffdf3a1`,
matching the authenticated payload digest. The control/ad/cookie-on probe passes.
Native Content Filters off/on changes produce the expected cookie request
loaded/blocked results while the ordinary ad request remains blocked.

Bundle artifact: `filter-feed-sequence-1/filters.bundle`, 10,192,014 bytes,
SHA-256 `fb89c11db270045ae046681b2918144e59f56c6c5fdc99cb08fc13ef9c2d3b47`,
publication `2026-10-10T03:16:45.427Z`. It uses the pinned public key and current
snapshot; private key material remains outside Git with owner-only access.
This manual signed-cache fixture validates native load/restart/cache behavior,
not transport or the native staging call; real staging is covered by the host
storage tests. Network delivery and freshness UI remain pending.

The initial post-install home replay fails at its tagline assertion with browser
controls over the new-tab URL. Keep the startup focus/panel race open. A diagnostic
wrong-port URL returns 404; after restart, Back leaves the expected fixture, so
that first probe fails its page precondition. Opening the correct foreground
fixture restores the passing probe. Neither failed diagnostic is counted as an
acceptance pass. Current normal-tab count is 13 with the owned fixture foreground.

## Shared panel visual acceptance (10 October UTC)

The user rejected the oversized outlined Settings dialog. Source `0597ee53c`
introduces compact trailing panels, quiet themed surfaces, Nala icons and a
single filled focus state. Its main-panel replay passes 16 steps in 4.3s and
Settings replay passes 28 steps in 2.4s. Screenshots reveal Playback below the
main grid's initial viewport and excess height in short confirmations.

`c509c9254` reduces wide-grid spacing; `03aa6d30d` bounds window height to
measured content. The final cached Nix build passes blocking Android analysis
in **3m31.08s**, with four workers and 18/22 GiB limits. Last observed cgroup peak
is **14,443,749,376 bytes**; final peak was not captured. The earlier builds take
6m55.24s (`r41`) and 3m31.24s (`r42`). Log prefixes are
`~/.cache/brave-tv/logs/build-simple-browser-x64-20261010-r4{1,2,3}`.

Final APK: `~/.cache/brave-tv/artifacts/tv-panels-03aa6d30d-x64-debug-20261010/BraveMonox64.apk`,
**852,834,356 bytes**, SHA-256
`c3b94b7d2a743ce9497c3bed6b2f99c19cac93ebf9e3f74e42e6d56e7ffdab05`.
The v2 signature verifies; profile-preserving installation succeeds. The artifact
contains args, signature and provenance. This is an x64 Debug emulator build.

On the final APK, main panel **16 steps / 4.1s**, Settings **28 / 2.5s**, and
home **20 / 5.3s** pass. Settings covers every row and Back/focus restoration
from filters, privacy and search; it does not delete data or change preferences.
Manual D-pad traversal reaches More tabs after scrolling, opens the next tab
page, and retains the fixed heading. The history-clear confirmation starts on
Cancel; right/left and Cancel return safely. All main controls, including
Playback, fit the standard viewport. Filters and confirmation descriptions are
readable in the captured English layouts. Home's three cards remain aligned.

Screenshots are outside Git at
`~/.cache/brave-tv/logs/tv-panels-03aa6d30d-{controls,settings,settings-home,filters,confirmation,tabs-scrolled,home}.png`.
One owned blank home tab was added for the home checks (14 normal tabs afterward).
No existing tabs, profile data, filter choices or cached build outputs were removed.
Larger fonts, translations, hardware and the earlier intermittent startup/home
focus issue remain separate acceptance work.

### Newly demonstrated cold-start blocking failure

On `0597ee53c` and `c509c9254`, the restored local fixture initially shows its
ad/cookie scripts loaded. The added `startup-cookie-on` diagnostic fails twice
on `c509c9254`, including a normal relaunch without another install:
`ready=complete`, `adLoaded=true`, `cookieLoaded=true`, control loaded. The
existing request-level `cookie-on` reload then passes, and the no-reload observer
also passes afterward. Only one matching fixture DevTools target is present.
Logs: `shields-startup-c509c9254-red{,2}.log`,
`shields-reload-c509c9254-green.log`, and
`shields-after-reload-c509c9254-green.log` in the same external log directory.

The no-reload diagnostic proves document effects, not historical request events.
This is a confirmed open startup protection bug; the reload result cannot close
it, and it is not yet established as the cause of YouTube video ads. Prioritize
its diagnosis after this visual acceptance, before independent feed transport.

### Cold-start blocking correction (10 October UTC)

The `brave.adblock` startup trace on `03aa6d30d` establishes the failure's cause:
page checks at +2.56ms and ad/cookie script checks at +132.99/133.03ms precede
engine installation at +892.84/+920.31ms. Source `fd1db3384` queues public
engine queries and cosmetic receiver binding until both independent engines
have filters and resources; initialization bypasses that queue. Its cached
cold-start observer passes, with the first page check at +538.08ms after both
DAT loads. The no-DAT run also passes, but its trace reveals premature partial
engine builds before the full lists, confirming the ordering concern found in
review. Source `dbeaa9a61` extends the existing catalog gate to independent
startup with DAT caching disabled.

Final source `dbeaa9a61` passes these checks on emulator-5558:

- Cached cold startup: no reload; ordinary script loads and both ad/cookie
  scripts remain blocked. Engines install at +431.31/+454.15ms; the first page
  check occurs at +596.55ms. A separate ordinary relaunch passes again.
- DAT caching temporarily disabled: the same no-reload observer passes. Only
  two complete engine builds remain, installing at +1201.19/+3605.04ms; the
  first page check follows at +3605.16ms. No cache files were deleted. These
  timings are single emulator samples relative to service construction, not
  whole-browser launch measurements or hardware estimates.
- Request-level reload probes pass for cookie blocking On, Off, then restored
  On. The ordinary ad stays blocked throughout; cookie requests fail with
  ERR_BLOCKED_BY_CLIENT only when the optional list is enabled.
- Native main-panel replay passes 16 steps / 3.8s; Settings passes 28 / 2.5s,
  including Back and remembered selection.

Trace setup temporarily adds an owned Android command-line file and debug-app
selection, restoring both afterward. Trace captures, no-reload outputs and
request logs remain at `~/.cache/brave-tv/logs/adblock-{fd1db,dbeaa}-{cached,no-dat}-trace.json`
and `shields-dbeaa-*.log`. Cookie and mobile-promo blockers are restored On.
The previously owned blank home tab was closed; 13 normal tabs remain, with
the existing correct local Shields fixture foreground. No profile/cache reset.

Cached Nix APK builds pass blocking Android analysis in **75.36s** (`r44`,
`fd1db3384`) and **36.18s** (`r45`, final source), with four workers, 18/22 GiB
limits and no swap. Last observed r44 cgroup peak is **17,678,696,448 bytes**;
r45 peak was not captured. Final APK:
`~/.cache/brave-tv/artifacts/tv-startup-dbeaa9a61-x64-debug-20261010/BraveMonox64.apk`,
**852,834,356 bytes**, SHA-256
`f23a57f352d0984762dec1cb2dcff091501042d3dddf906d6636c6e1ec5d0eec`.
Signature verification and profile-preserving installation pass; args and
provenance are preserved alongside it.

The new native delayed-catalog regression compiles successfully through Nix
(`catalog-test-compile-r2.log`, 17.73s), but its test binary was not linked or
executed. The first compile invocation failed because Nix cleared PYTHONPATH;
setting it inside the development command resolves that tooling issue. Device
regressions above execute the actual APK. YouTube video-ad acceptance, signed
update transport and hardware acceptance remain open.

## Signed delivery and TV update status (10 October UTC)

Source `95b26f1ba` passes the cached x64 Debug build with blocking Android
analysis in 10m45.60s (wrapper 10m49.08s). Four workers, 18 GiB memory-high,
22 GiB hard limit and no swap remain configured. The highest observed cgroup
usage is 19,333,165,056 bytes (18.01 GiB); final peak was not captured after the
service exited. Artifact `tv-signed-delivery-95b26f1ba-x64-debug-20261010/BraveMonox64.apk`
is 852,923,820 bytes, SHA-256
`c8cee2d41384789fcd3e643977d64bd3c34c0f23c2651b86294d8255c25e2434`.
Signature verification and profile-preserving installation pass. The artifact
directory preserves GN args, signature output and provenance; build prefix is
`build-simple-browser-x64-20261010-r46` under the external logs directory.

All 17 signed parser/storage/updater host tests pass, including a valid envelope
larger than 5 MiB, rejection/rollback, atomic staging, body limit, timeout,
coalescing, HTTPS redirects and persistent daily scheduling. Three signer tests
also pass. The host runner required a complete test URL factory header; the
corrected run is `updater-host-tests-r3.log`.

The public `filters-current` release and immutable `filters-sequence-2` release
contain the same 10,192,014-byte signed artifact, metadata and SHA256SUMS.
Sequence 2 publication is `2026-10-10T04:33:24.887Z`; file SHA-256 is
`c347c370e5ba289383b77cb1db86729c6a34b55cc11ae1aee4bfca9b23a24232`.
An unauthenticated HTTPS-only download matches the local signed artifact
byte-for-byte. This bootstrap uses the existing pinned rules. It is not a newly
refreshed upstream ruleset or evidence of universal YouTube video-ad blocking.
See [publication and refresh](filter-updates.md).

On `emulator-5558` with the existing profile:

- Initial status reports signed snapshot 1 and no recorded check. Without a
  manual action, the startup timer fetches and stages sequence 2. The on-device
  bundle matches the public file hash; both active DAT files retain the
  sequence-1 payload identity `2e9e8c9d…3a1` until restart.
- Reopening shows downloaded/restart status, active publication date and last
  attempt. A repeated manual check retains the restart requirement.
- Throttling the emulator to 1,000 bits/s each way produces a download failure.
  Back through Content Filters to Settings and reopening during the in-flight
  operation works; the failure leaves both current data and the pending restart
  intact. Restoring unlimited speed permits a successful manual retry. Android
  also reports Ethernet disconnected during this impairment. This establishes
  impaired-network failure/recovery, not an exact 60-second device timeout or a
  controlled complete-disconnection test; the exact deadline passes on host.
- Restart confirmation focuses Cancel. Cancel returns safely. Confirmed restart
  changes the browser PID from 4247 to 5559 and preserves all 13 normal-tab IDs
  and URLs exactly. Both DAT files switch to authenticated payload digest
  `787bc07fdeba958e8cd5edc76692ce5e1546c97d9082dd8914b50a6d3e073977`.
- The restored document passes `startup-cookie-on` before any reload. Separate
  request checks before and after restart load the ordinary control and reject
  ad/cookie-list requests with `ERR_BLOCKED_BY_CLIENT`.
- The next manual check reports the latest published snapshot, retains the
  persisted last-attempt date and has no restart action. The native update
  navigation replay passes all 18 steps in 2.3s, including Back focus restoration.

Screenshots `filter-update-{staged,timeout,restart-confirm,current}-95b26f1ba.png`
are saved under external logs. Inspected status and failure panels fit at
1920×1080/density 320, with readable status, one focused action and no clipped
panel content. The first snapshot taken during process restart reports
insufficient foreground content; retry after stabilization succeeds. Crash
buffer inspection is bounded to this test window; older crash records must
not be attributed to this build.

Network speed is restored to unlimited, latency remains zero, optional cookie
and mobile-promo lists remain On, normal tabs are preserved and no private tabs
were created. Fresh-install delivery, complete disconnection, private restart,
large-font/translation and physical-device acceptance remain open. The existing
startup panel can still show stale Stop loading until reopened; that separate
UI state issue is not fixed by delivery work.


## Final emulator privacy and video checks (10 October UTC)

Source `5c9a36c74`, x64 Debug, cached build r49: blocking Android analysis
passes in 45.92s (wrapper 49.93s). The preceding two builds failed on
constant-condition unreachable-code warnings; explicit compile-time branches
correct those failures. Four workers and the 18/22 GiB cgroup limits were kept;
a final cgroup peak was not captured. The preserved artifact is
`tv-privacy-5c9a36c74-x64-debug-20261010/BraveMonox64.apk`, 850,957,740 bytes,
SHA-256 `27e6071d88b309dd18935d500f7d438b8ab1cf3f9268e93e5f803678daee7d2f`.
Signature verification and profile-preserving emulator installation pass.

All five modified Android test translation units compile: Shields settings,
filter-list P3A, Sync P3A, Sync service and profile manager/News factory. The
first direct test-object build lacked Brave's Python path; exporting
`PYTHONPATH=$PWD/brave/script` fixes the generator prerequisite. Retry succeeds
in 12.11s. This is compile coverage, not execution of the native test binaries.

The installed `95b26f1ba` baseline exposes `Brave.Shields.FilterLists.2` through
the actual native histogram request. The new build's same probe reports absent
after startup, native cookie-list Off/On and Google/Brave searches. A broad
`Brave.` native request also finds no Shields usage/cookie-list, News, Sync,
Search or bandwidth-usage histograms. Remaining entries are local engine,
request and resource-load timing diagnostics. Evidence:
`shields-analytics-before.json`, `analytics-after-5c9a36c74.json`.
Actual ad and cookie-list fixture requests still fail with
`ERR_BLOCKED_BY_CLIENT` while the control script loads, both before and after
settings toggles and restart. No temporary cosmetic/scriptlet test rule was
installed in this run; those earlier regressions are separate evidence.

A default-redaction NetLog sample covers 347.923 seconds and 159,561 complete
events across startup, native settings, Google/Brave searches and YouTube.
The live capture's incomplete final event is excluded when reconstructing
valid JSON; raw and reconstructed files stay outside Git. The sample contains
five upstream component-update requests, two Brave Search `/api/feedback`
requests explicitly initiated by `https://search.brave.com`, and normal search
assets. It contains no separate Brave reporting host. Website-origin traffic
is not a browser collector; no website consent setting was changed. This is
bounded evidence, not proof about every delayed request or every website.
Files: `netlog-privacy-5c9a36c74-{capture,complete-events,summary}.json`.

Signed-out YouTube checks use three live recommended videos:
`plN7JMbadRg` (Eat Everything In A Grocery Store), `pAnGwRiQ4-4` (Futuristic
Tech), and `Iu8ZmhRphSU` (World's Fastest Workers). Content plays from the
beginning and at later positions around 20, 15 and 5 minutes respectively.
No video ad was reproduced in these samples. DOM ad-state samples are paired
with visible content/captions and advancing media clocks; they cannot prove
universal pre-roll or mid-roll blocking, nor represent signed-in/geographic
variants. Later positions were set diagnostically, not presented as remote
scrubbing acceptance. Separate audio/video formats 251/243 and independent
buffer ranges confirm adaptive delivery.

Native Pause stops the first video at 52.231s; native Seek forward reaches
57.231s (YouTube's five-second handler); Play resumes and Back returns focus
to Playback. The temporary test initially assumed the wrong two-column
geometry; corrected D-pad navigation passes. Back from the main browser panel
then follows page history, so the later-position check reopens the video.
A site controls accessibility ref resolves to the YouTube home location; this
run does not add a new fullscreen/remote-cursor acceptance claim.

On the second video, emulator network throttling to 1,000 bits/s and a seek
to 900s produces buffering (readyState 1). Restoring full speed recovers to
913.33s, playing, readyState 4, with no media error. This tests impairment and
recovery, not full disconnection. Home/background/reopen resumes playback.
A deliberate process recreation restores the active video and 17 normal tabs.
The 16-step native panel replay passes before/after recreation (4.4s/4.7s);
the 28-step settings/provider/Back replay passes in 4.0s with Google selected.


The ordinary 24.109-second local MP4 loops successfully on the new build,
including native fullscreen entry, Back without stopping playback, and a
Settings-app switch/return. At the 2,466-frame observation no frames were
dropped and no media error was present. Snapshot evidence is saved as
`media-fullscreen-5c9a36c74.png`; the ordinary-media probe output is kept
with the private build logs. Later diagnostic tabs bring the normal count
to 19; none of the existing tabs or profile data were cleared.

One ADB transport interruption ends the first logcat stream after about a
minute; it is restarted, and the persistent crash buffer, activity exit-info
and event buffer are inspected to cover the gap. Old crash-buffer entries
are from 9 October, before this APK. No new crash/ANR event appears during
this run; deliberate force-stop/package-update exits are not crashes.
The before/after analytics check also passes after process recreation.
Remaining limitations: native test binaries were not executed, full
disconnection was not tested, hardware is deferred, and the previously
recorded intermittent home focus and stale loading-action UI cases remain
open. A successful bounded session is not a whole-MVP completion claim.


Whole-browser memory (main process, zygote, GPU/privileged and isolated
renderers) is sampled 25 times over 12 minutes of the mixed session. Summed
PSS ranges from 788.05 to 1,019.33 MiB and ends at 888.71 MiB. This is a
2-GiB API-36 x64 Debug emulator with 17–19 restored/diagnostic tabs, not a
release Chromecast budget or a leak-proof result. Android guest swap PSS
is reported separately by dumpsys; host builds still use no swap. Logs:
`reliability-whole-5c9a36c74.jsonl`, `reliability-5c9a36c74*.logcat`,
`reliability-5c9a36c74-{events.log,exit-info.txt,crash-buffer.log}`.


Three additional cold panel replays pass (16 steps each, 4.4s, 5.2s and
5.1s). These exercise loaded-webpage startup; they do not close the separate
intermittent private/native-home focus issue. YouTube observation files include
paused/restored/background snapshots; repeated timestamps are not counted as
uninterrupted playback. The sampled positions and playback assertions above
are the actual acceptance evidence.


The overall mixed session completes 31 main-process samples across 900 seconds,
with the 12-minute whole-process series above nested within it. The final
crash/event/exit-info inspection finds no new browser crash or ANR.

Closeout: restored full-speed/zero-latency emulator networking and the Google
TV keyboard, removed temporary diagnostic flags/debug-app settings and ADB
forwards, closed the agent session, shut down the emulator, and stopped all
four fixture servers, captures, samplers and the task's agent-device daemon.
No task build/emulator service or fixture listener remains running. T3/shared
platform services remain available. Profiles, APKs, logs and compile caches
were preserved; no Chromecast was accessed. Source `master` is pushed.


## Current-source Chromecast preparation (10 October)

Wireless discovery reconnects the paired Android-14 `sabrina` without a new
code. It reports ARMv7, approximately 2 GiB RAM, an existing 1920×1080 display
override at 320 dpi and 1,057,160 KiB available storage before installation.
Active user 0 has the old package uninstalled; user 10 retains it. No user or
browser data is cleared. The latest-only source review remains the already
recorded `5c9a36c74` review; this slice changes no application source.

The [verified ARM candidate](build.md#current-source-arm-candidate-10-october)
is attempted with `adb install -r --user 0`. Android rejects it with
`INSTALL_FAILED_INSUFFICIENT_STORAGE: Failed to override installation location`.
Package version/update time and both users' installed flags remain unchanged.
No active/finalized install session, `vmdl*` staging directory or temporary APK
is exposed by the shell after failure. The user is asked to free 300–400 MB
and aim for 1.3–1.4 GiB available before retry. Installation/runtime acceptance
are still pending; the successful build is not hardware acceptance.

The user subsequently authorizes uninstalling the browser. A global
`adb uninstall com.brave.browser_default` succeeds, removing its retained
user-10 installation and browser data. The package is absent even from
`pm list packages -u`; available storage rises from 698,328 to 1,424,944 KiB.
No other application or Android profile is removed, and no reboot is needed.
The same verified APK then installs successfully for user 0. Package flags
omit DEBUGGABLE; user 0 is installed and user 10 is not. Available storage
immediately after installation is 1,064,412 KiB. This is fresh-install
acceptance, not preservation of existing browser data.

The first automated launch returns to Google TV. Android logs a blocked
background PendingIntent launch of TvLauncher at 10:31:00 local time, with
no crash-buffer entry. A second launch displays the native home directly,
with Address or search focused and one tab. This first-launch return needs
follow-up; successful installation does not close it. The real Google TV
keyboard remains selected, and physical-remote address-entry confirmation
is requested before further TV input. Source remains `5c9a36c74` unchanged.

The user confirms physical-remote address entry to example.com loads and
remains responsive on this APK. The localhost Shields fixture loads its control
script while both test requests fail, and the protection bubble reports two
blocked requests. Turning site protection off through the native TV panel
causes `/showbanner.js` and `/1_cookie.js` to reach the fixture server with
HTTP 200; restoring protection reloads the document without those requests.
This demonstrates functioning request blocking on hardware, not YouTube video
ad acceptance or isolated cookie-list attribution. The fresh install also
exposes a leftover Brave-branded Shields education bubble; remove it in a
follow-up UI fix. On `remote-input.html`, the user confirms a visible cursor
and exactly one click after holding/releasing OK using the physical remote.
Playback and sustained-session checks remain in progress.

YouTube hardware sample `plN7JMbadRg`: the user confirms moving video and
sound with no pre-roll ad observed. Native Playback Pause changes the system
media session to PAUSED at 43,859 ms; Play resumes it. Device screenshots
capture the video region as black even though the user sees playback, so
those captures cannot establish visual video/ad state. The second sample,
`pAnGwRiQ4-4`, exposes content progress (0:18 / 23:03) and media metadata;
Android reports Amlogic VP9 decoding at 640×360 and HDMI audio with zero
recorded underruns in its completed audio track. These observations are
bounded hardware playback evidence, not frame-perfect or universal ad-blocking
claims. Renderer exits recorded during tab navigation say ISOLATED NOT NEEDED,
with no crash entry at this checkpoint.

The third sample, `Iu8ZmhRphSU`, reaches content playback with changing
captions and the expected media-session title. Agent input enters YouTube's
actual fullscreen player (browser toolbar absent); after leaving it untouched,
the user confirms fullscreen and one physical-remote Back return work.
The browser remains on the same video with PLAYING media state. No separate
mid-roll absence claim is made: visual video regions are unavailable in the
capture, and only the first sample has an explicit user no-ad observation.

The mixed hardware run collects 21 complete whole-browser PSS samples across
605 seconds, including main, zygote, GPU and isolated renderer processes
(6–8 processes, up to five tabs). Total PSS ranges from 374.84 to 655.36 MiB,
ending at 512.97 MiB during test-tab cleanup. The series includes page loading,
three YouTube samples, native pause/play, fullscreen/Back, app return and tab
switching/closing; it is not ten minutes of uninterrupted video or proof against
leaks. The final crash buffer, crash/ANR events, application exit-info and
captured logcat show no new browser crash/ANR. Remaining free storage is
1,014,308 KiB. Logs are outside Git under `~/.cache/brave-tv/logs/`, prefixed
`chromecast-{memory,acceptance,media-metrics,exit-info}` with source `5c9a36c74`.

Closeout: closed the temporary fixture tabs and the extra YouTube tab, leaving
the original Example Domain and current World's Fastest Workers video open.
Site protection is on and the native Google TV keyboard is unchanged. Removed
the fixture reverse mapping and stopped the HTTP server, log capture, memory
sampler, host device daemon and Android snapshot helper. Both emulators remain
stopped; browser profile, APK and compile caches are preserved. No source change
or build occurs in this acceptance slice. First-launch handoff, promotional
branding, longer video/ad scenarios and second-device acceptance remain open.

### Neutral TV identity and launch follow-up (10 October)

The isolated `brave_tv_launch_followup_api36` AVD preserves the two earlier
AVDs and their users. On baseline `5c9a36c74`, fresh users 0 and 10 both reach
ChromeTabbedActivity directly on Android 16. User 0 reproduces the branded
Shields education bubble on `shields.html`; user 10 has never shown it and has
no tooltip preference before the update.

Source `4772fcb93` skips that promotion in television mode, provides a neutral
launcher-alias icon and qualifies `app_name` for television. Build r50 catches
an unused-icon lint warning despite the generated manifest reference. The
single-resource correction `e41398dd1` follows the existing banner exception.
Build r51 passes with blocking static analysis, four workers, 18/22 GiB memory
thresholds and no swap in 3m57.75s. The observed cgroup peak is 15.66 GiB;
per-process maximum RSS is 4.84 GiB, which is not total build memory.

The resulting x64 Debug APK is 850,986,432 bytes, SHA-256
`16f8a80cf1b63a4a4b706d52a4e8b1ae1d373d33a239705a1eb340a419294111`.
Its APK Signature Scheme v2 verification passes. AAPT confirms TvLauncher's
icon references the packaged neutral vector and `app_name` has a television
alias to the existing working label. Artifact, GN args, signature and source
record are outside Git under
`~/.cache/brave-tv/artifacts/tv-identity-e41398dd1-x64-debug-20261010/`.
An in-place emulator update preserves both browser profiles. On user 10 the
fresh tooltip-eligible fixture loads without the promotion, retains its absent
tooltip preference, loads the control script and blocks both fixture requests
with `net::ERR_BLOCKED_BY_CLIENT`. This verifies request blocking, not which
individual list owns the cookie-pattern rule. A repeat probe on a background
tab times out; only foreground results count. Ordinary fixture playback
advances without a media error; Android reports its active session as
`TV Browser (prototype)` instead of Brave.

With user approval, Chromecast test users 11 and 12 are created without
resetting existing users. Initial system-profile setup intercepts one attempt;
after disabling setup only in the test profile, user 11 reaches
ChromeTabbedActivity from WelcomeOnboardingActivity on the first completed
browser first run (7.8s launch wait), with no blocked background launch. The
second profile attempt is invalidated by system sleep: power state says
`mWakefulness=Asleep`, `mLastSleepReason=timeout`, and Android blocks opening
WelcomeOnboardingActivity from TOP_SLEEPING. This differs from the earlier
completion-PendingIntent rejection and is not a reproduction of that defect.
After the user's TV-off report, restore original user 0, wake the Chromecast
(Awake confirmed), stop both test users and pause hardware testing. Their data
is preserved. No first-launch source fix is claimed; the intermittent Android
14 handoff remains open. The Chromecast retains the accepted `5c9a36c74` APK.

The updated fresh emulator profile samples signed-out YouTube videos
`plN7JMbadRg` and `pAnGwRiQ4-4` at initial playback, then at 20 and 15 minutes
respectively. A cold browser restart restores the second video; explicit
resume/seek to 15 minutes also passes. All five six-sample observations advance
about 25 seconds with readyState 4, 640x360 content, no media error and no
observed `.ad-showing` state, mutation-observer ad event or matched ad text.
This is bounded DOM/playback evidence: observation begins after page load,
later positions use a programmatic seek, and no claim is made about the entire
pre-roll, uninterrupted mid-roll schedule, signed-in sessions or every video.
No YouTube blocking source change is justified by these passing samples.
