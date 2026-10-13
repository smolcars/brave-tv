// Controlled normal-page loading; release the pending script through loopback POST.
import { createServer } from 'node:http';

const pending = new Set();
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8' };
const page = `<!doctype html><meta charset="utf-8"><title>TV loading fixture</title>
<style>
body { margin:0; background:#f4f1e8; color:#202522; font:28px sans-serif; }
main { padding:72px 48px; }
button { position:fixed; left:35%; top:40%; width:30%; height:20%; font:inherit; }
output { display:block; margin-top:24px; }
</style>
<main><h1>Controlled loading fixture</h1>
<p>The page is usable while its last resource is pending.</p>
<button onclick="clicks.textContent=Number(clicks.textContent)+1">Click while loading</button>
<output id="clicks">0</output><output id="ready">Resource pending</output></main>
<script src="/held.js" defer></script>`;

const server = createServer((request, response) => {
  const path = request.url;
  if (path === '/release' && request.method === 'POST') {
    for (const held of pending) held.end("ready.textContent='Resource complete';");
    response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' })
      .end('Released');
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: path === '/release' ? 'POST' : 'GET, HEAD' }).end();
    return;
  }
  if (path === '/state') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      .end(request.method === 'HEAD' ? undefined : JSON.stringify({ pending: pending.size }));
  } else if (path === '/redirect') {
    response.writeHead(302, { Location: '/hold.html', 'Cache-Control': 'no-store' }).end();
  } else if (path === '/hold.html' || path === '/done.html') {
    const body = path === '/hold.html' ? page : page.replace('<script src="/held.js" defer></script>',
      '<script>ready.textContent="Resource complete";</script>');
    response.writeHead(200, { ...headers, 'Content-Length': Buffer.byteLength(body) })
      .end(request.method === 'HEAD' ? undefined : body);
  } else if (path === '/held.js') {
    if (request.method === 'HEAD') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' }).end();
    } else if (pending.size >= 2) {
      response.writeHead(503, { 'Retry-After': '1' }).end();
    } else {
      pending.add(response);
      response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
      response.flushHeaders();
      // Prevent an abandoned test from keeping a socket forever; tests release by condition.
      const watchdog = setTimeout(() => response.end('/* Fixture watchdog expired */'), 90000);
      response.once('close', () => { clearTimeout(watchdog); pending.delete(response); });
    }
  } else {
    response.writeHead(404, headers).end();
  }
});
server.listen(18091, '127.0.0.1', () => console.log('Loading fixture ready on loopback18091'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  for (const held of pending) held.destroy();
  server.close();
});
