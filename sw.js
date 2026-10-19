// ==========================================
// Service Worker لتطبيق الويب التقدمي PWA
// دار التطريز TATRIZA - نظام التخزين المؤقت والتشغيل السريع
// ==========================================

const CACHE_NAME = 'tatriza-pwa-v5.0';

const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css?v=5.0',
    './js/main.js?v=5.0',
    './js/modals.js?v=5.0',
    './js/currency.js?v=5.0',
    './js/pwa.js?v=5.0',
    './js/tracking.js',
    './js/authenticity.js',
    './js/qrcode.js',
    './videos/tufting_craft.mp4',
    './manifest.json',
    './manifest-admin.json',
    './images/logo.jpg',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/icon-apple.png',
    './images/step1_design.jpg',
    './images/step2_frame.jpg',
    './images/step3_tufting.jpg',
    './images/step4_glue.jpg',
    './images/step5_carving.jpg',
    './images/step6_finishing.jpg',
    './images/step7_packaging.jpg'
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

// 2. تنشيط الـ Service Worker وتنظيف النسخ القديمة فوراً
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

    // استراتيجية Network-First للأكواد والصفحات لضمان وصول التحديثات لحظياً للمستخدمين
    const isCodeOrDocument = url.pathname.endsWith('.js') || 
                             url.pathname.endsWith('.css') || 
                             url.pathname.endsWith('.html') || 
                             url.pathname === '/' || 
                             url.pathname.endsWith('/');

    if (isCodeOrDocument) {
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    // للأصول الثابتة الأخرى (الصور والأيقونات) نستخدم Stale-While-Revalidate
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
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
