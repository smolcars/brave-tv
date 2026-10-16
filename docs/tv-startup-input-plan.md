# Startup chrome and explicit text editing

16 October 2026. The user requests implementation of two corrections: the
mobile URL bar must not flash during ordinary TV startup, and directional
navigation must highlight webpage text fields without opening the keyboard.
OK begins editing; Back dismisses the keyboard and arrows resume navigation.

## Implementation sequence

1. Record native regressions before production edits. Exercise Chromium's
   transient toolbar-show request on native Home, and genuine SOURCE_DPAD
   navigation into a text field while observing native IME show requests.
   Add first-draw startup observation rather than accepting only a settled
   full-height Home. Retain the existing persistent-show/security checks.
2. Remove the TV's mobile transient toolbar hold before layout initialization.
   Initialize the TV controls in their hidden position before the first draw.
   Keep explicit persistent native owners, errors, security warnings and
   non-TV behavior. Verify launch, restored Home, resume and tab changes.
3. Reuse Chromium's per-WebContents keyboard suppression during element
   navigation. An editable selection consumes short OK as explicit native
   keyboard activation, without an Enter/form submission. Directional movement
   suppresses automatic keyboard requests again after dismissal. Release the
   borrowed suppression on pointer mode, native owner transfer, tab/document
   change, pause and destruction; preserve native InputConnection/IME typing,
   physical keyboards, phone typing, private guards and held-OK cancellation.
4. Build from retained x64 and optimized non-debuggable ARM caches with blocking
   Android analysis. Run the focused native regressions plus existing input,
   pointer, navigation, private/security and full-height Home checks. Install
   the verified ARM APK on the authorized Chromecast using an in-place update
   first; the existing explicit storage fallback authorization remains limited
   to our browser. Preserve other devices, Android profiles and build caches.
5. Record exact revisions, APK hashes, passing/failing attempts and captures.
   Restore task-owned forwarding/settings and return the TV to normal Home.

## Initial evidence and hypotheses

The baseline ARM build remains installed on Chromecast. The baseline x64
emulator reproduces a native keyboard-show request after one injected Down on
an owned fixture: `mInputShown=true`, without OK. Gboard's actual window may
remain hidden with the emulator's hardware-keyboard configuration, so native
IME show requests and visible keyboard acceptance are recorded separately.
Initial fixtures also skipped intermediate targets; a native one-event test
must distinguish key repetition from focus/scroll/IME transitions.

Ranked predictions: removing only Chromium's transient visibility hold should
eliminate the normal startup delay while persistent showing still works;
per-contents suppression should stop field-focus keyboard requests while
explicit OK and pointer clicks still show the native editor; a native single
D-pad pair should distinguish repeat delivery from the focus policy.

Probe files: `~/.cache/brave-tv/probes/startup-input-20261016/`.
Existing unrelated phone-work artifacts and shared fixture services are
outside this slice. A build or a settled screenshot alone does not accept
first-frame startup or keyboard behavior.

## Native baseline

Test-only source `c2d62788d` supplies red-capable checks. On the unchanged
production implementation, the transient-show check fails HIDDEN versus SHOWN,
the field check reports `NeverWantedButInvoked` for native `showSoftInput`, and
the first-draw check fails “Mobile toolbar was visible in a startup frame.”
The first instrumentation attempt conflicted with the device controller's
UiAutomation owner; closing only this task's matching agent-device session
resolved it. The first startup test also used an upstream waiter requiring
mobile `NewTabPage`; its TV-specific waiter correction establishes the actual
first-draw failure. Original failed harness attempts are preserved.

The scoped implementation uses the existing TV pre-inflation hook to disable
the mobile three-second transient hold. A native controls-hiding token covers
inflation until the selected tab publishes HIDDEN or SHOWN; the native manager
applies that position before the token is released. Explicit persistent native
showing remains unchanged. Keyboard suppression is borrowed only for the active
document's element-navigation owner. Short OK on an editable selection uses
the native keyboard delegate, without sending Enter or submitting the form.

The first corrected build passes transient-show and explicit-OK checks but
exposes two narrower failures. Diagnostics show the very first toolbar draw is
112 px high, with the hiding token already held and no selected tab: the native
manager's visibility update is deferred. Initialize the inflated TV toolbar
view as INVISIBLE while that token owns startup. No blanket hiding remains
after native tab classification.

Text/search/password inputs and textarea traversal pass; populated
`contenteditable` remains selected because Chromium's editor consumes the
direction as caret movement before spatial navigation. Prioritize the existing
native navigation handler for unmodified arrows while spatial navigation is
enabled. Explicit OK disables spatial navigation for actual editing; remote
navigation reenables it after dismissal. Physical keyboards and pointer/touch
activation retain native editing ownership. This requires one narrow Blink
patch, incremental patch application and actual x64/ARM native compilation;
do not substitute Tab order or a JavaScript navigation tree.

The corrected first-frame and all five editor-type checks pass on `70cabc3ca`,
including actual native typing/caret movement and return after dismissal.
The strengthened persistent-show check then exposes a native-page observer
ordering gap: the activity manager processes SHOWN before the tab publishes
that state, retaining its hidden offset. Apply native positions after either
published HIDDEN or SHOWN, while retaining authoritative composed constraints,
active-tab/lifecycle guards and observer disposal. This preserves explicit
native fallback visibility rather than accepting state alone as proof.

## Verification progress

The native persistent-show correction is `10c91b41c`. The first 12 checks of
`diag-r6` passed, including first-draw startup, native showing, five editable
types and explicit editing. The emulator then became offline because
systemd-oomd killed its process; the last nine entries are interrupted checks,
not product failures. Its AVD data and original logs are preserved.

