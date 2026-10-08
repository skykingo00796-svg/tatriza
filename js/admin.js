
// ==========================================
// تنسيق ومعاينة أبعاد السجادة تلقائياً (Length × Width سم)
// ==========================================
export function updateDimensionsPreview(mode = 'new') {
    const lengthInput = document.getElementById(`${mode}-dim-length`);
    const widthInput = document.getElementById(`${mode}-dim-width`);
    const previewEl = document.getElementById(`${mode}-dimensions-preview`);

    if (!previewEl) return;

    const len = lengthInput && lengthInput.value ? lengthInput.value.trim() : '';
    const wid = widthInput && widthInput.value ? widthInput.value.trim() : '';

    if (len && wid) {
        previewEl.innerText = `${len} × ${wid} سم`;
        previewEl.classList.remove('opacity-50');
    } else if (len || wid) {
        previewEl.innerText = `${len || '0'} × ${wid || '0'} سم`;
        previewEl.classList.add('opacity-50');
    } else {
        previewEl.innerText = `0 × 0 سم`;
        previewEl.classList.add('opacity-50');
    }
}
window.updateDimensionsPreview = updateDimensionsPreview;

// ==========================================
// ملف إدارة الأمان وصلاحيات الأدمين والمنتجات (admin.js)
// ==========================================

import { showToast } from './modals.js';
import { 
    isFirebaseConfigured, 
    getActiveFirebaseConfig, 
    saveFirebaseConfig, 
    saveCarpetToCloud, 
    updateCarpetStatusInCloud, 
    updateCarpetImagesInCloud,
    updateCarpetInCloud,
    uploadCarpetImages,
    deleteCarpetFromCloud, 
    compressImage, 
    exportCarpetsBackup,
    fileToBase64,
    formatReadableDate,
    uploadCarpetVideo,
    getVideoFromIndexedDB,
    adminLoginWithCloud,
    adminLogoutFromCloud,
    subscribeToAdminAuth,
    getCurrentAdminUser
} from './firebase-admin.js';

// ==========================================
// توليد كود القطعة التسلسلي الاحترافي (Luxury Sequential SKU)
// مثال: TATR-001A (أجمي)، TATR-002S (حرير)، TATR-003T (تراثي)
// ==========================================
export function getCategoryCode(category) {
    if (!category) return 'A';

    // 1. فحص التصنيفات المخصصة المحفوظة (بالمعرف، الرمز، الاسم العربي، أو الاسم الإنجليزي)
    try {
        const customCats = JSON.parse(localStorage.getItem('tatr_custom_categories') || '[]');
        const target = String(category).trim().toLowerCase();
        const found = customCats.find(c => 
            (c.id && c.id.toLowerCase() === target) ||
            (c.code && c.code.toLowerCase() === target) ||
            (c.name && c.name.trim().toLowerCase() === target) ||
            (c.englishName && c.englishName.trim().toLowerCase() === target)
        );
        if (found && found.code) {
            return String(found.code).trim();
        }
    } catch (e) {}

    // 2. فحص التصنيفات الافتراضية
    const defaultMap = {
        ajami: 'A',
        silk: 'S',
        traditional: 'T',
        modern: 'M',
        wool: 'W'
    };

    const catKey = String(category).trim().toLowerCase();
    if (defaultMap[catKey]) {
        return defaultMap[catKey];
    }

    return String(category).trim().slice(0, 2);
}

export function generateNextProductId(category, allCarpets = []) {
    let maxNum = 0;
    
    (allCarpets || []).forEach(carpet => {
        if (!carpet) return;
        
        // 1. فحص حقل itemNumber إذا كان موجوداً
        if (typeof carpet.itemNumber === 'number' && carpet.itemNumber > maxNum) {
            maxNum = carpet.itemNumber;
        }
        
        // 2. فحص نمط TATR-####X أو TATR-####Sp (حروف وأرقام في نهاية الكود)
        if (carpet.id && typeof carpet.id === 'string') {
            const match = carpet.id.match(/^TATR-(\d+)([A-Za-z0-9_-]*)$/i);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
            } else {
                // فحص نمط carp-# القديم (carp-1, carp-2, ...)
                const oldMatch = carpet.id.match(/^carp-(\d+)$/i);
                if (oldMatch) {
                    const num = parseInt(oldMatch[1], 10);
                    if (num < 10000 && num > maxNum) {
                        maxNum = num;
                    }
                }
            }
        }
    });

    const nextNum = maxNum + 1;
    // تنسيق الـ SKU ليكون TATR- متبوعاً بالرقم من 4 خانات (مثل 0010) ثم رمز التصنيف (مثل Sp)
    const padded = String(nextNum).padStart(4, '0');
    const catCode = getCategoryCode(category);
    return {
        id: `TATR-${padded}${catCode}`,
        itemNumber: nextNum
    };
}

export function updateNewProductSkuPreview(allCarpets = []) {
    const previewBadge = document.getElementById('new-product-sku-preview');
    if (!previewBadge) return;
    
    const catSelect = document.getElementById('new-category');
    const selectedCat = catSelect ? catSelect.value : 'ajami';
    const nextProduct = generateNextProductId(selectedCat, allCarpets);
    previewBadge.innerText = nextProduct.id;
}
window.updateNewProductSkuPreview = updateNewProductSkuPreview;

// ==========================================
// نظام فحص وإدارة الفيديو الاستعراضي للسجاد (بحد أقصى 20 ثانية)
// ==========================================
let pendingNewCarpetVideoFile = null;
let pendingNewCarpetVideoDuration = 0;
let pendingEditNewVideoFile = null;
let pendingEditNewVideoDuration = 0;
let currentEditingCarpetVideo = null;

export function validateCarpetVideo(file, maxDuration = 20) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('video/')) {
            resolve({ valid: false, error: 'الملف المختار ليس مقطع فيديو صالح.' });
            return;
        }

        if (file.size > 35 * 1024 * 1024) {
            resolve({ valid: false, error: 'حجم ملف الفيديو كبير جداً (أكثر من 35MB). يُرجى اختيار مقطع خفيف وسريع.' });
            return;
        }

        const video = document.createElement('video');
        video.preload = 'metadata';
        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(objectUrl);
            const duration = Math.round(video.duration || 0);
            if (duration > maxDuration) {
                resolve({ 
                    valid: false, 
                    duration: duration, 
                    error: `مدة الفيديو المختار (${duration} ثانية) تتجاوز الحد الأقصى المسموح به (${maxDuration} ثانية). يُرجى اختيار مقطع مدته 20 ثانية كحد أقصى للحفاظ على سرعة المتجر.` 
                });
            } else {
                resolve({ valid: true, duration: duration, file: file });
            }
        };

        video.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ valid: false, error: 'تعذر قراءة بيانات الفيديو. يرجى التأكد من أن صيغة الملف صالحة (MP4/WebM/MOV).' });
        };
    });
}

