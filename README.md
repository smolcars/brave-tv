<img src="assets/icon.svg" width="64" height="64" alt="">

# brave-tv

An Android TV adaptation of Brave's Android browser. The x64 emulator and 32-bit ARM Chromecast APKs build through Nix with blocking Android static analysis. Emulator onboarding, remote-source cursor, click, text-entry and nested-scroll checks pass. The first physical Chromecast build installs and opens onboarding, but browser startup repeatedly freezes. A non-debuggable comparison APK is built; its installation is pending sufficient storage. Website, video and performance acceptance remain open. See the [ARM artifacts](docs/tv-prototype.md#chromecast-arm-artifact) and [runtime evidence](docs/device-tests.md).

## Development

Use x86-64 Linux and Nix with flakes enabled:

```sh
nix develop
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
```

For automatic tools while working in this repository, review `.envrc` and run `direnv allow`. Use `nix develop` before changing into the external browser checkout, so the build tools remain available. Follow [the build instructions](docs/build.md) to initialize and compile upstream Brave. Browser source and build outputs stay outside this repository.

## Project documents

- [Engineering plan](docs/engineering-plan.md)
- [MVP checklist](docs/mvp-todo.md)
- [Device and website test matrix](docs/device-tests.md)
- [Nix TV emulator setup](docs/emulator.md)
- [TV input prototype and button map](docs/tv-prototype.md)
- [Feasibility research](docs/feasibility.html)

This project is independent of Brave Software. Release branding and device compatibility remain work in progress.
