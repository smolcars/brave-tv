# Optional product removal evidence

16 October 2026. Final x64 and optimized ARM32 builds, payload checks and
scoped emulator verification pass, with one documented baseline test failure.
The verified APK is installed on the physical Chromecast and scoped smoke checks pass.
This is the evidence companion to the [reduction plan](tv-package-reduction-plan.md).
These bounded checks do not establish broad TV compatibility or Play publication readiness.

## Fixed baseline

Brave source `987fb6a0c30b4ae8a287c9f58784887fb75462dc`, pinned to
v1.97.56; Chromium `cfaadc5a132d78e1828635aa8405a499f3e14864`
(155.0.8059.40). Evidence files are preserved under
`~/.cache/brave-tv/evidence/product-removal-20261016/`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Baseline ARM32 Static, non-debuggable | 368,584,362 | `8ea1caa60cf23782404260c9216f62f4e10f4d7324540c881b3641f705126a59` |
| News checkpoint ARM32 | 368,216,505 | `86e62acf7f0f2d0824ca6f7ec257d0e646d7d79859f80240f2dc91e7d1ab2000` |
| Combined ARM32 Static, non-debuggable | 335,870,497 | `3f182fa8075cf7851ff47819e7f8687982874078ee390ffe98c260baf95548fd` |
| Baseline x64 Debug | 853,326,784 | `7e181c3f628b337e7c8a0e91494904c59604324bd9f54ca96a2300b0fe71568c` |

Saved baseline arguments and provenance are in `baseline/`; the News artifact
and arguments are in `news-checkpoint/`. The test-signing certificate SHA-256 is
`32a2fc74d731105859e5a85df16d95f102d85b22099b8064c5d8915c61dad1e0`.

The News checkpoint at source `62f9aedb502537986ed8523b088567ba00292fb2`
passed ARM compilation, linking and blocking Android analysis. Its reduction is
367,857 bytes (about 0.35 MiB). This checkpoint still included a News animation
and RSS renderer dependency subsequently removed in the combined changes.
Wallet, Rewards and Ads remained enabled at that checkpoint. Wallet has a
separate source commit, but no standalone measured artifact; its savings are
reported together with Rewards/Ads and the remaining News cleanup.

The final ARM32 artifact at source `78680abe063a5a2585bce1bc8a76d7e877a23e18`
is **32,713,865 bytes smaller (8.88%; 31.20 MiB)** than the baseline. Both
`args.gn` and `args_generated.gni` are byte-identical to the baseline. Package,
version, SDK levels, ABI and signing certificate match. The complete build passes
with blocking lint and Error Prone enabled. Artifact, signature, payload report,
provenance and build log are archived in `final-arm/`. The earlier combined
checkpoint is retained separately in `combined-arm/`.

| ZIP entry payload (compressed bytes) | Baseline | Combined | Reduction |
| --- | ---: | ---: | ---: |
| Native libraries | 192,219,404 | 183,867,660 | 8,351,744 |
| DEX | 16,908,862 | 16,244,506 | 664,356 |
| Assets | 113,984,862 | 92,578,347 | 21,406,515 |
| Other entries | 44,911,568 | 42,648,520 | 2,263,048 |

APK totals also include ZIP/signing overhead. These are standalone APK bytes,
not Play download sizes or a speedup measurement.

## Implementation boundaries

Android defaults disable `enable_brave_news`, `enable_brave_wallet`,
`enable_brave_rewards` and `enable_brave_ads`. Product source directories remain
upstream-compatible inputs behind build conditions; their shared Android UI,
service initialization, JNI consumers, manifest entries and settings providers
are removed from this fork. Simply restoring the flags is insufficient to
restore the deleted Android integrations.

Product-only Android resources and translation catalogs are excluded. Ordinary
wallpapers remain; sponsored component registration is gated. Shared wallpaper
Mojo value types, preference names and notification compatibility declarations
can remain where surviving code needs them. No old product profile data is
deleted as part of this change. SafetyNet remains for Safe Browsing; Play
Integrity is conditional on its removed Rewards CAPTCHA consumer.

