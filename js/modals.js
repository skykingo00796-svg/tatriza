import { getVideoFromIndexedDB } from './firebase.js';
// ==========================================
// ملف إدارة النوافذ، السلة، والمنتجات (modals.js)
// ==========================================

export let cart = [];
try {
    const savedCart = sessionStorage.getItem('tatr_cart');
    if (savedCart) cart = JSON.parse(savedCart);
} catch(e) {}

export function updateCartBadges(shouldBounce = false) {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.innerText = cart.length;
        if (cart.length > 0) {
            cartCountEl.classList.remove('hidden');
            if (shouldBounce) {
                cartCountEl.classList.add('animate-bounce');
                setTimeout(() => cartCountEl.classList.remove('animate-bounce'), 1200);
            }
        } else {
            cartCountEl.classList.add('hidden');
        }
    }
    const drawerCartCountEl = document.getElementById('drawer-cart-count');
    if (drawerCartCountEl) {
        drawerCartCountEl.innerText = cart.length;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    updateCartBadges(false);
});

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
    window.openOptionsDrawer = openOptionsDrawer;
    window.closeOptionsDrawer = closeOptionsDrawer;
}

// ==========================================
// شريط الخيارات الجانبي الفاخر (Options Drawer)
// ==========================================
export function openOptionsDrawer() {
    const drawer = document.getElementById('options-drawer');
    if (drawer) {
        drawer.classList.remove('hidden');
        void drawer.offsetWidth;
        drawer.classList.add('drawer-active');
        document.body.style.overflow = 'hidden';
    }
}

export function closeOptionsDrawer() {
    const drawer = document.getElementById('options-drawer');
    if (drawer) {
        drawer.classList.remove('drawer-active');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!drawer.classList.contains('drawer-active')) {
                drawer.classList.add('hidden');
            }
        }, 350);
    }
}

