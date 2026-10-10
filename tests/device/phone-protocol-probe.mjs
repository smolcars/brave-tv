// Exact protocol numbers on an approved emulator session; no text or secrets logged.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const browser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const page = browser
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(page, "Pair the phone emulator first");
  await page.waitForFunction(
    () => connected && !busy && !state.paused && state.page,
  );
  for (const version of [1.5, "1", null, 2]) {
    const error = await page.evaluate(
      async (v) => (await post("/api", { v, token, op: "state" })).error,
      version,
    );
    assert.equal(error, "version", "Malformed protocol version accepted");
  }
  const rejected = await page.evaluate(async () => {
    const results = [];
    for (const key of ["seq", "revision"]) {
      for (const malformed of ["fraction", "string"]) {
        const request = {
          token,
          epoch,
          seq: ++seq,
          revision: state.revision,
          op: "move",
          dx: 0,
          dy: 0,
        };
        request[key] =
          malformed === "fraction" ? request[key] + 0.5 : String(request[key]);
        results.push((await post("/api", request)).ok === false);
      }
    }
    return results;
  });
  assert.ok(
    rejected.every(Boolean),
    "Malformed sequence/document identity accepted",
  );
  assert.ok(
    await page.evaluate(() => command("move", { dx: 0, dy: 0 })),
    "Valid command must still work",
  );
  console.log(
    "PASS: exact version, sequence and document numbers; valid commands remain usable",
  );
} finally {
  await browser.close();
}
