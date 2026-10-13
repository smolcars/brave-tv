# Brave TV

<!-- impeccable:product-schema 1 -->

## Platform

android

## Scope

Native Android TV browser home and browser menu. The user selected Ambient and
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
Controls include address, back, forward, reload/stop, tabs, favorites, history,
downloads, media, Shields, settings, pointer, scroll, fullscreen, home, and the
phone remote when available. Native security and private browsing remain native.
Presentation uses AndroidX Compose for TV in the existing Chromium GN build.
The planned Home Phone entry observes the current native session and supports
connect/disconnect without local-build or experimental-switch requirements.
This promotion is planned, not yet implemented; the existing transport is HTTP.

## Brand Commitments

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
