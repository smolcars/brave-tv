// Authenticate in CI without exporting the service-account key or access token.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const PUBLISHER = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/';

export function assertion(credentials, now = Math.floor(Date.now() / 1000)) {
  if (credentials.type !== 'service_account' ||
      !/^[^\s@]+@[^\s@]+\.iam\.gserviceaccount\.com$/.test(credentials.client_email ?? '') ||
      typeof credentials.private_key !== 'string') {
    throw new Error('The GitHub secret must contain a service-account JSON key.');
  }
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'RS256', typ: 'JWT' });
  const claims = encode({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: TOKEN_URL, iat: now, exp: now + 3600,
  });
  const input = `${header}.${claims}`;
  const signature = createSign('RSA-SHA256').update(input).sign(credentials.private_key, 'base64url');
  return `${input}.${signature}`;
}

export async function checkAccess(credentials, packageName, request = fetch) {
  if (!/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}$/.test(packageName)) {
    throw new Error('Invalid package name.');
  }
  const tokenResponse = await request(TOKEN_URL, {
    method: 'POST', signal: AbortSignal.timeout(30_000),
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion(credentials),
    }),
  });
  if (!tokenResponse.ok) throw new Error(`Google authentication failed (HTTP ${tokenResponse.status}).`);
  const { access_token: token } = await tokenResponse.json();
  if (typeof token !== 'string' || !token) throw new Error('Google returned no access token.');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const base = `${PUBLISHER}${encodeURIComponent(packageName)}/edits`;
  // The edit is discarded: this checks app access without committing any changes.
  const editResponse = await request(base, {
    method: 'POST', headers, body: '{}', signal: AbortSignal.timeout(30_000),
  });
  const result = { authenticated: true, packageName, serviceAccount: credentials.client_email };
  if (editResponse.status === 404) {
    return { ...result, appAccessible: false, reason: 'Package not found. The first Console upload may still be required.' };
  }
  if (!editResponse.ok) throw new Error(`Play app access failed (HTTP ${editResponse.status}); check API enablement and app permissions.`);
  const edit = await editResponse.json();
  if (typeof edit.id !== 'string' || !edit.id) throw new Error('Play returned no edit ID.');
  const deleted = await request(`${base}/${encodeURIComponent(edit.id)}`, {
    method: 'DELETE', headers, signal: AbortSignal.timeout(30_000),
  });
  if (!deleted.ok) throw new Error(`Could not discard the access-check edit (HTTP ${deleted.status}).`);
  return { ...result, appAccessible: true, temporaryEditDiscarded: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    delete process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is missing.');
    let credentials;
    try { credentials = JSON.parse(raw); }
    catch { throw new Error('The GitHub secret is not valid JSON.'); }
    const config = JSON.parse(readFileSync(new URL('../release/android.json', import.meta.url), 'utf8'));
    console.log(JSON.stringify(await checkAccess(credentials, config.packageName), null, 2));
  } catch (error) {
    // Never serialize credential objects or OAuth responses into CI logs.
    console.error(error instanceof Error ? error.message : 'Play access check failed.');
    process.exitCode = 1;
  }
}
