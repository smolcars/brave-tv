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
    const barrier = new Promise((r) => { releasePoll = r; });
    pollStarted?.();
    await barrier;
  }
  if (data.op !== "state") commands.push(data);
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
  const backResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" && response.request().postDataJSON().op === "back");
  await page.getByRole("button", { name: "← Back", exact: true }).click();
  assert.equal(commands.length, 0, "action waits while the poll response is held");
  releasePoll();
  await backResponse;
  await page.waitForFunction(() => !busy);
  assert.equal(
    commands.filter((c) => c.op === "back").length,
    1,
    "one button press during polling must deliver once",
  );
  await page.getByText("Pointer & scroll buttons", { exact: true }).click();
  const clickResponse = page.waitForResponse((response) =>
    response.request().method() === "POST" && response.request().postDataJSON().op === "click");
  await page.getByRole("button", { name: "Click", exact: true }).click();
  await clickResponse;
  await page.waitForFunction(() => !busy);
  assert.equal(commands.filter((c) => c.op === "click").length, 1);
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
  await page.setViewportSize({ width: 844, height: 390 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Companion regression passed: fragment removal, polling-time action, one click, portrait/landscape overflow, no script errors.",
  );
} finally {
  releasePoll?.();
  await browser.close();
  server.close();
}
