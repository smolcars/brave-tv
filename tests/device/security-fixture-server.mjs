// Host-only fixtures for native Chromium permission and authentication prompts.
import {createServer} from 'node:http';
import {createServer as createTlsServer} from 'node:https';
import {readFileSync} from 'node:fs';

// Pass Chromium's public expired_cert.pem fixture; never use a user certificate.
const certificate = readFileSync(process.argv[2]);
const slowResponses = new Set();

const permissionPage = `<!doctype html>
<meta charset="utf-8"><title>TV native permission fixture</title>
<style>
body { margin: 0; background: #202124; color: #f1f0eb; font: 28px sans-serif; }
main { position: fixed; inset: 0; display: grid; place-content: center; gap: 24px; }
button { font: inherit; padding: 32px; }
p { position: fixed; top: 24px; left: 32px; }
output { text-align: center; }
</style>
<p>Controlled native permission fixture</p>
<main><button id="request">Request location permission</button>
<output id="status">No request yet</output></main>
<script>
document.querySelector('#request').onclick = () => {
  document.querySelector('#status').textContent = 'Waiting for native permission';
  navigator.geolocation.getCurrentPosition(
    () => { document.querySelector('#status').textContent = 'Location allowed'; },
    error => { document.querySelector('#status').textContent =
      error.code === 1 ? 'Location denied' : 'Location unavailable'; });
};
</script>`;

const server = createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  let status = 200;
  let body;
  const headers = {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'};
  if (request.url === '/slow.html') {
    const start = '<!doctype html><title>TV slow document</title><main><h1>Controlled slow document</h1>';
    const end = '</main>';
    if (request.method === 'HEAD') {
      response.writeHead(200, {...headers, 'Content-Length': Buffer.byteLength(start + end)}).end();
    } else if (slowResponses.size >= 2) {
      response.writeHead(503, {...headers, 'Retry-After': '1'}).end();
    } else {
      slowResponses.add(response);
      response.writeHead(200, {...headers, 'Content-Length': Buffer.byteLength(start + end)});
      response.write(start);
      const timer = setTimeout(() => response.end(end), 15000);
      response.once('close', () => {
        clearTimeout(timer);
        slowResponses.delete(response);
      });
    }
    return;
  }
  if (request.url === '/permission.html') {
    body = permissionPage;
  } else if (request.url === '/auth') {
    status = 401;
    headers['WWW-Authenticate'] = 'Basic realm="TV synthetic authentication fixture"';
    body = '<!doctype html><title>TV authentication fixture</title><h1>Authentication canceled</h1>';
  } else {
    status = 404;
    body = '<!doctype html><title>Fixture not found</title>';
  }
  headers['Content-Length'] = Buffer.byteLength(body);
  response.writeHead(status, headers).end(request.method === 'HEAD' ? undefined : body);
});
server.listen(18084, '127.0.0.1', () => {
  console.log('Native security fixture ready on loopback18084');
});

createTlsServer({key: certificate, cert: certificate}, (request, response) => {
  const body = '<!doctype html><title>Unexpected certificate acceptance</title>';
  response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body)});
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(18085, '127.0.0.1', () => {
  console.log('Invalid-certificate fixture ready on loopback18085');
});
