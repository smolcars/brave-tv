// Host-only companion regression. Pass an existing playwright-core package directory.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const require = createRequire(resolve(process.argv[2], "package.json"));
const { chromium } = require("playwright-core");
const assets = resolve("brave/android/java/brave-res/raw");
const commands = [];
let pollStarted;
let releasePoll;
let delayedPoll = false;
let selectionStarted;
let releaseSelection;
let conflictingCaret = false;
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
    ready: true,
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
  if (data.op === "state" && delayedPoll) {
    delayedPoll = false;
    const barrier = new Promise((r) => {
      releasePoll = r;
    });
    pollStarted?.();
    await barrier;
  }
  if (data.op !== "state") commands.push(data);
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
  }
  if (data.edit === "replace") {
    const ok = data.version === initial.editable.version;
    if (ok) {
      initial.editable.text = data.text;
      initial.editable.start = data.start + (conflictingCaret ? 1 : 0);
      initial.editable.end = data.end;
      initial.editable.version++;
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
  await page.getByText("Connected to your TV", { exact: true }).waitFor();
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
  await page.getByRole("button", { name: "← Back", exact: true }).click();
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
  await page.locator("#showKeyboard").click();
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
  assert.equal(commands.find((c) => c.edit === "replace").version, 2);
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
  assert.deepEqual(errors, []);
  console.log(
    "Companion regression passed: fragment removal, polling-time action, one click, acknowledged selection/typing, conflicting edit rejection, portrait/landscape overflow, no script errors.",
  );
} finally {
  releasePoll?.();
  releaseSelection?.();
  await browser.close();
  server.close();
}
