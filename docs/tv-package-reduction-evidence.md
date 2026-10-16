# Optional product removal evidence

16 October 2026. Implementation and combined-build verification are in progress.
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
| Baseline x64 Debug | 853,326,784 | `7e181c3f628b337e7c8a0e91494904c59604324bd9f54ca96a2300b0fe71568c` |

Saved baseline arguments and provenance are in `baseline/`; the News artifact
and arguments are in `news-checkpoint/`. The test-signing certificate SHA-256 is
`32a2fc74d731105859e5a85df16d95f102d85b22099b8064c5d8915c61dad1e0`.

The News checkpoint at source `62f9aedb502537986ed8523b088567ba00292fb2`
passed ARM compilation, linking and blocking Android analysis. Its reduction is
367,857 bytes (about 0.35 MiB). This checkpoint still included a News animation
and RSS renderer dependency subsequently removed in the combined changes.
Wallet, Rewards and Ads remained enabled at that checkpoint. Wallet has a
separate source commit, but no standalone measured artifact; its savings will
be reported together with Rewards/Ads and the remaining News cleanup.

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

The generated ARM dependency graph at source `a8a7b0c28` excludes News browser
and renderer implementations, Wallet browser, Rewards implementation, Ads core
and browser implementation, adaptive CAPTCHA, and sponsored takeover UI.
It includes Shields' Rust engine, VPN browser and Leo browser implementations.
The final APK still needs independent inspection with
[check_product_payloads.py](../tests/build/check_product_payloads.py).

## Checks and remaining work

The 25 project tests and strict mypy over 18 files pass. Nix flake checks passed
before the ABI-comparison test was added; repeat the packaged check at closeout.
The artifact checker rejects retained News assets, missing browser/VPN payloads,
changed locale coverage, mismatched ABIs and unavailable build inputs. A baseline
APK correctly fails its product-removal check.

Combined ARM linking exposed an unguarded CAPTCHA preference migration caller;
the correction is pending the next build. Earlier failures identified stale
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

Combined APK measurements, x64/test builds, in-place upgrade, signed-filter
tests, retained feature checks and bounded startup comparison remain pending.
Languages and Play/AAB delivery configuration are unchanged. Release signing,
device-specific bundle delivery, ABI/page-size validation and store submission
remain separate release work.
