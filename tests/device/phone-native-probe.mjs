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
  const url = "http://10.0.2.2:18088/phone-remote.html";
  const tv = tvBrowser
    .contexts()[0]
    .pages()
    .find((p) => p.url() === url);
  const phone = phoneBrowser
    .contexts()[0]
    .pages()
    .find((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.ok(
    tv && phone,
    "Open the fixture and pair the real phone browser first",
  );
  await phone.waitForFunction(
    (url) => connected && !busy && !state.paused && state.url === url,
    url,
  );
  async function focus(selector) {
    if (await tv.evaluate((id) => document.activeElement?.id === id, selector.slice(1))) {
      await phone.waitForFunction(() => state.editable?.ready && !busy && !state.paused);
      return;
    }
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
  if (await phone.locator("#editor").isHidden()) {
    await phone.locator("#showKeyboard").click();
  }
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
  // Exercise the first-replacement race repeatedly without re-pairing/reloading.
  for (let i = 0; i < 10; i++) {
    for (const replacement of ["hello", text]) {
      await phone.locator("#editor").fill(replacement);
      await settled(replacement);
      assert.equal(await tv.locator("#plain").inputValue(), replacement);
    }
  }
  // Equal text cannot identify a native acknowledgement. Require actual IME
  // composition events as well as settled content for these unchanged edits.
  for (const composing of [true, false]) {
    const eventType = composing ? "compositionstart" : "compositionend";
    const before = await tv.evaluate(
      (type) =>
        window.events.filter((e) => e.id === "plain" && e.type === type).length,
      eventType,
    );
    assert.ok(
      await phone.evaluate(async (composing) => {
        const e = state.editable;
        return command("edit", {
          editable: e.revision,
          version: e.version,
          edit: "replace",
          text: e.text,
          start: e.text.length,
          end: e.text.length,
          composing,
        });
      }, composing),
    );
    await settled(text);
    assert.equal(await tv.locator("#plain").inputValue(), text);
    await tv.waitForFunction(
      ({ type, before }) =>
        window.events.filter((e) => e.id === "plain" && e.type === type)
          .length > before,
      { type: eventType, before },
    );
  }
  await nativeEdit("replace", {
    text,
    start: text.length,
    end: text.length,
    composing: true,
  });
  await settled(text);
  const compositionLease = await phone.evaluate(() => ({
    editable: state.editable.revision,
    version: state.editable.version,
    replacementVersion: state.editable.replacementVersion,
  }));
  assert.equal(typeof compositionLease.replacementVersion, "number");
  await nativeEdit("finish");
  await settled(text);
  assert.notEqual(
    await phone.evaluate(() => state.editable.version),
    compositionLease.version,
  );
  assert.equal(
    await phone.evaluate(() => state.editable.replacementVersion),
    compositionLease.replacementVersion,
  );
  assert.equal(
    await phone.evaluate(
      async (old) =>
        command("edit", {
          ...old,
          edit: "compose",
          text: "must not arrive",
        }),
      compositionLease,
    ),
    false,
    "Positional composition accepted an old full version",
  );
  assert.ok(
    await phone.evaluate(
      async ({ old, text }) =>
        command("edit", {
          ...old,
          edit: "replace",
          text,
          start: text.length,
          end: text.length,
          composing: false,
        }),
      { old: compositionLease, text },
    ),
  );
  await settled(text);
  const textLease = await phone.evaluate(() => ({
    editable: state.editable.revision,
    version: state.editable.version,
    replacementVersion: state.editable.replacementVersion,
  }));
  await nativeEdit("commit", { text: "!" });
  await settled(text + "!");
  assert.equal(
    await phone.evaluate(
      async ({ old, text }) =>
        command("edit", {
          ...old,
          edit: "replace",
          text,
          start: text.length,
          end: text.length,
          composing: false,
        }),
      { old: textLease, text },
    ),
    false,
    "Replacement accepted a changed native text version",
  );
  await settled(text + "!");
  await phone.locator("#editor").fill(text);
  await settled(text);
  // Android resizes the visual viewport for its keyboard. Dismiss it before
  // targeting toolbar buttons; desktop coordinates can hit the wrong element.
  if (await phone.evaluate(() => visualViewport.height < innerHeight - 30)) {
    execFileSync("adb", [
      "-s",
      "emulator-5556",
      "shell",
      "input",
      "keyevent",
      "4",
    ]);
    await phone.waitForFunction(
      () => visualViewport.height >= innerHeight - 30,
    );
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
  function tapIme(label) {
    const adb = (...args) =>
      execFileSync("adb", ["-s", "emulator-5556", ...args], {
        encoding: "utf8",
        timeout: 15000,
      });
    const imeState = adb("shell", "dumpsys", "input_method");
    assert.ok(
      imeState.includes(
        "Input method service state for org.bravetv.remoteime.test.RemoteIme",
      ) && imeState.includes("mIsInputViewShown=true"),
      "Select and show the Remote IME test keyboard",
    );
    const size = adb("shell", "wm", "size").match(/Physical size: (\d+)x(\d+)/);
    assert.ok(size, "Cannot read phone emulator display size");
    // The fixture's row occupies the bottom 180 physical pixels. Tap above the
    // navigation-bar overlay; uiautomator omits the IME window on this image.
    const x = Number(size[1]) * (label === "Compose Japanese" ? 0.25 : 0.75);
    adb(
      "shell",
      "input",
      "tap",
      String(Math.round(x)),
      String(Number(size[2]) - 150),
    );
  }
  // Use the actual Android InputConnection. The stock IME cancels CDP-injected
  // composition even in a bare textarea, so CDP is only valid for the host test.
  await phone.locator("#editor").click();
  tapIme("Compose Japanese");
  await phone.waitForFunction(() => composing, undefined, { timeout: 3000 });
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
  tapIme("Commit Japanese");
  await phone.waitForFunction(() => !composing, undefined, { timeout: 3000 });
  await settled("日本");
  assert.equal(await phone.evaluate(() => composing), false);
  assert.equal(await phone.locator("#editor").inputValue(), "日本");
  await tv.waitForFunction(() =>
    window.events.some((e) => e.type === "compositionend" && e.id === "plain"),
  );

  async function nativeEdit(edit, extra = {}) {
    await phone.waitForFunction(
      () => state?.editable?.ready && !busy && !pendingEdit && !dirty,
    );
    assert.ok(
      await phone.evaluate(
        async ({ edit, extra }) => {
          const e = state.editable;
          return command("edit", {
            editable: e.revision,
            version: e.version,
            edit,
            ...extra,
          });
        },
        { edit, extra },
      ),
    );
  }
  await nativeEdit("select", { start: 0, end: 1 });
  await phone.waitForFunction(
    () =>
      state.editable.ready &&
      state.editable.start === 0 &&
      state.editable.end === 1,
  );
  await nativeEdit("compose", { text: "é🌍" });
  await settled("é🌍本");
  assert.equal(await tv.locator("#plain").inputValue(), "é🌍本");
  await nativeEdit("commit", { text: "क" });
  await settled("क本");
  assert.equal(await tv.locator("#plain").inputValue(), "क本");
  await phone.locator("#editor").fill("A🌍BCéD");
  await settled("A🌍BCéD");
  await nativeEdit("select", { start: 3, end: 5 });
  await phone.waitForFunction(
    () =>
      state.editable.ready &&
      state.editable.start === 3 &&
      state.editable.end === 5,
  );
  await nativeEdit("delete", { start: 1, end: 1 });
  await settled("ABCD");
  assert.equal(await tv.locator("#plain").inputValue(), "ABCD");
  assert.deepEqual(
    await tv
      .locator("#plain")
      .evaluate((e) => [e.selectionStart, e.selectionEnd]),
    [1, 3],
  );
  await phone.locator("#editor").fill("日本");
  await settled("日本");

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
    const original = await tv
      .locator(selector)
      .evaluate((e) => (e.isContentEditable ? e.textContent : e.value));
    await settled(original);
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
