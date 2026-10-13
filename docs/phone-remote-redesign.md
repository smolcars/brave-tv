# After hours phone remote

The user selected After hours (deep blue and soft teal), with touchpad browsing
and quick controls as the primary task. The bundled companion now separates
Remote, Type and Tabs. Compact page identity/navigation leads to a spacious pad,
full-width Click, scroll buttons and optional directional alternatives. Address
and native eligible-field editing share Type; normal tab actions live in Tabs.
Pairing/TV approval, Home, empty tabs, field loading/ineligibility, page errors,
paused input, reconnecting and expired invitation states retain recovery guidance.

Native engine/protocol ownership is unchanged. The UI retains in-memory credentials,
native revision/field validation, no reconnect replay, private/password/security
exclusions and an explicit unencrypted development-experiment warning. No dedicated
playback command, dependencies, external assets, live view or remote execution
endpoint was added. Webpage playback controls still use pointer input.

## Host and visual acceptance

- Actual bundled-handler regression passes QR waiting/manual retry, fragment
  removal, polling-time action delivery, gestures/click, acknowledged native-field
  selection/replacement, Unicode/composition and conflicting edit rejection.
- New checks pass Remote/Type/Tabs arrow-key navigation, native tab-row focus
  restoration, removed-row recovery to New tab, Home/address and no-field clearing.
- Four delayed state/action success/failure races remain fenced by Disconnect.
- 320px portrait and 844px landscape have no horizontal overflow. Full-page
  synthetic screenshots cover approval, Home, Remote/Type/Tabs, 320x700,844x390,
  1440x900, paused and expired states. T3 browser preview separately inspected the
  actual assets;390x844 pad top267px versus incumbent466px, page844px versus1105px.
- Impeccable URL detector reports no findings using the retained browser. The
  initial filesystem scan could not resolve served /remote.css; its flat-type
  warning was based on missing CSS, not the rendered hierarchy.
- Independent finish review matches the chosen composition and palette. One
  stale paused typing hint was corrected; reviewer scores that fix resolved/ship.
  Source-owned PRODUCT, surface contract, DESIGN and token sidecar document scope.

Captures are development-only under brave/.impeccable/review/after-hours-r1 and r2.
Host fixtures and screenshots do not prove Chromium native integration.

## Packaging and native acceptance

Sourced6 cached x64 GN build passes in1m38.84s with blocking Android analysis,
four workers,18/22GiB limits and swap0. Observed peak14160662528B (13.19GiB);
6GiB host guard did not interrupt. Retained artifact:
`~/.cache/brave-tv/artifacts/phone-after-hours-d6ef719fa-x64-debug-20261012/BraveMonox64.apk`,
852772546B, SHA256 `c3f0796135958710ad5904d1fc82921d5235d123dab8f57203e5dac2bb5d5c8c`.
Signature/package/x64 checks and data-preserving TV emulator update pass.

Native screenshot QR decode, fragment removal, hidden manual form and explicit
TV approval pass over shared virtual Wi-Fi (TV10.0.2.16,phone10.0.2.18). All three
APK-served asset bodies hash-match source. An initial route attempt failed while
TV used isolated Ethernet; only that emulator was moved to Wi-Fi. A host-side
asset request timed out because it could not reach the emulator LAN; corrected
measurement fetches through the actual phone renderer. A controls invocation
before setup readiness failed its exact-target guard and is not acceptance.

Default emulator launch exited during navigation. The same APK/profile cold boots
with the documented `-feature -Vulkan` configuration and stays alive through
navigation and touch checks. This is a usable test configuration, not a proven
Vulkan fix. Browser data, snapshots and compile caches are retained. The adapted
native controls probe reaches tap/drag/two-finger scroll, Back/Forward/Reload and
stale/duplicate rejection; its final background-close wait failed, so the whole
run is not marked passed. A context-settle wait is added before closure.