The editing-return check failed intermittently in earlier runs. Diagnostic
`b52f2fc65` removes a page key listener that can change timing and records
native input ownership, page/window focus, keyboard insets and caret position
on failure. The failing case retained element mode, page/window focus and no
native UI owner, but the first arrow did not move the selection. The test had
edited and hidden the keyboard without waiting for its window to open.
Revision `6b49003d6` first waits for actual visible IME insets, then exercises
native text insertion/caret movement, dismissal and the first arrow. This
passes three consecutive independent invocations without a page key listener.
The hardware fixture also removes its diagnostic key listener.

All other 20 native checks passed at `ddc71b787` on the recovered emulator,
including private-window protection, pointer switching, both frame cases,
scroll edges/nested panels, held OK, phone input and fullscreen. Matching x64
browser + TEST APKs at `6b49003d6` compile with blocking analysis in 4m11.87s,
verify with APK v2 and install without clearing data. The first-draw startup
check also passes again on that version, which includes the separately
requested compact footer and header navigation. Project checks pass: 20 tests,
strict mypy for 15 files and both Nix flake checks.

On the physical Chromecast's previous `d8a0ebb90` APK, one genuine uinput Down
into the owned fixture opens the unchanged stock Gboard without OK:
`mInputShown=true`, `mIsInputViewShown=true`. This supplies a hardware baseline.
The active profile, all four Android users, display override and stock IME are
recorded before the update. The final update will also include the separately
requested footer refinement, with one final ARM build after that source settles.

## Final ARM candidate

Source `6b49003d65f905fbd16aff8992fd6b6a33861954`, including the compact
footer/header follow-up, builds in the retained optimized ARM cache in
4m10.83s with blocking Android analysis, `symbol_level=0` and debugging off.
APK v2 verifies; its certificate matches the previously installed TV APK.
Package/version remain `com.brave.browser_default` / `1.97.0` / `429700000`,
ABI `armeabi-v7a`.

Artifact directory:
`~/.cache/brave-tv/artifacts/startup-input-6b49003d6-20261016/`.
APK: 368,555,595 bytes; SHA-256
`62ac06402e4cac0e04cf531adf3343a5831f127a540e5d6a1d1d2d05303d19c6`.
The APK, exact GN args, source, signature/badging output, build timing and
machine-readable provenance are preserved there. The independent final
footer/header review reports SHIP; its 1.3-font footer destination and narrow
focus checks pass. Those visual changes are documented separately under
`.impeccable/review/footer-redesign/`.

## Physical TV acceptance and handoff

The verified ARM APK is installed on the authorized Chromecast
`192.168.4.50:41531` (Android 14, ARM32). The in-place update failed with
`INSTALL_FAILED_INSUFFICIENT_STORAGE`. The authorized fallback used
`cmd package uninstall -k --user all com.brave.browser_default`, followed by
installation of the same-signed final APK. No data-clearing uninstall ran.
Android retained app ID `10141` and user-0 data inode `81460`; the installed
APK's on-device SHA-256 matches the archived artifact. Both existing owned
fixture tabs restored, then were closed through the native browser controls.

| Hardware check | Result |
| --- | --- |
| Nine directional moves through text/search, textarea and populated rich text | Correct target each time; no keyboard, edits or submissions |
| Short OK on text field | Actual unchanged stock Gboard opens |
| Remote OK on Gboard's Q key | Native field value `Q`; one input event, no submission |
| Back, then Down after keyboard dismissal | Search field selected; keyboard stays closed |
| Rich-text OK, Back and subsequent Down | Keyboard opens only for OK, closes on Back, next button selected |
| Held OK to pointer, Up, held OK back, Up | Pointer movement retains DOM target; element movement then selects rich text |
| Cold launch through real MAIN + LEANBACK launcher intent | Home returns with no URL-bar flash in recorded startup; native first-draw test also passes |
| Final Home | Four favorites, compact tabs and footer present; normal Home restored; no open test pages |

The deliberately rapid Back/Down probe (120 ms between keys) did not move the
selection during Gboard dismissal. The next Down after the keyboard window
was absent worked. Native IME ownership during its closing transition is
preserved; this change does not buffer directions addressed to the keyboard.
The keyboard's internal `mIsInputViewShown` flag can remain true after its
window closes, so acceptance uses the visible-window snapshot and native
client `mInputShown` instead. The first hardware harness also encountered the
internal flag's absence while the IME service was unbound; original logs and
all snapshots remain in the probe directory.

Startup evidence: `tv-cold-start-r2.mp4`, its contact sheet and
`tv-final-home.png` under the probe directory. Android reports a COLD activity
launch of 1,313 ms; this is the activity metric, not a measurement of complete
Home rendering. The initial developer launch omitted MAIN and was ignored by
the launcher; that invalid probe is retained separately as
`tv-cold-start-r1-no-action.mp4`. The valid retest uses the actual TV launcher
alias, MAIN action and LEANBACK category.

The native URL bar remains available for Chromium's explicit editing/security
owners. The fix removes the mobile startup exposure while keeping those native
paths. Verification covers the native fixture types and existing input/privacy
regressions; it is not a site-by-site compatibility sweep.

The stock IME and enabled input methods, display override 1920×1080/density320,
active user0 and all four Android profiles remain unchanged. Only the owned
port18118 forwarding and HTTP fixture process were removed. Emulator font1.0
and test storage app-op default are restored by the coordinated UI check.
The physical automation session is closed, and normal production Home is
relaunched with the valid TV launcher intent for handoff. Build outputs,
probe logs, captures and other agents' work are preserved.
