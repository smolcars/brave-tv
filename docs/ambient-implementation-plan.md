# Ambient TV browser implementation and engineering plan

Ambient is the selected design for the native TV home and browser menu. Add
**Phone** to the home navigation as a normal feature, with connection status and
an explicit Disconnect action. Preserve the browser engine, saved data, selected
search provider, native input, private browsing, and existing browser commands.

The approved plan is implemented in native source. Emulator acceptance and
optimized ARM packaging are recorded in [implementation evidence](ambient-implementation-evidence.md);
physical-device and wider acceptance gates below remain distinct. The [approved visual reference](tv-home-redesign.html)
uses sample data; its preview checks do not establish native-device behavior.

## Product behavior

The top navigation becomes **Home · Tabs · Favorites · Phone**, followed by
Settings and the local clock. The search pill retains initial focus on a fresh
home. Search opens the existing native address editor and uses the selected
provider; the Google reference does not introduce voice search or switch engines.

Use the approved full-screen landscape, upper contrast scrim, forest-colored
surfaces, warm white labels and pale mint focus. Favorites and Continue browsing
use the existing bookmark and normal-tab models. Preserve six favorite and four
recent-tab limits; overflow rows remain reachable through focus-driven scrolling.
Show useful loading/empty states instead of the preview's sample websites.

The browser menu becomes a right-side native drawer. Keep all 17 actions on one
menu level, grouped into address, navigation, library/page controls and utilities.
At smaller viewports or larger font settings, scroll the drawer rather than
shrinking text or restoring a More controls submenu. History, private-mode
restrictions, current Reload/Stop state, Shields and connection status continue
to come from the native owners.

Existing child library/settings screens retain their behavior and visual system.
Keep source, license and Brave/Chromium attribution reachable through the existing
About/utility routes when simplifying the home's footer.

## Phone connection experience

| State | Home control | Phone panel and next action |
| --- | --- | --- |
| Disconnected | Phone | Open Connect your phone; begin a user-requested local listener and show QR/manual pairing |
| Starting | Phone with progress | Explain setup; offer Cancel and a clear error if the listener cannot start |
| Waiting for a phone | Phone with pairing status | QR, same-network instructions, manual URL/code and Cancel |
| Awaiting TV approval | Phone with approval status | A phone wants to connect; TV-controlled Approve and Cancel |
| Connected | Phone with a connected indicator | Connection status, Continue browsing and Disconnect |
| Expired, disconnected or network changed | Phone | Explain the reason and offer Connect again |
| Private or protected context | Restricted neutral state | Preserve existing restrictions; expose no pairing secret or private page data |

Opening Phone is the deliberate connection request; the listener never starts
just because Home appears. Remove the preliminary development-experiment screen.
Keep TV approval as a separate step. Before approval, the phone cannot issue
browser commands. One phone controls one foreground TV session.

Back/Cancel during pairing revokes the invitation and closes the listener.
Back from an already connected panel closes the panel while keeping that
foreground session connected. Disconnect immediately revokes credentials, stops
the listener, removes its badge and updates Home. Returning from the panel restores
focus to the same Phone action, including after its status changes.

Keep the current session policy initially: invitations expire after two minutes;
inactive approved sessions expire after two minutes; every session has a
35-minute maximum lifetime. Surface expiry and reconnect clearly. Persistent
pairing, background control and changes to these limits are separate changes.

### Remove experimental gating while preserving truthful transport

The current TvPhoneRemote.available() requires a non-official local build and
--tv-local-remote-experiment. Replace those build/channel/switch restrictions
with normal TV eligibility and existing profile/security checks. The feature
must work on the optimized non-debuggable TV APK without selecting a debug app.

The existing listener is **HTTP**, using same-origin fetch/POST polling.
Availability and encryption are different changes. This plan promotes the
existing local connection and replaces development wording with a concise,
truthful **Local connection · not encrypted** notice and trusted-network guidance.
Do not describe it as encrypted or silently imply that deleting the flag adds TLS.

The [local HTTPS research](phone-remote-https-research.md) remains a separate
transport workstream. Its owned-domain/certificate approach has provisioning,
renewal and real-phone compatibility work that this visual redesign does not
implicitly authorize. If warning-free encrypted control becomes a release
requirement, complete that transport work before distributing the promoted
feature under that claim.

## Engineering changes

