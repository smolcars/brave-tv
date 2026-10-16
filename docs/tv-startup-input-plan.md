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
