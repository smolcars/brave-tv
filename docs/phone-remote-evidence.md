# Local phone remote experiment — 10 October 2026

Implementation and acceptance are in progress. No physical Chromecast operation
is authorized or performed. This is not release acceptance.

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
