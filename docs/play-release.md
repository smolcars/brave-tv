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
   The wrapper uses `Release`, with `is_official_build=false` because Brave's
   official mode requires its private services key. Explicitly keep ThinLTO,
   disable DCHECK/Java asserts, and retain Java/resource optimization. This is
   an independently signed Rhenium release, not an official Brave distribution.
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
6. Publish the requested GitHub release with signed ARM32/ARM64 APKs and
   checksums. Download the universal APK for each bundle from Google Play's
   generated-APK API, then verify its manifest, ABI and signing certificate.
   This keeps GitHub APKs on the Play app-signing identity; the upload key signs
   AABs and local test install sets only. Do not publish test-signed APKs as the
   final GitHub downloads.

## Build and signing commands

Run inside the project's Nix environment:

```sh
python3 tools/build_play_release.py "$HOME/.cache/brave-tv/workspace" \
  "$HOME/.cache/brave-tv/evidence/play-release-20261017-r10"
python3 tools/package_play_release.py "$HOME/.cache/brave-tv/workspace" \
  "$HOME/.local/share/rhenium/signing" \
  --archive "$HOME/.cache/brave-tv/artifacts/rhenium-0.1.0-play"
```

The current runner uses `rhenium-play-release-r10.service`, eight local/total Siso
steps, ten allowed CPUs, and 20/22 GiB soft/hard memory limits. Earlier setup
attempts stopped during GN generation without compiling a browser. No existing
Debug/Static output was removed. Native symbols use level zero to fit this
builder; retain Java mappings and report that full native debug information is
not available from this configuration.
The four-worker compile was gracefully interrupted after its measured peak of
10,554,679,296 bytes and zero memory-pressure events. A later user-requested
increase from six to eight workers preserved the same output directories.
All checkpoints and logs are retained.

The first ARM64 bundle reached its final packaging check, which rejected an
AndroidX startup provider inherited by the `chrome` feature module. Chromium
already removes that automatic initialization provider from its base manifest.
The Brave manifest fragment now applies the same removal when rendered into
the feature module. This keeps APK and bundle startup behavior consistent;
the isolated-split validation remains enabled. The saved packaging command
reproduced this exact failure before the source correction. The incremental
rebuild checks the correction and then automatically starts ARM32.
The archive validator reads release metadata from the base manifest and the TV
launcher from the install-time `chrome` module, where Chromium places activities.
It checks that both manifests have the release package and that the exported TV
alias has a MAIN/LEANBACK intent filter.

The generated upload key is RSA 4096, alias `rhenium-upload`. Its public
certificate is [upload-cert.pem](../release/upload-cert.pem), fingerprint
`57d9c5ea386c55957df00d056ce4de665d871d05d1816b52c9373f0b61974d94`.
The private keystore and password stay outside Git, under
`~/.local/share/rhenium/signing/`, and are backed up as encrypted repository
secrets `RHENIUM_UPLOAD_KEYSTORE_BASE64` and
`RHENIUM_UPLOAD_KEYSTORE_PASSWORD`. The [access workflow](../.github/workflows/play-access.yml)
verifies that the backup matches the pinned public certificate. The service
account JSON is a separate credential, used only for Play API authentication.

Play access has been verified for `com.nitesh.rhenium`: authentication and app
access succeed, and the temporary edit is discarded. The first inspection found
no uploaded bundles, APKs or releases. GitHub Actions also restored the encrypted
keystore backup and verified its public certificate fingerprint successfully.
Build and runtime acceptance are still pending.

The [publishing workflow](../.github/workflows/play-release.yml) is manual. Its
`stage` operation downloads the candidate AABs and validation reports from the
GitHub draft `v0.1.0`, verifies their recorded checksums and upload certificate,
and commits only an internal-testing draft. It preserves existing releases,
refuses to overwrite another draft, and does not send changes for review. Its
`download` operation retrieves Play-signed universal APKs, verifies their actual
signatures, package, ABI and alignment, and attaches them to the GitHub draft.
The public GitHub release is published after the artifact and runtime checks.
The workflow must be available on the repository's default branch before its
manual dispatch. Production Play rollout is deliberately outside this workflow.

An interrupted resumable upload is reported as a failure and its edit is
discarded; the tool does not silently retry or change version codes. A later run
can reuse an already uploaded bundle only when Google's SHA-256 matches exactly.

## Shields and the Brave services key

The existing Debug and Static ARM generated headers already contain an empty
Brave services key. The recorded native Shields checks pass network blocking,
cosmetic hiding and scriptlet execution with that configuration. Rhenium ships
bundled filter data and its own signed GitHub filter-bundle updater, which does
not authenticate to Brave's component service. Repeat blocking, per-site
disable/re-enable and filter-refresh checks on the release candidate. This does
not establish availability of other retained Brave-hosted services or every
component-update feed.

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
