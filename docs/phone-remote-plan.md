# Local phone remote implementation plan

Status: implementation authorized in a new T3 thread, 10 October 2026.
This revision supersedes the relay-first plan at `bf3e5d9` and follows the
user's explicit preference for same-network operation. The original
[research](phone-remote-research.md) remains background, not the chosen transport.
Source integration was inspected at `44ccdafef82661c8188e0b43c98368b369651360`.

**Updated authorization: the user now permits installation and a short test on
the Chromecast while watching. Preserve its profile and use an optimized,
non-debuggable local development build. Real-phone and broader hardware
acceptance remain separate gates.**

## Product scope

Add **Use your phone** to the TV home and browser controls. The TV starts a
local server while the feature is active, shows a QR code for its LAN address,
and approves one paired phone. The phone opens the remote in its browser.
Commands go directly to the TV; no cloud relay, hosted companion, account,
analytics or external asset fetch is required. The remote should work without
internet access, although websites still need their normal network access.

Implement:

- Address/search using the TV's selected search provider and normal URL handling.
- A large touchpad, visible TV pointer, one tap/one click, two-finger scrolling
  and accessible alternatives to gesture-only actions.
- Page Back/Forward and Reload/Stop with authoritative enabled/loading state.
- List, create, select and close normal tabs using the existing tab model.
- Native text entry into an eligible focused webpage field, including Unicode,
  composition, selection and deletion validated against the real input path.
- Readable current title/address, connection state, and immediate Disconnect
  on both TV and phone. Keep the physical TV remote usable.
- Safe reconnection that fetches fresh state before accepting input.

**Live TV/page preview, screen streaming and mirroring are removed from this
feature and its backlog.** No capture, MediaProjection, video WebRTC or TURN work.
Also exclude persistent remembered phones, multiple controllers, private-tab
control, password entry/readback, account transfer, voice, files and control of
other TV apps. Permission/security dialogs require the TV remote.

## Local architecture

The APK bundles the companion's HTML/CSS/JS. A small embedded HTTP/WebSocket
server serves that static content and a narrow command channel from the same
origin. Start it only on explicit Use your phone, and stop it when the session
ends or expires. Reuse a suitable maintained server already available in the
pinned source if possible; inspect dependencies before adding one. Do not
write a general HTTP/WebSocket parser, embed Node, or start a WebView for transport.

Select an active Wi-Fi/Ethernet LAN interface and bind explicitly to its local
address, not all interfaces. Do not expose the listener on cellular, VPN or a
public interface, configure router port forwarding, use UPnP, or discover devices
by scanning the subnet. Reject unsupported/ambiguous interfaces visibly. Start
with a tested private IPv4 path; document IPv6-only networks as unsupported unless
implemented and verified. Handle address changes by revoking the old session,
closing the listener and regenerating pairing information. The QR carries the
exact numeric address/port; mDNS is optional and not a prerequisite.

