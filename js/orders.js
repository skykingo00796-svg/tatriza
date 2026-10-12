// ==========================================
// محرك إدارة الطلبات والمبيعات والمهام (orders.js)
// دار التطريز TATRIZA - لوحة المسؤول المستقلة
// ==========================================

import { 
    subscribeToOrders, 
    confirmOrderPayment, 
    cancelAndPermanentlyDeleteOrder, 
    revertOrderToPending,
    updateOrderStage,
    updateOrderCustomerInfo,
    adminLoginWithCloud,
    adminLogoutFromCloud,
    initFirebaseServices
} from './firebase-admin.js';

import { 
    generateOrderAuthHash, 
    verifyOrderAuthHash, 
    generateRoyalOrderSealSVG, 
    generateOrderQRCodeSVG, 
    getOrderVerificationUrl, 
    buildWhatsAppCertificateClientMessage 
} from './authenticity.js';

import { 
    ORDER_STAGES, 
    ORDER_STAGES_ARRAY, 
    getOrderStage, 
    buildWhatsAppStatusUpdateMessage, 
    buildWhatsAppOrderWelcomeMessage, 
    buildWhatsAppPaymentReceiptMessage, 
    getOrderTrackingUrl 
} from './tracking.js';

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ==========================================
// الحالة العامة لشاشة الطلبات (Global State)
// ==========================================
let allOrders = [];
let currentTab = 'pending'; // 'pending' | 'archive'
let currentSearch = '';
let currentDateFilter = 'all'; // 'all' | 'today' | 'week' | 'month'
let unsubscribeOrders = null;
let previousPendingCount = null;
let isLoggingOut = false;

// ==========================================
// التوثيق والحماية الفورية (Zero-Flicker Admin Auth)
// ==========================================
function checkLocalSession() {
    try {
        if (isLoggingOut) return false;

        const maxIdle = 60 * 60 * 1000;
        const now = Date.now();
        const lastAct = localStorage.getItem('tatr_admin_last_activity');
        const isExpired = lastAct ? (now - parseInt(lastAct, 10) > maxIdle) : false;

        const isLoggedIn = localStorage.getItem('tatr_admin_logged_in') === 'true';

        if (isLoggedIn && !isExpired) {
            document.documentElement.classList.add('admin-session-active');
            document.documentElement.classList.remove('admin-session-anonymous');
            localStorage.setItem('tatr_admin_last_activity', now.toString());
            return true;
        } else {
            localStorage.removeItem('tatr_admin_logged_in');
            localStorage.removeItem('tatr_admin_last_activity');
            localStorage.removeItem('tatr_admin_email');
            sessionStorage.removeItem('tatr_admin_session_start');
            document.documentElement.classList.add('admin-session-anonymous');
            document.documentElement.classList.remove('admin-session-active');
            return false;
        }
    } catch(e) {
        return false;
    }
}

// تهيئة مراقب المصادقة السحابي لـ Firebase
function initAuthListener() {
    const { app } = initFirebaseServices();
    if (!app) return;
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
        if (isLoggingOut) return;

        if (user) {
            document.documentElement.classList.add('admin-session-active');
            document.documentElement.classList.remove('admin-session-anonymous');
            localStorage.setItem('tatr_admin_logged_in', 'true');
            localStorage.setItem('tatr_admin_email', user.email || 'admin');
            localStorage.setItem('tatr_admin_last_activity', Date.now().toString());

            const userEmailEl = document.getElementById('admin-user-email');
            if (userEmailEl) userEmailEl.innerText = user.email || 'المسؤول المعتمد';

            const gate = document.getElementById('orders-login-gate');
            const dash = document.getElementById('orders-dashboard');
            if (gate) gate.style.setProperty('display', 'none', 'important');
            if (dash) dash.style.setProperty('display', 'flex', 'important');

            startOrdersRealtimeListener();
        } else {
            // إذا لم يكن هناك مستخدم مسجل
            const hasLocal = checkLocalSession();
            if (!hasLocal) {
                document.documentElement.classList.add('admin-session-anonymous');
                document.documentElement.classList.remove('admin-session-active');
                const gate = document.getElementById('orders-login-gate');
                const dash = document.getElementById('orders-dashboard');
                if (dash) dash.style.setProperty('display', 'none', 'important');
                if (gate) gate.style.setProperty('display', 'flex', 'important');
                if (unsubscribeOrders) {
                    unsubscribeOrders();
                    unsubscribeOrders = null;
                }
            }
        }
    });
}

// نموذج تسجيل الدخول
window.handleOrdersLogin = async function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('orders-email-input');
    const pwdInput = document.getElementById('orders-password-input');
    const errEl = document.getElementById('orders-login-error');
    const btnText = document.getElementById('orders-login-btn-text');

    if (!emailInput || !pwdInput) return;
    const email = emailInput.value.trim();
    const password = pwdInput.value;

    if (errEl) {
        errEl.innerText = '';
        errEl.classList.add('hidden');
    }
    if (btnText) btnText.innerText = 'جاري التحقق والمصادقة...';

    try {
        await adminLoginWithCloud(email, password);
        isLoggingOut = false;
        document.documentElement.classList.add('admin-session-active');
        document.documentElement.classList.remove('admin-session-anonymous');
        localStorage.setItem('tatr_admin_logged_in', 'true');
        localStorage.setItem('tatr_admin_email', email);
        localStorage.setItem('tatr_admin_last_activity', Date.now().toString());

        const gate = document.getElementById('orders-login-gate');
        const dash = document.getElementById('orders-dashboard');
        if (gate) gate.style.setProperty('display', 'none', 'important');
        if (dash) dash.style.setProperty('display', 'flex', 'important');

        const userEmailEl = document.getElementById('admin-user-email');
        if (userEmailEl) userEmailEl.innerText = email;

        startOrdersRealtimeListener();
    } catch(err) {
        if (btnText) btnText.innerText = 'تسجيل الدخول إلى لوحة الطلبات';
        if (errEl) {
            errEl.innerText = 'فشل تسجيل الدخول: يرجى التحقق من البريد الإلكتروني وكلمة المرور الخاصة بدار التطريز.';
            errEl.classList.remove('hidden');
        }
    }
};

window.handleOrdersLogout = async function() {
    isLoggingOut = true;

    // 1. إيقاف الاستماع الحي للطلبات وتفريغ الذاكرة فوراً
    if (unsubscribeOrders) {
        try { unsubscribeOrders(); } catch(e) {}
        unsubscribeOrders = null;
    }
    allOrders = [];

    // 2. إزالة وحذف كافة مفاتيح جلسة المسؤول والمصادقة من المتصفح
    try {
        localStorage.removeItem('tatr_admin_logged_in');
        localStorage.removeItem('tatr_admin_last_activity');
        localStorage.removeItem('tatr_admin_email');
        sessionStorage.removeItem('tatr_admin_session_start');

        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('tatr_admin') || k.startsWith('firebase:authUser'))) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach(k => {
            try { localStorage.removeItem(k); } catch(e) {}
        });
        sessionStorage.clear();
    } catch(e) {}

    // 3. تبديل عناصر الواجهة فوراً وبشكل قاطع
    document.documentElement.classList.remove('admin-session-active');
    document.documentElement.classList.add('admin-session-anonymous');

    const gate = document.getElementById('orders-login-gate');
    const dash = document.getElementById('orders-dashboard');
    if (dash) dash.style.setProperty('display', 'none', 'important');
    if (gate) gate.style.setProperty('display', 'flex', 'important');

    const pwdInput = document.getElementById('orders-password-input');
    if (pwdInput) pwdInput.value = '';
    const errEl = document.getElementById('orders-login-error');
    if (errEl) {
        errEl.innerText = '';
        errEl.classList.add('hidden');
    }

    // 4. تسجيل الخروج السحابي من Firebase في الخلفية دون تعطيل الواجهة
    try {
        await adminLogoutFromCloud();
    } catch(e) {
        console.warn("Cloud logout warning:", e);
    } finally {
        setTimeout(() => {
            isLoggingOut = false;
        }, 500);
    }

    // 5. إشعار تأكيد خروج أنيق وسريع
    showOrderToast('تم تسجيل الخروج من لوحة إدارة الطلبات بنجاح 🚪', 'info');
};

// ==========================================
// الاستماع الحي وتحديث الطلبات (Real-time Sync)
// ==========================================
function startOrdersRealtimeListener() {
    if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
    }

    const liveBadge = document.getElementById('live-sync-indicator');
    if (liveBadge) liveBadge.classList.remove('opacity-40');

    unsubscribeOrders = subscribeToOrders((orders) => {
        allOrders = orders || [];
        updateKpiCounters();
        renderOrdersList();

        // فحص وصول طلبات جديدة وتشغيل التنبيه
        const pendingCount = allOrders.filter(o => o.status !== 'confirmed').length;
        if (previousPendingCount !== null && pendingCount > previousPendingCount) {
            playNewOrderNotification();
            showOrderToast(`وصل طلب شراء جديد! إجمالي المعلق: ${pendingCount}`, 'success');
        }
        previousPendingCount = pendingCount;
    }, (err) => {
        console.warn("Real-time orders sync error:", err);
        const liveBadge = document.getElementById('live-sync-indicator');
        if (liveBadge) liveBadge.classList.add('opacity-40');
    });
}

// تنبيه صوتي خفيف لطلب جديد
function playNewOrderNotification() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch(e) {}
}

let isRevenueHidden = true; // مشفر بنجوم افتراضياً لحماية الخصوصية
try {
    const savedPrivacy = localStorage.getItem('tatr_revenue_hidden');
    if (savedPrivacy !== null) {
        isRevenueHidden = savedPrivacy === 'true';
    }
} catch(e) {}

// ==========================================
// وضع الخصوصية وتشفير المبلغ المحصل (Privacy Mode)
// ==========================================
window.toggleRevenuePrivacy = function() {
    isRevenueHidden = !isRevenueHidden;
    try {
        localStorage.setItem('tatr_revenue_hidden', isRevenueHidden ? 'true' : 'false');
    } catch(e) {}
    updateRevenueDisplay();
};

function updateRevenueDisplay() {
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');
    const totalRevenue = confirmedOrders.reduce((sum, ord) => sum + (Number(ord.totalPrice) || 0), 0);
    const elRevenue = document.getElementById('stat-total-revenue');
    const toggleIcon = document.getElementById('toggle-revenue-icon');
    const toggleBtn = document.getElementById('toggle-revenue-btn');

    if (elRevenue) {
        if (isRevenueHidden) {
            elRevenue.innerHTML = '<span class="tracking-widest font-mono text-amber-950/70 font-bold select-none text-2xl">••••••</span>';
            if (toggleIcon) toggleIcon.innerText = '👁️';
            if (toggleBtn) toggleBtn.title = 'انقر لإظهار المبلغ المحصل';
        } else {
            elRevenue.innerText = totalRevenue.toLocaleString('ar-OM') + ' ر.ع.';
            if (toggleIcon) toggleIcon.innerText = '🙈';
            if (toggleBtn) toggleBtn.title = 'انقر لإخفاء وتشفير المبلغ (وضع الخصوصية)';
        }
    }

    // شريط الأرشيف إن كان مفتوحاً
    const archiveRevEl = document.getElementById('archive-filtered-revenue');
    if (archiveRevEl) {
        const list = getFilteredOrders();
        const archiveTotal = list.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
        if (isRevenueHidden) {
            archiveRevEl.innerHTML = '<span class="tracking-widest font-mono text-amber-300/60 font-bold select-none">••••••</span>';
        } else {
            archiveRevEl.innerText = archiveTotal.toLocaleString('ar-OM') + ' ر.ع.';
        }
    }
}

// ==========================================
// حساب وتحديث بطاقات المؤشرات (KPI Metrics)
// ==========================================
function updateKpiCounters() {
    const pendingOrders = allOrders.filter(o => o.status !== 'confirmed');
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');

    // إجمالي القطع المباعة في الطلبات المؤكدة
    let totalItems = 0;
    confirmedOrders.forEach(ord => {
        if (Array.isArray(ord.items) && ord.items.length > 0) {
            ord.items.forEach(it => {
                totalItems += (Number(it.quantity) || 1);
            });
        } else {
            totalItems += 1;
        }
    });

    // تحديث الأرقام في الواجهة
    const elPending = document.getElementById('stat-pending-orders');
    const elConfirmed = document.getElementById('stat-confirmed-orders');
    const elItems = document.getElementById('stat-items-sold');

    const badgePendingTab = document.getElementById('badge-tab-pending');
    const badgeArchiveTab = document.getElementById('badge-tab-archive');

    if (elPending) elPending.innerText = pendingOrders.length;
    if (elConfirmed) elConfirmed.innerText = confirmedOrders.length;
    if (elItems) elItems.innerText = totalItems;

    // تحديث المبلغ المحصل وفق وضع الخصوصية
    updateRevenueDisplay();

    if (badgePendingTab) {
        badgePendingTab.innerText = pendingOrders.length;
        badgePendingTab.className = pendingOrders.length > 0 
            ? 'px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white animate-pulse' 
            : 'px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-600';
    }
    if (badgeArchiveTab) {
        badgeArchiveTab.innerText = confirmedOrders.length;
    }

    if (currentTab === 'analytics') {
        renderAnalyticsDashboard();
    }
}

