// ==========================================
// ملف إدارة النوافذ، السلة، والمنتجات (modals.js)
// ==========================================

export let cart = [];

// ==========================================
// نظام الإشعارات الفاخرة (Luxury Toast Notifications)
// ==========================================
export function showToast(message, type = 'success', title = '', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `tatr-toast toast-${type}`;

    let iconSvg = '';
    let defaultTitle = title;

    if (type === 'success') {
        defaultTitle = defaultTitle || 'تمت العملية بنجاح';
        iconSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`;
    } else if (type === 'warning') {
        defaultTitle = defaultTitle || 'تنبيه';
        iconSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else if (type === 'error') {
        defaultTitle = defaultTitle || 'خطأ';
        iconSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>`;
    } else {
        defaultTitle = defaultTitle || 'معلومة';
        iconSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    toast.innerHTML = `
        <div class="tatr-toast-icon-wrapper">
            ${iconSvg}
        </div>
        <div class="tatr-toast-body">
            <span class="tatr-toast-title">${defaultTitle}</span>
            <span class="tatr-toast-msg">${message}</span>
        </div>
        <button class="tatr-toast-close" title="إغلاق">✕</button>
        <div class="tatr-toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    const closeBtn = toast.querySelector('.tatr-toast-close');
    let isRemoved = false;
    const removeToast = () => {
        if (isRemoved) return;
        isRemoved = true;
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };

    closeBtn.addEventListener('click', removeToast);
    container.appendChild(toast);

    setTimeout(removeToast, duration);
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
}

export function openModal(carpetId, allCarpets) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    document.getElementById('modal-title').innerText = carpet.title;
    document.getElementById('modal-desc').innerText = carpet.description || '';
    document.getElementById('modal-dim').innerText = carpet.dimensions;
    document.getElementById('modal-mat').innerText = carpet.material;
    document.getElementById('modal-price').innerText = carpet.price;

    const modalImagesContainer = document.getElementById('modal-images-container');
    const counterWrapper = document.getElementById('modal-counter-wrapper');
    
    if (modalImagesContainer) {
        const images = carpet.images && carpet.images.length > 0 ? carpet.images : [carpet.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
        modalImagesContainer.innerHTML = '';
        
        images.forEach((img, index) => {
            modalImagesContainer.innerHTML += `
                <img src="${img}" class="w-full h-full object-cover shrink-0 snap-center cursor-pointer" onclick="window.openLightboxFromModalExternal('${carpet.id}', ${index})" alt="${carpet.title}">
            `;
        });

        document.getElementById('modal-counter').innerText = '1';
        document.getElementById('modal-total').innerText = images.length;
        if (counterWrapper) {
            counterWrapper.style.display = images.length > 1 ? 'block' : 'none';
        }
    }

    const addBtn = document.getElementById('modal-add-btn');
    const isOutOfStock = carpet.status === 'out_of_stock';

    if (addBtn) {
        if (isOutOfStock) {
            addBtn.innerText = "طلب تفصيل خاص";
            addBtn.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-sm text-sm flex items-center gap-1.5";
            addBtn.onclick = () => {
                const message = encodeURIComponent(`مرحباً دار تطريز، أنا مهتم بطلب تفصيل خاص أو إعادة إنتاج هذه القطعة غير المتوفرة: "${carpet.title}"`);
                window.open(`https://wa.me/?text=${message}`, '_blank');
            };
        } else {
            addBtn.innerText = "إضافة للسلة";
            addBtn.className = "bg-brand hover:bg-brand-hover text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm text-sm";
            addBtn.onclick = () => {
                addToCart(carpet.id, carpet.title, carpet.price, carpet.dimensions);
                closeModal();
            };
        }
    }

    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
}

export function handleModalScroll(container) {
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const activeIndex = Math.round(scrollLeft / width);
    const counterSpan = document.getElementById('modal-counter');
    if (counterSpan) {
        counterSpan.innerText = activeIndex + 1;
    }
}

// ==========================================
// إدارة سلة المشتريات
// ==========================================
export function addToCart(id, title, price, dimensions) {
    cart.push({
        id: id,
        title: title,
        price: Number(price),
        dimensions: dimensions
    });
    
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.innerText = cart.length;
    
    showToast(`تمت إضافة "${title}" إلى السلة بنجاح!`, 'success', 'سلة المشتريات');
}

export function openCartModal() {
    updateCartDisplay();
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.add('hidden');
}

export function updateCartDisplay() {
    const container = document.getElementById('cart-items-container');
    const totalAmountEl = document.getElementById('cart-total-amount');
    
    if (!container) return;

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-stone-500">
                <p class="text-sm font-semibold">سلة المشتريات فارغة حالياً</p>
            </div>
        `;
        if (totalAmountEl) totalAmountEl.innerText = '0';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="flex items-center justify-between pt-3 first:pt-0">
                <div>
                    <h5 class="font-bold text-stone-900 text-sm">${item.title}</h5>
                    <p class="text-xs text-stone-500 mt-0.5">الأبعاد: ${item.dimensions}</p>
                    <span class="text-brand font-black text-xs mt-1 block">${item.price} ر.ع.</span>
                </div>
                <button onclick="window.removeFromCartGlobal(${index})" class="text-red-500 hover:text-red-700 text-xs font-bold p-2 bg-red-50 rounded-xl transition" title="حذف من السلة">
                    🗑️ حذف
                </button>
            </div>
        `;
    });

    if (totalAmountEl) {
        totalAmountEl.innerText = total;
    }
}

