# Android TV browser MVP todo list

Build a usable Android TV browser by adapting Brave’s existing Android application and retaining its Chromium engine and Shields integration. The first release is a signed, sideloadable APK for a small tester group.

Background: [feasibility research](feasibility.html). Implementation is in progress; unchecked items include partial work and unverified device acceptance. See the [build log](build.md) and [proposed device/site matrix](device-tests.md).

## Scope and completion criteria

Target Android TV and Google TV devices running Android 10 or newer, subject to the selected Brave release’s requirements. Validate on two physical devices: one modest device and one faster device. A standard D-pad, OK and Back remote must be enough for all core tasks; a keyboard, mouse or phone is optional.

The MVP includes URL/search entry, webpage interaction, a small tab switcher, bookmarks, history, private browsing, per-site Shields controls and ordinary web video playback. Reuse existing browser functionality wherever possible.

The MVP is complete when all phase acceptance criteria below pass, the agreed must-work website flows pass on both devices, and a tester can install and update the signed build without developer assistance.

Out of scope: Apple TV, Fire TV/Vega support, older Android versions, a replacement browser engine, extensions, Brave Sync/accounts, Wallet, Rewards, VPN, Leo, News, a phone companion, a new download manager, guaranteed DRM-service compatibility and guaranteed 4K/HDR playback. Ads in other installed apps are outside the browser’s scope.

## 1 Establish the baseline

- [ ] Select the two target TVs and record model, Android/API version, supported ABIs, RAM, display resolution and remote buttons.
- [ ] Create a website test list of approximately 20 sites, including the sites we actually want to use. Define a specific task for each, such as search, sign in, submit a form, browse an embedded frame or play a video. Mark must-work flows separately from exploratory coverage.
- [ ] Sideload the current official Brave APK for each device’s ABI. Record launch behavior, onboarding blockers, remote limitations, video behavior and crashes. Use an external input device only to investigate the baseline.
- [ ] Check the available Linux builder’s architecture, memory, free SSD space and toolchain. Follow the selected release’s build instructions and provision missing resources.
- [x] Pin a supported Brave stable tag and its matching Chromium revision. Record the baseline and a minimal downstream branching/patch strategy; keep large upstream checkouts and build outputs out of this planning repository. See `upstream.json` and [the engineering plan](engineering-plan.md).
- [x] Build an unmodified source baseline on the Linux builder. Record setup/build commands, duration, artifact size, checksum and provenance in `docs/build.md`. The first x64 Debug baseline completed on 9 October 2026; it is an emulator-ABI build.
- [ ] Build for the selected physical-device ABIs and install the source baseline on both devices. Document installation commands and results in `docs/build.md` and `docs/device-tests.md`.

**Acceptance:** a clean checkout can reproduce the documented source build, it launches on both devices, and `docs/device-tests.md` records the stock/source baseline and initial blockers. This means repeatable builds, not a claim of byte-for-byte reproducibility.

## 2 Prove remote interaction before committing to the full MVP

Timebox this phase and the initial setup to roughly 1–2 weeks, then reassess scope and effort from the results.

- [ ] Add the TV launcher entry, initial banner/icon and appropriate hardware declarations. Verify the generated manifest and actual launcher behavior.
- [ ] Make first run completable with a remote, including search-engine selection and any unavoidable permission or consent dialogs.
- [ ] Document a button map using D-pad, OK and Back. Keep media keys optional and provide a reliable route from web content back to browser controls without requiring a Menu button.
- [ ] Prototype visible directional focus for browser controls and a virtual pointer for webpages. Keep pointer movement, clicking and scrolling within the browser’s own input handling.
- [ ] Make page scrolling and nested scrolling usable. Show the current interaction mode and restore focus predictably when switching between the page and browser controls.
- [ ] Complete a small end-to-end flow using only the remote: enter a URL, follow a link, fill a form, scroll, open another tab, play fullscreen video and return to browser controls.
- [ ] Confirm Shields blocks known test resources and that a filter/resource update can be fetched in our build. Identify any service configuration blockers early.
- [ ] Record release-build startup, navigation, RAM and basic video behavior on the modest device. Set explicit startup and memory budgets for the MVP from this baseline.

