# Controls sizing finish review

Disposition: **ship**

Scope: native source, design documentation and final Android TV emulator visual
acceptance at `brave` source `3b2ccb47f4d8283e92f57f5a59233e1ea2520488`.
This is a fresh review of the user's controls/status refinement. The earlier
footer/navigation approval supplies no approval for this result. Physical-TV
installation or acceptance and real-phone acceptance are not certified here.

## persistence

Read `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`,
`.impeccable/surfaces/tv-home-and-menu.md`, `direction.md` and `documentation.md`,
plus the Impeccable skill, craft floor and Android guidance. Ambient and Operate
remain binding. The design files persist the matching fill/focus geometry,
unscaled focus, shared scalable text targets, two-column menu and compact native
Phone states. The sidecar correctly describes its HTML/CSS as illustrations,
not Android behavior or acceptance evidence. No HTML/CSS detector applies to the
Kotlin surface.

Compared baseline `6b49003d65f905fbd16aff8992fd6b6a33861954` through HEAD and
inspected `TvPresentation.kt`, `TvHomePage.java`, `TvPhoneRemote.java` and
`TvPresentationTest.java`. Only those four native files change in that range;
their working-tree content matches HEAD. No shipping raster or other asset is
added. The archive's `provenance.json` and source records identify the same final
source and successful x64 app/test and ARM builds with blocking Android analysis.
ARM APK SHA-256 is
`b30297a1b624c1dda70057add5fa9518dd1868792e8bd4448a78418d5d56dcc3`.

The documentation's pending-review/ARM wording predates the completed evidence
and this review; it does not claim hardware or real-phone acceptance. This
review records the subsequent source/emulator verdict. No design-document
change is required to resolve a controls defect.

## fidelity

Independently opened the original `user-tv-before.jpg` and every required final
image below. All eight final PNGs are 1920×1080 native emulator captures. The
original physical-TV photo is the primary defect evidence; there is no approved
comp, new concept or raster QUALITY BAR for this code-led local refinement.

| Evidence opened | Result |
| --- | --- |
| `user-tv-before.jpg` | Clearly shows the pill outline disagreeing with the rectangular tile and Bookmarks splitting before its final letter. This overrides the prior approval. |
| `home.png`, `home-large.png` | Tabs focus has even rounded corners and a matching outline. Home/Tabs/Favorites share the same text role and target sizing; selected Home remains distinct from focused Tabs. At 1.3 the text grows without clipping or a distorted focus capsule. |
| `menu-disabled.png`, `menu-disabled-large.png` | Focused disabled Browse page retains its disabled appearance with a clear outline that follows the tile. Search, Browse and surrounding actions share aligned target dimensions. Icons and one-/two-line captions are vertically centered at both scales. |
| `menu-bookmarks.png`, `menu-bookmarks-large.png` | Bookmarks stays on one line, with the same 18sp role as its siblings, at both scales. Its mint fill and outline share the same corners. Tabs, History and Downloads retain consistent dimensions and alignment; the scrolling drawer preserves access as text grows. |
| `phone-home-large.png` | A compact phone mark and connected dot replace visible live-status text. The focused shortcut remains a 48dp square with consistent corners and does not widen the header. |
| `phone-webpage-large.png` | The connected status is a small 24dp phone mark inside a 48dp square. The oversized text status is gone. The existing native toolbar overlaps the synthetic fixture heading; this review accepts only the compact badge and does not certify that unrelated toolbar behavior. |

Source corroborates the renders: all button shapes explicitly match across
normal, focused, pressed, disabled and focused-disabled states; the focused and
focused-disabled borders use that shape; focus/press scales are 1.0. Text stays
in native sp. Home text tabs use a 96dp font-scaled minimum width and 48dp minimum
height. Drawer rows use at most two columns, 180dp font-scaled minimum widths,
72dp font-scaled minimum heights, intrinsic growth and scrolling. No font-scale
reduction is used to fit the labels.

Read `native-results.json`: all 14 recorded final checks pass, seven at each of
1.0 and 1.3. The inspected tests substantiate uniform targets, narrow Home
traversal and callbacks, badge dimensions/page-focus preservation/callback and
disposal, live menu updates and Back, and conservative long-title actions.
The recorded additional cases cover Phone invitation cancellation and connected
Home restoration. These are recorded execution results, not tests rerun by this
reviewer. Native server pairing, approval, navigation and disconnect evidence
uses an emulator-local client, not a real phone.

## ceiling

This review inspects the supplied final confirmation matrix after the batched
shape/sizing and content-centering corrections. Every required image is valid
for the scoped review and was opened; no recapture is owed for these controls.
No additional polish, build, device operation or UI edit was performed by this
reviewer. Stop the visual refinement here. Physical-TV and real-phone acceptance
remain separate, outstanding checks and must not be inferred from this verdict.

## material_fixes

None remain within source, documentation and native emulator acceptance.

The user's three material complaints are resolved: matching focus geometry,
consistent scalable targets/type including intact Bookmarks, and compact
connected-Phone status. No rebuild, source fix or further emulator capture is
required. The toolbar/fixture overlap is outside this refinement and receives
no acceptance from this review.

## keep

Keep Ambient's credited landscape, fixed scrims, forest surfaces, warm-white
content, mint focus and white search pill. Keep the selected Home state separate
from current remote focus and retain the native TV font roles and system scaling.

Keep native actions, data ownership and D-pad/OK/Back behavior. The new Home dot
comes from the current native connection label; the full live accessible name
and Phone callback remain. The webpage badge preserves its accessible name,
polite live region, callback, existing palette and page-focus exclusion. Its
native owner still hides it on Home/private tabs and disposes it on disconnect.
The scoped diff does not change transport, approval, security or privacy guards.