export function initVideoUploadHandlers() {
    const newVideoInput = document.getElementById('new-video-file');
    if (newVideoInput && !newVideoInput.dataset.bound) {
        newVideoInput.dataset.bound = 'true';
        newVideoInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const res = await validateCarpetVideo(file, 20);
            if (!res.valid) {
                showToast(res.error, 'error', 'مدة الفيديو', 6000);
                newVideoInput.value = '';
                window.clearNewVideoSelection();
                return;
            }

            pendingNewCarpetVideoFile = file;
            pendingNewCarpetVideoDuration = res.duration;

            const previewWrapper = document.getElementById('new-video-preview-wrapper');
            const previewVideo = document.getElementById('new-video-preview');
            const durationBadge = document.getElementById('new-video-duration-badge');

            if (previewWrapper && previewVideo) {
                previewVideo.src = URL.createObjectURL(file);
                if (durationBadge) durationBadge.innerText = `${res.duration} ثانية (صالح ✅)`;
                previewWrapper.classList.remove('hidden');
                previewVideo.play().catch(() => {});
            }

            showToast(`تم قبول الفيديو بنجاح! المدة: ${res.duration} ثانية ✨`, 'success', 'فيديو صالح', 3000);
        });
    }

    const editVideoInput = document.getElementById('edit-video-file');
    if (editVideoInput && !editVideoInput.dataset.bound) {
        editVideoInput.dataset.bound = 'true';
        editVideoInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const res = await validateCarpetVideo(file, 20);
            if (!res.valid) {
                showToast(res.error, 'error', 'مدة الفيديو', 6000);
                editVideoInput.value = '';
                return;
            }

            pendingEditNewVideoFile = file;
            pendingEditNewVideoDuration = res.duration;
            currentEditingCarpetVideo = 'has_new_pending_video';

            const previewWrapper = document.getElementById('edit-video-preview-wrapper');
            const previewVideo = document.getElementById('edit-video-preview');
            const durationBadge = document.getElementById('edit-video-duration-badge');

            if (previewWrapper && previewVideo) {
                previewVideo.src = URL.createObjectURL(file);
                if (durationBadge) durationBadge.innerText = `${res.duration} ثانية (جديد ✅)`;
                previewWrapper.classList.remove('hidden');
                previewVideo.play().catch(() => {});
            }

            showToast(`تم اختيار فيديو جديد! المدة: ${res.duration} ثانية ✨`, 'success', 'فيديو جديد', 3000);
        });
    }
}

window.clearNewVideoSelection = () => {
    const input = document.getElementById('new-video-file');
    if (input) input.value = '';
    const wrapper = document.getElementById('new-video-preview-wrapper');
    const previewVideo = document.getElementById('new-video-preview');
    if (previewVideo) {
        previewVideo.pause();
        previewVideo.src = '';
    }
    if (wrapper) wrapper.classList.add('hidden');
    pendingNewCarpetVideoFile = null;
    pendingNewCarpetVideoDuration = 0;
};

window.clearEditVideoSelection = () => {
    const input = document.getElementById('edit-video-file');
    if (input) input.value = '';
    const wrapper = document.getElementById('edit-video-preview-wrapper');
    const previewVideo = document.getElementById('edit-video-preview');
    if (previewVideo) {
        previewVideo.pause();
        previewVideo.src = '';
    }
    if (wrapper) wrapper.classList.add('hidden');
    pendingEditNewVideoFile = null;
    pendingEditNewVideoDuration = 0;
    currentEditingCarpetVideo = null;
    showToast("تمت إزالة الفيديو من القطعة. اضغط حفظ التعديلات للتأكيد.", "info", "حذف الفيديو", 3500);
};

export function checkAdminPermission() {
    const cloudUser = getCurrentAdminUser();
    return Boolean(cloudUser && cloudUser.uid);
}
window.checkAdminPermission = checkAdminPermission;

export function initAdminShortcut() {
    // 1. اختصار لوحة المفاتيح: Cmd+Shift+A (Mac) أو Ctrl+Shift+A (Windows/Linux)
    window.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        
        if (modifier && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'ش')) {
            e.preventDefault();
            triggerAdminLogin();
        }
    });

    // 2. فحص الرابط السري عبر الهاش (#admin)
    if (window.location.hash === '#admin') {
        setTimeout(() => triggerAdminLogin(), 300);
    }
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#admin') {
            triggerAdminLogin();
        }
    });

    // 3. نقر خفي على عنوان الهيدر أو الوصف (5 نقرات سريعة) بدون أي كود في HTML
    let logoTaps = 0;
    let logoTapTimer = null;
    // استهداف الحاوية التي تحتوي على TATRIZA وعنوان "دار التطريز وسجاد يدوية" معاً
    const headerTitleContainer = document.querySelector('header h1')?.parentElement || document.querySelector('header h1');
    if (headerTitleContainer) {
        headerTitleContainer.addEventListener('click', () => {
            logoTaps++;
            clearTimeout(logoTapTimer);
            logoTapTimer = setTimeout(() => { logoTaps = 0; }, 1800);
            if (logoTaps >= 5) {
                logoTaps = 0;
                triggerAdminLogin();
            }
        });
    }
}

function triggerAdminLogin() {
    openAdminAuthModal();
}

export function openAdminAuthModal() {
    let modal = document.getElementById('admin-auth-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-auth-modal';
        modal.className = "fixed inset-0 z-[150] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300";
        modal.onclick = (e) => {
            if (e.target === modal) window.closeAdminAuthModal();
        };
        document.body.appendChild(modal);
    }

    const isAdmin = checkAdminPermission();
    const cloudConnected = isFirebaseConfigured();
    const currentAdmin = getCurrentAdminUser();
    const adminEmail = currentAdmin ? currentAdmin.email : (localStorage.getItem('tatr_admin_email') || 'المسؤول المعتمد');

    if (isAdmin) {
        modal.innerHTML = `
            <div class="bg-[#fffbf7] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-center" dir="rtl">
                <button onclick="window.closeAdminAuthModal()" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer">✕</button>
                
                <div class="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300/60 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs text-amber-700">
                    👑
                </div>

                <h3 class="text-xl font-extrabold text-stone-900 mb-1">جلسة الإدارة السحابية نشطة</h3>
                <p class="text-xs text-stone-600 mb-3 leading-relaxed">
                    مسجل حالياً بحساب: <span class="font-bold font-mono text-brand dir-ltr inline-block px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-xs">${adminEmail}</span>
                </p>

                <!-- حالة الاتصال بالسحابة -->
                <div class="mb-5 p-3 rounded-2xl border text-right flex items-center justify-between gap-2 ${cloudConnected ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-amber-50/80 border-amber-200 text-amber-900'}">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full ${cloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold">${cloudConnected ? 'السحابة متصلة ومحمية بـ Firebase Auth' : 'السحابة غير مهيأة'}</span>
                            <span class="text-[10px] text-stone-500 font-medium">صلاحيات الإضافة والتعديل والحذف مفعلة</span>
                        </div>
                    </div>
                    <button type="button" onclick="window.openFirebaseConfigModal()" class="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 shadow-xs cursor-pointer">
                        إعدادات السحابة
                    </button>
                </div>

                <!-- أدوات إدارة البيانات -->
                <div class="space-y-2.5 mb-6">
                    <button type="button" onclick="window.triggerExportBackup()" class="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold transition shadow-xs cursor-pointer">
                        <span class="flex items-center gap-2">💾 تحميل نسخة احتياطية من كل المنتجات (JSON)</span>
                        <span class="text-stone-400">←</span>
                    </button>
                </div>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="window.executeAdminLogout()" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm text-sm cursor-pointer flex items-center justify-center gap-1.5">
                        <span>🚪</span>
                        <span>تسجيل الخروج السحابي</span>
                    </button>
                    <button onclick="window.closeAdminAuthModal()" class="flex-1 bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl transition text-sm cursor-pointer">
                        إغلاق
                    </button>
                </div>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div class="bg-[#fffbf7] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-center" dir="rtl" id="admin-modal-card">
                <button onclick="window.closeAdminAuthModal()" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer">✕</button>
                
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs" style="background-color: rgba(124, 29, 60, 0.1); color: var(--brand-color);">
                    🔐
                </div>

                <h3 class="text-xl font-extrabold text-stone-900 mb-1">تسجيل دخول مسؤول دار التطريز</h3>
                <p class="text-xs text-stone-600 mb-5">تسجيل الدخول المشفر عبر Google Firebase Authentication</p>

                <form onsubmit="window.executeAdminLogin(event)" class="space-y-3.5 text-right">
                    <div>
                        <label class="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للمسؤول</label>
                        <input type="email" id="admin-email-input" required placeholder="admin@tatriza.com" dir="ltr" class="search-input-focus w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 outline-none transition duration-200 font-mono text-left">
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-stone-700 mb-1">كلمة المرور السحابية</label>
                        <div class="relative">
                            <input type="password" id="admin-password-input" required placeholder="••••••••••••" dir="ltr" class="search-input-focus w-full bg-white border border-stone-300 rounded-xl pr-4 pl-11 py-2.5 text-sm text-stone-900 outline-none transition duration-200 font-mono text-left">
                            <button type="button" onclick="window.toggleAdminPasswordVisibility()" class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer" title="إظهار / إخفاء">
                                <span id="toggle-pwd-icon" class="text-sm">👁️</span>
                            </button>
                        </div>
                    </div>

                    <p id="admin-login-error" class="hidden text-xs text-red-600 font-semibold p-2.5 bg-red-50 border border-red-200 rounded-xl text-right leading-relaxed">
                    </p>

                    <div class="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button type="submit" id="admin-login-submit-btn" class="flex-1 btn-liquid-emerald font-display text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5">
                            <span>🔐</span>
                            <span id="admin-login-btn-text">تأكيد الدخول المشفر</span>
                        </button>
                        <button type="button" onclick="window.closeAdminAuthModal()" class="bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-2.5 px-4 rounded-xl transition text-xs sm:text-sm cursor-pointer">
                            إلغاء
                        </button>
                    </div>

                    <div class="pt-2 text-center border-t border-stone-200/70">
                        <span class="text-[10px] text-stone-500 font-medium">محمي بالكامل عبر سحابة Google Firebase (SSL / JWT Encrypted)</span>
                    </div>
                </form>
            </div>
        `;
    }

    modal.classList.remove('hidden');

    setTimeout(() => {
        const emailInput = document.getElementById('admin-email-input');
        if (emailInput) {
            const savedEmail = localStorage.getItem('tatr_admin_email') || '';
            if (savedEmail) emailInput.value = savedEmail;
            emailInput.focus();
        }
    }, 100);
}

