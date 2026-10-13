# Phone page-field Enter and editor actions

Researched 12 October 2026 against Brave source
`3613f6db76808bedda88c83d55f81eb76e2ae7d9` and the initialized, pinned Chromium
`cfaadc5a132d78e1828635aa8405a499f3e14864`. This is source research and an
implementation recommendation, not runtime or Google/YouTube acceptance. No
build, installation, device operation, browser session, or checkout update was
performed. The existing transport research remains separate.

**Recommendation:** add a field-scoped native Enter/editor-action command to
the existing text bridge, then expose a primary Enter control in the phone's
Type panel. Where native Search/Go/Send/Done is equivalent to Enter, use that
label. Finish delivering the current text and selection before dispatching the
action. Native Enter lets the TV website decide whether to search, submit,
insert a newline, or do nothing. Do not use default Next as the primary typing
action: that would move focus instead of reproducing the requested TV Enter.
An editor action and a literal Enter must remain distinguishable. This follows the
existing Chromium implementation rather than interpreting a site's URL or DOM.
[Native action implementation][ime-action], [native key routing][key-routing].

## Current gap and available seams

The phone always presents `#editor` as a textarea. Its input loop replaces the
TV field through `edit: replace`; there is no page Enter or action control.
Delete and Finish composition are the only adjacent commands. The separate
address form already has Go, but that navigates the browser rather than acting
on its focused webpage field. Consequently, a newline in the phone textarea is
currently delivered as replacement text rather than as the website's native
Enter interaction. [Companion HTML](../brave/android/java/brave-res/raw/tv_remote.html),
[companion JS](../brave/android/java/brave-res/raw/tv_remote_js.js).

`TvRemoteBrowser.state()` publishes an eligible editor's field revision, content
version, replacement version, readiness, text and selection. Its command adapter
revalidates browser revision and page context before editing. `TvPhoneRemote`
already supplies session authentication, approval, epoch and sequence checks;
`TvRemoteServer` marshals bounded requests onto the UI thread. An action belongs
inside this existing command boundary; no transport endpoint or new server
abstraction is necessary. [Browser adapter](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteBrowser.java),
[session owner](../brave/android/java/org/chromium/chrome/browser/tv/TvPhoneRemote.java),
[server](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteServer.java).

`TvTextInput` already observes renderer input state and equal-type focus changes,
excludes password/history-of-password fields, limits text to 2,048 UTF-16 units,
validates surrogate boundaries, and waits for a native queue barrier plus
matching renderer state before another edit. The bytecode hook receives all four
native metadata integers—type, flags, mode, action—but currently passes only type
and flags to `stateChanged()`. Extend that signature and the signature test to
carry mode/action; do not create an input connection or restart the TV keyboard
just to read metadata. [Text bridge](../brave/android/java/org/chromium/content/browser/input/TvTextInput.java),
[IME hook](../brave/build/android/bytecode/java/org/brave/bytecode/TvImeAdapterClassAdapter.java),
[hook test](../brave/android/javatests/org/chromium/chrome/browser/BytecodeTest.java).

## What the native metadata means

Blink obtains focused-field type, flags, mode and action in its native
`TextInputInfo()`. Its action comes from the focused editable element's
`enterkeyhint`; absent/unrecognized hints become DEFAULT. The action enum has
Enter, Done, Go, Next, Previous, Search and Send. These are first-class browser
metadata, including for textarea and contenteditable. [Blink focused state][blink-state],
[action enum][action-enum]. The HTML attribute supplies a keyboard label/icon;
it does not by itself promise a form exists or will submit. [HTML enterkeyhint](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-enterkeyhint-attribute).

Compute the advertised Android action using the public
`ImeUtils.computeEditorInfo(type, flags, mode, action, start, end, text, info)`
and mask `info.imeOptions` with `EditorInfo.IME_MASK_ACTION`. This avoids
reimplementing Chromium's rules. Use a fresh local EditorInfo solely for that
calculation; `onCreateInputConnection()` changes connection ownership and is
unnecessary. [Chromium EditorInfo calculation][ime-utils],
[connection creation][ime-connection].

Pinned Chromium's exact defaults are:

