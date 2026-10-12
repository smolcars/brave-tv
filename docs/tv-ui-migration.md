# TV presentation persistence and upgrade contract

Source audit at `e08856652395ea20214e391e5d3533c6b6d1387f`, 11 October 2026.
This records the Stage6.2 schema/rollback decision. In-place baseline upgrade,
private-cache/process-death and failed-write tests remain pending under6.1/6.3.

## Presentation schema

There is no new persisted TV presentation schema or preference key to migrate.
`TvPresentation` holds bounded in-memory Home, panel and focus state.
`TvAddressEditor.State` owns an unsaved `TextFieldState`; neither presentation
file uses `rememberSaveable`, saved-state handles, Bundle serialization or a
separate database. Destroying the view/controller discards drafts, suggestions,
selection and remembered focus. Fresh construction supplies the default focus
and reads authoritative native models again.

The TV Java controller writes only the existing
`BravePreferenceKeys.DEFAULT_SEARCH_ENGINE_CHANGED` flag after native provider
selection. `TemplateUrlService` and `BraveSearchEngineAdapter.setDSEPrefs` retain
their existing preference ownership. Bookmarks/history/downloads, tabs/groups,
Shields, optional lists and signed-update state stay in their original native
models; the new UI adds no duplicate storage, migration marker or schema bump.
The local phone invitation/controller remains bounded in-memory session state,
with existing background revocation and no command replay.

`TvBrowserControls.onPause` dismisses the editor, clears its context and revokes
the phone session. The editor's dismissal listener clears text, undo history,
errors and suggestions before disposing composition. `TvHomePage.destroy`
removes model observers, empties its bounded lists/maps and disposes its view.
Scroll components can use framework saveable scroll offsets; no private draft,
URL, action payload or browser model is serialized by the TV presentation.

Native cache protection needs its own evidence. The retained Chromium
`ChromeActivity.onPauseWithNative` and `TabModelSelectorImpl.cacheTabBitmap`
still call the existing `TabContentManager` capture path. The TV cards request
no new thumbnails, and Address is a separate dialog from the native page, but
`FLAG_SECURE` alone does not prove protection of Chromium's internal thumbnail
files. Check actual private cache/saved-state behavior with synthetic data;
do not infer it from a protected Android window or disable protection to inspect
the screen. This audit does not mark Stage6.3 passed.

Consequently repeated UI construction has no migration write to repeat, and
missing/old TV presentation values cannot invalidate startup. The actual fresh
sourcee0e3 startup/Home/default checks and native5.3 provider selection/restoration
cover default construction and existing preferences. The matched source5829→b3a9
in-place hosting test retained five normal tabs and DuckDuckGo selection;
[the inventory](tv-ui-inventory.md#matched-emulator-feasibility-and-hosting-decision-11-october)
records that limited predecessor check. It does not substitute for the complete
Stage6.1 tabs/groups/bookmarks/history/Shields/filter upgrade fixture.

## Compatible rollback

Rollback means rebuilding the previous compatible TV presentation against the
same pinned Chromium `155.0.8059.40`, native storage implementation, package
`com.brave.browser_default` and signing certificate. Preserve the user's profile
and all compile caches. First confirm the previous source still uses that engine
pin, signing lineage and Android-compatible version code; install the verified
artifact in place only after those checks. Source5829 is the migration baseline,
not authorization to downgrade an arbitrary newer Chromium profile.

If an engine/profile-format upgrade occurs later, use a compatible presentation
revert on the newer engine. Do not downgrade profile formats, uninstall to make
an update work, clear application data, copy private session files into a normal
profile or add a replacement Room store. No actual rollback of the current
profile is claimed by this source audit.

## Remaining native migration acceptance

Preserve a source5829 baseline AVD with synthetic normal tabs and a real stored
group, a uniquely named favorite/history visit, a nondefault search provider,
an owned Shields exception and an optional-list preference. Record native IDs,
values and verified baseline APK provenance without private payloads. Update
that AVD in place with the reviewed current APK; require unchanged identities,
native values and usable TV routes, then ordinary process relaunch.

Keep the current integration profile intact. Private drafts/normal-library
exclusion, actual process death, native thumbnail/saved-state protection, scoped
clearing and interrupted/failed writes need their own engine evidence. Do not
fill the host or unrelated AVD disks to manufacture low storage, alter security
flags for failure screenshots or claim a host/mock check proves native data
integrity. Physical optimized performance, second TV and real-phone acceptance
remain deferred.
