# First input increment review

Scope requested by the user: latest implementation commit only. Compared `c48f63717a7ab22ced7a57aa19153dbe7b1436e9` with parent `7a4ec72895a5b763dcb7d58acbc8d28df189b25c`. Two independent read-only reviews used the engineering plan and upstream Android standards.

## Standards

- **P2: native UI priority.** Skipping CloseWatcher in a query that reports only the highest enabled handler also hides native Find/bottom controls ranked below it. Check native UI independently.
- **P2: callback lifecycle.** Dialog selection/cancel callbacks need destruction checks at callback entry, as required by upstream Android rule AND-001.
- No heuristic smell justified additional abstractions.

## Spec

- **P1: OK click delivery.** Chromium's `ui/android/java/src/org/chromium/ui/base/EventForwarder.java` consumes mouse DOWN/UP without emitting clicks. The adapter must send a supported event sequence. The JVM tests only observe a click request.
- **P2: native-page Back.** The always-enabled TV callback opens controls before native history/search/selection handling. Native pages must retain upstream handling.
- **P2: native UI priority.** Same CloseWatcher combination as the Standards finding.
- No scope creep. Android compilation and device validation remain explicitly pending.

Totals: Standards 2 findings (worst P2); Spec 3 findings (worst P1). The shared priority finding is reported on both axes.

## Regression procedure and resolution evidence

