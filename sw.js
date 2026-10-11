// ==========================================
// Service Worker لتطبيق الويب التقدمي PWA
// دار التطريز TATRIZA - نظام التخزين المؤقت والتشغيل السريع
// ==========================================

const CACHE_NAME = 'tatriza-pwa-v1.1';

const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css?v=3.0',
    './js/main.js',
    './js/modals.js',
    './js/currency.js',
    './js/pwa.js',
    './js/tracking.js',
    './js/authenticity.js',
    './js/qrcode.js',
    './manifest.json',
    './manifest-admin.json',
    './images/logo.jpg',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/icon-apple.png'
];

// 1. تثبيت الـ Service Worker وحفظ الأصول الأساسية
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[PWA] Cache prefetch error:', err);
            });
        })
    );
});

// 2. تنشيط الـ Service Worker وتنظيف النسخ القديمة
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. إدارة طلبات الشبكة (Fetch Strategy)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // استثناء طلبات Firebase وقواعد البيانات السحابية لتبقى حية ومباشرة دائماً
    if (
        url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis') || 
        url.hostname.includes('firestore') ||
        event.request.method !== 'GET'
    ) {
        return; // تمرير مباشر للشبكة
    }

    // استراتيجية Stale-While-Revalidate: استجابة فورية من الكاش ثم التحديث في الخلفية
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // في حالة انقطاع الإنترنت الكامل، نعيد النسخة المحفوظة أو الصفحة الرئيسية
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
