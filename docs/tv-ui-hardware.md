# TV UI physical acceptance — in progress

12 October 2026. The user explicitly made the Chromecast available and permitted
removing the old browser and its storage from every TV profile. This supersedes
the earlier busy-TV restriction for this run. Canonical acceptance remains52/54;
6.5/V8 are pending actual matched measurements and sustained hardware results.

## Preflight and authorized cleanup

The already-paired mDNS service now responds at192.168.4.50:45409; the old39757
endpoint did not respond. Identity is Google Chromecast/sabrina, serial
0B231HFDD124ZR, Android14/API34, ABIarmeabi-v7a/armeabi. Android users0/10/11/12
remain; owner0 is active. Display is physically3840x2160 with existing1920x1080
override, density320, default font-scale setting. No display configuration change.

The installed APK matches preserved source5829c55f0 ARM SHA256
`a6d96e77c29085e5ac0861f4936a2dff3e5e50c1d17861cd85e93d626b4e8c2a`.
Global uninstall succeeds; package-manager checks show no browser registration
in any of the four users afterward. Other apps and Android users are retained.
A temporary fresh installation of that exact optimized non-debuggable baseline
APK takes122.722s through the pinned device driver. Native Home has one tab and
Address focus; injected D-pad reaches Browser controls. This is baseline setup,
not acceptance of the new UI or a human physical-remote session.

## Build and measurement contract

Source1c9f71646/root-at-start7dac07d use the retained android_Static_arm cache,
Nix, Static ARM production target, non-debuggable manifest, symbol_level0 and
blocking Android analysis. Siso local4, memory18GiB high/22GiB maximum/swap0 and
6GiB host-available guard apply. No cache/dependency reset or emulator boot.
Build passes GNU10m23.05s/Siso10m19.59s/1912 steps.312 cgroup samples
record18.001GiB peak and10.737GiB minimum host available, no guard/OOM.
The preserved ARM APK is368050408 bytes, SHA256
`5b0db5c61d5b24e69cdb1a837e4fbe65196147f856cfe1228ba513e2a8552a2e`,
with matching development signer, ARM ABI and non-debuggable manifest. Artifact:
`~/.cache/brave-tv/artifacts/compose-tv-1c9f71646-arm-nodebug-20261012`.
Hardware acceptance remains pending.

After the build is idle, compare baseline/current on this same TV/configuration
and normal owner0 profile: seven cold Activity display and seven same-process
warm task returns, three whole-package PSS sums, ten native controls openings
with equal directional focus cycles, completed frame durations, APK bytes and
APK file allocation and native Android TV Storage used report. The non-debuggable
OAT directory rejects shell traversal; no permission/debugging workaround or
partial du total is accepted as full footprint. Initial install/startup setup is excluded from the
matched samples. Activity display is distinct from webpage readiness.

