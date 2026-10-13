# Ambient native implementation evidence

13 October 2026. The approved Ambient design is implemented in native Android
TV Home, the browser drawer and Phone. Source: `8aab2fb281c304acf31ed61ce1c4ad08ede4effd`.
This is an implementation and emulator acceptance record. Physical Chromecast
and real-phone acceptance of this revision remain outstanding.

## Shipped behavior

Home uses one bundled, credited landscape, a contrast scrim, local clock,
Home / Tabs / Favorites / Phone navigation, Settings and browser controls.
The dominant search pill opens the existing native address editor with the
selected provider. Favorites and Continue browsing use real native models,
stable bookmark/tab identities and the existing six/four limits. Source,
license and Brave/Chromium attribution remain in the native About route.

Search starts focused. Up reaches Home; Down reaches the first favorite,
otherwise the first recent page. The right-side drawer contains all 17 existing
actions on one level, with Browse, Your library, This page and Browser groups.
Rows use their tallest label's height. Native font scaling reduces the column
count and scrolls the panel without reducing text. Existing callbacks, enabled
state, input ownership, activation and Back behavior remain native.

Phone is available without a local-build or experimental-switch gate. Home
observes sanitized state while attached, including when restored Home precedes
controller construction. The listener starts only on explicit Phone entry.
QR/manual invitation, separate TV approval, Continue browsing, cancellation,
retry and Disconnect use the existing session owner. Invoker focus survives
label changes and panel dismissal. The webpage badge remains available outside
Home; private Home disables Phone and omits normal saved/recent previews.

The transport remains **Local connection · Not encrypted**, disclosed on both
TV and companion. Single-use invitations, one phone, exact Origin/Host checks,
command sequencing, private/protected input guards and foreground ownership
remain. The two-minute invitation, two-minute idle and 35-minute absolute session
limits are unchanged. HTTPS research is a separate workstream.

## Verification

- Twenty project tests and strict mypy over 15 files pass. The pinned-submodule
  Nix flake check passes both source-tools and toolchain checks.
- Eight native instrumentation tests pass: narrow Home focus/callbacks; narrow
  drawer update/Back; Home Settings return; unflagged Phone cancellation/focus;
  saved-page opening; focused-favorite removal; private Home preview exclusion;
  and restored Home receiving a real Phone connection after activity recreation.
- The updated 20-step Home replay passes native navigation, Settings return
  and drawer entry; the updated 22-step drawer replay also passes.
  Legacy replay scripts use the new captions/group paths;
  unexecuted scenarios retain their explicit prerequisites and acceptance limits.
- Actual D-pad traversal reaches all 17 drawer actions at font scales 1.0 and
  1.3. Native captures show Home, drawer, pairing and connected states at 1080p;
  larger text wraps navigation and preserves QR quiet zones and visible actions.
- A client through an emulator NAT redirect serves the real bundled companion,
  consumes a single-use invitation, fails command admission before TV approval,
  and is rejected with the wrong Origin. Explicit native TV approval updates Home
  to Phone connected. Back preserves the approved connection; Disconnect revokes
  it and closes admission. Pairing cancellation closes the listener. Every
  captured invitation is revoked and the redirect is removed after testing.
- An in-place APK update preserves the seeded bookmark file byte-for-byte and
  the existing loaded webpage. The preserved native favorite opens successfully.
  This does not claim every unused native Home tab survives Chromium cleanup.
- Private screenshot protection remains enabled. Test certificate access is
  confined to the instrumentation process; its temporary storage app-op is
  restored. Production trust and permissions are unchanged.

Final native logs: `~/.cache/brave-tv/logs/ambient-native-8aab2fb28/`. Build logs and GNU Time
records: `build-ambient-x64-20261013-r7.*`,
`build-ambient-x64-20261013-r7-tests-success.log` and
`build-ambient-arm-20261013-r3.*` under `~/.cache/brave-tv/logs/`.

Both development APKs build with blocking `android_static_analysis=on` and pass
APK v2 signature verification. Final incremental build wall times are 3m51.65s
for x64 and 4m26.07s for ARM; the test APK build takes 33.05s. These reuse
retained outputs and are not fresh-build or device-performance measurements.
ARM uses optimized Static configuration,
`symbol_level=0` and `debuggable_apks=false`; it is a development-signed artifact,
not an official release. Build caches and dependencies are retained.

Final artifacts, GN arguments, exact file sizes, SHA-256 hashes, revision pins
and timings are preserved in
`~/.cache/brave-tv/artifacts/ambient-8aab2fb28-20261013/provenance.json`.

## Native visual evidence

The captures are from the API 36 Android TV emulator at 1920×1080, 320 dpi.
They depict actual native UI. Captured pairing codes are revoked.

| State | Capture |
| --- | --- |
| Home | [Home](../.impeccable/review/ambient/home.png) |
| Drawer | [Top](../.impeccable/review/ambient/menu.png), [bottom](../.impeccable/review/ambient/menu-bottom.png) |
| Phone invitation | [Pairing](../.impeccable/review/ambient/phone-pairing.png) |
| Approved connection | [Home status](../.impeccable/review/ambient/home-connected.png), [Phone panel](../.impeccable/review/ambient/phone-connected.png) |
| System text 1.3 | [Home](../.impeccable/review/ambient/home-large.png), [drawer](../.impeccable/review/ambient/menu-large.png), [Phone](../.impeccable/review/ambient/phone-large.png) |

The finish review closes all three material corrections with **ship**, scoped
to those scored fixes. It uses the approved Ambient HTML as a code-led critique
reference. Its material corrections are equal-height native drawer rows,
persisting the five-block direction/seed contract and truthful implemented
Phone status in PRODUCT.md. The root DESIGN.md and `.impeccable/design.json`
describe the finished TV system; `brave/DESIGN.md` remains the phone companion's
separate system. No HTML/CSS detector applies to this native build. The pinned Impeccable engine
0.1.14 reproduces the original direction roll but cannot emit the newer seed
reference format; that limitation and actual helper evidence are recorded in
the surface brief and [review report](../.impeccable/review/ambient/finish-review.md).

The wallpaper is Luca Bravo's Lago di Braies photograph from the approved asset
sidecar. The native crop is 1920×1080, about 407 KB, decoded off the UI thread
and cached once (about 8 MB decoded). Embedded provenance passes the raster
scan. No runtime wallpaper/font request or rotation service is introduced.

## Remaining acceptance scope

This run does not establish physical-TV performance, actual phone IME/gestures,
QR scanning with phone cameras, sustained LAN behavior or a release signing
identity. The optimized ARM APK is built but not installed on the Chromecast.
The paired client is a forwarded emulator client, not a physical phone. Broad
720p, 1.6 text, long-translation, managed-policy, full data-migration, sustained
performance and security-owner matrices in the approved plan remain follow-up
acceptance gates. Focused narrow native tests supplement the 1080p captures.
