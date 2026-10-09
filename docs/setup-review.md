# Setup review

Reviewed changes from `321c048243a08a823d2d0305466f6b2a213a4f26` through `69cc055` with separate Standards and Spec reviewers. This reviews the initial setup increment, not a completed Android TV MVP. Findings were addressed in `360d335` unless explicitly left pending below.

The invoked [code-review skill](/home/nitesh/.codex/skills/code-review/SKILL.md) says, “If they didn't specify one, ask for it.” The user was asked about the comparison point; the engineering plan's initial-project baseline was used while that optional clarification remained unanswered.

## Standards

1. **Resolve the actual checkout path before cloning.** The workspace guard could be bypassed by a `workspace/src` symlink into this project, violating the plan's external-source requirement. **Fixed:** resolve and validate the destination too. The new public-command regression test failed before the fix and passes afterward.
2. **Cover missing prerequisites.** The plan explicitly required this command-boundary test, but only installed-tool smoke checks existed. **Fixed:** a PATH without Git produces a visible failure before creating the workspace. The test failed before the fix and passes afterward.

No heuristic code-smell findings warranted additional abstractions.

## Spec

1. **Direnv unloads the toolchain outside the project.** The instructions directed users to an external checkout after offering direnv alone. **Fixed:** the README and build guide require entering `nix develop` before changing directories; the development shell retains its environment.
2. **The missing-Git test was absent.** **Fixed** as described in the Standards report.
3. **Stage 1 remains incomplete.** Its exit requires a real baseline APK or a documented external blocker with resume commands. Source initialization is still underway at this review point; compilation and installation evidence remain pending. Check [build.md](build.md) for later results.
4. **The rest of the MVP remains outstanding.** TV input and its approved tests, browser controls, Shields and video verification, release identity/signing/updates, and device/tester acceptance remain unchecked. No working APK or successful TV behavior is claimed.

No scope creep was found. The reviewers confirmed that the checkout helper checks the pinned Brave revision and matching Chromium configuration without resetting existing work.

Standards: 2 findings, both fixed; worst issue was the checkout-path bypass. Spec: 4 findings, 2 fixed and 2 pending delivery gates; the full MVP is still incomplete.
