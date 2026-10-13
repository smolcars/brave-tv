---
name: Brave TV Ambient
description: Scenic native Android TV surfaces with forest tones and unmistakable remote focus.
colors:
  pale-mint: "#DCEBDC"
  forest-ink: "#19362E"
  forest-background: "#142726"
  forest-surface: "#28413E"
  warm-white: "#F3EFE7"
  mist-text: "#D0DFD8"
typography:
  display-home:
    fontFamily: "sans-serif"
    fontSize: "36sp"
    fontWeight: 500
    lineHeight: "44sp"
    letterSpacing: "0sp"
  headline-drawer:
    fontFamily: "sans-serif"
    fontSize: "24sp"
    fontWeight: 400
    lineHeight: "32sp"
    letterSpacing: "0sp"
  title-search:
    fontFamily: "sans-serif"
    fontSize: "22sp"
    fontWeight: 400
    lineHeight: "28sp"
    letterSpacing: "0sp"
  title-brand:
    fontFamily: "sans-serif"
    fontSize: "22sp"
    fontWeight: 700
    lineHeight: "28sp"
    letterSpacing: "0sp"
  title-section:
    fontFamily: "sans-serif"
    fontSize: "16sp"
    fontWeight: 500
    lineHeight: "24sp"
    letterSpacing: "0.2sp"
  title-group:
    fontFamily: "sans-serif"
    fontSize: "14sp"
    fontWeight: 500
    lineHeight: "20sp"
    letterSpacing: "0.1sp"
  body-action:
    fontFamily: "sans-serif"
    fontSize: "18sp"
    fontWeight: 400
    lineHeight: "24sp"
    letterSpacing: "0.5sp"
  body-context:
    fontFamily: "sans-serif"
    fontSize: "14sp"
    fontWeight: 400
    lineHeight: "20sp"
    letterSpacing: "0.2sp"
  body-card-detail:
    fontFamily: "sans-serif"
    fontSize: "12sp"
    fontWeight: 400
    lineHeight: "16sp"
    letterSpacing: "0.2sp"
  label-navigation:
    fontFamily: "sans-serif"
    fontSize: "14sp"
    fontWeight: 500
    lineHeight: "20sp"
    letterSpacing: "0.1sp"
  label-credit:
    fontFamily: "sans-serif"
    fontSize: "12sp"
    fontWeight: 500
    lineHeight: "16sp"
    letterSpacing: "0.5sp"
  title-phone:
    fontFamily: "sans-serif"
    fontSize: "26sp"
    fontWeight: 500
  body-phone:
    fontFamily: "sans-serif"
    fontSize: "16sp"
  label-back:
    fontFamily: "sans-serif"
    fontSize: "14sp"
rounded:
  site-initial: "8dp"
  action: "14dp"
  panel: "24dp"
  pill: "32dp"
spacing:
  card-detail: "2dp"
  search-label: "4dp"
  favorite-content: "6dp"
  header-action: "8dp"
  group-content: "10dp"
  card-gap: "12dp"
  home-stack: "14dp"
  header-gap: "16dp"
  drawer-group: "20dp"
  panel-inset: "24dp"
  home-side: "40dp"
  home-bottom: "48dp"
components:
  button-action:
    backgroundColor: "{colors.forest-surface}"
    textColor: "{colors.warm-white}"
    typography: "{typography.body-action}"
    rounded: "{rounded.action}"
    padding: "10dp 16dp"
  button-action-focused:
    backgroundColor: "{colors.pale-mint}"
    textColor: "{colors.forest-ink}"
    typography: "{typography.body-action}"
    rounded: "{rounded.action}"
    padding: "10dp 16dp"
  search-launcher:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.forest-background}"
    typography: "{typography.title-search}"
    rounded: "{rounded.pill}"
    padding: "10dp 16dp"
  search-launcher-focused:
    backgroundColor: "{colors.warm-white}"
    textColor: "{colors.forest-ink}"
    typography: "{typography.title-search}"
    rounded: "{rounded.pill}"
    padding: "10dp 16dp"
  navigation-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.warm-white}"
    typography: "{typography.label-navigation}"
    rounded: "{rounded.pill}"
    padding: "10dp 16dp"
  navigation-selected:
    backgroundColor: "{colors.forest-surface}"
    textColor: "{colors.warm-white}"
    typography: "{typography.label-navigation}"
    rounded: "{rounded.pill}"
    padding: "10dp 16dp"
  card-favorite:
    backgroundColor: "{colors.forest-surface}"
    textColor: "{colors.warm-white}"
    typography: "{typography.title-section}"
    rounded: "{rounded.action}"
    padding: "10dp 16dp"
  card-recent:
    backgroundColor: "{colors.forest-surface}"
    textColor: "{colors.warm-white}"
    typography: "{typography.title-section}"
    rounded: "{rounded.action}"
    padding: "10dp 16dp"
  drawer-container:
    backgroundColor: "{colors.forest-background}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  phone-container:
    backgroundColor: "{colors.forest-background}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
---

# Design System: Brave TV Ambient

