// Focus the normal fixture's plain field through native input before running.
// Stock-TV-IME smoke only; phone-native-probe retains the complete strict suite.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const { chromium } = createRequire(resolve(process.argv[2], "package.json"))(
  "playwright-core",
);
const [serial, avd, phoneSerial, phoneAvd] = process.argv.slice(3);
assert.match(serial, /^emulator-\d+$/);
assert.match(phoneSerial, /^emulator-\d+$/);
assert.notEqual(serial, phoneSerial);
assert.ok(avd, "Provide the verified TV AVD identity");
assert.ok(phoneAvd, "Provide the verified phone AVD identity");
const adb = (...args) => execFileSync("adb", ["-s", serial, ...args], {
  encoding: "utf8", timeout: 15000,
});
assert.equal(adb("emu", "avd", "name").replace(/\r/g, "").trim(), avd + "\nOK");
assert.equal(adb("shell", "settings", "get", "secure", "default_input_method").trim(),
  "com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME");
assert.ok(adb("forward", "--list").split(/\r?\n/).includes(
  serial + " tcp:9222 localabstract:chrome_devtools_remote"));
const phoneAdb = (...args) => execFileSync("adb", ["-s", phoneSerial, ...args], {
  encoding: "utf8", timeout: 15000,
});
assert.equal(phoneAdb("emu", "avd", "name").replace(/\r/g, "").trim(), phoneAvd + "\nOK");
assert.ok(phoneAdb("forward", "--list").split(/\r?\n/).includes(
  phoneSerial + " tcp:9223 localabstract:chrome_devtools_remote"));
const tb = await chromium.connectOverCDP("http://127.0.0.1:9222");
const pb = await chromium.connectOverCDP("http://127.0.0.1:9223");
try {
  const phones = pb.contexts()[0].pages().filter((p) => /^http:\/\/10\.0\.2\./.test(p.url()));
  assert.equal(phones.length, 1, "Require one companion target");
  const phone = phones[0];
  phone.setDefaultTimeout(5000);
  const url = "http://10.0.2.2:18088/phone-remote.html";
  await phone.waitForFunction((url) => connected && !state.paused && state.page &&
    state.url === url && state.editable?.ready && !busy, url);
  const targets = tb.contexts()[0].pages().filter((p) => p.url() === url);
  assert.equal(targets.length, 1, "Require one exact authenticated normal fixture target");
  const tv = targets[0];
  tv.setDefaultTimeout(5000);
  assert.equal(await tv.evaluate(() => document.activeElement.id), "plain");
  await tv.waitForFunction(() => visualViewport.height < innerHeight - 1);
  await phone.waitForFunction(() => connected && !state.paused && state.editable?.ready && !busy);
  const field = await phone.evaluate(() => state.editable.revision);
  if (await phone.locator("#editor").isHidden()) await phone.locator("#showKeyboard").click();
  async function settled(text) {
    await phone.waitForFunction(
      ({ field, text }) => state?.editable?.ready && state.editable.revision === field &&
        state.editable.text === text && !busy && !dirty && !pendingEdit,
      { field, text },
    );
    assert.ok(await tv.locator("#plain").inputValue() === text,
      "Native fixture text did not match the synthetic replacement");
  }
  const text = "héllo हिन्दी 🌍";
  for (let i = 0; i < 10; i++) {
    for (const replacement of ["hello", text]) {
      await phone.locator("#editor").fill(replacement);
      await settled(replacement);
    }
  }
  for (const composing of [true, false]) {
    const before = await tv.evaluate(() => {
      const count = (type) => window.events.filter((e) => e.id === "plain" && e.type === type).length;
      return { start: count("compositionstart"), end: count("compositionend"), input: count("input") };
    });
    assert.ok(await phone.evaluate(async (composing) => {
      const e = state.editable;
      return command("edit", {
        editable: e.revision, version: e.version, edit: "replace", text: e.text,
        start: e.text.length, end: e.text.length, composing,
      });
    }, composing));
    await settled(text);
    await tv.waitForFunction(({ before, composing }) => {
      const count = (type) => window.events.filter((e) => e.id === "plain" && e.type === type).length;
      return count("input") > before.input &&
        (composing ? count("compositionstart") > before.start :
          before.start === before.end || count("compositionend") > before.end);
    }, { before, composing });
  }
  assert.equal(await tv.evaluate(() => {
    const events = window.events.filter((e) => e.id === "plain");
    return events.filter((e) => e.type === "compositionstart").length ===
      events.filter((e) => e.type === "compositionend").length;
  }), true, "Native composition must be ended after the noncomposing replacement");
  console.log("PASS: stock TV IME, twenty native Unicode replacements, equal-text input acknowledgement, completed composition and stable field identity");
} finally {
  await pb.close();
  await tb.close();
}
