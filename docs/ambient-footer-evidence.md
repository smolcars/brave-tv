# Ambient Home footer

13 October 2026. Source `0cd7165ed` completes the requested footer on normal and
private TV Home. Normal Home reads “A simple browser with ad blocking and private
browsing.” Both modes show “Built on Brave and Chromium · Thanks to their
open-source contributors,” “Photo: Luca Bravo / Unsplash,” and a native GitHub
action opening `https://github.com/smolcars/brave-tv` in the current tab.
Private Home retains its existing session explanation below the heading.

The footer reserves its own height below the scrolling Home content, so larger
text cannot overlap the cards or credits. It reuses the existing quiet TV button
and native URL loading. Shields, private tabs, normal/private data separation
and native screenshot protection are unchanged. The photo's Italian place name
was replaced with a clear English attribution label; artist attribution remains.

Five native tests pass on implementation `6475bcd4b`: Home footer text/project
destination and current-tab ownership; narrow Home focus/callbacks including
GitHub; saved-page activation; private section exclusion; and private Home/menu
window protection. Logs: `~/.cache/brave-tv/logs/ambient-footer-native/`.
The final user-selected sentence changes only one resource string. On final
source `0cd7165ed`, the native footer destination/text check passes again at
1.3 text scale: `~/.cache/brave-tv/logs/ambient-footer-native-r2/`.

The in-place emulator update preserves all five existing bookmark IDs, titles,
URLs and order compared with the previous verified update. D-pad Down reaches
GitHub from Search through Favorites and Continue browsing at 1.3 text scale.
Native 1080p captures confirm legible credits and the final wording at both
1.0 and 1.3. Larger text permits the foreground to scroll; the footer remains
outside that viewport. Text scale is restored to 1.0 afterward.

[Final Home](../.impeccable/review/ambient-footer/home.png) ·
[Final Home with larger text](../.impeccable/review/ambient-footer/home-large.png)

Debug x64, the instrumentation APK, and optimized non-debuggable ARM builds pass
with blocking Android analysis. Initial Siso builds take 6m47.08s on x64,
50.57s for tests and 7m37.25s on ARM. The final text-only resource updates take
1m34.40s, 20.67s and 1m55.95s respectively. Both development browser APKs pass
signature verification with one v2 signer. No Chromium patch or dependency
change, initialization, cache deletion or public release occurs in this slice.

Final APKs, source/project revisions, GN arguments, signatures, SHA-256 hashes
and logs are recorded under:
`~/.cache/brave-tv/artifacts/ambient-footer-0cd7165ed-20261013/`.

Physical-TV installation, streaming and ad-blocking effectiveness are not
retested by this footer change.

## Compact footer and navigation, 16 October

UI commits `ddc71b787` and `0b103706d`, included in final source
`6b49003d65f905fbd16aff8992fd6b6a33861954`, refine Home within Ambient. The
footer now reserves 64dp at the baseline TV size, down from 80dp. Regular 12sp
description text sits above quieter regular 11sp credits. Upstream and photo
credits share a flowing row, preserving every word and wrapping when needed.
The icon-only GitHub action uses the official 2026 Invertocat from
[GitHub's brand archive](https://brand.github.com/foundations/logo), with its
original path and 98×96 aspect ratio recorded in the native drawable.

Home, Tabs, Favorites and Phone now use content-sized pills with 8dp gaps and
48dp minimum target height. Removing the compact labels' extra inner vertical
padding keeps the controls smaller while preserving native focus and selected
Home semantics. All four navigation items fit on one row at both captured text
scales; other Home actions and data ownership retain their existing behavior.

Final native 1920×1080 captures:
[Home](../.impeccable/review/footer-redesign/home-final.png),
[larger text](../.impeccable/review/footer-redesign/home-large-final.png),
[Tabs focused](../.impeccable/review/footer-redesign/nav-focused-final.png), and
[GitHub focused with larger text](../.impeccable/review/footer-redesign/github-focused-large-final.png).
The independent [full footer/navigation review](../.impeccable/review/footer-redesign/finish-review-final.md)
returns `ship` with no material fixes. DESIGN.md and its maintained sidecar
match the implementation. No HTML/CSS detector applies to this native UI.

Final x64 APP+TEST builds pass blocking Android analysis in 4m11.87s. The
optimized, non-debuggable ARM build passes in 4m10.83s; both browser APKs pass
v2 signature verification. Existing caches are reused without initialization
or deletion. At final source, native footer destination/current-tab ownership
and narrow Home focus/callback checks pass separately at 1.3 font scale. The
coordinated startup/keyboard run also passes its final first-draw check and
three real-IME editing-return repetitions. Its 20 wider checks at `ddc71b787`
include private-window protection, which was interrupted by emulator loss in
the initial footer run and passed after recovery. All 20 project tests pass.

Font scale is restored to 1.0, the TEST storage app-op to default, and the
emulator to normal production Home without an active agent-device session.
The shared startup/keyboard thread owns the final physical-TV update and its
hardware acceptance evidence; these captures and scoped checks use the TV
emulator.

Artifacts and provenance:
`~/.cache/brave-tv/artifacts/footer-nav-6b49003d6-x64-20261016/` and
`~/.cache/brave-tv/artifacts/startup-input-6b49003d6-20261016/`.
Focused check logs are in
`~/.cache/brave-tv/probes/footer-redesign-20261016/`; coordinated build/native
logs are in `~/.cache/brave-tv/probes/startup-input-20261016/`.
