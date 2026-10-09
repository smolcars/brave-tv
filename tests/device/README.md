# TV device regressions

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

## Onboarding

`replay tests/device/onboarding-focus.ad` requires an incomplete first run on
the Web Discovery page. Do not reset an existing profile to meet that condition.
