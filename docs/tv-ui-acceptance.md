# TV UI emulator acceptance index

Source `1c9f71646ab5fa50ac91b50b304756435dd8ea13`, 12 October 2026.
The original emulator closeout accepted52/54. The [canonical checklist](tv-ui-rebuild-plan.md)
now accepts54/54 after the separately authorized scoped physical performance/native-counter
follow-up; source1c results below remain historically attributed.
Final sustained/manual/stock-phone reconciliation is complete. Later12 October
authorization permits the [physical follow-up](tv-ui-hardware.md); source090
actual-engine and complete native TV acceptance now close6.5/V8. Human A/V,
button/overscan, real-phone/Safari/second-TV and standard in-place storage limits remain. This index
distinguishes retained native results from the current artifact; it does not
claim every test was rerun together, human A/V/button/overscan acceptance,
standard in-place update success or broader release readiness.

## Later native hardware corrections — 12 October

The original emulator closeout below remains attributed to source1c. Authorized
hardware checks exposed a fullscreen cursor defect and an Android accessibility
crash on fading video controls. Corrected source090fa9c733cc80681f3fc6db71df16244d74dda6
is now signed/pushed and installed on the TV with retained normal URL/bookmark.
Source090 latest implementation review is Standards0/Spec0; exact build, failed/
successful installation, native test and physical cursor evidence is recorded in
[hardware follow-up](tv-ui-hardware.md). The source fork also owns two one-line
native accessibility patch hooks, a small chromium_src ignored-node guard and
actual native fresh/cached-node regression tests. Upstream accessibility traversal,
exposed nodes and assertions remain enabled.

X64 r85 passes blocking analysis and all four affected native checks: ignored-
existing fresh/cached info rejection, actual HTTP-video fullscreen/document/cursor
and private Home/controls native window protection. Earlier checks carry only
where unchanged, rather than being relabeled as this APK's reruns. Optimized ARM
r4 shares that source/guard; both cached output trees and their artifacts remain.
Physical first-attachment/phone-moved/mixed-input cursor checks pass. The failed
source92 approximately27-minute AX crash run remains failed; a complete fresh
source090 repeat now passes30m01.385s/31 native samples/181 commands, no reject/
disconnect, unchanged playing document and post-run fullscreen/native Back/cursor
pixels. Scoped6.5/V8 now pass; capture-black viewed/audible A/V and the separately
listed release checks remain unverified.

Final source090 native Home/Address/phone-badge and ordinary screenshot checks
pass; controller and owned helpers/ports/AVDs are stopped while the new synthetic
normal profile and all compile/dependency/APK caches remain. Final hardware
[cleanup evidence](tv-ui-hardware.md) names the exact records. The old physical
listener refuses connection; shared ADB/T3 and unrelated apps/users are retained.

## Final artifact and integration

`~/.cache/brave-tv/artifacts/compose-remote-1c9f71646-x64-debug-20261012`
contains package `com.brave.browser_default`, Chromium155.0.8059.40, x86_64
Debug. Production APK852,770,267 bytes has SHA256
`7718405c830ee4993ccc43b22f3f4f8cc328a3a863c4f5af752371fe16c81a25`.
TEST APK876,451,107 bytes has SHA256
`f545ec3c2011e2aa38657211b97cac756ba143fccc4178e96a258ad244764f16`.
Both verify signer SHA256
`32a2fc74d731105859e5a85df16d95f102d85b22099b8064c5d8915c61dad1e0`.
Build-root-at-start is `86a9f98d89e0c170b3d370ab1bad07037fcd3ff8`.

R79 reuses android_Debug objects/GN/dependencies and passes blocking Android
analysis: GNU1m42.53s, Siso1m38.98s/61 steps,53 cgroup samples,13.420GiB peak
and16.580GiB minimum host available. Limits are Siso local4, MemoryHigh18GiB,
MemoryMax22GiB, swap0 with a6GiB host guard. Signed production/TEST update in
place on the preserved API36 launch-followup AVD in12.863/11.394s. Build logs,
GN args, checksums, signer output and post-apply patch fingerprints are retained.
No source5829 profile is downgraded or erased.

The source fork owns TV Material1.1.0 and Material Icons Core1.7.8, with
[AAR hashes, Apache licensing and metadata](../brave/third_party/androidx_tv/README.chromium).
The [GN target](../brave/third_party/androidx_tv/targets.gni) uses Chromium's
existing Compose compiler support. The pinned checkout has Compose UI/Foundation
1.13.0-SNAPSHOT metadata, Kotlin stdlib2.3.0 and compiler build.txt2.4.20;
Chromium DEPS pins compiler CIPD `R1b_2VmAdxUjLeGb_lDhzK_ytUCBeWaGnCjwzsbgr6MC`.
The compiler README's older version label is not the installed binary version.
This rebuild did not upgrade those pins. No Gradle demo or substitute Android
WebView supplies APK acceptance.

Integration touches AndroidX/Compose GN rules, the TV native visibility delegate,
TV animation policy, native tab-thumbnail eligibility/compression fencing,
Chromium's native composition/deletion hook and UiBase's file-dialog handoff.
Owned Chromium patches/overrides remain in the pinned source fork. See the
[inventory](tv-ui-inventory.md), [retirement owners](tv-ui-retirement.md) and
[persistence/rollback contract](tv-ui-migration.md). All166 TV messages have
callers; the two vendored AAR hashes match recorded pins. Final audit:
`probes/engine-lifecycle-r1/retirement-final-r64.json` under the cache.

## Regression evidence and retained checks

Each row links the detailed [engineering log](engineering-plan.md); counts and
fixture/callback tests are identified there separately from production behavior.
Prior passing checks are carried only where their implementation is unchanged.

