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
    formatReadableDate,
    saveShowcaseSettingsToCloud,
    subscribeToShowcaseSettings,
    getDefaultShowcaseSettings,
    compressImage,
    fileToBase64,
    uploadCarpetVideo,
    uploadShowcaseImage
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
    showToast,
    showVideoProgressToast 
} from './modals.js';

import { 
    initTheme, 
    openThemeModal, 
    closeThemeModal, 
    selectThemeOption, 
    applyTheme 
} from './theme.js';

import { 
    openTatrizaStudioModal, 
    closeTatrizaStudioModal, 
    initStudioEvents 
} from './studio.js?v=3.0';

import { getVideoFromIndexedDB } from './firebase-public.js';

// حالة لوحة الإدارة
let currentPortalUser = null;
let allPortalCarpets = [];
let allPortalCategories = [];
let portalSearchQuery = '';
let portalCategoryFilter = 'all';
let portalStockFilter = 'all';

// إعدادات الترقيم المدمجة الفاخرة للوحة الإدارة (18 قطعة لكل صفحة - متناسقة مع شبكة العرض)
const PORTAL_ITEMS_PER_PAGE = 18;
let portalCurrentPage = 1;

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
    localStorage.removeItem('tatr_admin_logged_in');
    localStorage.removeItem('tatr_admin_email');
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
            localStorage.removeItem('tatr_admin_logged_in');
            localStorage.removeItem('tatr_admin_last_activity');
            localStorage.removeItem('tatr_admin_email');
            sessionStorage.removeItem('tatr_admin_session_start');
            document.documentElement.classList.remove('admin-session-active');
            document.documentElement.classList.add('admin-session-anonymous');
            if (loginGate) loginGate.classList.remove('hidden');
            if (dashboard) dashboard.classList.add('hidden');
            showToast("انتهت جلسة المسؤول السابقة لعدم النشاط. يرجى تسجيل الدخول مجدداً.", "info", "انتهت الجلسة", 5000);
            return;
        }

        // تثبيت علامات الجلسة النشطة فوراً في المتصفح لمنع وميض شاشة تسجيل الدخول نهائياً عند أي ريفريش
        try {
            localStorage.setItem('tatr_admin_logged_in', 'true');
            localStorage.setItem('tatr_admin_last_activity', now.toString());
            localStorage.setItem('tatr_admin_email', user.email || '');
            if (!sessionStorage.getItem('tatr_admin_session_start')) {
                sessionStorage.setItem('tatr_admin_session_start', now.toString());
            }
        } catch(e) {}

        document.documentElement.classList.add('admin-session-active');
        document.documentElement.classList.remove('admin-session-anonymous');
        if (loginGate) loginGate.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        if (userEmailEl) userEmailEl.innerText = user.email || 'مسؤول معتمد';
        if (drawerEmailEl) drawerEmailEl.innerText = user.email || 'admin@tatriza.com';
        
        // بدء مراقبة الجلسة والنشاط
        startAdminSessionWatcher();

        // تحميل وتحديث المعروضات داخل الصفحة
        initPortalSubscriptions();
    } else {
        stopAdminSessionWatcher();
        try {
            localStorage.removeItem('tatr_admin_logged_in');
            localStorage.removeItem('tatr_admin_last_activity');
            localStorage.removeItem('tatr_admin_email');
            sessionStorage.removeItem('tatr_admin_session_start');
        } catch(e) {}
        document.documentElement.classList.remove('admin-session-active');
        document.documentElement.classList.add('admin-session-anonymous');
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
        localStorage.setItem('tatr_admin_logged_in', 'true');
        localStorage.setItem('tatr_admin_last_activity', Date.now().toString());
        localStorage.setItem('tatr_admin_email', user.email || email);
        sessionStorage.setItem('tatr_admin_session_start', Date.now().toString());
        document.documentElement.classList.add('admin-session-active');
        document.documentElement.classList.remove('admin-session-anonymous');
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
        localStorage.removeItem('tatr_admin_logged_in');
        localStorage.removeItem('tatr_admin_last_activity');
        localStorage.removeItem('tatr_admin_email');
        sessionStorage.removeItem('tatr_admin_session_start');
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
        window.allPortalCarpets = allPortalCarpets;
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

window.portalModalOpenStudio = () => {
    if (currentPreviewCarpetId) {
        const idToOpen = currentPreviewCarpetId;
        closeModal();
        window.openTatrizaStudioModal(idToOpen);
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

function renderPortalProductsTable(shouldScroll = false) {
    const container = document.getElementById('carpets-grid') || document.getElementById('portal-products-grid');
    const paginationContainer = document.getElementById('portal-pagination');
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

    const totalItems = list.length;
    const totalPages = Math.ceil(totalItems / PORTAL_ITEMS_PER_PAGE) || 1;

    if (portalCurrentPage > totalPages) portalCurrentPage = totalPages;
    if (portalCurrentPage < 1) portalCurrentPage = 1;

    if (totalItems === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 px-4 bg-white/80 rounded-3xl border border-stone-200 shadow-2xs" dir="rtl">
                <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl mb-3 shadow-2xs border border-amber-200/60">
                    🔍
                </div>
                <h4 class="font-display font-bold text-stone-800 text-sm sm:text-base">لا توجد قطع مطابقة للبحث أو الفلتر</h4>
                <p class="text-xs text-stone-500 mt-1">جرّب مسح حقل البحث أو إضافة سجادة جديدة للمتجر.</p>
            </div>
        `;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (portalCurrentPage - 1) * PORTAL_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + PORTAL_ITEMS_PER_PAGE, totalItems);
    const paginatedList = list.slice(startIndex, endIndex);

    container.innerHTML = paginatedList.map((c, index) => {
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
                        <span class="card-badge-dimensions absolute top-1.5 right-1.5 px-2 bg-black/30 hover:bg-black/45 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold rounded-lg shadow-xs border border-white/20 inline-flex items-center justify-center leading-none text-center z-30 pointer-events-none select-none transition">
                            ${c.dimensions || ''}
                        </span>

                        <!-- شارة حالة التوفر في أعلى اليسار (زجاجي كريستالي شفاف وملون فاخر) -->
                        <button type="button" onclick="event.stopPropagation(); window.portalToggleStock('${c.id}')" class="card-badge-stock absolute top-1.5 left-1.5 px-2 rounded-lg text-[8px] sm:text-[9px] font-bold shadow-xs transition inline-flex items-center justify-center gap-1 cursor-pointer backdrop-blur-md leading-none text-center z-30 select-none ${isOutOfStock ? 'bg-rose-950/40 hover:bg-rose-950/60 text-rose-200 border border-rose-400/30' : 'bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-200 border border-emerald-400/30'}" title="انقر للتبديل الفوري لحالة التوفر">
                            <span class="stock-dot w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-400' : 'bg-emerald-400'} shrink-0 shadow-2xs"></span>
                            <span class="whitespace-nowrap">${isOutOfStock ? 'نفدت' : 'متوفرة'}</span>
                        </button>

                        <!-- طبقة تغطية زجاجية خفيفة وشفافة تماماً إن كانت نافدة -->
                        ${isOutOfStock ? `
                            <div class="absolute inset-0 bg-black/15 backdrop-blur-[0.5px] flex items-center justify-center z-20 pointer-events-none p-1">
                                <span class="h-6 sm:h-6.5 px-2.5 bg-black/40 backdrop-blur-md text-amber-200 border border-white/20 text-[8.5px] sm:text-[9.5px] font-bold rounded-lg shadow-md inline-flex items-center justify-center leading-none text-center select-none">
                                    نفدت الكمية
                                </span>
                            </div>
                        ` : ''}

                        <!-- عداد الوسائط في أسفل اليسار (زجاجي شفاف وخفيف) -->
                        ${imagesCount > 1 ? `
                            <div class="card-badge-media absolute bottom-1.5 left-1.5 px-1.5 bg-black/30 backdrop-blur-md text-white/90 text-[7.5px] sm:text-[8px] font-bold rounded-md inline-flex items-center justify-center leading-none text-center pointer-events-none border border-white/15 z-30 select-none">
                                <span>📷 ${imagesCount}</span>
                            </div>
                        ` : ''}

                        <!-- زر الفيديو في أسفل اليمين (زجاجي شفاف وراقي) -->
                        ${hasVideo ? `
                            <button type="button" onclick="event.stopPropagation(); window.portalPlayCardVideo('${c.id}')" class="card-badge-video absolute bottom-1.5 right-1.5 px-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md text-amber-300 text-[7.5px] sm:text-[8px] font-bold rounded-md inline-flex items-center justify-center gap-0.5 pointer-events-auto z-30 border border-white/20 leading-none text-center shadow-xs transition cursor-pointer select-none" title="مشاهدة وتكبير الفيديو">
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
                        <h4 class="card-title-text font-royal-carpet font-bold text-stone-900 text-[10px] sm:text-[11px] leading-snug truncate group-hover:text-brand transition mt-1" title="${c.title}">${c.title}</h4>
                    </div>

                    <div class="card-price-row flex items-center justify-between gap-1 mt-auto pb-1.5">
                        <div class="flex items-baseline gap-0.5 shrink-0">
                            <span class="card-price-val font-display text-xs sm:text-[13px] font-black text-brand leading-none">${Number(c.price || 0).toLocaleString()}</span>
                            <span class="card-price-curr font-display text-brand text-[7.5px] sm:text-[8px] font-bold leading-none">ر.ع.</span>
                        </div>
                        <button type="button" onclick="event.stopPropagation(); window.openTatrizaStudioModal('${c.id}')" class="card-btn-studio btn-liquid-metal text-white text-[8px] sm:text-[8.5px] font-bold h-6.5 sm:h-7 px-2 sm:px-2.5 shrink-0 rounded-lg transition shadow-2xs cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1 leading-none select-none" title="فتح استوديو التصاميم الفاخر للسوشيال ميديا"><span class="text-[8.5px] shrink-0">🎨</span><span class="whitespace-nowrap font-bold">الاستوديو</span></button>
                    </div>

                    <!-- شريط أدوات المسؤول: التعديل، والحذف -->
                    <div class="card-actions-row pt-1.5 border-t border-stone-200/70 flex items-center gap-1.5">
                        <button type="button" onclick="event.stopPropagation(); window.portalOpenEdit('${c.id}')" class="card-btn-edit h-6.5 sm:h-7 flex-1 min-w-0 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/80 font-extrabold rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs text-[8px] sm:text-[8.5px] leading-none select-none" title="تعديل بيانات السجادة"><span class="text-[8.5px] shrink-0">✏️</span><span class="truncate font-extrabold">تعديل</span></button>
                        <button type="button" onclick="event.stopPropagation(); window.portalDeleteCarpet('${c.id}')" class="card-btn-delete h-6.5 sm:h-7 w-[46px] sm:w-[50px] shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300/80 font-extrabold rounded-lg transition inline-flex items-center justify-center gap-1 cursor-pointer shadow-2xs text-[8px] sm:text-[8.5px] leading-none select-none" title="حذف السجادة نهائياً"><span class="text-[8.5px] shrink-0">🗑️</span><span class="truncate font-extrabold">حذف</span></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    renderPortalPagination(totalItems, portalCurrentPage, totalPages);

    if (shouldScroll) {
        const offset = 100;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = container.getBoundingClientRect().top;
        const offsetPosition = elementRect - bodyRect - offset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function renderPortalPagination(totalItems, currentPage, totalPages) {
    const container = document.getElementById('portal-pagination');
    if (!container) return;

    if (totalItems <= PORTAL_ITEMS_PER_PAGE || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    const pageButtonsHtml = pages.map(p => {
        if (p === '...') {
            return `<span class="px-1.5 text-stone-400 font-bold select-none text-xs">•••</span>`;
        }
        const isActive = p === currentPage;
        return `
            <button 
                type="button" 
                onclick="window.changePortalPage(${p})" 
                class="pagination-btn ${isActive ? 'active' : ''}" 
                ${isActive ? 'aria-current="page"' : ''}
                title="الانتقال إلى صفحة ${p}">
                ${p}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <nav aria-label="ترقيم صفحات إدارة المعروضات" class="pagination-capsule" dir="rtl">
            <!-- زر السابق -->
            <button 
                type="button" 
                onclick="window.changePortalPage(${currentPage - 1})" 
                class="pagination-nav-btn" 
                ${currentPage === 1 ? 'disabled' : ''} 
                title="الصفحة السابقة">
                <span class="text-sm">→</span>
                <span class="hidden sm:inline">السابق</span>
            </button>

            <!-- الأرقام للكمبيوتر والتابلت -->
            <div class="hidden sm:flex items-center gap-1 px-0.5">
                ${pageButtonsHtml}
            </div>

            <!-- عداد ملموم ومريح للجوال -->
            <div class="sm:hidden px-2 py-0.5 text-xs font-bold text-stone-800 whitespace-nowrap">
                صفحة <span class="text-brand font-black">${currentPage}</span> من <span>${totalPages}</span>
            </div>

            <!-- زر التالي -->
            <button 
                type="button" 
                onclick="window.changePortalPage(${currentPage + 1})" 
                class="pagination-nav-btn" 
                ${currentPage === totalPages ? 'disabled' : ''} 
                title="الصفحة التالية">
                <span class="hidden sm:inline">التالي</span>
                <span class="text-sm">←</span>
            </button>

            <!-- فاصل أنيق على نفس السطر -->
            <span class="pagination-divider"></span>

            <!-- إجمالي عدد القطع والصفحات بنفس السطر -->
            <div class="pagination-summary-pill" title="إجمالي ${totalItems} قطعة مسجلة مقسمة على ${totalPages} صفحات">
                <span class="font-extrabold text-brand">${totalItems}</span>
                <span class="text-[11px] sm:text-xs">قطعة</span>
                <span class="opacity-30 font-light">•</span>
                <span class="text-[11px] sm:text-xs font-bold text-stone-700">${totalPages} صفحات</span>
            </div>
        </nav>
    `;
}

window.changePortalPage = function(page) {
    portalCurrentPage = page;
    renderPortalProductsTable(true);
};


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
    portalCurrentPage = 1;
    renderPortalProductsTable();
};

window.handlePortalCategoryFilter = function(cat) {
    portalCategoryFilter = cat;
    portalCurrentPage = 1;
    renderPortalProductsTable();
};

window.handlePortalStockFilter = function(stock) {
    portalStockFilter = stock;
    portalCurrentPage = 1;
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

// ==========================================
// محرك إدارة الأقسام الترويجية والبنرات (Showcase CMS Engine)
// دار تطريز TATRIZA - تحكم كامل للمسؤول مع مزامنة سحابية
// ==========================================
let showcaseState = null;
let currentShowcaseTab = 'marquee';
let pendingCinemaVideoFile = null;
let pendingCinemaVideoIsVertical = null;
let pendingCinemaPosterFile = null;
let pendingJourneyImgFile = null;
let pendingLookbookImgFile = null;

export function getLocalShowcaseSettings() {
    try {
        const stored = localStorage.getItem('tatr_showcase_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && Array.isArray(parsed.marqueeItems) && parsed.marqueeItems.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not read local showcase settings:", e);
    }
    const defaultData = getDefaultShowcaseSettings();
    saveLocalShowcaseSettings(defaultData);
    return defaultData;
}

export function saveLocalShowcaseSettings(data) {
    try {
        localStorage.setItem('tatr_showcase_settings', JSON.stringify(data));
    } catch (e) {
        console.warn("Could not save showcase settings locally:", e);
    }
}

export function updateShowcaseSyncStatus(isCloud) {
    const statusEl = document.getElementById('showcase-sync-status');
    if (!statusEl) return;
    if (isCloud) {
        statusEl.className = 'flex items-center gap-1.5 md:gap-2 text-stone-500 text-xs font-medium shrink-0';
        statusEl.innerHTML = `
            <span class="hidden lg:inline">حفظ فوري مباشر على السحابة</span>
            <span class="hidden sm:inline lg:hidden text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 text-xs font-bold">سحابي مباشر ✓</span>
            <span class="sm:hidden inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300/80 px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>سحابي مباشر</span>
            </span>
        `;
    } else {
        statusEl.className = 'flex items-center gap-1.5 md:gap-2 text-stone-500 text-xs font-medium shrink-0';
        statusEl.innerHTML = `
            <span class="hidden lg:inline">تخزين محلي مؤمن</span>
            <span class="hidden sm:inline lg:hidden text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 text-xs font-bold">محلي مؤمن ✓</span>
            <span class="sm:hidden inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300/80 px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>محلي</span>
            </span>
        `;
    }
}

export async function syncShowcaseState(newState, toastMsg = 'تم الحفظ بنجاح') {
    showcaseState = { ...newState };
    saveLocalShowcaseSettings(showcaseState);
    renderShowcaseUI();

    let cloudSaved = false;
    if (isFirebaseConfigured()) {
        try {
            await saveShowcaseSettingsToCloud(showcaseState);
            cloudSaved = true;
            updateShowcaseSyncStatus(true);
        } catch (err) {
            console.warn("Could not sync showcase to Firebase:", err);
            updateShowcaseSyncStatus(false);
        }
    } else {
        updateShowcaseSyncStatus(false);
    }

    if (toastMsg) {
        showToast(
            cloudSaved ? `${toastMsg} (تم التحديث السحابي فوراً)` : `${toastMsg} (حُفظ محلياً)`,
            'success',
            'إدارة المعرض والترويج'
        );
    }
}

export function initShowcaseCMS() {
    showcaseState = getLocalShowcaseSettings();
    
    // المزامنة اللحظية من Firebase
    if (isFirebaseConfigured()) {
        try {
            subscribeToShowcaseSettings((cloudData) => {
                if (cloudData && Array.isArray(cloudData.marqueeItems)) {
                    showcaseState = cloudData;
                    saveLocalShowcaseSettings(cloudData);
                    renderShowcaseUI();
                    updateShowcaseSyncStatus(true);
                }
            });
        } catch (e) {
            console.warn("Showcase subscription init error:", e);
        }
    }
}

export function openShowcaseManagerModal() {
    if (typeof window.switchPortalScreen === 'function') {
        window.switchPortalScreen('banners');
        return;
    }
    const modal = document.getElementById('portal-view-banners') || document.getElementById('showcase-manager-modal');
    if (!modal) return;
    if (!showcaseState) showcaseState = getLocalShowcaseSettings();
    renderShowcaseUI();
    switchShowcaseTab(currentShowcaseTab || 'marquee');
    modal.classList.remove('hidden');
}

export function closeShowcaseManagerModal() {
    if (typeof window.switchPortalScreen === 'function') {
        window.switchPortalScreen('carpets');
        return;
    }
    const modal = document.getElementById('portal-view-banners') || document.getElementById('showcase-manager-modal');
    if (modal) modal.classList.add('hidden');
    cancelMarqueeEdit();
    cancelCinemaEdit();
    cancelJourneyEdit();
    cancelLookbookEdit();
}

function scrollShowcaseToTop() {
    const scrollContainer = document.querySelector('#showcase-manager-modal .overflow-y-auto');
    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

export function switchShowcaseTab(tabName) {
    currentShowcaseTab = tabName;
    const tabBtns = document.querySelectorAll('.showcase-tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active', 'bg-stone-900', 'text-white', 'shadow-xs');
        btn.classList.add('bg-stone-100', 'text-stone-700', 'hover:bg-stone-200');
    });

    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-stone-900', 'text-white', 'shadow-xs');
        activeBtn.classList.remove('bg-stone-100', 'text-stone-700', 'hover:bg-stone-200');
    }

    const panes = document.querySelectorAll('.showcase-tab-pane');
    panes.forEach(p => p.classList.add('hidden'));

    const activePane = document.getElementById(`tab-content-${tabName}`);
    if (activePane) activePane.classList.remove('hidden');

    scrollShowcaseToTop();
}

export function renderShowcaseUI() {
    if (!showcaseState) return;

    // تحديث أرقام الشارات في التبويبات
    const badgeMq = document.getElementById('badge-count-marquee');
    const badgeCin = document.getElementById('badge-count-cinema');
    const badgeJrn = document.getElementById('badge-count-journey');
    const badgeLkb = document.getElementById('badge-count-lookbook');

    if (badgeMq) badgeMq.innerText = showcaseState.marqueeItems ? showcaseState.marqueeItems.length : 0;
    if (badgeCin) badgeCin.innerText = showcaseState.cinemaVideos ? showcaseState.cinemaVideos.length : 0;
    if (badgeJrn) badgeJrn.innerText = showcaseState.journeySteps ? showcaseState.journeySteps.length : 0;
    if (badgeLkb) badgeLkb.innerText = showcaseState.lookbookItems ? showcaseState.lookbookItems.length : 0;

    renderMarqueeTab();
    renderCinemaTab();
    renderJourneyTab();
    renderLookbookTab();
}

// ------------------------------------------
// 1. إدارة شريط العبارات المتحركة (Marquee)
// ------------------------------------------
function renderMarqueeTab() {
    const listEl = document.getElementById('marquee-items-list');
    if (!listEl) return;
    const items = showcaseState.marqueeItems || [];

    if (items.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-center text-[11px] sm:text-xs text-stone-500 bg-stone-50 rounded-xl">لا توجد عبارات حالياً في الشريط. يمكنك إضافة عبارة جديدة أعلاه.</div>';
        return;
    }

    listEl.innerHTML = items.map((item, idx) => `
        <div class="flex items-center justify-between p-2.5 sm:p-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition shadow-2xs gap-2">
            <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center text-sm sm:text-base shrink-0 select-none">${item.icon || '⚜️'}</span>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                        <span class="font-bold text-stone-900 text-[11.5px] sm:text-sm truncate">${item.title}</span>
                        <span class="text-[9px] sm:text-[10px] text-stone-400 font-number">#${idx + 1}</span>
                    </div>
                    <p class="text-[10px] sm:text-[11px] text-stone-600 truncate mt-0.5">${item.desc}</p>
                </div>
            </div>
            <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button type="button" onclick="startMarqueeEdit('${item.id}')" class="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer" title="تعديل العبارة">
                    ✏️<span class="hidden sm:inline"> تعديل</span>
                </button>
                <button type="button" onclick="deleteMarqueeItem('${item.id}')" class="px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="حذف العبارة">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

export function handleMarqueeFormSubmit(e) {
    e.preventDefault();
    const idInput = document.getElementById('marquee-edit-id');
    const iconInput = document.getElementById('marquee-input-icon');
    const titleInput = document.getElementById('marquee-input-title');
    const descInput = document.getElementById('marquee-input-desc');

    const icon = (iconInput.value || '⚜️').trim();
    const title = (titleInput.value || '').trim();
    const desc = (descInput.value || '').trim();

    if (!title || !desc) {
        showToast('يرجى كتابة العنوان والشرح للعبارة.', 'warning', 'حقل مطلوب');
        return;
    }

    const editId = idInput ? idInput.value : '';
    let updatedItems = [...(showcaseState.marqueeItems || [])];

    if (editId) {
        updatedItems = updatedItems.map(item => {
            if (item.id === editId) {
                return { ...item, icon, title, desc };
            }
            return item;
        });
        syncShowcaseState({ ...showcaseState, marqueeItems: updatedItems }, 'تم تعديل العبارة في الشريط المتحرك بنجاح');
    } else {
        const newItem = {
            id: 'mq-' + Date.now(),
            icon,
            title,
            desc
        };
        updatedItems.push(newItem);
        syncShowcaseState({ ...showcaseState, marqueeItems: updatedItems }, 'تمت إضافة العبارة الجديدة للشريط المتحرك');
    }

    cancelMarqueeEdit();
}

export function startMarqueeEdit(id) {
    const item = (showcaseState.marqueeItems || []).find(it => it.id === id);
    if (!item) return;

    const idInput = document.getElementById('marquee-edit-id');
    const iconInput = document.getElementById('marquee-input-icon');
    const titleInput = document.getElementById('marquee-input-title');
    const descInput = document.getElementById('marquee-input-desc');
    const formTitle = document.getElementById('marquee-form-title');
    const submitText = document.getElementById('marquee-submit-text');
    const cancelBtn = document.getElementById('marquee-cancel-edit-btn');

    if (idInput) idInput.value = item.id;
    if (iconInput) iconInput.value = item.icon || '⚜️';
    if (titleInput) titleInput.value = item.title || '';
    if (descInput) descInput.value = item.desc || '';
    if (formTitle) formTitle.innerText = `تعديل العبارة: «${item.title}»`;
    if (submitText) submitText.innerText = 'حفظ التعديل';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    scrollShowcaseToTop();
    if (titleInput) titleInput.focus();
}

export function cancelMarqueeEdit() {
    const idInput = document.getElementById('marquee-edit-id');
    const iconInput = document.getElementById('marquee-input-icon');
    const titleInput = document.getElementById('marquee-input-title');
    const descInput = document.getElementById('marquee-input-desc');
    const formTitle = document.getElementById('marquee-form-title');
    const submitText = document.getElementById('marquee-submit-text');
    const cancelBtn = document.getElementById('marquee-cancel-edit-btn');

    if (idInput) idInput.value = '';
    if (iconInput) iconInput.value = '⚜️';
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (formTitle) formTitle.innerText = 'إضافة عبارة جديدة للشريط المتحرك:';
    if (submitText) submitText.innerText = 'إضافة العبارة للشريط';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

export function deleteMarqueeItem(id) {
    const item = (showcaseState.marqueeItems || []).find(it => it.id === id);
    const itemTitle = item ? item.title : 'هذه العبارة';
    if (!confirm(`هل أنت متأكد من حذف عبارة «${itemTitle}» من الشريط المتحرك؟`)) return;

    const updated = (showcaseState.marqueeItems || []).filter(it => it.id !== id);
    syncShowcaseState({ ...showcaseState, marqueeItems: updated }, `تم حذف عبارة «${itemTitle}» من الشريط`);
}

// ------------------------------------------
// 2. إدارة سينما وفيديوهات المشغل (Cinema)
// ------------------------------------------
function renderCinemaTab() {
    const listEl = document.getElementById('cinema-videos-list');
    if (!listEl) return;
    const videos = showcaseState.cinemaVideos || [];

    if (videos.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-center text-[11px] sm:text-xs text-stone-500 bg-stone-50 rounded-xl">لا توجد فيديوهات حالياً. أضف فيديو المشغل الأول أعلاه.</div>';
        return;
    }

    listEl.innerHTML = videos.map((vid, idx) => {
        const isActive = Boolean(vid.isActive);
        const isDeviceStored = vid.videoUrl && vid.videoUrl.startsWith('idb://video_');
        return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3.5 bg-white hover:bg-stone-50 border ${isActive ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-300' : 'border-stone-200'} rounded-xl sm:rounded-2xl transition gap-2.5 sm:gap-3 shadow-2xs">
                <div class="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div class="relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-300 shadow-2xs">
                        <img src="${vid.posterUrl || '../images/craft_video_poster.jpg'}" alt="${vid.title}" class="w-full h-full object-cover">
                        <span class="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[10px] sm:text-xs">▶</span>
                        <span class="absolute bottom-0.5 right-0.5 text-[8.5px] font-number font-black bg-black/70 text-amber-300 px-1 rounded">#${idx + 1}</span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-bold text-stone-900 text-xs sm:text-sm truncate">${vid.title}</span>
                            ${isActive ? '<span class="px-1.5 sm:px-2 py-0.2 rounded-full text-[8.5px] sm:text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">🌟 النشط</span>' : ''}
                        </div>
                        <div class="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-stone-500 mt-0.5 flex-wrap">
                            <span>${vid.subtitle || '✨ أصالة المشغل'}</span>
                            <span>•</span>
                            ${isDeviceStored 
                                ? '<span class="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">📹 ملف من الجهاز</span>' 
                                : '<span class="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-stone-100 text-stone-700 border border-stone-200">☁️ مقطع سحابي</span>'}
                        </div>
                        <div class="flex items-center gap-2 sm:gap-3 text-[9.5px] sm:text-[10px] text-stone-600 mt-0.5 font-bold">
                            <span>⏱️ ${vid.stats ? vid.stats.hours : '+500'} س</span>
                            <span>🧵 ${vid.stats ? vid.stats.material : '100%'}</span>
                            <span>🪢 ${vid.stats ? vid.stats.knots : '120K'}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100 w-full sm:w-auto justify-end">
                    ${!isActive ? `
                        <button type="button" onclick="setActiveCinemaVideo('${vid.id}')" class="px-2 sm:px-2.5 py-1 text-[10.5px] sm:text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition cursor-pointer" title="تنشيط هذا الفيديو ليكون المعروض حالياً">
                            🌟 تنشيط للعرض
                        </button>
                    ` : ''}
                    <button type="button" onclick="startCinemaEdit('${vid.id}')" class="px-2 sm:px-2.5 py-1 text-[10.5px] sm:text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer" title="تعديل الفيديو">
                        ✏️ تعديل
                    </button>
                    <button type="button" onclick="deleteCinemaVideo('${vid.id}')" class="px-1.5 sm:px-2 py-1 text-[10.5px] sm:text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer" title="حذف الفيديو">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ------------------------------------------
// معالجات اختيار ملفات الفيديو والصور من أجهزة الكمبيوتر أو استوديو الجوال
// ------------------------------------------
export function handleCinemaVideoSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
        showToast('يرجى اختيار ملف فيديو صالح (MP4 أو WebM أو MOV).', 'error', 'صيغة غير مدعومة');
        return;
    }

    pendingCinemaVideoFile = file;
    pendingCinemaVideoIsVertical = null;

    const previewBox = document.getElementById('cinema-video-preview-box');
    const previewPlayer = document.getElementById('cinema-video-preview-player');
    const noPreviewBox = document.getElementById('cinema-video-no-preview');
    const videoInfo = document.getElementById('cinema-video-info');
    const btnText = document.getElementById('cinema-video-btn-text');

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);

    if (previewPlayer) {
        previewPlayer.src = URL.createObjectURL(file);
        previewPlayer.onloadedmetadata = () => {
            const isVert = previewPlayer.videoHeight > previewPlayer.videoWidth;
            pendingCinemaVideoIsVertical = isVert;
            if (videoInfo) {
                const ratioText = isVert ? '📱 تصوير عمودي (كامل)' : '🖥️ تصوير أفقي (عرض كامل)';
                videoInfo.innerText = `🎥 ${file.name} (${sizeMB} MB) • ${ratioText}`;
            }
        };
        previewPlayer.load();
    }
    if (previewBox) previewBox.classList.remove('hidden');
    if (noPreviewBox) noPreviewBox.classList.add('hidden');
    if (videoInfo) videoInfo.innerText = `🎥 ${file.name} (${sizeMB} ميجابايت)`;
    if (btnText) btnText.innerText = 'تغيير مقطع الفيديو';

    showToast(`تم اختيار الفيديو: «${file.name}» (${sizeMB} MB) من جهازك بنجاح.`, 'success', 'مقطع محدد');
}

export function clearCinemaVideoSelection() {
    pendingCinemaVideoFile = null;
    pendingCinemaVideoIsVertical = null;
    const fileInput = document.getElementById('cinema-file-video');
    if (fileInput) fileInput.value = '';

    const previewBox = document.getElementById('cinema-video-preview-box');
    const previewPlayer = document.getElementById('cinema-video-preview-player');
    const noPreviewBox = document.getElementById('cinema-video-no-preview');
    const btnText = document.getElementById('cinema-video-btn-text');
    const videoUrlInput = document.getElementById('cinema-input-videourl');

    if (previewPlayer) {
        previewPlayer.pause();
        previewPlayer.removeAttribute('src');
        previewPlayer.load();
    }
    if (previewBox) previewBox.classList.add('hidden');
    if (noPreviewBox) noPreviewBox.classList.remove('hidden');
    if (btnText) btnText.innerText = 'اختيار مقطع من الجهاز / الاستوديو';
    if (videoUrlInput) videoUrlInput.value = '';
}

export function handleCinemaPosterSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    pendingCinemaPosterFile = file;
    const previewImg = document.getElementById('cinema-poster-preview');
    const statusText = document.getElementById('cinema-poster-status');

    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (statusText) {
        const sizeKB = Math.round(file.size / 1024);
        statusText.innerText = `📸 ${file.name} (${sizeKB} KB)`;
    }
    showToast('تم تحديد صورة الغلاف من جهازك بنجاح.', 'success', 'غلاف الفيديو');
}

export async function handleCinemaFormSubmit(e) {
    e.preventDefault();
    const idInput = document.getElementById('cinema-edit-id');
    const titleInput = document.getElementById('cinema-input-title');
    const subtitleInput = document.getElementById('cinema-input-subtitle');
    const videoUrlInput = document.getElementById('cinema-input-videourl');
    const posterUrlInput = document.getElementById('cinema-input-posterurl');
    const quoteInput = document.getElementById('cinema-input-quote');
    const captionInput = document.getElementById('cinema-input-caption');
    const hoursInput = document.getElementById('cinema-input-hours');
    const materialInput = document.getElementById('cinema-input-material');
    const knotsInput = document.getElementById('cinema-input-knots');
    const activeInput = document.getElementById('cinema-input-active');

    const title = (titleInput.value || '').trim();
    const subtitle = (subtitleInput.value || '✨ أصالة المشغل اليدوي').trim();
    const quote = (quoteInput.value || '').trim();
    const caption = (captionInput.value || '').trim();
    const hours = (hoursInput.value || '+500').trim();
    const material = (materialInput.value || '100%').trim();
    const knots = (knotsInput.value || '120K').trim();
    const shouldBeActive = activeInput ? activeInput.checked : false;

    const editId = idInput ? idInput.value : '';
    let videoUrl = (videoUrlInput ? videoUrlInput.value : '').trim();
    let posterUrl = (posterUrlInput ? posterUrlInput.value : '../images/craft_video_poster.jpg').trim();

    if (!title) {
        showToast('يرجى إدخال عنوان الفيديو البارز.', 'warning', 'حقل مطلوب');
        return;
    }

    if (!editId && !pendingCinemaVideoFile && !videoUrl) {
        showToast('يرجى اختيار مقطع فيديو للمشغل من ملفات جهازك أو استوديو الجوال.', 'warning', 'مقطع الفيديو مطلوب');
        return;
    }

    const submitBtn = document.getElementById('cinema-submit-btn');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span><span>جاري حفظ المقطع...</span>';
    }

    try {
        const vidId = editId || ('vid-' + Date.now());

        let progressInterval = null;
        let currentProgress = 10;

        // إذا اختار المسؤول ملف فيديو جديد من جهازه:
        if (pendingCinemaVideoFile) {
            showVideoProgressToast(12, 'جاري قراءة وتجهيز الفيديو من الجهاز...');
            progressInterval = setInterval(() => {
                if (currentProgress < 85) {
                    currentProgress += Math.floor(Math.random() * 6) + 3;
                    showVideoProgressToast(Math.min(88, currentProgress), 'جاري معالجة وتشفير المقطع...');
                }
            }, 260);

            const savedVidUrl = await uploadCarpetVideo(vidId, pendingCinemaVideoFile, (msg) => {
                const match = msg.match(/(\d+)%/);
                if (match) {
                    const p = parseInt(match[1], 10);
                    currentProgress = Math.max(currentProgress, Math.min(96, p));
                    showVideoProgressToast(currentProgress, msg);
                } else {
                    showVideoProgressToast(currentProgress, msg);
                }
            });

            if (progressInterval) clearInterval(progressInterval);

            if (savedVidUrl) {
                videoUrl = savedVidUrl;
                showVideoProgressToast(92, 'تم تجهيز المقطع، جاري حفظ البيانات...');
            }
        } else if (editId) {
            // في حال تعديل بيانات الفيديو القائم دون رفع ملف جديد
            showVideoProgressToast(25, 'جاري تحديث بيانات المشهد والفيديو...');
            progressInterval = setInterval(() => {
                if (currentProgress < 88) {
                    currentProgress += 15;
                    showVideoProgressToast(currentProgress, 'جاري مزامنة بيانات الفيديو...');
                }
            }, 180);
        }

        // إذا اختار صورة غلاف جديدة من جهازه:
        if (pendingCinemaPosterFile) {
            if (currentProgress < 90) currentProgress = 90;
            showVideoProgressToast(currentProgress, 'جاري معالجة صورة الغلاف...');
            const savedPoster = await uploadShowcaseImage(pendingCinemaPosterFile, 'cinema_posters');
            if (savedPoster) posterUrl = savedPoster;
        }

        if (!videoUrl) {
            if (progressInterval) clearInterval(progressInterval);
            showToast('تعذر حفظ مقطع الفيديو، يرجى إعادة المحاولة.', 'error', 'خطأ');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = origBtnHtml; }
            return;
        }

        let updatedVideos = [...(showcaseState.cinemaVideos || [])];

        if (shouldBeActive) {
            updatedVideos = updatedVideos.map(v => ({ ...v, isActive: false }));
        }

        if (editId) {
            updatedVideos = updatedVideos.map(v => {
                if (v.id === editId) {
                    const finalIsVertical = pendingCinemaVideoIsVertical !== null ? pendingCinemaVideoIsVertical : (v.isVertical !== undefined ? v.isVertical : false);
                    return {
                        ...v,
                        title,
                        subtitle,
                        videoUrl,
                        posterUrl,
                        quote,
                        caption,
                        stats: { hours, material, knots },
                        isActive: shouldBeActive ? true : v.isActive,
                        isVertical: finalIsVertical
                    };
                }
                return v;
            });
            // نمرر null حتى لا يصدر syncShowcaseState أي تنبيه ثانٍ يتكدس على الشاشة
            await syncShowcaseState({ ...showcaseState, cinemaVideos: updatedVideos }, null);
        } else {
            const isFirst = updatedVideos.length === 0;
            const newVid = {
                id: vidId,
                title,
                subtitle,
                videoUrl,
                posterUrl,
                quote,
                caption,
                stats: { hours, material, knots },
                isActive: shouldBeActive || isFirst,
                isVertical: pendingCinemaVideoIsVertical === true
            };
            updatedVideos.push(newVid);
            await syncShowcaseState({ ...showcaseState, cinemaVideos: updatedVideos }, null);
        }

        if (progressInterval) clearInterval(progressInterval);
        // التنبيه الوحيد المتصاعد الذي يكتمل بنسبة 100% ويقفل المعالجة
        showVideoProgressToast(100, editId ? 'تم تعديل وحفظ الفيديو بنجاح! 100%' : 'تمت إضافة ومعالجة الفيديو بنجاح! 100%', true);

        cancelCinemaEdit();
    } catch (err) {
        console.error("Error saving cinema video:", err);
        showToast('حدث خطأ أثناء حفظ الفيديو.', 'error', 'خطأ');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHtml;
        }
    }
}

export function setActiveCinemaVideo(id) {
    const updated = (showcaseState.cinemaVideos || []).map(v => ({
        ...v,
        isActive: v.id === id
    }));
    syncShowcaseState({ ...showcaseState, cinemaVideos: updated }, 'تم تعيين الفيديو كفيديو رئيسي معروض في الواجهة');
}

export function startCinemaEdit(id) {
    const vid = (showcaseState.cinemaVideos || []).find(v => v.id === id);
    if (!vid) return;

    pendingCinemaVideoFile = null;
    pendingCinemaVideoIsVertical = vid.isVertical !== undefined ? vid.isVertical : null;
    pendingCinemaPosterFile = null;

    const idInput = document.getElementById('cinema-edit-id');
    const titleInput = document.getElementById('cinema-input-title');
    const subtitleInput = document.getElementById('cinema-input-subtitle');
    const videoUrlInput = document.getElementById('cinema-input-videourl');
    const posterUrlInput = document.getElementById('cinema-input-posterurl');
    const posterImg = document.getElementById('cinema-poster-preview');
    const posterStatus = document.getElementById('cinema-poster-status');
    const quoteInput = document.getElementById('cinema-input-quote');
    const captionInput = document.getElementById('cinema-input-caption');
    const hoursInput = document.getElementById('cinema-input-hours');
    const materialInput = document.getElementById('cinema-input-material');
    const knotsInput = document.getElementById('cinema-input-knots');
    const activeInput = document.getElementById('cinema-input-active');
    const formTitle = document.getElementById('cinema-form-title');
    const submitText = document.getElementById('cinema-submit-text');
    const cancelBtn = document.getElementById('cinema-cancel-edit-btn');

    const previewBox = document.getElementById('cinema-video-preview-box');
    const previewPlayer = document.getElementById('cinema-video-preview-player');
    const noPreviewBox = document.getElementById('cinema-video-no-preview');
    const videoInfo = document.getElementById('cinema-video-info');
    const btnText = document.getElementById('cinema-video-btn-text');

    if (idInput) idInput.value = vid.id;
    if (titleInput) titleInput.value = vid.title || '';
    if (subtitleInput) subtitleInput.value = vid.subtitle || '';
    if (videoUrlInput) videoUrlInput.value = vid.videoUrl || '';
    if (posterUrlInput) posterUrlInput.value = vid.posterUrl || '';
    if (posterImg && vid.posterUrl) posterImg.src = vid.posterUrl;
    if (posterStatus) posterStatus.innerText = 'صورة الغلاف الحالية';
    if (quoteInput) quoteInput.value = vid.quote || '';
    if (captionInput) captionInput.value = vid.caption || '';
    if (hoursInput && vid.stats) hoursInput.value = vid.stats.hours || '+500';
    if (materialInput && vid.stats) materialInput.value = vid.stats.material || '100%';
    if (knotsInput && vid.stats) knotsInput.value = vid.stats.knots || '120K';
    if (activeInput) activeInput.checked = Boolean(vid.isActive);

    // تجهيز معاينة الفيديو الحالي
    if (vid.videoUrl) {
        if (previewBox) previewBox.classList.remove('hidden');
        if (noPreviewBox) noPreviewBox.classList.add('hidden');
        if (btnText) btnText.innerText = 'استبدال المقطع من الجهاز';

        if (vid.videoUrl.startsWith('idb://video_')) {
            getVideoFromIndexedDB(vid.videoUrl).then(blobUrl => {
                if (blobUrl && previewPlayer) {
                    previewPlayer.src = blobUrl;
                    previewPlayer.load();
                }
            }).catch(() => {});
            if (videoInfo) videoInfo.innerText = '📹 مقطع محفوظ من جهاز الإدارة';
        } else {
            if (previewPlayer) {
                previewPlayer.src = vid.videoUrl;
                previewPlayer.load();
            }
            if (videoInfo) videoInfo.innerText = '☁️ مقطع فيديو سحابي معتمد';
        }
    }

    if (formTitle) formTitle.innerText = `تعديل فيديو: «${vid.title}»`;
    if (submitText) submitText.innerText = 'حفظ التعديل';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    scrollShowcaseToTop();
    if (titleInput) titleInput.focus();
}

export function cancelCinemaEdit() {
    clearCinemaVideoSelection();
    pendingCinemaPosterFile = null;
    pendingCinemaVideoIsVertical = null;

    const idInput = document.getElementById('cinema-edit-id');
    const titleInput = document.getElementById('cinema-input-title');
    const subtitleInput = document.getElementById('cinema-input-subtitle');
    const videoUrlInput = document.getElementById('cinema-input-videourl');
    const posterUrlInput = document.getElementById('cinema-input-posterurl');
    const posterImg = document.getElementById('cinema-poster-preview');
    const posterStatus = document.getElementById('cinema-poster-status');
    const quoteInput = document.getElementById('cinema-input-quote');
    const captionInput = document.getElementById('cinema-input-caption');
    const hoursInput = document.getElementById('cinema-input-hours');
    const materialInput = document.getElementById('cinema-input-material');
    const knotsInput = document.getElementById('cinema-input-knots');
    const activeInput = document.getElementById('cinema-input-active');
    const formTitle = document.getElementById('cinema-form-title');
    const submitText = document.getElementById('cinema-submit-text');
    const cancelBtn = document.getElementById('cinema-cancel-edit-btn');

    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (subtitleInput) subtitleInput.value = '✨ أصالة المشغل اليدوي';
    if (videoUrlInput) videoUrlInput.value = '';
    if (posterUrlInput) posterUrlInput.value = '../images/craft_video_poster.jpg';
    if (posterImg) posterImg.src = '../images/craft_video_poster.jpg';
    if (posterStatus) posterStatus.innerText = 'صورة الغلاف الافتراضية';
    if (quoteInput) quoteInput.value = '';
    if (captionInput) captionInput.value = '';
    if (hoursInput) hoursInput.value = '+500';
    if (materialInput) materialInput.value = '100%';
    if (knotsInput) knotsInput.value = '120K';
    if (activeInput) activeInput.checked = false;

    if (formTitle) formTitle.innerText = 'إضافة فيديو جديد لمشغل الحرفة:';
    if (submitText) submitText.innerText = 'إضافة الفيديو للمشغل';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

export function deleteCinemaVideo(id) {
    const list = showcaseState.cinemaVideos || [];
    if (list.length <= 1) {
        showToast('يجب الاحتفاظ بفيديو واحد على الأقل في سينما المشغل.', 'warning', 'لا يمكن الحذف');
        return;
    }

    const vid = list.find(v => v.id === id);
    const title = vid ? vid.title : 'الفيديو';
    if (!confirm(`هل أنت متأكد من حذف فيديو «${title}» من سينما الحرفة؟`)) return;

    let updated = list.filter(v => v.id !== id);
    // إذا كان المحذوف هو النشط، نفعّل أول فيديو في القائمة
    if (vid && vid.isActive && updated.length > 0) {
        updated[0].isActive = true;
    }

    syncShowcaseState({ ...showcaseState, cinemaVideos: updated }, `تم حذف فيديو «${title}»`);
}

// ------------------------------------------
// 3. إدارة خطوات ومراحل الحرفة (Journey Steps)
// ------------------------------------------
function renderJourneyTab() {
    const listEl = document.getElementById('journey-steps-list');
    if (!listEl) return;
    const steps = showcaseState.journeySteps || [];

    if (steps.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-center text-[11px] sm:text-xs text-stone-500 bg-stone-50 rounded-xl col-span-2">لا توجد خطوات حالياً. أضف الخطوة الأولى أعلاه.</div>';
        return;
    }

    listEl.innerHTML = steps.map(step => `
        <div class="flex flex-col bg-white border border-stone-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition">
            <div class="relative w-full aspect-16/9 bg-stone-100 overflow-hidden">
                <img src="${step.imgUrl || '../images/step1_sketch.jpg'}" alt="${step.title}" class="w-full h-full object-cover">
                <span class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/70 text-amber-300 text-[10px] font-number font-black rounded-md backdrop-blur-md">
                    خطوة ${step.stepNum || '01'}
                </span>
            </div>
            <div class="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
                <div>
                    <h4 class="font-bold text-stone-900 text-xs sm:text-sm mb-0.5 sm:mb-1">${step.title}</h4>
                    <p class="text-[10.5px] sm:text-[11px] text-stone-600 line-clamp-2 leading-relaxed">${step.desc}</p>
                </div>
                <div class="pt-1.5 sm:pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span class="text-[9.5px] sm:text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded truncate max-w-[140px]">${step.tag || ''}</span>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="startJourneyEdit('${step.id}')" class="px-2 py-0.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition cursor-pointer" title="تعديل">
                            ✏️
                        </button>
                        <button type="button" onclick="deleteJourneyStep('${step.id}')" class="px-2 py-0.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition cursor-pointer" title="حذف">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

export function handleJourneyImgSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    pendingJourneyImgFile = file;
    const previewImg = document.getElementById('journey-img-preview');
    const statusText = document.getElementById('journey-img-status');

    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (statusText) {
        const sizeKB = Math.round(file.size / 1024);
        statusText.innerText = `🖼️ ${file.name} (${sizeKB} KB)`;
    }
    showToast('تم تحديد صورة المرحلة بنجاح.', 'success', 'صورة الخطوة');
}

export async function handleJourneyFormSubmit(e) {
    e.preventDefault();
    const idInput = document.getElementById('journey-edit-id');
    const numInput = document.getElementById('journey-input-num');
    const titleInput = document.getElementById('journey-input-title');
    const descInput = document.getElementById('journey-input-desc');
    const tagInput = document.getElementById('journey-input-tag');
    const imgInput = document.getElementById('journey-input-img');

    const stepNum = (numInput.value || '01').trim();
    const title = (titleInput.value || '').trim();
    const desc = (descInput.value || '').trim();
    const tag = (tagInput.value || '').trim();
    let imgUrl = (imgInput ? imgInput.value : '../images/step1_sketch.jpg').trim();

    if (!title || !desc) {
        showToast('يرجى إدخال عنوان الخطوة والشرح.', 'warning', 'حقل مطلوب');
        return;
    }

    const submitBtn = document.getElementById('journey-submit-btn');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span><span>جاري حفظ الخطوة...</span>';
    }

    try {
        if (pendingJourneyImgFile) {
            showToast('جاري معالجة صورة الخطوة من جهازك...', 'info', 'صورة الخطوة');
            const savedImg = await uploadShowcaseImage(pendingJourneyImgFile, 'journey_steps');
            if (savedImg) imgUrl = savedImg;
        }

        const editId = idInput ? idInput.value : '';
        let updatedSteps = [...(showcaseState.journeySteps || [])];

        if (editId) {
            updatedSteps = updatedSteps.map(s => {
                if (s.id === editId) {
                    return { ...s, stepNum, title, desc, tag, imgUrl };
                }
                return s;
            });
            await syncShowcaseState({ ...showcaseState, journeySteps: updatedSteps }, `تم تعديل الخطوة «${title}»`);
        } else {
            const newStep = {
                id: 'step-' + Date.now(),
                stepNum,
                title,
                desc,
                tag,
                imgUrl
            };
            updatedSteps.push(newStep);
            await syncShowcaseState({ ...showcaseState, journeySteps: updatedSteps }, `تمت إضافة الخطوة «${title}» لمسار الحرفة`);
        }

        cancelJourneyEdit();
    } catch (err) {
        console.error("Error saving journey step:", err);
        showToast('حدث خطأ أثناء حفظ الخطوة.', 'error', 'خطأ');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHtml;
        }
    }
}

export function startJourneyEdit(id) {
    const step = (showcaseState.journeySteps || []).find(s => s.id === id);
    if (!step) return;

    pendingJourneyImgFile = null;

    const idInput = document.getElementById('journey-edit-id');
    const numInput = document.getElementById('journey-input-num');
    const titleInput = document.getElementById('journey-input-title');
    const descInput = document.getElementById('journey-input-desc');
    const tagInput = document.getElementById('journey-input-tag');
    const imgInput = document.getElementById('journey-input-img');
    const imgPreview = document.getElementById('journey-img-preview');
    const imgStatus = document.getElementById('journey-img-status');
    const formTitle = document.getElementById('journey-form-title');
    const submitText = document.getElementById('journey-submit-text');
    const cancelBtn = document.getElementById('journey-cancel-edit-btn');

    if (idInput) idInput.value = step.id;
    if (numInput) numInput.value = step.stepNum || '01';
    if (titleInput) titleInput.value = step.title || '';
    if (descInput) descInput.value = step.desc || '';
    if (tagInput) tagInput.value = step.tag || '';
    if (imgInput) imgInput.value = step.imgUrl || '';
    if (imgPreview && step.imgUrl) imgPreview.src = step.imgUrl;
    if (imgStatus) imgStatus.innerText = 'صورة الخطوة الحالية';

    if (formTitle) formTitle.innerText = `تعديل الخطوة: «${step.title}»`;
    if (submitText) submitText.innerText = 'حفظ التعديل';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    scrollShowcaseToTop();
    if (titleInput) titleInput.focus();
}

export function cancelJourneyEdit() {
    pendingJourneyImgFile = null;
    const fileInput = document.getElementById('journey-file-img');
    if (fileInput) fileInput.value = '';

    const idInput = document.getElementById('journey-edit-id');
    const numInput = document.getElementById('journey-input-num');
    const titleInput = document.getElementById('journey-input-title');
    const descInput = document.getElementById('journey-input-desc');
    const tagInput = document.getElementById('journey-input-tag');
    const imgInput = document.getElementById('journey-input-img');
    const imgPreview = document.getElementById('journey-img-preview');
    const imgStatus = document.getElementById('journey-img-status');
    const formTitle = document.getElementById('journey-form-title');
    const submitText = document.getElementById('journey-submit-text');
    const cancelBtn = document.getElementById('journey-cancel-edit-btn');

    if (idInput) idInput.value = '';
    if (numInput) numInput.value = String((showcaseState.journeySteps || []).length + 1).padStart(2, '0');
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (tagInput) tagInput.value = '';
    if (imgInput) imgInput.value = '../images/step1_sketch.jpg';
    if (imgPreview) imgPreview.src = '../images/step1_sketch.jpg';
    if (imgStatus) imgStatus.innerText = 'صورة الخطوة الافتراضية';

    if (formTitle) formTitle.innerText = 'إضافة / تعديل خطوة في مسار الإنتاج:';
    if (submitText) submitText.innerText = 'إضافة الخطوة للمسار';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

export function deleteJourneyStep(id) {
    const step = (showcaseState.journeySteps || []).find(s => s.id === id);
    const title = step ? step.title : 'الخطوة';
    if (!confirm(`هل أنت متأكد من حذف «${title}» من مسار الإنتاج؟`)) return;

    const updated = (showcaseState.journeySteps || []).filter(s => s.id !== id);
    syncShowcaseState({ ...showcaseState, journeySteps: updated }, `تم حذف «${title}» بنجاح`);
}

// ------------------------------------------
// 4. إدارة توثيق القطع وآراء العملاء (Lookbook)
// ------------------------------------------
function renderLookbookTab() {
    const listEl = document.getElementById('lookbook-items-list');
    if (!listEl) return;
    const items = showcaseState.lookbookItems || [];

    if (items.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-center text-[11px] sm:text-xs text-stone-500 bg-stone-50 rounded-xl col-span-2">لا توجد توثيقات حالياً. أضف توثيق تسليم القطعة الأولى أعلاه.</div>';
        return;
    }

    listEl.innerHTML = items.map(item => `
        <div class="flex flex-col bg-white border border-stone-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition">
            <div class="relative w-full aspect-16/9 bg-stone-100 overflow-hidden">
                <img src="${item.imgUrl || '../images/client_room1.jpg'}" alt="${item.carpetTitle}" class="w-full h-full object-cover">
                <span class="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/70 text-white text-[9.5px] font-bold rounded-full backdrop-blur-md">
                    ${item.location || 'مسقط'}
                </span>
                <span class="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-amber-950/80 text-amber-200 text-[9.5px] font-bold rounded-full backdrop-blur-md truncate max-w-[130px]">
                    ${item.carpetTitle || 'سجادة ملكية'}
                </span>
            </div>
            <div class="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-stone-900 text-xs sm:text-sm">${item.clientName}</span>
                        <div class="text-amber-500 text-[11px] sm:text-xs">
                            ${'★'.repeat(Number(item.rating) || 5)}
                        </div>
                    </div>
                    <p class="text-[10.5px] sm:text-[11px] text-stone-600 italic line-clamp-2 sm:line-clamp-3 leading-relaxed">"${item.reviewText}"</p>
                </div>
                <div class="pt-1.5 sm:pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span class="text-[9.5px] sm:text-[10px] font-medium text-stone-500 truncate max-w-[120px]">${item.orderType || 'طلب تفصيل خاص'}</span>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="startLookbookEdit('${item.id}')" class="px-2 py-0.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition cursor-pointer" title="تعديل">
                            ✏️
                        </button>
                        <button type="button" onclick="deleteLookbookItem('${item.id}')" class="px-2 py-0.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded transition cursor-pointer" title="حذف">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

export function handleLookbookImgSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    pendingLookbookImgFile = file;
    const previewImg = document.getElementById('lookbook-img-preview');
    const statusText = document.getElementById('lookbook-img-status');

    if (previewImg) previewImg.src = URL.createObjectURL(file);
    if (statusText) {
        const sizeKB = Math.round(file.size / 1024);
        statusText.innerText = `📸 ${file.name} (${sizeKB} KB)`;
    }
    showToast('تم تحديد صورة توثيق العميل بنجاح.', 'success', 'صورة التسليم');
}

export async function handleLookbookFormSubmit(e) {
    e.preventDefault();
    const idInput = document.getElementById('lookbook-edit-id');
    const clientInput = document.getElementById('lookbook-input-client');
    const locationInput = document.getElementById('lookbook-input-location');
    const carpetInput = document.getElementById('lookbook-input-carpet');
    const orderTypeInput = document.getElementById('lookbook-input-ordertype');
    const ratingInput = document.getElementById('lookbook-input-rating');
    const reviewInput = document.getElementById('lookbook-input-review');
    const imgInput = document.getElementById('lookbook-input-img');

    const clientName = (clientInput.value || '').trim();
    const location = (locationInput.value || '').trim();
    const carpetTitle = (carpetInput.value || '').trim();
    const orderType = (orderTypeInput.value || 'طلب تفصيل خاص').trim();
    const rating = Number(ratingInput ? ratingInput.value : 5) || 5;
    const reviewText = (reviewInput.value || '').trim();
    let imgUrl = (imgInput ? imgInput.value : '../images/client_room1.jpg').trim();

    if (!clientName || !reviewText) {
        showToast('يرجى إدخال اسم العميل والتعليق.', 'warning', 'حقل مطلوب');
        return;
    }

    const submitBtn = document.getElementById('lookbook-submit-btn');
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span><span>جاري حفظ التوثيق...</span>';
    }

    try {
        if (pendingLookbookImgFile) {
            showToast('جاري معالجة صورة التسليم من جهازك...', 'info', 'صورة التوثيق');
            const savedImg = await uploadShowcaseImage(pendingLookbookImgFile, 'lookbook_clients');
            if (savedImg) imgUrl = savedImg;
        }

        const editId = idInput ? idInput.value : '';
        let updatedLookbook = [...(showcaseState.lookbookItems || [])];

        if (editId) {
            updatedLookbook = updatedLookbook.map(it => {
                if (it.id === editId) {
                    return { ...it, clientName, location, carpetTitle, orderType, rating, reviewText, imgUrl };
                }
                return it;
            });
            await syncShowcaseState({ ...showcaseState, lookbookItems: updatedLookbook }, `تم تعديل توثيق تسليم العميل «${clientName}»`);
        } else {
            const newItem = {
                id: 'look-' + Date.now(),
                clientName,
                location,
                carpetTitle,
                orderType,
                rating,
                reviewText,
                imgUrl
            };
            updatedLookbook.push(newItem);
            await syncShowcaseState({ ...showcaseState, lookbookItems: updatedLookbook }, `تم توثيق تسليم القطعة للعميل «${clientName}»`);
        }

        cancelLookbookEdit();
    } catch (err) {
        console.error("Error saving lookbook item:", err);
        showToast('حدث خطأ أثناء حفظ التوثيق.', 'error', 'خطأ');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnHtml;
        }
    }
}

export function startLookbookEdit(id) {
    const item = (showcaseState.lookbookItems || []).find(it => it.id === id);
    if (!item) return;

    pendingLookbookImgFile = null;

    const idInput = document.getElementById('lookbook-edit-id');
    const clientInput = document.getElementById('lookbook-input-client');
    const locationInput = document.getElementById('lookbook-input-location');
    const carpetInput = document.getElementById('lookbook-input-carpet');
    const orderTypeInput = document.getElementById('lookbook-input-ordertype');
    const ratingInput = document.getElementById('lookbook-input-rating');
    const reviewInput = document.getElementById('lookbook-input-review');
    const imgInput = document.getElementById('lookbook-input-img');
    const imgPreview = document.getElementById('lookbook-img-preview');
    const imgStatus = document.getElementById('lookbook-img-status');
    const formTitle = document.getElementById('lookbook-form-title');
    const submitText = document.getElementById('lookbook-submit-text');
    const cancelBtn = document.getElementById('lookbook-cancel-edit-btn');

    if (idInput) idInput.value = item.id;
    if (clientInput) clientInput.value = item.clientName || '';
    if (locationInput) locationInput.value = item.location || '';
    if (carpetInput) carpetInput.value = item.carpetTitle || '';
    if (orderTypeInput) orderTypeInput.value = item.orderType || '';
    if (ratingInput) ratingInput.value = String(item.rating || 5);
    if (reviewInput) reviewInput.value = item.reviewText || '';
    if (imgInput) imgInput.value = item.imgUrl || '';
    if (imgPreview && item.imgUrl) imgPreview.src = item.imgUrl;
    if (imgStatus) imgStatus.innerText = 'صورة التسليم الحالية';

    if (formTitle) formTitle.innerText = `تعديل توثيق: «${item.clientName}»`;
    if (submitText) submitText.innerText = 'حفظ التعديل';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    scrollShowcaseToTop();
    if (clientInput) clientInput.focus();
}

export function cancelLookbookEdit() {
    pendingLookbookImgFile = null;
    const fileInput = document.getElementById('lookbook-file-img');
    if (fileInput) fileInput.value = '';

    const idInput = document.getElementById('lookbook-edit-id');
    const clientInput = document.getElementById('lookbook-input-client');
    const locationInput = document.getElementById('lookbook-input-location');
    const carpetInput = document.getElementById('lookbook-input-carpet');
    const orderTypeInput = document.getElementById('lookbook-input-ordertype');
    const ratingInput = document.getElementById('lookbook-input-rating');
    const reviewInput = document.getElementById('lookbook-input-review');
    const imgInput = document.getElementById('lookbook-input-img');
    const imgPreview = document.getElementById('lookbook-img-preview');
    const imgStatus = document.getElementById('lookbook-img-status');
    const formTitle = document.getElementById('lookbook-form-title');
    const submitText = document.getElementById('lookbook-submit-text');
    const cancelBtn = document.getElementById('lookbook-cancel-edit-btn');

    if (idInput) idInput.value = '';
    if (clientInput) clientInput.value = '';
    if (locationInput) locationInput.value = '';
    if (carpetInput) carpetInput.value = '';
    if (orderTypeInput) orderTypeInput.value = 'طلب تفصيل خاص';
    if (ratingInput) ratingInput.value = '5';
    if (reviewInput) reviewInput.value = '';
    if (imgInput) imgInput.value = '../images/client_room1.jpg';
    if (imgPreview) imgPreview.src = '../images/client_room1.jpg';
    if (imgStatus) imgStatus.innerText = 'صورة توثيق تسليم القطعة الافتراضية';

    if (formTitle) formTitle.innerText = 'توثيق قطعة جديدة تخرج من المتجر (مع الرأي والتقييم):';
    if (submitText) submitText.innerText = 'توثيق وحفظ القطعة';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

export function deleteLookbookItem(id) {
    const item = (showcaseState.lookbookItems || []).find(it => it.id === id);
    const name = item ? item.clientName : 'التوثيق';
    if (!confirm(`هل أنت متأكد من حذف توثيق العميل «${name}»؟`)) return;

    const updated = (showcaseState.lookbookItems || []).filter(it => it.id !== id);
    syncShowcaseState({ ...showcaseState, lookbookItems: updated }, `تم حذف توثيق العميل «${name}»`);
}

// ------------------------------------------
// معالج رفع وضغط صور البنرات تلقائياً
// ------------------------------------------
export async function handleShowcaseFileUpload(event, targetInputId, targetPreviewImgId) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    showToast('جاري ضغط ومعالجة الصورة المرفوعة...', 'info', 'رفع وسائط');
    try {
        const compressed = await compressImage(file, 1400, 1400, 0.82);
        const base64Data = await fileToBase64(compressed);
        
        const inputEl = document.getElementById(targetInputId);
        if (inputEl) inputEl.value = base64Data;

        const previewEl = document.getElementById(targetPreviewImgId);
        if (previewEl) previewEl.src = base64Data;

        showToast('تم إعداد الصورة بجودة عالية وحجم مخفف بنجاح.', 'success', 'اكتمل الرفع');
    } catch (err) {
        console.error("Showcase file upload error:", err);
        showToast('حدث خطأ أثناء معالجة الصورة المرفوعة.', 'error', 'خطأ');
    }
}

// تهيئة أولية عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAdminActivityListeners();
    initImageUploadPreview();
    initEditImageManager();
    initVideoUploadHandlers();
    initShowcaseCMS();
    initStudioEvents();

    // مراقبة حالة جلسة Firebase Auth
    subscribeToAdminAuth((user) => {
        updatePortalAuthUI(user);
        // التوجيه الفوري حسب Hash في الرابط إذا كانت الجلسة نشطة
        setTimeout(() => {
            const h = window.location.hash;
            if (h === '#studio') {
                switchPortalScreen('studio');
            } else if (h === '#banners') {
                switchPortalScreen('banners');
            }
        }, 100);
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

// ربط دوال إدارة البنرات والأقسام الترويجية بالـ window
window.openShowcaseManagerModal = openShowcaseManagerModal;
window.closeShowcaseManagerModal = closeShowcaseManagerModal;
window.switchShowcaseTab = switchShowcaseTab;
window.handleShowcaseFileUpload = handleShowcaseFileUpload;

window.handleCinemaVideoSelect = handleCinemaVideoSelect;
window.clearCinemaVideoSelection = clearCinemaVideoSelection;
window.handleCinemaPosterSelect = handleCinemaPosterSelect;
window.handleJourneyImgSelect = handleJourneyImgSelect;
window.handleLookbookImgSelect = handleLookbookImgSelect;

window.handleMarqueeFormSubmit = handleMarqueeFormSubmit;
window.startMarqueeEdit = startMarqueeEdit;
window.cancelMarqueeEdit = cancelMarqueeEdit;
window.deleteMarqueeItem = deleteMarqueeItem;

window.handleCinemaFormSubmit = handleCinemaFormSubmit;
window.startCinemaEdit = startCinemaEdit;
window.cancelCinemaEdit = cancelCinemaEdit;
window.deleteCinemaVideo = deleteCinemaVideo;
window.setActiveCinemaVideo = setActiveCinemaVideo;

window.handleJourneyFormSubmit = handleJourneyFormSubmit;
window.startJourneyEdit = startJourneyEdit;
window.cancelJourneyEdit = cancelJourneyEdit;
window.deleteJourneyStep = deleteJourneyStep;

window.handleLookbookFormSubmit = handleLookbookFormSubmit;
window.startLookbookEdit = startLookbookEdit;
window.cancelLookbookEdit = cancelLookbookEdit;
window.deleteLookbookItem = deleteLookbookItem;

// ==============================================
// التبديل بين شاشات البوابة المستقلة (Dedicated Screen Router)
// ==============================================
export function switchPortalScreen(screenName, carpetId = '', customCarpets = null) {
    const carpetsView = document.getElementById('portal-view-carpets');
    const studioView = document.getElementById('portal-view-studio');
    const bannersView = document.getElementById('portal-view-banners');

    // إيقاف تشغيل الفيديو عند مغادرة الاستوديو أو البنرات
    if (screenName !== 'studio') {
        const videoEl = document.getElementById('studio-live-video');
        if (videoEl) {
            try { videoEl.pause(); } catch(e) {}
        }
    }
    if (screenName !== 'banners') {
        if (typeof cancelMarqueeEdit === 'function') cancelMarqueeEdit();
        if (typeof cancelCinemaEdit === 'function') cancelCinemaEdit();
        if (typeof cancelJourneyEdit === 'function') cancelJourneyEdit();
        if (typeof cancelLookbookEdit === 'function') cancelLookbookEdit();
    }

    if (!carpetsView || !studioView || !bannersView) {
        // Fallback for legacy modal IDs if elements don't exist yet
        if (screenName === 'studio') {
            if (typeof window.initStudioScreen === 'function') {
                window.initStudioScreen(carpetId, customCarpets || allPortalCarpets);
            }
            const modal = document.getElementById('tatriza-studio-modal');
            if (modal) modal.classList.remove('hidden');
        } else if (screenName === 'banners') {
            const modal = document.getElementById('showcase-manager-modal');
            if (modal) modal.classList.remove('hidden');
        }
        return;
    }

    if (screenName === 'studio') {
        carpetsView.classList.add('hidden');
        bannersView.classList.add('hidden');
        studioView.classList.remove('hidden');
        if (window.location.hash !== '#studio') {
            window.location.hash = '#studio';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (typeof window.initStudioScreen === 'function') {
            window.initStudioScreen(carpetId, customCarpets || allPortalCarpets);
        }
    } else if (screenName === 'banners') {
        carpetsView.classList.add('hidden');
        studioView.classList.add('hidden');
        bannersView.classList.remove('hidden');
        if (window.location.hash !== '#banners') {
            window.location.hash = '#banners';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (!showcaseState) showcaseState = getLocalShowcaseSettings();
        renderShowcaseUI();
        switchShowcaseTab(currentShowcaseTab || 'marquee');
    } else {
        // Default: 'carpets'
        studioView.classList.add('hidden');
        bannersView.classList.add('hidden');
        carpetsView.classList.remove('hidden');
        if (window.location.hash === '#studio' || window.location.hash === '#banners') {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
window.switchPortalScreen = switchPortalScreen;

// استوديو تصاميم السوشيال ميديا وحالات الواتساب الاحترافي
window.allPortalCarpets = allPortalCarpets;
window.openTatrizaStudioModal = (carpetId) => switchPortalScreen('studio', carpetId, allPortalCarpets);
window.closeTatrizaStudioModal = () => switchPortalScreen('carpets');

// توجيه المتصفح والأزرار السريعة
window.addEventListener('hashchange', () => {
    const h = window.location.hash;
    if (h === '#studio') {
        switchPortalScreen('studio');
    } else if (h === '#banners') {
        switchPortalScreen('banners');
    } else {
        switchPortalScreen('carpets');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const studioView = document.getElementById('portal-view-studio');
        const bannersView = document.getElementById('portal-view-banners');
        if (studioView && !studioView.classList.contains('hidden')) {
            switchPortalScreen('carpets');
        } else if (bannersView && !bannersView.classList.contains('hidden')) {
            switchPortalScreen('carpets');
        }
    }
});

