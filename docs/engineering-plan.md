# Android TV MVP engineering plan

## Objective

Implement [the MVP checklist](mvp-todo.md) by adapting Brave's Android browser. Preserve Chromium, Shields, profiles and browser security. Deliver a signed, sideloadable build after the checklist's device and usability criteria pass.

Write or update this engineering plan before each implementation stage. Keep incomplete implementation and unverified acceptance criteria distinct.

## Current direction: autonomous TV UI implementation (10 October)

The user requested an in-depth plan for a beautiful, convenient TV-first UI
using Kotlin/Compose while retaining Chromium. Follow the
[TV UI rebuild plan and ordered todo](tv-ui-rebuild-plan.md) for scope,
presentation/model ownership, design work, integration proof, migration and
acceptance gates. Implementation is starting. The next implementation
slice begins with the surface inventory and pinned Compose dependency audit;
do not rewrite browser storage or replace Chromium with a WebView.

The sections below record earlier implementation decisions and evidence.
Time-specific device restrictions/permissions describe those earlier tasks;
follow the user's current authorization for future device work. This planning
task does not operate the Chromecast or reopen the deferred release backlog.

### Current scoped overrides and first slice

The user authorizes the complete canonical UI checklist, emulator tests and
incremental reviewed commits/pushes to both master branches. The physical spike
and performance gate is deferred because the TV is busy. Produce concrete visual
alternatives, then choose calm charcoal/warm text with a restrained accent and
continue unless the user steers. These overrides do not waive actual-engine,
security or data-integrity gates. Do not operate the physical Chromecast in any
way; explicitly target verified nonphysical emulators. Preserve caches/profiles;
handoff cleanup is complete, not authorization for repeated data resets.

First slice: inventory routes and pinned dependencies, capture a baseline on
source5829, seed synthetic upgrade fixtures, show two designs and prove Compose
for TV home and a compact panel in the actual GN APK. Retain native content,
models, input and security ownership. Acceptance requires blocking analysis,
native focus/IME/page/fullscreen and lifecycle checks; prototypes are not APK
acceptance. Source commits precede checkout advancement; one cached x64 build
at a time, SISO local=4, MemoryHigh18G/MemoryMax22G/swap0, blocking analysis.

Initial host observation: 29 GiB RAM, 6.2 GiB used, 23 GiB available, no swap;
395 GiB disk free. No Chromium build or emulator running. Root `6f06d77`, source
`5829c55f006d1bb10aa9dd4a2ac434e6bf08f0ac`, both clean. Physical, real-phone
and second-device acceptance stays pending.

First integration attempt: source `0c0234883`, root `33dcb30`, failed at GN
regeneration before compilation. Chromium's Kotlin source allowlist rejects
the new presentation path. Add only that source-owned package to the existing
allowlist through Brave's tracked internal_rules patch; retain all assertions
and analysis. Review also requests a safe empty-action contract and removal of
duplicated home links. Complete the compact Compose panel proof in this slice
before treating toolkit integration as accepted. No cache was removed.

Second attempt: GN rejects dependencies on Chromium's restricted Compose
targets from the source-fork AAR target. Define the TV targets through a small
Brave-owned template imported into the AndroidX build, exposing one presentation
target through the Brave entry point, rather than broadening visibility lists.
Keep AARs, Kotlin sources and metadata in Brave. Latest review also asks for the
Kotlin allowlist contents in a Brave-owned include and an explicit activity-owner
contract. Baseline emulator exited during native browser rendering under T3's
default Vulkan configuration, matching the existing documented host problem;
restart only the TV AVD with guest Vulkan disabled and preserve its data.

Third GN attempt reaches the imported template and rejects its unused
`target_name`. Mark that template parameter unused, keeping GN's checks active.
The baseline native home replay now passes all 20 steps on the Vulkan-disabled
TV emulator. Capture the two navigable design alternatives in source docs and
select the charcoal/sage direction; prototypes remain separate from APK proof.

Fourth attempt passes GN and invokes the actual Kotlin/Compose compiler. Two
errors come from the `ComposeView.apply` receiver's Android `background`
property shadowing the palette color; rename that token to `backgroundColor`.
No toolkit incompatibility is established by these ordinary source errors.
Peak cgroup observation for this attempt was 8,649,408,512 bytes (8.06 GiB).

## Previous feature: phone remote (10 October)

The user selected a **local-only, same-network phone remote** and authorized
implementation in a new T3 thread using Astra with high reasoning. Follow the
revised [implementation plan](phone-remote-plan.md): TV-hosted bundled companion,
local pairing/command channel, native text input, then gestures/tabs and reliability.
Resolve browser reachability and transport security early; plain local HTTP is
not encrypted and remains a development experiment pending a release decision.
The earlier [research](phone-remote-research.md) remains background. Relay hosting
is a fallback if local feasibility fails, not the default architecture.

Live view/streaming is removed from scope and backlog. **Do not use the physical
Chromecast now: the user is watching TV.** Test on emulators/simulated clients;
real-phone and Chromecast acceptance remains pending. Preserve caches and use
Nix, plan each slice and commit incrementally to master. This does not reopen
the paused broad MVP goal or the user-deferred release backlog.

### Phone remote slice 1 — bounded local experiment (10 October)

Implement the server/session boundary and native editing bridge before acceptance.
Reuse pinned Chromium `net::HttpServer` (BSD, maintained with this Chromium pin),
not a new Java server/parser. Use same-origin JSON POSTs and bounded state polling
for the first command channel: no WebSocket fragmentation/compression buffers or
reconnect action queue are needed. This is a deliberate transport simplification
of the HTTP/WebSocket proposal; it keeps all control on the selected LAN.

Surfaces: a native IO-thread listener and JNI bridge; Java TV pairing/session and
browser command adapter; bundled raw HTML/CSS/JS resources; home/control entry
points and BraveActivity lifecycle; a fail-closed bytecode hook into the existing
Chromium IME adapter for current text/focus identity and synchronous native edits.
The hook uses the same composition/selection/deletion methods as InputConnection,
without its deferred UI tasks (which could retarget text after focus changes).
Physical D-pad policy remains unchanged.

Protocol v1: POST /pair with a 256-bit fragment invitation (two-minute single use)
or a rate-limited eight-digit manual code; pending TV approval returns a random
controller credential. POST /api authenticates that credential; state polling
returns a session epoch, context revision, editable revision and opaque tab IDs.
Commands carry strictly increasing sequence plus those revisions. One request
per client at a time, no replay after timeout, polling refreshes before new input.
TV approval is required before metadata/control. Disconnect/background/network
change revoke everything. Absolute session lifetime 35 minutes; lost-client
lifetime two minutes. At most four sockets, 16 KiB receive buffers, 64 KiB send
buffers, five-second request timeout, bounded global rate and no payload logs.
Exact numeric Host and same-origin POST Origin required; no CORS; reject upgrades.
Serve only three bundled assets, with CSP/no-store/nosniff/no-referrer headers.

HTTP remains **development-only**, gated by a debug APK plus an explicit process
switch and visible synthetic-data warning. No remembered controller or public
release enablement. Investigate authenticated HTTPS independently; no shared key,
certificate-warning bypass, CA installation, public service or relay scaffolding.

Acceptance: protocol/identity tests; blocking x64 build with retained cache and
four-worker 18/22 GiB limits; emulator pairing/navigation/input; private-address
client route documented separately from ADB loopback forwarding. Race navigation,
focus/password/private/native UI and reconnect; preserve held-OK regression.
Then complete gestures/tabs/UI and bounded reliability work in subsequent slices.
Unavailable Safari and physical-device acceptance remain unchecked.

### Phone remote slice 2 — bundled controls and emulator integration

Before the first build, complete the three bundled companion assets and wire the
already bounded adapter: address/navigation, normal tabs, relative touchpad,
two-finger scroll and explicit accessible pointer/click/scroll controls. Display
connection/paused state and the HTTP warning. Keep all companion resources local.
Native field editing uses renderer-confirmed text and editable revisions; phone
edits must not outlive their field/context. Reconnect clears gestures and pending
edits and polls authoritative state before enabling controls. Test Unicode and
composition separately from phone keyboard emulation. Native text bridge and
pairing are not considered proven until the APK runs.

### Phone remote build integration correction

The first build stopped at JNI final registration (9 seconds, peak 7.69 GiB).
Move the Java bridge into Brave's existing `brave_jni_headers_sources` list,
which participates in the final DEX registration, and use its generated Chrome
JNI header. Correct the pinned IME teardown hook to `destroyFromNative`.
No cache reset or checkout mutation during a build. Rebuild the same output.

### Phone remote review and compiler correction

Review of source `80a4ed1e8` found missing bytecode test coverage, recoverable
thread-start CHECK, generic translation descriptions, dropped actions during
polling, an independently unbounded UI delivery queue, and stale same-field
replacement. Address these before emulator acceptance: cap four UI deliveries,
rate-limit socket admissions, arbitrate one waiting discrete command against a
poll, and bind edits to a separate renderer content/selection revision. Add
bytecode class/method checks and correct JNI reference types/override qualifier
reported by the second build. Both attempts stopped below 8 GiB peak.

### Phone remote slice 3 — simulated LAN acceptance setup

Use the locked Nixpkgs SDK catalog to add an optional API 36 Google APIs phone
image (separate package, same emulator version; no Chromium upgrade). Emulator
36.5 supports a shared virtual Wi-Fi network, so a phone AVD can reach the TV's
private address directly without ADB forwarding. Start the phone only after the
compile finishes and resource headroom is checked. Safari/iOS is unavailable on
this Linux host. Preserve the three existing TV AVDs and all SDK/build caches.

T3 preview_open is blocked by host AppArmor; its exact error is recorded in the
remote evidence. Use the installed headless Chromium/Playwright for companion
layout/integration tests without changing network security flags. Add focused
session checks to root test discovery and synthetic native-field fixtures.

### Phone remote lifecycle/compatibility follow-up

Before simulated LAN acceptance, revalidate Android Network identity as well as
its address (a Wi-Fi/Ethernet switch can retain an address). Include browser
content offset in viewport revisions. Use Chromium FileUtils for resource reads
on all supported Android versions. Format bundled sources for review, preserving
the tested UI behavior. Repeat host companion/session checks before the next
cached build; no new product surface.

### Phone remote reproducible checks

The sandboxed Nix source-tools check needs the same two Java session sources
as local unittest discovery. Include those explicit inputs beside the existing
physical-input source; retain strict compiler warnings. Replace timing guesses
in the companion polling regression with an explicit held-response barrier,
then rerun the sandboxed checks and latest-commit review.

### Phone remote runtime correction

The actual private-network phone page pairs and navigates the TV. Backgrounding
the active listener reproducibly kills the browser: Thread::Stop joins on the
UI thread, violating Chromium's blocking restriction. Host the server on the
existing Chromium IO task runner and delete it there; invalidate Java admission
before queuing deletion. Re-run the PID-preserving background regression and
network-change revocation. Do not silence the blocking assertion.

The actual input field focuses, but no editable state is exported. Inspection
of the built ImeAdapterImpl finds zero hook calls: content_full_java was absent
from the bytecode rewrite input list. Add that exact JAR, verify all four hook
sites in the transformed artifact, then prove native Unicode/editing through
the paired phone. Put the home phone action on a separate compact row so the
existing Bookmarks label does not break mid-word. Stop task-owned emulators
before the cached build, preserving data and shared services.

### Phone remote editor acknowledgement correction

The packaged hook now exports native field state, native Unicode replacement
works, and background teardown preserves the browser PID. The first typing
probe fails when phone selection arrives before typing: that acknowledged
selection advances the field version while the locally coalesced text retains
its old base version. Track one in-flight same-field edit until renderer state
confirms its expected text. Rebase only subsequent local typing on that exact
acknowledgement; discard on rejection, document/focus change, disconnect or
conflicting renderer text. Add a held-selection-response regression before
changing the client. Also expose actual error-page state and retain the final
coalesced gesture movement on release when delivery is available.

The server deliberately binds only its private address, so ADB's loopback TCP
forward cannot reach it. Run HTTP boundary probes with explicitly targeted
phone-emulator netcat directly to the TV address; retain only diagnostic
DevTools forwards. Re-run native editing and transport/lifecycle checks.

## Active work: source fork and TV-native emulator development (9 October)

The user now explicitly requests a real source fork, direct code changes instead of exported TV patches, and emulator-first UI development before more physical-TV testing. This supersedes the prototype patch workflow below. The maintained execution checklist is [TV-native development](tv-native-checklist.md). Before every implementation slice, record the intended behavior, source surfaces, failure/acceptance checks and build scope here; then implement, verify and commit. Keep incomplete work unchecked.

### 1. Bring in the source

Create the public `smolcars/brave-tv-core` GitHub fork of `brave/brave-core` and check it out at `brave/` in this project as a pinned Git submodule. This retains real upstream history, licenses and all source files while keeping the existing project history and public `smolcars/brave-tv` repository. The fork's `master` starts from the already-built `v1.97.56` baseline with the proven TV changes committed directly. Do not upgrade Brave/Chromium during this migration. Brave's own Chromium patch machinery remains upstream infrastructure; remove our `patches/0001-tv-input.patch` as the source of TV changes.

Preserve the existing external Chromium checkout, both output directories, dependencies, installed profiles and artifacts. Verify that the fork's files match the tested source. Update the checkout helper to clone/advance only to the project's exact submodule revision, reject dirty/divergent build checkouts and preserve unrelated work. For the one-time migration, preserve the existing owned source edits in a named Git backup before fast-forwarding the cached checkout to the fork commit. Thereafter edit and commit ordinary files under `brave/`, update the project pointer, and advance the cached checkout through Git; no TV patch export/apply step.

Update the JVM test to compile the real tracked Java source, Nix checks, entry-point docs and source provenance. Test clean preparation, repeat runs, advancement, wrong upstream/Chromium pins, dirty/divergent checkouts and missing source prerequisites. Reuse the current x64 build cache with four jobs, 18/22 GiB limits and blocking Android analysis. Review only the latest implementation commit in each affected repository; push both master branches.

### 2. Diagnose Shields on the emulator

The user reports YouTube video ads before/during playback. Establish observable checks for filter/resource availability, network blocking, cosmetic filtering and scriptlet execution, including a Shields-off control on a dedicated test origin. Then reproduce YouTube playback without sign-in and distinguish missing resources/service configuration from site-specific filtering. Record versions, actual failures and network/update results. Do not infer working protection from a counter, silently disable Shields, borrow private production credentials, or claim all YouTube ads are eliminated from a short playback sample. Record a demonstrated cause and correction plan before changing protection code or build configuration.

#### Bundled baseline for unavailable component delivery

The empty catalog leaves the native filter-provider initialization gates waiting; the missing resource library also prevents scriptlet loading. Add an Android bundled fallback to the existing catalog, component-filter and default-resource providers, preserving catalog IDs, permission masks, first-party policy and user list preferences. Bundle the five non-iOS default-enabled groups from the pinned public catalog (default ads, privacy, first-party rules, cookie notices and mobile-app prompts), plus its resources.json. Once signed component paths exist, use those instead. Do not mark unrelated optional lists downloaded, bypass signature checks, or replace the engine with page JavaScript.

Generate a reproducible snapshot from pinned public Brave resource/catalog and list-mirror revisions; retain upstream notices and provenance hashes. Use the upstream packager's conditional-filter preprocessing and restriction on Brave-only directives, with focused generator tests. Add resources through the existing Android GRIT pack and load them off the UI thread. Keep the fallback inside the existing provider initialization path so cold profiles work without a downloaded DAT cache. Initially snapshots update with APK/source updates; independent public-feed refresh and visible freshness are subsequent work, not claimed here.

Acceptance: a local real-browser probe must show a harmless third-party /showbanner.js request blocked while a control script loads, reverse that result with Shields down, and restore it after re-enabling/restarting. Check cosmetic filtering and an existing scriptlet through a temporary test filter, never a shipped test rule. Verify component replacement precedence in focused provider tests where build infrastructure permits; compile with existing blocking analysis and run the emulator. YouTube playback is a separate observational check after this engine baseline passes.

The initial resource-content test correctly fails: `adblock-resources/dist/resources.json` contains only Brave-specific additions, not the uBlock scriptlets. Match the public upstream packager by combining these additions with redirect resources and builtin scriptlets from its pinned `brave/uBlock` submodule (`4dfbb048607ec4fd19c1c252fd255df6cc653720`). Use the same `adblock-rs` 0.13.2 converter as a pinned generation/test dependency, isolated under `brave/tools/tv`; do not invent a second resource parser. Run the converter's actual engine against bundled rules and scriptlets as a fast behavioral check before packaging Android.

Preserve uBlock's `requiresTrust` declarations as permission bit 0 and test that ordinary custom filters cannot invoke trusted scriptlets. Include a generated bundle-content version in each Android DAT cache payload; reject a stale or unversioned cache on read so a new APK cannot keep using old bundled rules indefinitely. Prefix/remove the version in the cache worker, with atomic writes and unchanged non-Android behavior. Add Cargo/Rust to the pinned Nix shell for the isolated converter build; limit it to two jobs. Browser build outputs and caches remain intact.

