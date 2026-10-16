# Controls sizing documentation merge

The user's [physical-TV photo](user-tv-before.jpg) supersedes the earlier
navigation/menu approval. It shows the focus capsule extending beyond a
rectangular menu fill and “Bookmarks” splitting before its final letter. The
requested refinement also replaces the oversized connected-Phone status with
an icon. Ambient remains the selected world; this is a scoped documentation
merge of the native implementation.

The source of truth is `brave` HEAD
`3b2ccb47f4d8283e92f57f5a59233e1ea2520488`:

- `b47fca975`: matching focus shapes, consistent navigation/menu sizes and compact Phone status.
- `1a89c6b17`: current header labels in the narrow-navigation regression fixture.
- `3b2ccb47f`: icon/caption centering inside menu tiles.

Read sources: `TvPresentation.kt`, `TvHomePage.java`, `TvPhoneRemote.java`, the
native presentation regression tests, and the existing phone/bookmark/tabs
vector resources. The source paths are under
`brave/android/java/org/chromium/chrome/browser/tv/` (presentation in
`presentation/`), `brave/android/javatests/org/chromium/chrome/browser/tv/`,
and `brave/android/java/brave-res/drawable/`.

| Area | Prior documented behavior | Merged native behavior |
| --- | --- | --- |
| Focus | Default focus-border silhouette and 1.02 focus enlargement | Fill, focused, pressed, disabled and focused-disabled shapes match; focused and focused-disabled borders explicitly use that shape. Focus/press/focused-disabled scale is 1.0. |
| Home text navigation | Content-sized 32dp pills | Home/Tabs/Favorites share 12dp corners, 14sp one-line labels, 96dp × `max(1, systemFontScale)` minimum width and 48dp minimum height. FlowRow keeps 8dp gaps and natural wrapping. |
| Home Phone | Visible live-status text could widen the header | Icon-only 48dp target, 20dp phone vector and native connected-state 6dp dot. The full status stays in the polite live accessible name; native callback, disabled/private state and return focus remain. |
| Drawer grid | 140dp minimum widths, up to three columns, up to three caption lines | 180dp × `max(1, systemFontScale)` minimum widths, at most two columns and 10dp gaps. All captions use 18sp, at most two lines, then ellipsis. |
| Drawer height/alignment | Intrinsic tallest-label sibling height | Shared 72dp × `max(1, systemFontScale)` minimum height plus intrinsic growth. A `fillMaxSize` inner row vertically centers the 20dp icon and weighted caption, with 10dp gap and 16dp horizontal/10dp vertical padding. |
| Webpage Phone status | Visible connected-status text | A 24dp phone vector in a 48dp target with 12dp corners and no visible label. Existing legacy surface/accent, live accessible name, pointer/accessibility callback, page-focus exclusion and native disposal remain. |
| Shared icon actions | Inherited content padding and compact pill shape | Zero icon content padding and 12dp corners; the footer keeps its explicit 56×48dp GitHub target and existing layout. |

`DESIGN.md` records the native primitives and application rules. The
`.impeccable/design.json` sidecar updates matching focus states, removes the
old scale expansion from every affected illustration, and depicts the compact
Phone shortcut and webpage badge. Existing native vectors are inlined without
new assets; the tabs and phone path data are copied from their native resources.
The sidecar maps dp/sp numerically to CSS px for illustration. It does not
simulate Android font scaling, native focus, lifecycle, connection ownership or
privacy guards.

The scenery, photograph credit, fixed scrims, forest palette, search pill,
favorite/recent models and footer layout retain their existing direction.
The webpage badge retains its separate legacy palette. No shipping raster was added.

The final x64 app and test build, including blocking Android analysis, passed
at `3b2ccb47f` in 4m13.15s. All 14 native checks pass at this source:
[native-results.json](native-results.json) records seven cases at each of font
scales 1.0 and 1.3. They cover uniform targets, narrow Home focus/callbacks,
badge size/page-focus/disposal, live menu updates/Back, conservative actions,
Phone invitation cancellation and connected-state restoration.

The eight 1080p emulator confirmation captures replace the first-pass images:

| State | Font scale 1.0 | Font scale 1.3 |
| --- | --- | --- |
| Home navigation | [Home](home.png) | [Home, enlarged text](home-large.png) |
| Disabled Browse focus | [Disabled Browse](menu-disabled.png) | [Disabled Browse, enlarged text](menu-disabled-large.png) |
| Bookmarks focus | [Bookmarks](menu-bookmarks.png) | [Bookmarks, enlarged text](menu-bookmarks-large.png) |
| Connected Home Phone shortcut | — | [Connected shortcut](phone-home-large.png) |
| Connected webpage badge | — | [Compact badge](phone-webpage-large.png) |

The captures show matching focus/fill geometry and centered menu content;
Bookmarks stays on one line at both scales. The Home Phone shortcut shows its
connected dot, and the webpage badge is compact. The webpage capture was refreshed
after the existing three-second hint faded. It supplies evidence for the badge;
the existing native toolbar overlap with the synthetic fixture heading is outside
this refinement and receives no acceptance here.

Native server pairing, TV approval, connected state, navigation and disconnect
were exercised with an emulator-local test client. This does not establish
physical-phone acceptance. The [independent finish review](finish-review.md)
reports SHIP for source, documentation and emulator visuals, with no material
fixes. The optimized non-debuggable ARM build, blocking analysis, development
signature and ARM32 ABI checks also pass. Exact artifacts and the interrupted
physical-TV installation are recorded in [delivery evidence](../../../docs/tv-controls-sizing-evidence.md).
Physical-TV and real-phone acceptance remain unverified. The before photo supplies
defect evidence, not acceptance of the replacement.
