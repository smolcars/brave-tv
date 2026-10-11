// Decode the visible TV QR and pair in the actual phone browser. Never log the invitation.
// Usage: node phone-qr-pair.mjs PLAYWRIGHT_CORE ZXING_JAR SCREENSHOT_PATH
//        TV_SERIAL TV_AVD PHONE_SERIAL PHONE_AVD TV_AGENT_DRIVER
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const [modulePath, jar, screenshot, tvSerial, tvAvd, phoneSerial, phoneAvd, driver] =
  process.argv.slice(2);
assert.ok(
  driver && tvAvd && phoneAvd,
  "Provide both verified AVD identities and the pinned TV agent driver",
);
assert.match(tvSerial, /^emulator-\d+$/);
assert.match(phoneSerial, /^emulator-\d+$/);
assert.notEqual(tvSerial, phoneSerial);
function verifyAvd(serial, expected) {
  assert.equal(
    execFileSync("adb", ["-s", serial, "emu", "avd", "name"], {
      encoding: "utf8",
      timeout: 15000,
    }).replace(/\r/g, "").trim(),
    expected + "\nOK",
    "Emulator identity changed",
  );
}
verifyAvd(tvSerial, tvAvd);
verifyAvd(phoneSerial, phoneAvd);
const forwards = execFileSync("adb", ["-s", phoneSerial, "forward", "--list"], {
  encoding: "utf8",
  timeout: 15000,
});
assert.ok(
  forwards.split(/\r?\n/).includes(
    phoneSerial + " tcp:9223 localabstract:chrome_devtools_remote",
  ),
  "Phone CDP forward must belong to the verified emulator",
);
function privateOutput(command, args, options) {
  try {
    return execFileSync(command, args, options);
  } catch {
    throw new Error("Private QR capture or decode failed");
  }
}
const { chromium } = createRequire(resolve(modulePath, "package.json"))(
  "playwright-core",
);
const adb = (...args) =>
  privateOutput("adb", ["-s", tvSerial, ...args], { timeout: 15000 });
const snapshot = privateOutput("python3", [driver, "snapshot", "--json", "--raw"], {
  encoding: "utf8",
  timeout: 15000,
});
let data;
try {
  data = JSON.parse(snapshot).data;
} catch {
  throw new Error("Private QR capture or decode failed");
}
assert.equal(data?.appBundleId, "com.brave.browser_default");
const nodes = data.nodes;
const qr = nodes.find((node) =>
  node.type === "android.widget.ImageView" && node.visibleToUser &&
  node.bundleId === data.appBundleId &&
  node.label === "Pairing QR code; manual address and code above",
);
const byIndex = new Map(nodes.map((node) => [node.index, node]));
let nativeQr = false;
for (let node = qr, depth = 0; node && depth < nodes.length; depth++) {
  if (node.type === "androidx.compose.ui.platform.ComposeView") {
    nativeQr = true;
    break;
  }
  node = byIndex.get(node.parentIndex);
}
assert.ok(
  nativeQr,
  "Open the native pairing QR panel before capture",
);
assert.ok(
  !/\bSECURE\b/.test(adb("shell", "dumpsys", "window", "windows").toString()),
  "Refuse capture while a secure window exists",
);
verifyAvd(tvSerial, tvAvd);
writeFileSync(screenshot, adb("exec-out", "screencap", "-p"), {
  mode: 0o600,
  flag: "wx",
});
const invitation = privateOutput(
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
  const assets = new Set();
  let externalRequest = false;
  await page.route("**/*", (route) => {
    const target = new URL(route.request().url());
    if (target.origin !== url.origin) {
      externalRequest = true;
      return route.abort();
    }
    assets.add(target.pathname);
    return route.continue();
  });
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
  assert.ok(
    new URL(page.url()).hash === "",
    "Invitation fragment was not removed",
  );
  assert.equal(
    await page.locator("#pairForm").isVisible(),
    false,
    "QR approval must not ask for the code again",
  );
  assert.equal(await page.locator("#approval").isVisible(), true);
  assert.ok(!externalRequest, "Companion attempted an external request");
  assert.ok(
    ["/", "/remote.js", "/remote.css"].every((path) => assets.has(path)),
    "Bundled assets were not loaded",
  );
  console.log(
    "PASS: TV-only assets, screenshot QR decode and fragment removal; explicit native approval remains pending at " +
      url.origin,
  );
} finally {
  await browser.close();
}
