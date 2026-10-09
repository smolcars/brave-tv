// Diagnostic assertions against the Android browser, forwarded through ADB.
import assert from 'node:assert/strict';

const expected = process.argv[2];
assert.ok(['up', 'down', 'cookie-on', 'cookie-off'].includes(expected),
  'Usage: node tests/device/shields-probe.mjs up|down|cookie-on|cookie-off');
const timeout = setTimeout(() => {
  console.error('Shields probe timed out');
  process.exit(1);
}, 15000);
let socket;
try {
  const tabs = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = tabs.find(tab => tab.url === 'http://127.0.0.1:18081/shields.html');
  assert.ok(tab, 'Open the local Shields fixture in the normal profile first');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  const pending = new Map();
  const requests = new Map();
  let previousLoader;
  let currentLoader;
  let loadedLoader;
  let frameId;
  let resolveLoaded;
  const loaded = new Promise(resolve => { resolveLoaded = resolve; });
  let nextId = 0;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    const eventData = message.params;
    if (message.method === 'Network.requestWillBeSent') {
      requests.set(eventData.requestId, {
        url: eventData.request.url, loader: eventData.loaderId, finished: false,
      });
    } else if (message.method === 'Network.loadingFailed') {
      const request = requests.get(eventData.requestId);
      if (request) request.error = eventData.errorText;
    } else if (message.method === 'Network.loadingFinished') {
      const request = requests.get(eventData.requestId);
      if (request) request.finished = true;
    } else if (message.method === 'Page.frameNavigated'
        && eventData.frame.id === frameId
        && eventData.frame.loaderId !== previousLoader) {
      currentLoader = eventData.frame.loaderId;
    } else if (message.method === 'Page.lifecycleEvent'
        && eventData.frameId === frameId && eventData.name === 'load') {
      loadedLoader = eventData.loaderId;
    }
    if (currentLoader && loadedLoader === currentLoader) resolveLoaded();
    const callback = pending.get(message.id);
    if (callback) {
      pending.delete(message.id);
      if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
      else callback.resolve(message.result);
    }
  };
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  socket.onclose = () => {
    for (const callback of pending.values()) callback.reject(new Error('DevTools disconnected'));
    pending.clear();
  };
  await send('Network.enable');
  await send('Page.enable');
  await send('Page.setLifecycleEventsEnabled', { enabled: true });
  const { frameTree } = await send('Page.getFrameTree');
  frameId = frameTree.frame.id;
  previousLoader = frameTree.frame.loaderId;
  await send('Page.reload', { ignoreCache: true });
  await loaded;
  let result;
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        ready: document.readyState,
        body: document.body?.innerText ?? '',
        adLoaded: window.tvAdFixtureLoaded === true,
        cookieLoaded: window.tvCookieFixtureLoaded === true,
        scriptlet: window.tvShieldsProbe === true,
        cosmetic: document.querySelector('#cosmetic-probe')
          ? getComputedStyle(document.querySelector('#cosmetic-probe')).display : 'missing'
      })`,
      returnByValue: true,
    });
    result = JSON.parse(response.result.value);
    if (result.ready === 'complete' && !result.body.includes('pending')) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  const network = [...requests.values()].filter(request => request.loader === currentLoader);
  console.log(JSON.stringify({ expected, result, network }));
  const assertRequest = (url, blocked) => {
    const matching = network.filter(request => request.url === url);
    assert.equal(matching.length, 1, `One fresh request for ${url}`);
    assert.equal(matching[0].error, blocked ? 'net::ERR_BLOCKED_BY_CLIENT' : undefined, url);
    assert.equal(matching[0].finished, !blocked, url);
  };
  assertRequest('http://127.0.0.1:18081/shields-control.js', false);
  assertRequest('http://localhost:18081/showbanner.js', expected !== 'down');
  assert.equal(result.ready, 'complete');
  assert.ok(!result.body.includes('pending'));
  assert.ok(result.body.includes('Control script: loaded'));
  if (expected.startsWith('cookie-')) {
    assert.equal(result.adLoaded, false);
    assert.ok(result.body.includes('Cookie-list request:'));
    assert.equal(result.cookieLoaded, expected === 'cookie-off');
    assertRequest('http://localhost:18081/1_cookie.js', expected === 'cookie-on');
  } else {
    assert.equal(result.adLoaded, expected === 'down');
    assert.equal(result.scriptlet, expected === 'up');
    assert.equal(result.cosmetic, expected === 'up' ? 'none' : 'block');
  }
} finally {
  clearTimeout(timeout);
  socket?.close();
}
