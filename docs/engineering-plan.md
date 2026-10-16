# Android TV MVP engineering plan

## Objective

Implement [the MVP checklist](mvp-todo.md) by adapting Brave's Android browser. Preserve Chromium, Shields, profiles and browser security. Deliver a signed, sideloadable build after the checklist's device and usability criteria pass.

Write or update this engineering plan before each implementation stage. Keep incomplete implementation and unverified acceptance criteria distinct.

## Current direction: autonomous TV UI implementation (10 October)

The user requested an in-depth plan for a beautiful, convenient TV-first UI
using Kotlin/Compose while retaining Chromium. Follow the
[TV UI rebuild plan and ordered todo](tv-ui-rebuild-plan.md) for scope,
presentation/model ownership, design work, integration proof, migration and
acceptance gates. Independent emulator implementation and closeout are complete.
Stages0–5 have passed their scoped design/source/emulator checks; the working
UI checklist is54/54, including the authorized scoped6.5/V8 physical performance
and native-counter acceptance. Human A/V/remote/overscan, real phone/Safari,
second TV, standard in-place storage behavior and broader release remain limited.
Retain Chromium and native browser storage. The older
broad MVP/release backlog remains separate from this UI implementation.

The sections below record earlier implementation decisions and evidence.
Time-specific device restrictions/permissions describe those earlier tasks;
follow the user's current authorization for future device work. The12 October
hardware follow-up is separately authorized and does not reopen the release backlog.

### Current scope and latest implementation evidence

Original emulator-slice constraint (completed): the user was going to sleep
and had turned the TV off. Both loading feedback and phone Enter/submission
were restricted to emulator testing, with physical installation and acceptance
deferred until the subsequent authorization below.

### Phone webpage field submission — complete on emulators

#### Chromecast verification follow-up — 13 October

The authorized follow-up is complete on source `a11a40211`: the Chromecast has
been cleared of old Brave installations across users0/10/11/12 and the final
non-debuggable ARM APK is installed only on active user0. Actual native bounds
prove the corrected loading/connection-badge separation and return after
completion. Native controls suppress the loading overlay. A host companion
connected to the physical TV produces one trusted Search/submission and one
multiline Enter/newline with no submission. Stock TV Gboard remains selected.
See [hardware evidence](device-tests.md#chromecast-loading-and-enter-follow-up--13-october-2026).
The first streamed transfer stalled and the user rebooted the Chromecast; its
cause remains unestablished. The final update hit insufficient storage, so the
explicitly authorized global uninstall/fresh install was used. Build caches,
Android profiles and other sessions' devices remain intact.

Hardware inspection finds a concrete layout collision: while the companion is
connected, its native badge at60dp overlaps the loading panel at32dp. Keep the
loading panel's position and preserve the connection badge, moving that badge
below the loading panel's measured bottom with a gap. Observe native layout only
while the badge exists, update margins only when changed and remove the observer
on stop. Restore its original position when loading ends; use actual measured
bounds for enlarged text. Record a failing native bounds probe before editing,
then verify non-overlap/return on the corrected physical APK. This is a scoped
hardware bug correction, preserving the existing native design and input paths.

The user now authorizes TV checks. Verify the existing Chromecast's wireless
connection/ARM ABI, then build final source `3f84d8d42` in the retained Static ARM
cache with blocking analysis and `debuggable_apks=false`. Use one worker and
the existing memory/host guards while other sessions' emulators remain active.
Try a profile-preserving update first; the earlier explicit authorization permits
global Brave removal/reinstallation only if insufficient storage prevents it.
Verify signature, installed bytes and normal startup before checking compact
loading, completion/native-control suppression and native Enter/Search/newline
through the bundled companion. Use owned synthetic pages and public searches,
preserve native validation/composition/security guards, and distinguish a host
companion connected to the physical TV from actual phone/Safari acceptance.
Restore owned forwards/settings and record hardware evidence separately below.

Loading feedback and phone Enter/native typing handoff are implemented and pass
their scoped emulator acceptance as of13 October. Final combined source is
`3f84d8d42`; [device evidence](device-tests.md#phone-enter-and-native-typing-handoff--13-october-2026)
records stock-keyboard cases, genuine phone composition, native ownership and
background guards, live Google/YouTube query URLs and retained build attempts.
[Review closeout](input-review.md#phone-enter-review--13-october-2026) records
resolved source findings and the final visual `ship` decision. Google acceptance
starts from its ready fullscreen search field; results content is unverified.
No product refresh workaround is added for premature field-readiness probes.
The subsequently authorized Chromecast follow-up passes the scoped hardware
checks above; real phone/Safari acceptance remains deferred. The following
roadmap and corrections preserve the decisions leading to this implementation.

The user requests this after TV loading feedback: let a phone submit the active
webpage field using the same action as the TV keyboard's Enter/Search/Go, without
returning to pointer mode to click a site button. YouTube and Google search are
the motivating flows. Research the existing Chromium native input connection,
IME action/type metadata and phone field-edit protocol before choosing delivery;
do not infer form submission from a URL, field name or DOM button selector.

Plan and implement one clear phone action that follows the native field's action.
Differentiate a single-line search/submission action from multiline newline
behavior, preserve native validation/site handlers, composition completion and
current field/document ownership, and retain password/private/native-modal
exclusions. Decide labels and unavailable states from authoritative metadata.
Use existing input machinery and bundled companion UI; add targeted search,
form, multiline, stale-field and IME/composition checks. Record primary-source
research and the concrete protocol/UX plan before source edits. Finish the active
TV loading slice first; this roadmap entry is authorization for the next fix.

#### Phone Enter implementation slice

Native-slice review of `fa99073b3` finds stale action metadata after an oversized
field becomes eligible and a missing explicit adapter-validity guard for literal
Enter. Recompute on eligibility acquisition, reject invalid adapters and add
native coverage for oversized Search recovery, all action hints, duplicate
pending input, actual form submission and textarea newline. Preserve a drain
barrier when metadata rotates during an in-flight edit; never advertise the old
operation as ready early. Client/UI and paired-emulator acceptance still follow.
Client review observes selection dispatch remains possible during pending Enter.
Gate caret edits on ready native state and absence of an Enter intent; extend
the held-action regression to move the phone caret and require no native edit,
retained editor focus and exactly one action after acknowledgement.
Spec also finds the client skips its timeout once Enter is sent. Apply the same
bounded cancellation to readiness after dispatch; hold that acknowledgement in
the host fixture, then recover and require no retransmission.
Standards requires honest sent-timeout copy: delivery may already have executed.
Keep a field-local acknowledgement notice asking the user to check the TV,
distinct from unsent cancellation; retain it until editing/another action or
field/context reset. Deadlines also remain checked during an outstanding request.
Root fixture review requires a fresh field revision after pointer focus and
fresh per-case native key/submission/invalid-event counts. Blur only the owned
fixture target before clicking it, and use unique run text so retained fixture
results cannot satisfy cross-origin/contenteditable/validation acceptance.
Correction review observes setup itself can rotate the old field revision.
Require the phone to observe no eligible field after owned blur/preparation,
then click and await the new ready field. This positive no-field boundary avoids
mistaking an old field's reacquired lease for the intended focus acknowledgement.
Runtime isolation: another T3 session claims the original TV/phone controllers
while verification is running. Keep those sessions/services intact and move
paired acceptance to the stopped `brave_tv_launch_followup_api36` profile on
emulator5560 and a new, non-overwriting `brave_phone_enter_20261013_api36` on5562.
Reuse the verified d960 APK and existing SDK/build caches. Record the failed
shared-device attempts without attributing their assertion failure to interference
until isolated testing supplies evidence. Restore only owned test settings and
stop only controllers/emulators still exclusively owned by this task.
The final native textarea check also fails on the isolated TV: Enter is accepted
but expected text/readiness is not observed. Add guarded synthetic-fixture state
and native key diagnostics to this case, then rerun before changing input delivery.
Keep the initial passing run and both subsequent failures distinct.
Diagnostics show a genuine trusted Enter and renderer text `\none`: insertion
occurred at the beginning, with native composition active afterward. The test
only waited for text/readiness, omitting caret and composition ownership checks.
Finish only its own synthetic composition, explicitly acknowledge selection3/3,
and assert no active composition before Enter. Preserve the newline assertion;
do not change production delivery based on this invalid caret precondition.
For phone IME acceptance, extend only the existing test keyboard's phone layout
with an editor-action stimulus above its original two-button bottom row. Preserve
the existing TV layout and old probe coordinates. Exercise genuine phone
InputConnection composition/commit and keyboard Enter through the paired UI,
then restore stock IMEs and remove only test fixtures installed by this task.
The isolated TV cold process has no DevTools socket, matching an earlier
recorded limitation of this preserved AVD. Do not change product debugging
policy for diagnostics. Add an optional run-scoped report to the owned normal
Enter fixture and serve it through a loopback-only test server. Select cases by
fresh query navigation through the actual companion, focus by native snapshot
bounds and actual remote pointer commands, and require fresh trusted key/form
reports keyed to that run. The existing CDP-based probe remains available for
emulators with that endpoint. Fixture reports must keep monotonic per-run
sequence order across concurrent requests, preserve UTF-8 across body chunks,
and recheck exact key/submission counts after native acknowledgement so an
intermediate successful report cannot hide a duplicate. Native input delivery and real phone UI still
supply every edit/action; no synthetic TV key or forced form submission.
Paired native reports pass all ten search/form/multiline/frame/validation/password
cases with both stock IMEs selected. Genuine phone InputConnection composition
uses the existing deterministic IME fixtures on both emulators, as in the earlier
phone-input workflow: the stock TV IME can finish native composition early.
Keep this separate from stock-keyboard acceptance. Require an actual sent native
Enter request to reject while composition is active, no submission from commit,
and exactly one trusted native Search from the phone keyboard's editor action.
Restore both selected IMEs even if one restoration fails; preserve the existing
TV fixture APK/signature. Closeout follows the repository's no-delete rule:
disable and retain the newly installed phone fixture, restoring the original
selected IMEs. This supersedes the earlier removal wording above.
Add a controlled normal-fixture JavaScript alert case to verify actual native
modal ownership rejects an Enter API request and clears page/editable metadata.
Dismiss through Back without capturing a protected/private window, then require
no replay. Native Menu keys route to the active stock keyboard in the earlier
attempts; do not count those attempts as browser-controls-owner acceptance.
Live YouTube now demonstrates the missing typing handoff: its search input
receives the phone text, but the stock TV Gboard re-establishes composition,
so the guarded Enter is blocked and the URL remains `m.youtube.com/#searching`.
Do not weaken composition/version guards or force site submission. Add an
explicit current-field phone typing lease before editing. While leased, hide
and detach only that field's physical TV InputConnection without blurring the
renderer field or changing its input type, text, selection or native action.
Gate keyboard display and physical InputConnection creation in signature-checked
IME hooks; preserve the platform's own suppression/privacy/EditorInfo behavior.
A field-scoped preparation operation must reject active composition and use the
native queue barrier. Keep the editor read-only until the lease is ready and the
TV keyboard has closed; Type selection or an editor tap starts the handoff.
An explicit Finish composition may finish and hand off; composition commit alone
still cannot submit. Release on field loss, native ownership, physical TV input,
Type exit, phone background/session end and destruction. Do not automatically
reclaim from a physical controller without another phone editing gesture.
Add host preparation/readonly/release checks and native connection/field/lease
coverage, rebuild from retained cache, then rerun both stock-keyboard website
cases and genuine phone composition. Live Google/YouTube query URL checks,
not rendered-result/performance claims, remain part of acceptance. Recapture and
review the changed UI state copy within the second bounded design round.
Native review requires an equal-metadata focus change to schedule Chromium's
next-state InputConnection restart; reset/destruction retain their own teardown.
Client cleanup is session-scoped even during pending preparation/edit. Bind any
delayed gesture to its epoch/browser/field and bounded deadline; cancel on loss.
Wait for cleanup before another preparation and exclude pre-cleanup command or
poll replies, including response reordering. Host checks must hold the original
leased snapshot until after cleanup, then require a fresh handoff on re-entry.
Build attempts r6/r7/r8 are interrupted by the host's6GiB availability guard.
Preserve their logs/output, suspend only this task's isolated emulator services
with their profiles intact, and lower the cached retry to two Siso workers.
Do not stop other sessions' devices or weaken the memory/analysis checks.
The paired handoff check finds stock Gboard retains `mIsInputViewShown=true`
after its window closes. The owned native snapshot contains no keyboard nodes,
while InputMethodManager reports `mInputShown=false` and the service reports
`mWindowVisible=false`. Require actual input/window visibility for both opening
and yielding; the configuration flag alone is not a window-visibility oracle.
A later fixture click misses after the native toolbar changes layout. Re-read
owned native bounds on each bounded retry and require the exact target field
to acquire native focus; command acceptance alone is not focus acknowledgement.
Stock Gboard can pan the fixture heading off-screen after that focus succeeds.
Retain positive ownership using either its visible heading or its exact native
address-bar URL, alongside app/document/field guards; do not accept arbitrary
page titles or omit ownership validation.
The cached main build rejects the extended hook's ten-value operand stack
against upstream's eight-value maximum. Raise only this hook's declared maximum
to cover its added arguments; preserve locals, signature checks and warnings-as-
errors. Rebuild from the retained failed output; do not reset dependencies.

[Primary-source research](phone-field-submit-research.md) establishes that field
type and `enterkeyhint` cannot prove search/form intent. Send native input through
Chromium's IME adapter: Search/Go/Send/Done use its corresponding editor action;
otherwise send a fixed Enter key pair. In particular, default Next must not
replace the user's requested Enter. The renderer retains validation, site key
handlers, implicit form submission and multiline/contenteditable newline rules.
No site/URL selector heuristics, synthetic DOM keys or forced form submission.

Extend the signature-checked native-state hook with input mode/action metadata.
Use existing `ImeUtils.computeEditorInfo` to expose a small action vocabulary,
logical multiline flag and composing state. Metadata changes invalidate field
identity even when text is equal. Add one field-scoped `edit: enter` command,
matching current action, exact version and all existing browser/field guards.
Reject active native composition. Track action completion using the existing
native queue barrier and a refreshed renderer state, rather than predicting
text/focus/navigation results. Retain current timeout/invalidation behavior.

Extend the existing phone Type panel with a primary Enter/Search/Go/Send/Done
button and matching keyboard hint. Keep the stable textarea and native multiline
behavior; its visible action is a reliable fallback for phone keyboard variance.
Cancelable Enter key/beforeinput events dispatch one native action, avoiding
both a local newline replacement and a second key. Composition candidate Enter
does not submit; composition end never auto-submits. Preserve pasted newlines.

A single bounded intent captures session/document/field identity and the latest
phone text/selection. Flush coalesced edits, wait for their exact native
acknowledgement, then send Enter once. Keep the editor focused/read-only while
the action is pending and disable duplicate submission. Cancel on target changes,
conflicting acknowledgement, composition, timeout, disconnection or lifecycle
loss; never retarget or replay. Preserve password/private/native-modal exclusion.

Add bundled-client regressions for immediate typing/Enter, held acknowledgements,
duplicate/candidate Enter, multiline/paste, changed fields, failure and reconnect.
Add controlled native search/form/validation/keydown/multiline/contenteditable
fixtures plus action-hint and equal-text metadata checks. Reuse existing paired
TV/phone emulator workflow, stock IME and test-only native composition fixture
where needed. Verify the packaged companion and native renderer over emulator
LAN; current public Google/YouTube behavior is a separate bounded emulator
check, not a deterministic fixture guarantee. Build committed source with
retained Nix x64 cache and blocking analysis; review each latest source slice
against its parent, plus one bounded phone UI design review/documentation handoff.

### TV webpage loading feedback — compact native status

Outcome: source `1807ad165` passes the retained blocking x64 main/test builds,
all five native loading/ownership regression cases and fresh Impeccable visual
review (`ship`) at both TV resolutions and enlarged text. Exact artifacts,
failed attempts and scope limits are in device-tests.md; latest source review
corrections are in input-review.md. The loading slice is ready for the separate
future real-device installation/check. Continue with the authorized phone action.
The fresh design documenter checks implementation, incumbent and all four APK
captures; no native token drift is found and phone authority files are preserved.

The user requests clear feedback after submitting a URL and chooses a compact
indicator/progress bar so partially loaded pages remain usable. Extend the
established native TV presentation: a small opaque charcoal status surface,
warm readable “Loading page…” label and sage linear progress, inset from the
top/right TV edges. It is display-only, never takes focus, and does not cover
the viewport with a loading panel. Use localized copy and existing theme roles;
keep the phone companion's separate PRODUCT/DESIGN files unchanged.

Observe only the selected native Tab's loading/progress events. Show immediately
when Chromium begins navigation, including before Home's native view is replaced;
track redirects/reload/history and clear when loading stops, fails or is canceled.
Use actual WebContents/observer progress, not elapsed-time estimates or site DOM
injection. Browser completion does not establish a site's later app readiness.
Keep progress callbacks independent of cursor/document-lease invalidation.
Hide during pause, focus loss, native/security takeover and locked private state;
refresh the current tab on resume and detach/dispose observations/views at teardown.
Background tabs must never update the displayed state or expose page identity.

Add native observer/presentation regression coverage and a controlled delayed
response fixture for URL submission, early content, completion, Stop, replacement,
tab switching and native ownership. Capture real emulator TV loading/settled
states at normal and enlarged text settings; run one bounded design review/fix
batch with impeccable, plus exact-parent Standards/Spec reviews. Reuse the retained
Nix x64 outputs, four workers,18/22GiB limits and blocking Android analysis.
Preserve emulator profiles and all caches/artifacts. Chromecast delivery and
hardware readability are separate from this implementation/emulator slice.

### Unified TV page browsing — deliberate edge scrolling

The user authorizes implementation of one primary Browse page control for the
physical TV remote. D-pad moves the pointer; reaching the visible webpage's
top/bottom edge never scrolls by itself. Continuing to hold the outward arrow
for450ms after arrival starts conservative vertical wheel scrolling at the
pointer. Release, reversal, OK, canceled input, focus/native-owner changes,
navigation and viewport changes cancel edge intent. Repeated events after an
interruption must not restart scrolling without a fresh directional press.
An idle cursor never scrolls; left/right remain pointer movement. Preserve
single-click-on-release, hidden-cursor wake and Back-to-controls behavior.

Keep the existing Scroll mode as secondary Scroll here for nested/horizontal
content, with its current wheel delivery and OK-to-pointer behavior. Use a
small directional cursor cue for pending/active edge scrolling and localized
button hints. Account for visible content offsets and fullscreen; do not add
DOM injection or clickable-element heuristics to production input delivery.

Implement the timing/state policy in TvRemoteInput and adapt native event time,
viewport bounds and cursor feedback in TvBrowserControls. Add deterministic
JVM checks and a normal synthetic webpage/native uinput regression for edge
arrival/clicks, delayed continuous scrolling, release/reversal, sticky controls,
nested fallback and fullscreen. Plan/source/test/evidence changes are small
signed master commits with latest-only Standards/Spec review. Reuse the retained
x64 checkout/output cache through Nix, four workers,18/22GiB limits and blocking
Android analysis. Verify emulator first without profile clearing; Chromecast
installation and physical-remote calibration remain separate future work.

Implementation and emulator outcome: source `f76523e5a` passes the cached
blocking x64 build, exact-parent Standards/Spec correction reviews and host
checks. Native edge/buttons/continuous-hold/release/reversal/nested/fullscreen/
Back checks pass twice on the preserved clean AVD; the final test `39da822`
anchors the previously retained X1632 and checks actual cursor pixels, not stale
renderer hover. Native alert/confirm/prompt ownership and cursor/document return
also pass on the final APK. Scope and failed-attempt evidence are in device-tests.md.

### Authorized Chromecast delivery — unified browsing

The user now authorizes installing source `f76523e5a` on the Chromecast. Build
the optimized ARM Static APK using the retained cache, four workers,18/22GiB
limits, blocking Android analysis, symbol_level0 and debuggable_apks=false.
Verify signature/package/ABI and preserve source/artifact provenance. First
attempt an update that retains the existing profile. Only if installation
reports insufficient storage, the user explicitly authorizes uninstalling
this Brave package globally from all profiles and installing it again. Keep
unrelated apps, Android users, SDK/build caches and previous APKs intact.
Verify installed APK bytes/non-debuggable configuration and bounded native
startup/controls; record whether the authorized storage fallback was needed.
The user also asks to be notified if the TV is unreachable so they can turn it
on. Reachability preflight passes; report any disconnect that prevents delivery
instead of treating a connection failure as insufficient-storage authorization.

Delivery outcome: optimized ARM build and signature/ABI/non-debuggable checks
pass; installed bytes match source `f76523e5a`'s preserved artifact. The update
fails with insufficient storage, so the authorized global uninstall removes
Brave data from all four users; fresh user0 installation succeeds. Android
users and unrelated apps remain intact. Native Home and controls pass after a
Google TV launcher interruption and normal relaunch. Another T3 session owns
agent-device, so it is preserved; Android native input and T3 images establish
the bounded startup/controls check. Stock IME is unchanged. Physical remote
hold calibration remains open. Exact build/install/evidence limits are in
[device-tests.md](device-tests.md#chromecast-delivery-follow-up--12-october-2026).

### Phone companion redesign — touchpad browsing first

Final phone redesign outcome: source87b is deployed on the available TV after
an explicitly authorized Brave-only storage fallback. The installed APK checksum,
native Home/Address focus, actual TV-served resource hashes and native experiment
shutdown pass. Full controls/native text/stock-IME acceptance passed on the retained
emulator profile. Physical Brave data was intentionally removed from all four
users; fresh installation is user0 only. Physical in-place upgrade and real phone/
Safari checks remain unverified. All task-owned services/emulators are stopped;
compile/SDK/artifact caches and emulator data remain. Exact artifacts, failures,
reviews and test boundaries are in the phone redesign evidence.

Physical storage fallback: the optimized ARM build passes in1m58.99s, peak
17242796032B (16.06GiB), but in-place user0 install fails with
INSTALL_FAILED_INSUFFICIENT_STORAGE at868MiB free. The earlier preference to
retain physical data cannot be fulfilled by that install. Use the user's explicit
later authorization, “feel free to uninstall and clear old app install and its
storage on all profiles and build on the tv,” for a global Brave-only uninstall
and fresh user0 installation. Confirm absence across the actual Android users,
then verify the pinned installed APK and native Home/served assets. This intentionally
removes physical Brave data; emulator upgrade data and all build/SDK caches remain.
Do not count it as a physical in-place upgrade pass or remove unrelated apps/data.

Earlier delivery plan: reviewed source87b completes host and actual APK emulator
acceptance, including the full native controls/text suites, stock IMEs and real
Disconnect/listener refusal. Package delivery for the user's available TV follows
using retained optimized ARM cache, four workers,18/22GiB and swap0. Acceptance:
signature/ABI/non-debuggable artifact provenance, data-preserving physical update
and native Home/served-asset smoke. Use the later explicit free-TV authorization;
preserve current profiles and do not repeat earlier storage clearing. Real phone
and Safari acceptance remains pending. See phone redesign evidence for prior
failed probes, viewport corrections and exact final APK checks.


Design proposals are concrete inert390x844 source-owned HTML sketches, with a
T3 inline comparison and visual chooser. User confirmed touchpad/quick controls;
user selected After hours (deep blue/soft teal). Implementation acceptance below
replaces the proposal-only status; native protocol/security ownership stays intact.
Current companion synthetic preview measures pad top466px/height260px and page
height1105px on390x844, confirming the long-stack problem. Product truth is scoped
to the web companion; no dedicated phone playback command is invented. Operational
question state, downloaded references and review captures are development-only/
ignored. The chooser closed unanswered; its structured-tool fallback carries
After hours/Soft charcoal/Clear blue/Night wayfinding/re-roll/category-standard.
The explicit visual answer now authorizes the After hours implementation. Sketches
remain synthetic design evidence, not production/native-device acceptance.

Implementation slice: rebuild bundled HTML/CSS and add local Remote/Type/Tabs
navigation with keyboard focus; keep native commands/edit epochs unchanged.
Acceptance: QR waiting/manual recovery, gestures and button alternatives, native
editing races, tab focus restoration, sensitive-state clearing and responsive
320/390/landscape/desktop views; latest-only reviews, finish review/design records,
cached x64 GN APK packaging and native emulator companion smoke. No data wiping.
Host regressions and two bounded visual rounds pass; finish reviewer scored the
paused-copy correction resolved/ship. Packaging/native acceptance remain pending;
see [phone redesign evidence](phone-remote-redesign.md).
Latest source Standards review found one punctuation issue in the new Network
summary. Change it to “Network and safety”; verify the bounded text-only correction
and review the latest correction commit before packaging.
Root Standards review found a weak no-field drag assertion: a pre-poll move could
satisfy it. Observe a completed held-pointer poll and require the next movement
request after it; run the focused host suite and review the latest test correction.
Native-integration slice: adapt the existing phone-controls probe to switch Type
for address entry, Remote for touchpad and Tabs for native tab actions; require
unique normal fixture/companion targets. Cached x64 build passes in1m38.84s,
observed memory peak14160662528B; emulator update succeeds without clearing data.
Acceptance: actual bundled asset hashes, simulated-private-LAN QR/approval,
controls/gesture/navigation/tab/security-rejection probe and native text bridge.
Source87b host focus regression and complete companion suite pass; latest source
Standards/Spec and narrow finish reviews report no findings. Package the reviewed
correction in retained x64 output, then prove full native text and controls before
closeout. Source901 complete controls and served-asset acceptance passed; its
native typing failures are recorded separately in phone redesign evidence.

Native typing focus correction: a successful edit temporarily reports the same
field as not ready while Chromium acknowledges it. Disabling the phone textarea
then blurs its keyboard and interrupts subsequent edits/composition. Keep it
enabled only for our pending same-field replacement/selection; retain initial
field-loading, changed-field, paused/password and native command readiness guards.
Acceptance: host regression must fail before the change and pass after; full
native typing suite, latest-only source/root reviews and cached repackaging.

Viewport probe follow-up: source87b passes actual Unicode, composition,
selection/deletion, stale-field rejection and textarea editing. The remaining
contenteditable aim repeatedly hits above its target with the TV keyboard open.
Dismiss that real native keyboard with verified-emulator Back before switching
fixture fields; wait for its visual viewport to settle, then recompute coordinates.
Keep native pointer/text behavior unchanged. First rerun only contenteditable and
password targeting; then complete the strict suite on the same APK if green.

Native text probe correction slice: mobile IME viewport changes make desktop
coordinate clicks hit unrelated controls. Explicitly focus the companion editor
and wait for its selection acknowledgement before filling; keep every TV edit
on the genuine native bridge. Bound probe waits, then run the full existing
Unicode/composition/selection/deletion/stale/password suite. Do not count the
failed first-replacement runs as acceptance or modify native validation to pass.

Native tab-handle rotation correction: real selected-tab changes rotate opaque
handles. Preserve matching-row focus when possible; if a selected row handle
rotates, restore the engine-selected row rather than New tab. Keep native tokens,
revision validation and all security behavior unchanged. Prove host regression
red on current source, then green; review/pin/repackage and retest native selection.

The user invokes Impeccable redesign and confirms touchpad browsing/quick controls
as primary. Replace the companion visual world and long control stack with a
compact identity, dominant thumb-reachable pad, clear navigation/click/scroll
controls and separate typing/tabs tasks. Preserve bundled/offline assets, existing
native command/editing identity, QR waiting/manual/approval/paused/expired recovery,
no private/password/native-security access and HTTP experiment warning. Confirm a
concrete visual direction, inspect incumbent in the product-native preview, build
all states and test the actual companion handlers. Two batched visual inspections
maximum, targeted host/protocol/IME regressions, independent finish review and
source-owned product/design records. Source/root signed incremental master commits,
latest-only Standards/Spec reviews and cached Nix GN packaging remain required;
no browser data wipe or unrelated cache deletion. Record browser preview versus
actual APK/native integration evidence distinctly.

### Authorized physical UI acceptance — 12 October

Source090 final normal Home/Address focus and phone badge absence pass; ordinary
Home screenshot is retained. Controller is revoked, next client command rejected,
old44009 listener connection refused. Owned companion tab/SDK lease, fixture
reverses18083/18088 and fixture services are closed/stopped; completed r4 unit is
already auto-unloaded (combined stop reports that, then running-unit check is0).
All task-owned emulators are stopped. Synthetic profile, all build/dependency/
artifact caches, shared ADB/T3 and Android users/unrelated apps are preserved.
Review only this final root closeout commit against its exact parent, then push
and verify clean synchronized source/root masters. No new source change/build
is needed after the reviewed source090 actual native and physical acceptance.

Current source090 completes actual TV30m01.385s/31 native samples and181 accepted
phone commands, zero rejection/disconnect and same document1791836482137.7.
Frames5875→58950/dropped65→139, total-minus-dropped delta53001; whole-package
PSS266.835→270.383MiB, range266.835–283.824MiB. Move HTTP ack median/p95/max
26.4/39.8/166.1ms (outer26.4/40/166.3). Post-run actual fullscreen/phone move/
native USB Back returns the same playing document and cursor1248,720 while
alternating left/right; stale928/960,800 absent. Disconnect rejects a subsequent
client command and gives fresh-invitation guidance. Original failed92 run stays
failed. Carry matched source1c shell metrics only where Home/controls are unchanged;
source090APK growth0.539MiB remains within Stage0 budget. Record54/54 for the
scoped UI contract, with human viewed/audible A/V, codec/DRM, physical-button/
overscan, realphone/Safari/secondTV and standard in-place storage limits explicit.
Finish native Home/Address focus, stop only owned fixture/watchers/AVDs/ports,
retain synthetic profile and all build/dependency/artifact caches, then review
only the final root evidence commit and push synchronized clean masters.

Source090 physical cursor now passes1280,720 first phone attachment inside
already-playing fullscreen,960,800 phone movement/Back,928,800 mixed native USB
Back/pulses (stale608/640 absent). Same document1791836482137.7, growing frames
and no media error; awake phone pulses21/21 and41/41 accepted. Correct invalid
SDK ref prefix and immediate-transition diagnostic probes using fresh @refs and
bounded observed fullscreen before Back; those invalid probes are not defects.
Renew native invitation/approval before a fresh uninterrupted30-minute session:
31 minute-spaced native media/PSS/recent-CPU samples, phone zero moves every10s,
existing500ms polling, same epoch/document, no disconnect/reject, increasing
presented frames and post-run fullscreen/native Back/cursor recovery. Keep the
source92 AX crash run failed and captured-video-black A/V limitation explicit.

Source090 data-keeping retry succeeds74.651s after three5-second code-removal
waits; installed SHA208bdcb6 matches verified artifact, UID10136 retained.
The first insufficient-storage attempt and successful source92 rollback remain
recorded. Browser-only cache request times out30s; no cache clear success claimed.
No profile reset. Reopen the explicitly targeted device driver after its owned
lease was closed for replacement; require native post-install normal URL/bookmark
retention, then fresh Home→approved phone→ordinary native video/fullscreen/cursor
and full30-minute AX-observed playback/controller acceptance on source090.

Source090 ARM r4 passes41.00s Siso5steps/44.50s GNU, memory14.268GiB peak/
17.972GiB minimum host available, no guard/OOM. First data-keeping replacement
fails INSTALL_FAILED_INSUFFICIENT_STORAGE after65.917s; compatible source92
restore succeeds without data clearing. Device exposes package clear --cache-only
on Android14; inspect retained native URL/bookmark after restoration, clear only
this browser's owner0 cache (retain profile/data/other apps), measure free space
and retry the reviewed corrected APK once with verified fallback. Do not count
the failed install or standard in-place migration as acceptance.

Source090/root0465 latest reviews are Standards0/Spec0. Corrected r85 blocking
analysis/build passes53.29s Siso19steps, peak18.040GiB/minimumhost15.406GiB,
no guard interruption/OOM. Both actual native stale-node cases now pass7.406s/
7.069s, including exposed-root positive controls; video/fullscreen passes7.481s
and private-window protection7.346s. Production/TEST update in place on the
preserved launch-followup AVD. Stop only its owned emulator, reuse Static ARM
cache for the same reviewed native correction, preserve verified non-debuggable
artifact/provenance, retain TV data with compatible -k code replacement, then
repeat physical cursor and a fresh complete30-minute native media/phone/AX run.
The failed27-minute source92 run remains failed;52/54 and6.5/V8 stay pending.

Sourcef6/root5f latest reviews are0/0. Cached r84 passes blocking analysis in
16.74s Siso14steps, peak8.673GiB/minimumhost20.764GiB. Production bytes still
match92. The exact video-control loop now goes red in seconds: fresh native
info crashes the process in7.987s through the stale-node request; cached
info incorrectly returns success and fails its rejection assertion in7.168s.
Both reach the real ignored-but-existing mute-control node after playback/fade.
Implement the scoped fix now: two one-line Chromium patch hooks and a small
chromium_src override using native IsIgnored validation before both builders.
Keep all upstream traversal, assertions and exposed-node behavior. Revalidate
the ignored/existing test identity within the same UI-thread callback as each
request, closing the setup-to-request race. Review only the correction commits,
then build once per ABI under existing limits and rerun those two cases plus
actual native video/fullscreen and private-window protection. Preserve source92
TV synthetic data using the proven -k code-replacement workflow, and rerun the
original physical fullscreen/30-minute media/phone/AX-observation acceptance.

Source106/root9f latest reviews are0/0. Cached r83 passes blocking analysis in
30.34s GNU/26.75s Siso15steps, peak12.526GiB, hostminimum20.419GiB. Production
APK bytes exactly match92; TEST updates in place on the preserved AVD. Both
simple hidden-button cases fail in setup: the required still-existing ignored
node condition is not reached. These are invalid reproductions, not the desired
native red. Replace that synthetic visibility change with the actual ordinary
HTTP video fixture: capture its exposed native mute-control ID while paused,
start real playback, wait boundedly for fading controls to retain that same
native ID while ignored, then exercise both info entry points. Require the
identity precondition and exposed-root positive control; do not test a deleted
node or disable accessibility. Review the test correction and rebuild TEST
against unchanged production before applying the native guard.

Source92 endurance run fails at approximately27 minutes: main browserPID24756
aborts with SIGABRT/DCHECK at ui/accessibility/ax_node.cc:90 on an ignored,
invisible video-control button. Retain27 native samples,163 accepted commands
and4 rejected after disconnection; do not accept30 minutes or6.5/V8. Symbol
addresses match retained libchrome BuildIdf9ebaf42 and resolve through Android
PopulateAccessibilityNodeInfoChildIds→PlatformChildren→IsLeaf→unignored child
count. The TV returns to its previously open Android App Management task; this
is not proved human interference or sleep. Native IsNodeValid already rejects
ignored nodes, but fresh/cached node-info entry points only reject missing nodes.
Before changing production, add a focused real-engine stale-node-ID regression:
retain an existing native button ID, hide it, require that the same node still
exists but is ignored, then exercise fresh/cached Android node-info requests.
Build TEST against unchanged source92 production and preserve the actual red.
If confirmed, add minimal source-fork-owned hooks to use native ignored-node
validation in both entry points, leaving exposed nodes and assertions intact.
JNI generated wrappers make wholesale method-renaming overrides unsafe; prefer
two one-line patch hooks plus one small chromium_src policy macro over duplicating
those functions. Review latest source/root commits and reuse both cached outputs
for corrected native runtime and the repeated actual hardware acceptance.

Current source92 physical cursor checks pass at1280,720 for first phone attachment
inside already-playing fullscreen and at960,800 after phone movement/Back. Mixed
phone/native input passes at928,800 during sustained left/right pulses, distinct
from the stale physical coordinate. All retain document1791831470211.9 and actual
video presentation. Renew the explicitly approved direct-LAN controller, then run
31 minute-spaced native playback/PSS/CPU samples across30 minutes plus bounded
authenticated zero-move commands every10 seconds. Require unchanged document,
increasing presented frames, no paused/revoked/stale command, and post-soak
fullscreen/Back cursor pixels. Keep source1c matched performance attribution,
standard in-place storage failure and real-phone/audio/DRM limitations explicit.

The user now says the TV is on/free, leaves it available for unattended work,
and explicitly permits uninstalling the old browser and clearing its storage
across all TV profiles. This supersedes the previous no-Chromecast restriction
for this run. Verify the discovered paired endpoint/model/ABI/users/storage,
remove only com.brave.browser_default and its data (retain Android users and
other apps), and use the preserved source5829 optimized non-debuggable ARM APK
to seed a small normal synthetic baseline when feasible. Measure uncontended
startup/panel/input/frame/PSS/installed footprint on the same physical TV and
configuration, then update to current source1c using the existing ARM cache.
Keep baseline fixtures/profile constant for comparison rather than clearing
between candidates. Record fresh-install behavior separately from upgrade data.

Build only one optimized Static ARM production APK in Nix with SISO_LIMITS=local=4,
MemoryHigh18GiB/MemoryMax22GiB/swap0, blocking Android analysis, symbol_level0,
debuggable_apks=false and the6GiB host-available guard. Current cached source1c
already matches the signed/pushed source pin; no checkout reset/sync is needed.
Preserve final artifacts/signatures/GN/log/memory provenance. Compare hardware
against the existing Stage0 relative budgets; keep network/renderer/media load
separate from shell measurements. Exercise real native Home/address/settings/
tabs/library/focus, fullscreen/cursor/group recovery and sustained ordinary video.
Injected D-pad and visible pixels are not human physical-button/audible-A/V proof.
Preflight/authorized all-profile removal and the matched physical measurement
contract are in [hardware evidence](tv-ui-hardware.md). Initial baseline Home/
controls pass; ARM build now passes with verified source1c artifact. Hardware
performance acceptance remains pending. Baseline timings/PSS/panels are retained;
Android denies release OAT du, so use the trusted OS storage report. In-place
installation fails for storage; the existing cleanup authorization permits
removing the temporary baseline and fresh installation with the same one-Home
configuration. Preserve this failure and distinguish fresh comparison from upgrade.
Current fresh install succeeds73.302s and matches the verified ARM APK. Native
Compose Home/Address focus pass. Initial hardware cold/warm/PSS/median panel
and frame comparisons pass relative limits; first-panel p95 misses25% by7.207ms
in a10ms shell bracket. Baseline had an untimed first-popup warmup after its
interrupted probe; current first popup was timed. Preserve both raw runs; verify
warmup parity and native clock uncertainty before accepting V8. Use documented
same-engine/package/signer/version compatible presentation rollback to5829 via
explicit streamed install without data clearing, perform one untimed popup after
a fresh process and ten timed panel samples for both variants, then restore1c.
This bounded panel-only investigation also tests whether streaming avoids SDK
installation staging pressure. Startup/PSS phases remain retained, not rerun.
No private tabs or schema change exist in this one-normal-Home synthetic profile.
Explicit streaming rollback also fails storage; current1c stays installed.
Owned failed sessions are historical/destroyed and their stage directories are
already absent. Native libraries are uncompressed and extractNativeLibs=false;
no permission, global-cache or disk-threshold workaround is justified. For the
necessary warmup-parity investigation, tear down only the task-owned one-Home
test installation and use the authorized fresh browser install workflow for
each candidate. Seed the same empty normal Home, one fresh process plus one
untimed controls popup, then10 panel samples. Preserve initial startup/PSS and
all failures; do not claim this proves hardware updating or fixes first-use cost.

Actual first-use Compose cost remains the third falsifiable hypothesis if matched
warmup/precision cannot explain the miss. New controls Back returns Home10/10.

Matched warm-up completes baseline-r6/current-r2 and the red-capable relative
budget checker turns green without source changes. Physical panel median
339.033→261.026ms/p95823.701→286.730ms; new-panel frame median/p95
39.199/111.474→19.831/41.605ms. Package deadline jank37.30→9.96% remains
distinct from frame duration/cadence. Original first-use miss and hardware
update/storage failures are retained in [hardware evidence](tv-ui-hardware.md).
Next acceptance slice uses source1c on owner0: native Home/settings/About/tabs/
library/address focus recovery, actual nonalphabetic USB D-pad held-OK/cursor
wake and fullscreen/Back; existing loopback media fixtures via explicit TV
reverse18088/18083;30-minute playing-document/frame/PSS/CPU observations with
one explicitly approved LAN companion. Native or OS modal/private/password
boundaries stay enforced. Human physical-button/audio/DRM, real phone/Safari and
second-TV checks remain separate. Preserve synthetic profile after setup;
revoke the controller and remove only owned fixture processes/ports on closeout.

Physical cursor follow-up exposes an actual source1c regression: video fullscreen
and Back keep the same playing document, but the retained native cursor layer
does not render after exit. Sustained native left/right keeps its View visible
with a recent frame and still yields no cursor pixels; reselecting Page cursor
restores the pixels at the expected location. Preserve failed calibration and
capture attempts separately. The initial atomic command omitted uinput's file
argument and is explicitly invalid; later commands use explicit file arguments,
set-e and device-file capture while D-pad pulses keep the idle timer awake.
Before expanding hardware acceptance, reproduce this narrow exit/capture loop
and repair the retained overlay at the native fullscreen-exit lifecycle seam.
Reattach only the existing cursor View to the same current Chromium ContentView
after native layout, preserving position/scroll mode and canceling held OK. Fence
the callback by actual tab/document/view identity, activity/input/security/private
ownership; dispose pending callbacks and the fullscreen observer. Reuse this
attachment path from real TV/phone callers without creating browser contents.
Validate the actual hardware red pixel loop after the signed/pinned cached ARM
correction and focused actual-engine emulator lifecycle/private-security/input
checks; do not add a shallow test that merely asserts the callback was invoked.
The original matched performance evidence carries separately; V8 remains pending.
Latest source d8b review reports Standards1/Spec2: center text could satisfy the
new pixel check, and fullscreen resume could redraw old physical coordinates
after phone movement (or leave a phone-only cursor in Controls mode). Correct
the fixture's dark sampled region and verify its cursor-absent background.
Route real phone positioning through the existing TvRemoteInput state so resume
and the next physical movement share current clamped coordinates and canceled
held OK. The focused input contract test is red before this interface exists;
require its green result plus actual phone-moved and phone-only fullscreen/Back
pixel checks. Review only the new correction commit before the cached build.

Correction source4dde and its root pin pass latest-only Standards/Spec review
with zero findings. Both bounded cached builds pass blocking analysis: ARM52
steps and x64136 steps, each about four minutes. Preserve both artifacts before
runtime checks. The TV package manager documents `-f` as internal-flash placement;
try one explicit streamed `-r -f --user0` update after stopping only our browser
media process. This is a bounded placement investigation, not a storage-check
bypass. If Android again rejects the update, retain the failure and use the
already authorized browser-only fresh installation, explicitly recording lost
synthetic fixture state and unverified physical upgrade persistence. Update the
preserved launch-followup emulator profile in place and run separate focused
fullscreen, held-OK and protected/lifecycle instrumentation processes without
failure screenshots. Seed hardware fixtures through native entry afterward.

Source4dde installs fresh on the physical TV after the bounded internal-placement
update also fails for storage. Its actual phone-only video/fullscreen/Back loop
preserves the playing document but fails cursor pixels despite29 accepted awake
commands; native Back plus sustained USB pulses also fails with the cursor View
VISIBLE and a78ms recent frame. Do not accept the earlier generic document-
fullscreen emulator pass as this video path. The pinned HTML fullscreen manager
notifies exit while its native exit/layout work is still in progress, whereas
the session's actual WebContents fullscreen notification is authoritative. Also,
the shared session currently increments document identity on fullscreen changes,
although no document was replaced. Use that existing native state notification
for one retained-cursor restoration, keep a real document lease through the
transition, and invalidate coordinate leases without invalidating the document.
Cancel the pending lease on detach/pause/destruction/navigation; retain all
native/private/security guards. Extend actual-engine fullscreen coverage to
video and add the native session identity contract. The held-OK test twice fails
before entering Page cursor; it opens controls before waiting for the native
viewport to settle, making its captured coordinate lease stale. Synchronize the
viewport before opening controls and preserve the failed runs. Review these
focused corrections and build once per ABI; no arbitrary delay or relaxed guard.
Sourcef3d review is Standards0/Spec1: first phone cursor attachment during an
already-fullscreen page has missed the earlier fullscreen notification. Capture
the validated document lease in the shared attachment path too, and exercise
native first attachment inside existing fullscreen plus actual phone activation
there. Review the correction before building; the earlier4dde red remains.
Both latest sourcec737 and root31 reviews now pass Standards0/Spec0. The cached
x64 build runs first, with no emulator and the original memory/concurrency guard.
For the next hardware artifact, preserve the newly seeded synthetic profile:
record native selected-page/tab and bookmark state, then use Android's documented
browser-only `pm uninstall -k` followed by the compatible signed installation.
This frees old browser code while retaining data/cache and Android users. It is
a data-preserving code-replacement fallback, not an accepted in-place update.
Verify retained native state afterward; if installation fails, restore the prior
compatible APK with the retained data. Do not clear data again to hide failure.
Cached r81 passes blocking analysis in3m35.70s/31 steps; actual generic fullscreen,
first attachment inside fullscreen, held-OK, lifecycle disposal and protected
private-window cases pass. The video case fails before Back because its MP4
embedded in a data URL reports MEDIA_ELEMENT_ERROR/Format error. Preserve that
failure rather than weakening playback assertions. Use the existing controlled
HTTP media fixture with an explicit native-cursor query variant: a fixed dark
fullscreen target, native click starts video/fullscreen, same background/pixel and
document/coordinate assertions. Keep ordinary media rendering unchanged. Commit
the source test and root fixture/procedure together, review latest corrections,
then use the retained cached GN target for its focused runtime check.

Investigate actual regressions with bounded red-capable probes, review latest
commits and push incremental evidence. Mark6.5/V8 only with actual passing
hardware metrics; do not infer real-phone/Safari/second-TV or public release.

Host prerequisites restored: the user grants `nitesh:rw` on `/dev/kvm` and
signs the staged routing change as source
`73233a4ac4d7c811d2989b3ff9e6e8132003bee2`. The exact named ACL and Git
signature verify; both repositories remain on master. Resume only this latest
commit's Standards/Spec review, synchronized pushes/pins and the cached build.
All emulators/builds are stopped; host has26GiB available, swap0 and283GiB free.
Keep the genuine-D-pad correction/private-draft case as a separate source
slice, then consolidate their affected native cases into one updated artifact.
No new native acceptance follows from restored host access or a signed commit.
Latest source73233 review: Standards1 (TA-003), Spec0. The native-entry Back
helper can send another Back before the previous window yields input. Fix it
by capturing the actual focused native window and IME state, then waiting for
window detachment/focus transfer or IME dismissal after each press. Retain the
four-press bound and final Activity focus assertion. Mark the affected native
window-inspection cases API29+, then review this correction with the already
prepared genuine-D-pad/private-draft cases before building. Do not mask a
timeout or send another Back into page history.
The correction is source64e2eeebce222d4c3692f279e1e7f12e80332fde; its latest-only
review reports Standards0, Spec0. Source and root now pin the corrected routing
and native recovery cases before one cached r70 build, with blocking Android
analysis, four Siso workers and18G high/22G max/swap0. All native cases remain
pending until the verified new TEST APK runs on the explicitly owned TV AVD.
Rootad60 latest review is Standards0, Spec0. HTTPS push fails because the existing
GitHub CLI credential is invalid; the already-running SSH agent successfully
authenticates to both exact public forks with strict known-host checking. Use
SSH only as a per-command origin push URL, preserving stored remote URLs and
credentials. Source64e2 push succeeds; rootad60 push follows its review. Cached
checkout advances through tools/checkout.py only, remaining clean at64e2. Build
r70 starts with no emulator and the established limits;88 steps complete with
11.4GiB current memory. Active-unit Result=success is not build acceptance.
Buildr70 succeeds: GNU Time4m05.10s/exit0, Siso139 executed steps, blocking
Android analysis.124 retained memory samples record17,398,509,568 bytes peak
(16.20GiB), below the18G high limit. Preserved source64e2/rootad60 artifact
`compose-routing-64e2eeebc-x64-debug-20261011` verifies x86_64/package/signing
lineage and unchanged native patch fingerprints. Production APK852,743,209 bytes,
SHA256 `080c380a6ad16fc9f5b05cb8bfc1adb272dc957059dd9b4bac2ecbee74df9d32`;
TEST APK876,392,383 bytes,
SHA256 `66d02ce5d102c96f73ba2cafaf52165746fb7844b2a10cdf66aa1b45604f9bed`.
Rootad60 push also succeeds. Only after compilation stops, launch the exact
brave_tv_launch_followup_api36 AVD with KVM explicitly on and SwiftShader rendering,
guest Vulkan disabled, no snapshot load/save and5G high/6G max/swap0. Verify guest identity,
open its T3 panel and update both packages in place before six isolated native
cases. Build/artifact acceptance does not check runtime todos or migration.
KVM boot completes in16,162ms; T3 opens the verified nonphysical AVD. Agent
`install` updates both packages in place in10.066/10.383seconds, and installed
SHA256 values match r70 artifacts. The stock TV IME remains selected. Native
r46 runs each affected case in its own process: Address/Search, direct adblock,
private-library rejection and genuine-D-pad renderer crash/Reload pass. The
eight normal menu routes each reach a single TV panel and preserve browser
owners, but their final Settings-focus assertion fails: direct About/clear-data
entries intentionally update the remembered Settings action, so the last
clear-data entry should restore that focus, not Search. Correct that test
expectation without changing presentation policy. The private-draft case types
successfully but fails its post-recreation selected-private-ID/native-Home
condition; add only bounded native ID/model/page-kind diagnostics to identify
the actual restoration state before changing policy or weakening private/data
checks. Preserve both red logs and four passing cases; rebuild TEST only and
rerun these two affected cases after latest-commit reviews. No todo is checked
from the partially passing run, and no screenshot/security flags are changed.
Source27ae/latest root63f reviews both report Standards0, Spec0, and both
pushes succeed. TEST-only cached buildr32 passes in20.49seconds/14 executed
steps with blocking analysis;12 samples record9,066,688,512 bytes peak
(8.44GiB). Verified TEST artifact
`compose-routing-tests-27ae332ff-x64-debug-20261011` is876,391,975 bytes,
SHA256 `e065e86d5a73505e4f89f288909a3db0cfef184eb3001303940a4c6e55d9388e`.
Production r70 remains unchanged. The owned KVM r4 emulator stops with success,
preserving userdata. Subsequent r5 startup fails before guest boot: the named
nitesh ACL on `/dev/kvm` has disappeared again, and noninteractive sudo cannot
restore it. No host reboot occurred. udev marks KVM `seat:uaccess`, and the
only active graphical seat belongs to gdm-greeter; this identifies managed
seat permissions, but the exact reset trigger is unproved. A renewed temporary
ACL was requested; no broader host permission, group or service is changed.
The two-case r47 diagnostics remain unrun while access is absent. Keep prior
four native passes, both red logs, APKs/profiles and compile caches intact.
Host check restores access long enough to boot owned KVM r6 in16,258ms;
T3 verifies the same nonphysical AVD, and TEST-only install/hash verification
completes in14.699seconds with production r70 unchanged. The named KVM ACL
disappears again while the emulator remains active through its open handle;
keep this emulator running. User unlocks signing, and the no-prompt GPG probe
now succeeds. Native r47 menu/window/model/focus rejection passes in21.615s,
completing Stage4.8 when combined with the three unchanged r46 routing passes.
Private recreation remains red at8.887s: native diagnostic selects normal ID0
with one normal and zero private tabs, instead of private ID1. No leak is
established by that result. Next falsifiable hypothesis: a newly created
private native Home has no restorable document state/cipher yet. Change only
that fixture to a committed private Chromium webpage, retain exact private tab
ID/URL/model assertions, and require the recreated Address editor to contain
only its native URL, never the unsubmitted draft. Preserve the native storage,
encryption and security policy; if it still loses the tab, investigate native
saving/cipher lifecycle. Remove the tagged diagnostic only after the cause is
proved. Runtime and private-cache/failed-write acceptance remain distinct.
12 October resumption: the user reports signing/KVM repaired. The current
process now belongs to the kvm group, and read/write checks on /dev/kvm pass
without a named user ACL. A no-prompt signing probe also succeeds. All AVDs
are stopped, with27GiB host memory available and swap0. Source85e786 latest
reviews report Standards0, Spec0; the source push succeeded before the user
requested a pause. Pin this test-only correction, reuse the cached TEST build
with the established four-worker18/22GiB limits and blocking analysis, then
boot only the launch-followup AVD. Rerun only the affected private recreation
case; carry the five unchanged native routing/recovery passes forward. No
private runtime acceptance is inferred from repaired host access.
Source85e/root37f reviews pass0/0 and both are pushed. Cached TEST r33
passes in24.24s/14 executed steps with blocking analysis;14 memory samples
record14,058,405,888 bytes peak (13.09GiB). Preserved x64/signer-verified
TEST artifact `compose-routing-tests-85e786aaf-x64-debug-20261012` is
876,391,351 bytes, SHA256
`c7384c0eeaa4d4ab523295624ceaf62e08a3e57ad4c153be53f1fa83d96c3776`.
KVM r7 boots the same owned AVD; TEST-only install/hash checks pass in12.966s
with production r70 unchanged. Native r48 remains red in12.225s, but exact
private tab/URL/model restoration, fresh native URL in the editor, draft
exclusion and original normal tab identity all pass. Its final generic
no-EditText assertion fails after normal Home gains Address focus. The
committed-document fixture separates this from the earlier empty-private-Home
loss; it does not establish the underlying cipher cause or full6.3 acceptance.
Next test-only slice removes the now-resolved restoration diagnostic and uses
a bounded absence check identifying only editor package/resource/focus, never
text or private URLs, to distinguish a remaining native owner from stale
accessibility teardown. Retain strict draft and normal/private isolation.
Latest source de57f review: Spec0, Standards1 (TA-003). Accessibility
teardown can make the diagnostic node stale between lookup and metadata reads;
catch only StaleObjectException and retry a fresh lookup, without treating
staleness itself as proof of absence. Review this correction before building.
Keep the current emulator for this short TEST-only build and sample host
MemAvailable; interrupt only the owned build if available memory falls below
6GiB, while retaining the four-worker18/22GiB caps and all compile caches.
Correction source791f7 latest review reports Standards0, Spec0; source
push succeeds. Pin both test-only corrections before cached r34.
Source791f7/root1e245 reviews both0/0 and pushes succeed. Cached TEST r34
passes in22.11s/14 steps with blocking analysis;13 samples record
10,350,223,360 bytes peak (9.64GiB), minimum host available17.85GiB and no
guard interruption. Verified TEST artifact
`compose-routing-tests-791f7b382-x64-debug-20261012` is876,407,371 bytes,
SHA256 `15c93487768eff35f7e42d2dc1e77759b0da2fc8889e7c41f6da56b5a1be1cba`.
TEST-only in-place install/hash checks pass in15.968s, production r70 unchanged.
Native r49 private recreation passes in14.583s: exact private tab/URL/privacy,
fresh native URL without draft, original normal Home identity and no remaining
editor/private Home. The bounded absence check resolves the immediate teardown
assertion; empty-private-Home persistence policy/cipher cause is not proved.
Broader6.3 process-death/cache/interrupted-write acceptance remains unchecked.

Stage3.3 loading-entry slice: add one native case on the existing15-second
slow document, with first controls-to-Page-cursor activation only. Require
still-loading native document, unchanged tab/contents, no control-window
competition, actual native content focus, visible cursor and zero accidental
clicks; genuine SOURCE_DPAD OK must deliver one centered native click. Make
the existing fixture target cover the exact viewport center with dark pixels
and record only synthetic click coordinates. Use explicit18084 reverse;
retain streamed bounds and cancellation. Carry unchanged held-repeat/idle-wake
and loaded-page checks forward; rerun only this new loading case after latest
reviews and cached TEST build. No emulator result proves physical remote input.
Sourcef481de latest reviews both0; source push succeeds. The changed host
fixture passes fixed route, HEAD/method, two-slot streaming and cancellation
checks. Pin the source/fixture before TEST-only r35 and one native r50 case.
Sourcef481/root6e233 latest reviews both0/0 and pushes succeed. TEST r35
passes in22.63s/14 steps with blocking analysis;13 samples record
9,886,904,320 bytes peak (9.21GiB), minimum host available17.28GiB and no
guard interruption. Signed x64 TEST artifact
`compose-routing-tests-f481de602-x64-debug-20261012` is876,419,403 bytes,
SHA256 `4cb0b5898adcbb57408770894cd7ac06f213e7c9cd0bac41fe8af8e04dffce34`.
In-place TEST/hash checks pass in14.262s, production r70 unchanged. Native
r50 first loading activation passes in11.863s: retained tab/contents, native
window/content focus, controls dismissed, visible cursor, zero entry clicks,
one centered SOURCE_DPAD click while still loading, native Stop and Back
return. Combined with unchanged r40 held/idle/keyboard/coordinate acceptance
and native phone touch/wheel/viewport checks, this completes emulator3.3 and
Stage3 (5/5), total39/54. Physical remote acceptance remains deferred.

Private cache slice6.3: native audit finds ChromeActivity pause calls the
existing TabContentManager capture path, including native-page view draw;
FLAG_SECURE is not an internal-thumbnail guard. Add actual TEST cases for
private Home and a committed private webpage. Prove the native backend writes
a normal synthetic JPEG as a positive control, then request the same native
cache path for the private tab without returning a bitmap or changing secure
flags. Wait for its native callback and capture completion, require absent
private JPEG/ETC1 files, then background/resume the actual Activity and repeat
file/identity/security checks. Observe only existence/IDs/flags; request no OS screenshot and never
decode/export a private bitmap. Internal native caching itself is the tested
operation; any persisted private file makes the case red. Do not assume the audit proves a leak; run this red-
capable integration gate before choosing any production correction. Preserve
Chromium storage/encryption/model ownership and all production profiles.
Source0f986 latest review reports Standards1/Spec1 for the same completion
gap: the existing capture tracker covers JPEG, while ETC1 work runs separately.
Correct this diagnostic slice to explicit JPEG-only methods/claims before
its cached TEST run. Keep ETC1 acceptance pending, not passed or removed from
6.3 scope. If JPEG proves a native private-cache failure, investigate the
smallest TV-only capture guard and a metadata-only ETC1 queue completion
barrier together, preserving normal/native caches and browser models. This
separates a fast red-capable probe from the complete required cache acceptance;
no sleep, private bitmap read or unsupported disk-absence claim is added.
JPEG-scoping correctiond3e77 latest reviews both0. Review also identifies
a fixture eligibility risk: hidden/unmeasured native pages skip capture. Add
metadata-only readiness for the private tab view (attached, shown, measured,
selected and Activity focus) before its request, so a skipped hidden view
cannot supply misleading absence evidence. No security flags are changed.
Readiness correctiona86cb latest reviews both0, and source push succeeds.
Pin this JPEG-only probe and completed loading-input evidence before TEST r36;
run only the two new cache cases on the verified current AVD.
Sourcea86cb/root5d3ea latest reviews both0/0 and pushes succeed. TEST r36
fails blocking Java analysis because pinned CallbackHelper has no waitForFirst
method; native cache cases remain unrun and no artifact is preserved as passed.
Fifteen memory samples record8,724,160,512 bytes peak (8.13GiB), with no
host-memory guard interruption. Correct only that test call to the existing
waitForCallback(0) API, review and rebuild the affected TEST target; leave
production, security, timeout bounds and caches intact.
Callback correctionfe7b4 latest reviews both0 and source push succeeds.
Pin before TEST r37; rerun only the two cache probes after verified packaging.
Shared-host resource adjustment: unrelated GitHub runner Java jobs reduce
host available memory to13GiB. Current process still has KVM read/write access
through its kvm group. Stop only the verified owned r7 AVD before compilation
to release its roughly3.6GiB resident memory, retaining userdata and caches;
restart it after the TEST build. Do not stop other runners or shared services.
Keep the host6GiB guard, four workers and18/22GiB/swap0 build limits.
Sourcefe7b/root9813 latest reviews0/0; both pushes succeed and r7 stops
with Result=success. Cached TEST r37 passes in25.45s/14 steps with blocking
analysis. Fifteen samples record13,094,535,168 bytes peak (12.20GiB), minimum
host available20.27GiB and no guard interruption. Verified signed x64 TEST
`compose-routing-tests-fe7b4d530-x64-debug-20261012` is876,412,387 bytes,
SHA256 `179457f8fd2ebce44fee24e07868139a5096dc380fd779d9b6c18ae4d328902a`.
Owned KVM r8 boots; T3 verifies the nonphysical AVD and TEST-only update/hash
checks pass in15.475s, production r70 unchanged. Native r52 is red for both
private Home (6.712s) and webpage (4.989s): fresh normal JPEG positive control,
visible private view, secure flags and native completion pass, but private
JPEG existence fails at the shared assertion. This proves native private
thumbnail persistence on the synthetic TEST profile; it does not prove draft
leakage or any physical-device result. Preserve both red logs.

Private-cache correction: guard the single shared Java capture entry before
native-page drawing or compositor readback for TV incognito tabs. Remove that
tab's existing cache through the native manager, complete callers with null,
and retain ordinary/mobile capture, native tab/model/storage/encryption and
window security. One minimal private-method patch avoids a new Java subclass/
bytecode target bundle for this branch. Add a metadata-only C++ wrapper around
the existing test completion query to include shared ETC1 compression/write
counters, keeping ChromiumImpl for its existing per-tab JPEG tracking. Use
small chromium_src headers and a one-line definition rename patch so generated
JNI still calls the wrapped method; add no bitmap/state exposure or new JNI API.
Extend both probes to require JPEG/ETC1 absence after that queue fence, seed
only empty owned TEST cache entries to verify cleanup of prior entries, and
wait for native asynchronous removal. Then actual pause/resume must keep both
absent and preserve the normal JPEG and exact private tab/secure flags.
Acceptance: latest-commit reviews, verify exact tracked patch fingerprints in
the retained checkout, one cached full x64 production/TEST build, in-place hash-
verified updates and the two full cache cases plus private draft recreation.
Stop only the owned AVD before full compilation, retain all profiles/caches,
use four workers18/22GiBswap0/blocking analysis/host6GiB guard, and restart
only the same nonphysical AVD. Broader6.3 gates remain separate and unchecked.
Source2e99 review: Standards2 (PATCH-006, DOC-004), Spec1 (queued JPEG
compression is missing from the completion fence after removal clears the
per-tab tracker). Move TV-private policy into a small Brave-owned hook compiled
in the existing Tab UI Java target through its ordinary source-list include;
leave one invocation in the patch and add no dependency module/cycle. The hook
uses a synchronous caller-owned removal action and never invokes private unlock.
Document UI-sequence ownership and the exact observed work. Count JPEG
compression separately from the existing ETC1 queue limit, decrement when its
completion arrives, and include it in the metadata fence. After native cache
removal erases metadata, discard later JPEG/ETC1 compression completions before
they enqueue new writes; already queued writes and deletions use the same
sequenced file runner. Retain normal capture and callback failure semantics.
Use chromium_src wrappers and minimal macro hooks, not copied Chromium methods.
Raw patch blank-context prefixes are normalized, and their checksum/dry-run
checks pass without changing the retained Chromium targets. Full corrected
cache runtime and interrupted-write acceptance remain pending.
Add one deterministic native normal-cache interruption case: from Chromium
readback's callback, post to the same native UI queue before compression
replies are enqueued. Require work active before and after native removal,
then wait for the complete queue fence and absent JPEG/ETC1 files. A fresh
normal recapture must succeed afterward. This exercises late-write rejection
and the removed-tracker fence with actual Chromium, without sleeps, private
pixel export, pool-wide blocking or new testing JNI. Consolidate this new case
with both private caches and draft recreation in the same corrected APK.
Correction source commit is blocked by signing again: the system GPG
no-prompt probe reports No pinentry, while KVM group read/write access still
passes. The complete corrected source is staged; patch dry runs, checksums and
source/index whitespace checks pass. The user is asked to sign this concrete
staged commit interactively; no signing setting, key or shared agent is changed.
Do not advance the build checkout or claim an APK for uncommitted code.
Continue independent5.6 production-native popup/file-picker checks on the
unchanged verified64e2 APK and owned normal loopback fixtures; their results
do not accept the pending private-cache correction. Use only the verified
nonphysical r8 AVD, exact agent launcher/config/session and targeted platform
commands. Preserve browser data, stock IME and native security owners.
Independent production popup check opens the actual child via SOURCE_DPAD
cursor/OK and closes it through D-pad Tabs/More/Close. Original CDP target1,
document epoch1791780829729.3 and visible document survive. Undo temporarily
exposes native toolbar/968px viewport; once its native owner expires, viewport
returns1080px and Back reaches TV controls. Retain the initial viewport check
failure rather than infer stable recovery from the first transition frame.
Generic file input reaches actual Android ChooserActivityLauncher; D-pad
reaches the Photos & videos tile, excluding the two Activity Stub tiles, and Back produces File choice canceled on that same document with
full viewport, then Back reaches Page cursor focus in controls. Agent-device
open temporarily selects its own IME; restore and verify the stock TV LatinIME
before further checks. No typing/IME acceptance is inferred from those D-pad
flows. Component discovery later identifies the Activity Stub tiles as OS
framework stubs (com.android.tv.frameworkpackagestubs), not the TEST APK;
the actual GET_CONTENT handlers also include Google and system photo pickers.
An unlabeled focused chooser group was initially mistaken for the Photos &
videos tile. Actual last-started component proves that OK invoked the OS
DocumentsStub, which immediately cancels. No real picker selection is accepted.
Use focused-node descendant labels/rectangles and verify the started component
in the next attempt; opaque group refs alone do not prove the chosen provider.
The owned PNG is indexed in native MediaStore as ID24. Continue bounded
real-handler diagnosis without altering native security or installing a picker. Seed one uniquely named public Brave source PNG in this AVD's Pictures
folder and native media scanner for real-picker selection, preserving unrelated
files and all app profiles. The file is owned synthetic data, not a screenshot
or private browser content. Full5.6/6.3 acceptance remains pending.

Real image-specific picker diagnostic reaches Google PhotopickerGetContentActivity.
Touch selects only the owned indexed PNG; D-pad reaches Preview → Done, and
Chromium receives image/png,1617bytes as24.png in the original image input.
The original target/document epoch/full viewport survive. This proves native
result delivery, not D-pad-only photo selection. A bounded10-second generic
chooser attempt confirms that the focused Photos & videos tile's D-pad OK
still invokes DocumentsStub and cancels. Keep that OS-image limitation red;
instant post-input snapshots cannot prove the started component. Further
network recovery uses only the owned loopback server: stop it, native Reload
must show the genuine connection error, then restart the same service and
native Reload must recover the fixture on the same tab/target. Carry unchanged
native JS-dialog, renderer-crash and external-link checks instead of repeating
those suites. No new source/production artifact is accepted while signing is blocked.
The first network observation correctly reaches ERR_CONNECTION_REFUSED on the
same target, but its1080px assertion fails at968px. Source audit shows this is
the deliberate native error-page visibility guard, shared with dangerous/
unresponsive/editable content; do not relax that trusted-owner policy. Correct
only this normal-error observation to the native guarded968px viewport, then
require1080px after the real fixture recovers. Back already reaches the TV
controls with Reload focused. Preserve the initial assertion failure.
Network recovery passes on the unchanged production APK: owned fixture r8 stops,
ERR_CONNECTION_REFUSED is visible on original target1, Back focuses native TV
Reload, and restarted loopback fixture plus D-pad Reload returns target1 to
visible normal document epoch1791783507372.7/full1920×1080. The transient r9
server restart failed because systemd's default directory lacked flake.nix;
record that helper failure, then r10 with explicit project WorkingDirectory
and absolute fixture directory passes HTTP readiness before browser input.
Do not count failed helper startup as browser recovery or repeat unchanged cases.
Existing system PhotoPickerGetContentActivity diagnostic also fails to move
D-pad focus from its Recent list into the owned photo. This is a bounded OS
compatibility result, not browser selection acceptance; Back returns to the
normal browser. No picker package, permissions or trusted owner is replaced.
While source signing is pending, begin6.6 display checks on the verified64e2
production build: retain normal fixture/tab identity, sample compact controls,
Settings and Address with font scale1.3 and forced RTL, then720p at240dpi.
Record focus reachability and actual visible layout, restoring exact initial
size/density/font/RTL/IME settings in finally. No screenshots of private/native
security UI, profile reset or full accessibility/sustained acceptance claimed.
Current64e2/font1.3 controls → More → Settings → About-focus → Back passes
with readable normal screenshots and usable remembered invoker. Restore1.0;
app locales[]/unset force-RTL/1920×1080/320dpi/stock LatinIME remain unchanged.
Avoid repeating earlier720p/font1.6/Arabic/spoken journeys wholesale: source1ed
has actual focus-edge/confirmation/Settings evidence, while later panel changes
concern bounded state/restoration/private protection. Reconcile affected checks
with the final artifact before6.6 acceptance; sustained session remains pending.
Next6.3 test slice while signing is repaired: add a separate native thumbnail
failed-write class and its existing GN test-source entry without changing the
14-file staged correction. On a normal owned TEST tab, first prove a valid native
JPEG capture, then replace only that tab's now-absent JPEG/ETC1 targets with
empty directories. Real native write calls must fail and finish their native
cleanup; the selected tab/WebContents/document remain usable. Remove only
owned empty directories in finally, recapture and decode a valid normal JPEG.
Use callbacks plus the corrected queue fence; no sleep, full disk filling,
production/profile permission changes or private bitmap inspection. This is
filesystem write-failure acceptance, not an ENOSPC/low-storage claim. Keep the
new class/GN entry unstaged until the user's correction commit is captured and
reviewed; consolidate both test slices into the next reviewed APK where possible.
The new native failed-write class compiles against the1246 retained GN interface/
SDK jars using pinned JDK25; formatter and whitespace checks pass. This is a
source/type check, not APK static analysis or native runtime acceptance. The
14-file staged tree remains exactly0c18f1ee5057b81d2bc6a7686d3ef8809d1dec66.
Add a root read-only upgrade comparator plus one small Java diagnostic using the
cached compiled Chromium metadata readers, not a duplicated storage parser.
It must verify explicit baseline AVD/installed artifact, reject private metadata,
compare normal IDs/URLs/selection, group token/membership, bookmark IDs/contents,
provider and exact owned Shields/filter settings. Tests must reject changed or
missing data and private input. Native History/site-storage/UI/relaunch checks
remain separate; metadata equality alone cannot accept6.1. No APK install,
profile copy/write, physical device action or fresh build checkout is performed.
The user signs the exact14-file correction as source9b4f16d2; its committed tree
matches0c18f1ee5057b81d2bc6a7686d3ef8809d1dec66 and signature verifies. Latest-only
review reports Standards1 (CSRC-017, missing cancellation-order comment), Spec0.
Add the concise comment preserving the compression-after-removal rationale;
review that correction separately. Sourceff6b77868 commits the independent
native failed-write test, whose latest-only reviews are pending. Consolidate all
reviewed source changes into one retained-cache full/TEST build. Runtime privacy,
failed-write and baseline-upgrade acceptance remain pending.
Both failed-write reviewers catch a fixture expectation error: native JPEG/ETC
failure cleanup uses DeleteFile, which removes the empty obstruction directories.
Correct the test to require both targets absent after the full queue fence;
finally removes only a still-existing owned empty obstruction. Preserve the
normal document/recapture checks and production cleanup. Review this test-only
correction before the consolidated build; no failed-write runtime pass is claimed.
Latest source correction rounds c9ac16445 and3088b5676 both pass Standards0/Spec0;
all source commits through3088b5676 push to master. The root upgrade checker
records four actual normal tabs on the preserved source5829 AVD, including exact
owned10.0.2.2 URL for ID3. Repeated read-only comparison passes; cached native
reader negative probes reject private count, unsupported version and excessive
input before emitting metadata. Four host comparator tests pass and strict mypy
passes. Evidence is upgrade-baseline-metadata-r2.json, its selfcheck and
upgrade-reader-negative-r2.json. These checks do not accept the actual upgrade.
Stop only the baseline-seed r2 emulator before the consolidated r71 build,
preserving userdata and all caches. Keep the stock IME restored after T3 opens.
Rootb0aa latest review reports Standards0, Spec1: installed/local APK equality
must also bind to the provenance manifest's recorded hash and size. Add that
binding for the retained flat baseline and multi-artifact schemas, with host
wrong-source/hash/size tests, before using the checker for migration acceptance.
The source3088 cached r71 full/TEST build starts with no emulator, four workers,
blocking analysis and established18/22GiB/swap0 plus6GiB host guard. Root helper
changes do not alter the committed source pin or active build checkout.
Buildr71 fails at19.56s/30 completed steps, with retained logs and no emulator.
Clang rejects an extra semicolon after the inline getter expansion under
-Wextra-semi/-Werror; this is a source error, not memory pressure. Preserve all
outputs. Reorder the minimal header override so the upstream declaration's
semicolon terminates the ChromiumImpl declaration rather than a function body.
Retain the exact fence behavior; validate the expansion with the pinned compiler,
review the correction and advance only committed pins before cached r72 retry.
The pinned Clang expansion probe reproduces the old header error (exit1) and
passes the corrected expansion (exit0), without changing warning settings.
Sourcec29748cde and rootcd7e708 latest correction reviews both report0/0.
Five focused upgrade host tests and strict mypy pass. Retained r71 samples
record9.53GiB peak and no guard interruption; retry r72 uses the same cached
objects, committed corrected pin and established resource/analysis limits.
The first r72 retry was launched before checking checkout.py's failure, so it
repeated the unchanged header error; it is stopped and its logs remain intact.
The helper refused four generated patchinfo final-newline differences. Verify
each file equals its recorded bytes except that final newline, restore only
those bytes, then rerun checkout.py successfully to sourcec297. No reset or
cache deletion occurs. Guard r73 launch on exact source SHA and clean checkout.
Root5f6 latest reviews0/0 and push pass. The guarded r73 build uses sourcec297
and root5f6. Actual cgroup sampling reaches18.01GiB with soft MemoryHigh pressure,
but zero max/OOM events and no host guard interruption; native linking and
blocking Java/lint work continue. This is observed build progress, not success.
Next independent6.4 audit while this build runs: reconcile sourcec297 callers,
resource/build targets and accepted routing tests. Confirm previous programmatic
TV layouts and competing mobile entry routes are already removed per slice;
retain lifecycle/model/security/input controllers still called by the Compose
presentation. Do not delete shared phone/native owners, launcher assets or
active strings merely to make a retirement commit. Record the audit and accept
only retired presentation paths whose replacements have actual prior passes.
Buildr73 passes GNU Time7m02.00s/exit0, Siso168 steps, blocking Android analysis.
205 samples record18.017GiB peak, minimum host available9.418GiB and no guard
interruption. Verified sourcec297/root5f6 artifact compose-cache-c29748cde-x64-debug-20261012
contains production852,742,257 bytes SHA2566a1fd7c11a824468576c3b65a52804b129ca2d90ef07be1d038446d1b58e2452
and TEST876,432,347 bytes SHA256bac0c4705a90494ceaa41cddda011029f52c340288fe6bb1de755fe4c8918e2b.
Signature/package/x86_64 verify; owned launch-followup KVM r9 boots and both
in-place install/hash checks pass (10.847/10.422s). Native r53 private draft
recreation passes13.848s, but private Home/web cache and interruption/failed-write
cases fail on file absence/removal, not a timeout hidden by shell exit0.
Root cause: the retained Java removeTabThumbnail(id) deliberately refuses
deletion when TabWindowManager still owns that live tab. Use the existing
forceRemoval=true overload only for known private TV cache protection and owned
TEST removal fixtures; preserve all ordinary/archived deletion policy. Keep
full fence/absence/recapture assertions, update tracked patch fingerprints,
review, then consolidate a focused cached retry. No gate is accepted from r53.
Source6802 latest reviews pass Standards0/Spec0 and the failed-write class still
compiles against the retained GN interfaces. Stop only owned KVM r9 (success),
preserving profiles, before full/TEST r74. Keep the r53 private-draft pass; rerun
only the four affected cache cases after verified APK installation. Retirement
audit is recorded separately in tv-ui-retirement.md; no new source deletion is
needed because earlier accepted slices removed layout construction and competing
routes. Cache/upgrade/file-picker/hardware gates remain independent.
Buildr74 passes GNU Time4m44.53s/exit0, Siso192 steps, blocking analysis.
143 samples record15.834GiB peak and minimum host available13.285GiB, no guard
interruption. Verified source6802/rootbbc artifact compose-cache-6802a08dc-x64-debug-20261012:
production852,742,693 bytes SHA2563d78dea37abed05da71c0fbae11a06c3ec66ca99f78d8d4850c29611be63e92a;
TEST876,432,735 bytes SHA25660d262a2dfd94febe567244c3df2dc3c09b49285f7d531065bdcf44038d38427.
Owned KVM r10 boot/install/hash passes, production/TEST updates12.297/10.235s.
Native r54 passes private Home6.001s, private webpage5.569s, actual compression
removal/recapture4.791s and native failed-write cleanup/document/recapture4.868s.
Both private cases require null callback, full queue drainage, JPEG/ETC absence,
secure flags and retained private tab across genuine pause/resume; normal cache
survives. Carry unchanged r53 draft recreation pass. No private pixels captured
or security flags relaxed. Broader6.3 process-death/low-storage remains pending.
Next6.1 actual upgrade: stop owned r10 preserving profiles, boot the preserved
onboarding AVD, verify installed5829 manifest again, install the verified6802
production APK in place, and require actual native TV routes plus normal metadata,
History/site storage and process relaunch. Do not wipe, downgrade or substitute
metadata equality for runtime acceptance. The baseline source/data stays intact.
Actual6.1 upgrade on preserved onboarding AVD passes source5829 →6802 in place.
Native D-pad Tabs shows the four retained rows/current page; Mobile bookmarks
contains both seeded favorites. Native History Open loads the exact privacy query,
Search shows DuckDuckGo selected, controls show Shields off and Filters shows
cookie blocker Off. The read-only native comparator matches all six seeded
fields before install, after actual UI use and after verified process replacement
and relaunch; Address initially regains focus. Normal local storage stays seeded.
Evidence: upgrade-native-acceptance-r3.json and upgrade-{before-install,
after-native-ui,after-relaunch-metadata,after-relaunch-storage}-r3 records.
The first cookie assertion is red, and its viewport assumption is also wrong:
the old fixture lacks a viewport declaration and its cookie lacks an expiry.
Pinned ProfileImpl uses Android's default startup type; Brave's existing override
also prevents session-cookie restoration. This is retained session policy, not
an accepted cookie migration result. Keep the original baseline evidence and
do not claim that cookie survives process death. The old literal-label waits
also missed origin-bearing History rows/actual button capitalization; fresh
native snapshots corrected locators without changing product policy.
Stage6.1 and the reviewed6.4 retirement audit are accepted, bringing the canonical
UI count to41/54. Source6802 cache protection/native failed-write checks pass;
broader6.3 and native picker explanation/6.6/final verification remain open.
Next6.3 process/storage fixture: add a separate persistent-cookie seed control
to the owned normal privacy page, with explicit one-day expiry. Keep its original
session-cookie control. Declare its viewport and wrap JSON output so content
overflow does not distort diagnostic coordinate assumptions. Seed through real
native browser input, verify normal cookie/local storage before background,
then replace the actual process and compare native browser data again. Test
bounded forced Android low-storage state separately from genuine failed writes;
do not fill disks or claim forced state is ENOSPC. Preserve all profiles.
Native persistent-cookie/low-state r4 passes on source6802: real browser seed,
D-pad native Reload, Android storage monitor forced LOW broadcast (with4.3GB
actually free), real browser PID replacement and new document, Address focus,
persistent cookie/local storage and all seeded browser metadata survive. The
forced monitor state resets to UNKNOWN/actual values in finally. Evidence:
storage-process-acceptance-r4.json, before/after persistent-storage and storage
monitor records. This proves the controlled LOW signal journey, not filesystem
ENOSPC. Genuine JPEG/ETC failed writes are independently covered by native r54.
Next6.3 private process-death test stays off the preserved upgrade profile:
stop its owned AVD after saving, reopen launch-followup, create a private real
document and unsubmitted Address draft, background and replace the actual
process. Require no private draft/URL in normal UI; any restored private content
must stay in the private model with secure windows. Use a20-byte metadata-header
diagnostic for counts only, never private URLs, stored contents or pixels.
Keep normal tab IDs/page count and restore normal selection; do not invoke phone
unlock, wipe profiles or disable secure flags. Broader6.3 remains pending.


Root98d3 latest-only review passes Standards0/Spec0 and pushes successfully.
Private process acceptance r6 passes on source6802: a real background process
kill preserves Android's task and restores the committed document directly into
private browsing. The native private tab panel retains FLAG_SECURE, its counts
are normal2/private1, and the unsubmitted Address draft is absent. D-pad closure
of the owned final private tab restores the original normal page with identical
normal IDs/selection and no private fixture/draft in normal UI. Evidence:
private-process-{relaunch,acceptance}-r6.json, private-force-stop-acceptance-r5.json.
The initial controls locator expected an automatic panel after task restoration;
the actual retained task returns directly to the private webpage. Native Back
reaches controls and proves the private heading/model; no product fix was needed.
The separate force-stop path deliberately receives no saved cipher Bundle;
pinned CipherFactory.restoreFromBundle and ChromeTabbedActivity.initializeState
ignore private files without the key. It restores no private tabs and preserves
normal IDs/selection. Do not confuse explicit session termination with task-
preserving process death. Native storage/encryption ownership stays unchanged.
Stage6.3 scoped emulator acceptance now combines these actual process paths,
private draft recreation, native cache/interruption/failed-write checks, forced
LOW-state recovery and carried-forward scoped clear-data effects/cancellation.
The canonical count is42/54. Real full-disk ENOSPC/hardware are unverified.

Next5.6 picker slice: explain Android TV picker limitations before transferring
to the retained native picker, with Cancel initially focused and Back returning
to the same page. Continue opens the original permission/intent/media path.
Use a small UiBase host seam after SelectFileDialog's existing initialization;
keep Brave presentation, document identity, once-only callbacks and disposal in
its TV controller. Guard the native pointer before continuation/cancellation;
cancel on tab/document/security/lifecycle changes, protect private guidance and
never grant storage/camera permissions or imitate OS approval. The Java hook
cannot use a C++ chromium_src override; keep it minimal and own the helper/GN
source list in Brave. Re-enter the initialized native method only during the
synchronous continuation, avoiding an extracted copy of its large picker body.
Acceptance: actual-engine D-pad Cancel/Back/Continue, safe native picker return,
unchanged document/normal models, private protection, stale navigation and pause
cancellation; native allowed image delivery remains separately verified. Do not
claim unsupported OS D-pad photo selection is repaired by browser guidance.


Source244 latest review reports Standards0/Spec1: native modal/scrim ownership
can begin without document invalidation, leaving picker guidance visible. Before
building, cancel pending guidance explicitly from the existing modal observer
and a disposed synchronous scrim observer. Add an actual native JS alert while
guidance is open; require exactly one cancellation, no continuation, guidance
dismissal and focused trusted-owner recovery. Keep all previously accepted
private/process/cache evidence, since this correction changes only guidance.


Source97f correction review passes Standards0/Spec0. Pin the reviewed native
picker guide and four focused cases before one cached production+TEST r75 build
with blocking Android analysis, four Siso workers and18/22GiB/swap0. The owned
launch-followup emulator and fixture server stop after saving normal state;
26.5GiB host memory is available before compilation. Cache/GN/dependencies/APKs
remain preserved. No Stage5.6 acceptance follows from reviews or compilation;
actual native cases and original Android picker/result integration remain pending.


Root173 latest review is Standards0/Spec0 and both repositories push. Cached
checkout advances only through tools/checkout.py. Incremental patch apply changes
only the two intended UiBase files; verify their full post-apply hashes. Generated
metadata differs only by final newline; restore exactly committed metadata bytes
before compilation, retaining clean source/cache state.
Buildr75 fails after1m25.12s at Chrome Java compilation: the new guide/test used
nonexistent R.string.brave_tv_cancel. Correct both callers to the existing
localized R.string.cancel already used by TV confirmations. No new resource or
picker policy is needed. Preserve the failed log/timing and completed objects;
41 samples record10.58GiB peak, no OOM/guard. Review only this resource correction,
pin/push it, then retry the same cache/limits as r76. Native cases remain unrun.


While the reviewed APK builds, reconcile the migration contract with actual
accepted6.1/6.3 evidence. Preserve its source-audit date and native schema/rollback
constraints; replace stale pending wording with links to the canonical scoped
outcomes. Record private task-restoration versus explicit force-stop policy,
controlled LOW versus ENOSPC, and source6802 cache protection. This documentation
slice changes no APK/source/cache and does not accept Stage6.7 final closeout.


Buildr76 passes source033/root-at-start e9c in9m19.31s:1386 Siso steps and
blocking Android analysis.277 retained samples record16.38GiB peak and13.59GiB
minimum host available, no guard/OOM. Preserve verified x86_64/package/signer
artifacts at compose-picker-03378e56b-x64-debug-20261012: production852,770,267B,
SHA2563557c81e84f81378d78a98172cd9880419f6dba254bfeb3179695feaeb50e64d;
TEST876,451,107B, SHA25665a5f1f967582806b967ad0fb0ed72b7435086ef4a5cb24215fd317fcf6414cf.
Rootc04 migration reconciliation reviews0/0 and pushes; its documentation changed
while the frozen source build ran, so artifact rootAtBuildStart remains e9c.
After compilation stops, boot only launch-followup AVD as owned picker r12 with
KVM/SwiftShader/guest-Vulkan-off and5/6GiB/swap0. T3 discovery/open verifies
nonphysical emulator-5554 identity. Update both verified packages in place,
close only the SDK automation lease, then run four isolated native guidance
cases without failure screenshots. Actual picker/result integration follows;
no Stage5.6 acceptance from the build or installation.


Native r55 passes all four source033 guidance cases: real file Cancel/Back with
unchanged document/owners(9.100s), once-only continuation/navigation/pause(8.919s),
real JS-modal takeover/focus(7.032s), private guide protection/owner(6.660s).
Production r56 reaches guidance via genuine USB D-pad cursor/OK, with Cancel
initially focused, then native Continue reaches Android's actual resolver and
Back returns. Image Continue reaches com.google.android.photopicker; Back also
returns safely. One earlier webpage entry used touch diagnosis and is recorded
separately. The local fixture initially needs native Reload after its server
restart; no first-cursor success is claimed from the incomplete entry attempt.
The existing DevTools socket is absent on this cold process, so the read-only
CDP helper fails with UND_ERR_SOCKET. Do not change product debugging policy to
satisfy a diagnostic. Add a visible bounded normal-fixture report of genuine
performance.timeOrigin, file-cancel counts and selected File metadata, updated
only by actual cancel/change events. Require an unchanged token through picker
return and exact owned PNG size/MIME. No injected field value, private payload or new
companion endpoint is involved. Keep existing result labels for older cases.
Clarify guide copy to cover an empty/unavailable Android picker as well as one
requiring a mouse. This is a resource-only correction; native permission/result
ownership and four accepted code-path checks carry forward. Actual current-copy
layout/recovery and image-result integration remain pending under5.6.


The normal fixture's native r57 report passes: unchanged genuine document token,
selected image24.png/1617B/image/png from owned MediaStore24, then one real file
Cancel increments only its counter and preserves the selected image/document.
Photo selection and Done use touch diagnosis. Done's text ref is rejected by
SDK (no parent-owned touch point); coordinates from its current normal snapshot
activate the real OS action. No D-pad photo/Done acceptance is claimed. Reports:
picker-report-before-r57.json, picker-image-result-r57.json and picker-report-
cancel-r57.json. Fixture script syntax passes; no browser debugging setting
changes. Remove the unused owned9222 forward. Source16c copy review is0/0.
Pin/push this resource-only clarification and tested fixture report, stop/save
only owned r12 emulator/server, then run one same-cache r77 packaging build with
established limits. Retain four native source033 code-path passes and actual
allowed result; recheck new-copy native layout/recovery before accepting5.6.

Next6.6 consolidated slice: retain unchanged native input/security/model passes,
check the final picker at normal and720p/font1.6/RTL configurations, and restore
every changed display setting. Add a bounded, non-live normal media-fixture report
from actual HTMLMediaElement time/frame/error/fullscreen state so native snapshots
can observe sustained playback without changing the TV's debug policy. Run one
30-minute foreground playback/approved-phone session on explicitly verified TV
and phone AVDs after disruptive checks. Sample whole-package PSS/CPU, command
continuity and media progress; check native focus/cursor recovery before/after.
Investigate failures separately and retain partial results honestly. OS picker
D-pad limitations, real phones, hardware codec/audio/performance and physical
LAN acceptance remain unverified. No wipe, private capture or release claim.

Final-copyr77 passes GNU1m36.13s (Siso1m32.67s/15 steps)/blocking analysis,49 memory
samples,12.485GiB peak/16.510GiB minimum host available, no OOM/guard. Verified
production852,770,267B SHA256bac5b4dd6cda8c68e86c34bee1eb0ef051c84649057ac62280c1103f63140926
and TEST876,451,107B SHA25604ad60f01b3ec05f5b390356083a15585b66a06644d1ef59635e353a219583be
are retained in compose-picker-16c2b2dd2-x64-debug-20261012; in-place updates
take10.953/10.622s. Native1080p new-copy Cancel/Back/Continue+OS Back preserves
the same document and fires exactly one cancel each(1/2/3), picker-final-copy-r58.json.
Actual720p/font1.6/ar screenshot catches the long explanation partly scrolled
away by initial Cancel focus. Do not accept5.6/6.6 from AX full text alone.
Shorten only the informational description, retaining empty-picker/mouse/Back
guidance. Restore all seven recorded display settings, save/stop owned AVDs,
review/pin/push the resource correction, then package from the same cache and
recheck the affected narrow layout. Native security/file-result tests carry.
Source8c4e31c95 concise description passes latest Standards0/Spec0 and pushes.
All seven display/input/accessibility values restore after releasing the SDK
lease (the helper had changed accessibility_enabled); normal IDs1/2 and selected1
remain unchanged. Owned r13 TV/phone AVDs and fixture services stop normally,
profiles preserved. The phone connects to shared AndroidWifi10.0.2.18; TV r13
has no Wi-Fi address yet, so no paired session is claimed. Both mistakenly
added VirtWifi configurations are removed; existing AndroidWifi is retained.
Media-fixture script syntax and actual loopback HTTP/range/server checks pass.

Source8c4/root-at-build-start3761909 finalr78 passes GNU1m41.40s (Siso1m37.95s,
15 steps) with blocking analysis,52 samples/11.749GiB peak/16.894GiB minimum
host available and no OOM/guard. Verified compose-picker-8c4e31c95-x64-debug-20261012
retains production852,770,267B SHA256a4243f98c36899bbb536eae8966575971c85137c82b8eb0b7bedc0803e5a14c6
and TEST876,451,107B SHA2560cc406d154c5788faf990c240e9065c908f07a8246f7be82e981dc089f6b030b.
Owned r14 KVM TV/phone boot; in-place TV/TEST updates12.331/13.607s, no wipe.
Final picker native1080p Right/Left/Cancel and720p/font1.6/ar Left/Right/Back
pass initial conservative focus and one native cancel. Actual screenshots show
the entire short warning immediately; Arabic title/Cancel coexist with English
warning/button fallback. Seven recorded display/input/accessibility settings
restore exactly. One first post-scroll fixture touch misses before animation
settles; a fresh-ref retry opens the guide. It is not a product failure or pass.
Evidence picker-final-copy-r59.json, picker-display-r59.json and restored record.
Four unchanged native source033 checks, actual image-result r57 and same-document
Continue/OS Back r58 carry. Accept5.6 scoped emulator; canonical count43/54.

Sustained harness extends the existing30-minute phone test with exact TV/phone
AVD identity and diagnostic-forward checks plus native normal media-report
sampling. Require continuing decoded frames, unchanged genuine document identity
and no media error each minute; retain whole-package PSS/CPU and10s approved
command continuity. Bring the QR target to the foreground and choose the same
last remote target during the soak, avoiding older synthetic phone tabs. Script
syntax passes; actual sustained acceptance remains pending. Save TV Ethernet/
Wi-Fi state, disable only its Ethernet through the previously verified Android16
transaction13 and connect existing AndroidWifi. TV10.0.2.16 and phone10.0.2.18
now have direct shared simulated Wi-Fi addresses; no remote-traffic forward.
The phone uses bundled Chrome133.0.6943.137. Physical LAN/current phones/Safari
are unverified. Fixture/loopback-media routing remains separate from the remote.
Latest root59 reviews report Standards1/Spec0: decoding can continue while all
new frames are dropped. Require positive and increasing frames-minus-dropped
as well as decoded frames, and reject unexpected paused phone ownership during
the steady session. This corrects test validity; no runtime acceptance follows.
Rootcc8 latest corrections review0/0 and push. Actual native media setup reaches
ready4/error-null and reports427x240 (anamorphic default track despite the
320x240 filename). The title has no standalone native AX node; the report and
four fixture buttons have genuine identifiers. Replace assumed title/dimensions
with the authenticated native normal fixture URL, exact native app/controls,
positive actual dimensions and stable dimensions/document identity. Retain the
same presented-frame checks. Syntax and native setup are not a30-minute pass.

Final6.7 evidence slice: audit current source8c4 surface owners,166 live TV
messages, pinned toolkit/licensing and Chromium integration touch points.
Create a concise acceptance index that links retained actual native results
separately from the current artifact and pending sustained/manual/stock-phone
checks. Reconcile historical Stage2 totals and resolved route/cache wording in
active plans without changing historical engineering logs. Acceptance requires
exact artifact/build/runtime provenance and honest remaining physical/release
limits;6.6/6.7 and V checks stay unchecked until their final evidence is complete.
Currentr59 setup passes real D-pad fullscreen/Back in the same playing document,
with cursor pixels at928/800. An initial immediate media-report read catches its
one-second stale fullscreen value; bounded fresh-state waiting passes, with the
original helper retained. Fresh native unencrypted warning/QR/D-pad approval
passes TV-only assets, fragment removal and hidden manual form on the direct
simulated LAN. The30-minute run starts on rootc748/source8c4 with explicit AVD/
forward/artifact provenance and is still partial. All166 strings/AAR hashes pass
the final source audit. The acceptance index records installed compiler build.txt
2.4.20 separately from its old README version label; no dependency pin changes.

Final V4 slice after the uninterrupted run: request a fresh manual invitation
through the actual bundled page, prove pending approval hides/clears the code
form, activate native approval separately, then test a separate real120-second
unapproved invitation expiry and safe return. Read the visible synthetic code
only in memory; never log credentials or relax Host/Origin/security. Verify both
AVDs/owned phone diagnostic forward and native Compose QR owner. Keep the old
approved session intact until the30-minute run finishes. Stock-phone Gboard
smoke follows on the normal native input fixture; full Unicode/native composition
and no-replay/password/private/security checks retain their independent evidence.
Manual-probedf5 review reports Standards1/Spec2 before any runtime: failed
equality assertions could print a code/fragment, and the expiry wait expected
"expired" rather than the page's actual revoked-session guidance. Replace all
secret-bearing equality assertions with booleans/fixed messages; wait for the
real session-unavailable/new-invitation UI, require elapsed>=100s and native
pending QR/approval closure. Keep the130s bound and profile/security ownership.
The corrected probe still has no actual manual/expiry acceptance yet.

Currentr59 sustained run PASSES30m00.456s/181 commands/p95 7.6ms,31 PSS/CPU
samples:646.629MiB start/634.588MiB end,633.391–653.471MiB range. Same normal
document/session throughout,427x240, decoded frames11504→64559, dropped3→3;
presented counts advance, no media error. Whole-package one-core CPU median
143.102% is software-emulator workload, not main-thread UI or hardware audio.
Postr60 actual D-pad fullscreen + approved phone move/Back retains the playing
document and cursor928/800; PID4309 remains. The separate manual request clears/
hides its form, then actual D-pad approval and native address navigation pass.
Stock phone Gboard touches type two letters/space and delete into the genuine
TV plain input, with matching phone/native text and completed composition.

Final V4 correction slice: a direct Disconnect diagnostic times out on stale
connected state. Source confirms token/input are cleared but connected/state and
remote visibility remain; pending poll/command replies can repaint afterward.
Add a focused real-bundled-JS regression, restore existing revoked-session/fresh-
invitation UI on Disconnect and fence authenticated success/failure handling by
the captured controller credential. Keep native revocation, parser/queue/security
unchanged. Acceptance: red→green host test, latest reviews, pinned cached APK
and actual emulator Disconnect/no-stale-reply/fresh invitation checks. The30-minute
approved-session/native core evidence carries; do not rerun it for termination-
only UI changes. Real invitation expiry remains pending until separately run.

Expiry prober62 observes terminal recovery but fails its elapsed check: it times
from manual submission, while native expiry starts when the invitation is made.
Record the timestamp immediately before the native Start experiment action,
require a fresh bounded timestamp, and measure the120s lifetime from that origin.
Acceptance still requires actual terminal UI, cleared credentials and native
pending QR/approval closure. No native timeout or authorization change. Bound
the Disconnect host-test request barrier and clean its server on launch failure.
Source1c9 latest review: Standards0/Spec0; signed and pushed. The host Disconnect
regression fails on8c; all four success/failure cases pass on1c (r61/r63), and the
existing bundled-page input/approval/layout suite passesr61. Source1c packaging
and native Disconnect/re-pair acceptance remain pending. Expiry r63 is in progress.

Final closeout: source1c9f71646 and root-at-build86a9f98 pass retained-cache r79
packaging with blocking analysis: GNU1m42.53s/Siso1m38.98s/61 steps,53 memory
samples,13.420GiB peak and16.580GiB minimum host available, no guard/OOM.
Production/TEST hashes and signed artifact provenance are in the acceptance
index. Actual in-place installs take12.863/11.394s and match preserved bytes.
Manual invitation r63 expires at122450ms from native creation, clears phone
credentials/form and native QR/approval. This carries to1c's unchanged native
timer; r62 failed a post-submission timing assumption and is not a pass.

On actual source1c APK, r64 manual request hides/clears the code form; real USB
D-pad native approval dismisses its trusted panel. Disconnect immediately
restores fresh-pair guidance, disables old control and remains revoked beyond
the4s reply timeout. Native Start experiment creates a fresh invitation; manual
re-pair, D-pad approval and normal movement pass without replay. About returns
to its Settings invoker; Settings returns to focused compact More controls;
Page cursor restores the same normal document and phone control resumes.
Initial probe labels incorrectly expected "About" and an expanded Settings
button; corrected observed labels/compact-parent assertions pass. These were
probe assumptions, not production fixes. Normal IDs1/2 and selection1 remain
identical before/after. Actual legacy group/private/model/security/input checks
carry only where native implementation is unchanged.

All166 TV messages and both AAR hashes verify against final source1c. Update
6.6/6.7/V1–V7 to scoped acceptance52/54; leave6.5/V8 unchecked. The final
acceptance index records artifacts, retained/current tests and honest hardware,
real-phone, HTTP experiment, OS picker and ENOSPC limits. This closes emulator
scope rather than the older release/MVP backlog. Revoke the final phone session,
close owned SDK leases, restore Ethernet/Wi-Fi, remove only owned fixture/CDP
ports and stop only owned AVD/fixture units. Cleanup r65 passes; all profiles,
compile caches, dependencies, APK artifacts and shared ADB/T3 remain intact.
No physical Chromecast operation or ARM build occurred.

Earlier6.1 baseline preparation: stop only owned launch-followup r8 after
verifying/restoring its settings, boot only brave_tv_onboarding_api36 with KVM,
and inspect its preserved baseline package/profile first. Require the installed
source5829 APK hash/signer/ABI before seeding unique normal groups/bookmarks/
history/search/Shields/filter fixtures through actual native UI. No downgrade,
clear data or profile copying. Seed acceptance is distinct from the subsequent
in-place updated-APK migration/relaunch;6.1 remains unchecked until both pass.
Baseline preparation passes against installed source5829 SHA256
80d0649ca66dafa19374a10aa7c7bdb767ef0b2e911b35044ff7ca8cb49f9605.
The existing original tabs/favorite survive. Final seed has active normal IDs
3,5,6,8 (selected8), no private tabs; stored group token
B7DD0EC3CC2E598E11127809416C4605 has active member6. During preparation,
old native Back closes only the newly created popup child7; preserve the final
single-member group and add the normal privacy fixture8 before fingerprinting.
Bookmark IDs5/7, native DuckDuckGo501, loopback Shields setting2 and cookie-list
UUID AC023D22-AE88-4060-A978-4FEEEC4221693 enabled=false are recorded. Native
History Open returns to the exact privacy upgrade query, and genuine Chromium
navigation reads tv_privacy=seeded plus localStorage seeded. No profile is copied,
rewritten, wiped or downgraded. Read-only diagnostics reuse the cached generated
FlatBuffer class, compiled native metadata reader and pinned JDK25; they reject
private metadata and exclude orphan files from active-tab comparisons. Initial
helper classpath/tri-state/URL-label assumptions are corrected from pinned
sources, not accepted as browser failures. The complete before-upgrade manifest
is probes/engine-lifecycle-r1/upgrade-baseline-manifest-r1.json in the cache.
No new APK/build/source commit exists while signing remains unavailable; source
2e99 is committed but unpushed, its14-file review correction is staged, and the
root/cache remain pinned to fe7b. Remaining private-cache acceptance, complete
upgrade, retirement/final-artifact review and sustained V checks require that
reviewed/pushed correction and packaged APK. Preserve both AVDs and all caches;
stop only owned baseline emulator/static fixture and remove its owned18088 reverse
before yielding this concrete signing blocker. KVM group access still works.
Closeout confirms both owned units inactive with Result=success; baseline
reverse18088 removed and its automation lease closed. Stock LatinIME is restored.
Host has26GiB available/swap0/295GiB free; no Chromium build or emulator is active.
Both master branches and staged correction remain intact. Canonical39/54 is
unchanged; source/build/runtime/private/hardware gates are not checked from
fixture preparation or restored KVM access. Chromecast remains untouched.


























Outside-host continuation: KVM still lacks this user's access, and the user
cannot authenticate while away. A bounded no-prompt signing probe using the
matching system GPG2.4.8 also reports `No pinentry`; this is not just the Nix
GPG/agent version mismatch. No credentials, signing settings or privileged host
permissions are changed. Continue independent source work: preserve the native
Search command's empty editor semantics separately from Address's current URL,
and extend the existing routing case on a real web tab to assert both values
and unchanged tab/contents. Audit private presentation cleanup and replaced
surface callers while native acceptance remains blocked. Keep routing staged
separately from the genuine-D-pad test correction; no new commit/build/runtime
pass is claimed until its prerequisites are satisfied.

Private-draft acceptance preparation (Stage6.3): add one actual Activity
recreation case with an unsubmitted synthetic private Address draft. Require
the recreated native tab identity, a fresh empty editor, and no draft/private
Home in the original normal model. Use the real Compose accessibility text
action, retain native window security and avoid failure screenshots. Existing
clear-data/private-library/secure-window checks carry forward; this new case
does not prove process-death, thumbnail-disk protection or failed-write behavior.
Audit confirms the TV UI adds no thumbnail requests, but Chromium's existing
TabContentManager still captures native pages/content on pause/model changes.
FLAG_SECURE protects OS capture, not that internal cache; keep its private-cache
runtime gate pending rather than infer it from secure-window checks.
Pinned UIAutomator bytecode also confirms `UiObject2.getText()` may return null
for a textless accessibility node. The new cases require an actual editor and
accept null/empty for an empty field, while requiring exact current URL text for
Address. Pinned Java formatting and source/index/root whitespace checks pass.
No production engine change is made for private persistence without a failure.

Device-tool recovery incident: software CPU boot completes in106,408ms and the
verified nonphysical AVD opens in T3 with agent-device0.21.24. The attempted
`reinstall` was a workflow error: inspecting runtime3.js afterward proves its
replaceExisting branch calls plain `adb uninstall` before install. The client
times out, and scoped `pm path` confirms the production package is absent while
the TEST package remains. Consequently this AVD's production synthetic profile
is lost; it was not a successful profile-preserving update. User was informed.
Other AVDs, TEST profile, SDK/build/artifact caches and physical TV are untouched.
Restore the production package using verified `install -r` semantics only;
never use agent-device reinstall for a preserved profile. Keep all prior runtime
evidence historical, do not claim this installation proves upgrade persistence,
and use the separately preserved source5829 baseline for Stage6.1. Guard the
task-owned driver against reinstall and document the native tool behavior.
Recovery uses explicit verified-emulator `adb install -r`, reports real Android
Success and matches installed production SHA256
`a8e521bda0cb598e1a99eea578b66db5d30814babaa3ec5c688d6eca8131ebd6`
for sourcee088. Combined installation/device-hash time191.116seconds under
software CPU. `installed-toolbar-r69.json` explicitly records
`profilePreserved:false` and the incident; TEST remains its previously installed
sourceff6d build. Subsequent production checks use a newly created synthetic
fixture profile and cannot prove migration or comparable performance.
The launcher reports Opened, but actual native inspection finds the TV launcher
and no browser PID. Bounded native crash logs prove production browser SIGABRT
at14:52:42, with `Timed out waiting for GPU channel` in
`content/browser/gpu/browser_gpu_channel_host_factory.cc:53`. The T3 snapshot
helper also rejects incomplete accessibility capture after500ms. Platform
uiautomator inspection changes no screenshot/security flags. This software-CPU
fallback therefore supplies no usable engine/UI acceptance. The pinned Android
factory explicitly has no software fallback for its GPU-channel timeout; do not
disable native watchdog/security ownership to manufacture a pass. KVM access
and the configured Git signing session remain real host prerequisites, with
interactive commands already requested. Stop only owned idle fixtures and this
verified software AVD to release memory, preserving every disk/profile/cache
that remains. Continue the staged routing review/build and corrected genuine-
D-pad crash test once those prerequisites are restored. No current implementation
commit or push is claimed while signing fails.
The two owned fixture units are stopped and the exact verified emulator receives
`emu kill`; its unit ends with Result=core-dump during shutdown, which is
retained rather than reported as a clean emulator pass. No QEMU/emulator process
remains. Host memory returns to2.8GiB used/27GiB available. Shared ADB/T3 services,
other AVDs and all compile/artifact caches remain intact. Root/source changes
remain owned working changes (routing staged, genuine-D-pad correction unstaged)
pending the configured interactive signing prerequisite.

Bounded emulator fallback: the pinned binary's `-help-accel` explicitly supports
`off`. Try one task-owned software-CPU boot of the preserved
brave_tv_launch_followup_api36 AVD with SwiftShader/Vulkan disabled, exact port
5554 and the existing 5G high/6G max/swap0 limits. Verify guest boot/AVD identity
before opening the T3 panel or input. This avoids any privileged host change;
it does not restore KVM, authorize physical access or supply comparable
performance measurements. Stop the attempt if it cannot reach a usable guest
within a bounded investigation, retaining userdata and logs.

Loading-entry fixture preparation: extend the existing bounded loopback slow
document with one native-click counter and a stable centered target. Keep its
15-second streamed response, two-slot limit, HEAD/method bounds and cancellation
cleanup. This will let the pending Stage3.3 first-activation case distinguish
closed controls, native content focus, cursor visibility and exactly one real
click while Chromium is loading. Run only the affected host fixture checks now;
do not change input validation or claim the emulator retry fixed before a native
reproduction is available.
Affected real-HTTP checks pass after explicit readiness. The initial connection
was refused while Nix startup was throttled by the fixture's128M high limit;
raising only both task-owned fixture units to512M high/768M max lets startup
finish. Observed startup peaks236,244,992/235,749,376 bytes, steady security
fixture25,456,640 bytes and static fixture11,997,184 bytes. Chromium build
limits are unchanged. The response check accumulates bounded chunks until the
counter arrives instead of assuming one TCP read contains the full markup.

Native crash-test input correction: decompiling the pinned UIAutomator
InteractionController proves `sendKeys` constructs source257 (`SOURCE_KEYBOARD`)
with virtual keyboard device -1. The new renderer-recovery case must inject
`SOURCE_DPAD` Down/Up through Android UiAutomation to exercise the actual TV
adapter; do not weaken alphabetic-keyboard/IME guards. Preserve its genuine
renderer crash, native Reload and exact tab/contents/model assertions. This is
a separate test correction after the staged routing slice; native runtime
remains pending KVM access.

Presentation persistence audit (Stage6.2): inspect the actual TV presentation,
activity saved-state hooks and existing native preference writers. Record the
schema decision and compatible rollback procedure without inventing a new
preference store or copying browser data. Acceptance uses the source audit plus
already-passed fresh-profile/default and provider-persistence engine checks;
baseline upgrade and interrupted-write/private-cache acceptance remain separate.
The reboot also removed the GPG signing session: the staged routing commit fails
at signing because interactive pinentry is unavailable. Requested an interactive
host commit to unlock the user's key; signing was not disabled and no push or
build was claimed for the uncommitted slice.

Native-entry retirement slice: route existing native menu/keyboard Address,
search, bookmarks, history, downloads, tab-search, Settings, About and clear-data
commands through the TV controller's existing actions. Consume recognized
commands while native security, IME, background or locked-private owners prevent
opening; never fall through to a competing mobile panel. Retain unknown native
commands and phone presentation. Route `chrome://adblock/` through its delegate's
actual selected activity/contents into the existing TV filter panel, preserving
native enforcement and signed updates. Acceptance: actual menu dispatch from
both web and Home, one TV window, unchanged native tab/contents/model, Back focus
restoration, direct native adblock URL and private/native-owner rejection.
Write focused native cases, review latest source/root commits and reuse cached
blocking analysis. Runtime acceptance remains pending the host KVM prerequisite;
do not check Stage4.8 from compilation alone.

Host interruption recovery (11 October): host boot journal confirms reboot at
14:13 EDT. TV AVD previously exited with SIGSEGV at14:05; no kernel OOM entry
was found in the retained previous-boot log, which does not establish a cause.
Build r68 stopped after19.68s/10 completed steps and lacks successful GNU Time
completion; fresh-boot systemd success defaults are not acceptance. Its38 saved
samples observe14,691,209,216 bytes peak while still active. Both repositories
remain clean at root `bf76535`/source `e08856652`, and cached objects/SDK/APKs
are intact. Resume the same build as r69 with all emulators stopped, unchanged
four-worker/18G high/22G max/swap0/blocking-analysis limits, then reopen only the
explicit TV AVD without wiping data. The r67 production address/notice check
was interrupted by device-offline and remains unverified; its three isolated
native cases had already passed. Preserve failed logs and fresh device/config
ownership; do not restart shared ADB or operate the Chromecast.
The pinned emulator advertises `swiftshader` as a supported GLES renderer.
Use that explicit renderer with guest Vulkan still disabled for the next owned
TV boot, preserving the existing AVD disk/profile. The prior `auto` renderer's
QEMU process exited with SIGSEGV; this fallback is a bounded host-graphics
recovery, not proof of the cause. Record the changed renderer when collecting
new evidence and do not compare its timings to the earlier performance budget.
Resumed r69 completes blocking analysis in3m29.75s;93 saved memory samples
observe19,330,367,488 bytes peak (18.00GiB), with measured memory.events
high1419/max0/oom0/oom_kill0. The preserved sourcee088 artifacts are production
852,744,653 bytes SHA256
`a8e521bda0cb598e1a99eea578b66db5d30814babaa3ec5c688d6eca8131ebd6`
and TEST876,382,231 bytes SHA256
`13a9f5b3933f7a3d644a36a23b201210979649ea306f4deb739cb916c899df35`
in `~/.cache/brave-tv/artifacts/compose-crash-e08856652-x64-debug-20261011`.
The SwiftShader TV launch exits before guest boot: `/dev/kvm` lacks nitesh's
read/write ACL after reboot (only gdm-greeter has a named user ACL), and nitesh
is not in kvm. `sudo -n` requires interactive authentication. Requested the
temporary per-user `sudo setfacl -m u:nitesh:rw /dev/kvm` prerequisite; no guest,
profile or physical action occurred. Continue independent routing work while
native runtime acceptance remains pending.

Renderer recovery slice: production source6d actual `Page.crash` reaches native
Aw, Snap. D-pad Down focuses `sad_tab_message`; subsequent Down/Right stay in
the clickable-span text instead of reaching the native Reload button. Back
returns to the previous usable page, so preserve that native behavior. For
unmodified D-pad Down from that exact visible native crash-message owner, move
focus to its existing enabled recovery button. Retain native click/Back/help,
security/modal/IME and alphabetic-key ownership. Acceptance: genuine native
renderer-process crash, D-pad message → Reload → same-tab restored page, no
replacement tab/contents, then native Back to usable TV controls. Use the actual
crash helper, not its separate fake-notification helper. Review latest commits
and build only affected source/tests in the retained cache.

Unavailable-link result: reviewed source `ff6d2dfa9` and root `5b221fe` each
Standards0/Spec0. Cached r67 full APK build passes blocking analysis in7m24.10s
(1050 steps);221 cgroup samples observe13,652,529,152 bytes peak (12.72GiB),
no OOM. Preserved signed x64 APKs in
`~/.cache/brave-tv/artifacts/compose-external-ff6d2dfa9-x64-debug-20261011`:
production852,744,909 bytes SHA256
`69f6ae507db8593df687743e7764678114c08086a25c29e2606b3a7b4195dd4e`,
TEST876,385,339 bytes SHA256
`0e6c795a6e16579dd17f5b4ad6d792865a8605712e0704749942cc8ae0fde2a0`.
Both profile-preserving installations verify the exact device-side hashes.
Native r44 isolated cases pass actual unavailable-link/same-document Back+OK
and future-navigation disposal (12.639s), focused-editor/hidden-IME rejection
(6.294s), stale/private-owner rejection (6.313s). Each reports OK(1test); no
private capture or permission override. Stage5.6 remains unchecked while crash,
popup and complete remote file-picker paths are consolidated.

Exceptional-flow correction: a genuine user gesture on the controlled
`bravetv-unavailable://fixture` link leaves the actual Chromium page unchanged
without an explanation. After Chromium returns no external-navigation override,
show a small TV-only informational panel for an unsupported main-frame scheme
with a user gesture. Bind it to the delegate's actual activity/WebContents;
reject stale, private, background, editable and native-security owners without
unlock side effects. Preserve Chromium's navigation/permission decisions and
never display/log the external URL. Dispose on future navigation, tab/contents
change, renderer loss and activity lifecycle. Acceptance: actual-link native
test, D-pad OK/Back return to the same document, stale/private rejection and
navigation disposal, cached blocking-analysis APK build and latest-commit review.
Carry unchanged security/input checks; hardware remains pending.

Latest source `a8bed0b70` Standards review requests the public entry points'
UI-thread, borrowed-contents and lifecycle contracts (DOC-004). Document the
existing TV-only stale/private/security rejection and navigation/owner disposal;
no behavior change. Review the correction before accepting runtime results.

Source `a8bed0b70` Spec review also identifies a missing focused-editable guard:
hidden IME alone does not release Chromium's editor ownership. The r66 build
was deliberately interrupted before acceptance (35 steps; no compile failure).
Check the existing native ImeAdapter focused-node state and add a real focused
input/hidden-keyboard rejection case. Rebuild only the corrected source, keeping
all existing output and dependency caches. Review that correction separately.

Latest correction `04211e0` reviews: Standards0/Spec0. Next consolidated native
slice covers fullscreen tab-switch/background recovery and remaining exceptional
flows on installed source6d: genuine media/fullscreen, normal tab identity,
revoked background session, native foreground/controls recovery, controlled
network failure, renderer crash, file-picker cancel and unsupported external
navigation. Reuse accepted playback/input/security results. Require explicit
AVD/forward ownership and unique authenticated normal fixture targets before
DOM reads; keep native security/OS decisions authoritative. Record failures
before source changes and accept only actual engine/native return paths. No
profile wipe, private page capture, physical operation or rebuild without a
source change.

Fullscreen acceptance commit `9578ca5` reviews: Standards0/Spec0. Native error
recovery passes on the current APK: connection-refused UI, D-pad Back to controls,
then a real Reload after an owned local endpoint/reverse becomes available.
The file-input D-pad activation reaches the genuine OS camera prompt; deny it
without approval. Chromium returns to the same field with an empty selection
and real cancel event. This TV image lacks DocumentsUI, so do not claim a picker
was displayed. The image-only input opens the real native Photos/Albums picker;
D-pad Back returns a real cancel event with no file selected. Its diagnostic
opener was a browser touch gesture, so remote activation remains to be verified.
TV GET_CONTENT handlers include DocumentsStub/MediaStub instead of DocumentsUI.
The phone's stock picker APK was inspected but not installed. Keep the generic
picker limitation and hardware uncertainty separate from the working image
picker. Preserve native security ownership; no capture grant or file upload.

Latest-review correction for root `8381a24d`: reject missing or duplicate exact
TV fixture and companion targets before any DOM reads or input. Keep native
text mismatch diagnostics value-free. Acceptance: host-only CLI negatives prove
both ambiguity gates stop before DOM access, plus a unique-target boundary
check. Carry the unchanged complete native r89 result; no APK rebuild or broad
input rerun is needed for this test-instrumentation correction.

Correction result: five host-only strict-input CLI checks pass. Missing and
duplicate TV/phone targets across browser contexts stop before DOM access;
unique targets reach authenticated-state validation. Text assertions preserve
their strict comparisons but report only a generic mismatch. These host guards
supplement the real r89 native-input evidence; they do not establish runtime
input or privacy acceptance independently.

Review correction: remove the stale current total from the Stage 5 evidence
paragraph and refer to the canonical totals at the top of the UI checklist.
Acceptance: the current summary uses the canonical checklist totals, with
historical test counts preserved. Documentation corrections require no rebuild
or repeated test.

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

Design review follow-up: preserve Address invoker on Back/Escape, and model
explicit editing mode so the prototype can submit/leave its input using D-pad
and OK. Clarify CloseWatcher/native handling in the inventory. Validate these
routes in T3 preview before marking navigable design acceptance. This changes
the synthetic design demonstration only; actual Chromium input is not replaced.

Fifth attempt compiles the Kotlin screen, then Java header compilation fails
because TvHomePage exposes ComposeView without a direct AndroidX dependency.
Keep the presentation seam small: factories return Android View, and expose
explicit UI-thread disposal for factory-created views; Java browser ownership
does not need to depend on Compose internals. T3 preview's six design checks
pass after editor/fullscreen/final-tab/cancel corrections. Baseline synthetic
`remote-input.html` is now bookmarked through BookmarkModel for upgrade checks.

Design focus correction: review found that Clear/Down could leave the previous
CSS focus highlight while moving actual focus. Centralize prototype focus
updates (logical index, CSS and DOM) and test Clear/Down/Escape specifically.

Sixth attempt passes Kotlin and Java headers; Chromium's direct bytecode
dependency check requires the already pinned CoroutineScope target used by
LaunchedEffect. Add that direct dependency, keeping all bytecode checks enabled.

Seventh attempt reaches blocking APK lint, which reports the cursor drawable
unused after replacing its only Java control. Remove only `ic_cursor.xml` from
the source-owned generated icon list after verifying no remaining callers;
do not suppress lint. Peak build memory was 14,268,887,040 bytes (13.29 GiB).
Baseline installed APK hash matches the preserved source5829 artifact:
`80d0649ca66dafa19374a10aa7c7bdb767ef0b2e911b35044ff7ca8cb49f9605`,
851,001,060 bytes. Synthetic bookmark/history remain in the emulator profile.

Eighth attempt rejects the retired generated drawable still present in the
retained output directory. Preserve that cache as required: restore the icon
list entry and use the existing cursor icon beside its Compose action label.
This is also a useful visual cue; expose an optional drawable ID in the small
presentation action rather than coupling Kotlin to browser resource ownership.
Acceptance remains mandatory lint and real APK focus/runtime checks.

Ninth attempt and both latest-commit reviewers identify the same incorrect
resource identifier in the icon predicate: the existing Page cursor action is
`brave_tv_pointer`. Correct that one predicate; Java compilation failed with
`cannot find symbol brave_tv_cursor`. No APK/runtime acceptance is implied.

Actual GN APK proof now builds on source `ad0075be5`: blocking lint/Error Prone
passed, elapsed3m45.71s, observed peak15,160,426,496 bytes (14.12 GiB). Preserved
artifact `compose-spike-ad0075be5-x64-debug-20261010/BraveMonox64.apk`, 852,560,037
bytes, SHA256 `109e6148cd9d6505fa97479bf33df336a5f140844aca5d0be36a3cc03d09342f`;
signature verification and explicit emulator update installation passed. APK
growth is 1,558,977 bytes. Real Compose home/controls render and D-pad/OK works;
headings incorrectly inherit black, button semantics need an explicit role,
and the four-row core panel is too tall. Correct those in the presentation
module: warm content-color provider, headings/button roles, restrained rounded
shapes and a two-row default panel with More/return. Scoped dialog Back collapses
More before retaining the existing native root Back handler. Acceptance: actual
heading contrast/semantics and remote-only compact/More/return focus replay,
then continue mandatory IME/compositor/lifecycle/security tests before migration.

Baseline group proof: popup created a native group; closing its synthetic child
then attempting to close its final parent opens the real group-delete dialog.
Cancel starts focused; Right reaches Delete, Left returns Cancel, and Cancel
retains the fixture. Keep that group for upgrade validation. Uncontended baseline
launch samples are saved separately in `tv-ui-baseline-uncontended.json`.

Compact proof follow-up: source `f10b4864f` builds with blocking analysis (966
cached Android steps, 7m52s; observed peak14.21 GiB). Native headings now have
warm contrast and More/Back moves actual focus correctly. Raw accessibility
nodes expose the focused TV Surface separately from its label/button semantics
with the pinned newer Compose runtime. Text-plus-focus selectors therefore fail.
Publish one actionable, labelled semantic node with tracked native focus,
disabled state and a guarded accessibility click; keep TV Material key delivery.
Acceptance requires labelled focused Button nodes and the actual overflow replay,
not a selector relaxed to text existence. Continue native proof and shared state.

Shared state slice (Stage3): extract a small UI-thread browser session owned by
the TV controller. Observe the selected native tab/WebContents and document
navigation, focus, fullscreen and viewport changes. Capture immutable identity
contexts for panel callbacks and held-OK; URL equality alone must not authorize
input. Reuse navigation actions from TV and the authenticated phone caller;
retain phone allowlists, editable revisions and side-effect-free rejection.
Dispose native observers with activity lifetime. Loading/history updates change
Compose panel state while preserving keyed button focus, rather than recreating
the dialog/WebContents. Acceptance: blocking build, same-URL navigation/held-OK
cancellation, live Reload/Stop, stale callback and existing phone security/input
regressions on actual Chromium. No broad core-surface migration before those
gates; independent implementation and design work continues during builds.

Shared-state latest review: Spec reports no actionable findings; Standards asks
for the public focusHome UI-thread/factory-view/asynchronous contract and flags
redundant Tab-plus-Context parameters. Document focus and pass the context alone
through panel callbacks, deriving its tab after validation so mismatched pairs
cannot occur. Review corrections before broadening the UI. Root session/input
tests pass15/15; the real shared-state APK/phone gates are still pending.

Shared-state build r13 compiles/packages but fails mandatory Error Prone:
the retired private currentUrl helper has no callers after identity extraction.
Remove that obsolete helper; preserve warnings-as-errors. Do not install or
accept the APK packaged before analysis failed. Observed cgroup peak was
13,890,441,216 bytes (12.94 GiB), and the host remained responsive with both
emulators. Add a native uinput/CDP regression that proves a click reaches the
fixture first, then holds OK across a real same-URL document reload and requires
zero clicks on the replacement. CDP performs navigation/readback, never injected
text values. Device runtime acceptance remains pending on the corrected APK.

Native race probe review correction: bind the CDP forward to the same explicit
emulator as uinput, bound child-process teardown to5s, allow the held key to reach
the UI before reloading, and add a fresh-click postcondition after cancellation.
The exact strengthened probe fails on installed predecessor `7ef938f03`:
preflight reaches the native page, but held-OK release after same-URL reload
produces `Clicks: 1` instead of0. This confirms the missing document-identity
protection and gives a real red regression; the corrected APK must pass unchanged.
No data wipe/downgrade, DOM input injection or physical operation was used.

Shared session runtime: corrected source `65ce991ce` passes blocking analysis
(r14 3m41s, observed peak13.72 GiB), signature and update install. The unchanged
same-URL native race probe now passes including its fresh-click postcondition;
predecessor `7ef938f03` fails the same assertion. Artifact852,603,986 bytes,
SHA256 `2a5d97d9498e28fb4b85512a6397f0fb30c8a761c5b749fd164a88595fb036b2`.
Home→controls initial Address now passes. The full overflow replay catches a
real Back routing problem on API36: native dialog Back bypasses its key listener,
cancels the whole panel and navigates page history instead of collapsing More.
Register a callback on the dialog's own AndroidX Back dispatcher, collapse More
there and preserve the existing root cancel/native Back policy. Keep the scoped
key listener for older key delivery. Clear held context references on cancellation
and release as well, so closed private content is not retained by a stale lease.
Acceptance: unchanged overflow replay, native dialogs and continued phone gates.

Phone/session gates on source65ce: QR auto-pair/approval, real touch gestures,
Back/Forward/Reload, normal tab actions, exact protocol numbers, stale document,
duplicate/field rejection, native Unicode/composition/selection/deletion and
password exclusion pass. Direct private-address transport rejects invalid
Host/Origin/method/parser inputs and bounds idle sockets; short disconnect
restores the same session in457ms without replay. These are Android emulators,
not real iOS/camera/hardware proof. The fullscreen probe passes from center but
fails from a left-edge start: diagnostic x130 produces dx1570, exceeding the
existing1000 command bound. Correct the test to travel in bounded steps, exercise
the left edge explicitly, and retain real native cursor-pixel acceptance. Native
bounds/security must remain unchanged. Review source da718 and root751cd found
no actionable Standards or Spec findings; corrected Back runtime is pending.

Back correction source `da7183c3f` passes blocking analysis (r15 4m21s,
observed peak13.35GiB), APK signature/update install and the unchanged19-step
home/overflow replay. Artifact852,603,270 bytes, SHA256
`5f3962618fc4d44ec1a30fc64f7519e62aaef690bd40ba37076087e695449cfb`.
The bounded fullscreen/cursor probe passes with a forced left-edge traversal.
On this APK, raw authenticated phone commands are rejected while a real native
alert or private tab owns input; paused responses contain only revision/paused.
The alert remains until remoteOK and returns to the same page. Private Address
focus remains unchanged by rejected commands; the actual window has SECURE.
No private screenshots or physical-device operations were used.

Next complete slice: replace the shared TV panel renderer with the selected
Compose theme, retaining native dialog windows, callbacks and storage/security
owners. Migrate tabs/bookmarks/history/settings/Shields/filter/media/QR surfaces
through that renderer, including live media labels/enabled/focus state and native
QR image interop. Keep lists bounded and scrollable; dispose compositions when
dialogs close and protect private windows. Correct root-controls Back to dismiss
to its home/page invoker rather than forward the same Back into page history.
Acceptance: native panel traversal/scroll, Cancel-before-delete, parent/focus
restoration, media-state updates, QR pairing, and unchanged security/model tests.
Address/home data/tab actions/download improvements follow as separate slices;
a renderer migration alone is not complete feature acceptance.

Latest root review: Standards has no findings; Spec catches an incomplete edit
request in the paused probe (missing editable/version). Remove that request:
its rejection does not prove input ownership. The probe now claims only valid
navigation/new/back/pointer rejection and metadata redaction. Native Unicode,
editable-version/stale-focus and password checks remain the separate real native
input probe. Re-run paused checks for actual modal/private owners after review.
The next panel slice also covers disabled overflow initial focus (currently
falls back to the toggle) and disables the phone entry in private controls.
Final private closure on da718 returns to the retained normal dialogs fixture;
no private URL/title is copied into normal browsing.

Root-controls Back regression added to the native home/overflow replay. On the
installed da718 predecessor, overflow collapse passes but root Back forwards
into the retained page history instead of returning to home. Keep this failing
postcondition for the shared-panel candidate; do not relax it to any visible page.
Latest root correction review has no Standards or Spec findings.

Panel source review: Standards has no findings; Spec identifies live playback
becoming disabled between panel creation and the first-frame focus request.
Give each existing action its own initial focus target and choose the currently
enabled preferred/fallback action at the handoff. Later updates keep their native
focus-recovery path, without re-running initial focus or stealing established
focus. This correction is required before accepting the shared panel candidate.
The r16 build still uses committed3516; do not mutate its cached checkout while
it runs. Build the reviewed correction incrementally afterward.

Shared-panel r17 source386 passes blocking build/signature/update install;
1m40.61s, observed memory lower bound12,484,333,568 bytes (completed service
peak unavailable). Artifact852,618,882 bytes, SHA256
`c31cf1f13985a7b267f935fc7de99df75ffc6cfb86236f0ec6cc9ad62cda35b5`.
Home/overflow/root-Back replay passes22 steps. Opening Tabs fails twice: the
new native panel manually measures ComposeView immediately after dialog.show,
before Android attaches it; crash is `Cannot locate windowRecomposer` from
TvBrowserPanel.show109. New real-panel replay fails at New tab focused.
Correction slice: remove premature manual measurement, bound the presentation
column to90% logical display height and let the attached native window measure
its wrap-content height. Retain native width/private/disposal policy. Acceptance
requires unchanged real-panel regression, scroll and child Back on actual APK;
no renderer migration acceptance based on this compiling-but-crashing build.

Latest attachment review: Standards has no findings; Spec identifies the final
Bookmarks text wait as matching its invoker. Require panel-only More bookmarks
instead, preserving the New tab focus assertion. Child Back must also restore
Tabs; the existing NTP reset may expose a separate failure after attachment.

Attachment correction r18/cdea passes blocking analysis3m44.57s, signature and
update installation; observed peak13,678,456,832 bytes (12.74GiB). Artifact
852,618,650 bytes, SHA256
`f311e1020222dcf64a05bf5e6dd94c375af17a0c44c0ecac563ea40874d69519`.
The unchanged replay now opens native-model Tabs with New tab focused, then
fails exactly at child Back restoring Tabs: existing showControls resets NTP
focus to Address even on return from a child. Correction slice distinguishes
root entry from child return: root home controls keep Address; child return
preserves the existing action identity. Acceptance is the unchanged panel replay
and home/overflow/root-Back replay together. Continue panel native gates afterward.

Panel migration runtime on cdea: native Tabs list scrolls to lower model rows;
Bookmarks opens its genuine Mobile folder and retains the source5829 synthetic
TV remote input bookmark. Native QR AndroidView decodes and actual phone browser
pairs at TV private address36331; only bundled assets load, the fragment is removed,
QR waiting hides manual form, and physical D-pad approval succeeds. No physical
phone/camera/LAN claim follows. The current normal model contains3 tabs after
fixture work; this is not proof of unchanged baseline group membership.

Next address slice (Stage4.2): a Compose TV editor in a retained native dialog,
real Android InputConnection/IME, select-all/edit/clear/Go/Cancel, selected native
search-provider description, and at most6 matching saved-bookmark suggestions.
Use the pinned AutocompleteController classification and native LoadUrlParams;
retain the session's tab/document/viewport lease and fail recoverably if it changes.
No DOM input injection, new storage or network suggestions. Private text is
unsaved and private dialog windows are SECURE before show. Intercept only the TV
focus_url_bar entry, retaining mobile behavior. Acceptance: actual APK editor
focus/IME Unicode/selection/deletion, URL vs selected-provider search, empty and
invalid/stale state, Cancel/Back returning to home/page, private/native phone
rejection. Toolbar retirement and real home content follow independently.

Corrected panel c830/r19 runtime passes unchanged16-step real-model panel replay
and22-step home/overflow/root-Back replay. Both latest correction reviewers have
no findings. Editor cb805 review: Standards requests single authoritative text
and suggestion limits; Spec finds an open editor survives selected tab/profile
closure/switch with old text visible, despite rejecting submit. Correction slice
shares limits at the editor seam and binds its owning context to native change
notifications, dismissing/clearing composition and state on tab/content ownership
change. Document-only staleness remains a recoverable error. Also request Android
IME no-personalized-learning for address text (including private input), using
the pinned platform IME option, without controlling or granting keyboard permissions.
Acceptance: reviewed correction, blocking build, actual owner-switch/stale/IME
probes. r20 still compiles committed cb805; cached checkout remains immutable.

Editor r20 fails early in real Kotlin compilation because pinned Compose1.13
marks TextFieldValue BasicTextField overload deprecated and warnings are errors.
Use its supported TextFieldState overload (unsaved instance, genuine selection
and composition) rather than suppress checks. Its platform input interceptor
lets the genuine InputConnection set no-learning/no-extract flags; do not fake a
password input type. Dispose/reset editor text and undo history with its owner.
Observed failed-build peak9,098,833,920 bytes (8.47GiB); cache preserved.

Editor correction0370 review: Spec reports no findings; Standards finds the
native ownership observer touches editor UI before the existing activity-alive
guard. Move that guard ahead of editor handling and recheck after synchronous
session capture, retaining input cancellation. Acceptance: latest-only review
and blocking native build, then owner-switch/disposal runtime probes. r21 is
building committed0370 in the immutable cached checkout; a subsequent build
will include this lifecycle correction without resetting dependencies.

r21 fails on the supported interceptor's override parameter-name warning
(`outAttrs` versus the pinned interface's `outAttributes`), with warnings still
blocking. Match the interface name exactly. Observed peak7,960,109,056 bytes
(7.41GiB); no APK installed. r22 will build both this compile correction and
the activity lifecycle guard using the retained output.

Test-driving incident on installed c830 while r22 builds: a manual batch
continued after a failed focus assertion and selected Clear now, clearing the
emulator normal profile's cookies/site data. The native completion message
confirms it. No application wipe occurred; bookmark/history/tab fixtures remain,
but prior cookie/storage migration continuity is no longer valid. Reseed a
documented synthetic site-data fixture for subsequent upgrade tests. All
dependent test actions must stop immediately when an assertion fails; use a
fail-fast replay for destructive confirmation traversal. This is an automation
mistake, not evidence of a UI bypass or permission change.

The corrected13-step `tv-compose-clear-cancel.ad` replay passes on c830:
Cancel initially focused, Right reaches Clear now, Left returns Cancel, OK
returns to the scoped chooser. This proves traversal/cancellation, not site-data
continuity; that requires a freshly seeded fixture checked before/after.

Address acceptance fixture slice: extend only the emulator test IME's TV-mode
view with fixed synthetic Unicode, selection, code-point deletion, composition
commit and over-limit stimuli. Keep its existing phone view unchanged. Show
only whether the native EditorInfo privacy flags are present, never extracted
field payloads/logs. No command endpoint or production dependency. Use the
retained SDK/build script and a separate artifact directory; select/install
only on the verified TV emulator, restore its keyboard afterward. Acceptance:
actual corrected APK text results, no duplicate composition, enforced bound
and native privacy flags; passing fixture compilation alone is insufficient.

r22 sourcebeda passes blocking analysis in7m13.81s (Siso7m10.86s), four local
jobs with18/22GiB limits and swap0. Observed peak13,532,639,232 bytes (12.60GiB);
the completed transient cgroup no longer exposes a final peak. Preserved artifact
`compose-address-beda33f23-x64-debug-20261010/BraveMonox64.apk`,852,651,564 bytes,
SHA256 `8021fbd9835ca36ede26810f64e9c75f8b7bdddaea2e844bca4d9b2a0340a5ec`.
APK signature verification passes; corrected editor runtime acceptance remains
pending. Cache source is cleanbeda, built from rootpinbcef; no reset/sync.

Additional installedc830 shared-panel runtime: fresh screenshot-decoded QR
pairs with the phone emulator at actual TV private address42507, bundled assets
and waiting/approval/fragment checks pass. Corrected authenticated paused probe
rejects all four valid commands while private home remains unchanged; closing
the final private test tab restores the original normal home/3tabs with Address
focused. These are native emulator proofs, not physical LAN/phone acceptance.
TV-mode test IME builds/signs using the existing SDK; runtime stimuli pending.

Editor entry r22 runtime is RED: the actual home→OK replay fails waiting for
the TV-only Clear action; it opens the mobile omnibox instead. The tabbed
activity consumes focus_url_bar before calling BraveActivity's parent override.
Correct the retained bytecode adapter to consult one TV-only command handler
at the start of that real tabbed command method; keep phone behavior and all
native commands not handled by TV unchanged. Fail the adapter build if its
exact native method disappears. Remove duplicated parent command logic.
Acceptance: unchanged red-capable home-entry replay, controls entry and native
keyboard entry, then the full editor IME/lifetime/security checks. No cache edits.

Test-IME review correction: Android reuses the input view across targets, so
the privacy flag label must refresh for every input/input-view start. Update
only that boolean from current EditorInfo; never log/extract field payloads.
Acceptance includes a second editor connection, avoiding a stale true display.

Latest entry-hook review: Spec has no findings; Standards AND-022 requires
BytecodeTest coverage for the newly injected BraveActivity handler. Add class
existence and its exact boolean/int signature beside the existing tabbed command
checks. Keep the adapter's missing-method failure and actual entry replay;
signature tests alone are not behavioral proof. Core-controls→Address already
opens the genuine r22 Compose editor (8-step diagnostic passes), isolating the
remaining Home routing failure from editor construction.

Editor accessibility runtime RED on r22: the Android editable node is unnamed;
Address labels a child View instead. The native labelled-editable assertion
fails despite editor construction passing. Set its label through the pinned
InputTransformation.applySemantics hook on the actual text-input semantics,
retaining all editable/selection/composition behavior; remove the stray child
description. Acceptance: labelled focused editable native node plus genuine
IME stimuli on the next blocking build, alongside unchanged Home entry replay.

Native IME-window runtime RED on r22: both OK and a diagnostic field tap fail
to show the installed test keyboard; its privacy-flags replay fails. Window
inspection identifies ALT_FOCUSABLE_IM set by native AlertDialog because the
Compose view has no Android text editor during initial content installation.
Clear only that flag after dialog.show (retain private SECURE and resize), and
explicitly let focused editor D-pad OK request the native software keyboard.
Acceptance: unchanged IME replay and actual Unicode/selection/composition/
deletion/bound/privacy results. No injected DOM text or keyboard permission grant.

Bytecode compatibility completeness: the new command-hook reflection test
requires its method name/signature retained in the existing test APK's R8
whitelist, not just its class. Add the exact boolean/int member to the existing
BraveActivity rule. Acceptance: latest-only review, matching reflection signature
and later targeted BytecodeTest instrumentation; the current Debug r23 build
does not prove optimized test-APK reflection acceptance.

r23 sourcefc429 builds with blocking analysis in4m03.17s; observed cgroup peak
14,256,881,664 bytes (13.28GiB). Preserved signed APK
`compose-address-ime-fc4292fa9-x64-debug-20261010/BraveMonox64.apk` is852,651,756
bytes, SHA256 `e82a28e45ac0f381d2068e69bc4a285f28e68c69eb400bc6124e85f61e3559b8`.
In-place explicit TV-emulator installation passes; unchanged Home-entry replay
now passes. Native IME replay passes after selecting RemoteIme after app launch
(the driver reselects its own hidden keyboard on launch). Fourteen native
InputConnection steps pass Hindi/emoji insertion, Japanese selection replacement,
code-point deletion, composing/commit without duplication and8193-character
rejection preserving prior text. All three native IME privacy flags pass.
The initial composition assertions reuse the preceding Japanese value and
do not establish a visible composition/commit transition; see the review
correction below before accepting that portion of the input evidence.

r23 focused editable-label assertion remains RED. Exact pinned Compose delegate
bytecode deliberately moves contentDescription to a synthetic child when the
text-field semantics merge descendants. Its native HintText mapping instead
sets AccessibilityNodeInfo hintText directly. Use that supported text-field
hint semantics, preserving actual editable text/actions and native input.
Acceptance: native editable-node hint with no duplicate label child, retained
Unicode/bound tests and stock D-pad keyboard/Back. Screen-reader acceptance
remains pending; accessibility snapshots alone do not prove spoken operation.

Stock LatinIME actual D-pad OK appends q to the synthetic Japanese text;
first Back keeps the editor, second Back restores Home Address focus. Add a
bounded emulator-only instrumentation probe to the existing IME fixture to
inspect AccessibilityNodeInfo hint/actions directly. It returns booleans/counts
only, never field text, and preserves other accessibility services. The current
driver does not expose hintText, so this avoids mistaking its missing field for
native acceptance. Confirm RED on installedfc429 and GREEN after the hint build.

The native hint probe initially encounters Android's single UiAutomation lease
(`UiAutomationService ... already registered!`) while agent-device owns it.
Closing only our agent session releases that lease and leaves the editor
visible; no shared ADB/T3 host service or emulator stops. Installedfc429 then
reports editorCount1, nativeSetTextActiontrue, nativeHintMatchesfalse: actual RED.
The host wrapper checks instrumentation result code, so shell exit0 cannot
masquerade as a passing instrumentation test.

Latestcdc7 review: Standards reports no findings; Spec identifies a false-pass
composition assertion because before/composing/committed values all equal
Japanese. Strengthen only the TV stimulus: after prior Japanese, compose kana
and assert that distinct text, then commit Japanese and assert replacement
without duplication. The phone's original Japanese composition fixture remains
unchanged. Recompile/reinstall the fixture and pass the strengthened native
replay before claiming composition/commit acceptance.

The strengthened14-step native replay passes on installedfc429: Japanese → kana
composition → Japanese commit is observable without duplication (8.9s).
r24 source897 passes blocking analysis in2m34.86s (Siso2m31.24s), observed peak
12,901,433,344 bytes (12.02GiB). Preserved APK
`compose-address-hint-897252e10-x64-debug-20261010/BraveMonox64.apk`,852,651,748
bytes, SHA256 `851588a48ff33e1d1a5cc7103047667e1e36adc67c2ff12ddf713ce2a6684f3a`.
Its hint runtime acceptance remains pending.

Address submission correction slice: actual native Go on fc429 rejects valid
synthetic Japanese text with the page-changed error while its Home owner appears
unchanged. The three-step `tv-compose-address-search-submit.ad` goes RED waiting
for Clear to disappear; it does not depend on external network success. Diagnose
keyboard/layout lease invalidation, delayed content identity and native access
guards with bounded metadata/debugger inspection, never logging editor text or
URLs. Preserve strict viewport leases for pointer/phone actions and document/tab
identity for editor submission. Acceptance requires native URL/search submission
after IME show/hide, unchanged owner-change and same-URL document rejection,
private/modal phone rejection and genuine input/privacy regression checks.

Debugger evidence confirms a layout invalidation: the selected tab/WebContents
remain identical, but the native viewport becomes842px high when the keyboard
appears; after returning to1080px the original generation remains stale. Separate
document generation from coordinate generation at the existing session seam.
Only layout invalidation changes the latter; tab/content/navigation/fullscreen/
pause still invalidate both. The editor uses document validation; pointer, phone
and other existing actions retain strict coordinate validation. Add native
instrumentation tests for resize/restore and same-URL navigation, plus fixed URL
InputConnection stimuli and actual page assertions. No payload logging or new
production endpoint. Tests must run before claiming their native acceptance.

Latestd6bda source review: Standards0, Spec0. Rootb628 review: Standards0;
Spec catches that editor disappearance alone cannot prove selected-provider
search navigation. Limit the three-step replay to the original stale-lease
symptom; keep selected-tab URL/provider acceptance pending until positively
observed. Its independent URL replay also requires the actual fixture heading.

Native hint metadata on installed897 reports editorCount1, hinttrue, SET_TEXTtrue
and instrumentation success once, but repeat wrapper runs report no editable
node. Starting instrumentation in the test IME package and enabling interactive
window retrieval can change the active IME/window during capture. Wait for bounded
native accessibility idleness after service configuration; expose only window
counts for diagnosis and retain all original success assertions. Do not call this
stable accessibility acceptance until repeat native runs pass.

The repeat hint-false result was a test precondition error: a diagnostic Back
after instrumentation had already hidden the IME dismissed the editor, so the
probe read the mobile toolbar field on Home. Window-count diagnostics isolated
that owner; removed per-window debugging. With the actual editor retained and
bounded native-idle waiting, three consecutive wrapper runs pass on897:
one native editable node, matching hint, SET_TEXT action and success code.
The duplicate synthetic label child is absent. This is native metadata evidence,
not spoken screen-reader acceptance; Stage1.5 remains pending.

r25 sourced6bda passes blocking analysis in4m03.06s (Siso3m59.57s), observed peak
13,975,277,568 bytes (13.02GiB). Preserved APK
`compose-address-lease-d6bda020d-x64-debug-20261010/BraveMonox64.apk`,852,651,096
bytes, SHA256 `da4abe7259fc9951af80b719dd780b55d1e50fc67d77ea0b95fbb3809b538f85`.
Its submission/runtime checks follow in place; no profile wipe. Roota8b4 latest
review has Standards0 and Spec0; the physical-input host regression also passes.

Native test compilation slice: build the existing BravePublicTest Java compile
target through the same pinned wrapper, output and resource limits, after the
production APK build finishes. This checks the new session tests and BytecodeTest
against actual native APIs without creating a separate dependency checkout.
Compilation is not test execution; native instrumentation acceptance stays
pending until the test APK runs on an explicitly verified emulator.

Installedd6bda signature/update checks pass. Home-entry4 and native IME4 replays
pass; genuine Unicode/selection/deletion/composition/bound14 steps pass in9.0s.
The original stale-lease three-step replay now passes (0.3s). Opening native
controls positively shows the selected tab URL
`https://duckduckgo.com/?q=%E6%97%A5%E6%9C%AC&t=brave&ia=web`, confirming the
configured DuckDuckGo classified and navigated the synthetic Japanese query.
Add this positive selected-tab URL assertion to its own fixed-provider replay;
keep the independent stale-lease replay narrowly scoped. Local URL navigation,
owner/document rejection and private editor checks remain pending.

Native Java test attempt1 fails blocking Error Prone in55.08s: six older
BytecodeTest IME reflection calls ignore getDeclaredMethod's return value.
New session-test headers compile, but neither test execution nor full Java check
passes. Wrap those results in Assert.assertNotNull, retaining the exact native
signatures and checks; no analysis suppression. Observed peak9,639,383,040 bytes
(8.98GiB), logs `build-session-test-java-r1.*`, retained cache. Rebuild only the
same test compile/analysis targets after the reviewed source correction.

Native local URL acceptance passes on installedd6bda: the fixed InputConnection
stimulus replaces the prior search URL, IME Back hides only the keyboard, Down
focuses Go, and the four-step submission replay observes editor disappearance
and the real `TV remote input checks` heading (0.5s). No deep link establishes
this result. Source034566 changes only test assertions; retain the d6bda production
artifact while compiling the corrected test target.

Native Java attempt2 gets through compilation and analysis, then fails the
mandatory bytecode dependency check: TvBrowserSessionTest references the actual
ContentView return type through Tab.getContentView. Add the exact existing
`//components/embedder_support/android:content_view_java` direct dependency to
BravePublicTest; do not disable dependency validation. Logs
`build-session-test-java-r2.*`,13.51s, completed cgroup peak4,735,832,064 bytes
(4.41GiB). Rebuild the same bounded compile/analysis target after review.

Native Java attempt3 onf10d55 passes compile, Error Prone and direct-dependency
validation in30.55s (Siso27.85s,9 steps). Observed cgroup peak5,296,840,704 bytes
(4.93GiB); completed transient peak was unavailable. Logs
`build-session-test-java-r3.*`. Native JUnit execution remains pending; the
production APK remainsd6bda. Latestf10d55/702296 reviews: Standards0, Spec0.

The fixed-provider replay goes RED at its final URL assertion: immediately
pressing Back after editor disappearance cancels the pending navigation and
returns to the old fixture. A separate submission with the same genuine Unicode
stimulus eventually renders DuckDuckGo, with the native toolbar showing the
decoded Japanese query. Add a bounded positive native toolbar URL wait before
Back and the full controls URL assertion. This distinguishes committed search
navigation from editor completion and external load timing; it does not establish
performance or the pending-navigation escape contract. The corrected eight-step
replay passes on installedd6bda in3.4s: genuine Japanese input, selected provider,
native committed toolbar URL, then the full encoded selected-tab URL in controls.

Native instrumentation slice: inspect the incremental BravePublicTest APK graph
before building its existing target, retaining the same output and four-worker/
memory/analysis limits. Run only TvBrowserSessionTest and relevant BytecodeTest
methods on the verified TV emulator; test application data is separate from the
preserved normal browser profile. Retain actual failures and do not count a
compiled test jar as runtime acceptance.

Home data slice: extend the existing Compose Home with at most six native saved
pages and four recent normal tabs, plus quiet direct Tabs/Bookmarks/Settings
access. BookmarkModel and the normal TabModel remain authoritative. Observe only
while this normal Home is attached; unregister on detach/destroy. Revalidate
bookmark ID/URL and tab ID on activation, preserve action identity across updates,
and recover focus if a displayed item disappears. Private Home must read no
normal saved/recent data. Localize loading/empty/section labels in Brave strings.
Acceptance: actual populated and empty emulator Home, native saved-page opening,
recent-tab selection without creating a tab, focus/Back/private isolation,
large text/RTL/display checks, existing address-entry regression and reviewed
incremental APK. Do not mark4.1 complete on compilation alone. The cached source
checkout stays immutable during the separate native test APK build.

Home source1e86aeb adds the bounded native preview and five instrumentation
cases: six saved pages, real saved-page navigation, focus recovery on removal,
existing-tab selection without creating a tab, and private-section isolation.
Favorites use the existing default bookmark destination, inspecting at most64
direct children through getChildAt and showing at most six pages; the full
bookmark panel retains all folders/pages. Recent tabs retain native IDs and scan
the existing normal model with only four candidate objects. Formatting and
diff checks pass. Compilation, native tests and actual Home runtime remain
pending; the current test APK build still uses immutablef10d55. No acceptance
checkbox is advanced for this source commit.

Latest Home review: Standards2 requests shared preview limits and explicit
UI-thread/state/focus API contracts. Spec1 identifies native closure/undo events
missing from the recent-tab observer: closing an unselected recent tab need not
select another tab. Handle didRemoveTabForClosure and tabClosureUndone, then add
a real native closure/undo test while Home stays selected. Share limits with
presentation/native tests and document the state mutation restrictions. Review
the correction before advancing the immutable build checkout.

Source3cc9ca43b handles both closure/undo callbacks, shares all Home preview
limits with presentation and tests, and documents the state-update contract.
The new sixth native test checks the same selected Home through closure and
undo, with positive empty-state/rematerialized-card assertions. It is written,
not yet compiled or run; cachedf10d55 remains untouched while the test APK builds.

Stage1 follow-up: replace the prototype's linear arrow traversal with spatial
directional focus, retain the invoking action on Back and initially focus the
address action inside controls. Align Home's direct links with the selected
native design. Measure common D-pad routes against the preserved source5829
replays, then check long/RTL/scaled text and focus safety in T3 preview. These
are design checks; native accessibility and spoken screen-reader operation
remain separate pending acceptance. Keep the build checkout immutable.

The normal privacy fixture is now explicitly reseeded on installed sourced6bda:
real nonalphabetic uinput D-pad/OK activates its Seed button, and the native
page reports cookie tv_privacy=seeded and localStorage seeded. Preserve this
equivalent fixture across the next update. This does not recover or prove the
earlier cookie continuity invalidated by the documented clearing incident.
Agent-device's synthetic page arrows did not move the native pointer; genuine
remote uinput did. Retain that distinction when measuring page input.

Prototype latest review: Standards0, Spec1. Tabs/Library/Settings Back hard-codes
Home, and Source/Licenses Back hard-codes Settings, losing the real invoker.
Track each panel's actual parent and use one restoration path for D-pad Back
and visible Back/Cancel actions. Check page-controls Tabs/Library/Settings return
and Home Source/Licenses return before committing the correction.

Correction review finds a self-transition cycle: the prototype's page-history
Back action re-enters controls and records controls as its own parent. Exclude
self-transitions and root page/Home from panel ancestry, and give Home Back its
documented controls-opening behavior. Verify history-Back escape and Home Back
after new/final-tab recovery, alongside the eleven parent-restoration checks.

Source609bb6e33 passes all fourteen prototype route checks after both review
corrections. Latest Standards0/Spec0. The design evidence records spatial counts
and108 long/RTL/scaled-CSS combinations at720p/1080p; native font/accessibility
and missing baseline comparisons remain pending. Stage1 stays4/6.

Native test APKf10d55 passes blocking analysis: GNU elapsed19m09.26s,
Siso19m06.43s,2589 steps, observed peak15,426,945,024 bytes(14.37GiB).
Artifact `compose-session-test-f10d55ca0-x64-debug-20261010/BravePublicTest.apk`,
876,095,912 bytes, SHA256
`296d552d2fa56684e8347ee53ff3b2ffc63f5a15d446f58b48897fc6839dfd86`;
signature/provenance retained. Its separate com.brave.browser.tests package
runs both real TvBrowserSession tests and BytecodeTest's IME-hook test:
three passes in4.442s. Logs `native-session-tests-r3.log` retain exact names.
Initializationr1 fails for a missing pinned test-certificate fixture;r2 fails
for fixture storage access. Supply that fixture and enable storage access only
for the test package;r3 passes. No OS trust store or production permission
changes; no failure-screenshot argument. The ordinary Chromium wrapper can
restart shared ADB on device-discovery failure, so explicitly targeted native
instrumentation is used instead. Production profile and Chromecast untouched.

Next Home acceptance slice: advance only the reviewed pinned checkout after the
test build has stopped, then incrementally compile/package production and the
existing Home instrumentation target with retained objects and blocking checks.
Run the six native Home tests, address-entry/Back and populated/empty/private
Home plus real Android text/display checks. Preserve the reseeded normal data
across the in-place update; compilation alone does not complete4.1.

Address rejection acceptance: with the installedd6bda normal privacy fixture,
enter a different fixed fixture URL through the real IME, hide the IME with a
positive absence wait, then reload the underlying document at the same URL.
Require the native changed-document error, retained editor/text after Go and
unchanged selected fixture URL/storage. Add a narrow replay for those native UI
postconditions; document its genuine document-replacement precondition.

The eight-step rejection replay passes on installedd6bda in0.5s: real same-URL
reload reports the native changed-document error; Go retains that error, editor
and different pending URL. Separate actual document readback confirms the
underlying privacy URL and seeded cookie/localStorage remain unchanged. An
earlier attempt cancelled the editor by repeating Back after an immediate stale
IME snapshot; it is not acceptance. Positive IME-absence waiting fixes the
precondition. Native owner replacement/private editor/phone checks remain pending.

Home runtime correction: r26 passes blocking analysis in8m17.30s
(Siso8m13.68s), observed peak14,372,753,408 bytes(13.39GiB). Both signed APKs
are preserved in `compose-home-609bb6e33-x64-debug-20261010`; in-place installs
pass without clearing either profile. All six native Home tests go RED in their
shared setup, before feature assertions. Native debugger inspection confirms six
model-backed cards, a correct visible accessibility label and bounds. The active
accessibility window is instead the startup controls dialog: Brave opens it for
the test rule's initial about:blank page, then the rule loads Home underneath it.
Dismiss only those positively identified controls with real Back and require
activity window focus before seeding/loading Home. One debugger-assisted preview
test passes after that dismissal; it is diagnosis, not unattended suite acceptance.
Rebuild the focused test target with blocking checks and rerun all six cases.
The original production debug-app setting is restored after diagnosis; no private
capture, production permission/data change or physical-device operation.
Latest root7af review: Standards0, Spec0.

Home interaction correction: the6b0 test APK passes blocking checks in20.06s;
the unattended suite now reaches all feature assertions, with preview bounds and
private isolation passing, four failures. The two activation tests use touch,
but the pinned TV Material Surface implements D-pad/Enter activation. Replace
those stimuli with verified native directional focus and OK, retaining actual
selected-tab/URL postconditions. Two Down presses also fail to reach the first
favorite: make Address Down explicitly enter the first quiet Home shortcut,
matching the selected prototype contract, then verify each focus transition.
For closure/undo, native inspection confirms the recent model becomes empty;
settle the UI before closure, verify focus recovery, and scroll the empty section
into view before its assertion. Keep Undo within the actual native timer. A long
debugger pause allowed pending closure to expire before diagnostic Undo, so that
run cannot establish an Undo regression or acceptance. Original debug settings
and only the test-owned debugger connection are restored/closed. Acceptance:
all six unattended native Home cases, address/Back regressions and reviewed APK.

The normal localStorage fixture survives the production update; its cookie is
absent after restart. The fixture cookie has no expiry and cannot establish
persistent-cookie migration. Record that distinction and add a persistent-cookie
fixture for the later upgrade slice; do not silently reseed and claim continuity.

Stage1 native accessibility slice: record the verified TV emulator's original
font scale1.0, unset force-RTL setting,1920×1080 display and320dpi. Exercise
the installed Compose Home/controls/address at Android scales1/1.3/1.6 and RTL,
using native focus/bounds and normal-only screenshots, then restore settings.
The emulator has Google TTS but no installed screen-reader service; metadata
checks cannot count as spoken operation. Add polite live-region semantics to
address errors and changing Home loading/empty descriptions, so asynchronous
state changes can be announced without moving keyboard focus. Acceptance:
blocking build, native accessibility live-region metadata/state events, retained
editor/input regressions and observed remote traversal. Keep1.5 unchecked until
its remaining screen-reader acceptance is actually exercised; continue the rest
of the rebuild while investigating that bounded prerequisite.

Home r27 acceptance: blocking checks pass in4m06.91s (Siso4m03.46s), observed
peak14,373,486,592 bytes (13.39GiB). Signed production/test APKs are archived
under `compose-home-da462a005-x64-debug-20261010` and installed in place without
profile clearing. Four of six unattended Home tests pass. Removal restores
Address, but its immediate negative accessibility assertion races publication.
The isolated closure case also fails its empty-text assertion after touch scroll;
normal native D-pad inspection shows the correct empty text and one Home tab.
Use the real remote path to the Home source footer to reveal that section, and
poll the deleted node's absence. Preserve actual native URL/tab identity, private
exclusion, same-Home and pending-closure Undo assertions. Rebuild only the test
target with blocking checks and rerun all six; no production observer change is
justified by these test-path failures.

The installedda462 production APK passes native Home→address entry, IME entry
and all fourteen Unicode/selection/deletion/composition/bounds replay steps.
After the real IME's oversized-input stimulus, the new native probe passes
editor hint/action and error-presence checks but goes RED on
`nativeErrorLiveRegion=true`, as expected. Retain
`native-editor-live-region-red.log`; the probe captures no editor contents.
At Android scale1.6, Home, both controls pages and the editor remain legible
and D-pad reachable on1920×1080/320dpi. Scale1.0 is restored. Scale1.3, RTL,
broader localized native surfaces and actual spoken operation remain pending.
Sourcea02 latest correction review: Standards0, Spec0; six-case runtime pending.

Root5e1 review correction: both axes identify that the fixed-error matcher
reads editable-node text before excluding it. Guard `!node.isEditable()` before
that read, preserving the probe's no-editor-content contract. It returned only
bounded booleans, with no field contents logged. Acceptance: rebuild the small
fixture and repeat the expected live-region RED, then review this correction
before continuing the native acceptance/build slice.

Root1be correction reviews: Standards0, Spec0. The sourcea02 test-only rebuild
passes blocking checks in23.32s (Siso19.71s), observed peak9,668,460,544 bytes
(9.00GiB); signature/package/provenance are preserved in
`compose-home-test-a02b3dc01-x64-debug-20261010`. Its six-case native run is next.
Source67fb109c4 adds the planned polite error/Home live-region semantics and
passes latest-only Standards/Spec review with0 findings each. Build/native
announcement metadata, state events and spoken operation remain pending.

Home a02 native r5:5/6 pass in31.353s; polling removes the bookmark-deletion
failure. Closure now fails at the Source-footer focus expectation before the
empty-state assertion. Two directional presses are sent without checking the
intermediate favorite-row focus; Undo likewise sends Up before the restored
recent node is published. Require the intermediate favorite focus and positive
restored-node publication before the next key. Keep all native data/Undo/same-Home
assertions and the real timer. Acceptance: all six cases plus production address
and controls regressions; no timeouts enlarged or production model changes.

Screen-reader prerequisite: the verified phone AVD includes Google TalkBack
16.0.0.738667889 (API26 minimum, x86-64). Extract its existing signed APK,
verify package/signature/hash and retain provenance; install only on the verified
TV emulator as an accessibility test tool. Record and restore original service,
touch-exploration and accessibility settings; use normal synthetic data only.
Test actual spoken focus/state and D-pad traversal after the announcement APK
is installed. Compatibility or metadata alone is not spoken acceptance. The
unused phone emulator is stopped before r28 to release its memory; its profile,
APK, image and all browser/build caches remain preserved.

Announcement build r28 on sourced558 passes blocking checks in4m03.49s
(Siso3m59.94s), observed peak14,429,429,760 bytes (13.44GiB). Production/test
signatures and provenance are retained in
`compose-announcements-d55879c5f-x64-debug-20261010`; both update installations
preserve profiles. All14 native Unicode/composition steps pass. The unchanged
native error probe is now GREEN, including polite live-region metadata; this is
not proof of speech. The22-step controls replay passes at Android scale1.3;
scale1.0 is restored. Native RTL and spoken operation remain pending.

Home r6 remains5/6 in29.358s. Bounded normal-only debugger inspection finds
Source really focused, one active application window, and an accessibility
snapshot initially retaining the previous favorite. Source is accessible with
the native Undo message still showing after its timeout is reset for diagnosis;
the message is not independently stealing window focus. Paused diagnostic runs
are not unattended Undo acceptance. After Undo, the test waits for an off-screen
recent card before sending Up to reveal it, which cannot establish publication.

Next Home-test slice: use Chromium's existing test-only snackbar duration hook
to allow30s for model/remote traversal on the emulator, assert the closure is
still pending immediately before Undo, and await the native pre-draw callback before Up
rather than requiring an off-screen node first. Keep normal/private model,
same-Home, URL and focus postconditions; leave production duration unchanged.
If Source still fails, add only bounded boolean focus diagnostics to that normal
fixture. Acceptance remains all six unattended cases with blocking test build.
Restore debugger settings and remove only the task's JDWP forward after probes.

Home e352 test build r4 fails mandatory direct-bytecode dependency analysis:
`OneShotPreDrawListener` requires AndroidX Core directly on
`//brave/test:brave_java_unit_tests`, rather than only its transitive test library.
Add that existing pinned target to this APK's dependency list, keep validation
enabled, review the correction and rebuild only tests. No failed artifact is
installed or accepted. Elapsed17.87s, observed peak8,627,081,216 bytes (8.03GiB).

Corrected69b4 test build r5 passes in39.71s (Siso36.19s), systemd reports9G
peak. Its signed test APK and provenance are archived in
`compose-home-test-69b4ff6d5-x64-debug-20261010` and installed in place. Native
r10 still passes5/6; Source-footer focus fails within the existing3s bound even
with the test Undo window extended. This falsifies timeout expiry as its cause.
Add a temporary, tagged failure-only probe of fixed-label boolean focus results,
before/after Android's public accessibility-cache invalidation on API33+, to
distinguish stale accessibility caching from actual focus movement. It cannot
make the failed assertion pass or capture editor/private data. Remove the probe
after diagnosis. Preserve all acceptance assertions and timeouts.

Native Arabic app configuration mirrors Home arrows and keeps Arabic Settings/
filter/clear-data labels readable. Original app locales[] are restored afterward.
It exposes English fallback punctuation following RTL paragraph direction, and
Home Settings Back returning to Controls instead of its Home invoker. Add a
native remote-only Settings/Back regression before fixing that return seam.
The later production correction will retain the actual invoking Home action and
native context through nested Settings, reject stale owners and clear references
on return/lifecycle invalidation. Apply first-strong text direction inside the
TV theme while retaining RTL layout. Acceptance: red→green native return test,
RTL punctuation/arrow checks, existing controls/address/Unicode and private
ownership checks. Spoken operation remains pending.

Source17ffe applies content-based text direction once inside the shared TV
theme, preserving native RTL layout and locale preferences. Latest-only review:
Standards0, Spec0; actual GN build and Arabic punctuation checks remain pending.
The seven-case native Home/Settings suite is running on the signed e750 test
APK after a22.64s blocking test build (Siso19.20s, systemd7.8G peak).

Spoken-check prerequisite: the task TV emulator was launched with no audio.
Restart only its verified AVD, preserving userdata, with playback routed to the
task-owned PipeWire null sink `brave-tv-a11y`. Do not change the host default sink
or capture unrelated host audio. Retain the route identity/original accessibility
settings, verify the emulator stream targets that sink, then enable only the
installed TalkBack service for normal synthetic UI checks. Restore settings
after testing; no screenshot or audio capture of private/editor contents.

Home native r11 passes5/7. The new Settings-return test is RED: Back opens
Controls, so the activity never regains window focus. Footer diagnostics report
Source present but unfocused before and after accessibility cache invalidation;
neither Address nor the previous favorite is focused. Client-cache invalidation
does not resolve the failure. Keep footer diagnosis open; no acceptance advances.

Settings return correction: give the native Home caller an explicit Settings
entry, retain its root return callback through search/filter/clear-data children,
and restore the same Home's Settings action only after tab/document/native-page
identity revalidation. Other Settings callers retain Controls as their parent.
Callbacks stay owned by disposable dialogs/loading controllers; no new global
navigation state or browser model. Acceptance: existing seven-case native suite,
nested Settings Back, stale-owner rejection and controls/address regressions.
Root92db latest-only review: Standards0, Spec0. Source3698 review finds two
Standards issues (caller/focus contract and duplicated native test navigation)
and one Spec issue: stale Home validation follows a private access guard with
unlock side effects. Validate exact Home before that guard, cover normal→private
owner replacement without private capture, document deferred focus and share the
real Home→Settings test steps. Remove unrelated Activity formatter changes.
Locked-private unlock runtime behavior remains separately pending; the new
private-owner test does not create a device credential or claim that gate passed.

Source38e2 correction review: Standards0, Spec0. Build production and the ten-case
native Home suite together in the retained x64 output, with blocking Android
analysis, four Siso workers and18/22GiB memory limits. Preserve signed artifacts
and update both APKs in place. Runtime Settings/RTL/footer acceptance is pending.

Settings/RTL build r29 passes in4m24.58s (Siso4m21.06s), observed cgroup peak
14,509,973,504 bytes (13.51GiB), systemd reports13.5G. Signed production/test
APKs and provenance are retained in
`compose-home-settings-38e2a3c82-x64-debug-20261010`; both install in place.
Root8130 latest-only review: Standards0, Spec0.

The ten native Home cases pass individually on source38e2, including both
Settings return paths, stale/private owner rejection and actual closure/Undo.
The pinned host runner separates non-Batch tests; whole-class manual invocation
bypassed the Home class's `@DoNotBatch` process isolation. The earlier5/7 result
remains recorded, rather than accepted as a supported run. Each new invocation
requires exact `OK (1 test)` and instrumentation success; no profile wiping,
private capture or shared ADB restart is used. Logs/summary:
`native-home-separated-r15`. Remove the temporary failure-only footer diagnostic
and document the required per-method invocation. Preserve every focus/model
postcondition and test timeout; compile/review the cleanup and rerun its affected
native case. RTL, spoken accessibility and migration/hardware gates remain open.

Source7e5a diagnostic cleanup review: Standards0, Spec0. Rebuild only the test
APK in the same cache and rerun the affected closure/Undo method with required
process separation. Production source38e2 is unchanged and remains installed.

Cleanup test build r7 passes in23.81s (Siso20.22s), systemd10.4G peak; signed
artifact/provenance: `compose-home-cleanup-7e5a6d730-x64-debug-20261010`.
The affected closure/Undo case passes in10.302s without diagnostics. Root3518
latest-only review: Standards0, Spec0. Production38e2 Arabic checks confirm
correct English punctuation, mirrored Home arrows and Settings Back restoration.
All Settings rows remain remote-reachable at Arabic/font scale1.6. Original
locales[] and font scale1.0 are restored. Spoken acceptance remains pending.

For the scoped audio restart, route both emulator playback and its input to the
task null sink/monitor using per-process Pulse environment variables; never use
the host default microphone or change host defaults. Verify AVD identity before
stopping only the task emulator, wait for exit and boot that same preserved AVD.
Re-discover/open only the verified emulator and confirm its audio stream route
before recording any normal synthetic screen-reader checks. No build is active.

Audio prerequisite investigation: direct Pulse context probes reach READY on the
local socket, while the cached emulator's Pulse backend fails initialization.
Its ALSA backend is unavailable. The pinned binary documents a WAV output
backend with separate output/input drivers. Try task-owned WAV output with input
disabled, preserving the same AVD and host defaults. Only normal synthetic Home/
Settings may be recorded; enable TalkBack only after verifying that backend.
This is diagnostic audio, not a phone live-view/streaming feature. If unavailable,
keep spoken acceptance pending and continue independent native work.

WAV output now records the emulator's normal Home speech, with TalkBack bound
and the agent's suppressing UiAutomation lease closed. No host microphone is
opened. Validate spoken labels using a small offline host-only recognizer:
pinned Vosk0.3.45 native library and official small English0.15 model, cached
with download hashes. Use unconstrained recognition; matching a forced phrase
list would not establish correct speech. This adds no APK/project dependency,
uploads no audio and does not advance accessibility acceptance by itself.
Restore the saved accessibility settings and the emulator's original audio
configuration after these normal synthetic checks.

Spoken Home/Settings checks now produce real TalkBack audio on production38e2:
Address, Controls, Tabs, Bookmarks and Settings are announced as buttons; the
current search provider announces Selected. D-pad/OK opens Settings and its
provider/clear-data panels, and Back returns through Settings to the Home
invoker. Offline unconstrained transcripts and action/audio offsets are in
`probes/vosk-spoken`; proper names have recognition errors, so this is partial
spoken evidence, not a complete semantic audit. No data is cleared. Restore
matches all seven saved accessibility settings exactly; the task WAV emulator
is stopped and its normal browser profile is preserved. Stage1.5 stays open.

Stage1.6 comparison slice: boot only the separate, currently stopped
`brave_tv_onboarding_api36`, verify its freshly returned serial/AVD identity,
install the signed source5829 baseline APK and seed a normal synthetic favorite
through native controls. Measure first-saved-page and Settings navigation from
Home Address, asserting every focus/activation. Preserve this baseline profile
for a later in-place migration; do not downgrade or clear the current UI profile.
No build is active; the host reports20GiB available RAM and366GiB free disk.

Root e9648 latest-only review: Standards0, Spec0. The old source5829 Settings
route passes with five presses: Right/OK to Controls, Down to Tabs, Down to
Settings, OK; every focus transition and final Search engine focus is asserted.
The T3-launched baseline emulator subsequently disconnects during normal fixture
navigation, before the favorite comparison. That comparison remains pending.
The host is healthy with23GiB available; no build is running. Restart only the
same baseline AVD with the cached emulator, explicit SDK root, disabled Vulkan,
no audio and5/6GiB process memory limits. Preserve userdata and installed APK.

The same baseline profile is stable with that graphics configuration. Its
native saved-page route passes all nine measured keys and ends on the actual
remote-input fixture, with Clicks:0 and the committed URL visible. Evidence:
`baseline-favorite-r1.json`. The original Settings path is five presses; the
controls' remembered Home action instead gives four, positively asserted in
`baseline-settings-r1.json`. An Address-initial replay correctly fails on that
different remembered focus; later startup/restore preparation failures are also
retained. None are converted into passing runtime evidence. Record both initial
states and the six-press favorite improvement, preserve this upgrade profile,
and check Stage1.6 only. Stage1.5 stays open; overall13/54, Stage1 now5/6.
The recorded nine-key route's replay also passes all21 steps in1.9s, including
the actual page-content and native URL assertions:
`baseline-favorite-replay-r2.log`. Settings' Address-initial replay remains a
documented precondition-dependent recipe; its five-key manual measurement and
the separate four-key Home-restored path are the accepted runtime evidence.

Root eb454 latest-only review: Standards0, Spec0. Next, confirm the installed
source7e5 native test artifact's session/input tests on the current UI AVD, one
method per process: viewport resize retains document identity while rejecting
old coordinates; same-URL navigation invalidates both leases; IME bytecode hooks
remain present. Stop only the baseline emulator after recording its preserved
profile/forwarding state, then open the named clean-UI AVD and verify its new
serial. Keep default browser data intact, close only its agent lease for native
instrumentation, and require positive JUnit counts rather than shell exit alone.
Spoken error/state and broader native accessibility checks remain open; no new
build or source checkout is required for these already packaged tests.

Native session/input r17 passes3/3 on the verified clean-UI AVD, one method per
process: viewport resize, same-URL navigation and native IME hook presence.
Every process reports positive JUnit OK(1), success status0 and no skips; logs
are `logs/native-session-separated-r17`. Installed production source38e2 and
test source7e5 hashes match the preserved signed artifacts. No profile is wiped.

Downloads slice (Stage5.2): use the existing offline-content aggregator and
native download ownership in a normal-session Compose panel, retaining only
eight rows per page. Revalidate exact native ContentId, normal owner and document
before asynchronous actions; dispose observers and invalidate outstanding work
on Back, tab/document change, pause and destroy. Progress updates retain row
actions/focus, with explicit refresh for structural changes. Distinguish native
history-only removal (file remains) from native file deletion; both confirmations
start on Cancel. Keep dangerous-download/security approval with native owners,
never validate dangerous content from this panel. Include loading/empty/missing,
paused/interrupted/failed and retry states, native open/cancel/pause/resume where
supported. Acceptance: focused native panel/state tests, blocking cached x64
build, actual emulator download/open/cancel/removal/file-survival checks and
remote-only traversal. Tests using a provider fixture are seam tests, not proof
of a real native download. Stage5.2 remains unchecked until runtime acceptance.

Source ce4a latest-only review: Spec0; Standards requests a shared paging bound
for the boundary fixture and an explicit injected-provider lifecycle contract.
Correct those two points, retaining actual native UI assertions and ownership.
Root17a4 review is Standards0/Spec0. Cached r30 builds the original ce4a pin;
do not mutate that cached checkout until its build exits. After correction,
advance the clean source/pin with checkout.py and perform the incremental build.

Build r30 stops at Java compilation: the imported browser DownloadUtils lacks
shouldDisplayDownloadAsDangerous(int,int). The pinned download-list caller uses
components.browser_ui.util.DownloadUtils instead, which chrome_java already
depends on. Correct this import, retaining the exact upstream danger predicate
and the additional isDangerous guard. Preserve the failed log and cached steps;
peak13,104,885,760bytes (12.21GiB), GNU wall1m07.04s, Siso1m03.37s. Source
3e1e/root4a3e correction reviews are Standards0/Spec0. Commit/review the import correction and rebuild
through the documented clean checkout path, with the same blocking checks.

Source413a/root77c2 import-correction reviews are Standards0/Spec0. Runtime
fixture slice: add a loopback-only host server with fixed synthetic attachment
routes (image, text and bounded slow download), no user paths or Android server.
Use the pinned Chromium four-colors image, retain provenance, and verify its
HTTP methods/ranges/body before forwarding to the verified TV emulator only.
These fixtures create real native downloads; they do not substitute for native
panel/storage assertions. Preserve existing production downloads and delete
only explicitly chosen synthetic files through the UI. No cache/profile reset.

Host download-fixture checks pass: pinned image bytes and attachment headers,
fixed text body, slow4MiB HEAD/range bytes, invalid-range416, missing404 and
method405. The first check raced Nix/service startup and returned ECONNREFUSED;
after the listener's positive ready log, the complete check passes. The fixture
unit uses256MiB high/512MiB maximum with no swap; only host loopback18090 is
bound. Actual native panel/download acceptance remains pending on build r31.

Root c444 fixture review: Standards0/Spec0. Build r31 passes the previously
failing production Java compilation, then blocking test Error Prone rejects
`1000 - index` assigned to long creationTimeMs (IntLongMath). Change the fixture
literal to1000L; retain blocking warnings-as-errors and the exact native tests.
No production action or guard changes. Preserve r31 logs: GNU3m59.02s,
Siso3m55.48s, systemd peak15,484,682,240bytes (14.42GiB). Commit/review and resume
the same cached x64 targets after clean pin advancement; no output is deleted.

Source573/root378 latest reviews are Standards0/Spec0. Blocking combined build
r32 passes from the retained cache: GNU3m38.90s, Siso3m35.33s, 73 steps;
observed peak14,367,870,976bytes (13.38GiB), final journal13.3G. Both APKs
verify x86_64 and the retained signing certificate. Artifacts and hashes are
preserved in `artifacts/compose-downloads-573592b13-x64-debug-20261011`.
The new test APK is installed in place; production remains source38e2 pending
actual download testing. No profile data or build cache was deleted.

Native Downloads r18/r19 passes2/5: dangerous updates disable Open and restore
safe focus; document navigation disposes the observer and rejects late results.
Paging fails when the test clicks an offscreen More action; both destructive
cases fail at initial Cancel focus after a coordinate click. Preserve these red
logs. Next slice: make these remote tests traverse with D-pad/OK, asserting
every row and confirmation focus transition. Predictions: if touch-mode
coordinate clicks cause the confirmation failure, remote activation will pass;
if dialog replacement or the native focus adapter is responsible, initial
Cancel will still fail. Do not relax initial Cancel assertions or acceptance.
Real native download/file-survival tests remain mandatory regardless of these
provider-fixture results. The canonical count remains13/54, Stage1 remains5/6.

Source4f21/root72b8 latest reviews pass Standards0/Spec0. Test-only r8 passes
blocking analysis in GNU21.46s/Siso18.60s, 14 cached steps; journal peak8.4G.
Production source573 is installed in place; its on-device APK SHA256 matches
the preserved artifact. A real synthetic image download completes through the
native location dialog. Native D-pad opens its TV list/details/removal prompt:
Cancel initially focused, Right reaches Remove, Left returns Cancel, and OK on
Cancel returns to Open without removing the item. This refutes a general
Cancel-focus or dialog-replacement failure under remote activation.

The real panel also shows disabled Resume receives D-pad focus. This is pinned
TV Material behavior, permitting users to discover disabled actions; the test
incorrectly assumed focus skips disabled rows. Before the next native run,
assert that disabled intermediate focus and traverse onward to Remove. At the
paging boundary likewise traverse Previous before Right to More. Preserve
strict Cancel-first checks and dangerous-action nonexecution. Test-only r8 is
compiled proof, not a passing native test suite. Actual open/removal/deletion,
pause/resume/cancel and file-byte checks remain pending.

Source055/root1b0 latest reviews pass Standards0/Spec0. Test-only r9 passes
blocking analysis in GNU20.98s/Siso17.48s, 14 steps; journal peak9.1G. Signed
test artifact is preserved at `compose-downloads-tests-055e2b02c-x64-debug-20261011`
and installed/hash-verified in place. Native r20 paging passes with all eight
D-pad rows, disabled Previous, More and second-page focus assertions. The
removal/deletion test now reaches and confirms Remove, then fails waiting for
empty-list Refresh: it adds its next item before the first asynchronous list
query finishes. Move fixture insertion after the positive empty-list focus
signal; do not insert a sleep or weaken either owner assertion. Continue the
remaining native cases separately, preserving r20 failure evidence.

Production source573 real image Open reaches Chromium's native media viewer;
the downloaded840-byte PNG hash matches the pinned fixture. Real history-only
Remove eventually disables the stale row; explicit Refresh shows the empty
native list and `/sdcard/Download/tv-fixture-open.png` still has the exact
original SHA256. Evidence is `probes/downloads-r1/actual-image-r4.json` (action)
and `actual-image-r5.json` (refresh/file survival). Earlier recipe failures
(AX presentation labels/classes, retained More focus and asynchronous removal)
remain preserved; they are not claimed as passing scripts. Actual file deletion
and active-transfer checks remain pending, so Stage5.2 remains unchecked.

Source8b47/rootd375 latest reviews pass Standards0/Spec0. Test-only r10 passes
blocking analysis in GNU21.91s/Siso18.60s, 14 cached steps, journal peak10.1G.
Signed/hash-verified test APK is preserved at
`compose-downloads-tests-8b47f8db6-x64-debug-20261011`. Native r22 passes all
five cases individually with positive JUnit OK(1), no negative status/skips:
paging/progress focus, distinct native removal/deletion owners, conservative
Cancel/private replacement, dangerous-action rejection, navigation disposal.
Installed test hash matches the artifact. Earlier r21 is a three-case subset;
its original fixed summary text incorrectly said5/5, while its JSON correctly
contains three cases. Correct the helper summary; r22 is the complete5/5 run.

Real native file deletion also passes: Cancel preserves the46-byte text file,
Delete removes exactly `/sdcard/Download/tv-fixture-delete.txt`, Refresh shows
an empty native list, and the history-removed image retains its original hash.
Evidence: `probes/downloads-r1/actual-delete-r2.json`; the initial45-byte display
expectation failure is preserved. Pause/resume/cancel still pending. Slow fixture
recipes failed before transfer checks on native-dialog/setup assumptions; a
duplicate-name prompt is cancelled without overwriting existing files. Inspect
the actual native save/transfer path and fix the recipe or implementation at the
responsible owner; do not waive native security or hide failures with data wipes.

Root e376 latest reviews pass Standards0/Spec0. The slow HTTP `.bin` attachment
reaches Chromium's native “File can’t be downloaded securely” prompt, with
Discard initially focused. It remains a trusted native security owner; select
Discard, not a custom approval or validation bypass. This explains the missing
transfer row and qualifies the earlier setup assumptions. Keep the binary route
for this negative flow. Next fixture slice adds an equivalent bounded slow text
attachment using shared synthetic bytes, retaining exact routes, global two-slow
request bound and range/HEAD behavior. Verify both routes, then test actual safe
text pause/resume/cancel without changing production security or profiles.

Both slow fixture variants pass host HEAD/type/disposition, exact range bytes
and a shared two-transfer bound (third request503), plus existing method/error
checks. The first check raced the restarted listener and returned ECONNREFUSED;
after its positive ready log the complete check passes. These are host-only
fixtures, not native active-transfer acceptance; source APK/security is unchanged.

Root c22 latest reviews pass Standards0/Spec0. Actual safe slow text transfer
passes native D-pad/OK location acceptance, Downloading→Pause→Paused→Resume→
Downloading→Cancel confirmation (Cancel first, Right/Left)→Cancelled. Its
terminal detail disables Open/Pause/Resume/Cancel. Evidence is
`probes/downloads-r1/actual-active-text-r1.json`; profile/security remain intact.
Stage5.2 is now accepted with the complete native5/5 suite, actual Open and exact
history-removal/file-deletion evidence. The canonical count is14/54; Stage1
remains5/6. The binary HTTP native warning remains a separate negative flow;
no screenshot of that security prompt was captured and no custom Keep/validation
was invoked. The history-removed image is preserved as upgrade data.

Next slice (Stage1.5): finish emulator design/accessibility acceptance across
remaining panel states, including Downloads loading/empty/disabled, address
error/recovery and destructive prompts. Reuse actual native controls, stress
long text/RTL/font scaling and inspect edge safety, focus, semantics and spoken
state with the installed TalkBack/host-only audio fixture. Restore original
locales/font/accessibility/audio settings, preserve profiles and the upgrade
baseline, and keep hardware overscan/physical acceptance explicitly deferred.
Prototype stress checks and announcement metadata alone are insufficient.

Stage1.5 native speech reproduces a missing-context issue on production573:
D-pad reaches disabled Pointer/Forward and empty Previous/More downloads,
with actual TalkBack speech including disabled roles. Back is spoken as a
button; its disabled speech is unverified. Opening empty Downloads
speaks Refresh downloads but omits Downloads and No downloads yet. Evidence:
`probes/a11y-states-r1/downloads-r1-complete.json`, `empty-r1.json` and action
byte offsets. The automation lease is closed during speech, so it cannot explain
this omission. A second opening with a longer settle reproduces it in
`empty-repeat-r2.json`, excluding a short-wait-only explanation. Panel title
and subtitle/description have no pane/live-region
semantics, unlike the existing Home empty state and Address error.

Correction slice: expose native Compose panel/controls pane titles and polite
panel subtitle/status descriptions using the existing presentation seam. Keep
native window/focus/security/action ownership unchanged. Announce download state
transitions separately from received-byte progress, so a transfer does not
produce a stream of spoken byte updates. Add a focused native
loading→empty and detail-status semantic regression using the existing provider
fixture; verify blocking analysis, actual spoken context/recovery, and retained
conservative focus. Do not count semantics alone as spoken acceptance. Continue
remaining Stage1.5 display/error checks and restore the saved emulator settings.

Sourceb35a latest reviews pass Standards0/Spec0; rootcfa evidence correction
is resolved in efc1 (latest Standards0/Spec0). Full cached r33 passes blocking
analysis in GNU4m11.36s/Siso4m07.87s,141 steps, journal peak14.4G (observed
15,478,743,040 bytes). Both signed/hash-verified x64 APKs are preserved at
`compose-a11y-b35a4839c-x64-debug-20261011` and installed in place; installed
hashes match. ProductionSHA32ad51b1784e5708f379854904a7b93966fb81b973833f5c1b7c1b36b928cce3;
testSHA41d253352220463fd1b41c5d16c30db3636347658531a3a3f0bc5e3a75957852.
No profile/cache reset. The first artifact-preservation guard incorrectly treated
systemd's expected unloaded-unit exit4 as an exception; corrected before creating
its artifact directory. The formatter override-only jar was not executable;
the existing pinned formatter launcher passes. No dependencies were replaced.

Native r23 fails its first new loading-state semantic test at the text-search
lookup, after pane-title/focus acceptance. Remaining six cases did not run.
The pinned Compose virtual-node provider does not override Android text search
(`pinned-compose-provider-api.txt`); tree traversal is supported, as used by
our existing editor probe and this test's pane-title check. Test correction
slice: traverse native virtual nodes for exact state/progress text and live-region
metadata, retaining positive focus/state barriers, and rerun all seven relevant
cases. Keep actual spoken green and Stage1.5 pending. Preserve the red suite,
immutable red WAV and verified decoder-prefix hashes for the original speech
failure; restore the saved accessibility settings before test instrumentation.

Sourceb73 Spec review passes; Standards finds that positive non-live progress
lookup alone could miss a duplicate live node. Correct the test contract by
retaining positive exact-text lookup and explicitly rejecting any matching
progress node with a live region. This remains a test-only correction; the
production b35a APK is unchanged. Run the complete seven-case native suite
on the corrected signed test artifact before continuing spoken/display checks.

Stage1.5 consolidated native r24 passes7/7 on sourcec879 test APK: loading/empty
pane/state, detail/disabled focus and non-live byte progress, paging/private
exclusion, distinct history/file owners, conservative cancellation, dangerous
Open rejection and navigation disposal. Actual productionb35a TalkBack now speaks
Downloads, its empty state and disabled controls. Genuine native InputConnection
oversize input is wholly rejected; TalkBack speaks the address error, and
Clear/Back recover. Immutable green WAV and four verified decoder-prefix hashes
are in `probes/a11y-states-r1/green-audio-provenance.json`; instrumentation
summary is `logs/native-downloads-a11y-r24/summary.json`. These are different
checks: virtual-node metadata alone is not spoken acceptance. Accessibility
settings were restored exactly; no private/security/editor contents were recorded.

Next complete slice: at emulator1280x720/density320/font1.6/app locale ar,
Home and controls reproduce narrow four-column action labels with silent
clipping (Browser controls, Address or search and Page cursor). Adapt the shared
presentation rows to their actual available width and font scale, preserve
normal1080p grids and action identities, and show an explicit ellipsis for
bounded long labels while retaining their full spoken name. Check native
Home/control/panel reachability, conservative confirmations, long/RTL text,
address recovery and scroll edges together at both configurations; add a focused
native responsive/focus regression. Restore saved display settings afterwards.
Stage1.5 and its physical overscan gate remain pending until the emulator
checks pass; hardware acceptance remains deferred. Do not rerun unchanged real
download-storage acceptance for this presentation-only slice.

Source1743 initial reviews pass Standards0/Spec0; focused follow-up Spec review
finds one test-owner fidelity gap: the new synthetic native dialog installs
only the key listener, while production also routes Android Back through its
OnBackPressedDispatcher. Add the existing production collapse-or-cancel callback
to the test-owned dialog; production behavior stays unchanged. Keep the active
r34 cache checkout immutable and preserve its artifact; advance to the corrected
test source only after that build stops. Validate both narrow journeys with the
real Back dispatcher before accepting responsive traversal.

Full cached r34 passes blocking analysis (Siso4m11.14s,88 steps), with an
observed peak15,166,660,608 bytes. Signed/source-pinned production1743 and
test artifacts are preserved in `compose-responsive-17438450a-x64-debug-20261011`;
production is installed in place and its hash matches. Corrected-test r13
then fails the GN direct-dependency check: TvPresentationTest now directly uses
OnBackPressedCallback/Dispatcher but the test target lacks the existing cached
`//third_party/androidx:androidx_activity_activity_java` dependency. Add only
that direct test dependency and rerun the test-only target with blocking analysis.
Preserve r13's failure; do not reinstall its unfinished test output or rebuild
unchanged production. Native/display acceptance remains pending.

Corrected r14 test-only build passes blocking analysis in Siso37.33s/23 steps;
its signed fab0 APK is preserved. Production1743 grouped720p/font1.6/ar checks
pass disabled Previous/More downloads and expose a real restored-focus failure:
Back to controls focuses More at y610..720, partly clipped even after settling.
Evidence `display-responsive-r1.json` stops at that failed edge assertion;
no later keys or acceptance are counted. Root/source latest reviews pass0/0.

Next responsive correction: first strengthen the native More/Back journey with
a visible-edge assertion and exercise an exceptionally long synthetic panel
title with conservative Cancel/Right/Left reachability. Run both against the
current presentation before changing it. Use the pinned Compose bring-into-view
facility for restored focus, including space for its focus border, and bound
fixed panel headings if the title case proves they consume the action viewport.
Keep complete spoken labels, native dialog/security/data ownership and cached
builds. Consolidate native and display evidence; restore original settings after
the pass. Stage1.5 remains pending until these actual failures are resolved.

Native r25 completes all three isolated cases on source3c7: Home fails the
horizontal Tabs expectation, controls update/Back passes, and the real
TvBrowserPanel long-title case cannot expose initially focused Cancel. The
synthetic Home/controls dialog still uses the default native inset background;
production uses transparent backgrounds. Its unaccounted insets invalidate
the intended Home two-column width and can cushion the controls edge test.
Correct the test window to match the production transparent background; keep
the production restored-More red screenshot and stopped display path as the
actual failure evidence. The long-title case uses the real production factory
and proves a second accessibility failure, not a test-only approximation.

Implement both confirmed issues in one presentation correction: explicitly
bring focused actions into their scroll viewport with vertical focus-border
space after layout, using the pinned existing BringIntoViewRequester (API
inspection retained). Bound fixed panel headings to two lines with visual
ellipsis and full native pane/text semantics, leaving descriptions scrollable.
Build production+corrected native tests together and rerun the three layout
journeys plus relevant panel/confirmation focus and grouped display checks.
No native storage/security owner changes, no profile/cache reset, no physical
acceptance. Preserve r25's1/3 and every earlier failure without relabeling them.

R35 compiles the Kotlin correction, then fails its direct-dependency gate:
the presentation target now uses Compose geometry Rect but does not declare
the existing pinned geometry target directly. Add that one direct dependency
in `brave/third_party/androidx_tv/targets.gni` and rerun the same cached combined
build with blocking analysis. Preserve r35's failure; no dependency version,
toolkit, Chromium source or artifact acceptance changes. This is explicit GN
metadata for an already cached Compose module, not a new dependency download.
The first metadata edit matched the earlier material dependency list; corrected
to the presentation target before advancing the cache or starting another build.

Combined cached r36 passes blocking analysis in Siso4m37.60s/114 steps,
observed peak15,140,618,240 bytes. Signed source1edfe APKs are preserved in
`compose-visible-1edfe7a0a-x64-debug-20261011`, installed in place and matched
against their recorded SHA256 values. ProductionSHA
`dc2e3fe7ce204e1d9b4f465c8f0832dcdfe29cf14d3c1ed1edbc1dd281a5ff5a`;
testSHA `f3d0a8fd38c87ed3d308c43468cd4b937e7932730b4a5396e81d35f66fb93114`.
The install helper's final close finds no active agent session; both installs
and hashes already passed. No application data or compile cache was cleared.

Native r26 at720p/font1.6 passes4/5: all three layout regressions and
conservative cancellation/private replacement pass. Deletion-owner traversal
passes its key steps but times out on visible empty text after confirmation.
The same signed test passes this case at font1.0 (r27). Production r6 proves
Refresh focus scrolls the empty message above the viewport; D-pad Up to Previous
reveals its full native57px text. This is a visibility assumption, not evidence
of failed deletion. Test correction: positively wait for Refresh, navigate Up
to Previous, then retain the existing empty-message and exact owner assertions.
Use a test-only cached build and rerun this changed case at font1.6; retain r26
as4/5 and r27 as a separate configuration, rather than merging them into5/5.

Production720p/font1.6/ar restored More is now fully visible at y541..672,
with at least24px screen-edge space. RTL scoped clear-data confirmation passes initial
Cancel, mirrored Left/Right, Cancel preservation and exact Home Settings focus
restoration (`display-confirmation-r5.json`,8 checks). Intermediate r2/r3/r4
helpers stop on incorrect traversal/translated-label assumptions; their partial
records remain unaltered. They do not count as complete passes. Stage1.5 remains
pending until the remaining display/editor/spoken checks and settings restoration
finish; the count remains14/54. Physical acceptance stays deferred.

Test-only r16 passes blocking analysis in18.99s/14 steps, journal peak9.2G.
Its signed source054403030 artifact is preserved as
`compose-visible-tests-054403030-x64-debug-20261011`; installed testSHA
`f41f9e1a7d389554396d4f17ee67b5a9b678383270fe2d83ae44d99ec7aa6a54`
matches. Corrected r28 passes the deletion-owner case at720p/font1.6, retaining
exact owners and the visible empty-message assertion after D-pad Up. Production
editor r7 passes10 focus/recovery checks; wide r9 passes10 confirmation/Back
checks at1080p/font1.6/en. Wide r8's first8 checks pass before its incorrect
Content filters case assumption; r9 continues from the actual Content Filters
focus. Restored r10 passes18 checks with normal four-column Home and controls.
Saved display/locale/IME and all seven accessibility settings match exactly
after lease closure (`display-restored-r11.json`). Source/root latest reviews
pass Standards0/Spec0. Native/spoken/design evidence now accepts Stage1.5 for
the emulator scope: Stage1 is6/6, total15/54. Physical gates remain pending.

Next complete acceptance slice combines Stage2.4 and2.5 actual-engine routes:
controlled native navigation, stock Android IME, site alert/confirm/prompt,
fullscreen video, tab return, background/foreground and activity/process
recreation. Retain Chromium WebContents and stable document ownership, verify
cursor and focus recovery, observer disposal and private screenshot protection.
Reuse existing fixtures and native tests; consolidate related regressions into
one recorded pass, fixing only failures at their responsible owner. Preserve
normal/upgrade profiles, native security and phone rejection boundaries. Do not
count fixture scripts, compilation, mocked state or physical hardware as runtime
acceptance. Continue the remaining stages after this slice.

Stage2 actual-engine alert passes on production1edfe with a non-alphabetic
uinput remote and native initially focused OK; the retained document21 reports
Alert closed. A following direction exposes cursor loss: modal display calls
detachCursor(), clearing mPage, while dismissal only restores ContentView focus.
The next remote direction therefore opens controls instead of moving on the
same page. The confirm fixture command completion is not a confirm-dialog pass.
Preserve this failure under `probes/engine-lifecycle-r1`.

Correction slice: suspend the cursor visibly and cancel held input during a
trusted native modal, retaining its attachment and a captured document context.
Resume the prior pointer/scroll mode only after native ownership ends, on the
same tab/WebContents/document and attached page, with private-lock rejection
using the read-only supplier. Clamp to the current viewport and cancel old OK
before resuming; never invoke the side-effecting private access/unlock path.
Clear retained modal context on pause/destruction and reject navigation changes,
including same-URL replacement. Add focused input resume checks and retain a
native modal/next-click regression; verify actual alert/confirm/prompt recovery
and native keyboard ownership in one pass after the blocking cached build.

Latest cursor review: Spec0 findings; Standards requests the public resume
method's boolean/failure contract. Document unchanged state on a rejected resume
and held-press cancellation/current-viewport clamping on success. This is a
comment-only correction; the running r37 cache remains on source31067860c.

R37 passes blocking production/native-test build in4m01.51s/135 steps, observed
peak14,752,608,256B. Both signed x64 APKs are preserved under
`artifacts/compose-dialog-return-31067860c-x64-debug-20261011`; in-place install
hashes match and profiles are preserved. Consolidated dialog r2 passes native
alert but stops before confirm: the native snapshot shows focus returned to
compositor_view_holder, outside ContentView. The general focus guard therefore
rejects restoration and subsequent pointer input. R37's first probe stopped
before input on the emulator console's CRLF; normalize its line separator.

Next correction recognizes only Chromium's compositor content host as page
focus in the shared native-owner guard. Keep all other focus, modal/scrim,
Find, back-handler, IME and private checks intact. The actual alert/next-confirm
failure is the regression; build once with native tests and rerun the combined
dialog/media/lifecycle routes. Do not count the stopped sequence as acceptance.

Latest compositor review: source Standards0/Spec0. Root Spec requests an explicit
normal-profile precondition before any diagnostic read or cursor screenshot;
the same fixture URL can exist privately. Require the trusted normal controls
heading and a unique matching fixture target, and bound initial CDP discovery.
Failure stops before input/capture. Keep r38 on its immutable committed source.

Complete the combined lifecycle acceptance with three focused native cases:
destroyed session observers must ignore real subsequent navigation; recreated
normal Home must detach the old view and restore native tab identity, bookmarks
and Address focus; private Home/controls must retain native secure window flags
and return to normal without private sections. Use existing test classes and
activity recreation utility, isolated processes for Home cases, and no screenshot
argument/capture. Build only the changed native-test APK after r38 is preserved;
production stays on the exact reviewed compositor artifact. Background/process
return and ordinary fullscreen remain separate actual production checks.

R38 passes blocking build in3m34.65s/26 steps, observed peak17,630,318,592B;
signed artifacts/install hashes match. Dialog r3 passes Alert, Confirm Cancel,
Confirm OK and native Prompt canceled on unchanged document21. Recovery then
stops; its Back helper incorrectly treats the always-editable mobile URL bar
as a remaining prompt. Require the exact native prompt or visible stock IME
before a second Back and retain stopped r3. Lifecycle tests-only r17 passes in
21.43s/14 steps; runtime cases remain pending. No production rebuild for tests.

Dialog r4 passes all five result/retained-document checks, including the click
after Prompt cancellation. First prompt Back reports prompt/stockIME both gone,
confirming r3's unnecessary second Back. Final capture precondition stops while
the dismissed native dialog is still animating out; the following native tree
shows the normal Confirm button/result and no modal. Wait for the actual native
modal absence before capture, bounded to3s. Stock LatinIME's genuine q insertion
appends at the existing cursor; Cancel restores the original URL/control owner
in `stock-ime-r1.json`. Neither failed harness assumption is a product acceptance
failure or a complete sequence pass; retain the stopped logs.

Consolidated dialog r5 completes on productionb3a9: native Alert, conservative
Confirm Cancel/Right/Left, Confirm OK, Prompt cancel and the following Confirm
all report expected results on document21/timeOrigin1791699761302.6. Positive
cursor pixels pass at480×544 after native dismissal; task-owned uinput exits0.
The probe homes its initial cursor so it also works with an existing position.
Actual native results and normal-only PNG remain in `probes/engine-lifecycle-r1`;
no permission/private capture or hardware operation. Stage2.4 remains pending
the other navigation/tab/fullscreen routes, and2.5 pending native/runtime cases.

Production artifact `compose-dialog-return-b3a9e38a2-x64-debug-20261011` is
852,705,331B, SHA256
`a8709a0a27093d86ae3aad83d04d35a5e2a96c6600af3b8cda9e32e802fb8917`.
Lifecycle test artifact `compose-lifecycle-tests-a648dfd55-x64-debug-20261011`
is876,226,981B, SHA256
`f19e8fc4c6fbf20ce4a8a07cc65696cc4bfae95bbe111b468caa622e3d250446`.
Signature/package/x64 checks pass, with retained args/logs/provenance. Source
a648/rootd416 latest reviews pass Standards0/Spec0; it changes tests only.

Native lifecycle r1 passes all three isolated actual-engine cases on the a648
test artifact: destroyed observer/navigation (4.286s), Home activity recreation
and old-view detachment (7.132s), and private Home/dialog secure windows with
normal return (8.662s). Each process reports `OK (1 test)`; no private screenshot
or permission approval is used. Logs and combined JSON remain under
`probes/engine-lifecycle-r1/native-lifecycle-r1*`. Production fullscreen/tab and
background/process recovery remain pending, so Stage2.4/2.5 stay unchecked.

Combined production engine acceptance completes on b3a9. Native media r1 passes
remote Play/Pause, captions, fullscreen entry/Back exit and visible cursor pixels
at928×864, retaining page22/timeOrigin1791700770595.5. Native tab return r2
preserves that media document/captions and dialog21/timeOrigin1791699761302.6;
selection returns to Controls with Tabs focus. Its first scratch assertion
incorrectly expected selection to dismiss Controls; this was a harness error.
Native navigation r1 submits the fixed synthetic URL through genuine
InputConnection and D-pad Go, preserving DuckDuckGo as the selected provider.
Stock Latin IME edit/cancel and consolidated dialog r5 provide the system-keyboard
and native-modal checks; unchanged Unicode/editor tests are not rerun.

Production process return r4 passes: Home/app return retains PID30759 and the
same media document; explicit package force-stop observes PID absence and
relaunch restores PID31251, native tab22 and all four normal tabs. The recreated
document is new and paused, with fullscreen/captions reset. Warm Controls restores
its previous focus; fresh-process Controls starts at Address. Earlier scratch
expectations of Page cursor were incorrect. Background `am kill` did not terminate
the media process and is not an OS-reclamation pass. Native lifecycle r1 supplies
activity/view disposal and private secure-window evidence without capture.

Exact logs, probes, JSON and normal-only cursor PNG are retained under
`probes/engine-lifecycle-r1`. Accept emulator Stage2.4/2.5: total17/54,
Stage2 is5/7. Controlled comparative performance/go-no-go, sustained/pressure
recovery, physical hardware and real-phone acceptance remain pending. No profile
clearing, Chromium rebuild or Chromecast operation was used for this sequence.

Next consolidate Stage0.5/2.6 emulator measurements on the same retained normal
five-tab profile, API36/x64 Debug,1080p/density320/font1.0 and selected native
Home. No build or second emulator runs during sampling. Collect repeated cold
process launches, warm foreground returns, native-panel response/frame samples,
whole-package/browser/renderer PSS and installed/APK footprint. Compare the
preserved source5829 APK and reviewed production b3a9 in place: both retain the
same Chromium155 profile format, package and signer. Do not clear data or caches;
restore the current APK afterward and verify tabs/favorite/settings survive.
Keep fixture network/media timings separate from presentation responsiveness.
Report sampling/tool overhead and investigate budget misses; emulator results
cannot accept optimized physical performance or memory-pressure recovery.

Small fixture slice adds emulator-only PanelPerformanceProbe to the existing
synthetic IME test APK, with API36/x64/ranchu and trusted normal Home guards.
Native Back drives ten actual Home/Controls cycles. Report semantic availability
separately from the newly created window's first completed frame; neither is a
physical first-pixel measurement. Native frame reports are bounded, and future
completion timestamps are unfinished frames. Production remains unchanged.
Reuse the pinned SDK37 through explicit fixture-build overrides; SDK35 defaults
and the existing test signer remain supported. No new production dependency.

Current b3a9 samples complete without a build: seven cold launches have median
985ms, seven warm returns median21ms. Three whole-package PSS readings are
694315/647576/647069KiB, with browser, renderer and GPU details saved separately.
Panel r4 passes ten normal cycles: first completed draw median58.342/p9559.564ms;
semantic availability median107/p95154ms includes accessibility-query overhead;
181 native-window frame samples have median29.600/p9533.453ms. Initial r1
printed an array object identity instead of numbers; r3 exposed a future native
frame sentinel. Only corrected r4 supplies the complete numeric panel evidence.
Baseline comparison and controlled fixture load remain pending; no performance
gate is checked based on these current-only samples. Both reviews of root08d7
accept the native engine/lifecycle documentation with Standards0/Spec0.

Matched startup/memory sampling completes with identical package/version/signer
and five normal tabs: baseline cold median997ms, warm20ms, whole-package PSS
median615961KiB; current cold985ms, warm21ms, PSS647576KiB. Installed code is
830956/832624KiB respectively. Preserve source5829's in-place install/hash proof.
Root2a684's fixture reviews pass Standards0/Spec0, but actual baseline panel r1
times out: Home itself contains a Browser controls button, so its label alone
does not establish a new panel owner. Baseline Home Back also differs when the
tab has history. Keep this failure; do not compare that run to current metrics.

Correct the timing probe to prepare focus on the known Home control outside
timing, then use the same native D-pad OK action on both APKs. Require a different
native window with controls heading/Reload for opening and the exact original
Home window on return. Keep first-frame and semantic timings separate. Suppress
Android TimeoutException event dumps; log only the exception class, with no
editable event payloads. Rebuild only the small signed fixture and repeat the
two panel samples; startup/PSS do not depend on that predicate and stay valid.

The stricter baseline r2 still stops on return: legacy controls intentionally
forward cancellation to native Back, navigating the Home tab's prior fixture
history. Restore Home through the existing normal panel Home action outside
measurement on both APKs (More first where required); do not alter the immutable
baseline or erase its history. Record failure phase without event contents.

Baseline corrected panel r4 passes all ten cycles and restores normal Home.
Current r5 stops before timed input: Compose does not implement the fixture's
accessibility ACTION_FOCUS. Use the already accepted native Home D-pad route
from focused Address for both APKs, choosing Right/Down from the two
known Home button positions. Revalidate focus before timing D-pad OK; keep both
trusted-window guards. No production change or repeated startup/memory sampling.

Current r7 reaches timed panel opening but stops on untimed Home preparation;
Compose expansion publication makes the legacy Home-action return inappropriate.
Use current controls' accepted native Back-to-Home route when More identifies
that presentation, while legacy controls use their existing Home action.
Both must restore the original normal Home window before the next sample;
timed D-pad OK and panel/frame predicates stay identical.

Matched panel acceptance now passes on baseline r4/current r9: ten cycles each,
first completed draw median95.054/74.251ms and p95108.940/80.486ms; native semantic
availability median242.5/243ms and p95298/263ms. Native-window frame duration
median30.781/33.426ms and p9550.087/50.073ms (221/264 frames). Relative budgets
pass. Semantic query/event overhead exceeds the100/200ms investigation target
on both; these results do not prove100ms physical presentation. New-window draw
is a render-completion proxy. Keep r5–r8 fixture failures and the UiAutomation
lease conflict distinct from product failures. Current APK is restored in place,
normal favorite and five tabs remain; display1080p320/font1.0 is unchanged.

Finish the controlled load comparison with five reloads each of the same local
remote-input and byte-range media fixtures on both signed APKs. Diagnostic CDP
reload/readback measures navigation/resource timing, metadata and first decoded
video frame; it is not native address/action acceptance. Use trusted normal
fixture UI plus exact unique targets; do not observe private/security pages.
Record sampling overhead and media/network work separately, then restore current
APK/profile and close Stage0.5/2.6 emulator feasibility with hardware pending.

Latest root68db native-panel correction reviews: Standards0/Spec0.

Next source slice4.8: retire the duplicate mobile top toolbar only for tabbed
BraveActivity TV presentation. Return Chromium's native HIDDEN visibility
constraint from TabbedModeTabDelegateFactory on TV; its BrowserControlsManager
continues to own visibility/content offsets, IME, fullscreen and compositor
positioning. Use one functional Java patch line and existing Activity TV check,
not View.GONE/fullscreen flags, global CCT routing or a copied factory constructor.
Custom-tab/security window owners stay unchanged. Add an actual native Home→web
case asserting constraint, zero content offset, hidden mobile controls and usable
TV Address/Back. Consolidate current production viewport/cursor/media/dialog/
stockIME/native security checks after one cached blocking build. Do not rerun
unchanged storage/dependency or broad unit suites. No physical acceptance.

Controlled load r1 passes five input-page and five video-page samples on each
APK. All video samples report decoded frames, readyState4,427×240/24.109s and
no media error. Median video readiness is126.427/128.864ms; load-event median
72.6/96.1ms is noisier and not a shell-speed claim. Currentb3a9 is restored and
its native controls identify the exact normal media fixture. Stage0.5/2.6/2.7
accept emulator methodology/budgets/Compose hosting; total20/54, Stage2 is7/7.
Physical optimized performance remains explicitly deferred. The source4.8
change still requires build/runtime acceptance and stays unchecked.

Before the toolbar build, restore unrelated pre-existing BraveActivity formatting
changed by whole-file formatting. Retain only the documented public TV check;
format the new test normally. This correction does not change behavior or add
validation scope. Keep source/root master history and review both latest slices.

Toolbar implementation review: sourcec36 Standards0/Spec1, root0a3530/0.
The constant HIDDEN removes native TabState safety/IME visibility decisions;
fix before building. Source3a624/root32464 formatting correction reviews0/0,
but that earlier functional finding remains open. Retain native composition
and all TabState observers through a small TV subclass: dangerous/error/
unresponsive/focused editable state and native app showing tokens keep SHOWN;
ordinary TV Home/page presentation uses HIDDEN. Observe app token changes and
remove that observer on native tab destruction; fullscreen HIDDEN retains native
priority. Mobile loading/Chrome-scheme/accessibility visibility assumptions are
superseded only by the accepted TV presentation. Add actual native editable
visibility/recovery coverage and later exercise trusted error/interstitial flows.
No build has started; preserve the advanced checkout and every compile cache.

Cached r39 stops at Java compile after52steps/25.85s; MemoryPeak11110313984
bytes(10.35GiB). EmptyTabObserver is absent from this pin and protected mTab's
TabImpl type is package-private. Keep the failure/artifacts unaccepted. Latest
source3a6d reviews: Standards1(public ownership/thread/teardown documentation),
Spec1(duplicated editable flag survives parent crash reset). Connected lifecycle
inspection also finds delegate replacement without tab destruction.

Correct with the public Tab interface, current native ImeAdapter.focusedNodeEditable
(no duplicate editable flag), and parent's existing input/SSL/navigation observers.
Subscribe to app visibility on first observer, unsubscribe on last and compute
unobserved get on demand, matching the pinned Composed delegate. Document UI-thread/
owner/teardown contract. Add a focused real-tab/app observer release regression;
retain actual native editable/recovery and viewport cases. Retry the same combined
cached build only after committing/pinning/reviewing the correction. No cache reset.

Latest sourcecd3/rootc9d6 reviews0/0; r40 compiles observer/input changes but
stops at the pinned public Tab interface lacking isRendererUnresponsive.
43steps/17.74s, MemoryPeak9290932224bytes(8.65GiB), no runtime acceptance.
Move the source-owned TV subclass into the native tab package so it can use
its inherited package-local TabImpl renderer state without another copied flag
or visibility patch. Update factory FQN, GN source path and test import together;
retain all behavior, focused cases and cached blocking build. This is a Java
access-boundary correction; no Chromium/toolkit update or broad rebuild.

Consolidated viewport probe slice: update the existing normal-only native dialog
replay to derive button targets from read-only DOM rectangles and the actual
device scale. Require the full1920×1080 CSS-scaled viewport before remote input
and after modal return, then prove cursor pixels at the derived confirmation
target. Keep exact fixture/native-controls guards, genuine D-pad/uinput clicks,
conservative native dialog focus and no private/security screenshots. This
replaces obsolete toolbar-offset coordinates; it does not inject DOM actions.
Run it once on the new production APK alongside focused media/IME/security
routes. Preserve earlier unchanged storage/Unicode/performance acceptance.

Latest rootd568 viewport probe reviews: Standards0/Spec0. Combined r41 reaches
packaging/lint but fails blocking Error Prone FieldCanBeFinal on the borrowed
app-visibility field. Elapsed4m22.07s, MemoryPeak13954215936bytes(13.0GiB);
137steps completed, no installed/runtime acceptance. Make that constructor-only
field final while retaining nullable initialization for the base constructor's
virtual calculation. Retry the combined cached target with all checks enabled;
preserve logs and do not install the failed build's APKs.

Source7b006/rootc366 latest reviews0/0. Combined r42 passes blocking analysis in
3m39.36s with26steps and observed MemoryPeak17220943872bytes(16.04GiB).
Signed x64 production/test APKs are preserved under
`artifacts/compose-toolbar-7b0062047-x64-debug-20261011`, hashes
`c510359f2a322d88dbfbc6cca81fc43cdb31555c226e4a161eab64aef586f133` and
`12067411e3d162ea5e06bbb6df01e5df9fcd930d0e01c760e3100ee6b79ffc14`;
in-place installs and installed hashes pass. The first isolated native viewport
case fails at initial Home,8.198s; the bundle correctly stops. No4.8 acceptance.

Diagnosis: the cached Chromium factory still has its original delegate line.
Ordinary build does not apply newly added tracked Chromium patches. A read-only
Brave patcher checksum scan reports exactly one pending patch, the new factory,
NO_PATCH_INFO, with no obsolete patches. Its upstream target has no unrelated
edits. Correct the documented source workflow, run the pinned incremental
`pnpm run apply_patches` while builds are stopped, verify the actual target and
patch metadata, then rebuild with preserved caches. Keep r42's missing-hook
artifact/failure evidence distinct from the next applied-patch artifact. Do not
hide this failure by changing viewport expectations or widening test timeouts.

While r43 builds the immutable source7b006 checkout, prepare two focused native
recovery cases in the source fork for Stage4.4/V2: close the sole normal tab
through the same native close action used by TV controls, require a different
usable normal Home with Address focus; close the sole private tab, require the
original normal Home/model and cleared private window protection with normal
favorites intact. Use only the separate native-test app's synthetic models;
do not close the production profile's preserved tabs. These supplement the
existing production D-pad/group/phone tests, not replace them. Compile the
focused test target only after r43 is finished and the new source pin advances.
No recovery acceptance is claimed before actual isolated native runs.

Roota167 patch-workflow reviews0/0. Source17e1/root4de8 Spec0; Standards1:
the private recovery case must pin INCOGNITO_SCREENSHOT disabled and require
FLAG_SECURE before closing. Source627dd pins that feature and waits for the
actual protected private window before native Close; runtime remains pending.
Rootd66e9 pins the correction; both latest reviewers report0 source/root findings.
No production UI/checkout mutation during r43.

Applied-factory r43 passes all blocking checks, Siso3m32.61s with26steps;
observed MemoryPeak17856835584bytes(16.63GiB). Preserve source7b006 production/
test artifacts with the actual factory/patch metadata hashes, install in place,
and rerun the four isolated native cases before production viewport replay.
Only after artifact preservation advance to the reviewed test-only source627dd
and compile the focused test target for the new final-tab cases. No4.8/recovery
acceptance from build success alone; source7b's earlier unapplied artifact stays
separate. Continue the remaining independent emulator scope after these checks.

Applied r43's first native viewport case still fails at initial Home (8.221s).
Production ordinary dialogs page has no toolbar and its Alert bounds now begin
at344px; production new normal Home still visibly shows the112px mobile toolbar.
The preserved six-tab normal profile/favorites remain intact. This is a real
native-page offset issue, not justification for loosening viewport acceptance.

Native owner inspection: BrowserControlsManager ignores renderer offset callbacks
for native pages; forced SHOWN→HIDDEN retains absent offset tags, and its app
visibility callback does not apply native HIDDEN positions on token release.
In the existing TV visibility subclass, after publishing authoritative HIDDEN,
ask the active native manager to apply its own non-animated native positions
only for the observed, current native tab and a live activity. Retain inherited
observers, first/last app subscription, app-show/native-security/IME exceptions
and inactive/dead-tab rejection. No global manager patch or fullscreen flag.
Split native viewport assertions to identify constraint/offset/visible bounds;
use clipped global bounds because translated native toolbar views may remain
isShown. Require zero content offset and no visible toolbar pixels, plus usable
Home focus, then rerun four native cases and two pending recovery cases on one
combined cached build. Cancel the planned test-only build in favor of this
complete production correction; it has not started. No4.8 acceptance yet.

Combined r44 source83de90 passes blocking analysis in4m05.60s/136steps;
observed MemoryPeak16342687744bytes(15.22GiB). Both signed x64 APKs are
preserved in compose-native-home-83de90d87-x64-debug-20261011 and installed
in place with matching installed hashes. Production APK852736075bytes,
SHA2562f23d1153ee1da079261f268da5690e61a062ef7673e3339a90338f137584b13;
test APK876247001bytes, SHA256ae6dd9f2704549767d6062a8c55440f1628d651839e1cf40dd5ea854abffd9c8.

The first native case now passes HIDDEN and zero content offset, then fails
only its geometry-only toolbar predicate (8.558s). Production normal Home
has no visible mobile toolbar: heading y64 instead of176, Address focused,
Favorites retained. Correct the test to combine isShown with clipped global
bounds; invisible views must not count as painted pixels, while translated
visible views must still be checked. Keep full-height Home/zero-offset assertions.
Acceptance: six isolated native cases and one consolidated production viewport/
dialog/media/stockIME/security sequence. Compile only the corrected test APK;
production source83 is unchanged and stays installed. Do not repeat unchanged
storage/dependency/performance suites or waive mandatory native/security checks.
Stage4.8 remains pending; count20/54. Latest source83/roota362 reviews0/0.

Focused test r18 source0d5 passes blocking checks in18.51s/14steps; journal
reports9.7G peak. Signed test APK876246973bytes,
SHA2561a9a77b5b09106e1d98bcd6ac740ea576fd1bfae3fb2d8e4cb3ad4e3532e7d07,
is preserved in compose-toolbar-tests-0d5ea367f-x64-debug-20261011 and installed
in place. Native r5 passes viewport8.352s, app-show override6.133s, editable
navigation7.425s, observer disposal5.714s and final normal Home6.677s. Private
final case9.301s restores the exact original normal tab/counts and clears the
native secure flag, then fails Address focus. No private capture or isolation
waiver. Source0d5/root38be7 latest reviews0/0.

Next correction: the shared closure observer currently ignores private closures.
Post a guarded Home recovery for both normal and private removals. Preserve
normal-only creation when the normal model is empty; after the last private
closure, focus an existing selected normal Home only, with live/current activity,
foreground/window focus, zero private tabs and no native/presentation modal.
Do not focus an ordinary page, unlock private tabs, create duplicate Home or
steal Settings return focus on routine window-focus callbacks. Reuse existing
Home focus scheduling and native models. Acceptance: the failing private case,
normal final recovery and existing nested Settings invoker return on one combined
build. Retain unchanged toolbar/storage/performance evidence.

Production dialog r6 stops before Alert: the unconfirmed Page cursor activation
left controls active. Diagnostic r7 confirms Page cursor before activation and
controls dismissal before movement; held OK opens the exact native Alert and OK
returns Alert closed in the same document. Its immediate viewport assertion
then sees968px during a native app-show token, not a permanent inset. Strengthen
the replay with bounded positive focus/modal/page-activation and full-viewport
settling before subsequent coordinate input. Retain native SHOWN overrides,
exact outcomes/document identity and a1080px final viewport; never continue keys
or capture after failed ownership. Run consolidated dialog/media/IME/security
on the production APK while the reviewed recovery build compiles. No4.8 checkbox.

Latest source789/root59c reviews0/0. Root replay r8 stops at its new page-owner
guard: controls did dismiss and the native focused Chromium content is exposed
as Web View, with no virtual HTML heading in this accessibility snapshot. The
guard must accept that observed focused native content, retaining exact normal
fixture URL/unique document checks, before any page movement. This is a test
precondition correction, not permission to proceed with a native modal or unknown
page. No capture occurred. Source789 production recovery build remains next.

Root18cf latest reviews0/0. Dialog r9 stops before page movement: activation
dismisses controls, but native accessibility now exposes the retained HTML Alert
button as focused, rather than its parent content frame. The normal fixture
heading, exact native URL and unique document remain present. Extend the positive
owner predicate to the fixture's known focused HTML button identifiers with its
heading and browser package; retain all existing document/viewport/modal checks.
Acceptance: one consolidated native dialog run, then media/IME/security; no
new APK build or unchanged suite rerun for this host replay correction.

Source789 combined r45 passes blocking analysis in3m35.80s(Siso3m32.38s,
26steps); observed peak15600795648bytes(14.53GiB). Both signed x64 APKs are
preserved in compose-private-home-78932e44f-x64-debug-20261011:
production852735683bytes,SHA256a3dd43eb84e499986b4de19c69d420ecfe10086f49aa52a04a6fa65c1457cbe4;
test876246581bytes,SHA256bdae6a3b9eef65991505c3bd61dce0e4066a1666f28d17f6bc8479a78c9f1ea3.
Installation/native recovery acceptance remains pending. Rootfbf latest reviews0/0.

Dialog r10 passes Alert, both conservative Confirm outcomes and genuine Prompt
cancellation in the retained document, then fails the next Confirm: the immediate
post-Back snapshot still contains the disappearing Prompt, causing an unnecessary
second Back that opens controls. Correct this replay decision by observing the
native cancellation outcome for a bounded interval first. Send a second Back
only when the exact Prompt still positively owns focus after that interval and
the stock IME is absent. Preserve same-document checks and fail before further
input on an unknown owner. No production change or acceptance from partial results.

Both r45 installed hashes match the preserved artifacts; profiles remain intact.
Native r6 private recovery remains RED9.219s: exact normal tab/counts/security
postconditions pass, Address focus still fails. The stopped bundle does not count
other tests. Strengthen that regression to require actual BROWSING layout and a
visible native Home before focus. This distinguishes a covered Home from a lost
Compose focus request; no private screenshot or security flag override. Build
only the test target, then rerun this one case. Keep independent production
dialog/media checks running while the small cached test build compiles.
Root2f274 Spec0; Standards' documented GNU timing correction is applied above.

Focused test build r19 fails compilation because BraveActivity's Java facade
does not expose getLayoutManager; the real ChromeTabbedActivity test rule does.
Use that existing native owner, not reflection or a production API expansion.
Keep the failed artifact uninstalled. Separately, dialog r11/r12 stop at Page
cursor activation (uinput and native D-pad both): controls reopen, consistent
with runControl dismissing its dialog before validating a context whose native
viewport changes on window-focus restoration. Add one actual native regression
for a single Page cursor activation after HIDDEN/zero-offset settling. Run it
and the private layout diagnostic in separate processes on one test-only build;
investigate the resulting exact failures before altering production validation.

Test-only r20 passes blocking analysis in21.94s(Siso19.30s/14steps), journal
8.3G peak. Signed/source-pinned test876243725bytes,SHA256
ce2c4c98c1accc5c3249044e8e9212e73bc93d186b5dcda1371b9b57ed90b727,
is installed in place; production789 remains unchanged. Source d971/rootb64
latest reviews0/0. Native diagnostic r8: compact single activation PASSES9.463s,
so the suspected always-stale dismissal cause is not established. Private
8.423s fails because the activity tab becomes null after its earlier identity
postcondition, during the layout-return poll. Revalidate exact normal identity
in that same UI-thread poll before dereferencing, preserving native BROWSING/
shown-Home/focus assertions and reporting the observed layout in its failure.
Rerun only this changed case with a test-only build; retain the compact pass.

The explicitly discovered nonphysical phone AVD is now open as emulator-5556,
brave_phone_remote_api36, with its returned launcher/config/session. With no
build active,15–16GiB RAM is available. Both emulator Wi-Fi states are saved;
only TV Wi-Fi was enabled for upcoming actual private-address remote checks.
No physical device is operated. Media r3 stopped on a read-only fixture timeout
before input; a later bounded read confirms the selected visible document with
full1080px viewport. Its focused retry preserves the exact normal fixture owner.

Test-only r21 passes blocking analysis in32.94s; journal10.2G peak (largest
sample8510828544bytes is not the final peak). Signed876243437byte test,
SHA256c9faa93b8d83cd60949d9e4a0a742a11b14dccb7a378dbfd3e8db9cc8eb7cde4,
is installed in place. Native private r9 remains RED11.433s: the activity tab
is null while native layout remains BROWSING(1). This rules out the proposed
overview explanation. The source789 helper relies on that nullable activity
supplier and skips restoration. Recover from the authoritative selected normal
model instead, guard zero private tabs/live normal TvHomePage, and reselect its
existing index through TabModelUtils before requesting Address focus. Preserve
all foreground/modal/private checks; no tab creation, private unlock or layout
override. Test the focused correction in the test APK first, then package the
production APK only after native recovery/normal/settings focus acceptance.

Production789 media r5 PASSES real Play/Pause/captions/fullscreen/Back,214 decoded
frames and exact cursor pixels with same document24, full1920x1080 viewport.
Dialog r14 PASSES the complete Alert/Confirm/Prompt/next-click/cursor sequence
in document21. Chromium exposes a focused native accessibility root with class
android.webkit.WebView and no label in some states; this is native Chromium
accessibility, not an Android WebView engine substitution. The successful replay
also uses a100ms Select press when entering page input; zero-duration down/up
can race Compose's press handling. Persist those exact replay corrections while
retaining native package/normal URL/unique document/viewport/owner checks.
Media/dialog partial failed runs remain recorded and unaccepted. Source8d22/
root0f5 latest reviews0/0. Current total20/54; physical acceptance remains pending.

Private-model r22 builds successfully in4m42.95s (Siso4m38.75s; journal12.6G
peak). Signed test876243117bytes, SHA256d2ddb0e4292d7ccf69d9bb0566c1b83644f27be1de33ea54f5c2ad5089774476,
is preserved and installed in place. Native r10 is RED11.399s: after the initial
normal return, the empty private model becomes selected again. Both latest
source240/rootdb31 review axes report0 findings; this is not runtime acceptance.
The pinned NewTabAnimationLayout's delayed expand completion unconditionally
selects the newly created tab's model, even after that tab was closed. Retire
these mobile model-reactive animations on television at their existing enable
boundary, including accessibility-mode recalculation. Keep Compose motion and
non-TV behavior. The existing rapid final-private-close test must pass without
an animation delay; also verify the native animation policy and normal/settings
focus returns. Consolidate these affected checks only; retain media/dialog and
download acceptance. No production APK packaging until this focused test gate.

Source de2cf07/root a3b8a55 latest reviews are Standards0/Spec0. Only the new
layout patch was incrementally applied; its target checksum is
10166466f2b63743dbbe00b20f97f78c87c7a15797b7b478cab8a8c2a59339ca.
Test-only r23 passes blocking analysis in4m23.45s (Siso4m19.42s), journal12.9G
peak; largest observed peak13925007360bytes. Signed876242349byte test,
SHA25649d9cccba45ef9b968db71d79be8732a461bafff35efade471f0f2b2796e7178,
is installed in place. Native r11 PASSES5/5 separate-process cases: animation
policy through accessibility changes13.313s, rapid private closure8.330s,
normal final closure8.837s, nested clear-data Back12.370s, Home Settings Back
9.677s. The unchanged-timing private regression establishes the delayed mobile
animation as the cause. Production remains source789 until r46 packaging and
in-place installation; retain the unchanged media/dialog/download evidence.

Actual phone acceptance has started on source789: phone Brave155.0.8059.40,
TV10.0.2.17 and phone10.0.2.18 over shared virtual Wi-Fi. Save the TV's original
Ethernet-enabled state and temporarily disable that emulator's Ethernet using
Android16 IEthernetManager transaction13; Wi-Fi then connects. Original platform
Wi-Fi0 will be restored at closeout. QR screenshot decoding, all three bundled
assets, fragment removal and waiting-for-approval UI pass; explicit focused
TV Approve is activated separately. Four authenticated commands are rejected
with only paused/revision metadata under native controls. Dismissing controls
restores all five normal-tab rows. Exact-number protocol checks and direct
phone-to-TV Host/Origin/method/parser/idle-socket checks also pass. Diagnostic
CDP forwards are separate from this actual private-address transport. These are
partial emulator phone results, not private/password/native-permission acceptance
or physical LAN/phone/Safari proof. The private invitation capture remains local
with restrictive permissions; no invitation/controller credentials are logged.

### Consolidated grouped-tab and library acceptance

Production r46 on source de2cf07 passes blocking analysis in17.15s (Siso13.47s,
9 cached packaging steps; journal10.5G peak). The signed852735475byte APK,
SHA256dbd145fa8316ce457a3d3b6962db59f831015a3805234be078f0f0c935104a08,
is preserved in `compose-native-animation-de2cf07bc-x64-debug-20261011` and
installed in place. Actual D-pad private creation/closure returns to normal
Home with Address focus and removes FLAG_SECURE; private Home previously has
FLAG_SECURE. Four authenticated phone commands reject with redacted metadata
while private, without opening an unlock or approval surface. The phone resumes
with all six expected normal rows. Actual phone touch/click/drag/two-finger scroll,
Back/Forward/Reload, stale and duplicate command rejection, and temporary normal
tab create/select/close pass without closing the five preserved baseline tabs.

Native phone r46 initially fails Unicode propagation, leaving both fields at
their original text. A stable native edit subsequently passes. A fresh-document
r47 replay with request metadata observation passes the full native Unicode,
actual Android InputConnection composition/commit, selection/deletion,
textarea/contenteditable, stale-field rejection and password exclusion sequence.
No product input guard was relaxed. Retain the initial failure; replay the
unchanged canonical probe on a fresh owned fixture without the observer before
claiming the initial stimulus problem resolved. That unchanged r48 replay again
fails the first Unicode edit after viewport resampling, so this input race
remains open despite the complete r47 pass. Capture request/editable-version
transitions without an extra pre-typing state read to isolate the race.
Existing RemoteIme was already
installed/enabled: restore the saved default/enabled IME settings at closeout
and preserve that preexisting fixture.

Next slice: add native tests for Cancel and Delete of the final grouped normal
tab using TabModel.createSingleTabGroup and the existing native close action.
Require initial Cancel focus, Right/Delete and Left/Cancel traversal, exact
original tab/group preservation on Cancel, and usable Address-focused Home
after confirmed deletion. Run in the isolated instrumentation profile, never
close all preserved production tabs. Consolidate related native library/settings
checks in the same cached test build where practical: native bookmark paging,
opening, conservative removal Cancel/confirm, and preservation of other saved
pages are included. Retain unchanged media,
dialog, downloads, storage and dependency evidence. Test-only changes require
only the test APK, latest-commit reviews and blocking analysis. Physical gates
remain pending and the canonical accepted count remains20/54.

Latest review reports Standards1/Spec1 in the test slice, root0/0: share the
bookmark page-size constant with the test, and compare the exact pre-close
group token after both Cancel operations. Correct these assertions before
acceptance. Test-only r24 builds successfully in21.35s; its uncorrected cases
are not run or accepted. Preserve that successful build log and reuse its cache
for the correction, without packaging an unchanged production APK.

Native r12 on source a26c526 passes final-group Cancel10.420s and Delete11.064s,
including exact retained group identity and usable Home/Address after deletion.
Bookmark paging fails11.530s while entering the owned folder, before paging;
removal is not run. The helper sends subsequent directions without waiting for
the preceding folder to become the active panel, and incorrectly expects a
disabled Save action to get initial focus. Wait for each actual folder title
and its enabled Parent action; retain the paging/removal assertions and failed
log. Test-only r25 completes blocking analysis in4m18s (Siso4m14.40s), observed
peak13937864704bytes. Its signed876265225byte test APK has SHA256
c8143e15a1a1395a2f06caa430eb5dc0f2bf3b69c98bb25aabe9085a05f7216e.

Consolidate already-passing acceptance: shared real TV/phone state/navigation
seam3.1, shell/focus ownership3.2, lifecycle-bound native observers3.4, native
address/provider editing4.2 and final-group semantics4.5. Evidence spans the
unchanged source65/da718 same-URL/phone gates, a648 lifecycle disposal, d6/b3
genuine IME/provider navigation and current de2/a26 final closure. Count becomes
25/54; unresolved current phone first-edit race keeps3.5 pending. This uses
existing actual-engine evidence instead of repeating unchanged checks.

Next complete source slice: expose the missing Page info action in compact
controls using existing localized menu_page_info and the trusted native
info_menu_id command. Keep document/input/private revalidation, hide/disable on
non-web pages, and leave certificate/permission decisions with Chromium. Prove
native page-info origin/security content, D-pad traversal and Back return on
the actual APK; the route alone is not5.5 acceptance. Consolidate the bookmark
helper correction and this small route in the next cached build/review.

Page-info r47 stops at mandatory direct-dependency validation after21.57s:
the native fixture's EmbeddedTestServer requires net_java_test_support directly
in the test APK. Add that test-only GN dependency; no checks are disabled and
no failed-build APK is installed. Latest review reports source Standards0/Spec1,
root0/0: overflow has four columns, so Page info needs three Right presses from
History, rather than Down. Correct that real D-pad path before rebuilding.

Inspection shows EmbeddedTestServer additionally requires its separate native
service APK, which is absent from the retained artifacts. Stop only owned r48
with SIGINT and preserve its partial outputs. Use the already-running owned HTTP
fixture server instead of adding another native harness for one origin check.
The native test receives an explicit fixture URL, positively waits for the
fixture heading before opening Page info, and checks that native origin plus
connection row. Remove the now-unneeded test dependency and document the
instrumentation argument. No product endpoint, trust exception or data reset
is introduced; resume the same cached production/test build after termination.


### Consolidated native origin/library and text-input correction

Combined r49 on source24bd3 passes blocking analysis in3m42.23s
(Siso3m38.56s,26 executed steps), observed peak14618308608bytes. Signed production
852735327bytes SHA256589a84d4a45b5f2dddf95c042171c831a02abbffdd6db87cacfa51bcba4b4ab7
and test876261277bytes SHA256853141b7f9c3a9f3f841599f96a69d168a99c1223c98cefe97964d8c7d641060
are preserved in `compose-site-info-24bd3f35f-x64-debug-20261011`. Both install
in place with exact installed hashes and preserved production profile. Latest
source/root Standards0/Spec0. Native library r15 fails9.651s on the first folder
activation, before paging. Do not accept or rerun the dependent removal case
until that transition is diagnosed. Independent Page info r16 reaches the
trusted native origin/connection rows and returns to the same tab/URL; only
its final focus assertion fails. The shell initially collapses overflow on
return, so assert More controls, matching existing documented focus behavior.

Next input slice is driven by passive native r52 failure, rather than guessed
client timing: the accepted replacement exports original selection0..5 before
ending with20 UTF-16 units instead of the requested15. Chromium's pinned native
implementation sends selection via FrameWidgetInputHandler but text commits via
WidgetInputHandler. Use existing ImeAdapterImpl.replaceText for an atomic native
replacement range; confirm renderer text before applying the requested caret.
For composition, wait for native full-range selection before composing, keeping
actual Chromium composition. Renderer-confirmed stages must retain field,
viewport and version cancellation, reject conflicting state, be bounded, and
clear on invalidation/destruction. The bytecode hook may carry replyToRequest
so an unrelated intermediate IME update cannot complete a commit. Validate the
original actual-phone Unicode/selection/composition/password/stale-field probe
and repeat the tight initial replacement path. No DOM value writes, fake key
text, relaxed guards or new native engine are authorized by this correction.
The correction uses a renderer-request reply flag to distinguish an ordered
commit acknowledgement from intermediate state. Pending edits have a two-second
abort and clear on focus/viewport/lifecycle invalidation; no replay is queued.
Consolidate the Page info assertion and realistic100ms D-pad OK events for the
native library tests with that build. Manual production replay from both webpage
and native Home opens Mobile bookmarks, including a zero-duration ADB folder
activation; this does not establish why UiDevice's transition failed. The new
native stimulus still needs runtime acceptance, and must not be labeled a
product fix solely because it changes timing. Retain unchanged media/group/
download/storage/accessibility results. Accepted count remains25/54.
Hardware gates remain pending.

### Native input review correction and consolidated checks

Native r17 on the preserved00d APK proves the library failure: its first folder
activation captured112px content offset, then observed0px after Home settled
(6.622s, failed before paging). This is a product callback invalidation, not
UiDevice key duration. Page info passes independently in11.403s, including real
native origin/connection rows, same tab/URL and More-controls focus on return.
Broader5.5 permissions/authentication remains pending. Use the existing document
lease for bookmark actions, while pointer/input actions retain full viewport
identity. Keep normal/private/lifecycle and native model revalidation. Remove
the diagnostic assertion; retain the original failing paging/removal checks and
wait for the known final offset only after the folder has actually opened.
Consolidate this narrow correction with999b input/hook validation in r51. No
repeat of unchanged Page info, media, group or download checks is needed.

Correction review on00d91ff76 reports Standards1/Spec1, root0/0. Document the
native helper's submission/failure contract. The outgoing input barrier is
valid, but renderer state and ping replies return on different pipes; a generic
STATE phase can accept old content for commit/compose/delete. Require their
expected native result using actual composition offsets and code-point ranges.
Conflict draining must invalidate/refresh after completion, rather than declare
the conflicting state ready. Keep r50 immutable while it compiles; its artifact
does not include this follow-up and is not input acceptance. Consolidate these
corrections into the next incremental build after native library diagnostics.

Combined r50 on00d91ff76 passes blocking analysis in5m20.37s
(Siso5m16.85s,184 executed steps), observed cgroup peak18245726208bytes
(16.99GiB). Both native libraries and APK targets reuse the existing cache.
Its production/test artifacts are preserved before testing. Source999b621cd
adds expected commit/compose/delete/finish results and genuine composition
offsets, with signature-checked hook/test changes. The phone probe now covers
20 repeated replacements, equal-text composition/commit, and preservation of
selected text while deleting surrounding code points. Those checks remain
pending runtime; r50 does not contain999b's correction. Count stays25/54.

Latest source9a5e review found that replyToRequest cannot identify an edit:
unchanged-text composition/replacement could consume an older reply. Remove
that inference. Add a small content-layer completion helper using the pinned
WidgetInputHandler PingMainThread queue barrier after native IME operations.
FrameWidgetInputHandler is associated with that same pipe and both dispatch to
the same MainThreadEventQueue; the ping follows prior input tasks. Preserve
ImeAdapterImpl/RenderWidgetHost observer and security behavior. Correlate each
phase by a monotonic ID, with weak callback ownership, cancellation and a
two-second timeout. Document UI-thread acceptance versus renderer completion.

Remove the unproven100ms bookmark test key change. Capture its browser context
before and after the failed folder activation to distinguish viewport changes
from key delivery. Keep the Page info return-focus correction. Build both APK
targets once, then run affected native checks independently and the real paired
phone replacement/composition regression, including unchanged text and repeated
first replacement. Carry forward unchanged passing checks; acceptance stays25/54
until those actual runtime checks pass. No physical device operation is allowed.

### Consolidated input completion and native renderer recovery

Combined source34609 r51 passes blocking Android analysis in6m56s
(Siso6m55.73s,271 executed steps), sampled cgroup peak19015077888bytes
(17.71GiB). Signed x64 production/test APKs and provenance are preserved at
`~/.cache/brave-tv/artifacts/compose-native-input-34609de54-x64-debug-20261011`.
Both installed hashes match; profiles remain intact. Native r18 passes the
changed IME hook, but bookmark paging now fails reaching More bookmarks after
opening the owned folder; dependent removal is skipped. The document-lease
correction fixes the earlier first-folder rejection without proving paging.

Actual phone r53 still appends the first Unicode replacement with the normal
TV keyboard. Passive r54 instead loses editable readiness when that keyboard
resizes the viewport. A controlled r55 with the quiet TV test keyboard passes
first replacement,20 repeat replacements, equal-text composition/commit,
Japanese native phone IME and direct selected composition/commit. It then
crashes the renderer deleting surrounding code points from a selected range.
The crash is a pinned Blink DCHECK at selection_editor.cc:546. Symbolization
identifies InputMethodController::DeleteSurroundingText at line1600: after the
right-side deletion it reads visible selection before updating layout. Preserve
`probes/engine-lifecycle-r1/phone-selected-delete-renderer-crash-r55.log`.
This is a native failure, not host memory pressure or a timeout-only verdict.

Next correction: add the smallest functional native layout update before that
selection read; keep Chromium deletion/event-listener semantics. Refresh native
editable state after browser/viewport cancellation, while retaining field,
version, normal/private/modal and document guards. Use the already-red full
phone probe as runtime regression; test both quiet and normal TV keyboards and
retain failed evidence. Add focused bookmark traversal diagnostics to the real
native test, without replacing D-pad actions or hiding its failure. Consolidate
these affected checks in one cached build; leave acceptance at25/54 until the
full cases pass. Page info/media/group/download checks remain carried forward.

Bookmark traversal diagnosis r19 captures the actual native test window. After
the eighth owned bookmark, Down focuses the disabled Previous bookmarks button
at the left of the paging row; More bookmarks remains enabled at its right.
Compose for TV intentionally keeps disabled buttons focusable for context, and
Right reaches More. The test incorrectly requires Down alone to reach a
horizontal neighbor. Correct that stimulus to Down to Previous, Right to More,
then require focused More before activation. Keep disabled spoken/visual states
and all paging/open/model assertions. Consolidate this test correction into the
pending native input recovery build; the screenshots and original failure stay
preserved in `probes/engine-lifecycle-r1/bookmark-focus-r19.json`.

### Consolidated r52 runtime checks and diagnostic cleanup

Source2da584628 r52 passes blocking Android analysis in7m08.42s
(143 executed steps), observed cgroup peak18710953984bytes (17.43GiB).
Signed x64 production/test artifacts and native patch checksums are preserved in
`~/.cache/brave-tv/artifacts/compose-native-input-2da584628-x64-debug-20261011`.
Both installed APK hashes match; production profiles remain intact. Fresh QR r5
uses the actual shared simulator Wi-Fi, privately decoded visible invitation,
bundled assets and truthful hidden-manual-form approval state. No physical
operation or profile wipe is performed.

Native bookmark r20 stops in the temporary focus-trail diagnostic itself:
UiObject2.getContentDescription throws StaleObjectException while Compose
replaces a node. This is not a paging assertion verdict. Remove that diagnostic
scan and its error wrapper now that r19 established the horizontal traversal.
Keep the target focus checks, Down/Right stimulus and all native paging/open/
removal assertions. Runtime remains pending; carry forward the unchanged IME
hook, Page info, media, group, downloads and display evidence. Combine any
necessary input follow-up with this test cleanup; otherwise rebuild only the
test APK. Accepted todos remain25/54 until affected real runtime cases pass.

Actual normal-keyboard r57 still fails the first Unicode replacement. The
post-failure native field remains its original five characters, with Gboard
compositionstart/update events; no replacement input is observed. The viewport
refresh has not proved this race fixed. Controlled quiet-keyboard r58 passes
the complete expanded phone probe: first Unicode replacement,20 repeats,
equal-text composition/commit, native Japanese phone IME, direct selected
compose/commit, selected surrounding deletion preservingABCD and selection1..3,
textarea/contenteditable, stale-field rejection and password exclusion. This
proves native renderer deletion recovery without normal-keyboard acceptance.
Keep3.5 unchecked and retain r57/r58 logs. Run a bounded first-edit request trace
to distinguish stale field/version/viewport rejection from native composition
conflict before the next correction; no rejected edit may be replayed.

### Native composition-only replacement identity

The test-only b3f552625 build passes blocking analysis in22.46s (14 executed
steps), with sampled memory peak9664708608bytes. Its signed test APK is preserved
at `~/.cache/brave-tv/artifacts/compose-library-tests-b3f552625-x64-debug-20261011`.
Native r21 passes bookmark paging/open in15.632s and removal Cancel/confirm in
17.279s. The installed production APK remains source2da; its profiles are intact.
History acceptance is still pending, so5.1 remains unchecked.

The bounded top-of-document first-edit r61 now reproduces the normal-keyboard
failure with metadata only: selection accepts field88/browser73/version146,
then confirms version147/text length5/selection0..5. Replacement requests147,
but Chromium returns148 with the same field/browser/text/selection and rejects
it. The only changed native state is composition. No replacement is replayed.
The earlier r59 with extra scrolling passed, so retain both observations.

Next slice: add a native whole-field replacement version that changes on field
eligibility, text or selection, while the full existing version also tracks
composition. Whole-field replacement finishes composition and atomically replaces
the native range; validate it against this narrower version. Positional
compose/commit/delete/select keep the full version. Document/viewport/field,
normal/private/native-modal guards, native completion and cancellation stay
mandatory. The companion captures this version with each coalesced edit and only
advances it after its own confirmed same-field result. Test real native
composition-only changes followed by replacement, and rejection after a text
change, plus the existing full unobserved stock/quiet probes. No timers, stale
edit retries or input-owner takeover are introduced. Acceptance stays25/54.

The focused host companion regression passes with actual bundled JavaScript,
including composition-only version changes and rejection of changed native
text/selection. Syntax and formatting checks pass. These are UI/wire checks,
not Chromium runtime acceptance. The expanded genuine native probe additionally
requires composition-only finish to preserve the replacement version, permits
whole-field replacement with that captured version, rejects positional compose
with an old full version and rejects replacement after an actual native text
change. Run it on the next exact production APK with stock and quiet TV IMEs.
Unchanged bookmark r21, native bytecode hook and broader passing checks carry
forward; rebuild the production target only for this phone-state change.

Latest review reports source Standards1 (DOC-004)/Spec0, root0/0. Document the
replacement-version contract explicitly: eligibility/text/selection advance it,
composition-only updates do not, and use requires current browser/field identity
and a ready, eligible field. The correction changes documentation only; include
it in the pending production build and review its latest commit separately.

### Bounded history pages and selection recovery

Next complete library slice: retain native HistoryProvider storage/query/removal,
while bounding the Java history window to one native150-entry batch plus16
boundary entries. Previous pages outside that window restart the native query
and stream to the requested page; older history stays reachable. Keep eight
visible rows and exact URL/timestamp selection through detail Back and external
refresh, with the nearest surviving row after confirmed removal. Preserve
normal-profile ownership, lifecycle disposal, loading escape and current deletion
policy checks. Add one consolidated actual-native paging/open/removal/Cancel/
policy case crossing the native batch boundary, using owned HTTP visits and
cleaning only those visits. Carry forward unchanged bookmark and download tests.

Production input r53 passes blocking analysis in3m54.72s (100 executed steps).
Signed source1a APK is preserved at
`~/.cache/brave-tv/artifacts/compose-native-input-1a873d81a-x64-debug-20261011`:
852728911bytes, SHA256c8fe4c6c490e11b3d25ce1c437dae78c9acd00da8d1044e5f18dab8f140d22e6.
In-place installation hash matches and preserves the normal profile. Sampled
build memory reached14090743808bytes; no complete cgroup peak was captured.
Fresh private-network QR pending approval passes r6. Stock first-edit r63
accepts an actual composition-only version change (full12→13, replacement10
unchanged). Unobserved r62/r64 still fail; bounded r65 proves a different,
legitimate viewport/browser/field change rejects selection60→63/field67→71.
No replacement is sent or replayed. Native stock-keyboard positive r66 now
waits for the actual visual-viewport keyboard resize before editing; no timer,
DOM mutation or edit retry is added. Full acceptance remains pending,25/54.

Expanded actual native quiet-keyboard r67 passes the new composition-only
replacement lease, old positional-version rejection and changed-native-text
rejection, plus the retained full Unicode/Japanese/selection/deletion/textarea/
contenteditable/stale-field/password cases. Stock r66 observes the genuine
keyboard resize and passes the first edit and20 replacements; it stops at the
equal-text composition-event assertion. Gboard can finish composition itself,
so this observation is distinct from a rejected replacement. Retain r62–r67
and do not accept3.5 yet. No authentication/queue/security changes or replay.

The history implementation retains a single native batch and16 boundary rows,
re-queries older pages without retaining all visited rows, and restores exact
URL/timestamp focus after external removal. One native160-visit test crosses
both forward continuation and backward window re-query, then checks detail
Back, external update, deletion policy, conservative Cancel/confirm and Open.
It removes only visits with its unique fixture URL prefix. Build/runtime are
pending. Combine production and test targets once after latest-commit review;
carry forward unaffected bookmark, download, media, bytecode and display checks.

Latest history review: source Standards1 (BS-048/TI-009, shared page-size
constant)/Spec1 (first-page horizontal footer traversal), root0/0. Correct the
native stimulus on every page to Down→Previous→Right→More with a positive
More-focus check, retaining the disabled Previous focus behavior. Expose the
package page-size constant and derive test page counts/row expectations from it.
Review this correction separately before the combined production/test build;
no runtime acceptance is inferred from review.

### Native About, source and license routes

While the pinned history build runs, implement the missing About entry in TV
Settings. Use the existing Compose/native dialog ownership, localized attribution
and installed package version, with explicit project-source and Chromium-generated
license actions. Return through the existing Settings/Home invoker; revalidate
selected tab/lifecycle before opening a destination. Keep Home's quiet source/
license links and native startup restrictions. Acceptance: one consolidated native
About→Back→About→licenses test checks the installed version, attribution, focus
restoration, same selected tab and actual generated credits document. Audit
startup/disabled-service routes separately; do not accept all5.7 from this panel.
No cache mutation occurs while r54 compiles; build this source only after its
commit/pin and the running build completes.

Latest About review reports source Standards1 (BS-048, duplicated source and
license destinations)/Spec0, root0/0. Share the two existing TV destinations in
TvBrowserControls and use them from Home, About and the native license check.
The correction retains the exact destinations and ownership guards. Review the
latest correction separately; current installed history APK remains sourcedb6.

### Actual history first-page traversal correction

Combined r54 sourcedb6/root641 passes blocking analysis in4m27.19s
(Siso4m23.44s,145 executed steps), sampled cgroup peak14901682176bytes.
Both signed x64 APKs are preserved at
`~/.cache/brave-tv/artifacts/compose-history-db6b16fa4-x64-debug-20261011`:
production852727627bytes/SHA256dcfe26f62ca7e7aa8e02820f1ad441d4bb4dffa60a8c38f2b8b26714400f7cbe;
test876288473bytes/SHA256903cccc2295a5186b3c141b265f7e55b7d600f20fc6a4c04685893fb4bf35e90.
In-place installed hashes match and preserve profiles. Native r22 seeds and
queries160 owned visits, then fails the first Previous-focus traversal at97.249s.
The borrowed bookmark assumption that disabled Previous is always focusable
has not held on this history footer. Teardown removes only its owned URL prefix.
No history paging acceptance follows from the successful fixture seeding.

Correct the stimulus to observe both native footer positions: if More owns
focus, use it; if Previous owns focus, press Right and positively require More.
This handles first-page disabled behavior and later adjacent enabled buttons
without relying on an inferred Compose focus rule. Use only focused selectors,
not a broad UiObject content-description scan. Combine this test correction with
the already reviewed About slice in one production/test build, then run only
history and About. Unchanged checks carry forward; accepted count remains25/54.


### Stable bookmark library selection and native updates

The reviewed history/About build continues independently. Complete the remaining
bookmark selection behavior using native BookmarkId, the existing eight-row
presentation and BookmarkModelObserver. Restore the selected row after detail
Back or confirmed removal; on native updates preserve the same BookmarkId or
nearest surviving row and the current non-row control. Observe only while the
list owns its dialog, coalesce updates on the UI thread, and remove the observer
and posted work on dismissal. Retain native edit/managed policy revalidation and
selected document ownership; no duplicate bookmark storage or generic state bus.
Acceptance: one native case crosses the second page, returns from detail,
removes a preceding native bookmark, removes the focused bookmark externally,
and verifies exact surviving focus and policy changes. Carry forward unchanged
bookmark Open/Cancel/confirmation checks; combine only affected native cases
with the next cached build. History/About acceptance remains independently
pending until the currently built APK passes its two native cases.


Latest bookmark Spec review finds one focus-restoration gap: the shared panel's
first-entry rule rejects a disabled preferred action, so native policy disabling
focused Save would move focus to another control. Give the existing panel an
explicit restoration mode only for returning/refreshed bookmark focus. Ordinary
first entry keeps its enabled-action fallback, and disabled activation stays
blocked. Add a native focused-Save→policy-disabled→enabled case using the owned
HTTP fixture, with the original native preference restored. Review the correction
separately; no new runtime acceptance follows from the initial review.


Standards reports0/0 and flags a connected lifecycle defect for Spec: native
AlertDialog dismissal can bypass controls dismissal after document replacement,
leaving a bookmark observer registered. Extend the existing panel dismiss path
with optional native-owner cleanup while preserving Compose disposal. Bind the
exact list observer and posted refresh to that native dismiss callback, so stale
Back and activity-owned dismissal unregister it even when browser context rejects
opening another list. Revalidate and review this correction before the next build.


Combined r55 source8f/rootfe0 passes production/test packaging and blocking
analysis in8:03.08 (Siso7m59.39s,1082 executed steps), cgroup observed peak
15682658304bytes. Both signed x64 APKs are preserved at
`~/.cache/brave-tv/artifacts/compose-library-about-8f8bfddd9-x64-debug-20261011`:
production852725810bytes/SHA256ee036bf92980cbe11f04ff523d3e137600f5f7b73facfa694aa8f7c44d5f57c9;
test876300227bytes/SHA256e1cb4b5ac5b3d1ded96981d209d60f3ad2ed7e48aa352f5a39ca3b07429dc349.
Verified in-place installed hashes match; profiles remain intact. Only the
history and About native cases are running against this exact source. Bookmark
corrections committed afterward are not present in r55 and require their next
cached build. Latest8f/fe0 review finishes0/0 for both axes. Acceptance stays25/54.


Bookmark correction review: Spec0; Standards1 DOC-004 asks for the public panel
restoration contract. Document disabled preferred focus with activation blocked,
and ordinary enabled-action fallback. This is documentation only; review the
latest correction separately before one cached bookmark build and the affected
native paging/Open, confirmed-removal focus, external-update and Save-policy cases.


### Native selector correction and About runtime result

Native r23 against source8f/rootfe0 passes About in17.429s (JUnit16.182s):
installed package version/attribution, Settings/Home focus restoration, same-tab
license navigation and the actual Chromium-generated credits document.5.7 remains
pending startup/disabled-service/hidden-route audit. History again seeds/queries
160 owned native visits, but fails at95.560s before paging with UiAutomator
`IllegalStateException: Focused selector is already defined`. BySelector.focused
mutates its receiver; the loop reused and amended it. Construct the focused More
and Previous selectors once, then use them without amendment. The newly added
Save-policy test has the same mutable-selector hazard for enabled/disabled
states; use two independently constructed selectors. Combine these test-only
corrections with the reviewed bookmark source in one cached build. Run affected
history and bookmark cases, carry forward About and other unchanged checks.
Canonical accepted count remains25/54; fixture seeding is not paging acceptance.


The pre-build fixture check also catches the new Save-policy case's nonexistent
`bookmarks.html` path. Use the already owned `bookmark.html` fixture in its exact
native argument/assertion and README; no duplicate fixture or server alias. This
is a test-route correction, and the pending runtime assertions remain intact.


### Stable native tab-list focus and discarded-tab restoration

While the pinned library build runs, complete the tab-list gap independently.
Keep the existing flat eight-row presentation, native tab/profile/group models,
New and normal/private actions, and the existing trusted Close menu/group
confirmation path. Observe native membership/order/selection and the eight
visible tab titles while the list owns its native dialog. Coalesce on the UI
thread; restore exact Tab ID after updates or the nearest remaining row when
removed, and preserve non-row focus. Dispose observers and posted work on every
native dismissal using the existing owner cleanup. Native selection retains
Chromium's discarded-tab restoration; do not allocate WebContents for rendering
rows or silently ungroup tabs. Acceptance: one isolated native case creates
sixteen genuinely frozen tabs from native serialized fixture navigation, pages
into the second window, removes preceding/focused owned tabs, opens the surviving
frozen tab and verifies its actual renderer/document. Close through the existing
native TV control and verify the model's remaining selection. Teardown removes
only owned fixture tab IDs. Carry forward existing last-normal/private-tab and
group Cancel/confirm evidence, unless connected behavior changes.


Tab-list ownership inspection finds an additional privacy gap: opening the private
list from a selected normal tab inherits the normal tab's dialog screenshot
policy. Mark that list explicitly as private content so its native window is
secure even without selecting the private model. Add an isolated normal→private
list window-policy check with only an owned private fixture tab, no private
screenshots and no sensitive payload logs. This strengthens native screenshot
ownership while retaining the existing private-lock checks.


Combined r56 source5bbc/root622 passes blocking analysis in4m23.48s
(Siso4m19.84s,141 executed steps), observed cgroup peak16190103552bytes.
Signed preserved x64 artifacts:
`~/.cache/brave-tv/artifacts/compose-library-history-5bbc5ace0-x64-debug-20261011`,
production852721726bytes/SHA256f1eab550432db04a9324f893b3e6ccc88f36454b4f11469f3d15dd7d43063f35;
test876319511bytes/SHA2560be441b4954c7f952f1ac3bf998cf6542e3b16b5c820d60e8f0ac038c9ffcd78.
Verified in-place installed hashes match and profiles are preserved.
Native r24 passes bookmark paging/Open12.749s, Cancel/confirmed removal with
immediate survivor focus14.706s, and disabled/enabled focused Save10.928s.
History99.000s still fails More focus after the twelve Down steps, before any
paging. The bookmark native-update case17.266s passes detail Back/selected-row
focus but fails its first-row-visible assertion after removal of a preceding
bookmark; selected last-row scrolling may make that visibility expectation
invalid. Inspect real focus/viewport state with bounded native stimuli before
changing either UI behavior or acceptance. No history/5.1 acceptance is inferred.
The subsequent tab-list changes are not in r56 and remain build/runtime pending.


### Consolidated library/tab corrections before r57

Latest d195/696 review: Standards0/root0, Spec1 source finding. The pinned
Chromium tree has no EmptyTabObserver; replace it with TabObserver's default
interface callbacks before compiling. Diagnose history first-page footer focus
with nine actual native fixture visits instead of repeating the160-visit setup.
Inspect selected-row viewport after external library changes; assert the page
boundary through native traversal rather than requiring an offscreen first row
to be visible. Batch affected history/bookmark/tab runtime cases in one cached
production/test build. Carry forward unchanged positive checks; count stays25/54.

Native production r25 minimizes the History failure to nine owned visits.
Twelve Down observations move9→8→7→6→5→4→3→2→disabled Previous visits→Controls,
then remain at Controls. Thus the actual first-page footer is D-pad reachable.
Use the existing fresh UiObject2/isFocused traversal used by other native cases,
then Right to More; remove the separate focused-selector lookup. No production
focus behavior changes. The same native trace shows upper rows leave the visible
viewport after last-row focus. Bookmark/tab update assertions now synchronize on
the newly disabled Previous footer (the normalized first page), then traverse
seven Up to the first row and seven Down back to the retained stable ID. This
checks real page membership and focus without demanding offscreen visibility.
R25 evidence: `probes/engine-lifecycle-r1/history-focus-r25.json`. Nine synthetic
normal visits and the owned fixture tab are retained until scoped cleanup; no
profile clearing. The platform uiautomator dump attempt exited137 without output;
no acceptance is taken from it. Latest correction/build/runtime remains pending.

R25 additionally proves native Right focuses More visits and OK opens the next
page with pagination1 focused. This is the minimized footer regression only;
150-entry continuation/deletion/policy remain pending the native aggregate case.
Correction sourceef292 uses exact pinned TabObserver default callbacks and the
bounded native traversal assertions described above. No production History or
bookmark behavior changed in this correction.


### Consolidated direct-startup/service audit and scoped clear-data acceptance

After r57's affected native cases, reuse the same signed APK for the remaining
startup/About audit and native clear-data scope. Use an explicitly discovered
nonphysical fresh AVD with no prior application profile; stop only the
owned clean-TV emulator first so resource use stays bounded. Retain its existing
normal upgrade fixtures unchanged. The fresh AVD is a separate persistent
synthetic profile, not a wipe of the main test profile. Acceptance: genuine first
launch reaches Compose Home/Address without mobile onboarding/promotions;
Settings/About/source/licenses and restart retain usable native focus. Inspect
retained native Android optional-service gates and registered old analytics
preferences, then use actual native histogram pages for bounded current-process
checks. This is not a universal no-traffic or hardware claim.

Use that isolated AVD/profile also for history/cookie/localStorage synthetic
fixtures and native clear-data Cancel/history-only/site-data-only operations.
Verify unaffected categories survive, actual native operations finish, Back and
pending/disabled actions remain usable, and preserved source5829 upgrade fixtures
on the stopped main AVD remain untouched. Do not clear the main profile, caches,
other apps or device users; do not create remote execution endpoints or alter
trusted OS/security approval. Document failures without marking5.1/5.3/5.7 passed
until each full item meets its real emulator acceptance.

Consolidated r57 sourceef292/rootaca7 passes blocking analysis in4m19.14s
(Siso4m15.55s,144 executed steps). Sampled cgroup peak15540936704bytes; the
live systemd peak was15624011776bytes. Signed x64 production852750342bytes,
SHA2569d69e5a9c3d7cf4c8272717600e8958e9adc27abb719e0b65998b6ca5d326612;
test876332995bytes,SHA2563bf6793b797f9b00e7af59cdb743f7a75512e65c236dd4b2cf9fb71de3609518.
Artifacts/provenance: `~/.cache/brave-tv/artifacts/compose-library-tabs-ef2929648-x64-debug-20261011`.
Both in-place installed hashes match,13.017s/12.739s; profiles remain intact,
and the Agent UiAutomation lease is closed before native JUnit. Four isolated
affected cases are running; unchanged three library and About positives carry
forward. Compiled artifacts alone do not advance acceptance.


### Native entry-path minimization and pre-frame selection fallback

R25 compiled corrections still fail the native160-visit History case98.952s at
first Previous focus. The nine-visit production probe passed, so repeat the
small scenario under the same native JUnit owner before another large setup.
Ranked causes: (1) the test's independently constructed History panel bypasses
the real Controls dismissal/cursor/owner path; use that real D-pad entry, which
predicts the short case passes. (2) native instrumentation focus observation
or key injection differs from Agent; a short native trace would still fail on
the real entry and localize the actual focused action. (3) the160-row native
query changes the first page; the small native case would pass but aggregate
would fail. Add a nine-visit native prereq sharing real entry/seed helpers;
run160 continuation only after that short prerequisite passes.

Bookmark external-update r25 fails26.273s at nearest survivor6 after page
normalization/Up/Down/policy checks pass. Inspection finds the refreshed dialog's
no-focus-yet callback restores using pageStart0 even when a prior stable focused
ID was at index7. Deletion before restored focus is assigned then chooses row0
rather than nearest6. Preserve the captured selected index as the no-focus-yet
fallback for both bookmark and tab refresh; actual models remain authoritative,
with no delays or input retries. The existing native external-update case is the
regression. Preserve independent tab results and unchanged positive evidence;
count stays25/54 until actual acceptance.

Native tab r25 reaches real16-frozen-tab paging, preceding/focused removal,
renderer restoration/document and return to page, then fails23.561s at Close
model completion. Private-list native secure-window ownership passes8.012s.
A minimized production probe on an additionally owned normal history fixture
also returns to compact controls without closing on the first request; a new
request from freshly opened controls closes it. No existing tab was targeted.
The source currently validates every control with the coordinate/viewport lease,
although close/navigation/library/settings actions carry no page coordinates.
Use the existing strict document lease for coordinate-free controls, retaining
exact tab/WebContents/document/lifecycle revalidation; pointer/scroll entry keeps
the full viewport lease. Actual phone positional commands and held OK keep their
existing stricter guards. Same-URL replacement remains invalid. The existing
native viewport/document distinction test and failing real frozen-tab Close
case cover the seam. This is an implementation inference to verify in r58, not
a passed native Close result. No edit replay, timing delay, certificate bypass,
private unlock or underlying tab/group model rewrite is introduced.

The native History traversal also sent another Down without acknowledging the
previous focus transition; waitForIdle is not a positive Compose focus signal.
Use the known eight owned first-page rows: after each Down require the exact
next row focused, then require Previous focused before Right/More. This removes
an observational skip over the footer without inserting a delay. Share the
same row-acknowledged route for aggregate Previous paging. The short prerequisite
checks the nine-owned-visit first page→More→next-row1 path; older global history
is intentionally not rewritten to simplify its second page.


### Stable survivor identity before restored focus

Latest c6f6/fb8 review: Standards0/source and root, Spec0/source and root.
Before the consolidated r58 build, retain both the selected index and the actual
survivor ID chosen by each refreshed bookmark/tab panel. A second native reorder
before its first focus frame otherwise searches the already deleted original ID
and falls back by position again, potentially selecting a different survivor.
Capture the actual current native ID beside the existing fallback index; leave
focused-action lookup, disposal, security and authoritative models intact. The
existing native external-update and frozen-tab tests cover affected behavior.
Run the nine-visit real-entry History prerequisite first, and run160 continuation
only if it passes. Batch both document/viewport lease cases with the affected
bookmark/tab cases, carrying forward private-window and unchanged positives.
Acceptance count remains25/54 pending runtime results.


Pre-boot filesystem inspection finds the onboarding AVD already has retained
userdata from an earlier task run; it does not qualify as a fresh profile.
Use brave_tv_launch_followup_api36 instead: its stopped directory still contains
only config.ini. Discover/open it explicitly after affected native tests finish
and the owned clean-TV emulator stops. No AVD or application data is cleared.


Pinned-source optional-service audit (runtime startup still pending): Android's
P3A target selects p3a_service_android_disabled.cc, whose constructor forces
brave.p3a.enabled=false and creates no analytics observer/uploader/storage.
BraveBrowserProcessImpl forces brave.stats.reporting_enabled=false on Android;
the generated brave/browser/brave_stats/buildflags.h confirms
ENABLE_BRAVE_STATS_UPDATER=0, and generated Web Discovery buildflags are0.
AdsServiceFactory returns null on Android; Rewards support is disabled by the
Android feature gate; Leo/VPN availability is false; Android NTP background
images service is null. WelcomeOnboardingActivity sets metrics/P3A consent false,
completes existing first-run/EULA state and hands off through the existing intent.
Compose presentation neither constructs those services nor adds another network
client. These source/build facts supplement prior bounded native histogram and
startup traffic evidence; they do not prove a universal absence of network
traffic. Confirm current fresh-profile booleans/histograms, direct startup and
visible routes before accepting5.7. Updated Home replays are runtime pending.


R58 blocking analysis rejects source40fa after3m38.24s (Siso3m34.70s), with
live cgroup peak15249448960bytes. Production/test packaging completed, but
chrome_java__errorprone reports OperatorPrecedence on the c6f6 control guard's
ungrouped OR condition before its ternary. This is a failed build; no new APK
is installed or accepted. Add the explicitly required parentheses without
changing the condition, retain logs/outputs and repeat the combined cached
build with all blocking checks enabled. Latest40fa/10ae review has0 findings
in both axes. Runtime batch remains pending; count stays25/54.


Consolidated r59 sourcee0e3/root6c747 passes blocking analysis in3m33.60s,
Siso3m29.83s with4 executed steps; unchanged compilation/packaging outputs from
r58 were reused only after the correction passed. Sampled peak15843958784bytes;
live peak15845486592bytes. Signed x64 production852749910bytes,
SHA2564aef9e4031e13db482efb88b8dd33681b878c8d7dcb22dca0f97a2e121922468;
test876332851bytes,SHA256044aeec2e189a2064c4420bdde54169ea3e31609fa968e41cfc80239889d4491.
Artifact/provenance: `~/.cache/brave-tv/artifacts/compose-library-tabs-e0e3f437d-x64-debug-20261011`.
In-place installs match both hashes,13.091s/12.657s,
with profiles preserved and Agent UiAutomation closed before JUnit. The short
History prerequisite and affected library/tab/document cases are running. Latest
e0e3/6c747 reviews have0 findings in both axes. Count stays25/54 pending native
results; physical acceptance remains deferred and unperformed.


The TV-specific BraveActivity native-init return precedes Wallet/Rewards/News/
VPN setup, and its resume return precedes optional badges, update promotions,
subscription messages and Leo-widget handling. Wallet's native factory itself
is not globally disabled; do not describe it as null on Android. TV startup
retains the existing early return instead of initializing that optional path.
BraveToolbarManager also routes the native grid-switcher handler to showTvTabs
on TV. Visible startup/route tests still must show that retained hooks cannot
bring a competing mobile surface into ordinary TV navigation.


Native r26 on sourcee0e3 has5 positive cases and1 failure. Short real-entry
History20.329s and full160 continuation/backward paging/policy/Cancel/confirmed
removal/native Open179.019s pass. Frozen-tab paging/preceding removal/focused
removal/actual renderer restoration/Close to a valid remaining native tab passes
20.754s. Viewport change keeps document but rejects coordinates2.794s, and
same-URL navigation invalidates document2.541s both pass. Private-list r25 and
unchanged native final normal/private/group confirmation evidence carry forward.
Item4.4 now has emulator acceptance; canonical count advances26/54, Stage4:3/8.
No physical acceptance is inferred. Logs/results: native-library-tabs-r26.json.

Bookmark external-update still fails24.811s at nearest survivor6 after policy
re-enable and selected8 deletion. Captured index/effective ID did not fix that
runtime failure. Ranked next predictions: (1) a newly rebuilt dialog briefly
focuses an automatic default before explicit restoration; the failure will show
Parent/Controls focus. (2) native ordering/index differs from the assumed survivor;
native owned IDs/indices will disagree. (3) accessibility focus and application
focus differ; the survivor will be selected internally but absent from native
focused metadata. Add bounded failure-only native metadata to that exact normal
fixture case, not repeated broad setup or timing delays. Compile only the changed
native test target while the same production APK proceeds through independent
fresh startup/scoped clearing. Carry forward the five accepted r26 cases.

The failure-only bookmark diagnostic's pre-build check found a missing native
BookmarkItem import. Source6817 corrects that import before compilation; no new
build or runtime acceptance is claimed. Latest b4f4/168 review: Standards0,
Spec1 (the acknowledged import), with no additional findings. Build only the
affected test APK next, retaining productione0e3 for independent fresh-profile
startup and scoped clearing. Canonical acceptance remains26/54.

Test-only r18 on source6817/root568297 passes blocking analysis in22.17s,
Siso18.35s/14 executed steps; cgroup peak10990518272bytes. Retained signed x64
test APK876331303bytes,SHA2565b1b58e8c12f7f7db2e3dafe5c1fb1796f08908d2bfb9a2365baf6882721fc2e,
artifact compose-bookmark-diagnostic-tests-6817d048d-x64-debug-20261011.
Latest correction reviews: Standards0/Spec0. Production remains sourcee0e3.

The owned clean-TV emulator stopped after its native batch. Explicitly discovered
and opened brave_tv_launch_followup_api36; pre-boot directory had only config.ini,
and com.brave.browser_default was absent after boot. No profile was cleared.
Initial T3 attach during boot failed; discovery after cold boot and retry passed.
The shared daemon reused serial5554 helper-install knowledge from the stopped
AVD; explicitly installing its existing snapshot-helper APK repaired the absent
helper without resetting data or shared services. Productione0e3 installed and
hash matched. Fresh first launch has normal Home/Address, no mobile promotion or
phone experiment card. Home24-step and Bookmarks13-step D-pad replays pass;
stock LatinIME opens, OK types q, Back hides IME, Down/Right/Right reaches Cancel,
and OK restores Home Address. A probe's extra Back then opens Controls as designed;
its Home expectation was incorrect, not a product failure. Home source/license
D-pad routes pass, exact GitHub URL verified, and generated Credits contains
Chromium and AndroidX TV Material and Compose Material Icons Core. The initial
credit probe's package-name assertion was incorrect; bounded native readback
shows the real dependency title. Native Go back restores Home, and an ordinary
relaunch retains Home/Address. P3A, stats reporting and usage metrics are all
stored false in selected fresh Local State boolean readback. Earlier native Home
model/private/Undo/Settings acceptance carries forward. Item4.1 now accepted on
emulator; count27/54. About/histogram/hidden-route audit5.7 remains pending.

Native bookmark diagnostic r27 reproduces the same failure on the fresh test
package in26.400s (JUnit25.559s): focused button is outside the initial narrow
whitelist; native rows7/survivorIndex6/removedExists=false prove expected native
ordering and deletion. Extend only the fixed localized panel-action whitelist
to classify the remaining focused action on failure. No fixture payload/hierarchy
dump or timing delay. Compile only the changed test target; proceed with the
independent production startup/scoped-clear profile. Remove the obsolete root
mobile-toolbar replay after the actual Compose Home routes above passed; retain
the documented ordinary-webpage restart check separately. No4.8 acceptance yet.

Fresh native histogram diagnostics on productione0e3 return no
Brave.Core.CrashReportsEnabled or Brave.Search.DefaultEngine.4 histogram,
matching all three stored reporting booleans false. Source/build optional-service
audit and actual direct launch/relaunch/Home/Settings/routes supplement unchanged
native About/version/attribution/same-tab generated licenses acceptance. The TV
init/resume gates skip optional setup; Wallet's factory is not globally disabled.
No competing onboarding/promotion surfaced. Earlier bounded traffic evidence
carries forward without a universal no-network claim. Item5.7 accepted on
emulator; count28/54, Stage5:2/7. Physical startup remains unperformed.

Test-only r20 on source0d501/roota216 passes blocking analysis45.79s,
Siso42.98s/14 executed steps; cgroup peak9528864768bytes. Unit r19 was an already
retained failed unit, so the attempted duplicate launch did not start a build;
unused r20 was checked and used. Signed x64 test876331199bytes,
SHA2562352e98f60dc3b31ec45df0578aa81e0c67148bcd8bc53a84a6bec4f8ea3b081,
artifact compose-bookmark-diagnostic-tests-0d5019e95-x64-debug-20261011.
Installed hash matches; productione0e3/profile unchanged. Latest source/root
reviews: Standards0/Spec0. Only the failed bookmark method is rerun as r28.

Isolated fresh-profile production clearing uses actual native bridges and
synthetic privacy fixture18082. Native Seed sets cookie tv_privacy=seeded and
localStorage tv-privacy=seeded; cached native Fetch returns Network fetch1.
D-pad saves the page; native Home later shows its exact saved-page title/origin.
Clear Cancel/Right Clear now/Left Cancel/OK13-step replay passes, with stored
data intact. The first route probe used Right instead of Down from Parent folder
to the following Controls row; it stopped before any clear action. Corrected
20-step route passes. Native history-only21-step confirmation/completion/Back/
History route shows No browsing history before any new navigation, retains
storage/bookmark, and a second real fetch keeps network value1 (resource timing
entries1→2 prove the fetch completed). Site-data27-step confirmation/completion/
Settings/Home return passes; saved-page D-pad focus/Open survives and its real
reloaded document reads cookie empty/localStorage null. A new fetch still returns
network value1. Reseeding only this isolated fixture precedes native cache-only
26-step confirmation/completion/Back; next actual fetch returns network value2
while seeded storage/cookie and the saved bookmark remain. Native resource timing
completion is observed with a bounded read-only fixture MutationObserver, without
DOM writes or fake browser input. A host helper syntax error was corrected before
the cache proof. Fixture/header reads and procedure-label mismatches are not
product failures. All destructive replays stop on failed assertions. No profile
reset, physical device operation or broad test repetition occurred.

Remaining5.3 checks: actual provider selection/authoritative address provider and
pending-clear Back/lifecycle completion. Use a narrowly controlled native-JNI
completion callback with real activity/dialog/D-pad ownership to test pending
UI state separately from the actual data deletion above; never count that callback
fixture as native deletion acceptance. Verify bounded exact data type/profile,
no duplicate clear, late completion after Back/pause does not reopen a panel,
and new ownership is not retargeted. Batch with a justified bookmark correction
after r28 identifies its focused action. Keep5.1/5.3 open until those checks pass.

R28 identifies the unexpected native focus as Bookmark this page (26.574s,
JUnit25.690s), while rows7/survivorIndex6/removedExists=false remain correct.
The rebuilt panel's automatic first-button focus is observed before its initial
preferred-row restoration. The next coalesced native change treats that transient
focus as an intentional choice. Fix the shared native panel/presentation seam:
acknowledge successful initial focus restoration, and let bookmark/tab observers
read focused actions only after that acknowledgement. Before it, retain the
already captured exact ID/index/action. No delays, observer suppression, native
model changes or relaxation of context/security guards. The existing red-capable
bookmark external-update case and frozen-tab case exercise affected real callers.
Remove the now-explained failure-only diagnostic when applying the correction;
retain its logs and the original nearest-survivor assertion. Batch these two
affected cases and pending-clear callback tests in one cached build/runtime batch.
Carry forward History, startup, deletion and unchanged document/private positives.

The selected-focus acknowledgement uses the pinned boolean FocusRequester API
with explicit FocusDirection.Enter; preflight javap confirms the no-argument
overload returns void and the directional overload returns boolean. The native
panel owns the acknowledgement callback, resets it on dismissal and disposes
the composition. Three new native activity cases hold only the JNI clear
completion through the existing generated test hook (other JNI methods remain
real): disabled duplicate activation/Back, real Android Home pause/resume, and
same-tab real document replacement. Each asserts the exact normal profile,
single CACHE type, ALL_TIME and empty exclusions, restoring the hook in finally.
The suspected old tab-only completion guard may fail the document replacement
case; capture that red result before changing the callback guard. Build the test
APK only first; productione0e3 remains retained and unchanged. No clearing or
bookmark acceptance is added by this unrun test/correction. Latest root audit
commit ceb5574 review has Standards0/Spec0. Count remains28/54.

Latest510c/22bd review: Spec0 source/root, Standards1 source (DOC-004 callback
contract),0 root. Document UI-thread/initial-frame/success-only invocation and
noninvocation when selection/focus fails or disposal cancels restoration. This
is a documentation correction before the first affected build; no behavior or
acceptance changes. Review the correction before advancing the cached checkout.

Correction5d103/cb3aa1b review has Standards0/Spec0 source/root. Test-onlyr21
stops on declaration-only AndroidX Nullable used in array type position at
TvHomePageTest919. Correct only the declaration placement; keep the same nullable
JNI signature and callback assertions. GNU48.79s/Siso45.03s failure, live cgroup peak
11,570,319,360B (~10.78GiB), no OOM or installation. Reuse completed compilation
steps in the next cached test build. Actual production provider D-pad selection
Google→DuckDuckGo and authoritative native Address description pass on retained
e0e3/fresh AVD; no external search submitted. Count remains28/54.

Annotation correction886a/28532 review Standards0/Spec0 both. Cached testr22
passes Java/ErrorProne but stops at mandatory direct-dependency validation:
PendingClear references BrowsingDataType/TimePeriod from existing
//components/browsing_data/core:java. Add that exact direct target only; no new
package, dependency upgrade or bypass. Siso20.89s failure, cgroup live peak
13,266,628,608B (~12.36GiB), no install. Completed steps remain cached. Provider
Google restoration and native Home return pass; preserve this fresh profile.

Direct dependency correctiond5c429/479d15 review Standards0/Spec0 both.
Cached testr23 succeeds GNU3m45.71s/Siso3m42.17s/61steps, blocking analysis0,
live cgroup peak14,365,241,344B (~13.38GiB),114 samples. Preserved signed TEST
compose-focus-clear-tests-d5c429bf9-x64-debug-20261011/BravePublicTest.apk:
876,325,651B, SHA45591585e10d1a97f091fe89241a30d5387129cd90a057647b0ebbdf9caac4bc.
Profile-preserving fresh-AVD install/hash passes; PRODe0e3 unchanged.
Native r30: bookmark external deletion/nearest6/rename/stale observer PASS30.664s;
frozen16-tab selection/update/removal/real restore PASS22.004s; pending-clear
disabled duplicate/Back/no late reopen PASS15.172s. Pause/resume FAIL15.421s at
Address focus; document replacement FAIL14.167s at regained activity-window focus.
No data deletion is inferred from controlled completion. Native Clear and provider
production positives carry forward; no broad rechecks or reset. Count28 remains
until corrected production acceptance is recorded.

Next correction: the completion callback already rejects a replaced document
through isCurrent; it returns before dismissing the obsolete pending window.
Capture its exact dialog owner and dismiss only that owned window when the
context is invalid; never dismiss or rebuild another current panel. Preserve
native deletion completion and global pending-flag release. Add a positive owned
completion case; rerun changed document case and positive callback, plus bounded
pause diagnostic. For pause, ranked hypotheses: retained Home Settings focus
(valid invoker restoration), a stale pending panel, or absent Home focus. Check
normal native Home identity and static Settings/pending focus booleans at the
existing failing Address assertion before changing resume behavior. Batch this
small correction and diagnostic in the next cached production+test build; carry
forward passed bookmark/tab/Back cases.

Latest0bd137/99f316 review Standards0/Spec0 both. Independent next5.4 fixture
work while its cached full build runs: make existing Shields request fixture
reproducible with a loopback-only fixed-route server for control/ad/cookie scripts,
add exact emulator/forward guards and site-on/off observations to its existing
bounded reload/read-back diagnostic, and replace the obsolete mobile-control replay route.
Acceptance requires actual native D-pad Shields off/on plus request-specific
ERR_BLOCKED_BY_CLIENT/HTTP completion, cookie-list disabled/enabled attribution,
native update status/check/Back and ordinary restart persistence. Keep native
signed validation/update enforcement and existing known backend evidence; no
custom test filters, fake counters or private capture. Written fixture/server
checks alone do not accept5.4. Run only after native callback tests release the
device; do not alter cached browser source during this build.

Latest root4b46250 review Standards0 (bounded ADB concern forwarded), Spec1P2:
URL-only target matching lacks native normal ownership/unique target. Correct
the diagnostic with existing trusted native Controls pattern and exact matching
fixture cardinality, revalidating before CDP reload/read-back. Bound child process
time/output before its watchdog. Retain exact returned agent driver/session;
fail closed on missing/changed normal Controls before any page body read/log.
No runtime5.4 acceptance yet. Initial host server request raced its Nix startup
and returned connection refused; service is active/no OOM, retry only after
loopback readiness. No Nix/cache reset.

Full r60 passes GNU3m39.60s/Siso3m36.08s/33steps, blocking analysis0,
live cgroup peak18,189,475,840B (~16.94GiB),111samples. Signed preserved
compose-clear-recovery-0bd137d9b-x64-debug-20261011 artifacts: production
852,748,802B/SHA3d7f11396b306b07e2369707d744339cf6102dcd7666edcc0b18c704c36108d5,
TEST876,323,667B/SHA8cb216fec0da0f1807789472ca7520b11c0436b5d5c3331d49441f62124185ba.
Both profile-preserving fresh-AVD installs/hash checks pass. Native r31 owned
completion PASS14.237s and replaced-document window release PASS11.463s. Pause
14.704s still fails its Address assertion, but its bounded diagnostic proves
normal native Home, SettingsFocused=true and pendingPanel=false. This is retained
invoker focus, not a reopened panel or lost focus. Correct the test to require
the same captured native Home and Settings focus; remove the failure diagnostic.
No production resume changes. Rebuild only TEST and rerun only pause; carry
forward the two owned-completion positives and previous bookmark/tab/Back passes.

The owned Shields fixture Nix startup was throttled by its initial128MiB high
limit (ps wchan mem_cgroup_handle_over_high,168MiB current), not a server or
Chromium failure. Raise only this fixture service to512MiB high/1GiB max; retain
its process/cache and four-worker18/22GiB browser build limits unchanged.

Stage5.1 emulator acceptance: native bookmark paging/Open/conservative Cancel/
remove/policy passes carried fromr24; external native deletion/nearest-surviving
ID/index6/rename/disposed observer now passesr30 on actual GN TESTd5c429. Native
160-history paging/Open/remove/policy and actual production history-only clearing
with saved bookmark/cookie/storage/cache survival already pass. Full production
0bd137 includes the exact accepted focus correction and passes build/install.
Canonical5.1 accepted; count advances29/54, with hardware pending.

Latest-only review correction before TEST r24: source66 has one Spec P2:
Settings also exists inside Clear data, so focused Settings and same underlying
Home alone cannot prove the pending dialog stayed dismissed. Require native
activity-window focus after resume and absence of the Clear cache chooser,
retaining same Home and Settings invoker assertions. No production change.
Acceptance: cached TEST-only build with blocking analysis, then only the pending
pause/resume native case; carry forward all unchanged passed cases. Roota4 has
one Standards P3: its current canonical summary repeats historical red library
results despite accepted5.1. Replace that chronology with current evidence;
historical failures remain in this engineering log. Root Spec has no findings.

Latest correction review: source50f6ceb9d and roote2bba222 each pass Standards0 /
Spec0. TEST-only r24 passes GNU23.10s/Siso19.59s/14steps, blocking analysis0,
live cgroup peak10,776,698,880B (~10.04GiB),13samples. Preserved signed TEST
compose-clear-pause-tests-50f6ceb9d-x64-debug-20261011/BravePublicTest.apk:
876,323,839B, SHAd7981582e06dbdc0837a77e907d23d4864aa7393b3a29edf408574ade3c59ecd.
Profile-preserving verified install11.712s. Native r32 only pending pause/resume
PASS12.349s: same captured native Home, activity-window focus, Settings invoker,
no pending Clear cache chooser and no stale completion panel. Production remains
accepted0bd137/r60; source50 changes only TEST assertions. Carry forward actual
native scoped deletion, provider restoration, Back and both owned callback cases.
Canonical5.3 accepted; count30/54. Proceed with planned5.4 actual native Shields/
filter enforcement and signed-update controls; no repeated unaffected suites.

Latest root acceptance review: Standards1 / Spec1, both P3, find the top Stage5 subtotal
still3/7 after5.3 acceptance. Correct it to4/7 and remove the stale general
library-pending summary. Total30/54 and the scoped runtime evidence remain valid.

Shields5.4 runtime r1 on production0bd137: controlled site-on blocks both ad and
cookie-list resources with ERR_BLOCKED_BY_CLIENT; native D-pad site-off loads both
and the control script, with exactly one fresh request each. Host four-route
fixture GET/HEAD/type/404/405 checks pass. Reopening Site protection restores
working native actions and allows original Aggressive mode restoration. Changing
a setting within its reload-created panel leaves later actions inert: the panel
captures a lease before navigation finishes, which the session correctly rejects
as stale. Input/focus failure and native preference failure are ruled out by the
same D-pad action succeeding after Back/reentry; the reload lease is the cause.

Before the source correction: retain strict native document revalidation, then
return through existing compact Controls after applying/reloading either Shields
setting. Controls already refresh against authoritative browser state. Reentry
captures the new page; do not immediately recreate a stale settings panel or add
an asynchronous reload retargeting framework. Acceptance: a D-pad Standard→
Controls→reentry→Aggressive→Controls sequence plus actual site-on/off resources,
optional cookie-list isolation, native update-status navigation and ordinary
persistence. Consolidate one cached production build; TEST code is unchanged.
The standard replay's obsolete Reload label is corrected to Reload page. The
prior subtotal review is accurately recorded as Standards1 / Spec1 P3.

The revised D-pad standard replay reproduces the old recovery failure at the
post-change compact Controls focus assertion: Standard is applied but the stale
Site protection panel remains. Prior stale-panel Aggressive activation likewise
leaves Standard selected; Back/reentry makes the same native action succeed.
Change both setting paths to the existing returnToControls after native reload,
with all original strict context/private/lifecycle guards retained. No changes
to filtering rules, storage, session identity, engine navigation or phone guards.

Shields recovery outcome: source3914063 and root8af3db3 pass Standards0 / Spec0.
Full cached r61 passes GNU3m39.75s/Siso3m36.29s/26steps, blocking analysis0,
live cgroup peak15,069,515,776B (~14.04GiB),111samples. Signed preserved artifact
compose-shields-recovery-3914063cd-x64-debug-20261011: production852,748,802B /
SHA1ef6959472356c004f62015ec28e914fccc91cb3038913519962b6db9932d172;
TEST876,323,839B / SHA18cefa5f472212d97f2c80eb7e4c5372b035ba569f98804f9208c0ea0a063946.
Profile-preserving installed hashes pass11.790s /12.110s. Revised D-pad standard
regression passes34steps2.6s on production: Standard→Controls→reentry→Aggressive→
Controls. Native site-off/on returns compact More focus and actual ad/cookie
resources respectively complete/block with one fresh request each; control loads.

Optional cookie list Off loads only its own fixture while ads remain blocked;
restored On blocks both. Native filter-toggle replay11steps1.3s and update check/
Back replay18steps2.6s pass on unchanged native filter code. Actual manual status
is latest signed snapshot, published Oct10, last attempt Oct11. After background
and a profile-preserving production force-stop/relaunch, distinct nonempty PIDs
are verified, fixture enforcement passes without diagnostic reload, native
Shields On/Aggressive disabled-selection/Cookie On persist, active signed snapshot
and exact last-attempt time survive. The transient CURRENT result resets to the
truthful automatic-check description after process restart; an initial assertion
expecting CURRENT persistence was wrong, not a product failure. Corrected bounded
native assertions pass in shields-persistence-r2.json. No profile reset, filter
rule change or physical test. Seventeen prior native signed-validation tests
carry forward unchanged. Canonical5.4 accepted; count31/54, Stage5 subtotal5/7.

Next5.5 slice: controlled loopback permission and HTTP-auth fixtures on the same
verified TV AVD, native D-pad/OK request and denial/Cancel, accurate native origin,
IME dismissal/Back and return to usable content/controls. Use existing trusted
Chrome/OS prompt ownership; do not imitate approval or bypass certificate checks.
Keep fixture credentials synthetic and unlogged. Add an actual invalid-certificate
Back-to-safety check using existing native test-server support; preserve engine
security decisions. Implement production changes only if these paths expose a
real native focus/recovery bug. Carry forward accepted Page info/native modal and
phone security guards; hardware/real-phone checks remain pending.

Native security fixture progress: loopback18084 GET/HEAD permission and native
Basic-auth routes, unknown404 and method405 checks pass. Actual production
permission request remains unaccepted: activating Page cursor then D-pad/OK
leaves the normal controlled page at "No request yet". No permission approval,
profile wipe or physical operation occurred.

Next focused3.3/5.5 slice: add a real-engine regression with a viewport-sized
button and actual SOURCE_DPAD events from Android's alphabetic virtual keyboard.
Require a single native pointer click (DOM click detail1) despite held OK repeats,
with actual activity/content focus, settled hidden native toolbar and loaded
document. Ranked hypotheses: alphabetic-device classification rejects dedicated
D-pad input; native focus/IME guard retains ownership; document/viewport identity
invalidates the press. Run the new test against unchanged production first,
then fix only the proven boundary. Keep ordinary keyboard, modifiers, IME,
native security ownership and strict document identity guards. Acceptance is
the real regression and original permission request/recovery, not compilation.

Latest f68/b2ff reviews: Standards0/Spec0 in each repository. Test buildr25
fails before APK generation: renderer readback throws a checked TimeoutException
and the new native test omitted its throws declaration. Add the declaration
matching existing native renderer tests; no production or assertion change.
Cgroup peak9071259648bytes, no OOM. Retain the failed log/output cache, rebuild
only the affected test target with blocking analysis, then run the real red case.
Host security-r2 HTTP route/method and TLS rejection checks pass; native Basic
auth shows the exact loopback origin, Back dismisses stock IME and two Down
presses reach Cancel. Cancellation/permission/certificate acceptance is pending.

Correction915/d976 latest reviews: Standards0/Spec0 each. Test buildr26 succeeds
with blocking analysis (Siso19.24s/14 steps), sampled cgroup peak9515479040bytes.
Preserved compose-dpad-red-tests-915d732bd-x64-debug-20261011 TEST APK876337391bytes,
SHA2564a227817c47fb2f97f130b173ddadcf07f436b2eadccf8720074c1f1ba7e3427,
verified profile-preserving install12.350s. Native dedicatedDpad regressionr33
FAIL11.333s at exact pointer-click assertion after loaded-document, settled
toolbar, activity/content focus and alphabetic-device assertions all pass.
This reproduces the dedicated D-pad rejection without weakening input guards.

Certificate fixture actual production warning shows127.0.0.1 and native
NET::ERR_CERT_AUTHORITY_INVALID; protected document never opens. Native Back
currently opens Compose controls over that same warning rather than dispatching
to Chromium's trusted Back handler. Add a second real-engine native regression
using the documented host TLS fixture: start on a known normal document, assert
native dangerous state, press Back and require the original normal document.
Run red against unchanged security ownership, then share one production build
for the minimal source-classification and native-dangerous-owner fixes. Native
auth Cancel recovered to its fixture page using Back/Down/Down/OK; no credentials,
trust changes, certificate bypass or physical actions.5.5 remains pending.

Latest a0bd/8304 reviews: Standards0/Spec0 each. Mandatory dependency validation
stops test buildr27: the new native dangerous-state assertion requires direct
//components/security_state/content/android:java. Add that existing pinned
target to the test APK dependencies; no dependency download/version change,
production behavior or assertion weakening. Cgroup peak7938707456bytes; no OOM.
Retain failed logs and rebuild only the affected test target before the red run.

Latest a60d/3add reviews: Standards0/Spec0 each. Test buildr28 succeeds with
blocking analysis (Siso36.19s/22 steps), sampled peak9908092928bytes. Preserved
compose-certificate-red-tests-a60d2254a-x64-debug-20261011 TEST876352327bytes,
SHA25686c1b49e10c94c4b5eb9c5461004601b35f753cb118ae14c96f16c62fa84e505,
verified profile-preserving install11.847s. Native certificate regressionr34
FAIL11.360s after native dangerous-state/origin/window-focus preconditions pass,
specifically at same-tab safe-document recovery after Back (line461). This
matches the production warning covered by our controls rather than native Back.

Implement the two proven boundaries in TvBrowserControls: let dedicated
SOURCE_DPAD events through the alphabetic-device check while ordinary keyboard,
modifiers, IME and security checks remain; classify Chromium's native dangerous
content as trusted native input ownership. The shared owner check must pause
phone commands and dispatch Back natively without changing certificate decisions.
Revalidate both exact red cases and the original permission/auth/certificate
fixtures using one cached full build with blocking analysis. No bypass, trust
change, private unlock or loosened document/viewport validation.

Latest a245/208 reviews: Standards0/Spec0 each. Cached full buildr62 succeeds
with blocking Android analysis, GNU3m37.69s/Siso3m34.06s/26 steps, sampled cgroup
peak16417918976bytes (110 samples), no OOM. Preserved
compose-native-security-a2451649b-x64-debug-20261011: PROD852748554bytes,
SHA2560b8e2527d233366c6099f7e457499b3188b9d1d43cf39d06f09c7a01b99a8c4f;
TEST876352079bytes,
SHA25691bd6a9ea21f3907cb197e5b179a929ed027974ed9f4be7c3d8fb9fd7a2e60c2.
Verified profile-preserving installs12.342/11.722s. Native certificate Back
regressionr35 PASS6.928s. DedicatedDpad case FAIL9.517s, now earlier at activity/
content focus after activating Page cursor (line412); focused rerunr36
FAIL8.717s at the same precondition. Click correction remains unaccepted.

Actual PROD permission fixture reaches Chromium's genuine location dialog via
explicit SOURCE_DPAD input on verified emulator5554. Origin is exactly
http://127.0.0.1:18084. Left reaches Block; D-pad/OK Block returns to the
controlled page reporting Location denied. No allow, OS trust change, data reset
or physical action. The first Page cursor selection retained controls; a second
selection entered content, so do not hide the activation defect with retries.
Next focused test-only diagnostics distinguish controls still showing from
closed controls with missing activity/content focus. Assert each ownership
condition with a precise message, preserve the final pointer-click assertion,
then use the existing native lifecycle synchronization for the proven cause.
Only the failed case needs rerunning; certificate recovery carries forward.
Count remains31/54;5.5 and3.3 pending until their full emulator scope passes.

Focused diagnostic outcome: TEST-only r29 passes blocking analysis in23.07s
(Siso19.47s/14 steps), sampled cgroup peak10,941,816,832bytes. Preserved TEST
compose-dpad-focus-tests-ed87788b7-x64-debug-20261011:876,351,499bytes,
SHA2569996d9814fe4da44bb02219084fc31d0984a2e03fff77c81a3b7f47d5ed4ece4;
verified profile-preserving install11.939s. Native isolated r37/r38/r39 all PASS
10.399/10.415/10.043s, with controls absent, activity/content focus and actual
held-OK pointer click detail1/count1. This does not explain the earlier first
selection retry during production page loading; retain that observation rather
than infer a production focus fix from diagnostic synchronization. Actual r62
HTTP-auth Cancel also passes native Back/Down/Down/OK to Authentication canceled.

Next input slice extends that same real-engine regression with normal-fixture
cursor pixels, alphabetic keyboard/modifier exclusion, idle-hide completion,
held wake without clicking, and the subsequent single click at the real content
center. Observe native screen pixels only after checking exact normal fixture
ownership, window focus and nonsecure flags; retain no screenshot artifact and
never clear secure flags. Wait for actual hide visibility, not a timing delay.
Acceptance: cached TEST-only blocking-analysis build and the affected native
case; existing native phone touch/wheel/viewport and certificate checks carry
forward. Do not accept3.3 until input coverage and first-selection behavior are
accounted for; no new dependency or production timing retry.

Latest3915/b123 reviews Standards0/Spec0 each. TEST-only r30 passes blocking
analysis (Siso17.50s/14 steps), sampled cgroup peak9,382,309,888bytes. Preserved
compose-idle-input-tests-3915f2c09-x64-debug-20261011 TEST876,346,507bytes,
SHA2564414cac7528913123bf83ee2ee75458a00bdf535c6d5196c4cde736f79c28b33;
verified profile-preserving install11.498s. Native r40 PASS11.822s: held count1/
detail1, actual cursor white-center then hidden background, ordinary alphabetic
keyboard/modifier exclusion, held wake still count1, next native pointer click
count2/detail1 at the actual content center. No saved/private screenshot.

Next4.3 vertical slice: display native connection security and per-site Shields
state beneath the URL in compact controls, using Chromium's security levels,
existing translated status labels and native Shields preference. Observe native
SSL changes through the existing session observer; keep browser models and
security decisions authoritative. Extend the fixed loopback host security
fixture with one bounded slow document for actual Stop. Native D-pad acceptance
must prove same-tab Back/Forward, reload callback, loading Stop, actual HTTP
connection/protection labels and continued focus; presentation updates retain
their keyed target. Build both APKs once with cache/blocking analysis. Carry
forward pointer, permission, certificate, privacy and signed-filter checks.
Do not mark4.3 or3.3 passed from compilation, host HTTP or presentation-only tests.

Latest64b163/5ec2ee reviews Standards0/Spec0 each. Full cached r63 passes blocking
analysis inGNU8m00.06s/Siso7m57.00s/1087 executed steps. The translated status
resource invalidated resource-dependent Java work; no output/cache reset.
Sampled cgroup peak14,819,012,608bytes (241 samples), no OOM. Preserved signed
compose-controls-64b163b6b-x64-debug-20261011:
PROD852,747,121bytes/SHA256fe1249134c586d17e42aaba3d2a88d5ba11e1e6ca73f29a1a1479597fddfc8bf;
TEST876,367,866bytes/SHA256fbbd90d864581a1277c26237461e35014c8b66b0627a7cd2487fb9b1c6ff18ac.
Verified profile-preserving installs58.579/10.910s. Native r41 navigation/site
state PASS15.688s and narrow updated-controls focus/Back PASS7.288s. The former
proves disabled Forward, same native tab through Back/Forward, actual reload
callback, native protection changes/restoration with retained Address focus,
and actual Stop releasing the controlled loading page. Host route/slow-slot/
abort cleanup checks pass after fixture readiness; immediate startup raced Nix
and returned connection refused, not native acceptance or a server defect.

Production r63 displays the exact normal loopback origin plus Chromium's
insecure-connection label and Site protection on. D-pad Right/OK once enters
the settled native permission fixture with webpage focus and no controls left.
Initial body wait was covered by startup controls; Back exposed the page.
This is distinct from claiming the earlier loading/first-selection retry fixed.
A bounded normal-only JDWP probe disconnected without reliable lease evidence;
the temporary9224 forward is removed, no profile/trust/shared ADB changes.
Canonical4.3 accepted; count32/54, Stage4:5/8. Keep3.3 pending for the unresolved
entry observation, despite its native held/idle/keyboard/coordinate positives.
Certificate/permission/auth and unaffected phone/filter/privacy checks carry.

Next consolidated phone slice: use one verified phone AVD with the current TV
APK on the simulated private network. Record fresh TV network/debug-switch
settings before temporarily enabling the existing development experiment;
preserve both profiles and use exact emulator identities. Harden QR test
capture/approval preconditions so it cannot capture a private page or approve
an unrelated native security dialog. Reproduce the stock-IME equal-text
composition failure with bounded event/lease diagnostics, then fix only a
proven cause. Pairing, fullscreen/background recovery and native-security
rejections share this session; unchanged library/settings/filter tests carry
forward. Acceptance requires actual Chromium input and suppressed sensitive
metadata, no unlock side effects, no automatic native approval, and honest
separation of host fixtures, simulated LAN and unverified real phones/hardware.
Latest documentation correction41a08f4 reviews Standards0/Spec0; no rebuild.

Phone setup observation: a3GiB emulator soft limit caused shell timeouts and
38% memory-pressure stalls without OOM. Raising only the owned phone service to
MemoryHigh5GiB/Max6GiB made the same boot/IME checks respond immediately; build
limits remain18/22GiB. The fresh TV settings are preserved in the private
fresh-phone-network-before-r1.json; profiles are retained. TV10.0.2.16 and
phone10.0.2.18 use shared virtual Wi-Fi, with no remote-traffic ADB forwarding.
QR r7 passes actual screenshot decoding, TV-only assets, fragment removal and
hidden manual-code form during pending approval. Visible native Approve phone
is focused and confirmed by D-pad/OK, returning to the normal fixture. The QR
probe requires exact AVDs, native QR visibility and no secure window, creates a
private new screenshot and never injects blind approval. Negative wrong-AVD
and missing-QR gates are checked before capture. Initial platform record read
timed out before changes; a shell-quoting error in command-line setup was
corrected with an explicit emulator push. No shared service restart or wipe.
Count remains32/54; complete composition/security/recovery acceptance pending.

Latest QR review correction: bind the phone CDP endpoint to the verified phone
serial by checking its exact ADB forward before any capture/navigation. Catch
private snapshot/capture/decode subprocess failures and emit a fixed message
without captured pairing credentials. Acceptance: missing-forward rejection
and a secret-bearing subprocess failure produce no capture or credential log;
fresh actual QR pairing still passes. Source APK is unchanged; no rebuild.

Correction evidence: missing phone-forward rejection and secret-bearing failed
subprocess checks PASS, with no screenshot or credential output. Use raw JSON
native nodes to prove the visible QR ImageView belongs beneath Compose; compact
snapshot containers/heading visibility can differ after focus scrolling. Malformed
secret-bearing JSON and a webpage QR-label spoof are rejected before capture.
Actual fresh QR r11 passes over direct shared virtual Wi-Fi, with separate
visible native Approve phone confirmed by D-pad/OK. Earlier r8–r10 preconditions
rejected capture while the textual/raw snapshot guard was being corrected; no
screenshots or pairing acceptance are claimed for those attempts. Count32/54.

Minimized stock-TV-IME probe r68 reproduces the earlier r66 failure in5s with
event counts only: compositionstart/end both advance1→2 during the composing
replacement, before the later finish. That later equal-text replacement advances
native input2→3 and remains ready with unchanged field revision8. A new end
event is not expected after the keyboard has already ended composition. Do not
infer a native text failure from that assertion or weaken identity/acknowledgement
checks. Keep full strict composition/selection/replacement-version coverage on
the quiet-IME fixture distinct from stock-keyboard behavior; verify actual phone
composition and security before accepting3.5.

QR parser review correction: sanitize malformed successful decoder output as
well as subprocess failures. Validate the whole native invitation shape inside
the opaque parse boundary. Consolidate wrong-device/forward, private output,
native-ancestry and secure-window rejection checks in a host CLI fixture using
synthetic subprocesses, so those checks need no repeated emulator pairing.
Acceptance: malformed invitation markers never reach stdout/stderr; valid
native QR r11 evidence carries forward for the unchanged device path. Host
guard tests remain distinct from runtime pairing acceptance.

Consolidated host QR guards PASS7/7. The same harness against exact parent
df531d9 is RED at the successful-decoder/malformed-invitation boundary, proving
the logging regression is caught. The corrected whole-invitation parser keeps
that synthetic marker out of both output streams. The unchanged native capture,
bundled assets and separate D-pad approval retain actual r11 acceptance.

### Stage4.7: native connection badge and bounded pause guidance

Latest root14b9839 reviews: Standards0/Spec0. Implement a readable Compose
connection badge with explicit disposal, retaining native pairing, approval and
Disconnect ownership. Replace the generic companion pause message with two
bounded reasons: browser controls, or a screen requiring TV input. Private and
native-security screens share the latter; expose no page/tab/editable metadata
and perform no unlock checks. Keep all command revalidation unchanged.

Acceptance: bundled companion tests exercise both messages, redaction, disabled
actions and recovery; native badge integration preserves focus and disposes on
disconnect. One cached x64 build with blocking analysis, followed by affected
actual pairing/controls/private/native-security and fullscreen checks. Stop only
the owned phone emulator during compilation to keep host memory available.
Unchanged passing library/settings/filter checks carry forward. This slice does
not accept hardware, real phone IME or the remaining composition assertion.

Source1703db290 is committed/pushed. Bundled companion host regression passes,
including both finite pause messages, unknown-reason fallback, cleared fields,
disabled navigation, reachable Disconnect and restoration of unchanged tab
rows. Actual APK badge/pause/security acceptance remains pending build/runtime;
count stays32/54. Native badge focus/click/disposal case is added, not yet run.

Latest source1703 review: Standards1 (missing factory lifecycle/thread/disposal
contract), Spec1 (native security ownership must precede controls guidance).
Root18383 reviews Standards0/Spec0. Correct both before the combined build:
share the existing critical native guard and require the controls dialog itself
to own window focus before reporting controls. Runtime negative probes can
require the expected finite reason as well as exact metadata redaction.

Native r64: combined build passes blocking analysis in4m19.71s/193 executed
steps, cgroup peak16160714752bytes (15.05GiB),133 samples, no OOM. Production
and TEST artifacts are preserved with verified x64/package/cert hashes at
`~/.cache/brave-tv/artifacts/compose-phone-335d77f8f-x64-debug-20261011`;
in-place installs retain profiles and match hashes. Isolated certificate Back
passes7.305s. Badge test fails before creation because its current-tab read is
off the UI thread; move that read to ThreadUtils and rebuild only TEST. Actual
badge acceptance stays pending; preserve the failing log and production APK.

### Stock-TV-IME probe correction (test scope only)

Keep the existing complete strict native-input probe unchanged. Add a focused
stock-TV-IME smoke probe for the observed r68 case: require native input
acknowledgement for equal whole-field replacements, and composition end only
when composition was still active before finishing. Require the final native
composition to be ended; retain stable field identity and twenty repeated
Unicode replacements. This mode does not substitute for the full strict lease,
phone InputConnection, selection/deletion or password/security suite. Acceptance
requires actual stock TV IME runtime; no production workaround or fake event.

Latest585c3 source correction reviews Standards0/Spec0. Rootb88b725 reviews
Standards0/Spec2: bind phone9223 to an explicit verified emulator and reject
ambiguous/background fixture targets before reading native input. Correct the
probe to require both AVD/forward identities and one exact fixture URL matching
the authenticated unpaused normal state. Assertion messages contain no values.
The production APK remains335d; a TEST-only rebuild will validate badge focus.

Rootb218 correction reviews Standards0/Spec0. TEST-only r31 passes blocking
analysis in19.52s/14 executed steps; sampled cgroup peak10301894656bytes. Preserve
only its verified TEST APK at
`~/.cache/brave-tv/artifacts/compose-phone-badge-tests-585c3c20e-x64-debug-20261011`;
SHA2566aefabc7a103bb5b02859e280284e0c0595e4be985033a3a20edeca6ff24425d.
Production remains the installed r64/335d APK. Isolated native badge r43 passes
6.663s, proving page focus retention, one activation and removal after disposal.
Phone restart r2 lacked SDK environment; r3 used the TV-only image root. R4
uses the retained phone image at `/home/nitesh/Android/Sdk`, preserves the profile
and boots normally. No shared service restart, image change or cache deletion.

Production QR r12 passes direct simulated-LAN pairing, TV-only assets, fragment
removal, pending/hidden manual form and separate focused D-pad approval. Native
snapshot shows the connection badge while the fixture WebView retains focus.
Stock-TV-IME r69 passes20 Unicode replacements and equal-text native input/
composition acknowledgement with stable field identity. Observe the genuine
stock keyboard viewport resize before editing, matching the prior r66 positive
precondition. Default full strict probe stays unchanged; no text-bridge workaround.
Count32/54: actual private/security pauses, fullscreen and recovery remain open.

### Stage4.7 paused guidance after phone editing

Production controls pauses r70/r71 reject all four authenticated actions with
exact metadata redaction and expected controls reason. A bounded real-phone-
emulator geometry probe finds the correct status at top-316.86/bottom-274.86
after editing, outside the811px viewport despite cleared fields. Add a host
regression that scrolls the editor before pause, then requires visible guidance.
On transition into paused state, scroll the existing status into view once;
do not move it again on polling or change native security/command ownership.
Acceptance: host red/green, then actual phone-emulator editing→pause geometry,
resume/Disconnect usability on the packaged APK. No aesthetic or hardware gate.

Host regression is RED at the one-second status-visibility predicate on335d,
then GREEN after source6d12c8529's one transition-only scroll. Native production
controls r70/r71, certificate r72 and HTTP-auth r73 each reject four authenticated
actions with exact redacted state and the expected generic reason. Certificate
warning is `NET::ERR_CERT_AUTHORITY_INVALID` on the unmodified production trust
store; it does not prove an expiry-specific warning. D-pad Back returns to the
original fixture and cancels authentication without entering credentials. Actual
packaged visibility, permission/private/fullscreen/recovery remain pending.

Latest source6d12/rootf231 reviews: Standards0/Spec0 in both repositories.
Production permission r74 rejects four authenticated phone commands with exact
redaction and generic TV guidance; native Block is initially focused and D-pad
OK returns to Location denied. The private chooser r75 still has the normal tab
selected, so its controls reason is not private acceptance. Creating a synthetic
private tab gives r76's four rejected commands, exact redaction and generic TV
guidance. D-pad navigation returns to a normal tab; no phone unlock, private
DOM read or screenshot. Fullscreen r77 starts while controls own input; r78 then
fails playback because this AVD lacks the documented18083 media reverse. Restore
only that owned test reverse: r79 passes actual playback, phone input/Back,
same-document exit and visible native cursor pixels. No application media fix.

Reconnect probe correction (test only): r80 fails its positive-control move
before network loss. Bounded diagnostics show cursor1700/900, target321/425,
delta-1379/-475: the existing native1000-unit limit correctly rejects it. Move
to the same target in bounded steps, retaining command/revision validation and
the real click-counter positive control. Acceptance: actual same-epoch network
recovery without replay, then background listener revocation with the browser
process retained. Do not enlarge native command bounds or rerun unrelated checks.

Reconnect r81 passes: offline action is discarded, the same epoch reconnects
in458ms, and two subsequent state responses show no replayed click. Background
r82 passes: direct simulated-LAN listener200 positive control, actual Home
departure, connection refusal and the same native browser PID. Syntax/diff
checks pass. Consolidate these positives; the next cached combined build only
packages source6d's pause-visibility fix and the already accepted TEST correction.
Stop only the owned phone AVD before building; preserve profiles and all caches.

Item5.5 emulator acceptance: carry native Page info full-origin/return, native
auth cancellation and isolated certificate Back r42, and add the production
permission denial/phone rejection r74 plus certificate/auth negatives r72/r73.
Trusted native owners remain authoritative; no Allow, OS grant, trust override
or phone approval. Authority-invalid production evidence remains separate from
the TEST certificate fixture. Canonical count33/54, Stage5:6/7;5.6 exceptional
recovery, phone packaging and hardware gates remain pending. This evidence-only
acceptance does not change the source or the currently running r65 build.

Stage3.5 final consolidated native-input acceptance: after packaged pause
visibility, run the unchanged complete phone-native probe once on source6d,
using the existing quiet TV IME fixture and genuine phone InputConnection IME.
Preserve stock TV IME acceptance r69 separately and restore the TV's stock IME
after this test. Require composition/replacement versions, selection/deletion,
stale document/field/viewport rejection and sensitive-field refusal; combine
with the current private/native-security rejection results. No fake DOM input,
new native command, unlock or repeated broad library/settings suite.

Strict probe r85 stops before its first replacement: the prior visibility test
left the phone editor open, and its unconditional Show keyboard toggle closes
that editor. Preserve all strict native assertions; only open the editor when
it is hidden. This shared-session precondition correction needs no APK rebuild.

R86/r88 stop at the first editable-state acknowledgement after re-tapping an
already-focused field; authenticated state becomes generic native pause. R87
is interrupted after the alternate cached IME install is rejected for a different
fixture signing key; replace only that just-installed task fixture, retaining
Brave profiles. The modern TV fixture then installs/enables normally. Native
Back twice returns to the exact normal fixture. A minimized genuine phone
replacement passes without re-tapping that already-focused native field. Keep
the strict probe bound to the authenticated exact normal fixture, and reuse
its existing field focus when ready; genuine native field switching and all
composition/version/selection/deletion/password assertions remain mandatory.
No application guard change or native focus injection is justified by this case.

Cached combined r65 passes blocking analysis in1m39.90s/61 executed steps;
53 cgroup samples record peak14200107008bytes (13.22GiB), no OOM. Preserved
verified artifacts at
`~/.cache/brave-tv/artifacts/compose-phone-6d12c8529-x64-debug-20261011`:
production852743294bytes/SHA256f0f5d13a22cc72289ce6c865b06c54a7cbae58507a08ae66571d058d2fcc9ea0,
TEST876360027bytes/SHA25650e91062a6b2bf43bad6f44e2de52f62706d9c275e0344b26723238233dfbb66.
Provenance pins source6d and root719 at build start. In-place installs match
hashes in13.421/13.841s, retaining profiles. Only the owned phone AVD stopped
during build and restarted with its retained image/profile and explicit SDK.

Fresh packaged QR r13 passes direct simulated-LAN/native approval. Pause r83
passes actual visibility/redaction/Disconnect, then stops at an incorrect tab
row locator; r84 uses the real `.tab` rows and passes same-ID resume. Strict
native-input r89 passes the complete existing assertions, including genuine
phone Japanese composition, replacement/selection/deletion/contenteditable,
stale-field rejection and password exclusion. Stock TV IME is restored afterward.
Real phone Disconnect clears credentials/disables controls/removes the TV badge;
native D-pad returns to Home/Address. Fresh pending QR r14 is separately rejected
by D-pad Back; the actual companion clears token/epoch/connection and restores
fresh-invitation guidance with no waiting form. No blind approval, profile wipe,
secret log or physical operation. Item3.5 and4.7 emulator scope accepted;
canonical35/54, Stage3:4/5, Stage4:6/8. Actual manual/expiry, fullscreen switching,
exceptional recovery, migration/retirement and final V checks remain open.

Consolidated fullscreen recovery r97 passes on installed production source6d.
Actual media/fullscreen survives normal tab switching with the original
document retained; D-pad Back exits restored fullscreen. Direct simulated-LAN
listener200→foreground departure→connection refusal passes through the existing
background probe. Phone controls are disabled with state cleared; its in-memory
epoch is retained for network recovery, not accepted by the stopped listener.
Native foreground/Back returns to the same document with full1920×1080 viewport
and cursor pixels at actual D-pad160/160. The browser PID survives. Only the
known newly-created normal fixture tab is removed. Stock TV IME remains selected;
no screenshot file, private read, profile wipe, physical operation or APK rebuild.

Earlier r90/r91 hit unsettled revisions around fullscreen/new Home; use the
existing two-response viewport synchronization before context-sensitive commands,
without retrying rejected commands. R92 stops before DOM on duplicate exact
targets; scope this fixture URL and retain that guard. R93 expected automatic
fullscreen exit after switching, but the engine restores video fullscreen;
native Back exits safely without replacing the document. R94 protects the
unremoved fixture tab. R95's credential-clear expectation was wrong for approved
network loss; prove native listener revocation and disabled/cleared phone state.
R96's synchronous netcat closes stdin too early for its positive control;
reuse the established bounded background probe instead. These failures do not
establish application defects or waive security. Earlier media/IME/cursor checks
carry. Item4.6 emulator scope accepted; canonical36/54, Stage4:7/8. Other native
exceptions, first-selection input, retirement/migration and final V remain open.

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
The bounded reader compiles against the retained pinned JDK/native jars. Five
actual host checks pass: counts-only private header, overlong body rejection,
invalid counts, and private rejection for both active/normal-ids modes. The
upgrade checker retains its original strict private rejection. No private
payload is decoded by the counts diagnostic; no APK code changes in this slice.


## Ambient home and browser menu with first class Phone

The user selected Ambient from the three design options and requested an
implementation and engineering plan. Phone becomes a normal top-level Home
control for connect/disconnect, replacing local-build and experimental-switch
gating. The canonical scope, five implementation slices and acceptance gates
are in [ambient-implementation-plan.md](ambient-implementation-plan.md).

Keep Chromium/native data and input ownership. Build native Ambient Home and
a right-side controls drawer, expose sanitized phone session state with stable
focus/lifecycle behavior, then promote pairing and verify on an unflagged
optimized TV artifact. Existing HTTP transport remains truthfully disclosed;
the independent HTTPS research is not silently included in this UI work.

Planning is complete. Native implementation, APK builds and emulator acceptance
are recorded below; physical-device acceptance is separate.


### Ambient implementation started

13 October: implement the approved Ambient Home and root controls in native
Compose, add stable Home Phone state/focus restoration, remove experimental
availability gates and retain explicit local HTTP disclosure. Use a fresh
isolated TV AVD after the authorized emulator cleanup, retained build caches,
and blocking Android analysis. Preserve normal/private data and native owners.
The five implementation slices and acceptance criteria remain in
[ambient-implementation-plan.md](ambient-implementation-plan.md).


### Ambient implementation outcome

Source `8aab2fb28` completes the five approved implementation slices: native
Ambient Home, a grouped right drawer with all 17 browser actions, lifecycle-safe
Home Phone status/focus, unflagged pairing with explicit local HTTP disclosure,
and focused emulator/build verification. The final source also fixes Search
Down selecting a middle shortcut and restored Home missing controller startup.
The finish review's row-height correction uses each native row's tallest label.

Twenty project checks, strict mypy, Nix flake checks and eight native
instrumentation regressions pass. D-pad action coverage and real native Phone
approval/cancel/Back/disconnect are verified at 1080p, with 1.3 text-scale
captures. Debug x64 and optimized non-debuggable ARM development APKs build
with blocking analysis; signatures, revision pins and hashes are preserved.
See [implementation evidence](ambient-implementation-evidence.md) for the
review, design record, screenshots, exact artifacts and acceptance limits. No
Chromecast installation or real-phone acceptance is claimed for this revision.

### Streaming starter favorites

The user requests YouTube, Netflix, Prime Video and Twitch, using official logos;
Disney+ is explicitly excluded. Seed ordinary bookmarks once on eligible normal
TV Home after native bookmark loading. Preserve existing saved data/order, avoid
duplicate service bookmarks and respect bookmark editing policy. Keep a local
per-profile completion preference so deleted starter bookmarks stay deleted.
Bundle the original official logo assets with origin records and render them
without tint; unrelated sites keep the current monogram. Native focus, URL
activation, six-card preview and private restrictions remain unchanged. Verify
one-time seeding, deduplication, deletion/restart, policy/private exclusion and
logo rendering at baseline and enlarged text before final x64/ARM packaging.

Source `97729c571` completes this extension. Six native regressions, 20 project
tests, strict mypy, x64/ARM builds and signature checks pass. The emulator
preserves the existing bookmark and adds each service once; D-pad traversal and
native captures at 1.0/1.3 text scale pass. See
[starter favorites evidence](tv-starter-favorites-evidence.md) for artifacts,
official asset provenance and physical-TV/playback acceptance limits.

### Ambient Home footer

16 October refinement: reduce the footer's vertical footprint, separate the
description from quieter attribution text, and bundle GitHub's official
Invertocat as the project action. Preserve the exact product and credit copy,
native URL loading, D-pad focus and scaled-text reflow. Verify baseline and
1.3 font scale on the TV emulator after the shared build checkout is idle.

The user also requests smaller selected top-navigation pills. Let Home, Tabs,
Favorites and Phone use their content width and flow naturally instead of
stretching across equal columns. Remove the compact labels' extra internal
vertical padding while preserving 48dp navigation targets, mint focus, selected
Home semantics and live Phone status. Verify normal/enlarged text and narrow
native D-pad traversal before the coordinated final ARM rebuild.

Final source `6b49003d6` completes both refinements. Baseline/enlarged native
captures, focused footer/navigation checks, blocking x64/ARM builds and the
independent finish review pass. See [updated footer evidence](ambient-footer-evidence.md)
for the exact validation scope and coordinated physical-TV handoff.

Restore a compact bottom footer with the product description, explicit Brave
and Chromium credit, and a D-pad-accessible GitHub action using the canonical
project URL. Relabel the photograph credit in English while retaining Luca
Bravo and Unsplash. Keep the footer outside the scrollable Home content so
large text cannot overlap saved/recent cards. Reuse native URL loading and
the existing Shields/private-tab features; this slice changes presentation.
Verify the GitHub destination/tab ownership, focus traversal, baseline and
1.3 text scale, then build and preserve the x64/ARM artifacts.

Source `0cd7165ed` completes the footer with the user's exact description:
“A simple browser with ad blocking and private browsing.” Five native regressions
pass on the implementation, followed by final-copy footer acceptance at 1.3
text scale. Both final browser APKs build with blocking analysis and pass
signature verification. The emulator retains all five bookmarks and returns
to normal text scale. See [footer evidence](ambient-footer-evidence.md) for the
captures, artifacts and acceptance limits.

### Remote element navigation and pointer fallback

The user approves element jumping with scrolling at the visible edge and asks
for a plan and implementation. Follow [page navigation plan](tv-page-navigation-plan.md):
reuse Chromium spatial navigation, add short/held OK policy, automatic webpage
entry, a native focus cue and pointer fallback, then verify native input/privacy
ownership and preserved data on cached x64/ARM builds.

Source `d8a0ebb90` implements the approved interaction through Chromium's native
engine, a canceled-safe held-OK toggle and a scoped selection cue. All twelve
native checks, 20 project tests, strict mypy, Nix checks and blocking x64/ARM builds
pass. The emulator update retains all five bookmarks and normal text scale.
See [page navigation evidence](tv-page-navigation-evidence.md) for APKs, signatures,
captures and physical-TV/website-compatibility acceptance limits.

16 October hardware follow-up: the user authorized taking control of the TV
and removing the old browser across Android profiles if necessary. The in-place
update failed for storage; global uninstall and fresh installation succeeded.
The installed ARM APK matches the verified `d8a0ebb90` hash. Physical native Home,
default element navigation, single activation, actual held-OK pointer switching,
document scrolling/end and menu return pass with injected nonalphabetic D-pad
input. The old browser's local data was cleared; other apps/Android profiles
remain intact. All owned test tabs/services/forwarding are closed, leaving Home
and stock Gboard. See [hardware evidence](tv-page-navigation-hardware.md) for the
exact artifact, captures and remaining human-remote/playback/compatibility limits.

### Startup toolbar and explicit webpage editing

16 October: the user requests fixing both the transient startup URL bar and
automatic keyboard entry when arrows land on a field. Follow the
[startup/input plan](tv-startup-input-plan.md): establish native failing
regressions, remove only the TV transient toolbar hold and initialize hidden
controls before draw, then gate soft-keyboard display during element navigation
until OK. Preserve native security/persistent owners, actual keyboard editing,
pointer clicks, phone typing, lifecycle cancellation and private protections.
Build/test x64 before the optimized ARM update and authorized hardware check.

### Consistent TV controls and compact Phone status

16 October: the user's physical-TV photo exposes a capsule focus border over
rounded rectangular buttons, narrow three-column menu labels (including a split
“Bookmarks”), and an oversized connected-phone badge. Fix the shared Compose TV
button: use the same shape in every focus/enabled state, stable bounds, consistent
navigation type/padding and 48dp targets. Use two readable menu columns with
uniform scalable row heights rather than squeezing labels beside their icons.
Keep the Ambient palette, native actions, system font scaling and remote behavior.
Replace Home's expanding Phone label and the webpage connection badge with small
phone icons, preserving status announcements and the existing connection actions.
Verify Home/menu, enabled/disabled focus, Bookmarks and connected Phone at 1.0/1.3
font scale, narrow traversal/callbacks and badge focus ownership. Then build the
optimized ARM APK, update the authorized physical TV with data retained, and
capture the real controls before the independent finish review/documentation.