if (typeof window !== 'undefined') {
    window.openAdminAuthModal = openAdminAuthModal;
    
    window.closeAdminAuthModal = function() {
        const modal = document.getElementById('admin-auth-modal');
        if (modal) modal.classList.add('hidden');
    };

    window.toggleAdminPasswordVisibility = function() {
        const input = document.getElementById('admin-password-input');
        const icon = document.getElementById('toggle-pwd-icon');
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.innerText = '🙈';
        } else {
            input.type = 'password';
            if (icon) icon.innerText = '👁️';
        }
    };

    window.executeAdminLogout = async function() {
        try {
            await adminLogoutFromCloud();
        } catch (e) {
            console.warn("Logout cloud error:", e);
        }
        localStorage.removeItem('tatr_is_admin');
        localStorage.removeItem('tatr_login_time');
        localStorage.removeItem('tatr_admin_email');
        window.closeAdminAuthModal();
        showToast("تم تسجيل الخروج من وضع المسؤول بنجاح.", "info", "تسجيل الخروج", 2000);
        setTimeout(() => location.reload(), 500);
    };

    window.executeAdminLogin = async function(e) {
        if (e) e.preventDefault();
        const emailInput = document.getElementById('admin-email-input');
        const passInput = document.getElementById('admin-password-input');
        const errorEl = document.getElementById('admin-login-error');
        const submitBtn = document.getElementById('admin-login-submit-btn');
        const btnText = document.getElementById('admin-login-btn-text');
        const card = document.getElementById('admin-modal-card');

        const email = emailInput ? emailInput.value.trim() : '';
        const pass = passInput ? passInput.value : '';

        if (!email || !pass) return;

        if (errorEl) errorEl.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.innerText = "جاري التحقق عبر سيرفرات جوجل...";

        try {
            const user = await adminLoginWithCloud(email, pass);
                        localStorage.setItem('tatr_admin_email', user.email || email);
            localStorage.setItem('tatr_login_time', Date.now().toString());

            window.closeAdminAuthModal();
            showToast(`مرحباً بك! تم التحقق السحابي وتفعيل صلاحيات الإدارة بنجاح (${user.email}).`, "success", "المسؤول المعتمد", 3000);
            setTimeout(() => location.reload(), 600);
        } catch (authErr) {
            console.warn("Admin login error:", authErr);
            let userMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات المسجلة في Firebase Console.";
            
            if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
                userMsg = "البريد الإلكتروني أو كلمة المرور غير مطابقة لحساب المسؤول في Firebase.";
            } else if (authErr.code === 'auth/too-many-requests') {
                userMsg = "تم حظر محاولات الدخول مؤقتاً لحماية حسابك بسبب تكرار المحاولات الخاطئة. يرجى الانتظار بضع دقائق.";
            } else if (authErr.code === 'auth/operation-not-allowed') {
                userMsg = "يرجى تفعيل خيار (Email/Password) في Firebase Console -> Authentication -> Sign-in method.";
            } else if (authErr.code === 'auth/network-request-failed') {
                userMsg = "تعذر الاتصال بسيرفرات Firebase. يرجى التأكد من اتصال الإنترنت.";
            } else if (authErr.message) {
                userMsg = `فشل التحقق: ${authErr.message}`;
            }

            if (errorEl) {
                errorEl.innerText = userMsg;
                errorEl.classList.remove('hidden');
            }
            if (card) {
                card.classList.remove('tatr-shake');
                void card.offsetWidth;
                card.classList.add('tatr-shake');
            }
            if (passInput) {
                passInput.classList.add('border-red-500');
                passInput.select();
            }
            showToast(userMsg, "error", "خطأ في تسجيل الدخول", 4000);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.innerText = "تأكيد الدخول المشفر";
        }
    };
}

export function handleMobileAdminTap() {
    // دالة توافقية - تم التحول لنظام الهاش الخفي (#admin) واختصارات لوحة المفاتيح
}

export async function toggleStockStatus(carpetId, allCarpets, callback) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    const newStatus = carpet.status === 'out_of_stock' ? 'available' : 'out_of_stock';
    carpet.status = newStatus;
    const now = Date.now();
    carpet.updatedAt = now;
    carpet.updatedDate = formatReadableDate(now);
    
    // 1. تحديث محلي فوري
    localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
    if (callback) callback(allCarpets);

    showToast(newStatus === 'out_of_stock' ? `تم تحويل "${carpet.title}" إلى قسم (حياكة حسب الطلب) 🪄` : `تم تحويل "${carpet.title}" إلى قسم (تسليم فوري) ⚡`, 'info', 'نمط التوفر');

    // 2. مزامنة سحابية مع Firebase إن كانت مهيأة
    if (isFirebaseConfigured()) {
        try {
            await updateCarpetStatusInCloud(carpetId, newStatus);
        } catch (e) {
            console.warn("Cloud status update failed:", e);
        }
    }
}

