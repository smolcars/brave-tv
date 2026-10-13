# TV UI route ownership and migration inventory

Inspected source baseline `5829c55f0` and first Compose candidates, 10 October
2026. This is a source inventory; runtime acceptance is tracked separately.
That inventory used the then-current busy-TV restriction. The12 October user
authorization permits the separate [physical follow-up](tv-ui-hardware.md);
its pending gates and evidence supersede that historical restriction.

| Route / entry | Trusted owner and storage | Migration / focus / return |
| --- | --- | --- |
| Launcher / first run / restore | Chromium dispatcher, BraveActivity, native TabModel | Keep direct startup and disabled analytics; home Address focus; platform Back |
| Native home / New tab / final normal closure | TvHomePage, BasicNativePage, existing TabModel | Compose native-page view; Address initially; controls on Back; never create WebContents during composition |
| Address / selected search provider | Native omnibox, TemplateUrlService, native URL classification | TV editor using same service; IME first owner; cancel restores invoker/page |
| Mobile top toolbar / menu | BraveToolbarLayout, Chromium toolbar manager | Retire TV presentation after compact controls/entry routes pass; retain native browser commands |
| Browse page / Scroll here | TvRemoteInput, TvBrowserControls, ContentView compositor parent | Pointer plus deliberate vertical edge scrolling; nested/horizontal fallback; native/fullscreen Back; Browse OK clicks once on release; Scroll here OK returns to Browse |
| Compact browser controls | TvBrowserControls, native Tab/WebContents | Compose dialog sibling; native Back/action validation; restore remembered action |
| Normal/private tabs and groups | TabModelSelector, TabModelUtils, tab closure/group filter | Flat cards, bounded rows; stable tab IDs; private unlock stays trusted; normal last tab recovers home |
| Group-delete confirmation | Chromium ModalDialogManager, tab-group model | Retain trusted confirmation; Cancel initial; Left/Right actual buttons; do not delete stored groups implicitly |
| Private unlock / screenshot flags | Incognito reauth, native activity/window | Keep native security owner; never unlock from rejected phone input; secure TV dialog windows |
| Favorites / bookmark folders | BookmarkModel, existing profile bridges | Compose rows; bounded existing pages; stable BookmarkId; cancel/remove confirmation; no copied database |
| History / paging / removal | TvHistoryPanel, HistoryBridge, native profile | Compose rows; query continuation; normal only; dispose observer and discard stale callbacks |
| Downloads / pending/open/removal | Chromium download manager, DownloadManagerService/OfflineContentProvider | Bounded TV list with native operations; distinguish record removal/file deletion; OS storage/app picker owns result |
| Search settings | TemplateUrlServiceFactory, native preferences | TV list with selected provider and disabled policy states; return to Settings |
| Site Shields / standard/aggressive/off | BraveShieldsContentSettings, native profile | TV controls; native enforcement stays; verify fixture request effects |
| Filters / optional lists / updates | TvFilterPanel, native adblock bridges, signed filter updater | TV rows/status/recovery; keep signature checks and traffic policy; no runtime UI assets |
| Clear browsing data | BrowsingDataBridge, UserPrefs policy, normal profile | Scoped native operations; conservative Cancel; pending/complete/error; private excluded |
| About / attribution / source / licenses | Native home/settings and chrome://credits | TV About; public source and actual generated license notices retained |
| Phone invitation / approval / connected | TvPhoneRemote, TvRemoteSession, TvRemoteServer | TV pairing UI; preserve opt-in development warning and single-use invitation; pause reasons truthful |
| Phone browser commands / native text | TvRemoteBrowser, TvTextInput, authenticated bounded command path | Shared browser action seam; keep document/viewport/editable identity, revisions and revalidation |
| Fullscreen / playback / cursor return | Chromium fullscreen manager, WebContents, media session, TvMediaPanel | Retain compositor and media ownership; Back exits fullscreen; next Back opens controls; phone still works |
| JS alert/confirm/prompt | Chromium ModalDialogManager and native content input | Retain native prompts; current TV focus adapter skips inert containers; Cancel/refusal conservative |
| Site info / HTTP / certificates | PageInfoController, SSL/interstitial renderer, native security state | Accurate full origin; retain certificate decisions/Back to safety; never fake security approval |
| Geolocation/camera/mic/OS permissions | Chromium permission controllers and Android permission window | Retain trusted native/OS owner and deny/cancel; phone must not approve |
| HTTP authentication / password / autofill | Chromium native auth/autofill/password flows | Retain trusted input; password/private phone rejection; accessible escape |
| Network error / renderer crash / offline | Chromium error/interstitial page and tab renderer lifecycle | Retain real error/reload behavior; usable controls/Back; no cosmetic success state |
| New window / popup / discarded tab | Chromium TabModel/tab creator | Existing native tab rules; explicit selection and return; no duplicate UI routing |
| File chooser / external app / downloads open | Android activity result/picker, Chromium delegate | Platform owns result; cancellation restores TV invoker; unsupported activities explain recovery |
| Background / foreground / process recreation | BraveActivity, native tab restoration | Dispose compositions/observers; restore bounded presentation only; no saved private metadata |

