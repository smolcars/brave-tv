// Loopback-only reports from the owned synthetic Enter fixture; no browser endpoint.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const reports = new Map();
const pages = resolve('tests/pages');
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:18088');
  res.setHeader('Cache-Control', 'no-store');
  if (url.pathname === '/enter-report') {
    const run = url.searchParams.get('run');
    if (!run || !/^[a-z0-9-]{1,80}$/.test(run)) { res.writeHead(400).end(); return; }
    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 16384) { res.writeHead(413).end(); return; }
      }
      try {
        const data = JSON.parse(body);
        assert.ok(Array.isArray(data.events) && Array.isArray(data.submissions));
        assert.ok(Number.isSafeInteger(data.invalids) && data.invalids >= 0);
        if (reports.size >= 100 && !reports.has(run)) reports.delete(reports.keys().next().value);
        reports.set(run, data);
        res.writeHead(204).end();
      } catch { res.writeHead(400).end(); }
      return;
    }
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(reports.has(run) ? 200 : 404).end(JSON.stringify(reports.get(run) || null));
      return;
    }
  }
  if (req.method !== 'GET' || !['/phone-enter.html', '/phone-enter-frame.html'].includes(url.pathname)) {
    res.writeHead(404).end(); return;
  }
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(await readFile(resolve(pages, '.' + url.pathname)));
  } catch { res.writeHead(404).end(); }
});
server.listen(18088, '127.0.0.1');
console.log('Owned Enter fixture listening on loopback:18088');