| Owner | Planned change |
| --- | --- |
| [TvPresentation.kt](../brave/android/java/org/chromium/chrome/browser/tv/presentation/TvPresentation.kt) | Add scoped Ambient home/drawer composables and tokens; render a search pill, navigation, bounded saved/recent cards, and named icon actions |
| [TvHomePage.java](../brave/android/java/org/chromium/chrome/browser/tv/TvHomePage.java) | Move Phone from footer links into stable header actions; bind real status while attached; preserve bookmark/tab identities and disposal |
| [TvBrowserControls.java](../brave/android/java/org/chromium/chrome/browser/tv/TvBrowserControls.java) | Host the controls window at the right edge; preserve action validation and invoker focus; expose the existing phone owner through a small state/action seam |
| [BraveActivity.java](../brave/android/java/org/chromium/chrome/browser/app/BraveActivity.java) | Keep the TV-only entry bridge; support Home Phone focus restoration using the existing Settings-return pattern |
| [TvPhoneRemote.java](../brave/android/java/org/chromium/chrome/browser/tv/TvPhoneRemote.java) | Remove experimental eligibility gates; expose sanitized connection state; handle start/pair/approve/stop/expiry errors and focus restoration |
| [TvRemoteSession.java](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteSession.java) | Retain credentials, approval, expiry, replay policy and revocation; no new persistent pairing store |
| [tv_remote_server.cc](../brave/browser/android/tv_remote_server.cc) | Update the traffic annotation for a user-initiated normal TV feature; retain private-interface binding, exact Host/Origin checks and admission limits |
| [tv_remote.html](../brave/android/java/brave-res/raw/tv_remote.html) and TV resources | Replace experimental wording, preserve the unencrypted notice, add localized status/recovery labels and consistent vector icons |
| [Android GN resources](../brave/android/BUILD.gn) | Register the bundled wallpaper/credits and any resource changes; retain pinned Compose for TV and QR dependencies |

Keep callbacks and session transitions on the UI thread. Add a small observable
phone-state snapshot owned by TvPhoneRemote, with subscription/removal through
the existing TV controller. It contains presentation status/reason only, never
tokens, invitations, editable text or private page identity. Publish changes on
start, listening, pairing, approval, revocation and failure; do not infer a
connection from the presence of a dialog or a remembered Boolean.

Home subscribes on attach and removes its observer on detach/destroy, following
its current model-observation lifecycle. Native actions retain stable keys and
identity when labels change. Do not introduce a second server, global event bus,
new tab database, HTTP client framework or alternative browser-content host.

Use existing Action.icon support for browser controls. Give home cards only
the display metadata their composition needs, backed by the existing native IDs.
Use native favicon facilities with bounded loading where practical and a bundled
generic/site-initial fallback; never hard-code the five preview sites.

Keep the existing connected badge reachable over webpages. Suppress its duplicate
presentation on Home, where the Phone header already communicates the same state.
Normal/private and protected-modal transitions remain authoritative.

### Native rendering and focus

- Use a bundled, credited 16:9 wallpaper under drawable-nodpi, with the reviewed
  crop and scrim. Decode at a bounded display size and share one cached image
  across home views; avoid main-thread decode, per-tab bitmap copies and runtime
  wallpaper/font requests. One scene ships first; rotation is outside this slice.
- Scope Ambient styling to Home, root controls and their Phone presentation.
  Keep the established phone companion layout and unrelated native panels.
- Keep Compose dp/sp, overscan-safe margins, role-based colors, readable
  disabled states and system reduced-motion behavior. The clock uses local
  system time and only updates while attached.
- Initial Home focus is Search. Up reaches header destinations; Down reaches
  favorites and recent tabs. Preserve keyed focus as native data changes.
- The drawer remains a separate native dialog/window beside Chromium content.
  Update gravity, width, height and dimming as well as its Compose layout.
  Do not move WebContents, the compositor, cursor or fullscreen ownership.
- Replace the old expanded/collapsed controls presentation with the one-level
  drawer. Root Back returns to the page; child Back restores its drawer invoker.
  Native IME, fullscreen, security dialogs and system Back retain priority.
- Preserve FLAG_SECURE on private windows. Never shrink the controls to force
  a screenshot match when font scaling or translation needs scrolling.

## Implementation sequence

### 1. Establish the shared presentation state and assets

