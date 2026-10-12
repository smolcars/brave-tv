// Thirty-minute foreground session; DevTools is test instrumentation only.
// Usage: node phone-soak.mjs PLAYWRIGHT_CORE TV_EMULATOR PHONE_CDP_PORT OUTPUT_JSON
//        TV_AVD PHONE_EMULATOR PHONE_AVD TV_AGENT_DRIVER
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
const [modulePath, serial, port, output, tvAvd, phoneSerial, phoneAvd, driver] =
  process.argv.slice(2);
assert.match(serial, /^emulator-\d+$/);
assert.match(port, /^\d+$/);
assert.match(phoneSerial, /^emulator-\d+$/);
assert.notEqual(serial, phoneSerial);
assert.ok(tvAvd && phoneAvd && driver, "Provide verified AVDs and the TV agent driver");
for (const [device, avd] of [[serial, tvAvd], [phoneSerial, phoneAvd]]) {
  assert.equal(execFileSync("adb", ["-s", device, "emu", "avd", "name"], {
    encoding: "utf8", timeout: 15000,
  }).replace(/\r/g, "").trim(), avd + "\nOK", "Emulator identity changed");
}
assert.ok(execFileSync("adb", ["-s", phoneSerial, "forward", "--list"], {
  encoding: "utf8", timeout: 15000,
}).split(/\r?\n/).includes(
  `${phoneSerial} tcp:${port} localabstract:chrome_devtools_remote`,
), "Phone diagnostic forward must belong to the verified emulator");
const { chromium } = createRequire(resolve(modulePath, "package.json"))(
  "playwright-core",
);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const samples = [],
  roundTrips = [];
const started = Date.now();
let previousCounters = new Map(),
  previousSampleAt, previousMedia;
