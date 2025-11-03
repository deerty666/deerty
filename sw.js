const CACHE_NAME = 'sahayeb-cache-v1';
// قائمة الملفات الأساسية التي يجب تخزينها مؤقتاً
const urlsToCache = [
  './', // **تم التعديل:** المسار النسبي يشير إلى المجلد الحالي للمشروع
  'index.html', // **تم التعديل:** إزالة /
  'style.css', // **تم التعديل:** إزالة /
  'script.js', // **تم التعديل:** إزالة /
  'manifest.json', // **تم التعديل:** إزالة /
  'logo.png', // **تم التعديل:** إزالة /
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' 
];

// حدث التثبيت: يتم تخزين جميع الملفات الأساسية مؤقتاً
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache and started caching assets.');
        // الآن سيحاول تخزين الملفات من المسار النسبي، وهو الأصح لـ GitHub Pages
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // لتفعيل الـ SW فوراً
});

// حدث الجلب (Fetch): يتم الرد على الطلبات إما من الكاش أو من الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجد الرد في الكاش، يتم إرجاعه
        if (response) {
          return response;
        }
        // وإلا، يتم جلب الطلب من الشبكة
        return fetch(event.request);
      })
  );
});

// حدث التفعيل: يتم مسح أي نسخ كاش قديمة
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // حذف الكاش القديم
                    }
                })
            );
        })
    );
});
