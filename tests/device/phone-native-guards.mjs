// Host-only CLI guards. No device/browser connection or fixture text is read.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const folder = mkdtempSync(join(tmpdir(), "tv-native-guards-"));
try {
  const module = join(folder, "node_modules", "playwright-core");
  mkdirSync(module, { recursive: true });
  writeFileSync(join(folder, "package.json"), "{}");
  writeFileSync(join(module, "index.js"), `
    exports.chromium = { connectOverCDP: async (url) => {
      const tv = url.endsWith(':9222');
      const count = Number(process.env[tv ? 'TV_TARGETS' : 'PHONE_TARGETS']);
      const pages = Array.from({length: count}, () => ({
        url: () => tv ? 'http://10.0.2.2:18088/phone-remote.html' : 'http://10.0.2.16:12345/',
        waitForFunction: async () => { throw Error('AUTHENTICATION_BOUNDARY'); },
        evaluate: async () => { throw Error('UNEXPECTED_DOM_READ'); },
        locator: () => { throw Error('UNEXPECTED_DOM_READ'); },
      }));
      return { contexts: () => pages.map(page => ({pages: () => [page]})), close: async () => {} };
    }};
  `);
  for (const [tv, phone, boundary] of [
    [0, 1, "Require one exact TV fixture target"],
    [2, 1, "Require one exact TV fixture target"],
    [1, 0, "Require one companion target"],
    [1, 2, "Require one companion target"],
    [1, 1, "AUTHENTICATION_BOUNDARY"],
  ]) {
    const run = spawnSync(process.execPath, [
      resolve("tests/device/phone-native-probe.mjs"), folder,
    ], {
      encoding: "utf8", timeout: 5000,
      env: { ...process.env, TV_TARGETS: String(tv), PHONE_TARGETS: String(phone) },
    });
    assert.equal(run.status, 1, "Guard subprocess did not stop");
    assert.ok(run.stderr.includes(boundary), "Stopped at the wrong boundary");
    assert.ok(!(run.stdout + run.stderr).includes("UNEXPECTED_DOM_READ"),
      "A rejected target was accessed");
  }
  console.log("PASS: 5 strict-input CLI target guards; no ambiguous DOM access");
} finally {
  rmSync(folder, { recursive: true, force: true });
}
