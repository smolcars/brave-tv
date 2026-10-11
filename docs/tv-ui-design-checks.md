# TV design checks

Source `609bb6e33e634c329cb0e986e3444e840f5688e5`, using the
[synthetic prototype](../brave/docs/tv-ui-design-prototype.html) in T3 preview.
These are design measurements, not native APK or spoken accessibility acceptance.

One press means one arrow, OK or Back; text entry and network loading are
excluded. Start at Home Address unless the table names another starting point.
The fixture has three normal tabs, two saved-page cards, an Add favorite card
and one recent-page card. Counts do not establish bounds for arbitrary native
collections or the six/four production preview limits.

| Task | Prototype presses | Preserved native baseline |
| --- | ---: | --- |
| Address editor | 1 | 1, Home's direct Address action |
| Browser controls | 2 | 2, Right/OK in `tv-home.ad` |
| Tabs | 3 | 3, Right/Up/OK in `tv-toolbar-tabs.ad` |
| Bookmarks/library | 4 | 3, Right/Right/OK in `tv-home-bookmarks.ad` |
| First saved page | 3 | 9, measured source5829/native Mobile bookmarks |
| Settings | 5 | 5 on first entry; 4 with Home remembered in controls |
| Page to controls | 1 | Existing Back route retained |
| Address cancel to invoking controls | 1 | Existing cancel route retained |
| Fullscreen exit | 1 | Existing native fullscreen Back retained |
| Destructive confirmation: Cancel / confirm | 1 / 2 | Existing Cancel-first policy retained |

Bookmarks adds one press from Home; the direct saved-page preview avoids opening
the library for the common first favorite. Address, controls and tabs add no
menu level. Security/destructive confirmations remain owned by their existing
native owner. The old controls remember their last action: Settings is one press
quicker when that action is Home. The prototype's Home-to-Settings route uses
five presses from Address consistently; it adds no confirmation/menu level.

The two missing baseline comparisons now run on the signed source5829 APK in
the separate `brave_tv_onboarding_api36` profile. The favorite is seeded through
native bookmark controls into Mobile bookmarks. Its nine-press route is
Right/Right/OK to Bookmarks, Down/OK to Mobile bookmarks, Down/Down/OK to the
saved item's detail, then OK to Open bookmark. Each intermediate focus and the
actual fixture's Clicks:0/committed URL are asserted. Cached evidence:
`~/.cache/brave-tv/probes/baseline-favorite-r1.json` and
`baseline-settings-r1.json`. The initial Settings five-press path is checked
manually; the later four-press path has its own focus assertions. A replay with
the wrong remembered focus correctly fails and is not counted as a pass.
These are bounded initial-state comparisons; history, remembered controls,
folder depth and collection size can change native counts. No data is cleared,
and this baseline profile is retained for later in-place migration.

At1280×720 the spatial focus graph reaches every enabled action in each of nine
routes. Maximum presses from each route's initial focus, including activation:
Home7, controls4, tabs4, library4, settings5, private tabs2, private Home2,
phone approval2, clear-data confirmation2. These include explicit Back/demo
actions, so the task table is more useful than the overall maximum. Disabled
Forward is skipped. Horizontal arrows on the full-width Address do not jump to
another row; edge arrows do not wrap.

Fourteen route checks pass after review corrections: page-controls to
Tabs/Library/Settings and remote/visible Back restore the exact controls invoker;
Home Source/Licenses and either Back restore their exact Home invoker; nested
Home-controls-address Back/Back restores Home; page-history Back does not trap
controls; new/final-tab recovery gives Home Address focus and usable Home Back.

Long multilingual titles, LTR/RTL and synthetic CSS text scales1/1.3/1.6 produce
no horizontal screen overflow in nine routes at1280×720 and1920×1080
(108 combinations). This does not prove Android font scaling, overscan, spoken
state, screen-reader traversal or every native target's semantics. Stage1.5
remains unchecked until those acceptance checks pass.

Native partial checks on the1920×1080/320dpi TV emulator: source da462 Home,
both controls pages and address editor remain readable and remote-reachable at
Android font scale1.6. The22-step controls replay passes at scale1.3; scale1.0
is restored. On source d558, all14 actual IME Unicode/selection/deletion/
composition steps pass and the fixed error's native polite live-region probe
goes GREEN after its predecessor RED. No editor contents are captured by that
probe. Announcement metadata alone does not check Stage1.5.

Production38e2 Arabic checks pass for English fallback punctuation in RTL Home,
mirrored action-row arrows, Settings Back to its exact Home invoker and all
Settings rows at native font scale1.6. Original locales[] and font scale1.0 are
restored. These cover Home/Settings, not every localized surface.

Actual TalkBack16 speech on that APK announces Home actions as buttons and the
current search provider as Selected. D-pad/OK reaches Settings and its provider/
clear-data panels; Back returns through Settings to Home. Cached normal-only
WAV/action offsets and unconstrained offline transcripts are under
`~/.cache/brave-tv/probes/vosk-spoken`. Recognition errors in proper names prevent
claiming verbatim label accuracy. All seven saved accessibility settings are
restored. At that point broader spoken state/error and screen-reader traversal
checks remained pending.

Stage1.5 emulator acceptance now passes on production source1edfe7a0a and
corrected test source054403030. Native r26 passes all three narrow-layout
regressions: Home traversal/callback identity, controls updates/Back with safe
focus edges, and an exceptionally long multilingual production-panel title
with conservative Cancel/Right/Left. Its cancellation/private-replacement
case also passes. Its deletion-owner case fails a visible-text lookup after
scrolling, while r27 passes at normal font size; r28 passes the corrected case
at font1.6 after D-pad Up exposes the empty message. Exact history and file
owners remain asserted. These are separate runs, not a claimed5/5 r26 result.

Production checks cover1280x720/density320/font1.6/ar and1920x1080/font1.6/en:
Home actions, disabled controls, restored More focus, Settings scrolling,
mirrored confirmation arrows, Cancel preservation and exact invoker restoration.
The empty Downloads message is fully visible after one D-pad Up; editor Clear,
Cancel and Back remain inside safe edges without recording editor contents.
At restored1920x1080/font1.0/en the18-check controls/Home flow passes, retaining
the normal four-column shortcuts. Cached evidence lives under
`~/.cache/brave-tv/probes/a11y-states-r1`: `display-confirmation-r5.json`,
`display-empty-visibility-r6.json`, `display-editor-r7.json`,
`display-wide-confirmation-r9.json`, `display-restored-r10.json` and
`display-restored-r11.json`. Partial helpers that stop on wrong traversal or
case-sensitive translated-label assumptions are retained as partial results.

Actual productionb35a TalkBack state/error checks speak Downloads and its empty
state, disabled controls and the native oversize-address rejection. Native r24
passes7/7 semantic/state tests, including polite status and non-live byte
progress. Immutable normal-only audio and verified unconstrained decoder prefix
hashes are retained in `green-audio-provenance.json`; display changes preserve
these semantics. This is spoken evidence, not an inference from live-region
metadata. All seven accessibility settings and the saved font, display size,
density, app locale and existing synthetic IME match their before values after
the automation lease closes. No profile or cache was cleared.

Stage1 is6/6 for the authorized emulator scope. Physical overscan, hardware
screen-reader behavior and the broader sustained accessibility/localization
matrix in Stage6 remain pending. This does not accept all feature stages.