**Acceptance:** the end-to-end flow works on both devices without a mouse or focus trap, blocking and resource updates work, and performance appears achievable within the recorded budgets. Document the decision in `docs/prototype-results.md`. Resolve fundamental input, build or performance blockers before expanding the feature set.

## 3 Build the core TV browsing experience

- [ ] Create a readable landscape home screen with URL/search entry and bookmark shortcuts. Keep text, focus indicators and controls legible at normal TV viewing distance and clear of clipped screen edges.
- [ ] Adapt the browser toolbar for Back, Forward, Reload/Stop, address editing, tabs and Shields. Make controls accessible from both normal browsing and pointer mode.
- [ ] Support the system TV keyboard for addresses and webpage fields, including submitting, correcting text and dismissing the keyboard. Verify available system dictation without making it mandatory.
- [ ] Implement predictable Back handling for dialogs, keyboard, fullscreen video, webpage history and leaving the app. Ensure users can always recover from a page that captures input.
- [ ] Adapt the existing tab model into a simple remote-accessible switcher with new, switch and close actions. Start with a small active-tab limit and restore discarded normal tabs safely.
- [ ] Add remote-accessible bookmark add/open/remove actions and history open/delete/clear actions, using Brave’s existing storage.
- [ ] Adapt existing private browsing and clear-browsing-data controls. Verify private URLs do not appear in normal history or session restoration after the private session ends.
- [ ] Handle browser errors, certificate warnings, site permissions, JavaScript dialogs, popups, new windows and external-app links with usable focus and an escape path. Never bypass certificate warnings to make a site work.
- [ ] Defer optional Brave features using supported build/runtime controls where practical. Verify hidden features do not still introduce onboarding prompts or unwanted background services.

**Acceptance:** every core browser action is discoverable and operable with the standard remote; tabs and bookmarks survive normal restart; private-session data remains separate; supported flows do not leave users in unreachable mobile-only screens.

## 4 Preserve and validate Shields

- [ ] Keep Brave’s native Shields enforcement and privacy defaults intact. Avoid replacing them with a generic WebView interceptor.
- [ ] Provide a simple per-site Shields on/off control and reload behavior. Make the current state visible and persist site exceptions using Brave’s existing settings.
- [ ] Validate network blocking, cosmetic filtering and scriptlet behavior with controlled fixtures and representative websites. Compare against the unmodified Brave baseline; do not use the blocked-request counter as the only evidence.
- [ ] Verify filter/resource availability on clean install, subsequent updates, app restart, temporary loss of network and recovery. Record initial-download behavior and confirm cached resources remain usable offline.
- [ ] Audit filter/component endpoints, Safe Browsing, search integrations and telemetry. Configure required services legitimately, document the policy for optional traffic and avoid treating dummy build credentials as functioning services.
- [ ] Check that turning Shields off restores a deliberately blocked test resource and that turning it back on restores protection. Record site breakages and useful per-site workarounds.

**Acceptance:** the fork demonstrates the expected blocking behavior, site exceptions work, filter resources refresh, and no required protection silently depends on missing credentials or unavailable services.

## 5 Make web video and device lifecycle reliable

- [ ] Test ordinary HTML5 video on the selected sites, including an embedded player and at least one adaptive stream. Target smooth 1080p on the selected hardware before considering higher resolutions.
- [ ] Make play/pause, seek, fullscreen entry/exit and available captions usable with the remote. Check focus and pointer behavior around player overlays.
- [ ] Verify hardware decoding where expected, audio focus, optional media-button handling and appropriate screensaver behavior during playback.
- [ ] Test Home/Back, app switching, TV sleep/wake, network interruption and process recreation. Restore the browser to a usable state without stuck audio, frozen video or lost controls.
- [ ] Run a 30-minute browsing/video session on each device. Record crashes, memory growth, dropped frames, A/V sync issues and whether performance budgets are met.
- [ ] Record DRM-site results separately, including Widevine prompts and actual playback outcomes. Keep unsupported services and resolution limits explicit in the compatibility notes.

