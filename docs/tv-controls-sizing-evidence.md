# TV controls sizing and compact Phone status

Final Brave source: `3b2ccb47f4d8283e92f57f5a59233e1ea2520488`.

The shared native button now uses matching fill/focus shapes and stable bounds.
Home/Tabs/Favorites share label typography and scalable minimum target widths.
The controls drawer uses two columns with uniform, vertically centered rows and
one text role; Bookmarks stays intact at normal and enlarged text. Home's Phone
shortcut is an icon with a connected dot, and the webpage connected status is a
small phone mark. Both retain their native accessible status and actions.

## Verification

Final x64 app + TEST and optimized ARM builds passed blocking Android analysis.
The inner build durations were 4m13.15s and 4m20.42s respectively; wrapper wall
times were 4m16.34s and 4m24.22s. The ARM APK verifies with the existing development
certificate, uses `armeabi-v7a`, and is non-debuggable.

All [14 final native checks](../.impeccable/review/controls-sizing/native-results.json)
passed: seven cases each at system font scales 1.0 and 1.3. They cover uniform
menu targets and callbacks, narrow Home traversal and equal text-nav sizing,
badge size/page-focus/callback/disposal, menu updates/Back, conservative actions,
and Phone invitation/connected-state restoration. Native pairing, TV approval,
navigation and disconnect also ran through the real server with an emulator-local
test client. An actual phone was not used.

The eight final 1080p captures and the user's original defect photo are under
[controls-sizing](../.impeccable/review/controls-sizing/). The
[independent finish review](../.impeccable/review/controls-sizing/finish-review.md)
reports **SHIP** for source, documentation and emulator visual acceptance, with
no material fixes. Its scope excludes physical hardware and the existing native
toolbar overlap in the synthetic webpage-badge fixture.

The emulator was restored to font scale 1.0, TEST storage app-op default and
normal production Home. Its owned fixture tab and port reverse were removed;
its agent-device session was closed. Existing AVD/build caches were retained.

## Archived artifacts

Directory: `~/.cache/brave-tv/artifacts/controls-sizing-3b2ccb47f-20261016/`.
It contains exact source records, GN args, signatures, badging, build timings,
native results and machine-readable `provenance.json`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `arm/BraveMonoarm.apk` | 368555595 | `b30297a1b624c1dda70057add5fa9518dd1868792e8bd4448a78418d5d56dcc3` |
| `x64/BraveMonox64.apk` | 853312686 | `f4fcd5fdebbd12ae74ac3e95fa7c6ad3c5bbf85a8de42f72586add9fce935595` |
| `x64/BravePublicTest.apk` | 877092945 | `40ee840d8dbe00ea6275c0c969a9df42c45a801d15202a4985057b513c1a489b` |

Raw execution logs are in
`~/.cache/brave-tv/probes/controls-sizing-20261016/`.

## Physical-TV delivery and acceptance

The authorized Chromecast was connected as `192.168.4.50:41531` (Android 14,
ARM32). Before the update, `com.brave.browser_default` was installed under
profiles 0/10/11/12, with app ID `10141` and user-0 data inode `81460`. Its
font-scale setting was unset/default and its IME was stock Gboard; neither was
changed.

The initial in-place install failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE`.
The authorized fallback `cmd package uninstall -k --user all
com.brave.browser_default` returned Success, retaining browser data. Reinstallation
lost wireless ADB before returning a result. When debugging became available again,
multicast discovery found the new connection endpoint `192.168.4.50:39061`.
The previous install had not completed. Its inactive, uncommitted staging session
was abandoned; a bounded recovery attempt was also automatically abandoned after
its client timeout. The final streamed retry returned **Success**. The shared
ADB server was not restarted and no browser data was cleared.

The installed APK's on-device SHA-256 matches the final archived ARM artifact.
App ID `10141`, user-0 data inode `81460` and installed state under all four
profiles match the pre-update records. The four favorites render normally.
No profile wipe, unrelated-app removal or build/AVD cache deletion was performed.

| Physical-TV check | Evidence/result |
| --- | --- |
| Home text navigation | [Tabs focused](../.impeccable/review/controls-sizing/tv-home.png): consistent targets and matching rounded fill/outline |
| Disabled menu focus | [Browse page focused](../.impeccable/review/controls-sizing/tv-menu-disabled.png): outline matches the disabled tile |
| Bookmarks sizing and action | [Bookmarks focused](../.impeccable/review/controls-sizing/tv-menu-bookmarks.png): intact one-line label; OK opens native bookmarks; Back returns to focused Bookmarks, then normal Home search |
| Connected Home Phone | [Native approved connection](../.impeccable/review/controls-sizing/tv-phone-home.png): compact icon and connected dot |
| Connected webpage badge | [Compact badge](../.impeccable/review/controls-sizing/tv-phone-webpage.png): small top-right phone mark; existing toolbar/fixture overlap remains outside this refinement |
| Cleanup | Test connection disconnected, owned reverse removed and owned fixture tab closed; [normal Home restored](../.impeccable/review/controls-sizing/tv-final-home.png) |

[Hardware results](../.impeccable/review/controls-sizing/tv-results.json) record
these checks. Physical-TV acceptance used native D-pad/OK/Back injection and a
temporary test HTTP client exercising native TV approval. It does not establish
human physical-button or actual-phone/Safari acceptance. Font scale remains
unset/default and the stock IME is unchanged. The emulator supplies enlarged-text
coverage; physical font settings were preserved.
