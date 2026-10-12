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
