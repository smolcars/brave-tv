import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import test from 'node:test';
import { assertion, checkAccess } from '../tools/check_play_access.mjs';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const credentials = {
  type: 'service_account', client_email: 'publisher@example.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
};

test('JWT is signed for the fixed Google publisher scope and endpoint', () => {
  const jwt = assertion(credentials, 100);
  const [header, body, signature] = jwt.split('.');
  const claims = JSON.parse(Buffer.from(body, 'base64url'));
  assert.equal(claims.iss, credentials.client_email);
  assert.equal(claims.aud, 'https://oauth2.googleapis.com/token');
  assert.equal(claims.scope, 'https://www.googleapis.com/auth/androidpublisher');
  assert.equal(claims.exp, 3700);
  assert(verify('RSA-SHA256', Buffer.from(`${header}.${body}`), publicKey, Buffer.from(signature, 'base64url')));
  assert.throws(() => assertion({ type: 'authorized_user' }), /service-account/);
});

test('successful app-access check discards the edit and never returns its token', async () => {
  const calls = [];
  const responses = [
    new Response(JSON.stringify({ access_token: 'test-token' })),
    new Response(JSON.stringify({ id: 'temporary-edit' })),
    new Response(null, { status: 204 }),
  ];
  const result = await checkAccess(credentials, 'com.nitesh.rhenium', async (url, options) => {
    calls.push({ url, method: options.method });
    return responses.shift();
  });
  assert(result.appAccessible);
  assert(result.temporaryEditDiscarded);
  assert.equal(calls[2].method, 'DELETE');
  assert(calls[2].url.endsWith('/com.nitesh.rhenium/edits/temporary-edit'));
  assert(!JSON.stringify(result).includes('test-token'));
});

test('a missing app is distinguished from an invalid credential or permission', async () => {
  for (const status of [404, 403]) {
    let call = 0;
    const run = checkAccess(credentials, 'com.nitesh.rhenium', async () =>
      ++call === 1 ? new Response(JSON.stringify({ access_token: 'test-token' }))
        : new Response('{}', { status }));
    if (status === 404) assert.equal((await run).appAccessible, false);
    else await assert.rejects(run, /HTTP 403/);
  }
});
