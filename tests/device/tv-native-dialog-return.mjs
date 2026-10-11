// Start the normal dialogs.html fixture with Browser controls' Page cursor focused.
// Usage: node tv-native-dialog-return.mjs EMULATOR_SERIAL AGENT_DRIVER.py NORMAL_SCREENSHOT.png
// AGENT_DRIVER must retain device_open's launcher, config/session and private daemon credentials.
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';

const [serial, driver, screenshot] = process.argv.slice(2);
assert.match(serial ?? '', /^emulator-\d+$/, 'Emulator-only native input fixture');
assert.ok(driver, 'Explicit agent-device driver required');
assert.ok(screenshot, 'Explicit normal-fixture cursor screenshot required');
const adb = (...args) => execFileSync('adb', ['-s', serial, ...args],
  { encoding: 'utf8', timeout: 20000 });
assert.deepEqual(adb('emu', 'avd', 'name').trim().split(/\r?\n/), ['brave_tv_clean_api36', 'OK']);
assert.equal(adb('shell', 'wm', 'size').trim(), 'Physical size: 1920x1080');
assert.equal(adb('shell', 'wm', 'density').trim(), 'Physical density: 320');
assert.equal(adb('shell', 'settings', 'get', 'system', 'font_scale').trim(), '1.0');
assert.ok(adb('forward', '--list').split('\n').some(line =>
  line.trim() === `${serial} tcp:9222 localabstract:chrome_devtools_remote`));
const snapshot = () => {
  const reply = JSON.parse(execFileSync('python3', [resolve(driver), 'snapshot', '--json'],
    { encoding: 'utf8', timeout: 20000 }));
  assert.ok(reply.success && !reply.data.truncated, 'Complete native snapshot required');
  return reply.data.nodes;
};
const focus = label => assert.ok(snapshot().some(n => n.focused && n.label === label),
  `Expected native focus: ${label}`);
const modal = (message, label) => {
  assert.ok(snapshot().some(n => n.label === message), 'Exact synthetic native dialog required');
  focus(label);
};
focus('Page cursor');
const url = 'http://10.0.2.2:18088/dialogs.html';
assert.ok(snapshot().some(n => n.label === url), 'Controls must belong to the exact fixture');
const pages = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const page = pages.find(p => p.type === 'page' && p.url === url);
assert.ok(page, 'Exact normal synthetic fixture required');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((yes, no) => {
  const timeout = setTimeout(() => { socket.close(); no(new Error('CDP open timed out')); }, 10000);
  socket.addEventListener('open', () => { clearTimeout(timeout); yes(); }, { once: true });
  socket.addEventListener('error', error => { clearTimeout(timeout); no(error); }, { once: true });
});
let request = 0;
const read = () => new Promise((yes, no) => {
  const id = ++request;
  const timeout = setTimeout(() => finish(new Error('Fixture read timed out')), 10000);
  const finish = (error, value) => {
    clearTimeout(timeout); socket.removeEventListener('message', message);
    error ? no(error) : yes(value);
  };
  const message = ({ data }) => {
    const reply = JSON.parse(data);
    if (reply.id !== id) return;
    if (reply.error || reply.result.exceptionDetails) finish(new Error('Fixture read failed'));
    else finish(null, reply.result.result.value);
  };
  socket.addEventListener('message', message);
  // Read-only observation: all page actions below use native remote events.
  socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: {
    expression: '({documentTime:performance.timeOrigin,result:document.querySelector("#result").textContent})',
    returnByValue: true,
  } }));
});
const initial = await read();
const remote = spawn('adb', ['-s', serial, 'shell', 'uinput', '-'],
  { stdio: ['pipe', 'pipe', 'pipe'] });
