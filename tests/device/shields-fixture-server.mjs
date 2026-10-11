// Fixed synthetic resources for the native Shields regression; host loopback only.
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';

const routes = new Map([
  ['/shields.html', ['text/html', readFileSync(new URL('../pages/shields.html', import.meta.url))]],
  ['/shields-control.js', ['text/javascript', readFileSync(new URL('../pages/shields-control.js', import.meta.url))]],
  ['/showbanner.js', ['text/javascript', Buffer.from('window.tvAdFixtureLoaded = true;')]],
  ['/1_cookie.js', ['text/javascript', Buffer.from('window.tvCookieFixtureLoaded = true;')]],
]);

createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, {Allow: 'GET, HEAD'}).end();
    return;
  }
  const resource = routes.get(request.url);
  if (!resource) {
    response.writeHead(404).end();
    return;
  }
  const [type, body] = resource;
  response.writeHead(200, {
    'Content-Type': `${type}; charset=utf-8`,
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}).listen(18081, '127.0.0.1', () => console.log('Shields fixture ready on loopback18081'));