Native testing also proves opaque tab handles rotate on active content changes.
The UI-only focus correction uses the browser's selected row when an exact handle
match disappears. The focused host regression fails on sourced6 and passes with
source901. Native token lifetime/security remain unchanged. Cached packaging and
complete native acceptance of that correction remain pending.

No physical-TV install, physical phone camera/IME or Safari claim follows from
these tests. The optimized physical-TV installation remains source090.

### Native typing follow-up

Source901 cached x64 build passes in1m31.93s, peak12447973376B (11.59GiB),
with the same four-worker, blocking-analysis and18/22GiB/swap0 bounds. APK
`~/.cache/brave-tv/artifacts/phone-after-hours-901588a94-x64-debug-20261012/BraveMonox64.apk`
is852772545B, SHA256 `b4c4470cf84a3458236df5dfcd8fd03f22a7f027d41c570114af53c9e6c3288c`.
Data-preserving emulator install, native-served asset hashes, fresh QR/approval
and the complete controls probe pass, including normal tab closure. No native
command/protocol change was needed for the earlier closure wait failure.

Native text attempts failed first replacement/repeated typing; no complete text
pass is claimed on source901. A real UI cause is reproduced separately: disabling
the phone textarea during a pending same-field native acknowledgement blurs its
IME. Source87b retains focus only for that pending edit; initial loading, changed
fields and protected pauses remain fenced. The actual-handler host regression
fails before this fix and the complete host suite passes after it. The new edit
adds a native version, so the older selection-ack test now checks the sampled
version increment rather than a fixed2. Latest source Standards/Spec reviews
report0 findings and independent finish review clears this interaction fix.

The native probe also explicitly focuses the companion editor before filling
and bounds waits: mobile IME panning makes desktop coordinate clicks intercept
unrelated controls. It continues to send every TV edit through the native bridge.
Corrected-source APK packaging and full native typing acceptance remain pending.

### Final emulator acceptance — source `87b489044`

Final cached x64 packaging passes blocking Android analysis in1m37.95s,
50steps. Observed peak12820164608B (11.94GiB), no host-guard interruption.
Artifact `~/.cache/brave-tv/artifacts/phone-after-hours-87b489044-x64-debug-20261012/BraveMonox64.apk`
is852772546B, SHA256 `09beeb0f7676f0d99b29ee42cbe8795c988ab2affb9a5bb2714635e894021c0a`.
Pinned development signature/package/x64 checks and in-place emulator install pass.

Fresh actual QR waiting/fragment removal/native approval and all three APK-served
asset hashes pass. The complete actual touch/navigation/tab/stale/duplicate probe
passes. The complete strict native text suite passes: Unicode replacements,
actual phone InputConnection composition, selection/code-point deletion,
textarea/contenteditable, stale-field rejection and password exclusion. No TV
DOM values are assigned. A separate stock-TV/phone-IME run passes twenty Unicode
replacements, input acknowledgement, composition and stable field identity.
Disconnect clears companion credentials and the actual emulator-LAN listener
refuses a subsequent connection.

Earlier helper-keyboard runs and the first corrected-source contenteditable aim
failed; these are not passes. The launcher changes the selected TV IME, so the
required keyboards are selected after launch. Native IME panning also invalidated
screen-coordinate sampling; the probe verifies both exact AVD identities,
dismisses the real TV keyboard before targeting a different fixture field, waits
for its viewport, then resamples. The failed final segment first passed alone,
followed by the complete strict suite on this same APK. Browser/native validation
was not relaxed. Visual layout remains the reviewed After hours direction.

ARM delivery slice uses the existing optimized non-debuggable output with blocking
checks and the same memory/job bounds. The user's later free-TV installation
permission supersedes the earlier busy-TV restriction for this delivery. Attempt
an in-place update retaining current browser data; no new storage wipe is implied
by this phone redesign. Physical installation/served-asset verification is pending.
Real physical phone camera/IME and Safari/iOS remain unverified.