Panel timing brackets input in one device-side shell, then reads the first
completed frame of the newly added native controls window. It includes the
input-command startup and10ms device-uptime precision, rather than claiming
human-button latency or first physical pixel. A separate host native-semantics
latency includes command/query overhead. Frame parsing keeps valid first-window
draws, excludes skipped/surface-only/unfinished rows, and passes a synthetic
parser self-check before timing. Android14 defines those flags in
[FrameInfo.h](https://android.googlesource.com/platform/frameworks/base/+/android-14.0.0_r1/libs/hwui/FrameInfo.h);
[jank accounting](https://android.googlesource.com/platform/frameworks/base/+/android-14.0.0_r1/libs/hwui/JankTracker.cpp)
does not classify a visibility-change flag alone as a skipped frame.

Apply existing Stage0 relative investigation limits: startup/panel median15%,
tail25%, idle PSS growth80MiB and APK growth10MiB. Report frame percentiles and
missed-cadence samples; investigate budget misses rather than checking a gate.
Separate network/renderer/decoder work from the TV shell. Follow matched samples
with native UI/recovery/security/fullscreen/cursor flows and sustained ordinary
video. Actual audio output, human remote buttons, real-phone/Safari and second-TV
compatibility need distinct evidence and are not implied by automation.

Preflight, removal, baseline setup, driver, parser and measurement scripts are
retained under `~/.cache/brave-tv/probes/hardware-ui-r1`. The optimized build uses
`logs/build-tv-ui-arm-1c9-r1.{log,time}` and `build-arm-r1-memory.json`. Native
normal fixture snapshots are distinct from private data; no old private payload
is inspected. Controllers must be revoked and only task-owned helpers/ports
stopped on closeout. Profiles, host caches/artifacts and shared ADB/T3 remain.


## Baseline measurements and installation recovery

Baseline startup/PSS phases from r2 are retained when du fails, rather than
rerun; r4 completes only the panel phase. Old baseline injected controls Back
exits to the launcher in10/10 samples; each next sample restores native Home
outside timing. The new UI must be tested separately for that behavior.
Seven cold Activity samples: median1128ms/p951562ms; seven warm task returns:
median159ms/p95482ms. Three whole-package PSS sums: median254162KiB. Ten panel
shell-start/first-completed-frame samples: median350.963ms/p95436.286ms;
458 native panel frames: median38.213ms/p95105.565ms. Native semantics host
median1437.758ms includes query overhead and is not display latency. OS Storage
used reports402MB; APK allocation367534080 bytes. These are physical baseline
measurements under the declared method, not current-UI acceptance.

The current1c in-place attempt fails with INSTALL_FAILED_INSUFFICIENT_STORAGE.
Use the user's existing old-app/all-profile cleanup authorization to remove the
temporary baseline and install1c fresh, then recreate the same one-normal-Home
configuration. This comparison is fresh-install performance; it does not accept
hardware upgrade persistence or erase the failure. Emulator migration evidence
remains separately attributed. Never remove unrelated apps or host caches.

## Current build and matched panel investigation

Fresh installation of source1c succeeds in 73.302s; installed bytes match the
preserved ARM artifact. Home and Address focus render through native Compose.
Initial measurements give cold median1151ms/p951236ms, warm174ms/555ms,
whole-package idle PSS239387KiB and APK growth565281 bytes (0.539MiB).
Startup median/tail, idle PSS and APK growth pass the declared relative budgets.
Both Android TV Storage used reports round to402MB; this is not an exact OAT
directory measurement. In-place hardware upgrade persistence remains unverified.

The initial panel comparison is red: current median269.873ms/p95552.564ms versus
baseline350.963ms/436.286ms. The25% tail limit is missed by7.207ms in a10ms
input-shell clock bracket. Keep `initial-budget-red.json.log` and both raw runs.
The interrupted baseline probe had already opened an untimed controls popup;
the current first popup was timed. This is unequal warm-up, not a source fix.

A compatible streamed rollback also fails INSTALL_FAILED_INSUFFICIENT_STORAGE
without changing the installed current APK. Failed installer sessions are
destroyed and their staging directories absent. APK native libraries are
uncompressed with extractNativeLibs=false. No unrelated app/cache deletion,
storage-threshold change, permission workaround or TV reboot is used. Recreate
only the task-owned empty one-Home test installation for each candidate under
the existing browser-data cleanup authorization. Baseline restore64.977s and
current restore67.277s succeed; these are fresh installs, not upgrade acceptance.

For both versions, perform one fresh process, two-second idle and one untimed
controls opening before ten timed openings with equal directional focus cycles.
`baseline-warm-r5` fails on a driver snapshot before any timed sample; a separate
snapshot succeeds, and `baseline-warm-r6` completes. Current `current-warm-r2`
completes the same method. Retain startup/PSS phases from the original accepted
runs; do not relabel them as new panel-run samples.

| Physical metric | Baseline5829 | Current1c |
| --- | ---: | ---: |
| Ten panel samples, shell-start/frame median |339.033ms|261.026ms|
| Panel p95 (ten samples; nearest-rank maximum) |823.701ms|286.730ms|
| Completed new-panel frame median/p95 |39.199/111.474ms|19.831/41.605ms|
| Completed new-panel frames |444|1185|
| Package gfxinfo deadline jank / rendered frames |307/823 (37.30%)|118/1185 (9.96%)|
| Controls Back returns native Home |0/10|10/10|

The red-capable budget checker now reports zero relative-budget misses with
explicit warm-up parity. Baseline tail variability and the original current
first-popup552.564ms remain recorded; no first-use source optimization is claimed.
Package jank counts include all reported windows; new-panel duration samples
filter skipped/surface-only/unfinished rows. Display period is16.683ms. Frame
completion duration exceeding one period is not itself an Android deadline-jank
count. This improves the measured shell while leaving noticeable deadline misses;
it is not a60fps or physical-button latency promise. Sustained hardware media,
native input and phone recovery remain pending before V8 acceptance.

## Native recovery and cursor correction

Source1c physical native Home/settings/About/library/tabs routes pass, including
final normal-tab closure returning Home with Address focused. The stock Google
TV keyboard opens, native USB OK types uppercaseQ, Clear empties/reopens the
keyboard and Back then Cancel returns Home. Actual nonalphabetic USB held OK
produces one fixture click; an idle held wake produces none; the next held click
increments exactly once and directional wake restores cursor pixels. These are
injected native-input results, not human physical-button acceptance.

Video Play/fullscreen/Back retains the same playing native document and growing
presentation-frame counts, but source1c loses cursor pixels after video exit.
Sustained USB pulses keep its View visible with a63ms recent frame; reselecting
Page cursor restores the pixels. Retained red evidence is
`media-awake-cursor-r3.png`/`media-awake-activity-r3.txt`; positive reselect control
is `media-after-reselect-green-r1.png`. Earlier malformed bare-uinput and immediate
transition assertions are invalid diagnostic attempts, not accepted input.
Android14 uinput requires a file argument and has no API36-style sync command.
Later native-input runs use explicit stdin/file arguments and observed native
postconditions. Matched panel measurements above used the earlier SDK-key driver;
later USB-input probes are distinct and do not relabel those timings.

The first correction and shared phone pointer state are source4dde2cbb296e81a2e396532fc5a839eee78b845d,
reviewed Standards0/Spec0. Cached ARM r2 and production/TEST x64 r80 pass blocking
analysis with four Siso workers and18/22GiB limits, no swap/OOM. GNU wall times
are4m08.38s ARM and4m09.15s x64; Siso52/136 steps take4m04.86s/4m05.56s.
ARM memory peak18.002GiB, sampled host minimum9.619GiB; x64 peak16.393GiB,
host minimum13.100GiB. No compile cache or output is deleted.

| Source4dde artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `compose-cursor-4dde2cbb2-arm-nodebug-20261012/BraveMonoarm.apk` |368050408|`8b9f45b00bd54aa79b9c13b27864b093d5ac9d6fbf7e68db11f33af8969d3aac`|
| `compose-cursor-4dde2cbb2-x64-debug-20261012/BraveMonox64.apk` |852768519|`8a9462ca4caf05194ac36f9e098a1787e4b6101b482f61e5cf9ee69efab7df11`|
| `compose-cursor-4dde2cbb2-x64-debug-20261012/BravePublicTest.apk` |876445459|`6f7bccf3360f4ba0f2f039841c276c4ccd10c71bdf3f2524ccdc3723a1f81e23`|

Folders are under the retained artifacts cache, with signer/ABI/package/GN and
source provenance. ARM is optimized, nondebuggable, local nonofficial development;
this is not a public-release remote. All have the existing compatible signer.
The explicit TV streamed internal-flash update (`-r -f --user0`) also fails
INSTALL_FAILED_INSUFFICIENT_STORAGE after61.648s. The authorized browser-only
fresh install succeeds67.954s with verified bytes; only task-owned synthetic
browser media state is lost. Android users0/10/11/12 and unrelated apps remain.
Physical in-place upgrade persistence remains unverified.

The emulator production and TEST packages update in place with matching bytes.
Default T3 GPU launches disconnect twice before instrumentation returns a result;
those attempts are unaccepted. The documented cold boot with guest Vulkan disabled
preserves the AVD/profile and runs native tests: document-fullscreen cursor recovery,
file-picker navigation/pause disposal and private Home/control window protection
pass individually. Held-OK fails twice before entering Page cursor because its
controls lease precedes viewport settling; retained logs are
`native-dedicatedDpadFromVirtualKeyboardClicksOnce-r80{,-followup}.log`.

Actual direct-LAN HTTP companion on192.168.4.50 pairs with explicit native TV
approval, navigates to the normal media fixture, plays it and retains control in
video fullscreen. This is a host390×844 viewport, not a real phone/Safari test.
Source4dde phone Back keeps the playing document but cursor pixels fail despite29
accepted awake commands. Native Back and sustained USB pulses fail too, with
the View visible and a78ms recent frame. Retain
`phone-only-fullscreen-cursor-r2.json`, `phone-only-cursor-r2.png` and
`media-awake-cursor-4dde-r2.png`/`media-awake-activity-4dde-r2.txt`.
No private/password/native-security control is granted; invitation/controller
secrets are not logged. This is an actual failing physical acceptance gate.

Follow-up sourcef3d8516512078ca2871082b61a1569e46ff2d776 moves restoration to
the existing authoritative WebContents notification and retains document identity
while invalidating fullscreen coordinates. It adds actual video/native-session
regressions and synchronizes held-OK viewport setup. Review/build/runtime are
pending; no physical cursor or sustained-media acceptance is claimed. The source1c
performance comparison remains separately attributed. The controller is revoked
and only the owned emulator stopped before the next single cached build.
Its latest review reports Standards0/Spec1: a cursor first attached during existing
fullscreen also needs the native document lease. Correction
`c7373b453e0e06fa33ef8ab7e578605dd0919f52` captures it in the shared TV/phone
attachment path and adds native first-attachment coverage; review/runtime pending.

## Authoritative exit validation and current artifacts

Sourcec737 and root31 latest-only reviews pass Standards0/Spec0. Cached x64 r81
passes blocking analysis in3m35.70s (Siso31 steps/3m32.28s), memory peak14.451GiB
and sampled host minimum13.375GiB. Its installed production APK is
852768447 bytes, SHA-256`9a57b1e8d90fc29e8544cf4f1513f7ee5b141ee957daa5d8dc15961b4ac7b76f`.
Five separate actual-engine cases pass: document fullscreen with native document/
coordinate leases and cursor pixels, first cursor attachment during fullscreen,
held-OK/idle wake, file-picker navigation/pause disposal and protected private
Home/controls. The held-OK viewport-before-controls synchronization succeeds.

The new video case fails before Back: MP4 embedded in its data URL reports
MEDIA_ELEMENT_ERROR/Format error and never plays. This is not a video-recovery
pass or an established engine regression. Source92af7fd43c5e1a0e9d214b8679514b444055bc27
and rootec6 latest reviews pass0/0 for a test-only correction using the controlled
HTTP fixture `media.html?native-cursor`, preserving ordinary fixture rendering.
No production cursor code changes in that correction. Cached r82 passes blocking
analysis in44.15s (Siso14 steps/40.47s), peak10.479GiB/minimum host20.182GiB.
Its production bytes are identical to r81 and are reused on the preserved AVD;
only TEST updates. The corrected actual video/fullscreen/Back/playing-document/
coordinate/pixel case passes in8.219s. The five other cases carry from c737,
without being relabeled as reruns on92. Logs/provenance remain under the cache.

Current ARM r3 passes blocking analysis in3m55.01s (Siso15 steps/3m51.63s),
four workers,18/22GiB limits and no swap/OOM/guard interruption.110 samples record
peak19329417216 bytes (18.002GiB) and minimum host9902829568 bytes (9.223GiB).
Artifact `compose-cursor-92af7fd43-arm-nodebug-20261012/BraveMonoarm.apk` is
368050408 bytes, SHA-256`d2d740800bc8bf907ab7cf91b410a383fccb979295ef74a5e4eb827d6b40fe14`.
Signer, ARM32 ABI, development package/version and nondebuggable flag verify.
GN/build/memory provenance is preserved; hardware runtime acceptance remains
pending. This is optimized local development, not public release.

Before code replacement, source4dde native Bookmarks saves the selected normal
media fixture in Mobile bookmarks; Tabs shows that same selected page. Retain
`hardware-retained-profile-before-r3.json`. First bookmark Back correctly returns
its Mobile folder to the bookmark root; a probe expecting controls prematurely
fails, and the next Back returns controls. TV owner0 UID10136 and942772KiB free
are observed. Use documented `pm uninstall -k` then the compatible signed APK to
retain this synthetic data/cache while freeing old browser code. Installation
succeeds70.148s with verified bytes and unchanged UID10136. Native controls show
the exact retained selected media URL; Mobile bookmarks still contains its saved
title. Retain `install-cursor-tv-kept-r3.json` and
`hardware-retained-profile-{selected,after}-r3.json`. This accepts those normal
synthetic data points across code replacement, not an in-place update or complete
settings/group/history/all-profile equivalence. No data/cache clearing occurred.