// ==========================================
// الفلترة والبحث
// ==========================================
function getFilteredOrders() {
    let list = allOrders.filter(ord => {
        if (currentTab === 'pending') {
            return ord.status !== 'confirmed';
        } else {
            return ord.status === 'confirmed';
        }
    });

    // فلترة التاريخ
    if (currentDateFilter !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (currentDateFilter === 'today') {
            list = list.filter(o => (o.createdAt || 0) >= startOfToday);
        } else if (currentDateFilter === 'week') {
            const startOfWeek = startOfToday - (7 * oneDayMs);
            list = list.filter(o => (o.createdAt || 0) >= startOfWeek);
        } else if (currentDateFilter === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            list = list.filter(o => (o.createdAt || 0) >= startOfMonth);
        }
    }

    // فلترة البحث
    if (currentSearch.trim()) {
        const q = currentSearch.trim().toLowerCase();
        list = list.filter(o => {
            const idMatch = (o.orderId || o.id || '').toLowerCase().includes(q);
            const nameMatch = (o.customerName || '').toLowerCase().includes(q);
            const phoneMatch = (o.customerPhone || '').toLowerCase().includes(q);
            const notesMatch = (o.customerNotes || '').toLowerCase().includes(q);
            const itemsMatch = Array.isArray(o.items) && o.items.some(it => 
                (it.title || '').toLowerCase().includes(q) || (it.id || '').toLowerCase().includes(q)
            );
            return idMatch || nameMatch || phoneMatch || notesMatch || itemsMatch;
        });
    }

    return list;
}

// ==========================================
// عرض ورسم بطاقات الطلبات (Render UI)
// ==========================================
function renderOrdersList() {
    const container = document.getElementById('orders-grid-container');
    const emptyState = document.getElementById('orders-empty-state');
    const archiveSummaryBar = document.getElementById('archive-summary-bar');
    const analyticsContainer = document.getElementById('analytics-dashboard-container');

    if (currentTab === 'analytics') {
        if (container) container.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (archiveSummaryBar) archiveSummaryBar.classList.add('hidden');
        if (analyticsContainer) {
            analyticsContainer.classList.remove('hidden');
            renderAnalyticsDashboard();
        }
        return;
    } else {
        if (analyticsContainer) analyticsContainer.classList.add('hidden');
        if (container) container.classList.remove('hidden');
    }

    if (!container) return;

    const list = getFilteredOrders();

    // التحكم في شريط ملخص الأرشيف
    if (archiveSummaryBar) {
        if (currentTab === 'archive' && list.length > 0) {
            archiveSummaryBar.classList.remove('hidden');
            const archiveTotal = list.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
            const archiveRevEl = document.getElementById('archive-filtered-revenue');
            const archiveCountEl = document.getElementById('archive-filtered-count');
            if (archiveRevEl) {
                if (isRevenueHidden) {
                    archiveRevEl.innerHTML = '<span class="tracking-widest font-mono text-amber-300/60 font-bold select-none">••••••</span>';
                } else {
                    archiveRevEl.innerText = archiveTotal.toLocaleString('ar-OM') + ' ر.ع.';
                }
            }
            if (archiveCountEl) archiveCountEl.innerText = list.length;
        } else {
            archiveSummaryBar.classList.add('hidden');
        }
    }

    if (list.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
            const emptyTitle = document.getElementById('empty-state-title');
            const emptySub = document.getElementById('empty-state-subtitle');
            if (currentTab === 'pending') {
                if (emptyTitle) emptyTitle.innerText = 'لا توجد طلبات معلقة حالياً';
                if (emptySub) emptySub.innerText = 'جميع الطلبات الواردة عبر الواتساب تم تأكيدها أو معالجتها بنجاح 🏛️✨';
            } else {
                if (emptyTitle) emptyTitle.innerText = 'الأرشيف فارغ حالياً';
                if (emptySub) emptySub.innerText = 'عند تأكيد أي طلب ودفع مبلغه سيظهر هنا في الأرشيف لحساب مبيعاتك وأرباحك.';
            }
        }
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    container.innerHTML = list.map(order => createOrderCardHtml(order)).join('');
}

