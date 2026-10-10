# Phone remote implementation plan

Status: planned, not implemented. Requested 10 October 2026. Based on
[phone remote research](phone-remote-research.md) and source inspection at
`44ccdafef82661c8188e0b43c98368b369651360`.

## Product scope

Add **Use your phone** to the TV home and browser controls. Scan a QR code,
open a mobile website, approve the connection on the TV, and use the phone
to operate the existing TV browser. No phone app, account or analytics.
The TV retains its website sessions, cookies, rendering, Shields and audio.

Recommended first delivery:

- Address/search, using the TV's selected search provider and URL handling.
- A large touchpad: relative movement, tap once to click, two-finger scroll,
  and accessible alternatives to gestures.
- Page Back/Forward and Reload/Stop, with state reflecting the TV.
- List, open, select and close normal tabs through the existing tab model.
- Text entry into a focused webpage field, with Unicode, composition,
  selection and deletion validated through native input.
- Visible connection state, connected-phone label and Disconnect on the TV.
- Reconnection that fetches fresh TV state before enabling controls.

V1 is a controller used while looking at the TV. Live page preview is a
separate follow-up experiment, not a hidden requirement for shipping these
controls. Also defer private-tab control, persistent remembered phones,
multiple simultaneous controllers, LAN/offline transport, phone-to-TV login
transfer, voice, file transfer and control of other TV apps. Native permission
and security dialogs continue to require the TV remote. Password fields are
outside the initial text-entry scope; do not export their contents.

This is the proposed scope for implementation, not evidence of device support.

## Experience and visual direction

**TV:** reuse the current native cards and themed panels. Make pairing a
deliberate action, not onboarding. The pairing panel has a large black-on-white
QR with a quiet zone, one sentence of instructions, expiry, a manual fallback
and an obvious Cancel button. Validate scan distance on the actual TV. Never
reuse the existing QR sharing dialog's theme-dependent QR colors. After
approval, return to the page and show a small connection indicator with a
remote-accessible disconnect action; do not cover video with a permanent panel.

**Phone:** a compact dark surface with one accent color, readable page identity
at the top, an address/search action, a generous central touchpad, and a small
bottom row for navigation, keyboard and tabs. Selected, disabled, connecting
and disconnected states must look different. Use real buttons, visible labels,
screen-reader descriptions and generous touch targets. Handle phone keyboard
resizing, safe areas, portrait/landscape and browser zoom. No decorative feed,
onboarding carousel, third-party fonts, scripts or tracking.

The keyboard sheet identifies the target page. If focus or page identity
changes, stop sending text and require a fresh target. If a native dialog or
private tab takes over, explain on the phone that control is paused. Never show
an optimistic success when the TV rejected an action.

## Architecture and source boundaries

Use an HTTPS web companion and an outbound secure WebSocket connection from
each endpoint to a small relay. This follows the research recommendation;
it requires internet and a hosted service. Ordinary TV browsing must remain
usable when the service is unavailable. Do not open a listening server on the
TV or request local-network access as a prerequisite for this version.

Proposed ownership:

| Boundary | Responsibility and likely location |
| --- | --- |
| TV pairing/session | A focused Java owner under `brave/android/java/org/chromium/chrome/browser/tv/`; invitation, authentication, connection lifetime, bounded queues and teardown. Owned by the TV activity lifecycle. |
| TV command adapter | Validate each command against current foreground activity, tab, document, viewport and editable target; call native browser actions on the UI thread. Network callbacks never hold a `Tab` or `ContentView` as authority. |
| Existing TV controls | Reuse pointer delivery and cursor overlay from `TvBrowserControls`, navigation/tab operations and existing private/native UI guards. Extend or extract only the small shared input operations needed by both remotes. |
| Phone web client | Proposed `remote/web/` in the root repo; small TypeScript application, mobile UI, gestures, local composition, authenticated channel and authoritative state rendering. |
| Relay | Proposed `remote/relay/`; TypeScript on the Node toolchain already provided by Nix, bounded ephemeral routing and connection limits. No browsing database or account service. |
| Protocol and evidence | Language-neutral schemas/test vectors, interoperability fixtures and tests under `remote/`; browser fixtures and device procedures alongside existing `tests/`. |

