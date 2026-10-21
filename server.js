const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Types textuels à compresser (les images/polices/PDF sont déjà compressés)
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg']);

// HTML/CSS/JS : toujours revalidés (ETag → 304 très léger) pour voir les modifs immédiatement.
// Assets statiques : mis en cache 30 jours par le navigateur.
function cacheControlFor(ext) {
  if (['.html', '.css', '.js', '.json'].includes(ext)) return 'no-cache';
  return 'public, max-age=2592000';
}

const server = http.createServer((req, res) => {
  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(ROOT, cleanUrl === '/' ? 'index.html' : cleanUrl);
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  // Security check to prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }

      const etag = '"' + crypto.createHash('sha1').update(content).digest('base64').slice(0, 27) + '"';
      const headers = {
        'Content-Type': contentType,
        'Cache-Control': cacheControlFor(ext),
        'ETag': etag,
        'Vary': 'Accept-Encoding'
      };

      // Le navigateur a déjà la bonne version → 304, aucun octet de contenu renvoyé
      if (req.headers['if-none-match'] === etag) {
        res.writeHead(304, headers);
        res.end();
        return;
      }

      const accept = req.headers['accept-encoding'] || '';
      if (COMPRESSIBLE.has(ext) && content.length > 1024) {
        if (/\bbr\b/.test(accept)) {
          headers['Content-Encoding'] = 'br';
          content = zlib.brotliCompressSync(content, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 }
          });
        } else if (/\bgzip\b/.test(accept)) {
          headers['Content-Encoding'] = 'gzip';
          content = zlib.gzipSync(content, { level: 6 });
        }
      }

      headers['Content-Length'] = content.length;
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n✨ Serveur local démarré sur : http://localhost:${PORT}\n`);
});
