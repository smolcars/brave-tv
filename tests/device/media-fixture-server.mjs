// Serve one existing Chromium test clip with byte ranges, only over loopback.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

assert.ok(process.argv[2], 'Usage: media-fixture-server.mjs CHROMIUM_MEDIA_TEST_DATA');
const name = 'bbb-320x240-2video-2audio.mp4';
const clip = readFileSync(join(process.argv[2], name));
assert.ok(clip.length > 0);
createServer((request, response) => {
  if (request.url !== `/${name}`) {
    response.writeHead(404).end();
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  const headers = {'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store'};
  let start = 0;
  let end = clip.length - 1;
  const range = request.method === 'GET' ? request.headers.range : undefined;
  if (range !== undefined) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match?.[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), end) : end;
    } else if (match?.[2]) {
      start = Math.max(0, clip.length - Number(match[2]));
    } else {
      start = clip.length;
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)
        || start > end || start >= clip.length) {
      response.writeHead(416, {...headers, 'Content-Range': `bytes */${clip.length}`}).end();
      return;
    }
    headers['Content-Range'] = `bytes ${start}-${end}/${clip.length}`;
  }
  headers['Content-Length'] = end - start + 1;
  response.writeHead(range === undefined ? 200 : 206, headers);
  response.end(request.method === 'HEAD' ? undefined : clip.subarray(start, end + 1));
}).listen(18083, '127.0.0.1', () => console.log('Media fixture: http://127.0.0.1:18083/'));
