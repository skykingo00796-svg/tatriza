// ==========================================
// الملف الرئيسي ونقطة التوصيل (main.js)
// ==========================================

import { checkAdminPermission, initAdminShortcut, handleMobileAdminTap, toggleStockStatus, deleteCarpet, setCarpetPrimaryImage, initImageUploadPreview, handleAddProduct, openAddModal, closeAddModal, openAdminAuthModal, openEditModal, closeEditModal, handleEditProduct, initEditImageManager, initVideoUploadHandlers } from './admin.js';
import { initTheme, openThemeModal, closeThemeModal, selectThemeOption, applyTheme } from './theme.js';
import { 
    openModal, closeModal, handleModalScroll, 
    addToCart, openCartModal, closeCartModal, removeFromCart, sendCartToWhatsApp, 
    openCustomOrderModal, closeCustomOrderModal, submitCustomOrder, 
    openLightboxFromModal, openCurrentLogoLightbox, closeLightbox, handleLightboxScroll,
    openOptionsDrawer, closeOptionsDrawer
} from './modals.js';

import { isFirebaseConfigured, subscribeToCarpets, formatReadableDate, getVideoFromIndexedDB } from './firebase.js';
import { initAmbient3D } from './ambient-3d.js';

// مدة ظهور وسم "جديد وحصري" للمنتجات الجديدة (7 أيام)
export const EXCLUSIVE_DURATION_DAYS = 7;
export const EXCLUSIVE_DURATION_MS = EXCLUSIVE_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function isProductNew(carpet) {
    if (!carpet || !carpet.createdAt) return false;
    const createdTime = typeof carpet.createdAt === "number" 
        ? carpet.createdAt 
        : new Date(carpet.createdAt).getTime();
    if (isNaN(createdTime)) return false;
    const elapsed = Date.now() - createdTime;
    return elapsed >= 0 && elapsed < EXCLUSIVE_DURATION_MS;
}

