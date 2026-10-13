// Paired emulator acceptance when the normal TV process has no DevTools socket.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const [pw, tvSerial, tvAvd, phoneSerial, phoneAvd, origin, driver, phoneDriver, output,
  port = '9323', mode = 'stock'] = process.argv.slice(2);
assert.ok(['stock', 'phone-ime'].includes(mode));
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
const originalIme = mode === 'phone-ime'
  ? adb(phoneSerial, 'shell', 'settings', 'get', 'secure', 'default_input_method').trim() : null;
const originalTvIme = mode === 'phone-ime'
  ? adb(tvSerial, 'shell', 'settings', 'get', 'secure', 'default_input_method').trim() : null;
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
  async function waitForLayout(requireKeyboard) {
    const deadline = Date.now() + 6000;
    let previous, stableSince = Date.now();
    while (Date.now() < deadline) {
      const current = await phone.evaluate(() => JSON.stringify({ revision: state.revision,
        field: state.editable?.revision, ready: state.editable?.ready, width: state.width, height: state.height }));
      if (current !== previous) { previous = current; stableSince = Date.now(); }
      const ime = requireKeyboard ? adb(tvSerial, 'shell', 'dumpsys', 'input_method') : '';
      const shown = !requireKeyboard || (ime.includes('mInputShown=true') && ime.includes('mWindowVisible=true'));
      if (shown && JSON.parse(current).ready !== false && Date.now() - stableSince >= 500) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw Error('TV keyboard and field ownership must settle before phone input');
  }
  await waitForLayout(false);
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
    const target = nodes.find(n => n.identifier === (name === 'frame' ? 'frameSearch' : name)
      && n.kind === 'text-field' && n.editable);
    assert.ok(target && (name === 'password' || !target.password)
      && target.rect.width > 0 && target.rect.height > 0);
    const webView = nodes.find(n => n.kind === 'webview');
    const point = { x: target.rect.x + target.rect.width / 2 - webView.rect.x,
      y: target.rect.y + target.rect.height / 2 - webView.rect.y };
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
    // Wait for the TV IME's opening layout, which rotates browser ownership.
    await waitForLayout(true);
    await phone.locator('#showKeyboard').click();
    await phone.waitForFunction(() => state.editable?.phoneTyping && state.editable.ready && !busy);
    const yielded = adb(tvSerial, 'shell', 'dumpsys', 'input_method');
    assert.ok(yielded.includes('mInputShown=false') && yielded.includes('mWindowVisible=false'),
      'TV keyboard yields before phone editing');
    await settled();
    return await phone.evaluate(() => ({ action: state.editable.action, composing: state.editable.composing }));
  }
  const cases = mode === 'phone-ime' ? ['search']
    : ['search', 'plain', 'js', 'textareaSearch', 'lines', 'editable', 'frame', 'validation', 'canceled', 'password'];
  for (const name of cases) {
    const metadata = await focus(name);
    if (mode === 'phone-ime') {
      const fixtureIme = 'org.bravetv.remoteime.test/.RemoteIme';
      for (const serial of [phoneSerial]) {
        assert.match(adb(serial, 'shell', 'pm', 'path', 'org.bravetv.remoteime.test'), /^package:/);
        adb(serial, 'shell', 'ime', 'enable', fixtureIme);
        adb(serial, 'shell', 'ime', 'set', fixtureIme);
      }
      await waitForLayout(false);
      await settled();
      execFileSync('python3', [resolve(phoneDriver), 'press', 'id="editor"', '--settle'],
        { encoding: 'utf8', timeout: 15000 });
      function pressIme(label) {
        const ime = adb(phoneSerial, 'shell', 'dumpsys', 'input_method');
        assert.ok(ime.includes('Input method service state for org.bravetv.remoteime.test.RemoteIme')
          && ime.includes('mInputShown=true') && ime.includes('mWindowVisible=true'));
        const native = JSON.parse(execFileSync('python3', [resolve(phoneDriver), 'snapshot', '--json'],
          { encoding: 'utf8', timeout: 15000 }));
        assert.ok(native.success && !native.data.truncated);
        const button = native.data.nodes.find(n => n.label === label && n.visibleToUser && n.enabled
          && n.bundleId === 'org.bravetv.remoteime.test');
        assert.ok(button, 'Visible owned InputConnection stimulus required');
        // agent-device incorrectly treats the IME's own buttons as covered by that IME.
        adb(phoneSerial, 'shell', 'input', 'tap',
          String(Math.round(button.rect.x + button.rect.width / 2)),
          String(Math.round(button.rect.y + button.rect.height / 2)));
      }
      pressIme('Compose Japanese');
      await phone.waitForFunction(() => composing && state.editable?.ready && state.editable.composing
        && state.editable.text === '日本' && !dirty && !pendingEdit && !busy);
      assert.equal(await phone.locator('#enter').isDisabled(), true);
      assert.equal(await phone.evaluate(() => requestEnter()), false);
      assert.deepEqual(await phone.evaluate(async () => {
        const e = state.editable;
        const before = seq;
        const accepted = await command('edit', { edit: 'enter', editable: e.revision, version: e.version, action: e.action });
        return { accepted, sent: seq === before + 1, connected };
      }), { accepted: false, sent: true, connected: true }, 'Native Enter rejects active composition');
      pressIme('Commit Japanese');
      await phone.waitForFunction(() => !composing && !state.editable.composing && state.editable.ready
        && state.editable.text === '日本' && !dirty && !pendingEdit && !busy);
      const committed = await report(r => r.text === '日本');
      assert.equal(committed.events.length, 0);
      assert.equal(committed.submissions.length, 0, 'Commit alone cannot submit');
      pressIme('Send keyboard action');
      await report(r => r.events.length === 1 && r.events[0].trusted
        && r.submissions.length === 1 && r.submissions[0].text === '日本');
      await settled();
      await new Promise(resolve => setTimeout(resolve, 500));
      const final = await report(() => true);
      assert.equal(final.events.length, 1);
      assert.equal(final.submissions.length, 1);
      results.push({ name: 'phone InputConnection composition, commit and keyboard Search', passed: true,
        metadata, observed: final });
      await writeFile(output, JSON.stringify({ tvAvd, phoneAvd, results }, null, 2));
      console.log('PASS: genuine phone InputConnection composition/commit/Search with native composition rejection');
      continue;
    }
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
} finally {
  try {
    if (originalIme) adb(phoneSerial, 'shell', 'ime', 'set', originalIme);
  } finally {
    try {
      if (originalTvIme) adb(tvSerial, 'shell', 'ime', 'set', originalTvIme);
    } finally { await browser.close(); }
  }
}