`TvRemoteInput.Target` already exposes width/height, pointer display, click and
scroll, but its policy is D-pad based. It has no phone gesture, transport or
authentication semantics. Do not translate every swipe into repeated D-pad
keys. Reuse its tested physical-remote behavior while adding bounded relative
pointer input to the shared delivery path.

`TvBrowserControls.nativeUiOwnsInput`, `currentPage`, `canAccessTabs` and
`runControl` demonstrate relevant guards, but are not a network authorization
API. In particular, the private-tab helper can initiate native unlock; the
phone adapter must reject private access without invoking that side effect.
`BraveActivity` already forwards pause, window focus and destruction to the TV
controller. Use those lifecycle boundaries to suspend input and release resources.
Add the entry points through `TvHomePage` and the existing browser panel.

Existing Android QR code generation uses ZXing. Verify its actual GN dependency
before reusing it. Select a TV WebSocket client and compatible crypto library
only after checking the pinned source/dependencies and completing the first
experiment. Do not introduce a WebView merely to run transport or cryptography.

## Pairing, security and lifecycle contract

Before implementation, write the exact handshake and command schema, including
error responses and size/rate limits. These are release requirements:

- Pairing is off until requested. Generate a high-entropy, short-lived,
  single-use invitation. Proposed lifetime: two minutes, renewable explicitly.
  One active phone per TV session; replacement needs TV approval.
- The QR includes pairing material in the URL fragment. Remove it from the
  address bar after reading it; never put it in query strings, logs, analytics,
  persistent browser storage or shared caches. Use a strict content security
  policy and no third-party executable content.
- Authenticate the handshake to the QR material using an established reviewed
  protocol/library, with separate directional keys, authenticated encryption
  and replay protection. Require TV confirmation before enabling commands.
  TLS alone is insufficient for keeping URLs and typed text opaque to the relay.
- Choose and test the manual fallback during the security experiment. A short
  lookup code is not sufficient authentication. Use an established password-
  authenticated exchange or a cryptographically bound comparison shown on
  both screens and explicitly confirmed on TV. Rate-limit attempts and expire
  invitations; do not improvise a short-code encryption scheme.
- A forwarding relay sees connection metadata, timing and sizes, but should
  not receive plaintext URLs, titles, tabs or text. The web host still supplies
  executable client code and is a trust boundary; document this limitation.
- Validate origins where applicable, roles, protocol versions, message sizes,
  payload types and routing membership. Bound sessions, attempts, bandwidth,
  queues and idle time so unauthenticated traffic cannot exhaust the service.
- Session states: idle, inviting, awaiting approval, connected, suspended,
  reconnecting and closed. Approval and revoked/expired credentials cannot be
  recovered by replaying a previous handshake.
- Resume only the same authenticated session within a proposed two-minute
  reconnect window, using a fresh encrypted channel and fresh state snapshot.
  Keep credentials in memory. Browser-process or phone-page restart requires
  pairing again. TV Disconnect invalidates the session immediately; relay
  deletion alone is not revocation enforcement.
- Losing TV foreground/focus, entering private browsing or showing sensitive
  native UI immediately suspends applicable commands. Opening pairing does not
  enable remote security approvals. Screen-off/background state cannot be used
  to operate an invisible browser. Disconnect after a bounded suspension;
  stop reconnect timers and sockets at teardown.
- Physical remote input remains available. Its navigation/focus changes revoke
  the phone's current input target; cancel pending gestures/composition. Define
  and test arbitration on the UI thread instead of allowing two input streams
  to hold a gesture open.
- Export normal-tab metadata only while permitted. Clear the phone's displayed
  state when suspended/disconnected. Do not expose ADB, DevTools, arbitrary JS,
  cookies, stored passwords, browsing history or general Android key injection.

No payload logging. Development evidence should use synthetic fixture data.
Publish the relay's metadata retention policy before public use; operational
counters must not grow into product analytics.

