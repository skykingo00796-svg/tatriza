// ==========================================
// محرك إدارة الطلبات والمبيعات والمهام (orders.js)
// دار تطريز TATRIZA - لوحة المسؤول المستقلة
// ==========================================

import { 
    subscribeToOrders, 
    confirmOrderPayment, 
    cancelAndPermanentlyDeleteOrder, 
    revertOrderToPending,
    signInWithEmail,
    handleSignOut,
    initFirebaseServices
} from './firebase-admin.js';

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

// ==========================================
// التوثيق والحماية الفورية (Zero-Flicker Admin Auth)
// ==========================================
function checkLocalSession() {
    try {
        const maxIdle = 60 * 60 * 1000;
        const now = Date.now();
        const lastAct = localStorage.getItem('tatr_admin_last_activity');
        const isExpired = lastAct ? (now - parseInt(lastAct, 10) > maxIdle) : false;

        let isLoggedIn = localStorage.getItem('tatr_admin_logged_in') === 'true' ||
                         sessionStorage.getItem('tatr_admin_session_start') !== null ||
                         Boolean(localStorage.getItem('tatr_admin_email'));

        if (!isLoggedIn) {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.indexOf('firebase:authUser') === 0 || k.indexOf('tatr_admin') === 0)) {
                    isLoggedIn = true;
                    break;
                }
            }
        }

        if (isLoggedIn && !isExpired) {
            document.documentElement.classList.add('admin-session-active');
            document.documentElement.classList.remove('admin-session-anonymous');
            localStorage.setItem('tatr_admin_last_activity', now.toString());
            return true;
        } else {
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
        if (user) {
            document.documentElement.classList.add('admin-session-active');
            document.documentElement.classList.remove('admin-session-anonymous');
            localStorage.setItem('tatr_admin_logged_in', 'true');
            localStorage.setItem('tatr_admin_email', user.email || 'admin');
            localStorage.setItem('tatr_admin_last_activity', Date.now().toString());

            const userEmailEl = document.getElementById('admin-user-email');
            if (userEmailEl) userEmailEl.innerText = user.email || 'المسؤول المعتمد';

            startOrdersRealtimeListener();
        } else {
            // إذا لم يكن هناك مستخدم مسجل
            const hasLocal = checkLocalSession();
            if (!hasLocal) {
                document.documentElement.classList.add('admin-session-anonymous');
                document.documentElement.classList.remove('admin-session-active');
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
        await signInWithEmail(email, password);
        document.documentElement.classList.add('admin-session-active');
        document.documentElement.classList.remove('admin-session-anonymous');
        localStorage.setItem('tatr_admin_logged_in', 'true');
        localStorage.setItem('tatr_admin_email', email);
        localStorage.setItem('tatr_admin_last_activity', Date.now().toString());

        const userEmailEl = document.getElementById('admin-user-email');
        if (userEmailEl) userEmailEl.innerText = email;

        startOrdersRealtimeListener();
    } catch(err) {
        if (btnText) btnText.innerText = 'تسجيل الدخول إلى لوحة الطلبات';
        if (errEl) {
            errEl.innerText = 'فشل تسجيل الدخول: يرجى التحقق من البريد الإلكتروني وكلمة المرور الخاصة بدار تطريز.';
            errEl.classList.remove('hidden');
        }
    }
};

window.handleOrdersLogout = async function() {
    if (!confirm('هل ترغب في تسجيل الخروج من لوحة إدارة الطلبات؟')) return;
    try {
        await handleSignOut();
    } catch(e) {}
    localStorage.removeItem('tatr_admin_logged_in');
    localStorage.removeItem('tatr_admin_last_activity');
    localStorage.removeItem('tatr_admin_email');
    sessionStorage.removeItem('tatr_admin_session_start');
    document.documentElement.classList.add('admin-session-anonymous');
    document.documentElement.classList.remove('admin-session-active');
    if (unsubscribeOrders) {
        unsubscribeOrders();
        unsubscribeOrders = null;
    }
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
                `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0">` : 
                `<div class="w-14 h-14 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center justify-center text-xl shrink-0">🏛️</div>`;

            return `
                <div class="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/90 border border-stone-200/80 hover:bg-stone-100/80 transition">
                    ${imgEl}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2">
                            <h4 class="font-bold text-xs sm:text-sm text-stone-900 truncate">${escapeHtml(item.title || 'قطعة فنية')}</h4>
                            <span class="font-mono font-black text-xs text-amber-950 shrink-0">${item.price ? `${item.price} ر.ع.` : 'بالاتفاق'}</span>
                        </div>
                        <div class="flex items-center gap-2 text-[11px] text-stone-500 font-medium mt-0.5">
                            ${item.id ? `<span class="font-mono text-[10px] bg-stone-200/70 px-1.5 py-0.2 rounded">${escapeHtml(item.id)}</span>` : ''}
                            ${item.dimensions ? `<span>📐 ${escapeHtml(item.dimensions)}</span>` : ''}
                            ${item.note ? `<span class="text-brand font-bold">✨ ${escapeHtml(item.note)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        itemsHtml = `<p class="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl">لا توجد تفاصيل قطع إضافية مسجلة.</p>`;
    }

    // تجهيز رابط الواتساب لمحادثة العميل
    const waText = encodeURIComponent(`مرحباً بكم، بخصوص طلبكم لدى دار تطريز رقم: ${orderId}`);
    const clientPhone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : storePhone;
    const waUrl = `https://wa.me/${clientPhone}?text=${waText}`;

    // أزرار الإجراءات
    let actionsHtml = '';
    if (!isConfirmed) {
        // الطلب معلق: زر التأكيد والدفع + زر الإلغاء والحذف
        actionsHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-stone-200">
                <!-- الزر الأول: تأكيد الطلب ودفع المبلغ -->
                <button type="button" onclick="confirmOrderAction('${orderId}')" class="btn-liquid-emerald text-white font-extrabold text-xs sm:text-sm h-11 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98" title="تأكيد الطلب واستلام المبلغ ونقله إلى الأرشيف">
                    <span>✅</span>
                    <span>تم تأكيد الطلب ودفع المبلغ</span>
                </button>

                <!-- الزر الثاني: تم إلغاء الطلب -->
                <button type="button" onclick="cancelOrderAction('${orderId}')" class="bg-rose-50 hover:bg-rose-100 text-rose-800 hover:text-rose-950 border border-rose-300 font-bold text-xs sm:text-sm h-11 px-3 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98" title="إلغاء الطلب وحذفه نهائياً من القائمة">
                    <span>❌</span>
                    <span>تم إلغاء الطلب</span>
                </button>
            </div>
        `;
    } else {
        // الطلب في الأرشيف (مؤكد): إظهار تفاصيل الدفع وزر استعادة وزر طباعة
        const confirmedDate = order.confirmedAt ? formatTimestamp(order.confirmedAt) : '';
        actionsHtml = `
            <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200">
                <div class="flex items-center gap-2 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <span>✅ تم استلام المبلغ وأرشفة الطلب</span>
                    ${confirmedDate ? `<span class="text-[11px] text-emerald-600 font-medium font-mono">(${confirmedDate})</span>` : ''}
                </div>
                <div class="flex items-center gap-2">
                    <button type="button" onclick="printOrderReceipt('${orderId}')" class="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs h-9 px-3 rounded-xl border border-stone-300 transition flex items-center gap-1 cursor-pointer" title="طباعة فاتورة / ملخص الطلب">
                        <span>🖨️</span>
                        <span>طباعة إيصال</span>
                    </button>
                    <button type="button" onclick="revertOrderAction('${orderId}')" class="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs h-9 px-3 rounded-xl border border-amber-300 transition flex items-center gap-1 cursor-pointer" title="إعادة الطلب إلى قائمة المعلقة">
                        <span>↩️</span>
                        <span>إعادة للمعلق</span>
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div id="order-card-${orderId}" class="order-card bg-white/95 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border ${isConfirmed ? 'border-emerald-300 shadow-sm' : 'border-stone-200/90 shadow-md hover:shadow-lg'} transition-all duration-300 space-y-4">
            
            <!-- رأس بطاقة الطلب -->
            <div class="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-stone-200/80">
                <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-2xl ${isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'} flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        ${isConfirmed ? '✓' : '📦'}
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-black text-sm sm:text-base text-stone-900 tracking-wider">${orderId}</span>
                            ${typeBadge}
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50/80 p-3 rounded-xl border border-stone-200/70">
                <div>
                    <span class="text-stone-400 font-bold block text-[10px]">العميل / مقدم الطلب:</span>
                    <span class="font-bold text-stone-800">${escapeHtml(order.customerName || 'عميل المتجر')}</span>
                </div>
                <div>
                    <span class="text-stone-400 font-bold block text-[10px]">الملاحظات والتفاصيل:</span>
                    <span class="text-stone-700 font-medium">${escapeHtml(order.customerNotes || 'لا توجد ملاحظات إضافية')}</span>
                </div>
            </div>

            <!-- قائمة القطع المطلوبة -->
            <div class="space-y-2">
                <span class="text-[11px] font-bold text-stone-500 block">تفاصيل القطع المطلوبة (${items.length}):</span>
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                    ${itemsHtml}
                </div>
            </div>

            <!-- الإجمالي الكلي للمبلغ -->
            <div class="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-stone-100 border border-amber-200/70">
                <span class="text-xs sm:text-sm font-bold text-stone-700">المبلغ الإجمالي للطلب:</span>
                <span class="font-display font-black text-base sm:text-xl text-amber-950 font-mono">
                    ${totalPrice > 0 ? `${totalPrice.toLocaleString('ar-OM')} ر.ع.` : 'حسب التسعيرة الخاصة'}
                </span>
            </div>

            <!-- أزرار الإجراءات التفاعلية -->
            ${actionsHtml}
        </div>
    `;
}

// ==========================================
// الإجراءات التفاعلية للأزرار
// ==========================================

// 1. إجراء: تم تأكيد الطلب ودفع المبلغ
window.confirmOrderAction = async function(orderId) {
    if (!orderId) return;
    const cardEl = document.getElementById(`order-card-${orderId}`);

    const note = prompt('✨ تأكيد استلام المبلغ ونقل الطلب للأرشيف:\nيمكنك كتابة ملاحظة الدفع (اختياري، مثلاً: تحويل بنك مسقط / بطاقة):', 'تم الدفع والتحويل بنجاح');
    if (note === null) return; // تم الإلغاء من قبل المستخدم

    try {
        if (cardEl) {
            cardEl.style.opacity = '0.5';
            cardEl.style.pointerEvents = 'none';
        }

        await confirmOrderPayment(orderId, note);
        showOrderToast(`✅ تم تأكيد الطلب ${orderId} واستلام المبلغ ونقله للأرشيف بنجاح!`, 'success');
        
        // إعادة الرسم ستحدث تلقائياً عبر مراقب onSnapshot
    } catch(err) {
        console.error("Failed to confirm order:", err);
        if (cardEl) {
            cardEl.style.opacity = '1';
            cardEl.style.pointerEvents = 'auto';
        }
        alert('حدث خطأ أثناء تأكيد الطلب: ' + err.message);
    }
};

// 2. إجراء: تم إلغاء الطلب (حذف فوري من القائمة وقاعدة البيانات)
window.cancelOrderAction = async function(orderId) {
    if (!orderId) return;

    const confirmed = confirm(`⚠️ هل أنت متأكد تماماً من إلغاء وحذف الطلب (${orderId}) نهائياً من القائمة؟\nلن يمكن التراجع عن الحذف.`);
    if (!confirmed) return;

    const cardEl = document.getElementById(`order-card-${orderId}`);

    try {
        if (cardEl) {
            cardEl.style.transition = 'all 0.3s ease-out';
            cardEl.style.transform = 'scale(0.9) translateY(-10px)';
            cardEl.style.opacity = '0';
        }

        await cancelAndPermanentlyDeleteOrder(orderId);
        showOrderToast(`❌ تم إلغاء الطلب ${orderId} وحذفه نهائياً من القائمة.`, 'info');
        
        // إعادة الرسم ستحدث تلقائياً عبر مراقب onSnapshot
    } catch(err) {
        console.error("Failed to delete order:", err);
        if (cardEl) {
            cardEl.style.opacity = '1';
            cardEl.style.transform = 'none';
        }
        alert('حدث خطأ أثناء حذف الطلب: ' + err.message);
    }
};

// 3. إعادة طلب من الأرشيف للمعلق
window.revertOrderAction = async function(orderId) {
    if (!orderId) return;
    if (!confirm(`هل تود إعادة الطلب (${orderId}) من الأرشيف إلى قائمة الطلبات المعلقة؟`)) return;

    try {
        await revertOrderToPending(orderId);
        showOrderToast(`↩️ تم إعادة الطلب ${orderId} إلى قائمة الطلبات المعلقة بنجاح.`, 'info');
    } catch(err) {
        alert('حدث خطأ: ' + err.message);
    }
};

// 4. طباعة إيصال أو ملخص الطلب
window.printOrderReceipt = function(orderId) {
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
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>إيصال طلب مؤكد | دار تطريز TATRIZA - ${orderId}</title>
            <style>
                body { font-family: 'Tajawal', sans-serif; padding: 25px; color: #1c1917; direction: rtl; }
                .header { text-align: center; border-bottom: 2px solid #7c1d3c; padding-bottom: 15px; margin-bottom: 20px; }
                .badge { background: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 6px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #f5f5f4; padding: 10px; text-align: right; }
                .total { text-align: left; font-size: 18px; font-weight: bold; color: #7c1d3c; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>دار تطريز TATRIZA | إيصال مبيعات معتمد</h2>
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
            <p style="text-align: center; margin-top: 40px; color: #888; font-size: 12px;">شكراً لاختياركم دار تطريز 🏛️</p>
            <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
    `);
    printWindow.document.close();
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
// التبديل بين التبويبات (Pending vs Archive)
// ==========================================
window.switchOrdersTab = function(tabName) {
    currentTab = tabName;
    const btnPending = document.getElementById('tab-btn-pending');
    const btnArchive = document.getElementById('tab-btn-archive');

    if (tabName === 'pending') {
        if (btnPending) {
            btnPending.className = 'orders-tab-active flex-1 sm:flex-initial py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-stone-900 text-white shadow-sm transition';
        }
        if (btnArchive) {
            btnArchive.className = 'orders-tab-inactive flex-1 sm:flex-initial py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition';
        }
    } else {
        if (btnPending) {
            btnPending.className = 'orders-tab-inactive flex-1 sm:flex-initial py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition';
        }
        if (btnArchive) {
            btnArchive.className = 'orders-tab-active flex-1 sm:flex-initial py-2.5 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-emerald-700 text-white shadow-sm transition';
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

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    checkLocalSession();
    initAuthListener();
});