Review of `2688a17ff` finds two integration gaps: re-enabling a bundled optional list needs an engine-change notification despite no component download, and a partial fallback catalog must not mark locale defaults permanently initialized. Notify after explicit bundled-list enable/reset operations, retaining the initial catalog gate and DAT startup cache path. Expose whether the catalog provider is using the bundled subset and defer the locale-default loop/marker until a full component catalog exists. Also give fallback worker tasks explicit user-visible/skip-on-shutdown traits and bind replies to WeakPtr member methods per the repository's CSM-022/CSM-009 standards. Rebuild and verify disable/re-enable behavior; keep unavailable signed-server replacement tests labeled unverified.

The first native compile exposes a packaging mistake: the existing Shields GRIT part is included only on desktop, so Android's generated header lacks all seven bundle IDs. Move the new includes into a dedicated bundle resource part and include that part from the parent GRD's Android branch. Keep desktop panel resources unchanged; verify the generated Android IDs and compressed pack contents on the next build.

The next GRIT run confirms all seven Android IDs but rejects bare payload paths: part includes resolve against the parent GRD directory. Restore the original `../brave_shields/resources/bundled/` paths in the moved part. Review also identifies the non-default DAT-cache-disabled startup path: it has no initialization gates, so notify both engines after bundled catalog registration only when that feature is disabled. Preserve the cache-enabled startup path. Compile and verify the current target before moving on.

#### Observable list-toggle regression

The bundled build passes actual network, cosmetic and scriptlet probes; Shields down reverses all three. Preserve this diagnostic as a bounded Node/CDP check over the emulator's ADB DevTools forward, with native panel/settings actions still driven by T3. Add a harmless `/1_cookie.js` request matched specifically by the bundled cookie list. Check enabled → disabled → enabled in the native Content Filters screen and observe request results, then restore the original enabled state and remove temporary custom filters. Record default-cache restart evidence and the observed loss of a just-changed site setting when force-stopping before the upstream asynchronous preference write; normal background/persist/restart works. Do not equate this local regression with YouTube playback coverage.

The first probe review found that acknowledging `Page.reload` does not prove the next document is loaded, and a generic network error does not identify the blocked fixture. Before drawing a conclusion from optional-list re-enable, synchronize the probe with a fresh main-frame loader and its load lifecycle event. Track request IDs, exact fixture URLs and loader IDs, requiring `ERR_BLOCKED_BY_CLIENT` for each expected blocked request and successful completion for controls/allowed requests. Rerun enabled/disabled/re-enabled checks against this corrected diagnostic.

#### Repeated native list-toggle correction

The fresh-document cookie test is red after off → on, while the UI switch is on and the persisted list preference remains false. `ContentFilteringAdapter` captures the original `isEnabled` value when binding a row and sends its negation on every click. Read the switch's current checked state inside the existing listener instead, and write that same value to the row model and native handler. This shared Android settings correction applies to every regional-list row; custom subscriptions already update their model on each click and need no change. Keep the existing harmless real-browser cookie regression as the check: enabled → disabled → enabled without leaving/rebinding the screen, then background/restart and repeat. Rebuild only the cached x64 target with existing limits; review only this latest source implementation commit against its parent.

### 3. Replace the prototype controls with TV UI

Start with a native landscape browser panel using the existing Android view toolkit: a prominent address/search action, readable page identity, large grouped controls, an obvious focus indicator, predictable D-pad order and remembered focus. Provide Back/Forward, Reload/Stop, page cursor/scroll, and entry points for tabs and Shields using Brave's existing browser state. Keep the keyboard, permissions, native dialogs and video fullscreen above the page-input adapter. Check the current failing/unusable flow before each correction.

Next adapt the existing tab model, bookmarks/history, private-session controls and per-site Shields settings into remote-accessible native panels. Reuse their real stores and settings; do not create parallel persistence or a WebView browser. Introduce each panel as a separately planned/tested increment. Use localized resources, theme-aware contrast, generous spacing, bounded lists and meaningful accessibility labels. Follow Android's [TV navigation guidance](https://developer.android.com/training/tv/get-started/navigation) and [focus guidance](https://developer.android.com/design/ui/tv/guides/styles/focus-system).

Each slice must pass a resource-limited cached emulator build and relevant D-pad-only input checks, including focus restoration and Back escape. Preserve the alphabetic-keyboard fallback. Record screenshots and device logs outside Git. Emulator evidence does not establish hardware decoding, physical remote usability, memory budgets or release readiness.

#### First panel increment

The migrated baseline builds in 4m08s and passes cursor visibility and one-click emulator checks. Its prototype dialog exposes only address, cursor, scroll, menu and reload; the direct Tabs action assertion fails. Replace that list with a themed native landscape panel using Material buttons at least 56dp high, 18sp labels, a strong focus state, readable page identity and remembered selection. Keep the panel within TV screen edges and scroll it when needed. Address remains the first action on a fresh launch; returning from page mode restores its previous action.

Add direct Back/Forward and Reload/Stop using the active tab, Tabs using the existing normal/private TabModels, new/close tab using the existing browser actions, and per-site Shields up/down plus tracker/ad mode using BraveShieldsContentSettings and the active tab's Profile. Validate tab IDs/profile and page origin at activation so a stale panel cannot act on another site. Keep bookmark/history/settings entry points on their existing stores/screens for now; their TV-specific presentation is a subsequent increment, not acceptance claimed by a button.

Change surfaces: `brave/android/java/org/chromium/chrome/browser/tv/TvBrowserControls.java`, a small TV panel view helper if it keeps layout separate from input policy, Brave Android string/source declarations, remote regression replays and result docs. Preserve pointer event routing, native keyboard/modal/fullscreen priority, profile storage and all protection enforcement. Acceptance: all primary controls reachable by D-pad, no focus trap, browser navigation works, tabs switch/close in the correct profile, site Shields state persists and reloads only the intended tab, Back returns from subordinate panels, and existing cursor/keyboard regressions still pass. Compile and install the x64 Debug target with the established limits before visual acceptance.

Shields diagnosis so far: the emulator's registered ad-block resource-library and catalog directories are empty; `chrome://components` reports version `0.0.0.0` and Update error for both. An unauthenticated host request to each configured updater endpoint returns HTTP 403; the build uses the upstream empty services-key default. This identifies unavailable component delivery, not a proven YouTube-specific filter defect. Public upstream filter lists and `brave/adblock-resources/dist/resources.json` are available; evaluate a legitimate fork-owned bootstrap/update path separately, retaining existing engine enforcement and verifying actual blocking/scriptlet behavior. Do not obtain keys from another app or present the settings toggle as evidence of working filtering.

The first panel compile rejects `com.google.android.material.R`: Chromium merges these attributes into its own generated resources. Use the existing `org.chromium.chrome.R.attr` namespace for Material theme lookups, then rerun the same blocking build without changing dependencies or suppressing checks.

#### Panel privacy and dialog correction

The corrected resource build passed in 6m58s. Review of source commit `f1fd81dc6` against `1a2963063` found private titles exposed while incognito reauthentication is pending, immediate reopening of controls over asynchronous close confirmations, and Shields wording inconsistent with the localization standard. Before emulator acceptance, pass the existing reauthentication state into the TV controller, guard private panel rendering and every private selection/new-tab action, and hand locked access to the native authentication screen. Treat an available-but-not-yet-created authentication controller as locked. Dismiss TV dialogs and cursor input when the activity pauses, preventing an old private panel from surviving background locking. Do not reopen controls immediately after Close tab: upstream retains its confirmation/completion flow and Back can reopen controls afterward. Use Shields up/down terminology.

Change only the TV controller, its activity integration and localized labels. Rebuild from the existing cache with blocking checks. Verify native D-pad navigation, background/resume, private access, normal/private tab actions, close confirmation priority and the existing cursor/keyboard regressions. Record unavailable authentication prerequisites explicitly rather than claiming a lock-screen test from source inspection. Review only the resulting latest implementation commit against its parent.

Follow-up review identifies a recovery gap after close or pause leaves the New Tab Page: its null ContentView makes the old input-priority check always delegate Back. Allow the Back-to-controls path on an idle New Tab Page only; retain upstream handling for other native pages, the omnibox, scrims, modal dialogs, fullscreen and higher-priority Back handlers. Keep directional events delegated on all native pages. Test background/resume on NTP and close-to-NTP, plus a native modal and the keyboard path. The Android TV emulator rejects `locksettings set-pin` because it does not support a lock screen; real authentication acceptance remains unverified, with source review validating the existing authentication handoff.

Rendered verification finds that prior touch input leaves all panel buttons unfocused: the replay's initial focused-address assertion fails and the screenshot confirms no selected control. Explicitly allow button focus in touch mode before restoring selection. The Material dialog also retains large vertical background insets inside the requested TV window, clipping the third control row; set its top/bottom background insets to zero while keeping the bounded window and scrolling. Verify first focus after both touch setup and D-pad-only launch, plus all rows on the 1080p emulator.

#### Native bookmarks slice

Next replace the TV Bookmarks action's phone-manager handoff with a native folder/list panel using the existing profile-owned `BookmarkModel`. Show folders and bookmarks in bounded pages, return through folder parents with Back, expose each bookmark's Open and Remove actions, and add the current HTTP(S) page to the model's default bookmark folder. Reuse existing bookmark storage and policy checks, re-read an item's ID before acting, and confirm removal with Cancel selected initially. Preserve the current normal/private tab when opening a bookmark; never expose a pending locked private tab's data. Do not delete folders, create separate TV storage, bypass managed/read-only restrictions, or save a private page without an explicit user action.

Keep list rendering in the existing TV panel helper and browser interaction in its controller. If the bookmark model is still loading, show a native loading panel with Back available, use the existing `CallbackController` to cancel model-loading callbacks on dismissal/pause/destruction to prevent callbacks reopening a panel over native UI. Use localized labels and the existing layout/focus rules. Add/open/remove a uniquely named local fixture bookmark, verify it is visible in the native model-backed folder, cancel removal once, confirm it once, and preserve all pre-existing bookmarks. Rebuild x64 from cache, rerun cursor/panel checks, and review only the resulting source commit. Native home shortcuts and history follow after this storage-backed slice works. The first bookmark replay fails in its parser because `.ad` files accept double-quoted tokens rather than shell single quotes; use the existing panel replay's escaped double-quote format and rerun before claiming replay acceptance.

#### User-prioritized onboarding and control refinement

The user explicitly asks to redesign the accept/deny onboarding flow for TV, including immediately visible focus colors, easy D-pad progression, and a native, fast browser-control experience. Prioritize this after the active bookmark and Shields regression checks, before broader home/history expansion. Inspect every current first-run page and consent handler; retain the same choices and consent semantics while adapting their layout, sizes, first focus and directional order only in television UI mode. Make focused and disabled states visibly different at TV viewing distance. Preserve native keyboard and dialog priority and avoid replacing Android screens with a WebView.

Before implementation, map the page/view classes and record each screen's intended focus/progression plus a baseline in a separate first-run emulator/profile; do not clear the current browser or Chromecast data. Implement a shared TV-only presentation adjustment where the existing page structure permits it, leaving phone layouts unchanged. Exercise accept/decline/skip, Back and restart through the real native screens, with screenshots and D-pad replays. Separately refine the browser panel's navigation and visible mode state based on observed friction. Measure startup, panel-open response and browser-process memory before/after using the same device/build settings; preserve asynchronous model loading, bound displayed rows and avoid heavy UI-thread work. No performance claim without measured evidence. Build with Nix/cache/resource limits and review only each latest implementation commit.

#### Onboarding implementation slice: native vertical controls

Baseline on the isolated API 36 TV profile: page zero has no initially focused button; the filled primary button looks selected while unfocused. Page two highlights only the small checkbox halo. Back is consumed without changing pages. All three pages use the existing adapter and activity; consent is handled by the activity.

Select three explicit TV layouts in `OnboardingStepAdapter`, using a shared scrollable vertical presentation, existing localized text, 56 dp minimum actions, full-row themed focus fill/outline and visible checkbox state. Put Maybe later first, then opt-in, then a separate Learn more action invoking the existing span; focus Maybe later immediately. Focus Continue on page one and the first unmanaged reporting checkbox on page two, followed by the other checkbox and Start browsing. Scroll on smaller screens/large text rather than clipping. Keep existing phone layouts. Omit decorative illustrations/Lottie on TV and bypass splash/bounce animations after native initialization; retain policy/default-browser logic.

On TV Back moves to the previous eligible page and consumes Back on the first eligible page without completing or consenting. Returning to Web Discovery and choosing Maybe later must explicitly disable a previous opt-in; use the existing preference and keep the phone skip behavior. Preserve reporting choices while revisiting pages. Request focus only on the visible current page after attachment/layout and guard deferred activity work against destruction.

Verify initial focus, vertical navigation, Learn more and return, forward/Back, repeated reporting toggles, policy-hidden controls and completion/relaunch. Keep first-run incomplete until the updated APK is ready. Add a D-pad replay and focused adapter tests for TV consent callbacks/managed controls. Reuse cached x64 compilation under the existing memory cap; record runtime and build results separately from pending physical-TV acceptance.

### 4. Finish emulator flows, then return to TV

Complete URL/search, page links/forms/scrolling, tab switching/closing/restoration, bookmark/history operations, private-session isolation, site Shields override, ordinary video/fullscreen and lifecycle recovery on the emulator. Run a sustained browsing/video session, record failures, and fix demonstrated regressions. Only after those checks pass build ARM from the same fork revision and repeat the physical-TV checks. Keep the existing non-debuggable ARM recipe and development signing until a separate release plan is complete.

## Starting point

- Initial project commit: `321c048243a08a823d2d0305466f6b2a213a4f26`. The user subsequently requested review of only the latest implementation commit; use that commit's parent as the comparison point and record both IDs. Work on local `master` and make incremental commits, as requested; no remote push is configured.
- This repository contains the project README, icon, feasibility report and MVP checklist. There is no Android application or build/test system yet.
- Initial upstream baseline: Brave `v1.97.56`, commit `b01cdf43be4b4d5559bf7e58229e666e24454f50`, whose package configuration selects Chromium `155.0.8059.40`.
- Builder: Ubuntu 25.10 x86-64, Ryzen 9 7900X (24 threads), approximately 30 GiB RAM and 580 GiB available disk. Node 22 is on the host PATH; the selected Brave release documents Node 24+. Existing Android SDK tools were discovered under `~/Android/Sdk` but are not on PATH.
- Manage development/build dependencies through a pinned `flake.nix` and `flake.lock`, with `.envrc` loading the development shell. Avoid host package installs and global Node changes. Preserve the exact compiler, SDK and other artifacts selected by Chromium/Brave DEPS when upstream requires those versions; document this boundary rather than replacing them with arbitrary Nixpkgs versions.
- T3 device access is disabled. No physical TVs or priority websites have been selected. Source builds and automated input tests can proceed; physical-device acceptance cannot be claimed from them.

## Design and change surface

