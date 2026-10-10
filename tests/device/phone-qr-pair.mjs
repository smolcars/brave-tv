// Decode the visible TV QR and pair in the actual phone browser. Never log the invitation.
// Usage: node phone-qr-pair.mjs PLAYWRIGHT_CORE ZXING_JAR SCREENSHOT_PATH
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const [modulePath, jar, screenshot] = process.argv.slice(2);
const { chromium } = createRequire(resolve(modulePath, "package.json"))(
  "playwright-core",
);
const adb = (...args) =>
  execFileSync("adb", ["-s", "emulator-5554", ...args], { timeout: 15000 });
writeFileSync(screenshot, adb("exec-out", "screencap", "-p"));
const invitation = execFileSync(
  "java",
  ["--class-path", jar, "tests/device/PhoneQr.java", screenshot],
  { encoding: "utf8", timeout: 15000 },
);
const url = new URL(invitation);
assert.match(url.hostname, /^10\.0\.2\.\d+$/);
assert.equal(url.protocol, "http:");
assert.ok(/^#[A-Za-z0-9_-]{43}$/.test(url.hash), "Unexpected invitation shape");
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const page = browser.contexts()[0].pages().at(-1);
  try {
    await page.goto(invitation);
  } catch {
    throw new Error("QR companion navigation failed");
  }
  await page.waitForFunction(() =>
    document
      .querySelector("#status")
      .textContent.includes("Waiting for approval"),
  );
  assert.equal(new URL(page.url()).hash, "");
  adb("shell", "input", "keyevent", "23");
  await page.waitForFunction(() => connected && !state.paused);
  console.log(
    "PASS: screenshot QR decode, fragment removal and explicit TV approval at " +
      url.origin,
  );
} finally {
  await browser.close();
}
