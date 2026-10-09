# TV-native development checklist

Execution order: plan the slice in [engineering-plan.md](engineering-plan.md), implement direct source changes, run focused checks and the cached emulator build, review only the latest implementation commit, then commit evidence and push `master`. Record failed or partial checks honestly. Return to the Chromecast after emulator flows are usable.

## Source fork

- [x] Create the Brave source fork with upstream history and check it into `brave/` as a pinned submodule.
- [x] Commit the tested prototype changes as ordinary source files; retire the TV patch artifact/workflow.
- [x] Make setup and JVM checks use real source; preserve dirty/divergent checkout safety. Fourteen tests, strict mypy and Nix flake checks pass.
- [x] Advance the existing build checkout without deleting dependencies or output caches. Original source edits remain in a named Git stash.
- [x] Build/install the unchanged fork baseline on the emulator and rerun input checks. Build 4m08s; cursor visibility and one-click checks pass.

## Shields and YouTube

- [ ] Reproduce the reported video-ad symptom or record the exact reproduction limit.
- [x] Check filter, cosmetic and scriptlet resources on the current emulator and after restart. Clean-profile coverage remains open.
- [x] Demonstrate network blocking and a Shields-off/on control with observable resource results.
- [ ] Verify resource updates and identify any development-build service configuration blocker.
- [ ] Fix demonstrated failures and rerun the original check, then sample YouTube playback.
- [x] Make per-site protection state and exceptions readable and remote-accessible. Standard/aggressive mode persistence still needs explicit coverage.

## TV onboarding and controls (explicit user priority)

- [ ] Redesign every first-run consent/setup screen for landscape TV and remote input, preserving consent choices and behavior.
- [ ] Give the first meaningful action obvious initial focus on every screen; distinguish focused, unfocused and disabled controls with high-contrast colors and outlines.
- [ ] Make all accept/decline/skip choices large, readable and reachable with predictable D-pad order and no focus traps.
- [ ] Verify forward progress, Back, process restart and completion using only D-pad/OK; use an isolated first-run test profile, not a reset of existing user data.
- [ ] Refine browser controls for consistent native focus, minimal navigation steps, remembered selection and clear cursor/scroll state.
- [ ] Keep controls and onboarding lightweight: reuse native views/models, avoid added WebViews, unnecessary animation or synchronous heavy work.
- [ ] Measure cold/warm startup, panel responsiveness and browser memory before/after; record emulator limitations and recheck on the Chromecast later.

## Native browser UI

- [x] Replace the prototype list dialog with a readable landscape native browser panel.
- [x] Add clear focus, predictable D-pad movement, remembered selection and Back escape; panel replay passes.
- [ ] Provide address/search, Back/Forward, Reload/Stop and clear page cursor/scroll actions.
- [ ] Provide a native home/start view with bookmark shortcuts using existing browser storage.
- [ ] Adapt tabs: new, switch, close, private/normal separation and restart restoration.
- [x] Adapt bookmarks: add, open and remove through existing storage; D-pad workflow and restart pass. Pagination/policy/private coverage remains open.
- [ ] Adapt history: open, delete and clear through existing storage.
- [ ] Adapt private browsing and clear-data controls; verify isolation.
- [ ] Make Shields controls and relevant settings usable from the remote.
- [ ] Verify error pages, certificate warnings, permissions and native dialogs remain reachable and escapable.

## Emulator acceptance

- [ ] Search, navigate links, edit forms, scroll nested content and recover from input traps.
- [ ] Exercise tab/bookmark/history/private workflows and restore normal state after restart.
- [ ] Exercise Shields toggles and resource updates without relying solely on counters.
- [ ] Play ordinary and adaptive video; use play/pause, seeking and fullscreen/Back.
- [ ] Recover from Home, app switching, network interruption and process recreation.
- [ ] Complete a sustained 30-minute browsing/video run with logs and resource samples.
- [ ] Save visual evidence at TV density, including focus, text legibility and panel edges.

## Physical TV follow-up

- [ ] Build the tested revision for ARM using the preserved cache and non-debuggable configuration.
- [ ] Install without clearing the existing profile; verify update preservation.
- [ ] Repeat the core flows with the Chromecast's physical remote.
- [ ] Measure startup, whole-browser memory and sustained video on hardware.
- [ ] Test the second physical TV before declaring the MVP complete.

Production identity, signing, distribution and upstream-update rehearsal remain in the [MVP checklist](mvp-todo.md).

## Independent fork identity before public APK distribution

- [ ] Choose a product name and original launcher icon/banner; replace Brave product branding in onboarding, app labels and other user-facing surfaces. A name is pending; do not imply an official Brave release.
- [ ] Preserve upstream copyright/license notices and source availability; provide factual Brave/Chromium attribution and independent-maintainer identification.
- [ ] Audit Web Discovery, crash reports and P3A: identify actual data recipients, service availability and accurate consent/privacy wording rather than blindly renaming upstream services.
- [ ] Plan application ID/signing/update identity and migration separately so rebranding does not silently discard existing profiles.

Basis checked 9 October 2026: [MPL §§2.3 and 3](https://www.mozilla.org/en-US/MPL/2.0/) grant no contributor trademark rights and require license/source notices; [Brave terms](https://brave.com/terms-of-use/) distinguish open-source rights from their executable/service terms. Independent branding is the project recommendation; this is not legal clearance for a chosen name.
