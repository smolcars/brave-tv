// Bounded emulator comparison: companion polling active versus its page frozen.
// This measures polling overhead, not optimized Chromecast performance.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
let phoneCdp;
try {
  const phone = pb
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(phone, "Pair the phone emulator first");
  await phone.waitForFunction(() => connected && !state.paused && !busy);
  // Navigate the active tab through the real controller before attaching diagnostic metrics.
  const fixture = "http://10.0.2.2:18088/media.html";
  await phone.locator("#address").fill(fixture);
  await phone.locator("#addressForm button").click();
  await phone.waitForFunction(
    (url) => state.url === url && !state.loading,
    fixture,
  );
  const tv = tb
    .contexts()[0]
    .pages()
    .find((p) => p.url() === fixture);
  assert.ok(tv);
  const serverEpoch = await phone.evaluate(() => epoch);
  phoneCdp = await phone.context().newCDPSession(phone);
  const cdp = await tv.context().newCDPSession(tv);
  await cdp.send("Performance.enable");
  for (const [site, url] of [
    ["fixture", fixture],
    ["youtube", "https://m.youtube.com/watch?v=plN7JMbadRg"],
  ]) {
    for (const polling of [true, false, false, true]) {
      // Renew and verify the same session between samples, including frozen ones.
      const renewed = phone.waitForResponse(
        (r) =>
          r.request().method() === "POST" &&
          r.request().postDataJSON().op === "state",
        { timeout: 5000 },
      );
      await phoneCdp.send("Page.setWebLifecycleState", { state: "active" });
      const reply = await (await renewed).json();
      assert.ok(
        reply.epoch === serverEpoch && reply.state,
        "Original paired session must still be polling",
      );
      if (!polling)
        await phoneCdp.send("Page.setWebLifecycleState", { state: "frozen" });
      const before = (await cdp.send("Performance.getMetrics")).metrics.find(
        (m) => m.name === "TaskDuration",
      ).value;
      const start = performance.now();
      let failure = null;
      try {
        await tv.goto(url, { waitUntil: "load", timeout: 30000 });
        await tv.waitForFunction(
          () => document.querySelector("video")?.readyState >= 2,
          undefined,
          { timeout: 10000 },
        );
      } catch {
        failure = "load or video readiness deadline";
      }
      const elapsed = performance.now() - start;
      const after = (await cdp.send("Performance.getMetrics")).metrics.find(
        (m) => m.name === "TaskDuration",
      ).value;
      const sample = await tv.evaluate(() => {
        const n = performance.getEntriesByType("navigation")[0];
        const v = document.querySelector("video");
        return {
          ttfb: n.responseStart - n.requestStart,
          dom: n.domContentLoadedEventEnd,
          load: n.loadEventEnd,
          videoReady: v?.readyState,
          mediaError: v?.error?.code || 0,
        };
      });
      console.log(
        JSON.stringify({
          site,
          polling,
          elapsed: Math.round(elapsed),
          rendererTaskMs: Math.round((after - before) * 1000),
          ...sample,
          failure,
        }),
      );
    }
  }
  await cdp.detach();
} finally {
  if (phoneCdp) {
    await phoneCdp.send("Page.setWebLifecycleState", { state: "active" });
    await phoneCdp.detach();
  }
  await pb.close();
  await tb.close();
}
