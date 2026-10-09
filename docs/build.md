# Building Brave for Android with Nix

## Current status

The unmodified Brave x64 Debug APK built successfully at 03:17 EDT on 9 October 2026. Its signature was verified and a separate baseline copy preserved before applying the [TV input patch](tv-prototype.md). This proves source compilation on the Nix-managed builder; no APK has been installed or runtime-tested. The initial machine crash and resource-limit recovery are documented below.

Source pins live in [`upstream.json`](../upstream.json); Nixpkgs and host-tool versions are locked by [`flake.lock`](../flake.lock). The engineering plan is in [`engineering-plan.md`](engineering-plan.md).

## Enter the environment

From the project directory:

```sh
nix develop
```

For direnv, review `.envrc`, then run `direnv allow`. It loads the same flake while you are in this project. **Before changing into the external browser workspace, run `nix develop` from this project even if direnv is enabled.** That starts a shell which retains the tools when you change directories; direnv alone unloads them when you leave the project. All commands below run inside that development shell; `nix develop --command ...` from this project is the noninteractive equivalent.

The shell supplies Node 24, pnpm, Python, Git, Java, ADB and native build utilities. Do not install alternate copies globally with npm or the host package manager. Add missing host dependencies to `flake.nix`, verify them and commit the changed lock file when applicable.

Chromium/Brave still fetch their exact compiler, sysroot, Android SDK/NDK, Java and other build artifacts through upstream DEPS/CIPD and their JavaScript lockfile. Those versions belong to the browser source revision and must not be casually replaced by Nixpkgs equivalents. This is a Nix-managed development environment, not yet a hermetic Nix derivation for the complete browser.

The initial supported builder is x86-64 Linux. The shell has been exercised on Ubuntu; compatibility with NixOS and its handling of upstream prebuilt ELF binaries is not yet verified.

## Prepare the pinned source

Choose an external workspace without whitespace. The helper creates `src/brave` or verifies the existing checkout; it refuses a different revision or uncommitted files and never resets them.

```sh
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
cd "$HOME/.cache/brave-tv/workspace/src/brave"
```

This helper prepares the unmodified baseline. Once downstream changes are made, its dirty-tree refusal is expected; it must not be used to erase or replace that work.

## Initialize dependencies

For the first clean baseline, run:

```sh
pnpm run init --target_os=android --target_arch=x64 --no-history
```

The x64 target is for an x86-64 Android emulator, not an ARM TV. Select `arm64` or `arm` for physical hardware after inspecting its supported ABIs. No physical target has been selected yet.

Initialization downloads Chromium and its dependencies and may take a long time. Keep source/build logs outside this project, for example under `~/.cache/brave-tv/logs/`. Preserve failed checkouts for diagnosis. Upstream synchronization includes reset/force operations; inspect the affected source trees before rerunning it, especially after making downstream edits.

The source pins inspected for this baseline are:

- Brave: `v1.97.56`, commit `b01cdf43be4b4d5559bf7e58229e666e24454f50`.
- Chromium: `155.0.8059.40`, tag resolving to `cfaadc5a132d78e1828635aa8405a499f3e14864` when checked.
- Nixpkgs: see `flake.lock`.
- Nix shell observed versions: Node `24.21.0`, pnpm `11.27.0`, Python `3.13.15`, Java compiler `21.0.12.1` and Android platform tools `35.0.2`.

## Compile after initialization succeeds

From the external `src/brave` directory:

```sh
SISO_LIMITS=local=4 pnpm run build Debug --target_os=android --target_arch=x64 --target_android_output_format=apk --gn=android_static_analysis:on
```

Use a release build for performance evidence:

```sh
SISO_LIMITS=local=4 pnpm run build Release --target_os=android --target_arch=x64 --target_android_output_format=apk --gn=android_static_analysis:on
```