export function openModal(carpetId, allCarpets) {
    const carpet = allCarpets.find(c => c.id === carpetId);
    if (!carpet) return;

    // وسم جديد وحصري في نافذة التفاصيل
    const modalNewBadge = document.getElementById('modal-new-badge');
    const modalNewBadgeText = document.getElementById('modal-new-badge-text');
    const isOutOfStock = carpet.status === 'out_of_stock';

    if (modalNewBadge) {
        const isNew = typeof window.isProductNew === 'function' ? window.isProductNew(carpet) : false;
        if (isNew) {
            modalNewBadge.classList.remove('hidden');
            modalNewBadge.classList.add('inline-flex');
            if (modalNewBadgeText) {
                modalNewBadgeText.innerText = isOutOfStock ? "المنتج جديد وحصري (نفدت الكمية)" : "المنتج جديد وحصري";
            }
            if (isOutOfStock) {
                modalNewBadge.classList.add('opacity-90');
            } else {
                modalNewBadge.classList.remove('opacity-90');
            }
        } else {
            modalNewBadge.classList.add('hidden');
            modalNewBadge.classList.remove('inline-flex');
        }
    }

    const modalSku = document.getElementById('modal-sku-badge');
    if (modalSku) {
        modalSku.innerText = carpet.id || '';
    }

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
        
        // 1. الشريحة الأولى: صورة الغلاف الرئيسية بخلفية بيضاء نقية وبحجم منضبط ومحكم
        modalImagesContainer.innerHTML += `
            <div class="min-w-full w-full h-full shrink-0 snap-center flex items-center justify-center overflow-hidden bg-white p-2 sm:p-3 select-none">
                <img src="${images[0]}" class="max-w-full max-h-full w-auto h-auto object-contain mx-auto block cursor-pointer bg-white" onclick="window.openLightboxFromModalExternal('${carpet.id}', 0)" alt="${carpet.title}">
            </div>
        `;

        // 2. الشريحة الثانية: الفيديو الاستعراضي الحي بخلفية بيضاء وبحجم يظهر كاملاً تماماً عمودياً وأفقياً مثل البطاقة الرئيسية
        let hasVideo = Boolean(carpet.video);
        const initialVideoSrc = (carpet.video && !carpet.video.startsWith('idb://')) ? carpet.video : '';
        if (hasVideo) {
            modalImagesContainer.innerHTML += `
                <div class="relative min-w-full w-full h-full shrink-0 snap-center bg-white flex items-center justify-center overflow-hidden select-none group/videoplayer p-2 sm:p-3" id="modal-video-slide">
                    <video 
                        id="modal-product-video" 
                        src="${initialVideoSrc}" 
                        playsinline 
                        muted 
                        loop 
                        autoplay 
                        preload="auto"
                        class="max-w-full max-h-full w-auto h-auto object-contain mx-auto block cursor-pointer bg-white"
                        onclick="window.toggleProductVideoPlay(this)"
                    ></video>
                    
                    <!-- زر الإيقاف والتشغيل العائم بالمنتصف -->
                    <div 
                        id="modal-video-center-btn" 
                        onclick="window.toggleProductVideoPlay(document.getElementById('modal-product-video'))" 
                        class="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 opacity-0"
                    >
                        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white flex items-center justify-center text-xl sm:text-2xl shadow-2xl transform transition hover:scale-110 pointer-events-auto cursor-pointer" id="modal-video-center-icon">
                            ▶
                        </div>
                    </div>
                </div>
            `;
        }

        // 3. باقي الصور إن وجدت بخلفية بيضاء نقية
        for (let i = 1; i < images.length; i++) {
            modalImagesContainer.innerHTML += `
                <div class="min-w-full w-full h-full shrink-0 snap-center flex items-center justify-center overflow-hidden bg-white p-2 sm:p-3 select-none">
                    <img src="${images[i]}" class="max-w-full max-h-full w-auto h-auto object-contain mx-auto block cursor-pointer bg-white" onclick="window.openLightboxFromModalExternal('${carpet.id}', ${i})" alt="${carpet.title}">
                </div>
            `;
        }

        // إلزام فيديو التفاصيل بحالة كتم الصوت دائماً وتلقائياً لراحة العميل
        const initialModalVid = document.getElementById('modal-product-video');
        if (initialModalVid) {
            initialModalVid.muted = true;
            initialModalVid.defaultMuted = true;
            initialModalVid.setAttribute('muted', '');
        }

        if (hasVideo && carpet.video && carpet.video.startsWith('idb://')) {
            getVideoFromIndexedDB(carpet.id).then(blobUrl => {
                if (blobUrl) {
                    const videoEl = document.getElementById('modal-product-video');
                    if (videoEl) {
                        videoEl.muted = true;
                        videoEl.defaultMuted = true;
                        videoEl.setAttribute('muted', '');
                        videoEl.src = blobUrl;
                        videoEl.load();
                        videoEl.play().catch(() => {});
                    }
                }
            });
        }

        const totalMediaItems = images.length + (hasVideo ? 1 : 0);
        const counterEl = document.getElementById('modal-counter');
        const totalEl = document.getElementById('modal-total');
        if (counterEl) counterEl.innerText = '1';
        if (totalEl) totalEl.innerText = totalMediaItems;
        if (counterWrapper) {
            counterWrapper.style.display = totalMediaItems > 1 ? 'block' : 'none';
        }

        // إعداد شارة الفيديو وأزرار التحكم العلوية (كتم الصوت والتكبير)
        const videoTopControls = document.getElementById('modal-video-top-controls');
        const videoBadge = document.getElementById('modal-video-badge');
        const videoBadgeText = document.getElementById('modal-video-badge-text');

        if (videoBadgeText) {
            videoBadgeText.innerText = carpet.videoDuration ? `استعراض حي (${carpet.videoDuration}ث)` : 'استعراض حي';
        }

        // إخفاء عناصر التحكم بالفيديو في البداية إن كان العرض يبدأ بصورة
        if (videoTopControls) {
            videoTopControls.classList.add('hidden');
            videoTopControls.classList.remove('flex');
        }
        if (videoBadge) {
            videoBadge.classList.add('hidden');
        }

        // إذا كان المنتج لا يحتوي على صور ويبدأ بالفيديو مباشرة، نظهر الأزرار والشارة فوراً
        if (hasVideo && (!carpet.images || carpet.images.length === 0)) {
            if (videoTopControls) {
                videoTopControls.classList.remove('hidden');
                videoTopControls.classList.add('flex');
            }
            if (videoBadge) {
                videoBadge.classList.remove('hidden');
            }
        }

        // عرض شريط إدارة الصور للمسؤول لتحديد الصورة الرئيسية
        const adminBar = document.getElementById('admin-image-manager-bar');
        const adminThumbs = document.getElementById('admin-modal-thumbnails');
        const isAdmin = typeof window.checkAdminPermission === 'function' ? window.checkAdminPermission() : false;

        if (adminBar && adminThumbs) {
            if (isAdmin) {
                adminBar.classList.remove('hidden');
                adminThumbs.innerHTML = '';
                
                const modalEditBtn = document.getElementById('admin-modal-edit-btn');
                if (modalEditBtn) {
                    modalEditBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (typeof window.openEditModal === 'function') {
                            window.openEditModal(carpet.id);
                        }
                    };
                }
                images.forEach((img, index) => {
                    const isPrimary = index === 0;
                    const thumbCard = document.createElement('div');
                    
                    if (isPrimary) {
                        thumbCard.className = "admin-primary-card cursor-default overflow-hidden ring-2 sm:ring-4 ring-amber-400/40";
                        thumbCard.title = "هذه هي الصورة الرئيسية الحالية (الغلاف الأول المعروض للزوار)";
                        thumbCard.innerHTML = `
                            <div class="admin-thumb-box bg-stone-100">
                                <img src="${img}" class="brightness-105 contrast-105 pointer-events-none" alt="غلاف رئيسي">
                                <span class="absolute inset-x-0 bottom-0 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-stone-950 font-black text-[8px] sm:text-[9px] text-center py-0.5 sm:py-1 shadow-md border-t border-amber-300/40 tracking-wider">
                                    ⭐ الرئيسية
                                </span>
                                <span class="absolute top-1 right-1 bg-amber-400 text-stone-950 font-black text-[8px] sm:text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                                    👑
                                </span>
                            </div>
                        `;
                    } else {
                        thumbCard.className = "admin-secondary-card cursor-pointer overflow-hidden opacity-85 hover:opacity-100 group";
                        thumbCard.title = "انقر لجعل هذه الصورة هي الغلاف الرئيسي في المعرض";
                        thumbCard.innerHTML = `
                            <div class="admin-thumb-box bg-stone-100">
                                <img src="${img}" class="pointer-events-none" alt="صورة إضافية">
                                <span class="absolute top-1 right-1 bg-black/65 text-white font-bold text-[8px] sm:text-[9px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow">
                                    ${index + 1}
                                </span>
                                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-all duration-200">
                                    <span class="text-[8px] sm:text-[9px] font-bold text-white bg-amber-600 hover:bg-amber-500 px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                                        تعيين كغلاف ⭐
                                    </span>
                                </div>
                            </div>
                        `;

                        thumbCard.onclick = () => {
                            if (typeof window.setCarpetPrimaryImage === 'function') {
                                window.setCarpetPrimaryImage(carpet.id, index);
                            }
                        };
                    }

                    adminThumbs.appendChild(thumbCard);
                });
            } else {
                adminBar.classList.add('hidden');
            }
        }
    }

    const addBtn = document.getElementById('modal-add-btn');

    if (addBtn) {
        const carpetImageThumb = (carpet.images && carpet.images.length > 0) ? carpet.images[0] : (carpet.image || '');
        if (isOutOfStock) {
            addBtn.innerHTML = `<span>طلب نفس التصميم</span><span class="text-xs shrink-0">🔄</span>`;
            addBtn.className = "btn-liquid-metal font-display text-white font-bold px-5 sm:px-6 py-3 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md flex-1";
            addBtn.onclick = () => {
                addToCart(carpet.id, carpet.title, carpet.price, carpet.dimensions, "طلب إعادة تفصيل نفس التصميم", carpetImageThumb);
                closeModal();
            };
        } else {
            addBtn.innerHTML = `<span>إضافة للسلة</span><span class="text-xs shrink-0">🛍️</span>`;
            addBtn.className = "btn-liquid-metal font-display text-white font-bold px-6 sm:px-7 py-3 rounded-2xl transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md flex-1";
            addBtn.onclick = () => {
                addToCart(carpet.id, carpet.title, carpet.price, carpet.dimensions, '', carpetImageThumb);
                closeModal();
            };
        }

        // إعداد زر الاستفسار السريع عبر الواتساب للمنتج
        const whatsappBtn = document.getElementById('modal-whatsapp-inquire-btn');
        if (whatsappBtn) {
            whatsappBtn.onclick = () => {
                const msg = encodeURIComponent(`مرحباً دار تطريز TATRIZA 🌸\nأود الاستفسار عن القطعة:\n- الاسم: ${carpet.title}\n- الرمز: ${carpet.id}\n- الأبعاد: ${carpet.dimensions}\n- السعر: ${carpet.price} ر.ع.\nهل هي متوفرة للتسليم؟`);
                window.open(`https://wa.me/96890000000?text=${msg}`, '_blank');
            };
        }
    }

    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
    const videoEl = document.getElementById('modal-product-video');
    if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.muted = true;
        videoEl.defaultMuted = true;
        videoEl.setAttribute('muted', '');
    }
    const audioBtn = document.getElementById('modal-video-audio-btn');
    if (audioBtn) {
        const icon = audioBtn.querySelector('.audio-icon');
        if (icon) icon.innerText = '🔇';
        audioBtn.setAttribute('title', 'تشغيل الصوت');
    }
    const videoTopControls = document.getElementById('modal-video-top-controls');
    if (videoTopControls) {
        videoTopControls.classList.add('hidden');
        videoTopControls.classList.remove('flex');
    }
    const videoBadge = document.getElementById('modal-video-badge');
    if (videoBadge) {
        videoBadge.classList.add('hidden');
    }
}

