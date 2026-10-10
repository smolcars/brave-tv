// Requires an approved phone session and a native modal or selected private tab.
// Sends authenticated requests directly so disabled companion controls cannot
// hide a missing native security boundary. Never logs credentials or page data.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const phone = browser
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(phone, "Pair the phone emulator first");
  await phone.waitForFunction(() => connected && state?.paused && !busy);
  const results = await phone.evaluate(async () => {
    const results = [];
    for (const extra of [
      { op: "navigate", text: "http://10.0.2.2:18088/phone-remote.html" },
      { op: "new" },
      { op: "back" },
      { op: "move", dx: 1, dy: 1 },
    ]) {
      const response = await post("/api", {
        token,
        epoch,
        seq: ++seq,
        revision: state.revision,
        ...extra,
      });
      results.push({
        ok: response.ok,
        keys: Object.keys(response.state ?? {}).sort(),
        paused: response.state?.paused,
      });
    }
    return results;
  });
  for (const result of results) {
    assert.equal(result.ok, false);
    assert.equal(result.paused, true);
    assert.deepEqual(result.keys, ["paused", "revision"]);
  }
  console.log(
    "PASS: authenticated actions rejected and metadata redacted while native/private input owns the session",
  );
} finally {
  await browser.close();
}
