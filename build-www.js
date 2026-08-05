/* Adamante — monta www/, que é ao mesmo tempo o PWA e o conteúdo do APK.
 *
 *   node build-www.js
 *
 * O app-fonte é app.html na raiz; aqui ele vira www/index.html com o manifesto
 * e o service worker ligados. O sw.js é gerado com a lista exata de arquivos e
 * uma versão derivada do conteúdo, então publicar de novo invalida o cache
 * antigo sozinho.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = __dirname;
const WWW = path.join(RAIZ, 'www');

const APP = {
  nome: 'Adamante',
  nomeLongo: 'Adamante — RPG de hábito',
  descricao: 'Treino, estudo e trabalho reais viram atributos, cartas e batalhas. Roda offline, no seu aparelho.',
  cor: '#080b14',
};

// arquivos copiados da raiz para www/, mantendo o caminho relativo
const COPIAR = [
  'css/adamante.css',
  'js/runtime.js', 'js/data.js', 'js/core.js', 'js/state.js', 'js/vals.js', 'js/views.js', 'js/app.js',
  'assets/adamante-shield.webp',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];

// esvazia a pasta em vez de apagá-la: no Windows, remover o diretório estala com
// EPERM se qualquer coisa estiver servindo www/ naquele momento
function limpar(p) {
  if (!fs.existsSync(p)) return;
  for (const f of fs.readdirSync(p)) fs.rmSync(path.join(p, f), { recursive: true, force: true });
}
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
function copiar(rel) {
  const de = path.join(RAIZ, rel), para = path.join(WWW, rel);
  mkdirp(path.dirname(para));
  fs.copyFileSync(de, para);
  return rel;
}

// ── limpa e copia ────────────────────────────────────────────────────────────
mkdirp(WWW);
limpar(WWW);

const arquivos = COPIAR.map(copiar);

// fontes: tudo que estiver em fonts/
for (const f of fs.readdirSync(path.join(RAIZ, 'fonts'))) {
  arquivos.push(copiar(path.join('fonts', f).replace(/\\/g, '/')));
}

// arte: os tiles de pixel art (DCSS, CC0) em assets/art/
for (const f of fs.readdirSync(path.join(RAIZ, 'assets', 'art'))) {
  arquivos.push(copiar(path.join('assets', 'art', f).replace(/\\/g, '/')));
}

// ── index.html: o app.html com manifesto e service worker ────────────────────
let html = fs.readFileSync(path.join(RAIZ, 'app.html'), 'utf8');
html = html.replace(
  '<link rel="stylesheet" href="fonts/fonts.css">',
  '<link rel="manifest" href="manifest.webmanifest">\n<link rel="stylesheet" href="fonts/fonts.css">'
);
html = html.replace(
  '</body>',
  `<script>
// registra o service worker; em file:// (WebView do APK) não existe, e tudo bem
if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}
</script>
</body>`
);
fs.writeFileSync(path.join(WWW, 'index.html'), html);
arquivos.push('index.html');

// ── manifesto ────────────────────────────────────────────────────────────────
const manifesto = {
  name: APP.nomeLongo,
  short_name: APP.nome,
  lang: 'pt-BR',
  id: 'adamante',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: APP.cor,
  theme_color: APP.cor,
  description: APP.descricao,
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(path.join(WWW, 'manifest.webmanifest'), JSON.stringify(manifesto, null, 1));
arquivos.push('manifest.webmanifest');

// ── service worker ───────────────────────────────────────────────────────────
const lista = ['./'].concat(arquivos.slice().sort());
// a versão do cache tem que depender só do conteúdo, nunca de como o checkout
// converteu as quebras de linha — senão o mesmo commit gera hash diferente
// em cada máquina e o cache é invalidado sem motivo
const TEXTO = /\.(html|js|css|json|webmanifest|svg)$/i;
const hash = crypto.createHash('sha1');
for (const rel of arquivos.slice().sort()) {
  let bytes = fs.readFileSync(path.join(WWW, rel));
  if (TEXTO.test(rel)) bytes = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  hash.update(rel).update(bytes);
}
const versao = hash.digest('hex').slice(0, 12);

const sw = `// GERADO por build-www.js — nao editar a mao.
const CACHE = 'adamante-${versao}';
const ARQUIVOS = ${JSON.stringify(lista, null, 2)};

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache primeiro: o app é inteiro estático e precisa abrir sem rede
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }).catch(() => caches.match('./')))
  );
});
`;
fs.writeFileSync(path.join(WWW, 'sw.js'), sw);

// ── resumo ───────────────────────────────────────────────────────────────────
let total = 0;
for (const rel of arquivos) total += fs.statSync(path.join(WWW, rel)).size;
total += fs.statSync(path.join(WWW, 'sw.js')).size;
console.log(`www/ pronto · ${arquivos.length + 1} arquivos · ${(total / 1024).toFixed(0)} KB · cache adamante-${versao}`);
