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
Build completion, final hashes/install and hardware acceptance are still pending.

After the build is idle, compare baseline/current on this same TV/configuration
and normal owner0 profile: seven cold Activity display and seven same-process
warm task returns, three whole-package PSS sums, ten native controls openings
with equal directional focus cycles, completed frame durations, APK bytes and
installed code allocation. Initial install/startup setup is excluded from the
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