const ticksPerSecond = Number(
  execFileSync("adb", ["-s", serial, "shell", "getconf", "CLK_TCK"], {
    encoding: "utf8",
    timeout: 10000,
  }).trim(),
);
assert.ok(ticksPerSecond > 0);
try {
  const page = browser
    .contexts()[0]
    .pages()
    .filter((p) => /^http:\/\/10\.0\.2\./.test(p.url())).at(-1);
  assert.ok(page, "Pair a companion page first");
  await page.waitForFunction(() => connected && !busy && !state.paused);
  const originalEpoch = await page.evaluate(() => epoch);
  for (let tick = 0; tick <= 180; tick++) {
    await new Promise((r) =>
      setTimeout(r, Math.max(0, started + tick * 10000 - Date.now())),
    );
    if (await page.evaluate(() => connected && state?.page && !state.paused)) {
      await page.waitForFunction(() => !busy, undefined, { timeout: 2000 });
    }
    const sample = await page.evaluate(async (expectedEpoch) => {
      const result = {
        connected,
        sameSession: epoch === expectedEpoch,
        paused: !!state?.paused,
        normalMediaPage: state?.page === true
          && state.url === "http://10.0.2.2:18088/media.html",
      };
      if (connected && state?.page && !state.paused && !busy) {
        const before = performance.now(),
          revision = state.revision;
        const sent = await command("move", { dx: 0, dy: 0 });
        if (sent && connected && state.revision === revision)
          result.commandMs = performance.now() - before;
      }
      return result;
    }, originalEpoch);
    assert.ok(
      sample.connected && sample.sameSession && !sample.paused && sample.normalMediaPage,
      "The approved foreground session was lost",
    );
    if (sample.commandMs !== undefined) roundTrips.push(sample.commandMs);
    if (tick % 6 === 0) {
      const native = JSON.parse(execFileSync("python3", [resolve(driver), "snapshot", "--json"], {
        encoding: "utf8", timeout: 20000,
      }));
      assert.ok(native.success && !native.data.truncated, "Complete native media snapshot required");
      const nodes = native.data.nodes;
      assert.equal(native.data.appBundleId, "com.brave.browser_default");
      assert.ok(["play", "pause", "fullscreen", "captions"].every(id =>
        nodes.some(n => n.identifier === id)), "Native media fixture controls required");
      const details = nodes.find(n => n.identifier === "mediaDetails")?.label;
      assert.ok(details && details.length <= 1024, "Bounded native media report required");
      const media = JSON.parse(details);
      assert.ok(Number.isFinite(media.documentTime) && Number.isFinite(media.time));
      assert.ok(Number.isSafeInteger(media.frames) && media.frames > 0);
      assert.ok(Number.isSafeInteger(media.droppedFrames) && media.droppedFrames >= 0
        && media.droppedFrames <= media.frames);
      assert.ok(media.frames - media.droppedFrames > 0, "Native video must present frames");
      assert.ok(!media.paused && media.ready >= 2 && media.error === null,
        "Native video must keep playing without a media error");
      assert.ok(Number.isSafeInteger(media.width) && media.width > 0);
      assert.ok(Number.isSafeInteger(media.height) && media.height > 0);
      if (previousMedia) {
        assert.equal(media.documentTime, previousMedia.documentTime, "Media document was replaced");
        assert.equal(media.width, previousMedia.width);
        assert.equal(media.height, previousMedia.height);
        assert.ok(media.frames > previousMedia.frames, "Native video stopped producing frames");
        assert.ok(media.frames - media.droppedFrames
          > previousMedia.frames - previousMedia.droppedFrames,
        "Native video stopped presenting frames");
      }
      previousMedia = media;
      const adb = (...args) =>
        execFileSync("adb", ["-s", serial, "shell", ...args], {
          encoding: "utf8",
          timeout: 15000,
        });
      const memory = adb(
        "dumpsys",
        "meminfo",
        "--package",
        "com.brave.browser_default",
      );
      const pss = [...memory.matchAll(/TOTAL PSS:\s*(\d+)/g)].map((m) =>
        Number(m[1]),
      );
      assert.ok(pss.length, "No browser package memory samples");
      const pids = [...memory.matchAll(/MEMINFO in pid (\d+)/g)].map(
        (m) => m[1],
      );
      const counters = new Map();
      for (const pid of pids) {
        const stat = adb("cat", `/proc/${pid}/stat`);
        const fields = stat
          .slice(stat.lastIndexOf(")") + 2)
          .trim()
          .split(/\s+/);
        counters.set(
          pid + ":" + fields[19],
          Number(fields[11]) + Number(fields[12]),
        );
      }
      const now = Date.now();
      const sameProcesses =
        counters.size === previousCounters.size &&
        [...counters.keys()].every((key) => previousCounters.has(key));
      const cpuPercent =
        sameProcesses && previousSampleAt
          ? ([...counters].reduce(
              (sum, [key, value]) => sum + value - previousCounters.get(key),
              0,
            ) /
              ticksPerSecond /
              ((now - previousSampleAt) / 1000)) *
            100
          : null;
      previousCounters = counters;
      previousSampleAt = now;
      samples.push({
        elapsedMs: Date.now() - started,
        pssKiB: pss.reduce((a, b) => a + b, 0),
        processes: pss.length,
        cpuPercent,
        media,
        ...sample,
      });
      console.log(JSON.stringify(samples.at(-1)));
      await writeFile(
        output,
        JSON.stringify({ complete: false, samples, roundTrips }, null, 2) +
          "\n",
      );
    }
  }
  assert.ok(roundTrips.length >= 100, "Too few foreground command samples");
  roundTrips.sort((a, b) => a - b);
  const result = {
    complete: true,
    durationMs: Date.now() - started,
    commandCount: roundTrips.length,
    commandP95Ms: roundTrips[Math.ceil(roundTrips.length * 0.95) - 1],
    samples,
  };
  await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  console.log(
    JSON.stringify({
      result: "PASS",
      durationMs: result.durationMs,
      commandCount: result.commandCount,
      commandP95Ms: result.commandP95Ms,
    }),
  );
} finally {
  await browser.close();
}
