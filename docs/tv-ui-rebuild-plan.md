# TV browser UI rebuild: engineering plan

Status: **implementation in progress**, 10 October 2026. Requested by the user
after testing the existing TV browser and local phone remote. This is the
canonical implementation checklist for the new UI; checked items require
linked evidence, not just code. Source inspected at
`5829c55f006d1bb10aa9dd4a2ac434e6bf08f0ac`; root planning baseline `48d014f`.

Build a beautiful, convenient TV browser in Kotlin with Compose for TV, while
retaining Chromium rendering and the existing Brave browser foundations.
Replace the mobile-oriented presentation incrementally. Prove the integration
before committing to a full migration. This document authorizes no device
operation by itself; planning requires no build or Chromecast interaction.

Related: [engineering log](engineering-plan.md), [existing TV acceptance](tv-native-checklist.md),
[phone remote plan](phone-remote-plan.md), [phone evidence](phone-remote-evidence.md),
[release backlog](mvp-todo.md), [build procedure](build.md),
[source workflow](source-workflow.md), [device regressions](../tests/device/README.md).

## Current execution authorization (supersedes historical gates)

The user authorizes autonomous implementation, emulator tests and incremental
commits/pushes to both master branches. Produce both visual alternatives, then
continue with the strongest calm charcoal direction unless the user steers.
Selection approval is no longer a blocking Stage 1 gate. Physical spike and
performance acceptance are deferred; actual-engine emulator integration,
security and data integrity remain mandatory. Complete independent emulator
scope while physical gates remain explicitly pending.

The Chromecast is busy and must not be operated, opened, connected, installed,
queried or tested. Discovery is allowed; all device actions must explicitly
target a verified nonphysical emulator. Historical hardware permissions in
other documents are superseded. No ARM build for idle hardware. Preserve caches,
profiles and artifacts; handoff cleanup is complete and does not authorize
repeated application-data resets.

## 1. Outcome and boundaries

A standard D-pad, OK and Back remote must complete everyday browsing without
a phone, mouse, Menu button or undiscoverable long press. The website occupies
the screen; browser controls appear when needed. Home, search, tabs, saved
pages, privacy and settings feel like one TV application, including empty,
loading, error and recovery states.

### What changes, and what stays

| Area | Decision | Engineering consequence |
| --- | --- | --- |
| Home, address/search, toolbar, tabs, browser panels | Rebuild TV presentation in Kotlin/Compose | New focus/navigation model and design system; retire replaced Java layouts |
| Activity, content hosting, tab/profile coordination | Retain and adapt initially | Keep Chromium lifecycle ownership; replace mobile UI dependencies only when callers are understood |
| Rendering, networking, JavaScript, cookies, cache, media | Retain Chromium | No WebView substitution, renderer fork or new video engine |
| Tabs, history, bookmarks, downloads, preferences | Retain existing native models and storage | New UI reads/writes existing bridges; no duplicate databases |
| Shields, content settings, private profiles, certificate handling | Retain enforcement | Rebuild presentation where supported; preserve decisions, policies and isolation |
| Android IME, permission prompts, file/app pickers | Integrate supported system flows | Do not imitate system security dialogs or silently grant permission |
| Phone companion | Retain bundled HTML/CSS/JavaScript and local protocol | Share browser actions/state beneath presentation; adapt TV pairing UI |
| Chromium error/interstitial/internal pages | Inventory individually | Keep trusted renderer/security flows where appropriate; ensure TV navigation and escape |

Java remaining behind the UI is acceptable. A language conversion of working
JNI/model code adds risk without improving the TV experience. No new Room
database for history/bookmarks, no independent download engine, and no rewrite
of browser session storage. A small TV-only preference store is justified only
for new presentation preferences absent from the existing preference system.

Out of scope: mobile feature parity, Sync/accounts, Wallet, Rewards, VPN, Leo,
News, extensions, another platform, guaranteed DRM/4K playback, custom voice
infrastructure and new cloud services. Live view, screen capture and streaming
to the phone remain excluded. Distribution identity, second-TV certification
and ongoing upstream automation remain the separate release backlog.

