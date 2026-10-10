# TV UI route ownership and migration inventory

Inspected source baseline `5829c55f0` and first Compose candidates, 10 October
2026. This is a source inventory; runtime acceptance is tracked separately.
All physical acceptance is pending and the Chromecast must remain untouched.

| Route / entry | Trusted owner and storage | Migration / focus / return |
| --- | --- | --- |
| Launcher / first run / restore | Chromium dispatcher, BraveActivity, native TabModel | Keep direct startup and disabled analytics; home Address focus; platform Back |
| Native home / New tab / final normal closure | TvHomePage, BasicNativePage, existing TabModel | Compose native-page view; Address initially; controls on Back; never create WebContents during composition |
| Address / selected search provider | Native omnibox, TemplateUrlService, native URL classification | TV editor using same service; IME first owner; cancel restores invoker/page |
| Mobile top toolbar / menu | BraveToolbarLayout, Chromium toolbar manager | Retire TV presentation after compact controls/entry routes pass; retain native browser commands |
| Page cursor / scrolling | TvRemoteInput, TvBrowserControls, ContentView compositor parent | Retain input policy/overlay; Back opens controls; OK release exactly one click |
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

## Focus and Back contract

| Input owner / context | D-pad / OK | Back and restoration |
| --- | --- | --- |
| Android permission/picker/native critical window | Platform navigation/activation | Platform handles first; never parallel-dispatch |
| IME / focused editor | Native composition, selection and deletion | Dismiss IME first; second Back cancels TV editor and restores invoker |
| Native security / group confirmation | Native focus; Cancel initially for destructive operations | Cancel/dismiss; restore same surviving page or usable home |
| TV child library/settings/filter row | One visible TV focus, stable item identity | Return parent, restore invoking action; destroyed/stale result ignored |
| TV root controls | TV focus; disabled actions cannot activate | Existing native Back history/exit owner; explicit Page cursor returns to content |
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
