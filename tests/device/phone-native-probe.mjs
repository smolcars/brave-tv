// Requires an approved phone page and the harmless phone-remote.html TV fixture.
// DevTools is test instrumentation; remote commands still travel over the LAN.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(resolve(process.argv[2], "package.json"));
const { chromium } = require("playwright-core");
const tvBrowser = await chromium.connectOverCDP("http://127.0.0.1:9222");
const phoneBrowser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const tv = tvBrowser
    .contexts()[0]
    .pages()
    .find((p) => p.url().includes("/phone-remote.html"));
  const phone = phoneBrowser
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(
    tv && phone,
    "Open the fixture and pair the real phone browser first",
  );
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  const target = await tv.locator("#plain").evaluate((element) => {
    const r = element.getBoundingClientRect();
    const scale = devicePixelRatio * visualViewport.scale;
    return {
      x: (r.x + r.width / 2) * scale,
      y: (r.y + r.height / 2) * scale,
      height: innerHeight * scale,
    };
  });
  await phone.evaluate(async (point) => {
    await command("move", {
      dx: Math.round(point.x - state.x),
      dy: Math.round(point.y + state.height - point.height - state.y),
    });
    await command("click");
  }, target);
  await phone.waitForFunction(() => state?.editable?.ready, undefined, {
    timeout: 5000,
  });
  assert.equal(await tv.evaluate(() => document.activeElement.id), "plain");
  await phone.locator("#showKeyboard").click();
  const text = "héllo हिन्दी 🌍";
  await phone.locator("#editor").fill(text);
  await tv.waitForFunction(
    (expected) => document.querySelector("#plain").value === expected,
    text,
    { timeout: 5000 },
  );
  await phone.waitForFunction(
    (expected) =>
      state?.editable?.ready && state.editable.text === expected && !busy,
    text,
  );
  await phone.locator("#delete").click();
  await tv.waitForFunction(
    (expected) => document.querySelector("#plain").value === expected,
    text.slice(0, -2),
    { timeout: 5000 },
  );
  const events = await tv.evaluate(() => window.events);
  assert.ok(events.some((e) => e.type === "input" && e.id === "plain"));
  console.log(
    "PASS: native focus, Unicode replacement, code-point deletion and renderer input events",
  );
} finally {
  await phoneBrowser.close();
  await tvBrowser.close();
}
