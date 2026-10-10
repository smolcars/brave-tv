// Integration probe: paired phone UI controls the harmless TV fixture over LAN.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const tv = tb
    .contexts()[0]
    .pages()
    .find((p) => p.url().includes("/phone-remote.html"));
  const phone = pb
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(tv && phone);
  const base = "http://10.0.2.2:18088/phone-remote.html";
  async function settled() {
    let previous;
    for (let i = 0; i < 10; i++) {
      await phone.waitForResponse(
        (r) =>
          r.request().method() === "POST" &&
          r.request().postDataJSON().op === "state",
      );
      const current = await phone.evaluate(() => ({
        revision: state.revision,
        loading: state.loading,
        busy,
      }));
      if (!current.loading && !current.busy && current.revision === previous)
        return;
      previous = current.revision;
    }
    throw new Error("TV context did not settle");
  }
  async function navigate(url) {
    await phone.locator("#address").fill(url);
    await phone.locator("#addressForm button").click();
    await phone.waitForFunction(
      (expected) => state?.url === expected && !state.loading && !busy,
      url,
    );
  }
  await navigate(base + "?controls");
  const point = await tv.locator("#click").evaluate((e) => {
    const r = e.getBoundingClientRect(),
      s = devicePixelRatio * visualViewport.scale;
    return {
      x: (r.x + r.width / 2 - visualViewport.offsetLeft) * s,
      y:
        (r.y + r.height / 2 - visualViewport.offsetTop) * s +
        outerHeight * devicePixelRatio -
        innerHeight * s,
    };
  });
  await phone.evaluate(async (p) => {
    await command("move", {
      dx: Math.round(p.x - state.x),
      dy: Math.round(p.y - state.y),
    });
  }, point);
  await phone.locator("#pad").scrollIntoViewIfNeeded();
  const pad = await phone.locator("#pad").boundingBox();
  assert.ok(pad);
  const touch = await phone.context().newCDPSession(phone);
  const x = pad.x + pad.width / 2,
    y = pad.y + pad.height / 2;
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 0 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await tv.waitForFunction(
    () => document.querySelector("#click").textContent === "Clicked 1 times",
  );
  await phone.waitForFunction(() => !busy);
  const before = await phone.evaluate(() => state.x);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 0 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 30, y, id: 0 }],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await phone.waitForFunction((old) => state.x > old, before, {
    timeout: 3000,
  });
  assert.equal(await tv.locator("#click").textContent(), "Clicked 1 times");
  const scroll = await tv.evaluate(() => scrollY + visualViewport.offsetTop);
  await phone.waitForFunction(() => !busy);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 20, y, id: 0 },
      { x: x + 20, y, id: 1 },
    ],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 20, y: y - 50, id: 0 },
      { x: x + 20, y: y - 50, id: 1 },
    ],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await tv.waitForFunction(
    (old) => scrollY + visualViewport.offsetTop > old,
    scroll,
    { timeout: 3000 },
  );
  await touch.detach();
  await navigate(base + "?next");
  await phone.locator("#back").click();
  await phone.waitForFunction(
    (expected) => state.url === expected && !state.loading,
    base + "?controls",
  );
  await phone.locator("#forward").click();
  await phone.waitForFunction(
    (expected) => state.url === expected && !state.loading,
    base + "?next",
  );
  const old = await phone.evaluate(() => state.revision);
  await phone.locator("#reload").click();
  await phone.waitForFunction(
    (previous) => state.revision !== previous && !state.loading && !busy,
    old,
  );
  const stale = await phone.evaluate(
    async (revision) =>
      (await post("/api", { token, epoch, seq: ++seq, revision, op: "click" }))
        .ok,
    old,
  );
  assert.equal(stale, false);
  const duplicate = await phone.evaluate(async () => {
    const request = {
      token,
      epoch,
      seq: ++seq,
      revision: state.revision,
      op: "move",
      dx: 0,
      dy: 0,
    };
    const first = await post("/api", request),
      second = await post("/api", request);
    return [first.ok, second.ok];
  });
  assert.deepEqual(duplicate, [true, false]);
  const originalIndex = await phone.evaluate(() =>
    state.tabs.findIndex((t) => t.selected),
  );
  const count = await phone.evaluate(() => state.tabs.length);
  await phone.locator('[data-op="new"]').click();
  await phone.waitForFunction(
    (n) => state.tabs?.length === n + 1 && !busy,
    count,
    { timeout: 5000 },
  );
  await settled();
  assert.equal(
    await phone.evaluate(() => state.tabs.findIndex((t) => t.selected)),
    count,
  );
  await phone
    .locator("#tabs .tab")
    .nth(originalIndex)
    .locator("button")
    .first()
    .click();
  await phone.waitForFunction(
    (index) => state.tabs[index].selected && !busy,
    originalIndex,
  );
  await phone.locator("#tabs .tab").nth(count).locator("button").last().click();
  await phone.waitForFunction((n) => state.tabs.length === n, count);
  console.log(
    "PASS: real touch tap/drag/two-finger scroll, Back/Forward/Reload, stale document and duplicate rejection, normal tab create/select/close",
  );
} finally {
  await pb.close();
  await tb.close();
}