The shared wallpaper and notification code still depends on the Ads service
interface and Mojo value types. Rewards' small core target supplies preference
and utility definitions to shared policy, metrics and wallpaper code. News Mojo
declarations also remain in shared browser dependencies. These are not the
removed product service implementations; the dependency check distinguishes them.

The generated ARM dependency graph at source `a8a7b0c28` excludes News browser
and renderer implementations, Wallet browser, Rewards implementation, Ads core
and browser implementation, adaptive CAPTCHA, and sponsored takeover UI.
It includes Shields' Rust engine, VPN browser and Leo browser implementations.
The completed ARM APK passes
[check_product_payloads.py](../tests/build/check_product_payloads.py): native PAK
resource IDs, compiled Java inputs, feature flags, final dependency graph,
WireGuard and browser ABI coverage, and the exact baseline locale entry set.

## Emulator and host verification

Final source: `78680abe063a5a2585bce1bc8a76d7e877a23e18`. The x64 application
and instrumentation builds pass, including blocking lint, Error Prone and
explicit dependency checks. `final-x64/` contains the APKs, exact arguments,
signatures, payload check, build log and provenance. The final x64 APK is
801,783,992 bytes (51,542,792 below baseline), SHA-256
`f405922516e2896f0b553d5e576dd1193c7ff1b7c923b3c0c9e898c1dee8d438`.

All 70 focused Robolectric runs pass (35 cases on each of SDK 29 and SDK 36).
They cover menu removal, adaptive toolbar behavior and legacy saved Wallet
shortcuts. The legacy value now normalizes to the device's default shortcut
rather than selecting a hidden Auto option. All 17 signed-filter host tests
pass, covering validation, staging/activation, invalid updates, persistence and
network limits. All 25 project tests, strict mypy over 18 files and both Nix
flake checks pass on the final source pin.

The emulator's native checks pass Shields network blocking, cosmetic hiding,
scriptlet execution and per-site disable/re-enable, native video fullscreen,
normal/private tabs, search, adblock settings routing, activity recreation,
phone Enter behavior, element/pointer switching, file-picker cancellation,
About/licenses, removed-product search and retained VPN/Leo search catalogs.
Shields checks restore their temporary custom rules and site setting.

The first runtime pass exposed three failures, retained in the evidence logs:

- The existing compact-controls navigation case times out waiting for Back
  focus. The exact baseline test APK fails at the same step. This remains an
  existing automation/navigation acceptance limit; it is not marked passing.
- The privacy test's remainder-count expectation was already three too high
  in the baseline (expected 28, actual 25). The removed Wallet rows change the
  remainder to 22; the corrected test retains explicit removed/surviving row
  assertions.
- A new test incorrectly required a visible Leo settings row. Baseline source
  already hard-disables Leo through Java `IS_AI_CHAT_SUPPORTED=false` and native
  `IsAIChatEnabled()` on Android. That intentional policy is preserved, while
  Leo build targets, resources and clients remain packaged. The test now checks
  the existing availability gate. Retaining Leo is not a claim that chat works
  in this fork; enabling it would be separate work.

The final APK passes the corrected settings and privacy cases, repeats the
Shields check successfully, and passes native download removal/deletion ownership
and dangerous-download action gating. Across the two candidate passes, 23
distinct native cases pass; the unchanged navigation case remains failing.

No VPN subscription tunnel or Leo backend conversation was exercised.

The data-preserving emulator installation retains two seeded normal tabs and
selected-tab identity, bookmark ID/title/URL, Google search selection, owned
history rows, persistent cookie, local storage and an Android per-app French
locale. `upgrade-candidate.json` and the French storage snapshot record the
comparison. The original system-following app locale was restored afterward.
No emulator profile was cleared.

Three process-cold Debug launches, with warm filesystem cache and browser-only
PSS after five seconds, are recorded in `startup-baseline.json` and
`startup-final.json`. The final candidate median is 753 ms versus 895 ms,
and 323,652 KiB versus 335,579 KiB browser PSS. The final measurement ran with builds/tests stopped. This small emulator sample is not
page-ready timing, total process-tree memory or a release-performance claim.

