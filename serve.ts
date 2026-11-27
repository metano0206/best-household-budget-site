// serve.ts — tiny static server for previewing app/ on this machine.
//
//   node serve.ts [--port 8080]
//
// Serves the app/ folder next to this file at http://localhost:8080 so the
// site can be opened in a desktop browser and at a phone size, and so the
// screenshots in screenshots/ can be taken of the real pages. Standard
// library only; it is a development helper and is not part of the entry.

import { readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./app/', import.meta.url));
const portArg = process.argv.indexOf('--port');
const port = portArg >= 0 ? Number(process.argv[portArg + 1]) : 8080;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = normalize(join(root, relative));
  if (!filePath.startsWith(root)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    if (!statSync(filePath).isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream' });
    response.end(readFileSync(filePath));
  } catch {
    response.writeHead(404).end('not found');
  }
}).listen(port, () => {
  console.log(`serving app/ at http://localhost:${port}`);
});
