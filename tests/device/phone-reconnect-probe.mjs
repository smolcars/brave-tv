// Short phone network loss: fetch fresh state and never replay a queued click.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const tvBrowser = await chromium.connectOverCDP("http://127.0.0.1:9222");
const phoneBrowser = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const tv = tvBrowser
    .contexts()[0]
    .pages()
    .find((p) => p.url().includes("/phone-remote.html"));
  const phone = phoneBrowser
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(tv && phone, "Open the fixture and pair the phone first");
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  const originalEpoch = await phone.evaluate(() => epoch);
  const before = await tv.locator("#click").textContent();
  const connection = await phone.context().newCDPSession(phone);
  const network = { latency: 0, downloadThroughput: -1, uploadThroughput: -1 };
  try {
    await connection.send("Network.emulateNetworkConditions", {
      ...network,
      offline: true,
    });
    await phone.waitForFunction(() => !connected, undefined, { timeout: 6000 });
    assert.equal(await phone.evaluate(() => command("click")), false);
    assert.equal(
      await phone.evaluate(() => motion === null && !dirty && !pendingEdit),
      true,
    );
    const restored = Date.now();
    await connection.send("Network.emulateNetworkConditions", {
      ...network,
      offline: false,
    });
    await phone.waitForFunction(
      () => connected && !busy && !state.paused,
      undefined,
      { timeout: 10000 },
    );
    const elapsedMs = Date.now() - restored;
    assert.ok(
      await phone.evaluate((expected) => epoch === expected, originalEpoch),
      "Session changed",
    );
    // Observe two subsequent state responses, allowing any delayed action to arrive.
    for (let i = 0; i < 2; i++) {
      await phone.waitForResponse(
        (r) =>
          r.request().method() === "POST" &&
          r.request().postDataJSON().op === "state",
      );
    }
    assert.equal(await tv.locator("#click").textContent(), before);
    console.log(
      `PASS: offline action discarded, same session restored in ${elapsedMs} ms, no replayed click`,
    );
  } finally {
    await connection.send("Network.emulateNetworkConditions", {
      ...network,
      offline: false,
    });
    await connection.detach();
  }
} finally {
  await phoneBrowser.close();
  await tvBrowser.close();
}
