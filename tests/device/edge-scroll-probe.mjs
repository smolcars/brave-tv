// Usage: node edge-scroll-probe.mjs EMULATOR_SERIAL AGENT_DRIVER.py NORMAL_SCREENSHOT.png
// Start the normal edge-scroll.html fixture with Browse page focused in Browser controls.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

const [serial, driver, screenshot] = process.argv.slice(2);
assert.match(serial ?? '', /^emulator-\d+$/, 'Emulator-only input regression');
assert.ok(driver && screenshot, 'Exact agent-device driver and normal screenshot required');
const adb = (...args) => execFileSync('adb', ['-s', serial, ...args],
  { encoding: 'utf8', timeout: 20000 });
assert.deepEqual(adb('emu', 'avd', 'name').trim().split(/\r?\n/), ['brave_tv_clean_api36', 'OK']);
assert.equal(adb('shell', 'wm', 'size').trim(), 'Physical size: 1920x1080');
assert.equal(adb('shell', 'wm', 'density').trim(), 'Physical density: 320');
assert.equal(adb('shell', 'settings', 'get', 'secure', 'default_input_method').trim(),
  'com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME',
  'Restore the stock TV keyboard after opening the app');
assert.ok(adb('forward', '--list').split('\n').some(line =>
  line.trim() === `${serial} tcp:9222 localabstract:chrome_devtools_remote`));
const agent = (...args) => JSON.parse(execFileSync('python3', [resolve(driver), ...args, '--json'],
  { encoding: 'utf8', timeout: 45000 }));
const snapshot = () => {
  const reply = agent('snapshot');
  assert.ok(reply.success && !reply.data.truncated, 'Complete native snapshot required');
  return reply.data.nodes;
};
const url = 'http://127.0.0.1:18089/edge-scroll.html';
const controls = snapshot();
assert.ok(controls.some(n => n.label === 'Browser controls'));
assert.ok(controls.some(n => n.label === url), 'Exact normal fixture controls required');
assert.ok(!controls.some(n => /private browsing/i.test(n.label ?? '')));
assert.ok(controls.some(n => n.label === 'Browse page' && n.focused));
const pages = await (await fetch('http://127.0.0.1:9222/json/list',
  { signal: AbortSignal.timeout(5000) })).json();
const matches = pages.filter(p => p.type === 'page' && p.url === url);
assert.equal(matches.length, 1, 'Unique fixture target required');
const socket = new WebSocket(matches[0].webSocketDebuggerUrl);
await new Promise((yes, no) => {
  const timer = setTimeout(() => { socket.close(); no(new Error('CDP open timed out')); }, 10000);
  socket.addEventListener('open', () => { clearTimeout(timer); yes(); }, { once: true });
  socket.addEventListener('error', error => { clearTimeout(timer); no(error); }, { once: true });
});
let request = 0;
const read = () => new Promise((yes, no) => {
  const id = ++request;
  const finish = (error, value) => {
    clearTimeout(timer); socket.removeEventListener('message', message);
    error ? no(error) : yes(value);
  };
  const timer = setTimeout(() => finish(new Error('Fixture read timed out')), 10000);
  const message = ({ data }) => {
    const reply = JSON.parse(data);
    if (reply.id !== id) return;
    if (reply.error || reply.result.exceptionDetails) finish(new Error('Fixture read failed'));
    else finish(null, reply.result.result.value);
  };
  socket.addEventListener('message', message);
  // Observation only: page interactions below use real non-alphabetic remote input.
  socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: {
    expression: `({...checks,documentTime:performance.timeOrigin,scrollY,
      nestedY:document.getElementById('nested').scrollTop,
      nestedX:document.getElementById('nested').scrollLeft,
      fullscreen:!!document.fullscreenElement,scale:devicePixelRatio,
      width:innerWidth,height:innerHeight,bounds:Object.fromEntries(
        ['nested','fullscreen'].map(id=>{const {x,y,width,height}=
          document.getElementById(id).getBoundingClientRect();return [id,{x,y,width,height}];}))})`,
    returnByValue: true,
  } }));
});
let initial;
try {
  initial = await read();
  assert.equal(initial.width * initial.scale, 1920);
  assert.equal(initial.height * initial.scale, 1080);
  assert.equal(initial.scrollY + initial.nestedX + initial.nestedY
    + initial.topClicks + initial.bottomClicks, 0, 'Fresh fixture required');
} catch (error) {
  socket.close();
  throw error;
}
const remote = spawn('adb', ['-s', serial, 'shell', 'uinput', '-'],
  { stdio: ['pipe', 'pipe', 'pipe'] });
