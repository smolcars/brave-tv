# TV device regressions

## Local phone remote experiment

Use only emulator serials. Enable the debug-only `tv-local-remote-experiment`
switch using Chromium's Android debug command-line mechanism, then start the
experiment on the TV and approve the phone. Use synthetic fields only.
[Remote evidence](../../docs/phone-remote-evidence.md) records shared virtual
Wi-Fi setup, exact tested browser versions and tool limitations. The companion
must open the TV's private origin directly; these diagnostic forwards do not
establish LAN reachability:

```sh
adb -s emulator-5554 forward tcp:9222 localabstract:chrome_devtools_remote
adb -s emulator-5556 forward tcp:9223 localabstract:chrome_devtools_remote
```

Serve `tests/pages` on host loopback 18088 and use the companion address UI to
open `http://10.0.2.2:18088/phone-remote.html` on the TV. With its plain text field
visible and the companion keyboard panel closed, run:

```sh
node tests/device/phone-native-probe.mjs /absolute/path/to/playwright-core
```

This sends pointer/edit commands through the actual companion and reads native
renderer results. DevTools is automation only; it never assigns the TV field's
value. `phone-remote-ui.mjs` separately checks the bundled UI against a synthetic
server and does not count as device evidence.

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

`shields-probe.mjs startup-cookie-on` observes the already-restored local
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

## Direct first launch

The TV onboarding redesign is superseded: the browser now completes first-run
without consent, referral or default-browser pages. Preserve the existing
isolated incomplete profile to test migration, including its prior enabled
reporting preferences. Verify direct native home, disabled reporting preferences,
focus/keyboard/Back, and a subsequent ordinary restart. Do not reset user data.
The historical onboarding replays were removed because those screens no longer
exist in the TV flow. With a normal native home tab active, run
`replay tests/device/tv-home.ad` to check initial address focus, the controls and
attribution actions, and entry into the browser panel. Verify actual GitHub and
license navigation, keyboard behavior and private mode separately.

For restored-home coverage, first load a real webpage in a normal tab, select
Home from Browser controls, then run the same replay. Retaining that tab's page
history exercises restoration before the native home view is ready; an unused
blank tab can be discarded at restart and misses this case. Also restart on a
real webpage and confirm Browser controls still open there.

`replay tests/device/tv-toolbar-menu.ad` starts from the same normal home,
reaches the toolbar menu from the controls card, then asserts that D-pad Select
opens the native panel. Its original center-key assertion failed while touch
activation worked. The card-to-toolbar approach changed with the home layout;
the menu-focus/Select/panel assertion is unchanged.

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

Run `nix develop --command node tests/device/shields-probe.mjs up`. Use the TV
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

## Native privacy clearing

Use a newly created Android test user/profile on the emulator, with only local
fixtures and a disposable bookmark; do not run clearing against the preserved
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

`tv-home-bookmarks.ad` checks the third home card with D-pad, opens the existing
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
