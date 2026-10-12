// Real bundled companion JS; delayed synthetic replies must not undo Disconnect.
// Usage: node phone-disconnect-ui.mjs PLAYWRIGHT_CORE [RAW_ASSET_DIRECTORY]
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))("playwright-core");
const assets = resolve(process.argv[3] || "brave/android/java/brave-res/raw");
let heldOp, started, release, failReply;
const state = { revision: 1, paused: false, title: "Synthetic page", url: "http://fixture.test/",
  page: true, back: true, forward: false, loading: false, width: 1920, height: 1080,
  x: 960, y: 540, tabs: [] };
const server = createServer(async (req, res) => {
  if (req.method === "GET") {
    const name = { "/": "tv_remote.html", "/remote.js": "tv_remote_js.js",
      "/remote.css": "tv_remote_css.css" }[req.url];
    if (!name) return res.writeHead(404).end();
    res.setHeader("Content-Type", name.endsWith(".js") ? "text/javascript"
      : name.endsWith(".css") ? "text/css" : "text/html");
    res.end(await readFile(resolve(assets, name)));
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = JSON.parse(body);
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/pair") return res.end(JSON.stringify({ token: "synthetic-token" }));
  const reply = { ok: true, epoch: "synthetic-epoch", state };
  if (data.op === heldOp) {
    heldOp = null;
    const fail = failReply;
    const barrier = new Promise(resolve => { release = resolve; });
    started();
    await barrier;
    if (fail) return res.destroy();
  }
  res.end(JSON.stringify(reply));
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser, pendingTimer;
try {
  browser = await chromium.launch({ executablePath:
    "/home/nitesh/.t3/tools/chrome-headless-shell/linux64/154.0.8037.92/chrome-headless-shell" });
  for (const op of ["state", "back"]) {
    for (const fail of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 },
        isMobile: true, hasTouch: true });
      page.setDefaultTimeout(5000);
      await page.goto(`http://127.0.0.1:${server.address().port}/#synthetic-invite`);
      await page.waitForFunction(() => connected && !busy);
      failReply = fail;
      heldOp = op;
      const pending = new Promise(resolve => { started = resolve; });
      const command = op === "back" ? page.evaluate(() => command("back")) : null;
      command?.catch(() => {}); // Cleanup may close the page before the later assertion.
      try {
        await Promise.race([pending, new Promise((_, reject) => {
          pendingTimer = setTimeout(() => reject(new Error("Delayed request did not arrive")), 5000);
        })]);
      } finally {
        clearTimeout(pendingTimer);
      }
      await page.locator("#disconnect").click();
      await page.waitForFunction(() => !connected && !token && state === null,
        undefined, { timeout: 1000 });
      assert.equal(await page.locator("#pairForm").isVisible(), true);
      assert.equal(await page.locator("#remote").isVisible(), false);
      release();
      if (command) assert.equal(await command, false, "Old action acknowledgement must be discarded");
      await page.waitForFunction(() => !busy && !polling);
      assert.ok(await page.evaluate(() => !connected && !token && state === null));
      assert.equal(await page.locator("#pairForm").isVisible(), true);
      assert.equal(await page.locator("#remote").isVisible(), false);
      assert.equal(await page.locator("#disconnect").isVisible(), false);
      assert.equal(await page.locator("#status").textContent(),
        "Session unavailable. Start a new invitation on the TV.");
      await page.close();
      console.log(`PASS: Disconnect fences delayed ${op} ${fail ? "failure" : "success"}`);
    }
  }
} finally {
  release?.();
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
