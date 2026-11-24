// Service Worker - selalu fetch terbaru, tidak cache
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // Tidak cache apapun - selalu ambil dari network
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
