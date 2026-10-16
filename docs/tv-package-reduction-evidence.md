# Optional product removal evidence

16 October 2026. The optimized ARM32 build and payload checks pass; emulator verification is in progress.
This is the evidence companion to the [reduction plan](tv-package-reduction-plan.md).
It does not establish physical-TV acceptance or Play publication readiness.

## Fixed baseline

Brave source `987fb6a0c30b4ae8a287c9f58784887fb75462dc`, pinned to
v1.97.56; Chromium `cfaadc5a132d78e1828635aa8405a499f3e14864`
(155.0.8059.40). Evidence files are preserved under
`~/.cache/brave-tv/evidence/product-removal-20261016/`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| Baseline ARM32 Static, non-debuggable | 368,584,362 | `8ea1caa60cf23782404260c9216f62f4e10f4d7324540c881b3641f705126a59` |
| News checkpoint ARM32 | 368,216,505 | `86e62acf7f0f2d0824ca6f7ec257d0e646d7d79859f80240f2dc91e7d1ab2000` |
| Combined ARM32 Static, non-debuggable | 335,870,497 | `cedfc8bbcb415168e63e76946f1f7f2fa58a8bd074c4b39ad7334634486e7e75` |
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

The combined ARM32 artifact at source `6644734cb92ebddcf22f0a68569a53a703c1f2cd`
is **32,713,865 bytes smaller (8.88%; 31.20 MiB)** than the baseline. Both
`args.gn` and `args_generated.gni` are byte-identical to the baseline. Package,
version, SDK levels, ABI and signing certificate match. The complete build passes
with blocking lint and Error Prone enabled. Artifact, signature, payload report,
provenance and build log are archived in `combined-arm/`.

| ZIP entry payload (compressed bytes) | Baseline | Combined | Reduction |
| --- | ---: | ---: | ---: |
| Native libraries | 192,219,404 | 183,867,660 | 8,351,744 |
| DEX | 16,908,862 | 16,244,482 | 664,380 |
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

## Checks and remaining work

The 25 project tests and strict mypy over 18 files pass. Nix flake checks passed
before the ABI-comparison test was added; repeat the packaged check at closeout.
The artifact checker rejects retained News assets, missing browser/VPN payloads,
changed locale coverage, mismatched ABIs and unavailable build inputs. A baseline
APK correctly fails its product-removal check.

Combined ARM linking exposed an unguarded CAPTCHA preference migration caller;
the corrected build passes. Blocking lint exposed product-only resources that
are now isolated behind product conditions, and Error Prone identified dead
product state that was removed. Two shared account transition animations remain
with narrow unused-resource suppressions because lint misses their theme references. Earlier failures identified stale
generated Wallet search providers, empty enum generation, circular include
allowances and unguarded WebUI translation tables. Build logs retain each
failure. One attempt was killed by host memory pressure; a later attempt was
stopped before that recurred. The resumed service uses `SISO_LIMITS=local=2,step=2`
and 16/20 GiB soft/hard memory limits, preserving all build outputs.

Emulator `brave_tv_ambient_api36` retains the baseline x64 installation. Two
normal localhost fixture tabs, a bookmark, Google search selection, persistent
cookie and local storage are recorded in `upgrade-baseline.json`. Candidate
installation must preserve that profile. `startup-baseline.json` contains three
process-cold launch and browser PSS samples; this is not page-ready timing,
filesystem-cold timing or a release-performance result.

The x64/test builds, in-place upgrade, signed-filter
tests, retained feature checks and bounded startup comparison remain pending.
Languages and Play/AAB delivery configuration are unchanged. Release signing,
device-specific bundle delivery, ABI/page-size validation and store submission
remain separate release work.
