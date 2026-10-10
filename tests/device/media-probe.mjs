// Read actual page media state after native TV controls, through forwarded ADB CDP.
import assert from 'node:assert/strict';

const [url, expected, position] = process.argv.slice(2);
assert.ok(url && ['paused', 'playing'].includes(expected),
  'Usage: media-probe.mjs EXACT_URL paused|playing [expected_seconds]');
if (position !== undefined) assert.ok(Number.isFinite(Number(position)));
const timeout = setTimeout(() => {
  console.error('Media probe timed out');
  process.exit(1);
}, 15000);
let socket;
try {
  const tabs = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const tab = tabs.find(tab => tab.type === 'page' && tab.url === url);
  assert.ok(tab, 'Open the exact media page in the normal profile first');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  const result = new Promise((resolve, reject) => {
    socket.onerror = reject;
    socket.onclose = () => reject(new Error('DevTools disconnected'));
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id !== 1) return;
      if (message.error || message.result.exceptionDetails) {
        reject(new Error(JSON.stringify(message)));
      } else {
        resolve(message.result.result.value);
      }
    };
  });
  socket.onopen = () => socket.send(JSON.stringify({
    id: 1, method: 'Runtime.evaluate', params: {
      returnByValue: true,
      expression: `(() => {
        const media = document.querySelector('video, audio');
        if (!media) return null;
        const quality = media.getVideoPlaybackQuality?.();
        return {
          paused: media.paused, time: media.currentTime, duration: media.duration,
          ready: media.readyState, error: media.error?.code ?? null,
          fullscreen: !!document.fullscreenElement,
          totalFrames: quality?.totalVideoFrames,
          droppedFrames: quality?.droppedVideoFrames,
          adShowing: !!document.querySelector('.ad-showing')
        };
      })()`,
    },
  }));
  const state = await result;
  console.log(JSON.stringify({ url, expected, state }));
  assert.ok(state, 'No media element');
  assert.equal(state.error, null, 'Media decode/network error');
  assert.ok(state.ready >= 2, 'No current media data');
  assert.equal(state.paused, expected === 'paused');
  if (position !== undefined) {
    assert.ok(Math.abs(state.time - Number(position)) <= 1,
      `Expected ${position}s ±1s, got ${state.time}s`);
  }
} finally {
  socket?.close();
  clearTimeout(timeout);
}