**Acceptance:** must-work ordinary video flows pass on both devices, sustained playback is stable, and lifecycle transitions recover cleanly. DRM-service success is not an implicit requirement or promise.

## 6 Prepare a maintainable test release

- [ ] Choose an independent app name, icon and application ID for distribution. Preserve required upstream attribution and avoid implying an official Brave release.
- [ ] Produce release APKs for the selected devices’ ABIs. Keep production signing material out of the repository and establish secure backup/access for it.
- [ ] Automate the documented build and artifact generation on the Linux builder. Record Brave/Chromium revisions, version codes and checksums with each artifact.
- [ ] Add focused regression checks for our remote-input, Back/focus and Shields-settings changes. Reuse upstream coverage where practical; retain a physical-device smoke test for input and media behavior.
- [ ] Package required licenses/notices and provide recipients with the corresponding covered source and modifications.
- [ ] Write tester installation, update and recovery instructions in `docs/testing.md`, plus known limitations and a concise changelog.
- [ ] Verify an upgrade from an earlier signed test build preserves normal bookmarks, history, settings and tabs while respecting private-session behavior.
- [ ] Define the sideloaded build’s update path, who owns release delivery and how testers receive security updates. Make releases available from a trusted source with verifiable artifacts.
- [ ] Rehearse an upstream update to a newer supported Brave revision, rebuild and run the TV smoke test. Record conflicts, regressions and the time required.
- [ ] Assign ongoing responsibility for monitoring upstream releases and fast-tracking security fixes. Use Brave’s [release schedule](https://github.com/brave/brave-browser/wiki/Brave-Release-Schedule) to plan maintenance rather than treating the fork as a one-time build.

**Acceptance:** a versioned, signed APK and corresponding source are ready for testers; installation and upgrade work; build provenance is recorded; and the upstream-update rehearsal demonstrates a sustainable maintenance path.

## 7 Validate the MVP with testers

- [ ] Run the complete website/task matrix on both physical devices with only the standard remote. Record build revision, Shields state, expected outcome, observed result and reproduction steps for each failure.
- [ ] Recheck launch and RAM budgets on release builds, including the active-tab limit, tab restoration and a long browsing session.
- [ ] Check TV display scaling, focus visibility, text readability and basic accessibility on the supported configurations.
- [ ] Have at least one person unfamiliar with the app install it and complete search, browsing, bookmarks, tab switching, a Shields override and video playback without developer guidance.
- [ ] Fix crashes, data loss, focus traps, broken must-work flows and failures that prevent the user from leaving a screen. Document lower-priority compatibility gaps without silently weakening protection.
- [ ] Publish the MVP to the agreed tester group with installation instructions, compatibility notes, source access, update expectations and a feedback channel.

**Acceptance:** all agreed must-work flows pass on both devices, no known release-blocking issues remain, and an unfamiliar tester completes the core tasks independently.

## After the sideloaded MVP

These tasks are separate from MVP completion.

- [ ] Recheck current Google Play TV requirements, then address required target SDK, 32/64-bit architecture coverage, 16 KB page sizes, signing and app-bundle packaging. Start from the [TV quality requirements](https://developer.android.com/develop/adaptive-apps/quality-guidelines/tv-app-quality).
- [ ] Prepare the store listing, TV screenshots/banner, privacy disclosures, reviewer instructions and any required test access; complete the TV review process.
- [ ] Expand the supported-device and website matrix based on tester evidence.
- [ ] Evaluate phone-to-TV URL entry, enhanced spatial navigation, voice shortcuts and broader media compatibility as separate improvements.
- [ ] Revisit other platforms only after the Android release and update process are sustainable.

## Suggested next task

Start with phase 1: inventory the available TVs and Linux builder, select the initial website flows, and reproduce an unmodified Brave Android build. Use that evidence to choose the smallest viable input adaptation.
