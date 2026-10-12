// Read a visible synthetic invitation in memory; never log its code or token.
// Usage: node phone-manual-pair.mjs PW TV_SERIAL TV_AVD PHONE_SERIAL PHONE_AVD TV_DRIVER request|expire
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const [modulePath, tvSerial, tvAvd, phoneSerial, phoneAvd, driver, mode] = process.argv.slice(2);
assert.ok(["request", "expire"].includes(mode));
assert.ok(driver && tvAvd && phoneAvd);
assert.notEqual(tvSerial, phoneSerial);
for (const [serial, avd] of [[tvSerial, tvAvd], [phoneSerial, phoneAvd]]) {
  assert.match(serial, /^emulator-\d+$/);
  assert.equal(execFileSync("adb", ["-s", serial, "emu", "avd", "name"], {
    encoding: "utf8", timeout: 15000,
  }).replace(/\r/g, "").trim(), avd + "\nOK");
}
assert.ok(execFileSync("adb", ["-s", phoneSerial, "forward", "--list"], {
  encoding: "utf8", timeout: 15000,
}).split(/\r?\n/).includes(`${phoneSerial} tcp:9223 localabstract:chrome_devtools_remote`));
let native;
try {
  native = JSON.parse(execFileSync("python3", [resolve(driver), "snapshot", "--json"], {
    encoding: "utf8", timeout: 15000,
  }));
} catch {
  throw new Error("Native invitation snapshot unavailable");
}
assert.ok(native.success && !native.data.truncated);
assert.equal(native.data.appBundleId, "com.brave.browser_default");
const nodes = native.data.nodes;
const qr = nodes.find(n => n.label === "Pairing QR code; manual address and code above"
  && n.visibleToUser && n.type === "android.widget.ImageView"
  && n.bundleId === native.data.appBundleId);
const byIndex = new Map(nodes.map(n => [n.index, n]));
let trusted = false;
for (let n = qr, depth = 0; n && depth < nodes.length; depth++) {
  if (n.type === "androidx.compose.ui.platform.ComposeView") trusted = true;
  n = byIndex.get(n.parentIndex);
}
assert.ok(trusted, "Native Compose invitation owner required");
const invitations = nodes.filter(n => n.visibleToUser)
  .map(n => n.label?.match(/(http:\/\/10\.0\.2\.\d+:\d+)\n(\d{8})$/))
  .filter(Boolean);
assert.equal(invitations.length, 1, "One visible native invitation required");
const [, origin, code] = invitations[0];
const { chromium } = createRequire(resolve(modulePath, "package.json"))("playwright-core");
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const page = browser.contexts()[0].pages().at(-1);
  await page.bringToFront();
  try {
    await page.goto(origin + "/");
    await page.locator("#pairForm").waitFor({ state: "visible" });
    await page.locator("#code").fill(code);
    await page.locator("#pairForm button").click();
  } catch {
    throw new Error("Manual invitation submission failed");
  }
  await page.waitForFunction(() => document.querySelector("#status").textContent
    .includes("Waiting for approval"));
  assert.equal(await page.locator("#pairForm").isVisible(), false);
  assert.equal(await page.locator("#approval").isVisible(), true);
  assert.equal(await page.locator("#code").inputValue(), "");
  assert.equal(new URL(page.url()).hash, "");
  console.log("PASS: manual request clears/hides code form and requires native TV approval");
  if (mode === "expire") {
    const started = Date.now();
    await page.waitForFunction(() => !token && !connected
      && document.querySelector("#approval").hidden
      && !document.querySelector("#pair").hidden
      && document.querySelector("#status").textContent.includes("expired"),
    undefined, { timeout: 130000 });
    assert.equal(await page.locator("#pairForm").isVisible(), true);
    assert.equal(await page.locator("#code").inputValue(), "");
    assert.ok(Date.now() - started >= 100000, "Early disconnect is not invitation expiry");
    console.log(JSON.stringify({ result: "PASS", unapprovedExpiry: true,
      elapsedMs: Date.now() - started, freshInvitationRequired: true }));
  }
} finally {
  await browser.close();
}
