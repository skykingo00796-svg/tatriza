// ==========================================
// الملف الرئيسي ونقطة التوصيل (main.js)
// ==========================================

// المتجر العام - مهيأ للعرض العام فائق السرعة والأمان
import { initTheme, openThemeModal, closeThemeModal, selectThemeOption, applyTheme } from './theme.js';
import { 
    getCurrentCurrency, setCurrentCurrency, convertFromOMR, 
    openCurrencyModal, closeCurrencyModal, updateAllPricesOnPage, 
    getCurrencySymbolHTML, OMR_OFFICIAL_SVG 
} from './currency.js';
import { 
    openModal, closeModal, handleModalScroll, scrollModalSlide,
    addToCart, openCartModal, closeCartModal, removeFromCart, sendCartToWhatsApp, 
    updateCartDisplay,
    addCurrentModalToCart, inquireCurrentModalWhatsApp,
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
    subscribeToCategorySettings,
    subscribeToShowcaseSettings,
    getDefaultShowcaseSettings
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
let currentCatalogMode = 'ondemand'; // 'instant' | 'ondemand' (حياكة حسب الطلب هو الوضع الافتراضي)

// إعدادات الترقيم المدمجة الفاخرة (18 قطعة لكل صفحة - متناسقة مع شبكة العرض)
const CARPETS_PER_PAGE = 18;
let currentCarpetPage = 1;
let filteredCarpetsList = [];

// ربط الدوال بالـ window لتعمل عبر الأحداث المباشرة في ملفات الـ HTML
window.getAllCarpetsGlobal = () => allCarpets;
window.switchCatalogMode = switchCatalogMode;
window.getCurrentCatalogMode = () => currentCatalogMode;
window.isProductNew = isProductNew;
window.getProductRemainingDays = getProductRemainingDays;
window.openOptionsDrawer = openOptionsDrawer;
window.closeOptionsDrawer = closeOptionsDrawer;
window.openModal = (id) => openModal(id, allCarpets);
window.closeModal = closeModal;
window.handleModalScroll = handleModalScroll;
window.scrollModalSlide = scrollModalSlide;
window.openCurrencyModal = openCurrencyModal;
window.closeCurrencyModal = closeCurrencyModal;
window.setCurrentCurrency = setCurrentCurrency;
window.getCurrentCurrency = getCurrentCurrency;
window.updateAllPricesOnPage = updateAllPricesOnPage;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
window.updateCartDisplay = updateCartDisplay;
window.addToCart = addToCart;
window.addCurrentModalToCart = addCurrentModalToCart;
window.inquireCurrentModalWhatsApp = inquireCurrentModalWhatsApp;
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
                } else if (Array.isArray(cloudCarpets) && cloudCarpets.length === 0) {
                    // قاعدة البيانات السحابية متصلة وفارغة (وضع الإطلاق الحقيقي يبدأ من الصفر 0)
                    allCarpets = [];
                    try {
                        localStorage.setItem('tatr_carpets', JSON.stringify([]));
                    } catch (e) {}
                    updateCategoryCounts();
                    filterAndDisplayCarpets();
                } else {
                    // إذا تعذر جلب البيانات نحمل النسخة الاحتياطية
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
            try {
                carpetsData = JSON.parse(savedCarpets);
                if (!carpetsData.some(c => c.id === 'TATR-004R') || !carpetsData.some(c => c.status === 'out_of_stock')) {
                    const response = await fetch('../data/carpets.json');
                    carpetsData = await response.json();
                }
            } catch(e) {
                const response = await fetch('../data/carpets.json');
                carpetsData = await response.json();
            }
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
                    ${currentCatalogMode === 'ondemand' ? '🪄' : '🔍'}
                </div>
                <div>
                    <h4 class="font-display font-bold text-stone-800 text-base md:text-lg">
                        ${currentCatalogMode === 'ondemand' ? 'لا توجد تصاميم بالطلب مطابقة حالياً' : 'لم يتم العثور على قطع تسليم فوري'}
                    </h4>
                    <p class="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                        ${currentSearchQuery ? `لا توجد نتائج تطابق بحثك عن "${currentSearchQuery}".` : (currentCatalogMode === 'ondemand' ? 'تفضل باستعراض قسم التسليم الفوري أو تواصل مع مستشارنا لطلب تصميم خاص.' : 'لا توجد قطع جاهزة في هذا التصنيف حالياً، تفضل بالانتقال لـ (حياكة حسب الطلب).')}
                    </p>
                </div>
                <div class="flex items-center justify-center gap-2 flex-wrap">
                    <button onclick="window.resetSearchAndFilters()" class="btn-liquid-metal font-display text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2">
                        <span>إعادة تعيين البحث والتصنيفات</span>
                    </button>
                    ${currentCatalogMode === 'instant' ? `
                        <button onclick="window.switchCatalogMode('ondemand')" class="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-display font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5">
                            <span>🪄 استعراض تصاميم الحياكة بالطلب</span>
                        </button>
                    ` : `
                        <button onclick="window.switchCatalogMode('instant')" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-display font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-1.5">
                            <span>⚡ استعراض قطع التسليم الفوري</span>
                        </button>
                    `}
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
        mediaHtml += `<img src="${images[0]}" alt="${carpet.title}" class="w-full h-full object-cover shrink-0 snap-center card-img-zoom">`;

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
                        preload="metadata"
                        class="w-full h-full object-contain bg-[#fffbf7] cursor-pointer"
                        onclick="event.stopPropagation(); window.toggleCardVideoPlay('${carpet.id}')"
                        onended="window.handleCardVideoEnded('${carpet.id}')"
                    ></video>
                    
                    <!-- زر إيقاف وتشغيل تفاعلي فاخر بالوسط لبطاقة المنتج متناغم مع لون الثيم -->
                    <div id="card-video-center-btn-${carpet.id}" onclick="event.stopPropagation(); window.toggleCardVideoPlay('${carpet.id}')" class="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 pointer-events-auto z-10">
                        <button type="button" class="card-video-center-btn w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center text-base sm:text-lg text-white pointer-events-auto cursor-pointer group/cardplay" id="card-video-center-icon-${carpet.id}" title="بدء تشغيل الفيديو">
                            <span class="mr-[-2px] text-white group-hover/cardplay:scale-110 transition-transform">▶</span>
                        </button>
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
            mediaHtml += `<img src="${images[i]}" alt="${carpet.title}" class="w-full h-full object-cover shrink-0 snap-center card-img-zoom">`;
        }

        const isNew = isProductNew(carpet);
        const remainingDays = isNew ? getProductRemainingDays(carpet) : 0;

        const card = document.createElement('div');
        card.className = `carpet-card carpet-card-reveal bg-[#fffbf7] rounded-xl sm:rounded-2xl overflow-hidden border ${isNew ? 'card-exclusive-border' : 'border-stone-200/80'} shadow-2xs flex flex-col h-full cursor-pointer group relative`;
        card.setAttribute('data-carpet-id', carpet.id);
        card.setAttribute('data-base-price', carpet.price || 0);
        card.style.animationDelay = `${Math.min(index * 0.04, 0.3)}s`;
        card.onclick = () => openModal(carpet.id, allCarpets);

        // حساب بقعة اللمعان والوميض بدقة على سطح الصورة فقط دون تشويه أو تحريك نصوص وأزرار البطاقة
        card.addEventListener('mousemove', (e) => {
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
            card.style.removeProperty('--glare-x');
            card.style.removeProperty('--glare-y');
        });

        const cur = getCurrentCurrency();
        const displayPrice = convertFromOMR(carpet.price, cur);
        const currSymbolHTML = getCurrencySymbolHTML(cur);

        card.innerHTML = `
            <!-- الكتلة العلوية: الشريط الملاصق للصورة يمنع ظهور أي فراغ أبيض نهائياً -->
            <div class="w-full shrink-0 flex flex-col bg-stone-100 relative z-10">
                ${isNew ? `
                    <div class="exclusive-top-crown-ribbon ${isOutOfStock ? 'ribbon-static' : 'spark-badge-crystal'} rounded-t-xl" title="${isOutOfStock ? 'تصميم حصري من إرث الدار' : 'المنتج جديد وحصري'}">
                        <div class="flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black text-white whitespace-nowrap">
                            <span class="text-[9px] shrink-0">✨</span>
                            <span class="tracking-tight whitespace-nowrap">${isOutOfStock ? 'تصميم حصري (حياكة بالطلب)' : 'جديد وحصري'}</span>
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
                    <span class="card-badge-dimensions absolute top-1.5 right-1.5 bg-black/35 hover:bg-black/50 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs z-30 pointer-events-none border border-white/20 inline-flex items-center justify-center leading-none text-center select-none transition">
                        ${carpet.dimensions}
                    </span>

                    <!-- شارة نمط التوفر في أعلى اليسار (تسليم فوري أو حياكة بالطلب) بنفس حجم وتناسق الأبعاد تماماً -->
                    ${isOutOfStock ? `
                        <span class="card-badge-stock card-badge-availability absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-900/90 to-amber-950/90 backdrop-blur-md text-amber-200 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs z-30 pointer-events-none border border-amber-400/40 inline-flex items-center justify-center gap-1 leading-none text-center select-none transition">
                            <span class="text-[9px]">🪄</span>
                            <span>حياكة بالطلب</span>
                        </span>
                    ` : `
                        <span class="card-badge-stock card-badge-availability absolute top-1.5 left-1.5 bg-gradient-to-r from-emerald-900/90 to-emerald-950/90 backdrop-blur-md text-emerald-200 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs z-30 pointer-events-none border border-emerald-400/40 inline-flex items-center justify-center gap-1 leading-none text-center select-none transition">
                            <span class="text-[9px]">⚡</span>
                            <span>تسليم فوري</span>
                        </span>
                    `}

                    <div id="counter-wrapper-${carpet.id}" dir="ltr" class="card-badge-media absolute bottom-1.5 left-1.5 bg-black/30 backdrop-blur-md text-white/90 text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none border border-white/15 z-10 ${hasMultipleMedia ? '' : 'hidden'} inline-flex items-center justify-center leading-none text-center select-none">
                        <span id="counter-${carpet.id}">1</span><span class="mx-0.5 opacity-60">/</span><span id="total-${carpet.id}">${totalMedia}</span>
                    </div>

                    ${hasVideo ? `
                        <button 
                            type="button" 
                            id="video-badge-${carpet.id}" 
                            onclick="event.stopPropagation(); window.handleCardVideoBadgeClick('${carpet.id}')"
                            class="card-badge-video absolute bottom-1.5 right-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md text-amber-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-auto z-10 border border-white/20 inline-flex items-center justify-center gap-0.5 shadow-xs transition cursor-pointer leading-none select-none"
                            title="مشاهدة الفيديو"
                        >
                            <span class="text-[9px]">🎬</span>
                            <span class="badge-text">فيديو</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- الكتلة السفلية: مصغرة ومتناسقة لتثبيت السعر والزر في الأسفل -->
            <div class="card-content-wrap p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-white border-t border-stone-200/70 relative z-20">
                <div class="mb-1.5">
                    <h4 class="card-title-text font-royal-carpet font-bold text-stone-900 text-[10px] sm:text-[11px] leading-snug truncate group-hover:text-brand transition" title="${carpet.title}">${carpet.title}</h4>
                </div>

                <div class="card-price-row flex items-center justify-between gap-1 mt-auto">
                    <div class="flex items-baseline gap-0.5 shrink-0">
                        <span class="card-price-val font-display text-xs sm:text-[13px] font-black text-brand leading-none">${displayPrice}</span>
                        <span class="card-price-curr font-display text-brand text-[9px] sm:text-[10px] font-bold leading-none inline-flex items-center gap-0.5">${currSymbolHTML}</span>
                    </div>
                    
                    ${isOutOfStock ? `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="card-btn-preview btn-liquid-metal text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 h-6.5 sm:h-7 rounded-lg transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0 leading-none" title="طلب تفصيل هذا التصميم">
                            <span class="whitespace-nowrap">طلب تفصيل</span>
                            <span class="text-[8px] shrink-0">🪄</span>
                        </button>
                    ` : `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="card-btn-preview btn-liquid-metal text-white text-[8px] sm:text-[9px] font-bold px-2 sm:px-2.5 h-6.5 sm:h-7 rounded-lg transition shadow-2xs cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center justify-center leading-none">
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

    updateAllPricesOnPage();
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
            // لا تشغيل تلقائي - يبقى الفيديو متوقفاً والزر بانتظار نقرة الزائر في المنتصف
            const centerBtn = document.getElementById(`card-video-center-btn-${carpetId}`);
            if (centerBtn && cardVideo.paused) {
                centerBtn.classList.remove('opacity-0', 'pointer-events-none');
                centerBtn.classList.add('opacity-100', 'pointer-events-auto');
            }

            // تحويل الزر إلى أيقونة تكبير مصغرة ومحكمة ومتناسقة مع حجم الكارد وزر كتم الصوت
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
            const centerBtn = document.getElementById(`card-video-center-btn-${carpetId}`);
            if (centerBtn) {
                centerBtn.classList.remove('opacity-0', 'pointer-events-none');
                centerBtn.classList.add('opacity-100', 'pointer-events-auto');
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

window.handleCardVideoEnded = (carpetId) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    const centerBtn = document.getElementById(`card-video-center-btn-${carpetId}`);
    const centerIcon = document.getElementById(`card-video-center-icon-${carpetId}`);
    if (cardVideo) {
        cardVideo.pause();
        cardVideo.currentTime = 0;
    }
    if (centerBtn) {
        centerBtn.classList.remove('opacity-0', 'pointer-events-none');
        centerBtn.classList.add('opacity-100', 'pointer-events-auto');
    }
    if (centerIcon) {
        centerIcon.innerHTML = '<span class="mr-[-2px] text-white">▶</span>';
    }
};

window.toggleCardVideoPlay = (carpetId) => {
    const cardVideo = document.getElementById(`card-video-${carpetId}`);
    if (!cardVideo) return;

    const centerBtn = document.getElementById(`card-video-center-btn-${carpetId}`);
    const centerIcon = document.getElementById(`card-video-center-icon-${carpetId}`);

    if (cardVideo.paused) {
        if (cardVideo.ended || (cardVideo.duration && cardVideo.currentTime >= cardVideo.duration - 0.1)) {
            cardVideo.currentTime = 0;
        }
        const onPlaying = () => {
            if (centerBtn) {
                centerBtn.classList.remove('opacity-100', 'pointer-events-auto');
                centerBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        };

        const playPromise = cardVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(onPlaying).catch(() => {
                cardVideo.muted = true;
                cardVideo.play().then(onPlaying).catch(() => {});
            });
        }
    } else {
        cardVideo.pause();
        if (centerBtn) {
            centerBtn.classList.remove('opacity-0', 'pointer-events-none');
            centerBtn.classList.add('opacity-100', 'pointer-events-auto');
        }
        if (centerIcon) {
            centerIcon.innerHTML = '<span class="mr-[-2px] text-white">▶</span>';
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
// منطق نمط المعرض (تسليم فوري vs حياكة حسب الطلب)
// ==========================================

export function switchCatalogMode(mode) {
    if (mode !== 'instant' && mode !== 'ondemand') return;
    currentCatalogMode = mode;

    const container = document.getElementById('catalog-segmented-container');
    const instantBtn = document.getElementById('tab-mode-instant');
    const ondemandBtn = document.getElementById('tab-mode-ondemand');
    const captionIcon = document.getElementById('catalog-mode-caption-icon');
    const captionText = document.getElementById('catalog-mode-caption-text');
    const captionBox = document.getElementById('catalog-mode-caption');

    if (container) {
        container.classList.toggle('is-instant', mode === 'instant');
        container.classList.toggle('is-ondemand', mode === 'ondemand');
    }

    if (instantBtn && ondemandBtn) {
        if (mode === 'instant') {
            instantBtn.classList.add('active');
            instantBtn.setAttribute('aria-selected', 'true');
            ondemandBtn.classList.remove('active');
            ondemandBtn.setAttribute('aria-selected', 'false');
        } else {
            ondemandBtn.classList.add('active');
            ondemandBtn.setAttribute('aria-selected', 'true');
            instantBtn.classList.remove('active');
            instantBtn.setAttribute('aria-selected', 'false');
        }
    }

    if (captionIcon && captionText) {
        if (mode === 'instant') {
            captionIcon.innerText = '📦';
            captionText.innerText = 'قطع نادرة متوفرة في صالة العرض، جاهزة للشحن والتسليم الفوري لمنزلك خلال 24-48 ساعة.';
        } else {
            captionIcon.innerText = '🪄';
            captionText.innerText = 'تصاميم حصرية من إرث دار التطريز؛ ننسجها لك يدوياً بأبعادك وباليت ألوانك المفضلة.';
        }
    }

    if (captionBox) {
        captionBox.classList.remove('catalog-mode-caption-box');
        void captionBox.offsetWidth;
        captionBox.classList.add('catalog-mode-caption-box');
    }

    updateCategoryCounts();
    filterAndDisplayCarpets(true);
}

// ==========================================
// منطق البحث، التصفية، والفرز الذكي
// ==========================================

function updateCategoryCounts() {
    const setBadge = (id, count) => {
        const el = document.getElementById(id);
        if (el) el.innerText = count;
    };

    const instantCount = allCarpets.filter(c => c.status !== 'out_of_stock').length;
    const ondemandCount = allCarpets.filter(c => c.status === 'out_of_stock').length;
    setBadge('badge-count-instant', instantCount);
    setBadge('badge-count-ondemand', ondemandCount);

    // حساب العدادات للتصنيفات وفق النمط النشط حالياً
    const currentModePool = allCarpets.filter(c => currentCatalogMode === 'ondemand' ? c.status === 'out_of_stock' : c.status !== 'out_of_stock');
    setBadge('count-all', currentModePool.length);

    // تحديث عدادات جميع التصنيفات النشطة ديناميكياً
    try {
        getActiveCategories().forEach(cat => {
            const cCount = currentModePool.filter(c => c.category === cat.id).length;
            setBadge(`count-${cat.id}`, cCount);
        });
    } catch(e) {}
}

function filterAndDisplayCarpets(resetPage = true) {
    if (resetPage) {
        currentCarpetPage = 1;
    }
    let result = [...allCarpets];

    // 0. تصفية حسب نمط التوفر (تسليم فوري vs حياكة حسب الطلب)
    if (currentCatalogMode === 'instant') {
        result = result.filter(c => c.status !== 'out_of_stock');
    } else if (currentCatalogMode === 'ondemand') {
        result = result.filter(c => c.status === 'out_of_stock');
    }

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

    filteredCarpetsList = result;
    renderPaginatedCarpets(false);
}

function renderPaginatedCarpets(shouldScroll = false) {
    const totalItems = filteredCarpetsList.length;
    const totalPages = Math.ceil(totalItems / CARPETS_PER_PAGE) || 1;

    if (currentCarpetPage > totalPages) currentCarpetPage = totalPages;
    if (currentCarpetPage < 1) currentCarpetPage = 1;

    const startIndex = (currentCarpetPage - 1) * CARPETS_PER_PAGE;
    const endIndex = Math.min(startIndex + CARPETS_PER_PAGE, totalItems);
    const paginatedItems = filteredCarpetsList.slice(startIndex, endIndex);

    displayCarpets(paginatedItems);
    renderPaginationControls(totalItems, currentCarpetPage, totalPages);

    if (shouldScroll) {
        const grid = document.getElementById('carpets-grid');
        if (grid) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = grid.getBoundingClientRect().top;
            const offsetPosition = elementRect - bodyRect - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
}

function renderPaginationControls(totalItems, currentPage, totalPages) {
    const container = document.getElementById('carpets-pagination');
    if (!container) return;

    if (totalItems <= CARPETS_PER_PAGE || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let pages = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= 4) {
            pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (currentPage >= totalPages - 3) {
            pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
        }
    }

    const pageButtonsHtml = pages.map(p => {
        if (p === '...') {
            return `<span class="px-1.5 text-stone-400 font-bold select-none text-xs">•••</span>`;
        }
        const isActive = p === currentPage;
        return `
            <button 
                type="button" 
                onclick="window.changeCarpetPage(${p})" 
                class="pagination-btn ${isActive ? 'active' : ''}" 
                ${isActive ? 'aria-current="page"' : ''}
                title="الانتقال إلى صفحة ${p}">
                ${p}
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <nav aria-label="ترقيم صفحات المعرض" class="pagination-capsule" dir="rtl">
            <!-- زر السابق -->
            <button 
                type="button" 
                onclick="window.changeCarpetPage(${currentPage - 1})" 
                class="pagination-nav-btn" 
                ${currentPage === 1 ? 'disabled' : ''} 
                title="الصفحة السابقة">
                <span class="text-sm">→</span>
                <span class="hidden sm:inline">السابق</span>
            </button>

            <!-- الأرقام للكمبيوتر والتابلت -->
            <div class="hidden sm:flex items-center gap-1 px-0.5">
                ${pageButtonsHtml}
            </div>

            <!-- عداد ملموم ومريح للجوال -->
            <div class="sm:hidden px-2 py-0.5 text-xs font-bold text-stone-800 whitespace-nowrap">
                صفحة <span class="text-brand font-black">${currentPage}</span> من <span>${totalPages}</span>
            </div>

            <!-- زر التالي -->
            <button 
                type="button" 
                onclick="window.changeCarpetPage(${currentPage + 1})" 
                class="pagination-nav-btn" 
                ${currentPage === totalPages ? 'disabled' : ''} 
                title="الصفحة التالية">
                <span class="hidden sm:inline">التالي</span>
                <span class="text-sm">←</span>
            </button>

            <!-- فاصل أنيق على نفس السطر -->
            <span class="pagination-divider"></span>

            <!-- إجمالي عدد القطع والصفحات بنفس السطر -->
            <div class="pagination-summary-pill" title="إجمالي ${totalItems} قطعة معروضة مقسمة على ${totalPages} صفحات">
                <span class="font-extrabold text-brand">${totalItems}</span>
                <span class="text-[11px] sm:text-xs">قطعة</span>
                <span class="opacity-30 font-light">•</span>
                <span class="text-[11px] sm:text-xs font-bold text-stone-700">${totalPages} صفحات</span>
            </div>
        </nav>
    `;
}

window.changeCarpetPage = function(page) {
    currentCarpetPage = page;
    renderPaginatedCarpets(true);
};

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
    { id: 'ajami', name: 'نقشات عجمية', englishName: 'Ajami', icon: '✨', code: 'A' },
    { id: 'silk', name: 'سجاد حريري', englishName: 'Silk', icon: '🧵', code: 'S' },
    { id: 'traditional', name: 'تراثي أصيل', englishName: 'Traditional', icon: '🏛️', code: 'T' },
    { id: 'modern', name: 'مودرن معاصر', englishName: 'Modern', icon: '🎨', code: 'M' },
    { id: 'wool', name: 'صوف فاخر', englishName: 'Wool', icon: '🧶', code: 'W' }
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
            closeCurrencyModal();
        }
    });

    loadCarpets();
    switchCatalogMode('ondemand');
    initDynamicShowcase();
    updateAllPricesOnPage();
});

// ==========================================
// محرك عرض الأقسام الترويجية اللحظي (Dynamic Showcase Engine)
// مزامنة حية لجميع الزوار مع دعم ترقيم وتبديل الفيديوهات
// ==========================================
let activeCinemaIndex = 0;
let currentCinemaVideos = [];

export function getPublicShowcaseSettings() {
    try {
        const stored = localStorage.getItem('tatr_showcase_settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.version === 4 && Array.isArray(parsed.journeySteps) && parsed.journeySteps.length >= 7) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not parse showcase settings for public view:", e);
    }
    const defaults = getDefaultShowcaseSettings();
    try {
        localStorage.setItem('tatr_showcase_settings', JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
}

export function initDynamicShowcase() {
    const initialSettings = getPublicShowcaseSettings();
    renderAllShowcaseSections(initialSettings);

    // الاستماع للتحديثات اللحظية من Firebase Firestore
    if (isFirebaseConfigured()) {
        try {
            subscribeToShowcaseSettings((cloudSettings) => {
                if (cloudSettings && Array.isArray(cloudSettings.marqueeItems)) {
                    try {
                        localStorage.setItem('tatr_showcase_settings', JSON.stringify(cloudSettings));
                    } catch (e) {}
                    renderAllShowcaseSections(cloudSettings);
                }
            });
        } catch (err) {
            console.warn("Could not subscribe to showcase cloud updates:", err);
        }
    }
}

function renderAllShowcaseSections(settings) {
    if (!settings) return;
    if (Array.isArray(settings.marqueeItems)) renderDynamicMarquee(settings.marqueeItems);
    if (Array.isArray(settings.cinemaVideos)) renderDynamicCinema(settings.cinemaVideos);
    if (Array.isArray(settings.journeySteps)) renderDynamicJourney(settings.journeySteps);
    if (Array.isArray(settings.lookbookItems)) renderDynamicLookbook(settings.lookbookItems);
}

// 1. بناء شريط العبارات المتحركة ديناميكياً
function renderDynamicMarquee(items) {
    const track = document.getElementById('dynamic-marquee-track');
    if (!track || !items || items.length === 0) return;

    const buildItemsHtml = (list) => list.map(it => `
        <div class="marquee-item">
            <span class="text-base text-amber-500">${it.icon || '⚜️'}</span>
            <span class="font-bold text-stone-800 text-xs sm:text-sm">${it.title}</span>
            <span class="text-[11px] text-stone-600 hidden sm:inline">• ${it.desc}</span>
        </div>
    `).join('');

    // تكرار القائمة مرتين لضمان التدفق السلس اللانهائي بدون انقطاع
    track.innerHTML = buildItemsHtml(items) + buildItemsHtml(items);
}

// ==========================================
// دالة مساعدة لضبط مسارات الصور والوسائط للمجلد الجذري ومجلد screen
// ==========================================
function resolveAssetPath(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('idb:')) return path;
    const isScreenDir = window.location.pathname.includes('/screen/');
    let clean = path.replace(/^\.\.\//, '').replace(/^\.\//, '');
    return isScreenDir ? `../${clean}` : clean;
}

// ==========================================
// 2. مشغل سينما الحرفة اليدوية والمشهد الوثائقي (Atelier Cinema Player)
// ==========================================
let activeBlobUrl = null;
let isCinemaTransitioning = false;
let cinemaTouchStartX = 0;
let cinemaTouchStartY = 0;
let isCinemaMuted = false;

function updateMotionUI(isPlaying) {
    const playIcon = document.getElementById('cinema-play-icon');
    const playText = document.getElementById('cinema-play-text');
    const centerWrap = document.getElementById('cinema-video-center-btn-wrap');
    const centerIcon = document.getElementById('cinema-video-center-icon');

    if (isPlaying) {
        if (playIcon) playIcon.innerText = '⏸';
        if (playText) playText.innerText = 'إيقاف مؤقت';
        if (centerWrap) {
            centerWrap.classList.remove('opacity-100', 'pointer-events-auto');
            centerWrap.classList.add('opacity-0', 'pointer-events-none');
        }
        if (centerIcon) centerIcon.innerText = '⏸';
    } else {
        if (playIcon) playIcon.innerText = '▶';
        if (playText) playText.innerText = 'مشاهدة الفيديو';
        if (centerWrap) {
            centerWrap.classList.remove('opacity-0', 'pointer-events-none');
            centerWrap.classList.add('opacity-100', 'pointer-events-auto');
        }
        if (centerIcon) centerIcon.innerText = '▶';
    }
}

function renderDynamicCinema(videos) {
    currentCinemaVideos = videos || [];
    if (currentCinemaVideos.length === 0) return;

    // العثور على الفيديو النشط أو الأول
    const activeIdx = currentCinemaVideos.findIndex(v => v.isActive);
    activeCinemaIndex = activeIdx >= 0 ? activeIdx : 0;

    applyActiveCinemaContent(false);
    initCinemaSwipeGestures();
}

function checkAndUpdateVideoOrientation(videoEl) {
    if (!videoEl) return;
    const screenBox = document.getElementById('cinema-screen-box');
    if (!screenBox) return;

    const w = videoEl.videoWidth || 0;
    const h = videoEl.videoHeight || 0;

    if (w > 0 && h > 0) {
        if (h > w) {
            screenBox.classList.add('is-vertical-cinema');
            screenBox.classList.remove('aspect-video');
        } else {
            screenBox.classList.remove('is-vertical-cinema');
            screenBox.classList.add('aspect-video');
        }
    }
}

function setCinemaVideoSource(targetUrl, posterUrl, autoPlay = false) {
    const videoEl = document.getElementById('atelier-cinema-video');
    if (!videoEl) return;

    if (activeBlobUrl && activeBlobUrl.startsWith('blob:') && activeBlobUrl !== targetUrl) {
        try { URL.revokeObjectURL(activeBlobUrl); } catch (e) {}
    }
    if (targetUrl && targetUrl.startsWith('blob:')) {
        activeBlobUrl = targetUrl;
    }

    videoEl.pause();

    while (videoEl.firstChild) {
        if (videoEl.firstChild.nodeName === 'SOURCE') {
            videoEl.removeChild(videoEl.firstChild);
        } else {
            break;
        }
    }

    if (posterUrl) {
        videoEl.poster = posterUrl;
        const ambientBackdrop = document.getElementById('cinema-ambient-backdrop');
        if (ambientBackdrop) {
            ambientBackdrop.src = posterUrl;
        }
    }

    if (!videoEl._orientationBound) {
        videoEl._orientationBound = true;
        videoEl.addEventListener('loadedmetadata', () => {
            checkAndUpdateVideoOrientation(videoEl);
        });
    }

    if (targetUrl) {
        videoEl.src = targetUrl;
        videoEl.load();
    }

    if (videoEl.videoWidth && videoEl.videoHeight) {
        checkAndUpdateVideoOrientation(videoEl);
    }

    const updatePlayingUI = () => updateMotionUI(true);
    const updatePausedUI = () => updateMotionUI(false);

    if (!videoEl._playPauseBound) {
        videoEl._playPauseBound = true;
        videoEl.addEventListener('play', updatePlayingUI);
        videoEl.addEventListener('pause', updatePausedUI);
        videoEl.addEventListener('ended', () => {
            if (typeof window.handleCinemaVideoEnded === 'function') {
                window.handleCinemaVideoEnded();
            }
        });
    }

    if (autoPlay && targetUrl) {
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.then(updatePlayingUI).catch(() => {
                videoEl.muted = true;
                videoEl.play().then(updatePlayingUI).catch(updatePausedUI);
            });
        }
    } else {
        updatePausedUI();
    }
}

function applyActiveCinemaContent(autoPlay = false) {
    if (!currentCinemaVideos || currentCinemaVideos.length === 0) return;
    if (activeCinemaIndex >= currentCinemaVideos.length) activeCinemaIndex = 0;
    if (activeCinemaIndex < 0) activeCinemaIndex = currentCinemaVideos.length - 1;

    const vid = currentCinemaVideos[activeCinemaIndex];
    if (!vid) return;

    const screenBox = document.getElementById('cinema-screen-box');
    if (screenBox) {
        if (vid.isVertical === true) {
            screenBox.classList.add('is-vertical-cinema');
            screenBox.classList.remove('aspect-video');
        } else if (vid.isVertical === false) {
            screenBox.classList.remove('is-vertical-cinema');
            screenBox.classList.add('aspect-video');
        }
    }

    const liveBadge = document.getElementById('cinema-display-livebadge');
    const subtitleEl = document.getElementById('cinema-display-subtitle');
    const titleEl = document.getElementById('cinema-display-title');
    const quoteEl = document.getElementById('cinema-display-quote');
    const captionEl = document.getElementById('cinema-display-caption');
    const hoursEl = document.getElementById('cinema-stat-hours');
    const materialEl = document.getElementById('cinema-stat-material');
    const knotsEl = document.getElementById('cinema-stat-knots');

    const pageIndicator = document.getElementById('cinema-video-page-indicator');
    const indicatorsContainer = document.getElementById('cinema-video-indicators');
    const videoNav = document.getElementById('cinema-video-nav');

    if (liveBadge) liveBadge.innerText = vid.subtitle || '🎬 وثائقي المشغل اليدوي • كواليس الصنعة';
    if (subtitleEl) subtitleEl.innerText = vid.subtitle || '✨ أصالة المشغل اليدوي';
    if (titleEl) titleEl.innerText = vid.title || 'من الخيط إلى التحفة الملكية.. رحلة حياكة السجاد بمسدس التطريز';
    if (quoteEl) quoteEl.innerText = vid.quote || '«كل سجادة تخرج من دار التطريز ليست مجرد غطاء للأرضية، بل لوحة فنية عريقة استغرقت مئات الساعات من الدقة والشغف لتمنح مساحتك روحاً دافئة ومتميزة لا تتكرر في أي مكان آخر.»';
    if (captionEl) captionEl.innerText = vid.caption || 'توثيق حي لحركات الأنامل وتطريز السجاد بمسدس الحياكة اليدوي';

    if (hoursEl && vid.stats) hoursEl.innerText = vid.stats.hours || '+70 ساعة';
    if (materialEl && vid.stats) materialEl.innerText = vid.stats.material || '100% صوف';
    if (knotsEl && vid.stats) knotsEl.innerText = vid.stats.knots || '+80K غرزة';

    const posterUrl = resolveAssetPath(vid.posterUrl || 'images/step3_tufting.jpg');
    const ambientBackdrop = document.getElementById('cinema-ambient-backdrop');
    if (ambientBackdrop && posterUrl) {
        ambientBackdrop.src = posterUrl;
    }

    // إعداد وتشغيل الفيديو الحقيقي مباشرة وبدون استبداله بأي صور
    const targetVideoUrl = resolveAssetPath(vid.videoUrl || '');

    if (targetVideoUrl.startsWith('idb://video_')) {
        getVideoFromIndexedDB(targetVideoUrl).then(blobUrl => {
            setCinemaVideoSource(blobUrl || null, posterUrl, autoPlay);
        }).catch(() => {
            setCinemaVideoSource(null, posterUrl, false);
        });
    } else {
        setCinemaVideoSource(targetVideoUrl, posterUrl, autoPlay);
    }

    // إظهار أو إخفاء شريط التنقل حسب عدد الفيديوهات (إن كان فيديو واحد يخفى تماماً)
    if (videoNav) {
        if (currentCinemaVideos.length > 1) {
            videoNav.classList.remove('hidden');
        } else {
            videoNav.classList.add('hidden');
        }
    }

    // تحديث الترقيم والمؤشرات للزائر إن وجد أكثر من فيديو
    if (pageIndicator) {
        pageIndicator.innerText = `فيديو ${activeCinemaIndex + 1} من ${currentCinemaVideos.length}`;
    }

    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = currentCinemaVideos.map((_, idx) => `
            <button type="button" onclick="window.selectCinemaVideo(${idx})" class="h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === activeCinemaIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}" title="الانتقال إلى الفيديو ${idx + 1}"></button>
        `).join('');
    }
}

// دالة تحريك وانزلاق البطاقة بالكامل لليمين أو اليسار
function navigateCinemaScene(direction, targetIdx, autoPlay = false) {
    if (!currentCinemaVideos || currentCinemaVideos.length <= 1) return;
    if (isCinemaTransitioning) return;
    if (targetIdx === activeCinemaIndex) return;

    isCinemaTransitioning = true;
    const card = document.getElementById('cinema-scene-card');

    if (!card) {
        activeCinemaIndex = targetIdx;
        applyActiveCinemaContent(autoPlay);
        isCinemaTransitioning = false;
        return;
    }

    const outClass = direction === 'next' ? 'cinema-slide-out-left' : 'cinema-slide-out-right';
    const inClass = direction === 'next' ? 'cinema-slide-in-right' : 'cinema-slide-in-left';

    card.classList.remove('cinema-slide-active', 'cinema-slide-out-left', 'cinema-slide-out-right', 'cinema-slide-in-left', 'cinema-slide-in-right');
    card.classList.add(outClass);

    setTimeout(() => {
        activeCinemaIndex = targetIdx;
        applyActiveCinemaContent(autoPlay);

        card.style.transition = 'none';
        card.classList.remove(outClass);
        card.classList.add(inClass);

        void card.offsetWidth;

        card.style.transition = '';
        card.classList.remove(inClass);
        card.classList.add('cinema-slide-active');

        setTimeout(() => {
            card.classList.remove('cinema-slide-active');
            isCinemaTransitioning = false;
        }, 300);
    }, 220);
}

function applyActiveCinemaVideo(autoPlay = false) {
    applyActiveCinemaContent(autoPlay);
}

window.selectCinemaVideo = function(idx) {
    if (idx === activeCinemaIndex) return;
    const direction = idx > activeCinemaIndex ? 'next' : 'prev';
    const video = document.getElementById('atelier-cinema-video');
    const isPlaying = video && !video.paused;
    navigateCinemaScene(direction, idx, isPlaying);
};

window.prevCinemaVideo = function() {
    if (!currentCinemaVideos || currentCinemaVideos.length <= 1) return;
    const prevIdx = (activeCinemaIndex - 1 + currentCinemaVideos.length) % currentCinemaVideos.length;
    const video = document.getElementById('atelier-cinema-video');
    const isPlaying = video && !video.paused;
    navigateCinemaScene('prev', prevIdx, isPlaying);
};

window.nextCinemaVideo = function() {
    if (!currentCinemaVideos || currentCinemaVideos.length <= 1) return;
    const nextIdx = (activeCinemaIndex + 1) % currentCinemaVideos.length;
    const video = document.getElementById('atelier-cinema-video');
    const isPlaying = video && !video.paused;
    navigateCinemaScene('next', nextIdx, isPlaying);
};

// مستمعات السحب باللمس على الجوال (Touch Swipe Support)
function initCinemaSwipeGestures() {
    const container = document.getElementById('cinema-section-container') || document.querySelector('.cinema-container');
    if (!container || container._swipeInitialized) return;
    container._swipeInitialized = true;

    container.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        cinemaTouchStartX = e.touches[0].clientX;
        cinemaTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const deltaX = e.changedTouches[0].clientX - cinemaTouchStartX;
        const deltaY = e.changedTouches[0].clientY - cinemaTouchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            if (deltaX < 0) {
                window.nextCinemaVideo();
            } else {
                window.prevCinemaVideo();
            }
        }
    }, { passive: true });
}

