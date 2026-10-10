# TV-native development checklist

Execution order: plan the slice in [engineering-plan.md](engineering-plan.md), implement direct source changes, run focused checks and the cached emulator build, review only the latest implementation commit, then commit evidence and push `master`. Record failed or partial checks honestly. Return to the Chromecast after emulator flows are usable.

## Current priority (user direction, 10 October)

- [x] Fix the restored-home startup panel issue. `44ccdafef` passes the previously failing 20-step home replay; real webpages retain automatic browser controls.
- [ ] Resolve the intermittent Android 14 first-launch handoff with a repeatable, awake-device reproduction and verified correction. Ten fresh Chromecast initializations pass, including actual agent launch/inspection; the original rejection is unreproduced and is not claimed fixed.
- [x] Scope the phone companion from the supplied research; see [phone remote plan](phone-remote-plan.md) for proposed scope, ordered stages and acceptance checks.
- [x] Implement and verify the local-only phone remote development experiment: TV-hosted companion, pairing/native text input, controls and emulator reliability. HTTP remains development-only; release transport and real-device gates remain open. See the [plan](phone-remote-plan.md) and [evidence](phone-remote-evidence.md). Relay is fallback only; live view is removed.
- [x] Install source `d9a219d45` on the Chromecast after explicit authorization to delete Brave from all profiles; verify LAN pairing and controls with a desktop browser client. QR/approval, pointer, scrolling, navigation/tabs, native Unicode/selection/deletion and disconnect passed. Real phone IME/gestures and sustained hardware acceptance remain open.
- [ ] Validate real phones and the Chromecast. The user now authorizes installation and a short Chromecast test while watching; broader hardware acceptance remains open.

The user defers broader device acceptance (including a second device), release
identity/signing/packaging, unattended upstream filter refresh publication and
ongoing browser-update automation to future work. Existing unchecked items
below remain the backlog, not prerequisites for starting that next feature.
This does not declare the original broad tester-release criteria complete.

## Source fork

- [x] Create the Brave source fork with upstream history and check it into `brave/` as a pinned submodule.
- [x] Commit the tested prototype changes as ordinary source files; retire the TV patch artifact/workflow.
- [x] Make setup and JVM checks use real source; preserve dirty/divergent checkout safety. Fourteen tests, strict mypy and Nix flake checks pass.
- [x] Advance the existing build checkout without deleting dependencies or output caches. Original source edits remain in a named Git stash.
- [x] Build/install the unchanged fork baseline on the emulator and rerun input checks. Build 4m08s; cursor visibility and one-click checks pass.

## Shields and YouTube

- [x] Record the video-ad reproduction limit: three signed-out YouTube videos play at initial/later positions without observed ads on `5c9a36c74`. This does not establish universal or signed-in blocking.
- [x] Check filter, cosmetic and scriptlet resources on the current emulator and after restart. Clean-profile coverage remains open.
- [x] Demonstrate network blocking and a Shields-off/on control with observable resource results.
- [x] Fix the reproduced cold-start blocking failure. `fd1db3384`/`dbeaa9a61` defer queries until complete engines/resources are ready; cached and uncached no-reload checks, reload request assertions and optional-list toggles pass. Native delayed-catalog test compiles; execution remains pending. See device evidence.
- [x] Verify independent signed resource updates on the existing emulator profile. The upstream development updater returned 403; fork-owned HTTPS delivery, validation, staging and restart activation pass on `95b26f1ba`. Clean-install/offline/hardware coverage remains open.
- [x] Fix the demonstrated engine/resource failures and repeat blocking, then sample YouTube playback. The reported hardware video-ad symptom has not been reproduced on the emulator.
- [x] Make per-site protection state and exceptions readable and remote-accessible. Standard/aggressive transitions, restart persistence and actual blocking pass on `d88cef8a9`.

## Simple launch, privacy and home (supersedes onboarding redesign)

