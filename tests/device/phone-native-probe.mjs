// Requires an approved phone page and the harmless phone-remote.html TV fixture.
// DevTools is test instrumentation; remote commands still travel over the LAN.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(resolve(process.argv[2], "package.json"));
const { chromium } = require("playwright-core");
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
  assert.ok(
    tv && phone,
    "Open the fixture and pair the real phone browser first",
  );
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  async function focus(selector) {
    for (let attempt = 0; attempt < 16; attempt++) {
      await phone.waitForFunction(() => connected && !busy && !state.paused);
      const target = await tv.locator(selector).evaluate((element) => {
        const r = element.getBoundingClientRect();
        const scale = devicePixelRatio * visualViewport.scale;
        return {
          x: (r.x + r.width / 2 - visualViewport.offsetLeft) * scale,
          y: (r.y + r.height / 2 - visualViewport.offsetTop) * scale,
          height: visualViewport.height * scale,
          top: outerHeight * devicePixelRatio - innerHeight * scale,
        };
      });
      if (target.y > 20 && target.y < target.height - 20) {
        await phone.evaluate(async (point) => {
          await command("move", {
            dx: Math.round(point.x - state.x),
            dy: Math.round(point.y + point.top - state.y),
          });
          await command("click");
        }, target);
        try {
          await tv.waitForFunction(
            (id) => document.activeElement.id === id,
            selector.slice(1),
            { timeout: 1000 },
          );
          return;
        } catch {
          // Native keyboard panning can invalidate the sampled visual viewport.
          console.log(`Resampling native viewport for ${selector}`);
          continue;
        }
      }
      const oldScroll = await tv.evaluate(
        () => scrollY + visualViewport.offsetTop,
      );
      await phone.evaluate(
        async (direction) => {
          await command("move", {
            dx: Math.round(state.width / 2 - state.x),
            dy: Math.round(state.height / 2 - state.y),
          });
          await command("scroll", { dx: 0, dy: direction });
        },
        target.y < 20 ? -3 : 3,
      );
      await tv.waitForFunction(
        (before) => scrollY + visualViewport.offsetTop !== before,
        oldScroll,
        {
          timeout: 5000,
        },
      );
    }
    throw new Error("Field did not enter the native viewport");
  }
  async function settled(text) {
    await phone.waitForFunction(
      (expected) =>
        state?.editable?.ready &&
        state.editable.text === expected &&
        !busy &&
        !pendingEdit &&
        !dirty,
      text,
    );
  }
  await focus("#plain");
  await phone.waitForFunction(() => state?.editable?.ready, undefined, {
    timeout: 5000,
  });
  assert.equal(await tv.evaluate(() => document.activeElement.id), "plain");
  await phone.locator("#showKeyboard").click();
  const text = "héllo हिन्दी 🌍";
  await phone.locator("#editor").fill(text);
  await tv.waitForFunction(
    (expected) => document.querySelector("#plain").value === expected,
    text,
    { timeout: 5000 },
  );
  await phone.waitForFunction(
    (expected) =>
      state?.editable?.ready && state.editable.text === expected && !busy,
    text,
  );
  // Android resizes the visual viewport for its keyboard. Dismiss it before
  // targeting toolbar buttons; desktop coordinates can hit the wrong element.
  if (await phone.evaluate(() => visualViewport.height < innerHeight - 100)) {
    execFileSync("adb", ["-s", "emulator-5556", "shell", "input", "keyevent", "4"]);
    await phone.waitForFunction(() => visualViewport.height >= innerHeight - 100);
  }
  await phone.locator("#delete").click();
  await tv.waitForFunction(
    (expected) => document.querySelector("#plain").value === expected,
    text.slice(0, -2),
    { timeout: 5000 },
  );
  await settled(text.slice(0, -2));
  await phone.locator("#editor").fill("");
  await settled("");
  await phone.locator("#editor").focus();
  const ime = await phone.context().newCDPSession(phone);
  await ime.send("Input.imeSetComposition", {
    text: "日本",
    selectionStart: 2,
    selectionEnd: 2,
  });
  assert.equal(
    await phone.evaluate(() => composing),
    true,
    "Phone composition must remain active",
  );
  await settled("日本");
  assert.equal(await phone.evaluate(() => composing), true);
  await tv.waitForFunction(() =>
    window.events.some(
      (e) => e.type === "compositionstart" && e.id === "plain",
    ),
  );
  await ime.send("Input.insertText", { text: "日本" });
  await settled("日本");
  assert.equal(await phone.evaluate(() => composing), false);
  assert.equal(await phone.locator("#editor").inputValue(), "日本");
  await tv.waitForFunction(() =>
    window.events.some((e) => e.type === "compositionend" && e.id === "plain"),
  );
  await ime.detach();
  await phone.locator("#editor").evaluate((e) => e.setSelectionRange(0, 1));
  await phone.waitForFunction(
    () =>
      state.editable.ready &&
      state.editable.start === 0 &&
      state.editable.end === 1 &&
      !busy,
  );
  assert.deepEqual(
    await tv
      .locator("#plain")
      .evaluate((e) => [e.selectionStart, e.selectionEnd]),
    [0, 1],
  );
  const stale = await phone.evaluate(() => ({
    revision: state.revision,
    editable: state.editable.revision,
    version: state.editable.version,
  }));
  await focus("#second");
  await settled("second");
  const rejected = await phone.evaluate(async (old) => {
    const result = await post("/api", {
      token,
      epoch,
      seq: ++seq,
      op: "edit",
      ...old,
      edit: "replace",
      text: "must not arrive",
      start: 0,
      end: 0,
    });
    return result.ok === false;
  }, stale);
  assert.ok(rejected, "Old field identity was accepted");
  assert.equal(await tv.locator("#second").inputValue(), "second");
  for (const [selector, replacement] of [
    ["#area", "First line\nहिन्दी 🌍"],
    ["#editable", "Native café 🌍"],
  ]) {
    await focus(selector);
    await phone.waitForFunction(() => state?.editable?.ready && !busy);
    await phone.locator("#editor").fill(replacement);
    await settled(replacement);
    assert.equal(
      await tv
        .locator(selector)
        .evaluate((e) => (e.isContentEditable ? e.textContent : e.value)),
      replacement,
    );
  }
  await focus("#password");
  await phone.waitForFunction(() => !state?.editable);
  assert.ok(await phone.locator("#editor").isDisabled());
  assert.equal(
    await phone.evaluate(() =>
      JSON.stringify(state).includes("synthetic-secret"),
    ),
    false,
  );
  const events = await tv.evaluate(() => window.events);
  assert.ok(events.some((e) => e.type === "input" && e.id === "plain"));
  console.log(
    "PASS: native Unicode, composition, selection, code-point deletion, textarea/contenteditable, stale-focus rejection and password exclusion",
  );
} finally {
  await phoneBrowser.close();
  await tvBrowser.close();
}