Content remains owned by Chromium's existing parent. Cursor is a noninteractive
sibling immediately above ContentView, using its viewport/content offsets.
NativePage gets a ComposeView without a renderer parent change. Browser panels
use a separate native dialog window; they pause page/phone input while open.
IME/root insets, scrim, Find, permission/modal owners and native Back handlers
take precedence over physical pointer policy. Fullscreen alone is not a modal.

### Current retirement boundaries (11 October)

The native Home factory, toolbar visibility policy and Activity input adapters
remain needed bridges. `brave_java_sources.gni` retains the Java TV model/input
controllers; the presentation target owns the two Compose Kotlin files.
`TvNativePageClassAdapter`, `TvImeAdapterClassAdapter` and the tabbed-Activity
menu interception preserve native page creation, genuine Chromium text input
and commands. Launcher manifest references still require `brave_tv_icon` and
`brave_tv_banner`; these are not obsolete browser layouts.

The prepared routing slice maps native Address/Search, menu, libraries, tabs,
Settings, About and clear-data commands to existing TV panels. Address retains
the current URL and Search opens an empty draft. Direct native adblock navigation
uses the delegate's actual Activity/selected contents. Phone routes and unknown
native commands retain their original owners. Stage4.8 remains unchecked until
the new native routing cases run; source inspection is not retirement acceptance.

No replaced standalone TV XML layout was found: the predecessor TV shell built
views programmatically. Mobile toolbar/menu code remains shared by phone and
native security/error/input infrastructure, so hiding its TV presentation does
not authorize deleting that infrastructure. Final dead-code/build-resource
cleanup and the final replaced/retained report remain under Stage6.4/6.7.

## Focus and Back contract

| Input owner / context | D-pad / OK | Back and restoration |
| --- | --- | --- |
| Android permission/picker/native critical window | Platform navigation/activation | Platform handles first; never parallel-dispatch |
| IME / focused editor | Native composition, selection and deletion | Dismiss IME first; second Back cancels TV editor and restores invoker |
| Native security / group confirmation | Native focus; Cancel initially for destructive operations | Cancel/dismiss; restore same surviving page or usable home |
| TV child library/settings/filter row | One visible TV focus, stable item identity | Return parent, restore invoking action; destroyed/stale result ignored |
| TV root controls | TV focus; disabled actions cannot activate | Existing native Back history/exit owner; explicit Browse page returns to content |
| Home | Address initially; no phone requirement | Open controls through existing callback; native exit only through existing Back owner |
| Page / cursor / scroll | Scoped page input; held OK one click; idle wake no click | Fullscreen exit first; preserve applicable native/webpage Back handling with a reachable controls escape |
| External app return | Native result routing | Restore surviving invoker, never stale Tab/View reference |

## Measurement contract and provisional budgets

Compare the same API36 x64 Debug emulator/profile/configuration before and after
upgrade; guest Vulkan disabled. Use cold process launch and warm foreground
separately, controlled local pages/video, no website/network latency attribution
to the shell. Report sample counts, median/tail UI latency, frame percentiles and
whole-package process PSS. Record APK bytes and installed footprint independently.
Do not compare Debug emulator measurements directly with optimized ARM hardware.

Provisional regression limits to check after actual baseline sampling: no more
than 15% startup/panel median regression, 25% tail regression, 80 MiB idle
whole-package PSS growth or 10 MiB APK growth attributable to presentation.
Remote-visible action response target: 100 ms median / 200 ms p95 on controlled
native panels; display cadence animation with no continuous decorative work.
These are investigation thresholds, not measured hardware promises. Hardware
performance, real iOS/phone IME, physical remote and second TV remain pending.

