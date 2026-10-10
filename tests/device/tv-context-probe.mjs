// Requires a normal remote-input.html page, with the native pointer over its counter button.
// Usage: node tv-context-probe.mjs PLAYWRIGHT_CORE EMULATOR_SERIAL
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const [modulePath, serial] = process.argv.slice(2);
assert.match(serial ?? "", /^emulator-\d+$/, "Emulator-only input fixture");
const { chromium } = createRequire(resolve(modulePath, "package.json"))("playwright-core");
const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
try {
  const page = browser.contexts()[0].pages().find(p => p.url().endsWith("/remote-input.html"));
  assert.ok(page, "Expected synthetic normal fixture");
  const originalUrl = page.url();
  await page.reload();
  const process = spawn("adb", ["-s", serial, "shell", "uinput", "-"],
    { stdio: ["pipe", "pipe", "pipe"] });
  let output = "", errors = "";
  process.stdout.on("data", chunk => { output += chunk; });
  process.stderr.on("data", chunk => { errors += chunk; });
  const ended = new Promise((resolve, reject) => {
    process.on("error", reject);
    process.on("exit", code => code === 0 ? resolve() : reject(new Error(errors || `uinput: ${code}`)));
  });
  const send = (command, fields = {}) => process.stdin.write(JSON.stringify({ id: 1, command, ...fields }) + "\n");
  const key = (code, down) => send("inject", { events: [1, code, down ? 1 : 0, 0, 0, 0] });
  const wait = async token => {
    const deadline = Date.now() + 10000;
    while (!output.includes(token)) {
      assert.ok(Date.now() < deadline, `uinput did not acknowledge ${token}: ${errors}`);
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  };
  try {
    send("register", { name: "Brave TV context fixture", vid: 4660, pid: 1, bus: "usb",
      configuration: [{ type: 100, data: [1] }, { type: 101, data: [105, 106, 353] }] });
    send("delay", { duration: 1500 });
    key(105, true); key(105, false); key(106, true); key(106, false);
    key(353, true); key(353, false);
    send("sync", { syncToken: "preflight" });
    await wait("preflight");
    await page.waitForFunction(() => document.querySelector("#click").textContent === "Clicks: 1");
    await page.reload();
    key(353, true);
    send("sync", { syncToken: "held" });
    await wait("held");
    await page.reload(); // Genuine navigation to the same URL; never assign a DOM input value.
    assert.equal(page.url(), originalUrl);
    key(353, false);
    send("delay", { duration: 300 });
    send("sync", { syncToken: "released" });
    await wait("released");
    assert.equal(await page.locator("#click").textContent(), "Clicks: 0",
      "Held OK clicked a replacement document with the same URL");
    console.log("PASS: native click preflight and held-OK cancellation across same-URL document replacement");
  } finally {
    process.stdin.end();
    await ended;
  }
} finally {
  await browser.close();
}
