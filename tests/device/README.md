# TV device regressions

`tv-native-dialog-return.mjs EMULATOR_SERIAL AGENT_DRIVER.py NORMAL_SCREENSHOT.png`
runs one actual-engine alert/confirm/prompt return sequence on the normal
`http://10.0.2.2:18088/dialogs.html` fixture. Start with Browser controls' Page
cursor focused,1920×1080/density320/font1.0, and the stock Android keyboard
selected after agent-device opens. The driver must retain the exact emulator
launcher/config/session returned by T3 device_open and any private daemon
credentials. Forward9222 only from that emulator to chrome_devtools_remote;
the probe checks both the AVD and forward, and uses CDP only for read-only
synthetic result/document-identity observations. Page actions use a nonalphabetic
uinput remote; native dialog actions use D-pad/OK/Back, with exact fixture
messages checked before acceptance. Trusted normal controls and a unique
fixture target are required before diagnostics/input; failed ownership validation
prevents capture. The sequence covers conservative initial
Cancel, Right/Left, both confirm outcomes, genuine native prompt cancellation,
next-click recovery and cursor pixels after dismissal. It captures only the
normal fixture after the dialogs are gone. A completed input command, syntax
check or CDP read alone is not native-dialog acceptance.

`download-fixture-server.mjs CHROMIUM_MEDIA_TEST_DATA` serves fixed synthetic
attachments on host loopback18090. Pass the pinned `src/media/test/data`; its
four-colors image opens through existing native download/media ownership. Run
`download-server-check.mjs` with the same directory and require its positive
body/range/method checks before forwarding18090 to an explicitly verified TV
emulator. Use the slow4MiB text attachment for native pause/resume/cancellation.
The equivalent binary attachment exercises Chromium's insecure-HTTP download
warning: keep that native owner and conservative Discard behavior. At most two
slow transfers run across both routes, with bounded chunks and disconnect cleanup.
Create downloads from the fixture webpage's links, preserve the browser profile
and any other downloads, then verify native statuses and conservative TV
confirmation focus. List removal must preserve the synthetic file and bytes;
file deletion must remove only the selected fixture. A server check is not
download/storage acceptance. Do not infer real LAN or physical-TV compatibility.

`TvDownloadsPanelTest` uses native dialogs with a provider fixture for paging,
focus retention/recovery, private-item rejection, separate action ownership,
conservative cancellation and late-query disposal. Run every `@DoNotBatch`
method in its own instrumentation process, as described below. These tests
cannot prove file preservation/deletion or actual download opening; verify
those separately with the real native provider and synthetic attachments.

`tv-baseline-navigation-{settings,favorite}.ad` apply only to source5829.
Favorite starts on normal Home Address with the synthetic remote-input page
saved in Mobile bookmarks; the measured route is nine presses. Its final page
content and native toolbar URL distinguish navigation from the item's dialog.
Settings measures five presses when controls initially focus Address. Reopening
controls can restore another action; the measured Home-restored case is four.
Seed and prepare outside the counted route, preserve the browser profile, and
record a failed precondition rather than continuing its keys or changing data.

The native session/Home tests belong to the existing `brave_java_unit_tests`
GN target and its separate `com.brave.browser.tests` application. Reuse the
cached build and resource limits in `docs/build.md`. Verify APK signature and
manifest package before installing on an explicitly identified nonphysical TV
emulator. Keep the production browser profile intact.

`TvHomePageTest#unavailableExternalLinkReturnsToSameDocumentAndDisposesOnNavigation`
requires the owned `dialogs.html` fixture, passed as instrumentation argument
`tv_external_link_fixture_url` (for example
`http://10.0.2.2:18088/dialogs.html?native-external`). The opener is a genuine
native touch; D-pad Back and OK dismiss the TV explanation while retaining the
same tab, WebContents and document time origin. A subsequent real navigation
must dispose the notice. Run its focused-editor/hidden-IME and stale/private-owner
negative cases separately. Neither an APK build nor a direct bridge invocation
alone accepts the actual external-navigation flow.

`TvHomePageTest#nativeRendererCrashDpadReachesRecoveryAndPreservesTab` uses
`WebContentsUtils.crashTabAndWait`, which crashes the real renderer process;
the separate `simulateRendererKilled` helper is not runtime acceptance.
The case traverses native help text → recovery button using D-pad, reloads
through Chromium, and requires unchanged tab/WebContents/model count before
Back reaches usable TV controls. Keep private-window failure capture disabled.

The upstream host runner can restart shared ADB on discovery failures. For this
session's physical-device restriction, use explicitly targeted native
instrumentation instead, after closing only the matching agent-device session
to release UiAutomation. The pinned test root certificate is a Java test-process
fixture; push `src/net/data/ssl/certificates/root_ca_cert.pem` to
`/sdcard/chromium_tests_root/net/data/ssl/certificates/root_ca_cert.pem` on that
emulator. Record the test package's MANAGE_EXTERNAL_STORAGE appop, temporarily
allow it for the fixture and restore it after testing. Never alter production
permissions or the OS trust store. Example after that setup:

```sh
adb -s emulator-5554 shell am instrument -w -r \
  -e class 'org.chromium.chrome.browser.tv.TvBrowserSessionTest,org.chromium.chrome.browser.BytecodeTest#testTvImeHooksExist' \
  com.brave.browser.tests/org.chromium.base.test.BaseChromiumAndroidJUnitRunner
```

Require the exact test count and positive JUnit results; `am instrument` can
exit successfully when tests fail. Do not pass a failure-screenshot argument:
upstream screenshot capture clears private-window security flags. Native
private tests must retain those flags and remain uncaptured.

`TvHomePageTest#dedicatedDpadFromVirtualKeyboardClicksOnce` uses a solid-color
normal data-page fixture. It observes cursor pixels in transient, recycled
UiAutomation bitmaps after requiring the exact normal tab/URL, focused activity
and absence of secure-window flags. It never saves images or changes flags.
The case requires held-OK count1/detail1, keyboard/modifier exclusion, actual
cursor hide, held wake with no click, and the subsequent native pointer click
at the content center. Emulator events do not prove physical remote hardware.