### Recorded baseline and design evidence

The installed baseline was verified against the preserved source5829 APK:
SHA-256 `80d0649ca66dafa19374a10aa7c7bdb767ef0b2e911b35044ff7ca8cb49f9605`,
851,001,060 bytes. TV AVD `brave_tv_clean_api36`, API36/x64, 1920×1080,
320 dpi; guest Vulkan disabled for the documented host compatibility problem.
Task-owned fixture server serves existing synthetic pages on loopback 18088.
No app-data reset. Baseline home replay passes 20 steps; native Alert/Confirm/
Prompt start on OK/Cancel/editor respectively and dismiss through remote input.

Preserved screenshots/metrics are under `~/.cache/brave-tv/artifacts/`:
`tv-ui-baseline-home.png` and `tv-ui-baseline-metrics.json`. Three cold Activity
launch TotalTime samples: 1108/966/929 ms; warm task-return WaitTime: 22/28/13 ms.
These samples were collected during a build and need uncontended comparison.
Activity launch is not webpage readiness. Initial live browser PSS was
222,909 KiB; the 336-frame mixed-flow window reported median16/p9530 ms and
11.31% jank. That is exploratory evidence, not a controlled performance pass.

The preserved normal profile contains a native bookmark/history entry for
`remote-input.html`, loaded dialog/popup fixture tabs, DuckDuckGo as selected
search provider, Cookie notice blocker On, Mobile app promo blocker Off and
a Shields-off exception for the synthetic 10.0.2.2 origin. Verify all of these
through native UI after upgrading; popup group membership needs explicit
confirmation evidence before claiming group migration acceptance.

The source-owned [design prototype](../brave/docs/tv-ui-design-prototype.html)
shows charcoal/sage and warm/amber alternatives. Charcoal/sage is selected under
the autonomous visual-direction override. T3 preview checks eight transitions:
Address invoker restoration; Clear/Down focus; Escape after editing; Enter
submission; final-tab home recovery; fullscreen Back; page-to-controls escape;
Cancel initial focus. These are synthetic interaction proofs only.

Design tokens: charcoal `#151719`, surface `#25282b`, warm text `#f3efe7`, quiet
text `#bbb9b3`, sage `#c7d8af`; 36sp home heading, 24sp panel heading, 18sp action,
16sp metadata, 14sp attribution. Screen safe margins start at 48dp horizontal /
32dp vertical; panel24dp, action spacing12–16dp. Filled rounded targets, a single
focused sage surface with visible scale/edge distinction, no default outlined
button stack. Focus motion is short and respects system motion settings; no
background blur or decorative animation. Disabled actions retain readable
labels and cannot activate. Empty/loading/failure states use existing localized
native resources with an explicit return/retry route. Long text/RTL/font scaling
and actual screen-reader operation remain runtime checks, not inferred from CSS.


## Native Compose proof and current limits (10 October)

Pinned source `7ef938f03` builds the TV home and compact sibling/dialog controls
inside the existing GN x64 Debug APK. Reproducible artifact:
`~/.cache/brave-tv/artifacts/compose-accessibility-7ef938f03-x64-debug-20261010/BraveMonox64.apk`,
852,580,286 bytes, SHA256
`97f25b208191a25ae735c010d2e65a066e625522868a557cc894768ea7e86d54`.
Blocking Android analysis and signature verification passed; cached build r12
completed in1m34s. Last build memory observation was11.08 GiB (cgroup peak was
not retained after the successful transient unit exited). Explicit emulator
update installation preserved the source5829 synthetic profile.

Actual retained Chromium evidence on the TV AVD: remote-input and precise-input
pages render under Compose; uinput held OK produces exactly one click and the
cursor pixel check passes. The real stock TV keyboard types into a Chromium
InputConnection field, then Back dismisses it and returns to controls. Native
media-session controls report the fixture playing at427×240; fullscreen/Back
returns to browser controls with no black compositor. Private-home and controls
windows are secure; History is disabled and closing the last private tab returns
to the original normal media tab. Native Alert focus/OK/Back replay passes.
Process relaunches retain normal fixture tabs/groups and DuckDuckGo selection.
These checks establish the hosting/input proof; complete Unicode/selection,
permission/interstitial, private leakage, recreation and phone regression gates
remain unchecked. No WebContents ownership moved to Compose.

