self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('deerty-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './Logo1.png',
        './Logo2.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
