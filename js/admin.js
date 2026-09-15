// ==========================================
// ملف إدارة الأمان وصلاحيات الأدمين والمنتجات (admin.js)
// ==========================================

import { showToast } from './modals.js';

export function checkAdminPermission() {
    const isAdmin = localStorage.getItem('tatr_is_admin') === 'true';
    const loginTime = localStorage.getItem('tatr_login_time');
    
    if (!isAdmin || !loginTime) return false;

    const oneHour = 60 * 60 * 1000;
    if (Date.now() - parseInt(loginTime) > oneHour) {
        localStorage.setItem('tatr_is_admin', 'false');
        localStorage.removeItem('tatr_login_time');
        return false;
    }
    return true;
}

export function initAdminShortcut() {
    window.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;
        
        if (modifier && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'ش')) {
            e.preventDefault();
            triggerAdminLogin();
        }
    });
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

    if (isAdmin) {
        modal.innerHTML = `
            <div class="bg-[#fffbf7] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-center" dir="rtl">
                <button onclick="window.closeAdminAuthModal()" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
                
                <div class="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300/60 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs text-amber-700">
                    👑
                </div>

                <h3 class="text-xl font-extrabold text-stone-900 mb-2">جلسة الإدارة نشطة</h3>
                <p class="text-xs md:text-sm text-stone-600 mb-6 leading-relaxed">
                    أنت مسجل حالياً كمسؤول في <span class="font-bold text-stone-800">TATRIZA</span> ولديك كامل الصلاحيات لإضافة وحذف وتعديل القطع في المعرض.
                </p>

                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="window.executeAdminLogout()" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-sm text-sm cursor-pointer">
                        تسجيل الخروج
                    </button>
                    <button onclick="window.closeAdminAuthModal()" class="flex-1 bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl transition text-sm cursor-pointer">
                        البقاء كمسؤول
                    </button>
                </div>
            </div>
        `;
    } else {
        modal.innerHTML = `
            <div class="bg-[#fffbf7] w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border border-stone-300 relative text-center" dir="rtl" id="admin-modal-card">
                <button onclick="window.closeAdminAuthModal()" class="absolute top-4 left-4 text-stone-400 hover:text-stone-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition">✕</button>
                
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs" style="background-color: rgba(124, 29, 60, 0.1); color: var(--brand-color);">
                    🔐
                </div>

                <h3 class="text-xl font-extrabold text-stone-900 mb-1">تسجيل دخول المسؤول</h3>
                <p class="text-xs text-stone-600 mb-6">أدخل كلمة المرور السرية للوصول لصلاحيات إدارة المعرض</p>

                <form onsubmit="window.executeAdminLogin(event)" class="space-y-4 text-right">
                    <div>
                        <label class="block text-xs font-bold text-stone-700 mb-1.5">كلمة المرور السرية</label>
                        <div class="relative">
                            <input type="password" id="admin-password-input" required placeholder="••••••••••••" class="search-input-focus w-full bg-white border border-stone-300 rounded-xl pr-4 pl-11 py-3 text-sm text-stone-900 outline-none transition duration-200">
                            <button type="button" onclick="window.toggleAdminPasswordVisibility()" class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer" title="إظهار / إخفاء">
                                <span id="toggle-pwd-icon" class="text-sm">👁️</span>
                            </button>
                        </div>
                        <p id="admin-login-error" class="hidden text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                            <span>⚠️ كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.</span>
                        </p>
                    </div>

                    <div class="pt-2 flex flex-col sm:flex-row gap-3">
                        <button type="submit" class="flex-1 bg-brand hover:bg-brand-hover text-white font-bold py-3 px-4 rounded-xl transition shadow-md text-sm cursor-pointer">
                            تأكيد الدخول
                        </button>
                        <button type="button" onclick="window.closeAdminAuthModal()" class="bg-stone-200/80 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl transition text-sm cursor-pointer">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    modal.classList.remove('hidden');

    setTimeout(() => {
        const input = document.getElementById('admin-password-input');
        if (input) input.focus();
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

    window.executeAdminLogout = function() {
        localStorage.setItem('tatr_is_admin', 'false');
        localStorage.removeItem('tatr_login_time');
        window.closeAdminAuthModal();
        showToast("تم تسجيل الخروج من وضع المسؤول بنجاح.", "info", "تسجيل الخروج", 2000);
        setTimeout(() => location.reload(), 600);
    };

    window.executeAdminLogin = function(e) {
        if (e) e.preventDefault();
        const input = document.getElementById('admin-password-input');
        const errorEl = document.getElementById('admin-login-error');
        const card = document.getElementById('admin-modal-card');
        const pass = input ? input.value : '';

        if (pass === "Tatriza@Admin2026") {
            if (errorEl) errorEl.classList.add('hidden');
            localStorage.setItem('tatr_is_admin', 'true');
            localStorage.setItem('tatr_login_time', Date.now().toString());
            window.closeAdminAuthModal();
            showToast("مرحباً بك! تم تفعيل صلاحيات الإدارة بنجاح.", "success", "وضع المسؤول", 2500);
            setTimeout(() => location.reload(), 700);
        } else {
            if (errorEl) errorEl.classList.remove('hidden');
            if (card) {
                card.classList.remove('tatr-shake');
                void card.offsetWidth;
                card.classList.add('tatr-shake');
            }
            if (input) {
                input.classList.add('border-red-500');
                input.select();
            }
            showToast("كلمة المرور السرية غير صحيحة!", "error", "خطأ في تسجيل الدخول");
        }
    };
}

let mobileTapCount = 0;
let mobileTapTimer = null;

export function handleMobileAdminTap() {
    mobileTapCount++;
    clearTimeout(mobileTapTimer);
    
    mobileTapTimer = setTimeout(() => {
        mobileTapCount = 0;
    }, 1000);

    if (mobileTapCount >= 5) {
        mobileTapCount = 0;
        triggerAdminLogin();
    }
}

export function toggleStockStatus(carpetId, allCarpets, callback) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    carpet.status = carpet.status === 'out_of_stock' ? 'available' : 'out_of_stock';
    localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
    
    if (callback) callback(allCarpets);
    showToast(carpet.status === 'out_of_stock' ? `تم تعليم "${carpet.title}" كـ غير متوفرة` : `تمت إعادة توفير "${carpet.title}" في المعرض`, 'info', 'المخزون');
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
        confirmBtn.onclick = () => {
            closeModal();
            const updatedCarpets = allCarpets.filter(c => c.id !== carpetId);
            localStorage.setItem('tatr_carpets', JSON.stringify(updatedCarpets));
            if (callback) callback(updatedCarpets);
            showToast(`تم حذف "${carpet.title}" من المعرض نهائياً`, 'info', 'إدارة المعرض');
        };
    }
}

export async function handleAddProduct(event, allCarpets, callback) {
    event.preventDefault();
    
    const fileInput = document.getElementById('new-image-files');
    let imageList = [];

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        };

        try {
            const filePromises = Array.from(fileInput.files).map(file => readFile(file));
            imageList = await Promise.all(filePromises);
        } catch (err) {
            console.error('خطأ في قراءة الصور:', err);
        }
    }

    if (imageList.length === 0) {
        imageList = [
            'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza+Carpet',
            'https://placehold.co/800x600/631730/ffffff?text=Tatriza+2'
        ];
    }

    const newCarpet = {
        id: 'carp-' + Date.now(),
        title: document.getElementById('new-title').value,
        category: document.getElementById('new-category').value,
        dimensions: document.getElementById('new-dimensions').value,
        material: document.getElementById('new-material').value,
        price: Number(document.getElementById('new-price').value),
        currency: 'ر.ع.',
        images: imageList,
        description: document.getElementById('new-desc').value,
        status: 'available'
    };

    allCarpets.unshift(newCarpet);
    localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
    
    if (callback) callback(allCarpets);
    closeAddModal();
    document.getElementById('add-product-form').reset();
    showToast(`تم نشر "${newCarpet.title}" في المعرض بنجاح!`, 'success', 'إضافة سجادة');
}

export function openAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.add('hidden');
}