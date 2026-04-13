// اسم الكاش (نسخة البيانات)
const CACHE_NAME = 'sahaib-pos-v1';

// الملفات التي سيتم حفظها محلياً للعمل بدون إنترنت
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/logo.png', // تأكد من وجود شعارك
    'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fsahaib.page.link%2Fdownload' // كاش لأول طلب للبارو كود
];

// 1. مرحلة التثبيت: حفظ الملفات في الكاش
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('جاري حفظ الملفات في الكاش...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. مرحلة التفعيل: تنظيف الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('جاري حذف الكاش القديم...');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// 3. مرحلة جلب البيانات: الاستجابة من الكاش في حال Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا وجدنا الملف في الكاش، نرجعه
                if (response) {
                    return response;
                }
                // وإلا، نحاول جلبه من الشبكة
                return fetch(event.request);
            })
    );
});

