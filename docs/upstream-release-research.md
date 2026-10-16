# Brave upstream update assessment

Rechecked 16 October 2026 after the latest TV changes; upstream release status
was verified at 23:11–23:12 UTC. This
supersedes the morning assessment against `ea0bfdfbe`. The current project is
`6dd2d82fcd7a0458503d644d8ba835e890dddcb1`, with Brave source
`78680abe063a5a2585bce1bc8a76d7e877a23e18`. The source worktree is clean and
matches the committed parent submodule pointer.

**Recommendation: integrate Brave `v1.97.59` and its matching Chromium
`155.0.8059.85` in one maintenance update.** Since the morning check, `.59` has
become GitHub's latest production release with Android APKs. There is no need to
land `.57` first. Keep `1.98.x` / Chromium 156 as a separate future integration.

The target and acceptance plan both change: preserve the completed product
removals, Rhenium branding, startup/input corrections, and current APK baseline.
The new merge simulation is clean, and all fourteen current downstream Chromium
patches pass applicability checks against `.85`.

This investigation changed only this assessment. It wrote merge-result Git
objects and temporary verification files, without merging a branch, modifying
source pins, syncing dependencies, building an APK, or installing anything.

## Verified upstream targets

| Source | Brave core commit | Chromium pin | Publication/status at verification |
| --- | --- | --- | --- |
| Current base `v1.97.56` | `b01cdf43be4b4d5559bf7e58229e666e24454f50` | `155.0.8059.40` | Production GitHub release, 7 Oct 2026, 03:18 UTC |
| Earlier target `v1.97.57` | `7bfa200812971b7811541ae6e5b72620abebe3a7` | `155.0.8059.80` | Previous production release, 14 Oct 2026, 05:35 UTC |
| Recommended `v1.97.59` / `1.97.x` tip | `c7357bfd2a76c2467ba1ae62593a81ae92c05205` | `155.0.8059.85` | Latest production release with Android APKs; initially published 16 Oct 2026, 03:32 UTC |
| Prerelease tag `v1.98.58` | `3f740ad8fc2110132e95b5beda623abf9822e854` | `156.0.8078.39` | Published 16 Oct 2026, 10:29 UTC; marked prerelease |