The first compatibility experiment may use same-origin `http://<TV-IP>:<port>`
and `ws://` on an isolated development network. This is a local reachability
baseline, not an encrypted connection. Confirm real private-address behavior,
not just localhost: secure-context exceptions for loopback do not establish
behavior for another LAN device. Avoid APIs that require secure contexts unless
the selected deployment actually supplies one. See the
[Secure Contexts specification](https://www.w3.org/TR/secure-contexts/).

Serving UI and socket from one local origin avoids introducing a public-site
connection to a private server, but does not prove every phone browser permits
it. Test stock browser behavior and permission denial; do not require insecure
browser flags or disabling device security. Chrome's
[local-network access guidance](https://developer.chrome.com/blog/local-network-access)
is background; its initial milestone notes are not a current cross-browser
compatibility guarantee. Verify current primary documentation during the spike.

A guest network may isolate phone and TV even with the same Wi-Fi name. Show
useful connection-failure guidance; do not silently send traffic through a relay.
Cellular-only phones and operation away from home are outside the local feature.

## Security decision before a distributable build

Local-only does not imply confidential or trusted. HTTP can expose session
credentials, URLs and typed text to a network observer; an active attacker can
replace the served JavaScript. Adding encryption to later commands cannot fix
an unauthenticated HTTP bootstrap. A QR fragment avoids an initial HTTP query
leak, but it does not fix that bootstrap either.

Stage 1 must record a concrete transport/threat-model decision. Investigate a
usable authenticated HTTPS/WSS local path without shared private keys, mandatory
CA installation or certificate-warning bypasses. Do not pretend a self-signed
certificate is automatically trusted because its fingerprint is inside a QR.
Do not invent cryptography to mask certificate/bootstrap constraints.

The authorized initial work can implement and exercise a bounded, explicitly
labeled development-only HTTP remote using synthetic data. It must remain off
by default and must not be described as encrypted or safe on hostile/shared LANs.
If a shippable app-free local experience requires accepting this trusted-network
limitation, surface the concrete result and tradeoff before enabling it in a
public build. The user's same-network preference is not blanket approval to
weaken the browser's security. Continue independent UI/input/emulator work while
that release decision is pending. A relay remains the alternative below.

Regardless of transport:

- The listener is off until requested. Pairing invitations are random,
  high-entropy, single-use and expire after a proposed two minutes.
- Put QR secrets in fragments, consume and remove them from the phone URL,
  and never persist them or log request secrets/payloads. No third-party scripts,
  fonts, service worker or external subresource dependence. Set restrictive CSP,
  no-store, frame-ancestors and referrer policy headers.
- Require TV approval of the pending phone before any state or command access.
  Only one pending/active controller; prevent unsolicited prompt floods.
- A manual local URL plus short code needs expiry, aggressive attempt limits
  and explicit TV approval. Specify token exchange/session binding; do not
  treat a short code as an encryption key or permanent bearer credential.
- Validate exact Host and Origin against the issued local origin, reject
  unexpected/null origins where applicable, DNS rebinding and cross-site
  WebSocket attempts. Do not allow wildcard CORS or mutating unauthenticated GETs.
  Origin validation is additional protection, not a replacement for authentication.
- Bound handshake time, requests, connections, headers, frame/message size,
  command rate and queues. Reject malformed/unknown protocol versions and input.
- Revoke locally on Disconnect, expiry, process exit or network change. Limit
  reconnect to the same authenticated session within a proposed two-minute
  window, refresh state and drop unsent actions; no persisted pairing in v1.
- Pause commands on TV background/screen-off, native modal or private context;
  suspend/close the listener on background with a documented bounded lifetime.
  Normal browsing must not keep an idle network server running indefinitely.
- Export only permitted normal-tab metadata. No private tabs, cookies, stored
  passwords, history, ADB, DevTools, arbitrary JS or general Android key injection.

## Browser integration and UI

Keep network/session work outside the UI thread; validate and deliver commands
on it. Reuse `TvBrowserControls` pointer events, cursor overlay and tab/navigation
operations. `TvRemoteInput.Target` is a physical-remote input boundary, not a
network API; preserve its existing tests and do not synthesize D-pad repeats
for phone gestures. Extract only the small delivery operations that need sharing.

Preserve `nativeUiOwnsInput`, tab lifecycle and private guards. In particular,
`canAccessTabs` can initiate native unlock: remote rejection must not invoke
that side effect. Use `BraveActivity` pause/focus/destroy callbacks to suspend
input and close resources. Add entry points through `TvHomePage` and the native
controls panel; reuse the existing ZXing dependency after checking its GN target.

Use opaque tab IDs, session epoch, command sequence, document generation,
viewport revision and editable-target generation. URL equality alone is not
identity. Navigation, reload, renderer loss, tab changes and focus/geometry
changes invalidate the applicable targets. Revalidate at execution time;
reject stale input and return fresh state. Deduplicate discrete actions;
never replay a click, text commit or tab-close after reconnect. Coalesce motion
and discard stale movement under backpressure. Cancel phone gestures when the
physical remote changes the target, so neither input stream retains a held press.

Reuse safe URL/search interpretation and limit remote destinations to normal
web navigation/search; reject executable, file, intent and privileged schemes.
Validate Chromium's native input connection for Unicode, composition, selection
and deletion, including UTF-16 boundaries. Do not inject DOM values or substitute
ASCII keycodes. Exclude password fields. If a reliable editing bridge is not
available, record a narrower supported behavior honestly before declaring it done.

Proposed source ownership: Java server/session and command adapter under the
existing `brave/.../browser/tv/` directory; bundled companion sources/assets in
the fork's Android resource build so the pinned source is self-contained; fast
protocol/fixture tests alongside the relevant code, integration/device evidence
in root `tests/` and `docs/`. Pick precise GN packaging after inspection. No
relay package or general transport abstraction solely for a possible fallback.

TV pairing uses the existing themed cards, large high-contrast QR, expiry,
manual address/code, Cancel and obvious connected/disconnect state. Phone UI
uses a calm dark surface, one accent, readable page identity, a generous touchpad
and compact navigation/keyboard/tabs. Include accessible labels, touch targets,
visible disabled/error states and phone keyboard/safe-area handling. Native/private
UI takeover must say control is paused rather than falsely acknowledge success.

## Ordered implementation checklist

### 1. Local feasibility and bounded input experiment

- [x] Write the engineering slice, exact protocol, threat model and server/library
  choice before code changes. Inspect existing source/build dependencies.
- [x] Serve bundled UI and a paired command channel from the TV emulator. Test
  unauthenticated rejection, expiry, revocation, Origin/Host checks and limits.
- [x] Exercise a second client via a private-address route; document simulator
  NAT/forwarding. A loopback ADB forward is only adapter evidence, not LAN proof.
- [x] Record HTTP/HTTPS bootstrap findings and supported browser/API behavior;
  select a release-capable route or keep HTTP restricted to development.
- [x] Prove native pointer and Unicode/composition/selection/deletion on harmless
  inputs, textarea and contenteditable; test password/focus-change rejection.

### 2. Complete one local pairing-to-navigation flow

- [x] Add Use your phone, bundled serving, QR/manual fallback, TV approval,
  connected indicator, disconnect, expiry and network-change teardown.
- [x] Pair a simulated/browser client and open address/search; return actual
  page identity/loading/error state and preserve selected search provider.
- [x] Confirm companion assets and control require no external host or internet.
  Use local fixture pages to distinguish remote operation from internet browsing.

### 3. Finish remote controls and visual design

- [x] Touchpad, tap exactly once, scroll, accessible alternatives and cursor state.
- [x] Back/Forward, Reload/Stop and normal-tab create/select/close with live state.
- [x] Native eligible-field keyboard bridge and clear unsupported-field feedback.
- [x] Polish phone layout, TV pairing and connection UI; check keyboard resize,
  portrait/landscape, zoom, contrast, focus and screen-reader labels.

### 4. Reliability and emulator acceptance — authorized now

- [x] Test emulator disconnect/reconnect, browser restart, TV background/resume,
  active-interface changes, native permission rejection, unreachable network and
  duplicate/malformed/oversized/late commands. Drop queued actions on reconnect.
- [x] Race tab/navigation/focus/private/modal transitions against clicks and text.
- [x] Verify no unpaired state leaks, cross-site control, payload logging or
  indefinitely retained sockets/timers; listener is absent when remote is off.
- [x] Rerun affected home, D-pad, tabs, native dialogs, Shields and playback checks.
- [x] Run a bounded 30-minute session and repeated pair/disconnect cycles;
  compare whole-browser memory/CPU and measure input/reconnect latency.
  Final run: 181 commands, p95 round trip 69.8 ms; reconnect 456 ms. See
  [evidence and remaining gates](phone-remote-evidence.md).
- [x] Test available Chromium/mobile-browser emulation and Android phone emulator.
  Android Chrome 133 and Brave Chromium 155 pass the private-address flow.
- [ ] Safari/iOS simulator is unavailable on this Linux host. Real OS local-network
  permission denial, router guest isolation and physical-phone acceptance remain
  open below; desktop mobile emulation is not equivalent evidence.

Proposed usability targets: p95 command round trip below 100 ms on a healthy
LAN, no queued-action burst after reconnect, and usable state within 10 seconds
of restored reachability if the old session remains valid. Measure presentation
latency separately from acks. Record actual measurements, not promises; emulator
forwarding numbers are not hardware LAN measurements.

### 5. Hardware acceptance — limited Chromecast test now authorized

- [ ] Real iPhone Safari and Android Chrome on home Wi-Fi: QR/manual pairing,
  keyboard/gestures, foreground/resume, denied permissions and unavailable TV.
- [ ] Existing Chromecast, now authorized for a short test: preserve
  its profile, use a cached optimized build, repeat video/audio/fullscreen and
  physical remote arbitration; check memory and real Wi-Fi behavior.
- [ ] Resolve the transport release decision, publish tested versions, local-
  network limitations, setup/disconnect instructions and rollback/off switch.

A second TV remains deferred. No capture or streaming acceptance is needed.

## Relay fallback, only if local feasibility fails

If normal phone browsers cannot connect reliably without security bypasses, or
there is no acceptable local bootstrap/security tradeoff, document the failing
case and propose switching to an HTTPS companion plus authenticated encrypted
relay. Do not silently route traffic externally or deploy a shared service.
Hosting/provider/domain/cost decisions would then be needed; none are needed
for the local prototype. Reuse the bounded browser command boundary and UI, not
speculative relay scaffolding. The user has permitted considering this fallback.

## Build, review and handoff

Use Nix and locked dependencies. Edit the source fork directly, not TV patch
files. Preserve existing Chromium/x64/ARM caches and artifacts; four workers,
18/22 GiB memory thresholds, no swap and blocking Android analysis. Do not
upgrade Chromium or clear outputs. Start at most one TV AVD; add a phone AVD
only if resources permit. The AVDs were reset on 10 October, so reinstall the APK.
Call `device_list` then `device_open` for emulator use and explicitly target its
serial for every command. Never issue an unqualified ADB command that could
operate the connected physical TV. Browser checks should use T3 preview tools.

Plan each slice, implement, test, commit incrementally and push `master` in the
source fork and root repo (with source pin/evidence). Review only the latest
implementation commit in each affected repo. Keep partial acceptance unchecked.
Stop task-owned helper servers/watchers/emulators at closeout, preserving shared
ADB/T3 services and caches. Do not resume the previous broad MVP goal or the
unreproduced Chromecast launch investigation. The new implementation thread owns
this work; this planning thread must not concurrently edit or run builds.
