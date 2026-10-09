# Device and website test matrix

Status: proposed coverage, not test results. Baseline and TV-prototype x64 Debug APKs have been produced; see [build evidence](build.md) and [prototype status](tv-prototype.md). No TV has been connected or APK installed, and none of the flows below has passed yet. Website availability and behavior must be checked during execution.

## What hardware is needed

Start with an Android TV or Google TV running Android 10 or newer and its ordinary D-pad/OK/Back remote. A built-in TV or an external streaming device is suitable. We need the model and Android version from its Settings → About screen before choosing an APK architecture. An external keyboard or mouse can help investigate stock Brave, but cannot count toward remote-only acceptance.

The completed MVP requires two physical devices: a modest device and a faster device. We can start development with one. An emulator helps check installation and input integration; it does not establish real TV performance, hardware decoding or DRM compatibility. Do not buy hardware until the source build works and the first device's limitations are known.

For installation and logs, the developer computer must be able to reach the TV through Android Debug Bridge (ADB), over a supported USB or local-network connection. Enabling developer options/debugging and accepting the computer's debugging prompt happens on the device. Settings vary by manufacturer; use its instructions. Disable debugging when testing is finished. Device control is currently disabled in this development environment, so there is no connected-device evidence yet.

| Field | Modest device | Faster device |
| --- | --- | --- |
| Manufacturer and model | TBD | TBD |
| Android version / API | TBD | TBD |
| Supported ABIs | TBD | TBD |
| RAM / available storage | TBD | TBD |
| Display resolution / scaling | TBD | TBD |
| Remote buttons | TBD | TBD |
| Connection method | TBD | TBD |
| Official Brave baseline | Not run | Not run |
| Unmodified source build | Not run | Not run |
| TV adaptation build | Not run | Not run |

Once device access is enabled and the computer is authorized, the Nix shell provides ADB. Select a specific serial to avoid accidentally testing a different device:

```sh
adb devices -l
export TV_SERIAL='replace-with-the-device-serial'
adb -s "$TV_SERIAL" shell getprop ro.product.model
adb -s "$TV_SERIAL" shell getprop ro.build.version.release
adb -s "$TV_SERIAL" shell getprop ro.build.version.sdk
adb -s "$TV_SERIAL" shell getprop ro.product.cpu.abilist
adb -s "$TV_SERIAL" shell cat /proc/meminfo
adb -s "$TV_SERIAL" shell wm size
adb -s "$TV_SERIAL" shell wm density
```

Do not assume a 64-bit processor means the installed Android OS accepts arm64 APKs. Select the build from the reported ABI list. Never uninstall a tester's browser or clear its data to get an upgrade test to pass.

## Proposed website flows

These are initial engineering defaults, awaiting the user's preferred sites. “Core candidate” means a proposed MVP requirement, not a confirmed compatibility claim. Exploratory flows help identify limits and do not imply support for a paid service or DRM system. Use disposable test accounts only when sign-in is necessary; do not record passwords, cookies or private URLs in logs.

Run each flow first on stock Brave, then the unmodified source build, then the TV adaptation, with Shields defaults. Repeat a failing flow with a documented per-site override only when useful for diagnosis. A successful override does not count as default-protection success.

| # | Site / entry URL | Specific remote-only task | Priority |
| --- | --- | --- | --- |
| 1 | https://search.brave.com/ | Enter a query, submit, open a result, return with Back. | Core candidate |
| 2 | https://www.google.com/ | Complete any consent screen, search, open and return from a result. | Exploratory |
| 3 | https://duckduckgo.com/ | Edit an existing query and select a result without losing focus. | Exploratory |
| 4 | https://en.wikipedia.org/ | Search for a long article, follow its contents links and scroll both ways. | Core candidate |
| 5 | https://www.bbc.com/ | Navigate a consent dialog and read an article without a focus trap. | Core candidate |
| 6 | https://www.theguardian.com/ | Open an article, dismiss overlays and return to browser controls. | Exploratory |
| 7 | https://news.ycombinator.com/ | Open a small text link, read comments and navigate back. | Core candidate |
| 8 | https://github.com/brave/brave-core | Open a source file and scroll a wide code view. | Core candidate |
| 9 | https://developer.mozilla.org/ | Search for documentation and navigate an in-page sidebar. | Core candidate |
| 10 | https://www.reddit.com/ | Read a public discussion, expand replies and escape sign-in prompts. | Exploratory |
| 11 | https://stackoverflow.com/ | Find a question and scroll code blocks without trapping the pointer. | Exploratory |
| 12 | https://www.openstreetmap.org/ | Search a place, select a result and return from the interactive map to controls. | Exploratory |
| 13 | https://www.youtube.com/ | Search, play a public video, seek, toggle available captions and exit fullscreen. | Core candidate |
| 14 | https://vimeo.com/ | Play a public video and operate the player overlay. Select and record a specific video during baseline testing. | Exploratory |
| 15 | https://archive.org/details/movies | Choose a public video, play/pause and recover after a network interruption. | Core candidate |
| 16 | https://shaka-player-demo.appspot.com/demo/ | Select an unencrypted adaptive-stream sample, play and seek. Record the asset and codecs. | Core candidate |
| 17 | https://www.twitch.tv/ | Open a public live stream and recover controls after entering fullscreen. | Exploratory |
| 18 | https://www.netflix.com/ | Check sign-in and playback only with an authorized account; record DRM errors separately. | Exploratory |
| 19 | https://www.disneyplus.com/ | Check sign-in and playback only with an authorized account; record DRM/resolution limits. | Exploratory |
| 20 | https://httpbin.org/forms/post | Complete text and option fields, submit and inspect the echoed result; use invented data. | Core candidate |

Add controlled local fixtures for nested scrolling, iframe input, popup/dialog escape, keyboard dismissal, and a known blocked resource with cosmetic/scriptlet checks. Public sites and ad counters alone cannot prove these behaviors. Fixture implementation follows the validated input design.

## Record every run

Use one record per build, device and flow. Keep the official APK version distinct from our Brave/Chromium source pins. A failure report needs enough information to reproduce it without account secrets.

```text
Date:
Device / Android / ABI / display:
Build identity, version and source revision:
APK SHA-256:
Flow number and exact public URL / video asset:
Shields state and filter-resource status:
Expected outcome:
Observed result: NOT RUN / PASS / FAIL / BLOCKED
Remote buttons and steps:
First failing step / recovery path:
Cold-start time / memory / video observations, if applicable:
Log or screenshot path, with private data removed:
```

Record startup and memory measurements before setting budgets. For video, distinguish a picture appearing from sustained playback, hardware decoding, frame drops and A/V sync. Run the separate 30-minute session and sleep/wake checks from the [MVP checklist](mvp-todo.md); a short successful clip cannot replace them.
