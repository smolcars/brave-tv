// Real HTTP checks against the running loopback media fixture server.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
assert.ok(process.argv[2], 'Usage: media-server-check.mjs CHROMIUM_MEDIA_TEST_DATA');
const name = 'bbb-320x240-2video-2audio.mp4';
const clip = readFileSync(join(process.argv[2], name));
const url = `http://127.0.0.1:18083/${name}`;
for (const [range, start, end] of [
  [undefined, 0, clip.length], ['bytes=0-31', 0, 32],
  ['bytes=-32', clip.length - 32, clip.length],
  [`bytes=${clip.length - 32}-`, clip.length - 32, clip.length],
  [`bytes=0-${clip.length + 50}`, 0, clip.length],
]) {
  const response = await fetch(url, {headers: range ? {Range: range} : {}});
  assert.equal(response.status, range ? 206 : 200);
  assert.equal(Number(response.headers.get('content-length')), end - start);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), clip.subarray(start, end));
  if (range) assert.equal(response.headers.get('content-range'),
    `bytes ${start}-${end - 1}/${clip.length}`);
}
for (const range of ['bytes=-0', 'bytes=5-2', `bytes=${clip.length}-`, 'bytes=-',
  'bytes=0-1,3-4', 'bytes=hello']) {
  const response = await fetch(url, {headers: {Range: range}});
  assert.equal(response.status, 416);
  assert.equal(response.headers.get('content-range'), `bytes */${clip.length}`);
  await response.arrayBuffer();
}
const head = await fetch(url, {method: 'HEAD'});
assert.equal(head.status, 200);
assert.equal(Number(head.headers.get('content-length')), clip.length);
assert.equal((await head.arrayBuffer()).byteLength, 0);
assert.equal((await fetch(url, {method: 'POST'})).status, 405);
assert.equal((await fetch('http://127.0.0.1:18083/other.mp4')).status, 404);
console.log('PASS: full, bounded, suffix, open, invalid, HEAD, method and path checks');
