// Serveur de développement : reconstruit le site à chaque chargement de page.
//   node dev.mjs  ->  http://localhost:4321
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.xml': 'application/xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};

let n = 0;
async function rebuild() {
  // import avec cache-buster : les modifications de build.mjs sont prises en compte sans redémarrer
  const mod = await import(`${pathToFileURL(path.join(ROOT, 'build.mjs')).href}?v=${++n}`);
  return mod.build();
}

http
  .createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const isPage = !path.extname(url);
    try {
      if (isPage) await rebuild();
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      return res.end(`Erreur de build :\n\n${err.stack}`);
    }
    let file = path.join(DIST, url);
    if (!file.startsWith(DIST)) return res.writeHead(403).end();
    if (isPage) file = path.join(file, 'index.html');
    let status = 200;
    if (!fs.existsSync(file)) {
      if (!isPage) return res.writeHead(404).end('Not found');
      file = path.join(DIST, '404.html');
      status = 404;
    }
    res.writeHead(status, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`ULYCOM — http://localhost:${PORT}`));
