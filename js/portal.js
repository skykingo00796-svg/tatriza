// ==========================================
// محرك بوابة الإدارة المستقلة (portal.js)
// دار تطريز TATRIZA - لوحة التحكم السحابية المعتمدة
// ==========================================

import { 
    subscribeToAdminAuth, 
    adminLoginWithCloud, 
    adminLogoutFromCloud, 
    getCurrentAdminUser, 
    isFirebaseConfigured, 
    subscribeToCarpets, 
    subscribeToCategories, 
    subscribeToCategorySettings, 
    saveCategoryToCloud, 
    deleteCategoryFromCloud, 
    saveCategorySettingsToCloud, 
    deleteCarpetFromCloud, 
    updateCarpetStatusInCloud, 
    exportCarpetsBackup, 
    formatReadableDate 
} from './firebase-admin.js';

import { 
    openAddModal, 
    closeAddModal, 
    openEditModal, 
    closeEditModal, 
    handleAddProduct, 
    handleEditProduct, 
    initImageUploadPreview, 
    initEditImageManager, 
    initVideoUploadHandlers, 
    toggleStockStatus, 
    deleteCarpet, 
    updateDimensionsPreview, 
    openFirebaseConfigModal, 
    saveFirebaseConfigHandler, 
    closeFirebaseConfigModal,
    checkAdminPermission
} from './admin.js';

import { 
    openOptionsDrawer, 
    closeOptionsDrawer, 
    openModal, 
    closeModal, 
    handleModalScroll, 
    openLightboxFromModal, 
    openCurrentLogoLightbox, 
    closeLightbox, 
    handleLightboxScroll, 
    showToast 
} from './modals.js';

import { 
    initTheme, 
    openThemeModal, 
    closeThemeModal, 
    selectThemeOption, 
    applyTheme 
} from './theme.js';

import { getVideoFromIndexedDB } from './firebase-public.js';

// حالة لوحة الإدارة
let currentPortalUser = null;
let allPortalCarpets = [];
let allPortalCategories = [];
let portalSearchQuery = '';
let portalCategoryFilter = 'all';
let portalStockFilter = 'all';

// ==========================================
// التصنيفات الافتراضية وإدارتها في البوابة
// ==========================================
export const DEFAULT_CATEGORIES = [
    { id: 'ajami', name: 'نقشات عجمية', icon: '✨', code: 'A' },
    { id: 'silk', name: 'سجاد حريري', icon: '🧵', code: 'S' },
    { id: 'traditional', name: 'تراثي أصيل', icon: '🏛️', code: 'T' },
    { id: 'modern', name: 'مودرن معاصر', icon: '🎨', code: 'M' },
    { id: 'wool', name: 'صوف فاخر', icon: '🧶', code: 'W' }
];

export const DEFAULT_QUICK_ICONS = ['👑', '💎', '🏺', '🕌', '⚜️', '🪡', '🛋️', '🪄', '🌸', '✨', '🧵', '🏛️', '🎨', '🧶'];

