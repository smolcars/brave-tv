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
- [x] Make per-site protection state and exceptions readable and remote-accessible. Standard/aggressive transitions, restart persistence and actual blocking pass on `d88cef8a9`.

## Simple launch, privacy and home (supersedes onboarding redesign)

- [x] Remove the TV consent/onboarding layouts and use direct browser startup. Preserved incomplete-onboarding and fresh profiles launch directly.
- [x] Exclude Web Discovery and usage-ping services; make P3A and crash uploads inert, including old opt-in preferences. Blocking build passes; old reporting preferences persist as false. Full traffic audit remains open.
- [x] Stop constructing Android process/profile/search analytics collectors and remove the Java connection/retry/usage timer. Blocking build and before/after native search-histogram regression pass; provider selection still works.
- [ ] Audit remaining local analytics collectors and promotional services; verify no reporting requests on startup, navigation or search.
- [x] Implement native home with “Simple, private, and ad-blocking,” address/search, controls, private-session labeling and Brave/Chromium attribution.
- [x] Add remote-accessible public GitHub/source and license links. Both navigate successfully; generated credits contain 1,058 notices.
- [x] Implement Google default for new Android profiles and TV provider selection including Brave Search. Existing choice is preserved; normal choice survives restart and private choice is independent. Fresh normal/private defaults are Google; private restart coverage remains open.
- [x] Verify direct first-run launch, initial focus, Back, keyboard and restart on the emulator without clearing existing profiles. Upgrade and fresh profiles pass; private screenshot protection remains enabled.
- [ ] Refine remaining controls/settings for clear focus, few navigation steps, remembered selection and clear cursor/scroll state.
- [ ] Measure startup, panel responsiveness and memory; record emulator limitations and recheck on Chromecast later. Three native-home emulator launch/process-memory samples recorded; whole-browser and hardware measurements remain open.

- [x] Redesign home with a prominent search card, quieter controls/attribution, theme gradient and clear focus. Twenty-step home and twelve-step toolbar-menu checks pass on the fresh emulator.

## Native browser UI

- [x] Replace the prototype list dialog with a readable landscape native browser panel.
- [x] Add clear focus, predictable D-pad movement, remembered selection and Back escape; panel replay passes.
- [ ] Provide address/search, Back/Forward, Reload/Stop and clear page cursor/scroll actions.
- [x] Provide direct home bookmark access through existing browser storage; home and bookmark replays pass, aligned three-card screenshot verified.
- [x] Correct normal/private New tab handoff to native home with search focused; both failing replays now pass. Closing the private test tab restores normal home.
- [x] Adapt toolbar tab entry, selection/closing, pagination and ordinary restoration. Current-home focus passes; loaded fixtures restore. Upstream intentionally drops unused blank homes.
- [x] Adapt bookmarks: add, open and remove through existing storage; D-pad workflow and restart pass. Pagination/policy/private coverage remains open.
- [x] Adapt history: native open, Cancel/remove, paging and scoped all-time clearing pass on local fixtures. Native continuation beyond one query batch remains in broader acceptance.
- [x] Add scoped native clearing: history, site data and cache effects verified in isolated Android user 10; bookmarks preserved, private clearing excluded.
- [ ] Finish delayed-operation exit/reopen and managed-policy coverage for history/privacy.
- [x] Replace TV toolbar branding with neutral protection-state icons and route its protection action to the native TV panel; off/on request checks pass. Preserve the existing single focus ring.
- [x] Provide native optional content-filter toggles; off/on request effects, restart persistence, private entry and remembered Settings focus pass. Large catalogs, custom subscriptions and independent updates remain open.
- [x] Verify Standard/aggressive mode persistence and actual request blocking after restart.
- [ ] Finish advanced filter/update behavior, including independent signed delivery and freshness UI.
- [x] Verify local network errors, certificate warning/Back to safety, alert/confirm/prompt and location refusal on the emulator. Strong native focus and Back recovery pass; broader permissions/external-app flows remain open.
- [x] Hide the idle cursor/hint, wake safely without clicking, and retain exactly one click on held OK. Real uinput and pixel checks pass, including fullscreen video.
- [x] Add native playback controls and verify ordinary video pause/resume/ten-second fallback seeking, site-defined YouTube seeks, captions and fullscreen/Back. Sustained/adaptive and hardware acceptance remain separate.

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
- [ ] Complete the no-analytics service/traffic audit; do not retain consent UI for removed reporting services.
- [ ] Plan application ID/signing/update identity and migration separately so rebranding does not silently discard existing profiles.

Basis checked 9 October 2026: [MPL §§2.3 and 3](https://www.mozilla.org/en-US/MPL/2.0/) grant no contributor trademark rights and require license/source notices; [Brave terms](https://brave.com/terms-of-use/) distinguish open-source rights from their executable/service terms. Independent branding is the project recommendation; this is not legal clearance for a chosen name.