// 3. بناء كروت مراحل الحرفة ديناميكياً (7 مراحل متكاملة)
function renderDynamicJourney(steps) {
    const grid = document.getElementById('dynamic-journey-grid');
    if (!grid || !steps || steps.length === 0) return;

    grid.className = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6`;

    grid.innerHTML = steps.map(step => `
        <div class="journey-step-card flex flex-col group">
            <div class="relative w-full aspect-4/3 overflow-hidden bg-stone-100 rounded-t-xl sm:rounded-t-2xl">
                <img src="${resolveAssetPath(step.imgUrl || 'images/step1_design.jpg')}" alt="${step.title}" class="journey-step-img w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" loading="lazy">
                <span class="absolute top-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md text-amber-300 font-number font-black text-xs rounded-lg border border-white/20 shadow-xs">
                    خطوة ${step.stepNum || '01'}
                </span>
            </div>
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-2.5 bg-white border border-t-0 border-stone-200/80 rounded-b-xl sm:rounded-b-2xl shadow-2xs group-hover:shadow-md transition-shadow duration-300">
                <div>
                    <h3 class="font-bold text-stone-900 text-sm sm:text-base mb-1.5 group-hover:text-amber-800 transition-colors">
                        ${step.title}
                    </h3>
                    <p class="text-stone-600 text-xs leading-relaxed">
                        ${step.desc}
                    </p>
                </div>
                ${step.tag ? `
                <span class="text-[11px] font-bold text-amber-800 bg-amber-50/80 border border-amber-200/50 px-2 py-1 rounded-lg flex items-center gap-1 mt-1 w-fit">
                    <span>${step.tag}</span>
                </span>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// 4. بناء كروت توثيق تسليم القطع وآراء العملاء ديناميكياً
function renderDynamicLookbook(items) {
    const grid = document.getElementById('dynamic-lookbook-grid');
    if (!grid || !items || items.length === 0) return;

    grid.innerHTML = items.map(it => {
        const ratingNum = Number(it.rating) || 5;
        const starsHtml = '★'.repeat(ratingNum);
        return `
            <div class="lookbook-card flex flex-col group">
                <div class="relative w-full aspect-4/3 overflow-hidden bg-stone-100">
                    <img src="${resolveAssetPath(it.imgUrl || 'images/client_room1.jpg')}" alt="${it.carpetTitle}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700" loading="lazy">
                    <span class="absolute top-3 right-3 px-3 py-1 bg-black/65 backdrop-blur-md text-white font-bold text-xs rounded-full border border-white/20 shadow-md">
                        ${it.location || 'مسقط'}
                    </span>
                    <span class="absolute bottom-3 left-3 px-3 py-1 bg-amber-950/70 backdrop-blur-md text-amber-200 font-bold text-xs rounded-full border border-amber-400/30">
                        ${it.carpetTitle || 'سجادة ملكية'}
                    </span>
                </div>
                <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-3 bg-[#fffbf7]">
                    <div class="flex items-center gap-1 text-amber-400 text-sm">
                        <span>${starsHtml}</span>
                        <span class="text-xs font-bold text-stone-700 mr-2">تقييم معتمد ${ratingNum.toFixed(1)}</span>
                    </div>
                    <p class="text-stone-700 text-xs sm:text-sm leading-relaxed italic font-medium">
                        "${it.reviewText}"
                    </p>
                    <div class="pt-3 border-t border-stone-200/70 flex items-center justify-between">
                        <span class="font-bold text-stone-900 text-xs sm:text-sm">${it.clientName}</span>
                        <span class="text-[11px] text-stone-600">${it.orderType || 'طلب تفصيل خاص'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// التحكم في مشغل سينما الحرفة اليدوية (Atelier Cinema)
// ==========================================
window.handleCinemaVideoEnded = function() {
    const video = document.getElementById('atelier-cinema-video');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    updateMotionUI(false);
};

window.toggleCinemaVideoPlay = function() {
    const video = document.getElementById('atelier-cinema-video');
    if (!video) return;

    if (video.paused) {
        if (video.ended || (video.duration && video.currentTime >= video.duration - 0.1)) {
            video.currentTime = 0;
        }
        if (!video.src && currentCinemaVideos && currentCinemaVideos[activeCinemaIndex]) {
            applyActiveCinemaContent(false);
        }

        const onPlaying = () => updateMotionUI(true);

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(onPlaying).catch(() => {
                video.muted = true;
                video.play().then(onPlaying).catch(() => {});
            });
        }
    } else {
        video.pause();
        updateMotionUI(false);
    }
};

window.toggleCinemaVideoAudio = function() {
    isCinemaMuted = !isCinemaMuted;
    const icon = document.getElementById('cinema-audio-icon');
    if (icon) {
        icon.innerText = isCinemaMuted ? '🔇' : '🔊';
    }
    const video = document.getElementById('atelier-cinema-video');
    if (video) {
        video.muted = isCinemaMuted;
    }
};

window.toggleCinemaVideoFullscreen = function() {
    const box = document.getElementById('cinema-screen-box') || document.getElementById('atelier-cinema-video');
    if (!box) return;

    if (!document.fullscreenElement) {
        if (box.requestFullscreen) {
            box.requestFullscreen();
        } else if (box.webkitRequestFullscreen) {
            box.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};