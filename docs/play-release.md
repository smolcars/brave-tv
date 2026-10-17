# Google Play release preparation

## Engineering plan — 17 October 2026

Prepare the user's approved package `com.nitesh.rhenium` from the committed
Brave/Chromium source lock. The user has tested the updated browser on the
emulator. This work adds release packaging; it does not change browser behavior
or replace the installed development app.

1. Build upstream's optimized `Release` configuration with blocking Android
   analysis, non-debuggable APKs, Java optimization, and the production package.
   Preserve the existing Debug and Static output directories. Use separate
   `android_Play_arm64` and `android_Play_arm` outputs and bounded host resources.
2. Package the upstream standalone browser bundles for ARM64 and ARM32. These
   targets each contain one browser ABI. Use consecutive version codes in one
   release, with the ARM64 code higher so capable devices receive it. Do not
   combine independently generated native libraries or V8 snapshots by hand.
   Initial candidate: version `0.1.0`, codes `1001`/`1002` in
   [android.json](../release/android.json).
3. Generate an independent upload key outside the repository. Keep its password
   and keystore private and back them up in GitHub Actions secrets. Sign archived
   bundle copies after compilation, keeping signing passwords out of GN/Ninja
   files and build logs. Google Play's app signing key is a separate identity.
4. Validate bundle structure, package/version, non-debuggable manifest, TV entry,
   native ABI, native ELF alignment, and the upload certificate. Generate
   device-specific install sets with upstream's pinned bundletool and check
   16 KB ZIP alignment on the 64-bit APKs. Archive source, arguments, checksums,
   mappings, logs, and validation results with the artifacts.
5. Validate the saved service-account credential through GitHub Actions. Prepare
   an internal-testing **draft**, preserving existing releases. Do not roll out
   production or send changes for review as part of this build task. Initial
   Play App Signing enrollment and a first manual upload may require the account
   owner in Play Console. Report actual API responses rather than assuming the
   draft is already addressable by its package name.

## Public-release gates

Successful compilation is not a claim of Play approval. Before a public rollout,
complete the privacy policy, Data safety and permission declarations, listing
assets, TV distribution setup, and signing-key backup. Resolve the existing phone
remote's cleartext LAN transport before presenting it as secure. Clarify Google's TV-WB wording
for this embedded-Chromium browser; it currently specifies WebView for web
content. This is an eligibility question, not a confirmed rejection.

An x64 emulator run does not verify ARM64 hardware or a 16 KB runtime. Record
those checks separately from static ELF/ZIP validation. Keep both architecture
bundles together when checking release-wide architecture compliance.

Official references: [TV quality requirements](https://developer.android.com/docs/quality-guidelines/tv-app-quality),
[64-bit support](https://developer.android.com/google/play/requirements/64-bit),
[16 KB pages](https://developer.android.com/guide/practices/page-sizes),
[app signing](https://developer.android.com/studio/publish/app-signing),
[Play API setup](https://developers.google.com/android-publisher/getting_started).
