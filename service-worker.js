const CACHE_NAME = 'territorios-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono.ico',
  './Territorio Entre Semana.png',
  './Territorio Sabado.png',
  './Territorio Domingo.png',
  './territorio.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(keyList.map((key) => {
        if (!cacheWhitelist.includes(key)) {
          return caches.delete(key);
        }
      }))
    )
  );
});