## 2. Evidence and open feasibility questions

The current TV UI already has native Java implementations, rather than a
JavaScript browser shell. Start with these source entry points:

- [`TvBrowserControls`](../brave/android/java/org/chromium/chrome/browser/tv/TvBrowserControls.java):
  panels, native input routing, cursor, navigation and tab actions.
- [`TvHomePage`](../brave/android/java/org/chromium/chrome/browser/tv/TvHomePage.java):
  a Chromium `BasicNativePage` implemented with Android Views.
- [`BraveActivity`](../brave/android/java/org/chromium/chrome/browser/app/BraveActivity.java):
  controller lifecycle and integration into the existing activity.
- [`TvRemoteInput`](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteInput.java):
  physical remote policy, including exactly one click for held OK.
- [`TvRemoteBrowser`](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteBrowser.java):
  validated phone actions and native text integration.
- [`TvHistoryPanel`](../brave/android/java/org/chromium/chrome/browser/tv/TvHistoryPanel.java)
  and [`TvFilterPanel`](../brave/android/java/org/chromium/chrome/browser/tv/TvFilterPanel.java):
  existing native history and protection bridges.
- [`android/BUILD.gn`](../brave/android/BUILD.gn): Android source/resource integration.

In the pinned external Chromium checkout, `third_party/androidx/BUILD.gn`
contains general Compose/activity targets, guarded by `!limit_android_deps`.
`build/config/android/internal_rules.gni` supports `enable_compose` using the
Kotlin Compose compiler plugin. Inspection did **not** find Compose for TV
material targets. These facts establish a starting point, not a working app
integration. Record exact Kotlin, compiler, AndroidX and TV material versions
and dependency compatibility during the spike; do not copy arbitrary latest
versions into the build.

