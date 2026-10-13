// Paired emulator integration: bundled phone UI sends native Enter over virtual LAN.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const [pw, serial, avd, phoneSerial, phoneAvd, origin, output] = process.argv.slice(2);
assert.match(serial, /^emulator-\d+$/);
assert.match(phoneSerial, /^emulator-\d+$/);
assert.notEqual(serial, phoneSerial);
assert.match(origin, /^http:\/\/10\.0\.2\.\d+:\d+$/);
assert.ok(avd && phoneAvd && output);
const adb = (device, ...args) => execFileSync("adb", ["-s", device, ...args], {
  encoding: "utf8", timeout: 15000,
});
for (const [device, name, port] of [[serial, avd, 9222], [phoneSerial, phoneAvd, 9223]]) {
  assert.equal(adb(device, "emu", "avd", "name").replace(/\r/g, "").trim(), name + "\nOK");
  assert.ok(adb(device, "forward", "--list").split(/\r?\n/).includes(
    `${device} tcp:${port} localabstract:chrome_devtools_remote`));
}
const { chromium } = createRequire(resolve(pw, "package.json"))("playwright-core");
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
const results = [];
const record = async (name, test) => {
  await test();
  results.push({ name, passed: true });
  await writeFile(output, JSON.stringify({ avd, phoneAvd, results }, null, 2));
  console.log(`PASS: ${name}`);
};
try {
  const url = "http://10.0.2.2:18088/phone-enter.html";
  const tvs = tb.contexts().flatMap(c => c.pages()).filter(p => p.url() === url);
  const phones = pb.contexts().flatMap(c => c.pages()).filter(p => p.url() === origin + "/");
  assert.equal(tvs.length, 1, "Require one exact normal TV fixture");
  assert.equal(phones.length, 1, "Require one exact paired companion origin");
  const [tv] = tvs, [phone] = phones;
  tv.setDefaultTimeout(6000);
  phone.setDefaultTimeout(6000);
  const available = () => phone.waitForFunction(url => connected && !busy && state?.page
    && !state.paused && state.url === url, url);
  await available();
  const settled = () => phone.waitForFunction(() => !busy && !dirty && !pendingEdit
    && !enterIntent && state?.editable?.ready);
  await record("packaged companion JavaScript matches source", async () => {
    const served = await phone.evaluate(async () => (await fetch("/remote.js")).text());
    const source = await readFile("brave/android/java/brave-res/raw/tv_remote_js.js");
    const hash = value => createHash("sha256").update(value).digest("hex");
    assert.equal(hash(served), hash(source));
  });
  async function focus(name, selector = "#" + name, frame = false) {
    await available();
    if (await tv.evaluate(() => visualViewport.height < innerHeight - 1)) {
      adb(serial, "shell", "input", "keyevent", "4");
      await tv.waitForFunction(() => visualViewport.height >= innerHeight - 1);
    }
    await tv.evaluate(name => showCase(name), name);
    const target = frame ? tv.frameLocator("#frame").locator(selector) : tv.locator(selector);
    for (let attempt = 0; attempt < 8; attempt++) {
      await available();
      const point = await target.evaluate(element => {
        const r = element.getBoundingClientRect(), scale = devicePixelRatio * visualViewport.scale;
        return { x: (r.x + r.width / 2 - visualViewport.offsetLeft) * scale,
          y: (r.y + r.height / 2 - visualViewport.offsetTop) * scale };
      });
      const offsets = await tv.evaluate(frame => {
        const r = frame ? document.querySelector("#frame").getBoundingClientRect() : { x: 0, y: 0 };
        return { x: r.x * devicePixelRatio, y: r.y * devicePixelRatio
          + outerHeight * devicePixelRatio - innerHeight * devicePixelRatio * visualViewport.scale };
      }, frame);
      assert.ok(await phone.evaluate(async p => {
        return await command("move", { dx: Math.round(p.x - state.x), dy: Math.round(p.y - state.y) })
          && await command("click");
      }, { x: point.x + offsets.x, y: point.y + offsets.y }));
      try {
        await target.evaluate(element => {
          if (document.activeElement !== element) throw Error("Native pointer has not focused field");
        });
        if (name !== "password") await phone.waitForFunction(() => state.editable?.ready && !busy);
        return target;
      } catch (error) {
        if (attempt === 7) throw error;
      }
    }
  }
  async function type(text) {
    if (await phone.locator("#editor").isHidden()) await phone.locator("#showKeyboard").click();
    await phone.locator("#editor").focus();
    await settled();
    await phone.locator("#editor").fill(text);
  }
  for (const name of ["search", "plain", "js", "textareaSearch"]) {
    await record(`${name}: latest Unicode text submits once through native Enter`, async () => {
      await focus(name);
      if (name === "plain") assert.equal(await phone.evaluate(() => state.editable.action), "enter");
      const before = await tv.evaluate(() => ({ keys: events.length, submits: submissions.length }));
      const text = `Immediate ${name} héllo हिन्दी 🌍`;
      await type(text);
      await phone.locator("#enter").click();
      await tv.waitForFunction(({ name, text, before }) => submissions.length === before + 1
        && submissions.at(-1).id === name && submissions.at(-1).text === text,
      { name, text, before: before.submits });
      await settled();
      assert.equal(await tv.evaluate(() => events.length), before.keys + 1);
      assert.equal(await tv.evaluate(() => events.at(-1).trusted), true);
    });
  }
  await record("native HTML validation and canceled keydown retain site behavior", async () => {
    await focus("validation");
    const before = await tv.evaluate(() => submissions.length);
    await type("Valid query, missing required field");
    await phone.locator("#enter").click();
    await tv.waitForFunction(() => invalids > 0);
    await settled();
    assert.equal(await tv.evaluate(() => submissions.length), before);
    await focus("canceled");
    const keys = await tv.evaluate(() => events.length);
    await type("Canceled by the website");
    await phone.locator("#enter").click();
    await tv.waitForFunction(before => events.length > before, keys);
    await settled();
    assert.equal(await tv.evaluate(() => submissions.length), before);
  });
  await record("textarea Enter inserts one native newline; phone keyboard does not duplicate it", async () => {
    const lines = await focus("lines");
    await type("Pasted\nlines");
    await phone.locator("#editor").press("Enter");
    await tv.waitForFunction(() => document.querySelector("#lines").value === "Pasted\nlines\n");
    await settled();
    assert.equal(await lines.inputValue(), "Pasted\nlines\n");
    assert.equal(await phone.locator("#editor").inputValue(), "Pasted\nlines\n");
  });
  await record("contenteditable Enter follows native newline rules", async () => {
    await focus("editable");
    await type("Editable");
    await phone.locator("#enter").click();
    await phone.waitForFunction(() => state.editable?.ready && state.editable.text.includes("\n")
      && !enterIntent && !busy);
    assert.ok((await tv.locator("#editable").innerText()).startsWith("Editable\n"));
    assert.equal(await tv.evaluate(() => events.at(-1).trusted), true);
  });
  await record("equal-text action change rotates identity; stale action rejects", async () => {
    await focus("search");
    const old = await phone.evaluate(() => ({ editable: state.editable.revision,
      version: state.editable.version, action: state.editable.action }));
    await tv.evaluate(() => document.querySelector("#search").enterKeyHint = "send");
    await phone.waitForFunction(old => state.editable?.ready && state.editable.revision !== old
      && state.editable.action === "send", old.editable);
    const count = await tv.evaluate(() => events.length);
    assert.equal(await phone.evaluate(old => command("edit", { ...old, edit: "enter" }), old), false);
    assert.equal(await tv.evaluate(() => events.length), count);
  });
  await record("cross-origin focused frame receives native search", async () => {
    await focus("frame", "#frameSearch", true);
    await type("Cross-origin héllo 🌍");
    await phone.locator("#enter").click();
    await tv.waitForFunction(() => submissions.at(-1)?.id === "frame"
      && submissions.at(-1).text === "Cross-origin héllo 🌍" && submissions.at(-1).trusted);
    await settled();
  });
  await record("password field cannot enable or dispatch Enter", async () => {
    await focus("password");
    await phone.waitForFunction(() => !state.editable && !busy);
    assert.equal(await phone.locator("#enter").isDisabled(), true);
    assert.equal(await phone.evaluate(() => requestEnter()), false);
  });
  console.log("PASS: paired phone Enter native integration");
} finally {
  await pb.close();
  await tb.close();
}