`TvHomePageTest#compactControlsUseNativeNavigationAndSiteState` needs the owned
`security-fixture-server.mjs` and explicit emulator reverse18084. Run
`security-server-check.mjs` first: it verifies fixed routes, methods and the
two-slot slow-document limit/abort cleanup. The native case uses D-pad/OK for
same-tab Back/Forward/Reload/Stop, checks actual connection/protection labels,
and changes/restores only the TEST profile's synthetic-origin Shields setting
through its native API to verify observer updates retain Address focus.
The15-second slow body is bounded and canceled by actual Chromium Stop; host
checks alone do not accept native navigation or security behavior.

Run `@DoNotBatch` cases such as `TvHomePageTest` in separate instrumentation
processes, matching the pinned host runner's test isolation. A whole-class
`-e class` invocation bypasses that separation. Filter one method per invocation:

```sh
adb -s emulator-5554 shell am instrument -w -r \
  -e class 'org.chromium.chrome.browser.tv.TvHomePageTest#closingAndUndoingUnselectedRecentTabRefreshesSameHome' \
  com.brave.browser.tests/org.chromium.base.test.BaseChromiumAndroidJUnitRunner
```

Repeat for each method from the artifact's pinned source and require `OK (1 test)`
in every log. Do not reset production data or restart shared ADB for isolation.

`TvHomePageTest#compactPageInfoUsesNativeOriginAndReturnsToSamePage` also
requires the owned HTTP fixture server serving `tests/pages/bookmark.html`.
Pass `-e tv_site_info_fixture_url http://10.0.2.2:18088/bookmark.html` to its
explicit emulator instrumentation invocation. The test first requires the
loaded fixture heading, then enters Chromium's native Page info through D-pad
controls and verifies its origin, connection row and Back recovery. It does
not require a separate EmbeddedTestServer APK or an OS trust exception.

The `TvHomePageTest#pendingClear*` methods hold only completion through the
existing generated JNI test hook. They exercise real native dialogs, D-pad,
Back, activity pause/resume and document replacement, asserting the exact
normal profile, CACHE type, ALL_TIME and empty exclusions. Run each in its
own instrumentation process and retain the native fixture's scoped cleanup.
These cases prove pending UI ownership and recovery; actual category deletion
and preservation require the production privacy fixture below.

`tv-compose-clear-cancel.ad` starts at the clear-data chooser with Settings
focused. It asserts each focus transition before the next key: Cancel → Right
to Clear now → Left to Cancel → OK back to the chooser. A failed replay stops;
never continue a destructive-dialog batch after a failed assertion. This checks
navigation/cancellation; verify synthetic cookie/storage persistence separately.

`tv-compose-address-entry.ad` requires Home Address focused and verifies entry
into the TV editor. Select the synthetic RemoteIme **after** agent-device opens
Brave (launch selects its own hidden keyboard), then run
`tv-compose-address-ime.ad` and `tv-compose-address-unicode.ad`. The latter sends
fixed Hindi/emoji/Japanese selection/composition/deletion and oversized input
through the real Android InputConnection; it never submits or alters browser
data. Restore stock LatinIME for separate D-pad keyboard/Back checks.

`remote-ime/PanelPerformanceProbe` measures ten normal Home → Browser controls
→ Home cycles in the production APK. Close agent-device's UiAutomation lease
first, verify the explicit emulator serial/AVD, then run:

```sh
adb -s "$TV_SERIAL" shell am instrument -w \
  org.bravetv.remoteime.test/.PanelPerformanceProbe
```

Require code `-1`, actual
numeric sample arrays and `normalHomeRestored=true`. Its own API36/x64/ranchu and
trusted normal Home guards stop before input on another device or private UI.
It prepares focus on the known Home control through the bounded native D-pad
route from Address, then measures genuine D-pad OK. Untimed return uses native Back on the compact panel and the existing Home
action on the legacy panel; legacy Back can navigate underlying history. Preparation is outside
timing and does not prove D-pad traversal from Home. Panel acceptance requires
a different native window from Home, plus the controls heading and Reload;
return requires the original Home window. Failure logs contain a phase, static fixture assertion or exception class,
never Android's event dump. No browser action uses CDP. It reads
bounded `gfxinfo framestats` while each normal panel exists, recording input to
the new window's first completed draw and frame durations across native windows.
Future completion timestamps represent unfinished frames and are excluded.
Accessibility-response samples include tree/query overhead. Render completion
is an emulator proxy, not measured TV first-pixel presentation. No screenshot,
editable value, permission approval or browser-data mutation is involved.

The fixture build keeps SDK35 defaults. When reusing the pinned Chromium SDK,
set `ANDROID_SDK_ROOT` to its `third_party/android_sdk/public`,
`ANDROID_TEST_PLATFORM=android-37.0` and `ANDROID_TEST_BUILD_TOOLS=37.0.0` before
running `remote-ime/build.sh` with the existing external output/signing directory.
This only rebuilds the small test fixture; it adds no production dependency.

`tv-compose-address-search-submit.ad` requires nonempty synthetic text, IME hidden
and Go focused; it checks editor completion even offline, not search navigation.
Selected-provider navigation needs a separate native selected-tab/URL assertion.
`tv-compose-address-japanese-search.ad` supplies that positive assertion for the
fixed DuckDuckGo/Japanese fixture: the editor states its selected provider, and
the native toolbar must show the committed query before Back opens controls with
the selected tab's exact encoded URL. Its20-second wait depends on external
navigation; it is not a network or performance guarantee.
For `tv-compose-address-submit.ad`, use the test IME's Fixture URL button first,
hide the IME and focus Go. It additionally requires the actual local page heading,
so a dismissed editor without navigation cannot pass. Site data URL opens the
existing synthetic privacy fixture for explicit seeding; it never seeds or clears
data by itself. These fixed test stimuli use native InputConnection, not deep links.

