// Actual engine tab/background recovery. Run after separately approving pairing.
// Usage: node phone-fullscreen-recovery-probe.mjs PW TV_SERIAL TV_AVD PHONE_SERIAL PHONE_AVD DRIVER
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const [modulePath, serial, avd, phoneSerial, phoneAvd, driver] = process.argv.slice(2);
const adb = (device, ...args) => execFileSync("adb", ["-s", device, ...args], {
  encoding: "utf8", timeout: 15000,
});
for (const [device, name, port] of [[serial, avd, 9222], [phoneSerial, phoneAvd, 9223]]) {
  assert.match(device ?? "", /^emulator-\d+$/);
  assert.ok(name);
  assert.equal(adb(device, "emu", "avd", "name").replace(/\r/g, "").trim(), name + "\nOK");
  assert.ok(adb(device, "forward", "--list").split(/\r?\n/).includes(
    `${device} tcp:${port} localabstract:chrome_devtools_remote`));
}
assert.notEqual(serial, phoneSerial);
assert.ok(driver, "Provide device_open's pinned native driver");
const native = (...args) => execFileSync("python3", [resolve(driver), ...args], {
  encoding: "utf8", timeout: 20000,
});
const { chromium } = createRequire(resolve(modulePath, "package.json"))("playwright-core");
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
const allPages = browser => browser.contexts().flatMap(context => context.pages());
try {
  const companions = allPages(pb).filter(p => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.equal(companions.length, 1, "Require one approved companion target");
  const phone = companions[0];
  phone.setDefaultTimeout(10000);
  const ready = url => phone.waitForFunction(url => connected && !busy && !state.paused &&
    !state.loading && state.url === url, url);
  const settled = async () => {
    let previous;
    for (let sample = 0; sample < 10; sample++) {
      const response = await phone.waitForResponse(r => r.request().method() === "POST" &&
        r.request().postDataJSON().op === "state");
      const next = (await response.json()).state;
      if (next && !next.paused && !next.loading && next.revision === previous) {
        await phone.waitForFunction(revision => connected && !busy && !state.paused &&
          state.revision === revision, previous);
        return;
      }
      previous = next?.revision;
    }
    throw Error("Native viewport did not settle");
  };
  const move = async () => {
    await settled();
    assert.ok(await phone.evaluate(() => command("move", { dx: 10, dy: 10 })),
      "Recovered native pointer command rejected");
  };
  const mediaUrl = "http://10.0.2.2:18088/media.html?fullscreen-recovery";
  const otherUrl = "http://10.0.2.2:18088/bookmark.html?fullscreen-recovery";
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  await settled();
  assert.equal(await phone.evaluate(() => state.tabs.filter(t =>
    t.title === "TV bookmark workflow fixture").length), 0,
    "Use a profile without another bookmark fixture; preserve existing tabs");
  await phone.locator("#address").fill(mediaUrl);
  await phone.locator("#addressForm button").click();
  await ready(mediaUrl);
  const originalModel = await phone.evaluate(() => ({
    count: state.tabs.length, index: state.tabs.findIndex(t => t.selected),
  }));
  assert.ok(originalModel.index >= 0);
  const targets = allPages(tb).filter(p => p.url() === mediaUrl);
  assert.equal(targets.length, 1, "Require one authenticated normal media target");
  const media = targets[0];
  media.setDefaultTimeout(10000);
  const identity = await media.evaluate(() => performance.timeOrigin);
  await media.locator("#play").click();
  await media.waitForFunction(() => document.querySelector("video").currentTime > 0);
  await media.locator("#fullscreen").click();
  await media.waitForFunction(() => !!document.fullscreenElement);
  await move();
  await settled();
  assert.ok(await phone.evaluate(() => command("new")), "Native new-tab rejected");
  await phone.waitForFunction(() => connected && !busy && !state.paused && !state.page);
  await settled();
  await phone.locator("#address").fill(otherUrl);
  await phone.locator("#addressForm button").click();
  await ready(otherUrl);
  await settled();
  // Native opaque IDs renew on selection. Only our appended tab changes this
  // controlled model; document identity below proves the original tab survived.
  assert.equal(await phone.evaluate(() => state.tabs.length), originalModel.count + 1);
  assert.ok(await phone.evaluate(index => {
    const target = state.tabs[index];
    return target?.title === "TV ordinary media checks" && command("selectTab", { tab: target.id });
  }, originalModel.index));
  await ready(mediaUrl);
  assert.equal(await phone.evaluate(() => state.tabs.findIndex(t => t.selected)), originalModel.index);
  assert.equal(allPages(tb).filter(p => p.url() === mediaUrl).length, 1);
  assert.ok(await media.evaluate(expected => performance.timeOrigin === expected, identity),
    "Tab switch replaced the media document");
  if (await media.evaluate(() => !!document.fullscreenElement)) native("tv-remote", "Back");
  await media.waitForFunction(() => !document.fullscreenElement);
  await move();
  await settled();
  const ownedRows = await phone.evaluate(() => state.tabs.filter(t =>
    t.title === "TV bookmark workflow fixture").map(t => t.id));
  assert.equal(ownedRows.length, 1, "Require exactly the created fixture tab");
  assert.ok(await phone.evaluate(tab => command("closeTab", { tab }), ownedRows[0]));
  await phone.waitForFunction(() => !busy && !state.paused && !state.tabs.some(t =>
    t.title === "TV bookmark workflow fixture"));
  console.log("PASS: actual fullscreen tab switch, retained document, exit and native pointer recovery");

  await media.locator("#play").click();
  await media.locator("#fullscreen").click();
  await media.waitForFunction(() => !!document.fullscreenElement);
  await move();
  const pid = adb(serial, "shell", "pidof", "com.brave.browser_default").trim();
  assert.ok(pid);
  const origin = new URL(phone.url());
  assert.match(origin.hostname, /^10\.0\.2\.\d+$/);
  assert.ok(Number(origin.port) > 0);
  const background = execFileSync("python3", [resolve("tests/device/phone-background-probe.py"),
    serial, phoneSerial, origin.host], { encoding: "utf8", timeout: 30000 });
  assert.ok(background.includes("PASS: foreground departure, listener closure and browser process survival"));
  await phone.waitForFunction(() => !connected && !state &&
    document.querySelector("#back").disabled);
  assert.equal(adb(serial, "shell", "pidof", "com.brave.browser_default").trim(), pid,
    "Backgrounding killed the browser");
  native("open", "com.brave.browser_default");
  // Native normal controls authenticate ownership after the phone is revoked.
  native("tv-remote", "Back");
  const readNodes = () => JSON.parse(native("snapshot", "--json", "--raw")).data.nodes;
  let nodes = readNodes();
  if (!nodes.some(n => n.label === "Browser controls")) {
    const deadline = Date.now() + 5000;
    while (!nodes.some(n => n.label === "Fullscreen")) {
      assert.ok(Date.now() < deadline, "Native fullscreen Back did not expose page controls");
      await new Promise(resolve => setTimeout(resolve, 50));
      nodes = readNodes();
    }
    native("tv-remote", "Back");
    nodes = readNodes();
  }
  assert.ok(nodes.some(n => n.label === "Browser controls") &&
    !nodes.some(n => n.label === "Private browser controls") &&
    nodes.some(n => n.label === mediaUrl), "Recover the exact normal native controls");
  assert.equal(allPages(tb).filter(p => p.url() === mediaUrl).length, 1);
  assert.ok(await media.evaluate(expected => performance.timeOrigin === expected, identity),
    "Backgrounding replaced the media document");
  await media.waitForFunction(() => !document.fullscreenElement);
  native("tv-remote", "Back");
  assert.ok(!native("snapshot", "-i").includes('"Browser controls"'),
    "Native Back did not return to the media page");
  const size = adb(serial, "shell", "wm", "size");
  assert.ok(size.includes("Physical size: 1920x1080"));
  assert.ok(adb(serial, "shell", "wm", "density").includes("Physical density: 320"));
  await media.waitForFunction(() => innerWidth * devicePixelRatio === 1920 &&
    innerHeight * devicePixelRatio === 1080);
  // Clamp with genuine D-pad input, then move to a known interior coordinate.
  adb(serial, "shell", "input", "dpad", "keyevent",
    ...Array(60).fill("21"), ...Array(40).fill("19"),
    ...Array(5).fill("22"), ...Array(5).fill("20"));
  assert.ok(!/\bSECURE\b/.test(adb(serial, "shell", "dumpsys", "window", "windows")),
    "Refuse cursor capture with any secure window");
  const raw = execFileSync("adb", ["-s", serial, "exec-out", "screencap"], {
    timeout: 15000, maxBuffer: 16 * 1024 * 1024,
  });
  assert.equal(raw.readUInt32LE(0), 1920);
  assert.equal(raw.readUInt32LE(4), 1080);
  assert.equal(raw.readUInt32LE(8), 1);
  const header = raw.length - 1920 * 1080 * 4;
  assert.ok(header === 12 || header === 16);
  const color = (x, y) => [...raw.subarray(header + (y * 1920 + x) * 4,
    header + (y * 1920 + x) * 4 + 3)];
  assert.ok(color(160, 160).every(c => c > 240) &&
    color(160, 146).every(c => c === 0), "Native cursor did not recover at its actual D-pad position");
  console.log("PASS: fullscreen background revokes phone, preserves process/document and restores native page control");
} finally {
  await pb.close();
  await tb.close();
}
