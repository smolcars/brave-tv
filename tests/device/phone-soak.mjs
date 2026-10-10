// Thirty-minute foreground session; DevTools is test instrumentation only.
// Usage: node phone-soak.mjs PLAYWRIGHT_CORE TV_EMULATOR PHONE_CDP_PORT OUTPUT_JSON
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
const [modulePath, serial, port, output] = process.argv.slice(2);
assert.match(serial, /^emulator-\d+$/);
assert.match(port, /^\d+$/);
const { chromium } = createRequire(resolve(modulePath, "package.json"))(
  "playwright-core",
);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const samples = [],
  roundTrips = [];
const started = Date.now();
let previousCounters = new Map(),
  previousSampleAt;
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
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(page, "Pair a companion page first");
  await page.waitForFunction(() => connected && !busy && !state.paused);
  const originalEpoch = await page.evaluate(() => epoch);
  for (let tick = 0; tick <= 180; tick++) {
    await new Promise((r) =>
      setTimeout(r, Math.max(0, started + tick * 10000 - Date.now())),
    );
    const sample = await page.evaluate(async (expectedEpoch) => {
      const result = {
        connected,
        sameSession: epoch === expectedEpoch,
        paused: !!state?.paused,
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
      sample.connected && sample.sameSession,
      "The approved foreground session was lost",
    );
    if (sample.commandMs !== undefined) roundTrips.push(sample.commandMs);
    if (tick % 6 === 0) {
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
        ...sample,
      });
      console.log(JSON.stringify(samples.at(-1)));
    }
  }
  assert.ok(roundTrips.length >= 100, "Too few foreground command samples");
  roundTrips.sort((a, b) => a - b);
  const result = {
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
