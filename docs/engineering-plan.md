# Android TV MVP engineering plan

## Objective

Implement [the MVP checklist](mvp-todo.md) by adapting Brave's Android browser. Preserve Chromium, Shields, profiles and browser security. Deliver a signed, sideloadable build after the checklist's device and usability criteria pass.

Write or update this engineering plan before each implementation stage. Keep incomplete implementation and unverified acceptance criteria distinct.

## Starting point

- Review baseline: project commit `321c048243a08a823d2d0305466f6b2a213a4f26`. Work on local `master` and make incremental commits, as requested; no remote push is configured.
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

No TV changes have been applied to the external source tree. These are integration candidates, not verified runtime behavior.

## Stage 3 Complete the MVP after the feasibility gate

Adapt existing tabs, bookmarks, history, private sessions and per-site Shields controls to the validated TV interaction design. Validate Shields resources and updates, ordinary web video, lifecycle recovery and the performance budgets established by the prototype. Disable optional product surfaces through supported controls without silently weakening protections.

Create an independent release identity, user-controlled signing setup, documented installation/update path, source/license package and repeatable release build. Rehearse an upstream update before distributing to testers. Do not invent successful device results, service credentials or tester acceptance.

**Exit:** all MVP acceptance criteria pass on both target TVs and the signed artifact can be installed and updated by a tester.

## Review and delivery

Review the work against the original MVP checklist and this plan using separate Standards and Spec reviews. Resolve actionable code findings, keep unfulfilled requirements visible, run final verification and commit the work on the current branch. Do not publish an APK or contact testers until a concrete release and destination are available.

## Risks and fallback rules

- Source synchronization and native builds are large; record resumable progress and do not reset or discard another working tree to recover.
- Package names, signing and profile migration can affect user data. Use a distinct test identity and validate upgrade behavior before distribution.
- Browser input adaptations can interfere with forms, dialogs and media. Keep changes localized and preserve a reliable escape path.
- Missing build privileges, inaccessible upstream artifacts, disabled device access and absent TVs are external dependencies. Continue independent work where possible and report the exact blocked criteria.
- Never freeze on an old unsupported Chromium release, remove the sandbox or substitute a generic WebView to make the checklist appear complete.