const watchdog = setTimeout(() => { socket.close(); remote.kill('SIGKILL'); process.exitCode = 1; }, 90000);
let output = '', errors = '', ended = false, exitCode;
remote.stdout.on('data', data => { output += data; });
remote.stderr.on('data', data => { errors += data; });
remote.on('error', error => { errors += error.message; ended = true; });
remote.on('exit', code => { ended = true; exitCode = code; });
const send = (command, fields = {}) => remote.stdin.write(JSON.stringify({ id: 1, command, ...fields }) + '\n');
const key = (code, down) => send('inject', { events: [1, code, down ? 1 : 0, 0, 0, 0] });
const tap = code => { key(code, true); key(code, false); send('delay', { duration: 40 }); };
let token = 0;
const sync = async () => {
  const name = `dialog-${++token}`;
  send('sync', { syncToken: name });
  const deadline = Date.now() + 10000;
  while (!output.includes(name)) {
    assert.ok(!ended && Date.now() < deadline, `Native remote failed: ${errors}`);
    await new Promise(yes => setTimeout(yes, 25));
  }
};
const click = async () => {
  key(353, true); send('delay', { duration: 1000 }); key(353, false);
  send('delay', { duration: 300 }); await sync();
};
const move = async (code, count) => {
  for (let i = 0; i < count; ++i) tap(code);
  await sync();
};
const result = async expected => {
  const state = await read();
  assert.equal(state.documentTime, initial.documentTime, 'Native UI recreated the document');
  assert.equal(state.result, expected);
  console.log(JSON.stringify({ check: expected, pageId: page.id, documentTime: state.documentTime }));
};
try {
  send('register', { name: 'Brave TV native dialog fixture', vid: 4660, pid: 1, bus: 'usb',
    configuration: [{ type: 100, data: [1] }, { type: 101, data: [103, 108, 105, 106, 353, 158] }] });
  send('delay', { duration: 1500 });
  tap(353); // Activate page input at 960×540; density320 means a32px directional step.
  await move(105, 24);
  await click(); modal('TV alert: close this dialog with the remote.', 'OK');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_CENTER');
  await result('Alert closed');
  await move(106, 9); await click(); modal('TV confirmation: accept or cancel.', 'Cancel');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT'); focus('OK');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_LEFT'); focus('Cancel');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_CENTER');
  await result('Confirm: false');
  await click(); modal('TV confirmation: accept or cancel.', 'Cancel');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_RIGHT'); focus('OK');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_CENTER');
  await result('Confirm: true');
  await move(106, 7); await click();
  assert.ok(snapshot().some(n => n.label === 'TV prompt: edit or cancel.'),
    'Exact synthetic prompt required');
  assert.ok(snapshot().some(n => n.focused && n.editable && !n.password),
    'Native prompt must focus its genuine editor');
  adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
  if (snapshot().some(n => n.editable)) adb('shell', 'input', 'keyevent', 'KEYCODE_BACK');
  await result('Prompt canceled');
  await move(105, 7); await click(); modal('TV confirmation: accept or cancel.', 'Cancel');
  adb('shell', 'input', 'keyevent', 'KEYCODE_DPAD_CENTER');
  await result('Confirm: false');
  assert.ok(!snapshot().some(n => n.label === 'Cancel' || n.label === 'Browser controls'),
    'Normal fixture must own input before its cursor screenshot');
  execFileSync('python3', [resolve(driver), 'screenshot', resolve(screenshot)], { timeout: 20000 });
  execFileSync('java', ['tests/device/CursorScreenshot.java', resolve(screenshot), '480', '540'],
    { encoding: 'utf8', timeout: 20000 });
} finally {
  clearTimeout(watchdog);
  socket.close(); remote.stdin.end();
  const deadline = Date.now() + 5000;
  while (!ended && Date.now() < deadline) await new Promise(yes => setTimeout(yes, 25));
  if (!ended) remote.kill('SIGKILL');
  assert.ok(ended && exitCode === 0, `Native remote did not close successfully: ${errors}`);
}
console.log('PASS: held OK, native alert/confirm/prompt and retained cursor/document recovery');
