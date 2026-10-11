// ==========================================
// محرك وهوية تطبيق الويب التقدمي (pwa.js)
// دار التطريز TATRIZA - بطاقة هوية التطبيق لنظام التشغيل والتثبيت الفوري
// ==========================================

let deferredPWAInstallPrompt = null;

// 1. تسجيل الـ Service Worker تلقائياً وتفعيل الكاش السريع
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isScreen = window.location.pathname.includes('/screen');
        const swPath = isScreen ? '../sw.js' : './sw.js';
        navigator.serviceWorker.register(swPath)
            .then(reg => {
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
        
        // تحديث حالة البطاقة في الشريط الجانبي
        updateDrawerAppStatus(false);
    });

    window.addEventListener('appinstalled', () => {
        deferredPWAInstallPrompt = null;
        updateDrawerAppStatus(true);
        if (typeof window.showToast === 'function') {
            window.showToast('success', 'تم تثبيت تطبيق دار التطريز على شاشتك الرئيسية بنجاح.', 'تطبيق الدار');
        }
    });
}

/**
 * فحص هل الجهاز يعمل بنظام iOS (iPhone / iPad)
 */
export function isIOSDevice() {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * فحص هل التطبيق مفتوح مسبقاً في وضع التثبيت المستقل (Standalone PWA)
 */
export function isRunningStandalone() {
    if (typeof window === 'undefined') return false;
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
           (window.navigator && window.navigator.standalone === true);
}

/**
 * تحديث نص حالة التطبيق في درج الخيارات
 */
function updateDrawerAppStatus(isInstalled) {
    const statusTextEls = document.querySelectorAll('.drawer-app-status-text');
    statusTextEls.forEach(el => {
        if (isInstalled || isRunningStandalone()) {
            el.innerText = 'يعمل في وضع النظام المستقل (نشط)';
            el.parentElement.classList.remove('text-amber-300/90');
            el.parentElement.classList.add('text-emerald-300');
        } else {
            el.innerText = 'تثبيت فوري شاشة كاملة بدون متصفح';
        }
    });
}

/**
 * تشغيل عملية التثبيت المباشرة لنظام التشغيل
 */
export function triggerPWAInstall() {
    if (isRunningStandalone()) {
        if (typeof window.showToast === 'function') {
            window.showToast('info', 'تطبيق دار التطريز مثبت ويعمل بكامل مزاياه على جهازك.', 'التطبيق نشط');
        }
        return;
    }

    if (deferredPWAInstallPrompt) {
        deferredPWAInstallPrompt.prompt();
        deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                deferredPWAInstallPrompt = null;
                updateDrawerAppStatus(true);
            }
        });
        return;
    }

    // إذا لم يتوفر حدث التثبيت المباشر، نفتح بطاقة الهوية الملكية التفاعلية
    openAppIdentityModal();
}

/**
 * فتح بطاقة هوية التطبيق لنظام التشغيل (Royal OS App Identity Modal)
 * تصميم خرافي، احترافي، يبرز هوية التطبيق والمواصفات بدقة عالية جداً
 */