## Command and text model

The TV is authoritative. Use a session epoch, command sequence, opaque tab ID,
document generation and viewport revision; add an editable-target generation
for text. An unchanged URL is not enough to identify a document. Navigation,
reload, tab replacement, renderer loss and viewport/focus changes invalidate
the relevant generations. Same-document navigation also invalidates pending
page actions where the target may have changed.

Process commands on the UI thread after rechecking live state. Reject stale,
out-of-range, unavailable and unauthorized commands with a bounded reason and
fresh state. Ack means accepted or rejected by the adapter; page loading and
other asynchronous completion are reported separately. Deduplicate discrete
actions and never replay unacknowledged clicks, tab closes or text after reconnect.

Coalesce pointer movement, bound scroll and message rates, discard stale motion
under backpressure, and send taps as discrete actions rather than indefinitely
held buttons. Apply coordinate bounds using current TV viewport geometry. Drop
all pending movement on loss of connection. Tab create/switch/close operations
need the expected model revision so a race cannot affect a different tab.

For address/search, reuse Chromium's normal URL/search interpretation with the
TV provider. Explicitly restrict remote navigation to allowed web destinations
and normal search input; reject executable, local-file, intent and privileged
browser schemes rather than feeding arbitrary input into a privileged loader.

For webpage text, validate a bridge to Chromium's live native input connection.
Do not set DOM values with injected JavaScript or fake ASCII keycodes. Define
how the phone's composition, selection offsets and deletion map to the current
editable, including UTF-16/surrogate boundaries. Any text/context readback needs
explicit scope and must exclude passwords. If reliable native editing cannot
be established, record the limitation and revise scope before calling the
keyboard feature complete. An append-only prototype is not full text editing.

## Ordered implementation checklist

Each stage gets a brief engineering-plan update before source changes, focused
checks, an incremental commit and evidence. All boxes below are unimplemented.

### 1. Resolve the risky integration points

- [ ] Specify handshake, manual fallback, state transitions, command envelopes
  and compatibility/version errors; select compatible maintained libraries.
- [ ] Demonstrate paired encrypted message exchange between the Android target
  and a browser client, including bad authentication and replay rejection.
- [ ] Prove real native text insertion/composition/selection/deletion on fixture
  fields: accented text, emoji, CJK composition, RTL and contenteditable, plus
  password rejection and changing focus/navigation mid-composition.
- [ ] Confirm pointer delivery, geometry and user-activation behavior through
  the native path without breaking the existing physical D-pad tests.

Exit: record working APIs, dependency/build impact and remaining limitations.
Do not build a polished remote around an unproven input or security bridge.

### 2. Deliver one paired vertical slice

- [ ] Implement relay and companion development commands inside Nix, locked
  dependencies and a documented local test setup; no paid deployment yet.
- [ ] Add TV Use your phone, QR/manual fallback, approval, connected state and
  Disconnect. Implement expiry, cancellation and one-controller policy.
- [ ] Open an address/search from the paired phone and return actual title,
  address, loading state and command result. Verify provider choice is retained.
- [ ] Verify unauthorized clients cannot read state or issue commands, including
  before approval and after cancellation/revocation.

Exit: emulator-to-web end-to-end flow with encryption enabled, real browser
navigation and repeatable negative tests. No plaintext transitional release.

### 3. Finish the controller and phone UI

- [ ] Touchpad, visible TV cursor, one tap/one click, scroll and accessible controls.
- [ ] Back/Forward, Reload/Stop and normal-tab create/select/close with live state.
- [ ] Native webpage keyboard bridge from stage 1, safe target identity and
  honest unsupported-field feedback.
- [ ] Finish the mobile layout, pairing panel and TV connection indicator;
  check contrast, focus, labels, keyboard resizing and empty/error states.

Exit: a user can navigate, click, fill a fixture form and manage tabs from the
phone, while the physical remote still works and native dialogs retain priority.

### 4. Reliability, privacy and emulator acceptance