| Group | Actual native evidence carried forward | Final reconciliation |
| --- | --- | --- |
| V1 remote | Genuine USB D-pad loading entry/content focus/cursor/no entry click/one click on sourcef481; earlier held-OK/idle-wake/nested-scroll/coordinate checks and current picker Right/Left/Back | Pre/post-soak D-pad fullscreen/native and phone Back retain cursor928/800; final1c About/Settings/compact More/Page return passes |
| V2 recovery | Final normal/private Home/Address, native stored-group conservative Cancel/Right/Delete/Left, frozen16-tab restore/paging, stable survivor selection and async owner cancellation | Retained normal/private/group recovery remains accepted; final1c preserves normal IDs1/2 and selection1; baseline upgrade group preserved |
| V3 input/media | Source6d actual phone InputConnection Unicode/composition/selection/deletion/stale/password suite; stock TV IME; native media/phone fullscreen switching/background/cursor and separately sampled public YouTube | Current D-pad fullscreen/Back retains playing document and cursor928/800; stock Gboard typing/deletion smoke and30-minute native media/phone run pass |
| V4 phone | QR waiting/manual-form hiding, explicit approval, rejection/disconnect; authenticated private/password/native certificate/auth/permission denials; same-session offline no-replay and background/network revocation | Direct simulated-LAN QR and manual approval pass; native invitation expiry122450ms on8c; final1c Disconnect/fresh re-pair passes |
| V5 security/data | Native origin/permission Block/certificate Back/auth Cancel, signed Shields/list enforcement, scoped clearing; source5829→6802 preserved tabs/group/bookmarks/history/provider/Shields/filter metadata | Retained accepted6.1/6.3 and four real native picker cases; no physical permission grant |
| V6 lifecycle | Actual Home/task return, renderer failure/recovery, same-URL lease cancellation, real process death/relaunch, controlled Android LOW signal and real failed writes | Process/task policy distinctions retained; no genuine ENOSPC or hardware sleep claim |
| V7 accessibility | Native720p/font1.6/RTL focus/long-title/confirmation/layout checks; actual TalkBack Home/Settings and empty/disabled/error speech;7/7 native semantics/state cases | Source8c picker warning fully visible at1080p and720p/font1.6/ar with conservative focus and English fallback; seven settings restored |

Current-run evidence lives under
`~/.cache/brave-tv/probes/engine-lifecycle-r1`: installed-picker-r79.json,
picker-final-copy-r59.json, picker-display-r59.json/restored record,
media-native-pre-soak-r59.json, media-native-post-soak-r60.json,
phone-media-soak-r59.json/summary/start, phone-stock-ime-r60.json,
phone-manual-expiry-r63.log, disconnect-native-r64.log, repair-native-r64.log,
final-focus-r64.json, repair-post-focus-r65.log, normal-ids-after-disconnect-r79.json
and cleanup-final-r65.json. Native/manual probes verify both exact AVD identities
and the owned phone diagnostic forward. Remote HTTP traffic itself uses shared
private-address emulator Wi-Fi directly, without an HTTP forward.

The source8c sustained run passes30m00.456s/181 commands/p95 7.6ms and31
PSS/CPU samples. PSS646.629MiB start/634.588MiB end, range633.391–653.471;
same document427x240, decoded11504→64559/dropped3→3, no media error. Whole-
package one-core CPU median143.102% reflects software-emulator workload.
Pre/post-soak D-pad fullscreen and phone movement/Back keep playback and restore
cursor928/800. Stock phone Gboard touches type/delete into the real Chromium
plain field with matching acknowledged text and completed composition. Full
Unicode/selection/composition retain separate native InputConnection acceptance;
this stock-keyboard smoke does not establish arbitrary OEM or physical IMEs.

Final1c changes only companion Disconnect/reply handling. Its four host cases
pass delayed poll/Back success/failure; actual installed JS bytes, manual native
approval, Disconnect immediate fresh-pair guidance/old-command rejection, fresh
invitation/re-pair/control and panel focus pass. Native expiry and the sustained
core run carry from8c; they are not relabeled as reruns on1c. The final normal
model is unchanged, the phone is revoked and task-owned AVDs/fixtures/ports are
stopped/removed with network/lease settings restored. Profiles, build outputs,
artifacts, dependencies and shared ADB/T3 services are preserved. Initial setup
touch diagnostics remain distinct from genuine D-pad and measured cursor pixels.

## Remaining physical and release work

Scoped6.5/V8 now have actual optimized same-TV measurements and the corrected
source090 complete native run in [hardware evidence](tv-ui-hardware.md). Earlier
x64 Debug budgets remain separate. Human physical overscan/font/remote repeat
and group confirmations, viewed/audible media/YouTube and codec/DRM need their
own evidence; counter/frame timing does not establish those outcomes.
Second TV, real phone camera/IME/gestures/LAN and Safari remain unverified.
The physical Chromecast was untouched during the recorded emulator rebuild;
the later authorized hardware follow-up is tracked separately.

OS photo selection/Done currently need touch or a mouse; some generic Android
TV handlers are empty stubs. The UI explains empty/mouse-dependent pickers and
Back recovery before handing ownership to Android. It does not imitate permission
approval or supply its own storage/picker. No D-pad photo-selection pass is claimed.

HTTP phone control remains opt-in, unencrypted and gated as a development
experiment, with explicit warning/approval, expiring single-use invitations,
one controller, exact Host/Origin validation, bounded parsing/queues/rates,
revocation and no replay. No relay, account, external companion assets, live
view/capture or remote JS/CDP/ADB execution endpoint was added. Host/device test
instrumentation is separate. Full-disk ENOSPC, arbitrary OEM authentication and
compatible rollback execution remain unverified; no profile-format downgrade
or broader MVP/release completion is claimed.
