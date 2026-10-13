# TV webpage navigation

13 October 2026. The [engineering plan](tv-page-navigation-plan.md) is implemented
in source `d8a0ebb90`. Webpages enter element navigation automatically. Remote
arrows select nearby visible targets, then scroll an eligible container when
there is no next visible target. Nested panels scroll before the document.
Repeated Down continues to the document end, where it stops without wrapping.
Short OK activates once. Hold OK for 650ms switches to/from the existing pointer;
it starts at the selected element when a valid selection rectangle is available.
Both actions remain accessible through browser controls: “Jump between elements”
and the existing “Browse page” pointer action.

Chromium performs candidate selection, scrolling and trusted keyboard activation.
The TV adapter controls native spatial-navigation preferences per WebContents;
it does not enumerate page content or implement a JavaScript navigation tree.
A bounded query in Chromium's isolated renderer world reads only the current
selection's rectangle. Native tab/document/viewport and input-owner checks reject
stale responses. Ordinary scroll clipping and a second settling read keep the
mint outline aligned. The brief 16sp hint respects system text scale; the outline
persists when the hint fades. Pointer idle wake and existing edge scrolling remain.

Native keyboards, dialogs, security UI, private-tab locks and fullscreen players
retain input priority. Unsupported focused remote/cross-origin frames switch to
the pointer. The hint explains clicking outside and holding OK to return to
jumping. Frame origin/process checks protect Chromium's local-frame assumptions.
Canceled, interrupted and stale OK presses cannot activate a replacement document.

## Acceptance

All twelve native checks pass on final source `d8a0ebb90`: two-dimensional target
selection and held-OK switching; hidden/covered targets; held direction across
title updates; same-origin iframe navigation; cross-origin pointer fallback and
return; visible-edge/document-end scrolling; nested scrolling; native text entry;
canceled OK across document replacement; existing virtual-keyboard D-pad pointer
behavior; fullscreen exit; and private Home/window protection. The held-OK checks
use real 750ms waits outside the UI thread. Logs: `page-navigation-native-r6/`.

Earlier frame fixtures needed an explicit native click instead of sandboxed
autofocus, then an unambiguous return target. A fullscreen check timed out in an
initial mixed run and passed in isolation and both complete final runs. Original
logs are preserved alongside the passing results.

The 20 project tests, strict mypy over 15 files, and Nix flake checks pass.
Blocking Android analysis remains enabled in x64 Debug and optimized,
non-debuggable ARM Static builds. Four local jobs, 18/22 GiB memory bounds and
no build swap are retained. The final x64 resource build takes 1m38.08s,
instrumentation 20.85s, and ARM 4m10.34s. The implementation's initial full resource builds take 6m49.98s on x64
and 7m46.32s on ARM. Both final browser APKs verify with one v2 signer.

Actual native captures verify the selection ring, the pointer at the selection,
normal text and 1.3 text scale, and the menu's two-column reflow at larger text.
The local fixture is a test webpage, not Home feed content. The captures use
production `829f38388`; later changes add immediate frame fallback and clarify its
hint without changing these captured Home/menu/ordinary-page styles.

[Element mode](../.impeccable/review/page-navigation/elements.png) ·
[Pointer mode](../.impeccable/review/page-navigation/pointer.png) ·
[Larger-text cue](../.impeccable/review/page-navigation/elements-large.png) ·
[Larger-text menu](../.impeccable/review/page-navigation/menu-large.png)

Wikipedia's public home page retained its native search-field focus and editing
behavior during the bounded sample. Example.com's current informational page
has no selectable controls in the native snapshot; it replaces the former single-link page assumed by the smoke check.
The fixed native fixtures establish target-selection behavior; public sampling
does not establish general website compatibility. Android's general keyevent automation
uses keyboard source; native remote verification explicitly uses D-pad source,
including an actual 850ms hold. Private screenshot protection is never removed.

## Artifacts and limits

Final source, project build pin, Chromium revision, APK sizes/hashes, GN arguments,
signatures, build logs and native test logs are preserved under:
`~/.cache/brave-tv/artifacts/page-navigation-d8a0ebb90-20261013/`.

The final x64 APK is installed in place on the isolated emulator. All five
existing bookmark IDs, titles, URLs and ordering match the baseline, including
the four requested starter favorites. Text scale is restored to 1.0. Browser
data is retained. Test-only storage access is restored after instrumentation.

The selection engine follows a page's native focusability and keyboard handling.
Custom widgets, canvas controls, closed shadow content and unsupported frames may
need the pointer. This is development-signed software. Physical-TV installation,
remote timing, streaming playback and broad website compatibility are separate
acceptance work; the emulator checks do not establish those results.
