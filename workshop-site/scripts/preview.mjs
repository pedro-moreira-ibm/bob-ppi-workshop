import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const portFlag = process.argv.indexOf('--port');
const port = Number(portFlag < 0 ? 4321 : process.argv[portFlag + 1]);
const { base } = JSON.parse(await readFile(path.join(root, 'preview-config.json'), 'utf8'));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.wasm': 'application/wasm', '.woff2': 'font/woff2', '.md': 'text/plain', '.xml': 'application/xml' };
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === base && base) { res.writeHead(302, { Location: `${base}/` }); res.end(); return; }
    if (base && !pathname.startsWith(`${base}/`)) throw new Error('Not found');
    pathname = pathname.slice(base.length);
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root.slice(0, -1) && !file.startsWith(root)) throw new Error('Not found');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('Page not found');
  }
}).listen(port, '0.0.0.0', () => console.log(`Workshop preview: http://localhost:${port}${base}/`));