let output = '', errors = '', ended = false, token = 0;
remote.stdout.on('data', data => { output += data; });
remote.stderr.on('data', data => { errors += data; });
remote.on('error', error => { errors += error.message; ended = true; });
remote.on('exit', () => { ended = true; });
const watchdog = setTimeout(() => { socket.close(); remote.kill('SIGKILL'); }, 120000);
const send = (command, fields = {}) => remote.stdin.write(JSON.stringify({ id: 1, command, ...fields }) + '\n');
const key = (code, down) => send('inject', { events: [1, code, down ? 1 : 0, 0, 0, 0] });
const delay = duration => send('delay', { duration });
const tap = code => { key(code, true); delay(50); key(code, false); delay(40); };
const sync = async () => {
  const name = `edge-${++token}`;
  send('sync', { syncToken: name });
  const deadline = Date.now() + 10000;
  while (!output.includes(name)) {
    assert.ok(!ended && Date.now() < deadline, `Remote sync failed: ${errors}`);
    await new Promise(yes => setTimeout(yes, 25));
  }
};
const move = async (code, count) => {
  for (let i = 0; i < count; ++i) tap(code);
  await sync();
};
const hold = async (code, duration) => {
  key(code, true); delay(duration); key(code, false); delay(300); await sync();
};
const state = async check => {
  const deadline = Date.now() + 5000;
  for (;;) {
    const value = await read();
    assert.equal(value.documentTime, initial.documentTime, 'Document must survive every interaction');
    if (check(value)) return value;
    assert.ok(Date.now() < deadline, `Fixture condition failed: ${JSON.stringify(value)}`);
    await new Promise(yes => setTimeout(yes, 25));
  }
};
const focus = async label => {
  const deadline = Date.now() + 5000;
  while (!snapshot().some(n => n.focused && n.label === label)) {
    assert.ok(Date.now() < deadline, `Native focus required: ${label}`);
    await new Promise(yes => setTimeout(yes, 25));
  }
};
const pageOwnsInput = async () => {
  const deadline = Date.now() + 5000;
  while (snapshot().some(n => n.label === 'Browser controls')) {
    assert.ok(Date.now() < deadline, 'Browse must dismiss controls');
    await new Promise(yes => setTimeout(yes, 25));
  }
};
const report = (check, value) => console.log(JSON.stringify({ check, ...value }));
const cursor = (name, x, y) => {
  const path = `${resolve(screenshot)}.${name}.png`;
  assert.ok(agent('screenshot', path).success, 'Normal cursor screenshot required');
  console.log(execFileSync('java', [resolve('tests/device/CursorScreenshot.java'), path,
    String(x), String(y)], { encoding: 'utf8', timeout: 20000 }).trim());
};
const still = async before => {
  delay(650); await sync();
  const after = await read();
  assert.equal(after.scrollY, before.scrollY, 'Release/idle must not scroll');
};
const scrollWhileHeld = async (code, before) => {
  key(code, true); delay(750); await sync();
  const first = await state(s => s.scrollY > before);
  delay(250); await sync();
  const second = await state(s => s.scrollY > first.scrollY && s.wheels > first.wheels);
  return second;
};
const clickEdge = async id => {
  const name = `${id}Clicks`;
  const before = (await read())[name];
  key(353, true); delay(1000); await sync();
  assert.equal((await read())[name], before, 'Held OK must not click before release');
  key(353, false); delay(300); await sync();
  return state(s => s[name] === before + 1);
};
try {
  send('register', { name: 'Brave TV edge regression', vid: 4660, pid: 1, bus: 'usb',
    configuration: [{ type: 100, data: [1] }, { type: 101, data: [103, 108, 105, 106, 353, 158] }] });
  delay(1500); await sync();
  tap(353); await sync();
  await pageOwnsInput();
  await move(103, 40);
  await move(108, 40);
  cursor('bottom', 960, 1079);
  let value = await read();
  assert.equal(value.scrollY, 0, 'Tapping to the edge must not scroll');
  await still(value);
  await hold(108, 250);
  assert.equal((await read()).scrollY, 0, 'Brief outward hold must not scroll');
  await move(103, 1); await move(108, 1);
  value = await clickEdge('bottom');
  assert.equal(value.scrollY, 0, 'Bottom edge button must remain clickable');
  report('edge arrival / idle / grace / bottom button', value);
  await scrollWhileHeld(108, 0);
  key(108, false); delay(300); await sync();
  value = await read();
  const downY = value.scrollY;
  await still(value);
  tap(103); await sync();
  cursor('reverse', 960, 1047);
  value = await read();
  assert.equal(value.scrollY, downY, 'Reverse moves pointer without scrolling');
  report('hold down / release / reverse', value);
  await move(103, 40);
  cursor('top', 960, 0);
  value = await read();
  assert.equal(value.scrollY, downY, 'Arriving at top must not scroll');
  await move(108, 1); await move(103, 1);
  value = await clickEdge('top');
  assert.equal(value.scrollY, downY, 'Sticky top button must remain clickable');
  await hold(103, 2000);
  value = await state(s => s.scrollY === 0);
  await still(value);
  report('top button / hold up / document boundary', value);
  await move(108, 15);
  tap(158); await sync(); await focus('Browse page');
  tap(108); tap(106); tap(106); await sync(); await focus('More controls');
  tap(353); await sync(); await focus('History');
  tap(108); tap(106); await sync(); await focus('Scroll here');
  tap(353); await sync();
  await hold(108, 600); await hold(106, 600);
  value = await state(s => s.nestedX > 0 && s.nestedY > 0);
  assert.equal(value.scrollY, 0, 'Secondary scrolling must target the nested box');
  tap(353); await sync();
  assert.equal((await read()).topClicks + (await read()).bottomClicks, 2,
    'Returning to Browse must not click');
  report('nested vertical / horizontal fallback', value);
  const button = value.bounds.fullscreen;
  // Anchored at the top edge, then moved15 native32px steps into the nested box.
  const current = { x: 480, y: 240 };
  const dx = Math.round(((button.x + button.width / 2) - current.x) * value.scale / 32);
  const dy = Math.round(((button.y + button.height / 2) - current.y) * value.scale / 32);
  await move(dx < 0 ? 105 : 106, Math.abs(dx));
  await move(dy < 0 ? 103 : 108, Math.abs(dy));
  await hold(353, 100);
  await state(s => s.fullscreen);
  await move(108, 40);
  value = await read(); assert.equal(value.scrollY, 0);
  await scrollWhileHeld(108, 0);
  const capture = agent('screenshot', resolve(screenshot));
  assert.ok(capture.success, 'Normal fullscreen fixture screenshot required');
  key(103, true); delay(80); key(103, false); key(108, false); delay(300); await sync();
  cursor('fullscreen-reverse', 1632, 1047);
  value = await state(s => s.fullscreen && s.scrollY > 0);
  await still(value);
  report('fullscreen edge scrolling / active reversal', value);
  tap(158); await sync(); await state(s => !s.fullscreen);
  tap(158); await sync();
  assert.ok(snapshot().some(n => n.label === 'Browser controls'), 'Back returns to controls');
  report('Back returns to controls', { passed: true });
} finally {
  key(103, false); key(108, false); key(106, false); key(353, false);
  remote.stdin.end(); remote.kill('SIGTERM');
  clearTimeout(watchdog); socket.close();
}
