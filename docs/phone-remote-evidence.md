# Local phone remote experiment — 10 October 2026

The authorized emulator implementation scope is complete on source `7f2ad4c6c`.
No physical Chromecast operation was performed. HTTP remains an explicitly
enabled development experiment; this is not release acceptance.

## Transport and threat model

The experiment uses pinned Chromium `net::HttpServer`, already compiled with
`//net` when WebSockets are enabled. The feature itself rejects upgrades and
uses same-origin JSON POST plus state polling. There is no new server dependency,
Node on Android, companion WebView, relay, streaming, account or analytics.
ZXing is already supplied by `//brave/third_party/zxing:zxing_java` through
`brave/build/android/config.gni`. HTML/CSS/JS are Android raw resources in the
source fork, with no external companion requests.

An attacker on the network can observe HTTP credentials, URLs and text or replace
the served JavaScript. Pairing/Host/Origin validation does not solve this. The
experiment requires a debuggable APK, the process switch
`--tv-local-remote-experiment`, explicit TV opt-in with an unencrypted warning,
and TV approval. Test only synthetic data on an isolated network. Public builds
must keep this off pending a separate release decision.

Public certificate issuance for reserved/private IP addresses is prohibited by
CA/Browser Forum baseline requirements §7.1.2.7.12 (version 2.3.1, 4 October 2026).
A self-signed certificate plus QR fingerprint is not a browser trust mechanism.
Bundling one trusted domain certificate/private key across TVs would expose the
key; Let's Encrypt explicitly warns against that pattern. An independently
provisioned domain and per-device certificate could provide authenticated local
HTTPS, but introduces domain/issuance/renewal infrastructure and initial internet
provisioning. This is an engineering inference, not an implemented service.
A separately installed phone app could pin a TV key out of band, but changes the
app-free requirement. No verified, zero-provisioning, authenticated HTTPS solution
for arbitrary RFC1918 addresses was found. Do not describe HTTP as encrypted.

