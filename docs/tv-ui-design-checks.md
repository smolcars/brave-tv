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
| First saved page | 3 | Not recorded |
| Settings | 5 | Not recorded |
| Page to controls | 1 | Existing Back route retained |
| Address cancel to invoking controls | 1 | Existing cancel route retained |
| Fullscreen exit | 1 | Existing native fullscreen Back retained |
| Destructive confirmation: Cancel / confirm | 1 / 2 | Existing Cancel-first policy retained |

Bookmarks adds one press from Home; the direct saved-page preview avoids opening
the library for the common first favorite. Address, controls and tabs add no
menu level. Security/destructive confirmations remain owned by their existing
native owner. Complete missing baseline comparisons before checking Stage1.6.

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
