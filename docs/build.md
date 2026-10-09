# Building Brave for Android with Nix

## Current status

The pinned Nix shell and checkout helper work on the initial x86-64 Linux builder. Upstream source initialization is in progress. No Android APK has been built or installed yet.

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
pnpm run build Debug --target_os=android --target_arch=x64 --target_android_output_format=apk
```

Use a release build for performance evidence:

```sh
pnpm run build Release --target_os=android --target_arch=x64 --target_android_output_format=apk
```

These compile commands still need to be validated on this builder. Record the actual output path and native dependency failures before describing the build as working. Use the exact prerequisite guidance for the pinned release in [Brave's Android build documentation](https://github.com/brave/brave-browser/wiki/Android-Development-Environment).

## Check this repository

```sh
python3 -m unittest discover -s tests -v
mypy --strict tools tests
nix flake check
nix fmt flake.nix
git diff --check
```

`nix flake check` runs both the toolchain smoke check and the local checkout tests/typecheck in Nix build environments. The local tests use disposable Git repositories and require no network or TV. They verify the setup command's behavior, not Android compilation, Shields effectiveness or media playback.
