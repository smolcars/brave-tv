<img src="assets/icon.svg" width="64" height="64" alt="">

# brave-tv

An Android TV adaptation of Brave's Android browser. The x64 emulator and 32-bit ARM Chromecast APKs build through Nix with blocking Android static analysis. The current optimized, non-debuggable test APK installs on the Chromecast and passes initial startup, physical-remote address entry, cursor, click and form checks. Broader website, video, performance and release acceptance remain open. See the [current ARM artifact](docs/tv-prototype.md#non-debuggable-chromecast-artifact) and [runtime evidence](docs/device-tests.md).

## Development

Use x86-64 Linux and Nix with flakes enabled:

```sh
nix develop
git submodule update --init brave
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
```

The actual source is in [`brave/`](https://github.com/smolcars/brave-tv-core), a GitHub fork of Brave Core with upstream history. Edit its Java, C++, layouts and resources directly, commit/push its `master`, then commit the updated `brave` pointer here. There is no TV patch export/apply step. Chromium dependencies and build outputs stay in the existing external workspace. See [the source workflow](docs/source-workflow.md) and [build instructions](docs/build.md).

For automatic tools, review `.envrc` and run `direnv allow`. Enter `nix develop` before changing to the external build checkout so the tools remain available.

## Project documents

- [Engineering plan](docs/engineering-plan.md)
- [TV UI rebuild plan and implementation todo](docs/tv-ui-rebuild-plan.md)
- [Active TV-native checklist](docs/tv-native-checklist.md)
- [Direct-source workflow](docs/source-workflow.md)
- [MVP checklist](docs/mvp-todo.md)
- [Device and website test matrix](docs/device-tests.md)
- [Nix TV emulator setup](docs/emulator.md)
- [TV input prototype and button map](docs/tv-prototype.md)
- [Feasibility research](docs/feasibility.html)

This project is independent of Brave Software. Release branding and device compatibility remain work in progress.
