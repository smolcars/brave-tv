// Run only against the owned loopback loading fixture; checks do not establish APK acceptance.
import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:18091';
const read = (path, init = {}) => fetch(base + path,
  { ...init, signal: AbortSignal.timeout(5000), redirect: 'manual' });
assert.deepEqual(await (await read('/state')).json(), { pending: 0 });
assert.equal((await read('/redirect')).headers.get('location'), '/hold.html');
assert.match(await (await read('/hold.html')).text(), /<script src="\/held.js" defer><\/script>/);
assert.doesNotMatch(await (await read('/done.html')).text(), /src="\/held.js"/);
assert.equal((await read('/missing')).status, 404);
assert.equal((await read('/release')).status, 404);
assert.equal((await read('/hold.html', { method: 'POST' })).status, 405);
const first = await read('/held.js');
const second = await read('/held.js');
assert.deepEqual(await (await read('/state')).json(), { pending: 2 });
assert.equal((await read('/held.js')).status, 503);
assert.equal((await read('/release', { method: 'POST' })).status, 200);
assert.match(await first.text(), /Resource complete/);
assert.match(await second.text(), /Resource complete/);
assert.deepEqual(await (await read('/state')).json(), { pending: 0 });
console.log('Loading fixture route, bounded pending-resource and explicit release checks pass');
