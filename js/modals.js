import { getVideoFromIndexedDB } from './firebase-public.js';
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
// نافذة تقدم معالجة الفيديو الحصرية (Single Video Progress HUD)
// تضمن ظهور إشعار واحد فقط لا يتكرر أبداً وتتصاعد نسبته من 0% حتى 100%
// ==========================================
let _videoProgressToastEl = null;
let _videoProgressTimeout = null;

export function showVideoProgressToast(percent, message = '', isDone = false) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    window._isVideoProgressActive = !isDone;

    const safePercent = Math.min(100, Math.max(0, Math.round(Number(percent) || 0)));
    const defaultMsg = message || (isDone ? 'تم اكتمال معالجة وحفظ الفيديو بنجاح!' : 'جاري معالجة وتشفير الفيديو...');

    // مسح أي إشعارات سابقة أخرى لتنظيف الشاشة وحصر التركيز في هذا الإشعار الفردي
    const otherToasts = container.querySelectorAll('.tatr-toast:not([data-toast-id="cinema-video-progress"])');
    otherToasts.forEach(t => {
        try { container.removeChild(t); } catch (e) {}
    });

    if (!_videoProgressToastEl || !container.contains(_videoProgressToastEl)) {
        _videoProgressToastEl = document.createElement('div');
        _videoProgressToastEl.setAttribute('data-toast-id', 'cinema-video-progress');
        _videoProgressToastEl.className = 'tatr-toast toast-info';
        container.appendChild(_videoProgressToastEl);
    }

    if (isDone || safePercent >= 100) {
        _videoProgressToastEl.className = 'tatr-toast toast-success';
    } else {
        _videoProgressToastEl.className = 'tatr-toast toast-info';
    }

    const iconSvg = (isDone || safePercent >= 100) 
        ? `<svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`
        : `<svg class="w-5 h-5 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

    const titleText = (isDone || safePercent >= 100) ? 'اكتملت معالجة الفيديو' : 'معالجة وتجهيز الفيديو';

    _videoProgressToastEl.innerHTML = `
        <div class="tatr-toast-icon-wrapper">
            ${iconSvg}
        </div>
        <div class="tatr-toast-body flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
                <span class="tatr-toast-title font-bold">${titleText}</span>
                <span class="font-number font-black text-xs px-2 py-0.5 rounded-full ${isDone || safePercent >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${safePercent}%</span>
            </div>
            <span class="tatr-toast-msg block text-xs mt-0.5 text-stone-600 truncate">${defaultMsg}</span>
            <div class="w-full bg-stone-200/80 rounded-full h-2 mt-2 overflow-hidden">
                <div class="tatr-toast-live-bar ${isDone || safePercent >= 100 ? 'bg-emerald-500' : 'bg-amber-500'} h-full transition-all duration-200 rounded-full" style="width: ${safePercent}%;"></div>
            </div>
        </div>
        <button class="tatr-toast-close" title="إغلاق">✕</button>
    `;

    const closeBtn = _videoProgressToastEl.querySelector('.tatr-toast-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            window._isVideoProgressActive = false;
            if (_videoProgressToastEl && _videoProgressToastEl.parentNode) {
                _videoProgressToastEl.parentNode.removeChild(_videoProgressToastEl);
            }
            _videoProgressToastEl = null;
        };
    }

    if (_videoProgressTimeout) {
        clearTimeout(_videoProgressTimeout);
    }

    if (isDone || safePercent >= 100) {
        _videoProgressTimeout = setTimeout(() => {
            window._isVideoProgressActive = false;
            if (_videoProgressToastEl) {
                _videoProgressToastEl.classList.add('toast-hiding');
                setTimeout(() => {
                    if (_videoProgressToastEl && _videoProgressToastEl.parentNode) {
                        _videoProgressToastEl.parentNode.removeChild(_videoProgressToastEl);
                    }
                    _videoProgressToastEl = null;
                }, 300);
            }
        }, 1800);
    }
}

// ==========================================
// نظام الإشعارات الفاخرة المحدث (Luxury Toast Notifications)
// ==========================================
export function showToast(message, type = 'success', title = '', duration = 3500, toastId = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // إذا كان تنبيه تقدم الفيديو نشطاً في الشاشة، نحجب أي إشعارات ثانوية أخرى حتى لا تتكدس إطلاقاً
    if (window._isVideoProgressActive && !toastId) {
        return;
    }

    // التعرف التلقائي على إشعارات رفع ومعالجة الفيديو وتوجيهها حصرياً لمؤشر التقدم الفردي
    const isVideoProgress = toastId === 'cinema-video-progress' || 
                            toastId === 'carpet-video-progress' || 
                            (title && (title.includes('معالجة الفيديو') || title.includes('حفظ الفيديو'))) ||
                            (message && (message.includes('رفع الفيديو') || message.includes('معالجة الفيديو')));

    if (isVideoProgress) {
        const percentMatch = message ? message.match(/(\d{1,3})%/) : null;
        const progressPercent = percentMatch ? parseInt(percentMatch[1], 10) : (type === 'success' ? 100 : 0);
        const isDone = type === 'success' || (progressPercent >= 100);
        showVideoProgressToast(progressPercent, message, isDone);
        return;
    }

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

    // التأكد من عدم تجاوز سقف الإشعارات (حد أقصى إشعارين عاديين) لمنع أي تراكم
    while (container.children.length >= 2) {
        const oldest = container.firstElementChild;
        if (oldest && oldest._removeFn) {
            oldest._removeFn();
        } else if (oldest) {
            container.removeChild(oldest);
        } else {
            break;
        }
    }

    const toast = document.createElement('div');
    toast.className = `tatr-toast toast-${type}`;
    if (toastId) {
        toast.setAttribute('data-toast-id', toastId);
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

    toast._removeFn = removeToast;
    closeBtn.addEventListener('click', removeToast);
    container.appendChild(toast);

    toast._removeTimeout = setTimeout(removeToast, duration);
}

if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showVideoProgressToast = showVideoProgressToast;
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

    const modal = document.getElementById('product-modal');
    if (!modal) return;

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

        modal.classList.remove('hidden');
    }
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
    const storePhone = "96890000000";
    window.open(`https://wa.me/${storePhone}?text=${encodedMessage}`, '_blank');
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

    const storePhone = "96890000000";
    window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
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