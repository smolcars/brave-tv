# Page navigation on Chromecast — 16 October 2026

The user authorized control of the physical TV, including removal of the old
browser across Android profiles if storage prevented an update. The optimized
ARM build from source `d8a0ebb909c81f2e6ad41e6c2a6c6131c6cccfed` is installed and
passes the bounded hardware checks below. No product source changes were needed.

## Installation

Device: Google Chromecast (`sabrina`), Android 14/API 34, ARM32
(`armeabi-v7a`), active Android user 0. Profiles 10, 11 and 12 also exist.
The existing 1920×1080 display override and density 320 were retained.

The in-place update failed with `INSTALL_FAILED_INSUFFICIENT_STORAGE`.
The authorized global uninstall then succeeded. Package queries confirmed the
old registration was absent from users 0/10/11/12 before fresh installation.
This clears the old browser's local data. Android profiles and unrelated apps
were retained. Fresh installation registers the new package for all four users;
only user 0 was launched and tested. Available storage after installation was
1,033,392 KiB, approximately 1 GiB.

Installed artifact: `BraveMonoarm.apk`, 368,539,141 bytes, package
`com.brave.browser_default`, version 1.97.0 / 429700000. The optimized Static
build is non-debuggable and development-signed. The installed APK's SHA-256
matches the previously verified artifact:

```text
f2796d61165afbc3b36c95abcba0be90ce30d8f306cb7d30c8ae589c22ade527
```

Build provenance, signatures and APK are retained in
`~/.cache/brave-tv/artifacts/page-navigation-d8a0ebb90-20261013/`.
This hardware session's install logs, snapshots, input helper, fixture and
captures are in `~/.cache/brave-tv/probes/page-navigation-tv-20261016/`.

## Observed behavior

- Native Ambient Home renders the Phone tab, YouTube/Netflix/Prime Video/Twitch
  official logos, the requested footer description, GitHub action, Brave and
  Chromium credits, and English photograph credit. Disney+ is absent.
- The owned navigation fixture enters element mode automatically. Right moves
  from Explore to Watch. A short OK produces exactly one activation.
- An actual 850 ms OK hold switches to pointer mode without another activation.
  Left moves the pointer while native webpage focus stays on Watch. Another
  held OK returns to elements; Down selects Saved pages. The count remains one.
- Repeated Down scrolls the document. The nineteenth Down after Saved pages
  selects Last page item; another Down retains that item without wrapping.
- Pointer mode can also be summoned at the final item. The immediate capture
  shows the pointer within the selected target and its movement hint.
- Back opens native browser controls with both Browse page and Jump between
  elements available. Selecting Jump between elements returns to the page.
  The fixture's activation count remains one across switching and scrolling.
- The current browser process has no entries in Android's crash buffer at the
  time of the check. This is a bounded observation, not an endurance result.

[Home](../.impeccable/review/page-navigation-tv/home.png) ·
[Elements](../.impeccable/review/page-navigation-tv/elements.png) ·
[Pointer](../.impeccable/review/page-navigation-tv/pointer.png) ·
[Menu](../.impeccable/review/page-navigation-tv/menu.png) ·
[Document end](../.impeccable/review/page-navigation-tv/document-end.png)

These are native screenshots from the physical Chromecast. The navigation
page is an owned test webpage rendered by the installed browser. Inputs use a
temporary nonalphabetic D-pad/OK device through Android's `uinput`, including
real timed holds; they are not human operation of the wireless remote.

The initial local page failed because the device launcher remapped loopback
forwarding to the same host port. Serving the fixture on that port resolved
`ERR_EMPTY_RESPONSE`; the initial failed snapshots and logs are retained.

## Handoff

All three task-owned webpage tabs were closed. The remaining tab is native Home
with an empty Continue browsing section. The owned fixture server was stopped
and its `tcp:18116` reverse removed. Stock TV Gboard remains selected, active
Android user remains 0, and display size/density are unchanged. No browser data
was cleared after the fresh installation. Existing shared services, other
devices, build caches and unrelated workspace files were left intact.

One cleanup assertion expected Chrome's transient “See 1 tab” toolbar node after
Home had hidden that toolbar. The post-close snapshot proves the single tab;
the settled Home snapshot separately proves the empty page list. No product
change was made for this probe expectation.

## Limits

The [twelve emulator checks](tv-page-navigation-evidence.md) remain the detailed
coverage for nested scrolling, frames, input ownership, private protections,
fullscreen and interrupted presses. This hardware sample does not rerun that
entire suite, establish human remote latency, prove streaming playback or DRM
support, test a real phone, or establish broad website/second-TV compatibility.