| Native metadata | Advertised action |
| --- | --- |
| Explicit Enter hint | NONE, presented as Enter |
| Explicit Done/Go/Next/Previous/Search/Send hint | Corresponding Android action |
| DEFAULT action, DEFAULT input mode, SEARCH input type | Search |
| DEFAULT action and computed multiline input | NONE, presented as Enter |
| Other DEFAULT action with next-focusable flag | Next |
| Remaining DEFAULT action | Go |

All entries follow [ImeUtils.getImeAction()][ime-utils]. Input mode affects the
computed input flags: nondefault text/search modes can yield Android multiline
flags even for an HTML input. For the phone's *text editing surface*, retain the
native logical distinction used by `ImeAdapterImpl.updateState`: TEXT_AREA and
CONTENT_EDITABLE are multiline; TEXT and SEARCH are single-line. Do not use the
computed Android multiline bit alone to infer the HTML element's line behavior.
[Renderer-state handling][ime-state], [EditorInfo calculation][ime-utils].

No field-type or IME-action metadata establishes “this is a search form.” A
search widget implemented with a textarea can handle Enter in site JavaScript;
a plain input can search despite having type TEXT; a form may not submit
implicitly. Therefore Google/YouTube behavior must be tested against their
actual current TV pages, and must not be handled by hostnames, selectors,
button guessing or DOM inspection. This limitation follows from the metadata
above and HTML's conditional implicit-submission rules. [Blink focused state][blink-state],
[HTML implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission).

## Dispatch through Chromium's native API

