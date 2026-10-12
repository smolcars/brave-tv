// Host fixture checks; native permission/authentication/navigation acceptance is separate.
import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:18084';
const request = (path, options = {}) => fetch(base + path,
  {...options, signal: AbortSignal.timeout(3000)});
for (const [path, status] of [['/permission.html', 200], ['/auth', 401], ['/missing', 404]]) {
  const get = await request(path);
  const head = await request(path, {method: 'HEAD'});
  assert.equal(get.status, status);
  assert.equal(head.status, status);
  assert.equal(get.headers.get('cache-control'), 'no-store');
  assert.equal(head.headers.get('content-length'), get.headers.get('content-length'));
  assert.equal(Buffer.byteLength(await get.text()), Number(get.headers.get('content-length')));
  assert.equal(await head.text(), '');
}
const post = await request('/slow.html', {method: 'POST'});
assert.equal(post.status, 405);
assert.equal(post.headers.get('allow'), 'GET, HEAD');
const head = await request('/slow.html', {method: 'HEAD'});
assert.equal(head.status, 200);
assert.equal(await head.text(), '');
const readers = [];
try {
  for (let i = 0; i < 2; i++) {
    const response = await request('/slow.html');
    assert.equal(response.status, 200);
    const reader = response.body.getReader();
    readers.push(reader);
    let document = '';
    const decoder = new TextDecoder();
    while (!document.includes('</output>')) {
      const {value, done} = await reader.read();
      assert.equal(done, false, 'Loading controls must arrive before response completion');
      document += decoder.decode(value, {stream: true});
      assert.ok(document.length < 4096, 'Bounded loading fixture');
    }
    assert.match(document, /Controlled slow document/);
    assert.match(document, /<button id="click"/);
    assert.match(document, /<output id="clicks">0<\/output>/);
  }
  const bounded = await request('/slow.html');
  assert.equal(bounded.status, 503);
  await bounded.body.cancel();
} finally {
  await Promise.all(readers.map(reader => reader.cancel()));
}
const deadline = Date.now() + 2000;
for (;;) {
  const released = await request('/slow.html');
  await released.body.cancel();
  if (released.status === 200) break;
  assert.equal(released.status, 503);
  assert.ok(Date.now() < deadline, 'Canceled slow-response slots must be released');
  await new Promise(resolve => setTimeout(resolve, 25));
}
console.log('PASS: fixed security routes, HEAD/method bounds and slow-document cancellation');
