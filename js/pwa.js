// ==========================================
// محرك تطبيق الويب التقدمي (pwa.js)
// دار التطريز TATRIZA - تثبيت التطبيق ودعم آيفون وأندرويد
// ==========================================

let deferredPWAInstallPrompt = null;

// 1. تسجيل الـ Service Worker تلقائياً
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isScreen = window.location.pathname.includes('/screen');
        const swPath = isScreen ? '../sw.js' : './sw.js';
        navigator.serviceWorker.register(swPath)
            .then(reg => {
                // تحديث الـ Service Worker في الخلفية إذا وُجدت نسخة جديدة
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA] New version ready.');
                            }
                        };
                    }
                };
            })
            .catch(err => console.warn('[PWA] Registration failed:', err));
    });
}

// 2. التقاط حدث التثبيت لأجهزة أندرويد وكروم
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPWAInstallPrompt = e;
        // إظهار زر التثبيت إن وجد شارة تثبيت سريعة
        const installBtn = document.getElementById('drawer-pwa-install-btn');
        if (installBtn) {
            installBtn.classList.remove('opacity-70');
            installBtn.classList.add('animate-pulse');
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredPWAInstallPrompt = null;
        console.log('[PWA] Tatriza App successfully installed.');
        if (typeof window.showLuxuryToast === 'function') {
            window.showLuxuryToast('🎉 مبارك! تم تثبيت تطبيق دار التطريز على شاشتك الرئيسية بنجاح.');
        }
    });
}

/**
 * فحص هل الجهاز يعمل بنظام iOS (iPhone / iPad)
 */
export function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * فحص هل التطبيق مفتوح مسبقاً في وضع التثبيت المستقل (Standalone PWA)
 */
export function isRunningStandalone() {
    return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone === true);
}

/**
 * تشغيل عملية التثبيت أو إظهار الإرشادات الفاخرة
 */
export function triggerPWAInstall() {
    // إذا كان التطبيق مثبتاً بالفعل ويعمل كـ Standalone
    if (isRunningStandalone()) {
        if (typeof window.showLuxuryToast === 'function') {
            window.showLuxuryToast('✨ تطبيق دار التطريز مثبت ويعمل بكامل مزاياه على جهازك!');
        } else {
            alert('تطبيق دار التطريز مثبت ويعمل بالفعل على جهازك.');
        }
        return;
    }

    // إذا كان متصفح أندرويد / كروم وأطلق حدث beforeinstallprompt
    if (deferredPWAInstallPrompt) {
        deferredPWAInstallPrompt.prompt();
        deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                deferredPWAInstallPrompt = null;
            }
        });
        return;
    }

    // لأجهزة آيفون أو المتصفحات التي لا تدعم beforeinstallprompt المباشر
    openPWAInstallGuideModal();
}

/**
 * نافذة إرشادية فاخرة ومصورة لتثبيت التطبيق على آيفون وآيباد
 */
export function openPWAInstallGuideModal() {
    const existingModal = document.getElementById('pwa-install-guide-modal');
    if (existingModal) existingModal.remove();

    const isIos = isIOSDevice();
    const isScreen = window.location.pathname.includes('/screen');
    const logoSrc = isScreen ? '../images/logo.jpg' : 'images/logo.jpg';

    const modalHtml = `
        <div id="pwa-install-guide-modal" class="fixed inset-0 z-[170] modal-glass-backdrop flex items-center justify-center p-3 sm:p-4" dir="rtl">
            <div class="lux-modal-box w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-white border border-stone-300 relative text-center">
                
                <button type="button" onclick="document.getElementById('pwa-install-guide-modal').remove()" class="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer">✕</button>

                <img src="${logoSrc}" alt="Tatriza App" class="w-16 h-16 rounded-2xl mx-auto object-cover shadow-md border border-stone-200">
                
                <div>
                    <h3 class="font-display font-black text-base sm:text-lg text-stone-900">
                        تثبيت تطبيق دار التطريز (TATRIZA)
                    </h3>
                    <p class="text-xs text-stone-500 font-medium mt-1">
                        استمتع بتجربة تطبيق مستقلة وسريعة على هاتفك بشاشة كاملة وبدون أشرطة المتصفح.
                    </p>
                </div>

                <!-- خطوات التثبيت -->
                <div class="space-y-2.5 text-right bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-800">
                    ${isIos ? `
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                            <div>
                                <span class="font-bold block">انقر على زر المشاركة:</span>
                                <span class="text-stone-500 text-[11px]">في أسفل شاشة متصفح سفاري (أيقونة المربع بسهم للأعلى <span class="text-sm font-bold">⎋</span>).</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                            <div>
                                <span class="font-bold block">اختر "إضافة إلى الشاشة الرئيسية":</span>
                                <span class="text-stone-500 text-[11px]">مرر لأسفل واضغط على خيار (Add to Home Screen ➕).</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0">3</span>
                            <div>
                                <span class="font-bold block">اضغط "إضافة" (Add):</span>
                                <span class="text-stone-500 text-[11px]">ستظهر أيقونة الدار الرسمية على شاشة هاتفك فوراً!</span>
                            </div>
                        </div>
                    ` : `
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">1</span>
                            <div>
                                <span class="font-bold block">قائمة خيارات المتصفح:</span>
                                <span class="text-stone-500 text-[11px]">اضغط على زر النقاط الثلاث (⋮) في أعلى أو أسفل المتصفح.</span>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0">2</span>
                            <div>
                                <span class="font-bold block">اختر "تثبيت التطبيق" أو "إضافة للشاشة الرئيسية":</span>
                                <span class="text-stone-500 text-[11px]">سيتم تثبيت التطبيق كبرنامج مستقل على شاشتك.</span>
                            </div>
                        </div>
                    `}
                </div>

                <div class="pt-2">
                    <button type="button" onclick="document.getElementById('pwa-install-guide-modal').remove()" class="w-full bg-brand hover:bg-brand-dark text-white font-bold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-xs transition cursor-pointer">
                        فهمت ذلك، شكراً لك
                    </button>
                </div>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

if (typeof window !== 'undefined') {
    window.triggerPWAInstall = triggerPWAInstall;
    window.openPWAInstallGuideModal = openPWAInstallGuideModal;
}
