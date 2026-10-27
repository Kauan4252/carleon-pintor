/* Service worker — deixa o app funcionar 100% offline.
   Ao mudar qualquer arquivo do app, aumente o número da versão abaixo. */
var VERSAO = 'carleon-v1';
var ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './html2canvas.min.js',
  './fonts/inter.woff2',
  './fonts/fira-sans-800.woff2',
  './fonts/merriweather-sans.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.filter(function (n) { return n !== VERSAO; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Rede primeiro (pega atualizações quando há internet), cache como reserva offline */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copia = resp.clone();
      caches.open(VERSAO).then(function (c) { c.put(e.request, copia); });
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
