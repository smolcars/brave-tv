// Paired emulator acceptance when the normal TV process has no DevTools socket.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const [pw, tvSerial, tvAvd, phoneSerial, phoneAvd, origin, driver, phoneDriver, output, port = '9323'] = process.argv.slice(2);
assert.match(origin, /^http:\/\/10\.0\.2\.\d+:\d+$/);
assert.match(port, /^\d+$/);
assert.ok(Number(port) >= 1024 && Number(port) <= 65535);
assert.ok(driver && phoneDriver && output && tvAvd && phoneAvd);
assert.notEqual(tvSerial, phoneSerial);
const adb = (serial, ...args) => execFileSync('adb', ['-s', serial, ...args], { encoding: 'utf8', timeout: 15000 });
for (const [serial, avd] of [[tvSerial, tvAvd], [phoneSerial, phoneAvd]]) {
  assert.match(serial, /^emulator-\d+$/);
  assert.equal(adb(serial, 'emu', 'avd', 'name').replace(/\r/g, '').trim(), avd + '\nOK');
}
assert.ok(adb(phoneSerial, 'forward', '--list').split(/\r?\n/).includes(
  `${phoneSerial} tcp:${port} localabstract:chrome_devtools_remote`));
const { chromium } = createRequire(resolve(pw, 'package.json'))('playwright-core');
const browser = await chromium.connectOverCDP('http://127.0.0.1:' + port);
const results = [];
try {
  const pages = browser.contexts().flatMap(c => c.pages()).filter(p => p.url() === origin + '/');
  assert.equal(pages.length, 1, 'Require one exact paired companion');
  const [phone] = pages;
  phone.setDefaultTimeout(6000);
  await phone.waitForFunction(() => connected && !busy && !state.paused);
  const served = await phone.evaluate(async () => (await fetch('/remote.js')).text());
  const source = await readFile('brave/android/java/brave-res/raw/tv_remote_js.js');
  const hash = value => createHash('sha256').update(value).digest('hex');
  assert.equal(hash(served), hash(source), 'Packaged companion matches source');
  const settled = () => phone.waitForFunction(() => connected && !busy && !dirty
    && !pendingEdit && !enterIntent && state?.editable?.ready);
  const runId = Date.now().toString(36);
  let run;
  async function report(predicate) {
    const deadline = Date.now() + 7000;
    let last;
    while (Date.now() < deadline) {
      const response = await fetch('http://127.0.0.1:18088/enter-report?run=' + run,
        { signal: AbortSignal.timeout(1000) });
      if (response.ok) last = await response.json();
      if (last && predicate(last)) return last;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('Owned fixture report did not satisfy assertion: ' + JSON.stringify(last));
  }
  async function focus(name) {
    run = runId + '-' + name.toLowerCase();
    const url = 'http://10.0.2.2:18088/phone-enter.html?case=' + name + '&run=' + run;
    if (await phone.locator('#editor').isVisible()) await phone.locator('#editor').blur();
    assert.ok(await phone.evaluate(url => command('navigate', { text: url }), url));
    await phone.waitForFunction(url => connected && !busy && !state.paused && state.page
      && state.url === url && !state.editable, url);
    await report(r => r.events.length === 0 && r.submissions.length === 0 && r.active === '');
    let native;
    try { native = JSON.parse(execFileSync('python3', [resolve(driver), 'snapshot', '--json'],
      { encoding: 'utf8', timeout: 15000 })); } catch { throw Error('Owned native snapshot unavailable'); }
    assert.ok(native.success && !native.data.truncated);
    assert.equal(native.data.appBundleId, 'com.brave.browser_default');
    const nodes = native.data.nodes.filter(n => n.visibleToUser);
    assert.ok(nodes.some(n => n.kind === 'webview'));
    assert.ok(nodes.some(n => n.label === 'Native phone Enter fixture'));
    const target = nodes.find(n => n.kind === 'text-field' && n.editable);
    assert.ok(target && (name === 'password' || !target.password)
      && target.rect.width > 0 && target.rect.height > 0);
    const point = { x: target.rect.x + target.rect.width / 2, y: target.rect.y + target.rect.height / 2 };
    let focused = false;
    for (let attempt = 0; attempt < 8 && !focused; attempt++) {
      await phone.waitForFunction(url => connected && !busy && !state.paused && !state.loading
        && state.url === url, url);
      focused = await phone.evaluate(async p => await command('move', {
        dx: Math.round(p.x - state.x), dy: Math.round(p.y - state.y) }) && await command('click'), point);
    }
    assert.ok(focused, 'Native pointer commands must be accepted');
    if (name === 'password') {
      await phone.waitForFunction(() => !state.editable && !busy);
      await report(r => r.active === name);
      return;
    }
    await phone.waitForFunction(() => state.editable?.ready && !busy);
    if (name !== 'frame') await report(r => r.active === name);
    if (await phone.locator('#editor').isHidden()) await phone.locator('#showKeyboard').click();
    await settled();
    return await phone.evaluate(() => ({ action: state.editable.action, composing: state.editable.composing }));
  }
  for (const name of ['search', 'plain', 'js', 'textareaSearch', 'lines', 'editable', 'frame', 'validation', 'canceled', 'password']) {
    const metadata = await focus(name);
    if (name === 'password') {
      assert.equal(await phone.locator('#enter').isDisabled(), true);
      assert.equal(await phone.evaluate(() => requestEnter()), false);
      results.push({ name, passed: true });
      await writeFile(output, JSON.stringify({ tvAvd, phoneAvd, results }, null, 2));
      console.log('PASS: password excludes phone Enter');
      continue;
    }
    if (['plain', 'lines'].includes(name)) assert.equal(metadata.action, 'enter');
    const text = `Native ${name} ${runId} héllo हिन्दी 🌍`;
    await phone.locator('#editor').fill(text);
    // Native accessibility avoids CDP's stale hit testing during Android IME panning.
    const nativePhone = JSON.parse(execFileSync('python3', [resolve(phoneDriver), 'snapshot', '--json'],
      { encoding: 'utf8', timeout: 15000 }));
    assert.ok(nativePhone.success && !nativePhone.data.truncated);
    assert.equal(nativePhone.data.appBundleId, 'com.brave.browser_default');
    assert.ok(nativePhone.data.nodes.some(n => n.identifier?.endsWith(':id/url_bar')
      && n.label === new URL(origin).host));
    const enter = nativePhone.data.nodes.find(n => n.identifier === 'enter' && n.visibleToUser && n.enabled);
    assert.ok(enter, 'Visible enabled phone field action required');
    execFileSync('python3', [resolve(phoneDriver), 'press', '@' + enter.ref, '--settle'],
      { encoding: 'utf8', timeout: 15000 });
    const observed = await report(r => (name === 'frame' ? r.submissions.length === 1
      && r.submissions[0].id === 'frame' && r.submissions[0].text === text && r.submissions[0].trusted
      : r.events.length === 1 && r.events[0].id === name
      && r.events[0].trusted && (name === 'validation' ? r.invalids === 1
        : name === 'canceled' ? r.submissions.length === 0
        : name === 'lines' ? r.text === text + '\n'
        : name === 'editable' ? r.text.startsWith(text + '\n')
        : r.submissions.length === 1 && r.submissions[0].id === name && r.submissions[0].text === text)));
    await settled();
    await new Promise(resolve => setTimeout(resolve, 500));
    const final = await report(() => true);
    assert.equal(final.events.length, observed.events.length, 'No additional native Enter after acknowledgement');
    assert.equal(final.submissions.length, observed.submissions.length, 'No additional submission after acknowledgement');
    assert.equal(final.invalids, observed.invalids);
    if (name === 'canceled' || name === 'validation') assert.equal(observed.submissions.length, 0);
    if (name === 'lines') assert.equal(await phone.locator('#editor').inputValue(), text + '\n');
    results.push({ name, passed: true, metadata, observed: final });
    await writeFile(output, JSON.stringify({ tvAvd, phoneAvd, results }, null, 2));
    console.log(`PASS: paired native ${name} Enter`);
  }
} finally { await browser.close(); }