## Overview

**Creative North Star: "Ambient"**

A landscape supplies the atmosphere; forest surfaces and warm white keep the
browser legible from a couch. Filled native TV controls and pale mint focus
make the current remote target easy to find. Expression comes from scenery,
tonal layering and generous space.

This system applies to native Android TV Home, the root browser drawer and
Phone panels. It uses AndroidX Compose for TV inside Chromium's native view
and dialog ownership. The separate phone companion is documented in
[brave/DESIGN.md](brave/DESIGN.md); unrelated TV library, settings and security
panels retain their existing presentation.

**Key Characteristics:**

- One bundled landscape with permanent photographer credit and fixed contrast scrims.
- Forest surfaces, warm white content and a pale mint focused target.
- System TV sans typography, scalable text and native D-pad buttons.
- Quiet selected navigation, rounded action tiles and a single-level browser drawer.
- Native state determines labels, enabled actions and return focus.

Extracted from [TvPresentation.kt](brave/android/java/org/chromium/chrome/browser/tv/presentation/TvPresentation.kt),
the native Home, browser controls, Phone and panel owners, and the pinned
AndroidX TV Material 1.1.0 defaults at source
`8aab2fb281c304acf31ed61ce1c4ad08ede4effd`.
[Native evidence](docs/ambient-implementation-evidence.md) records emulator
acceptance and outstanding physical-TV and actual-phone checks. Sidecar
HTML/CSS snippets are component illustrations: they map dp/sp numerically to
CSS px for the documentation panel and do not replace native behavior or captures.
Their generated tonal strips are visualization metadata, not additional native
theme colors.

## Colors

The palette borrows the landscape's forest tones and reserves its lightest
accent for focus, against opaque surfaces that bound contrast.

### Primary

- **Pale Mint** (`pale-mint`): focused filled controls and the search focus border; the scoped Material primary role.
- **Forest Ink** (`forest-ink`): content on a focused control; the scoped on-primary role.

### Neutral

- **Forest Background** (`forest-background`): Home's fallback and opaque drawer/Phone containers; also the unfocused search text.
- **Forest Surface** (`forest-surface`): action tiles, saved/recent cards and selected Home navigation.
- **Warm White** (`warm-white`): primary content and the search pill; shared on-background/on-surface color.
- **Mist Text** (`mist-text`): secondary context, group headings, local clock and photograph credit.

**The Scoped Theme Rule.** Ambient color roles apply to Home, the root browser
drawer and Phone. Extend these scoped roles without changing unrelated panels
or the phone companion's palette.

## Typography

**Display Font:** Android system sans through `FontFamily.SansSerif`.
**Body Font:** The same native TV sans family.

The build uses the pinned TV Material type roles, with a medium Home display
and bold brand override. There is no bundled or downloaded brand font.
Frontmatter preserves native sp measurements rather than browser units.

### Hierarchy

- **Display:** `display-home`, TV Material display-small with medium weight, for the Home heading.
- **Headline:** `headline-drawer`, TV Material headline-small, for Browser controls.
- **Title:** `title-search` for the search launcher; `title-brand` for Brave TV; `title-section` for Home section headings, card titles and the local clock; `title-group` for drawer groups.
- **Body:** `body-action` is TV Material body-large with the observed action-label size override. `body-context` describes empty sections and drawer context. `body-card-detail` is the secondary host line on recent cards.
- **Label:** `label-navigation` styles compact top navigation; `label-credit` styles the permanent photograph credit.
- **Phone:** `title-phone`, `body-phone` and `label-back` record the existing panel's explicit size overrides. Its QR/manual instructions also use the body Phone size in a native TextView.

**The Native Type Rule.** Keep text in native sp and preserve system font
scaling. Reflow columns and permit scrolling as text grows.

## Layout

Home uses a full-screen cropped landscape with a scrollable foreground. Its
safe-space padding is asymmetric (40dp sides, 16dp top, 48dp bottom). The
foreground stacks with the Home gap token. The search launcher fills available
width up to its cap (680dp); it is left aligned beneath the heading.

The header has a brand, four navigation actions, icon-only Settings and browser
controls, and a local clock. Navigation uses adaptive rows (maximum four
columns, 108dp minimum times font scale, 8dp gaps); Phone has weight 1.5 within
its row to fit its live status. Home cards use 120dp minimum columns times font
scale and 12dp gaps, bounded to six Favorites and four Continue browsing items.
The bottom-left photograph credit stays outside the scrolling foreground
(40dp horizontal, 16dp vertical inset).

The browser drawer is right aligned and vertically centered, with a native
right inset (24dp). Its width is the lesser of 540dp and 92% of viewport width;
its content height is capped at 90% of viewport height. Inside, padding is 24dp,
outer sections are spaced by 16dp, groups by 20dp, and group content by 10dp.
All 17 actions remain on one level in Browse, Your library, This page and
Browser groups.