// توليد بطاقة HTML لكل طلب
function createOrderCardHtml(order) {
    const isConfirmed = order.status === 'confirmed';
    const orderId = order.orderId || order.id;
    const items = Array.isArray(order.items) ? order.items : [];
    const totalPrice = Number(order.totalPrice) || 0;
    const orderDate = order.createdAtFormatted || formatTimestamp(order.createdAt);
    const storePhone = "96895939388";

    // وسم نوع الطلب
    let typeBadge = '';
    if (order.type === 'custom_order') {
        typeBadge = `<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-purple-100 text-purple-900 border border-purple-200">🎨 تفصيل خاص</span>`;
    } else if (order.type === 'product_inquiry') {
        typeBadge = `<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-sky-100 text-sky-900 border border-sky-200">🔍 استفسار قطعة</span>`;
    } else {
        typeBadge = `<span class="px-2.5 py-1 rounded-lg text-[10.5px] font-black bg-amber-100 text-amber-900 border border-amber-200">🛍️ سلة مقتنيات</span>`;
    }

    // بطاقة المنتجات داخل الطلب
    let itemsHtml = '';
    if (items.length > 0) {
        itemsHtml = items.map((item, idx) => {
            const imgEl = item.image ? 
                `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px; object-fit: cover;">` : 
                `<div class="rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center text-base shrink-0" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">🏛️</div>`;

            const itemPrice = Number(item.price) || 0;
            const origPrice = item.originalPrice !== undefined ? Number(item.originalPrice) : itemPrice;
            const hasItemDiscount = item.discountApplied || (origPrice > itemPrice && itemPrice > 0);

            let priceDisplayHtml = '';
            if (hasItemDiscount) {
                priceDisplayHtml = `
                    <div class="flex flex-col items-end shrink-0 text-left">
                        <span class="font-mono font-black text-xs sm:text-sm text-emerald-800">${itemPrice} ر.ع.</span>
                        <div class="flex items-center gap-1">
                            <span class="font-mono text-[10px] text-stone-400 line-through">${origPrice} ر.ع.</span>
                            <span class="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded">خصم ${Math.round((origPrice - itemPrice) * 100) / 100} ر.ع.</span>
                        </div>
                    </div>
                `;
            } else {
                priceDisplayHtml = `<span class="font-mono font-black text-xs sm:text-sm text-amber-950 shrink-0">${item.price ? `${item.price} ر.ع.` : 'بالاتفاق'}</span>`;
            }

            return `
                <div class="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/90 border border-stone-200/80 hover:bg-stone-100/80 transition">
                    ${imgEl}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <h4 class="font-bold text-xs sm:text-sm text-stone-900 truncate">${escapeHtml(item.title || 'قطعة فنية')}</h4>
                            ${priceDisplayHtml}
                        </div>
                        <div class="flex items-center gap-2 text-[10.5px] text-stone-500 font-medium mt-0.5">
                            ${item.id ? `<span class="font-mono text-[10px] bg-stone-200/70 px-1.5 py-0.2 rounded">${escapeHtml(item.id)}</span>` : ''}
                            ${item.dimensions ? `<span>📐 ${escapeHtml(item.dimensions)}</span>` : ''}
                            ${item.note ? `<span class="text-amber-800 font-bold">✨ ${escapeHtml(item.note)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        itemsHtml = `<p class="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl">لا توجد تفاصيل قطع إضافية مسجلة.</p>`;
    }

    // تجهيز رابط الواتساب لمحادثة العميل
    const waText = encodeURIComponent(`مرحباً بكم، بخصوص طلبكم لدى دار التطريز رقم: ${orderId}`);
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : storePhone;
    const waUrl = `https://wa.me/${clientPhone}?text=${waText}`;

    // أزرار الإجراءات
    let actionsHtml = '';
    if (!isConfirmed) {
        // الطلب معلق: زر التأكيد والدفع + زر الإلغاء والحذف
        actionsHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-stone-200">
                <!-- الزر الأول: تأكيد الطلب ودفع المبلغ -->
                <button type="button" onclick="confirmOrderAction('${orderId}')" class="btn-liquid-emerald text-white font-extrabold text-xs sm:text-sm h-11 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98" title="تأكيد الطلب وتحديد السعر المعتمد واستلام المبلغ ونقله إلى الأرشيف">
                    <span>✅</span>
                    <span>تم تأكيد الطلب ودفع المبلغ</span>
                </button>

                <!-- الزر الثاني: تم إلغاء الطلب -->
                <button type="button" onclick="cancelOrderAction('${orderId}')" class="bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-950 border border-rose-300 font-bold text-xs sm:text-sm h-11 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98" title="إلغاء الطلب وحذفه نهائياً من القائمة">
                    <span>❌</span>
                    <span>تم إلغاء الطلب</span>
                </button>

                <!-- الزر الثالث: رسالة ترحيب وتأكيد التفاصيل مع رابط التتبع -->
                <button type="button" onclick="sendWelcomeWhatsApp('${orderId}')" class="sm:col-span-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm h-10 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98" title="إرسال رسالة ترحيب وتأكيد تفاصيل الطلب مع رابط التتبع للعميل">
                    <span>💬</span>
                    <span>تأكيد التفاصيل مع العميل عبر الواتساب</span>
                </button>
            </div>
        `;
    } else {
        // الطلب في الأرشيف (مؤكد): إظهار تفاصيل الدفع وزر استعادة وزر طباعة والتتبع
        const confirmedDate = order.confirmedAt ? formatTimestamp(order.confirmedAt) : '';
        const currentStage = getOrderStage(order);
        actionsHtml = `
            <div class="flex flex-col gap-2.5 pt-3 border-t border-stone-200">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span>✅ تم استلام المبلغ وأرشفة الطلب</span>
                        ${confirmedDate ? `<span class="text-[11px] text-emerald-600 font-medium font-mono">(${confirmedDate})</span>` : ''}
                    </div>
                    <div class="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border bg-amber-50 border-amber-300/80 text-amber-950">
                        <span>${currentStage.icon}</span>
                        <span>المرحلة: ${currentStage.shortTitle}</span>
                    </div>
                </div>

                <div class="space-y-2">
                    <!-- الصف الأول: التتبع والتواصل (زرين عريضين) -->
                    <div class="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <button type="button" onclick="openOrderStageModal('${orderId}')" class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs h-9 sm:h-10 px-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="تحديث مرحلة الحياكة أو الشحن وإشعار العميل">
                            <span>🚚</span>
                            <span class="truncate">مرحلة التتبع</span>
                        </button>
                        <button type="button" onclick="sendStageWhatsApp('${orderId}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 sm:h-10 px-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="إرسال تحديث المرحلة الحالية للعميل عبر الواتساب بنقرة واحدة">
                            <span>💬</span>
                            <span class="truncate">واتساب التتبع</span>
                        </button>
                    </div>

                    <!-- الصف الثاني: الوثائق والشهادات (أربعة أزرار شبكية) -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                        <button type="button" onclick="printOrderReceipt('${orderId}')" class="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs h-9 px-2 rounded-xl border border-stone-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="طباعة فاتورة / ملخص الطلب">
                            <span>🖨️</span>
                            <span class="truncate">إيصال</span>
                        </button>
                        <button type="button" onclick="openOrderCertificate('${orderId}')" class="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs h-9 px-2 rounded-xl border border-amber-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="معاينة شهادة الأصالة الملكية الموثقة">
                            <span>⚜️</span>
                            <span class="truncate">الشهادة</span>
                        </button>
                        <button type="button" onclick="sendCertificateWhatsApp('${orderId}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs h-9 px-2 rounded-xl border border-emerald-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="إرسال رابط الشهادة الموثقة للعميل عبر الواتساب">
                            <span>📲</span>
                            <span class="truncate">واتساب الشهادة</span>
                        </button>
                        <button type="button" onclick="sendPaymentReceiptWhatsApp('${orderId}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs h-9 px-2 rounded-xl border border-emerald-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="إرسال تأكيد استلام الدفعة للعميل عبر الواتساب">
                            <span>💰</span>
                            <span class="truncate">إشعار الدفع</span>
                        </button>
                    </div>

                    <!-- الصف الثالث: إدارة الطلب (استرجاع وحذف) -->
                    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1 border-t border-stone-100">
                        <button type="button" onclick="revertOrderAction('${orderId}')" class="bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs h-8 sm:h-9 px-2 rounded-xl border border-stone-200 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="إعادة الطلب إلى قائمة الطلبات المعلقة">
                            <span>↩️</span>
                            <span class="truncate">استرجاع للمعلق</span>
                        </button>
                        <button type="button" onclick="cancelOrderAction('${orderId}')" class="bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs h-8 sm:h-9 px-2 rounded-xl border border-rose-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95" title="إلغاء الطلب وحذفه نهائياً">
                            <span>❌</span>
                            <span class="truncate">حذف نهائي</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    const cardCurrentStage = getOrderStage(order);

    return `
        <div id="order-card-${orderId}" class="order-card bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border ${isConfirmed ? 'border-emerald-300 shadow-sm' : 'border-stone-200/90 shadow-md hover:shadow-lg'} transition-all duration-300 space-y-4">
            
            <!-- رأس بطاقة الطلب -->
            <div class="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-200/80">
                <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-2xl ${isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'} flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        ${isConfirmed ? '✓' : '📦'}
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-mono font-black text-sm sm:text-base text-stone-900 tracking-wider">${orderId}</span>
                            ${typeBadge}
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1 cursor-pointer hover:bg-stone-200 transition" onclick="openOrderStageModal('${orderId}')" title="انقر لتعديل مرحلة الحياكة أو مسار التتبع">
                                <span>${cardCurrentStage.icon}</span>
                                <span>${cardCurrentStage.shortTitle}</span>
                            </span>
                        </div>
                        <span class="text-[11px] text-stone-500 font-medium block mt-0.5 font-mono">${orderDate}</span>
                    </div>
                </div>

                <!-- زر مباشر لفتح الواتساب مع العميل -->
                <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#25D366]/30 transition flex items-center gap-1.5 cursor-pointer shadow-2xs" title="فتح المحادثة بالواتساب لمطابقة الطلب">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                    <span>فتح بالواتساب</span>
                </a>
            </div>

            <!-- معلومات العميل والملاحظات -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/70">
                <div class="flex items-start justify-between gap-1.5">
                    <div class="min-w-0">
                        <span class="text-stone-400 font-bold block text-[10px]">العميل / مقدم الطلب:</span>
                        <span class="font-bold text-stone-900 block truncate">${escapeHtml(order.customerName || 'عميل المتجر')}</span>
                        ${order.customerPhone ? `<span class="text-[10.5px] text-stone-500 font-mono block mt-0.5" dir="ltr">📞 ${escapeHtml(order.customerPhone)}</span>` : ''}
                    </div>
                    <button type="button" onclick="editCustomerInfoPrompt('${orderId}')" class="text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg p-1.5 transition text-xs shrink-0 cursor-pointer shadow-2xs" title="تعديل اسم أو هاتف العميل">
                        ✏️
                    </button>
                </div>
                <div>
                    <span class="text-stone-400 font-bold block text-[10px]">الملاحظات والتفاصيل:</span>
                    <span class="text-stone-700 font-medium truncate block">${escapeHtml(order.customerNotes || 'لا توجد ملاحظات إضافية')}</span>
                </div>
            </div>

            <!-- قائمة القطع المطلوبة -->
            <div class="space-y-1.5">
                <span class="text-[11px] font-bold text-stone-500 block">تفاصيل القطع المطلوبة (${items.length}):</span>
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                    ${itemsHtml}
                </div>
            </div>

            <!-- الإجمالي الكلي للمبلغ -->
            <div class="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 shadow-2xs">
                <div>
                    <span class="text-xs font-bold text-stone-600 block">المبلغ الإجمالي المعتمد:</span>
                    ${(order.originalTotalPrice && Number(order.originalTotalPrice) > totalPrice) ? `
                        <span class="text-[10px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            🏷️ خصم خاص: ${Number(order.originalTotalPrice) - totalPrice} ر.ع.
                        </span>
                    ` : ''}
                </div>
                <div class="flex items-baseline gap-1.5">
                    ${(order.originalTotalPrice && Number(order.originalTotalPrice) > totalPrice) ? `
                        <span class="font-mono text-xs text-stone-400 line-through">(${order.originalTotalPrice} ر.ع.)</span>
                    ` : ''}
                    <span class="font-display font-black text-base sm:text-xl text-emerald-950 font-mono">
                        ${totalPrice > 0 ? `${totalPrice.toLocaleString('ar-OM')} ر.ع.` : 'حسب التسعيرة الخاصة'}
                    </span>
                </div>
            </div>

            <!-- أزرار الإجراءات التفاعلية -->
            ${actionsHtml}
        </div>
    `;
}

// ==========================================
// محرك النوافذ التفاعلية العصرية (Lux Modal Engine)
// بديل حديث وأنيق بدون أي نوافذ متصفح علوية أو لاج
// ==========================================
let modalResolveCallback = null;
let currentModalOrder = null;

function showOrderConfirmationModal(config) {
    const modal = document.getElementById('order-action-modal');
    const box = document.getElementById('order-modal-box');
    const iconContainer = document.getElementById('order-modal-icon-container');
    const iconEl = document.getElementById('order-modal-icon');
    const titleEl = document.getElementById('order-modal-title');
    const subtitleEl = document.getElementById('order-modal-subtitle');
    const descEl = document.getElementById('order-modal-desc');
    const inputContainer = document.getElementById('order-modal-input-container');
    const noteInput = document.getElementById('order-modal-note-input');
    const confirmBtn = document.getElementById('order-modal-confirm-btn');
    const btnIcon = document.getElementById('order-modal-btn-icon');
    const btnText = document.getElementById('order-modal-btn-text');
    const itemsSection = document.getElementById('order-modal-items-section');
    const itemsList = document.getElementById('order-modal-items-list');

    if (!modal || !box) {
        return Promise.resolve({ confirmed: false });
    }

    currentModalOrder = config.order || null;

    if (iconEl) iconEl.innerText = config.icon || '✨';
    if (titleEl) titleEl.innerText = config.title || 'تأكيد الإجراء';
    if (subtitleEl) subtitleEl.innerHTML = config.subtitle || '';
    if (descEl) descEl.innerText = config.desc || '';

    // إعداد التنسيقات والألوان الملكية حسب نوع الإجراء
    if (config.type === 'delete') {
        if (iconContainer) iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 bg-rose-50 text-rose-800 border border-rose-200';
        if (confirmBtn) confirmBtn.className = 'bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98';
        if (btnIcon) btnIcon.innerText = '❌';
        if (btnText) btnText.innerText = config.btnText || 'نعم، إلغاء وحذف';
        if (itemsSection) itemsSection.classList.add('hidden');
    } else if (config.type === 'revert') {
        if (iconContainer) iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 bg-amber-50 text-amber-900 border border-amber-200';
        if (confirmBtn) confirmBtn.className = 'bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98';
        if (btnIcon) btnIcon.innerText = '↩️';
        if (btnText) btnText.innerText = config.btnText || 'نعم، إعادة للانتظار';
        if (itemsSection) itemsSection.classList.add('hidden');
    } else if (config.type === 'edit_customer') {
        if (iconContainer) iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 bg-amber-50 text-amber-900 border border-amber-200';
        if (confirmBtn) confirmBtn.className = 'bg-brand hover:bg-brand-dark text-white font-extrabold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98';
        if (btnIcon) btnIcon.innerText = '💾';
        if (btnText) btnText.innerText = config.btnText || 'حفظ وتحديث بيانات العميل';
        if (itemsSection) itemsSection.classList.add('hidden');
    } else {
        // default / confirm
        if (iconContainer) iconContainer.className = 'w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200';
        if (confirmBtn) confirmBtn.className = 'btn-liquid-emerald text-white font-extrabold text-xs sm:text-sm h-11 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98';
        if (btnIcon) btnIcon.innerText = '✅';
        if (btnText) btnText.innerText = config.btnText || 'نعم، اعتماد السعر وتأكيد الدفع';

        // عرض قائمة وتعديل أسعار القطع
        if (config.order && itemsSection && itemsList) {
            itemsSection.classList.remove('hidden');
            const rawItems = Array.isArray(config.order.items) && config.order.items.length > 0
                ? config.order.items
                : [{
                    title: 'طلب مخصص / استفسار خاص',
                    price: Number(config.order.totalPrice) || 0,
                    dimensions: 'مواصفات خاصة'
                }];

            itemsList.innerHTML = rawItems.map((item, idx) => {
                const itemTitle = escapeHtml(item.title || 'قطعة فنية');
                const itemPrice = Number(item.price) || 0;
                const origPrice = item.originalPrice !== undefined ? Number(item.originalPrice) : itemPrice;
                const itemImg = item.image ? 
                    `<img src="${item.image}" alt="${itemTitle}" class="rounded-xl object-cover border border-stone-200 shrink-0" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px; object-fit: cover;">` : 
                    `<div class="rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-base shrink-0" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">🏛️</div>`;

                return `
                    <div class="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
                        <!-- السطر الأول: الصورة والعنوان وسعر المعرض -->
                        <div class="flex items-center gap-2.5 min-w-0">
                            ${itemImg}
                            <div class="flex-1 min-w-0">
                                <h5 class="font-bold text-xs sm:text-sm text-stone-900 truncate">${itemTitle}</h5>
                                <div class="flex items-center gap-2 text-[10.5px] text-stone-500 mt-0.5">
                                    ${item.dimensions ? `<span>📐 ${escapeHtml(item.dimensions)}</span>` : ''}
                                    <span class="text-stone-400">سعر المعرض: <strong class="text-stone-700 font-mono">${origPrice} ر.ع.</strong></span>
                                </div>
                            </div>
                        </div>

                        <!-- السطر الثاني: السعر المعتمد وخانة التخفيض المستقلة تماماً -->
                        <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-stone-100 text-xs">
                            <div class="flex items-center gap-1.5">
                                <label class="text-[11px] font-bold text-stone-600">السعر المعتمد:</label>
                                <div class="flex items-center bg-stone-50 border border-stone-300 rounded-lg px-2 py-0.5 focus-within:bg-white focus-within:border-emerald-600 transition">
                                    <input type="number" step="0.5" min="0" class="item-modal-price-input w-16 text-center font-bold text-xs text-emerald-950 bg-transparent outline-none font-mono" data-idx="${idx}" data-orig="${origPrice}" value="${itemPrice}">
                                    <span class="text-[10px] font-bold text-stone-500 mr-1 select-none">ر.ع.</span>
                                </div>
                            </div>
                            <span class="item-diff-tag text-[10px] font-bold px-2 py-0.5 rounded-md hidden" data-idx="${idx}"></span>
                        </div>
                    </div>
                `;
            }).join('');

            const updateModalLiveTotals = () => {
                const inputs = itemsList.querySelectorAll('.item-modal-price-input');
                let currentSum = 0;
                let origSum = 0;
                inputs.forEach(inp => {
                    const orig = parseFloat(inp.getAttribute('data-orig')) || 0;
                    const val = parseFloat(inp.value) || 0;
                    currentSum += val;
                    origSum += orig;

                    const diffTag = itemsList.querySelector(`.item-diff-tag[data-idx="${inp.getAttribute('data-idx')}"]`);
                    if (diffTag) {
                        const diff = Math.round((orig - val) * 100) / 100;
                        if (diff > 0) {
                            diffTag.innerText = `خصم ${diff} ر.ع.`;
                            diffTag.className = 'item-diff-tag text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block';
                        } else if (diff < 0) {
                            diffTag.innerText = `+${Math.abs(diff)} ر.ع.`;
                            diffTag.className = 'item-diff-tag text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 inline-block';
                        } else {
                            diffTag.className = 'item-diff-tag text-[10px] font-bold px-2 py-0.5 rounded-md hidden';
                        }
                    }
                });

                const origEl = document.getElementById('modal-orig-total-display');
                const calcEl = document.getElementById('modal-calc-total-display');
                const diffBadge = document.getElementById('modal-diff-badge');

                if (origEl) origEl.innerText = (Math.round(origSum * 100) / 100).toString();
                if (calcEl) calcEl.innerText = (Math.round(currentSum * 100) / 100).toString();
                if (diffBadge) {
                    const totalDiff = Math.round((origSum - currentSum) * 100) / 100;
                    if (totalDiff > 0) {
                        diffBadge.innerText = `خصم للعميل: ${totalDiff} ر.ع.`;
                        diffBadge.className = 'inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200';
                    } else if (totalDiff < 0) {
                        diffBadge.innerText = `زيادة: ${Math.abs(totalDiff)} ر.ع.`;
                        diffBadge.className = 'inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200';
                    } else {
                        diffBadge.innerText = 'سعر متطابق مع المعرض';
                        diffBadge.className = 'inline-block text-[10px] font-bold text-stone-500';
                    }
                }
            };

            itemsList.querySelectorAll('.item-modal-price-input').forEach(inp => {
                inp.addEventListener('input', updateModalLiveTotals);
            });

            updateModalLiveTotals();
        } else {
            if (itemsSection) itemsSection.classList.add('hidden');
        }
    }

    // إظهار حقول بيانات العميل والملاحظات إن طُلبت
    const custNameInput = document.getElementById('order-modal-customer-name-input');
    const custPhoneInput = document.getElementById('order-modal-customer-phone-input');
    const noteWrapper = document.getElementById('order-modal-note-wrapper');

    if (config.showInput) {
        if (inputContainer) inputContainer.classList.remove('hidden');

        if (noteWrapper) {
            if (config.type === 'edit_customer') {
                noteWrapper.classList.add('hidden');
            } else {
                noteWrapper.classList.remove('hidden');
            }
        }

        if (custNameInput && config.order) {
            const rawName = (config.order.customerName || '').trim();
            const isPlaceholder = rawName.includes('طلب عبر سلة') || rawName.includes('استفسار عبر تفاصيل');
            custNameInput.value = isPlaceholder ? '' : rawName;
            custNameInput.placeholder = isPlaceholder ? `${rawName} (اكتب اسم العميل الحقيقي هنا)` : 'مثال: الشيخ أحمد الكندي / د. سارة المعولي';
        }

        if (custPhoneInput && config.order) {
            custPhoneInput.value = (config.order.customerPhone || '').trim();
        }

        if (noteInput) {
            noteInput.value = config.inputValue || 'تم الدفع والتحويل بنجاح';
        }

        setTimeout(() => {
            if (custNameInput && (!custNameInput.value || config.type === 'edit_customer')) {
                custNameInput.focus();
            } else if (noteInput) {
                noteInput.focus();
            }
        }, 150);
    } else {
        if (inputContainer) inputContainer.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
    });

    return new Promise((resolve) => {
        modalResolveCallback = resolve;
    });
}

window.closeOrderActionModal = function(confirmed = false) {
    const modal = document.getElementById('order-action-modal');
    const box = document.getElementById('order-modal-box');
    const noteInput = document.getElementById('order-modal-note-input');
    const custNameInput = document.getElementById('order-modal-customer-name-input');
    const custPhoneInput = document.getElementById('order-modal-customer-phone-input');

    if (box) {
        box.classList.remove('scale-100', 'opacity-100');
        box.classList.add('scale-95', 'opacity-0');
    }

    setTimeout(() => {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }, 180);

    if (modalResolveCallback) {
        if (confirmed) {
            let updatedItems = null;
            let updatedTotalPrice = null;
            let hasCustomDiscount = false;
            let originalTotalPrice = null;

            if (currentModalOrder) {
                const inputs = document.querySelectorAll('.item-modal-price-input');
                if (inputs.length > 0) {
                    const hasRealItems = Array.isArray(currentModalOrder.items) && currentModalOrder.items.length > 0;
                    const baseItems = hasRealItems ? currentModalOrder.items : [{
                        title: 'طلب مخصص لدار التطريز',
                        price: Number(currentModalOrder.totalPrice) || 0
                    }];

                    updatedItems = baseItems.map((it, idx) => {
                        const inp = document.querySelector(`.item-modal-price-input[data-idx="${idx}"]`);
                        const val = inp ? parseFloat(inp.value) : (parseFloat(it.price) || 0);
                        const newPrice = isNaN(val) ? (parseFloat(it.price) || 0) : val;
                        const origPrice = it.originalPrice !== undefined ? Number(it.originalPrice) : (parseFloat(it.price) || 0);
                        return {
                            ...it,
                            price: newPrice,
                            originalPrice: origPrice,
                            discountApplied: newPrice < origPrice
                        };
                    });

                    updatedTotalPrice = Math.round(updatedItems.reduce((acc, it) => acc + (Number(it.price) || 0), 0) * 100) / 100;
                    originalTotalPrice = currentModalOrder.originalTotalPrice !== undefined ? Number(currentModalOrder.originalTotalPrice) : (Number(currentModalOrder.totalPrice) || 0);
                    hasCustomDiscount = updatedTotalPrice !== originalTotalPrice;
                }
            }

            modalResolveCallback({
                confirmed: true,
                note: noteInput ? noteInput.value.trim() : '',
                updatedCustomerName: custNameInput ? custNameInput.value.trim() : '',
                updatedCustomerPhone: custPhoneInput ? custPhoneInput.value.trim() : '',
                updatedItems,
                updatedTotalPrice,
                hasCustomDiscount,
                originalTotalPrice
            });
        } else {
            modalResolveCallback({ confirmed: false });
        }
        modalResolveCallback = null;
        currentModalOrder = null;
    }
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('order-action-modal');
        if (modal && !modal.classList.contains('hidden')) {
            window.closeOrderActionModal(false);
        }
    }
});

// ==========================================
// الإجراءات التفاعلية للأزرار
// ==========================================

// 1. إجراء: تم تأكيد الطلب ودفع المبلغ
window.confirmOrderAction = async function(orderId) {
    if (!orderId) return;

    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    const res = await showOrderConfirmationModal({
        type: 'confirm',
        icon: '✅',
        title: 'تأكيد استلام المبلغ واعتماد الطلب',
        subtitle: `رقم الطلب: #${orderId} • ${order.customerName || 'عميل المتجر'}`,
        desc: 'يرجى مراجعة وتعديل أسعار القطع وبيانات العميل المعتمدة للشهادة، ثم تأكيد استلام المبلغ ونقله إلى الأرشيف.',
        showInput: true,
        inputValue: 'تم الاتفاق والدفع بنجاح',
        btnText: 'نعم، اعتماد السعر والدفع',
        order: order
    });

    if (!res || !res.confirmed) return;

    const cardEl = document.getElementById(`order-card-${orderId}`);

    try {
        if (cardEl) {
            cardEl.style.opacity = '0.5';
            cardEl.style.pointerEvents = 'none';
        }

        const additionalData = {};
        if (res.updatedItems) {
            additionalData.items = res.updatedItems;
            additionalData.totalPrice = res.updatedTotalPrice;
            additionalData.hasCustomDiscount = res.hasCustomDiscount;
            additionalData.originalTotalPrice = res.originalTotalPrice;
        }
        if (res.updatedCustomerName) {
            additionalData.customerName = res.updatedCustomerName;
        }
        if (res.updatedCustomerPhone) {
            additionalData.customerPhone = res.updatedCustomerPhone;
        }

        await confirmOrderPayment(orderId, res.note, additionalData);
        showOrderToast(`✅ تم اعتماد السعر (${res.updatedTotalPrice ?? order.totalPrice} ر.ع.) وتأكيد الطلب #${orderId} ونقله للأرشيف بنجاح!`, 'success');
        
        // إعادة الرسم ستحدث تلقائياً عبر مراقب onSnapshot
    } catch(err) {
        console.error("Failed to confirm order:", err);
        if (cardEl) {
            cardEl.style.opacity = '1';
            cardEl.style.pointerEvents = 'auto';
        }
        showOrderToast('حدث خطأ أثناء تأكيد الطلب: ' + err.message, 'error');
    }
};

// 1.5. إجراء: تعديل وتوثيق بيانات العميل السريعة (الاسم ورقم الهاتف)
window.editCustomerInfoPrompt = async function(orderId) {
    if (!orderId) return;

    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    const res = await showOrderConfirmationModal({
        type: 'edit_customer',
        icon: '👤',
        title: 'تعديل وتوثيق بيانات العميل',
        subtitle: `رقم الطلب: #${orderId}`,
        desc: 'أدخل اسم العميل المعتمد ورقم هاتفه. سيتم تحديثهما فوراً في السحابة وتضمينهما في شهادة الأصالة الملكية والإيصال ورسائل الواتساب وصفحة التتبع.',
        showInput: true,
        btnText: 'حفظ وتحديث بيانات العميل',
        order: order
    });

    if (!res || !res.confirmed) return;

    const cardEl = document.getElementById(`order-card-${orderId}`);
    try {
        if (cardEl) {
            cardEl.style.opacity = '0.5';
            cardEl.style.pointerEvents = 'none';
        }

        await updateOrderCustomerInfo(orderId, res.updatedCustomerName, res.updatedCustomerPhone);
        showOrderToast(`✅ تم تحديث بيانات العميل للطلب #${orderId} بنجاح!`, 'success');
    } catch(err) {
        console.error("Failed to update customer info:", err);
        if (cardEl) {
            cardEl.style.opacity = '1';
            cardEl.style.pointerEvents = 'auto';
        }
        showOrderToast('حدث خطأ أثناء تحديث بيانات العميل: ' + err.message, 'error');
    }
};

// 2. إجراء: تم إلغاء الطلب (حذف فوري من القائمة وقاعدة البيانات)
window.cancelOrderAction = async function(orderId) {
    if (!orderId) return;

    const res = await showOrderConfirmationModal({
        type: 'delete',
        icon: '❌',
        title: 'إلغاء وحذف الطلب نهائياً',
        subtitle: `رقم الطلب: #${orderId}`,
        desc: 'هل أنت متأكد تماماً من رغبتك في إلغاء هذا الطلب وحذفه نهائياً من القائمة وقاعدة البيانات؟ سيتم خصم قيمته تلقائياً من المحصلة المالية ولن يمكن التراجع عن الحذف.',
        showInput: false,
        btnText: 'نعم، إلغاء وحذف نهائي'
    });

    if (!res || !res.confirmed) return;

    const cardEl = document.getElementById(`order-card-${orderId}`);

    try {
        if (cardEl) {
            cardEl.style.transition = 'all 0.3s ease-out';
            cardEl.style.transform = 'scale(0.9) translateY(-10px)';
            cardEl.style.opacity = '0';
        }

        await cancelAndPermanentlyDeleteOrder(orderId);
        showOrderToast(`❌ تم إلغاء الطلب ${orderId} وحذفه نهائياً.`, 'info');
        
        // إعادة الرسم ستحدث تلقائياً عبر مراقب onSnapshot
    } catch(err) {
        console.error("Failed to delete order:", err);
        if (cardEl) {
            cardEl.style.opacity = '1';
            cardEl.style.transform = 'none';
        }
        showOrderToast('حدث خطأ أثناء حذف الطلب: ' + err.message, 'error');
    }
};

// 3. إعادة طلب من الأرشيف للمعلق
window.revertOrderAction = async function(orderId) {
    if (!orderId) return;

    const res = await showOrderConfirmationModal({
        type: 'revert',
        icon: '↩️',
        title: 'إعادة الطلب لقيد الانتظار',
        subtitle: `رقم الطلب: #${orderId}`,
        desc: 'هل تود إعادة هذا الطلب من الأرشيف إلى قائمة الطلبات المعلقة؟ سيتم خصم مبلغه مؤقتاً من المحصلة المالية لمراجعته.',
        showInput: false,
        btnText: 'نعم، إعادة للانتظار'
    });

    if (!res || !res.confirmed) return;

    try {
        await revertOrderToPending(orderId);
        showOrderToast(`↩️ تم إعادة الطلب ${orderId} إلى قائمة الطلبات المعلقة بنجاح.`, 'info');
    } catch(err) {
        showOrderToast('حدث خطأ أثناء استعادة الطلب: ' + err.message, 'error');
    }
};

// ==========================================
// 3.5 إدارة مراحل الطلب والتتبع وإرسال إشعارات الواتساب المباشرة
// ==========================================

window.openOrderStageModal = async function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    const currentStage = getOrderStage(order);
    const clientName = escapeHtml(order.customerName || 'عميل المتجر');
    const existingTrackingNum = escapeHtml(order.trackingNumber || '');
    const existingCarrier = escapeHtml(order.carrierName || '');
    const existingNotes = escapeHtml(order.stageNotes || '');

    // إزالة أي نافذة سابقة
    const oldModal = document.getElementById('order-stage-modal-container');
    if (oldModal) oldModal.remove();

    const stagesOptionsHtml = ORDER_STAGES_ARRAY.map(st => {
        const isCurrent = st.id === currentStage.id;
        return `
            <label class="stage-option-card flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${isCurrent ? 'bg-amber-50 border-brand shadow-2xs font-bold' : 'bg-white border-stone-200 hover:bg-stone-50'}">
                <div class="flex items-center gap-3">
                    <input type="radio" name="order-stage-radio" value="${st.id}" ${isCurrent ? 'checked' : ''} class="w-4 h-4 text-brand focus:ring-brand accent-[#7c1d3c]">
                    <span class="text-xl shrink-0">${st.icon}</span>
                    <div class="text-right">
                        <div class="font-display font-black text-xs sm:text-sm text-stone-900">${st.title}</div>
                        <div class="text-[10px] text-stone-500 font-medium">${st.desc}</div>
                    </div>
                </div>
                <span class="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded ${isCurrent ? 'bg-brand text-white' : 'bg-stone-100 text-stone-500'}">
                    مرحلة ${st.stepIndex}
                </span>
            </label>
        `;
    }).join('');

    const modalHtml = `
        <div id="order-stage-modal-container" class="fixed inset-0 z-[160] modal-glass-backdrop flex items-center justify-center p-3 sm:p-4" dir="rtl">
            <div class="lux-modal-box w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl bg-white border border-stone-300 relative max-h-[92vh] overflow-y-auto">
                
                <div class="flex items-center justify-between pb-3 border-b border-stone-200">
                    <div class="flex items-center gap-2.5">
                        <span class="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg font-bold">🚚</span>
                        <div>
                            <h3 class="font-display font-black text-sm sm:text-base text-stone-900">تحديث مرحلة الطلب والتتبع</h3>
                            <p class="text-[11px] text-stone-500 font-medium">الطلب: #${orderId} • ${clientName}</p>
                        </div>
                    </div>
                    <button type="button" onclick="document.getElementById('order-stage-modal-container').remove()" class="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer">✕</button>
                </div>

                <div class="space-y-2">
                    <label class="block text-xs font-bold text-stone-700">اختر المرحلة الحالية للطلبية:</label>
                    <div class="space-y-2" id="order-stage-options-group">
                        ${stagesOptionsHtml}
                    </div>
                </div>

                <!-- تفاصيل الشحن الإضافية (بوليصة الشحن واسم شركة النقل) -->
                <div class="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div class="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <span>📦</span>
                        <span>بيانات الشحن والملاحظات (اختياري):</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label class="block text-[10.5px] text-stone-600 font-medium mb-1">رقم بوليصة الشحن:</label>
                            <input id="stage-tracking-num" type="text" value="${existingTrackingNum}" placeholder="مثال: DL-889102" class="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-mono">
                        </div>
                        <div>
                            <label class="block text-[10.5px] text-stone-600 font-medium mb-1">شركة الشحن أو المندوب:</label>
                            <input id="stage-carrier-name" type="text" value="${existingCarrier}" placeholder="مثال: دليلي / مندوب خاص" class="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs">
                        </div>
                    </div>
                    <div>
                        <label class="block text-[10.5px] text-stone-600 font-medium mb-1">ملاحظة موجهة للعميل:</label>
                        <input id="stage-custom-notes" type="text" value="${existingNotes}" placeholder="أي ملاحظة أو توجيه خاص بالقطعة" class="w-full bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs">
                    </div>
                </div>

                <!-- أزرار الإجراءات -->
                <div class="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
                    <button id="stage-save-whatsapp-btn" type="button" class="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <span>📲</span>
                        <span>حفظ وإرسال بالواتساب للعميل</span>
                    </button>
                    <button id="stage-save-only-btn" type="button" class="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs h-10 px-4 rounded-xl border border-stone-300 transition flex items-center justify-center gap-1 cursor-pointer active:scale-95">
                        <span>💾</span>
                        <span>حفظ بالسحابة فقط</span>
                    </button>
                    <button type="button" onclick="document.getElementById('order-stage-modal-container').remove()" class="w-full sm:w-auto text-stone-500 hover:text-stone-700 font-bold text-xs h-10 px-3 rounded-xl transition cursor-pointer">
                        إلغاء
                    </button>
                </div>

            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // ربط نقرات الحفظ
    const executeSave = async (sendWhatsApp) => {
        const selectedRadio = document.querySelector('input[name="order-stage-radio"]:checked');
        const selectedStage = selectedRadio ? selectedRadio.value : currentStage.id;
        const trackingNum = document.getElementById('stage-tracking-num').value.trim();
        const carrierName = document.getElementById('stage-carrier-name').value.trim();
        const notes = document.getElementById('stage-custom-notes').value.trim();

        try {
            await updateOrderStage(orderId, selectedStage, {
                trackingNumber: trackingNum,
                carrierName: carrierName,
                notes: notes
            });

            // تحديث الكائن محلياً
            order.stage = selectedStage;
            order.trackingNumber = trackingNum;
            order.carrierName = carrierName;
            order.stageNotes = notes;
            order.stageUpdatedAt = Date.now();

            showOrderToast(`✅ تم تحديث مرحلة الطلب #${orderId} بنجاح!`, 'success');

            if (sendWhatsApp) {
                const msg = buildWhatsAppStatusUpdateMessage(order, selectedStage, {
                    trackingNumber: trackingNum,
                    carrierName: carrierName,
                    notes: notes
                });
                const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : "96895939388";
                window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
            }

            const m = document.getElementById('order-stage-modal-container');
            if (m) m.remove();
        } catch(err) {
            console.error("Failed to update order stage:", err);
            showOrderToast('حدث خطأ أثناء تحديث المرحلة: ' + err.message, 'error');
        }
    };

    document.getElementById('stage-save-whatsapp-btn').onclick = () => executeSave(true);
    document.getElementById('stage-save-only-btn').onclick = () => executeSave(false);
};

