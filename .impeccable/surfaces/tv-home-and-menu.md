# Native TV Home and browser menu

Mode: Operate. Scope: native Android TV Home, the browser action drawer, and the first-class Phone entry. The phone companion keeps its existing visual system.

## Direction contract

- **World:** Ambient, explicitly selected by the user from `docs/tv-home-redesign.html`. One credited landscape, forest blue surfaces, pale mint focus, generous TV spacing, familiar pill search. Google TV and the Google app are the user's craft references; native Brave's actual search provider remains authoritative.
- **First viewport:** Home / Tabs / Favorites / Phone navigation, Settings and browser controls, local clock; a large search pill beneath “Where to next?”; bounded native Favorites and Continue browsing; Luca Bravo credit. There is no hardcoded feed or sample site data.
- **Visitor path:** Search starts focused. Up reaches navigation, arrows traverse native TV buttons. Favorites open saved native URLs, recent cards select the exact native tab. Phone starts the temporary invitation only on entry, requires TV approval, shows connection status, and restores its Home invoker after cancellation or dismissal.
- **Signature interaction:** A white search surface with a pale-mint focused outline remains readable above a scenic plate. All 17 existing browser actions live in grouped, scrollable rows inside one right-side drawer; Back dismisses the drawer.
- **Cross-surface reach:** Scoped Compose TV color roles style Home, root controls and Phone. Existing native panel/security ownership and the unrelated library/settings presentation remain intact. State comes from Chromium and the native Phone owner, never from display guesses.
- **Honest risk / quality bar:** Artwork must remain visible without compromising contrast; scrims supply the contrast bound. TV font scaling can increase scrolling. Native 1080p captures at baseline and 1.3 font scale, actual D-pad traversal, default-build Phone approval/cancel/disconnect, and preserved privacy guards determine acceptance. No HTML/CSS detector runs for this native build.
