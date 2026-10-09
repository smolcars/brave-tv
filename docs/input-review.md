# First input increment review

Scope requested by the user: latest implementation commit only. Compared `c48f63717a7ab22ced7a57aa19153dbe7b1436e9` with parent `7a4ec72895a5b763dcb7d58acbc8d28df189b25c`. Two independent read-only reviews used the engineering plan and upstream Android standards.

## Standards

- **P2: native UI priority.** Skipping CloseWatcher in a query that reports only the highest enabled handler also hides native Find/bottom controls ranked below it. Check native UI independently.
- **P2: callback lifecycle.** Dialog selection/cancel callbacks need destruction checks at callback entry, as required by upstream Android rule AND-001.
- No heuristic smell justified additional abstractions.

## Spec

- **P1: OK click delivery.** Chromium's `ui/android/java/src/org/chromium/ui/base/EventForwarder.java` consumes mouse DOWN/UP without emitting clicks. The adapter must send a supported event sequence. The JVM tests only observe a click request.
- **P2: native-page Back.** The always-enabled TV callback opens controls before native history/search/selection handling. Native pages must retain upstream handling.
- **P2: native UI priority.** Same CloseWatcher combination as the Standards finding.
- No scope creep. Android compilation and device validation remain explicitly pending.

Totals: Standards 2 findings (worst P2); Spec 3 findings (worst P1). The shared priority finding is reported on both axes.

## Regression procedure and resolution evidence

Status: source corrections prepared; Android checks not run. See [the correction plan](engineering-plan.md#corrections-from-the-first-input-review).

- OK now emits a finger/touchscreen DOWN/UP pair with press/release pressure; hover and wheel stay mouse events. This follows Chromium's touch-input path rather than its mouse DOWN/UP suppression.
- Native pages delegate Back. Native focus, visible Find UI and the existing scrim visibility supplier are checked independently of the highest Back handler. `ScrimManager.showScrim()` sets this supplier before starting the tab-group dialog animation, covering the interval before native focus is assigned. No Chromium Back manager API was added or reordered.
- Dialog actions, Back callbacks and event delivery now reject a destroyed/finishing activity or a controller already torn down. Page-change handling only runs for mapped remote keys after native-UI checks.
- The Java formatter, patch whitespace/apply checks and all nine repository tests/typechecking in `nix flake check` pass. These checks do not compile or execute the Android adapter. No Android red/green cycle has been completed; runtime acceptance remains open.

The controlled fixture is [`tests/pages/remote-input.html`](../tests/pages/remote-input.html). With device access enabled and a built APK, serve `tests/pages` using Python from the Nix shell, then load the page through a test connection. Keep the server private to the test environment; for an authorized ADB-connected target, bind it to localhost and use `adb reverse tcp:8000 tcp:8000`:

```sh
nix develop --command python3 -m http.server 8000 --bind 127.0.0.1 --directory tests/pages
# In another Nix shell, once device access is enabled:
adb reverse tcp:8000 tcp:8000
# On the target, open http://127.0.0.1:8000/remote-input.html
```

Record actual results for:

1. Cursor OK increments the counter once on release, with no repeated clicks while held.
2. Text entry opens/dismisses the keyboard normally; scrolling affects the nested box under the cursor.
3. Enable CloseWatcher, return to cursor mode, then Back: TV controls remain reachable.
4. With CloseWatcher enabled, open native Find in page and dismiss the keyboard. D-pad/OK must stay with Find. Repeat with the tab-group dialog, including its opening animation.
5. On a native history page, Back clears selection/search before navigation or exit.
6. Leave/resume the app while a control is being selected; no delayed click or UI action executes after teardown.

No device connection, browser result, or Android regression pass is implied by the existence of this fixture. The machine reboot interrupted the original build; recovery details are in [build.md](build.md).

## Follow-up: latest correction commit

Compared only `0ed082e3fc2625e1600a78923ecdf601b8aa6b7b` against parent `caa729562d378f0e3e8787b6a2c7cd9f561dcd05`.

### Standards

One P3 finding remained: the dialog selection callback called `dismiss()` before the lifecycle check inside its action handler. Added the same lifecycle guard at callback entry, before dismissal. The previous native-priority finding is addressed at source level; no additional heuristic findings.

### Spec

Zero new findings. Source inspection confirmed the three original defects are addressed and the correction stays within the engineering plan. Android compilation and runtime checks remain unverified.

Follow-up totals: Standards 1 finding (P3, corrected); Spec 0 findings. These source-review results do not close the physical-device gate.

## Android compiler correction review

Compared only `70f739f65d2fea0744330b2c9dbeeb9c2e8b4e9f` against parent `9e85bb77def931c02d76969ae1dedb28366bcaf3`.

### Standards

Zero findings. The AndroidX annotation matches existing Brave Android code and adds no dependency, suppression or behavioral logic.

### Spec

Zero findings. The correction follows the written integration plan and preserves nullable declarations and input behavior.

Android header compilation, Java compilation and APK packaging have now succeeded. Background static analysis was interrupted at service exit and is being rerun in blocking mode; device regression procedures remain unexecuted. Totals for this latest-commit review: Standards 0, Spec 0.

## Launcher resource correction review

Compared only `7f43abb4a25411d731c18f68c12706de36d18091` against parent `9e33f3bc4514525101c182fe2e5c0b1259e1b6fd`.

### Standards

Zero findings. The banner change preserves its artwork; the two resource exceptions follow Brave's existing manifest-resource pattern with a short explanation. The preceding commit records the plan. No dependency or abstraction was introduced.

### Spec

Zero findings. The dimensions, unchanged viewport and exact resource exceptions match the correction plan. Global checks remain enabled and the change introduces no additional behavior.

Totals: Standards 0, Spec 0. Launcher lint and packaged manifest/banner inspection subsequently passed. Neither review establishes launcher rendering or physical-device behavior.

## Explicit condition grouping review

Compared only `1e1c5940f4cb492ddc5d66885def16d280bcf4c9` against parent `ac2f3bcfecebbea43abdc925f835e2956baad43a`.

### Standards

Zero findings. Explicit grouping preserves evaluation order and adds no dependency, abstraction or smell.

### Spec

Zero findings. Both source trees and the exported patch match the planned grouping correction. No behavior changes or checks are suppressed.

Totals: Standards 0, Spec 0. Blocking Android analysis remains pending; device checks remain unexecuted.
