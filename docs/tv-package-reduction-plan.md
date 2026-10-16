# TV package reduction plan

16 October 2026. Planned work: compile out unused Brave products from the
Android TV browser and measure the resulting package reduction. Google Play
publication remains the eventual delivery target. Implementation is authorized
and in progress; completion checks below require build and runtime evidence.

## Scope and delivery decisions

Remove News, Wallet, and Rewards/Brave Ads in separate checkpoints. Keep VPN
and Leo enabled, including their required dependencies, resources and services.
Brave Ads here means Brave's advertising product; Shields and `adblock-rust`
remain essential. Preserve browser profiles, bookmarks, history, passwords,
downloads, permissions, security controls, media, TV navigation and phone
remote behavior. Leave other product removals and broad refactoring outside
this work.

Leave the existing language configuration and translations unchanged. Google
Play generates device-specific APKs from an Android App Bundle (AAB), and the
inspected Chromium bundle template already enables language splits. A dedicated
language-trimming project is not part of this plan. Preserve multilingual web
content, input, font fallback and language-specific adblock lists.
[App Bundle delivery](https://developer.android.com/guide/app-bundle)

Product removal can eliminate compiled code, bundled assets and service
initialization. Package savings must be measured; startup or memory benefits
depend on which services currently run and are not guaranteed.

Compiler/PGO changes, engine replacement, runtime performance tuning and an
upstream version update are separate work. If an upstream update lands first,
establish the baseline on that final revision and keep it fixed throughout
these comparisons.

## 0 Record a baseline using the existing build

- [ ] Finish or preserve concurrent source work; record the project, Brave and
  Chromium revisions used for every artifact. Follow the existing
  [source workflow](source-workflow.md) and [build limits](build.md).
- [ ] Build or identify a matching optimized, non-debuggable ARM32 APK baseline.
  Record its effective GN arguments, package/version, signing certificate,
  byte size, checksum and resource/native/DEX breakdown. Preserve existing
  artifacts and caches.
- [ ] Compare each product checkpoint against the preceding artifact and the
  initial baseline with the same ABI, compiler settings and packaging. Record
  total bytes and native/resource/DEX changes. Bundle delivery measurements
  belong to release preparation and do not block these removals.

The historical ARM32 APK inspected during research is **368,539,141 bytes**.
This is a reference measurement, not a forecast of savings from the selected
product removals. Establish their individual savings with matching builds.
[Measurement context](browser-engine-research.md),
[installed artifact](tv-page-navigation-hardware.md)

**Exit:** a reproducible baseline APK with saved build arguments. Reuse an
existing matching artifact where possible; no new delivery pipeline is required.

## 1 Remove unused Brave products from the Android build

Use existing feature flags, with Android fork defaults in
[android_defaults.gni](../brave/build/args/android_defaults.gni). Keep related
targets correctly gated rather than deleting upstream product directories.
Do not use Brave Origin branding as a shortcut: its build configuration
explicitly rejects Android.

Implement in this order, preserving one independently reviewable checkpoint
and artifact comparison per step:

1. **News:** disable `enable_brave_news`. Remove feed-only Java, Mojo/native
   wiring, settings and assets. Preserve the TV's native Ambient Home and its
   bundled imagery.
2. **Wallet:** disable `enable_brave_wallet`. Remove wallet Java/models,
   activities, JNI/Mojo consumers, native services and WebUI/resources. Audit
   references outside `crypto_wallet/`, including `BraveActivity` and
   `app/domain`; a folder-name filter does not cover the dependency graph.
   Remove wallet-only protocol/permission entries without affecting ordinary
   website permissions or HTTPS navigation.
3. **Rewards and Brave Ads:** disable `enable_brave_rewards` and
   `enable_brave_ads` together. Remove their workers, UI, native services,
   resource bundles and product-specific background registration. Retain
   Shields matching, cosmetic filters, scriptlets, per-site controls and the
   independent signed filter-update pipeline.

Preserve the existing `enable_brave_vpn_v1`, `enable_brave_vpn_v2` and
`enable_ai_chat` configuration. Keep WireGuard payload and VPN manifest/JNI
wiring, Leo clients/WebUI, and dependencies shared with either retained product.

For each checkpoint, trace and update all affected layers:

- [Android dependencies and JNI lists](../brave/build/android/config.gni),
  [Java source lists](../brave/android/brave_java_sources.gni),
  [Java resources](../brave/android/BUILD.gn) and
  [resource overrides](../brave/android/brave_java_resources.gni).
- [Manifest components](../brave/android/java/AndroidManifest.xml),
  [intent filters](../brave/android/java/AndroidManifest_intent_filters.xml),
  associated settings XML and merged library manifests.
- Shared Java callers such as
  [BraveActivity](../brave/android/java/org/chromium/chrome/browser/app/BraveActivity.java),
  generated configuration, bytecode adapters and JNI registration. Remove
  references to excluded types; a runtime false condition does not make an
  unresolved Java import compile. Add a narrow helper only when required by a
  surviving caller, rather than retaining an entire product dependency.
- Native browser/renderer targets, keyed-service factories, resource/component
  registration, [WebUI resource targets](../brave/components/resources/BUILD.gn),
  GRD entries and retention rules. Remove a shared dependency only after its
  remaining consumers have been checked.
- Existing tests whose target is intentionally excluded. In particular, the
  [Ads tooltip object regression](../tests/build/README.md) cannot require an
  Ads object in the Ads-free build. Preserve its applicability to enabled
  builds and verify target exclusion for this configuration.

Compile and link after each checkpoint with blocking Android analysis. Inspect
actual GN dependencies, R8 mappings/output and native/resource size reports to
confirm removed implementation is absent. Obfuscated DEX requires its matching
mapping; absence of an original class name in a ZIP string search is not proof.
Minimal shared compatibility declarations may remain only with their purpose
documented; do not claim their whole subsystem was eliminated.

**Exit per product:** build/link pass; no dangling manifest/JNI/class references;
the product implementation and exclusive payload are absent; retained browsing
flows pass; the artifact-size delta is recorded. Investigate any increase or
missing expected reduction before moving to the next product.

## 2 Validate the combined result

- [ ] Add a focused artifact checker under `tests/build/` for required
  browser/Shields/filter assets and exclusive payloads of the removed products.
  Verify VPN/Leo payloads and browser UI locale coverage remain intact.
  Inspect packed resources through their generated resource index where assets
  are inside `.pak` files; checking ZIP filenames alone is insufficient.
  Validate it against baseline/candidate artifacts and deliberately incomplete
  fixtures; it must fail on missing inputs or tool errors. Use build/packaging
  evidence for broader feature exclusion, not source-text assertions alone.
- [ ] Run focused Java/native tests, blocking x64 and optimized ARM32 builds.
  ARM64 and generated bundle APK validation belong to the Play handoff below.
- [ ] Test an in-place update with seeded bookmarks, tabs, history, settings,
  cookies and a saved non-English UI preference. Preserve package identity and
  test signing during comparisons. Do not clear profiles to make an upgrade
  appear successful, and do not delete old optional-product data as part of
  this packaging change.
- [ ] Run existing TV navigation/OK/hold/pointer, keyboard, phone-remote,
  private-tab, download, permission and fullscreen checks. Verify a controlled
  video fixture and representative websites against the baseline.
- [ ] Check Shields network blocking, cosmetic hiding and scriptlet execution
  with controlled fixtures; test signed filter staging/activation and rejection
  of invalid updates. A blocked-request counter alone is insufficient.
- [ ] Compare VPN and Leo entry points, initialization and available functional
  flows against the baseline. Record account/subscription or service limitations
  separately; do not treat unexercised flows as passing.
- [ ] Record a bounded cold-start and memory comparison to catch regressions.
  Startup tuning and speedup claims remain outside this package-size work.
- [ ] Save each source revision, effective feature flags, APK hashes,
  signing identity, size report and observed failures in a companion evidence
  note. Update build instructions with the tested product configuration.
  Keep implementation, emulator acceptance, physical
  TV acceptance and publication status separate.

## Play publication handoff

This plan produces smaller artifacts and evidence for release preparation; it
does not publish the app. Retain the existing
[distribution checklist](mvp-todo.md#after-the-sideloaded-mvp).

Google Play requires TV apps to use AABs. During release preparation, build
through the existing `--target_android_output_format=aab` path, validate with
`bundletool`, and install complete device-specific APK sets. Verify product
exclusion in those sets and measure delivered/download size separately from
standalone APK bytes. Keep existing language splits enabled.
[App Bundle delivery](https://developer.android.com/guide/app-bundle),
[bundletool operations](https://developer.android.com/tools/bundletool)

The final Play artifact must cover the intended 32-bit and 64-bit TV devices
and satisfy 16 KB page-size requirements. Those TV requirements have applied
since 1 August 2026. Validate the actual AAB's supported ABIs and generated APKs;
do not infer coverage from an `arm64` filename or manually combine separately
signed APKs. Independent application identity, release signing and the rest of
the TV/store acceptance remain release tasks.
[Current TV requirements](https://developer.android.com/develop/adaptive-apps/quality-guidelines/tv-app-quality)

When publication is undertaken, confirm actual Play-generated download sizes
and installation through an internal test track before production rollout.

## Completion checklist

- [ ] Matching baseline APK and build configuration recorded.
- [ ] News removed; native TV Home preserved.
- [ ] Wallet removed.
- [ ] Rewards/Brave Ads removed; Shields and filter updates verified.
- [ ] VPN and Leo remain enabled with required payloads and behavior preserved.
- [ ] Combined builds, artifact checks and profile-preserving upgrades pass.
- [ ] Existing locale coverage and multilingual browsing/input preserved.
- [ ] Per-checkpoint savings and remaining Play prerequisites documented.
