# First TV input patch

Status: source prototype. The unmodified baseline APK built successfully, the TV patch has been applied, and its first incremental Android build started at 05:58 EDT on 9 October 2026. The public input-policy tests pass on the JVM. TV-patch compilation, launcher behavior, first run, actual focus, pointer delivery, nested scrolling and video remain unverified. This is not a completed MVP or a release APK.

The first compile failed after 40 seconds because the adapter imported JSpecify's `Nullable`, which is absent from this target's classpath. It now uses the surrounding code's existing AndroidX annotation. The retry passed the Android Java header compiler and Java compilation; final packaging remains pending.

Current build: `brave-tv-prototype-j4-r2.service`; log/timing prefix `~/.cache/brave-tv/logs/build-tv-debug-x64-20261009-060024`. The failed attempt is preserved under `build-tv-debug-x64-20261009-055842.*`. Both use the baseline output cache and the resource limits documented in [build.md](build.md).

The generated merged manifest contains the exported TV launcher alias, `MAIN`/`LEANBACK_LAUNCHER`, the TV banner/label and `android.hardware.touchscreen` marked optional. This confirms manifest integration; actual TV launcher behavior is still untested.

## Implementation

[`0001-tv-input.patch`](../patches/0001-tv-input.patch) adds a TV launcher alias and an initial vector banner, and connects a TV-only controller to Brave's existing activity. The launcher routes through Chromium's first-run dispatcher. The existing optional-touchscreen declaration is retained. No engine, Shields enforcement, profile storage or certificate handling is replaced.

The native controls dialog opens the existing address bar or browser menu, reloads the current page, and enters cursor/scroll mode when a webpage is present. Native pages continue to use native focus. This does not yet adapt the contents of the browser menu, tab switcher, Shields settings or onboarding screens.

| Context | D-pad | OK | Back |
| --- | --- | --- | --- |
| TV controls | Move native selection | Activate the selected control | Delegate to browser history/exit |
| Page cursor | Move the visible cursor | Click once on release | Open TV controls |
| Page scrolling | Scroll at the current cursor location | Return to cursor mode | Open TV controls |
| Keyboard / native modal / fullscreen UI | Preserve upstream handling | Preserve upstream handling | Preserve upstream handling first |

No Menu button is required to open TV controls. Alphabetic hardware keyboards and system keys retain upstream handling. The mode hint is drawn over the webpage; it is not a replacement for accessibility testing. A web page's CloseWatcher must not prevent escaping to the TV controls.

`TvRemoteInput` owns the interaction policy. `TvBrowserControls` delivers scoped mouse hover/wheel events and touchscreen taps to the active Chromium content view, and uses the existing Android Back dispatcher. Native pages, native focus, Find UI and visible browser scrims take priority. The JVM tests check observable cursor/click/scroll/focus requests, including canceled clicks, viewport changes and missing content. They do **not** execute the Android adapter or prove that a real page receives those events. The [input review and controlled regression procedure](input-review.md) record the source corrections and outstanding Android checks.

## Apply after the baseline build finishes

Do not edit source while the unmodified build is running. From this project:

```sh
nix develop
export TV_PROJECT="$PWD"
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
git -C "$HOME/.cache/brave-tv/workspace/src/brave" apply --check --whitespace=error-all "$TV_PROJECT/patches/0001-tv-input.patch"
git -C "$HOME/.cache/brave-tv/workspace/src/brave" apply --whitespace=error-all "$TV_PROJECT/patches/0001-tv-input.patch"
cd "$HOME/.cache/brave-tv/workspace/src/brave"
SISO_LIMITS=local=4 pnpm run build Debug --target_os=android --target_arch=x64 --target_android_output_format=apk
```

The checkout helper intentionally refuses the now-modified checkout on subsequent calls. Do not reset it or rerun forceful upstream synchronization to make that check pass. Preserve the unmodified APK and its provenance before applying the patch. Reusing the same build directory should retain unaffected native compilation outputs.

Use the [resource-limited service](build.md#resume-with-host-resource-limits) for long builds on this builder. The pinned upstream wrapper does not enforce `--ninja=j:N` in offline mode.

For development, edit the patch in a separate Brave worktree at the pinned commit, mark new files with `git add -N`, then export `git diff --binary` to the patch file. Keep unrelated formatting changes out of the diff. Run the upstream Java formatter on new Java files, `git diff --check` in that worktree, the apply check above against the clean baseline, and `nix flake check` in this project.

The prototype launcher name and banner are temporary. The Android package, other app labels and signing still use upstream development defaults; independent release identity and safe upgrade testing remain checklist work.
