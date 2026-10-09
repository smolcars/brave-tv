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

Status: corrections planned; Android checks not run. See [the correction plan](engineering-plan.md#corrections-from-the-first-input-review).

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
