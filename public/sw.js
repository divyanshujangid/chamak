// Chamak service worker: offline app shell + cached art.
// Never touches user photos: they are read from the device and never fetched, and
// this worker ignores anything that isn't a same-origin GET (blob:, data:, POST…).
const VERSION = 'chamak-v1';
const SHELL = `${VERSION}-shell`;
const STATIC = `${VERSION}-static`;
const PRECACHE = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Hashed build files, licensed art, sample pics, icons: cache first.
const isStatic = (p) => /^\/(assets|art|samples|icons)\//.test(p);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/ml/')) return; // big model files: leave to the HTTP cache

  // Pages: network first so deploys show up, cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && url.pathname === '/') caches.open(SHELL).then((c) => c.put('/', res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    );
    return;
  }

  if (isStatic(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(STATIC).then((c) => c.put(req, copy));
        }
        return res;
      })),
    );
  }
});