export function getCustomCategories() {
    try {
        const stored = localStorage.getItem('tatr_custom_categories');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export function saveCustomCategories(cats) {
    localStorage.setItem('tatr_custom_categories', JSON.stringify(cats));
}

export function getDeletedCategoryIds() {
    try {
        const stored = localStorage.getItem('tatr_deleted_default_categories');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export function saveDeletedCategoryIds(ids) {
    localStorage.setItem('tatr_deleted_default_categories', JSON.stringify(ids));
}

export function getCustomQuickIcons() {
    try {
        const stored = localStorage.getItem('tatr_custom_quick_icons');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export function saveCustomQuickIcons(icons) {
    localStorage.setItem('tatr_custom_quick_icons', JSON.stringify(icons));
}

export function getDeletedQuickIcons() {
    try {
        const stored = localStorage.getItem('tatr_deleted_quick_icons');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export function saveDeletedQuickIcons(icons) {
    localStorage.setItem('tatr_deleted_quick_icons', JSON.stringify(icons));
}

export function getAllQuickIcons() {
    const deleted = getDeletedQuickIcons();
    const custom = getCustomQuickIcons();
    const combined = [...DEFAULT_QUICK_ICONS];
    custom.forEach(ic => {
        if (!combined.includes(ic)) combined.push(ic);
    });
    return combined.filter(ic => !deleted.includes(ic));
}

export function getActiveCategories() {
    const deletedIds = getDeletedCategoryIds();
    const activeDefaults = DEFAULT_CATEGORIES.filter(c => !deletedIds.includes(c.id));
    const custom = getCustomCategories();
    return [...activeDefaults, ...custom];
}


// ==========================================
// إدارة جلسة المسؤول وأمان وقت الخمول (Session Inactivity Timeout)
// ==========================================
const ADMIN_MAX_IDLE_TIME = 60 * 60 * 1000; // 60 دقيقة (ساعة واحدة) خمول كحد أقصى
const ADMIN_MAX_TOTAL_TIME = 120 * 60 * 1000; // ساعتان كحد أقصى للجلسة المتواصلة

let lastActivityTimestamp = Date.now();
let sessionCheckInterval = null;

export function recordAdminActivity() {
    lastActivityTimestamp = Date.now();
    try {
        localStorage.setItem('tatr_admin_last_activity', lastActivityTimestamp.toString());
    } catch(e) {}
}

function initAdminActivityListeners() {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    let throttleTimer = null;
    
    events.forEach(evt => {
        window.addEventListener(evt, () => {
            if (!throttleTimer) {
                recordAdminActivity();
                throttleTimer = setTimeout(() => { throttleTimer = null; }, 10000); // تحديث كل 10 ثوان كحد أقصى
            }
        }, { passive: true });
    });
}

function startAdminSessionWatcher() {
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    
    // حفظ وقت بداية الجلسة إن لم يكن موجوداً
    if (!sessionStorage.getItem('tatr_admin_session_start')) {
        sessionStorage.setItem('tatr_admin_session_start', Date.now().toString());
    }
    recordAdminActivity();

    sessionCheckInterval = setInterval(() => {
        checkAdminSessionExpiration();
    }, 20000); // فحص دوري كل 20 ثانية
}

function stopAdminSessionWatcher() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
        sessionCheckInterval = null;
    }
    sessionStorage.removeItem('tatr_admin_session_start');
    localStorage.removeItem('tatr_admin_last_activity');
}

function checkAdminSessionExpiration() {
    if (!currentPortalUser) return false;

    const now = Date.now();
    const storedLast = localStorage.getItem('tatr_admin_last_activity');
    const storedStart = sessionStorage.getItem('tatr_admin_session_start');

    const lastActivity = parseInt(storedLast || lastActivityTimestamp.toString(), 10);
    const sessionStart = parseInt(storedStart || now.toString(), 10);

    const idleElapsed = now - lastActivity;
    const totalElapsed = now - sessionStart;

    if (idleElapsed > ADMIN_MAX_IDLE_TIME) {
        console.warn("Admin session expired due to inactivity (>60m)");
        handleSessionTimeout("انتهت جلسة الإدارة بسبب عدم النشاط (ساعة واحدة). تم قفل البوابة وتسجيل الخروج تلقائياً لأمان المعرض.");
        return true;
    }

    if (totalElapsed > ADMIN_MAX_TOTAL_TIME) {
        console.warn("Admin session reached max duration (>2h)");
        handleSessionTimeout("انتهت المدة القصوى لجلسة الإدارة (ساعتان). تم قفل البوابة وتسجيل الخروج تلقائياً لحماية حسابك.");
        return true;
    }

    return false;
}

async function handleSessionTimeout(message) {
    stopAdminSessionWatcher();
    try {
        await adminLogoutFromCloud();
    } catch(e) {}
    
    if (typeof closeOptionsDrawer === 'function') closeOptionsDrawer();
    if (typeof closeModal === 'function') closeModal();
    if (typeof closeLightbox === 'function') closeLightbox();
    if (typeof window.closeVideoLightbox === 'function') window.closeVideoLightbox();

    updatePortalAuthUI(null);
    showToast(message, "warning", "انتهاء صلاحية الجلسة", 6000);
}


// ==========================================
// إدارة جلسة الأدمن وتحديث الواجهة
// ==========================================
function updatePortalAuthUI(user) {
    currentPortalUser = user;
    const loginGate = document.getElementById('portal-login-gate');
    const dashboard = document.getElementById('portal-dashboard');
    const userEmailEl = document.getElementById('portal-user-email');
    const drawerEmailEl = document.getElementById('drawer-portal-user-email');

    if (user && user.uid) {
        // فحص هل انتهت مدة الجلسة السابقة أثناء غياب المستخدم
        const now = Date.now();
        const storedLast = localStorage.getItem('tatr_admin_last_activity');
        if (storedLast && (now - parseInt(storedLast, 10) > ADMIN_MAX_IDLE_TIME)) {
            console.warn("Session expired while away");
            stopAdminSessionWatcher();
            adminLogoutFromCloud().catch(() => {});
            if (loginGate) loginGate.classList.remove('hidden');
            if (dashboard) dashboard.classList.add('hidden');
            showToast("انتهت جلسة المسؤول السابقة لعدم النشاط. يرجى تسجيل الدخول مجدداً.", "info", "انتهت الجلسة", 5000);
            return;
        }

        if (loginGate) loginGate.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        if (userEmailEl) userEmailEl.innerText = user.email || 'مسؤول معتمد';
        if (drawerEmailEl) drawerEmailEl.innerText = user.email || 'admin@tatriza.com';
        
        // بدء مراقبة الجلسة والنشاط
        startAdminSessionWatcher();

        // تحميل المعروضات والتصنيفات
        initPortalSubscriptions();
    } else {
        stopAdminSessionWatcher();
        if (loginGate) loginGate.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
        if (drawerEmailEl) drawerEmailEl.innerText = 'admin';
    }
}


// معالج تسجيل الدخول
export async function executePortalLogin(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('portal-email-input');
    const passInput = document.getElementById('portal-password-input');
    const errorEl = document.getElementById('portal-login-error');
    const submitBtn = document.getElementById('portal-login-btn');
    const btnText = document.getElementById('portal-login-btn-text');

    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value : '';

    if (!email || !pass) return;

    if (errorEl) errorEl.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.innerText = "جاري التحقق عبر سيرفرات جوجل المشفرة...";

    try {
        const user = await adminLoginWithCloud(email, pass);
        showToast(`مرحباً بك! تم التحقق السحابي وتفعيل صلاحيات الإدارة (${user.email}).`, "success", "المسؤول المعتمد", 3000);
        updatePortalAuthUI(user);
    } catch (authErr) {
        console.warn("Portal login error:", authErr);
        let userMsg = "البريد الإلكتروني أو كلمة المرور غير مطابقة لحساب المسؤول المسجل في Firebase.";
        
        if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/user-not-found') {
            userMsg = "بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور في Firebase Console.";
        } else if (authErr.code === 'auth/too-many-requests') {
            userMsg = "تم حظر محاولات الدخول مؤقتاً لحماية حسابك بسبب تكرار المحاولات الخاطئة. يرجى الانتظار بضع دقائق.";
        } else if (authErr.code === 'auth/operation-not-allowed') {
            userMsg = "يرجى تفعيل خيار (Email/Password) في Firebase Console -> Authentication -> Sign-in method.";
        } else if (authErr.code === 'auth/network-request-failed') {
            userMsg = "تعذر الاتصال بخوادم Firebase. يرجى التأكد من اتصال الإنترنت.";
        }

        if (errorEl) {
            errorEl.innerText = userMsg;
            errorEl.classList.remove('hidden');
        }
        showToast(userMsg, "error", "فشل تسجيل الدخول", 4500);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.innerText = "تسجيل الدخول إلى لوحة الإدارة";
    }
}
window.executePortalLogin = executePortalLogin;

export async function executePortalLogout() {
    stopAdminSessionWatcher();
    try {
        await adminLogoutFromCloud();
    } catch (e) {
        console.warn("Portal logout error:", e);
    }
    if (typeof closeOptionsDrawer === 'function') closeOptionsDrawer();
    showToast("تم تسجيل الخروج من لوحة الإدارة بنجاح.", "info", "تسجيل الخروج", 2000);
    updatePortalAuthUI(null);
}
window.executePortalLogout = executePortalLogout;

window.togglePortalPasswordVisibility = function() {
    const input = document.getElementById('portal-password-input');
    const icon = document.getElementById('portal-toggle-pwd-icon');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.innerText = '🙈';
    } else {
        input.type = 'password';
        if (icon) icon.innerText = '👁️';
    }
};

// ==========================================
// مزامنة وعرض المنتجات في لوحة التحكم
// ==========================================
function initPortalSubscriptions() {
    // 1. مزامنة المعروضات
    subscribeToCarpets((carpets) => {
        allPortalCarpets = carpets || [];
        renderPortalDashboard();
    }, (err) => {
        console.warn("Carpets subscription error:", err);
    });

    // 2. مزامنة التصنيفات
    subscribeToCategories((remoteCats) => {
        if (remoteCats && remoteCats.length > 0) {
            saveCustomCategories(remoteCats);
        }
        renderPortalCategoriesList();
        updatePortalCategoryOptions();
    });

    // 3. مزامنة إعدادات التصنيفات
    subscribeToCategorySettings((settings) => {
        if (settings) {
            if (Array.isArray(settings.deletedDefaultCategoryIds)) {
                saveDeletedCategoryIds(settings.deletedDefaultCategoryIds);
            }
            if (Array.isArray(settings.customQuickIcons)) {
                saveCustomQuickIcons(settings.customQuickIcons);
            }
            if (Array.isArray(settings.deletedQuickIcons)) {
                saveDeletedQuickIcons(settings.deletedQuickIcons);
            }
            renderPortalCategoriesList();
            updatePortalCategoryOptions();
            renderQuickIconsUI();
        }
    });
}

export function renderPortalDashboard() {
    renderPortalStats();
    renderPortalProductsTable();
    updatePortalCategoryOptions();
}

function renderPortalStats() {
    const totalEl = document.getElementById('stat-total-carpets');
    const availableEl = document.getElementById('stat-available-carpets');
    const outOfStockEl = document.getElementById('stat-out-carpets');
    const categoriesEl = document.getElementById('stat-total-categories');

    const total = allPortalCarpets.length;
    const available = allPortalCarpets.filter(c => c.status !== 'out_of_stock').length;
    const outOfStock = total - available;
    const totalCats = getActiveCategories().length;

    if (totalEl) totalEl.innerText = total;
    if (availableEl) availableEl.innerText = available;
    if (outOfStockEl) outOfStockEl.innerText = outOfStock;
    if (categoriesEl) categoriesEl.innerText = totalCats;
}


let currentPreviewCarpetId = null;

export function portalOpenProductModal(carpetId) {
    currentPreviewCarpetId = carpetId;
    openModal(carpetId, allPortalCarpets);

    const carpet = allPortalCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    const isOutOfStock = carpet.status === 'out_of_stock';
    const stockBtnText = document.getElementById('modal-admin-stock-text');
    if (stockBtnText) {
        stockBtnText.innerText = isOutOfStock ? 'إعادة توفير القطعة' : 'تعليم كـ غير متوفرة';
    }
}
window.portalOpenProductModal = portalOpenProductModal;

window.portalModalEditCarpet = () => {
    if (currentPreviewCarpetId) {
        closeModal();
        openEditModal(currentPreviewCarpetId, allPortalCarpets);
    }
};

window.portalModalToggleStock = async () => {
    if (currentPreviewCarpetId) {
        await window.portalToggleStock(currentPreviewCarpetId);
        const carpet = allPortalCarpets.find(c => c.id === currentPreviewCarpetId);
        const stockBtnText = document.getElementById('modal-admin-stock-text');
        if (carpet && stockBtnText) {
            stockBtnText.innerText = carpet.status === 'out_of_stock' ? 'إعادة توفير القطعة' : 'تعليم كـ غير متوفرة';
        }
    }
};

window.portalModalDeleteCarpet = async () => {
    if (currentPreviewCarpetId) {
        const idToDelete = currentPreviewCarpetId;
        closeModal();
        await window.portalDeleteCarpet(idToDelete);
    }
};

window.portalPlayCardVideo = async (carpetId) => {
    const carpet = allPortalCarpets.find(c => c.id === carpetId);
    if (!carpet || !carpet.video) return;

    let videoSrc = carpet.video;
    if (videoSrc.startsWith('idb://')) {
        const blobUrl = await getVideoFromIndexedDB(carpet.id);
        if (blobUrl) videoSrc = blobUrl;
    }
    if (typeof window.openVideoLightbox === 'function') {
        window.openVideoLightbox(videoSrc, carpet.title || 'استعراض سجادة');
    }
};

function renderPortalProductsTable() {
    const container = document.getElementById('carpets-grid') || document.getElementById('portal-products-grid');
    if (!container) return;

    let list = [...allPortalCarpets];

    // بحث
    if (portalSearchQuery) {
        const q = portalSearchQuery.toLowerCase();
        list = list.filter(c => 
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.id && c.id.toLowerCase().includes(q)) ||
            (c.category && c.category.toLowerCase().includes(q)) ||
            (c.material && c.material.toLowerCase().includes(q))
        );
    }

    // فلتر التصنيف
    if (portalCategoryFilter !== 'all') {
        list = list.filter(c => c.category === portalCategoryFilter);
    }

    // فلتر الحالة
    if (portalStockFilter === 'available') {
        list = list.filter(c => c.status !== 'out_of_stock');
    } else if (portalStockFilter === 'out_of_stock') {
        list = list.filter(c => c.status === 'out_of_stock');
    }

    if (list.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 px-4 bg-white/80 rounded-3xl border border-stone-200 shadow-2xs" dir="rtl">
                <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl mb-3 shadow-2xs border border-amber-200/60">
                    🔍
                </div>
                <h4 class="font-display font-bold text-stone-800 text-sm sm:text-base">لا توجد قطع مطابقة للبحث أو الفلتر</h4>
                <p class="text-xs text-stone-500 mt-1">جرّب مسح حقل البحث أو إضافة سجادة جديدة للمتجر.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map((c, index) => {
        const isOutOfStock = c.status === 'out_of_stock';
        const imgUrl = (c.images && c.images[0]) || c.image || 'https://placehold.co/400x400/7c1d3c/ffffff?text=Tatriza';
        const imagesCount = (c.images && c.images.length) || 1;
        const hasVideo = Boolean(c.video);

        return `
            <div class="carpet-card carpet-card-reveal bg-[#fffbf7] rounded-xl sm:rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs flex flex-col h-full cursor-pointer group relative" style="animation-delay: ${Math.min(index * 0.03, 0.3)}s" onclick="window.portalOpenProductModal('${c.id}')" dir="rtl">
                
                <!-- الكتلة العلوية: الوسائط متجاوبة تماماً مع شاشات الجوال والبيسي وبنفس مقاس المعرض الرئيسي -->
                <div class="w-full shrink-0 flex flex-col bg-stone-100 relative z-10">
                    <div class="relative w-full aspect-square carpet-stage-container overflow-hidden">
                        <img src="${imgUrl}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500 bg-white" loading="lazy">
                        
                        <!-- لمعة الانعكاس الضوئي الفاخرة -->
                        <div class="card-light-glare"></div>

                        <!-- أبعاد السجادة في أعلى اليمين (زجاجي فائق الشفافية لإبراز تفاصيل السجادة) -->
                        <span class="card-badge-dimensions absolute top-1.5 right-1.5 px-2 bg-black/30 hover:bg-black/45 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold rounded-lg shadow-xs border border-white/20 inline-flex items-center justify-center leading-none z-30 pointer-events-none select-none transition">
                            ${c.dimensions || ''}
                        </span>

                        <!-- شارة حالة التوفر في أعلى اليسار (زجاجي كريستالي شفاف وملون فاخر) -->
                        <button type="button" onclick="event.stopPropagation(); window.portalToggleStock('${c.id}')" class="card-badge-stock absolute top-1.5 left-1.5 px-2 rounded-lg text-[8px] sm:text-[9px] font-bold shadow-xs transition inline-flex items-center justify-center gap-1 cursor-pointer backdrop-blur-md leading-none z-30 select-none ${isOutOfStock ? 'bg-rose-950/40 hover:bg-rose-950/60 text-rose-200 border border-rose-400/30' : 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-200 border border-emerald-400/30'}" title="انقر للتبديل الفوري لحالة التوفر">
                            <span class="stock-dot w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-400' : 'bg-emerald-400'} shrink-0 shadow-2xs"></span>
                            <span class="whitespace-nowrap">${isOutOfStock ? 'نفدت' : 'متوفرة'}</span>
                        </button>

                        <!-- طبقة تغطية زجاجية خفيفة وشفافة تماماً إن كانت نافدة -->
                        ${isOutOfStock ? `
                            <div class="absolute inset-0 bg-black/15 backdrop-blur-[0.5px] flex items-center justify-center z-20 pointer-events-none p-1">
                                <span class="h-6 sm:h-6.5 px-2.5 bg-black/40 backdrop-blur-md text-amber-200 border border-white/20 text-[8.5px] sm:text-[9.5px] font-bold rounded-lg shadow-md inline-flex items-center justify-center leading-none">
                                    نفدت الكمية
                                </span>
                            </div>
                        ` : ''}

                        <!-- عداد الوسائط في أسفل اليسار (زجاجي شفاف وخفيف) -->
                        ${imagesCount > 1 ? `
                            <div class="card-badge-media absolute bottom-1.5 left-1.5 px-1.5 bg-black/30 backdrop-blur-md text-white/90 text-[7.5px] sm:text-[8px] font-bold rounded-md inline-flex items-center justify-center leading-none pointer-events-none border border-white/15 z-30">
                                <span>📷 ${imagesCount}</span>
                            </div>
                        ` : ''}

                        <!-- زر الفيديو في أسفل اليمين (زجاجي شفاف وراقي) -->
                        ${hasVideo ? `
                            <button type="button" onclick="event.stopPropagation(); window.portalPlayCardVideo('${c.id}')" class="card-badge-video absolute bottom-1.5 right-1.5 px-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md text-amber-300 text-[7.5px] sm:text-[8px] font-bold rounded-md inline-flex items-center justify-center gap-0.5 pointer-events-auto z-30 border border-white/20 leading-none shadow-xs transition cursor-pointer" title="مشاهدة وتكبير الفيديو">
                                <span class="text-[8.5px]">🎬</span>
                                <span>فيديو</span>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- الكتلة السفلية: خطوط وأزرار بمحاذاة مركزية تامة وارتفاعات متساوية -->
                <div class="card-content-wrap p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-stone-200/70 relative z-20">
                    <div class="mb-1">
                        <span class="card-category-label text-[8px] sm:text-[9px] text-stone-500 font-medium leading-none block truncate">
                            ${c.category || 'تراثي'}
                        </span>
                        <h4 class="card-title-text font-display font-semibold text-stone-900 text-[10px] sm:text-[11px] leading-snug truncate group-hover:text-brand transition mt-1" title="${c.title}">${c.title}</h4>
                    </div>

                    <div class="card-price-row flex items-center justify-between gap-1 mt-auto pb-1.5">
                        <div class="flex items-baseline gap-0.5 shrink-0">
                            <span class="card-price-val font-display text-xs sm:text-[13px] font-black text-brand leading-none">${Number(c.price || 0).toLocaleString()}</span>
                            <span class="card-price-curr font-display text-brand text-[7.5px] sm:text-[8px] font-bold leading-none">ر.ع.</span>
                        </div>
                        <button type="button" onclick="event.stopPropagation(); window.portalOpenProductModal('${c.id}')" class="card-btn-preview btn-liquid-metal font-display text-white text-[8px] sm:text-[8.5px] font-bold h-6.5 sm:h-7 w-[52px] sm:w-[58px] shrink-0 rounded-lg transition shadow-2xs cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1 leading-none select-none" title="معاينة بكامل الشاشة"><span class="text-[8.5px]">👁️</span><span class="truncate">معاينة</span></button>
                    </div>

                    <!-- شريط أدوات المسؤول: زر الحذف بنفس حجم زر المعاينة تماماً والتعديل يأخذ باقي المساحة -->
                    <div class="card-actions-row pt-1.5 border-t border-stone-200/70 flex items-center gap-1.5">
                        <button type="button" onclick="event.stopPropagation(); window.portalOpenEdit('${c.id}')" class="card-btn-edit h-6.5 sm:h-7 flex-1 min-w-0 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-extrabold rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs text-[8px] sm:text-[8.5px] leading-none select-none" title="تعديل بيانات السجادة"><span class="text-[8.5px] shrink-0">✏️</span><span class="truncate font-extrabold">تعديل</span></button>
                        <button type="button" onclick="event.stopPropagation(); window.portalDeleteCarpet('${c.id}')" class="card-btn-delete h-6.5 sm:h-7 w-[52px] sm:w-[58px] shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300/80 font-extrabold rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs text-[8px] sm:text-[8.5px] leading-none select-none" title="حذف السجادة نهائياً"><span class="text-[8.5px] shrink-0">🗑️</span><span class="truncate font-extrabold">حذف</span></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// تبديل حالة توفر القطعة
window.portalToggleStock = async function(carpetId) {
    const carpet = allPortalCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    const newStatus = carpet.status === 'out_of_stock' ? 'available' : 'out_of_stock';
    carpet.status = newStatus;
    
    // تحديث الواجهة فوراً
    renderPortalDashboard();

    try {
        await updateCarpetStatusInCloud(carpetId, newStatus);
        showToast(newStatus === 'out_of_stock' ? `تم تعليم "${carpet.title}" كـ غير متوفرة.` : `تمت إعادة توفير "${carpet.title}" في المعرض.`, 'success', 'تحديث الحالة');
    } catch (e) {
        console.warn("Failed to update status in cloud:", e);
        showToast("فشل تحديث الحالة في السحابة. تأكد من اتصالك.", "error", "خطأ سحابي");
    }
};

// حذف قطعة
window.portalDeleteCarpet = async function(carpetId) {
    const carpet = allPortalCarpets.find(c => c.id === carpetId);
    const title = carpet ? carpet.title : carpetId;

    if (!confirm(`هل أنت متأكد من رغبتك في حذف القطعة «${title}» نهائياً من المعرض والسحابة؟`)) {
        return;
    }

    try {
        await deleteCarpetFromCloud(carpetId);
        allPortalCarpets = allPortalCarpets.filter(c => c.id !== carpetId);
        renderPortalDashboard();
        showToast(`تم حذف القطعة «${title}» بنجاح.`, 'info', 'حذف القطعة');
    } catch (e) {
        console.error("Delete carpet error:", e);
        showToast("تعذر حذف القطعة من السحابة.", "error", "خطأ");
    }
};

// فتح نافذة التعديل
window.portalOpenEdit = function(carpetId) {
    if (typeof openEditModal === 'function') {
        openEditModal(carpetId, allPortalCarpets);
    }
};

// فلترة وبحث
window.handlePortalSearch = function(query) {
    portalSearchQuery = query.trim();
    renderPortalProductsTable();
};

window.handlePortalCategoryFilter = function(cat) {
    portalCategoryFilter = cat;
    renderPortalProductsTable();
};

window.handlePortalStockFilter = function(stock) {
    portalStockFilter = stock;
    renderPortalProductsTable();
};

// ==========================================
// إدارة وتخصيص التصنيفات والأكواد في البوابة
// ==========================================

let isIconDeleteMode = false;

export function getExistingCategoryCodes() {
    const activeCats = getActiveCategories();
    const codes = [];
    activeCats.forEach(cat => {
        const dMatch = DEFAULT_CATEGORIES.find(d => d.id === cat.id);
        const code = cat.code || (dMatch ? dMatch.code : cat.id.charAt(0).toUpperCase());
        codes.push({
            code: String(code).trim().toUpperCase(),
            name: cat.name,
            id: cat.id
        });
    });
    return codes;
}

export function validateCategoryCode(code) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
        return { 
            valid: false, 
            message: 'أدخل رمزاً بالإنجليزية لتوليد كود المنتجات تلقائياً (مثال: Sp أو R)' 
        };
    }
    if (!/^[A-Za-z0-9]+$/.test(cleanCode)) {
        return { 
            valid: false, 
            message: 'يجب أن يتكون الرمز من أحرف إنجليزية أو أرقام فقط بدون مسافات (مثال: Sp أو S2).' 
        };
    }

    const existing = getExistingCategoryCodes();
    const conflict = existing.find(item => item.code === cleanCode);
    if (conflict) {
        return {
            valid: false,
            isDuplicate: true,
            conflictName: conflict.name,
            message: `⚠️ الرمز (${cleanCode}) مستخدم مسبقاً لتصنيف «${conflict.name}». يرجى استخدام رمز آخر (مثال: ${cleanCode}p أو ${cleanCode}1).`
        };
    }

    return {
        valid: true,
        code: cleanCode,
        previewSku: `TATR-0010${cleanCode}`,
        message: `✅ الرمز متاح! نموذج الكود التلقائي للمنتجات: TATR-0010${cleanCode}`
    };
}

export function handleCatCodeInput(value) {
    const feedbackBox = document.getElementById('new-cat-code-feedback');
    const feedbackText = document.getElementById('new-cat-code-feedback-text');
    const submitBtn = document.getElementById('btn-submit-new-category');
    const input = document.getElementById('new-cat-code');

    const result = validateCategoryCode(value);
    
    if (feedbackBox && feedbackText) {
        feedbackText.innerText = result.message;
        feedbackBox.className = "text-[11px] p-2.5 rounded-xl border flex items-center gap-1.5 transition-all " + 
            (!value ? "bg-stone-50 border-stone-200 text-stone-600" :
             result.valid ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" :
             "bg-rose-50 border-rose-300 text-rose-800 font-bold");
    }

    if (submitBtn) {
        submitBtn.disabled = !result.valid;
        if (!result.valid && value) {
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}
window.handleCatCodeInput = handleCatCodeInput;

export function openAddCategoryModal() {
    const modal = document.getElementById('add-category-modal');
    if (!modal) return;
    renderPortalCategoriesList();
    renderQuickIconsUI();
    toggleAddQuickIconForm(false);
    toggleIconDeleteMode(false);
    modal.classList.remove('hidden');

    const nameInput = document.getElementById('new-cat-name');
    const codeInput = document.getElementById('new-cat-code');
    const iconInput = document.getElementById('new-cat-icon');

    if (nameInput) nameInput.value = '';
    if (codeInput) codeInput.value = '';
    if (iconInput) iconInput.value = '✨';

    handleCatCodeInput('');
    if (nameInput) nameInput.focus();
}
window.openAddCategoryModal = openAddCategoryModal;

export function closeAddCategoryModal() {
    const modal = document.getElementById('add-category-modal');
    if (modal) modal.classList.add('hidden');
    toggleIconDeleteMode(false);
}
window.closeAddCategoryModal = closeAddCategoryModal;

export function setNewCatIcon(icon) {
    if (isIconDeleteMode) return;
    const input = document.getElementById('new-cat-icon');
    if (input) input.value = icon;
}
window.setNewCatIcon = setNewCatIcon;

export function submitNewCategory(e) {
    if (e) e.preventDefault();
    const nameInput = document.getElementById('new-cat-name');
    const iconInput = document.getElementById('new-cat-icon');
    const codeInput = document.getElementById('new-cat-code');
    if (!nameInput || !nameInput.value.trim()) return;

    const name = nameInput.value.trim();
    const icon = iconInput && iconInput.value.trim() ? iconInput.value.trim() : '✨';
    const rawCode = codeInput ? codeInput.value.trim() : '';

    const validation = validateCategoryCode(rawCode);
    if (!validation.valid) {
        showToast(validation.message, 'error', 'رمز الكود غير متاح');
        if (codeInput) codeInput.focus();
        return;
    }

    const cleanCode = validation.code;
    const id = 'cat_' + Date.now().toString(36);

    const newCat = { 
        id, 
        name, 
        icon,
        code: cleanCode
    };

    const customCats = getCustomCategories();
    customCats.push(newCat);
    saveCustomCategories(customCats);

    saveCategoryToCloud(newCat);
    renderPortalCategoriesList();
    updatePortalCategoryOptions();
    closeAddCategoryModal();

    showToast(`تمت إضافة تصنيف «${name}» برمز [${cleanCode}] بنجاح.`, 'success', 'إدارة التصنيفات');
}
window.submitNewCategory = submitNewCategory;

export function deleteCategoryPrompt(id, name) {
    if (id === 'all') {
        showToast('تصنيف "الكل" هو تصنيف رئيسي دائم للنظام.', 'warning', 'تنبيه');
        return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في حذف تصنيف «${name}»؟`)) return;

    let customCats = getCustomCategories();
    if (customCats.some(c => c.id === id)) {
        customCats = customCats.filter(c => c.id !== id);
        saveCustomCategories(customCats);
        deleteCategoryFromCloud(id);
    } else {
        const deleted = getDeletedCategoryIds();
        if (!deleted.includes(id)) {
            deleted.push(id);
            saveDeletedCategoryIds(deleted);
            saveCategorySettingsToCloud({
                deletedDefaultCategoryIds: deleted,
                customQuickIcons: getCustomQuickIcons(),
                deletedQuickIcons: getDeletedQuickIcons()
            });
        }
    }

    renderPortalCategoriesList();
    updatePortalCategoryOptions();
    renderPortalProductsTable();
    showToast(`تم حذف تصنيف «${name}» بنجاح.`, 'info', 'حذف التصنيف');
}
window.deleteCategoryPrompt = deleteCategoryPrompt;

export function restoreDefaultCategories() {
    saveDeletedCategoryIds([]);
    saveCategorySettingsToCloud({
        deletedDefaultCategoryIds: [],
        customQuickIcons: getCustomQuickIcons(),
        deletedQuickIcons: getDeletedQuickIcons()
    });
    renderPortalCategoriesList();
    updatePortalCategoryOptions();
    showToast('تمت استعادة التصنيفات الافتراضية بنجاح.', 'success', 'استعادة');
}
window.restoreDefaultCategories = restoreDefaultCategories;

function renderPortalCategoriesList() {
    // دعم كلاً من معرف categories-management-list والمعرف البديل existing-custom-categories
    const listEl = document.getElementById('categories-management-list') || document.getElementById('existing-custom-categories');
    if (!listEl) return;

    const activeCats = getActiveCategories();
    listEl.innerHTML = activeCats.map(cat => {
        const count = allPortalCarpets.filter(c => c.category === cat.id).length;
        const dMatch = DEFAULT_CATEGORIES.find(d => d.id === cat.id);
        const catCode = cat.code || (dMatch ? dMatch.code : cat.id.charAt(0).toUpperCase());
        return `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <div class="flex items-center gap-2">
                    <span class="text-base">${cat.icon || '📁'}</span>
                    <span class="font-display font-bold text-xs text-stone-800">${cat.name}</span>
                    <span class="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
                        كود: ${catCode}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold font-mono">${count} قطعة</span>
                </div>
                <button type="button" onclick="window.deleteCategoryPrompt('${cat.id}', '${cat.name}')" class="text-rose-600 hover:text-rose-800 text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer">
                    حذف ✕
                </button>
            </div>
        `;
    }).join('');
}

function updatePortalCategoryOptions() {
    const filterSelect = document.getElementById('portal-filter-category');
    const newCatSelect = document.getElementById('new-category');
    const editCatSelect = document.getElementById('edit-category');

    const activeCats = getActiveCategories();
    const optionsHtml = activeCats.map(c => {
        const dMatch = DEFAULT_CATEGORIES.find(d => d.id === c.id);
        const code = c.code || (dMatch ? dMatch.code : c.id.charAt(0).toUpperCase());
        return `<option value="${c.id}">${c.icon || ''} ${c.name} (${code})</option>`;
    }).join('');

    if (filterSelect) {
        filterSelect.innerHTML = `<option value="all">جميع التصنيفات</option>` + optionsHtml;
    }
    if (newCatSelect) {
        newCatSelect.innerHTML = optionsHtml;
    }
    if (editCatSelect) {
        editCatSelect.innerHTML = optionsHtml;
    }
}

// ==========================================
// إدارة الأيقونات السريعة (إضافة + حذف بحرية)
// ==========================================

export function toggleIconDeleteMode(forceState) {
    if (typeof forceState === 'boolean') {
        isIconDeleteMode = forceState;
    } else {
        isIconDeleteMode = !isIconDeleteMode;
    }

    const btnText = document.getElementById('btn-toggle-delete-icon-mode-text');
    const btn = document.getElementById('btn-toggle-delete-icon-mode');
    if (btnText && btn) {
        if (isIconDeleteMode) {
            btnText.innerText = "إنهاء الحذف (تم)";
            btn.className = "h-8 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 border border-rose-600 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs box-border";
        } else {
            btnText.innerText = "حذف أيقونة";
            btn.className = "h-8 px-3 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs box-border";
        }
    }

    renderQuickIconsUI();
}
window.toggleIconDeleteMode = toggleIconDeleteMode;

export function deleteQuickIcon(iconToDelete) {
    if (!confirm(`هل ترغب في حذف الأيقونة «${iconToDelete}» من قائمة الأيقونات السريعة؟`)) return;

    // 1. إزالة من المخصصة
    let custom = getCustomQuickIcons();
    custom = custom.filter(ic => ic !== iconToDelete);
    saveCustomQuickIcons(custom);

    // 2. تسجيلها في المحذوفة
    let deleted = getDeletedQuickIcons();
    if (!deleted.includes(iconToDelete)) {
        deleted.push(iconToDelete);
        saveDeletedQuickIcons(deleted);
    }

    // 3. مزامنة مع السحابة
    saveCategorySettingsToCloud({
        deletedDefaultCategoryIds: getDeletedCategoryIds(),
        customQuickIcons: custom,
        deletedQuickIcons: deleted
    });

    showToast(`تم حذف الأيقونة ${iconToDelete} بنجاح.`, 'info', 'إدارة الأيقونات');
    renderQuickIconsUI();
}
window.deleteQuickIcon = deleteQuickIcon;

export function restoreQuickIcons() {
    saveDeletedQuickIcons([]);
    saveCategorySettingsToCloud({
        deletedDefaultCategoryIds: getDeletedCategoryIds(),
        customQuickIcons: getCustomQuickIcons(),
        deletedQuickIcons: []
    });
    showToast('تمت استعادة الأيقونات الافتراضية بنجاح.', 'success', 'استعادة الأيقونات');
    renderQuickIconsUI();
}
window.restoreQuickIcons = restoreQuickIcons;

export function renderQuickIconsUI() {
    const container = document.getElementById('quick-icons-container');
    if (!container) return;

    const icons = getAllQuickIcons();

    if (isIconDeleteMode) {
        let html = `
            <div class="w-full text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-1.5 flex items-center justify-between mb-1.5 font-bold">
                <span>🗑️ انقر على أي أيقونة ترغب في حذفها:</span>
                <button type="button" onclick="window.restoreQuickIcons()" class="text-[10px] text-stone-600 hover:text-stone-900 underline font-normal cursor-pointer">
                    ↺ استعادة الأصلية
                </button>
            </div>
        `;

        if (icons.length === 0) {
            html += `<p class="text-xs text-stone-400 py-1">لا توجد أيقونات متبقية حالياً.</p>`;
        } else {
            html += icons.map(ic => {
                return `
                    <div class="relative inline-block">
                        <button type="button" onclick="window.deleteQuickIcon('${ic}')" class="w-8 h-8 rounded-xl bg-rose-50 border-2 border-rose-400 hover:bg-rose-100 flex items-center justify-center text-sm transition shadow-2xs hover:scale-110 cursor-pointer active:scale-95" title="حذف الأيقونة">
                            ${ic}
                            <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">✕</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = html;
        return;
    }

    // وضع التحديد العادي
    let html = icons.map(ic => {
        return `<button type="button" onclick="setNewCatIcon('${ic}')" class="w-8 h-8 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-400 flex items-center justify-center text-sm transition shadow-2xs hover:scale-105 cursor-pointer active:scale-95" title="اختيار الأيقونة">${ic}</button>`;
    }).join('');

    container.innerHTML = html;
}
window.renderQuickIconsUI = renderQuickIconsUI;

export function toggleAddQuickIconForm(show) {
    const form = document.getElementById('add-quick-icon-form');
    const btn = document.getElementById('btn-show-add-quick-icon');
    if (form) {
        if (show) {
            toggleIconDeleteMode(false);
            form.classList.remove('hidden');
            const input = document.getElementById('new-quick-icon-input');
            if (input) { input.value = ''; input.focus(); }
            if (btn) btn.classList.add('hidden');
        } else {
            form.classList.add('hidden');
            if (btn) btn.classList.remove('hidden');
        }
    }
}
window.toggleAddQuickIconForm = toggleAddQuickIconForm;

export function submitNewQuickIcon(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('new-quick-icon-input');
    if (!input || !input.value.trim()) return;

    const newIcon = input.value.trim();
    
    // إزالة من قائمة المحذوفة إذا كانت موجودة سابقاً
    let deleted = getDeletedQuickIcons();
    if (deleted.includes(newIcon)) {
        deleted = deleted.filter(ic => ic !== newIcon);
        saveDeletedQuickIcons(deleted);
    }

    const custom = getCustomQuickIcons();
    if (!custom.includes(newIcon)) {
        custom.push(newIcon);
        saveCustomQuickIcons(custom);
    }

    saveCategorySettingsToCloud({
        deletedDefaultCategoryIds: getDeletedCategoryIds(),
        customQuickIcons: custom,
        deletedQuickIcons: deleted
    });

    showToast(`تمت إضافة الأيقونة ${newIcon} بنجاح!`, 'success', 'أيقونة جديدة');
    setNewCatIcon(newIcon);
    toggleAddQuickIconForm(false);
    renderQuickIconsUI();
}
window.submitNewQuickIcon = submitNewQuickIcon;

// تصدير نسخة احتياطية
window.portalExportBackup = function() {
    exportCarpetsBackup(allPortalCarpets);
    showToast("تم بدء تنزيل النسخة الاحتياطية (JSON) لجميع المعروضات.", "success", "نسخة احتياطية");
};

// تهيئة أولية عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAdminActivityListeners();
    initImageUploadPreview();
    initEditImageManager();
    initVideoUploadHandlers();

    // مراقبة حالة جلسة Firebase Auth
    subscribeToAdminAuth((user) => {
        updatePortalAuthUI(user);
    });
});

// ربط النوافذ والمعالجات بالنطاق العام للوحة الإدارة
window.openOptionsDrawer = openOptionsDrawer;
window.closeOptionsDrawer = closeOptionsDrawer;
window.openModal = (id) => openModal(id, allPortalCarpets);
window.closeModal = closeModal;
window.handleModalScroll = handleModalScroll;
window.openLightboxFromModalExternal = (id, idx) => openLightboxFromModal(id, idx, allPortalCarpets);
window.openCurrentLogoLightbox = openCurrentLogoLightbox;
window.closeLightbox = closeLightbox;
window.handleLightboxScroll = handleLightboxScroll;

window.openThemeModal = openThemeModal;
window.closeThemeModal = closeThemeModal;
window.selectThemeOption = selectThemeOption;
window.applyTheme = applyTheme;

window.handleAddProduct = (e) => handleAddProduct(e, allPortalCarpets, renderPortalDashboard);
window.handleEditProduct = (e) => handleEditProduct(e, allPortalCarpets, renderPortalDashboard);
window.openAddModal = () => openAddModal(allPortalCarpets);
window.closeAddModal = closeAddModal;
window.openEditModal = (id) => openEditModal(id, allPortalCarpets);
window.closeEditModal = closeEditModal;
window.updateDimensionsPreview = updateDimensionsPreview;
window.openFirebaseConfigModal = openFirebaseConfigModal;
window.closeFirebaseConfigModal = closeFirebaseConfigModal;
window.saveFirebaseConfigHandler = saveFirebaseConfigHandler;