Google recommends [Compose for TV and TV-specific material widgets](https://developer.android.com/training/tv/playback/compose).
Android supports [embedding Views in Compose](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose),
but that alone does not prove Chromium's compositor, fullscreen host and
input lifecycle will work in our chosen hierarchy. Prefer the existing content
host with a Compose overlay/sibling unless the spike demonstrates a better
arrangement. No browser content recreation merely to change presentation.

The current slow YouTube loading report is not a diagnosed UI problem.
Measure shell responsiveness separately from network, Shields, renderer and
media work. Compose is not an automatic performance improvement.

## 3. Product and design contract

### Visual direction

- Calm charcoal surfaces, warm readable text, one restrained accent, subtle
  depth and short purposeful motion. Website colors should dominate browsing.
- Large usable targets without stacks of giant outlined buttons. Use spacing,
  grouping and selected/focused states rather than outlining every control.
- One unambiguous focus indicator. Focus must remain visible independently of
  color, animations and page content. Disabled actions explain their state.
- Design for viewing distance, 720p/1080p/4K logical layouts, font scaling and
  safe screen edges. Avoid tiny URL metadata and clipped dialogs.
- No expensive background blur, continuous decorative animation or mandatory
  network imagery. Respect reduced-motion/system animation settings.

### Main surfaces

- **Home:** immediate address/search, useful favorites, recent normal tabs and
  quiet access to library/settings/phone. No promotional feed or empty filler.
- **Browsing:** compact controls on demand with location/security, Back/Forward,
  Reload/Stop, tabs and protection status. Explicit route back to page interaction.
- **Address:** understandable URL/search mode, edit/clear/submit, cancel restoring
  the current page, keyboard-safe layout and bounded suggestions from permitted
  existing sources. Never imply HTTP is secure; preserve full-origin inspection.
- **Tabs:** readable cards, selected state, New and Close, predictable selection
  after deletion. Start with flat presentation; no accidental new tab groups.
  Existing grouped tabs must remain accessible and retain their stored data.
- **Library:** favorites/bookmarks and history with clear empty/loading/failure
  states, paging, removal and return to the prior row.
- **Settings:** small task-oriented sections for search, privacy, Shields/filter
  settings, browser data, appearance if needed, and About/licenses.
- **Dialogs:** concise purpose, legible choices, conservative initial focus;
  Cancel is reachable and destructive actions never fire from focus alone.
- **Phone:** clear invitation, waiting-for-approval, connected, paused and
  expired states. Keep the existing experiment/security explanation visible.

### Interaction contract

Define one input owner at a time: system/critical native UI, focused editor,
TV panel, or webpage. Fullscreen is a page mode, not by itself a reason to
disable the phone or abandon the cursor. An Android dialog window/IME retains
its platform event handling; do not impose a second global key dispatcher.

Proposed Back behavior, to verify against existing Chromium handlers:

1. Let the active system dialog or IME dismiss/handle Back first.
2. Cancel or dismiss the top browser modal/editor, restoring its invoker.
3. Return from a library/settings child to its parent; close the root panel
   back to the page/home that opened it.
4. In page mode, honor Chromium's applicable close/fullscreen/page-history
   handling in its supported order. Preserve web dialog/CloseWatcher behavior.
5. At the root with no applicable page action, follow a documented home/exit
   rule; never trap the user or silently close a tab on an ordinary Back press.

Do not reinterpret this list as bypassing native security or webpage handlers.
The spike must map concrete handlers and resolve overlaps before implementation.
Specify one discoverable D-pad/OK/Back route to browser controls from every page
mode, including fullscreen, with no permanent large overlay. Preserve the
existing working route until its replacement passes the same regression.

Restore focus by stable item identity, not stale view/index references. Closing
a tab chooses a surviving neighbor; closing the final normal tab opens a useful
home state with Address focused. Closing the final private tab ends that private
session and returns to normal browsing without copying its title or URL.
Navigation, tab changes, dialogs and input-owner changes cancel held gestures,
pending clicks and composition as appropriate. One physical press has one action.

## 4. Implementation structure

Use a small TV presentation package inside the source fork. Proposed names and
file splits are provisional; follow existing source standards and GN conventions.

- **TV shell:** Compose theme, home, controls and screen/dialog state. Owns
  presentation and focus restoration, not `WebContents` or profile lifetime.
- **Browser session module:** existing native models plus a narrow interface
  for observable state and validated actions. Encapsulates selection, native
  UI ownership and lifecycle rather than making each composable rediscover them.
- **Input module:** physical remote policy, page pointer/touch/wheel and native
  editor bridge. Keep event delivery scoped to the active content view.
- **Phone session module:** existing authentication, revocation and command
  validation. Uses browser actions without passing phone credentials into UI.

Extract this seam from real TV and phone callers as each slice migrates. Avoid
a generic event bus, a replacement browser framework, or a huge interface that
mirrors every Chromium method. Split history/bookmark queries from frequently
updated page/input state so results do not trigger whole-screen recomposition.

The interface contract must define:

- Immutable bounded state: active tab/profile mode, display metadata, loading,
  navigation capabilities, fullscreen/input ownership and relevant revisions.
- Stable identifiers and command outcomes: accepted, stale context, unavailable,
  blocked by private/native UI, or failed with a recoverable user message.
- UI-thread execution and immediate revalidation of current tab, document,
  viewport and editable identity for context-sensitive actions. URL equality
  is insufficient. The phone's stronger authentication/sequence checks remain.
- Cancellation and observer disposal on activity destruction, profile switch,
  tab close and panel dismissal. No callbacks into destroyed compositions.
- No `WebContents`, profiles, credentials or private page text in saved Compose
  state, global singletons, screenshots, diagnostic payloads or logs.
- Async reads cannot populate a different profile/panel after completion.
  Use existing native paging and bounded caches; do not load all history or
  decode every tab thumbnail on the UI thread.

Use Kotlin state/observable facilities compatible with the pinned build.
Choose lifecycle/state libraries only after the spike, rather than introducing
Navigation, Hilt, Room and DataStore as an automatic bundle. Rendering state
must not execute navigation, create tabs or register duplicate observers during
recomposition. Existing browser models remain the source of truth.

## 5. Ordered implementation backlog

All items below start unchecked. Each stage needs a source commit, relevant
tests and evidence before completion. Design work and source inventory can
overlap; native integration and migration gates cannot be skipped.

### Stage 0 — inventory and baseline

- [ ] **0.1** Enumerate every reachable TV surface and entry point: startup,
  home, address, toolbar/menu, normal/private tabs and groups, bookmarks/history,
  downloads, Shields, filters, settings, About, clear data and phone pairing.
- [ ] **0.2** Include transient routes: JavaScript dialogs, permissions, HTTP and
  certificate indicators/interstitials, renderer/network errors, authentication,
  file chooser, external intents, popups/new windows and private unlock.
  Record owner, model/storage, initial focus, Back and replacement strategy.
- [ ] **0.3** Identify activity/layout/toolbar assumptions in Chromium/Brave
  integration. Trace attachment, insets, fullscreen, content offsets, IME and
  lifecycle observers before extracting any controller.
- [ ] **0.4** Capture current emulator screenshots and repeatable core flows.
  Separate known bugs/unverified reports from newly introduced regressions.
  Include the QR pending state, fullscreen cursor, empty tabs and group popup.
- [ ] **0.5** Record performance methodology and baseline: cold/warm startup,
  panel-open/input latency, frame pacing, process/renderer memory, APK/installed
  footprint and a controlled webpage/video load. Record build type and device.
- [ ] **0.6** Select provisional performance budgets and supported configurations
  from those measurements. Mark physical measurements pending until authorized;
  emulator responsiveness does not prove Chromecast performance.

**Gate:** every known user-facing route has an owner and disposition; baseline
scripts/fixtures and unresolved regressions are recorded. No promise that
rebuilding UI fixes an unmeasured renderer/network problem.

### Stage 1 — visual and interaction design

- [ ] **1.1** Produce two coherent visual directions covering home, browsing
  controls and tab switcher. Include real content, long titles and empty states.
  Select one direction with the user before broad visual implementation.
- [ ] **1.2** Make a navigable prototype of home → address → page → controls →
  tabs → library/settings, plus fullscreen return and final-tab recovery.
  Model D-pad and Back, not just mouse clicks on static mockups.
- [ ] **1.3** Define tokens for typography, spacing, surfaces, shape, focus,
  contrast and motion. Define loading/error/offline/disabled states and resource
  strings. Use TV material patterns; avoid mixing mobile and TV themes casually.
- [ ] **1.4** Write the focus/Back transition table, including keyboard, nested
  dialogs, private unlock, native prompts and return from an external app.
  Decide the exact root Back/home/exit behavior and controls-opening gesture.
- [ ] **1.5** Check screen-edge safety, long/localized text, RTL, font scaling,
  semantic labels/roles, announced state and remote/screen-reader operation.
- [ ] **1.6** Record maximum navigation steps for common tasks from the prototype
  and compare with baseline. Remove unnecessary confirmation/menu levels while
  preserving destructive/security confirmation behavior.

**Gate:** chosen visual direction and complete interaction contract, with no
known inaccessible core action. A polished home alone does not satisfy this stage.

### Stage 2 — Compose and Chromium integration proof

- [ ] **2.1** Inventory pinned Kotlin/compiler/Compose dependencies and build
  flags. Add the smallest compatible Compose for TV target/dependency set if
  feasible, using reproducible source-fork integration and license metadata.
  Verify the compatibility/minimum-API constraints rather than upgrading Chromium.
- [ ] **2.2** Build one actual Compose TV screen and compact overlay in the
  existing APK through GN/Ninja. A separate Gradle demo is not acceptance.
- [ ] **2.3** Keep the existing Chromium content host; prove its z-order,
  surface attachment, input coordinates, insets and overlay focus. Evaluate
  `ComposeView`/View interop based on that ownership, not a speculative rewrite
  of the entire activity. Prevent duplicate content parents/observers.
- [ ] **2.4** Exercise real page navigation, system IME, alert/confirm/prompt,
  fullscreen video, tab switch and return. No cursor loss, black compositor,
  duplicated keys or WebContents recreation when panels recompose.
- [ ] **2.5** Exercise background/foreground, activity/process recreation and
  private switching. Verify disposal, state restoration and screenshot protection.
- [ ] **2.6** Measure dependency/APK growth, memory and UI latency against Stage 0.
  Check emulator first; require an authorized optimized low-end hardware sample
  before committing to broad migration or declaring the approach performant.
- [ ] **2.7** Record go/no-go, dependency pins and hosting decision. If TV material
  cannot integrate cleanly, evaluate a bounded Kotlin/native-View alternative
  against the same design contract and explain the tradeoff before expanding.

**Gate:** actual-engine proof on the target build, no lifecycle/input blocker,
and measured feasibility. Independent design/model work may continue while
hardware is unavailable; hardware-dependent claims remain unchecked.

### Stage 3 — shared state and input ownership

- [ ] **3.1** Extract only the browser actions/state required by home, controls,
  tabs and current phone callers from `TvBrowserControls`. Preserve validation
  and errors; leave model/JNI implementations in their existing language.
- [ ] **3.2** Implement explicit shell/panel state and stable focus restoration.
  Test input-owner transitions and cancellation through the shared interface.
- [ ] **3.3** Preserve physical `TvRemoteInput` behavior, held-OK exactly-one-click,
  pointer idle/wake and scoped touch/wheel delivery. Phone gestures are not
  repeated D-pad events. Match coordinates to the actual content viewport.
- [ ] **3.4** Connect lifecycle-aware observations without poll-driven whole-UI
  redraws. Test stale async results, destroyed activities and tab replacement.
- [ ] **3.5** Route phone actions through the extracted browser behavior while
  retaining authentication, revisions, deduplication and UI-thread revalidation.
  Rejection must never invoke private-tab unlock or native permission approval.

**Gate:** existing input/phone security regressions pass before replacing core
surfaces. A fake adapter is useful for UI tests, not proof of native behavior.

### Stage 4 — everyday browsing shell

- [ ] **4.1** Replace home with the selected design, real bookmark/tab data,
  immediate address focus and explicit private appearance. Preserve startup,
  native-page integration and upstream attribution routes.
- [ ] **4.2** Replace address/search UI using current URL classification and
  selected search provider. Support edit/select/delete/submit/cancel, IME and
  optional available system dictation without requiring microphone access.
- [ ] **4.3** Add compact browsing controls with authoritative loading/history,
  protection and security state. Preserve page area and a clear return to input.
- [ ] **4.4** Replace tab presentation: create/select/close, large lists, discarded
  tab restoration, selection after removal and last-normal/private-tab behavior.
  Present existing groups safely; do not ungroup/delete stored tabs implicitly.
- [ ] **4.5** Retain group-close/delete semantics and conservative confirmation
  focus. Exercise both Cancel and confirm on the final grouped tab.
- [ ] **4.6** Integrate fullscreen/media presentation and pointer overlay across
  enter/exit, system bars, tab switches and background recovery. Keep existing
  media session/decoder behavior and native webpage editing.
- [ ] **4.7** Replace TV pairing/connection surfaces. QR auto-pair waiting state
  must not look like an empty manual-code form; expose approval/disconnect and
  truthful paused reasons. Keep physical control usable while paired.
- [ ] **4.8** Retire replaced mobile toolbar/tab/home entry routes per slice so
  old and new UI never compete for focus or dispatch the same action twice.

**Gate: usable redesigned core.** Remote-only search, link/form/scroll, tabs,
video/fullscreen and return home work in the actual APK. Phone parity and
negative security cases pass on supported test clients. This milestone is not
the complete feature set or a public release.

### Stage 5 — library, settings and exceptional flows

- [ ] **5.1** Rebuild bookmarks/favorites add/open/remove and history paging,
  open/remove/clear using existing bridges. Preserve selection after updates,
  pending-operation behavior, policy restrictions and private separation.
- [ ] **5.2** Provide a bounded TV view of existing downloads, supported status,
  open/cancel/removal actions and errors. Distinguish removing a list entry from
  deleting a file; retain existing storage permissions and download ownership.
- [ ] **5.3** Rebuild search-provider, privacy and clear-data settings with scoped
  native operations, explicit effects and cancellation. Do not clear other data
  merely to simplify migration or testing.
- [ ] **5.4** Rebuild per-site Shields and filter/update controls; retain native
  enforcement, exceptions, signed-resource validation and existing traffic policy.
  Verify actual blocked/unblocked resources, not just UI counters.
- [ ] **5.5** Handle site information, permissions and supported authentication
  prompts with accurate origin and safe focus. Keep certificate/interstitial
  decisions and platform permissions with their existing trusted owners.
- [ ] **5.6** Cover JS dialogs, renderer crash/network errors, new windows/popups,
  file chooser and external-app results. Every allowed flow has a return path;
  unsupported actions explain the limitation rather than opening a dead screen.
- [ ] **5.7** Audit first run, About, source/licenses and hidden feature routes.
  Preserve direct startup and disabled analytics/optional services. Recheck that
  upstream UI dependencies have not restored mobile onboarding/promotions.

**Gate:** Stage 0 inventory is accounted for. No ordinary core task falls through
to an unusable mobile screen; retained OS/security surfaces remain accessible.

### Stage 6 — migration, performance and retirement

- [ ] **6.1** Test an in-place upgrade from source `5829c55f0` or its documented
  successor with synthetic normal tabs/groups, bookmarks, history, search choice,
  Shields exceptions and filter settings. Preserve app ID/signing lineage during
  development; distribution identity is a separate decision.
- [ ] **6.2** Version any new TV presentation preference changes; make migration
  idempotent and tolerate missing/old values. Define rollback to the compatible
  browser baseline without attempting to downgrade incompatible profile formats.
- [ ] **6.3** Verify private state is never restored into normal UI or persisted
  through saved-state/thumbnail caches. Test clear data, interrupted operations,
  process death, low storage and failed writes without silent data loss.
- [ ] **6.4** Remove replaced layouts, controllers, routing hooks and temporary
  migration switches after their replacements pass. Keep necessary native bridges;
  remove dead code only after searching callers/resources/build targets.
- [ ] **6.5** Repeat controlled performance measurements on optimized hardware
  builds. Profile observed regressions, including observer churn, thumbnail work,
  composition invalidations, excessive layers and main-thread native queries.
- [ ] **6.6** Complete accessibility/localization/display checks and a sustained
  browsing/video/phone session. Investigate memory growth, frozen focus, cursor
  loss, stale state, dropped input and A/V issues separately.
- [ ] **6.7** Record final replaced/retained surfaces, dependency/upstream touch
  points, build provenance and limitations. Leave second-device/release checks
  unchecked until separately authorized and executed.

**Gate:** agreed TV feature set complete, no known data-loss/security/focus trap,
and measured performance within Stage 0 budgets. Failure to fit storage or
update in place is a defect to investigate, not a reason to routinely uninstall
the user's app/data. Broader tester-release criteria remain independent.

## 6. Verification and evidence rules

Use the existing [device workflow](../tests/device/README.md) and deterministic
local fixtures, extending them only where behavior changes. Test state/focus
transitions at the shared interface and actual native integration on emulator.
UI snapshots/mock adapters supplement those tests; neither proves compositor,
IME, LAN reachability or real-remote behavior.

Required regression groups:

- [ ] **V1 — Remote:** D-pad traversal, key repeat/release, exactly one held-OK
  click, idle cursor wake, nested scroll and return from every panel/dialog.
- [ ] **V2 — Recovery:** final normal/private/grouped tab, Cancel/confirm,
  empty/restoring tab model, delayed callbacks and restored focus after deletion.
- [ ] **V3 — Native input/media:** Unicode, selection/deletion/composition,
  IME dismissal, page dialogs, fullscreen enter/exit, pointer visibility and
  media keys. Include real YouTube sampling separately from deterministic video.
- [ ] **V4 — Phone:** QR/manual/pending approval, rejection/expiry/disconnect,
  tab/navigation races, fullscreen continuity, password/private/native-modal
  rejection, reconnect with no replay and network/background revocation.
- [ ] **V5 — Security/data:** origin visibility, permission denial, certificate
  Back to safety, Shields effects, private isolation, upgrade persistence,
  scoped clearing and asynchronous operations after profile changes.
- [ ] **V6 — Lifecycle:** Home/app switch, sleep/wake when authorized, process
  death, network loss, renderer failure, resource pressure and recovery.
- [ ] **V7 — Accessibility:** focus visibility/order/restoration, target sizes,
  text scaling, RTL/long strings, contrast, semantics and available screen reader.
- [ ] **V8 — Performance:** repeatable startup/panel/input/frame/memory/footprint
  samples, sustained ordinary video and comparison with the same device/build
  configuration. Do not compare x64 Debug and ARM optimized as equivalent runs.

Set numeric budgets after the baseline and before expanding implementation.
Aim for display-cadence UI animation (60 Hz where supported); record frame
percentiles/missed frames, not just average FPS. Record median/tail input latency
and sample counts, idle/active memory and installed size. Separate browser UI
time from network/content/decoder time. A hardware budget miss blocks performance
acceptance even when emulator tests pass.

Record evidence per completed slice in the engineering log with: task IDs,
root/source commits, build args/type, exact artifact/checksum, device/API/ABI,
test commands/fixtures, expected/observed result, screenshots when useful and
remaining limitations. Redact tokens, private URLs and field contents. A passing
automated D-pad replay is not a claim that a person used the physical remote.

The local HTTP phone remote remains the bounded opt-in development experiment
defined by its [security plan](phone-remote-plan.md#security-decision-before-a-distributable-build).
The UI rewrite does not approve a release transport, relax Host/Origin/rate/
identity checks, or enable private/password/security-dialog remote control.
Reverify real phone browser behavior separately; desktop mobile viewport and
ADB forwarding are not Safari or same-LAN compatibility evidence.

## 7. Build and implementation discipline

- Plan the next slice in [engineering-plan.md](engineering-plan.md) before code;
  make small complete vertical changes with corresponding checks and evidence.
- Edit the source fork directly on authorized `master`; commit/push source,
  then commit/push the root pin and evidence. No exported TV patch artifacts.
  Review only the latest implementation commit in each affected repository
  with the code-review skill; fix findings before expanding the slice.
- Advance the external checkout only with documented `tools/checkout.py` after
  commits. Never mutate it during a build, force-reset divergence or upgrade
  Chromium to make a UI dependency convenient. Preserve unrelated work.
- Use Nix, existing x64 `out/android_Debug`, and the documented systemd build
  limits: four workers/SISO local=4, MemoryHigh 18 GiB, MemoryMax 22 GiB, swap 0,
  blocking Android analysis and bounded logs. Check host resources first;
  never run concurrent Chromium builds or delete caches/build outputs.
- Bundle fonts/icons/assets/resources and dependency definitions with the
  source fork. Prefer existing licensed resources and Android vectors; no
  runtime CDN/design asset dependency or untracked root-only APK inputs.
- Emulator first, with explicit serial/session/config and T3 device discovery/
  opening. Start one TV AVD; a phone emulator only if affordable. Document NAT
  and forwards. Use T3 previews for any web design/companion automation.
- Hardware runs follow the user's current authorization and an explicit device
  serial after emulator checks. Never infer device permission from a checked
  planning item. Do not reset/uninstall user data as a routine test step.
- Stop only task-owned fixture/emulator/build helpers at closeout; preserve
  shared ADB/T3 services, profiles, artifacts and all compile caches.

## 8. Effort, dependencies and decisions

These are planning estimates for one experienced full-time engineer familiar
with this fork, including implementation, review and verification. They are
not a delivery promise or a forecast of agent runtime.

- **Usable redesigned core:** approximately 3–5 weeks through Stage 4, assuming
  a short successful integration spike and prompt visual-direction selection.
- **Polished agreed TV feature set:** approximately 10–16 engineer-weeks total,
  including exceptional flows, migration, accessibility and hardware tuning.
- **Broad Android-mobile feature parity:** 4–6+ months; excluded from this plan.

Allow roughly 2–3 days for inventory, 3–5 days for initial design, 3–5 days for
the integration proof, then 2–3 weeks for state extraction/core migration with
overlap where safe. The lower core estimate is optimistic; native lifecycle or
dependency failures push it beyond that range. Remaining work includes roughly
3–5 weeks of secondary surfaces, 2–3 weeks of hardening and 1–3 weeks of
integration/review contingency. Re-estimate after Stage 2 and again after Stage 4
from observed build/test throughput and the completed surface inventory.

Critical path: inventory → actual Compose/content proof → shared input/state →
core shell → exceptional-flow migration → optimized hardware/upgrade acceptance.
Design can progress alongside dependency investigation. More code generation
does not eliminate build, device, human usability or security verification time.

Resolve these decisions at the indicated gate, using these defaults:

- **Visual direction (Stage 1):** calm dark interface, one accent, compact
  on-demand controls; user selects between concrete complete directions.
- **Root navigation (Stage 1):** preserve working remote escape behavior until
  the complete Back/focus transition table demonstrates the replacement.
- **Hosting/toolkit (Stage 2):** Compose TV overlay within retained Chromium
  content ownership. Native Views remain an evidence-based fallback, not a
  reason to ship mixed competing navigation systems indefinitely.
- **Tab groups (Stage 4):** flat everyday presentation, preserve existing groups
  and confirmations; defer new group-management UX unless needed for safe access.
- **Downloads/settings breadth (Stages 0/5):** expose agreed existing useful
  browser behavior; do not expand into every mobile settings feature.
- **Release/security:** independent decisions. A beautiful shell does not
  close the HTTP transport, signing, second-device or distribution gates.

## 9. Risks and stop conditions

- **Compose dependency/toolchain mismatch:** stop broad UI migration if a small
  reproducible GN integration cannot pass. Document concrete failures and choose
  the fallback with measured tradeoffs; no unplanned engine/toolchain upgrade.
- **Lifecycle/focus/compositor coupling:** require real-engine fullscreen/IME/
  private/restore evidence before deleting old paths. Preserve a development
  rollback until the replacement slice passes; remove temporary dual routing.
- **Low-end performance/storage:** enforce measured budgets, keep expensive
  work off the UI thread and limit thumbnails/lists. Diagnose slow websites
  independently. Do not claim debug-build overhead explains every delay.
- **Hidden mobile routes:** maintain the surface inventory through migration;
  security/system UI may remain native, but it must have usable focus and escape.
- **Data/privacy regression:** block progress on cross-profile leaks, destructive
  migration, stale commands or implicit permission acceptance; retain native
  storage and security decisions instead of reproducing them in Compose.
- **Upstream maintenance cost:** minimize activity/layout hooks, document every
  retained override and keep interfaces small. Ongoing update automation remains
  deferred, but the rewrite must not make it needlessly harder.
- **Unavailable hardware/phone/browser:** finish independent work and label the
  missing gates. Do not replace physical evidence with emulator screenshots.

## 10. First implementation slice

When implementation is requested, start with **0.1–0.6 and 2.1**, then **1.1–1.4
and 2.2–2.4**. The first reviewable deliverables are a surface inventory,
two visual directions, measured baseline and one Compose screen/overlay inside
the actual Chromium APK. Do not start by rewriting storage or all of
`BraveActivity`. Revisit the estimate with that evidence before migrating the
remaining surfaces.

Primary design/build references, consulted 10 October 2026:

- [Compose for TV](https://developer.android.com/training/tv/playback/compose)
- [Navigation on TV](https://developer.android.com/design/ui/tv/guides/foundations/navigation-on-tv)
- [Android Views in Compose](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/views-in-compose)
- [AndroidX TV release notes](https://developer.android.com/jetpack/androidx/releases/tv)

Recheck compatibility documentation when implementing; the pinned source and
actual compiled dependency versions determine what this fork can use.
