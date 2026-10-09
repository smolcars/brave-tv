<img src="assets/icon.svg" width="64" height="64" alt="">

# brave-tv

An Android TV adaptation of Brave's Android browser. Development has started with a pinned upstream checkout and a Nix build environment; there is no working TV APK yet.

## Development

Use x86-64 Linux and Nix with flakes enabled:

```sh
nix develop
python3 tools/checkout.py "$HOME/.cache/brave-tv/workspace"
```

Alternatively, review `.envrc` and run `direnv allow`. Follow [the build instructions](docs/build.md) to initialize and compile upstream Brave. Browser source and build outputs stay outside this repository.

## Project documents

- [Engineering plan](docs/engineering-plan.md)
- [MVP checklist](docs/mvp-todo.md)
- [Feasibility research](docs/feasibility.html)

This project is independent of Brave Software. Release branding and device compatibility remain work in progress.
