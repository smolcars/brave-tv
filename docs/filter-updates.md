# Independent Android filter delivery

The Android fork downloads a signed filter snapshot from the public
[`filters-current` release](https://github.com/smolcars/brave-tv/releases/tag/filters-current).
The URL is fixed; no account, cookies or browsing history are sent by the updater.
The request is ordinary GitHub HTTPS traffic, not an analytics request.

The first public snapshot is sequence 2, published 10 October 2026 UTC. Its
[historical release](https://github.com/smolcars/brave-tv/releases/tag/filters-sequence-2)
preserves the artifact, checksum and metadata. This bootstrap republishes the
already-pinned packaged rules. It does not establish that upstream rules are
newly refreshed or that YouTube video ads are universally blocked.

## Client behavior

- Check automatically no earlier than 30 seconds after startup, then daily.
  The last attempt persists across restarts. Manual checks can run sooner.
- Download only over HTTPS, without credentials, with a 60-second deadline and
  24 MiB limit. A failed check leaves the active rules intact.
- Verify the pinned Ed25519 signature, schema, engine/catalog compatibility,
  timestamp and monotonic sequence before atomic staging.
- Keep one immutable snapshot active for the browser process. Apply a verified
  staged snapshot on the next process start and regenerate DAT caches for its
  authenticated payload identity.
- Use packaged rules when there is no valid cached snapshot. An older valid
  installed snapshot remains usable offline; new staged publications must meet
  the freshness check.
- Expose publication date, last attempt, manual check and confirmed restart in
  Settings → Content Filters → Filter updates.

The [source format and signer instructions](../brave/tools/tv/signed-updates.md)
explain the envelope and validation. The [baseline README](../brave/components/brave_shields/resources/bundled/README.md)
explains upstream pins, generation and licenses.

## Publishing a refresh

1. Review and update the pinned upstream revisions, regenerate the packaged
   data, and run the generator/signer tests in the Nix shell. Retain source
   notices, provenance and compatible catalog/permission masks. An incompatible
   engine/catalog change needs an APK update, not only a new feed.
2. Commit and push the corresponding source to `smolcars/brave-tv-core`, then
   pin and push it from this repository. Preserve the build cache.
3. Use the signer with the existing publisher key outside Git, a strictly
   increasing sequence and the actual UTC publication time. Never overwrite an
   existing artifact, publish key material, or reset the sequence for a rollback.
   To restore earlier rules, sign them as a new higher sequence.
4. Independently verify the signature against the public key pinned in the
   client. Record the full-file SHA-256, payload digest, sequence, timestamp,
   source version and artifact size. Prepare release notes linking the exact
   corresponding source, provenance and notices.
5. Publish an immutable historical release `filters-sequence-N` containing
   `filters.bundle`, `SHA256SUMS` and `metadata.json`. Use the full root commit
   SHA for `gh release create --target`; abbreviated SHAs are rejected by the
   GitHub release API. Pass release notes with `--notes-file`.
6. For the first rolling publication, create `filters-current` with the same
   files. For later publications, upload those files to that release with
   `gh release upload --clobber` and update its notes. Keep every historical
   release. Only the signed bundle is consumed by the client; checksums and
   notes are supplemental evidence for people.
7. Fetch the fixed public asset without GitHub authentication, allow only HTTPS
   redirects, and compare it byte-for-byte with the verified local artifact.
   Test the actual browser's staging, restart activation and request blocking.
   Record failures as failures; host tests alone do not establish device delivery.

The publisher key currently exists locally with owner-only permissions.
Independent secure backup/access and ongoing release ownership remain release
checklist items. Refresh publication is currently a deliberate maintainer
operation; there is no unattended upstream-refresh publisher.