## Build findings and limits

Combined ARM linking exposed an unguarded CAPTCHA preference migration caller;
the corrected build passes. Blocking lint exposed product-only resources that
are now isolated behind product conditions, and Error Prone identified dead
product state that was removed. Two shared account transition animations remain
with narrow unused-resource suppressions because lint misses their theme
references. Earlier failures identified stale generated Wallet search providers,
empty enum generation, circular include allowances and unguarded WebUI
translation tables. Logs retain each failure. One attempt was killed by host
memory pressure; a later attempt was stopped before that recurred. Resumed
services use `SISO_LIMITS=local=2,step=2` and 16/20 GiB soft/hard memory limits,
preserving all outputs.

The artifact checker rejects retained News assets, missing browser/VPN payloads,
changed locale coverage, mismatched ABIs and unavailable inputs. A baseline APK
correctly fails its product-removal check. Languages and Play/AAB delivery
configuration are unchanged. Release signing, device-specific bundle delivery,
ABI/page-size validation and store submission remain separate release work.

## Physical Chromecast verification

The final ARM APK is installed on the Android 14/ARM32 Chromecast. Its on-device
SHA-256 exactly matches `3f182fa8075cf7851ff47819e7f8687982874078ee390ffe98c260baf95548fd`.
No uninstall or app-data deletion was needed. Application ID 10141, user-0 data
inode 81460, original installation time and all four profiles' installation/data
identities match the pre-update records (`tv/preserved-identity.json`). Active
user remains 0. Available storage after restart was 1,093,364 KiB.

The initial streamed update lost its ADB response, but Android had committed it.
After the user authorized a reboot, an isolated host ADB server connected and
sent `reboot`. That command timed out as the TV disappeared from the network.
The shared ADB server/emulator were preserved and the temporary server stopped.
After the user enabled wireless debugging, discovery found a new endpoint;
`sys.boot_completed=1` and 108 seconds uptime confirmed the restart. No incomplete
installer sessions remained. Checking the installed hash before retrying proved
the final artifact was already installed, avoiding an unnecessary reinstall.

| Bounded physical check | Observed result |
| --- | --- |
| Native Home | Rhenium branding, favorite tiles, Search focus and empty initial page list render correctly. |
| D-pad/OK and Settings | Up and Right traverse the native header; OK opens Settings and Back returns. |
| Webpage navigation | Right moves Explore → Watch; short OK records exactly one activation. Held OK introduces no extra activation; browser controls remain reachable. |
| Shields | Controlled ad and cookie-list requests fail while the control script loads; site protection remains on. Cosmetic/scriptlet and off/on reversal are covered by the emulator native test. |
| Media/fullscreen | The fixture reports readyState 4, decoded frames and advancing playback with no media error. D-pad reaches Fullscreen; OK enters it, and Back returns to the same document with playback active. |

These use injected nonalphabetic D-pad/OK events and native device snapshots,
not a human remote or real phone. The fullscreen capture shows native controls
but does not establish picture/audio quality; playback counters and unchanged
document identity are the bounded evidence. Streaming DRM, paid VPN, Leo backend
chat, long-duration playback, human A/V and broader websites remain unverified.
The pre-existing emulator Back-focus test failure remains documented above.

All three task-owned tabs are closed and native Home is restored with an empty
Continue browsing list. Active user, stock Gboard, display size/density and
pre-existing forwarding state match the initial records. The current browser
process has no crash-buffer entries. Task-owned fixture servers and TV reverses
are stopped/removed, and its automation session is closed. Shared services,
emulator data, build caches and unrelated files are retained.

Evidence, native snapshots, Home/Settings/Shields/fullscreen captures, reboot
and package state are under `tv/` in the preserved evidence directory.

The latest source change was reviewed against its parent, including the
baseline evidence supporting the corrected assertions; no additional findings.
Source `78680abe0` is pushed to the source fork. No Play release was published.