export function handleModalScroll(container) {
    if (!container) return;
    const scrollLeft = Math.abs(container.scrollLeft);
    const width = container.clientWidth || 1;
    const activeIndex = Math.round(scrollLeft / width);
    const counterSpan = document.getElementById('modal-counter');
    if (counterSpan) {
        counterSpan.innerText = activeIndex + 1;
    }

    // إيقاف وتشغيل الفيديو بذكاء وإظهار أزرار كتم الصوت والتكبير والشارة فقط عند شريحة الفيديو
    const videoSlide = document.getElementById('modal-video-slide');
    const videoEl = document.getElementById('modal-product-video');
    const videoTopControls = document.getElementById('modal-video-top-controls');
    const videoBadge = document.getElementById('modal-video-badge');

    if (videoSlide && videoEl) {
        const slideRect = videoSlide.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // فحص دقيق: شريحة الفيديو معروضة أمام المستخدم بالكامل تقريباً
        const isVideoActive = Math.abs(slideRect.left - containerRect.left) < (width * 0.45);

        if (isVideoActive) {
            if (videoEl.paused) {
                videoEl.play().catch(() => {});
            }
            // إظهار زري كتم الصوت وتكبير الفيديو في الأعلى يمين مقابل زر الإغلاق
            if (videoTopControls) {
                videoTopControls.classList.remove('hidden');
                videoTopControls.classList.add('flex');
            }
            // إظهار شارة استعراض حي في الأسفل يسار مقابل الترقيم
            if (videoBadge) {
                videoBadge.classList.remove('hidden');
            }
        } else {
            if (!videoEl.paused) {
                videoEl.pause();
            }
            // كتم الصوت تلقائياً عند الابتعاد عن شريحة الفيديو
            videoEl.muted = true;
            videoEl.defaultMuted = true;
            videoEl.setAttribute('muted', '');
            const audioBtn = document.getElementById('modal-video-audio-btn');
            if (audioBtn) {
                const icon = audioBtn.querySelector('.audio-icon');
                if (icon) icon.innerText = '🔇';
                audioBtn.setAttribute('title', 'تشغيل الصوت');
            }
            // إخفاء عناصر التحكم بالفيديو والشارة عند تصفح الصور العادية لحفظ راحة العميل
            if (videoTopControls) {
                videoTopControls.classList.add('hidden');
                videoTopControls.classList.remove('flex');
            }
            if (videoBadge) {
                videoBadge.classList.add('hidden');
            }
        }
    } else {
        if (videoTopControls) {
            videoTopControls.classList.add('hidden');
            videoTopControls.classList.remove('flex');
        }
        if (videoBadge) {
            videoBadge.classList.add('hidden');
        }
    }
}

