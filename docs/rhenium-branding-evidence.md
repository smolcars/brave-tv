# Rhenium branding delivery

16 October 2026. The user approved Rhenium and **A · Mint Orbit**. The
accepted vector is `docs/branding/rhenium-logo-options/rhenium-a.svg`, shown in
that directory's `preview-desktop.png`; older generated concepts are historical.

## Source and scope

Brave source: `987fb6a0c30b4ae8a287c9f58784887fb75462dc`.
The native TV Home now uses the selected untinted mark beside the scalable
Rhenium wordmark. The launcher label, adaptive and legacy icons, TV banner,
TV-qualified application icon and About title use the same identity. The banner
contains outlined Noto Sans Bold; editable vectors and provenance are in
`assets/rhenium-artwork.md`. No generated raster is shipped as the logo.
Package `com.brave.browser_default`, launcher alias, signing certificate,
profile storage, all browser actions and upstream/photographer credits remain.

## Emulator verification

The x64 APP+TEST build passes with blocking Android analysis. The first attempt
failed on unannotated TV icon aliases and a missing monochrome adaptive-icon
layer; both resources were corrected in the final source and the checks rerun.
The native icon regression draws the packaged adaptive icon at 32dp and 80dp,
verifying stable visible proportions rather than fixed-pixel padding.

Eight isolated instrumentation invocations pass: icon scaling, narrow Home
focus/callbacks, footer destination in the current tab, and private Home section
exclusion, each at font scales 1.0 and 1.3. The production app update preserves
app ID `10088` and user-0 data inode `344545`. Both build signatures verify.

Nine validated native 1920×1080 captures are under
`.impeccable/review/rhenium-branding/`: `home.png`, `home-large.png`,
`nav-focused.png`, `nav-focused-large.png`, `footer-focused.png`,
`footer-focused-large.png`, `about.png`, `app-info.png`, `launcher.png`.
The system app-info screen proves the label; this TV Settings implementation
shows no icon. The actual native launcher grid proves the TV banner. There are
two Rhenium entries only on the emulator because APP and TEST are both installed.
The emulator was returned to normal production Home, font scale 1.0 and TEST
storage appop default, with its automation session closed.

Raw build/install/native logs and source pins:
`~/.cache/brave-tv/probes/rhenium-branding-20261016/`.

## Artifacts and review

Both final builds pass blocking Android analysis: x64 APP+TEST in 7m42.27s,
optimized ARM in 8m22.93s. The ARM APK is non-debuggable, `armeabi-v7a`, and
verifies with the existing development signing certificate. Exact source pins,
GN args, signatures, badging, logs and native results are archived at
`~/.cache/brave-tv/artifacts/rhenium-987fb6a0c-20261016/`.

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| ARM APP | 368584362 | `8ea1caa60cf23782404260c9216f62f4e10f4d7324540c881b3641f705126a59` |
| x64 APP | 853326784 | `7e181c3f628b337e7c8a0e91494904c59604324bd9f54ca96a2300b0fe71568c` |
| x64 TEST | 877105637 | `2c3daefa533671c24e70a6039b381e54a67c1144b6a9fc09e789b317b8e04282` |

The [independent finish review](../.impeccable/review/rhenium-branding/finish-review.md)
reports **SHIP** for the source and nine emulator captures, with no material
fixes. The [documenter reconciliation](../.impeccable/review/rhenium-branding/documentation.md)
updates DESIGN.md and its sidecar with the exact artwork tokens, native sizing
and provenance, preserving unrelated Ambient design and pre-existing drift.
The review does not certify downstream physical installation.

## Physical-TV delivery and acceptance

The authorized Chromecast (Android 14, ARM32) was initially reachable as
`192.168.4.50:39061`. Baseline: app ID `10141`, user-0 data inode `81460`,
installed under profiles 0/10/11/12, default/unset font scale and stock Gboard.

The in-place update failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE`.
`cmd package uninstall -k --user all com.brave.browser_default` returned Success,
keeping browser data. The subsequent streamed reinstall stalled in wireless ADB.
Only this TV's transport was reconnected; the shared ADB server and emulator
were left intact. After the user enabled wireless debugging, multicast discovery
found its new endpoint `192.168.4.50:40337`.

The incomplete session `318083806` was identified by the shell installer UID,
creation time and exact 368584362-byte artifact size. It was uncommitted, inactive
and had no open FDs/bridges; `pm install-abandon` returned Success. The final
streamed install returned **Success** in 47.08s. The installed APK's on-device
SHA-256 matches the archived ARM artifact above. App ID `10141`, user-0 data inode
`81460` and installed state under all four profiles match the original records.
No browser data, unrelated app or machine cache was cleared.

| Physical check | Result/evidence |
| --- | --- |
| Native Home identity and saved favorites | [tv-home.png](../.impeccable/review/rhenium-branding/tv-home.png): Mint Orbit/Rhenium, YouTube, Netflix, Prime Video and Twitch |
| Real Google TV icon/name | [tv-launcher-focused.png](../.impeccable/review/rhenium-branding/tv-launcher-focused.png): selected adaptive icon and Rhenium label; the TV uses a circular app row while the emulator uses the TV banner |
| Launcher activation | Native OK on the selected Rhenium entry opens the existing native Home with Search focused |
| Cleanup | [tv-final-home.png](../.impeccable/review/rhenium-branding/tv-final-home.png): normal Home restored; automation session closed; original unset/default font scale and stock Gboard unchanged |

[Install results](../.impeccable/review/rhenium-branding/tv-install-result.json)
and [hardware results](../.impeccable/review/rhenium-branding/tv-hardware-results.json)
record the exact artifact and scoped acceptance. The same records, recovery
logs and final native captures are archived with the APKs. Physical checks used
native D-pad/OK injection; branding introduces no input behavior change. A full
website/playback compatibility sweep and human remote-button feel were outside
this branding check. Enlarged-text coverage comes from the emulator; physical
font settings were preserved.