window.sendStageWhatsApp = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    const currentStage = getOrderStage(order);
    const msg = buildWhatsAppStatusUpdateMessage(order, currentStage.id, {
        trackingNumber: order.trackingNumber || '',
        carrierName: order.carrierName || '',
        notes: order.stageNotes || ''
    });
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : "96895939388";
    window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

window.sendWelcomeWhatsApp = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    const msg = buildWhatsAppOrderWelcomeMessage(order);
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : "96895939388";
    window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

window.sendPaymentReceiptWhatsApp = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    const msg = buildWhatsAppPaymentReceiptMessage(order);
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : "96895939388";
    window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

window.openOrderTracking = function(orderId) {
    const url = getOrderTrackingUrl(orderId);
    window.open(url, '_blank');
};

// ==========================================
// 4. طباعة إيصال مبيعات فاخر معتمد (Luxury Sales Receipt & Certificate)
// ==========================================

// الاحتفاظ بنسخة الإيصال السابقة (Legacy Receipt) بناءً على طلب المسؤول
window.printOrderReceiptLegacy = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map((it, idx) => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">${idx + 1}</td>
            <td style="padding: 8px;">${escapeHtml(it.title || '')} (${escapeHtml(it.id || '')})</td>
            <td style="padding: 8px;">${escapeHtml(it.dimensions || '')}</td>
            <td style="padding: 8px; font-weight: bold;">${it.price || 0} ر.ع.</td>
        </tr>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة في المتصفح لطباعة الإيصال.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>إيصال طلب مبسط | دار التطريز TATRIZA - ${orderId}</title>
            <style>
                body { font-family: 'Tajawal', sans-serif; padding: 25px; color: #1c1917; direction: rtl; }
                .header { text-align: center; border-bottom: 2px solid #7c1d3c; padding-bottom: 15px; margin-bottom: 20px; }
                .badge { background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f5f5f4; padding: 10px; text-align: right; }
                .total { text-align: left; font-size: 18px; font-weight: bold; color: #7c1d3c; margin-top: 15px; }
                .switch-bar { background: #fafafa; padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 15px; display: flex; justify-content: space-between; }
                @media print { .switch-bar { display: none !important; } }
            </style>
        </head>
        <body>
            <div class="switch-bar">
                <span>📄 النسخة المبسطة (السابقة)</span>
                <button onclick="window.opener && window.opener.printOrderReceipt('${orderId}'); window.close();" style="padding: 5px 12px; cursor: pointer; border-radius: 6px; font-family: inherit;">✨ الانتقال للإيصال الملكي الفاخر</button>
            </div>
            <div class="header">
                <h2>دار التطريز TATRIZA | إيصال مبيعات معتمد</h2>
                <p>سجاد وتحف فنية يدوية فاخرة • سلطنة عُمان</p>
                <span class="badge">طلب مؤكد ومدفوع</span>
            </div>
            <p><strong>رقم الطلب:</strong> ${orderId}</p>
            <p><strong>تاريخ الطلب:</strong> ${order.createdAtFormatted || formatTimestamp(order.createdAt)}</p>
            <p><strong>العميل:</strong> ${escapeHtml(order.customerName || '')}</p>
            <p><strong>الملاحظات:</strong> ${escapeHtml(order.customerNotes || '')}</p>
            <table>
                <thead>
                    <tr><th>#</th><th>المنتج</th><th>الأبعاد</th><th>السعر</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <div class="total">الإجمالي: ${order.totalPrice || 0} ر.ع.</div>
            <p style="text-align: center; margin-top: 40px; color: #888; font-size: 12px;">شكراً لاختياركم دار التطريز 🏛️</p>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// الإيصال الملكي الفاخر المعتمد والمطور (Luxury Certificate & Sales Receipt)
window.printOrderReceipt = function(orderId, mode = 'luxury') {
    if (mode === 'legacy') {
        return window.printOrderReceiptLegacy(orderId);
    }

    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;

    const origin = window.location.origin;
    const logoUrl = origin + '/images/logo.jpg';
    const authHash = generateOrderAuthHash(order);
    const verifyUrl = getOrderVerificationUrl(orderId, authHash, origin);
    const sealSvg = generateRoyalOrderSealSVG(order, authHash, { width: 95, height: 95 });
    const qrSvg = generateOrderQRCodeSVG(verifyUrl, 78);

    const items = Array.isArray(order.items) ? order.items : [];
    const customerName = escapeHtml(order.customerName || 'عميل دار التطريز الكريم');
    const customerPhone = escapeHtml(order.customerPhone || 'مسجل لدى المتجر');
    const orderDate = order.createdAtFormatted || formatTimestamp(order.createdAt);
    const confirmedDate = order.confirmedAt ? formatTimestamp(order.confirmedAt) : orderDate;
    const paymentNote = escapeHtml(order.paymentNotes || 'تحويل بنكي معتمد');
    const customerNotes = escapeHtml(order.customerNotes || '');

    // توليد صفوف المنتجات الفاخرة
    const itemsRowsHtml = items.map((it, idx) => {
        const itemPrice = Number(it.price) || 0;
        const origPrice = it.originalPrice !== undefined ? Number(it.originalPrice) : itemPrice;
        const hasDiscount = it.discountApplied || (origPrice > itemPrice && itemPrice > 0);

        return `
        <tr>
            <td style="text-align: center; font-weight: bold; color: #7c1d3c; width: 30px;">${idx + 1}</td>
            <td>
                <div class="item-title">${escapeHtml(it.title || 'سجادة فاخرة صُنع يدوي')}</div>
                <div class="item-meta">
                    ${it.id ? `<span class="badge-code">${escapeHtml(it.id)}</span>` : ''}
                    <span class="badge-craft">حياكة يدوية متقنة • Hand-Tufted</span>
                    ${hasDiscount ? `<span class="badge-craft" style="color: #065f46; background: #ecfdf5; border-color: #a7f3d0;">✨ تخفيض خاص</span>` : ''}
                    ${it.note ? `<span class="badge-note">${escapeHtml(it.note)}</span>` : ''}
                </div>
            </td>
            <td style="text-align: center; font-weight: 600; color: #44403c; width: 100px;">
                ${escapeHtml(it.dimensions || 'مخصص')}
            </td>
            <td style="text-align: center; font-weight: bold; width: 45px;">1</td>
            <td style="text-align: left; font-weight: 900; color: #7c1d3c; font-size: 12px; width: 85px;">
                <div>${it.price ? `${it.price} ر.ع.` : 'بالاتفاق'}</div>
                ${hasDiscount ? `
                    <div style="font-size: 8.5px; color: #78716c; text-decoration: line-through; font-weight: normal;">${origPrice} ر.ع.</div>
                ` : ''}
            </td>
        </tr>
        `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('يرجى السماح بالنوافذ المنبثقة في المتصفح لطباعة الإيصال.');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إيصال مبيعات معتمد وشهادة اقتناء (A5) | دار التطريز TATRIZA - ${orderId}</title>
            
            <!-- خطوط جوجل العربية والإنجليزية الملكية المعتمدة -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
            
            <style>
                :root {
                    --burgundy: #7c1d3c;
                    --dark-burgundy: #520b22;
                    --gold: #c59b27;
                    --gold-dark: #9e7813;
                    --gold-soft: #fcf8ee;
                    --gold-border: #e2c982;
                    --stone-900: #1c1917;
                    --stone-600: #57534e;
                    --stone-100: #f5f5f4;
                    --emerald: #065f46;
                    --emerald-bg: #ecfdf5;
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    font-family: 'Tajawal', sans-serif;
                    background: #ded8cf;
                    color: var(--stone-900);
                    direction: rtl;
                    padding: 24px 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-height: 100vh;
                    -webkit-font-smoothing: antialiased;
                }

                /* شريط التحكم بالطباعة العلوي */
                .action-toolbar {
                    width: 100%;
                    max-width: 580px;
                    background: #ffffff;
                    padding: 10px 16px;
                    border-radius: 14px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    box-shadow: 0 4px 18px rgba(0,0,0,0.06);
                    border: 1px solid #d5cec5;
                }
                .btn-primary-print {
                    background: linear-gradient(135deg, var(--burgundy) 0%, var(--dark-burgundy) 100%);
                    color: #fff;
                    font-family: 'Tajawal', sans-serif;
                    font-weight: 800;
                    font-size: 12.5px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 3px 10px rgba(124, 29, 60, 0.22);
                    transition: transform 0.15s;
                }
                .btn-primary-print:hover { transform: translateY(-1px); }
                .btn-secondary-switch {
                    background: #f7f5f0;
                    color: #44403c;
                    border: 1px solid #dcd5cb;
                    font-family: 'Tajawal', sans-serif;
                    font-weight: 700;
                    font-size: 11.5px;
                    padding: 7px 12px;
                    border-radius: 9px;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .btn-secondary-switch:hover { background: #eee9e0; color: #1c1917; }

                /* الحاوية الأساسية لورقة الإيصال بمقاس A5 */
                .receipt-document {
                    width: 100%;
                    max-width: 580px;
                    background: #fffdf9;
                    border: 2px solid var(--gold-border);
                    border-radius: 20px;
                    padding: 22px 24px;
                    box-shadow: 0 10px 36px rgba(0,0,0,0.09);
                    position: relative;
                }

                /* الإطار الداخلي المزخرف */
                .ornate-border {
                    border: 1.5px solid #ece4d8;
                    border-radius: 14px;
                    padding: 16px 18px;
                    position: relative;
                    background: #ffffff;
                }

                /* زوايا الإطار الذهبي */
                .corner { position: absolute; width: 14px; height: 14px; border: 2px solid var(--gold); }
                .corner-tl { top: 6px; left: 6px; border-right: none; border-bottom: none; border-top-left-radius: 5px; }
                .corner-tr { top: 6px; right: 6px; border-left: none; border-bottom: none; border-top-right-radius: 5px; }
                .corner-bl { bottom: 6px; left: 6px; border-right: none; border-top: none; border-bottom-left-radius: 5px; }
                .corner-br { bottom: 6px; right: 6px; border-left: none; border-top: none; border-bottom-right-radius: 5px; }

                /* 1. الترويسة الملكية والشعار */
                .header-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1.5px solid #ebd9c0;
                    margin-bottom: 14px;
                }
                .brand-identity {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .brand-logo {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    object-fit: cover;
                    border: 1.5px solid var(--gold-border);
                    box-shadow: 0 2px 8px rgba(197, 155, 39, 0.2);
                }
                .brand-title {
                    font-family: 'Alexandria', 'Cairo', sans-serif;
                    font-weight: 900;
                    font-size: 18px;
                    color: var(--burgundy);
                    letter-spacing: -0.3px;
                    line-height: 1.2;
                }
                .brand-sub {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    font-size: 10px;
                    color: var(--gold-dark);
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    margin-top: 1px;
                }
                .brand-desc {
                    font-size: 9.5px;
                    font-weight: 600;
                    color: var(--stone-600);
                    margin-top: 2px;
                }

                .header-meta {
                    text-align: left;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 5px;
                }
                .title-ribbon {
                    background: linear-gradient(135deg, var(--gold-soft) 0%, #ffffff 100%);
                    border: 1px solid var(--gold-border);
                    color: var(--burgundy);
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 10.5px;
                    font-weight: 900;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                }
                .paid-status-pill {
                    background: var(--emerald-bg);
                    border: 1px solid #a7f3d0;
                    color: var(--emerald);
                    font-size: 9.5px;
                    font-weight: 800;
                    padding: 2px 9px;
                    border-radius: 16px;
                    white-space: nowrap;
                }

                /* 2. شبكة بيانات الطلب والعميل */
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 14px;
                }
                .info-card {
                    background: #faf7f2;
                    border: 1px solid #ebd9c0;
                    border-radius: 10px;
                    padding: 7px 9px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .info-card-label {
                    font-size: 9.5px;
                    font-weight: 700;
                    color: #78716c;
                }
                .info-card-value {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--stone-900);
                    line-height: 1.3;
                }
                .order-code-highlight {
                    font-family: 'Outfit', monospace;
                    font-size: 12px;
                    font-weight: 900;
                    color: var(--burgundy);
                    letter-spacing: 0.3px;
                }

                /* 3. جدول بنود المعروضات الفاخرة */
                .table-container {
                    border: 1.5px solid #ebd9c0;
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 14px;
                }
                table.invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }
                table.invoice-table thead th {
                    background: #fbf5eb;
                    color: var(--burgundy);
                    font-weight: 800;
                    padding: 8px 10px;
                    border-bottom: 1.5px solid #ebd9c0;
                    text-align: right;
                    font-size: 10.5px;
                }
                table.invoice-table tbody td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #f2ece3;
                    vertical-align: middle;
                }
                table.invoice-table tbody tr:last-child td { border-bottom: none; }
                table.invoice-table tbody tr:nth-child(even) { background: #fdfaf6; }
                
                .item-title { font-weight: 800; font-size: 11.5px; color: var(--stone-900); }
                .item-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; flex-wrap: wrap; }
                .badge-code { font-family: 'Outfit', monospace; font-size: 9px; background: #e7e0d6; padding: 1px 5px; border-radius: 4px; color: #444; }
                .badge-craft { font-size: 9px; background: var(--gold-soft); color: var(--gold-dark); border: 1px solid var(--gold-border); padding: 1px 5px; border-radius: 4px; font-weight: 700; }
                .badge-note { font-size: 9px; color: var(--burgundy); font-weight: 700; }

                /* 4. قسم المحصلة المالية وشهادة الأصالة */
                .summary-container {
                    display: grid;
                    grid-template-columns: 1.4fr 1fr;
                    gap: 12px;
                    background: #faf6f0;
                    border: 1.5px solid #ebd9c0;
                    border-radius: 12px;
                    padding: 12px 14px;
                    margin-bottom: 12px;
                }
                .authenticity-block {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    justify-content: center;
                }
                .auth-badge-header {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: var(--burgundy);
                    font-weight: 900;
                    font-size: 11.5px;
                }
                .auth-paragraph {
                    font-size: 9.5px;
                    color: #57534e;
                    line-height: 1.45;
                    font-weight: 500;
                }

                .totals-block {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    border-right: 1.5px solid #ebd9c0;
                    padding-right: 12px;
                    justify-content: center;
                }
                .tot-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 10.5px;
                    color: #57534e;
                    font-weight: 700;
                }
                .tot-row.grand-total {
                    border-top: 1.5px dashed #dcd3c5;
                    padding-top: 6px;
                    margin-top: 2px;
                    color: var(--burgundy);
                }
                .grand-total-val {
                    font-family: 'Outfit', 'Tajawal', sans-serif;
                    font-size: 18px;
                    font-weight: 900;
                    color: var(--burgundy);
                    letter-spacing: -0.5px;
                }

                /* 5. إرشادات العناية بالقطعة الفنية */
                .care-guide-box {
                    background: #ffffff;
                    border: 1px solid #ebd9c0;
                    border-radius: 10px;
                    padding: 8px 12px;
                    margin-bottom: 12px;
                }
                .care-guide-head {
                    font-size: 9.5px;
                    font-weight: 800;
                    color: var(--gold-dark);
                    margin-bottom: 5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    text-transform: uppercase;
                }
                .care-tips-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .care-tip {
                    font-size: 9px;
                    color: #57534e;
                    line-height: 1.35;
                    display: flex;
                    align-items: flex-start;
                    gap: 4px;
                }

                /* 6. التذييل والختم الملكي */
                .footer-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-top: 10px;
                    border-top: 1.5px solid #ebd9c0;
                }
                .footer-greetings {
                    font-size: 9.5px;
                    color: #78716c;
                    line-height: 1.5;
                }
                .footer-greetings strong {
                    color: var(--burgundy);
                    display: block;
                    font-size: 11px;
                    margin-bottom: 2px;
                }

                /* الختم الدائري المذهب الرسمي */
                .official-seal-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .royal-round-seal {
                    width: 62px;
                    height: 62px;
                    border: 1.5px dashed var(--gold);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background: radial-gradient(circle, #fffdf8 20%, #fbf4e2 100%);
                    box-shadow: 0 3px 8px rgba(197, 155, 39, 0.15);
                    padding: 3px;
                }
                .seal-star-icon { color: var(--gold); font-size: 9px; }
                .seal-center-text, .seal-text {
                    font-size: 7.5px;
                    font-weight: 900;
                    color: var(--burgundy);
                    line-height: 1.15;
                    margin: 1px 0;
                }
                .seal-eng-text {
                    font-size: 6.5px;
                    font-weight: 700;
                    color: var(--gold-dark);
                    font-family: 'Outfit', sans-serif;
                    letter-spacing: 0.5px;
                }

                .signature-box {
                    text-align: center;
                    border-top: 1px solid #d5cec5;
                    padding-top: 4px;
                    min-width: 90px;
                }
                .signature-title {
                    font-size: 8.5px;
                    font-weight: 700;
                    color: #78716c;
                }
                .signature-name {
                    font-family: 'Alexandria', sans-serif;
                    font-size: 9.5px;
                    font-weight: 800;
                    color: var(--burgundy);
                    margin-top: 1px;
                }

                /* الطباعة الدقيقة على معيار A5 */
                @media print {
                    @page {
                        size: A5 portrait;
                        margin: 4mm 5mm;
                    }
                    body {
                        background: #ffffff !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .action-toolbar { display: none !important; }
                    .receipt-document {
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: 1px solid var(--gold-border) !important;
                        border-radius: 8px !important;
                        padding: 10px 12px !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    .ornate-border {
                        padding: 10px 12px !important;
                        border-radius: 6px !important;
                    }
                }
            </style>
        </head>
        <body>
            <!-- شريط التحكم بالطباعة والخيارات -->
            <div class="action-toolbar">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn-primary-print" onclick="window.print()">
                        <span>🖨️</span>
                        <span>طباعة الإيصال الفاخر (A5)</span>
                    </button>
                    <span style="font-size: 11px; color: #78716c;">مهيأ لمقاس A5 للتسليم مع الطلبيات ✨</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <button class="btn-secondary-switch" onclick="window.opener && window.opener.printOrderReceiptLegacy('${orderId}'); window.close();" title="عرض نموذج الإيصال البسيط السابق">
                        <span>📄</span>
                        <span>الإيصال البسيط</span>
                    </button>
                    <button class="btn-secondary-switch" onclick="window.close()" title="إغلاق النافذة">
                        <span>✕</span>
                        <span>إغلاق</span>
                    </button>
                </div>
            </div>

            <!-- ورقة الإيصال الرسمية -->
            <div class="receipt-document">
                <div class="ornate-border">
                    <!-- زوايا الإطار الذهبي الملكي -->
                    <div class="corner corner-tl"></div>
                    <div class="corner corner-tr"></div>
                    <div class="corner corner-bl"></div>
                    <div class="corner corner-br"></div>

                    <!-- 1. الترويسة الفاخرة وشعار دار التطريز -->
                    <div class="header-row">
                        <div class="brand-identity">
                            <img src="${logoUrl}" alt="Tatriza Logo" class="brand-logo" onerror="this.src='images/logo.jpg'">
                            <div>
                                <h1 class="brand-title">دار التطريز TATRIZA</h1>
                                <p class="brand-sub">LUXURY HANDMADE ARTISANAL RUGS</p>
                                <p class="brand-desc">سجاد وتحف فنية يدوية فاخرة • سلطنة عُمان</p>
                            </div>
                        </div>
                        <div class="header-meta">
                            <span class="title-ribbon">
                                <span>🏛️</span>
                                <span>إيصال استلام مبيعات رسمي</span>
                            </span>
                            <span class="paid-status-pill">
                                <span>✓</span>
                                <span>طلب مؤكد ومستلم بالكامل</span>
                            </span>
                        </div>
                    </div>

                    <!-- 2. شبكة بيانات الطلب والعميل -->
                    <div class="info-grid">
                        <div class="info-card">
                            <span class="info-card-label">رقم الطلب المعتمد:</span>
                            <span class="order-code-highlight">#${orderId}</span>
                        </div>
                        <div class="info-card">
                            <span class="info-card-label">تاريخ الإصدار والاعتماد:</span>
                            <span class="info-card-value">${confirmedDate}</span>
                        </div>
                        <div class="info-card">
                            <span class="info-card-label">العميل الكريم:</span>
                            <span class="info-card-value">${customerName}</span>
                        </div>
                        <div class="info-card">
                            <span class="info-card-label">طريقة واعتماد الدفع:</span>
                            <span class="info-card-value">${paymentNote}</span>
                        </div>
                    </div>

                    ${customerNotes ? `
                    <div style="background: #faf7f2; border: 1px dashed #ebd9c0; border-radius: 8px; padding: 6px 10px; margin-bottom: 12px; font-size: 10.5px; color: #44403c;">
                        <strong style="color: var(--burgundy);">ملاحظات العميل والتسليم:</strong> ${customerNotes}
                    </div>
                    ` : ''}

                    <!-- 3. جدول القطع الفنية والمواصفات -->
                    <div class="table-container">
                        <table class="invoice-table">
                            <thead>
                                <tr>
                                    <th style="width: 30px; text-align: center;">#</th>
                                    <th>القطعة الفنية والمواصفات</th>
                                    <th style="width: 100px; text-align: center;">الأبعاد والمقاس</th>
                                    <th style="width: 45px; text-align: center;">الكمية</th>
                                    <th style="width: 85px; text-align: left;">السعر</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsRowsHtml || `
                                <tr>
                                    <td colspan="5" style="text-align: center; color: #888; padding: 14px;">
                                        طلب مخصص لدار التطريز رقم #${orderId}
                                    </td>
                                </tr>
                                `}
                            </tbody>
                        </table>
                    </div>

                    <!-- 4. المحصلة المالية وشهادة الأصالة -->
                    <div class="summary-container">
                        <div class="authenticity-block">
                            <div class="auth-badge-header">
                                <span>⚜️</span>
                                <span>شهادة صُنع يدوي وأصالة معتمدة</span>
                            </div>
                            <p class="auth-paragraph">
                                تشهد دار التطريز بأن هذه القطعة قد صُنعت يدوياً بأيدي حرفيين مهرة باستخدام أجود خيوط الغزل، وهي قطعة فنية حصرية صُممت لتضفي رونقاً وفخامة تدوم طويلاً.
                            </p>
                        </div>
                        <div class="totals-block">
                            ${(order.originalTotalPrice && Number(order.originalTotalPrice) > Number(order.totalPrice)) ? `
                            <div class="tot-row">
                                <span>السعر الأصلي:</span>
                                <span style="text-decoration: line-through; color: #78716c;">${order.originalTotalPrice} ر.ع.</span>
                            </div>
                            <div class="tot-row" style="color: var(--emerald); font-weight: 800;">
                                <span>خصم خاص للعميل:</span>
                                <span>-${Number(order.originalTotalPrice) - Number(order.totalPrice)} ر.ع.</span>
                            </div>
                            ` : `
                            <div class="tot-row">
                                <span>المجموع الفرعي:</span>
                                <span>${order.totalPrice || 0} ر.ع.</span>
                            </div>
                            `}
                            <div class="tot-row">
                                <span>خدمة التجهيز والتسليم:</span>
                                <span style="color: var(--emerald); font-weight: 800;">شامل / مجاناً</span>
                            </div>
                            <div class="tot-row grand-total">
                                <span>الإجمالي المدفوع:</span>
                                <span class="grand-total-val">${order.totalPrice || 0} ر.ع.</span>
                            </div>
                        </div>
                    </div>

                    <!-- 5. إرشادات العناية بسجاد دار التطريز الفاخر -->
                    <div class="care-guide-box">
                        <div class="care-guide-head">
                            <span>✨</span>
                            <span>إرشادات العناية بسجاد دار التطريز الفاخر للحفاظ على رونقه:</span>
                        </div>
                        <div class="care-tips-row">
                            <div class="care-tip">
                                <span>🧹</span>
                                <span><strong>التنظيف الدوري:</strong> الكنس اللطيف بالمكنسة الكهربائية باتجاه وبر السجاد بانتظام.</span>
                            </div>
                            <div class="care-tip">
                                <span>💧</span>
                                <span><strong>التعامل مع السوائل:</strong> التجفيف الفوري بقطعة قماش قطنية بالضغط الخفيف دون فرك قوي.</span>
                            </div>
                            <div class="care-tip">
                                <span>🌿</span>
                                <span><strong>حماية الألوان:</strong> تجنب المنظفات الكيميائية القاسية للمحافظة على الألوان الطبيعية.</span>
                            </div>
                        </div>
                    </div>

                    <!-- 6. التذييل الملكي وختم دار التطريز الرقمي ورمز QR للتحقق السحابي المانع للتزوير -->
                    <div class="footer-row" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 10px; border-top: 1.5px solid #ebd9c0;">
                        <div class="footer-greetings" style="flex: 1; min-width: 170px;">
                            <strong>شكراً لاقتنائكم من دار التطريز TATRIZA 🏛️✨</strong>
                            <span>مسقط، سلطنة عُمان • تواصل وتوثيق: 96895939388+</span>
                            <div style="margin-top: 4px; font-family: 'Outfit', monospace; font-size: 8px; color: #7c1d3c; font-weight: bold; background: #faf5ee; padding: 2px 6px; border-radius: 6px; display: inline-block; border: 1px dashed #e2c982;">
                                كود التوثيق الأمني: ${authHash}
                            </div>
                        </div>

                        <div class="official-seal-wrap" style="display: flex; align-items: center; gap: 10px;">
                            <!-- الختم الملكي الرقمي المشفر المخصص لهذه الطلبية -->
                            <div class="seal-svg-holder">
                                ${sealSvg}
                            </div>

                            <!-- رمز QR Code للتحقق السحابي الفوري -->
                            <div style="background: #ffffff; padding: 4px; border-radius: 8px; border: 1px solid #d5cec5; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                                <div style="width: 72px; height: 72px; display: flex; align-items: center; justify-content: center;">
                                    ${qrSvg}
                                </div>
                                <span style="display: block; font-size: 6.5px; font-weight: 800; color: #57534e; margin-top: 1px;">امسح للتحقق ✓</span>
                            </div>

                            <div class="signature-box" style="text-align: center; min-width: 75px; border-top: 1px solid #d5cec5; padding-top: 3px;">
                                <div class="signature-title" style="font-size: 7.5px; color: #78716c; font-weight: bold;">اعتماد الإدارة</div>
                                <div class="signature-name" style="font-family: 'Alexandria', sans-serif; font-size: 8.5px; font-weight: 900; color: #7c1d3c;">دار التطريز</div>
                                <span style="font-size: 6.5px; color: #065f46; font-weight: bold; display: block;">رسمي معتمد</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// فتح شهادة الأصالة الملكية الموثقة في نافذة مستقلة
window.openOrderCertificate = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    const authHash = generateOrderAuthHash(order);
    const url = getOrderVerificationUrl(orderId, authHash);
    window.open(url, '_blank');
};

// إرسال رابط شهادة الأصالة للعميل عبر الواتساب بنقرة واحدة
window.sendCertificateWhatsApp = function(orderId) {
    const order = allOrders.find(o => (o.orderId || o.id) === orderId);
    if (!order) return;
    const authHash = generateOrderAuthHash(order);
    const msg = buildWhatsAppCertificateClientMessage(order, authHash);
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : "96895939388";
    window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};

// 5. تصدير الأرشيف كملف CSV
window.exportOrdersCsv = function() {
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');
    if (confirmedOrders.length === 0) {
        alert('لا توجد طلبات مؤكدة في الأرشيف لتصديرها.');
        return;
    }

    let csvContent = "\uFEFFرقم الطلب,تاريخ الطلب,العميل,نوع الطلب,المنتجات,المبلغ الإجمالي (ر.ع),تاريخ التأكيد,ملاحظات الدفع\n";

    confirmedOrders.forEach(o => {
        const id = `"${o.orderId || o.id}"`;
        const date = `"${o.createdAtFormatted || formatTimestamp(o.createdAt)}"`;
        const cust = `"${(o.customerName || '').replace(/"/g, '""')}"`;
        const type = `"${o.type || ''}"`;
        const items = `"${(Array.isArray(o.items) ? o.items.map(i => i.title).join(' | ') : '').replace(/"/g, '""')}"`;
        const total = `"${o.totalPrice || 0}"`;
        const confirmedAt = `"${o.confirmedAt ? formatTimestamp(o.confirmedAt) : ''}"`;
        const notes = `"${(o.paymentNotes || '').replace(/"/g, '""')}"`;

        csvContent += `${id},${date},${cust},${type},${items},${total},${confirmedAt},${notes}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tatriza-confirmed-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ==========================================
// التبديل بين التبويبات (Pending vs Archive vs Analytics)
// ==========================================
window.switchOrdersTab = function(tabName) {
    currentTab = tabName;
    const btnPending = document.getElementById('tab-btn-pending');
    const btnArchive = document.getElementById('tab-btn-archive');
    const btnAnalytics = document.getElementById('tab-btn-analytics');

    const inactiveClass = 'orders-tab-inactive w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 bg-transparent text-stone-600 hover:text-stone-900 transition-all cursor-pointer';

    if (btnPending) btnPending.className = inactiveClass;
    if (btnArchive) btnArchive.className = inactiveClass;
    if (btnAnalytics) btnAnalytics.className = inactiveClass;

    if (tabName === 'pending') {
        if (btnPending) {
            btnPending.className = 'orders-tab-active w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 bg-stone-900 text-white shadow-xs transition-all cursor-pointer';
        }
    } else if (tabName === 'archive') {
        if (btnArchive) {
            btnArchive.className = 'orders-tab-active w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 bg-emerald-800 text-white shadow-xs transition-all cursor-pointer';
        }
    } else if (tabName === 'analytics') {
        if (btnAnalytics) {
            btnAnalytics.className = 'orders-tab-active w-full py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 bg-brand text-white shadow-xs transition-all cursor-pointer';
        }
    }

    renderOrdersList();
};

window.handleOrdersSearch = function(query) {
    currentSearch = query || '';
    renderOrdersList();
};

window.handleOrdersDateFilter = function(filterVal) {
    currentDateFilter = filterVal || 'all';
    renderOrdersList();
};

// ==========================================
// توست إشعارات أنيق (Order Toast)
// ==========================================
function showOrderToast(msg, type = 'info') {
    let toast = document.getElementById('orders-notification-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'orders-notification-toast';
        toast.className = 'fixed bottom-5 left-5 z-50 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2.5';
        document.body.appendChild(toast);
    }

    if (type === 'success') {
        toast.className = 'fixed bottom-5 left-5 z-50 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 bg-emerald-900 text-white border border-emerald-500/50 flex items-center gap-2.5';
    } else if (type === 'error') {
        toast.className = 'fixed bottom-5 left-5 z-50 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 bg-rose-900 text-white border border-rose-500/50 flex items-center gap-2.5';
    } else {
        toast.className = 'fixed bottom-5 left-5 z-50 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100 bg-stone-900 text-white border border-stone-700 flex items-center gap-2.5';
    }

    toast.innerText = msg;

    setTimeout(() => {
        toast.className = 'fixed bottom-5 left-5 z-50 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2.5';
    }, 3800);
}

// دالة مساعدة لتنسيق الوقت
function formatTimestamp(ts) {
    if (!ts) return '';
    try {
        const d = new Date(ts);
        return d.toLocaleDateString('ar-OM', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch(e) {
        return '';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// لوحة الإحصائيات والتحليلات الذكية الشاملة (Smart Analytics Dashboard)
// ==========================================
function renderAnalyticsDashboard() {
    const container = document.getElementById('analytics-dashboard-container');
    if (!container) return;

    const totalOrders = allOrders.length;
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed' || o.isPaid || o.status === 'completed');
    const pendingOrders = allOrders.filter(o => o.status !== 'confirmed' && !o.isPaid && o.status !== 'completed');

    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const totalSoldItems = confirmedOrders.reduce((sum, o) => sum + (Array.isArray(o.items) ? o.items.length : 1), 0);
    const aov = confirmedOrders.length > 0 ? Math.round(totalRevenue / confirmedOrders.length) : 0;
    const conversionRate = totalOrders > 0 ? Math.round((confirmedOrders.length / totalOrders) * 100) : 0;
    const avgItemsPerOrder = confirmedOrders.length > 0 ? (totalSoldItems / confirmedOrders.length).toFixed(1) : '1.0';

    // 1. تجميع وتوزيع المبيعات بحسب الأشهر (Monthly Revenue Breakdown)
    const monthMap = {};
    const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    confirmedOrders.forEach(o => {
        let dateObj = new Date();
        if (o.confirmedAt) dateObj = new Date(o.confirmedAt);
        else if (o.createdAt) dateObj = new Date(o.createdAt);
        else if (o.date) {
            const parsed = new Date(o.date);
            if (!isNaN(parsed.getTime())) dateObj = parsed;
        }
        
        const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        const label = `${arabicMonths[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        if (!monthMap[key]) {
            monthMap[key] = { key, label, revenue: 0, count: 0 };
        }
        monthMap[key].revenue += (Number(o.totalPrice) || 0);
        monthMap[key].count += 1;
    });

    const monthList = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    if (monthList.length === 0) {
        const now = new Date();
        monthList.push({
            key: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            label: `${arabicMonths[now.getMonth()]} ${now.getFullYear()}`,
            revenue: totalRevenue,
            count: confirmedOrders.length
        });
    }

    const maxMonthRev = Math.max(...monthList.map(m => m.revenue), 1);

    // 2. تحليل مراحل مسار الطلبيات
    const stageCounts = {
        order_received: 0,
        in_weaving: 0,
        quality_finishing: 0,
        shipped: 0,
        delivered: 0
    };
    allOrders.forEach(o => {
        const st = (typeof getOrderStage === 'function') ? getOrderStage(o).id : (o.stage || 'order_received');
        if (stageCounts[st] !== undefined) stageCounts[st]++;
        else stageCounts.order_received++;
    });

    // 3. تحليل القطع الأكثر طلباً وشعبية (Top In-Demand Pieces)
    const productMap = {};
    allOrders.forEach(o => {
        const items = Array.isArray(o.items) && o.items.length > 0 ? o.items : [{
            title: o.carpetTitle || o.title || 'سجادة ملكية تفصيل خاص',
            price: o.totalPrice || 0,
            image: o.carpetImage || 'images/logo.jpg',
            size: o.carpetSize || ''
        }];

        items.forEach(it => {
            const name = it.title || 'سجادة ملكية';
            if (!productMap[name]) {
                productMap[name] = {
                    title: name,
                    image: it.image || 'images/logo.jpg',
                    count: 0,
                    revenue: 0,
                    size: it.size || ''
                };
            }
            productMap[name].count += 1;
            productMap[name].revenue += (Number(it.price) || 0);
        });
    });

    const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 6);
    const maxProductCount = Math.max(...topProducts.map(p => p.count), 1);

    // تجهيز قيم العرض للخصوصية
    const displayRev = isRevenueHidden ? '••••••' : `${totalRevenue.toLocaleString('ar-OM')} ر.ع.`;
    const displayAOV = isRevenueHidden ? '••••' : `${aov.toLocaleString('ar-OM')} ر.ع.`;

    // رسم أعمدة الرسم البياني المتجاوب
    const chartBarsHtml = monthList.map(m => {
        const heightPct = Math.max(12, Math.round((m.revenue / maxMonthRev) * 100));
        const revFormatted = isRevenueHidden ? '••••' : `${m.revenue.toLocaleString('ar-OM')} ر.ع.`;
        return `
            <div class="flex-1 min-w-[52px] max-w-[80px] flex flex-col items-center justify-end h-40 sm:h-52 group relative shrink-0">
                <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-stone-900 text-white text-[10px] font-mono py-1 px-2.5 rounded-lg whitespace-nowrap z-20 shadow-lg">
                    ${m.label}: ${revFormatted} (${m.count} طلب)
                </div>
                
                <span class="text-[9px] sm:text-[10px] font-mono font-bold text-stone-700 mb-1 opacity-80 group-hover:opacity-100 truncate max-w-full">
                    ${revFormatted}
                </span>

                <div class="w-full max-w-[38px] sm:max-w-[44px] bg-stone-100 rounded-t-xl overflow-hidden flex items-end h-24 sm:h-36 border border-stone-200 group-hover:border-amber-400 transition">
                    <div style="height: ${heightPct}%" class="w-full bg-gradient-to-t from-[#7c1d3c] via-[#a02c52] to-[#c59b27] rounded-t-lg transition-all duration-500 shadow-sm"></div>
                </div>

                <span class="text-[9px] sm:text-xs font-bold text-stone-600 mt-1.5 truncate max-w-full text-center">
                    ${m.label}
                </span>
            </div>
        `;
    }).join('');

    // رسم بطاقات مراحل التصنيع
    const stagesHtml = ORDER_STAGES_ARRAY.map(st => {
        const cnt = stageCounts[st.id] || 0;
        return `
            <div class="p-2.5 sm:p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg sm:text-xl shrink-0">${st.icon}</span>
                    <div class="min-w-0">
                        <div class="font-display font-bold text-xs text-stone-900 truncate">${st.title}</div>
                        <div class="text-[9.5px] text-stone-500 truncate">${st.desc}</div>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <span class="font-mono font-black text-xs sm:text-sm text-stone-900 px-2 sm:px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200">${cnt}</span>
                </div>
            </div>
        `;
    }).join('');

    // رسم بطاقات المنتجات الأكثر طلباً
    const topProductsHtml = topProducts.map(p => {
        const pct = Math.round((p.count / maxProductCount) * 100);
        const pRev = isRevenueHidden ? '••••' : `${p.revenue.toLocaleString('ar-OM')} ر.ع.`;
        return `
            <div class="p-3 sm:p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <div class="flex items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-stone-200 shrink-0" onerror="this.src='images/logo.jpg'">
                        <div class="min-w-0">
                            <h4 class="font-display font-bold text-xs text-stone-900 truncate">${escapeHtml(p.title)}</h4>
                            <p class="text-[9.5px] text-stone-500 font-medium truncate">${p.count} طلبات • ${pRev}</p>
                        </div>
                    </div>
                    <span class="font-mono text-xs font-black text-brand bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200 shrink-0">${p.count} طلب</span>
                </div>
                <div class="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div style="width: ${pct}%" class="bg-gradient-to-r from-amber-500 to-[#7c1d3c] h-full rounded-full"></div>
                </div>
            </div>
        `;
    }).join('');

    // تجميع لوحة التحليلات
    container.innerHTML = `
        <div class="space-y-4 sm:space-y-6">
            
            <!-- ترويسة لوحة التحليلات والإجراءات المباشرة -->
            <div class="bg-gradient-to-r from-[#2a0814] via-[#451021] to-[#7c1d3c] text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-400 text-stone-950 font-mono">REPORTS v2.0</span>
                        <span class="text-[11px] sm:text-xs text-amber-200/90 font-medium">نظام التتبع والذكاء المالي</span>
                    </div>
                    <h2 class="font-display font-black text-base sm:text-2xl text-white">المركز التحليلي المالي والتشغيلي</h2>
                    <p class="text-xs sm:text-sm text-stone-200/80 max-w-xl">
                        تقارير متزامنة لحظياً لمراقبة التدفقات النقدية، متوسط السلة، ومراحل تصنيع السجاد الملكي.
                    </p>
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button type="button" onclick="window.printExecutiveReport()" class="flex-1 md:flex-initial bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs h-9 sm:h-10 px-3 sm:px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <span>🖨️</span>
                        <span>طباعة تقرير</span>
                    </button>
                    <button type="button" onclick="window.exportOrdersCsv()" class="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs h-9 sm:h-10 px-3 sm:px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
                        <span>📥</span>
                        <span>تصدير CSV</span>
                    </button>
                </div>
            </div>

            <!-- شبكة مؤشرات الأداء المتقدمة (KPI Cards) -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                
                <!-- AOV متوسط قيمة الطلب -->
                <div class="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs text-right space-y-1">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center text-xs sm:text-sm font-bold">💎</span>
                        <span class="text-[9px] font-mono text-stone-400">AOV</span>
                    </div>
                    <div class="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">متوسط قيمة الطلب</div>
                    <div class="font-display font-black text-lg sm:text-2xl text-stone-900 font-mono">${displayAOV}</div>
                    <div class="text-[9.5px] text-stone-400 font-medium truncate">لكل طلبية معتمدة</div>
                </div>

                <!-- Conversion Rate معدل الاعتماد والتأكيد -->
                <div class="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs text-right space-y-1">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center text-xs sm:text-sm font-bold">🎯</span>
                        <span class="text-[9px] font-mono text-stone-400">RATE</span>
                    </div>
                    <div class="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">معدل الاعتماد</div>
                    <div class="font-display font-black text-lg sm:text-2xl text-emerald-700 font-mono">${conversionRate}%</div>
                    <div class="text-[9.5px] text-stone-400 font-medium truncate">${confirmedOrders.length} من أصل ${totalOrders}</div>
                </div>

                <!-- Basket Size كثافة السلة -->
                <div class="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs text-right space-y-1">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center text-xs sm:text-sm font-bold">🛍️</span>
                        <span class="text-[9px] font-mono text-stone-400">ITEMS</span>
                    </div>
                    <div class="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">متوسط القطع</div>
                    <div class="font-display font-black text-lg sm:text-2xl text-stone-900 font-mono">${avgItemsPerOrder}</div>
                    <div class="text-[9.5px] text-stone-400 font-medium truncate">إجمالي ${totalSoldItems} قطعة</div>
                </div>

                <!-- Active Pipeline التحف قيد التصنيع والتسليم -->
                <div class="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-stone-200/90 shadow-2xs text-right space-y-1">
                    <div class="flex items-center justify-between mb-1.5">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center text-xs sm:text-sm font-bold">🧵</span>
                        <span class="text-[9px] font-mono text-stone-400">ACTIVE</span>
                    </div>
                    <div class="text-[10px] sm:text-[11px] text-stone-500 font-bold truncate">قيد المعالجة</div>
                    <div class="font-display font-black text-lg sm:text-2xl text-brand font-mono">${pendingOrders.length}</div>
                    <div class="text-[9.5px] text-stone-400 font-medium truncate">حياكة وشحن</div>
                </div>

            </div>

            <!-- المخطط البياني الشهري ومسار التتبع -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                
                <!-- المخطط البياني للمبيعات (عمودين من 3) -->
                <div class="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div class="flex items-center gap-2 sm:gap-2.5">
                            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center text-xs sm:text-sm">📈</span>
                            <div>
                                <h3 class="font-display font-bold text-xs sm:text-base text-stone-900">مسار الإيرادات الشهرية</h3>
                                <p class="text-[10px] sm:text-[11px] text-stone-500">حجم التحصيل المالي لكل فترة زمنية</p>
                            </div>
                        </div>
                        <span class="text-[11px] sm:text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-1 rounded-xl">
                            ${displayRev}
                        </span>
                    </div>

                    <!-- حاوية الأعمدة البيانية مع حماية التمرير الأفقي للجوال -->
                    <div class="w-full overflow-x-auto no-scrollbar pb-1">
                        <div class="flex items-end justify-around gap-2 pt-3 px-1 min-w-[280px]">
                            ${chartBarsHtml}
                        </div>
                    </div>
                </div>

                <!-- مسار التتبع ومراحل الحياكة والتسليم (عمود 1 من 3) -->
                <div class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm space-y-3 sm:space-y-4">
                    <div class="flex items-center gap-2 sm:gap-2.5 pb-2.5 sm:pb-3 border-b border-stone-100">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center text-xs sm:text-sm">🚚</span>
                        <div>
                            <h3 class="font-display font-bold text-xs sm:text-base text-stone-900">حالة خط الحياكة والتسليم</h3>
                            <p class="text-[10px] sm:text-[11px] text-stone-500">توزيع الطلبيات حسب المرحلة</p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        ${stagesHtml}
                    </div>
                </div>

            </div>

            <!-- قائمة القطع الأكثر طلباً -->
            <div class="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm space-y-3 sm:space-y-4">
                <div class="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-stone-100">
                    <div class="flex items-center gap-2 sm:gap-2.5">
                        <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center text-xs sm:text-sm">🏆</span>
                        <div>
                            <h3 class="font-display font-bold text-xs sm:text-base text-stone-900">القطع الفنية الأكثر طلباً وإقبالاً</h3>
                            <p class="text-[10px] sm:text-[11px] text-stone-500">ترتيب التحف الأكثر مبيعاً في دار التطريز</p>
                        </div>
                    </div>
                    <span class="text-[10px] sm:text-xs text-stone-500 font-bold">أعلى القطع طلباً</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${topProductsHtml || '<p class="text-xs text-stone-400 p-4">لا توجد بيانات كافية بعد.</p>'}
                </div>
            </div>

        </div>
    `;
}

// ==========================================
// طباعة التقرير المالي والتنفيذي الرسمي
// ==========================================
window.printExecutiveReport = function() {
    const totalOrders = allOrders.length;
    const confirmedOrders = allOrders.filter(o => o.status === 'confirmed' || o.isPaid || o.status === 'completed');
    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    const aov = confirmedOrders.length > 0 ? Math.round(totalRevenue / confirmedOrders.length) : 0;
    const conversionRate = totalOrders > 0 ? Math.round((confirmedOrders.length / totalOrders) * 100) : 0;
    const printDate = new Date().toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const printWin = window.open('', '_blank');
    if (!printWin) {
        showOrderToast('يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.', 'error');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>التقرير المالي والتنفيذي الرسمي | دار التطريز TATRIZA</title>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Tajawal', sans-serif; background: #fff; color: #1c1917; margin: 0; padding: 30px; font-size: 13px; }
                .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #7c1d3c; padding-bottom: 20px; margin-bottom: 25px; }
                .report-brand { font-size: 24px; font-weight: 900; color: #7c1d3c; margin: 0; }
                .report-sub { font-size: 12px; color: #666; margin-top: 4px; }
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                .kpi-card { border: 1px solid #e7e5e4; border-radius: 12px; padding: 15px; text-align: center; background: #fafaf9; }
                .kpi-title { font-size: 11px; color: #78716c; font-weight: bold; margin-bottom: 5px; }
                .kpi-val { font-size: 20px; font-weight: 900; color: #1c1917; font-family: monospace; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #7c1d3c; color: white; padding: 10px; text-align: right; font-size: 11px; }
                td { border-bottom: 1px solid #e7e5e4; padding: 10px; font-size: 11px; }
                .seal-box { margin-top: 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #d6d3d1; padding-top: 20px; }
                @media print {
                    @page { size: A4; margin: 15mm; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="report-header">
                <div>
                    <h1 class="report-brand">دار التطريز TATRIZA</h1>
                    <div class="report-sub">التقرير المالي والتنفيذي الدوري للمبيعات والتحف الملكية</div>
                </div>
                <div style="text-align: left; font-size: 11px; color: #78716c;">
                    <div>تاريخ الإصدار: ${printDate}</div>
                    <div>سلطنة عُمان - مسقط</div>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-title">إجمالي المبيعات المحصلة</div>
                    <div class="kpi-val" style="color: #7c1d3c;">${totalRevenue.toLocaleString('ar-OM')} ر.ع.</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">الطلبات المؤكدة والمدفوعة</div>
                    <div class="kpi-val" style="color: #047857;">${confirmedOrders.length}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">متوسط قيمة الطلب (AOV)</div>
                    <div class="kpi-val">${aov.toLocaleString('ar-OM')} ر.ع.</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-title">معدل تحويل الطلبات</div>
                    <div class="kpi-val">${conversionRate}%</div>
                </div>
            </div>

            <h3 style="font-size: 14px; margin-bottom: 5px; color: #1c1917;">سجل آخر الطلبات المؤكدة والمعتمدة</h3>
            <table>
                <thead>
                    <tr>
                        <th>رقم الطلب</th>
                        <th>العميل</th>
                        <th>الهاتف</th>
                        <th>المرحلة</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                    </tr>
                </thead>
                <tbody>
                    ${confirmedOrders.slice(0, 25).map(o => `
                        <tr>
                            <td style="font-family: monospace; font-weight: bold;">#${o.orderId || o.id}</td>
                            <td>${escapeHtml(o.customerName || 'عميل المتجر')}</td>
                            <td dir="ltr" style="font-family: monospace;">${escapeHtml(o.customerPhone || '-')}</td>
                            <td>${(typeof getOrderStage === 'function') ? getOrderStage(o).title : (o.stage || 'مكتمل')}</td>
                            <td style="color: #78716c;">${escapeHtml(o.date || '-')}</td>
                            <td style="font-weight: bold; color: #7c1d3c; font-family: monospace;">${o.totalPrice || 0} ر.ع.</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="seal-box">
                <div>
                    <div style="font-weight: bold; color: #7c1d3c;">دار التطريز TATRIZA • الإدارة العامة</div>
                    <div style="font-size: 10px; color: #78716c; margin-top: 3px;">سجل تجاري معتمد - سلطنة عمان</div>
                </div>
                <div style="text-align: center; border: 2px solid #c59b27; color: #977017; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 11px;">
                    ⚜️ معتمد رسمياً من الإدارة المالية ⚜️
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
};

window.renderAnalyticsDashboard = renderAnalyticsDashboard;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    checkLocalSession();
    initAuthListener();
});