Current delivery: [smolcars/brave-tv](https://github.com/smolcars/brave-tv) tracks this project on `master`. Device support is available and a Nix-provisioned Android TV emulator is running. The active source-fork plan above supersedes the initial patch strategy. The starting-point and prototype-stage notes below are historical.

Use a small downstream patch set against a pinned upstream checkout. Keep downloaded Chromium/Brave source and build outputs outside this Git repository. Do not create a replacement WebView app or duplicate Brave's profile, tab, bookmark or Shields implementations.

Expected changes reach these places:

- A source lock describing the upstream URL, release, immutable commit and Chromium version.
- `flake.nix`, `flake.lock` and `.envrc` for the Nix development environment and its checks.
- Minimal setup/build commands that validate the lock and working tree before acting, fail visibly and preserve an existing checkout's local changes.
- Downstream patches to Brave's Android manifest, resources and activity/input integration, plus the existing upstream build declarations needed to compile them.
- Behavioral tests for setup/build commands and the public remote-input boundary, with upstream Android test integration where applicable.
- Build/device/testing documentation, a concrete website-task matrix, release instructions and an evidence-based update to the MVP checklist.
- The project README, pointing to the actual entry commands and implementation status.

No hosted services, production credentials, new UI framework or general-purpose patch/build framework are needed by default. Use upstream build tooling and platform functionality first.

## Test boundaries agreed with the user

The user approved both boundaries on 8 October 2026:

1. **Setup/build commands:** observe their exit status, output and filesystem effects. Cover revision mismatches, dirty checkouts, missing prerequisites and repeat execution. This does not establish Android compilation or TV behavior.
2. **Remote-input interface:** submit remote events through its public entry point and observe focus, pointer, scroll and Back behavior. Cover interaction transitions and escaping web content. This does not establish real-device performance or streaming compatibility.

Use one failing behavioral test followed by the smallest implementation for each slice. Run the relevant individual test during development and the full project suite once at the end. Use the applicable language/compiler checks regularly. Preserve upstream tests; add focused Android checks for the code actually changed.

## Stage 1 Reproduce the upstream build

1. Inspect the pinned Brave scripts and prerequisite versions before adding wrappers.
2. Record immutable revisions and establish the external checkout layout.
3. Provision build tools with Nix, initialize the upstream dependencies and attempt an unmodified Android build for an identified device/emulator ABI.
4. Capture exact commands, logs, versions, build duration and any blockers in `docs/build.md`.
5. Create a default task matrix that the user can refine once the build is available. Leave every device result untested until executed.

**Exit:** a real upstream APK builds, or a concrete external blocker is documented with the commands needed to resume. Infrastructure scaffolding alone is not a working browser.

## Stage 2 Minimal TV interaction

After inspecting the real upstream interfaces and obtaining a buildable baseline:

1. Add TV launch metadata, optional hardware declarations and initial TV assets.
2. Make first-run screens and essential browser controls reachable with directional focus.
3. Adapt the existing activity/input path to support a page pointer, explicit scrolling and a reliable path back to browser controls using standard remote buttons.
4. Preserve upstream keyboard, permissions, certificate handling and video fullscreen behavior.
5. Test the minimal URL-to-video flow, then record failures and resource usage.

**Exit:** build and input tests pass; the minimal flow is demonstrated on available devices. Emulator evidence is labeled as such. The checklist's physical-TV gate stays open until real hardware passes.

### Source findings to guide the first TV patch

Inspected at the pinned release while the unmodified baseline initializes:

- `android/java/org/chromium/chrome/browser/app/BraveActivity.java` is Brave's existing activity extension. Its bytecode adapter already places it in `ChromeTabbedActivity`'s inheritance chain. Prefer this extension over adding another Android application or replacing the activity wholesale.
- Chromium's `ChromeTabbedActivity.dispatchKeyEvent()` calls `KeyboardShortcuts` before its superclass. Ordinary D-pad keys reach the superclass, while some television/system keys explicitly return unhandled. Preserve that distinction and ordinary hardware-keyboard shortcuts.
- `Tab.getContentView()` returns the current webpage view, which forwards touch, hover and generic motion events to Chromium. Evaluate scoped pointer/click/wheel events here, including nested scrolling; do not introduce an accessibility service or global input injection. Native pages and missing/destroyed tabs need the normal focus path.
- A Back-key override alone is insufficient as a design assumption. Check Chromium's current Back dispatcher, IME dismissal, modal dialogs and fullscreen handlers before inserting the TV escape action. Test both event consumption and key-up/repeat behavior.
- The Chromium manifest already makes touchscreen hardware optional. Brave supplies application entries through `android/java/AndroidManifest.xml` and launcher intent additions through `AndroidManifest_intent_filters.xml`; source/resource lists live in `android/brave_java_sources.gni` and `android/brave_java_resources.gni`. Inspect the generated manifest rather than duplicating existing declarations.

These integration candidates were inspected before applying TV changes. The baseline APK completed on 9 October; its separate artifact/provenance were preserved before applying the TV patch. Runtime behavior remains unverified.

### First input increment

Once baseline configuration succeeds and native compilation is running, prepare this increment in a separate Brave worktree. Export a small downstream patch into this repository; do not change source under the running baseline build. Apply and compile the patch only after that build finishes.

- Keep input state in a small Java controller used by the Android activity adapter. Test its public events and observable pointer/click/scroll/control-focus effects on the JVM through Nix, without claiming Android integration from those tests.
- On TV only, provide a native controls dialog that opens the existing address bar/menu and enters pointer or scroll mode. Use D-pad for movement, OK for a click, and Back for controls. In scroll mode, D-pad scrolls at the pointer location and OK returns to pointer mode. Show the current mode and button hints.
- Forward pointer events only to the active Chromium content view; leave native pages, ordinary keyboard input, system keys and higher-priority browser UI to upstream handling.
- Route Back through Android's existing dispatcher. Defer to keyboard, fullscreen and native-dialog handling before returning page interaction to controls. Webpage Back interception must not prevent the controls escape.
- Cover movement bounds, viewport changes, one click per press, canceled clicks, scrolling, mode changes, Back and unrelated keys at the approved input boundary. Compile Android callers and run device checks separately.

This increment does not claim remote-completable first run, fully adapted tabs/Shields/settings, release branding, or device acceptance. Those remain later checklist work after the prototype gate.

### Corrections from the first input review

Review `c48f63717a7ab22ced7a57aa19153dbe7b1436e9` only against its parent `7a4ec72895a5b763dcb7d58acbc8d28df189b25c`, as requested. Source tracing found three adapter defects that the JVM policy boundary cannot detect: Chromium ignores mouse DOWN/UP as clicks; the TV callback overrides native-page Back; and CloseWatcher can mask the native Find toolbar/tab-group dialog in the highest-priority-handler query. Dialog callbacks also need lifecycle checks.

Before correcting the adapter, add a controlled webpage and reproducible remote-input checks for click delivery and escaping CloseWatcher, including native Find UI. Then use ordinary scoped touchscreen taps for OK (mouse hover/wheel remain), delegate native-page Back, and check native focus plus the existing scrim visibility supplier independently of CloseWatcher. The supplier becomes visible before tab-dialog animations, so focus alone is insufficient. Guard callbacks and event delivery against teardown. These changes stay in the separate worktree; do not edit the running baseline.

The new Android regression checks cannot currently be run: device access is disabled and neither APK build has finished. Record that limitation rather than reporting an Android red/green cycle. Continue running the existing JVM public-interface tests and source/apply/compiler checks that are available; actual event delivery remains a required prototype gate.

The baseline subsequently completed. During the first TV compile, the real Android header compiler rejected `org.jspecify.annotations.Nullable`, which is not a dependency of this target. Correct the adapter to use the surrounding code's existing `androidx.annotation.Nullable`, then rerun Android compilation. Resolve further compiler integration findings against the pinned APIs without adding replacement libraries or weakening checks. Keep the main checkout and exported patch synchronized while no build is running.

The next attempt produced the TV APK in 2m24s, but the default background analysis server still had queued checks when the transient service exited and terminated it. Require `--gn=android_static_analysis:on` for subsequent builds: the pinned Chromium configuration explicitly runs analysis as blocking build steps in this mode and fails the build on errors. Preserve the APK/cache and rerun these checks; do not count asynchronous queue submission as a passed analysis check. Update the documented build commands to include this setting.

Blocking lint then rejected the banner's 320dp intrinsic width and reported its two manifest-only resources as unused. Both references were verified in the merged manifest and packaged APK. Before retrying, change the vector's intrinsic size to 160×90dp (320×180px at xhdpi), retaining its viewport/artwork. Add only these two resource names beside Brave's existing manifest-resource exceptions in its lint configuration, with a reason; do not disable the unused-resource check or warning failures globally. Rerun the blocking Android build and inspect the final APK's manifest/resources. This uses the real failing lint target as the regression check; a static-value unit test would not establish Android integration. Banner dimensions follow [Android's TV icon guidance](https://developer.android.com/design/ui/tv/guides/system/tv-app-icon-guidelines).

That rerun passed launcher lint but Error Prone rejected mixed `||`/`&&` without explicit grouping in the canceled-click condition. Add parentheses around the existing URL-change-and-SELECT conjunction, preserving Java's current precedence. Apply the same one-line correction to both source trees, export the patch and rerun the actual failing analysis target through the blocking build; do not suppress the check or change input behavior.

### Emulator validation after enabling device access

On 9 October, after the user restarted T3, `device_list` successfully inspected the local host. Android is unavailable because `~/Android/Sdk/cmdline-tools/latest` is missing; no AVD exists. The existing emulator is 35.3.11 and `/dev/kvm` is accessible. The already-built x86-64 prototype remains the runtime test subject.

Before further browser changes:

1. Add an optional Nix SDK package using the existing flake lock. Select the pinned Android TV API 36 x86-64 image: the pinned API 34 TV image only offers x86/arm64 and cannot run this x86-64 APK. Keep emulator tooling separate from Chromium's DEPS-selected build SDK and ordinary repository checks.
2. Build the package into an external, garbage-collection-rooted location. Expose the missing command-line tools and TV image to T3's existing SDK with explicit links, preserving installed components. Create a dedicated `brave_tv_api36` AVD without replacing any existing AVD. Record the exact setup and any prerequisite failures.
3. Call `device_list`, then `device_open` so the emulator is visible in T3. Use the returned device-scoped launcher for interaction; use Nix ADB for installation, forwarding, metadata and logs. Verify the preserved APK checksum before installation.
4. Exercise TV launch, first run, controls entry, OK click delivery, scrolling and Back against the controlled fixture. Distinguish remote-only steps from diagnostic text/touch input. Capture the first failing step, device details and evidence outside Git.
5. If runtime checks expose an adapter defect, record its reproduction and correction plan here before editing the synchronized worktree/patch. Run the relevant regression check, the blocking resource-limited Android build and local Nix checks. Preserve each new APK and its provenance.

Commit the plan, setup and any demonstrated browser fixes separately on local `master`. Review only the latest implementation commit against its parent using Standards and Spec reviews; do not re-review older implementation history. Emulator evidence does not close the two-physical-TV, release-performance, Shields or sustained-video acceptance gates.

Setup exposed two real prerequisites: `avdmanager` refuses an SDK without an emulator package, and T3's camera `imagefile:` arguments are rejected by the host's emulator 35.3.11. Include the pinned emulator 36.5.11 in the optional SDK. Replaying T3's launch arguments with that executable proceeds past camera initialization; preserve the original emulator directory under a backup name and link T3's emulator path to the Nix package before retrying `device_open`. Do not edit T3's installed helpers or disable the device integration.

### First runtime correction: onboarding focus

The preserved prototype installed successfully on `brave_tv_api36` (Android 16/API 36, x86-64, 1920×1080 at 320 dpi). On its first Web Discovery screen, all four D-pad directions and OK leave focus on the full-screen `ViewPager2` RecyclerView; both consent buttons are unreachable. `agent-device is focused` fails for `onboarding_later`, while Home successfully returns to the TV launcher. The activity hierarchy confirms the buttons are focusable, and the pinned ViewPager2 bytecode explicitly gives its RecyclerView `FOCUS_BEFORE_DESCENDANTS`.

Add a device replay that opens this incomplete first-run flow, moves down to “Maybe later”, asserts input focus, presses OK and asserts the next page. Run it against the preserved APK before editing. Then, only in television UI mode, make the onboarding pager's RecyclerView prefer its children for focus. Reuse the existing layouts, consent handlers and page transitions. This reaches `WelcomeOnboardingActivity`, the exported patch and the device replay/documentation; it does not change consent values or bypass onboarding.

Rebuild with blocking Android analysis and the documented host limits. Install over the test app without clearing its state, rerun the same first-page regression, and continue through all remaining onboarding pages using remote input. Confirm settings remain selectable and native/browser controls can be reached. Record any further blocker separately before expanding the fix.

### Emulator navigation diagnostic

Onboarding passes, but opening web content repeatedly terminates the entire emulator. A captured launch (`brave-tv-emulator-diagnostic-r2.service`) reports `Result=core-dump`, signal 11 and roughly 4.3 GiB peak memory. The final log entries create a Vulkan instance/device for Chromium; there is no kernel OOM evidence in the inspected interval. This suggests a graphics-emulation failure but does not establish its precise cause.

Before changing browser code, run the same preserved APK with the emulator's supported `-feature -Vulkan` option and `-no-snapshot-load`, retaining disk data and the existing snapshot. Capture emulator output, attach through T3 and retry the local fixture. If it succeeds, document this as a host diagnostic configuration; do not claim Vulkan, hardware decoding or performance coverage. If it fails, retain the logs and report the outstanding runtime gate rather than changing browser input code without evidence.

Outcome: the fixture loads in that configuration and Back reaches controls. Pointer validation remains unresolved: the cursor/hint is invisible, Down scrolls upstream and OK does not increment the fixture counter. The helper injects virtual alphabetic-keyboard events, which the adapter excludes. The next increment must distinguish input-source classification from cursor rendering: reproduce with a non-alphabetic remote source (or confirmed physical remote), inspect the content-view overlay integration, and add a failing Android regression before changing either path. Preserve normal hardware-keyboard handling. No pointer, scrolling or video acceptance is claimed by the onboarding fix.

### Pointer correction increment (9 October)

First make the existing fixture click failure repeatable with an asserted page result. Use the running emulator with guest Vulkan disabled. Compare the helper's injected alphabetic-keyboard events with a temporary D-pad-only device registered through Android's `uinput` test command; inspect the reported input classification before drawing conclusions. Keep T3 attached for snapshots and screenshots. The temporary input device must disappear when its test process closes, without root access, profile resets or emulator image changes.

Then isolate cursor rendering from key handling. Inspect the actual content-view/compositor hierarchy and activation dimensions, and use targeted diagnostics only where necessary. Record the demonstrated cause before changing the adapter. Expected change surfaces are `TvBrowserControls`, its exported patch, an Android-facing regression fixture/driver and the runtime/build documentation. Preserve alphabetic hardware-keyboard behavior, native UI priority, browser security and existing consent settings. Reuse upstream overlay patterns rather than adding a rendering framework. Rebuild with blocking analysis and existing resource limits, rerun the original failure, test click/scroll/Back and text entry, then review only the latest implementation commit and push to `master`.

Diagnosis: a D-pad-only `uinput` device reports `KEYBOARD | DPAD`, keyboard type 1, and the preserved APK delivers a single click. Keep the existing alphabetic-keyboard exclusion. JDB confirms valid 1920×1080 page dimensions, alpha 1, valid cursor coordinates and an unclipped draw call. Moving the drawable to the decor overlay shows only the hint over native chrome; the cursor over web content remains invisible. Attaching that same drawable as the background of a normal view above the compositor makes the cursor visible. Replace the page `ViewOverlay` attachment with a dedicated non-interactive view alongside the content view, below native browser UI; retain the existing drawable, coordinates and event delivery. Place the hint below the top browser controls. Remove the view when leaving page mode or destroying the adapter. A PNG assertion using the existing JDK's ImageIO must fail on the original screenshot and pass after rebuilding; input assertions use the D-pad-only source and distinguish keyboard fallback.

The first rebuilt APK passes the cursor/click assertion. A further transition check exposed a lifetime difference: opening another tab detaches the old content view but leaves its new sibling cursor attached. Tie that sibling's removal to the content view's detach notification, remove the listener during teardown and cancel an outstanding press. Verify the cursor disappears on tab replacement before considering this rendering correction complete.

Form testing also exposed a coordinate error hidden by the large click target: OK over a narrow input does not focus it, while a diagnostic tap does. The adapter bypasses `CompositorViewHolder`, whose touch/hover interceptors set `EventForwarder`'s viewport offsets (including the visible toolbar). Add a narrow, initially visible input fixture and assert focus after the centered cursor's OK. Route synthetic events through the page's existing parent dispatcher, translating page-local coordinates into that parent, so Chromium applies its own offset handling. Preserve source types, one click per release and native UI priority. Recheck narrow-target focus, broad clicks and nested scrolling after the change.

### Chromecast build increment (9 October)

Wireless ADB now connects to the user's Google Chromecast (`sabrina`), Android 14/API 34. Its supported ABI list is `armeabi-v7a,armeabi`; select `arm`, not `arm64`. It reports about 1.9 GiB RAM and a 1920×1080 override at 320 dpi. Available data storage increased from 669 MiB to 922 MiB after the user removed apps. No Brave package is installed. Keep network addresses, pairing credentials and personal-device screenshots out of this public repository.

After finishing the cursor correction checks and latest-commit review, build upstream's optimized **Static arm** development configuration with `symbol_level=0` and blocking Android static analysis. This keeps `com.brave.browser_default`, avoids collision with the official browser, and remains a test build with development signing. Use the existing synchronized sources/dependencies and a separate `out/android_Static_arm` output directory; the x64 native object cache cannot serve an ARM target and must remain intact. Retain four jobs and 18/22 GiB memory limits, separate logs and timing. No source edits or dependency synchronization while the build runs.

Inspect the resulting APK's actual size, signature, package and ABI, preserve its provenance and recheck available device storage before installation. Then install the test package without uninstalling or clearing any existing profile, test onboarding and the controlled pointer/form/scroll/Back flows on the physical remote, and record results independently from emulator evidence. A passing build alone does not close physical-TV, URL-to-video, Shields, performance or two-device MVP gates.

### Optimized Android link correction (9 October)

The first ARM Static build completed 63,200 steps but failed linking `libchrome.so` after 5h18m: `ads_service_factory.o` references `AdsTooltipsController::~AdsTooltipsController()`. This is a symbol-resolution failure, not an OOM. The cgroup peaked at 18 GiB, hit its soft threshold and never reached its 22 GiB maximum; completed objects and logs are preserved.

Diagnosis: `CreateAdsTooltipsDelegate()` returns `unique_ptr<AdsTooltipsDelegateImpl>` even on Android, where it returns null and the desktop tooltip implementation is excluded by GN. The optimized factory object nevertheless emits its concrete deleter and references the excluded controller destructor; `llvm-nm --undefined-only --demangle` confirms that reference. The service already accepts the platform-independent `AdsTooltipsDelegate` interface with a virtual destructor.

Add a small object-symbol regression that fails on that existing ARM object when it references the desktop tooltip types. Change the factory's declaration, definition and forward declaration to return the existing interface. Include that interface directly and guard the desktop implementation include with the same non-Android condition as its GN source list. Preserve Android's null delegate and desktop construction; do not add desktop UI sources, dummy destructors, suppress link errors or disable Ads/Shields. Export the source changes into the downstream patch and rebuild the same ARM target/output with the existing limits. Verify the object regression and final link, inspect/package the artifact, review only this latest implementation commit against its parent, then continue device testing. Desktop runtime remains untested; inspect its unchanged conversion/destruction path.

### Chromecast browser ANR diagnosis (9 October)

The unchanged ARM APK installed after additional user storage cleanup and opened onboarding. The user confirmed that the physical remote selects “Maybe later” and advances, then reported apparent crashes while typing an address. Android recorded repeated foreground `ChromeTabbedActivity` input-dispatch ANRs, including a five-second focus-event timeout; this is not yet evidence of a keyboard-specific cause.

Before changing code, preserve the app's exit records and ANR thread traces outside Git. Establish a repeatable device check that distinguishes launching the browser from opening the address bar and entering text, observing responsiveness and new ANR records. Preserve the existing profile and original keyboard. Capture timing and main-thread state without leaving the debugger suspended; prior emulator debugger-induced ANRs must not be confused with this uninstrumented failure. Compare ranked, falsifiable causes only after the symptom is reproducible. Make the smallest demonstrated correction, if one is needed, in both source worktrees and the exported patch, reusing the ARM output cache with the existing build limits. Rerun the same failing device check, then review only the resulting latest implementation commit. Record unresolved failures instead of claiming physical-TV acceptance from installation or onboarding alone.

The controlled launch fails without typing, both before and after per-package ART verification. Requesting ART's `speed` filter is downgraded to `verify`: Android does not use ahead-of-time compiled code for debuggable apps. The optimized Static configuration still defaults to Chromium's `debuggable_apks = !is_official_build`. Next test only `--gn=debuggable_apks:false` on the existing ARM build. This changes manifest packaging without changing the browser source, native optimization, package, signing key or profile. Preserve the debuggable artifact and create a separately identified candidate, inspect its manifest/signature and native-library hash, then install it as an update and repeat the same startup/input checks. Keep blocking analysis and all build limits. Treat this as a diagnostic configuration until the original failure is shown to pass; do not bypass Android's storage safeguards or delete user apps to install it.

## Stage 3 Complete the MVP after the feasibility gate

Adapt existing tabs, bookmarks, history, private sessions and per-site Shields controls to the validated TV interaction design. Validate Shields resources and updates, ordinary web video, lifecycle recovery and the performance budgets established by the prototype. Disable optional product surfaces through supported controls without silently weakening protections.

Create an independent release identity, user-controlled signing setup, documented installation/update path, source/license package and repeatable release build. Rehearse an upstream update before distributing to testers. Do not invent successful device results, service credentials or tester acceptance.

**Exit:** all MVP acceptance criteria pass on both target TVs and the signed artifact can be installed and updated by a tester.

## Review and delivery

Review the work against the original MVP checklist and this plan using separate Standards and Spec reviews. Resolve actionable code findings, keep unfulfilled requirements visible, run final verification and commit the work on the current branch. Do not publish an APK or contact testers until a concrete release and destination are available.

### Recovery after the builder reboot

The first baseline build stopped at 21:30 EDT on 8 October 2026, with 32,993 recorded completed steps and no final exit status. The machine rebooted at 22:33. The prior journal records service watchdog/timeouts but no kernel OOM record in the inspected interval; the crash cause is not established. Do not deliberately reproduce a machine-wide failure.

Before resuming, verify the source pins, preserve logs and all existing compilation outputs, and confirm no build is already running. Add systemd's command-line tools to the Nix shell and use a transient user service for the build with four jobs, a soft memory threshold of 18 GiB and a hard limit of 22 GiB. Verify the cgroup limits actually apply. This is a precaution, not a proven crash fix. Resume the same Debug x64 target without initialization, cache deletion, or source changes; keep a separate recovery log and timing file. A transient service lets the compile survive a terminal disconnection, but not a reboot.

Inspection during recovery found that the pinned Brave wrapper consumes `--ninja=j:N` but only exports its Siso limit when remote execution is enabled. The initial offline build therefore did not have the intended eight-job limit. Stop the first recovery attempt gracefully and set `SISO_LIMITS=local=4` explicitly for the next attempt; verify the actual Siso process environment as well as its cgroup. Correct the documented build commands. This explains the missing concurrency limit, but does not establish the cause of the machine crash.

## Risks and fallback rules

- Source synchronization and native builds are large; record resumable progress and do not reset or discard another working tree to recover.
- Package names, signing and profile migration can affect user data. Use a distinct test identity and validate upgrade behavior before distribution.
- Browser input adaptations can interfere with forms, dialogs and media. Keep changes localized and preserve a reliable escape path.
- Missing build privileges, inaccessible upstream artifacts, disabled device access and absent TVs are external dependencies. Continue independent work where possible and report the exact blocked criteria.
- Never freeze on an old unsupported Chromium release, remove the sandbox or substitute a generic WebView to make the checklist appear complete.

### Onboarding review correction: retain consent on return

Review of `9bb2cf912` finds that the activity saves reporting changes but the adapter retains its initial checkbox values. The newly supported Back path can recycle/rebind page two and restore stale consent. Synchronize the adapter through its existing checked-state setters in both reporting callbacks. Rebinding an unchanged checked value does not dispatch another change. Verify toggles survive page two → page zero → page two and completion/relaunch; preserve policy behavior. Keep the running builder at its committed revision until it finishes.

### Onboarding visual correction: privacy-link button text

The `9bb2cf912` APK passes the 31-step remote navigation replay on the isolated TV. Its screenshot reveals that the new Learn more button retains the original `ClickableSpan` color/underline, overriding its themed focus text. Convert only the extracted button label to plain text while retaining the original span's click callback. This keeps the same localized label and destination, and lets the shared Material focus colors apply. Verify focused and unfocused screenshots plus opening/returning from the info page.

## Superseding product direction: simple independent browser (9 October)

The user now explicitly removes the entire onboarding/analytics flow: launch directly into the browser, default to Google, retain Brave Search as an optional provider, remove Brave product branding, and show a minimal home page saying “Simple, private, and ad-blocking.” This supersedes the three-page TV onboarding design and its consent-preservation acceptance work. Preserve the implemented history as evidence, but remove the now-unneeded TV onboarding layouts/replay rather than maintaining an unused flow. The user will supply the product name; use neutral browser labels meanwhile without choosing a permanent identity.

Home must provide a small, remote-accessible attribution area explaining that this is an independent open-source fork of Brave built on Chromium, with links to the public project/source and licenses. Preserve legal notices and upstream source attribution. Accurate “Brave Search” provider naming and attribution remain intentional exceptions to removing product branding.

Implementation slices, each planned/reviewed/built incrementally:

1. Remove TV onboarding UI and skip promotional/referral/default-browser opt-in prompts. Disable P3A collection/upload, usage pings, Web Discovery, referral telemetry, crash uploads and related client consent affordances, including existing profiles whose old settings are enabled. Use existing compile-time exclusions where available and enforce remaining service boundaries so persisted preferences cannot re-enable reporting. Keep Shields resources, filter/component updates and browser security features. Audit additional telemetry entry points before claiming no analytics. Search use itself must not require Web Discovery.
2. Set Google as the default for new profiles through the existing search-provider model; preserve deliberate user selections and expose a TV-native provider selector including Brave Search. Verify a typed query resolves to Google, switching to Brave works, and the choice persists. Do not implement separate URL/search storage.
3. Replace the TV new-tab view with a lightweight native home surface, directly focused address/search action, minimal supporting controls and the requested tagline/attribution links. Reuse native-page lifetime, tab/profile and navigation handling; avoid loading the existing sponsored/news/rewards NTP under a visual cover. Keep private mode clearly identified. Refine the TV settings/control entry points so they do not expose unrelated Brave promotional UI.
4. Audit app labels, launcher/banner/splash, toolbar icons, settings and About for product branding. Keep the current development package/signing identity until an explicit migration is implemented; do not uninstall or lose profiles to rename the app. Apply the user-provided name when available.

Verify on the isolated emulator without clearing existing profiles: first launch goes straight to home; no onboarding/analytics prompts; telemetry is disabled for both initial and previously enabled settings; native home/controls work with D-pad, Back, keyboard and page cursor; Google default and provider persistence; attribution/repository/license links; Shields still blocks the controlled fixture. Compare startup/process memory on the same emulator/settings and record limitations. Keep incomplete telemetry/branding checks explicit. Reuse the Nix x64/ARM caches and resource caps; do not rebuild or erase dependencies. Review only each latest implementation commit and push master.

For the first removal slice, replace Android's P3A service implementation with an inert implementation of the existing API: no histogram observers, event subscriptions, stored metric updates, schedulers or network initialization, and `IsP3AEnabled()` always false. Retain preference registration for existing caller/profile compatibility. Exclude Web Discovery and usage pings through Android GN defaults, make Android referral startup inert, and refuse crash-upload connections at the existing Android factory. Remove reporting toggles from privacy settings. TV first-run should complete through the existing pending-intent path without inflating consent pages, enabling reporting, fetching install referrals or launching a default-browser prompt. Restore/remove the superseded TV onboarding-only presentation code before adding this smaller flow. Verify the native service boundaries and prior-enabled profile, rather than treating hidden toggles as proof.

Telemetry-slice review found two cleanup gaps: the removed controls still have settings-search entries and dead field/listener/update paths, and an existing crash-factory unit test still expects a network connection. Remove the three XML preferences and their dead Java paths, exclude their search keys unconditionally, and update the existing factory test to assert refusal. Keep the uploader-level failure test as coverage of its null-connection contract. Complete these corrections before starting the next cached build.

The first blocking build rejects the Android referral startup's unconditional return followed by unreachable code. Compile the startup body only on non-Android platforms instead; retain an empty Android entry point and remove its now-unreachable Android-only branches. Rerun the same cached build with all warning checks enabled. This is a compiler correction, not a change to the no-referral requirement.

The retry identifies the finalization timer frequency as unused on Android after startup exclusion. Give that constant the same non-Android guard; keep warning failures enabled and retry without cache changes.

Disabling Web Discovery also exposes an unguarded Rewards preference read in the blocking build. Audit those references and return unavailable/false when the Web Discovery build flag is off, rather than re-enabling the feature to satisfy compilation. Keep desktop behavior under its existing feature configuration.

The next compile-out failure is the Android activity's unconditional JNI stats-updater restart. Remove the Java call, native declaration and native function/includes together: this Android fork no longer runs usage pings. This avoids retaining an unnecessary reporting entry point and resolves the disabled-updater static assertion.

### Minimal native home and attribution implementation

Use `BasicNativePage` with Chromium's existing `NativePageHost` for new-tab lifetime, margins and navigation. Extend the existing Java adapter chain at `NativePageBuilder.buildNewTabPage`: immediately after its `TabShim` construction, offer the host/tab to a TV-only factory and return its page when present. Preserve upstream creation on non-TV; fail the build if the expected integration point changes. No patch artifact or duplicate Chromium factory is needed. Add the required bytecode class/method checks and exercise the transformed method on the emulator.

The view contains the requested tagline, a primary address/search button, browser-controls entry, explicit private-session labeling, and independent Brave/Chromium attribution with project and license buttons. Share the existing Material button focus styling with the TV panels. Navigate links through the host in the current profile. Avoid automatically covering native home with the controls dialog. Verify initial focus, remote navigation, private/normal tabs, Back, links, and absence of the old NTP. Search defaults/provider selection remain the next separate slice.

### Google default and TV search settings

Advance the prepopulated search data version to 36 and choose Google for newly created Android profiles at that version. Retain earlier-version fallback behavior and all deliberate user/policy selections; do not reset existing profiles. Update the existing country fallback tests and add a version-boundary check. Expose a TV settings panel with a search-engine chooser using `TemplateUrlService` and Brave's existing normal/private DSE preference integration. Keep Brave Search in the catalog without enabling Web Discovery. Snapshot labels/keywords rather than retaining native template pointers across clicks, validate policy and active tab/profile again on selection, and cancel pending model-load callbacks when the panel closes. Verify selection and persistence in normal/private contexts. Replace the generic menu shortcut with Home; further settings/branding surfaces stay on the checklist.

Review finds that legacy Android activity startup overrides the native default: first-install private Brave and regional Yandex assignments, plus a later Japan Yahoo migration. Remove these product-specific overrides and their unused helpers so existing stored choices remain untouched and fresh profiles inherit the native Google default. Remove the obsolete Browser menu string as identified by the standards review. Actual first-run normal/private checks must cover this Java/native integration, not just the native fallback test.

Blocking lint now identifies six unused reporting preference strings after their controls were deleted. Remove those message definitions rather than suppressing unused-resource validation, then build the combined native home/search revision from the existing cache.

### Remaining analytics entry points

The service audit finds that SERP classification/storage can still initialize from an old usage-ping preference even though its uploader is absent. Make the Android SERP factory return no service (both consumers already handle null); set the registered Android usage preference false and normalize old values at process startup. Omit Android histogram-braveizer observer creation. Keep the inert P3A compatibility API and required security/filter services. Remaining miscellaneous local metric producers still require audit; do not equate the upload shutdown with removal of every metric producer.

### TV startup without product promotions

The first-run activity bypass alone does not remove later activity promotions. Give TV a short native startup path after Chromium initialization: retain settings migration, no-preloading and fingerprinting upgrade handling, then skip Rewards/VPN/account/news startup, retention scheduling, rating/default-browser prompts and miscellaneous Android metrics connection. Skip the matching Brave-only resume work on TV and keep existing native cleanup. Existing retention broadcasts must be ignored on TV. Route the toolbar menu/settings actions to the native TV controls/settings, and hide Rewards/Wallet toolbar entries. Keep the underlying privacy/security controls and page loading. Restore the country variable still used by non-TV promotional code; the compiler caught that remaining reference after search-helper removal. Verify fresh and upgraded TV startup plus native toolbar actions.

Startup review catches essential work below those returns: Safe Browsing initialization, cold-start clear-on-exit, and the fingerprint migration's completion counter. Move Safe Browsing and video resume handling before the TV resume return. Extract the existing clear-on-exit block into a shared method, register preference changes on TV, and mark the existing migration completed after it runs (without collecting an ongoing TV launch count). Preserve lifecycle checks on asynchronous clearing. Do not install the intermediate startup revision. The toolbar menu button calls its handler directly, so route TV requests through its existing `AppMenuDelegate` to the native controls as well.

The header compiler rejects the new menu interface because the activity sees the public menu module, not its internal implementation. Remove that interface and retain the existing `AppMenuDelegate` boundary: resolve the activity-owned `show_menu` resource ID on demand and dispatch it through `onOptionsItemSelected`. The activity already directly references that ID, preserving it during resource shrinking. Check resolution before dispatch and keep the non-TV path unchanged; avoid introducing an internal-module dependency or an upstream build patch for a single menu action.

The menu bridge compiles but Android lint rejects its dynamic resource lookup (`DiscouragedApi`). Add a local suppression only to that lookup, documenting that the activity owns and directly references the resource while this lower-level module cannot import it. Keep the nonzero check, existing delegate boundary, and all global lint checks. Rebuild with blocking analysis, then verify the actual toolbar menu on the emulator before accepting this integration.

Blocking Error Prone also exposes the remaining split onboarding implementation: TV intentionally skips initialization of the retained phone pager/splash fields. Rather than add nullability exemptions or construct unused views, replace this fork's welcome activity with the direct first-run handoff for all its Android entry paths. The product requirement is no onboarding or reporting opt-ins. Retain the existing superclass/native initialization, disable both reporting consents, mark first-run complete, preserve the pending-intent/lifecycle handoff and Back handling, and delete referral/animation/pager code from this activity. Remove the unused privacy preference-manager field left by reporting-toggle deletion. Verify upgraded incomplete setup and a fresh profile; no profile reset.

Review of the direct-start activity identifies orphaned onboarding helpers, their test and resource target. Remove that entire now-unreferenced first-run UI module and its Java/resource/test dependencies, plus the two old activity layouts, layout aliases, animation and exclusive message definitions. Keep shared strings and resources used by other features. Audit references before deletion and let resource linking/lint validate the remaining graph. The active builder stays on its committed revision until it finishes; then advance it to this cleanup.

### Follow-up analytics audit: remaining collectors

Source inspection after the service-upload exclusions still finds local collection. `BraveBrowserProcessImpl` eagerly creates `ProcessMiscMetrics` (DNS, uptime, media, CAPTCHA, tab/privacy-hub and search aggregates); `ProfileMiscMetricsServiceFactory` can create per-profile page/language/autofill/Android metrics; `SearchEngineTrackerFactory` eagerly creates its search observer. These remain open work, not proof of an outgoing report.

After the direct-home APK is validated, disable Android construction at these service/factory boundaries. Check all consumers before returning null: startup SERP/uptime initialization currently dereferences the process service, while page, clear-history, Web3 and JNI paths already have service guards. Keep preference registration for migration compatibility and keep search-engine selection, browsing history, Safe Browsing and Shields independent. Check the Android metrics Java reconnect path so an absent service does not cause a retry loop. Then inspect remaining product-service entry points and observe startup/navigation/search traffic; encrypted traffic and server behavior require explicit limits on any no-analytics claim.

The next resource-lint pass identifies onboarding-only `HeadingH2`, `LargeOutlineButton` and `BraveCheckBox` styles and their exclusive dimension/selectors/drawable. Remove this final dependency group after reference checks. Keep `LargeButtonBase`, the filled-button style and shared Nala colors, which still have consumers.

### Runtime correction: do not create the Android referral service

The first combined APK builds but fails direct launch twice with `referrals_service_delegate.cc:57`: its profile observer expects `Start()` to call `OnInitialized()`, while the Android no-referral implementation intentionally performs no startup. `tests/device/tv-home.ad` fails at the initial address-focus wait and logcat captures the same abort on both launches. The sole production factory caller is `BraveBrowserMainExtraParts::PreProfileInit`, which ignores the return value. Make the Android process factory return null before constructing the service/delegate; preserve the existing desktop path. This removes the observer and task runner instead of restoring referral initialization. Rebuild and rerun the same direct-launch replay, then confirm the native home and reporting preferences.

### Runtime correction: native-home initial focus

The referral correction reaches native home and persists old P3A/metrics/usage opt-ins as false, but `tv-home.ad` still fails its initial focus assertion: Chromium focuses the newly attached root scroll view after the constructor's address-focus request. D-pad Down reaches the address button, and native controls open through the home action. Forward focus from the scroll container to the address action after attachment/layout using a posted callback. Only forward while the container itself still owns focus, the page is alive and attached, and its activity is not finishing/destroyed; do not steal focus from the address bar, another action or a replacement page. Rerun the same initial-focus/home replay and keyboard/return checks.

### Runtime correction: list-panel Down navigation

On the installed native home, the search chooser correctly preserves the old Brave provider, but Down from its first provider skips Google and focuses the Settings footer. `TvBrowserPanel.addAction` overwrites the first item's Down target even when more full-width list items intervene. Only retain that special grid-entry behavior while there is one leading item; adding a second list item must leave vertical navigation to native focus search. Preserve the main controls panel's address-to-first-enabled-grid-action behavior. Verify Brave → Google by D-pad, then select/persist a provider and rerun the browser-panel replay.

### Runtime correction: real license credits in development APKs

The home license action navigates correctly, but Chromium's default `generate_about_credits = is_official_build` leaves this Debug APK with a sample page. Enable `generate_about_credits` in the Android defaults so development/test APKs also carry the generated third-party notices. Use Chromium's existing license generator and Brave's existing notices integration; retain attribution and do not hand-maintain a substitute list. Verify generation, the packaged credits content and navigation from home.

### Runtime correction: toolbar menu entry

On `4be36e7dc`, the normal home replay passes, but Up → Right → Right focuses the toolbar menu and Select leaves it focused without opening controls. Preserve this as a D-pad replay from a normal native home. Trace the toolbar/AppMenuHandler delegate chain and its TV interception before changing code; distinguish dropped selection, an unhandled delegate action and missing resource resolution. Correct the existing entry point without introducing a parallel menu or changing non-TV behavior. Acceptance: the same toolbar replay must open the native controls, and home/grid replays must continue passing with blocking Android analysis. Preserve the profile and cached outputs.

Touch activation opens the toolbar menu correctly, ruling out missing resource/delegate dispatch. Chromium's `KeyboardNavigationListener` handles Enter but not D-pad center, and its menu button has a touch/accessibility handler rather than an ordinary click listener. Extend the existing Brave menu coordinator on TV to route a non-cancelled D-pad-center release through `onEnterKeyPress`, consuming repeats/down without opening twice and preserving the normal Enter/Tab listener behavior. Keep the existing activity/menu handler bridge.

### Home visual redesign requested during emulator testing

Replace the four equal-width outlined rows with a TV landing page: a quiet theme-derived gradient, a larger editorial heading with the existing simple/private/ad-blocking tagline, a dominant search card beside a smaller controls card, generous spacing, and compact attribution/source/license actions at the bottom. Keep private-session wording explicit. Use native Android layouts and existing Material buttons/Nala icons; no image downloads, web renderer, feeds, analytics, animation loop or permanent product name. Resting cards have subtle surfaces; only focused cards get the bright fill and high-contrast outline. Preserve lifecycle guards, native omnibox navigation and real attribution destinations.

Surfaces: `TvHomePage`, localized Android strings, existing Nala icon references and the home/menu replay order. Keep phone and shared browser-panel styling unchanged. Validate initial focus, Left/Right across cards, Down/Up to attribution actions, text visibility and keyboard/Back at 1080p; verify private layout and new-profile launch on the emulator. Build with the existing cache and resource limits, review only each latest implementation commit, then record screenshots and actual results. Toolbar redesign beyond the demonstrated menu fix remains a following slice.

Latest menu review identifies a rebinding gap: the coordinator's lazy/web-app and toolbar-switch paths install the original listener again through `setMenuButton`. Apply the same TV listener after both constructor binding and `setMenuButton`, keeping inherited binding and cleanup intact. Avoid broad property-model/bytecode changes for this view-level correction.

### Execute the remaining Android collector shutdown

The redesigned APK now passes fresh/upgrade startup, normal/private search defaults and remote input. Complete the previously identified collector work: return no Android process-metrics, profile-metrics or search-tracker service from their real factories; guard the two startup process-service dereferences. Desktop NTP consumers are excluded from Android, and runtime page/Web3/VPN/AI/search consumers already check for absent services. Retain preference registration for compatibility.

Remove the Android activity's metrics connection/reconnect setup and sole-consumer UsageMonitor, plus the now-orphan Java factory/error handler, JNI bridge and build entries. Keep the existing public activity metrics getter as an explicitly nullable compatibility boundary for guarded legacy UI consumers. Do not disable browsing history, search selection, Safe Browsing or Shields. Validate compile/link/static analysis, startup, search-provider switching, page input and the existing Shields fixture on the same preserved emulator profile; do not claim every Chromium metric or network service is removed. Traffic audit and remaining product integrations stay open.

Behavioral collector check: on the installed `1a976a373` APK, `chrome://histograms/Brave.Search.DefaultEngine.4` reports one default-search sample. Add a bounded device/CDP diagnostic that awaits the WebUI's existing `requestHistograms` promise and asserts presence on the old APK, absence after the shutdown/restart, then absence again after provider changes. Query only this metric and report names/counts; this is local collector evidence, not network-upload or comprehensive analytics coverage.

### Next slice: stable new-tab handoff and coherent TV toolbar

First reproduce the observed new-tab/controls overlap with a D-pad replay on the current APK, asserting that New tab exposes the native home and its focused search card without reopening the activity. Keep normal/private tabs and existing profiles intact. Once reproduced, trace the existing tab creation and controls dismissal/refresh callbacks; correct the shared handoff rather than add delays. Verify new, switch and close transitions and the existing home/menu/panel regressions.

Then refine the existing TV toolbar: retain Chromium's secure omnibox and navigation behavior, replace the user-facing Brave shield branding with a neutral protection icon/description, and use consistent, visible native focus affordances. Keep the working product name neutral and preserve attribution/licenses. Inspect the actual toolbar ownership and existing vector assets before choosing the smallest change; no separate address implementation or new image dependency. Review only each latest implementation commit, reuse the Nix build cache with established limits, and record emulator evidence before advancing to hardware.

Toolbar implementation scope: use the existing Nala shield/done/disable vectors, themed icon tint and Chromium's focus foreground on protection, tab and menu controls. Protection is disabled on native/non-web pages, with an explicit accessible description; web pages expose on/off descriptions and open the existing guarded TV protection panel directly. Rename TV protection labels to neutral “Site protection” wording while retaining internal Shields APIs and attribution. Preserve the menu's upstream bitmap drawable/animation contract and the secure address bar. Keep desktop/non-TV icon behavior intact. Test focus with disabled home protection, toolbar-to-protection entry, toggle off/on with the request-specific fixture, and normal/private new-tab home focus.

Visual correction after the toolbar run: Chromium's existing toolbar button background already draws a strong circular focus ring. Adding its rectangular foreground creates two overlapping rings on both tabs and menu in the actual screenshot. Remove the redundant foreground additions and keep the native focus background. Retain the verified neutral protection icons, disabled-state behavior and direct TV routing. Rebuild and inspect focus again; the initial double-ring screenshot is diagnostic evidence, not the final design.

## Remaining MVP execution plan

The user has requested continuous execution until the remaining work is complete. Work through the following slices in order; keep each implementation and its acceptance evidence separate, review only the latest implementation commit, and push incremental master commits. Do not mark a broad checklist item complete from a source-only change or substitute emulator evidence for hardware evidence.

1. **Tabs:** route the toolbar's existing tab action into the native TV list; keep private unlock handling and existing tab storage. Finish normal/private switching, close, pagination and ordinary restart restoration. Returning to a native home must expose its focused search action. Test toolbar entry, transitions and preserved fixture tabs.
2. **History and privacy:** use Chromium's existing history and browsing-data bridges for a bounded native history list, open/delete actions and explicit clear-data confirmation. Default focus to Cancel for destructive choices. Keep history unavailable in private sessions, cancel callbacks on dialog/activity teardown, and never clear a preserved real profile merely to test. Add fixtures created specifically for removal; use an isolated test profile for broad clearing.
3. **Home and settings:** expose saved bookmarks from home through existing storage without network images; finish remote-accessible protection/filter settings, normal/private search choice and privacy controls. Preserve clear focus, Back escape, readable labels and private labeling. Keep the clean home design and add only useful access points.
4. **Protection and video:** diagnose actual component-update failures, implement a legitimate sustainable filter delivery path, and verify fresh data, cached/offline data, toggles and recovery. Investigate reported YouTube video ads with reproducible evidence; distinguish content playback from ad state and do not promise universal blocking. Validate play/pause, seek, fullscreen/Back and representative adaptive playback.
5. **Background behavior and identity:** audit remaining analytics/promotional service creation and observable startup/search/navigation traffic. Remove unnecessary client collectors without disabling protection services. Replace remaining product branding with the temporary neutral label while retaining all notices/source links. The final chosen name and original launcher identity depend on the user's naming decision.
6. **Emulator acceptance:** execute a concrete site/task matrix, permissions/errors/dialog escape, keyboard/forms/nested scroll, Home/app switching/network loss/process recreation and a 30-minute browsing/video session. Record whole-browser memory, launch/panel timing, crashes and explicit compatibility limits. Fix observed failures before advancing.
7. **Hardware and test release:** rebuild the accepted source for the Chromecast using the preserved ARM cache and non-debuggable configuration; preserve profile data during update and repeat remote/video/performance flows. Prepare release provenance, update/migration identity, tester installation/recovery instructions and source/license distribution. Production identity/signing and access to the selected second physical device are dependencies, not emulator-testable facts. Never invent user secrets or a final name.

### Tabs: native toolbar entry

`BraveToolbarManager.initializeWithNative` owns the tab-switch callback passed to both Chromium's top toolbar and the existing Brave bottom toolbar. For TV activities, supply the activity's native TV-tabs entry point at this boundary, retaining the incoming callback on other form factors. Add a guarded public entry in `TvBrowserControls` that uses the active normal/private model and preserves private reauthentication. Selecting an existing native home should dismiss the list and expose home, rather than reopen controls. Keep web-tab selection returning to controls for pointer/scroll access. Add a D-pad toolbar replay before changing source; verify the old APK fails the native-list assertion and the updated APK passes.

### History: reuse the real history bridge in a native panel

Add a TV history panel owned by the existing controls lifetime. It owns one `BrowsingHistoryBridge`, lazily fetches continuation batches, shows eight entries per page, and offers open/remove actions for a selected entry. Display the title, origin and visit date so removal scope is understandable. Removal affects the selected grouped history entry using the bridge's native timestamps; confirm with Cancel focused and honor `ALLOW_DELETING_BROWSER_HISTORY` both when presenting and executing it. Observe removal completion/failure rather than claiming success immediately; refresh after external deletion without issuing overlapping queries. A loading/removal state must prevent duplicate actions.

Destroy the bridge/dialog on controls dismissal, activity pause or teardown; late callbacks must check lifetime and the captured normal tab before UI work. No history list in private sessions. Do not invent a second history database or fetch favicons/network previews. Wire the existing History action to this panel, register its source in the existing Java list, and validate with a uniquely titled local fixture: visit, list, open, Cancel removal, confirm removal, verify absence, and verify private controls keep History disabled. Broad clear-data controls follow in their own slice and will be tested on an isolated profile.

Tab review correction: selecting the already-active native home does not trigger Chromium's attachment/root-focus path. Explicitly request the selected `TvHomePage` search action after model selection, guarded by live activity/tab and attachment. Keep the existing attachment focus path for newly attached pages. Extend the toolbar replay to select the current home and assert focused search; verify it fails before the correction and passes afterward.

History review correction: a full URL can consume the two-line detail subtitle and hide the visit date. Put the visit date first and the stored display domain second, and reuse that summary in the removal confirmation. Keep the title as the heading so the same-day grouped removal is identifiable even for long URLs. Include a long-query fixture during runtime validation.

### Privacy: explicit native clearing choices

Add Clear browsing data to TV Settings for normal tabs only. Reuse `BrowsingDataBridge` with three separate all-time operations: browsing history, cookies/site data, and cached files. State all-time scope and cookie sign-out consequences before confirmation; focus Cancel, recheck history deletion policy at execution, and leave bookmarks/passwords out of all type arrays. No preselected destructive operation and no generic ambiguous “clear everything.”

Keep one in-flight operation per activity, show progress and wait for the native completion callback. Closing/pausing the UI cancels its UI callback, not the already-confirmed deletion; reset the in-flight flag when native work finishes without reopening dismissed UI. Use the existing callback controller and dialog lifetime. Test cancel, completion, private exclusion and cookie/history/cache scope on an isolated emulator user/profile, never by clearing the preserved test profile. Defer no user data loss protections to later.

Privacy review correction: the completion target must follow the currently visible clearing panel, including exit/reopen during one native deletion. Keep a single nullable completion action registered when the progress panel is shown and cleared on dismissal/pause. Native completion resets the in-flight flag and consumes only that current action. This replaces the original dialog's permanently canceled callback; no dismissed panel is reopened, and a newly opened progress panel refreshes when work finishes.

### Home: direct saved-bookmark access

Add a third native home action for Bookmarks beside the existing dominant search and controls cards. Reuse the existing bookmark model/list through a guarded activity entry; do not fetch artwork or create a second saved-site store. Search retains double card width and initial focus; keep the existing Right-to-controls route and add one more Right for bookmarks. Link its Down target to the license/footer row and preserve private reauthentication. Verify the three cards fit at the emulator density, Back escapes the list, existing home/menu replays still work and normal/private bookmark visibility matches existing controls behavior.

History runtime correction: the native list loads real visits, but selects the last row because both its default preferred-action sentinel and every unkeyed item use zero. In `TvBrowserPanel`, treat zero as no preferred action; fall back to the first enabled action. Explicit resource-ID preferences and bookmark/tab keys remain intact. Reproduce with the four-visit list, then require its first visit to be focused on entry and return. Rerun home/panel/history navigation after rebuilding.

Home visual correction: the three cards fit and remote replays pass, but the screenshot reveals the wrapped Browser controls label shifts its card down because a horizontal LinearLayout aligns text baselines by default. Disable baseline alignment on the home action row so all cards share the same top edge. Retain the readable two-line label, focus order and existing touch targets; inspect a rebuilt screenshot rather than accepting the offset layout.

### Settings: native optional filter lists

Add Content filters to TV Settings using the existing `FilterListAndroidHandler` and catalog/preferences. A dedicated native panel owns the Mojo connection, pages available optional lists, shows each list's current on/off state, and refreshes from the service after a toggle while retaining that row's focus. Core hidden protection lists remain outside this chooser. Explain that optional lists apply across tabs; use the original profile, including entry from a private tab, after existing private-access checks.

Show loading/empty/error states and keep Settings/Back reachable. Close the connection/dialog on activity pause or controls teardown, ignore stale callbacks, and handle connection failure without a crash or a false update-success message. Do not add a fake component-update button or claim that this fixes delivery. Preserve existing list data/attribution and use the current catalog titles. Test cookie-list off/on with the request-specific fixture, restart persistence, private entry, focus/Back and main settings order. This replaces the unreachable phone-oriented entry for ordinary optional toggles; custom text/subscriptions and independent update delivery remain separate work.

Settings navigation detail: remember the last settings entry when returning from search, filters or privacy, rather than always jumping to Search engine. Keep the initial selection on Search engine and let the panel fall back safely when the remembered entry is unavailable in private mode. This mirrors the existing browser-controls selection behavior.

#### Background traffic acceptance

After verifying native filter toggles, capture a bounded emulator NetLog using
the existing debug command-line mechanism. Preserve any existing flags, use
default redaction, keep the raw log outside Git, and restore the original flags
afterward. Observe a cold launch, idle home, navigation and a disposable search;
record requested hosts and request outcomes separately from page subresources.
Inspect remaining Android service factories against observed traffic before
removing any service. Component and Safe Browsing requests are protection
traffic, not proof of analytics. An empty reporting-host sample establishes
only the observed window, not all future/background behavior. Do not copy
credentials, disable TLS checks or substitute private Brave service keys.

#### Neutral development launcher banner

Replace the prototype BT monogram in the existing TV launcher vector with a
simple screen-and-cursor graphic, using the native home's dark navy and mint
palette. This is temporary independent artwork, not the final product identity.
Keep the existing development label, alias, application ID, signing and all
attribution unchanged. Preserve the lint-approved 160×90dp size and 320×180
viewport. Compile with blocking resource/lint checks and inspect the rendered
banner before accepting it; final naming and distribution identity remain open.

Filter replay correction: the first new-build run sends Down before Settings
has acquired focus and opens Search engine instead. Manual D-pad navigation
reaches the filter panel. Await each destination's focused entry before the
next key, and use the actual localized `Content Filters` label in the return
assertion. Keep the off/on behavior assertions unchanged.

#### Remaining Rewards onboarding notification entry points

The traffic audit found no reporting host in its bounded sample, but source
inspection finds a separate legacy entry: `BraveOnboardingNotification` can
still display a Rewards first-ad notification or follow its promotional deep
link on TV. The retention receiver already has a TV guard. Add the same guard
to the onboarding receiver and its direct display entry, and cancel only that
notification's existing tag/ID during TV startup. Keep website/download and
security notifications intact. Do not claim this replaces auditing all native
service factories. Compile the Java changes with blocking analysis, check TV
startup and notification state, and review only this implementation commit.

#### Native playback controls

YouTube playback and fullscreen/Back work, but the mobile seek bar does not
respond to the remote cursor's tap at its timeline. Add a native Playback entry
to browser controls for web tabs. Its panel uses the active tab's Chromium
MediaSession, with Play/Pause and backward/forward ten-second actions; do not
inject page JavaScript or send global media keys that could control another app.
Keep the panel open and focus stable after actions. Disable seek actions unless
the session advertises them, and explain when playback must first start on the
page. Keep private-tab access checks, detach observers on pause/dismiss/tab or
document change, and ignore stale callbacks. Fullscreen remains the site's
existing control in this slice.

Use the existing panel/button style and localized strings. Allow the panel
builder to return the buttons it creates so state updates change those views
without rebuilding the dialog. Verify native pause/resume, ten-second seeking,
Back/focus, no-media state and lifecycle cleanup on emulator video; use the
documented non-alphabetic uinput remote for page-cursor interactions. The
agent-device virtual keyboard intentionally bypasses the cursor policy.

Latest-commit review found two API constraints before acceptance: Brave's
document-change callback is dispatched only to the upstream media helper's
observer, and Chromium discards the requested seek offset when routing to a
site-provided seek handler. Observe committed primary-frame navigation directly
through the tab to close the old panel. Use “Seek backward” / “Seek forward”
labels instead of promising a fixed ten seconds: retain Chromium's site action
semantics, with ten seconds for its native fallback. Check the actual seek
effect on the target site and document its distance. This changes our proposed
button wording, not a user-required duration.

No-media runtime regression: `9ece2a633` crashes when opening Playback on
`dialogs.html`, because `MediaSession.fromWebContents()` returns null. The JNI
implementation uses `MediaSessionImpl::GetIfExists`, despite the Java API's
non-null annotation. Treat the session and observer as optional and render
disabled actions with the existing start-playback explanation. Never construct
an observer or invoke a session method when absent. Add a native replay that
opens this no-media panel and returns focus to Playback; it must fail on the
crashing build and pass on the correction. This direct exception/JNI evidence
does not require speculative instrumentation or changing the upstream API.

#### Idle cursor and native safety dialogs

The fullscreen screenshot shows the pointer and mode hint remaining over video
without input. After playback acceptance, hide the noninteractive cursor layer
after three idle seconds. Remote movement reveals it immediately; the first OK
when hidden reveals it without blindly clicking, and the next OK clicks normally.
Keep the pointer position/mode, native fullscreen/keyboard/Back priority, and
remove the pending hide callback on detach/pause/destroy. Verify visible → hidden
→ movement/OK wake, held OK and tab cleanup with the existing uinput/pixel checks.

Prepare a local page for alert, confirm, prompt and popup checks, with explicit
buttons and visible results. Use native D-pad to accept/dismiss and recover to
browser controls. Exercise certificate/network errors and site permission prompts
separately, preserving security choices. A fixture is diagnostic content, not
product UI or a replacement for physical-remote acceptance.

Dialog diagnosis on `8164e10cd`: alert, confirmation and prompt appear, but
Up/Down/Left/Right leave keyboard focus on `compositor_view_holder`; the
non-alphabetic uinput device reproduces this. Back dismisses/cancels safely.
The modal presenter clears webpage selection/focus and supplies accessibility
focus, but does not assign keyboard focus to an interactive dialog descendant.
Register a TV-only ModalDialogManager observer in the existing controller.
On shown, post a guarded focus request into the actual dialog: preserve an
already focused control, otherwise prefer an editable field, Cancel if present,
then the first enabled interactive descendant. Never invoke its click handler
or weaken button-tap protection. Remove the observer on controller destruction;
stale posted work must reject a detached dialog or destroyed activity. Verify
alert OK, confirm Cancel/OK, prompt editing/Cancel and permission refusal with
D-pad, plus Back and focus visibility. Keep upstream dialog text and decisions.

`77e234039` passes initial alert focus and OK dismissal, but the replay's final
Back exits to the launcher: the modal presenter leaves focus outside ContentView,
so the TV controller correctly gives native focus priority. Restore keyboard
focus to the captured page when the last modal closes, only if that exact page
is still current/attached and the activity remains foreground/alive. Clear the
captured return target on pause/destroy. Keep the final Back assertion unchanged;
do not weaken the existing native-input priority rules.

Review refinement: Chromium's “last dialog dismissed” callback also fires when
its pending queue empties while another modal is still shown. Require the manager
to report no active modal before restoring focus. A separate-window modal may
close before the activity regains window focus; retain its return target and retry
from the existing window-focus callback, with the same page/lifecycle checks.

The idle-wake replay review found that checking only the final count after two
presses could miss a reversed bug (first press clicks, second is swallowed).
Split the replay at the first release: require `Clicks: 0` and a visible cursor
before sending the second held press, then require `Clicks: 1`. Keep both real
uinput sequences and the independent idle-absence pixel check.

#### Visible focus on upstream native dialogs

The permission screenshot confirms the safe Block-first selection works but
its native focus fill is subdued. Add a theme-aware three-dp outline only while
an enabled dialog control has keyboard focus. Apply it when the existing TV
modal observer receives the attached dialog, keeping the upstream background,
text, click listeners, tap protection and accessibility semantics. Preserve any
existing foreground instead of replacing it. Style all enabled interactive
focus candidates, including buttons after a prompt editor, before selecting the
initial control; keep already focused controls and Cancel/editor preference.

Use Android's state-list/gradient drawables and current theme contrast color;
no new assets, dependencies or focus listeners. Verify confirmation Cancel → OK,
prompt editor → buttons, permission Block and alert regression on the emulator,
including visible focus moving away from the old control. Build with the same
cached x64 blocking checks and review only the latest implementation commit.

#### Ordinary media and lifecycle acceptance fixture

Add a small local HTML5 video page using Chromium's existing unencrypted
`bear-1280x720.webm` test clip from the preserved checkout, served separately on
loopback. Do not duplicate the media binary in Git or fetch new dependencies.
Expose Play, Pause, Fullscreen and captions through ordinary webpage buttons,
with visible playback/error state and a local WebVTT cue. This fixture tests
actual page input and the native Playback panel; it is not product media UI.

Check play/pause through browser controls, captions/fullscreen through the real
remote cursor, idle cursor disappearance over video, Home/relaunch cleanup and
tab/document replacement. The short looping clip is not long-form/adaptive
stream acceptance; retain the independent YouTube and sustained checks.

The bear clip passes caption/fullscreen checks but its 2.747-second duration
makes Chromium classify it as transient (`media/base/media_content_type.cc`:
persistent content must exceed five seconds). The native panel correctly leaves
its actions disabled. Switch the ordinary fixture to the existing 24.109-second
`bbb-320x240-2video-2audio.mp4` sample so it can exercise a persistent session,
and extend the caption cue. Preserve the bear results as short-video evidence;
this is a test-input correction, not a change to Chromium's media policy.

Persistent media pause/resume works, but the Python fixture server does not
serve byte ranges: the page reports a seekable range of [0,0], duration grows
while buffering, and native seek actions are disabled. Replace that diagnostic
server with a loopback-only Node server exposing only the fixed upstream MP4.
Support ordinary GET/HEAD and one bounded byte range, including suffix ranges;
reject malformed/unsatisfiable ranges and keep the binary outside Git. Check
real HTTP status/length/body for full, prefix, suffix and invalid requests before
repeating browser seekability and native actions. Do not alter product seeking
based on this server limitation.

#### Source-check command after submodule migration

The ordinary `nix flake check` fails because Nix 2.25.3 excludes the Brave Git
submodule from its source snapshot. Verify and document the explicit local Git
flake URL with `?submodules=1`; keep the checks compiling the real pinned source.
Do not copy Java source into this repository or upgrade the user's Nix install.
Nix's automatic `inputs.self.submodules` option was introduced in 2.27, beyond
this host (official release notes: https://releases.nixos.org/nix/nix-2.27.0/manual/release-notes/rl-2.27.html).

#### Standard protection mode crash

Aggressive blocking survives background/restart on the local Shields fixture,
but selecting Standard aborts the browser. The native crash says
`brave_shields_utils.cc:260: type != ControlType::DEFAULT (3 vs. 3)` in the
`setAdControlType` JNI path. Add a D-pad replay beginning on the same normal
fixture with Aggressive selected, selecting Standard and asserting the panel
remains present with Aggressive now the enabled alternative. Demonstrate its
failure before changing source. Inspect the shared Android mode constants and
existing phone caller, then use its actual standard mode; preserve per-origin
storage, explicit protection state and reload behavior. Check both directions,
normal restart and the blocking fixture, and review only the latest commit.
The native assertion is direct evidence of an invalid argument, so no speculative
instrumentation or broad bisection is needed.

The regression fails at step 14 after selecting Standard, reproducing the same
native abort. The fault is in the shared `setShieldsValue(TRACKERS)` conversion:
both the TV panel and existing phone callers use `DEFAULT` for Standard, while
native `SetAdControlType` accepts only BLOCK or ALLOW. Correct that shared
conversion so DEFAULT and BLOCK_THIRDPARTY map to BLOCK for network filtering;
retain BLOCK_THIRDPARTY for Standard cosmetic filtering and preserve ALLOW/BLOCK.
This matches `BraveShieldsSettingsService::SetAdBlockMode` semantics. Fix the
conversion once rather than bypassing the shared API in TV UI.

#### Popup tab UI on TV

The real uinput remote opens the local Popup fixture and Back reaches browser
controls, but the new grouped tab exposes the phone's bottom tab-group strip
(including its phone grid action). Hide that strip in TV mode at the existing
`BraveBottomControlsMediator.isTabGroupUiEffectivelyVisible` boundary. Keep
requested visibility, phone preferences, group membership and normal/private
tab storage unchanged; the native TV tab list already exposes these tabs.
Use the current Android configuration rather than mutating preferences or
ungrouping tabs. Check the existing grouped fixture before/after, native tab
switching, Back and restart; retain non-TV behavior. Review only this latest
implementation and reuse the bounded cached Java build.

#### Remaining Android startup analytics

The installed build records a local `Brave.Core.CrashReportsEnabled` sample
during startup despite disabled uploads. The shared main extra parts still
call their initial P3A recorder; the Android ads stats helper also observes
profiles/preferences solely for reporting. Extend the existing native histogram
probe with an optional metric name and show the current startup metric present
before changing production code. Exclude the initial recorder on Android and
make the ads stats helper accessor return null there, matching other disabled
analytics factories. Its only production caller initializes it without
dereferencing the result. Preserve desktop behavior and protection services.

Build from cache with existing limits. After a process restart, require the
startup histogram to be absent while search/settings and ordinary navigation
still work. Audit remaining promotional services and network reporting
separately; a missing local histogram alone does not prove no outbound traffic.

The foreground native histogram probe confirms the startup sample present on
`d88cef8a9` (enabled passes, disabled fails). Background discarded tabs can
time out and must be brought forward before this check. Source inspection also
finds a profile-level initial P3A recorder (sponsored-image and Shields settings
metrics); exclude this Android invocation/helper in the same startup slice.
Keep actual Shields settings/migrations unchanged.

#### Android promotional ads service

The profile manager still eagerly creates AdsService, and page/Java helpers
can request it later, despite the removed TV promotions. Stop Android
construction at the shared `AdsServiceFactory::GetForProfile` entry point.
Inspect all direct callers and downstream nullable handlers first; retain
desktop behavior, registered preferences, existing profile files and Shields.
Do not conflate Brave's promotional AdsService with the blocking engine.
Update any Android test expectations reachable in the actual GN graph, then
compile and verify native settings, normal/private page navigation and the
request-level blocking probe. Continue Rewards/Leo/VPN audit separately.

#### Remaining out-of-scope Android services

After AdsService, disable Android support for Rewards, Leo and Brave VPN at
their shared feature/support queries. These products are explicitly outside
the MVP and the user requested their removal. Inspect factory and JNI/WebUI
callers first; disabled support must prevent lazy construction as well as
startup. Preserve underlying settings/data for migration and retain desktop
behavior. Do not disable Chromium security or filter delivery. Use existing
feature gates rather than adding a fork preference or silently requiring a
command-line flag. Update relevant existing Android feature expectations.

Compile with the bounded cached build; test direct home, native Settings,
normal/private pages, Shields request effects and the disabled internal-page
paths. Then repeat a bounded default-redaction network capture while browsing
and searching Google and Brave Search; distinguish website requests from
browser reporting. Record remaining background services instead of claiming
full removal from this one check.

The installed AdsService-only build exposes a remaining Rewards signup modal
(“Enable Brave Rewards”) above TV controls. Its toolbar checks call the shared
Rewards support query, so Android support denial addresses that demonstrated
path. Dismiss with Back, without opting in. Inspection also finds two Leo JNI
entry points that assert a service instead of handling disabled support; guard
them before querying the service. The Rewards worker must not create its
adaptive-captcha service when Rewards is unavailable. Include these callers
in the same service-removal slice.

The first service-support compile rejects the constant-false Android boolean
expression as unreachable code under Chromium's warnings-as-errors. Use
platform preprocessor guards for the Leo/VPN helper bodies, preserving the
desktop feature query. Do not suppress the compiler check.

Latest-only review identifies enabled-Leo tests still included in Android and
a Java/native availability mismatch: Java sees the raw enabled feature, while
the native gate stops registering preferences. Align the four Java availability
checks with one Android support constant, retain Android preference/migration
registration, exclude enabled-only WebUI tests on Android, and add a disabled
service/preserved-pref assertion to existing profile browser tests. Preserve
desktop checks; do not hide a failing enabled-service test by weakening it.

The correction review finds three Android menu expectations still include Leo
despite the new hard support gate. Remove that item from the normal/NTP
expected menus while retaining `@EnableFeatures(AI_CHAT)` to verify an old
raw flag cannot restore Leo. Keep all other menu assertions.

#### Remaining sponsored-home services

The Android background-image bridge eagerly requests the sponsored-home
service even though the TV home uses no downloaded wallpapers. Return null
from the shared Android background-image service accessor; its bridge and
view-counter factory already handle absence. Remove registration of Android's
old new-tab takeover WebUI, whose controller otherwise CHECKs that service.
Keep desktop behavior, existing preferences and security/filter components.
Also stop constructing the Android day-zero UI experiment observer; the
independent browser has no P3A-driven onboarding experiment.

Add an Android browser assertion for absent background/view-counter services.
Build from the preserved cache after the current build finishes; check native
normal/private home, settings, ads-internals and direct old takeover navigation
for safe behavior. Record browser-test execution separately from APK compilation
and emulator checks. Review only the resulting latest source commit.

#### Inactive-tab promotion on TV

Closing a private test tab on source `3696a9154` exposes Chromium's phone
inactive-tab auto-delete promotion over native home, with Brave branding.
Do not dismiss it by fabricating a decision preference: its dismissal path
enables automatic deletion. Preserve existing archive/retention preferences.
At the existing ChromeTabbedActivity bytecode adapter, skip initialization
of this promotion manager on `DeviceInfo.isTV()`, leaving the phone path
intact. This prevents both direct and tab-observer-triggered display.

Verify the actual adapter on the JVM with TV/non-TV method side effects and
missing-hook failure, then rebuild with blocking analysis. Repeat private
close-to-home and normal restart on the emulator; require no promotion and
visible home focus. Keep the single intermittent home replay failure recorded
separately until a repeatable cause is established.

The full Nix check catches the diagnostic reusing `source` for both text and a
Path. Rename the latter to `source_path`; retain strict typing and rerun the
actual JVM regression and full source checks. Product code is unchanged.

Standards review requires the existing Android `BytecodeTest` to assert the
new hook's method signature (AND-022), in addition to the behavioral JVM
diagnostic. Add the void/no-arguments method check beside the existing
ChromeTabbedActivity entries; its class is already covered.

#### Independent signed filter feed

The current startup/search capture still receives HTTP 403 for all 12 upstream
component requests. Public static hosting cannot serve the updater's Omaha
POST protocol. Add a fork-owned, data-only feed over HTTPS with a pinned
Ed25519 verification key, using Chromium's existing crypto and URL loader APIs.
Leave upstream component signature verification and security-component updates
unchanged; do not borrow service keys or treat downloaded bytes as a component.

Ship the existing resources.json and five baseline filter texts as one signed,
size-bounded payload. Keep catalog IDs, permissions and preferences fixed by
the APK; adding new trusted groups requires an app update. The payload includes
a format/engine identifier, increasing sequence, publication time and source
provenance. Signing uses Node's standard crypto library and an explicitly
provided private-key file outside Git. Tests use temporary keys. Never include
the publisher private key in the repository, APK, release assets or logs.

First implement and test the deterministic packager against the existing pinned
snapshot. Then implement native verification and storage: signature before
parsing, strict schema/size/engine checks, future/stale-download rejection,
monotonic sequence and atomic replacement only after full validation. Retain
last-good cached data offline and packaged data if cache validation fails.
Use one immutable snapshot shared by filter/resource providers and DAT-cache
versioning, loaded on a worker. A staged update becomes active at the next
browser restart; do not mix new resources with old compiled filters.

Add bounded credential-free download, at most one automatic check per day,
and a manual check in the native Content Filters panel. Show the active
snapshot date/source, update failure or staged/restart state honestly. Keep
callbacks scoped to service/dialog lifetimes and avoid blocking the UI thread.
Publish a signed public feed only after the packager/verifier checks pass;
document key custody, repeatable refresh/publication and source/license links.

Acceptance covers valid update, tampering, wrong key, rollback, incompatible
engine, oversized/truncated data, failed/interrupted fetch and offline restart.
On the emulator require version/cache transition and actual blocking after
restart; repeat list toggles. YouTube observations remain a separate test and
must not be promoted to universal ad-blocking claims. Plan/review/build each
implementation increment using the established cache and resource limits.

The first native increment isolates authenticated bundle parsing and its tests.
Accept only the fixed five IDs, APK catalog hash, exact engine/format, nonempty
UTF-8 payload fields and matching per-file provenance hashes. Verify Ed25519
before JSON parsing; use a digest of the authenticated payload for cache identity.
Reject publications more than one day in the future. New downloads must be no
older than 90 days; retained cached data may be older for offline use. Keep this
age policy explicit at the caller. Sequence rollback and atomic activation belong
to the subsequent storage increment, which must compare active and staged data.
Run a focused native test target using the cached host toolchain, then integrate
that target into the regular Shields unit tests. No feed is enabled by this parser
increment, and no publisher key is embedded until generation/publication setup.

Latest parser review requests two local corrections: return an optional parsed
publication time rather than a bool/output parameter, and restrict the internal
GN source-set visibility to its local consumers. Apply these before native
execution. The first test-build invocation stopped during GN generation because
it lacked Brave's Python module path; rerun with the same `brave/script` path
used by the standard build wrapper. No compiler or test result came from that
invocation.

GN now reaches the focused test target and detects host/Android runner scripts
with the same output name. Generate the standalone test executable only in the
host toolchain; Android still includes these cases through the existing Shields
unit-test source set. Keep the explicit host-test group for reproducible builds.

The storage increment owns a single immutable active bundle for the process.
Construct a refcounted store with the cache path, verification key and expected
catalog hash; all loading, verification, staging and metadata reads run on
workers. Serialize initialization/staging with a lock, never mutate active data
once exposed, and keep the store alive while providers use it. A successful
stage atomically replaces only the cached signed envelope, advances its highest
sequence/digest, and becomes active only in a newly constructed store after
restart. Equal sequence plus equal digest is unchanged; equal sequence with
different contents or any lower sequence is rejected. Failed writes or invalid
updates retain the previous envelope and process snapshot. Invalid/missing
cache exposes no signed snapshot so existing packaged-data fallback can run.

Exercise actual temporary-file storage through public APIs: empty startup,
valid stage/restart, same-sequence conflict, rollback before/after restart,
tamper rejection preserving bytes, write failure, stale cached/offline use,
invalid cache fallback and immutable active data across multiple stages.
Provider wiring, production key and transport are the next increment.

Wire the store into Android's existing bundled-data path behind an independent
updates feature. Generate the publisher Ed25519 key locally with owner-only
permissions outside Git; embed only its public half. Add the pinned catalog
hash to the existing generated snapshot header and its refresh generator.
Construct one store in AdBlockService and pass owned references to resource,
filter and DAT-cache workers; keep defaults for existing callers/tests.

When this path is enabled, the APK catalog, default resources and five supplied
baseline lists use the independent snapshot exclusively, with packaged fallback.
Do not register their duplicate upstream components: an asynchronously arriving
catalog/resource component could otherwise break the fixed permissions or mix
snapshots mid-session. Other component types and their CRX verification remain
unchanged. Include snapshot digest in the compiled DAT prefix. Check packaged
startup first, then signed stage/restart and cache transitions after transport is
wired. Continue to preserve existing list choices and custom subscriptions.

Integration review confirms a migration hazard: before the first signed update,
independent packaged fallback still used the old upstream DAT prefix. Give that
fallback a distinct prefix so cached filters built from upstream components
cannot be paired with the new packaged resources. Add a regression that rejects
the legacy prefix and verify actual DAT replacement on first emulator launch.
Update the bundled-data README's precedence explanation; downloader delivery is
still pending and must not be described as available yet.

#### Shared TV panel visual redesign

The user rejects the oversized central Settings dialog and repeated bright
outlines. Prioritize this visual correction before independent feed transport.
Use a compact trailing-edge panel for settings and lists, with a quiet themed
gradient, generous outer margins, a prominent heading, subdued description,
left-aligned rows and existing Nala icons. Only the focused row receives the
strong filled accent and outline. Keep the main browser controls wider with
their existing three-column D-pad order; compact panels use two action columns.
Keep headings separate from scrolling items so long lists retain context.

Change the shared TvBrowserPanel, its main-controls layout selection and Settings
presentation; reuse the current home palette and Material components, without
new dependencies, bitmaps or custom icon assets. Preserve action IDs, callbacks,
privacy/profile guards, disabled states and remembered focus. Home uses the
shared button factory and must retain its intended three-card layout.

Build the cached x64 APK through Nix with four workers and 18/22 GiB limits.
Inspect real Settings, controls, filters and home screenshots; replay D-pad
navigation including scroll-to-bottom, Back and restored focus. Check search,
tabs and confirmation layouts for clipped labels. Record actual evidence and
limitations. Commit incrementally on master and review only the latest source
implementation against its parent before pushing source and the parent pin.

The first rendered build (`0597ee53c`) passes the main panel and Settings
navigation replays, but Playback falls below the main grid's initial viewport.
Keep compact lists unchanged. Reduce the wide panel's heading/outer spacing
and use 48dp minimum grid actions so all English primary controls fit at the
standard 960×540dp TV viewport. Retain scrolling for larger fonts, long URLs
and translations, and preserve the existing three-column focus order.

The confirmation screenshot also exposes unnecessary empty space: a two-button
prompt inherits the list panel's full height. Measure the populated native root
at the resolved panel width with an AT_MOST height of 90% of the display, then
size the window to that bounded content height. Keep the same trailing/centered
placement and scrolling for overflowing lists. Verify short confirmation,
Settings, filters and paginated tabs visually; preserve initial Cancel and Back.

#### Cold-start blocking regression

During the panel acceptance on `0597ee53c` and `c509c9254`, the restored local
Shields fixture reports both blocked scripts loaded before any diagnostic reload.
The existing reload-based request probe passes afterward. Add a bounded
read-only diagnostic that observes the current document and script execution
flags without reloading, asserting the ordinary control loaded and both blocked
fixtures did not. Repeat a normal cold relaunch of the same fixture with list
choices unchanged. Capture red results before investigating readiness, restored
resource cache behavior or provider selection. Do not call this a demonstrated
YouTube root cause. Complete the current panel screenshots, then prioritize the
reproduced protection failure before independent update transport.

The existing `brave.adblock` startup trace confirms empty-engine queries:
the main document is checked at +2.56ms, its blocked scripts at +132.99/133.03ms,
but default/additional DAT engines are installed at +892.84/+920.31ms. Trace
capture uses temporary Android command-line settings, restored afterward; no
diagnostic source logging is necessary. The no-reload observer remains red.

For the independent bundled-data path, defer AdBlockService's public engine
queries and cosmetic receiver binding until both engines have loaded filters
and resources successfully. Keep initialization tasks on the existing sequenced
worker and bypass this query queue so loading cannot wait on itself. Drain queued
work once, in order, after readiness; destruction drops owned pending callbacks.
Retain valid DAT loading, failed-DAT fallback, list choices and snapshot identity.
Desktop and the disabled independent-update path retain their current dispatch.
Do not wait for remote component delivery: this path has the local fixed catalog,
verified signed or packaged data, and local custom lists. Later list updates
continue using the already-valid engines while replacements load.

Verify the original cold-start observer repeatedly, the ordinary request-level
reload probe, and initialization with DAT caching temporarily disabled (without
deleting caches). Use the existing trace to establish checks occur after engine
loading. Retest native optional-list toggles and navigation; measure the added
startup wait. Build/review this source increment independently and preserve
all temporary flag/settings state.

Latest-commit review of `fd1db3384` identifies a second ordering requirement:
without DAT caching, the existing component-provider sentinel is absent. An
already-initialized custom provider can start a partial engine before the async
catalog has registered baseline lists. Extend that existing sentinel condition
to the independent bundle-store path, with DAT either enabled or disabled;
retain legacy behavior otherwise. Add a focused manager regression with DAT
disabled and initialized local providers, asserting no load notification before
explicit catalog delivery and notification afterward. Run the cached and
no-DAT startup probes/traces on the corrected APK; report native-unit execution
separately from device acceptance.

#### Signed delivery and TV freshness

Build on the verified immutable store; keep downloaded rules inactive until the
next browser process. Add a small core updater using SimpleURLLoader and the
existing system URL loader factory, injected from the browser process through
AdBlockService. Fetch only the fixed fork-owned GitHub release asset
`https://github.com/smolcars/brave-tv/releases/download/filters-current/filters.bundle`.
Use GET, credentials omitted, no cache, a 24 MiB body limit, a 60-second timeout,
and reject HTTPS downgrades. No retries within a check. Verification and atomic
staging stay on a sequenced worker; destruction cancels owned download/timer and
weak replies. A failed/interrupted fetch or rejected bundle retains current data.

Persist the last attempt in local state. Schedule the first automatic check no
sooner than 30 seconds after service construction and no more than once per day;
reschedule daily for a long-running process. Manual checks bypass that interval,
coalesce with an in-flight check, and reschedule the next automatic attempt.
Treat clock changes conservatively without permanently suppressing updates.
Expose checking, unchanged, staged/restart, download failure and rejected-update
states. Read active publication/sequence on the worker; distinguish packaged data
from a signed snapshot, and distinguish publication date from last-check time.
Keep the updater disabled when independent bundled data or its factory is absent.

First compile and exercise the updater with TestURLLoaderFactory plus the real
signed store (daily scheduling, coalescing, timeout/failure, bounded body, valid
stage, repeat, rejection and immutable active data). Then wire the service and
Mojo methods into a native TV update panel reached from Content Filters, with
localized status, a clear check action, lifecycle guards and stable remote focus.
Build through the existing Nix cache/limits. Publish a verified bootstrap feed
with source/provenance/license links; retain historical assets and keep the
private publisher key outside Git/logs. The bootstrap contains the already-pinned
baseline and must not be presented as a newly refreshed upstream ruleset.

On emulator verify real HTTPS fetch, last-check status, staged/restart activation,
DAT identity transition and actual blocking; exercise offline/error handling and
Back/reopen during a check. Update source publication/refresh instructions and
record exact limits. Review only each latest implementation commit, push source
master before root master, then continue the remaining MVP acceptance work.

Updater review finds SimpleURLLoader's string API is limited to 5 MiB, below
our approximately 10 MiB envelope. Use its stream-consumer API and enforce the
24 MiB cap before every append, preserving the 60-second deadline, HTTPS-only
redirects and worker validation/staging. Do not use an unbounded string helper.
Represent active signed metadata as an optional sequence/publication pair,
and express the mandatory preferences dependency as a non-null reference.
The initial host build was intentionally stopped before completion to apply
these findings; preserve its newly compiled cache outputs.

The integrated UI review requests sequence assertions on the new FilterListService
async callback targets and current delivery-status documentation. Add its sequence
checker, retain existing lifetime guards, and distinguish implemented transport/UI
from pending feed publication and APK acceptance. Include the full shared-factory
type in AdBlockService's public header so callers using the default refcounted
argument do not depend on transitive includes. All 17 focused host tests now pass.

Delivery acceptance on `95b26f1ba` passes automatic HTTPS staging, repeated
manual check, throttled-network failure/retry, Back/reopen while
checking, Cancel-first restart, all 13 normal-tab IDs/URLs restored, signed
DAT identity transition, and real blocking before/after restart. Add a focused
D-pad replay for update entry, manual completion and Back focus restoration.
Start from the existing two-list Content Filters fixture with cookie blocking
On; do not toggle lists, restart the browser or require a particular feed
version. Keep signature/timing/rejection checks in the native tests and
record exact runtime status separately. Update delivery docs and checklist
with this evidence, retaining full-disconnection, fresh-install and hardware
limits. No additional APK build is needed for test/documentation-only changes.

Pause after committing and pushing the accepted delivery slice at the user's
request to close out for bed; defer Chromecast work until the user resumes it.
Next software slice: remove the remaining Android Shields/filter-list local
analytics producers, first establishing a focused histogram regression. Keep
full traffic audit, YouTube video-ad reproduction, focus/state edge cases and
broader video/lifecycle tests open. No hardware installation is part of this
closeout. Naming and independent release-signing/backup decisions remain open.

### Finish emulator privacy, video and reliability; then stop task processes

The user resumes software checks while explicitly deferring Chromecast work.
The installed build's native histograms still contain Shields filter-list/cookie
usage, Brave News usage, Sync status and bandwidth-savings reporting. First
exclude Android Shields reporting at its shared entry points, including list
observer/timer startup and cookie-list recording. Keep settings, filter loading,
security services and desktop behavior intact. Preserve registered legacy prefs
for compatibility, but do not update analytics counters. Adapt Android unit
expectations and verify real before/after native histograms plus list toggles
and request-level blocking on the cached APK. Then close the observed News,
Sync and savings reporting entry points after checking their consumers; audit
startup/navigation/search traffic with default-redacted NetLog, separating
website requests from browser reporting and local performance diagnostics.

For YouTube, sample signed-out ordinary videos through startup and later
playback positions, record visible ad/player state and network/media errors,
and repeat actual native playback/fullscreen controls. Report the reproduction
limit if video ads do not appear; never claim universal prevention from a sample.
Run a sustained mixed emulator session with memory/crash/ANR evidence, adaptive
playback where available, app switching, Back recovery and process recreation.
Fix demonstrated regressions, retain hardware-specific acceptance as pending.
Review only each latest implementation commit and push source before root.
Finally restore diagnostic flags/network/IME settings and stop all identifiable
task-owned builds, emulator, fixture servers, captures and helper sessions.
Preserve caches, profiles and artifacts; do not stop T3 or unrelated user services.

The first privacy build stops in Sync P3A with Chromium's unreachable-code
warning: constant Android early returns leave the reporting body unguarded.
Use explicit compile-time branches around those bodies so the compiler discards
Android reporting while retaining desktop code. Apply this consistently to the
new unconditional Android guards. Latest review also finds the Android Sync
service history-reporting test still expects samples; keep that reporting-only
case on desktop and add an Android no-query/no-sample assertion through the
service entry point. Rebuild from cache; the failed attempt is not acceptance.

The next compiler pass identifies the two direct Sync-status histogram guards
that still use ordinary constant conditions. Make those explicit compile-time
branches too, nesting the real setup-state condition inside the startup branch.
This is the same Android recording exclusion, with no functional Sync change.


Closeout evidence on `5c9a36c74`: cached blocking APK build, all five changed
Android native test-source compiles, native analytics before/after, normal
blocking, search traffic, three signed-out YouTube samples, adaptive stream
recovery, Home/restart, and native panel/settings replays pass within the
recorded limits. Final sampled memory/crash evidence and task-process cleanup
are recorded in device-tests.md. No Chromecast work is included.

The next UI slice still needs to reproduce the intermittent cold/private-home
focus race and refresh the main panel's loading action while it remains open.
Full disconnection, broader permissions/policy/private-data edge cases and
release identity/signing remain separate checklist work; do not call the whole
MVP finished from this emulator closeout. The user requested stopping all
task-owned processes after these checks; preserve profiles, artifacts and caches.


### Resume Chromecast acceptance with the tested source

The user enables wireless debugging and confirms the builder is already paired.
Discover its current connection endpoint without re-pairing or clearing device
data. Verify model, supported ABI, storage, installed package and signing
compatibility before the preserving update. Keep both emulators stopped.

Build committed source `5c9a36c74` in the retained `android_Static_arm` output
using Nix, four local workers, MemoryHigh 18 GiB, MemoryMax 22 GiB, no build
swap, blocking Android analysis, `symbol_level=0` and
`debuggable_apks=false`. Preserve the previous APK and all caches. Verify
signature, ARM ABI, package/version and non-debuggable manifest; save the
artifact and provenance outside Git. Install as an update when space permits.

Validate direct launch, home/settings/keyboard/cursor focus with the physical
remote, then actual blocking and YouTube playback, fullscreen/Back and sustained
memory/crash/ANR behavior. Distinguish injected input from user-confirmed remote
results. Diagnose reproduced regressions before source changes, review only the
latest implementation commit, and commit evidence incrementally to master.
Stop task-owned helpers/builds after testing; retain caches/profiles. Public
release signing and final product naming remain outside this development APK.


Wireless discovery finds the already-paired Chromecast and ADB connects without
a new pairing code. Active Android user 0 has the browser marked uninstalled;
user 10 retains the installed development package. Install for active user 0
with replacement enabled, preserving other-user data. This cannot establish
an upgrade-preserved browser profile for user 0. Available storage is
1,056,600 KiB; recheck against the finished APK before installation.

The local device daemon was stopped during the requested cleanup, leaving the
host config pointing at its old port. Restarting that versioned helper and
refreshing its local connection config from its daemon state restores pinned
agent-device snapshots. No pairing key or auth token is written to repo/logs.

Hardware follow-up checklist after fresh-install acceptance:

- [x] Physical remote enters example.com and the page remains responsive.
- [x] Visible page cursor delivers exactly one click for a held OK press.
- [x] Native site-protection off/on changes actual fixture request delivery.
- [x] Complete bounded hardware playback/fullscreen/Back and memory observations
  (21 samples over 605 seconds; limits recorded in device-tests.md).
- [ ] Reproduce the first-launch TvLauncher background-start rejection with a
  repeatable non-destructive harness before changing the first-run handoff.
- [ ] Remove the fresh-profile Brave Shields education bubble in TV mode;
  verify that protection still works and required attribution remains visible.
- [ ] Include the media-session label in the remaining neutral-identity audit.

Keep this acceptance run on the verified APK. Plan and test any resulting
source fix separately with the existing cached build limits and latest-only
implementation review; do not erase the user's newly created hardware profile
to obtain a first-run reproduction.

### Fresh-launch and branding follow-up (10 October)

The user authorizes this next implementation slice. Use the existing clean TV
emulator and a new isolated Android test user to reproduce a genuine first
launch without resetting either preserved emulator profile or the Chromecast.
Record a failing launcher/home assertion and background-start logs before
changing the handoff. Compare first and second launches on the same profile,
then test a fresh profile again after the fix. Keep launch intent data and
upstream first-run/profile initialization intact.

Remove the observed TV Shields education promotion at its presentation entry
point, retaining protection, notices and attribution. Audit the runtime media
label separately and use the neutral working browser label without changing
application ID, signing or user data. Scope each change after inspecting its
callers and existing tests. Build cached x64 through Nix with four workers,
18/22 GiB thresholds and no swap; run blocking analysis and focused regressions.
Review only the latest implementation commit, push source before root, and
record exact build/runtime evidence. Extend the YouTube sample to later
positions and cold restarts, separating website ad observations from local
fixture blocking. Stop the emulator and task helpers at closeout; preserve
all profiles and build outputs.

Baseline: the retained TV system image rejects root and has a two-user limit,
so an isolated `brave_tv_launch_followup_api36` AVD preserves both old AVDs.
Both fresh users launch directly on Android 16 (direct launcher intent and
agent-device launch); the Android-14 rejection is not reproduced there. Keep
that issue open rather than infer a validated handoff correction. The Shields
fixture does reproduce the branded modal bubble on the new emulator.

First implementation: skip `checkForTooltip` in television mode using the
toolbar's existing mode predicate; leave blocking and phone behavior intact.
Use a television-qualified `app_name` resource alias to the existing neutral
prototype label, covering media-session/system labels without changing IDs or
signing. Give the TV launcher alias a neutral browser-window vector icon,
consistent with its existing banner. Verify packaged resources, preserved
attribution, a fresh tooltip-eligible profile, actual blocking and media-session
label after the cached build. No final product name is selected.

Build r50 stops on lint's unused-resource warning for the new launcher icon.
The generated merged manifest explicitly references it on TvLauncher; the
existing banner already has a resource-specific exception for the same alias
analysis limitation. Add the adjacent icon-only exception, retain blocking
analysis, then rerun from cache and verify the packaged manifest/icon.

The user authorizes isolated Chromecast profile testing. User 11 reaches the
browser on its first completed first-run handoff after Google TV setup stops
intercepting launch. User 12's attempt occurs while the device is asleep;
Android reports TOP_SLEEPING and blocks opening the first-run activity. This is
not the original blocked completion PendingIntent. The user reports the TV
turning off; power diagnostics report idle timeout. Restore user 0, wake the
device and stop test users 11/12 without deleting either. Pause hardware tests
and retain the original first-launch issue as intermittent/unresolved; do not
make an unverified handoff change. Continue branding and YouTube checks on the
emulator. Build r51 passes with blocking analysis in 3m58s.

### Restored home startup regression

The final home replay fails after loading Home into a tab with earlier page
history: cold startup opens Browser controls over `chrome-native://newtab/`
instead of exposing the address-focused native home. Reproduce with a direct
launcher intent as well as the existing `tests/device/tv-home.ad` replay to
exclude helper behavior. Check startup classification before view creation,
restored dialog state, then automation as separate hypotheses. If the view
type is transient during tab restore, classify the initial home by its new-tab
URL using the existing URL utility; retain auto-controls for real webpages.
Keep the correction TV-only and small, run the formerly failing home replay
and a webpage-restart control, then cached Nix build and latest-only review.
The Android 14 first-run completion issue is separate and remains open.

The restored-home correction passes its cached build and formerly failing
20-step replay; a webpage-restart control still opens Browser controls.
The user now prioritizes intermittent issues and defers broader acceptance,
publication automation and release preparation. Resume the Android 14
investigation in the isolated test profile, checking awake/unlocked/setup
state before invoking first run so idle sleep cannot masquerade as a handoff
failure. Preserve original users and restore user 0 after testing. Do not
change the completion handoff without an actual failing loop. The next feature
is not specified yet; ask for its scope while completing independent work.

Outcome: the user will discuss the next feature later. Ten valid fresh
Chromecast initializations pass, including five repeated resets confined to
the disposable test user's browser data and three actual agent launch/inspect
sequences. The earlier completion rejection remains unreproduced, so retain
it as an open observation requiring contemporaneous logs if it recurs. The
restored-home startup issue is verified fixed; broad release/acceptance tasks
remain user-deferred. Restore the original hardware profile/timeouts and stop
all task-owned test processes before closeout.

Latest-commit review requires acknowledgement of selection as well as text:
compare the expected caret/range (composition places it at the composed text's
end), and add a same-text/conflicting-selection regression. Strengthen the
background probe to check Home delivery, observe foreground departure and
confirm listener closure, in addition to preserving the process. These changes
remain in the editable source until the running r9 build completes; never
advance its checkout while compiling.

### Phone remote slice 4 — runtime acceptance and bounded soak

After the corrected APK, extend the read-only renderer probe across native
composition, selection, textarea/contenteditable and password/focus rejection.
Exercise navigation/tabs, modal/private arbitration, duplicate/stale commands,
short connectivity loss and background/network teardown through the real
paired client. Start a bounded 30-minute approved session while other foreground
checks run; sample whole-browser process memory/CPU and command round trips
without logging tokens, URLs or field content. Reuse the existing harmless
fixtures and physical D-pad uinput regression. Record unavailable/current-browser
coverage honestly; do not infer Safari or hardware acceptance from emulators.

Runtime native editing passes on a026dafd3. Before final reliability acceptance,
add a deterministic fast-drag-during-poll check: the release path must not discard
the final coalesced movement just because a state poll is in flight. Retain only
that bounded movement until delivery; existing context/disconnect cancellation
still clears it. CPU sampling must use live process counters because Android's
cpuinfo service reports a stale boot-time interval on this image.

Review of retained motion identifies a dependent-tap ordering race: a tap waiting
on the same poll can overtake the movement timer. Require a click to drain the
pending movement first, then revalidate connection/context before delivery.
Keep at most the existing coalesced motion and one waiting poll action; never
replay after disconnect. Add held-poll drag-then-tap ordering assertions. Return
actual command acceptance from the client helper so a rejected move cannot
authorize the following click.

### Phone home D-pad correction

With the experimental home row visible, Address → Down still jumps to Project
and source: the old explicit focus links bypass the new phone action. Reproduce
with a native hierarchy/focus assertion, then route the three main cards down
to the phone row and the footer up through it. Phone Up returns to Address;
Phone Down reaches the source link. Preserve the original links when the feature
is unavailable. Verify both directions and entry from Browser controls with
explicitly targeted emulator key events; include this in the final cached build.

### Phone composition event correction

Chromium 155 reports that fresh textareas have no oncompositionstart/end event
properties; assignments create inert own properties. The newer-phone probe
records composition events while the client's composing flag stays false,
allowing renderer state to replace the phone's live composition. Register actual
compositionstart/end listeners and require live client composition plus a
composing protocol edit in the host regression. Re-run native composition on
the phone. Earlier TV composition-event observations alone are insufficient
acceptance; stop the preliminary soak and restart it after this correction.

### Native phone composition fixture

The shipped companion now receives real composition events, but Android's stock
IME immediately cancels CDP-injected composition even in a bare textarea outside
the remote. Replace that invalid device stimulus with a minimal test-only Android
InputMethodService on the phone emulator. Its visible buttons send fixed Japanese
composition/commit through the phone's actual InputConnection. No broadcast,
network or product endpoint is added. Restore Gboard and uninstall the fixture
after acceptance. Keep the host CDP regression, where that stimulus is valid.

### Exact protocol identifiers

A real authenticated request with v=1.5 is accepted because JSONObject.getInt
truncates it. Require numeric, nonnegative, JavaScript-safe integers for protocol
version, sequence, document and editable identities before comparing them. Reject
strings, fractions, nonfinite and out-of-range values through one small helper
in the existing session policy, covered by its host self-check. Keep the running
soak on d23276267; this boundary-only correction requires a subsequent bounded
build and targeted live rejection/native-input checks, not a repeated performance
run or mutation of the checkout while it is running.

The latest review finds a false-pass gap in the reconnect probe: it watched a
button counter without proving the pointer was over it. Add a successful remote
click as a positive control before taking the phone offline; rerun after the
soak. Also block all off-origin companion requests during QR pairing and require
the three bundled assets, making the no-external-host assertion executable.

The first complete 30-minute run retains the session but fails the latency
sample-count assertion: a fixed ten-second sample can repeatedly collide with
the 500 ms state poll. Wait briefly for an eligible foreground slot before
sampling, and persist each minute's measurements before final assertions so a
failed run still leaves its evidence. A separate 120-command run measures latency;
repeat the corrected soak alongside final APK acceptance rather than labeling
the failed probe a pass.

A subsequent fresh invitation is visible but its screenshot fails QR decoding.
QR-only/TRY_HARDER scanning and cropping do not fix it. Sampling the exact module
centers recovers the valid payload; re-encoding that payload at 320 pixels and
bilinearly scaling to the 360-pixel TV slot reproduces failure, while direct
360-pixel encoding passes. Generate the bitmap at the slot's final physical size
and suppress bitmap density/view scaling. Keep the original decoder unchanged;
require fresh full-screen QR captures to pass after packaging the correction.

Outcome: source `7f2ad4c6c` passes blocking x64 build checks, ten fresh full-screen
QR decodes and the uninterrupted 30-minute session (181 commands, p95 69.8 ms).
Native input/control, security-boundary, reconnect and lifecycle evidence is in
`phone-remote-evidence.md`. The authorized emulator scope is complete as a
debug-only HTTP experiment. Release transport, real phones/Safari and physical
TV acceptance remain open; the Chromecast was untouched. Restore emulator
settings and stop only task-owned emulators/fixtures, preserving all caches.

### Authorized Chromecast phone-remote test

The user now authorizes installation and a short physical-TV test while watching.
Preserve the active Android/browser profile and use the cached optimized ARM
configuration with debuggable_apks=false, which avoids the earlier startup ANRs.
Replace the experiment's ART-debuggable gate with Chromium's non-official,
local-development-channel gate; retain the explicit process switch, unencrypted
warning, TV opt-in and pairing approval. Official and named release channels
remain excluded. Reuse Chromium's debug-app command-line mechanism to enable
this development-only test without enabling the APK's debugger flag. Build with
the existing limits, verify signing/ABI, update in place, and exercise harmless
pairing/native controls. Do not reopen first-run investigations or reset profiles.

The latest-commit standards review found one stale traffic-annotation gate
description. Update it to match the non-official local-channel restriction
before the optimized build; the spec review found no issues.

### Authorized fresh Chromecast installation and smoke test

After the in-place update failed for storage, the user explicitly confirmed
uninstalling Brave from every Chromecast profile, deleting its data, and
installing the new APK. That authorization supersedes profile preservation for
this installation only; keep Android profiles and unrelated apps intact.
Use the already verified ARM artifact, verify package removal across users,
install for the active user, and run the bounded pairing/control smoke test.
Record real LAN remote traffic separately from diagnostic fixture forwarding.
Leave the experiment available for the user's phone test with our controller
revoked and task-owned test services stopped.

### Phone remote regression fixes — emulator first

The user reports misleading QR approval UI, remote pause during YouTube
fullscreen, a missing cursor after fullscreen exit, a trapped empty tab switcher,
and slow YouTube loading. Do not operate the Chromecast during this work.
Reproduce each interaction with a paired emulator and deterministic fullscreen
fixture, add failing probes at the actual UI/native integration seams, then
implement focused corrections without relaxing private/modal/security guards.
Measure fixture and bounded YouTube loading with remote polling on/off before
attributing performance to the feature. The installed ARM APK is optimized and
non-debuggable; emulator timings cannot establish physical TV performance.
Plan follow-up slices here before source changes, build with retained x64 cache
and existing resource limits, review only latest commits, and leave hardware
verification deferred until emulator results are complete.

Pairing slice: the host regression fails because the QR token is accepted but
`pairForm` remains visible during approval. Hide the manual pairing section while
its token is pending, show an explicit TV-approval section, restore manual entry
on terminal failure, and hide approval on connection. Exercise pending, approved
and rejected/expired states with the real bundled JavaScript before packaging.

Review correction for pairing: real TV cancellation/expiry closes the listener
and may return an empty object, unlike the initial synthetic JSON-error test.
Add the actual failed-poll regression before changing code. Treat an empty state
response as revoked; if the connection fails before an approval epoch exists,
return to fresh-invitation guidance. Preserve reconnect for approved sessions.

Native recovery slice: the paired emulator reproduces final-tab closure entering
an unusable native tab switcher. Observe completed tab removals centrally in the
TV controller, post recovery outside the model mutation, and create normal TV
home only when the normal model is still selected and empty in the foreground.
Recheck on focus restoration for existing empty sessions; unregister at destroy.
Test both phone closure and the native Close tab action. Preserve incognito and
modal input boundaries. A second red probe shows Back opens controls while a
renderer fullscreen document remains fullscreen; use WebContents' authoritative
fullscreen state for exit and phone Back availability, excluding only the
fullscreen handler from the native-UI input guard. Test native and phone Back,
video/container fullscreen, cursor pixels, and native/private pause regressions.

Final recovery follow-up: actual emulator native-panel pause/resume reports one
normal tab but renders zero phone tab rows. The host regression reproduces this
with unchanged tab IDs. Pausing clears rows while retaining the render cache;
clear that cache too so the first resumed state rebuilds controls. Keep paused
metadata redaction unchanged. Repackage the bundled asset and verify the actual
phone after native-panel resume before closeout.

Recovery outcome: source `17a312c16` packages all follow-up fixes. QR approval,
native-panel pause/resume tab rows, native/phone fullscreen Back with cursor
pixels, and final-tab recovery pass on the final x64 APK. Five public YouTube
cursor cycles passed on its native-code predecessor. The bounded loading sample
does not establish a polling bottleneck or explain Chromecast latency. Exact
builds, tests and remaining hardware limitations are in phone-remote evidence.
No Chromecast operation or ARM build was performed in this follow-up.


### Grouped final-tab confirmation focus

The user's Chromecast exposes a case missing from final-tab coverage: the
native “Close tab and delete group?” dialog. Directional keys cannot establish
focus; a diagnostic Tab key seeds the checkbox, but Down focuses the inert
spinner wrapper instead of its button. Preserve this confirmation and its
Cancel choice. Reproduce with a disposable grouped tab on the emulator, check
initial focus and directional access to actual Cancel/Delete actions, then fix
the shared TV modal focus adapter. Check whether its posted focus pass precedes
layout and ensure custom button containers do not intercept focus. Cover Cancel,
Delete, empty-home recovery, and ordinary site dialogs. Phone control must remain
paused while a native confirmation is showing. Build/test x64 first, then update
the authorized Chromecast with the verified optimized ARM build; retain caches.

Grouped-dialog outcome: source `5829c55f0` passes the real grouped-tab regression
on the x64 emulator and optimized Chromecast APK with injected D-pad/OK. Cancel
preserves the original group; Delete returns to usable TV home. Ordinary site
dialogs also pass on the emulator. Root test review strengthened the Cancel
postcondition to reject replacement-home false passes. Evidence records the
authorized storage fallback/fresh installation and exact hardware limitations.
