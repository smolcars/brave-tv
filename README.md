<img src="assets/icon.svg" width="64" height="64" alt="">

# brave-tv

An Android TV adaptation of Brave's Android browser. The Nix environment and source initialization work; the first Android build is compiling. A TV launcher/input patch has JVM behavior tests, but there is no validated TV APK yet.

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
- [TV input prototype and button map](docs/tv-prototype.md)
- [Feasibility research](docs/feasibility.html)

This project is independent of Brave Software. Release branding and device compatibility remain work in progress.
