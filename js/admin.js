// ==========================================
// ملف إدارة الأمان وصلاحيات الأدمين والمنتجات (admin.js)
// ==========================================

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
    const isAdmin = checkAdminPermission();
    if (isAdmin) {
        if (confirm("أنت مسجل كأدمين بالفعل. هل تريد تسجيل الخروج؟")) {
            localStorage.setItem('tatr_is_admin', 'false');
            localStorage.removeItem('tatr_login_time');
            alert("تم تسجيل الخروج من وضع المسؤول.");
            location.reload();
        }
    } else {
        const pass = prompt("أدخل كلمة مرور المسؤول السرية:");
        if (pass === "Tatriza@Admin2026") {
            localStorage.setItem('tatr_is_admin', 'true');
            localStorage.setItem('tatr_login_time', Date.now().toString());
            alert("مرحباً بك أدمين! تم تفعيل صلاحيات الإدارة بنجاح.");
            location.reload();
        } else if (pass !== null) {
            alert("كلمة المرور غير صحيحة!");
        }
    }
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
}

export function deleteCarpet(carpetId, allCarpets, callback) {
    if (!confirm("هل أنت متأكد من حذف هذه القطعة نهائياً من المعرض؟")) return;

    const updatedCarpets = allCarpets.filter(c => c.id !== carpetId);
    localStorage.setItem('tatr_carpets', JSON.stringify(updatedCarpets));
    
    if (callback) callback(updatedCarpets);
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
}

export function openAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeAddModal() {
    const modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.add('hidden');
}