// ==========================================
// التحكم التفاعلي بالفيديو وتكبيره داخل حدود المتصفح (In-Browser Video Lightbox)
// ==========================================
window.toggleModalVideoFullscreen = () => {
    const videoEl = document.getElementById('modal-product-video');
    if (!videoEl || !videoEl.src) return;

    // إيقاف وكتم الفيديو في نافذة التفاصيل مؤقتاً
    videoEl.pause();
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.setAttribute('muted', '');
    const audioBtn = document.getElementById('modal-video-audio-btn');
    if (audioBtn) {
        const icon = audioBtn.querySelector('.audio-icon');
        if (icon) icon.innerText = '🔇';
        audioBtn.setAttribute('title', 'تشغيل الصوت');
    }

    // فتح نافذة تكبير الفيديو على مستوى المتصفح (مكتومة الصوت دائماً)
    const titleEl = document.getElementById('modal-title');
    const title = titleEl ? titleEl.innerText : 'فيديو استعراضي';
    window.openVideoLightbox(videoEl.src, title);
};

window.openVideoLightbox = (videoSrc, title = 'فيديو استعراضي') => {
    if (!videoSrc) return;
    const modal = document.getElementById('video-lightbox-modal');
    const player = document.getElementById('lightbox-video-player');
    const titleEl = document.getElementById('lightbox-video-title');
    const audioBtn = document.getElementById('lightbox-video-audio-btn');

    if (modal && player) {
        // نلزم المشغل بحالة الكتم التام قبل تعيين المصدر لمنع أي تسرب للصوت
        player.pause();
        player.muted = true;
        player.defaultMuted = true;
        player.setAttribute('muted', '');
        
        player.src = videoSrc;
        player.currentTime = 0;
        player.load();

        // تأكيد مضاعف لكتم الصوت في المشغل لضمان بقائه مكتوماً عند التشغيل
        player.muted = true;
        player.defaultMuted = true;

        if (titleEl) titleEl.innerText = `🎬 ${title}`;
        if (audioBtn) {
            const icon = audioBtn.querySelector('.lightbox-audio-icon');
            if (icon) icon.innerText = '🔇';
            audioBtn.setAttribute('title', 'تشغيل الصوت');
        }
        modal.classList.remove('hidden');
        player.play().catch(() => {});
    }
};

