# TV page navigation

Approved interaction: webpage arrows move between nearby visible selectable
elements; another Down at the visible edge scrolls to reveal more. Repeated
Down continues navigating/scrolling, with no wrap at the document end. Nested
scroll areas are traversed before their parents. Short OK activates once.
Hold OK switches between element navigation and a pointer at the selection;
pointer movement remains available without opening browser controls.

## Implementation

1. Enable Chromium's existing spatial navigation only in the TV process and
   control it per active WebContents. Forward trusted arrows to Chromium in
   element mode, retaining its candidate search, keyboard activation and
   nested-scroll behavior. Avoid a JavaScript navigation engine.
2. Extend the current remote policy with element mode and a canceled-safe
   hold-OK toggle. Retain pointer/scroll operation, idle wake, one activation on
   release, and session identity checks. Native dialogs, IME, security UI,
   private locks and fullscreen players retain input priority.
3. Automatically enter page navigation after a real webpage gains native
   ownership. Retain explicit controls through Back and add a named element
   navigation action beside the existing pointer action. A brief mode hint
   explains arrows, OK and hold OK. The native overlay supplies a visible
   selection ring and preserves position when switching to pointer.
4. Read only the current selected element's geometry in a bounded isolated
   renderer world; never enumerate page content, persist URLs/text, or build a
   synthetic focus tree. Validate rectangles and discard responses after
   tab/document/viewport or native-input ownership changes. Custom controls
   and remote frames retain the pointer fallback.

## Verification

- JVM policy cases: element directions, short OK, long OK without accidental
  activation, canceled/lifecycle-interrupted presses and repeat ownership.
- Native fixtures: two-dimensional target choice; hidden/covered targets;
  Down at visible edge, repeated scrolling, nested scroll and document end;
  trusted activation once; editable/native keyboard; pointer toggle/location;
  Back/controls return; tab/navigation and fullscreen interruption.
- Preserve private Home/window guards and existing normal bookmarks. Run
  focused Android tests, blocking x64/ARM builds, baseline/larger-text native
  captures and a bounded sample on ordinary public websites.
- Record exact source revisions, logs, signatures, APK hashes and acceptance
  limits. Preserve cached outputs and install on the isolated TV emulator
  without clearing data. Physical-TV acceptance remains separate.

## Delivered

Implemented in `d8a0ebb90`; the final native suite passes all twelve checks.
The optimized non-debuggable ARM APK and emulator x64 APK are preserved with
checksums and exact build provenance. See [acceptance evidence](tv-page-navigation-evidence.md).
Physical-TV timing and broader website compatibility remain separate acceptance.
