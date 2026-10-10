// Local-only cache/storage fixture. Each network fetch increments the cache value.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
const page = readFileSync(new URL('../pages/privacy.html', import.meta.url));
let fetches = 0;
createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'});
    response.end(page);
  } else if (request.url === '/cached.txt') {
    response.writeHead(200, {'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=31536000'});
    response.end(`Network fetch ${++fetches}`);
  } else {
    response.writeHead(404);
    response.end();
  }
}).listen(18082, '127.0.0.1', () => console.log('Privacy fixture: http://127.0.0.1:18082/'));