- [x] Remove the TV consent/onboarding layouts and use direct browser startup. Preserved incomplete-onboarding and fresh profiles launch directly.
- [x] Exclude Web Discovery and usage-ping services; make P3A and crash uploads inert, including old opt-in preferences. Blocking build passes; old reporting preferences persist as false. Full traffic audit remains open.
- [x] Stop constructing Android process/profile/search analytics collectors and remove the Java connection/retry/usage timer. Blocking build and before/after native search-histogram regression pass; provider selection still works.
- [x] Remove the observed remaining Android Shields, News, Sync and savings collectors. Native before/after histograms and a 348-second startup/settings/search/video traffic sample pass on `5c9a36c74`; website analytics and local engine timing diagnostics are distinct. This is bounded runtime evidence.
- [x] Implement native home with “Simple, private, and ad-blocking,” address/search, controls, private-session labeling and Brave/Chromium attribution.
- [x] Add remote-accessible public GitHub/source and license links. Both navigate successfully; generated credits contain 1,058 notices.
- [x] Implement Google default for new Android profiles and TV provider selection including Brave Search. Existing choice is preserved; normal choice survives restart and private choice is independent. Fresh normal/private defaults are Google; private restart coverage remains open.
- [x] Verify direct first-run launch, initial focus, Back, keyboard and restart on the emulator without clearing existing profiles. Upgrade and fresh profiles pass; private screenshot protection remains enabled.
- [x] Remove the TV Shields education promotion and use a neutral launcher icon and media-session label. Fresh eligible emulator profile retains request blocking on `e41398dd1`; original first-launch issue on Android 14 remains unresolved.
- [ ] Refine remaining controls/settings for clear focus, few navigation steps, remembered selection and clear cursor/scroll state.
- [ ] Measure startup, panel responsiveness and memory; record emulator limitations and recheck on Chromecast later. Three native-home emulator launch/process-memory samples recorded; whole-browser and hardware measurements remain open.

- [x] Redesign home with a prominent search card, quieter controls/attribution, theme gradient and clear focus. Twenty-step home and twelve-step toolbar-menu checks pass on the fresh emulator.

## Native browser UI

- [x] Replace oversized outlined dialogs with compact themed TV panels. Settings, controls, filters, scrolled tabs, confirmations and home screenshots checked on `03aa6d30d`; main/Settings/home D-pad replays pass. Larger fonts, translations and hardware remain broader acceptance work.

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
- [x] Implement independent signed delivery and TV freshness/manual-check/restart UI. Seventeen native tests and existing-profile emulator delivery, failure recovery, restart/cache transition and actual blocking pass; public feed published.
- [ ] Finish advanced filters/custom subscriptions and remaining clean-install, full-disconnection, private restart and hardware update acceptance.
- [x] Verify local network errors, certificate warning/Back to safety, alert/confirm/prompt and location refusal on the emulator. Strong native focus and Back recovery pass; broader permissions/external-app flows remain open.
- [x] Hide the idle cursor/hint, wake safely without clicking, and retain exactly one click on held OK. Real uinput and pixel checks pass, including fullscreen video.
- [x] Add native playback controls and verify ordinary video pause/resume/ten-second fallback seeking, site-defined YouTube seeks, captions and fullscreen/Back. Sustained/adaptive and hardware acceptance remain separate.

## Emulator acceptance

- [ ] Search, navigate links, edit forms, scroll nested content and recover from input traps.
- [ ] Exercise tab/bookmark/history/private workflows and restore normal state after restart.
- [ ] Exercise Shields toggles and resource updates without relying solely on counters.
- [x] Emulator ordinary and adaptive playback pass; native pause/seek and ordinary fullscreen/Back pass on `5c9a36c74`. Earlier YouTube fullscreen acceptance is retained; this run does not re-prove its physical remote cursor behavior.
- [ ] Complete full-disconnection recovery. Home/background return, severe network throttling/recovery, process recreation and restored tabs pass on `5c9a36c74`.
- [x] Complete 30 minutes of ordinary video playback with whole-process memory samples, crash/ANR checks and frame counters.
- [x] Complete a bounded 15-minute mixed emulator session with adaptive YouTube, ordinary looping video, settings/app switching and process recreation; 12 minutes of whole-process memory samples, no new crash/ANR. This supplements the earlier 30-minute ordinary-video run; physical-TV endurance remains open.
- [ ] Save visual evidence at TV density, including focus, text legibility and panel edges.

