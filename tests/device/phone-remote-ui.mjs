// Host-only companion regression. Pass an existing playwright-core package directory.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(resolve(process.argv[2], "package.json"));
const { chromium } = require("playwright-core");
const assets = resolve(process.argv[3] || "brave/android/java/brave-res/raw");
const captureDirectory = process.argv[4];
if (captureDirectory) await mkdir(captureDirectory, { recursive: true });
async function capture(page, name) {
  if (!captureDirectory) return;
  await page.evaluate(() => new Promise((r) => setTimeout(r, 200)));
  await page.screenshot({
    path: resolve(captureDirectory, `${name}.png`),
    fullPage: true,
  });
}
const commands = [];
let approved = false;
let nativePaused = false;
let pauseReason = "controls";
let approvalError = "approval";
let pollStarted;
let releasePoll;
let delayedPoll = false;
let selectionStarted;
let releaseSelection;
let conflictingCaret = false;
let compositionBeforeReplace = false;
let textBeforeReplace = false;
let holdNativeAck = false;
let rejectEnter = false;
let holdEnterAck = false;
let holdPrepareAck = false;
const initial = {
  revision: 1,
  paused: false,
  title: "A quiet evening",
  url: "http://fixture.test/",
  back: true,
  forward: false,
  loading: false,
  page: true,
  width: 1920,
  height: 1080,
  x: 960,
  y: 540,
  tabs: [{ id: "tab-one", title: "Phone remote fixture", selected: true }],
  editable: {
    revision: 2,
    version: 1,
    replacementVersion: 1,
    ready: true,
    action: "enter",
    multiline: false,
    composing: false,
    phoneTyping: false,
    text: "hello",
    start: 5,
    end: 5,
  },
};
const server = createServer(async (req, res) => {
  if (req.method === "GET") {
    const route = {
      "/": "tv_remote.html",
      "/remote.js": "tv_remote_js.js",
      "/remote.css": "tv_remote_css.css",
    }[req.url];
    if (!route) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      route.endsWith(".html")
        ? "text/html"
        : route.endsWith(".js")
          ? "text/javascript"
          : "text/css",
    );
    res.end(await readFile(resolve(assets, route)));
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = JSON.parse(body);
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/pair") {
    res.end(JSON.stringify({ token: "synthetic-test-token" }));
    return;
  }
  if (!approved) {
    res.end(JSON.stringify({ error: approvalError }));
    return;
  }
  if (nativePaused) {
    res.end(
      JSON.stringify({
        ok: true,
        epoch: "synthetic-epoch",
        state: { revision: 2, paused: true, pauseReason },
      }),
    );
    return;
  }
  if (data.op === "state" && delayedPoll) {
    delayedPoll = false;
    const barrier = new Promise((r) => {
      releasePoll = r;
    });
    pollStarted?.();
    await barrier;
  }
  if (data.op !== "state") commands.push(data);
  if (data.op === "stopTyping") initial.editable.phoneTyping = false;
  if (data.edit === "prepare") {
    const ok = initial.editable.ready && !initial.editable.composing;
    if (ok) {
      initial.editable.phoneTyping = true;
      initial.editable.ready = !holdPrepareAck;
    }
    res.end(JSON.stringify({ ok, epoch: "synthetic-epoch", state: initial }));
    return;
  }
  if (data.edit === "finish") {
    initial.editable.phoneTyping = true;
    initial.editable.composing = false;
  }
  if (data.edit === "enter") {
    const ok = !rejectEnter && initial.editable?.ready && !initial.editable.composing
      && data.editable === initial.editable.revision
      && data.version === initial.editable.version && data.action === initial.editable.action;
    if (ok) initial.editable.ready = !holdEnterAck;
    res.end(JSON.stringify({ ok, epoch: "synthetic-epoch", state: initial }));
    return;
  }
  if (data.edit === "select") {
    if (selectionStarted) {
      const barrier = new Promise((r) => {
        releaseSelection = r;
      });
      selectionStarted();
      await barrier;
    }
    initial.editable.start = data.start + (conflictingCaret ? 1 : 0);
    initial.editable.end = data.end;
    initial.editable.version++;
    initial.editable.replacementVersion++;
  }
  if (data.edit === "replace") {
    if (compositionBeforeReplace) {
      compositionBeforeReplace = false;
      initial.editable.version++;
    }
    if (textBeforeReplace) {
      textBeforeReplace = false;
      initial.editable.text = "Updated on TV";
      initial.editable.start = initial.editable.end =
        initial.editable.text.length;
      initial.editable.version++;
      initial.editable.replacementVersion++;
    }
    const ok =
      data.version === initial.editable.version ||
      data.replacementVersion === initial.editable.replacementVersion;
    if (ok) {
      initial.editable.ready = !holdNativeAck;
      initial.editable.text = data.text;
      initial.editable.composing = !!data.composing;
      initial.editable.start = data.start + (conflictingCaret ? 1 : 0);
      initial.editable.end = data.end;
      initial.editable.version++;
      initial.editable.replacementVersion++;
    }
    res.end(JSON.stringify({ ok, epoch: "synthetic-epoch", state: initial }));
    return;
  }
  res.end(
    JSON.stringify({ ok: true, epoch: "synthetic-epoch", state: initial }),
  );
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const browser = await chromium.launch({
  executablePath:
    "/home/nitesh/.t3/tools/chrome-headless-shell/linux64/154.0.8037.92/chrome-headless-shell",
});
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    `http://127.0.0.1:${server.address().port}/#synthetic-invite`,
  );
  await page
    .getByText("Waiting for approval on the TV…", { exact: true })
    .waitFor();
  assert.equal(
    await page.locator("#pairForm").isVisible(),
    false,
    "A scanned invitation waiting for TV approval must not ask for a pairing code",
  );
  assert.equal(await page.locator("#approval").isVisible(), true);
  await capture(page, "approval-mobile");
  approved = true;
  await page.getByText("Connected to your TV", { exact: true }).waitFor();
  assert.equal(await page.locator("#approval").isVisible(), false);
  assert.equal(new URL(page.url()).hash, "");
  delayedPoll = true;
  await new Promise((r) => {
    pollStarted = r;
  });
  const backResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postDataJSON().op === "back",
  );
  await page.getByRole("button", { name: "Back", exact: true }).click();
  assert.equal(
    commands.length,
    0,
    "action waits while the poll response is held",
  );
  releasePoll();
  await backResponse;
  await page.waitForFunction(() => !busy);
  assert.equal(
    commands.filter((c) => c.op === "back").length,
    1,
    "one button press during polling must deliver once",
  );
  await page.locator("#pad").scrollIntoViewIfNeeded();
  const pad = await page.locator("#pad").boundingBox();
  delayedPoll = true;
  await new Promise((r) => {
    pollStarted = r;
  });
  await page.mouse.move(pad.x + 40, pad.y + 40);
  await page.mouse.down();
  await page.mouse.move(pad.x + 80, pad.y + 40);
  await page.mouse.up();
  const movement = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postDataJSON().op === "move",
    { timeout: 1000 },
  );
  const dragClick = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postDataJSON().op === "click",
    { timeout: 1000 },
  );
  await page.mouse.click(pad.x + 80, pad.y + 40);
  releasePoll();
  await Promise.all([movement, dragClick]);
  await page.waitForFunction(() => !busy);
  assert.equal(commands.filter((c) => c.op === "move").length, 1);
  assert.deepEqual(
    commands.slice(-2).map((c) => c.op),
    ["move", "click"],
  );
  await page.getByText("Pointer & scroll buttons", { exact: true }).click();
  const clickResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postDataJSON().op === "click",
  );
  await page.getByRole("button", { name: "Click", exact: true }).click();
  await clickResponse;
  await page.waitForFunction(() => !busy);
  assert.equal(commands.filter((c) => c.op === "click").length, 2);
  const originalEditable = initial.editable;
  initial.editable = null;
  await page.waitForFunction(() => !state.editable);
  const nextMove = () =>
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.request().postDataJSON().op === "move",
      { timeout: 3000 },
    );
  const firstNoFieldMove = nextMove();
  await page.mouse.move(pad.x + 40, pad.y + 40);
  await page.mouse.down();
  await page.mouse.move(pad.x + 80, pad.y + 40);
  await (await firstNoFieldMove).finished();
  const heldPoll = await page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postDataJSON().op === "state",
    { timeout: 3000 },
  );
  await heldPoll.finished();
  await page.waitForFunction(() => !busy && !polling);
  const movesAfterPoll = commands.filter((c) => c.op === "move").length;
  const secondNoFieldMove = nextMove();
  await page.mouse.move(pad.x + 120, pad.y + 40);
  await (await secondNoFieldMove).finished();
  await page.mouse.up();
  await page.waitForFunction(() => !busy);
  assert.ok(
    commands.filter((c) => c.op === "move").length > movesAfterPoll,
    "Movement after a completed no-field poll must still be delivered",
  );
  initial.editable = originalEditable;
  await page.waitForFunction(
    () => state.editable?.ready && field === state.editable.revision,
  );
  holdPrepareAck = true;
  await page.locator("#showKeyboard").click();
  await page.waitForFunction(() => state.editable.phoneTyping && !state.editable.ready);
  assert.equal(await page.locator("#editor").getAttribute("readonly"), "");
  assert.equal(await page.locator("#enter").isDisabled(), true);
  assert.equal(commands.filter((c) => c.edit === "replace").length, 0);
  holdPrepareAck = false;
  initial.editable.ready = true;
  await page.waitForFunction(() => state.editable.phoneTyping && state.editable.ready && !busy);
  assert.equal(await page.locator("#editor").getAttribute("readonly"), null);
  initial.editable.phoneTyping = false;
  await page.waitForFunction(() => !state.editable.phoneTyping);
  const preparations = commands.filter((c) => c.edit === "prepare").length;
  await page.waitForTimeout(650);
  assert.equal(commands.filter((c) => c.edit === "prepare").length, preparations,
    "Physical TV input cannot be automatically reclaimed");
  assert.equal(await page.locator("#enter").isDisabled(), true);
  await page.locator("#editor").click();
  await page.waitForFunction(() => state.editable.phoneTyping && state.editable.ready && !busy);
  await page.locator("#editor").focus();
  holdNativeAck = true;
  await page.locator("#editor").fill("Native acknowledgement fixture");
  await page.waitForFunction(() => state.editable && !state.editable.ready);
  assert.equal(await page.locator("#editor").isEnabled(), true,
    "A pending same-field native acknowledgement must keep the phone keyboard focused");
  assert.equal(await page.evaluate(() => document.activeElement.id), "editor");
  holdNativeAck = false;
  initial.editable.ready = true;
  await page.waitForFunction(() => state.editable.ready && !pendingEdit);
  const versionBeforeSelection = initial.editable.version;
  const selected = new Promise((r) => {
    selectionStarted = r;
  });
  await page.locator("#editor").evaluate((e) => e.setSelectionRange(0, 5));
  await selected;
  await page.locator("#editor").fill("héllo 🌍");
  releaseSelection();
  await page.waitForFunction(
    () => state.editable.text === "héllo 🌍",
    undefined,
    { timeout: 3000 },
  );
  assert.equal(commands.filter((c) => c.edit === "replace").at(-1).version,
    versionBeforeSelection + 1);
  await page.waitForFunction(() => !busy && !pendingEdit);
  const replacements = commands.filter((c) => c.edit === "replace").length;
  const conflictingSelection = new Promise((r) => {
    selectionStarted = r;
  });
  await page.locator("#editor").evaluate((e) => e.setSelectionRange(0, 1));
  await conflictingSelection;
  await page.locator("#editor").fill("discard this stale edit");
  initial.editable.text = "Changed on TV";
  releaseSelection();
  await page.waitForFunction(() => !busy && !pendingEdit && !dirty);
  assert.equal(
    commands.filter((c) => c.edit === "replace").length,
    replacements,
  );
  assert.equal(await page.locator("#editor").inputValue(), "Changed on TV");
  const caretSelection = new Promise((r) => {
    selectionStarted = r;
  });
  conflictingCaret = true;
  await page.locator("#editor").evaluate((e) => e.setSelectionRange(0, 2));
  await caretSelection;
  await page.locator("#editor").fill("discard stale caret edit");
  releaseSelection();
  await page.waitForFunction(() => !busy && !pendingEdit && !dirty);
  assert.equal(
    commands.filter((c) => c.edit === "replace").length,
    replacements,
  );
  assert.equal(await page.locator("#editor").inputValue(), "Changed on TV");
  selectionStarted = undefined;
  conflictingCaret = false;
  compositionBeforeReplace = true;
  await page.locator("#editor").fill("Composition-safe replacement");
  await page.waitForFunction(
    () =>
      state.editable.text === "Composition-safe replacement" &&
      !busy &&
      !pendingEdit,
  );
  assert.equal(
    typeof commands.filter((c) => c.edit === "replace").at(-1)
      .replacementVersion,
    "number",
  );
  textBeforeReplace = true;
  await page.locator("#editor").fill("Discard changed text");
  await page.waitForFunction(
    () =>
      state.editable.text === "Updated on TV" &&
      !busy &&
      !pendingEdit &&
      !dirty,
  );
  assert.equal(await page.locator("#editor").inputValue(), "Updated on TV");
  await page.locator("#editor").fill("");
  await page.waitForFunction(
    () => state.editable.text === "" && !busy && !pendingEdit,
  );
  await page.locator("#editor").focus();
  const ime = await page.context().newCDPSession(page);
  await ime.send("Input.imeSetComposition", {
    text: "日本",
    selectionStart: 2,
    selectionEnd: 2,
  });
  assert.equal(
    await page.evaluate(() => composing),
    true,
    "Real compositionstart must enter composing mode",
  );
  await page.waitForFunction(
    () => state.editable.text === "日本" && !busy && !pendingEdit,
  );
  assert.equal(
    commands.filter((c) => c.edit === "replace").at(-1).composing,
    true,
  );
  await ime.send("Input.insertText", { text: "日本" });
  await page.waitForFunction(
    () => !composing && !dirty && !busy && !pendingEdit,
  );
  assert.equal(
    commands.filter((c) => c.edit === "replace").at(-1).composing,
    false,
  );
  assert.equal(await page.locator("#editor").inputValue(), "日本");
  await ime.detach();
  await page.screenshot({
    path: "/home/nitesh/.cache/brave-tv/artifacts/phone-remote-ui-portrait.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  // Task changes and native tab updates preserve keyboard ownership.
  await page.locator("#showKeyboard").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => !state.editable.phoneTyping && !busy);
  assert.equal(commands.at(-1).op, "stopTyping", "Leaving Type returns the keyboard lease");
  assert.equal(
    await page.locator("#tabsTab").getAttribute("aria-selected"),
    "true",
  );
  assert.equal(await page.locator("#typeView").isVisible(), false);
  await page.locator(".tab-select").focus();
  initial.tabs[0].title = "Renamed on TV";
  await page
    .getByRole("button", { name: "Renamed on TV", exact: true })
    .waitFor();
  assert.equal(
    await page
      .locator(".tab-select")
      .evaluate((e) => e === document.activeElement),
    true,
  );
  initial.tabs[0].id = "rotated-selected-tab";
  await page.waitForFunction(
    () =>
      document.querySelector(".tab-select")?.dataset.tab ===
      "rotated-selected-tab",
  );
  assert.equal(
    await page
      .locator(".tab-select")
      .evaluate((e) => e === document.activeElement),
    true,
    "Native handle rotation keeps focus on the authoritative selected tab",
  );
  initial.tabs = [];
  await page.locator("#tabsEmpty").waitFor();
  assert.equal(
    await page
      .locator('[data-op="new"]')
      .evaluate((e) => e === document.activeElement),
    true,
  );
  initial.tabs = [
    { id: "tab-one", title: "Phone remote fixture", selected: true },
  ];
  const editableBeforeHome = initial.editable;
  initial.editable = null;
  initial.page = false;
  await page.locator("#remoteTab").click();
  await page.locator("#homeState").waitFor();
  assert.equal(await page.locator("#pointer").isVisible(), false);
  await capture(page, "home-mobile");
  await page
    .getByRole("button", { name: "Enter address", exact: true })
    .click();
  assert.equal(
    await page
      .locator("#address")
      .evaluate((e) => e === document.activeElement),
    true,
  );
  assert.equal(await page.locator("#editor").isDisabled(), true);
  assert.equal(await page.locator("#editor").inputValue(), "");
  initial.page = true;
  initial.editable = editableBeforeHome;
  await page.waitForFunction(() => state?.editable?.ready && state?.page);
  await page.setViewportSize({ width: 320, height: 700 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "320px reflow",
  );
  await page.setViewportSize({ width: 844, height: 390 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [id, name] of [
    ["remoteTab", "remote"],
    ["showKeyboard", "type"],
    ["tabsTab", "tabs"],
  ]) {
    await page.locator(`#${id}`).click();
    if (name === "type") await page.waitForFunction(() => state.editable.phoneTyping && state.editable.ready && !busy);
    await capture(page, `${name}-mobile`);
    if (captureDirectory && name === "type") {
      for (const [width, height, size] of [[320, 700, "small"], [844, 390, "landscape"], [1440, 900, "desktop"]]) {
        await page.setViewportSize({ width, height });
        await capture(page, `type-${size}`);
      }
      await page.setViewportSize({ width: 390, height: 844 });
    }
  }
  await page.locator("#remoteTab").click();
  for (const [width, height, name] of [
    [320, 700, "small"],
    [844, 390, "landscape"],
    [1440, 900, "desktop"],
  ]) {
    await page.setViewportSize({ width, height });
    await capture(page, `remote-${name}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#showKeyboard").click();
  await page.waitForFunction(() => state.editable.phoneTyping && state.editable.ready && !busy);
  await page.locator("#editor").scrollIntoViewIfNeeded();
  const enters = () => commands.filter((c) => c.edit === "enter");
  const enterSettled = () => page.waitForFunction(
    () => !enterIntent && !busy && !pendingEdit && !dirty && state.editable?.ready,
  );
  initial.editable.action = "search";
  initial.editable.version++;
  await page.getByRole("button", { name: "Search", exact: true }).waitFor();
  assert.equal(await page.locator("#editor").getAttribute("enterkeyhint"), "search");
  const enterBefore = enters().length;
  await page.locator("#editor").fill("Immediate héllo 🌍");
  await page.locator("#enter").click();
  await enterSettled();
  assert.equal(enters().length, enterBefore + 1);
  assert.deepEqual(commands.slice(-2).map((c) => c.edit), ["replace", "enter"]);
  assert.equal(enters().at(-1).version, initial.editable.version);
  assert.equal(initial.editable.text, "Immediate héllo 🌍");
  assert.equal(await page.locator("#editor").inputValue(), "Immediate héllo 🌍");
  assert.equal(await page.evaluate(() => document.activeElement.id), "editor");

  holdNativeAck = true;
  await page.locator("#editor").fill("Held text acknowledgement");
  await page.waitForFunction(() => pendingEdit && !state.editable.ready);
  await page.locator("#enter").click();
  await page.waitForFunction(() => !!enterIntent);
  assert.equal(enters().length, enterBefore + 1);
  assert.equal(await page.locator("#enter").isDisabled(), true);
  assert.equal(await page.locator("#editor").getAttribute("readonly"), "");
  holdNativeAck = false;
  initial.editable.ready = true;
  await enterSettled();
  assert.equal(enters().length, enterBefore + 2);

  holdEnterAck = true;
  await page.locator("#editor").press("Enter");
  await page.waitForFunction(() => enterIntent?.sent && !state.editable.ready);
  const selectionsDuringEnter = commands.filter((c) => c.edit === "select").length;
  await page.locator("#editor").evaluate((editor) => new Promise((resolve) => {
    editor.addEventListener("select", resolve, { once: true });
    editor.setSelectionRange(0, 1);
  }));
  assert.equal(commands.filter((c) => c.edit === "select").length, selectionsDuringEnter,
    "Caret movement cannot send edits during pending native Enter");
  assert.equal(await page.locator("#editor").isEnabled(), true);
  assert.equal(await page.evaluate(() => document.activeElement.id), "editor");
  assert.equal(await page.evaluate(() => requestEnter()), false);
  assert.equal(await page.locator("#enter").isDisabled(), true);
  holdEnterAck = false;
  initial.editable.ready = true;
  await enterSettled();
  assert.equal(enters().length, enterBefore + 3);
  assert.equal(initial.editable.text, "Held text acknowledgement");

  const sentTimeoutBefore = enters().length;
  holdEnterAck = true;
  await page.locator("#enter").click();
  await page.waitForFunction(() => enterIntent?.sent && !state.editable.ready);
  await page.waitForFunction(() => !enterIntent);
  assert.equal(await page.locator("#fieldHint").textContent(),
    "Enter was sent. Check the TV before trying again.",
    "Unacknowledged sent input cannot claim it was discarded");
  assert.equal(await page.locator("#editor").getAttribute("readonly"), "",
    "An unacknowledged native field remains read-only after intent timeout");
  holdEnterAck = false;
  initial.editable.ready = true;
  await enterSettled();
  assert.equal(enters().length, sentTimeoutBefore + 1, "Sent-action timeout never resends Enter");

  const candidateBefore = enters().length;
  await page.locator("#editor").focus();
  const candidateIme = await page.context().newCDPSession(page);
  await candidateIme.send("Input.imeSetComposition", {
    text: "日本", selectionStart: 2, selectionEnd: 2,
  });
  assert.equal(await page.evaluate(() => requestEnter()), false);
  await page.locator("#editor").dispatchEvent("keydown", {
    key: "Enter", isComposing: true, keyCode: 229,
  });
  await candidateIme.send("Input.insertText", { text: "日本" });
  await page.waitForFunction(() => !composing && !dirty && !busy && !pendingEdit);
  assert.equal(enters().length, candidateBefore, "Candidate confirmation/end cannot submit");
  await candidateIme.detach();

  initial.editable.action = "enter";
  initial.editable.multiline = true;
  initial.editable.version++;
  await page.getByRole("button", { name: "Enter", exact: true }).waitFor();
  await page.locator("#editor").fill("Pasted\nnewlines");
  await page.waitForFunction(() => !dirty && !busy && !pendingEdit);
  assert.equal(enters().length, candidateBefore, "Pasted newline remains a text edit");
  assert.equal(await page.locator("#editor").evaluate((editor) => editor.dispatchEvent(
    new InputEvent("beforeinput", { inputType: "insertParagraph", cancelable: true, bubbles: true }),
  )), false, "A cancelable phone Enter prevents a local newline");
  await enterSettled();
  assert.equal(enters().length, candidateBefore + 1);
  assert.equal(initial.editable.text, "Pasted\nnewlines", "No local newline replacement duplicates Enter");

  for (const conflict of ["field", "text", "timeout"]) {
    holdNativeAck = true;
    await page.locator("#editor").fill(`Discard ${conflict}`);
    await page.waitForFunction(() => pendingEdit && !state.editable.ready);
    await page.locator("#enter").click();
    await page.waitForFunction(() => !!enterIntent);
    const count = enters().length;
    if (conflict === "field") initial.editable.revision++;
    if (conflict !== "timeout") {
      initial.editable.text = "Changed on TV";
      initial.editable.start = initial.editable.end = initial.editable.text.length;
      initial.editable.version++;
      initial.editable.ready = true;
    }
    await page.waitForFunction(() => !enterIntent);
    holdNativeAck = false;
    initial.editable.ready = true;
    await enterSettled();
    assert.equal(enters().length, count, `${conflict} discards Enter without replay`);
  }
  rejectEnter = true;
  const rejectedBefore = enters().length;
  await page.locator("#enter").click();
  await enterSettled();
  await page.evaluate(() => poll());
  assert.equal(enters().length, rejectedBefore + 1, "Rejected Enter is never retried");
  rejectEnter = false;
  await capture(page, "type-enter-mobile");
  holdNativeAck = true;
  await page.locator("#editor").fill("Discard on native pause");
  await page.waitForFunction(() => pendingEdit && !state.editable.ready);
  await page.locator("#enter").click();
  await page.waitForFunction(() => !!enterIntent);
  const pauseEnterCount = enters().length;
  nativePaused = true;
  await page.getByText("Control paused", { exact: true }).waitFor();
  await page.waitForFunction(
    () => {
      const r = document.querySelector("#status").getBoundingClientRect();
      return (
        r.top >= visualViewport.offsetTop &&
        r.bottom <= visualViewport.offsetTop + visualViewport.height
      );
    },
    undefined,
    { timeout: 1000 },
  );
  assert.equal(await page.locator("#tabs .tab").count(), 0);
  await capture(page, "paused-mobile");
  for (const [reason, guidance] of [
    ["controls", "Paused — close the browser controls on the TV to continue."],
    [
      "tv",
      "Paused — continue on the TV. Phone control is unavailable on this screen.",
    ],
    [
      "unknown",
      "Paused — continue on the TV. Phone control is unavailable on this screen.",
    ],
  ]) {
    pauseReason = reason;
    await page.getByText(guidance, { exact: true }).waitFor();
    assert.equal(await page.locator("#url").textContent(), "");
    assert.equal(await page.locator("#editor").inputValue(), "");
    assert.equal(
      await page.locator("#fieldHint").textContent(),
      "Phone typing is unavailable. Continue on your TV.",
    );
    assert.equal(await page.locator("#back").isDisabled(), true);
    assert.equal(await page.locator("#disconnect").isEnabled(), true);
  }
  nativePaused = false;
  holdNativeAck = false;
  initial.editable.ready = true;
  initial.revision = 3;
  await page.waitForFunction(() => state && !state.paused);
  assert.equal(enters().length, pauseEnterCount, "Native pause cannot replay pending Enter");
  assert.equal(
    await page.locator("#tabs .tab").count(),
    1,
    "Resuming the same page must restore its tab controls",
  );
  initial.editable.phoneTyping = false;
  initial.editable.composing = true;
  await page.locator("#remoteTab").click();
  await page.waitForFunction(() => !busy && state.editable?.composing);
  const preparationsBeforeComposition = commands.filter((c) => c.edit === "prepare").length;
  await page.locator("#showKeyboard").click();
  await page.waitForTimeout(650);
  assert.equal(commands.filter((c) => c.edit === "prepare").length, preparationsBeforeComposition,
    "Type entry cannot steal an active TV composition");
  assert.equal(await page.locator("#enter").isDisabled(), true);
  await page.locator("#finish").click();
  await page.waitForFunction(() => !busy && state.editable.phoneTyping && !state.editable.composing);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForResponse(r => r.request().postDataJSON()?.op === 'stopTyping');
  assert.equal(initial.editable.phoneTyping, false, "Phone background releases the lease");
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => connected && !busy && !state.editable.phoneTyping);
  const preparationsAfterBackground = commands.filter((c) => c.edit === "prepare").length;
  await page.waitForTimeout(650);
  assert.equal(commands.filter((c) => c.edit === "prepare").length, preparationsAfterBackground,
    "Foreground polling cannot automatically reclaim typing");
  approvalError = "revoked";
  approved = false;
  await page
    .getByText("Session unavailable. Start a new invitation on the TV.", {
      exact: true,
    })
    .waitFor();
  assert.equal(await page.locator("#pairForm").isVisible(), true);
  await capture(page, "expired-mobile");
  assert.equal(await page.locator("#approval").isVisible(), false);
  // TV rejection/expiry closes the listener rather than returning a JSON error.
  approvalError = "approval";
  await page.goto("about:blank");
  await page.goto(`http://127.0.0.1:${server.address().port}/#synthetic-retry`);
  await page
    .getByText("Waiting for approval on the TV…", { exact: true })
    .waitFor();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await page
    .getByText("Session unavailable. Start a new invitation on the TV.", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.locator("#approval").isVisible(),
    false,
    "Closed listener must not leave a stale approval instruction",
  );
  assert.equal(await page.locator("#pairForm").isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(
    "Companion regression passed: immediate/held/duplicate Enter, native action labels, candidate composition, multiline/paste, stale-field/text/timeout/rejection/pause cancellation; QR approval/retry, polling, pointer, typing, reflow and no script errors.",
  );
} finally {
  releasePoll?.();
  releaseSelection?.();
  await browser.close();
  server.close();
}
