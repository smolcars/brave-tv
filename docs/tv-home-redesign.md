# TV home and browser menu design options

Scope confirmed by the user: home and browser menu only. These are browser-based
design previews, with sample favorites and tabs, not changes to the native app.
Keep the current search provider, browser actions, data ownership, D-pad focus,
OK activation, Back restoration, and native/private/security boundaries.

## Exploration

Seven grounded systems were considered: scenic television ambient mode, framed
museum art, coastal travel photography, contemporary blue architectural spaces,
record-sleeve color blocking, cinema foyer wayfinding, and Scandinavian gallery
signage. The direction roll assigned the seventh. The user's explicit Google-app
search and Google-TV/art references bind the exploration: Gallery translates the
seventh into a warm native TV surface; Ambient and Coast remain complete options
because the user explicitly asked for designs to choose from.

The six catalog challengers were declined on audience identification and product
clarity: barcode art, mascot catalogs, scholarly reference setting, dense Japanese
web modules, star atlases, and airport signs do not fit the pinned modern TV
reference. Their useful disciplines are retained as goals: unmistakable focus,
recognizable saved-site identities, stable alignment, all-action coverage,
low-light readability, and visible destinations. No costume controls transfer.

## Option contracts

### Ambient

THESIS: Put the browser inside an expansive landscape, with search as the first
action and a quiet right-side menu.

OWN-WORLD: Forest blue, warm white, pale mint focus; one sans family and filled
TV controls. Landscape is a real credited photograph, not a procedural effect.

STORY: Search, choose a favorite, or return to an existing tab. The menu reveals
the existing controls in clear groups over a protected background.

FIRST VIEWPORT: Full-bleed 16:9 photograph; compact top identity; left-aligned
headline and large white search pill; favorite row and two recent tabs below.

FORM: Scenic TV ambient system, first in the grounded list. The user selected
Ambient and requested a normal Phone entry in the Home navigation.

### Gallery

THESIS: Give art a generous dedicated area and place useful browser controls
beside it, like a modern museum room.

OWN-WORLD: Muted ivory, olive ink and focus, sky blue art area; standard sans
interface and flat filled controls. Actual artist and collection credit.

STORY: Search and saved pages are always legible on an opaque surface; art
enriches the home. A warm left-side menu keeps that structure coherent.

FIRST VIEWPORT: Search and favorites in the left half, a large framed painting
on the right, recent tabs beneath the search region; menu enters from the left.

FORM: Scandinavian gallery signage, seventh in the grounded list; assigned by
the direction roll. Choice remains pending.

### Coast

THESIS: Make frequent browser destinations immediately recognizable in a
compact modern TV dashboard, with a wide menu tray.

OWN-WORLD: Deep maritime blue, bright coastal photography, pale blue focus;
colored saved-site identities and consistent rounded TV controls.

STORY: A small destination rail leads to search, saved pages and recent tabs.
The browser menu makes every existing action visible together.

FIRST VIEWPORT: Narrow left destination rail, photographic upper field, large
search pill, colored favorites, and recent tabs; a broad lower menu tray.

FORM: Coastal travel photography, third in the grounded list. Choice pending.

## Selection and implementation

The interactive artifact is `tv-home-redesign.html`. Home and menu previews are
provided for each direction. Ambient is selected; Gallery and Coast are retained
as unselected references. The [implementation and engineering plan](ambient-implementation-plan.md)
adds first-class Phone connect/disconnect to the Home navigation. Native source
implementation remains pending; its DESIGN.md will describe the built result.

If implemented, use the existing Compose for TV/native state seams, local assets,
overscan-safe margins, system font scaling and reduced motion. Optional artwork
rotation should be a separately confirmed behavior, with native private mode,
memory/performance budgets and original focus/Back contracts verified on TV.

## Assets

- Lago di Braies: Luca Bravo, Unsplash; source and image URL in the asset sidecar.
- Wheat Field with Cypresses: Vincent van Gogh, 1889; The Met Open Access public
  domain image, object 436535. Collection credit stays beside the image.
- Coastal aerial: Dylan Malval, existing Brave new-tab asset, used with permission
  per `brave/components/brave_new_tab_ui/data/backgrounds.ts`.

Preview checks cover composition, menu action coverage, focus and demo controls.
These do not establish native rendering, performance, or hardware acceptance.

## Review evidence

All three prototypes pass search-editor submission, disabled Forward, D-pad
movement, Back restoring home and menu focus, 17-action menu coverage, menu
bounds and footer separation checks. The comparison was captured at 728 px and
360 px wide, and all six individual Home/Menu views at 1280×720.

The finishing review found one material issue: Ambient's navigation needed more
contrast over bright photography. A darker upper scrim and opaque selected Home
surface resolved it; the review measured approximately 6.5–8.0:1 at the prior
sample locations. Final disposition: **ship**, scoped to the scored contrast fix
after the original options review. This is design-preview review, not approval
of native functionality or a selected production identity.