export function openAppIdentityModal() {
    const existingModal = document.getElementById('app-identity-modal');
    if (existingModal) existingModal.remove();

    const isIos = isIOSDevice();
    const isStandalone = isRunningStandalone();
    const isScreen = window.location.pathname.includes('/screen');
    const icon192 = isScreen ? '../images/icon-192.png' : 'images/icon-192.png';
    const icon512 = isScreen ? '../images/icon-512.png' : 'images/icon-512.png';
    const currentUrl = window.location.href;

    const modalHtml = `
    <div id="app-identity-modal" class="fixed inset-0 z-[180] modal-glass-backdrop flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
        <div class="relative w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white border border-amber-400/50 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <!-- خلفيات الضوء والهالة الملكية -->
            <div class="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-900/35 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-400/5 rounded-full blur-2xl pointer-events-none"></div>

            <!-- زر الإغلاق العلوي -->
            <button type="button" onclick="closeAppIdentityModal()" class="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer z-20 border border-white/10" title="إغلاق">
                ✕
            </button>

            <!-- الترويسة وشعار الهوية البارز -->
            <div class="relative z-10 text-center space-y-3 pt-1">
                
                <!-- وسم نظام التشغيل الرسمي -->
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-black tracking-wide shadow-xs">
                    <span>⚜️</span>
                    <span>وثيقة هوية التطبيق المعتمدة لنظام التشغيل</span>
                    <span>•</span>
                    <span>OS CERTIFIED</span>
                </div>

                <!-- الأيقونة الملكية الفاخرة مع حلقة الإضاءة الذهبية -->
                <div class="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mt-2">
                    <div class="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 blur-md opacity-60 animate-pulse"></div>
                    <div class="relative w-full h-full rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[2px] shadow-2xl shadow-black/80">
                        <img src="${icon512}" onerror="this.src='${icon192}'" alt="Tatriza App Official Icon" class="w-full h-full object-cover rounded-[22px]">
                    </div>
                    <!-- ختم التوثيق الأخضر -->
                    <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-stone-900" title="موثق رسمياً">
                        ✓
                    </div>
                </div>

                <!-- اسم التطبيق والهوية -->
                <div>
                    <h3 class="font-display font-black text-xl sm:text-2xl text-stone-100 tracking-tight">
                        دار التطريز <span class="text-amber-400">TATRIZA</span>
                    </h3>
                    <p class="font-heritage text-xs sm:text-sm text-amber-200/90 font-bold mt-0.5">
                        تطبيق الويب الملكي المستقل | Royal Standalone Edition
                    </p>
                    <div class="flex items-center justify-center gap-2 mt-2 text-[9px] sm:text-[10px] text-stone-400 font-mono">
                        <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">ID: OM.TATRIZA.APP.V3</span>
                        <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Build 2026.10</span>
                        <span class="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40">TLS 1.3 SSL</span>
                    </div>
                </div>

            </div>

            <!-- شبكة المواصفات التقنية الفاخرة بدقة عالية (4 كروت زجاجية) -->
            <div class="relative z-10 grid grid-cols-2 gap-2 sm:gap-2.5 mt-5">
                <div class="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-right">
                    <div class="flex items-center gap-1.5 text-amber-400 text-xs">
                        <span>⚡</span>
                        <span class="font-bold text-[11px] text-stone-200">الاستجابة والسرعة</span>
                    </div>
                    <span class="text-[10px] text-stone-300 block mt-1 font-medium">0.2 ثانية (فوري بالذاكرة الذكية)</span>
                </div>

                <div class="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-right">
                    <div class="flex items-center gap-1.5 text-amber-400 text-xs">
                        <span>📱</span>
                        <span class="font-bold text-[11px] text-stone-200">وضع العرض بالنظام</span>
                    </div>
                    <span class="text-[10px] text-stone-300 block mt-1 font-medium">شاشة كاملة دون متصفح (Standalone)</span>
                </div>

                <div class="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-right">
                    <div class="flex items-center gap-1.5 text-amber-400 text-xs">
                        <span>📶</span>
                        <span class="font-bold text-[11px] text-stone-200">وضع دون اتصال</span>
                    </div>
                    <span class="text-[10px] text-stone-300 block mt-1 font-medium">مفعّل (Offline Caching Ready)</span>
                </div>

                <div class="p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-right">
                    <div class="flex items-center gap-1.5 text-amber-400 text-xs">
                        <span>💾</span>
                        <span class="font-bold text-[11px] text-stone-200">حجم التطبيق بالجهاز</span>
                    </div>
                    <span class="text-[10px] text-stone-300 block mt-1 font-medium">~ 1.8 ميجابايت (فائق الخفة)</span>
                </div>
            </div>

            <!-- بطاقة التثبيت التفاعلية المتكيفة بحسب نظام التشغيل -->
            <div class="relative z-10 mt-5 pt-4 border-t border-white/10">
                
                ${isStandalone ? `
                    <!-- حالة التطبيق مثبت ويعمل كـ Standalone -->
                    <div class="bg-emerald-950/60 border border-emerald-500/60 rounded-2xl p-4 text-center space-y-2">
                        <div class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xl font-bold border border-emerald-400/40">
                            ✓
                        </div>
                        <h4 class="font-display font-black text-sm text-emerald-200">تطبيق دار التطريز يعمل بنظام مستقل على جهازك!</h4>
                        <p class="text-[11px] text-emerald-300/80">أنت تتصفح المعرض حالياً من خلال تطبيق النظام الرسمي بأعلى سرعة وأداء.</p>
                    </div>
                ` : isIos ? `
                    <!-- خطوات تثبيت نظام Apple iOS (iPhone / iPad) -->
                    <div class="bg-white/[0.04] border border-amber-400/30 rounded-2xl p-4 space-y-3 text-right">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                <span>🍏</span> خطوات التثبيت على هواتف آيفون (Safari):
                            </span>
                            <span class="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 font-bold">iOS Easy</span>
                        </div>

                        <div class="space-y-2.5 text-xs text-stone-200">
                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                                <div>
                                    <span class="font-bold">انقر على زر المشاركة:</span>
                                    <span class="text-stone-400 text-[11px] block mt-0.5">في شريط سفاري السفلي (أيقونة المربع مع السهم للأعلى <span class="font-bold text-amber-300 text-sm">⎋</span>).</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                                <div>
                                    <span class="font-bold">اختر "إضافة إلى الشاشة الرئيسية":</span>
                                    <span class="text-stone-400 text-[11px] block mt-0.5">مرر القائمة واضغط على (Add to Home Screen ➕).</span>
                                </div>
                            </div>

                            <div class="flex items-start gap-2.5">
                                <span class="w-5 h-5 rounded-full bg-emerald-400 text-stone-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                                <div>
                                    <span class="font-bold">اضغط "إضافة" (Add):</span>
                                    <span class="text-stone-400 text-[11px] block mt-0.5">ستظهر أيقونة الدار الرسمية على شاشة تطبيقاتك فوراً كبرنامج مستقل!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- زر التثبيت المباشر لأندرويد وكروم والحواسيب -->
                    <div class="space-y-3">
                        <button type="button" onclick="executeOSInstallAction()" class="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-display font-black text-sm h-12 px-6 rounded-2xl shadow-lg shadow-amber-950/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 border border-amber-300">
                            <span>📲</span>
                            <span>تثبيت التطبيق على جهازك بنقرة واحدة</span>
                        </button>
                        <p class="text-[10px] text-stone-400 text-center font-medium">
                            متوافق مع أندرويد، ويندوز، ماك، وكروم • لا يتطلب تنزيل ملفات إضافية
                        </p>
                    </div>
                `}

            </div>

            <!-- زر الإغلاق السفلي الفاخر -->
            <div class="relative z-10 pt-4 text-center">
                <button type="button" onclick="closeAppIdentityModal()" class="text-stone-400 hover:text-stone-200 text-xs font-bold transition cursor-pointer">
                    إغلاق البطاقة والعودة للمعرض
                </button>
            </div>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * إغلاق نافذة بطاقة هوية التطبيق
 */
export function closeAppIdentityModal() {
    const modal = document.getElementById('app-identity-modal');
    if (modal) modal.remove();
}

/**
 * تنفيذ إجراء التثبيت عند الضغط على الزر داخل النافذة
 */
export function executeOSInstallAction() {
    if (deferredPWAInstallPrompt) {
        deferredPWAInstallPrompt.prompt();
        deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                deferredPWAInstallPrompt = null;
                updateDrawerAppStatus(true);
                closeAppIdentityModal();
            }
        });
    } else {
        // في حالة متصفحات الحواسيب أو عدم وجود برومبت مباشر
        if (typeof window.showToast === 'function') {
            window.showToast('info', 'يمكنك تثبيت التطبيق من أيقونة التثبيت في شريط عنوان المتصفح (⊕).', 'تثبيت التطبيق');
        } else {
            alert('انقر على أيقونة التثبيت في شريط عنوان المتصفح أو قائمة الخيارات لتثبيت التطبيق على جهازك.');
        }
    }
}

// تصدير الدوال للنطاق العام للمتصفح
if (typeof window !== 'undefined') {
    window.triggerPWAInstall = triggerPWAInstall;
    window.openAppIdentityModal = openAppIdentityModal;
    window.closeAppIdentityModal = closeAppIdentityModal;
    window.executeOSInstallAction = executeOSInstallAction;
    window.isIOSDevice = isIOSDevice;
    window.isRunningStandalone = isRunningStandalone;
    window.openPWAInstallGuideModal = openAppIdentityModal; // توافق مع الاستدعاءات القديمة
}
