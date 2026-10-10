// Emulator-only regression for fullscreen input, cursor painting and last-tab recovery.
// Usage: node phone-fullscreen-probe.mjs PLAYWRIGHT_DIR fullscreen|cursor|back|phone-back|empty
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const [modulePath, mode = "fullscreen"] = process.argv.slice(2);
assert.ok(
  ["fullscreen", "cursor", "back", "phone-back", "empty"].includes(mode),
);
const { chromium } = createRequire(resolve(modulePath, "package.json"))(
  "playwright-core",
);
const adb = (...args) =>
  execFileSync("adb", ["-s", "emulator-5554", ...args], {
    timeout: 15000,
    maxBuffer: 16 * 1024 * 1024,
  });
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const phone = pb
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(phone, "Pair the phone emulator first");
  phone.setDefaultTimeout(10000);
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  if (mode === "empty") {
    const ids = await phone.evaluate(() => state.tabs.map((t) => t.id));
    assert.ok(ids.length, "Start with normal fixture tabs");
    for (const id of ids) {
      await phone.waitForFunction(() => !busy && !state.paused);
      assert.equal(
        await phone.evaluate((id) => command("closeTab", { tab: id }), id),
        true,
      );
      // Home recovery is posted after the tab model finishes the closure.
      await phone.waitForFunction(
        (id) => !state.paused && !state.tabs.some((t) => t.id === id),
        id,
      );
    }
    assert.equal(
      await phone.evaluate(() => state.page),
      false,
      "Closing all tabs must return TV home",
    );
    assert.equal(
      await phone.evaluate(() => state.tabs.length),
      1,
      "Recover exactly one normal home",
    );
    await phone.locator("[data-op=new]").click();
    await phone.waitForFunction(() => !state.paused && state.tabs.length === 2);
    console.log(
      "PASS: final-tab closure recovers TV home and usable phone New tab",
    );
  } else {
    const url = "http://10.0.2.2:18088/media.html";
    await phone.locator("#address").fill(url);
    await phone.locator("#addressForm button").click();
    await phone.waitForFunction(
      (u) => state.url === u && !state.loading && !busy,
      url,
    );
    const tv = tb
      .contexts()[0]
      .pages()
      .find((p) => p.url() === url);
    assert.ok(tv);
    tv.setDefaultTimeout(10000);
    // Keep a cursor attached before the compositor enters and leaves fullscreen.
    assert.equal(
      await phone.evaluate(() => command("move", { dx: 20, dy: 20 })),
      true,
    );
    await tv.locator("#play").click();
    await tv.waitForFunction(
      () => document.querySelector("video").currentTime > 0,
    );
    await tv.locator("#fullscreen").click();
    await tv.waitForFunction(() => !!document.fullscreenElement);
    await phone.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        r.request().postDataJSON().op === "state",
    );
    assert.equal(
      await phone.evaluate(() => state.paused),
      false,
      "Webpage video fullscreen must not pause phone input",
    );
    await phone.waitForFunction(() => !busy);
    assert.equal(
      await phone.evaluate(() => command("move", { dx: 10, dy: 10 })),
      true,
    );
    if (mode === "back") adb("shell", "input", "keyevent", "4");
    else if (mode === "phone-back") await phone.locator("#back").click();
    else await tv.evaluate(() => document.exitFullscreen());
    await tv.waitForFunction(() => !document.fullscreenElement);
    await phone.waitForFunction(
      (u) => !state.paused && !busy && state.url === u,
      url,
    );
    assert.equal(
      await phone.evaluate(() =>
        command("move", {
          dx: Math.round(1700 - state.x),
          dy: Math.round(900 - state.y),
        }),
      ),
      true,
    );
    const { x, y } = await phone.evaluate(() => ({ x: state.x, y: state.y }));
    let white = 0;
    const deadline = Date.now() + 2500;
    do {
      // Native screenshot includes the cursor overlay, unlike a WebContents screenshot.
      const raw = adb("exec-out", "screencap");
      const width = raw.readUInt32LE(0),
        height = raw.readUInt32LE(4);
      assert.equal(
        raw.readUInt32LE(8),
        1,
        "Expected Android RGBA_8888 screenshot",
      );
      const header = raw.length - width * height * 4;
      assert.ok(header === 12 || header === 16);
      white = 0;
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const i =
            header + ((Math.round(y) + dy) * width + Math.round(x) + dx) * 4;
          if (raw[i] > 240 && raw[i + 1] > 240 && raw[i + 2] > 240) white++;
        }
    } while (white <= 60 && Date.now() < deadline);
    assert.ok(
      white > 60,
      `Cursor must be visibly painted after fullscreen exit (${white}/81 white center pixels)`,
    );
    console.log(
      `PASS: ${mode}, fullscreen phone input, exit without history navigation, visible cursor`,
    );
  }
} finally {
  await pb.close();
  await tb.close();
}
