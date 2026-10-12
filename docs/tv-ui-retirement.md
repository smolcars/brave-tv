# TV presentation retirement audit

Source `8c4e31c95eb580db4624a884202e81df82be344e`, 12 October 2026.
This records source ownership and prior replacement acceptance for Stage6.4.
Native cache and file-picker checks now have separate accepted emulator evidence;
this ownership audit does not substitute for runtime or hardware acceptance.

| Retired presentation | Current owner and retained boundary | Acceptance |
| --- | --- | --- |
| Programmatic TV Home rows/buttons | `TvHomePage` supplies `TvPresentation.home`; `BasicNativePage` and native tab/bookmark observers remain | Stage4.1–4.2 native Home/model/private tests |
| Giant outlined controls | `TvBrowserControls.showControls` uses `TvPresentation.controls`; controller retains native commands, document checks and cursor | Stage3.3/4.3–4.4 actual input/navigation/security/media |
| Java-built tabs/bookmarks/settings rows | `TvBrowserPanel` creates Compose content inside the existing native dialog owner | Stage4.5/5.1/5.3 focus, paging, stable identity, removal and policy |
| Java-built history/filter views | `TvHistoryPanel`/`TvFilterPanel` supply bounded panel entries; original bridges and disposal remain | Stage5.1/5.4 native history and signed resource enforcement |
| Mobile TV menu/tab/address entry routes | `BraveActivity.maybeHandleTvMenuAction` routes accepted commands into the same TV controller | Stage4.8 r46/r47 eight-route/one-panel and private rejection |
| Mobile TV toolbar presentation | Existing native visibility delegate supplies TV offsets while retaining guarded error/security/editable behavior | Native viewport/resize/navigation/fullscreen tests; errors retain their guard |

The controller has one construction site in `BraveActivity`. Home has one
TV-only factory; no alternative Home renderer or presentation migration switch
remains. TV sources contain no legacy `LinearLayout`, `TextView`, `Button` or
layout inflation implementation for these panels. Their GN Java entries and the
Compose presentation target are live and necessary.

The remaining `GradientDrawable` is the focus adapter for trusted native
dialogs, including the grouped-tab conservative Cancel behavior. Cursor drawing,
native Address input, content/media ownership, reauthentication and platform
results remain necessary native bridges. `TvHistoryPanel`, `TvFilterPanel` and
`TvBrowserControls` retain their class names because callers still require their
model/lifecycle responsibilities; deleting them would break working boundaries.

All166 TV messages have callers in Java/Kotlin except the launcher label, which
is referenced by the Android manifest. Launcher banner/icon resources and shared
mobile layouts remain live. No unreferenced TV resource, temporary toolkit
switch or duplicate browser store was found in this scoped audit. Dependencies
remain pinned in the source fork and compiled through GN.

No new source deletion is needed: replaced layout construction and competing
routes were removed in the accepted vertical slices. File pickers and security
surfaces remain with Chromium/Android owners; their remaining compatibility
limits are documented under5.6, not concealed by retirement. The new
`TvFilePickerGuide` belongs to UiBase; its activity host supplies TV guidance
without a reverse UiBase-to-Chrome dependency. Original Android chooser results
and permissions remain unchanged. TV private-thumbnail eligibility belongs to
the existing native tab-UI module and cache, with no presentation database.

The final source/166-message/AAR audit is retained in
`~/.cache/brave-tv/probes/engine-lifecycle-r1/retirement-final-r59.json`.