Rows calculate columns from available width, gap and a minimum width multiplied
by `max(1, systemFontScale)`, then clamp to one through the configured maximum.
Drawer tiles use a 140dp minimum and at most three columns. At the verified
1080p emulator density, the drawer changes from three columns at 1.0 text scale
to two at 1.3. Each drawer row takes its tallest intrinsic label's height and
fills its sibling tiles to match; Home and Phone rows keep their natural heights.
Focused items scroll into view with a native margin (24dp above and below).

Phone uses the existing right-side native panel geometry, padding and height
cap. Its outer stack gap is 12dp and scrolling entries use 10dp. The invitation
places an unresampled black/white QR (180dp square) beside manual instructions,
with 24dp between them. The action rows reflow through the same column formula.

## Elevation & Depth

Depth comes from the landscape, fixed contrast scrims, opaque forest panels and
native window dimming. Buttons inherit TV Material's zero tonal elevation and
no glow; there are no custom drop shadows. The browser drawer dims the page
(0.40), while Phone inherits its native panel dim (0.55). The Home scrim uses
the exact four-stop gradient recorded in the sidecar; it does not estimate
contrast from the photograph at runtime.

**The Focus First Rule.** Focus changes the target's fill, content color,
two-dp outline and native scale (1.02). The white search surface remains white
and takes a pale mint outline; other targets take a mint fill and warm white
outline. Selected Home remains a separate persistent state.

## Shapes

Search and compact navigation share the pill radius. Ambient action tiles and
Home cards share the action radius; drawer and Phone containers share the panel
radius. Native icons use vector resources on a 24-unit canvas, displayed at
20dp and tinted from the control's content color. Site initials are content
badges (28dp square, site-initial radius), with the current content color at
12% opacity behind a native title-medium letter.

## Components

### Buttons

Native TV Material buttons own remote activation and enabled, focus and pressed
states. Their inherited content padding is 10dp vertically and 16dp horizontally.
Text-only content adds its observed inner vertical padding (8dp for ordinary
and compact labels, 4dp for search). The component tokens record the outer
padding. Action labels use up to two lines; drawer labels allow three, then
ellipsis. Disabled colors and pressed behavior stay with the pinned TV library.
Icons are nonverbal decoration within named controls, spaced from text by 10dp.

### Inputs / Fields

The white search pill is an address-editor launcher button. It opens the
existing native editor and preserves the selected search provider. The search
vector and title text use the dark content role; focus adds the primary outline
without removing the white surface. Search begins focused. Up reaches Home;
Down reaches the first favorite, otherwise the first recent tab.

### Navigation

Home / Tabs / Favorites / Phone use quiet pills. Home carries the selected
surface and selected semantics even while another control has focus. Settings
and Browser controls are vector-only buttons with accessible names. Phone
retains its control identity while its label observes native connection status;
the label can announce changes and wrap with larger system text.

### Cards / Containers

Favorites show a native site initial over a single-line saved-page title.
Continue browsing places the initial beside the title and secondary host line.
Both use opaque forest surfaces and the same focus treatment as actions.
Titles and host details ellipsize on one line; accessible names retain the full
native label. Real bookmark and tab models populate the bounded rows. Loading
and empty descriptions appear when those models have no cards. Private Home
omits normal saved/recent previews.

### Browser drawer

An opaque rounded panel holds a heading, up to two lines each of native page
and security context, then a scrolling group stack. Group headings carry
heading semantics. Rows align sibling tile heights using intrinsic text size;
text scaling never forces a fixed-height tile. Native dialog Back dismisses the
drawer, and action identity preserves focus while browser state updates.

### Phone

The Ambient panel presents the existing invitation, TV approval, connected,
retry and cancellation states. It keeps the QR/manual pairing content, local
HTTP disclosure and native Continue browsing/Disconnect actions visible in its
scrolling body. Its source-owned labels and dismissal restore the invoking
Home Phone control. Private Home disables Phone. The separate webpage connection
badge retains its previous palette and is outside this Ambient scope.

### Ambient backdrop

One bundled [Lago di Braies photograph](brave/android/java/brave-res/drawable-nodpi/brave_tv_ambient.jpg)
is decoded off the UI thread and cached once. Crop fills Home; a forest
fallback remains behind it. The permanent bottom-left credit reads
“Lago di Braies · Luca Bravo / Unsplash”. The build adds no runtime wallpaper
request, font request or rotation service.

## Do's and Don'ts

### Do:

- **Do** use the scoped Ambient Material color roles for Home, the root drawer and Phone.
- **Do** preserve native TV type roles, sp scaling and adaptive scrollable rows.
- **Do** keep focus visible and distinguish it from persistent selected Home navigation.
- **Do** use native vector icons and full accessible control names.
- **Do** retain the photograph's permanent credit and fixed contrast scrims.

### Don't:

- **Don't** apply the TV Ambient palette to the separate phone companion or unrelated native panels.
- **Don't** lower text scale or impose fixed drawer row heights to fit labels.
- **Don't** replace live native status or saved/recent models with display guesses or sample content.
- **Don't** let the scenic background wash out labels or remove the focused target's outline.
- **Don't** convert the search launcher into a provider-branded or voice-search field that the browser does not implement.
