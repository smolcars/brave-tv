# Streaming starter favorites

13 October 2026. Source `97729c57168e26a4582a55222b9922b4b44001fc` adds the
user-requested YouTube, Netflix, Prime Video and Twitch bookmarks. Disney+ is
excluded. The four entries use their official HTTPS homepages and locally
bundled official marks; [asset provenance](tv-starter-favorites-assets.json)
records each publisher, original file and native resource hash. Twitch's exact
official SVG geometry is converted to an Android vector; the three PNGs carry
their origin metadata. Logos retain their colors/aspect ratio and occupy the
existing 28dp identity slot. Other favorites retain their site initial.

Seeding runs once after bookmarks load on normal TV Home. A registered local
per-profile preference prevents duplicate initialization and keeps removed
starters removed. Bookmark editing policy is respected. Recognized existing
service bookmarks keep their title, URL and position; missing entries append
to the existing native folder. The six-card Home limit remains, with the full
folder available through Favorites. Private Home does not seed or display normal
bookmarks. There is no new feed, image request, remote-control API or dependency.

## Acceptance

- Six native instrumentation tests pass: starter deduplication/title preservation
  and removal across Activity recreation; editing-policy/private exclusion;
  saved-page activation; focused-favorite removal; private preview exclusion;
  and narrow Home focus/callbacks. Logs: `~/.cache/brave-tv/logs/streaming-starters-native/`.
- Twenty project tests and strict mypy over 15 files pass.
- Debug x64 and optimized, non-debuggable ARM development APKs pass blocking
  Android analysis. The resource rebuild takes 7m20.66s on x64 and 7m41.28s on
  ARM (Siso timings), reusing retained outputs. Final revision checks are no-op
  builds; the final instrumentation target rebuild passes in 19.91s.
  Both preserved APKs pass signature verification with one v2 signer.
- The in-place emulator update preserves the existing bookmark's title and URL
  and adds exactly one of each selected service. Local before/after records are
  archived with the APK provenance; existing profile data is not cleared.
- Native 1080p captures at font scales 1.0 and 1.3 show all four marks/names,
  visible focus and retained artist credit. The existing design tokens, Home
  geometry and unrelated panels remain unchanged. No HTML/CSS detector applies
  to this native extension.
- Actual D-pad traversal reaches all four streaming favorites from Search and
  returns focus to Search, preserving the existing first bookmark's position.

The new lifecycle test initially checked a restored tab before it existed. Its
wait now includes native tab/attached Home readiness and completion of seeding;
the private test creates a new private Home with seeding incomplete. Both pass
on the final test APK. No production code changes followed the native captures.

[Home](../.impeccable/review/streaming-starters/home.png) ·
[Home with larger text](../.impeccable/review/streaming-starters/home-large.png)

Final APKs, GN arguments, exact revisions, SHA-256 hashes and build evidence:
`~/.cache/brave-tv/artifacts/streaming-starters-97729c571-20261013/provenance.json`.
The root DESIGN.md and sidecar record the site-identity extension; existing
palette, typography, shapes and layout tokens are preserved.

Physical-TV installation, account sign-in and streaming playback are not
established by this bookmark/visual acceptance.
