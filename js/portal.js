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

import { showToast } from './modals.js';

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
// إدارة جلسة الأدمن وتحديث الواجهة
// ==========================================
function updatePortalAuthUI(user) {
    currentPortalUser = user;
    const loginGate = document.getElementById('portal-login-gate');
    const dashboard = document.getElementById('portal-dashboard');
    const userEmailEl = document.getElementById('portal-user-email');

    if (user && user.uid) {
        if (loginGate) loginGate.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
        if (userEmailEl) userEmailEl.innerText = user.email || 'مسؤول معتمد';
        
        // تحميل المعروضات والتصنيفات
        initPortalSubscriptions();
    } else {
        if (loginGate) loginGate.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
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
    try {
        await adminLogoutFromCloud();
    } catch (e) {
        console.warn("Portal logout error:", e);
    }
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

function renderPortalProductsTable() {
    const container = document.getElementById('portal-products-grid');
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
            <div class="col-span-full text-center py-16 px-4 bg-white/70 rounded-3xl border border-stone-200">
                <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto text-2xl mb-3">
                    🔍
                </div>
                <h4 class="font-display font-bold text-stone-800 text-base">لا توجد قطع مطابقة للبحث أو الفلتر</h4>
                <p class="text-xs text-stone-500 mt-1">جرّب مسح حقل البحث أو إضافة سجادة جديدة للمتجر.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(c => {
        const isOutOfStock = c.status === 'out_of_stock';
        const imgUrl = (c.images && c.images[0]) || c.image || 'https://placehold.co/400x300/7c1d3c/ffffff?text=Tatriza';
        const imagesCount = (c.images && c.images.length) || 1;
        const hasVideo = Boolean(c.video);

        return `
            <div class="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group" dir="rtl">
                <div class="relative w-full h-44 bg-stone-100 overflow-hidden">
                    <img src="${imgUrl}" alt="${c.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    
                    <!-- رمز القطعة -->
                    <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-stone-900/80 text-white backdrop-blur-md">
                        ${c.id || 'TATR'}
                    </span>

                    <!-- شارة حالة التوفر (تفاعلية) -->
                    <button type="button" onclick="window.portalToggleStock('${c.id}')" class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer ${isOutOfStock ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}" title="انقر للتبديل الفوري لحالة التوفر">
                        <span>${isOutOfStock ? '⏳ نفدت الكمية' : '✅ متوفرة'}</span>
                    </button>

                    <!-- إشارات الوسائط -->
                    <div class="absolute bottom-2 right-2 flex items-center gap-1">
                        ${imagesCount > 1 ? `<span class="px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-bold">📷 ${imagesCount}</span>` : ''}
                        ${hasVideo ? `<span class="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-bold">🎬 فيديو</span>` : ''}
                    </div>
                </div>

                <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                        <div class="flex items-center justify-between gap-1 text-[11px] text-stone-500 font-medium mb-1">
                            <span>${c.category || 'تراثي'}</span>
                            <span>${c.dimensions || '200 × 300 سم'}</span>
                        </div>
                        <h4 class="font-display font-bold text-stone-900 text-sm leading-tight line-clamp-1">${c.title}</h4>
                        <span class="font-mono text-base font-black text-brand block mt-1">${Number(c.price || 0).toLocaleString()} ر.ع</span>
                    </div>

                    <!-- أزرار الإجراءات -->
                    <div class="pt-2 border-t border-stone-100 flex items-center gap-2">
                        <button type="button" onclick="window.portalOpenEdit('${c.id}')" class="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer">
                            <span>✏️ تعديل</span>
                        </button>
                        <button type="button" onclick="window.portalDeleteCarpet('${c.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer" title="حذف القطعة نهائياً">
                            <span>🗑️ حذف</span>
                        </button>
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
    initImageUploadPreview();
    initEditImageManager();
    initVideoUploadHandlers();

    // مراقبة حالة جلسة Firebase Auth
    subscribeToAdminAuth((user) => {
        updatePortalAuthUI(user);
    });
});

// ربط النوافذ والمعالجات بالنطاق العام للوحة الإدارة
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
