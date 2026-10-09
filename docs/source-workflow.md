# Direct-source development

The project stays at `/home/nitesh/.t3/projects/brave-tv`. Its `brave/` directory is a Git submodule pointing to the real public [smolcars/brave-tv-core](https://github.com/smolcars/brave-tv-core) fork of [brave/brave-core](https://github.com/brave/brave-core). It contains the full source, licenses and upstream history. The local clone may have shallow history; fetch/deepen from `upstream` when an update or older comparison needs it. The source fork uses `master`; its initial TV commit is `1a296306374e88237d6e3967ba967f8f0802458b`, based on the existing `v1.97.56` pin. Fork Actions are disabled until we configure our own CI.

The previous TV patch is preserved in project Git history and old artifact directories. It is no longer applied or generated. Brave's own patches to Chromium remain necessary upstream build inputs.

## First checkout

```sh
git clone --recurse-submodules https://github.com/smolcars/brave-tv.git
cd brave-tv
nix develop
git -C brave switch master
```

For an existing project checkout, use `git submodule update --init brave`. Before switching a submodule branch, preserve any local changes and inspect its revision. For reproducing an older project commit, remain at its pinned submodule commit instead of switching to today's `master`.

## Each implementation slice

1. Update `docs/engineering-plan.md` before source edits; choose the next unchecked item in `docs/tv-native-checklist.md`.
2. Edit ordinary files under `brave/`. Run focused tests, formatting and `git -C brave diff --check`.
3. Commit the source on its `master`, then commit the updated `brave` pointer in this project. Do not advance the build checkout while a build is running.
4. In the project's Nix shell, run `python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"`. It verifies the recorded source revision, clean working trees, upstream ancestry and Chromium pin, then clones or fast-forwards the external build checkout. Divergent commits and dirty files are preserved and reported.
5. Build in that external checkout with the [resource limits](build.md#resume-with-host-resource-limits). Keep the current `out/android_Debug` and `out/android_Static_arm` directories and dependencies.
6. Install on the emulator without clearing the profile, run the relevant remote checks and record evidence. Review only the latest implementation commit against its parent, fix findings, and push the source fork before pushing the project pointer.

Use the existing `pnpm run build` commands. On this initialized builder, ordinary UI changes do not need a new Chromium checkout or `pnpm run init`. Never run a destructive sync/reset to silence a dirty-tree error.

## Project checks

```sh
nix develop --command python3 -m unittest discover -s tests -v
nix develop --command mypy --strict tools tests
# Include the pinned source submodule for the Nix-packaged checks.
nix flake check "git+file://$PWD?submodules=1"
```

The JVM test compiles `brave/android/java/org/chromium/chrome/browser/tv/TvRemoteInput.java` directly. The checkout tests use temporary Git repositories to check exact revision selection, fast-forward updates, dirty/divergent refusal and preservation of build outputs. These checks do not replace Android compilation or emulator acceptance.
