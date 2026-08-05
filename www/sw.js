// GERADO por build-www.js — nao editar a mao.
const CACHE = 'adamante-d44c959b1a03';
const ARQUIVOS = [
  "./",
  "assets/adamante-shield.webp",
  "css/adamante.css",
  "fonts/bebasneue-JTUSjIg69CK48gW7PXoo9Wdhyzbi.woff2",
  "fonts/bebasneue-JTUSjIg69CK48gW7PXoo9Wlhyw.woff2",
  "fonts/fonts.css",
  "fonts/karla-qkB9XvYC6trAT55ZBi1ueQVIjQTD-JrIH2G7nytkHRyQ8p4wUje6bg.woff2",
  "fonts/karla-qkB9XvYC6trAT55ZBi1ueQVIjQTD-JrIH2G7nytkHRyQ8p4wUjm6bnEr.woff2",
  "fonts/karla-qkBKXvYC6trAT7RQNNK2EG7SIwPWMNlCV3lGb7PnGw.woff2",
  "fonts/karla-qkBKXvYC6trAT7RQNNK2EG7SIwPWMNlCV3lIb7M.woff2",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "index.html",
  "js/app.js",
  "js/core.js",
  "js/data.js",
  "js/runtime.js",
  "js/state.js",
  "js/vals.js",
  "js/views.js",
  "manifest.webmanifest"
];

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
