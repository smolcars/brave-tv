# Licensing and attribution

## Rhenium contributions

Unless a file or its accompanying notice states otherwise, Rhenium's original
source code, documentation and original artwork in this repository are made
available under the Mozilla Public License, version 2.0. The complete license
is in [LICENSE](LICENSE).

This default does not replace existing notices or relicense third-party work.
Copyright and license notices supplied with individual files remain applicable.

## Browser source and dependencies

- **Brave Core:** the browser source is maintained in
  [smolcars/brave-tv-core](https://github.com/smolcars/brave-tv-core), checked out
  here as the `brave/` submodule. Brave-derived source and modifications retain
  their MPL 2.0 terms and contributor notices. See the
  [source license](https://github.com/smolcars/brave-tv-core/blob/master/LICENSE).
- **Chromium:** retains its
  [BSD-style license](https://chromium.googlesource.com/chromium/src/+/main/LICENSE)
  and third-party notices. Its dependency licenses are not replaced by this
  repository's MPL 2.0 license.
- **Filter data and scriptlets:** retain the notices and licenses of their
  upstream sources, including GPL-3.0 for uBlock Origin lists and separate
  notices for EasyList, EasyPrivacy and Fanboy lists. See the
  [bundled filter documentation](https://github.com/smolcars/brave-tv-core/blob/master/components/brave_shields/resources/bundled/README.md)
  and its recorded provenance.

The browser's **Settings → About Rhenium → Open-source licenses** action opens
the native third-party license information. Keep upstream notices and the
corresponding source available when distributing browser builds.

## Visual assets

- **Home photograph:** Luca Bravo, distributed under the Unsplash License.
  [Original photograph](https://unsplash.com/photos/brown-wooden-boat-moving-towards-the-mountain-O453M2Liufs)
  and [recorded provenance](docs/tv-redesign-assets/dolomites-source.json).
- **Banner lettering:** outlines from Noto Sans Bold, distributed under the
  SIL Open Font License 1.1. No font binary is bundled for the banner; see
  [artwork provenance](assets/rhenium-artwork.md).
- **Starter-favorite service logos:** YouTube, Netflix, Prime Video and Twitch
  retain their respective owners' rights. Their inclusion identifies bookmarked
  websites and does not grant rights under MPL 2.0. Official source URLs and
  asset hashes are recorded in [asset provenance](docs/tv-starter-favorites-assets.json).
- **Other sourced artwork:** follows the provenance and license recorded with
  each asset, including the other design explorations under `docs/`.

The software license does not grant trademark rights. Preserve applicable
attribution and brand-use terms when redistributing third-party assets.