`tv-compose-address-document-rejected.ad` requires the normal `privacy.html`
fixture. Open Address from its controls, use the IME Fixture URL button, press
Back once and positively wait for the IME buttons to disappear. Genuinely reload
the underlying privacy document at its identical URL using the documented
emulator CDP navigation workflow. The replay requires the changed-document error
and verifies Go keeps that error, editor and different pending text. Separately
verify the actual underlying privacy URL and seeded storage remain unchanged;
the text field alone is not a navigation postcondition. Do not repeat Back after
an immediate stale accessibility snapshot: first wait for IME absence, or the
second Back can cancel the editor and invalidate the test precondition.

The IME fixture also contains `EditorAccessibilityProbe`, which reads only
native hint/action metadata, never editor contents. With the TV editor open and
the keyboard dismissed, close **only the current agent-device session**, without
`--shutdown`, to release its UiAutomation lease; the editor stays visible. Android
allows one such lease. Run in the Nix shell:

```sh
python3 tests/device/tv-address-accessibility-probe.py emulator-5554
```

The wrapper requires a nonphysical emulator serial and asserts instrumentation
success as well as exact native hint/text-action results. Reopen the agent-device
session afterwards and reselect the intended IME. This probe is native semantics
evidence, not screen-reader spoken/navigation acceptance.

For inline-error metadata, use the synthetic IME's Exceed address limit action,
positively wait for the fixed too-long message, dismiss the IME and release only
the matching agent-device lease. Add `--error` to the probe invocation; it must
find that native error with a polite live region as well as the editor metadata.
Run on a normal synthetic editor and never submit. This proves announcement
semantics, not actual speech or screen-reader navigation.

## Local phone remote experiment

These automated probes require emulator serials. Enable the development-only `tv-local-remote-experiment`
switch using Chromium's Android debug command-line mechanism, then start the
experiment on the TV and approve the phone. Use synthetic fields only.
The gate requires a non-official local-development-channel build; optimized
non-debuggable APKs qualify when explicitly selected as Android's debug app.
Physical tests require user authorization and a separately specified serial.
[Remote evidence](../../docs/phone-remote-evidence.md) records shared virtual
Wi-Fi setup, exact tested browser versions and tool limitations. The companion
must open the TV's private origin directly; these diagnostic forwards do not
establish LAN reachability:

```sh
adb -s emulator-5554 forward tcp:9222 localabstract:chrome_devtools_remote
adb -s emulator-5556 forward tcp:9223 localabstract:chrome_devtools_remote
```

The QR probe takes explicit TV/phone serials and AVD names plus the pinned TV
agent driver. It requires the native QR panel, refuses secure-window capture,
and writes a new private screenshot file. It verifies the bundled page and
pending approval state; approve separately through the visible native
`Approve phone` action. Never use blind OK injection to approve pairing.

The bundled companion host regression also checks finite paused guidance,
cleared page/editable fields, disabled navigation, reachable Disconnect and tab
restoration after resume. Actual native paused-state probes require exactly
`pauseReason`, `paused` and `revision`; private/security reasons remain generic.

`node tests/device/phone-qr-guards.mjs /absolute/path/to/playwright-core` runs
seven consolidated host CLI negatives using synthetic subprocesses. It never
contacts a device or browser. These guard tests supplement actual native QR
pairing; they do not establish simulator or physical acceptance.

Serve `tests/pages` on host loopback 18088 and use the companion address UI to
open `http://10.0.2.2:18088/phone-remote.html` on the TV. With its plain text field
visible and the companion keyboard panel closed, run:

```sh
node tests/device/phone-native-probe.mjs /absolute/path/to/playwright-core
```

The strict probe requires one exact TV fixture and one companion target across
all browser contexts, then authenticated unpaused normal state, before page
reads or input. `node tests/device/phone-native-guards.mjs` checks missing and
duplicate targets with host-only synthetic subprocesses; it never contacts a
device or browser and supplements actual native-input acceptance.

`phone-fullscreen-recovery-probe.mjs PW TV_SERIAL TV_AVD PHONE_SERIAL PHONE_AVD
DRIVER` supplements fullscreen Back checks with real normal-tab and background
recovery. Both emulator identities and CDP forwards are verified. Approve a
fresh session separately and use a profile without another bookmark workflow
fixture; it creates/removes only its own test tab. It observes document identity,
uses the existing direct-LAN background probe, then verifies native foreground/
Back, full viewport and D-pad cursor pixels without storing a screenshot. The
background phase stops the remote session; re-pair before further phone checks.

`phone-stock-ime-probe.mjs` is a focused stock-TV-IME smoke check. First focus
the normal fixture's plain field through native input, with the verified stock
TV keyboard selected. Pass the existing Playwright directory followed by the
explicit TV emulator serial and verified AVD name; it checks identity, the owned
diagnostic forward and stock LatinIME before contacting the browser. Append the
explicit phone serial and AVD name; its forward must also match. The probe
requires one companion and one exact fixture target matching authenticated
unpaused normal browser state before reading native values. It checks
twenty Unicode replacements, genuine native
input/composition events and stable field identity. A new composition-end event
is required only if composition was still active; the stock keyboard can finish
it earlier. This supplements the complete strict native-input probe and does
not establish phone IME, stale-lease, password or private/security acceptance.

For the composition step, build and select the emulator-only test keyboard:

```sh
ANDROID_SDK_ROOT=/home/nitesh/Android/Sdk bash tests/device/remote-ime/build.sh /absolute/cache/remote-ime
adb -s emulator-5556 install -r /absolute/cache/remote-ime/remote-ime.apk
adb -s emulator-5556 shell ime enable org.bravetv.remoteime.test/.RemoteIme
adb -s emulator-5556 shell ime set org.bravetv.remoteime.test/.RemoteIme
```

Its visible buttons call Android InputConnection with fixed synthetic Japanese
text. It has no command endpoint. The native probe taps above the navigation bar
in its 180-pixel row; this setup is specific to the documented portrait emulator.
After testing, restore `com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME`
with `ime set`, then uninstall only `org.bravetv.remoteime.test`. CDP composition
is retained for the host regression; it is cancelled by the stock Android IME
and is not a valid substitute for this native stimulus.

