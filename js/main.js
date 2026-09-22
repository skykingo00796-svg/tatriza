// ==========================================
// الملف الرئيسي ونقطة التوصيل (main.js)
// ==========================================

// المتجر العام - مهيأ للعرض العام فائق السرعة والأمان
import { initTheme, openThemeModal, closeThemeModal, selectThemeOption, applyTheme } from './theme.js';
import { 
    openModal, closeModal, handleModalScroll, 
    addToCart, openCartModal, closeCartModal, removeFromCart, sendCartToWhatsApp, 
    openCustomOrderModal, closeCustomOrderModal, submitCustomOrder, 
    openLightboxFromModal, openCurrentLogoLightbox, closeLightbox, handleLightboxScroll,
    openOptionsDrawer, closeOptionsDrawer
} from './modals.js';

import { 
    isFirebaseConfigured, 
    subscribeToCarpets, 
    formatReadableDate, 
    getVideoFromIndexedDB,
    subscribeToCategories,
    subscribeToCategorySettings
} from './firebase-public.js';
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
window.openLightboxFromModalExternal = (id, idx) => openLightboxFromModal(id, idx, allCarpets);
window.resetSearchAndFilters = resetSearchAndFilters;
window.handleImageScroll = handleImageScrollForGrid;

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

    // 1. إذا كانت سحابة Firebase مهيأة ومفعلة، نستمع للتحديثات اللحظية للمنتجات والتصنيفات
    if (isFirebaseConfigured()) {
        try {
            // مزامنة فورية للتصنيفات لجميع زوار الموقع حول العالم
            subscribeToCategories((cloudCats) => {
                if (cloudCats && Array.isArray(cloudCats)) {
                    saveCustomCategories(cloudCats);
                    renderCustomCategoriesInUI();
                    filterAndDisplayCarpets();
                }
            });

            // مزامنة إعدادات التصنيفات وقائمة الأيقونات السريعة المخصصة
            subscribeToCategorySettings((settings) => {
                if (settings) {
                    if (Array.isArray(settings.deletedDefaultCategoryIds)) {
                        saveDeletedCategoryIds(settings.deletedDefaultCategoryIds);
                    }
                    if (Array.isArray(settings.customQuickIcons)) {
                        saveCustomQuickIcons(settings.customQuickIcons);
                    }
                    renderCustomCategoriesInUI();
                    filterAndDisplayCarpets();
                }
            });
        } catch (catSyncErr) {
            console.warn("Category real-time sync warning:", catSyncErr);
        }
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

    renderCustomCategoriesInUI();
    grid.innerHTML = '';

    if (carpetsToDisplay.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12 sm:py-16 px-4 space-y-3.5 my-2">
                <div class="w-14 h-14 rounded-full bg-stone-200/50 flex items-center justify-center mx-auto text-2xl text-stone-400 border border-stone-300/40">
                    🔍
                </div>
                <div>
                    <h4 class="font-display font-bold text-stone-800 text-base md:text-lg">لم يتم العثور على قطع مطابقة</h4>
                    <p class="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                        ${currentSearchQuery ? `لا توجد نتائج تطابق بحثك عن "${currentSearchQuery}".` : 'لا توجد قطع متوفرة في هذا القسم حالياً.'}
                    </p>
                </div>
                <div>
                    <button onclick="window.resetSearchAndFilters()" class="btn-liquid-metal font-display text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2">
                        <span>إعادة تعيين البحث والتصنيفات</span>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    carpetsToDisplay.forEach((carpet, index) => {
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
                    
<!-- زر إيقاف وتشغيل تفاعلي بالوسط مصغر ومضبوط للبطاقة -->
                    <div id="card-video-center-btn-${carpet.id}" onclick="event.stopPropagation(); window.toggleCardVideoPlay('${carpet.id}')" class="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 opacity-0">
                        <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/65 backdrop-blur-md border border-white/30 text-white flex items-center justify-center text-[9px] shadow-md transform transition hover:scale-110 pointer-events-auto cursor-pointer" id="card-video-center-icon-${carpet.id}">
                            ▶
                        </div>
                    </div>

                    <!-- زر الصوت المصغر لبطاقة المعرض بحجم مريح ومتناسق -->
                    <button type="button" onclick="event.stopPropagation(); window.toggleCardVideoAudio('${carpet.id}', this)" id="card-video-audio-btn-${carpet.id}" class="absolute top-1.5 left-1.5 pointer-events-auto bg-black/70 hover:bg-black/90 text-white w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-2xs cursor-pointer z-10 hover:scale-105" title="تشغيل الصوت">
                        <span class="text-[8.5px] sm:text-[9.5px] card-audio-icon leading-none">🔇</span>
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
        card.className = `carpet-card carpet-card-reveal bg-[#fffbf7] rounded-xl sm:rounded-2xl overflow-hidden border ${isNew ? 'card-exclusive-border' : 'border-stone-200/80'} shadow-2xs flex flex-col h-full cursor-pointer group relative`;
        card.style.animationDelay = `${Math.min(index * 0.04, 0.3)}s`;
        card.onclick = () => openModal(carpet.id, allCarpets);

        // إضافة مستمعات الـ 3D Tilt والانعكاس الضوئي المحصور على مساحة الصورة فقط
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-3px)`;
            
            // حساب بقعة اللمعان بدقة على سطح الصورة دون تجاوزها
            const stage = card.querySelector('.carpet-stage-container');
            if (stage) {
                const sRect = stage.getBoundingClientRect();
                const sx = e.clientX - sRect.left;
                const sy = e.clientY - sRect.top;
                card.style.setProperty('--glare-x', `${((sx / sRect.width) * 100).toFixed(1)}%`);
                card.style.setProperty('--glare-y', `${((sy / sRect.height) * 100).toFixed(1)}%`);
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });

        card.innerHTML = `
            <!-- الكتلة العلوية: الشريط الملاصق للصورة يمنع ظهور أي فراغ أبيض نهائياً -->
            <div class="w-full shrink-0 flex flex-col bg-stone-100 relative z-10">
                ${isNew ? `
                    <div class="exclusive-top-crown-ribbon ${isOutOfStock ? 'ribbon-static' : 'spark-badge-crystal'} rounded-t-xl" title="${isOutOfStock ? 'المنتج جديد وحصري (نفدت الكمية)' : 'المنتج جديد وحصري'}">
                        <div class="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black text-white whitespace-nowrap">
                            <span class="text-[9px] shrink-0">✨</span>
                            <span class="tracking-tight whitespace-nowrap">${isOutOfStock ? 'جديد وحصري (نفد)' : 'جديد وحصري'}</span>
                            ${!isOutOfStock ? '<span class="exclusive-pulse-dot shrink-0"></span>' : ''}
                        </div>
                    </div>
                ` : ''}

                <div class="relative w-full aspect-square carpet-stage-container overflow-hidden">
                    <div id="card-stage-${carpet.id}" class="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full" dir="ltr" onscroll="handleImageScroll(this, '${carpet.id}')" onclick="event.stopPropagation()">
                        ${mediaHtml}
                    </div>

                    <!-- لمعة الانعكاس الضوئي التفاعلية محصورة فقط على سطح الصورة لغرض الجمالية دون التأثير على الأزرار -->
                    <div class="card-light-glare"></div>
                    
                    <!-- أبعاد السجادة في أعلى اليمين (فوق اللمعة بوضوح تام z-30) -->
                    <span class="absolute top-1.5 right-1.5 bg-black/30 hover:bg-black/45 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs z-30 pointer-events-none border border-white/20 leading-tight transition">
                        ${carpet.dimensions}
                    </span>



                    ${isOutOfStock ? `
                        <div class="absolute inset-0 bg-black/15 backdrop-blur-[0.5px] flex items-center justify-center z-10 pointer-events-none p-1">
                            <span class="bg-black/40 backdrop-blur-md text-amber-200 border border-white/20 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg text-center leading-tight">
                                نفدت الكمية
                            </span>
                        </div>
                    ` : ''}

                    <div id="counter-wrapper-${carpet.id}" class="absolute bottom-1.5 left-1.5 bg-black/30 backdrop-blur-md text-white/90 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none border border-white/15 z-10 ${hasMultipleMedia && !isOutOfStock ? '' : 'hidden'} leading-tight">
                        <span id="counter-${carpet.id}">1</span>/<span id="total-${carpet.id}">${totalMedia}</span>
                    </div>

                    ${hasVideo ? `
                        <button 
                            type="button" 
                            id="video-badge-${carpet.id}" 
                            onclick="event.stopPropagation(); window.handleCardVideoBadgeClick('${carpet.id}')"
                            class="absolute bottom-1.5 right-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md text-amber-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-auto z-10 border border-white/20 flex items-center gap-0.5 shadow-xs transition cursor-pointer leading-tight"
                            title="مشاهدة الفيديو"
                        >
                            <span class="text-[9px]">🎬</span>
                            <span class="badge-text">فيديو</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- الكتلة السفلية: مصغرة ومتناسقة لتثبيت السعر والزر في الأسفل -->
            <div class="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-stone-50/70 border-t border-stone-200/60 relative z-10">
                <div class="mb-1.5">
                    <h4 class="font-display font-semibold text-stone-900 text-[9.5px] sm:text-[10.5px] leading-snug truncate group-hover:text-brand transition" title="${carpet.title}">${carpet.title}</h4>
                </div>

                <div class="flex items-center justify-between gap-1 mt-auto">
                    <div class="flex items-baseline gap-0.5 shrink-0">
                        <span class="font-display text-xs sm:text-sm font-black text-brand leading-none">${carpet.price}</span>
                        <span class="font-display text-brand text-[8px] sm:text-[9px] font-bold leading-none">ر.ع.</span>
                    </div>
                    
                    ${isOutOfStock ? `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="btn-liquid-metal font-display text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0" title="طلب المنتج">
                            <span class="whitespace-nowrap">طلب</span>
                            <span class="text-[8px] shrink-0">🔄</span>
                        </button>
                    ` : `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="btn-liquid-metal font-display text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer whitespace-nowrap shrink-0">
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

            // 2. تحويل الزر إلى أيقونة تكبير مصغرة ومحكمة ومتناسقة مع حجم الكارد وزر كتم الصوت
            if (badge) {
                badge.className = "absolute bottom-1.5 right-1.5 bg-black/75 hover:bg-black/90 text-white w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md backdrop-blur-md border border-white/20 flex items-center justify-center transition shadow-2xs cursor-pointer pointer-events-auto z-20 hover:scale-105";
                badge.innerHTML = `<span class="text-[9px] sm:text-[10px] leading-none">⛶</span>`;
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

            // إعادة الشارة إلى مظهرها الأصلي تماماً "فيديو" بنفس الحجم الأولي بدون أي تضخيم
            if (badge) {
                badge.className = "absolute bottom-1.5 right-1.5 bg-stone-900/85 hover:bg-stone-900 backdrop-blur-md text-amber-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-auto z-10 border border-amber-300/30 flex items-center gap-0.5 shadow-xs transition cursor-pointer leading-tight";
                badge.innerHTML = `
                    <span class="text-[9px]">🎬</span>
                    <span class="badge-text">فيديو</span>
                `;
                badge.title = "مشاهدة الفيديو";
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
    const setBadge = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.innerText = count;
    };

    setBadge('count-all', allCarpets.length);

    // تحديث عدادات جميع التصنيفات النشطة ديناميكياً
    try {
        getActiveCategories().forEach(cat => {
            const cCount = allCarpets.filter(c => c.category === cat.id).length;
            setBadge(`count-${cat.id}`, cCount);
        });
    } catch(e) {}
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
        button.onclick = (e) => {
            buttons.forEach(btn => {
                btn.classList.remove('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
                btn.classList.add('font-semibold');
                const badge = btn.querySelector('.cat-badge');
                if (badge) {
                    badge.classList.remove('bg-white/20', 'text-white');
                    badge.classList.add('bg-stone-200/80', 'text-stone-700');
                }
            });
            
            const activeBtn = e.currentTarget;
            activeBtn.classList.add('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            activeBtn.classList.remove('font-semibold');
            
            const activeBadge = activeBtn.querySelector('.cat-badge');
            if (activeBadge) {
                activeBadge.classList.remove('bg-stone-200/80', 'text-stone-700');
                activeBadge.classList.add('bg-white/20', 'text-white');
            }

            currentFilter = activeBtn.getAttribute('data-filter') || 'all';
            filterAndDisplayCarpets();
        };
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
            btn.classList.add('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            btn.classList.remove('font-semibold');
            if (badge) {
                badge.classList.remove('bg-stone-200/80', 'text-stone-700');
                badge.classList.add('bg-white/20', 'text-white');
            }
        } else {
            btn.classList.remove('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            btn.classList.add('font-semibold');
            if (badge) {
                badge.classList.remove('bg-white/20', 'text-white');
                badge.classList.add('bg-stone-200/80', 'text-stone-700');
            }
        }
    });

    filterAndDisplayCarpets();
}


// ==========================================
// حركة تتبع الشعار التفاعلية في خلفية البانر الترحيبي (Parallax Hero Background)
// ==========================================
export function initHeroParallax() {
    const banner = document.getElementById('welcome-hero-banner');
    const logo = document.getElementById('welcome-parallax-logo');
    if (!banner || !logo) return;

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let targetRotate = 0, currentRotate = 0;
    let isHovered = false;
    let rafId = null;

    function updateParallax() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentRotate += (targetRotate - currentRotate) * 0.08;

        logo.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(1.08) rotate(${currentRotate.toFixed(2)}deg)`;

        if (isHovered || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
            rafId = requestAnimationFrame(updateParallax);
        } else {
            rafId = null;
        }
    }

    banner.addEventListener('mousemove', (e) => {
        const rect = banner.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
        const relY = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

        // يتحرك الشعار بنعومة مع المؤشر ليمنح عمقاً ثلاثي الأبعاد
        targetX = relX * 36;
        targetY = relY * 24;
        targetRotate = relX * 3;

        isHovered = true;
        if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
        }
    });

    banner.addEventListener('mouseleave', () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        targetRotate = 0;
        if (!rafId) {
            rafId = requestAnimationFrame(updateParallax);
        }
    });
}


// ==========================================
// نظام إدارة وتخصيص وحذف التصنيفات (Category Management & Deletion Engine)
// ==========================================
export const DEFAULT_CATEGORIES = [
    { id: 'ajami', name: 'نقشات عجمية', icon: '✨', code: 'A' },
    { id: 'silk', name: 'سجاد حريري', icon: '🧵', code: 'S' },
    { id: 'traditional', name: 'تراثي أصيل', icon: '🏛️', code: 'T' },
    { id: 'modern', name: 'مودرن معاصر', icon: '🎨', code: 'M' },
    { id: 'wool', name: 'صوف فاخر', icon: '🧶', code: 'W' }
];

// قائمة الأيقونات السريعة الافتراضية
export const DEFAULT_QUICK_ICONS = ['✨', '🪞', '🧵', '👑', '🏛️', '🎨', '💎', '🪡'];

// إدارة وحفظ الأيقونات السريعة المخصصة
export function getCustomQuickIcons() {
    try {
        const stored = localStorage.getItem('tatr_custom_quick_icons');
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

export function saveCustomQuickIcons(icons) {
    try {
        localStorage.setItem('tatr_custom_quick_icons', JSON.stringify(icons));
    } catch(e) {}
}

export function getAllQuickIcons() {
    const custom = getCustomQuickIcons();
    const unique = [];
    [...DEFAULT_QUICK_ICONS, ...custom].forEach(icon => {
        if (icon && !unique.includes(icon)) {
            unique.push(icon);
        }
    });
    return unique;
}

export function getDeletedCategoryIds() {
    try {
        const stored = localStorage.getItem('tatr_deleted_categories');
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

export function saveDeletedCategoryIds(ids) {
    localStorage.setItem('tatr_deleted_categories', JSON.stringify(ids));
}

export function getCustomCategories() {
    try {
        const stored = localStorage.getItem('tatr_custom_categories');
        return stored ? JSON.parse(stored) : [];
    } catch(e) {
        return [];
    }
}

export function saveCustomCategories(cats) {
    localStorage.setItem('tatr_custom_categories', JSON.stringify(cats));
}

// جلب كافة التصنيفات النشطة المعتمدة في المتجر
export function getActiveCategories() {
    const deletedIds = getDeletedCategoryIds();
    const activeDefaults = DEFAULT_CATEGORIES.filter(c => !deletedIds.includes(c.id));
    const custom = getCustomCategories();
    return [...activeDefaults, ...custom];
}
window.getActiveCategories = getActiveCategories;



export function filterCarpetsByCategory(catId) {
    currentFilter = catId || 'all';
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        const isMatch = (btn.getAttribute('data-filter') === currentFilter);
        if (isMatch) {
            btn.classList.add('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            btn.classList.remove('font-semibold');
            const badge = btn.querySelector('.cat-badge');
            if (badge) {
                badge.classList.remove('bg-stone-200/80', 'text-stone-700');
                badge.classList.add('bg-white/20', 'text-white');
            }
        } else {
            btn.classList.remove('active', 'bg-brand', 'text-white', 'shadow-xs', 'font-bold');
            btn.classList.add('font-semibold');
            const badge = btn.querySelector('.cat-badge');
            if (badge) {
                badge.classList.remove('bg-white/20', 'text-white');
                badge.classList.add('bg-stone-200/80', 'text-stone-700');
            }
        }
    });
    filterAndDisplayCarpets();
}
window.filterCarpetsByCategory = filterCarpetsByCategory;

export function renderCustomCategoriesInUI() {
    const filterTrack = document.getElementById('filter-buttons');
    if (!filterTrack) return;

    const deletedIds = getDeletedCategoryIds();
    const activeCats = getActiveCategories();

    // 1. تحديث التبويبات الافتراضية
    DEFAULT_CATEGORIES.forEach(cat => {
        let tabBtn = document.getElementById(`tab-cat-${cat.id}`) || filterTrack.querySelector(`button[data-filter="${cat.id}"]`);
        if (tabBtn) {
            if (deletedIds.includes(cat.id)) {
                tabBtn.remove();
            } else {
                tabBtn.id = `tab-cat-${cat.id}`;
            }
        } else if (!deletedIds.includes(cat.id)) {
            const btn = document.createElement('button');
            btn.id = `tab-cat-${cat.id}`;
            btn.setAttribute('data-filter', cat.id);
            const isActive = currentFilter === cat.id;
            btn.className = `filter-btn catalog-tab-btn group flex items-center gap-1.5 sm:gap-2 ${isActive ? 'active bg-brand text-white shadow-xs font-bold' : ''}`;
            btn.innerHTML = `
                <span class="tab-icon">${cat.icon}</span>
                <span class="font-display">${cat.name}</span>
                <span id="count-${cat.id}" class="cat-badge px-1.5 sm:px-2 py-0.2 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-700'} transition">0</span>
            `;
            btn.onclick = () => filterCarpetsByCategory(cat.id);
            filterTrack.appendChild(btn);
        }
    });

    // 2. تحديث التبويبات المخصصة
    filterTrack.querySelectorAll('.custom-cat-tab').forEach(el => el.remove());
    getCustomCategories().forEach(cat => {
        const btn = document.createElement('button');
        btn.setAttribute('data-filter', cat.id);
        const isActive = currentFilter === cat.id;
        btn.className = `filter-btn catalog-tab-btn custom-cat-tab group flex items-center gap-1.5 sm:gap-2 ${isActive ? 'active bg-brand text-white shadow-xs font-bold' : ''}`;
        btn.innerHTML = `
            <span class="tab-icon">${cat.icon || '✨'}</span>
            <span class="font-display">${cat.name}</span>
            <span id="count-${cat.id}" class="cat-badge px-1.5 sm:px-2 py-0.2 rounded-full font-black ${isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-700'} transition">0</span>
        `;
        btn.onclick = () => filterCarpetsByCategory(cat.id);
        filterTrack.appendChild(btn);
    });

    updateCategoryCounts();
}
window.renderCustomCategoriesInUI = renderCustomCategoriesInUI;

window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    try {
        initAmbient3D('ambient-3d-canvas');
    } catch(e) {}
    initHeroParallax();

    renderCustomCategoriesInUI();

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeOptionsDrawer();
        }
    });

    loadCarpets();
});