# Rhenium identity documentation

Status: reconciled after the independent branding review's **ship** disposition.
Native source: `987fb6a0c30b4ae8a287c9f58784887fb75462dc`.

This is the approved Rhenium / Mint Orbit extension of Ambient. The user chose
logo A and asked to proceed; the existing session authorizes this narrow merge
into the incumbent DESIGN.md. No new visual-world or replacement choice was
needed. The documenter guidance and native Android platform guidance were read.

## Recorded changes

- Root DESIGN.md and the schema-version-2 sidecar now identify the system as
  Rhenium Ambient while retaining the Ambient north star and existing history.
- Added artwork-only `brand-teal` and `brand-sage` primitives. Mint Orbit reuses
  `pale-mint` and `forest-ink` for its other two fills. Interactive theme roles
  are unchanged.
- Added the native `brand-mark` size and `brand-wordmark` component tokens;
  the lockup reuses the existing `header-action` spacing and `title-brand` type.
- Recorded the exact approved vector, editable artwork, native Home/launcher/
  banner/monochrome sources, proportional adaptive insets, and outlined Noto
  Sans Bold banner provenance. Added one noninteractive lockup illustration.
- Recorded Rhenium Home/application/launcher labels and About Rhenium, with
  attribution and native identity/state preservation constraints.

## Evidence checked

Read [PRODUCT.md](../../../PRODUCT.md), the approved
[direction](direction.md), [independent finish review](finish-review.md),
[artwork provenance](../../../assets/rhenium-artwork.md), and the selected
[Mint Orbit SVG](../../../docs/branding/rhenium-logo-options/rhenium-a.svg).
Opened the [comparison preview](../../../docs/branding/rhenium-logo-options/preview-desktop.png)
as selection context; its HTML typography is not the native Home type source.
The editable `assets/icon.svg` is byte-identical to the selected SVG
(SHA-256 `b39686bbc98244e96297dd3bb63c5151e7d50c6325e43a877e9884b72e7debdf`).

Opened and visually inspected every supplied native capture. Each is a valid
1920×1080 PNG:

| Captures | Observed state |
| --- | --- |
| [home.png](home.png), [home-large.png](home-large.png) | Untinted Mint Orbit and native Rhenium title fit at font scales 1.0/1.3; scenery, navigation, cards and both credits remain legible. |
| [nav-focused.png](nav-focused.png), [nav-focused-large.png](nav-focused-large.png) | Tabs has one mint focus target; Home remains independently selected at both scales. |
| [footer-focused.png](footer-focused.png), [footer-focused-large.png](footer-focused-large.png) | GitHub has visible mint focus; footer description and upstream/photographer credits remain intact at both scales. |
| [about.png](about.png) | About Rhenium, version, Brave/Chromium attribution, GitHub, licenses, Settings and Back guidance are visible. |
| [app-info.png](app-info.png) | Android Settings reads Rhenium and `com.brave.browser_default`. This view does not show an application icon, so it proves the label only. |
| [launcher.png](launcher.png) | Native Apps grid shows Mint Orbit and the Rhenium banner on forest. Two matching entries represent emulator APP and TEST installations, as disclosed in the review packet. |

After the parent clarified that read-only local source inspection was allowed,
checked the native header and vector resources directly. The header uses an
untinted decorative Image at 32dp, 8dp spacing and native bold titleLarge text.
The mark preserves the three approved rotations and 35-unit core. The adaptive
foreground and monochrome layer both use 16.6667% proportional insets; the
legacy icon and banner retain the approved flat colors. Banner source confirms
160×90dp dimensions and a 320×180 viewport. Source HEAD matches the commit above.

The finish review supplies the scoped x64 test/build and state-preservation
assessment. This documentation pass did not rerun builds or native tests and
did not access the builder or any device. Final optimized ARM artifact and
physical-TV delivery are the parent's separate work; the nine emulator captures
do not certify hardware appearance, remote feel or performance.

## Verification

Parsed DESIGN.md frontmatter and the JSON sidecar successfully. Checked that:

- New artwork fills, native mark dimensions, lockup gap and native brand type
  agree between the frontmatter, sidecar illustration and inspected sources.
- Every frontmatter reference and sidecar component `refersTo` resolves; all
  color metadata keys match the normative color tokens.
- New identity prose, characteristic, named rule and Do/Don't entries match
  between DESIGN.md and the sidecar.
- Every pre-existing sidecar component, color-metadata entry, motion value,
  shadow value, breakpoint and non-brand typography-metadata entry is preserved.
- Every pre-existing normative frontmatter token is unchanged from the initial
  document; only the two artwork colors and two brand components were added.
- Ambient remains the north star; the existing focus rule and Do/Don't entries
  remain unchanged. The eight canonical DESIGN.md sections remain in order.

Read-back checks confirm the native source links exist, native mark dimensions
and fills agree with the frontmatter, both adaptive insets agree with the
sidecar, and the new inline SVG retains all three approved rotations.
`git diff --check` passes for the three documentation paths.

Only DESIGN.md, .impeccable/design.json and this file were written. No source,
artwork, build, device or repository history was changed.

## Pre-existing drift left for its own task

The narrow identity reconciliation does not repair these incumbent differences:

- Sidecar typography metadata contains `label-page-navigation` without a matching
  frontmatter typography token.
- The sidecar's Overview includes a webpage-navigation paragraph absent from
  DESIGN.md's Overview. Its existing Focus First rule paraphrases the Markdown
  rule rather than reproducing it verbatim.
- The sidecar already has eleven component entries; its Webpage selection cue
  describes a native Canvas overlay without an HTML/CSS illustration. Adding the
  approved brand lockup brings the collection to twelve rather than removing or
  rewriting unrelated component history.
- Incumbent prose repeats page-navigation color literals and records the legacy
  webpage Phone badge palette outside the frontmatter. They are unrelated to the
  approved identity change and are preserved.

Initial document SHA-256 values:
`DESIGN.md`: `a944fa869f368792751a10c585aa976d624519a765c246d24c7050aea0eabd8d`;
`.impeccable/design.json`: `a07b16ca06b6346593d3c1c30bf08b9b1a8ac630fdd85f1e16066e1b686fe874`.
