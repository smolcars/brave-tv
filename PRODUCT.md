# Rhenium

<!-- impeccable:product-schema 1 -->

## Platform

android

## Scope

Native Android TV browser Home, browser menu and webpage remote navigation. The user selected Ambient and
requested an implementation and engineering plan, including promotion of phone
pairing from experimental to a normal Home feature. The phone companion keeps
its existing visual system; feature-status wording is part of the promotion.

## Users

People browsing on a television with its physical remote. Couch viewing and
variable room lighting are operating assumptions based on the TV platform.

## Product Purpose

Browse ordinary websites through Brave's existing Chromium engine using TV-native
home, search/address entry, tabs, favorites, and browser controls.

## Capabilities and Constraints

Preserve the existing browser actions, selected search provider, native data,
remote focus, OK and Back behavior. Home has favorites and recent normal tabs.
YouTube, Netflix, Prime Video and Twitch are user-requested starter bookmarks,
added once to eligible normal TV profiles and editable in the native library.
Existing saved items keep their titles, URLs and order; deletions stay removed.
These four sites use bundled official marks, without tint or runtime fetching.
Controls include address, back, forward, reload/stop, tabs, favorites, history,
downloads, media, Shields, settings, element navigation, pointer, scroll, fullscreen, home, and the
phone remote when available. Native security and private browsing remain native.
Home's bottom footer reads “A simple browser with ad blocking and private browsing.”
It credits Brave/Chromium and the photographer, and opens the public GitHub project.
Presentation uses AndroidX Compose for TV in the existing Chromium GN build.
The implemented Home Phone entry observes the current native session and supports
connect/disconnect without local-build or experimental-switch requirements.
Native TV approval, cancellation, connected-state restoration and disconnect
pass on the Android TV emulator. The existing transport is local HTTP, disclosed
in the pairing panel and companion. Physical TV and real-phone acceptance of
this redesign remain outstanding.

Webpages start in element navigation. Remote arrows jump between visible selectable
elements, then scroll the nearest eligible container at its visible edge.
Short OK activates once; hold OK for 650ms switches between element navigation
and the pointer without activation. Down continues scrolling to the document
end without wrapping. Unsupported focused embedded frames use the pointer.
Native keyboards, dialogs, security/private locks and fullscreen players retain
input ownership. A native mint outline follows the current element; hints fade
after three seconds and the pointer wakes on movement.

## Brand Commitments

The browser name is Rhenium. The user selected Mint Orbit (logo option A):
three flat mint, teal and sage circular segments around a forest-green core.
Use the approved SVG geometry for native icons and launcher artwork. Preserve
Brave/Chromium attribution and the existing package/signing/profile identity
during the branding rollout.

The user wants a modern, beautiful TV home and menu with a search bar inspired by
the Google app and scenic or artist backgrounds inspired by idle Google TV.
Ambient is the selected world: full-screen landscape, forest surfaces, warm
white, mint focus and a right-side browser menu. Home navigation includes Phone.
Search branding must follow the user's selected engine; visual inspiration does
not authorize changing the provider or adding voice search.

## Evidence on Hand

`brave/android/java/org/chromium/chrome/browser/tv/presentation/TvPresentation.kt`,
`TvHomePage.java`, `TvBrowserControls.java`, and the TV route/focus inventory in
`docs/tv-ui-inventory.md`. Existing artifact screenshots provide incumbent visual
evidence. Design previews use sample bookmarks/tabs and are not APK acceptance.

## Product Principles

- Make search and returning to saved or open pages easy to see from a couch.
- Keep one unmistakable focus and predictable remote navigation.
- Preserve native browser capabilities and trusted state ownership.
- Let ambient art enrich the home without obscuring its controls.

## Accessibility & Inclusion

Readable TV-scale typography, overscan-safe margins, named controls, visible
focus, readable disabled states, and reduced motion. Any selected direction
still needs native font-scale, focus, performance, and device verification.
