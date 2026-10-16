# Compact Home documentation

Status: scoped documentation reconciliation complete. The footer persistence
finding in `finish-review.md` is addressed. Final footer and compact-navigation
captures are verified at baseline and 1.3 text scale; the independent final
review is recorded separately.

Updated only `DESIGN.md`, `.impeccable/design.json` and this evidence record.
The existing Ambient world, PRODUCT.md, palette, named rules, unrelated tokens
and unrelated component snippets are preserved.

## Evidence checked

- Full document reference, PRODUCT.md, the inherited TV surface contract, local
  `direction.md`, existing design files and `finish-review.md`.
- Native source at `brave/` commit
  `0b103706dae9b831eb8c5f4223937502a9379c39`: `TvPresentation.kt` Home, theme and
  ActionButton; `TvHomePage.java` GitHub callback/icon mapping; the registered
  official GitHub drawable and its source provenance.
- `home.png`, `home-large.png` and `github-focused-large.png`: 1920×1080 footer
  captures from `ddc71b787`, at baseline and 1.3 font scale with Search/GitHub
  focus. They show the compact footer and the previous navigation geometry.
- Final native `6b49003d65f905fbd16aff8992fd6b6a33861954` captures:
  `home-final.png`, `home-large-final.png`, `nav-focused-final.png` and
  `github-focused-large-final.png`. They show compact navigation and footer at
  1.0/1.3 text scale, with Search, Tabs and GitHub focus. All are 1920×1080 and
  include the complete Home composition. The navigation stays on one row at
  both captured scales.

## Recorded changes

The maintained files now describe the regular 12sp warm-white description,
regular 11sp mist credits, 16sp line height and 0.2sp tracking; footer insets of
4dp top, 40dp sides and 12dp bottom; 2dp text gaps; space-between attribution
flow with 20dp trailing upstream padding; and 20dp to the icon-only 56×48dp
GitHub action. The official 98×96 Invertocat path/aspect is retained in the
sidecar illustration. The baseline footer is 64dp and reserves actual native
height outside the scrolling foreground.

Navigation documentation now matches content-sized pills in the remaining
header width, a FlowRow with 8dp gaps, 48dp minimum target height, and zero
additional compact-label inner vertical padding. It preserves the 10dp/16dp
outer padding, 14sp medium labels, current Home semantics, live Phone state
and native focus ownership.

## Validation and limits

YAML and JSON parse successfully; component properties stay within the
eight-property schema and references resolve. Palette, narrative, motion and
unrelated component illustrations match their prior values. Contradictory
108dp/weighted navigation, medium footer labels and bottom-left credit guidance
were removed only where related to this change.

The documenter's initial pass was source-based; the parent subsequently
verified the final native captures against the documented geometry and roles.
Native interaction checks and final independent review are recorded in the
implementation evidence. No builder or device was changed by the documenter.
No HTML/CSS detector applies to the native
Kotlin implementation; sidecar HTML/CSS remains illustrative documentation.

Pre-existing unrelated drift left unrepaired: sidecar typography metadata
`label-page-navigation` has no corresponding DESIGN.md frontmatter primitive.
Repairing that webpage-navigation record falls outside this Home component
extension. No defect was promoted into an Ambient rule.