Android's `InputConnection.performEditorAction(int)` is the IME API for a
declared editor action, not an application-level “submit this form” API.
[Android InputConnection](https://developer.android.com/reference/android/view/inputmethod/InputConnection#performEditorAction(int)).
Pinned `ThreadedInputConnection.performEditorAction()` simply queues
`mImeAdapter.performEditorAction(actionCode)` onto the UI thread and returns
true immediately. The phone server already executes synchronously there; call
the adapter's public `performEditorAction()` directly inside `TvTextInput`
after the existing guards. Going through the threaded connection would add a
post-validation scheduling gap and its success return cannot acknowledge page
behavior. [Threaded connection][threaded-action], [adapter action][ime-action].

The adapter checks validity. With DEFAULT native action, Next and Previous
advance focus; with an explicit hint they send Enter instead. Search, Go, Send,
Done, and NONE send native Enter down/up, using the virtual keyboard and soft
keyboard/editor-action flags. Done hides the *TV* keyboard only when fullscreen
IME is allowed. It does not reliably close the phone keyboard. Preserve these
semantics and use the refreshed field/page state after the action.
[ImeAdapterImpl.performEditorAction()][ime-action].

Also support **literal Enter** as a narrowly scoped operation. After validating
the same eligible field and `mAdapter.isValid()`, use
`sendSyntheticKeyPress(KEYCODE_ENTER, FLAG_SOFT_KEYBOARD | FLAG_KEEP_TOUCH_MODE)`
on that adapter, or send its equivalent down/up pair through `sendKeyEvent`.
This reuses the native Enter path without changing default Next into focus
traversal. Never accept arbitrary Android keycodes from the phone.
[Synthetic key helper][ime-action], [adapter validity][ime-validity].

Chromium routes those keyboard events to the focused render widget, including
out-of-process frames. Blink's text-input default handler recognizes native
Enter for implicit submission; normal form activation retains constraint
validation and cancelable submit/site handlers. This is why the action should
not call `form.submit()`, mutate DOM values, dispatch JS keyboard events, click
a guessed search button, or reconstruct a Google/YouTube URL.
[Native routing][key-routing], [Blink input handling][implicit-native],
[HTML submission algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission-algorithm).

For a multiline field, native Enter should let Blink/site handlers own the
result: newline, paragraph, prevented input, or site-defined search. Do not
predict its result as whole-field `text + '\n'`. Native action completion needs
a barrier/state refresh, not the ordinary pending edit's exact predicted-text
match. Reuse the existing timeout and invalidation machinery with a small
pending-action phase. [Existing pending-edit machine](../brave/android/java/org/chromium/content/browser/input/TvTextInput.java),
[native input barrier](../brave/content/browser/android/tv_text_input.cc).

## Minimal protocol and phone behavior

The following is a proposed contract, not existing state:

```json
"editable": {
  "revision": 17,
  "version": 42,
  "replacementVersion": 40,
  "ready": true,
  "multiline": false,
  "action": "search",
  "composing": false,
  "text": "example",
  "start": 7,
  "end": 7
}
```

Add an `edit: "action"` operation plus `action: "search"`, or an equally small
field-scoped command. The TV derives/validates that token against its current
native action; it never trusts a client-selected raw action integer. Add a
fixed `edit: "enter"` for literal Enter. Both require the exact content
`version`; the looser `replacementVersion` exception applies only to replacing
text. Type, mode, action or relevant flags changing must invalidate the action
snapshot/version even when text and selection are unchanged. [Existing version
checks](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteBrowser.java),
[native metadata updates][ime-state].

Show a visible primary Enter button beside page text. Substitute native
Search/Go/Done/Send labels when that corresponding action sends Enter in the
pinned adapter. When the computed default action is Next/Previous, keep the
primary button and phone keyboard hint **Enter**, and dispatch literal native
Enter. Thus even a plain search field with a next-focusable element can search
without pointer interaction. If native Next/Previous controls are included,
present them separately and preserve their exact native semantics; they are
not necessary for the minimal fix. Explicit Next/Previous hints also remain
metadata, not proof of a form or actual focus traversal. Set the phone control's
`enterkeyhint` from the primary control's same enum. Use a single-line
text input for logical single-line fields and a textarea for logical multiline
fields, switching only on a confirmed field identity change. The visible button
remains necessary because keyboard labels/events vary between phone keyboards;
changing the hint alone cannot deliver a TV action. Use **Enter** for unknown
or NONE actions, never invent Search based on the current URL. Native metadata
determines optional labels and editor shape; the native Enter event determines
what the TV website actually does. Native field type must not become a heuristic
for search intent or a rule that multiline fields can never search.
[HTML keyboard-label semantics](https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-enterkeyhint-attribute),
[native action mapping][ime-utils].

For a phone Enter interaction, ensure only one handler dispatches it: prefer
cancelable `beforeinput` with `insertLineBreak`/`insertParagraph` where emitted,
and a tested `keydown` fallback for single-line/physical-keyboard cases. Explicit
buttons are the reliable fallback. Prevent the local default newline only when
the native operation is being sent; do not send both a local replacement newline
and native Enter. Keep multiline input as multiline, and let the TV's native
Enter produce its authoritative result. Pasted newlines stay ordinary text.
[Input Events Level 2](https://www.w3.org/TR/input-events-2/),
[UI Events](https://www.w3.org/TR/uievents/#event-type-beforeinput).

Before dispatching, flush the phone's latest text/selection through the current
edit path and wait for `ready` plus matching authoritative text/selection.
Capture epoch, browser revision, field revision and version at intent time;
cancel if any ownership changes while awaiting the flush. Do not take a newly
focused field's identity and send the old action there. A short bounded wait is
safe; replay after network failure or reconnect is not. The current 80 ms
coalescing interval and HTTP acceptance alone cannot establish completion.
[Phone pending edits](../brave/android/java/brave-res/raw/tv_remote_js.js),
[native acknowledgement](../brave/android/java/org/chromium/content/browser/input/TvTextInput.java).

Composition requires both phone and TV state. Ignore Enter while phone
composition is active (`isComposing`, with the tested keycode-229 fallback): it
can accept an IME candidate rather than submit. After compositionend, flush its
final text, finish native composition when needed, and await confirmed inactive
composition before enabling the action. Do not submit merely because
compositionend fired. Reject native active composition in the command guard;
do not finish another controller's/physical IME's composition implicitly.
[UI Events composition](https://www.w3.org/TR/uievents/#key-events-during-composition),
[existing finish operation](../brave/android/java/org/chromium/content/browser/input/TvTextInput.java).

Disable actions while disconnected, paused/private/native/modal, without an
eligible field, during composition or native completion, or after stale-state
rejection. Keep reading/finishing/paused feedback beside the editor. Refresh
state after native dispatch, and acknowledge **input accepted**, not “search
succeeded”: validation or site handlers may keep the user on the same page.
Preserve the current no-password/no-private-data/no-modal-control policy.
[Browser guards](../brave/android/java/org/chromium/chrome/browser/tv/TvRemoteBrowser.java),
[phone render/reset behavior](../brave/android/java/brave-res/raw/tv_remote_js.js).

## Implementation order and acceptance

1. Extend IME hook metadata, native bridge getters/action guards and the
   hook-signature test. Derive labels with Chromium's existing utility. Keep
   text editing's existing composition/selection ownership and UTF-16 checks.
2. Add the field-scoped action/Enter dispatch inside `TvRemoteBrowser` and reuse
   the existing session protocol. Keep action readiness false until its native
   barrier and fresh renderer state, with invalidation/timeout cancellation.
3. Add the visible labeled action and Enter behavior to bundled HTML/JS/CSS.
   Flush current text/selection before dispatch; preserve exactly-once behavior
   across overlapping polling, keydown/beforeinput and button interaction.
4. Extend harmless fixtures and the existing host/native probes, then verify an
   actual build and explicitly authorized TV/phone sessions in the main task.
   Source inspection alone is insufficient. Existing test entry points are
   [phone fixture](../tests/pages/phone-remote.html),
   [host UI probe](../tests/device/phone-remote-ui.mjs),
   [native probe](../tests/device/phone-native-probe.mjs),
   [guard probe](../tests/device/phone-native-guards.mjs), and
   [stock IME probe](../tests/device/phone-stock-ime-probe.mjs).

Necessary regressions are parallel cases rather than tests of getter plumbing:

| Case | Required observation |
| --- | --- |
| Search input/form; text input/form; site Enter handler without form | One native action, final characters included, correct handler/default submission |
| Invalid required field; disabled submit button; canceled keydown/submit | Normal site validation/cancellation; no guessed click or bypass |
| Default Next and explicit Next/Previous hints | Preserve Chromium's distinct focus traversal versus Enter behavior |
| Ordinary textarea/contenteditable; textarea search handler | Newline/paragraph once in ordinary editor; site handler owns search |
| All seven hints; hint/mode/type changes with equal text | Correct label and rejection of stale action metadata |
| Japanese/Chinese candidate confirmation; emoji; autocorrection; selection replacement | Candidate acceptance never submits; complete text/selection before action |
| Action immediately after typing, during held native ack, twice quickly | Final edit drains first, one dispatch per accepted intent, bounded wait |
| Tab/reload/navigation/same-type field switch/iframe focus/private/modal/renderer loss | Old action rejected, no action against the newly focused target |
| Dropped reply, reconnect, background/resume, sequence replay | No action replay and no false success |
| Current Google and YouTube on actual TV; Android phone and iPhone Safari | Search via Type without pointer; record field/action metadata and exact versions |

The remaining uncertainties are phone event delivery across real IMEs, current
Google/YouTube focused-field metadata/Enter handlers, and the native action's
renderer completion behavior under navigation or focus changes. There is no
implementation blocker in the inspected API. The metadata does not expose form
ownership or prove submission; native Enter deliberately leaves that decision
to the browser and website.

[ime-action]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ImeAdapterImpl.java#1187
[ime-state]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ImeAdapterImpl.java#726
[ime-connection]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ImeAdapterImpl.java#519
[ime-validity]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ImeAdapterImpl.java#495
[ime-utils]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ImeUtils.java#182
[threaded-action]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/public/android/java/src/org/chromium/content/browser/input/ThreadedInputConnection.java#440
[blink-state]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/third_party/blink/renderer/core/editing/ime/input_method_controller.cc#1733
[action-enum]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/ui/base/ime/text_input_action.h
[key-routing]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/content/browser/renderer_host/render_widget_host_view_android.cc#2834
[implicit-native]: https://chromium.googlesource.com/chromium/src/+/cfaadc5a132d78e1828635aa8405a499f3e14864/third_party/blink/renderer/core/html/forms/input_type_view.cc#96
