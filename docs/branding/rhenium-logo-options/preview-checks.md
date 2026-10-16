# Logo exploration checks

The three standalone SVGs parse as XML and are embedded in a self-contained
comparison page. The collaborative browser confirmed three choices, seven
rendered SVG instances, one selected choice, unique mask IDs, and no horizontal
overflow at 728px or 360px. Selection, background and monochrome controls work.
Final captures are `preview-desktop.png` (A, dark) and `preview-mobile.png`
(C, light), independently opened after capture.

The first inspection found a selected-frame outline clipping at the page edge
and a fragmented R counter. One SVG/CSS correction batch resolved these. Final
desktop capture waited for the 150ms border transition and cleared the test's
keyboard focus before capture.

T3 `html_preview` failed with “the page did not finish loading within 20 seconds.”
The supported collaborative browser loaded the page successfully and supplied
the actual render/interaction checks. The final page was then published through
`html_render` for selection. This is a logo-options preview, not Android app
implementation or native launcher acceptance. The existing TV app was untouched.