Add scoped Ambient tokens, the optimized wallpaper and attribution, menu icons,
and the observable phone-state seam. Keep the existing native state/actions.

**Exit:** resources compile; no repeated bitmap decode; observer teardown and
sanitized state are covered; status changes retain action identity.

### 2. Build native Ambient Home and the Phone header

Replace Home composition with the approved search-first layout and real
favorites/recent tabs. Add Phone navigation and correct invoker restoration.
Connect the header to native connection state; retain private-home behavior.

**Exit:** native D-pad/OK reaches every Home action, Search is initial, empty and
populated sections work, and Phone updates preserve focus.

### 3. Replace the browser controls with the right-side drawer

Implement the native window geometry and grouped actions. Remove the presentation
toggle while retaining action keys, contextual enabled states and child routes.

**Exit:** all 17 actions remain reachable; Forward skips when disabled; Reload
becomes Stop during loading; child Back and fullscreen Back restore correctly.

### 4. Promote phone pairing and finish recovery

Remove the local/non-official/switch gates. Replace the experimental start screen
and wording, add start/network/expiry recovery, and preserve QR/manual pairing,
TV approval and Disconnect. Update traffic annotation, setup instructions and
the companion's product record to match the new feature status.

**Exit:** an unflagged optimized TV build completes connect, approve, use,
disconnect and reconnect. Closing Home never starts a listener. Revocation and
private/modal protections still hold.

### 5. Validate the native build and record acceptance

Run focused host/JVM and Android instrumentation checks, build the existing
cached x64 target, and verify on a TV emulator with its retained profile. Build
the optimized ARM target and complete Chromecast/real-phone acceptance before
calling the promoted feature supported on those devices.

**Exit:** the acceptance checklist below is complete, or its concrete remaining
failures are documented. Preserve the previous verified APK and source revision;
commit/push source and then the project pointer using the existing source workflow.

## Acceptance checklist

- [ ] TvHomePageTest and TvPresentationTest: default focus, bounded real data,
  stable Phone state updates, observer disposal and invoker restoration.
- [ ] Focused pairing integration coverage: default TV availability without the
  experiment switch, QR/manual invitation, pending approval, cancel, approval,
  disconnect from TV/phone, expiry and listener startup failure.
- [ ] Existing tests/test_phone_remote.py session/replay checks and the real
  bundled companion host regressions; add state-transition regressions where
  their existing harnesses can exercise the native seam.
- [ ] Native D-pad/OK/Back replay for Home, drawer, address/IME, libraries,
  settings, page cursor, scroll, playback, final-tab closure and fullscreen.
- [ ] Paired-input rejection during native confirmations, permissions, private
  browsing and protected/password editing; no private metadata leakage.
- [ ] Listener remains off before Connect and closes on Cancel, Disconnect,
  backgrounding, activity destruction and network change. Old credentials fail.
- [ ] Existing profile survives update: favorites, normal tabs/groups, selected
  search provider, Shields settings and engine behavior are preserved.
- [ ] Native captures at 720p/1080p and font scales 1.0/1.3/1.6, with long labels,
  RTL, empty/error states and screen-reader announcements. Reduced motion works.
- [ ] Actual phone browser QR/manual pairing, touchpad, text entry, tabs,
  disconnect/reconnect and network-loss recovery on iPhone Safari and Android
  Chrome/Brave; no substitute claim based only on a desktop client.
- [ ] Compare matched-device startup, menu latency, frame behavior and total
  process PSS with phone polling off/on. Use the existing provisional limits:
  median regression ≤15%, tail ≤25%, idle PSS growth ≤80 MiB and APK growth
  ≤10 MiB. These are investigation gates, not guaranteed performance.
- [ ] Record exact source/APK hashes, native screenshots, phone/device evidence
  and review findings. Update native DESIGN.md from the implemented Ambient
  result; preserve the separate phone companion design record.

## Handoff boundaries

Reuse the current Chromium/GN checkout, pinned Compose dependencies and retained
build caches. Follow [the direct-source workflow](source-workflow.md) and
[resource-limited build instructions](build.md). Do not reset the user's profile
or recreate the Chromium checkout for a presentation change.

No protocol v2, cloud relay, account system, permanent pairing, background
service, remote-screen video, artwork service or search-engine migration is
included. The HTTP disclosure is the material remaining transport limitation;
the feature's first-class placement does not resolve it.