This sends pointer/edit commands through the actual companion and reads native
renderer results, including live composing state before and after acknowledgement,
composition commit without duplication, selection, deletion, textarea,
contenteditable and password/focus rejection. It resamples coordinates when the
native keyboard pans or resizes the visual viewport. DevTools is automation only; it never assigns the TV field's
value. `phone-remote-ui.mjs` separately checks the bundled UI against a synthetic
server and does not count as device evidence.

`phone-qr-pair.mjs PLAYWRIGHT_CORE ZXING_JAR SCREENSHOT_PATH` decodes the TV
QR with `PhoneQr.java`, opens its invitation in the phone browser and approves
on the TV. It never logs the invitation. Keep the screenshot private until the
single-use invitation is consumed; this checks encoding, not a physical camera.

`phone-protocol-probe.mjs PLAYWRIGHT_CORE` checks that fractional/string protocol
versions, sequence numbers and document identities are rejected while valid
commands still work.

`phone-paused-probe.mjs PLAYWRIGHT_CORE` requires an approved session with a
native modal open or a private tab selected. It sends authenticated actions
directly, bypassing disabled companion controls, and requires native rejection
with only revision/pause metadata. Verify the native owner remains unchanged
afterward and dismiss it using the remote; run separately for both owners.

`phone-reconnect-probe.mjs PLAYWRIGHT_CORE` briefly takes the phone page offline,
checks that an attempted click is discarded, then measures restoration of the
same session and observes subsequent polls for replay. It restores connectivity
in a finally block.

`phone-controls-probe.mjs` uses real phone touch events and current tab rows to
check gestures/navigation/tabs and stale/duplicate rejection. It takes the same
Playwright directory argument. `phone-soak.mjs PLAYWRIGHT_CORE emulator-5554 9223
OUTPUT_JSON` samples an approved foreground session for 30 minutes; start a new
pairing immediately before it because sessions expire after 35 minutes. CPU is
one-core percentage from live process counters; process churn makes that sample
unavailable. PSS includes every browser package process reported by Android.
Neither emulator latency nor CPU is a physical-TV performance claim.

For HTTP rejection/timeout probes, use the phone emulator's netcat against the
TV's exact numeric Host. The listener binds only its private address, so an ADB
TCP forward to guest loopback cannot reach it:

```sh
python3 tests/device/phone-transport-probe.py emulator-5556 TV_IP:TV_LISTENER_PORT
```

`phone-background-probe.py emulator-5554 emulator-5556 TV_IP:TV_LISTENER_PORT`
confirms the listener is active, presses Android Home, observes foreground
departure, then checks listener closure and browser process survival.
It failed on `e0a6bba45` because the UI thread joined the server thread. Also
verify the former listener refuses connections and that returning to Brave
requires a new opt-in/pairing. Remove only these emulator forwards and restore
the original debug flags/network settings after the run.

`shields-probe.mjs startup-cookie-on EMULATOR_SERIAL AGENT_DRIVER.py` observes the already-restored local
`http://127.0.0.1:18081/shields.html` document without navigating or reloading it.
Use after a cold agent-device relaunch with protection and the cookie list on,
and the usual ADB DevTools forward to port 9222. It requires the control script
to load and both blocked fixture execution flags to remain false. Unlike the
reload modes, this checks document effects only; it cannot reconstruct request
events from before DevTools attached. A subsequent `cookie-on` reload passing
does not make a failed startup observation pass.

Use the Nix shell and the API 36, 1920×1080, 320 dpi emulator from
[the emulator instructions](../../docs/emulator.md). Keep T3 attached and retain
its exact launcher, config, serial and session arguments on every agent-device
command. No test clears browser data.

## Cursor and click

`tv-context-probe.mjs PLAYWRIGHT_CORE EMULATOR_SERIAL` requires a normal
`remote-input.html` document with the native pointer positioned over its counter
button, and the emulator's diagnostic DevTools forward on9222. It verifies a real
uinput click first, then holds OK across a same-URL reload and checks that the new
document receives zero clicks. It uses CDP only for navigation/readback and never
assigns an input value. Serial validation restricts this probe to emulators.

Serve `tests/pages` on localhost port 8000 and reverse that port through ADB.
Open `http://127.0.0.1:8000/remote-input.html` through agent-device. Relaunch the
browser so the pointer starts centered, ensure the page is at its initial scroll
position with `Clicks: 0`, and open TV controls with “Address or search” selected.
Deep-link setup is diagnostic; it does not prove remote URL entry.

