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