export function removeFromCart(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.innerText = cart.length;
    updateCartDisplay();
    if (removedItem) {
        showToast(`تم حذف "${removedItem.title}" من السلة`, 'info', 'سلة المشتريات', 2500);
    }
}

export function sendCartToWhatsApp() {
    if (cart.length === 0) {
        showToast("سلتك فارغة حالياً، تفضل بإضافة بعض القطع أولاً للمتابعة.", "warning", "السلة فارغة");
        return;
    }

    let message = `🏛️ *طلب شراء جديد - دار تطريز (Tatriza)*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `🛍️ *قائمة القطع المطلوبة:*\n\n`;

    let total = 0;
    cart.forEach((item, idx) => {
        message += `▫️ *[${idx + 1}] ${item.title}*\n`;
        message += `   📐 الأبعاد: ${item.dimensions}\n`;
        message += `   💵 السعر: *${item.price} ر.ع.*\n\n`;
        total += item.price;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *الإجمالي الكلي:* *${total} ر.ع.*\n\n`;
    message += `✨ _أرجو تأكيد الطلب وترتيب تفاصيل الدفع والتوصيل. شكراً لخدمتكم الراسخة!_`;

    const encodedMessage = encodeURIComponent(message);
    const adminPhone = "96890000000";
    window.open(`https://wa.me/${adminPhone}?text=${encodedMessage}`, '_blank');
}

// ==========================================
// إدارة نافذة الطلب الخاص
// ==========================================
export function openCustomOrderModal() {
    const modal = document.getElementById('custom-order-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeCustomOrderModal() {
    const modal = document.getElementById('custom-order-modal');
    if (modal) modal.classList.add('hidden');
}

export function submitCustomOrder(event) {
    event.preventDefault();
    const name = document.getElementById('cust-name').value;
    const length = document.getElementById('cust-length').value;
    const width = document.getElementById('cust-width').value;
    const notes = document.getElementById('cust-notes').value;

    const message = encodeURIComponent(
        `🎨 *طلب تفصيل تصميم خاص - دار تطريز*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 *اسم العميل:* ${name}\n` +
        `📐 *الأبعاد المطلوبة:* الطول ${length} × العرض ${width}\n\n` +
        `📝 *تفاصيل وملاحظات التصميم:*\n` +
        `> ${notes}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `✨ _سأقوم بإرسال صورة أو نموذج التصميم المطلوب في هذه المحادثة الآن._`
    );

    const adminPhone = "96890000000";
    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
    closeCustomOrderModal();
    
    document.querySelector('#custom-order-modal form').reset();
}

// ==========================================
// معرض الصور (Lightbox)
// ==========================================
export function openLightboxFromModal(carpetId, initialIndex = 0, allCarpets) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;
    
    const images = carpet.images && carpet.images.length > 0 ? carpet.images : [carpet.image];
    const lbContainer = document.getElementById('lightbox-container');
    if (!lbContainer) return;
    
    lbContainer.innerHTML = '';
    
    images.forEach(img => {
        lbContainer.innerHTML += `
            <div class="min-w-full w-full h-full flex items-center justify-center shrink-0 snap-center p-4 md:p-12">
                <img src="${img}" class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl">
            </div>
        `;
    });

    document.getElementById('lightbox-total').innerText = images.length;
    document.getElementById('lightbox-counter').innerText = initialIndex + 1;

    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) lightbox.classList.remove('hidden');

    setTimeout(() => {
        lbContainer.scrollTo({
            left: lbContainer.clientWidth * initialIndex,
            behavior: 'instant'
        });
    }, 50);
}

export function openCurrentLogoLightbox(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const currentLogo = localStorage.getItem('tatr_logo') || '../images/logo.jpg';
    const lbContainer = document.getElementById('lightbox-container');
    if (!lbContainer) return;
    
    lbContainer.innerHTML = `
        <div class="min-w-full w-full h-full flex items-center justify-center shrink-0 snap-center p-4 md:p-12">
            <img src="${currentLogo}" class="max-w-full max-h-full object-contain rounded-3xl shadow-2xl">
        </div>
    `;

    const counterWrapper = document.querySelector('#lightbox-modal .absolute.bottom-6');
    if (counterWrapper) {
        counterWrapper.style.display = 'none';
    }

    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) lightbox.classList.remove('hidden');
}

export function closeLightbox() {
    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) lightbox.classList.add('hidden');
    const counterWrapper = document.querySelector('#lightbox-modal .absolute.bottom-6');
    if (counterWrapper) {
        counterWrapper.style.display = 'block';
    }
}

export function handleLightboxScroll(container) {
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const activeIndex = Math.round(scrollLeft / width);
    const counterSpan = document.getElementById('lightbox-counter');
    if (counterSpan) {
        counterSpan.innerText = activeIndex + 1;
    }
}