The r12 accessibility fix passes labelled focused Button selectors, including
More→History. The full home→controls replay remains red because it restores the
previous Home action as initial panel focus; the shared-state slice corrects
that and explicitly re-focuses Address when an existing home is selected.
Do not call a written regression or this predecessor artifact final acceptance.
Baseline panel/input latency, installed footprint and a controlled load comparison
still need measurement. Hardware, screen reader, font/RTL and real-phone checks
remain pending. Two source-independent design variants and the eight prototype
route/focus checks are recorded above; design acceptance is separate from APK
runtime acceptance.


## Matched emulator feasibility and hosting decision (11 October)

Source5829 versus productionb3a9; same signer/version/Chromium155, native Home,
five retained normal tabs, x64 Debug/API36/1080p320/font1.0. No Chromium build,
second emulator or agent accessibility lease during timing. The two in-place
APK installations preserve profiles; currentb3a9 is restored. Local load checks
subsequently add two normal synthetic media tabs; do not apply their seven-tab
state to the earlier five-tab startup/PSS comparison.

| Measurement | Baseline5829 | Currentb3a9 | Samples/method |
| --- | ---: | ---: | --- |
| Cold Activity display median / p95 | 997 / 1034 ms | 985 / 1130 ms | Seven force-stop/start-W; not webpage readiness |
| Warm task-return median | 20 ms | 21 ms | Seven Home/start-W returns |
| Whole-package PSS median | 615961 KiB | 647576 KiB | Three sums of browser/renderer/GPU meminfo |
| APK bytes | 851001060 | 852705331 | Verified preserved signed artifacts |
| Installed code | 830956 KiB | 832624 KiB | Package directory du |
| Input→new-panel first completed draw median / p95 | 95.054 / 108.940 ms | 74.251 / 80.486 ms | Ten native D-pad OK openings, completed gfxinfo first-draw frame |
| Input→native panel semantics median / p95 | 242.5 / 298 ms | 243 / 263 ms | Same distinct-window/heading/Reload predicate; includes query/event overhead |
| Native-window frame duration median / p95 | 30.781 / 50.087 ms | 33.426 / 50.073 ms | 221 / 264 completed frames |
| Local input-page load-event median | 39.9 ms | 43.9 ms | Five cache-bypassed diagnostic reloads |
| Local video-page load-event median | 72.6 ms | 96.1 ms | Five diagnostic reloads, loopback byte-range MP4 |
| Video metadata/decoded-frame host readiness median | 126.427 ms | 128.864 ms | Includes25ms polling; paused first decoded frame,427×240/24.109s |

Startup/panel relative budgets pass; PSS grows30.9MiB and APK1.63MiB, within
80MiB/10MiB limits. Native semantic response exceeds the100/200ms investigation
target on both; query/event overhead prevents treating it as display latency.
New-window render completion is an emulator proxy, not physical first pixel.
Small page/video load samples vary (current input-page load includes a281.5ms
outlier); video load-event median grows32.4% while decoded readiness grows1.9%.
Record this engine/network variance separately: no claim of faster website
loading or an explanation of YouTube latency. Actual native media playback,
IME and fullscreen acceptance are recorded independently in engineering-plan.

Logs/JSON and the diagnostic load harness remain under
`~/.cache/brave-tv/probes/performance-r1`; matched panel runs are
`5829-panel-r4` and `b3a9-panel-r9`. Both contain ten numeric samples and restored
normal Home. Earlier stopped fixture/window/focus/lease failures stay preserved.
Reproduce load methodology using the existing media/input fixtures: diagnostic
Page.reload(ignoreCache=true), NavigationTiming loadEventEnd and bounded native
video metadata/decoded-frame readback; this does not prove native URL entry.

Go for the requested Compose for TV toolkit in the actual GN APK. Keep native
BasicNativePage content ownership and modal sibling panels, UI-thread browser
state/actions and explicit composition/observer disposal. Dependency/version/
AAR hashes and licenses are pinned in
[AndroidX TV metadata](../brave/third_party/androidx_tv/README.chromium) and
[GN targets](../brave/third_party/androidx_tv/targets.gni); Chromium's pinned
Compose/Kotlin/compiler supply the remainder without an upstream upgrade.
No compatibility fallback is needed. Physical optimized performance, second TV,
real-phone and OS-pressure acceptance remain pending.
