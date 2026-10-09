# Android TV MVP engineering plan

## Objective

Implement [the MVP checklist](mvp-todo.md) by adapting Brave's Android browser. Preserve Chromium, Shields, profiles and browser security. Deliver a signed, sideloadable build after the checklist's device and usability criteria pass.

Write or update this engineering plan before each implementation stage. Keep incomplete implementation and unverified acceptance criteria distinct.

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