export function getProductRemainingDays(carpet) {
    if (!isProductNew(carpet)) return 0;
    const createdTime = typeof carpet.createdAt === "number" 
        ? carpet.createdAt 
        : new Date(carpet.createdAt).getTime();
    const remainingMs = EXCLUSIVE_DURATION_MS - (Date.now() - createdTime);
    return Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

let allCarpets = [];
let currentFilter = 'all';
let currentSearchQuery = '';
let currentSortOption = 'default';

// ربط الدوال بالـ window لتعمل عبر الأحداث المباشرة في ملفات الـ HTML
window.getAllCarpetsGlobal = () => allCarpets;
window.isProductNew = isProductNew;
window.getProductRemainingDays = getProductRemainingDays;
window.openOptionsDrawer = openOptionsDrawer;
window.closeOptionsDrawer = closeOptionsDrawer;
window.openAdminAuthModal = openAdminAuthModal;
window.openModal = (id) => openModal(id, allCarpets);
window.closeModal = closeModal;
window.handleModalScroll = handleModalScroll;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.removeFromCartGlobal = removeFromCart;
window.sendCartToWhatsApp = sendCartToWhatsApp;
window.openCustomOrderModal = openCustomOrderModal;
window.closeCustomOrderModal = closeCustomOrderModal;
window.submitCustomOrder = submitCustomOrder;
window.openThemeModal = openThemeModal;
window.closeThemeModal = closeThemeModal;
window.selectThemeOption = selectThemeOption;
window.applyTheme = applyTheme;
window.openCurrentLogoLightbox = openCurrentLogoLightbox;
window.closeLightbox = closeLightbox;
window.handleLightboxScroll = handleLightboxScroll;
window.openAddModal = () => openAddModal(allCarpets);
window.closeAddModal = closeAddModal;
window.openEditModal = (id) => openEditModal(id, allCarpets);
window.closeEditModal = closeEditModal;
window.handleEditProduct = (e) => handleEditProduct(e, allCarpets, (updatedList, editedId) => {
    allCarpets = updatedList;
    updateCategoryCounts();
    filterAndDisplayCarpets();
    const productModal = document.getElementById('product-modal');
    if (productModal && !productModal.classList.contains('hidden') && editedId) {
        openModal(editedId, allCarpets);
    }
});
window.handleAddProduct = (e) => handleAddProduct(e, allCarpets, (updated) => {
    allCarpets = updated;
    updateCategoryCounts();
    filterAndDisplayCarpets();
});
window.toggleStockStatus = (id) => toggleStockStatus(id, allCarpets, (updated) => {
    allCarpets = updated;
    updateCategoryCounts();
    filterAndDisplayCarpets();
});
window.deleteCarpet = (id) => deleteCarpet(id, allCarpets, (updated) => {
    allCarpets = updated;
    updateCategoryCounts();
    filterAndDisplayCarpets();
});
window.setCarpetPrimaryImage = (id, idx) => setCarpetPrimaryImage(id, idx, allCarpets, (updated) => {
    allCarpets = updated;
    updateCategoryCounts();
    filterAndDisplayCarpets();
    openModal(id, allCarpets);
});
window.openLightboxFromModalExternal = (id, idx) => openLightboxFromModal(id, idx, allCarpets);
window.resetSearchAndFilters = resetSearchAndFilters;
window.handleImageScroll = handleImageScrollForGrid;
window.handleMobileAdminTap = handleMobileAdminTap;

// ==========================================
// ترقية وضمان الأكواد والتواريخ التسلسلية الفاخرة (TATR-001A)
// ==========================================
export function normalizeAndMigrateCarpets(carpetsList) {
    if (!Array.isArray(carpetsList)) return [];

    const legacyMap = {
        'carp-1': { id: 'TATR-001A', itemNumber: 1 },
        'carp-2': { id: 'TATR-002S', itemNumber: 2 },
        'carp-3': { id: 'TATR-003T', itemNumber: 3 }
    };

    return carpetsList.map((carpet, idx) => {
        let id = carpet.id;
        let itemNumber = carpet.itemNumber;

        if (legacyMap[id]) {
            itemNumber = legacyMap[id].itemNumber;
            id = legacyMap[id].id;
        } else if (!itemNumber) {
            itemNumber = idx + 1;
        }

        const now = Date.now();
        const createdDate = carpet.createdDate || (carpet.createdAt ? formatReadableDate(carpet.createdAt) : formatReadableDate(now));
        const updatedDate = carpet.updatedDate || (carpet.updatedAt ? formatReadableDate(carpet.updatedAt) : createdDate);

        return {
            ...carpet,
            id: id,
            itemNumber: itemNumber,
            createdDate: createdDate,
            updatedDate: updatedDate
        };
    });
}

// تحميل وعرض بيانات السجاد سحابياً مع الاستماع اللحظي وحفظ محلي احتياطي
async function loadCarpets() {
    setupFilters();
    setupSearchAndSort();

    // بصمة للبيانات المعروضة لمنع تكرار إعادة الرسم ورمش الشاشة
    let lastRenderedSignature = '';

    // 1. إذا كانت سحابة Firebase مهيأة ومفعلة، نستمع للتحديثات اللحظية بذكاء
    if (isFirebaseConfigured()) {
        try {
            subscribeToCarpets((cloudCarpets) => {
                if (cloudCarpets && cloudCarpets.length > 0) {
                    // التحقق مما إذا كانت البيانات تغيرت فعلاً قبل إعادة بناء عناصر الصفحة
                    const newSignature = cloudCarpets.map(c => `${c.id}_${c.status}_${c.price}_${c.updatedAt || c.createdAt || ''}`).join('|');
                    if (newSignature === lastRenderedSignature) {
                        return; // منع إعادة الرسم المتكرر إذا لم يتغير شيء
                    }
                    lastRenderedSignature = newSignature;

                    const preparedCarpets = cloudCarpets.map(c => {
                        let imgList = c.images && c.images.length > 0 ? c.images : [c.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
                        return { ...c, images: imgList };
                    });
                    allCarpets = normalizeAndMigrateCarpets(preparedCarpets);

                    // حفظ احتياطي آمن محلياً
                    try {
                        localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
                    } catch (e) {
                        console.warn("Local cache quota reached, skipping local save.");
                    }

                    updateCategoryCounts();
                    filterAndDisplayCarpets();
                } else {
                    // إذا كانت قاعدة البيانات السحابية فارغة، نحمل البيانات الافتراضية
                    loadFallbackLocalCarpets();
                }
            }, (error) => {
                console.warn("Cloud fetch error, using local fallback:", error);
                loadFallbackLocalCarpets();
            });
            return;
        } catch (cloudErr) {
            console.warn("Cloud connection error, using local fallback:", cloudErr);
        }
    }

    // 2. إذا لم تكن السحابة مهيأة بعد، نحمل من التخزين المحلي أو data/carpets.json
    await loadFallbackLocalCarpets();
}

async function loadFallbackLocalCarpets() {
    try {
        let carpetsData = [];
        const savedCarpets = localStorage.getItem('tatr_carpets');
        if (savedCarpets) {
            carpetsData = JSON.parse(savedCarpets);
        } else {
            const response = await fetch('../data/carpets.json');
            carpetsData = await response.json();
        }
        
        const loadedCarpets = carpetsData.map(c => {
            let imgList = c.images && c.images.length > 0 ? c.images : [c.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
            if (imgList.length === 1) {
                imgList = [
                    imgList[0],
                    'https://placehold.co/800x600/631730/ffffff?text=Tatriza+2',
                    'https://placehold.co/800x600/4a1124/ffffff?text=Tatriza+3'
                ];
            }
            return { ...c, images: imgList };
        });
        allCarpets = normalizeAndMigrateCarpets(loadedCarpets);

        // ضمان تفعيل وسم جديد وحصري للقطعة الأولى لتجربة المظهر الفاخر فوراً إن لم يكن هناك منتج حصري
        if (allCarpets.length > 0 && !allCarpets.some(c => isProductNew(c))) {
            allCarpets[0].createdAt = Date.now() - (1 * 24 * 60 * 60 * 1000);
        }
        localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
        updateCategoryCounts();
        filterAndDisplayCarpets();
    } catch (error) {
        console.error('خطأ في تحميل بيانات السجاد:', error);
    }
}

// عرض السجاد في الشبكة الرئيسية
function displayCarpets(carpetsToDisplay) {
    const grid = document.getElementById('carpets-grid');
    if (!grid) return;

    const isAdmin = checkAdminPermission();
    grid.innerHTML = '';

    if (carpetsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16 px-6 bg-[#fffbf7]/80 backdrop-blur-md rounded-3xl border border-stone-300/80 shadow-xs space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-2xl text-stone-400 border border-stone-200">
                    🔍
                </div>
                <div>
                    <h4 class="text-lg font-bold text-stone-900">لم يتم العثور على قطع مطابقة</h4>
                    <p class="text-xs md:text-sm text-stone-600 mt-1 max-w-md mx-auto">
                        ${currentSearchQuery ? `لا توجد نتائج تطابق بحثك عن "${currentSearchQuery}".` : 'لا توجد قطع متوفرة في هذا القسم حالياً.'}
                    </p>
                </div>
                <button onclick="window.resetSearchAndFilters()" class="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl shadow-xs transition duration-200 cursor-pointer">
                    <span>إعادة تعيين البحث والتصنيفات</span>
                </button>
            </div>
        `;
        return;
    }

    carpetsToDisplay.forEach(carpet => {
        const images = carpet.images && carpet.images.length > 0 ? carpet.images : [carpet.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
        const hasVideo = Boolean(carpet.video);
        const totalMedia = images.length + (hasVideo ? 1 : 0);
        const hasMultipleMedia = totalMedia > 1;
        const isOutOfStock = carpet.status === 'out_of_stock';

        // بناء شرائح الوسائط (صور + فيديو تفاعلي)
        let mediaHtml = '';
        // 1. الصورة الأولى (الغلاف الرئيسي)
        mediaHtml += `<img src="${images[0]}" alt="${carpet.title}" class="w-full h-full object-cover shrink-0 snap-center card-img-zoom ${isOutOfStock ? 'grayscale-[30%]' : ''}">`;

        // 2. شريحة الفيديو الاستعراضي في المعرض كشريحة ثانية
        if (hasVideo) {
            const initialVideoSrc = (carpet.video && !carpet.video.startsWith('idb://')) ? carpet.video : '';
            mediaHtml += `
                <div class="relative w-full h-full shrink-0 snap-center bg-[#fffbf7] flex items-center justify-center overflow-hidden select-none group/cardvideo" id="card-video-slide-${carpet.id}">
                    <video 
                        id="card-video-${carpet.id}"
                        src="${initialVideoSrc}"
                        playsinline 
                        muted 
                        loop 
                        preload="metadata"
                        class="w-full h-full object-contain bg-[#fffbf7] cursor-pointer"
                        onclick="event.stopPropagation(); window.toggleCardVideoPlay('${carpet.id}')"
                    ></video>
                    
                    <!-- زر إيقاف وتشغيل تفاعلي بالوسط -->
                    <div id="card-video-center-btn-${carpet.id}" onclick="event.stopPropagation(); window.toggleCardVideoPlay('${carpet.id}')" class="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 opacity-0">
                        <div class="w-12 h-12 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white flex items-center justify-center text-xl shadow-lg transform transition hover:scale-110 pointer-events-auto cursor-pointer" id="card-video-center-icon-${carpet.id}">
                            ▶
                        </div>
                    </div>

                    <!-- زر الصوت المصغر لبطاقة المعرض - أيقونة فقط وبنفس تصميم وتدرج الزر المقابل -->
                    <button type="button" onclick="event.stopPropagation(); window.toggleCardVideoAudio('${carpet.id}', this)" id="card-video-audio-btn-${carpet.id}" class="absolute top-3 left-3 pointer-events-auto bg-black/60 hover:bg-black/85 text-white w-8 h-8 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-md cursor-pointer z-10 hover:scale-110" title="تشغيل الصوت">
                        <span class="text-sm card-audio-icon leading-none">🔇</span>
                    </button>
                </div>
            `;
        }

        // 3. باقي الصور إن وجدت
        for (let i = 1; i < images.length; i++) {
            mediaHtml += `<img src="${images[i]}" alt="${carpet.title}" class="w-full h-full object-cover shrink-0 snap-center card-img-zoom ${isOutOfStock ? 'grayscale-[30%]' : ''}">`;
        }

        const isNew = isProductNew(carpet);
        const remainingDays = isNew ? getProductRemainingDays(carpet) : 0;

        const card = document.createElement('div');
        card.className = `carpet-card carpet-card-reveal bg-[#fffbf7] rounded-3xl overflow-hidden border ${isNew ? 'card-exclusive-border' : 'border-stone-200/80'} shadow-sm flex flex-col h-full cursor-pointer group relative`;
        card.style.animationDelay = `${Math.min(index * 0.05, 0.35)}s`;
        card.onclick = () => openModal(carpet.id, allCarpets);

        // إضافة مستمعات الـ 3D Tilt والانعكاس الضوئي التفاعلي للبطاقة
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-4px)`;
            card.style.setProperty('--glare-x', `${((x / rect.width) * 100).toFixed(1)}%`);
            card.style.setProperty('--glare-y', `${((y / rect.height) * 100).toFixed(1)}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });

        card.innerHTML = `
            <!-- طبقة الانعكاس الضوئي ثلاثي الأبعاد -->
            <div class="card-light-glare"></div>

            <!-- الكتلة العلوية: الشريط الملاصق للصورة يمنع ظهور أي فراغ أبيض نهائياً -->
            <div class="w-full shrink-0 flex flex-col bg-stone-100 relative z-10">
                ${isNew ? `
                    <div class="exclusive-top-crown-ribbon ${isOutOfStock ? 'ribbon-static' : 'spark-badge-crystal'} rounded-t-3xl" title="${isOutOfStock ? 'المنتج جديد وحصري (نفدت الكمية)' : 'المنتج جديد وحصري'}">
                        <div class="flex items-center justify-center gap-1.5 text-xs font-black text-white whitespace-nowrap">
                            <span class="text-xs shrink-0">✨</span>
                            <span class="tracking-wide whitespace-nowrap">${isOutOfStock ? 'المنتج جديد وحصري (نفدت الكمية)' : 'المنتج جديد وحصري'}</span>
                            ${!isOutOfStock ? '<span class="exclusive-pulse-dot shrink-0"></span>' : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="relative w-full h-72 md:h-80 carpet-stage-container overflow-hidden">
                    <div id="card-stage-${carpet.id}" class="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full" dir="ltr" onscroll="handleImageScroll(this, '${carpet.id}')" onclick="event.stopPropagation()">
                        ${mediaHtml}
                    </div>
                    
                    <!-- أبعاد السجادة في أعلى اليمين في مكانها الأصلي المستقل تماماً -->
                    <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs z-10 pointer-events-none border border-stone-200/50">
                        ${carpet.dimensions}
                    </span>

                    <!-- أزرار تحكم الأدمين في أعلى اليسار مقابل الأبعاد مع توسع النص المنفصل لكل زر -->
                    ${isAdmin ? `
                        <div class="absolute top-3 left-3 flex items-center gap-1.5 z-20" onclick="event.stopPropagation()">
                            <!-- زر تعديل تفاصيل القطعة -->
                            <button onclick="openEditModal('${carpet.id}')" class="admin-action-btn flex items-center h-8 px-2.5 bg-white/90 hover:bg-white text-stone-800 hover:text-amber-800 shadow-xs backdrop-blur-md rounded-full border border-stone-200/80 hover:border-amber-300 cursor-pointer" title="تعديل تفاصيل السجادة">
                                <span class="text-xs shrink-0">✏️</span>
                                <span class="btn-text text-[11px] font-bold text-amber-900">
                                    تعديل
                                </span>
                            </button>

                            <!-- زر تبديل حالة توفر المنتج (يتمدد فقط عند مرور المؤشر عليه وحده) -->
                            <button onclick="toggleStockStatus('${carpet.id}')" class="admin-action-btn flex items-center h-8 px-2.5 bg-white/90 hover:bg-white text-stone-800 shadow-xs backdrop-blur-md rounded-full border border-stone-200/80 cursor-pointer" title="${isOutOfStock ? 'توفر المنتج' : 'عدم توفر المنتج'}">
                                <span class="text-xs shrink-0">${isOutOfStock ? '🟢' : '🔄'}</span>
                                <span class="btn-text text-[11px] font-bold text-stone-800">
                                    ${isOutOfStock ? 'توفر المنتج' : 'عدم توفر المنتج'}
                                </span>
                            </button>

                            <!-- زر حذف القطعة (يتمدد فقط عند مرور المؤشر عليه وحده) -->
                            <button onclick="deleteCarpet('${carpet.id}')" class="admin-action-btn flex items-center h-8 px-2.5 bg-white/90 hover:bg-white text-stone-700 hover:text-red-600 shadow-xs backdrop-blur-md rounded-full border border-stone-200/80 hover:border-red-200 cursor-pointer" title="حذف القطعة">
                                <span class="text-xs shrink-0">🗑️</span>
                                <span class="btn-text text-[11px] font-bold text-red-600">
                                    حذف القطعة
                                </span>
                            </button>
                        </div>
                    ` : ''}

                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                            <span class="bg-stone-900/90 text-amber-300 border border-amber-300/30 text-xs font-bold px-4 py-2 rounded-2xl shadow-lg text-center">
                                نفدت الكمية - يمكنك طلب نفس التصميم
                            </span>
                        </div>
                    ` : ''}

                    <div id="counter-wrapper-${carpet.id}" class="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none z-10 ${hasMultipleMedia && !isOutOfStock ? '' : 'hidden'}">
                        <span id="counter-${carpet.id}">1</span> / <span id="total-${carpet.id}">${totalMedia}</span>
                    </div>

                    ${hasVideo ? `
                        <button 
                            type="button" 
                            id="video-badge-${carpet.id}" 
                            onclick="event.stopPropagation(); window.handleCardVideoBadgeClick('${carpet.id}')"
                            class="absolute bottom-3 right-3 bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-auto z-10 border border-amber-300/30 flex items-center gap-1 shadow-md transition-all duration-300 cursor-pointer"
                            title="انقر للانتقال للفيديو الاستعراضي"
                        >
                            <span class="text-xs badge-icon">🎬</span>
                            <span class="badge-text">فيديو استعراضي</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- الكتلة السفلية: تتمدد لامتصاص أي فرق في ارتفاع البطاقات وتثبيت السعر والزر في الأسفل -->
            <div class="p-4 md:p-5 flex-1 flex flex-col justify-between bg-stone-50/60 border-t border-stone-200/50 relative z-10">
                <div class="mb-3">
                    <h4 class="font-display font-black text-stone-900 text-sm md:text-base truncate group-hover:text-brand transition">${carpet.title}</h4>
                </div>

                <div class="flex items-center justify-between gap-2 mt-auto">
                    <div class="flex items-center gap-1 shrink-0">
                        <span class="font-display text-base md:text-lg font-black text-brand">${carpet.price}</span>
                        <span class="font-display text-brand text-xs font-bold">ر.ع.</span>
                    </div>
                    
                    ${isOutOfStock ? `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="btn-liquid-metal font-display text-white text-[10px] sm:text-[11px] font-bold px-3 sm:px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0" title="التفاصيل وإعادة طلب المنتج">
                            <span class="whitespace-nowrap">إعادة طلب المنتج</span>
                            <span class="text-xs shrink-0">🔄</span>
                        </button>
                    ` : `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="btn-liquid-metal font-display text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap shrink-0">
                            التفاصيل
                        </button>
                    `}
                </div>
            </div>
        `;

        grid.appendChild(card);

        if (hasVideo && carpet.video && carpet.video.startsWith('idb://')) {
            getVideoFromIndexedDB(carpet.id).then(blobUrl => {
                if (blobUrl) {
                    const cardVideo = document.getElementById(`card-video-${carpet.id}`);
                    if (cardVideo) {
                        cardVideo.muted = true;
                        cardVideo.defaultMuted = true;
                        cardVideo.setAttribute('muted', '');
                        cardVideo.src = blobUrl;
                    }
                }
            });
        }
    });
}

function handleImageScrollForGrid(container, carpetId) {
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth || 1;
    const activeIndex = Math.round(scrollLeft / width);
    
    const counterSpan = document.getElementById(`counter-${carpetId}`);
    if (counterSpan) {
        counterSpan.innerText = activeIndex + 1;
    }

    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    const badge = document.getElementById(`video-badge-${carpetId}`);

    if (cardVideo) {
        // شريحة الفيديو هي الشريحة رقم 1 (بعد الصورة الأولى)
        const isVideoActive = (activeIndex === 1);

        if (isVideoActive) {
            // 1. تشغيل الفيديو في البطاقة تلقائياً
            if (cardVideo.paused) {
                cardVideo.play().catch(() => {});
            }

            // 2. تحويل الزر فوراً إلى أيقونة تكبير فقط بنفس تصميم ولون زر كتم الصوت
            if (badge) {
                badge.className = "absolute bottom-3 right-3 bg-black/60 hover:bg-black/85 text-white w-8 h-8 rounded-xl backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-md cursor-pointer pointer-events-auto z-20 hover:scale-110";
                badge.innerHTML = `<span class="text-sm leading-none">⛶</span>`;
                badge.title = "تكبير الفيديو للشاشة كاملة";
            }
        } else {
            // إيقاف تشغيل الفيديو عند الانتقال لصور أخرى لتوفير البطارية
            if (!cardVideo.paused) {
                cardVideo.pause();
            }
            // إعادة كتم الصوت تلقائياً لراحة العميل
            cardVideo.muted = true;
            cardVideo.defaultMuted = true;
            cardVideo.setAttribute('muted', '');
            const audioBtn = document.getElementById(`card-video-audio-btn-${carpetId}`);
            if (audioBtn) {
                const icon = audioBtn.querySelector('.card-audio-icon');
                if (icon) icon.innerText = '🔇';
                audioBtn.setAttribute('title', 'تشغيل الصوت');
            }

            // إعادة الشارة إلى مظهرها الأصلي "فيديو استعراضي"
            if (badge) {
                badge.className = "absolute bottom-3 right-3 bg-stone-900/80 hover:bg-stone-900 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full pointer-events-auto z-10 border border-amber-300/30 flex items-center gap-1 shadow-md transition-all duration-300 cursor-pointer";
                badge.innerHTML = `
                    <span class="text-xs badge-icon">🎬</span>
                    <span class="badge-text">فيديو استعراضي</span>
                `;
                badge.title = "انقر للانتقال للفيديو الاستعراضي";
            }
        }
    }
}

// ==========================================
// دوال التحكم التفاعلي بفيديو بطاقة المعرض (تشغيل، صوت، تكبير شاشة)
// ==========================================
window.handleCardVideoBadgeClick = (carpetId) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    const container = document.getElementById(`card-stage-${carpetId}`);
    if (!cardVideo || !container) {
        window.fullscreenCardVideo(carpetId);
        return;
    }

    const slide = document.getElementById(`card-video-slide-${carpetId}`);
    if (slide) {
        const slideLeft = slide.offsetLeft;
        const currentScroll = container.scrollLeft;
        const width = container.clientWidth || 1;
        const activeIndex = Math.round(currentScroll / width);

        if (activeIndex === 1) {
            // المستخدم في شريحة الفيديو بالفعل -> تكبير الشاشة!
            window.fullscreenCardVideo(carpetId);
        } else {
            // المستخدم يشاهد صورة -> انتقال سلس وسريع لشريحة الفيديو!
            container.scrollTo({ left: slideLeft, behavior: 'smooth' });
        }
    } else {
        window.fullscreenCardVideo(carpetId);
    }
};

window.fullscreenCardVideo = (carpetId) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    if (!cardVideo || !cardVideo.src) return;

    // إيقاف وكتم فيديو البطاقة لراحة العميل
    cardVideo.pause();
    cardVideo.muted = true;
    cardVideo.defaultMuted = true;
    cardVideo.setAttribute('muted', '');
    const audioBtn = document.getElementById(`card-video-audio-btn-${carpetId}`);
    if (audioBtn) {
        const icon = audioBtn.querySelector('.card-audio-icon');
        if (icon) icon.innerText = '🔇';
        audioBtn.setAttribute('title', 'تشغيل الصوت');
    }

    // فتح الفيديو في نافذة تكبير على مستوى المتصفح (مكتومة الصوت دائماً)
    const carpet = allCarpets.find(c => c.id === carpetId);
    const title = carpet ? carpet.title : 'فيديو استعراضي';
    if (typeof window.openVideoLightbox === 'function') {
        window.openVideoLightbox(cardVideo.src, title);
    }
};

window.toggleCardVideoPlay = (carpetId) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    if (!cardVideo) return;

    const centerBtn = document.getElementById(`card-video-center-btn-${carpetId}`);
    const centerIcon = document.getElementById(`card-video-center-icon-${carpetId}`);

    if (cardVideo.paused) {
        cardVideo.play().catch(() => {});
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
        cardVideo.pause();
        if (centerIcon) centerIcon.innerText = '⏸';
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0');
            centerBtn.classList.add('opacity-100');
        }
    }
};

window.toggleCardVideoAudio = (carpetId, btnEl) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    if (!cardVideo) return;

    cardVideo.muted = !cardVideo.muted;
    const isMuted = cardVideo.muted;

    const btn = btnEl || document.getElementById(`card-video-audio-btn-${carpetId}`);
    if (btn) {
        const iconSpan = btn.querySelector('.card-audio-icon');
        if (iconSpan) iconSpan.innerText = isMuted ? '🔇' : '🔊';
        btn.setAttribute('title', isMuted ? 'تشغيل الصوت' : 'كتم الصوت');
    }
};

// ==========================================
// منطق البحث، التصفية، والفرز الذكي
// ==========================================

function updateCategoryCounts() {
    const counts = {
        all: allCarpets.length,
        ajami: allCarpets.filter(c => c.category === 'ajami').length,
        silk: allCarpets.filter(c => c.category === 'silk').length,
        traditional: allCarpets.filter(c => c.category === 'traditional').length
    };

    const setBadge = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.innerText = count;
    };

    setBadge('count-all', counts.all);
    setBadge('count-ajami', counts.ajami);
    setBadge('count-silk', counts.silk);
    setBadge('count-traditional', counts.traditional);
}

function filterAndDisplayCarpets() {
    let result = [...allCarpets];

    // 1. تصفية حسب التصنيف
    if (currentFilter !== 'all') {
        result = result.filter(c => c.category === currentFilter);
    }

    // 2. تصفية حسب البحث الدقيق
    if (currentSearchQuery.trim() !== '') {
        const q = currentSearchQuery.trim().toLowerCase();
        result = result.filter(c => {
            const titleMatch = (c.title || '').toLowerCase().includes(q);
            const descMatch = (c.description || '').toLowerCase().includes(q);
            const matMatch = (c.material || '').toLowerCase().includes(q);
            const dimMatch = (c.dimensions || '').toLowerCase().includes(q);

            const catMap = {
                ajami: 'نقشات عجمية عجمي كلاسيك',
                silk: 'سجاد حريري حرير ناعم',
                traditional: 'تراثي أصيل تراث صوف'
            };
            const catMatch = (catMap[c.category] || '').toLowerCase().includes(q);

            return titleMatch || descMatch || matMatch || dimMatch || catMatch;
        });
    }

    // 3. الفرز والترتيب
    if (currentSortOption === 'price-asc') {
        result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (currentSortOption === 'price-desc') {
        result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (currentSortOption === 'title-asc') {
        result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    }

    displayCarpets(result);
}

function setupSearchAndSort() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const sortSelect = document.getElementById('sort-select');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            if (clearBtn) {
                if (currentSearchQuery.length > 0) {
                    clearBtn.classList.remove('hidden');
                } else {
                    clearBtn.classList.add('hidden');
                }
            }
            filterAndDisplayCarpets();
        });
    }

    if (clearBtn && searchInput) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchQuery = '';
            clearBtn.classList.add('hidden');
            searchInput.focus();
            filterAndDisplayCarpets();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortOption = e.target.value;
            filterAndDisplayCarpets();
        });
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            buttons.forEach(btn => {
                btn.classList.remove('bg-brand', 'text-white', 'shadow-xs', 'font-bold');
                btn.classList.add('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]', 'font-semibold');
                const badge = btn.querySelector('.cat-badge');
                if (badge) {
                    badge.classList.remove('bg-white/20', 'text-white');
                    badge.classList.add('bg-stone-200/80', 'text-stone-700');
                }
            });
            
            const activeBtn = e.currentTarget;
            activeBtn.classList.remove('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]', 'font-semibold');
            activeBtn.classList.add('bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            
            const activeBadge = activeBtn.querySelector('.cat-badge');
            if (activeBadge) {
                activeBadge.classList.remove('bg-stone-200/80', 'text-stone-700');
                activeBadge.classList.add('bg-white/20', 'text-white');
            }

            currentFilter = activeBtn.getAttribute('data-filter') || 'all';
            filterAndDisplayCarpets();
        });
    });
}

function resetSearchAndFilters() {
    currentFilter = 'all';
    currentSearchQuery = '';
    currentSortOption = 'default';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.classList.add('hidden');

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const filter = btn.getAttribute('data-filter');
        const badge = btn.querySelector('.cat-badge');
        if (filter === 'all') {
            btn.classList.remove('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]', 'font-semibold');
            btn.classList.add('bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            if (badge) {
                badge.classList.remove('bg-stone-200/80', 'text-stone-700');
                badge.classList.add('bg-white/20', 'text-white');
            }
        } else {
            btn.classList.remove('bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            btn.classList.add('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]', 'font-semibold');
            if (badge) {
                badge.classList.remove('bg-white/20', 'text-white');
                badge.classList.add('bg-stone-200/80', 'text-stone-700');
            }
        }
    });

    filterAndDisplayCarpets();
}

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    try {
        initAmbient3D('ambient-3d-canvas');
    } catch(e) {}
    initAdminShortcut();
    initImageUploadPreview();
    initEditImageManager();
    initVideoUploadHandlers();

    const isAdmin = checkAdminPermission();
    const addCarpetBtn = document.querySelector('button[onclick="openAddModal()"]');
    if (addCarpetBtn) {
        addCarpetBtn.style.display = isAdmin ? 'flex' : 'none';
    }

    const drawerAddBtn = document.getElementById('drawer-add-carpet-btn');
    if (drawerAddBtn) {
        if (isAdmin) {
            drawerAddBtn.classList.remove('hidden');
            drawerAddBtn.classList.add('flex');
        } else {
            drawerAddBtn.classList.add('hidden');
            drawerAddBtn.classList.remove('flex');
        }
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOptionsDrawer();
        }
    });

    loadCarpets();
});