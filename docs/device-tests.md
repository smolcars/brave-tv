# Device and website test matrix

Status: physical-device and website coverage remain proposed. The TV prototype has now been installed and launched on an Android TV emulator; the first runtime findings are recorded below. See [build evidence](build.md) and [prototype status](tv-prototype.md). No physical TV has been connected. Website availability and behavior must be checked during execution.

## What hardware is needed

Start with an Android TV or Google TV running Android 10 or newer and its ordinary D-pad/OK/Back remote. A built-in TV or an external streaming device is suitable. We need the model and Android version from its Settings → About screen before choosing an APK architecture. An external keyboard or mouse can help investigate stock Brave, but cannot count toward remote-only acceptance.

The completed MVP requires two physical devices: a modest device and a faster device. We can start development with one. An emulator helps check installation and input integration; it does not establish real TV performance, hardware decoding or DRM compatibility. Do not buy hardware until the source build works and the first device's limitations are known.

On 9 October the user identified an existing “chrome stick” with its own remote and app home screen, reporting **Android TV OS 14**. Treat it as the first candidate, likely a Chromecast with Google TV; the exact model (HD/4K) and supported ABIs remain unconfirmed. Query these over an authorized ADB connection before selecting its build. Its reported OS meets the prototype's Android 10 minimum. The x64 development APK is for an emulator, not this physical target. No second device has been chosen.

For installation and logs, the developer computer must be able to reach the TV through Android Debug Bridge (ADB), over a supported USB or local-network connection. Enabling developer options/debugging and accepting the computer's debugging prompt happens on the device. Settings vary by manufacturer; use its instructions. Disable debugging when testing is finished. No physical TV has been connected yet.

On 9 October, at the user's request, `enableDeviceSupport` and `enableAgentDeviceAccess` were set to `true` in T3's watched `~/.t3/userdata/settings.json`, preserving other settings and making a private backup first. The installed T3 CLI has no dedicated device command. A subsequent “continue” turn still reported device access disabled; both flags remained enabled and no project override disabled them. The existing session retains its old capabilities. T3's command palette provides **Restart agent session**, whose next-message behavior starts a fresh session; use it, then recheck `device_list`. The settings file is watched, so a server-wide restart is not required for the settings change. Saving the flags does not prove helper installation, emulator availability or a physical-device connection.

| Field | Modest device | Faster device |
| --- | --- | --- |
| Manufacturer and model | User's remote-equipped “chrome stick”; exact model TBD | TBD |
| Android version / API | Android TV OS 14 (user-reported); API query pending | TBD |
| Supported ABIs | TBD | TBD |
| RAM / available storage | TBD | TBD |
| Display resolution / scaling | TBD | TBD |
| Remote buttons | TBD | TBD |
| Connection method | TBD | TBD |
| Official Brave baseline | Not run | Not run |
| Unmodified source build | Not run | Not run |
| TV adaptation build | Not run | Not run |

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
- **UNRESOLVED pointer check:** choosing “Page cursor” showed no visible cursor/hint. Five Down presses scrolled the document; OK left the counter at zero. Agent-device 0.21.12 implements these buttons with `adb shell input keyevent`; the emulator's virtual device reports `KEYBOARD | DPAD` and alphabetic keyboard type 2. The adapter explicitly preserves alphabetic keyboard handling. This provides a concrete input-source mismatch to investigate, not evidence that a physical remote behaves the same way. Input metadata: `~/.cache/brave-tv/logs/emulator-input-devices.txt`.
- Click-on-release/hold, explicit and nested scrolling, CloseWatcher/native-modal priority, lifecycle recovery and the URL-to-video flow remain unverified. The fixture server was stopped and its ADB reverse mapping removed after the run; the emulator remains visible in T3 with the system TV keyboard restored.

## Proposed website flows

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
