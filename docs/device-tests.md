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
