/* Adamante — servidor estático de desenvolvimento.
 *
 *   node serve.js            serve a raiz na porta 8099 (canvas + app)
 *   node serve.js www 8100   serve o pacote pronto, para testar o PWA
 *
 * Serve só arquivo, sem cache, e nada além da pasta escolhida.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, process.argv[2] || '.');
const PORTA = Number(process.argv[3] || 8099);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.md': 'text/markdown; charset=utf-8',
};

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const alvo = path.join(DIR, rel);

  // nada de sair da pasta servida
  if (!alvo.startsWith(DIR)) {
    res.writeHead(403).end('403');
    return;
  }
  fs.readFile(alvo, (erro, dados) => {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 ' + rel);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(alvo).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(dados);
  });
}).listen(PORTA, '127.0.0.1', () => {
  console.log(`Adamante em http://127.0.0.1:${PORTA}/  (servindo ${DIR})`);
});