`dpad-click.jsonl` registers a temporary D-pad-only USB device using Android's
[uinput test command](https://android.googlesource.com/platform/frameworks/base/+/master/cmds/uinput/).
Its Linux key codes are Up 103, Down 108, Left 105, Right 106, Select 353 and Back
158. Numeric configuration codes 100/101 set event/key capabilities. Android
reports `KEYBOARD | DPAD` and non-alphabetic keyboard type 1. It selects Page
cursor, moves down five steps, holds OK for one second and releases. The device
is unregistered when the command exits. Run:

```sh
adb -s "$TV_SERIAL" shell uinput - < tests/device/dpad-click.jsonl
```

Using the returned agent-device invocation, run `wait 'text="Clicks: 1"' 3000`,
then `screenshot /absolute/path/pointer.png`. Check the cursor's white center
and black ring with the existing JDK, without an image-processing dependency:

```sh
java tests/device/CursorScreenshot.java /absolute/path/pointer.png 960 700
```

The onboarding APK delivers the click but fails this visibility assertion. The
cursor correction must pass both. These coordinates and ring size are specific
to the documented emulator; do not apply this pixel assertion to another density
or viewport. Screenshots and logs belong outside Git.

## Idle cursor wake

Use the same centered cursor, initial scroll and `Clicks: 0` preconditions as
`dpad-click.jsonl`. Run `dpad-idle-wake.jsonl` through uinput. It moves onto the
button, waits four seconds, then holds/releases OK once. Assert `Clicks: 0`:
this press must only reveal the hidden cursor. Before idle hiding this fails
with `Clicks: 1`.

Run `dpad-held-click.jsonl` and assert `Clicks: 1`. It moves left then right
to reveal the cursor at the same button before holding OK; this avoids a race
with the idle timer while reading the intermediate result.
This separately proves a visible held press clicks exactly once. Also capture
the idle screen after four seconds and use the pixel check with `absent`;
after a directional wake, check the new position. Do not count click results
alone as evidence that the cursor disappeared.

## Precise input and tab replacement

Open `http://127.0.0.1:8000/precise-input.html`, relaunch to center the cursor,
and leave TV controls open. Restore the native TV keyboard if the helper changed
it. Run `adb -s "$TV_SERIAL" shell uinput - < tests/device/dpad-focus.jsonl`.
Then use agent-device `wait 'id="entry" focused=true' 3000`. The cursor at
960,540 must focus the narrow field and open the TV keyboard. Before the
compositor-dispatch correction this assertion fails even though the cursor
visibly covers the field. Verify D-pad/OK can type a character, Back first
dismisses the keyboard, and the next Back opens TV controls.

For cursor lifetime, activate the centered pointer on this fixture, then open
`http://127.0.0.1:8000/precise-input.html?transition` through agent-device to
create another tab. Capture a screenshot and run:

```sh
java tests/device/CursorScreenshot.java /absolute/path/after-tab.png 960 540 absent
```

This fails on the first rendering correction, which left a ghost cursor on tab
replacement. It must pass with detach cleanup. The two pixel samples check this
known fixture position, not arbitrary screen contents or all cursor positions.

## Keyboard fallback

Reset the same page/controls preconditions, then use agent-device with
`replay tests/device/keyboard-fallback.ad`. Its `tv-remote` command injects events
from an alphabetic virtual keyboard. The click count must stay zero: keyboard
events must retain upstream handling instead of driving the TV cursor. This
replay is not a physical-remote test.

## Native playback controls

With a normal `dialogs.html` tab active and no page history, run
`replay tests/device/tv-playback-empty.ad`. It must reach the no-media panel's
focused Browser controls footer and return to Playback. Inspect the three
disabled actions separately. The regression fails with the null-session crash
on source `9ece2a633`.

Start a finite video in a normal web tab, then open Browser controls → Playback.
Use D-pad/OK to pause and resume; the focused button should change its label
without closing the panel or moving focus. With ADB DevTools forwarded to port
9222, check the actual page state after the native action:

```sh
node tests/device/media-probe.mjs 'EXACT_PAGE_URL' paused
node tests/device/media-probe.mjs 'EXACT_PAGE_URL' playing
```

Pause again and record the reported time. Select Seek forward, then assert the
paused position with an optional third argument (original time + the site's
seek distance, ten seconds for Chromium's native fallback). Select Seek backward
and assert the original time. Avoid the ends of the video. The one-second
tolerance allows media seek precision. The probe only
reads the page; it does not drive the product controls. `adShowing` is a sampled
YouTube DOM signal, not proof that ads cannot appear.

Verify Back restores focus to Playback, a page without media disables all three
media actions, and Home/relaunch closes the old panel. Check tab/document changes
while the panel is open cannot control the previous page. Use the documented
uinput remote for site cursor/fullscreen interactions; native panel navigation
can use agent-device's virtual keyboard.

## Native site dialogs

Open the local `dialogs.html` fixture and activate Alert. Run
`replay tests/device/tv-native-alert.ad` to check actual initial dialog focus,
OK dismissal and Back to browser controls. The fixture can be activated by
an agent ref for setup; the dialog itself is driven by D-pad/OK. Also check
confirmation Cancel/OK, prompt editing/Cancel, and location Block/Back manually.
Do not grant location or accept certificate warnings merely to pass a check.

## Final grouped-tab confirmation

On a disposable normal emulator profile, open `bookmark.html`, long-press its
link and select **Open in new tab in group**. Close the first grouped tab using
TV Browser controls, then close the remaining grouped tab to show **Close tab
and delete group?**. No other normal tabs should remain. With the dialog open:

```sh
python3 tests/device/tv-group-dialog.py emulator-5554 cancel
```

The Cancel probe verifies the fixture URL and reopens the group confirmation.
Then run the same script with `delete`. The probe checks initial Cancel focus,
left/right access to the actual buttons, preservation after Cancel, and native
home/D-pad recovery after Delete.
It intentionally rejects physical serials: its Delete action is for disposable
fixtures. Repeat ordinary site alert/confirm/prompt focus after changes to the
shared modal helper. Do not suppress the group confirmation or automate real
security permission choices.

## Native security fixtures

Run `security-fixture-server.mjs` through the project's Nix Node environment,
passing the pinned Chromium `net/data/ssl/certificates/expired_cert.pem` public
test bundle. It listens only on host loopback18084 (HTTP) and18085 (HTTPS).
Forward these ports only to the explicitly verified nonphysical TV emulator.
`/permission.html` requests location through the real browser API after a native
pointer click; deny using the actual trusted browser/OS prompt. `/auth` always
challenges with a synthetic Basic-auth realm; test Cancel without entering
credentials. The HTTPS fixture must show the native certificate interstitial;
use Back to safety without advancing, bypass flags or trust-store changes.
The server never reads or logs Authorization, request bodies or location data.
Host route checks are fixture validation, not native prompt acceptance.

## Direct first launch

The TV onboarding redesign is superseded: the browser now completes first-run
without consent, referral or default-browser pages. Preserve the existing
isolated incomplete profile to test migration, including its prior enabled
reporting preferences. Verify direct native home, disabled reporting preferences,
focus/keyboard/Back, and a subsequent ordinary restart. Do not reset user data.
The historical onboarding replays were removed because those screens no longer
exist in the TV flow. With a normal native home tab active, run
`replay tests/device/tv-home.ad` to check initial address focus, all four
Compose shortcuts, Settings return focus and entry into the compact controls.
Verify actual GitHub and license navigation, keyboard behavior and private mode
separately. The replay requires a selected normal Home; it does not navigate away
from a restored webpage to manufacture that precondition.

For restored-home coverage, first load a real webpage in a normal tab, select
Home from Browser controls, then run the same replay. Retaining that tab's page
history exercises restoration before the native home view is ready; an unused
blank tab can be discarded at restart and misses this case. Also restart on a
real webpage and confirm Browser controls still open there.

The obsolete mobile-toolbar replay was removed after native Compose Home and
shortcut replays passed on a fresh profile. Use the Home shortcuts above; the
mobile toolbar is no longer a TV navigation precondition. Ordinary webpage
restart and retained native entry-hook checks remain separate acceptance cases.

## TV panels and Shields

`replay tests/device/tv-panel.ad` checks initial focus, D-pad movement, tab
panels and Back restoration on an already loaded webpage. Inspect the whole
panel at 1080p as well; focus assertions do not catch clipped controls.

For Shields, serve `tests/pages` on port 18081, reverse that port, and forward
DevTools with `adb -s "$TV_SERIAL" forward tcp:9222 localabstract:chrome_devtools_remote`. Open
`http://127.0.0.1:18081/shields.html` in the normal profile. Preserve existing
custom filters, then append these two temporary rules in Content Filters:

```text
127.0.0.1###cosmetic-probe
127.0.0.1##+js(set, tvShieldsProbe, true)
```

Run `nix develop --command node tests/device/shields-probe.mjs up EMULATOR_SERIAL AGENT_DRIVER.py`. Use the TV
Site protection panel to turn protection off, run the `down` check, then turn it on
and rerun `up`. Background the browser and allow its asynchronous preference
write before relaunching and checking persistence. An immediate force-stop can
lose the latest site-setting change. The probe reloads the actual browser tab
and asserts observable results; it does not emulate the filtering engine.

With Shields up, the cookie-list preference initially enabled, and the native
Content Filters screen open, run `cookie-on`. Disable Cookie notice blocker,
run `cookie-off`, re-enable it and rerun `cookie-on`. The ordinary ad request
remains blocked in both states. Restore the original preference and custom
filters after testing. The cookie fixture is harmless; its filename matches a
rule in the real list. Screenshots/logs stay outside Git. These local checks do
not establish YouTube ad blocking, signed component updates, or physical-remote
usability of the upstream settings screen.

## Bookmarks

On the dedicated emulator test profile, open `bookmark.html?run=<unique-id>`
in a fresh normal tab with no navigation history. The fixture must not already
be bookmarked, and Mobile bookmarks must be empty for this fixed-order replay.
Do not empty a user's bookmark folder to meet that condition. Run
`replay tests/device/tv-bookmarks.ad`: it adds the fixture, cancels removal once,
opens it, confirms removal, and checks Back returns through folders to controls.
Only the fixture bookmark is removed. Independently navigate another tab to the
saved fixture and restart before removal to check actual navigation and stored
persistence. Pagination, managed-policy and locked-private coverage require
separate setup and are not established by this replay.

## Local search analytics collector

Open `chrome://histograms/Brave.Search.DefaultEngine.4` in the normal profile
through the address bar and forward DevTools on port 9222 as above. Run
`node tests/device/search-metrics-probe.mjs disabled` in the Nix shell after a
browser restart. It awaits the histogram WebUI's native request, then checks
that the default-search collector has produced no sample in this process.
The `enabled` mode is the old-build control; `disabled` fails on the preceding
APK. Repeat after changing search providers. This checks one local collector,
not outgoing traffic or the absence of all Chromium analytics. No preferences,
history or profile data are cleared by this diagnostic.

`replay tests/device/tv-new-tab.ad` starts on a normal native home and checks
that creating a normal tab exposes home with search focused. It fails when the
tab action immediately reopens controls. `tv-private-new-tab.ad` checks the
same handoff from the private tab list, asserting the private-session notice.
Each replay invokes New tab, preserves existing data, and leaves the destination
open. Private reauthentication requires a separate configured-device test.

## Native toolbar tabs

`tv-toolbar-tabs.ad` starts on normal home with two preserved local fixture tabs
before it. It checks D-pad toolbar entry into the native list, then selects
`Current: Home` and requires search focus. The original toolbar opened the phone
grid; source `ef6cabbb4` passes native entry but fails the final focus assertion.
Do not delete other tabs to force these preconditions on a user's profile.


The isolated native
`TvHomePageTest#bookmarkLibraryRestoresNativeSelectionAcrossUpdates` case uses
only its owned folder/bookmarks. It returns from second-page detail, removes a
preceding native bookmark, checks native edit-policy disabling, removes the
focused bookmark externally, renames the survivor and returns to the containing
folder. Require exact focus after each update; D-pad navigation to rediscover a
row is not restoration acceptance. The case restores the original policy and
teardown removes only its owned bookmark IDs. The existing confirmed-removal
case also requires immediate focus on the nearest surviving bookmark.


`TvHomePageTest#bookmarkLibraryPreservesFocusedSaveWhenPolicyDisablesIt`
requires `-e tv_bookmark_fixture_url http://10.0.2.2:18088/bookmark.html`.
It preserves focused Save across native policy disabling/re-enabling and checks
that activating disabled Save creates no bookmark. First-entry focus keeps the
ordinary enabled-action fallback. The selection case also replaces the native
document before Back and checks usable controls after native dialog dismissal.


The isolated `TvTabsPanelTest` cases use only owned synthetic tab IDs.
`largeListPreservesSelectionAndRestoresFrozenNativeDocument` serializes sixteen
real native fixture navigations into frozen tabs, asserts absent WebContents,
crosses the eight-row page, removes preceding/focused owned tabs, requires exact
surviving focus, opens the frozen tab and checks its actual renderer/document.
It closes through the existing TV control with native Undo preserved; teardown
commits only owned pending closures. Existing group and final-tab regressions
carry forward when their connected close behavior is unchanged.
`privateListFromNormalSelectionKeepsSecureWindow` opens the private list while
the normal model remains selected, checks the private dialog FLAG_SECURE and
usable normal return, then removes only its owned private tab. Do not capture
private screenshots or log private payloads. Both cases preserve other models.

## Native history

Serve `history.html` with the other fixtures and visit it in a normal tab. This
is an explicitly disposable history entry, not permission to clear the profile.
From Browser controls select History, then the row titled
`TV history removal fixture`. Verify Open page returns to the fixture; reopen
History, choose Remove from history, require Cancel initially focused, and
cancel. Confirm the entry remains. Repeat removal and confirm; require the
loading state to finish and the fixture row to disappear. Reopen History to
verify persisted removal, check older pages/Back, and check History is disabled
in private controls. Exercise closing the panel during loading and activity
pause. Record actual results separately; this procedure alone is not a pass.

Run `TvHistoryPanelTest#firstPageUsesRealControlsAndRemoteFocus` first with
`-e tv_history_fixture_url http://10.0.2.2:18088/history.html`. Its nine owned
visits enter through the actual controls window and require every Down's exact
row focus before Previous → Right More → OK next-page row1. If it fails, diagnose
that short case before spending time seeding the larger continuation case.

The consolidated `TvHistoryPanelTest#nativeBatchPagingFocusRemovalAndPolicy`
case requires `-e tv_history_fixture_url http://10.0.2.2:18088/history.html`
with the owned fixture server running. It seeds160 unique normal visits to
cross Chromium's150-item continuation, navigates back beyond the retained
window and exercises exact-row recovery, current deletion policy, Cancel,
confirmed removal and native Open. It removes only its unique URL prefix in
teardown and restores the original deletion preference. Run this case alone
with its signed test APK; preserve the production profile and runtime logs.

## Native privacy clearing

Use a separately identified fresh AVD or newly created Android test user/profile
on the emulator, with only local fixtures and a disposable bookmark; do not run clearing against the preserved
main profile. Seed a uniquely named history visit, cookie/localStorage value and
cached fixture. In Settings → Clear browsing data, check all-time wording, the
cookie sign-out warning and Cancel-first focus for each type. Cancel and verify
all seeded data remains. Confirm history only and verify visits disappear while
site storage/bookmarks remain. Confirm site data and verify the cookie and
localStorage disappear after reload while bookmarks remain. Confirm cache and
verify a cacheable fixture must be fetched again. Wait for native completion;
close/pause during another clear and require no late dialog to reopen. Private
Settings must not expose clearing. Preserve this isolated profile afterward for
follow-up rather than wiping or deleting it without authorization.

`tv-home-bookmarks.ad` traverses Address → Controls → Tabs → Bookmarks using
acknowledged D-pad focus, opens the existing
native bookmark list without changing saved data, and backs out to controls.
Its Bookmarks focus assertion fails on the older two-card home (`ef6cabbb4`).

For cache/storage evidence run `nix develop --command node
 tests/device/privacy-fixture-server.mjs` and reverse TCP 18082 through ADB.
Open `http://127.0.0.1:18082/` in the isolated user. Seed site storage once;
reloading does not re-seed it. Repeated cached-file reads should show the same
network-fetch number, and clearing cached files should cause the next read to
increment it. Record storage and history separately from the cache observation.
The server listens only on loopback and exposes only its two fixture routes.

## Ordinary video fixture

Alongside the existing page server on 18081, serve the pinned Chromium checkout's
`src/media/test/data` on loopback port 18083 and reverse that port through ADB.
Use `nix develop --command node tests/device/media-fixture-server.mjs
/home/nitesh/.cache/brave-tv/workspace/src/media/test/data`. This server supports
byte ranges, which the ordinary Python server lacks. Open
`http://127.0.0.1:18081/media.html`. The `bbb-320x240-2video-2audio.mp4` sample exceeds Chromium’s five-second
persistent-session threshold. The media binary stays in the upstream
checkout with its existing notices; the test page does not bundle it.

Use the non-alphabetic remote cursor on Play, then verify native Playback
pause/resume using `media-probe.mjs`. Use the page's Show captions and Fullscreen
buttons with that cursor; verify captions are rendered, the idle cursor hides,
and Back exits fullscreen. Exercise Home/relaunch and tab/document replacement
with the native Playback panel open. The 24-second looping clip does not establish
long-form seeking, adaptive streaming, hardware decoding or sustained playback.

`tv-shields-standard.ad` requires a normal `shields.html` tab with no page
history, protection on, and Aggressive blocking selected. It switches back to
Standard and requires the panel to survive with Aggressive as the enabled
alternative. It fails with the native invalid-mode assertion on `360b81ac7`.
Check reverse selection and restart persistence separately; restore the original
mode afterward. This replay changes only the dedicated fixture origin's mode.

The same native histogram probe accepts an optional exact metric name, for
example `node tests/device/search-metrics-probe.mjs disabled Brave.Core.CrashReportsEnabled`.
Open the matching `chrome://histograms/Brave.Core.CrashReportsEnabled` page
first. Restart the browser process after an implementation change; accumulated
samples from the old process are not evidence of new collection. This checks
local collection, not outbound reporting.

## Independent filter update navigation

`tv-filter-updates.ad` starts in Settings with Search engine focused, the two
bundled optional lists present and Cookie notice blocker On. It enters Filter
updates, performs a real manual check against the public feed, and verifies
Back focus restoration through Content Filters to Settings. It changes no list
choices and does not restart. A check may stage a newer verified feed.

Run with the device/session/config arguments returned by `device_open`:

```sh
agent-device replay tests/device/tv-filter-updates.ad <device/session/config arguments>
```

The waits allow the updater's 60-second request deadline plus UI dispatch. This
replay tests focus/navigation, not whether the returned status is current,
staged or failed. Verify those outcomes and active DAT identity independently;
see [delivery acceptance](../../docs/device-tests.md#signed-delivery-and-tv-update-status-10-october-utc).

## Phone fullscreen and empty-home regressions

With TV `emulator-5554`, phone `emulator-5556`, diagnostic CDP forwards 9222/9223,
fixtures on host 18088 and the media range server reversed on TV 18083, pair the
real phone browser over the emulators' shared Wi-Fi network. Do not run these
probes on a physical device. Use the Playwright directory already supplied by T3:

```sh
node tests/device/phone-fullscreen-probe.mjs PLAYWRIGHT_DIR back
node tests/device/phone-fullscreen-probe.mjs PLAYWRIGHT_DIR phone-back
node tests/device/phone-fullscreen-probe.mjs PLAYWRIGHT_DIR cursor
node tests/device/phone-fullscreen-probe.mjs PLAYWRIGHT_DIR empty
```

The fullscreen cases attach the cursor before playing video, enter fullscreen,
require usable phone input, exit without leaving the document, and check the
native cursor pixels. `empty` closes the normal fixture tabs and requires exactly
one TV home plus a working phone New tab. Only use a disposable emulator tab set.
For physical-remote recovery, leave exactly one normal home tab and run
`python3 tests/device/phone-home-probe.py emulator-5554 --close-last-tab`; this
closes it through native controls and checks D-pad focus on the replacement home.

`phone-loading-probe.mjs PLAYWRIGHT_DIR` records a bounded, ordered on/off/off/on
comparison of companion polling for the local media fixture and one public
YouTube page. Freezing the companion's page suspends its polling, while keeping
the same paired TV listener. It restores the page in `finally`. Results include
load/video-readiness deadlines, navigation timing. This
comparison cannot establish optimized Chromecast performance or separate every
network/cache effect; record individual samples rather than implying a benchmark.

`shields-fixture-server.mjs` serves four fixed resources on host loopback18081.
Run it under the project Nix environment. Verify the emulator's AVD identity,
then use explicit `adb -s EMULATOR_SERIAL reverse tcp:18081 tcp:18081` and
`forward tcp:9222 localabstract:chrome_devtools_remote`. Open only the normal
`http://127.0.0.1:18081/shields.html` fixture. `shields-probe.mjs MODE
EMULATOR_SERIAL AGENT_DRIVER.py` checks that emulator and its exact forward before attaching;
the driver must retain the matching device_open launcher/config/session. Keep
compact native normal Controls focused over the exact fixture. The probe rejects
duplicate targets and revalidates the native owner before reload/read-back;
it performs a diagnostic reload and records request-specific completion or
ERR_BLOCKED_BY_CLIENT. `site-on`/`site-off` need no custom rules; cookie modes
isolate the optional list while ads remain blocked. Existing `up`/`down` also
require the historical temporary cosmetic/scriptlet fixture rules, which must
never be shipped. Native D-pad Shields/filter actions are separate prerequisites.
The Compose standard-mode replay starts with compact controls at Address and
Aggressive selected. Changes reload the page and return to compact Controls;
reenter Site protection to capture the current document before the next change.
The replay changes Standard then restores Aggressive. Keep profiles and restore
original site/list preferences.
Fixture-server checks and counters alone cannot establish native enforcement,
signed-update validation, hardware or LAN acceptance.

## TV native entry and loading checks

For profile-preserving Android updates use the established `agent-device install`
path (verified native `adb install -r`) or explicit targeted `adb -s SERIAL
install -r`. Agent-device0.21.24 `reinstall` performs `adb uninstall` first and
deletes the profile; never use it for upgrade/persistence acceptance. A client
timeout requires inspecting the actual package/artifact before retrying and
does not prove installation succeeded. Preserve every other AVD and all caches.

The focused `TvHomePageTest` cases
`nativeMenuRoutesUseSingleTvPanelAndRetainBrowserOwners`,
`nativeSearchAndTabCommandsUseTvHomeAndAddress`,
`nativeAdblockUrlUsesTvFiltersAndReturnsToSettings` and
`privateNativeLibraryCommandsAreConsumedWithoutChangingOwners` exercise the
real menu/keyboard dispatch and native `chrome://adblock/` interception. Run
each separately with the existing native-JUnit workflow; require `OK (1 test)`
and the installed source provenance. A written case is not runtime acceptance.
The first case checks actual tab/contents/model identity and one Activity plus
one TV window, then rejects a second entry while Settings owns focus. Do not
enable upstream failure screenshots, which can remove private window protection.
The Address/Search case checks both native commands on Home and a real web tab:
Address retains the current URL; Search starts empty without changing contents.

`privateAddressDraftIsDiscardedAcrossActivityRecreation` types an unsubmitted
synthetic draft through the actual editor accessibility action, recreates the
Activity and requires a fresh empty private editor plus the unchanged normal
Home with no draft. Run it separately with source provenance and require
`OK (1 test)`. This is not a process-death, disk-thumbnail or failed-write test.

The renderer-crash case injects genuine `InputDevice.SOURCE_DPAD` Down/Up through
Android UiAutomation. The pinned UIAutomator `pressDPad*` implementation emits
`SOURCE_KEYBOARD` from the alphabetic virtual keyboard and therefore bypasses
the physical TV adapter intentionally. Preserve that keyboard/IME guard;
successful key injection alone is not recovery acceptance.

The existing loopback `security-fixture-server.mjs` `/slow.html` route now
streams a centered `Native loading click` target and zeroed `#clicks` counter
before holding completion for15seconds. Retain two-request bounds and cleanup
on Stop/disconnection. Its host `security-server-check.mjs` verifies the
streamed target, counter, method/HEAD behavior and released slots. For Stage3.3,
use the verified TV emulator and explicit18084 reverse, navigate with native
Chromium, require it still loading, open controls and activate Page cursor
exactly once. Check controls dismissal, actual content focus, fresh viewport
cursor coordinates and one real click separately. Do not retry a failed initial
activation into a passing claim or substitute DOM assignment for native input.
