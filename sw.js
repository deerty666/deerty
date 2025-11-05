const CACHE_NAME = 'deerty-menu-cache-v1';
const urlsToCache = [
'/', // يشير إلى ملف index.html
'/index.html',
'style.css',
'script.js',
'manifest.json',
'logo.png',  // شعار الموقع
'Logo1.png', // أيقونة 512x512
'Logo2.png', // أيقونة 192x192

// (تعديل جديد): الروابط الخارجية الضرورية
'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap', // خطوط تاجوال
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'  // أيقونات Font Awesome
];

// حدث التثبيت: فتح الذاكرة المؤقتة وحفظ الملفات الأساسية
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log('Opened cache: PWA installed successfully.');
return cache.addAll(urlsToCache);
})
.catch(error => {
console.error('Failed to cache resources during install:', error);
})
);
self.skipWaiting();
});

// حدث الجلب: تقديم الملفات من الذاكرة المؤقتة أولاً، وإلا يتم جلبها من الشبكة
self.addEventListener('fetch', (event) => {
event.respondWith(
caches.match(event.request)
.then((response) => {
if (response) {
return response;
}
return fetch(event.request);
})
);
});

// حدث التنشيط: تنظيف الذاكرة المؤقتة القديمة
self.addEventListener('activate', (event) => {
const cacheWhitelist = [CACHE_NAME];
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cacheName) => {
if (cacheWhitelist.indexOf(cacheName) === -1) {
return caches.delete(cacheName);
}
})
);
})
);
});