window.closeVideoLightbox = () => {
    const modal = document.getElementById('video-lightbox-modal');
    const player = document.getElementById('lightbox-video-player');
    if (player) {
        player.pause();
        player.muted = true;
        player.defaultMuted = true;
        player.setAttribute('muted', '');
        player.removeAttribute('src');
        player.load();
    }
    const audioBtn = document.getElementById('lightbox-video-audio-btn');
    if (audioBtn) {
        const icon = audioBtn.querySelector('.lightbox-audio-icon');
        if (icon) icon.innerText = '🔇';
        audioBtn.setAttribute('title', 'تشغيل الصوت');
    }
    if (modal) modal.classList.add('hidden');
};

window.toggleLightboxVideoPlay = () => {
    const player = document.getElementById('lightbox-video-player');
    if (!player) return;

    const centerBtn = document.getElementById('lightbox-video-center-btn');
    const centerIcon = document.getElementById('lightbox-video-center-icon');

    if (player.paused) {
        player.play().catch(() => {});
        if (centerIcon) centerIcon.innerText = '▶';
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0');
            centerBtn.classList.add('opacity-100');
            setTimeout(() => {
                centerBtn.classList.remove('opacity-100');
                centerBtn.classList.add('opacity-0');
            }, 350);
        }
    } else {
        player.pause();
        if (centerIcon) centerIcon.innerText = '⏸';
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0');
            centerBtn.classList.add('opacity-100');
        }
    }
};

window.toggleLightboxVideoAudio = (btnEl) => {
    const player = document.getElementById('lightbox-video-player');
    if (!player) return;

    player.muted = !player.muted;
    const isMuted = player.muted;
    const btn = btnEl || document.getElementById('lightbox-video-audio-btn');
    if (btn) {
        const icon = btn.querySelector('.lightbox-audio-icon');
        if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
        btn.setAttribute('title', isMuted ? 'تشغيل الصوت' : 'كتم الصوت');
    }
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeVideoLightbox();
    }
});