Status: source corrections prepared; Android checks not run. See [the correction plan](engineering-plan.md#corrections-from-the-first-input-review).

- OK now emits a finger/touchscreen DOWN/UP pair with press/release pressure; hover and wheel stay mouse events. This follows Chromium's touch-input path rather than its mouse DOWN/UP suppression.
- Native pages delegate Back. Native focus, visible Find UI and the existing scrim visibility supplier are checked independently of the highest Back handler. `ScrimManager.showScrim()` sets this supplier before starting the tab-group dialog animation, covering the interval before native focus is assigned. No Chromium Back manager API was added or reordered.
- Dialog actions, Back callbacks and event delivery now reject a destroyed/finishing activity or a controller already torn down. Page-change handling only runs for mapped remote keys after native-UI checks.
- The Java formatter, patch whitespace/apply checks and all nine repository tests/typechecking in `nix flake check` pass. These checks do not compile or execute the Android adapter. No Android red/green cycle has been completed; runtime acceptance remains open.

The controlled fixture is [`tests/pages/remote-input.html`](../tests/pages/remote-input.html). With device access enabled and a built APK, serve `tests/pages` using Python from the Nix shell, then load the page through a test connection. Keep the server private to the test environment; for an authorized ADB-connected target, bind it to localhost and use `adb reverse tcp:8000 tcp:8000`:

```sh
nix develop --command python3 -m http.server 8000 --bind 127.0.0.1 --directory tests/pages
# In another Nix shell, once device access is enabled:
adb reverse tcp:8000 tcp:8000
# On the target, open http://127.0.0.1:8000/remote-input.html
```

Record actual results for:

1. Cursor OK increments the counter once on release, with no repeated clicks while held.
2. Text entry opens/dismisses the keyboard normally; scrolling affects the nested box under the cursor.
3. Enable CloseWatcher, return to cursor mode, then Back: TV controls remain reachable.
4. With CloseWatcher enabled, open native Find in page and dismiss the keyboard. D-pad/OK must stay with Find. Repeat with the tab-group dialog, including its opening animation.
5. On a native history page, Back clears selection/search before navigation or exit.
6. Leave/resume the app while a control is being selected; no delayed click or UI action executes after teardown.

No device connection, browser result, or Android regression pass is implied by the existence of this fixture. The machine reboot interrupted the original build; recovery details are in [build.md](build.md).

## Follow-up: latest correction commit

Compared only `0ed082e3fc2625e1600a78923ecdf601b8aa6b7b` against parent `caa729562d378f0e3e8787b6a2c7cd9f561dcd05`.

### Standards

One P3 finding remained: the dialog selection callback called `dismiss()` before the lifecycle check inside its action handler. Added the same lifecycle guard at callback entry, before dismissal. The previous native-priority finding is addressed at source level; no additional heuristic findings.

### Spec

Zero new findings. Source inspection confirmed the three original defects are addressed and the correction stays within the engineering plan. Android compilation and runtime checks remain unverified.

Follow-up totals: Standards 1 finding (P3, corrected); Spec 0 findings. These source-review results do not close the physical-device gate.

## Android compiler correction review

Compared only `70f739f65d2fea0744330b2c9dbeeb9c2e8b4e9f` against parent `9e85bb77def931c02d76969ae1dedb28366bcaf3`.

### Standards

Zero findings. The AndroidX annotation matches existing Brave Android code and adds no dependency, suppression or behavioral logic.

### Spec

Zero findings. The correction follows the written integration plan and preserves nullable declarations and input behavior.

Android header compilation, Java compilation and APK packaging succeeded after this correction. Background static analysis was interrupted at service exit; the later blocking build completed successfully as recorded below. Device regression procedures remain unexecuted. Totals for this commit review: Standards 0, Spec 0.

## Launcher resource correction review

Compared only `7f43abb4a25411d731c18f68c12706de36d18091` against parent `9e33f3bc4514525101c182fe2e5c0b1259e1b6fd`.

### Standards

Zero findings. The banner change preserves its artwork; the two resource exceptions follow Brave's existing manifest-resource pattern with a short explanation. The preceding commit records the plan. No dependency or abstraction was introduced.

### Spec

Zero findings. The dimensions, unchanged viewport and exact resource exceptions match the correction plan. Global checks remain enabled and the change introduces no additional behavior.

Totals: Standards 0, Spec 0. Launcher lint and packaged manifest/banner inspection subsequently passed. Neither review establishes launcher rendering or physical-device behavior.

## Explicit condition grouping review

Compared only `1e1c5940f4cb492ddc5d66885def16d280bcf4c9` against parent `ac2f3bcfecebbea43abdc925f835e2956baad43a`.

### Standards

Zero findings. Explicit grouping preserves evaluation order and adds no dependency, abstraction or smell.

### Spec

Zero findings. Both source trees and the exported patch match the planned grouping correction. No behavior changes or checks are suppressed.

Totals: Standards 0, Spec 0. The final blocking Android build passed at 06:25 EDT on 9 October, including the previously failing Error Prone target. All nine local tests and strict Python typechecking passed through Nix. The preserved APK's signature, manifest and banner were verified; [artifact details](tv-prototype.md#completed-prototype-artifact) record the evidence. Device checks remain unexecuted.

## Onboarding focus correction review

Compared only `6ae4d9b5ed545cde200a457a0b29229cebc6269d` against parent `d4ab1392b6d4498ab4ef75d87fcf7da8639e3833`. Separate read-only Standards and Spec reviewers inspected this diff, the connected upstream onboarding code, the plan and validation evidence. Older implementation commits were outside this review.

### Standards

Zero findings and no actionable heuristic concerns. The correction is limited to television UI mode, follows existing Java conventions and introduces no asynchronous lifecycle handling. It relies on the pinned ViewPager2 RecyclerView child hierarchy; revalidate that assumption on an upstream update.

### Spec

Zero findings. Existing consent handlers, defaults and layouts are preserved. The replay uses remote buttons, asserts input focus with a bounded wait and does not clear app data. It failed against the original APK and passed against the corrected APK; the remaining onboarding pages were then completed with D-pad/OK.

Totals: Standards 0, Spec 0. The blocking incremental Android build, APK signature verification, all nine repository tests and strict Python typechecking passed. Physical-device and non-TV runtime behavior remain unverified. This review covers the onboarding correction, not overall MVP acceptance; see [device evidence](device-tests.md#emulator-run-9-october-2026).

## Cursor correction review

Compared only `937ac535839aa74f2cfbf6fc554f53822ca65faf` against parent `29ae1968968debd289a455fc491fba6fd9024efe`. Separate read-only reviewers inspected the changed patch/test hunks and connected upstream code; older implementation commits were excluded. Expected load is one activity and active page per user.

### Standards

Zero findings. The attachment callback guards activity lifetime, the decorative view remains non-interactive and excluded from accessibility, and teardown removes its listener and view. No actionable heuristic smells; the small JSONL fixture overlap does not warrant extra test infrastructure.

### Spec

Zero actionable code findings. The sibling view, hint placement, detach cleanup, canceled presses and parent dispatch match the pointer correction plan. Chromium's compositor parent supplies the missing viewport offsets. The reviewer requested the runtime/build evidence update, included with this report. No scope creep found.

Totals: Standards 0, Spec 0. Blocking Android analysis/build, Nix tests/typechecking, cursor visibility, precise field focus, native keyboard/Back, tab replacement, nested scrolling and keyboard fallback passed. This is a passing review of the correction, not overall MVP acceptance. Physical-TV, website/video, full native-priority matrix and performance checks remain open.

## Optimized Android link correction review

Compared only `d5c4de11320677602b562b8848b96a3557bb4a05` against parent `75e168147c442b7edfdbafd720909da786ed32dc`. Separate read-only reviewers inspected the changed factory patch and object regression; older TV implementation hunks were excluded.

### Standards

Zero documented-standard violations or actionable heuristic smells. The interface forward declaration and direct include follow the C++ include rules. The implementation include guard matches GN's non-Android source condition. Ownership remains `unique_ptr`, and the interface's existing virtual destructor preserves desktop destruction.

### Spec

Zero findings. Android still returns null and desktop still constructs the same implementation. The compiled-object regression catches references to both excluded desktop tooltip types and propagates tool failures. No desktop sources, dummy destructors, weakened linker checks or Ads/Shields behavior changes were introduced.

Totals: Standards 0, Spec 0. The object check fails on the preserved original ARM object and passes after correction. The resumed full ARM build links and packages successfully; all nine Nix tests, strict typechecking of four Python files and Chromium-style C++ formatting pass. Desktop runtime and the physical-TV MVP gates remain unverified.

## Non-debuggable physical-device configuration review

Compared only `b270b1b90d33a67889d26b6672b8de3c0f0a57c4` against parent `bb817a9bdfc591548ff4d24919eb39601a280e2e`. Separate read-only Standards and Spec reviewers inspected the configuration/documentation diff, upstream GN default and preserved build/runtime evidence. Older implementation commits were excluded.

### Standards

Zero documented-standard violations or actionable heuristic smells. The command retains Nix, blocking Android analysis, build limits and preserved caches/artifacts. Runtime claims distinguish initial success from unverified acceptance, disclose the reinstall/reboot confound and identify user-confirmed click evidence. Device addresses, screenshots and logs remain outside Git.

### Spec

Zero findings. The promoted command matches the planned single configuration change and preserved provenance, including unchanged DEX/native payloads and development signing. The separate 51.0-second cold launch without input or new ANRs and physical address-entry confirmation support the initial regression result. The user's uninstall/fresh-install instruction superseded the planned update; profile preservation remains unverified. No source change or scope creep was introduced.

Totals: Standards 0, Spec 0. The cached Nix build and APK verification passed; reviewers inspected existing evidence without rebuilding or driving the device. Broader native-priority, narrow-field/nested-scroll, sustained-video, Shields, performance and second-TV checks remain open. This is not an isolated measurement of the debugging flag's effect or final release acceptance.

## Direct-source migration review

Compared project implementation `5ecc685bc9d00ede2d6b89942dfd79537804ef3c` only against parent `01ec9851016673b7ca39d646b4c5f8ab3a6a4e62`. The fork's initial TV commit is `1a296306374e88237d6e3967ba967f8f0802458b`, parent `b01cdf43be4b4d5559bf7e58229e666e24454f50`. Separate read-only Standards and Spec reviewers checked the migration; the fork diff exactly matches the prior 35,402-byte TV patch across 12 files. Earlier source implementation was not re-reviewed.

### Standards

Zero findings. The helper and tests follow the subprocess/filesystem boundary, validate the committed source before creating a workspace and preserve dirty/divergent build checkouts. No actionable baseline smells.

### Spec

Zero findings. The real fork retains upstream ancestry, project tests compile actual tracked Java source, and active documentation retires TV patch export/application. The exact source pin, clean working trees and fast-forward update requirements are enforced.

Totals: Standards 0, Spec 0. Fourteen Nix-shell tests, strict mypy and both Nix flake checks pass. The initial packaged check exposed a hashed store filename copied under the wrong basename; the reviewed commit fixes the explicit Java destination. The cached x64 build subsequently passed in 4m07.92s, APK signature verification passed, and installation preserved the emulator profile. Cursor visibility and single-click checks pass. Native UI expansion and Shields diagnosis remain separate increments.

## Native panels and bundled Shields review rounds

Each row is a separate, latest-implementation-only review against the stated parent, with independent Standards and Spec reviewers. These were not whole-history reviews.

| Repository / commit | Parent | Standards | Spec |
| --- | --- | --- | --- |
| source `f1fd81dc6` | `1a2963063` | P3: Shields terminology | P1: locked private titles; P2: reopening controls over close confirmation |
| source `3ffde4773` | `935e2f36b` | 0 | P2: idle NTP could not reopen controls after pause/close |
| source `058431555` | `3ffde4773` | 0 | 0 |
| source `0496c6e2e` | `058431555` | 0 | 0 |
| source `2688a17ff` | `0496c6e2e` | CSM-009 weak member replies; CSM-022 explicit worker traits | P1: bundled-list re-enable notification; P2: partial catalog completing locale initialization |
| source `89937d8d1` | `2688a17ff` | 0 | GRIT paths relative to parent; cache-disabled startup notification |
| source `362d9e85e` | `89937d8d1` | 0 | 0 |
| project `0ffe783` | `50b48e2` | P2: await actual navigation, TA-003 | P1: stale-document assertions; P2: unrelated request errors |
| project `dd21fb2` | `0e6aeab` | 0 | 0 |
| source `c7bde129e` | `362d9e85e` | 0 | 0 |

The subsequent listed correction resolves each preceding finding. No actionable heuristic smells remained in the final rounds. The `362d9e85e` Android build and native-panel replay passed, and the corrected probe independently identifies the repeated-list-toggle defect addressed by `c7bde129e`; its repeated-toggle and normal-restart checks now pass. See [device evidence](device-tests.md#source-fork-panels-and-shields-9-october-2026) for pass/fail boundaries. Full private authentication, production updates, YouTube, sustained video and physical-TV acceptance are not established by these reviews.


Latest bookmark implementation review: source `40b075224` against `c7bde129e`, Standards 0, Spec 0. Existing bookmark-model storage, managed/edit restrictions, Cancel-first removal, private-tab context guards and callback cancellation match the plan. Android compilation and runtime bookmark workflows remain pending.


Bookmark replay review: project `17f5e2e` against `c56134e`, Standards 0, Spec 0. Runtime then found a parser-quoting error, fixed in `8a2ed50`; the corrected 38-step replay passes. Source `40b075224` build and basic bookmark acceptance now pass as recorded in device evidence; broader policy/private/pagination coverage remains open.

### TV onboarding: `9bb2cf912` vs `40b075224`

- Standards: no actionable documented-standard or smell findings.
- Spec: P1 reporting state can revert after the new Back flow recycles/rebinds page two because activity callbacks do not synchronize adapter checked values. The next implementation synchronizes them through the existing setters and adds the round-trip device check.
- Review covered only this latest implementation commit. Build and rendered focus checks remained in progress.

### Onboarding consent state: `409ec97af` vs `9bb2cf912`

- Standards: no actionable findings.
- Spec: no new findings; the two setter calls synchronize the adapter and address the prior stale-consent P1. Device round-trip verification remains required.
- Both reviews were read-only and limited to the latest implementation diff.

### TV onboarding replay: `7db5a62` vs `bbfed49`

Standards and Spec both report no findings. The replay intentionally leaves onboarding incomplete and does not claim to assert checkbox state through the helper snapshot. Runtime on source `9bb2cf912` subsequently passes all 31 steps in 5.7 seconds. A baseline run was interrupted by a launcher promotion; a direct assertion on the old actual onboarding page separately confirms missing initial focus.

### Privacy action contrast: `572ba7e70` vs `409ec97af`

Standards and Spec both report no findings. The localized label becomes plain text while the original privacy-link callback remains. Rendered focus verification on the final APK is pending. All reviews compare only their latest implementation commit with its parent.

## Independent home and analytics-removal rounds

Each row covers only the stated implementation commit against its parent.

| Source commit | Parent | Standards | Spec |
| --- | --- | --- | --- |
| `ebb1c5f7b` | `572ba7e70` | P2: stale reporting search/dead Java paths | P2: existing factory test still dereferences a refused connection |
| `ebfbbbfbc` | `ebb1c5f7b` | 0 | 0 |
| `584ece7d9` | `ebfbbbfbc` | 0 | 0 |
| `6a8c1ec8b` | `02c9934c6` | 0 | 0 |
| `491804c5a` | `8bdff7a8c` | 0 | 0 |

The reporting cleanup and refusal expectation resolve the first round's findings. Native home retains attribution and delegates lifetime/navigation to Chromium. JVM verification passes four TV/non-TV and private/normal factory paths. Blocking Android builds exposed and corrected compile-out dependencies (referrals, Rewards Web Discovery preference, Android stats JNI); build/runtime acceptance is still pending. The old three-page onboarding requirements are superseded by direct launch.

| Source commit | Parent | Standards | Spec |
| --- | --- | --- | --- |
| `e469d6b6c` | `491804c5a` | P3 orphaned Browser menu string | P1 Java startup overrides Google with Brave/Yandex/Yahoo |
| `45e1d9a8f` | `e469d6b6c` | 0 | 0 |
| `a616d934c` | `45e1d9a8f` | 0 | 0 |
| `42982d535` | `a616d934c` | P1 early return skips Safe Browsing | P1 Safe Browsing; P1 clear-on-exit skipped; P2 repeated fingerprint migration |
| `7fcdf6d0f` | `42982d535` | 0 | 0 |

The search correction removes legacy startup overrides without resetting saved choices. The startup correction runs Safe Browsing and video resume before the TV return, shares cold-start data clearing, and advances the existing migration gate. The intermediate `42982d535` APK must not be installed; compile and test the corrected revision. Reviewers checked connected callers but did not independently execute builds or device checks.

Latest menu compile correction: `13d6e7f0b` against `7fcdf6d0f`, Standards 0 and Spec 0. Existing public delegate dispatch avoids the internal-module dependency; the activity-owned resource remains directly referenced. APK/runtime checks remain required.

Latest menu lint correction: `45287adc4` against `13d6e7f0b`, Standards 0 and Spec 0. The exception covers only the activity-owned resource lookup; global checks and runtime guards remain. Build and menu activation checks are pending.

Project home replay: `7ffa25b` against `b11bc84`, Standards 0 and Spec 0. It checks normal-home focus order without resetting data; links, private mode and keyboard checks remain separate.

| Source commit | Parent | Standards | Spec |
| --- | --- | --- | --- |
| `8132b4f45` | `45287adc4` | P2 orphaned onboarding helpers/resources/test (AND-028) | 0 |
| `5852d6543` | `8132b4f45` | 0 new findings; known background cleanup pending | 0; known background cleanup pending |

The latter removes the orphaned first-run UI module and its consumers. Blocking lint independently identified the remaining activity background and spacing; `1125c034b` removes those exclusive resources while retaining shared text sizing. Each review remains limited to its latest implementation commit against its parent.

Final resource cleanup `1125c034b` against `5852d6543`: Standards 0 and Spec 0. Deleted resources have no remaining consumers; shared text size and Wallet colors remain. Blocking build and device checks are pending.

Onboarding style cleanup `32c6f8d4b` against `1125c034b`: Standards 0 and Spec 0. All deleted styles/selectors/drawable/dimension have no surviving consumers; shared styles remain. Android build validation is still pending.

Referral factory correction `0304bcec2` against `32c6f8d4b`: Standards 0 and Spec 0. Its cached build passes in 37.11 seconds; profile-preserving installation reaches native home, eliminating the prior referral abort. Initial address focus remains a separate runtime failure.

Home focus correction `0b5afdb64` against `0304bcec2`: Standards 0 and Spec 0. The posted request guards page/activity lifetime, attachment and root-owned focus. Build and replay validation are pending.


Home focus runtime follow-up: source `0b5afdb64` passes the cached blocking build and all 13 home replay steps; the same replay also passes on `4be36e7dc`.

Provider-list navigation `ca06fe4b8` against `0b5afdb64`: Standards 0 and Spec 0. The combined `4be36e7dc` APK passes the previously failing adjacent-provider Down check and the 16-step grid-controls replay.

Android license generation `4be36e7dc` against `ca06fe4b8`: Standards 0 and Spec 0. Blocking build succeeds; the actual credits page contains 1,058 notices instead of the sample. Both reviews covered only the latest implementation diff in their round.

## Toolbar keys and native home design

Each review is restricted to the named implementation commit against its parent.

| Commit | Parent | Standards | Spec |
| --- | --- | --- | --- |
| `836ca0906` | `4be36e7dc` | P2: constructor-only key listener lost on later menu-view binding | 0 |
| `0252ebfe5` | `836ca0906` | 0 | 0 |
| `1a976a373` | `0252ebfe5` | 0 | 0 |

The rebinding correction reinstalls the listener after inherited view binding. The design uses existing Material/Nala assets and preserves private wording, attribution, and lifetime guards. These are read-only source reviews; the combined APK still needs blocking build and emulator validation.

Toolbar replay adjustment `407df2e` against `ccfc408`: Standards 0, Spec 0. Both read-only reviews retain the original center-key assertion. Source `1a976a373` subsequently passes blocking Android build, home/menu/panel replays and the fresh-profile cursor/input checks; see device-tests.md.

Android collector shutdown `cca46e564` against `1a976a373`: Standards 0, Spec 0. Reviewers checked the Android factory consumers, guarded startup paths, all six nullable Java getter consumers, removal of connection/retry/timer/JNI/build entries, and exclusion of desktop-only NTP dereferences. Build/runtime verification remains separate.

Local search collector diagnostic `cf68782` against `a3dba13`: Standards 0, Spec 0. The probe awaits the native WebUI promise and bounds transport failures. On the preceding APK, disabled mode fails because the sample exists, while enabled mode passes. These reviews cover only their stated latest implementation commits against their parents.

## Native tab handoff and toolbar protection

Latest-commit review only: source `82b9b507c` against `cca46e564`, and regression/plan `48b24dc` against `a96ba25`, each receive Standards 0 and Spec 0. The normal new-tab replay fails twice on the preceding installed APK because controls immediately reopen over the destination. Private creation and switch/close runtime checks remain separate.

Source `11353a858` against `82b9b507c`: Standards 0, Spec 0. Reviews cover native protection routing, activity/tab/private guards, theme/state callbacks, neutral Nala icons and wording, and existing focus foregrounds. No earlier implementation is included. Build and emulator verification are separate gates.


Root regression update `2033873` against `43a7e95`: Standards 0, Spec 0. Private-home notice/focus and toolbar menu activation remain explicit assertions. Source focus correction `942dca26f` against `11353a858`: Standards 0, Spec 0; only redundant foregrounds are removed. No earlier implementation is included in either review.


## Native filters and neutral launcher

Source `b289ae6db` against its parent: Standards 0, Spec 0. Native optional
list service ownership, original-profile scope, lifecycle guards and remembered
settings focus were reviewed. Root replay `3915fd1` against its parent also
received Standards 0, Spec 0; its runtime synchronization correction `e8d9705`
against its parent receives Standards 0, Spec 0. Device results are recorded
separately in device-tests.md.

Source `33e4873c7` against `b289ae6db`: Standards 0, Spec 0. Only the existing
launcher vector changes; original development artwork is explicitly authorized
by the rebranding request. No broader historical diff was reviewed.

## Playback and notification changes

Source `8164e10cd` against its parent: Standards 0, Spec 0. This only suppresses
the legacy Rewards onboarding notification on TV and cancels its own tag/ID.

Source `07c33b653` against `8164e10cd`: Standards 0, Spec 2. The document-change
callback was not broadcast to this observer, and site seek handlers can ignore
the requested duration. Source `9ece2a633` against `07c33b653` corrects the
navigation observer and uses site-defined seek wording: Standards 0, Spec 0.
Root `6126a05` against `c146d56` adds the actual-media-state probe and instructions:
Standards 0, Spec 0. Each review was limited to the named latest implementation
against its parent; runtime acceptance remains separate.

Root dialog fixture `27a85ac` against `e56632b`: Standards 0, Spec 0.
Source modal focus correction `9d78aa3e4` against `9ece2a633`: Standards 0,
Spec 0. Reviews cover only those latest implementation commits; emulator
confirmation of the focus correction is pending.

Source `57002766b` against `9d78aa3e4`, and root no-media replay `4350f6d`
against `b48e7a6`: Standards 0, Spec 0. The native nullable return and disabled
panel path were reviewed. Source API declaration fix `77e234039` against
`57002766b`: Standards 0, Spec 0. Runtime results are separate from these reviews.

Root native alert replay `af8cf7f` against `d3556f9`: Standards 0, Spec 0.
Source return-focus change `e0498ae07` against `77e234039`: Standards 0,
Spec 2 (queued-modal dismissal and delayed activity window focus). Its correction
`681e99ced` against `e0498ae07` receives Standards 0, Spec 0. Each comparison is
only the named latest implementation against its parent.

Source idle-cursor change `720c05f99` against its parent: Standards 1 (missing
activity lifetime guard in delayed hide callback), Spec 0. Correction
`c1f0762ed` against `720c05f99`: Standards 0, Spec 0.
Root initial idle replay `69949f4` against its parent: Standards 0, Spec 1
(final count cannot identify which press clicked). The replay was split into
wake-only and visible-held-click checks. Latest correction `1470e9f` against
`68268a7` adds an explicit directional wake to avoid a timer race: Standards 0,
Spec 0. All reviews cover only the named latest implementation versus its parent.

Source native-dialog outline `360b81ac7` against `c1f0762ed`: Standards 0,
Spec 0. Root ordinary-media fixture `c6cee1c` against `e710733`: Standards 0,
Spec 0. Runtime suitability of the short clip is recorded separately; source
review does not establish an active MediaSession.

Root persistent-media sample `a4bff09` against `4a5f3b0`: Standards 0, Spec 0.
Root byte-range media server/check `96262a9` against `c66ba1f`: Standards 0,
Spec 0. Only each named latest implementation was reviewed against its parent.

Root Standard-mode replay `3902084` against `3297b2c`: Standards 0, Spec 0.
The emulator reproduces the crash independently of these read-only reviews.

Source Standard-mode conversion `d88cef8a9` against `360b81ac7`: Standards 0,
Spec 0. Source TV tab-group visibility `266425387` against `d88cef8a9`:
Standards 0, Spec 0. Each review covers only the named latest implementation.

Root optional histogram diagnostic `9dd9ee7` against `a883a4f`: Standards 0,
Spec 0. Production analytics removal is a separate implementation.

Source startup analytics `2b20fbc7a` against `266425387`: Standards 0, Spec 0.
An initial Spec concern about the helper's Android browser tests was withdrawn
after tracing `android_test_exception_deps`: `brave/test/BUILD.gn` subtracts
the ads browser-test target on Android. Desktop tests remain unchanged.

Source promotional AdsService guard `57ebe9bbc` against `2b20fbc7a`:
Standards 0, Spec 0. JNI, tab/search and WebUI consumers tolerate the null
service; runtime acceptance is separate.

Source `9bec810f8` against `57ebe9bbc`: Standards 1 (enabled-Leo WebUI tests
still included on Android), Spec 1 (Java availability and native preference
registration diverge). The compile also detects unreachable feature queries;
`009b544f8` addresses those compiler errors. Caller/test corrections follow.

Source `3696a9154` against `009b544f8`: Standards 0, Spec 1 (three Android
menu tests still expect Leo). The prior preference-registration crash is
resolved; update those menu expectations without re-enabling the feature.

Source menu expectation correction `8a208dfc1` against `3696a9154`:
Standards 0, Spec 0. The review covers only this latest implementation;
the Android menu tests themselves have not yet been executed.

Source sponsored-home shutdown `68404c30c` against `8a208dfc1`:
Standards 0, Spec 0. The Android bridge, view-counter and diagnostic consumers
handle the absent service; removing takeover registration closes its CHECKing
controller entry. The new profile assertion is included for Android, while
enabled sponsored-home browser tests remain desktop-only. Runtime is pending.

Source TV inactive-tab promotion guard `c8957a6c3` against `68404c30c`:
Standards 1 (add the Android BytecodeTest hook-signature assertion), Spec 0.
The correction `6554e1f40` against `c8957a6c3`: Standards 0, Spec 0.
Root typed diagnostic correction `2dabec4` against `45edbf7`: Standards 0,
Spec 0. JVM behavior and full Nix checks pass; Android instrumentation is pending.

Source signed snapshot packager `eb5310d58` against `6554e1f40`:
Standards 0, Spec 0. Eleven tools/tv tests pass, including wrong-key/tamper
rejection and refusal to overwrite an artifact. Native activation and feed
publication remain separate work.

Source native parser `5f7bdc317` against `eb5310d58`: Standards 2
(optional return API and internal GN visibility), Spec 0. Correction
`adc9b2ea0` against `5f7bdc317`: Standards 0, Spec 0.
Host-runner guard `65ef6c4ea` against `adc9b2ea0`: Standards 0, Spec 0.
These are read-only reviews; focused native execution is tracked separately.

Source immutable storage `485926bb1` against `65ef6c4ea`: Standards 0,
Spec 0. Source provider integration `f3938b1c0` against `485926bb1`:
Standards 1 (update precedence documentation), Spec 1 (independent packaged
fallback reused the legacy DAT prefix). Correction `8d52513b1` against
`f3938b1c0`: Standards 0, Spec 0. The corrected prefix distinguishes the
independent packaged snapshot before its first signed update.

Source shared TV panel redesign `0597ee53c` against `8d52513b1`:
Standards 0, Spec 0. Separate read-only reviews cover compact trailing panels,
fixed headings, list/grid sizing, Material theme colors, Nala icons and retained
action/lifecycle/focus behavior. Actual clipping, contrast and remote navigation
remain subject to the emulator checks; review alone does not establish them.

Source wide-grid correction `c509c9254` against `0597ee53c`: Standards 0,
Spec 0. Source bounded content sizing `03aa6d30d` against `c509c9254`:
Standards 0, Spec 0. Each review is limited to its latest implementation commit.
Root no-reload diagnostic `022ad2c` against `72ab780`: Standards 0, Spec 0.
The diagnostic accurately distinguishes document effects from request traces.

Source startup readiness `fd1db3384` against `03aa6d30d`: Standards 0,
Spec 1 (P1: without DAT caching, an already-ready local provider could create a
partial engine before catalog registration, releasing queued checks too early).
The emulator trace confirms those premature builds, although that run's queries
happened to execute after the full builds and its blocking assertions passed.

Source catalog gate correction `dbeaa9a61` against `fd1db3384`:
Standards 0, Spec 0. Separate read-only reviews confirm the existing sentinel
now also covers independent uncached startup and the regression checks public
notifications before/after explicit catalog delivery. Only each latest
implementation commit is reviewed. APK and device evidence is recorded in
[device tests](device-tests.md#cold-start-blocking-correction-10-october-utc);
the native test source compiles but its test binary was not executed.

Source independent updater `a50b513df` against `dbeaa9a61`: Standards 2
(optional active metadata and mandatory preferences reference), Spec 1
(P1: SimpleURLLoader's string helper is capped at 5 MiB, below the real bundle).
Correction `98a9bb6c0` against `a50b513df`: Standards 0, Spec 0. The updater
streams with a 24 MiB cap before append; a signed 6 MiB regression passes.

Source browser/TV integration `bcc8531d7` against `98a9bb6c0`: Standards 2
(sequence assertions on new callback targets and delivery documentation), Spec 0.
Correction `95b26f1ba` against `bcc8531d7`: Standards 0, Spec 0. It also includes
the full shared-factory type needed by default refcounted argument callers.
These reviews cover only each latest implementation commit, not the branch.
All 17 signed-storage/updater host tests execute successfully; three signer tests
also pass. APK build r46 and real public-feed/UI acceptance remain pending.

Root update navigation regression `5fab713` against `39c177e`: Standards 0,
Spec 0. Both read-only reviews confirm the explicit fixture, bounded waits,
manual-check completion and Back focus checks. The executed 18-step replay
passes in 2.3s; it does not claim a particular feed result or validate signatures.


Android analytics `7326504e5` against `4e5850842`: Standards 0, Spec 0.
News/Sync/savings removal `01c89470c` against `7326504e5`: Standards 1
(Android history-reporting test retained desktop expectations), Spec 0.
Correction `ba5c07f6a` against `01c89470c`: Standards 0, Spec 0.
Final compile-time Sync guards `5c9a36c74` against `ba5c07f6a`:
Standards 0, Spec 0. Each review is limited to that latest implementation.
The final APK and all five changed Android native test translation units compile;
runtime native-histogram and blocking checks pass. The unit/browser-test binaries
were not executed. See the final emulator evidence in device-tests.md.

TV neutral identity `4772fcb93` against `5c9a36c74`: Standards 0, Spec 0.
Launcher lint correction `e41398dd1` against `4772fcb93`: Standards 0, Spec 0.
Each pair reviews only the latest implementation commit. The icon exception
matches the existing launcher-banner exception; blocking analysis remains on.
Cached x64 build r51 passes, including static analysis. Packaged manifest and
resources resolve the neutral launcher icon and television app-name alias;
runtime media-session labeling and fresh-profile request blocking pass.

Restored TV home startup `44ccdafef` against `e41398dd1`: Standards 0, Spec 0.
The latest-only reviews confirm the URL-based classification remains in the
TV-only branch, preserves null handling and leaves webpage auto-controls and
the separate first-run handoff intact. Build/runtime acceptance is recorded
in device-tests.md.