Sources: [current release](https://api.github.com/repos/brave/brave-browser/releases/tags/v1.97.56),
[latest release](https://api.github.com/repos/brave/brave-browser/releases/latest),
[1.97.59 release](https://api.github.com/repos/brave/brave-browser/releases/tags/v1.97.59),
[1.98.58 release](https://api.github.com/repos/brave/brave-browser/releases/tags/v1.98.58),
[1.97.x branch](https://api.github.com/repos/brave/brave-core/branches/1.97.x),
[1.98.x branch](https://api.github.com/repos/brave/brave-core/branches/1.98.x).
Chromium pins are read from tagged `package.json`:
[1.97.56](https://github.com/brave/brave-core/blob/v1.97.56/package.json),
[1.97.57](https://github.com/brave/brave-core/blob/v1.97.57/package.json),
[1.97.59](https://github.com/brave/brave-core/blob/v1.97.59/package.json),
[1.98.58](https://github.com/brave/brave-core/blob/v1.98.58/package.json).

The `v1.97.59` annotated core tag object is
`513cab0a94559d0db4f4f58992c05bd9332ffdaf`, which resolves to the commit above.
Use the **brave-core commit**, not the different brave-browser release-repository
commit. Chromium `155.0.8059.85` resolves to
`0e66b94549a8bd85f03fbdf189b752d6e7b63c32`.
[Core tag object](https://api.github.com/repos/brave/brave-core/git/tags/513cab0a94559d0db4f4f58992c05bd9332ffdaf),
[Chromium tag](https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.85).

Brave's website now lists **Android 1.97.57**, while GitHub's latest production
release is **1.97.59**, with `draft=false`, `prerelease=false`, Android release
notes and ARM, ARM64, x86 and x64 APKs. This establishes published artifacts,
not completed Google Play rollout. The 03:32 publication timestamp predates
promotion; the exact promotion time was not established. Some Beta/Nightly
entries have misleading non-prerelease flags, so version number alone is not a
stable-channel selector. The `1.98.x` branch has advanced beyond its `.58` tag;
that moving branch is not the recommended update source.
[Brave platform release notes](https://brave.com/latest/),
[1.97.59 release](https://github.com/brave/brave-browser/releases/tag/v1.97.59),
[latest release metadata](https://api.github.com/repos/brave/brave-browser/releases/latest),
[1.98.x branch](https://api.github.com/repos/brave/brave-core/branches/1.98.x).

## What updating brings in

The `.59` Android release note is the Chromium patch update `.80 → .85`.
Updating our `.56` base includes the preceding `.40 → .80` update as well as the
Brave dependency fixes and patch adaptations. It does not promise a TV feature
or performance improvement. Pull the complete stable core change and its selected
dependencies; do not assemble an independent Chromium version or cherry-pick
only a version-number edit.
[Android release notes](https://github.com/brave/brave-browser/releases/tag/v1.97.59),
[Chromium bump issue](https://github.com/brave/brave-browser/issues/59971),
[core comparison](https://github.com/brave/brave-core/compare/v1.97.56...v1.97.59).

Brave Core is the customization layer that pins and patches Chromium. Updating
the fork means merging the selected core tag, then syncing the build checkout to
the Chromium and dependency revisions chosen by that tag. It does not mean
independently merging Chromium's current development branch. The sync script
updates dependencies, applies Brave's patches, and runs hooks.
[Upstream architecture](https://github.com/brave/brave-core/blob/v1.97.59/README.md),
[sync implementation](https://github.com/brave/brave-core/blob/v1.97.59/build/commands/scripts/sync.ts).

For `.56 → .59`, Node and pnpm requirements are unchanged: Node
`>=24.16.0 <25.0.0`, pnpm `>=11.11.0`. The project records Node 24.21.0 and pnpm
11.27.0 in its build environment. The update includes the JavaScript lockfile
and Handlebars 4.7.10 override, Brave's web-discovery-project dependency roll,
and Chromium's own DEPS changes. No Nix toolchain change is currently indicated;
install the selected dependency revisions and verify their hooks during the
actual update.
[Tagged package requirements](https://github.com/brave/brave-core/blob/v1.97.59/package.json),
[workspace dependency policy](https://github.com/brave/brave-core/blob/v1.97.59/pnpm-workspace.yaml),
[core dependency changes](https://github.com/brave/brave-core/compare/v1.97.56...v1.97.59),
[Chromium DEPS](https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.85/DEPS),
[local build evidence](build.md).

## Repeated merge and Chromium checks

Source `78680abe0` adds 40 commits since the morning assessment, for 396 commits
after the pinned upstream base. The fork now changes 887 paths with rename
detection disabled; many new changes move optional-product resources. Counts
below use exact committed snapshots, not an uncommitted working tree.

- `.56 → .59`: 14 upstream commits and 284 changed paths, with **zero overlap**
  with downstream-modified paths. `git merge-tree --write-tree --messages`
  succeeds without conflicts; result tree
  `95af52475fb927e4d8d2186f421038a511d2fd88`. Comparing that tree to our head
  confirms all 887 downstream-modified paths retain their current contents or
  deletion state. The tree adds exactly the upstream changed-path set.
- The superseded `.57` target also merges cleanly, yielding
  `7ebc9c9f50c14220c3bbd42d49e87af8de48f812`, but requires a second update to
  reach the current stable engine.
- The same `1.98.58` endpoint comparison used in the morning still contains
  4,067 changed paths; overlap with our fork has grown from **35 to 63**.
  These are overlapping paths, not proven merge conflicts. No merge simulation
  was attempted for that line because the fetched shallow history does not
  expose its common ancestor. Its moving branch was not substituted for the tag.

There are now **fourteen** downstream-added or modified Chromium `.patch` files,
up from twelve. The two additional checks cover:

- `third_party/blink/renderer/core/input/keyboard_event_manager.cc`: navigation
  must reach the spatial-navigation handler before an inactive editor consumes
  arrows, while explicit editing retains native caret/IME ownership.
- `chrome/android/java/src/org/chromium/chrome/browser/settings/search/SearchIndexProviderRegistry.java`:
  removed products must not regain generated settings-search providers.

All fourteen patches pass `git apply --check` against the corresponding pristine
files fetched from official Chromium `155.0.8059.85`. All fourteen target files
are byte-identical to their pristine `.40` counterparts. Exact committed patch
inputs, downloaded files, `results.json` and `merge-result.json` are retained at
`/tmp/brave-tv-upstream-155-85-aj117b4t/`. This checks text applicability only;
the complete upstream patch sequence, bytecode adapters, native compilation and
runtime behavior remain to be tested after synchronization.

Upstream also changes its Profile customization from a header override to
patches/rewrite rules. It does not overlap our edits, but normal/private profile
behavior remains an explicit runtime gate rather than an inference from the
clean merge.
[Profile change](https://github.com/brave/brave-core/commit/f53d263da),
[upstream comparison](https://github.com/brave/brave-core/compare/v1.97.56...v1.97.59).

## What the latest changes add to the plan

**Preserve the product exclusions.** News, Wallet, Rewards and Brave Ads are now
excluded from the Android build and their shared Android integrations have been
removed or gated. Their upstream source directories remain present; simply
reenabling flags would not restore those integrations. Retain Shields, its Rust
engine and signed filter updates. Retain VPN and Leo build inputs and payloads;
Leo remains disabled at runtime under the existing Android policy. Re-run the
actual generated dependency, Java, PAK, flag and locale checks using
[check_product_payloads.py](../tests/build/check_product_payloads.py) after the
new build. Inspect removed-product settings/search and saved Wallet shortcut
fallback as well. The old Ads tooltip-object check applies only to Ads-enabled
builds, not a stale object in our cache.
[Removal boundaries and evidence](tv-package-reduction-evidence.md),
[artifact-check instructions](../tests/build/README.md).

**Use the reduced APK as the new baseline.** Preserve
`~/.cache/brave-tv/evidence/product-removal-20261016/final-arm/BraveMonoarm.apk`
(source `78680abe0`, 335,870,497 bytes, SHA-256
`3f182fa8075cf7851ff47819e7f8687982874078ee390ffe98c260baf95548fd`) and the
matching `final-x64/` artifacts. Compare like ABI/configuration against these,
not the older 368 MB APK containing the removed products. Keep APK hashes,
matching generated build inputs and provenance. Upstream native/dependency
changes may alter size; investigate increases without imposing an identical-byte
requirement or claiming renewed product-removal savings.
[Measured baseline](tv-package-reduction-evidence.md#fixed-baseline).

**Preserve the new interaction and identity behavior.** Explicitly retest
first-frame toolbar hiding, persistent security/native showing, D-pad traversal
of text/search/password/textarea/contenteditable, short OK to edit, visible
stock keyboard, caret movement, Back and subsequent navigation. Include pointer
mode and phone typing. Verify Rhenium launcher/Home/About artwork and text,
compact-control/footer focus at ordinary and enlarged text, while retaining
`com.brave.browser_default`, signing identity and profile data.
[Startup/input evidence](tv-startup-input-plan.md),
[branding evidence](rhenium-branding-evidence.md),
[controls evidence](tv-controls-sizing-evidence.md).

**Use the latest build limits and known baseline failures.** Recent builds hit
memory pressure; use `SISO_LIMITS=local=2,step=2`, `MemoryHigh=16G` and
`MemoryMax=20G`, preserving outputs. Keep blocking lint/Error Prone and
non-debuggable optimized ARM32 packaging. Stage builds and device tests to
avoid competing memory-heavy work. The existing compact-controls Back-focus
instrumentation case fails on the pre-upgrade baseline; retain that evidence and
compare behavior rather than reporting it as a new upstream regression or
silently counting it as passing.
[Build limits and runtime limitations](tv-package-reduction-evidence.md).

## Revised implementation sequence

1. Reconfirm clean source and unchanged checkpoint, then update the engineering
   plan before source changes. Preserve the current APK/provenance baseline and
   seeded profiles. Start paired source/project integration branches. Merge
   `c7357bfd2a76c2467ba1ae62593a81ae92c05205` into the TV source branch in one
   merge, preserving the existing masters until validation passes.
2. Review the merged result and all fourteen downstream Chromium patches.
   Commit the matching parent submodule pointer and `upstream.json` update to
   tag `v1.97.59`, that core commit, and Chromium `155.0.8059.85`. The checkout
   helper requires the source revision to match the committed parent pointer.
   Update current-version documentation without rewriting historical evidence.
3. Inventory the external builder before synchronization. At this inspection,
   its Brave checkout is clean at `78680abe0`, Chromium is still `.40`, and the
   Chromium tree reports 2,146 status entries including patches/generated files;
   no full ownership audit was performed. About 250 GiB is free. Preserve any
   nonreproducible edits and confirm no build is active. The checkout helper only
   advances Brave; perform the controlled Chromium/DEPS sync separately, or use
   an isolated build workspace if the audit cannot establish safety. Upstream
   sync includes reset operations even without `--force`. Preserve all existing
   output directories and artifacts. Verify the exact `.85` commit and applied
   patch contents afterward.
4. Run project tests, strict mypy and Nix checks, then build x64 APP+TEST and
   optimized non-debuggable ARM32 APKs with the revised resource limits and
   blocking Android analysis. Run the product-payload checker against the new
   completed build's generated files and the matching reduced baseline; verify
   disabled products, retained VPN/Leo/Shields payloads and locale coverage.
5. Install profile-preserving updates and run the new acceptance requirements
   above plus normal/private tabs, settings, Shields network/cosmetic/scriptlet
   enforcement, signed-filter update validation, media/fullscreen, downloads,
   permissions and saved-data/locale migration. Exercise emulator and physical
   TV as applicable. Recheck device storage and installation state; if wireless
   ADB loses its response, inspect package/hash/session state before retrying.
   Do not use a profile wipe to obtain a passing upgrade result. Record the
   existing Back-focus limitation separately from newly introduced failures.
6. Review and land only after the build/artifact/runtime gates are satisfied,
   publishing the source fork before the parent pointer. Record exact source,
   engine and artifact hashes with observed results. Keep Play/AAB publication,
   independent release signing and the larger Chromium 156 upgrade separate.

[Source workflow](source-workflow.md), [build workflow](build.md),
[reset-containing sync implementation](https://github.com/brave/brave-core/blob/v1.97.59/build/commands/lib/syncUtils.js).

No new APK build, dependency sync, full upstream patch application or device test
was performed in this reassessment. The merge and fourteen patch checks are
current; build and runtime acceptance of the upgraded version remains pending.
