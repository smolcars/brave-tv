// Host-only synthetic downloads, served over loopback for explicit emulator forwarding.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {join} from 'node:path';

assert.ok(process.argv[2], 'Usage: download-fixture-server.mjs CHROMIUM_MEDIA_TEST_DATA');
const image = readFileSync(join(process.argv[2], 'four-colors.png'));
assert.ok(image.length > 0);
const routes = new Map([
  ['/tv-fixture-open.png', {body: image, type: 'image/png'}],
  ['/tv-fixture-keep.txt', {body: Buffer.from('TV synthetic download: keep this file.\n'), type: 'text/plain'}],
  ['/tv-fixture-delete.txt', {body: Buffer.from('TV synthetic download: delete only this file.\n'), type: 'text/plain'}],
  ['/tv-fixture-slow.bin', {body: Buffer.alloc(4 * 1024 * 1024, 0x54), type: 'application/octet-stream', slow: true}],
]);
const page = '<!doctype html><meta charset="utf-8"><title>TV download checks</title>'
  + '<h1>TV download checks</h1><p>Synthetic files only.</p>'
  + [...routes.keys()].map(path => `<p><a href="${path}" download>${path.slice(1)}</a></p>`).join('');
let slowRequests = 0;
createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  if (request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
    response.end(request.method === 'HEAD' ? undefined : page);
    return;
  }
  const item = routes.get(request.url);
  if (!item) {
    response.writeHead(404).end();
    return;
  }
  let start = 0;
  let end = item.body.length - 1;
  const range = request.headers.range;
  if (range !== undefined) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    start = match ? Number(match[1]) : item.body.length;
    end = match?.[2] ? Math.min(Number(match[2]), end) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= item.body.length) {
      response.writeHead(416, {'Content-Range': `bytes */${item.body.length}`}).end();
      return;
    }
  }
  if (item.slow && request.method === 'GET' && slowRequests >= 2) {
    response.writeHead(503).end();
    return;
  }
  const headers = {'Content-Type': item.type, 'Content-Length': end - start + 1,
    'Content-Disposition': `attachment; filename="${request.url.slice(1)}"`,
    'Accept-Ranges': 'bytes', 'Last-Modified': 'Sat, 10 Oct 2026 00:00:00 GMT',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'};
  if (range !== undefined) headers['Content-Range'] = `bytes ${start}-${end}/${item.body.length}`;
  response.writeHead(range === undefined ? 200 : 206, headers);
  if (request.method === 'HEAD') {
    response.end();
  } else if (!item.slow) {
    response.end(item.body.subarray(start, end + 1));
  } else {
    slowRequests++;
    let offset = start;
    const timer = setInterval(() => {
      if (response.writableNeedDrain) return;
      const next = Math.min(offset + 8192, end + 1);
      response.write(item.body.subarray(offset, next));
      offset = next;
      if (offset > end) response.end();
    }, 100);
    response.once('close', () => {
      clearInterval(timer);
      slowRequests--;
    });
  }
}).listen(18090, '127.0.0.1', () => console.log('Download fixture: http://127.0.0.1:18090/'));