window.toggleProductVideoPlay = (videoEl) => {
    if (!videoEl) videoEl = document.getElementById('modal-product-video');
    if (!videoEl) return;

    const centerBtn = document.getElementById('modal-video-center-btn');
    const centerIcon = document.getElementById('modal-video-center-icon');

    if (videoEl.paused) {
        videoEl.play().catch(() => {});
        if (centerIcon) centerIcon.innerText = '▶';
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0');
            centerBtn.classList.add('opacity-100');
            setTimeout(() => {
                centerBtn.classList.remove('opacity-100');
                centerBtn.classList.add('opacity-0');
            }, 450);
        }
    } else {
        videoEl.pause();
        if (centerIcon) centerIcon.innerText = '⏸';
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0');
            centerBtn.classList.add('opacity-100');
        }
    }
};

window.toggleProductVideoAudio = (btnEl) => {
    const videoEl = document.getElementById('modal-product-video');
    if (!videoEl) return;

    videoEl.muted = !videoEl.muted;
    const isMuted = videoEl.muted;

    const btn = btnEl || document.getElementById('modal-video-audio-btn');
    if (btn) {
        const iconSpan = btn.querySelector('.audio-icon');
        if (iconSpan) iconSpan.innerText = isMuted ? '🔇' : '🔊';
        btn.setAttribute('title', isMuted ? 'تشغيل الصوت' : 'كتم الصوت');
    }
};

// ==========================================
// إدارة سلة المشتريات
// ==========================================
export function addToCart(id, title, price, dimensions, note = '', image = '') {
    cart.push({
        id: id,
        title: title,
        price: Number(price),
        dimensions: dimensions,
        note: note,
        image: image
    });
    
    try {
        sessionStorage.setItem('tatr_cart', JSON.stringify(cart));
    } catch(e) {}
    updateCartBadges(true);
    
    const toastMsg = note ? `تمت إضافة "${title}" (${note}) إلى السلة بنجاح!` : `تمت إضافة "${title}" إلى السلة بنجاح!`;
    showToast(toastMsg, 'success', 'سلة المشتريات');
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
            <div class="text-center py-12 px-4">
                <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-3xl shadow-xs">
                    🛍️
                </div>
                <h5 class="font-display font-black text-stone-800 text-base mb-1">سلة المشتريات فارغة حالياً</h5>
                <p class="text-xs text-stone-500 max-w-xs mx-auto">تفضل بتصفح المعرض واختيار ما يناسب ذوقك من التحف الفنية الفريدة</p>
            </div>
        `;
        if (totalAmountEl) totalAmountEl.innerText = '0';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const itemImg = item.image || '../images/logo.jpg';
        container.innerHTML += `
            <div class="lux-cart-item flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-2xs">
                        <img src="${itemImg}" alt="${item.title}" class="w-full h-full object-cover">
                    </div>
                    <div class="min-w-0">
                        <h5 class="font-display font-black text-stone-900 text-xs sm:text-sm truncate">${item.title}</h5>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[11px] text-stone-500 font-medium">الأبعاد: ${item.dimensions}</span>
                            ${item.note ? `<span class="text-[9px] font-black text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-300/60">${item.note}</span>` : ''}
                        </div>
                        <div class="flex items-center gap-1 mt-1">
                            <span class="font-display font-black text-brand text-xs sm:text-sm">${item.price}</span>
                            <span class="text-brand text-[10px] font-bold">ر.ع.</span>
                        </div>
                    </div>
                </div>
                <button onclick="window.removeFromCartGlobal(${index})" class="lux-delete-btn shrink-0" title="حذف القطعة من السلة">
                    <span>حذف</span>
                    <span class="text-xs">🗑️</span>
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
    try {
        sessionStorage.setItem('tatr_cart', JSON.stringify(cart));
    } catch(e) {}
    updateCartBadges(true);
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
        message += `▫️ *[${idx + 1}] ${item.title}* ${item.id ? `(${item.id})` : ''}\n`;
        message += `   📐 الأبعاد: ${item.dimensions}\n`;
        if (item.note) {
            message += `   ✨ نوع الطلب: *${item.note}*\n`;
        }
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