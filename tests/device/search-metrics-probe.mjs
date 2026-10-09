// Query the real Android browser's local histogram diagnostics over its ADB forward.
import assert from 'node:assert/strict';

const expected = process.argv[2];
assert.ok(['enabled', 'disabled'].includes(expected),
  'Usage: node tests/device/search-metrics-probe.mjs enabled|disabled');
const metric = 'Brave.Search.DefaultEngine.4';
const timeout = setTimeout(() => {
  console.error('Search metrics probe timed out');
  process.exit(1);
}, 10000);
let socket;
try {
  const tabs = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = tabs.find(tab => tab.url === `chrome://histograms/${metric}`);
  assert.ok(tab, `Open chrome://histograms/${metric} in the normal profile first`);
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  const response = await new Promise((resolve, reject) => {
    socket.onerror = reject;
    socket.onclose = () => reject(new Error('DevTools disconnected'));
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id === 1) resolve(message);
    };
    socket.onopen = () => socket.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: {
        expression: `(async () => {
          const {sendWithPromise} = await import('chrome://resources/js/cr.js');
          return sendWithPromise('requestHistograms', ${JSON.stringify(metric)}, false);
        })()`,
        awaitPromise: true,
        returnByValue: true,
      },
    }));
  });
  assert.ok(!response.error && !response.result?.exceptionDetails,
    JSON.stringify(response.error ?? response.result?.exceptionDetails));
  const histograms = response.result.result.value;
  assert.ok(Array.isArray(histograms), 'The native histogram request must complete');
  const present = histograms.some(histogram => histogram.name === metric);
  console.log(JSON.stringify({expected, metric, present}));
  assert.equal(present, expected === 'enabled');
} finally {
  clearTimeout(timeout);
  socket?.close();
}