export async function setCarpetPrimaryImage(carpetId, imageIndex, allCarpets, callback) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;
    
    let images = carpet.images && carpet.images.length > 0 ? [...carpet.images] : [carpet.image];
    if (images.length <= 1 || imageIndex <= 0 || imageIndex >= images.length) return;

    // نقل الصورة المختارة لتصبح في الموقع الأول [0]
    const chosenImage = images.splice(imageIndex, 1)[0];
    images.unshift(chosenImage);
    
    carpet.images = images;
    carpet.image = chosenImage;

    // 1. تحديث محلي فوري
    try {
        localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
    } catch(e) {}
    
    if (callback) callback(allCarpets);

    // 2. تحديث سحابي فوري في Cloud Firestore إن كانت مهيأة
    if (isFirebaseConfigured()) {
        try {
            await updateCarpetImagesInCloud(carpetId, carpet.images, carpet.image);
            showToast("تم تعيين هذه الصورة كغلاف رئيسي للسجادة بنجاح وحفظها في السحابة! ⭐", "success", "الصورة الرئيسية");
        } catch (cloudErr) {
            console.warn("Cloud primary image update failed:", cloudErr);
            showToast("تم تعيين الصورة كغلاف رئيسي محلياً", "info", "الصورة الرئيسية");
        }
    } else {
        showToast("تم تعيين هذه الصورة كغلاف رئيسي للسجادة بنجاح! ⭐", "success", "الصورة الرئيسية");
    }
}

export function deleteCarpet(carpetId, allCarpets, callback) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    let modal = document.getElementById('delete-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'delete-confirm-modal';
        modal.className = "fixed inset-0 z-[160] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="bg-[#fffbf7] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-center" dir="rtl">
            <button id="cancel-delete-x" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer">✕</button>
            
            <div class="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs text-red-600">
                🗑️
            </div>

            <h3 class="text-xl font-extrabold text-stone-900 mb-2">تأكيد حذف القطعة</h3>
            <p class="text-xs md:text-sm text-stone-600 mb-2 leading-relaxed">
                هل أنت متأكد من حذف سجادة <span class="font-bold text-stone-900">"${carpet.title}"</span> نهائياً من المعرض؟
            </p>
            <p class="text-[11px] text-red-600 font-semibold mb-6">
                ⚠️ تنبيه: لا يمكن التراجع عن هذه العملية بعد إتمام الحذف.
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
                <button id="confirm-delete-btn" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md text-sm cursor-pointer">
                    نعم، احذف القطعة
                </button>
                <button id="cancel-delete-btn" class="flex-1 bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl transition text-sm cursor-pointer">
                    إلغاء والتراجع
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    const cancelX = modal.querySelector('#cancel-delete-x');
    const cancelBtn = modal.querySelector('#cancel-delete-btn');
    const confirmBtn = modal.querySelector('#confirm-delete-btn');

    if (cancelX) cancelX.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            closeModal();
            const updatedCarpets = allCarpets.filter(c => c.id !== carpetId);
            localStorage.setItem('tatr_carpets', JSON.stringify(updatedCarpets));
            if (callback) callback(updatedCarpets);
            showToast(`تم حذف "${carpet.title}" من المعرض`, 'info', 'إدارة المعرض');

            if (isFirebaseConfigured()) {
                try {
                    await deleteCarpetFromCloud(carpetId);
                } catch (e) {
                    console.warn("Cloud delete failed:", e);
                }
            }
        };
    }
}

