# Android TV MVP engineering plan

## Objective

Implement [the MVP checklist](mvp-todo.md) by adapting Brave's Android browser. Preserve Chromium, Shields, profiles and browser security. Deliver a signed, sideloadable build after the checklist's device and usability criteria pass.

Write or update this engineering plan before each implementation stage. Keep incomplete implementation and unverified acceptance criteria distinct.

## Starting point

- Initial project commit: `321c048243a08a823d2d0305466f6b2a213a4f26`. The user subsequently requested review of only the latest implementation commit; use that commit's parent as the comparison point and record both IDs. Work on local `master` and make incremental commits, as requested; no remote push is configured.
- This repository contains the project README, icon, feasibility report and MVP checklist. There is no Android application or build/test system yet.
- Initial upstream baseline: Brave `v1.97.56`, commit `b01cdf43be4b4d5559bf7e58229e666e24454f50`, whose package configuration selects Chromium `155.0.8059.40`.
- Builder: Ubuntu 25.10 x86-64, Ryzen 9 7900X (24 threads), approximately 30 GiB RAM and 580 GiB available disk. Node 22 is on the host PATH; the selected Brave release documents Node 24+. Existing Android SDK tools were discovered under `~/Android/Sdk` but are not on PATH.
- Manage development/build dependencies through a pinned `flake.nix` and `flake.lock`, with `.envrc` loading the development shell. Avoid host package installs and global Node changes. Preserve the exact compiler, SDK and other artifacts selected by Chromium/Brave DEPS when upstream requires those versions; document this boundary rather than replacing them with arbitrary Nixpkgs versions.
- T3 device access is disabled. No physical TVs or priority websites have been selected. Source builds and automated input tests can proceed; physical-device acceptance cannot be claimed from them.

## Design and change surface

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