Sources: [CA/Browser Forum requirements](https://cabforum.org/working-groups/server/baseline-requirements/requirements/#712712-subscriber-certificate-subject-alternative-name),
[Let's Encrypt local application guidance](https://letsencrypt.org/docs/certificates-for-localhost/).

Chrome 147 includes Local Network Access restrictions for WebSockets. Its
release notes define local network requests across address spaces; serving both
page and commands from the same private origin avoids the public-to-private
pattern. That does not establish Safari compatibility or bypass OS network
permissions. [Chrome 147 release notes](https://developer.chrome.com/release-notes/147).

## Protocol and limits

Only `/`, `/remote.css`, `/remote.js` GETs and `/pair`, `/api` JSON POSTs exist.
Exact numeric Host, exact POST Origin and same-origin Fetch Metadata are checked;
no CORS, cookies, executable URL scheme, arbitrary JS, ADB or CDP product endpoint.
Request JSON depth is capped at eight; body at 8 KiB; receive buffer at 16 KiB;
send buffer at 64 KiB. Four simultaneous sockets and four outstanding Java
requests; 40 admissions/requests per second; five-second socket deadline and
one-second maximum queued command age. Socket and UI work have independent caps.
Assets use no-store, no-referrer, nosniff, frame denial and restrictive CSP.

Invitations and controller credentials use separate 256-bit random tokens.
An eight-digit manual code has five attempts per invitation. Invitation/pending
approval expire at two minutes. Sessions expire after two minutes without an
authenticated request or 35 minutes absolute. There is one pending/approved
controller; its credential stays in page memory. Reload needs a new pairing.
Reconnect polls fresh state and does not replay failed actions. Sequence numbers
are strictly increasing; tab/context, editable identity and renderer text/selection
version are revalidated on Android's UI thread. Background immediately closes
the listener; address/transport is rechecked per command and every 500 ms.
Private/native contexts pause commands and export no tab/editor metadata.

## Build and review evidence

- Source `80a4ed1e8`: first experiment. Session self-check and 14 preexisting root
  tests pass. Build r1 stopped on JNI final registration in 9.28 seconds;
  cgroup peak 8,261,713,920 bytes. No APK claimed.
- `3b18c14a7`: correct registration and `destroyFromNative` hook. Build r2
  stopped on C++ JNI reference/override errors in 25.65 seconds;
  peak 8,210,186,240 bytes. No APK claimed.
- `e9fdbfb5f`: independent queue bounds, stale editor-content protection,
  polling arbitration, recoverable startup failure and bytecode method tests.
  Build r3 stopped on the wildcard opcode import in 6.42 seconds;
  peak 6,926,839,808 bytes. No APK claimed.
- `b973caee8`: explicit opcode imports; r4 stopped on two pinned Java API/resource
  mismatches after 41.48 seconds, peak 19,332,571,136 bytes (18.00 GiB).
- `9acc146ce`: fixed those mismatches; r5 compiled Java/bytecode but blocking
  lint caught an API-33 stream method against minimum API 29 after 2m22.75s,
  peak 16,287,571,968 bytes. Replaced with Chromium FileUtils in follow-up.
- `e0a6bba45`: r6 passes all blocking checks, 294 steps in 4m02.82s;
  observed peak 16,074,948,608 bytes. Preserved APK:
  `~/.cache/brave-tv/artifacts/phone-remote-e0a6bba45-x64-debug-20261010/BraveMonox64.apk`,
  851,004,143 bytes, SHA-256
  `76cb61c4c1aa8870ca0d2e09075fff35a37b53e8fa90d5b3a0f11e233e57acf1`.
  First device run exposes the teardown and missing IME-hook problems below.
- `2a7aa8982`: r7 stops on missing browser_thread.h declaration in 28 seconds,
  peak 11,282,554,880 bytes. Add the declaring header and repeat.
- Host companion regression passes fragment removal, a button action arriving
  during polling, exactly one click, portrait/landscape overflow and script-error
  checks. These use a synthetic server, not Android runtime evidence.
- Fifteen root tests and strict mypy pass. Locked optional phone SDK (API 36
  Google APIs x64 revision 7, emulator 36.5.11) built and a new
  `brave_phone_remote_api36` Pixel 7 AVD was created without overwriting a profile.

Two-axis code-review skill reviewed only `80a4ed1e8` and root `63531da`.
Standards: three findings (bytecode coverage, thread-start CHECK, translation
context). Spec: four findings (IME teardown name, dropped polling-time commands,
UI queue bound, stale same-field replacements). Corrections are recorded above;
subsequent commits require their own latest-commit review.

Logs are retained under `~/.cache/brave-tv/logs/phone-x64-r{1,2,3,4}.{log,time}`.
Every compile uses Nix, four workers, MemoryHigh 18 GiB, MemoryMax 22 GiB,
MemorySwapMax 0 and blocking Android static analysis. No output/cache deletion,
Chromium upgrade, destructive sync or concurrent Chromium builds.

## Browser/device test environment

T3 `preview_open` failed with:

> Preview automation open failed: This host blocks the sandbox T3's browser runs in (AppArmor on Ubuntu 23.10+). Run `sudo env "PATH=$PATH" t3 browser setup` on the host once to allow it, then try again.

Use the existing headless Chromium 154.0.8037.92 and Playwright installation for
fallback UI automation. No local-network/certificate security-disabling flags.
Desktop viewport emulation is not physical phone or Safari evidence. Linux's
device host reports iOS unavailable: simulators require macOS/Xcode.

Installed Android emulator version is 36.5.11.0. Version 36.5+ supports a shared
virtual Wi-Fi network between AVDs. A direct phone-to-TV private address test can
therefore be distinct from localhost ADB forwards. Record actual addresses and
routes after launch; the first direct test is recorded below.
[Android shared emulator networking](https://developer.android.com/studio/run/emulator-networking-interconnect).

## First actual LAN run

TV `brave_tv_clean_api36` is explicitly `emulator-5554`; the new phone is
`emulator-5556`. T3 Device panels attach to both. Its returned agent-device CLI
fails with `Error (COMMAND_FAILED): Remote daemon is unavailable`; the configured
localhost daemon has no listener. Do not restart shared services. Explicitly
targeted Android commands and UI hierarchy reads are the native-input fallback;
T3 screenshots/streaming still work. The phone's bundled Chrome is
133.0.6943.137, so this proves that version, not current Android Chrome or Safari.

The TV initially defaults to emulated Ethernet (10.0.2.15). Its Wi-Fi was off.
Temporarily enable TV Wi-Fi, connect the emulator's AndroidWifi and disable only
that emulator's Ethernet via Android 16 IEthernetManager.setEthernetEnabled.
The resulting shared Wi-Fi addresses are TV 10.0.2.17 and phone 10.0.2.16.
Chrome on the phone loads the TV's exact private origin (HTTP 200), enters the
manual code, waits for TV approval, and then opens the harmless fixture through
the address UI. TV and companion both report the actual fixture title/URL.
No remote-traffic ADB forwarding or host proxy is involved. Loopback ports
9222/9223 forward DevTools solely for automation/inspection; they are not product
endpoints. The fixture server is host loopback 18088, reached from the TV at
10.0.2.2. This is a simulated LAN, not household-router/physical-phone acceptance.

Native pointer commands focus the fixture's plain input, but editable state
does not appear. javap on the built content_full_java JAR confirms zero
TvTextInput calls: the JAR was absent from bytecode_rewriter.gni. This is fixed
in the next source slice; native text acceptance is still pending.

Backgrounding an active listener reproduces a browser process death within two
seconds. The same failure occurred during the network switch. Logcat identifies
`base/threading/thread_restrictions.cc:166`, disallowed synchronous waiting on
the UI thread, from TvRemoteServer.stop. The correction uses Chromium's existing
IO task runner for socket operations and deletion, eliminating the private
thread/join. The PID-preserving background check must pass after installation.

Temporary emulator settings to restore: TV debug_app was null, command-line
file absent, Wi-Fi disabled, Ethernet enabled. Both emulator userdatas and
compiled caches remain preserved. The Chromecast has not been operated.

## Runtime correction and editor acknowledgement

Source `01145f29b` passes r8 (232 steps, 4m18.87s, peak 19,329,957,888
bytes) with blocking analysis and the same four-worker/18/22 GiB limits.
Artifact `phone-remote-01145f29b-x64-debug-20261010/BraveMonox64.apk` is
851,003,879 bytes, SHA-256
`3800678dbc6b15d457309d7e08e93d75d3b918f278acece19d8d77d6ec83eaaa`.
The transformed IME JAR now contains all four hook calls. The actual phone
focuses a TV field and sends `héllo हिन्दी 🌍` through the native bridge.
Background teardown preserves the browser PID, fixing the earlier crash.

The first typing attempt also exposes a selection/typing acknowledgement race:
phone selection changes the renderer version before coalesced typing is sent.
The new held-response host regression fails before the correction, then passes
with same-field expected-text acknowledgement; conflicting TV text still
cancels the pending edit. Full native text acceptance awaits the corrected APK.

`phone-transport-probe.py` passes against this APK directly from emulator-5556
netcat to TV 10.0.2.17:36345: bundled assets/security headers, unauthorized state,
Host/Origin/Fetch-Site/cookie/method/path rejection, malformed/deep/oversize JSON,
and five idle sockets bounded by the five-second deadline. These requests
travel through shared virtual Wi-Fi, not an ADB remote-traffic forward.

## Native input and controls acceptance

Source `a026dafd3` passes r10 blocking checks in 1m26.99s (50 steps);
observed peak 11,464,462,336 bytes. The preceding r9 also passed in 3m31.85s
(63 steps), observed peak 17,134,084,096 bytes. Retained r10 APK:
`phone-remote-a026dafd3-x64-debug-20261010/BraveMonox64.apk`, 851,003,855 bytes,
SHA-256 `a3920a4a08cf51badd699ce3268eb39557b6e3670ed66397d54b3240a2ebe9de`.

The actual Chrome 133 phone/TV pair passes native Unicode replacement,
selection, whole-code-point
emoji deletion, textarea/contenteditable replacement, stale-focus rejection and
password exclusion. No TV DOM values are assigned. TV composition events were observed, but the stronger later composing-state
check below invalidates that as proof of correct composition. The probe resamples the
visual viewport after native keyboard pan/resize; its earlier fixed-coordinate
attempts were invalid and are not acceptance evidence. This proves the native
IME path, not every physical phone keyboard/autocorrect implementation.

Real phone touch events pass tap exactly once, drag and two-finger scroll.
Back/Forward/Reload, stale-document and duplicate-sequence rejection, and normal
tab create/select/close pass. Tab checks wait for native home context to settle
and use freshly rendered row identities; old IDs after tab replacement are
intentionally rejected. The stronger background probe now proves all three:
foreground departure, explicit connection refusal and surviving browser PID.

A held-poll/fast-drag host regression fails because release discards a remaining
movement while busy; retaining the bounded coalesced motion makes it pass.
Context/disconnect cancellation still clears it. The preliminary session run was
stopped before 30 minutes to package this correction; no completed soak is claimed.
Android cpuinfo was stale since boot, so subsequent CPU measurements use live
per-process utime/stime and the guest's reported CLK_TCK, with process changes
marked unavailable. Both latest-review axes have no remaining findings after
caret validation and the connection-refusal correction.

## Newer phone engine and composition correction

Source `87a1c7b35` passes r12 blocking checks in 3m31.82s (63 steps), observed
peak 13,707,550,720 bytes. Retained APK is 851,003,686 bytes, SHA-256
`5c1f2843682761d53ba82e6d6e463af79bd44400351d017a90ab515a5e774fdd`.
The new home D-pad probe fails before the focus-link correction and passes on
this APK. The artifact directory includes source/build provenance.

The same APK runs as a normal phone browser on emulator-5556, exposing Chromium
155 in its reduced user agent. Its companion directly loads the TV private
origin, pairs from a decoded screenshot of the TV QR, removes the fragment,
waits for TV approval and navigates a local fixture. This validates QR encoding
and screen readability for ZXing, not a physical phone camera. There are no
certificate/security bypass flags or remote-traffic forwards. Changing the TV's
active network from Wi-Fi to Ethernet revokes the listener with explicit TCP
connection refusal while the browser PID survives.

The stronger native test catches a client composition defect: textarea
oncompositionstart/end properties are unsupported and merely stored functions.
The composing flag stays false despite real events, and state rendering can end
the phone's composition. The host test reproduces this (false vs expected true).
Using actual event listeners makes live composition and composing/final protocol
edits pass. Native acceptance and the full soak must be repeated after packaging;
earlier TV composition events alone were insufficient. Both preliminary soaks
were intentionally stopped short of 30 minutes and are not completion evidence.

## r13 native and integration acceptance

Source `d23276267` passes blocking build r13 in 1m29.99s (50 steps), observed
peak 13,865,795,584 bytes. Retained APK:
`phone-remote-d23276267-x64-debug-20261010/BraveMonox64.apk`, 851,003,687 bytes,
SHA-256 `dcbd92ddeaf2b3516d8c16bc240172fdea05c20b642cd39b18f3494a65882443`.

With the actual Android InputMethodService fixture, native composition remains
active after acknowledgement and commits Japanese exactly once. The complete
probe passes Unicode, selection, code-point deletion, textarea/contenteditable,
stale-focus rejection and password exclusion. Phone CDP composition was cancelled
under the stock Android IME (also with a separate diagnostic textarea); it is not
used as device acceptance. The test keyboard has visible fixed-text buttons and
no command endpoint. It was uninstalled and Gboard restored after the probe.
The probe also waits for the new field's authoritative text before editing;
writing immediately after DOM focus, before the phone receives that identity,
correctly resulted in a discarded edit. No TV field value is assigned by tests.

The normal phone Brave build identifies its engine as Chromium 155.0.8059.40.
Actual touch tap/drag/two-finger scroll, Back/Forward/Reload and tab operations
pass. A short simulated phone outage restores the same session in 452 ms; an
offline click is rejected. Review found that the original no-replay assertion
did not first position the pointer over the counter; the strengthened probe adds
a successful target click before the outage and awaits a fresh run. The TV and phone
use the shared virtual Wi-Fi route directly. The browser shows its ordinary
insecure-connection address-bar indicator, but no blocking HTTP or local-network
permission dialog in the tested flow. This is not Safari/physical-phone coverage.

Native/private panels expose only revision/paused and reject commands. A real
confirmation dialog pauses the remote and TV Back resumes it. The location
prompt also rejects remote clicks; the TV's Block action leaves the browser
permission `denied` (the fixture's five-second request had already timed out).
The private test tab is closed afterward. Physical uinput held-OK clicks once;
a second held press increments once and CursorScreenshot passes at 960,700.
The first attempt used the phone pointer position, which is independent of the
physical cursor; the corrected run uses five physical Down steps from center.

Shields fixture blocking passes, protection-off permits both requests, and
restored protection blocks them again. Native media pause/resume, phone-driven
fullscreen and captions pass. These are fixture regressions, not YouTube or
hardware audio acceptance. Switching the native search provider to Brave sends
the phone search to search.brave.com; Google is restored. Stop cancels a slow
local load, unreachable navigation reports an error, and javascript/file/intent/
chrome destinations are rejected without changing the page. Early lifecycle
samples in the running soak include these media/native-panel workloads; the
steady fixture segment starts afterward. The 30-minute result remains pending.

A new live negative test finds that JSONObject.getInt accepts v=1.5 as version 1.
`phone-protocol-probe.mjs` is red against r13. Exact numeric identifier validation
is added to source and the pure session self-check passes; it still needs the
next APK and live rejection test. This boundary correction does not change the
r13 performance/lifecycle implementation being soaked.

Phone pinch zoom reaches 2.0× and restores successfully. Host reflow checks cover
320/390-pixel portrait and 844-pixel landscape widths. Normal text contrast is
16.19:1, muted text 8.31:1, warning text 9.53:1, footer 5.92:1 and button text
11.90:1; controls have 48-pixel minimum height and named non-gesture alternatives.
These checks cover labels/focus/reflow, not a physical screen-reader session.
The documented submodule-aware Nix flake check passes both checks, all fifteen
unit tests and strict typing of ten Python files.

The r13 run reaches 1,800,196 ms with the same approved connection in every
sample, but fails its final minimum-command-count assertion. Fixed sampling
collided with state polling and skipped commands; the probe wrote its aggregate
only after that assertion, so no complete JSON result was retained. This is
partial endurance evidence, not a passing soak. The final steady sample is
549,617 KiB whole-package PSS, three processes, 0.433% of one CPU core. A separate
120-command foreground run passes with p95 72.7 ms (68.3–108.9 ms range), retained
as `~/.cache/brave-tv/artifacts/phone-latency-r13.json`. These are command round
trips, not measured display presentation latency. Correct the sampler's busy
arbitration and incremental evidence persistence, then repeat with the final APK.

## r14 final boundary and lifecycle acceptance

Source `c65a70820` passes all blocking build checks in 3m39.41s (53 steps),
observed peak 14,364,889,088 bytes. Preserved APK:
`phone-remote-c65a70820-x64-debug-20261010/BraveMonox64.apk`, 851,003,331 bytes,
SHA-256 `c545319f04bf7afc8e5ae74e42b7b5dbacbaa684038d48fbd94e349751024f76`.
The previously red protocol probe now rejects fractional/string version,
sequence and document identities while valid commands work. Native composition,
Unicode, selection/deletion and excluded/stale fields pass again; the test IME
is removed and Gboard restored. Gestures, navigation and normal tabs pass again.

QR pairing loads all three bundled assets with off-origin requests blocked and
no attempted external request. The stronger reconnect probe first clicks the
actual counter, then rejects an offline click, restores the same session in
456 ms and observes two subsequent polls without a replay. Transport negatives,
including absent Origin and WebSocket upgrades, pass. The idle-socket saturation
probe temporarily interrupts companion polling as expected; mistakenly running
it during the new soak invalidated that short run. The companion recovers.
Perform disruptive checks before starting the final uninterrupted soak.

Phone Disconnect clears its in-memory credential and produces explicit TCP
connection refusal at the former listener. Re-pairing succeeds. Backgrounding
the TV then closes the new listener while preserving its browser PID; returning
to Brave and explicitly starting/approving another invitation succeeds. Reloading
the companion loses the credential and requires a fresh pairing. Idle expiry
produces explicit connection refusal after 120.14 seconds with the same browser
PID, recorded in `~/.cache/brave-tv/artifacts/phone-idle-r14.json`.

The next fresh QR fails decoding even though the preceding three pairings pass.
The revoked full-screen image is retained as `qr-test-r14-final-retry.png`.
QR-only/TRY_HARDER and cropping do not fix decoding; those test changes are
discarded. Sampling the module centers recovers a valid payload without logging
it. Re-encoding that same payload at 320 pixels and bilinearly enlarging it to
the 360-pixel ImageView reproduces the failure, while direct 360-pixel encoding
passes. The correction generates at the view's physical size, disables bitmap
density scaling and centers the bitmap without interpolation. Original full-screen
decoding and the uninterrupted soak must pass after the corrected APK.

## r15 QR acceptance and final session

Source `7f2ad4c6c` passes blocking build r15 in 3m30.07s (16 steps), observed
peak 15,638,188,032 bytes. Retained APK:
`phone-remote-7f2ad4c6c-x64-debug-20261010/BraveMonox64.apk`, 851,003,103 bytes,
SHA-256 `a3dfa4b38bb4ee88937256a79412a8f22886b0f4295e06b1d7aaec5431b1beef`.
Ten fresh full-screen invitations decode with the unchanged ZXing reader; the
first nine are explicitly cancelled and the tenth pairs successfully through
the phone browser with TV approval. Screenshots are retained as
`phone-qr-r15-{1..10}.png`; the consumed invitation is also in
`qr-test-r15-paired.png`. No scanner hint, crop or credential logging is used in
this acceptance. The prior runtime checks remain applicable to unchanged input,
protocol and lifecycle code. A fresh local fixture starts the corrected soak,
with measurements in `~/.cache/brave-tv/artifacts/phone-soak-r15.json`.

The uninterrupted run passes: 1,800,247 ms, 181 accepted command samples,
p95 round trip 69.8 ms, and the same approved session throughout. All 31 memory
samples contain three browser package processes. Whole-package PSS falls from
661.85 to 615.67 MiB; after minute two it stays within 615.58–618.08 MiB.
That steady segment averages 0.592% of one CPU core, maximum 0.733%. There is no
observed growth in this fixture run. These are debug-emulator results on shared
virtual Wi-Fi, not household Wi-Fi, hardware performance or display presentation
latency. The earlier failed/partial runs above are not substituted for this pass.

Final phone Disconnect clears the credential and the private listener explicitly
refuses connections. Cleanup restores TV debug_app to null, removes its task
command-line file, disables Wi-Fi and enables Ethernet. Gboard is restored and
the test IME is absent. Owned diagnostic forwards and temporary UI dumps are
removed; reverse ports were already absent after emulator restart. Both task
AVDs and all four fixture services are stopped. Shared ADB/T3 services, emulator
userdatas, SDKs, build outputs, caches and artifacts are preserved.

Remaining gates: authenticated release transport, actual iPhone Safari/Android
phones and camera QR scanning, OS local-network permission denial, router guest
isolation, physical screen-reader use, hardware video/audio/performance and the
user-deferred Chromecast/second-TV checks. Only selected private IPv4 Wi-Fi or
Ethernet is supported. Off-origin companion requests were blocked during pairing;
the guest's internet link was not physically disconnected. Local operation uses
no external companion service; ordinary website browsing still needs its network.
