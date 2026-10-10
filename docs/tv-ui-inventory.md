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
| Page / cursor / scroll | Scoped page input; held OK one click; idle wake no click | Fullscreen exit first; otherwise controls, independent of CloseWatcher |
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