- [ ] Exercise phone background/resume, TV Home/resume, browser/process restart,
  relay restart, Wi-Fi loss/change, expired pairing and duplicate/out-of-order
  commands. Never resume input before fresh state synchronization.
- [ ] Race navigation/tab close/resize/focus/private transitions against queued
  clicks and text; assert no action reaches the replacement target.
- [ ] Test parser limits, invalid authentication, replay, pairing floods,
  slow readers and connection cleanup with bounded service resource use.
- [ ] Verify logs/storage contain no pairing secrets or browsing/text payloads;
  confirm idle unpaired browsing makes no relay connection.
- [ ] Rerun existing home, physical input, native-dialog, tabs, Shields and
  playback checks affected by the shared paths.
- [ ] Record latency, memory, CPU and reconnect results with/without the remote,
  including a 30-minute active session and repeated pair/disconnect cycles.

Proposed usability targets, to validate rather than claim: p95 command round
trip below 150 ms on a healthy nearby relay; no action backlog after disconnect;
connected UI within 10 seconds of network restoration where the session is
still valid. Measure motion presentation separately from command acknowledgments.
Compare browser memory/CPU against the same baseline workload, look for retained
growth after disconnect, and set hardware budgets from measurements before release.
If relay latency makes the touchpad unpleasant, revisit transport before shipping.

### 5. One Chromecast and real phones

- [ ] Choose the companion domain, TLS hosting, relay region, operating budget,
  abuse limits and owner. Prepare a concrete deployment for approval where
  external accounts/spending are required; do not infer these from GitHub access.
- [ ] Test real iPhone Safari and Android Chrome; record exact OS/browser versions,
  QR scan, manual pairing, typing, gestures, accessibility and background/resume.
- [ ] Test the existing Chromecast with the cached optimized ARM build, including
  phone cellular versus TV Wi-Fi and service outage behavior. Preserve its profile.
- [ ] Repeat video/audio/fullscreen and physical-remote arbitration under control
  traffic; measure whole-browser memory and UI responsiveness on hardware.
- [ ] Publish setup/disconnect instructions, privacy limits, tested versions and
  rollback procedure. Keep the feature disableable independently of browsing.

Exit: working phone controller on the existing Chromecast and both phone browser
families, with failures and measured limits recorded. A second TV is not a gate
for this feature; it remains in the user's deferred acceptance backlog.

### 6. Optional live-view experiment — future scope

- [ ] Compare browser-owned viewport capture with MediaProjection consent and
  secure-content restrictions on the actual Chromecast.
- [ ] Prototype authenticated WebRTC signaling/video delivery, including TURN
  fallback cost; retain the existing command authorization boundary.
- [ ] Bind taps to frame ID, document and viewport geometry; handle fit/zoom,
  stale frames and native/private UI without leaking unintended content.
- [ ] Measure readability, latency, CPU, memory, heat and TV playback impact.
  Keep audio on the TV and explicitly show unsupported protected video.

Decide whether to productize live view only after those results. No capture,
TURN deployment or phone-screen mirroring is included in the first controller.

## Build, review and closeout

Use `nix develop` for tooling and locked phone/relay dependencies. Edit the
source fork directly. Reuse the existing Chromium checkout and x64/ARM build
caches, four build workers, 18/22 GiB memory limits and blocking Android analysis.
Do not upgrade Chromium or clear build outputs for this feature.

The emulator data was reset at the user's request on 10 October; the next run
requires a fresh install. Start one test AVD, use `device_list` then `device_open`,
and preserve new evidence. Do not claim old emulator profiles remain available.
Run fast protocol/input tests before cached Android builds; exercise actual
Android input and real phone browsers before declaring integration complete.

Commit incremental implementation slices to source `master`, then update the
root source pin and evidence on root `master`. Review only the latest
implementation commit in each affected repo. Keep failed/unexecuted acceptance
checks unchecked. Stop task-owned servers, watchers and emulator processes at
closeout. The unrelated Android 14 first-launch observation stays open pending
a reproducible failure; this plan does not restart or declare complete the
previous broad MVP goal.
