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