## Physical TV follow-up

- [x] Build the accepted baseline `5c9a36c74` for ARM using the preserved cache and non-debuggable configuration. The later `e41398dd1` identity update is emulator-only so far.
- [ ] Install without clearing the existing profile; verify update preservation.
- [ ] Repeat the core flows with the Chromecast's physical remote.
- [x] Confirm address entry, responsive example.com, visible cursor/one held-OK click, moving YouTube video/audio and physical fullscreen/Back on `5c9a36c74`. No pre-roll observed by the user on the first sample; broader workflows and mid-roll coverage remain open.
- [ ] Measure startup, whole-browser memory and sustained video on hardware.
- [x] Record a bounded 605-second mixed hardware run: 21 whole-browser PSS samples, 374.84–655.36 MiB, no new crash/ANR. Continuous endurance and the intermittent first-launch handoff remain open.
- [ ] Test the second physical TV before declaring the MVP complete.

Production identity, signing, distribution and upstream-update rehearsal remain in the [MVP checklist](mvp-todo.md).

## Independent fork identity before public APK distribution

- [ ] Choose a product name and original launcher icon/banner; replace Brave product branding in onboarding, app labels and other user-facing surfaces. A name is pending; do not imply an official Brave release.
- [ ] Preserve upstream copyright/license notices and source availability; provide factual Brave/Chromium attribution and independent-maintainer identification.
- [x] Complete the current Android service/histogram audit and bounded startup/search traffic check; removed services have no consent UI. Recheck delayed traffic and new services on future upstream updates.
- [ ] Plan application ID/signing/update identity and migration separately so rebranding does not silently discard existing profiles.

Basis checked 9 October 2026: [MPL §§2.3 and 3](https://www.mozilla.org/en-US/MPL/2.0/) grant no contributor trademark rights and require license/source notices; [Brave terms](https://brave.com/terms-of-use/) distinguish open-source rights from their executable/service terms. Independent branding is the project recommendation; this is not legal clearance for a chosen name.

### Phone remote recovery follow-up (emulator first)

- [x] Replace the empty manual-code form after QR acceptance with TV-approval guidance; return to pairing guidance on rejection/listener closure.
- [x] Restore normal TV home after the final normal tab closes through phone or native controls; verify phone New tab and physical D-pad recovery.
- [x] Exit renderer fullscreen before page history/controls with phone and native Back, preserving private/native guards.
- [x] Verify cursor pixels after media fullscreen and five YouTube fullscreen cycles, including physical cursor movement. Persistent Chromecast cursor disappearance remains a hardware check.
- [x] Reproduce and fix missing phone tab rows after native-panel pause/resume; host and final packaged-asset regressions pass (one authoritative tab and one rendered row after resume).
- [x] Compare bounded emulator loading with polling active/suspended; no clear persistent polling slowdown in the small sample.
- [ ] Verify these fixes on the user's Chromecast and real iPhone after the emulator work; diagnose the reported hardware YouTube latency there. No hardware operation in this follow-up.


### Grouped final-tab popup

- [x] Reproduce focus on descriptive text/inert spinner containers in the group-delete confirmation.
- [x] Verify initial Cancel focus, actual Cancel/Delete button traversal, preserved group after Cancel, and home recovery after Delete on the emulator and authorized Chromecast using injected D-pad/OK.
- [x] Check ordinary native Alert, Confirm and Prompt focus/dismissal on the emulator.
- [ ] Repeat this popup with the user's physical remote and re-paired phone; unrelated loading/fullscreen hardware checks remain open.