The Debug command completed native/Java compilation and APK packaging. Use `SISO_LIMITS=local=4` to limit local execution on this 30 GiB builder. **The pinned Brave wrapper consumes `--ninja=j:N` but applies its Siso job limit only when remote execution is enabled** (`build/commands/lib/config.ts`, options parsing and `useRemoteExec` environment block). Our original `--ninja=j:8` therefore did not enforce eight local jobs. The current output directory is `src/out/android_Debug`; do not assume the architecture is part of that default directory name. The release command has not run. Use the exact prerequisite guidance for the pinned release in [Brave's Android build documentation](https://github.com/brave/brave-browser/wiki/Android-Development-Environment).

## Resume with host resource limits

Keep `--gn=android_static_analysis:on` in these commands. Chromium otherwise defaults to background analysis for development builds, and can report a successful APK while checks are still queued. A transient service then terminates that background server at exit. The explicit `on` mode runs analysis as blocking build steps and propagates failures; no checks are disabled.

On this systemd-based Linux builder, run the long compile in a transient user service. This keeps it independent of the terminal connection and limits its memory consumption. A reboot still stops the service. Do not run two builds against the same output directory.

From this project, inside `nix develop`:

```sh
systemctl --user status brave-tv-baseline-j4.service
# Continue only when no build is running. Use a fresh unit name if the old failed unit remains loaded.
export TV_BUILD_LOG="$HOME/.cache/brave-tv/logs/build-debug-x64-$(date +%Y%m%d-%H%M%S)"
systemd-run --user --unit=brave-tv-baseline-j4 --service-type=exec \
  --property=MemoryAccounting=yes --property=MemoryHigh=18G --property=MemoryMax=22G \
  --property=MemorySwapMax=0 --property=OOMPolicy=kill \
  --property=Nice=10 --property=CPUWeight=25 \
  --setenv=SISO_LIMITS=local=4 --setenv=TV_BUILD_LOG="$TV_BUILD_LOG" \
  --working-directory="$PWD" "$(command -v nix)" develop --command bash -c '
    set -euo pipefail
    cd "$HOME/.cache/brave-tv/workspace/src/brave"
    command time -v -o "$TV_BUILD_LOG.time" pnpm run build Debug \
      --target_os=android --target_arch=x64 --target_android_output_format=apk \
      --gn=android_static_analysis:on \
      > "$TV_BUILD_LOG.log" 2>&1
  '
systemctl --user show brave-tv-baseline-j4.service \
  -p ActiveState -p Result -p MemoryCurrent -p MemoryPeak -p MemoryHigh -p MemoryMax
```

The 18 GiB threshold starts memory reclamation; the 22 GiB hard limit can terminate the build instead of allowing it to consume all host memory. These are precautions, not proof of the original crash cause. The Nix shell supplies `systemd-run`/`systemctl`; the host must provide a user systemd manager and delegated memory/CPU controllers. No system service is installed and no automatic restart is configured. To interrupt this build gracefully, use `systemctl --user kill --signal=SIGINT brave-tv-baseline-j4.service`, then confirm it has stopped before resuming. Preserve logs and outputs; do not rerun initialization or clear caches to recover.

## Initial build evidence

- Source initialization: approximately 21 minutes 24 seconds, from the log's creation at 20:39:57 to its final update at 21:01:22 EDT on 8 October 2026. This includes the JavaScript install, Chromium/dependency download and upstream hooks, but not the earlier Brave clone or Nix downloads.
- Initialization exited successfully. All 1,179 upstream Brave patches applied. Gclient retried several dependency fetches and preserved one conflicting partial WebGPU checkout under `_bad_scm`; no manual cache deletion was used.
- Main source checkout: `~/.cache/brave-tv/workspace/src/brave`.
- Separate TV patch worktree: `~/.cache/brave-tv/tv-worktree`.
- Logs: `~/.cache/brave-tv/logs/init-x64.log`, `build-debug-x64.log` and `build-debug-x64.time`. The last file is written by GNU Time from the Nix shell and records completion status, elapsed time and process resource statistics when the build ends.
- The original build log stops at 21:30:16 EDT after 28m35s of native build progress and 32,993 recorded steps. The original timing file is empty because the machine crashed. Boot/journal inspection confirmed a reboot at 22:33; preceding service watchdog/timeouts were recorded, but no kernel OOM event was found in the inspected interval.
- A 22:42 recovery attempt exposed the ineffective wrapper job option and was deliberately interrupted after 108 additional completed steps. Its separate log/timing files are `build-debug-x64-resume-20261008-224207.*`.
- The next recovery attempt started at 22:43:49 with explicit `SISO_LIMITS=local=4`, under `brave-tv-baseline-j4.service`. Logs/timing: `build-debug-x64-resume-20261008-224349.*`. The cgroup's memory and CPU limits were verified, as were the actual Siso process environment and four active compiler processes. Record final completion separately.
- No device or performance result follows from these host-side checks.

### Completed baseline artifact

- Completed at 03:17:23 EDT on 9 October 2026, exit status 0. The successful resumed command took **4h33m33s**; this excludes earlier work retained from the interrupted builds and is not a fresh-build timing.
- Built APK: `~/.cache/brave-tv/workspace/src/out/android_Debug/apks/BraveMonox64.apk`.
- Preserved baseline: `~/.cache/brave-tv/artifacts/baseline-v1.97.56-x64-debug-20261009/BraveMonox64.apk` (outside the build directory, so subsequent builds cannot overwrite it).
- Size: **853,895,549 bytes** (about 814 MiB). This is an unoptimized development Debug build, not the expected release size.
- SHA-256: `c0235bcdcdfd89858f7687727e2247b77dce0b52cfe5745c011a170fc0d47341`.
- APK metadata: `com.brave.browser_default`, version name `1.97.0`, version code `429700008`, native ABI `x86_64`. The pinned release's development build metadata differs from its release tag; this is not an official Brave binary.
- Upstream SDK `apksigner verify --verbose --print-certs` succeeded (v2 signature). Verification establishes APK integrity, not official publisher identity or installation compatibility.
- The artifact directory also contains `provenance.json`, `args.gn`, `badging.txt` and `signature.txt`, including source/Chromium/project revisions, hashes, command and log paths.
- The reviewed TV patch was applied after preserving this baseline. Its incremental build uses the same `android_Debug` outputs and the same resource limits.

## Check this repository

```sh
python3 -m unittest discover -s tests -v
mypy --strict tools tests
nix flake check
nix fmt flake.nix
git diff --check
```

`nix flake check` runs both the toolchain smoke check and the local checkout tests/typecheck in Nix build environments. The local tests use disposable Git repositories and require no network or TV. They verify the setup command's behavior, not Android compilation, Shields effectiveness or media playback.