// ==========================================
// مؤشر التحميل التفاعلي أثناء النشر والحفظ
// ==========================================
function showUploadLoadingOverlay(initialText = "جاري قراءة وضغط الصور بأحدث التقنيات...") {
    let overlay = document.getElementById('upload-loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'upload-loading-overlay';
        overlay.className = "fixed inset-0 z-[200] bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300";
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div class="bg-[#fffbf7] w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 text-center relative" dir="rtl">
            <div class="relative w-16 h-16 mx-auto mb-4">
                <div class="w-16 h-16 rounded-full border-4 border-stone-200 border-t-[#7c1d3c] animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-lg">✨</div>
            </div>
            <h4 class="text-lg font-extrabold text-stone-900 mb-2">جاري نشر السجادة في المعرض</h4>
            <p id="upload-status-text" class="text-xs text-stone-700 font-bold leading-relaxed bg-amber-50 py-3 px-4 rounded-2xl border border-amber-200/80 shadow-xs">
                ${initialText}
            </p>
            <p class="text-[11px] text-stone-600 mt-3 font-medium">يتم تجهيز الصور وحفظها في السحابة فوراً لتظهر لجميع الزوار...</p>
        </div>
    `;
    overlay.classList.remove('hidden');
}

function updateUploadStatus(text) {
    const statusEl = document.getElementById('upload-status-text');
    if (statusEl) {
        statusEl.innerText = text;
    }
}

function hideUploadLoadingOverlay() {
    const overlay = document.getElementById('upload-loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}


// ==========================================
// إدارة معاينة وتحديد الصورة الرئيسية قبل الرفع
// ==========================================
let pendingNewCarpetFiles = [];

export function initImageUploadPreview() {
    const fileInput = document.getElementById('new-image-files');
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
        if (!fileInput.files || fileInput.files.length === 0) {
            pendingNewCarpetFiles = [];
            renderNewImagesPreview();
            return;
        }

        pendingNewCarpetFiles = Array.from(fileInput.files);
        renderNewImagesPreview();
    });
}

export function renderNewImagesPreview() {
    const container = document.getElementById('new-images-preview-container');
    const grid = document.getElementById('new-images-preview-grid');
    const countEl = document.getElementById('selected-images-count');
    if (!container || !grid) return;

    if (!pendingNewCarpetFiles || pendingNewCarpetFiles.length === 0) {
        container.classList.add('hidden');
        grid.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');
    if (countEl) countEl.innerText = `(${pendingNewCarpetFiles.length} صور)`;
    grid.innerHTML = '';

    pendingNewCarpetFiles.forEach((file, index) => {
        const isPrimary = index === 0;
        let previewUrl = '';
        try {
            previewUrl = URL.createObjectURL(file);
        } catch(e) {
            previewUrl = '';
        }

        const card = document.createElement('div');
        if (isPrimary) {
            card.className = "relative group rounded-2xl overflow-hidden border-[3px] border-[#7c1d3c] cursor-default transition-all duration-200 ring-4 ring-[#7c1d3c]/30 shadow-lg";
            card.style.boxShadow = "0 8px 20px -3px rgba(124, 29, 60, 0.45), 0 4px 10px -2px rgba(0, 0, 0, 0.15)";
        } else {
            card.className = "relative group rounded-2xl overflow-hidden border-2 border-stone-300 hover:border-[#7c1d3c]/60 cursor-pointer transition-all duration-200 opacity-85 hover:opacity-100 shadow-xs hover:shadow-md";
        }
        card.title = isPrimary ? 'هذه هي الصورة الرئيسية (الغلاف الأول)' : 'انقر لتعيين هذه الصورة كغلاف رئيسي أولاً';

        card.innerHTML = `
            <img src="${previewUrl}" class="w-full h-20 object-cover pointer-events-none" alt="معاينة">
            ${isPrimary ? `
                <div class="absolute inset-x-0 bottom-0 bg-[#7c1d3c] text-white text-[9px] font-black text-center py-0.5 shadow-xs">
                    ⭐ الغلاف الرئيسي
                </div>
            ` : `
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span class="text-[9px] font-bold text-white bg-[#7c1d3c] px-1.5 py-0.5 rounded shadow">تعيين كغلاف ⭐</span>
                </div>
            `}
            <button type="button" class="absolute top-1 left-1 w-5 h-5 bg-stone-900/80 hover:bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center transition shadow cursor-pointer z-10" title="إزالة هذه الصورة">
                ✕
            </button>
        `;

        // زر الحذف المصغر للصورة
        const removeBtn = card.querySelector('button');
        if (removeBtn) {
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                pendingNewCarpetFiles.splice(index, 1);
                renderNewImagesPreview();
            };
        }

        // النقر على الكرت لتعيينه كغلاف رئيسي
        card.onclick = () => {
            if (index !== 0) {
                const chosen = pendingNewCarpetFiles.splice(index, 1)[0];
                pendingNewCarpetFiles.unshift(chosen);
                renderNewImagesPreview();
                showToast(`تم تعيين "${chosen.name}" كصورة رئيسية للغلاف ⭐`, 'info', 'الغلاف الرئيسي', 2000);
            }
        };

        grid.appendChild(card);
    });
}

export async function handleAddProduct(event, allCarpets, callback) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : 'حفظ ونشر القطعة في المعرض';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "جاري المعالجة...";
    }

    const fileInput = document.getElementById('new-image-files');
    const files = pendingNewCarpetFiles.length > 0 
        ? [...pendingNewCarpetFiles] 
        : (fileInput && fileInput.files ? Array.from(fileInput.files) : []);
    
    const category = document.getElementById('new-category').value;
    const { id: newCarpetId, itemNumber } = generateNextProductId(category, allCarpets);
    const now = Date.now();
    const readableDate = formatReadableDate(now);

    const carpetPayload = {
        id: newCarpetId,
        itemNumber: itemNumber,
        title: document.getElementById('new-title').value.trim(),
        category: category,
        dimensions: (() => {
            const l = document.getElementById('new-dim-length') ? document.getElementById('new-dim-length').value.trim() : '';
            const w = document.getElementById('new-dim-width') ? document.getElementById('new-dim-width').value.trim() : '';
            return (l && w) ? `${l} × ${w} سم` : (l || w || '200 × 300 سم');
        })(),
        material: document.getElementById('new-material').value.trim(),
        price: Number(document.getElementById('new-price').value),
        currency: 'ر.ع.',
        description: document.getElementById('new-desc').value.trim(),
        status: (() => {
            const statusEl = document.getElementById('new-status');
            return (statusEl && statusEl.value) ? statusEl.value : 'out_of_stock';
        })(),
        createdAt: now,
        createdDate: readableDate,
        updatedAt: now,
        updatedDate: readableDate
    };

    // إظهار نافذة مؤشر التحميل فوراً
    showUploadLoadingOverlay("جاري معالجة الصور وضغطها بدقة عالية...");

    // إذا كان هناك فيديو مرفق، نقوم برفعه أو تحويله
    if (pendingNewCarpetVideoFile) {
        try {
            updateUploadStatus("جاري معالجة ورفع الفيديو الاستعراضي (بحد أقصى 20 ثانية)...");
            const videoUrl = await uploadCarpetVideo(carpetPayload.id, pendingNewCarpetVideoFile, (msg) => {
                updateUploadStatus(msg);
            });
            carpetPayload.video = videoUrl;
            carpetPayload.videoDuration = pendingNewCarpetVideoDuration;
        } catch (vErr) {
            console.warn("Video upload error:", vErr);
        }
    }

    try {
        if (isFirebaseConfigured()) {
            const saved = await saveCarpetToCloud(carpetPayload, files, (msg) => {
                updateUploadStatus(msg);
                if (submitBtn) submitBtn.innerText = msg;
            });

            // إضافة للذاكرة المحلية والعرض فوراً
            allCarpets.unshift(saved);
            try {
                localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
            } catch (storageQuotaErr) {
                console.warn("Storage quota limit reached:", storageQuotaErr);
            }
            if (callback) callback(allCarpets);

            hideUploadLoadingOverlay();
            pendingNewCarpetFiles = [];
            renderNewImagesPreview();
            window.clearNewVideoSelection();
            closeAddModal();
            document.getElementById('add-product-form').reset();

            // إشعار ذكي ومخصص حسب حالة تخزين الفيديو
            if (saved.video && saved.video.startsWith('idb://')) {
                showToast(`تم نشر "${saved.title}" سحابياً بنجاح! 🌟 (الفيديو محفوظ ويعمل على جهازك. لتشغيله لجميع الزوار حول العالم يرجى تفعيل Cloud Storage في كونسول فايربيس)`, 'success', 'نشر سحابي فوري', 6500);
            } else {
                showToast(`تم نشر "${saved.title}" سحابياً لجميع الزوار بنجاح!`, 'success', 'نشر سحابي فوري', 3500);
            }
        } else {
            // معالجة محلية ذكية مع ضغط الصور لتفادي امتلاء الذاكرة
            updateUploadStatus("جاري تحسين وضغط الصور للتخزين المحلي...");
            let imageList = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    updateUploadStatus(`جاري ضغط وتحسين الصورة (${i + 1} من ${files.length})...`);
                    const compressed = await compressImage(files[i], 1200, 1200, 0.78);
                    const base64 = await fileToBase64(compressed);
                    imageList.push(base64);
                }
            } else {
                imageList = [
                    'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza+Carpet',
                    'https://placehold.co/800x600/631730/ffffff?text=Tatriza+2'
                ];
            }

            carpetPayload.image = imageList[0];
            carpetPayload.images = imageList;

            allCarpets.unshift(carpetPayload);
            try {
                localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
            } catch (quotaErr) {
                console.warn("Storage quota limit reached:", quotaErr);
            }
            
            if (callback) callback(allCarpets);
            hideUploadLoadingOverlay();
            pendingNewCarpetFiles = [];
            renderNewImagesPreview();
            window.clearNewVideoSelection();
            closeAddModal();
            document.getElementById('add-product-form').reset();
            showToast(`تم حفظ "${carpetPayload.title}" محلياً. (قم بربط Firebase لتظهر للجميع حول العالم)`, 'warning', 'حفظ محلي', 4500);
        }
    } catch (err) {
        console.error("Error adding product:", err);
        hideUploadLoadingOverlay();
        showToast("حدث خطأ أثناء النشر: " + (err.message || err), 'error', 'خطأ في النشر', 5000);
    } finally {
        hideUploadLoadingOverlay();
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    }
}

export function openAddModal(allCarpets = []) {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('hidden');
    const lenInput = document.getElementById('new-dim-length');
    const widInput = document.getElementById('new-dim-width');
    if (lenInput) lenInput.value = '';
    if (widInput) widInput.value = '';
    updateDimensionsPreview('new');
    updateNewProductSkuPreview(allCarpets);

    // ربط تغيير التصنيف بتحديث كود القطعة المعروض فوراً
    const catSelect = document.getElementById('new-category');
    if (catSelect && !catSelect.dataset.skuBound) {
        catSelect.dataset.skuBound = 'true';
        catSelect.addEventListener('change', () => {
            updateNewProductSkuPreview(allCarpets);
        });
    }

    // ضبط خيار نمط التوفر الافتراضي عند فتح نافذة الإضافة
    const radioOndemand = document.querySelector('input[name="new-status-radio"][value="out_of_stock"]');
    if (radioOndemand) {
        radioOndemand.checked = true;
    }
    updateNewStatusRadio('out_of_stock');
}

export function updateNewStatusRadio(value) {
    const statusHidden = document.getElementById('new-status');
    const statusBadge = document.getElementById('new-status-badge');
    if (statusHidden) {
        statusHidden.value = value;
    }
    if (statusBadge) {
        if (value === 'available') {
            statusBadge.className = 'text-[10.5px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full transition';
            statusBadge.innerHTML = '⚡ متوفرة للتسليم الفوري';
        } else {
            statusBadge.className = 'text-[10.5px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full transition';
            statusBadge.innerHTML = '🪄 حياكة وتفصيل بالطلب';
        }
    }
}
window.updateNewStatusRadio = updateNewStatusRadio;

export function updateEditStatusRadio(value) {
    const statusHidden = document.getElementById('edit-status');
    const statusBadge = document.getElementById('edit-status-badge');
    const radioBtn = document.querySelector(`input[name="edit-status-radio"][value="${value}"]`);
    if (radioBtn) {
        radioBtn.checked = true;
    }
    if (statusHidden) {
        statusHidden.value = value;
    }
    if (statusBadge) {
        if (value === 'available') {
            statusBadge.className = 'text-[10.5px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full transition';
            statusBadge.innerHTML = '⚡ متوفرة للتسليم الفوري';
        } else {
            statusBadge.className = 'text-[10.5px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full transition';
            statusBadge.innerHTML = '🪄 حياكة وتفصيل بالطلب';
        }
    }
}
window.updateEditStatusRadio = updateEditStatusRadio;

export function closeAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.add('hidden');
    pendingNewCarpetFiles = [];
    renderNewImagesPreview();
}


// ==========================================
// إدارة وتعديل تفاصيل السجادة (Edit Carpet)
// ==========================================
let currentEditingCarpetId = null;
let currentEditingImages = [];
let pendingEditNewFiles = [];

export function openEditModal(carpetId, allCarpets) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    currentEditingCarpetId = carpetId;
    currentEditingImages = carpet.images && carpet.images.length > 0 ? [...carpet.images] : [carpet.image];
    pendingEditNewFiles = [];

    const idInput = document.getElementById('edit-carpet-id');
    const titleInput = document.getElementById('edit-title');
    const catInput = document.getElementById('edit-category');
    const priceInput = document.getElementById('edit-price');
    const lenInput = document.getElementById('edit-dim-length');
    const widInput = document.getElementById('edit-dim-width');
    if (lenInput && widInput) {
        const rawDims = carpet.dimensions || '';
        const nums = rawDims.match(/\d+(?:\.\d+)?/g);
        if (nums && nums.length >= 2) {
            lenInput.value = nums[0];
            widInput.value = nums[1];
        } else if (nums && nums.length === 1) {
            lenInput.value = nums[0];
            widInput.value = '';
        } else {
            lenInput.value = '';
            widInput.value = '';
        }
        updateDimensionsPreview('edit');
    }
    const matInput = document.getElementById('edit-material');
    const descInput = document.getElementById('edit-desc');
    const statusInput = document.getElementById('edit-status');

    if (idInput) idInput.value = carpet.id;
    if (titleInput) titleInput.value = carpet.title || '';
    if (catInput) {
        catInput.value = carpet.category || 'traditional';
        if (!catInput.value || catInput.selectedIndex < 0) {
            const target = String(carpet.category || '').toLowerCase();
            for (let opt of catInput.options) {
                if (opt.value.toLowerCase() === target || opt.text.toLowerCase().includes(target)) {
                    catInput.value = opt.value;
                    break;
                }
            }
        }
    }
    if (priceInput) priceInput.value = carpet.price || 0;
    // تم إسناد الأبعاد عبر الحقلين المنفصلين الطول والعرض
    if (matInput) matInput.value = carpet.material || '';
    if (descInput) descInput.value = carpet.description || '';
    if (statusInput) statusInput.value = carpet.status || 'available';
    updateEditStatusRadio(carpet.status === 'out_of_stock' ? 'out_of_stock' : 'available');

    const renewCheckbox = document.getElementById('edit-renew-exclusive');
    if (renewCheckbox) {
        const isNew = typeof window.isProductNew === 'function' ? window.isProductNew(carpet) : false;
        renewCheckbox.checked = isNew;
    }

    const fileInput = document.getElementById('edit-new-image-files');
    if (fileInput) fileInput.value = '';

    renderEditImagesManager();

    // إعداد ومعاينة الفيديو الحالي للقطعة
    currentEditingCarpetVideo = carpet.video || null;
    pendingEditNewVideoFile = null;
    pendingEditNewVideoDuration = carpet.videoDuration || 0;
    const editVideoWrapper = document.getElementById('edit-video-preview-wrapper');
    const editVideoEl = document.getElementById('edit-video-preview');
    const editVideoDurationBadge = document.getElementById('edit-video-duration-badge');
    const editVideoInput = document.getElementById('edit-video-file');
    if (editVideoInput) editVideoInput.value = '';

    if (carpet.video && editVideoWrapper && editVideoEl) {
        if (carpet.video.startsWith('idb://')) {
            getVideoFromIndexedDB(carpet.id).then(blobUrl => {
                if (blobUrl && editVideoEl) editVideoEl.src = blobUrl;
            });
        } else {
            editVideoEl.src = carpet.video;
        }
        if (editVideoDurationBadge) editVideoDurationBadge.innerText = `${carpet.videoDuration || 20} ثانية`;
        editVideoWrapper.classList.remove('hidden');
    } else if (editVideoWrapper) {
        editVideoWrapper.classList.add('hidden');
        if (editVideoEl) editVideoEl.src = '';
    }

    const skuBadge = document.getElementById('edit-carpet-sku-preview');
    if (skuBadge) {
        skuBadge.innerText = carpet.id || '';
    }

    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeEditModal() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.add('hidden');
    currentEditingCarpetId = null;
    currentEditingImages = [];
    pendingEditNewFiles = [];
}

export function initEditImageManager() {
    const fileInput = document.getElementById('edit-new-image-files');
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
        if (!fileInput.files || fileInput.files.length === 0) return;
        const newFiles = Array.from(fileInput.files);
        pendingEditNewFiles = [...pendingEditNewFiles, ...newFiles];
        renderEditImagesManager();
    });
}

export function renderEditImagesManager() {
    const grid = document.getElementById('edit-images-grid');
    const previewContainer = document.getElementById('edit-new-files-preview');
    if (!grid) return;

    grid.innerHTML = '';

    // 1. عرض الصور الحالية مع إمكانية التعيين كرئيسية أو الحذف
    currentEditingImages.forEach((img, index) => {
        const isPrimary = index === 0;
        const card = document.createElement('div');
        card.className = `relative group shrink-0 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
            isPrimary 
                ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-md scale-[1.02]' 
                : 'border-stone-300 hover:border-amber-400 opacity-80 hover:opacity-100'
        }`;
        card.style.width = '64px';
        card.style.height = '64px';
        card.title = isPrimary ? 'هذه هي الصورة الرئيسية الحالية (الغلاف)' : 'انقر لجعل هذه الصورة هي الرئيسية الأولى';

        card.innerHTML = `
            <img src="${img}" class="w-full h-full object-cover pointer-events-none" alt="صورة">
            ${isPrimary ? `
                <span class="absolute inset-x-0 bottom-0 bg-amber-500 text-stone-950 font-black text-[8px] text-center py-0.5 shadow">⭐ الغلاف</span>
            ` : `
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span class="text-[8px] font-bold text-white bg-amber-600 px-1 py-0.5 rounded shadow whitespace-nowrap">اجعلها أولاً</span>
                </div>
            `}
            ${currentEditingImages.length > 1 ? `
                <button type="button" class="absolute top-1 left-1 w-4 h-4 bg-stone-900/80 hover:bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center transition shadow z-10" title="حذف هذه الصورة">
                    ✕
                </button>
            ` : ''}
        `;

        // حذف الصورة
        const removeBtn = card.querySelector('button');
        if (removeBtn) {
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                if (currentEditingImages.length <= 1 && pendingEditNewFiles.length === 0) {
                    showToast("يجب أن تحتوي السجادة على صورة واحدة على الأقل.", "warning", "تنبيه");
                    return;
                }
                currentEditingImages.splice(index, 1);
                renderEditImagesManager();
            };
        }

        // جعلها رئيسية
        card.onclick = () => {
            if (index !== 0) {
                const chosen = currentEditingImages.splice(index, 1)[0];
                currentEditingImages.unshift(chosen);
                renderEditImagesManager();
            }
        };

        grid.appendChild(card);
    });

    // 2. عرض الصور الجديدة المضافة مؤقتاً
    if (previewContainer) {
        if (pendingEditNewFiles.length > 0) {
            previewContainer.classList.remove('hidden');
            previewContainer.innerHTML = '';
            pendingEditNewFiles.forEach((file, index) => {
                const previewUrl = URL.createObjectURL(file);
                const newCard = document.createElement('div');
                newCard.className = "relative group shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xs";
                newCard.style.width = '64px';
                newCard.style.height = '64px';
                newCard.innerHTML = `
                    <img src="${previewUrl}" class="w-full h-full object-cover pointer-events-none" alt="صورة جديدة">
                    <span class="absolute inset-x-0 bottom-0 bg-emerald-600 text-white font-black text-[8px] text-center py-0.5 shadow">✨ جديدة</span>
                    <button type="button" class="absolute top-1 left-1 w-4 h-4 bg-stone-900/80 hover:bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center transition shadow z-10" title="إلغاء">
                        ✕
                    </button>
                `;
                const removeBtn = newCard.querySelector('button');
                if (removeBtn) {
                    removeBtn.onclick = (e) => {
                        e.stopPropagation();
                        pendingEditNewFiles.splice(index, 1);
                        renderEditImagesManager();
                    };
                }
                previewContainer.appendChild(newCard);
            });
        } else {
            previewContainer.classList.add('hidden');
            previewContainer.innerHTML = '';
        }
    }
}

export async function handleEditProduct(event, allCarpets, callback) {
    event.preventDefault();
    if (!currentEditingCarpetId) return;

    const carpet = allCarpets.find(c => c.id === currentEditingCarpetId);
    if (!carpet) return;
    const carpetId = carpet.id;

    const submitBtn = document.getElementById('edit-submit-btn');
    const originalText = submitBtn ? submitBtn.innerText : 'حفظ التعديلات والتحديث الفوري';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "جاري الحفظ والتحديث...";
    }

    showUploadLoadingOverlay("جاري حفظ وتحديث تفاصيل السجادة...");

    try {
        let finalImages = [...currentEditingImages];

        // إذا كان هناك صور جديدة مختارة، نرفعها أو نضغطها
        if (pendingEditNewFiles.length > 0) {
            updateUploadStatus("جاري ضغط ورفع الصور الإضافية...");
            if (isFirebaseConfigured()) {
                try {
                    const uploadedUrls = await uploadCarpetImages(carpetId, pendingEditNewFiles, (msg) => {
                        updateUploadStatus(msg);
                    });
                    finalImages = [...finalImages, ...uploadedUrls];
                } catch (uploadErr) {
                    console.warn("Cloud upload failed, falling back to compressed local images:", uploadErr);
                    for (let i = 0; i < pendingEditNewFiles.length; i++) {
                        updateUploadStatus(`جاري ضغط الصورة الجديدة (${i + 1} من ${pendingEditNewFiles.length})...`);
                        const compressed = await compressImage(pendingEditNewFiles[i], 1200, 1200, 0.78);
                        const base64 = await fileToBase64(compressed);
                        finalImages.push(base64);
                    }
                }
            } else {
                for (let i = 0; i < pendingEditNewFiles.length; i++) {
                    updateUploadStatus(`جاري ضغط الصورة الجديدة (${i + 1} من ${pendingEditNewFiles.length})...`);
                    const compressed = await compressImage(pendingEditNewFiles[i], 1200, 1200, 0.78);
                    const base64 = await fileToBase64(compressed);
                    finalImages.push(base64);
                }
            }
        }

        if (finalImages.length === 0) {
            finalImages = [carpet.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
        }

        // معالجة الفيديو في نافذة التعديل
        let videoToSave = carpet.video || null;
        let videoDurationToSave = carpet.videoDuration || null;

        if (pendingEditNewVideoFile) {
            updateUploadStatus("جاري معالجة ورفع الفيديو الاستعراضي الجديد...");
            videoToSave = await uploadCarpetVideo(carpetId, pendingEditNewVideoFile, (msg) => {
                updateUploadStatus(msg);
            });
            videoDurationToSave = pendingEditNewVideoDuration;
        } else if (currentEditingCarpetVideo === null) {
            // المسؤول قام بطلب حذف الفيديو
            videoToSave = null;
            videoDurationToSave = null;
        }

        const renewCheckbox = document.getElementById('edit-renew-exclusive');
        const isRenewChecked = renewCheckbox ? renewCheckbox.checked : false;
        const isCurrentlyNew = typeof window.isProductNew === 'function' ? window.isProductNew(carpet) : false;
        let carpetCreatedAt = 0;
        if (isRenewChecked) {
            // إذا كان الوسم مفعل أصلاً نحتفظ بتاريخه، وإن كان منتهياً أو غير مفعل نجدده لتاريخ اليوم
            carpetCreatedAt = isCurrentlyNew ? (carpet.createdAt || Date.now()) : Date.now();
        } else {
            // المسؤول ألغى تفعيل الوسم ليصبح المنتج عادياً واعتيادياً
            carpetCreatedAt = 0;
        }

        const now = Date.now();
        const readableNow = formatReadableDate(now);

        const updatedData = {
            title: document.getElementById('edit-title').value.trim(),
            category: document.getElementById('edit-category').value,
            price: Number(document.getElementById('edit-price').value),
            dimensions: (() => {
                const l = document.getElementById('edit-dim-length') ? document.getElementById('edit-dim-length').value.trim() : '';
                const w = document.getElementById('edit-dim-width') ? document.getElementById('edit-dim-width').value.trim() : '';
                return (l && w) ? `${l} × ${w} سم` : (l || w || carpet.dimensions || '200 × 300 سم');
            })(),
            material: document.getElementById('edit-material').value.trim(),
            description: document.getElementById('edit-desc').value.trim(),
            status: document.getElementById('edit-status').value,
            image: finalImages[0],
            images: finalImages,
            video: videoToSave,
            videoDuration: videoDurationToSave,
            itemNumber: carpet.itemNumber || 1,
            createdAt: carpetCreatedAt,
            createdDate: carpet.createdDate || (carpetCreatedAt ? formatReadableDate(carpetCreatedAt) : readableNow),
            updatedAt: now,
            updatedDate: readableNow
        };

        // 1. تحديث الكائن محلياً وحفظه فوراً في الذاكرة والتخزين المحلي
        Object.assign(carpet, updatedData);
        try {
            localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
        } catch(e) {}

        // إغلاق النافذة وتحديث واجهة المعرض فوراً لضمان تجربة سلسة وسريعة
        hideUploadLoadingOverlay();
        closeEditModal();

        if (callback) {
            try {
                callback(allCarpets, carpetId);
            } catch (cbErr) {
                console.error("Callback error after editing carpet:", cbErr);
            }
        }

        // 2. تحديث السحابة Firebase إن كانت مفعلة ومزامنتها بذكاء وأمان
        let cloudSuccess = true;
        let cloudErrMsg = '';
        if (isFirebaseConfigured()) {
            try {
                await updateCarpetInCloud(carpetId, updatedData);
            } catch (cloudErr) {
                console.warn("Cloud sync warning (saved locally):", cloudErr);
                cloudSuccess = false;
                cloudErrMsg = cloudErr.message || '';
            }
        }

        const statusLabel = updatedData.status === 'out_of_stock' ? 'حياكة بالطلب 🪄' : 'تسليم فوري ⚡';
        if (cloudSuccess) {
            showToast(`تم حفظ وتحديث بيانات "${updatedData.title}" بنجاح! وقسمها الحالي: (${statusLabel})`, 'success', 'تحديث المنتج', 4000);
        } else {
            showToast(`تم حفظ التعديلات محلياً بنجاح! وقسمها الحالي: (${statusLabel}) ⚠️`, 'info', 'حفظ محلي', 4000);
        }
    } catch(err) {
        console.error("Error updating carpet:", err);
        hideUploadLoadingOverlay();
        showToast("حدث خطأ أثناء حفظ التعديلات: " + (err.message || err), 'error', 'خطأ في التعديل', 5000);
    } finally {
        hideUploadLoadingOverlay();
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    }
}


// ==========================================
// نافذة إعدادات وربط سحابة Firebase للمسؤول
// ==========================================
export function openFirebaseConfigModal() {
    let modal = document.getElementById('firebase-config-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'firebase-config-modal';
        modal.className = "fixed inset-0 z-[160] bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300";
        document.body.appendChild(modal);
    }

    const currentConfig = getActiveFirebaseConfig();
    const isConfigured = isFirebaseConfigured();

    modal.innerHTML = `
        <div class="bg-[#fffbf7] w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-right flex flex-col max-h-[90vh]" dir="rtl">
            <button onclick="window.closeFirebaseConfigModal()" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer">✕</button>
            
            <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-xs text-amber-700 shrink-0">
                    🔥
                </div>
                <div>
                    <h3 class="text-lg font-bold text-stone-900">إعدادات سحابة Google Firebase</h3>
                    <p class="text-xs text-stone-500 font-medium">اربط مشروعك السحابي لتظهر المنتجات للجميع في نفس اللحظة</p>
                </div>
            </div>

            <div class="mb-4 p-3.5 bg-stone-100 rounded-2xl text-xs text-stone-700 leading-relaxed border border-stone-200">
                <p class="font-bold text-stone-900 mb-1">💡 كيف تحصل على هذه المفاتيح في دقيقتين؟</p>
                <ol class="list-decimal list-inside space-y-1 text-stone-600 text-[11px]">
                    <li>ادخل إلى <a href="https://console.firebase.google.com" target="_blank" class="text-brand font-bold underline">console.firebase.google.com</a> وسجل بحساب Google.</li>
                    <li>أنشئ مشروعاً جديداً باسم <span class="font-mono font-bold">tatriza</span>.</li>
                    <li>فعّل <b>Cloud Firestore</b> فقط (مجانية 100% بدون أي بطاقة بنكية).</li>
                    <li>أضف تطبيق ويب (علامة <b>&lt;/&gt;</b>) وانسخ المفاتيح وضعها هنا.</li>
                </ol>
            </div>

            <form onsubmit="window.saveFirebaseConfigHandler(event)" class="space-y-3 flex-1 overflow-y-auto pr-1">
                <div>
                    <label class="block text-[11px] font-bold text-stone-700 mb-1">API Key</label>
                    <input type="text" id="cfg-api-key" required value="${currentConfig.apiKey && !currentConfig.apiKey.includes('YOUR_API_KEY') ? currentConfig.apiKey : ''}" placeholder="AIzaSy..." class="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none search-input-focus">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold text-stone-700 mb-1">Project ID</label>
                        <input type="text" id="cfg-project-id" required value="${currentConfig.projectId && !currentConfig.projectId.includes('YOUR_PROJECT') ? currentConfig.projectId : ''}" placeholder="tatriza-xxxx" class="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none search-input-focus">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-stone-700 mb-1">Storage Bucket <span class="text-stone-400 font-normal">(اختياري - اتركه فارغاً)</span></label>
                        <input type="text" id="cfg-storage-bucket" value="${currentConfig.storageBucket && !currentConfig.storageBucket.includes('YOUR_PROJECT') ? currentConfig.storageBucket : ''}" placeholder="اتركه فارغاً للباقة المجانية" class="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none search-input-focus">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[11px] font-bold text-stone-700 mb-1">App ID</label>
                        <input type="text" id="cfg-app-id" required value="${currentConfig.appId && !currentConfig.appId.includes('1:1234') ? currentConfig.appId : ''}" placeholder="1:xxxx:web:xxxx" class="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none search-input-focus">
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-stone-700 mb-1">Messaging Sender ID</label>
                        <input type="text" id="cfg-sender-id" required value="${currentConfig.messagingSenderId && !currentConfig.messagingSenderId.includes('12345') ? currentConfig.messagingSenderId : ''}" placeholder="123456789" class="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-800 outline-none search-input-focus">
                    </div>
                </div>

                <div class="pt-3 flex flex-col sm:flex-row gap-2.5">
                    <button type="submit" class="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-2.5 px-4 rounded-xl transition shadow-md text-xs md:text-sm cursor-pointer">
                        حفظ وتفعيل السحابة فوراً
                    </button>
                    <button type="button" onclick="window.closeFirebaseConfigModal()" class="bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-2.5 px-4 rounded-xl transition text-xs cursor-pointer">
                        إغلاق
                    </button>
                </div>
            </form>
        </div>
    `;

    modal.classList.remove('hidden');
}

export function closeFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.add('hidden');
}

export function saveFirebaseConfigHandler(e) {
    if (e) e.preventDefault();
    const apiKey = document.getElementById('cfg-api-key').value.trim();
    const projectId = document.getElementById('cfg-project-id').value.trim();
    const storageBucket = document.getElementById('cfg-storage-bucket').value.trim();
    const appId = document.getElementById('cfg-app-id').value.trim();
    const messagingSenderId = document.getElementById('cfg-sender-id').value.trim();

    const config = {
        apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket,
        messagingSenderId,
        appId
    };

    saveFirebaseConfig(config);
    closeFirebaseConfigModal();
    if (typeof window !== 'undefined' && window.closeAdminAuthModal) {
        window.closeAdminAuthModal();
    }
    showToast("تم حفظ وتفعيل إعدادات Firebase بنجاح! جاري إعادة التحميل للربط...", "success", "السحابة الفائقة", 2500);
    setTimeout(() => location.reload(), 1200);
}

if (typeof window !== 'undefined') {
    window.closeFirebaseConfigModal = closeFirebaseConfigModal;
    window.openFirebaseConfigModal = openFirebaseConfigModal;
    window.saveFirebaseConfigHandler = saveFirebaseConfigHandler;

    window.triggerExportBackup = function() {
        const carpets = window.getAllCarpetsGlobal ? window.getAllCarpetsGlobal() : [];
        if (carpets.length === 0) {
            showToast("لا توجد منتجات لتصديرها حالياً.", "warning", "نسخة احتياطية");
            return;
        }
        exportCarpetsBackup(carpets);
        showToast("تم تصدير وتحميل النسخة الاحتياطية بنجاح على جهازك!", "success", "نسخة احتياطية آمنة");
    };
}