<img src="assets/icon.svg" width="64" height="64" alt="">

# brave-tv

An Android TV adaptation of Brave's Android browser. The baseline and TV-prototype x64 Debug APKs build through Nix with blocking Android static analysis. The prototype installs on an Android TV emulator, and onboarding works with D-pad/OK, and remote-source cursor, click, text-entry and nested-scroll checks pass. Physical-TV, website, video and performance acceptance remain open. See the [current artifact](docs/tv-prototype.md#cursor-correction-artifact) and [runtime evidence](docs/device-tests.md#emulator-run-9-october-2026).

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
