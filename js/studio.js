// ==========================================================================
// استوديو تصاميم ونشر السوشيال ميديا وحالات الواتساب (Tatriza Creative Studio)
// دار تطريز TATRIZA — تصميم وتصدير بوستات وستوريات احترافية بدقة فائقة
// تحكم كامل بحجم وحركة الصورة (تكبير، تصغير، يمين، يسار، أعلى، أسفل)
// ==========================================================================

import { showToast } from './modals.js';

// ==========================================
// الإعدادات والقوالب وثيمات التصميم
// ==========================================

// 1. ثيمات الشادو الدائري لنمط الستوري كامل الشاشة (Story / Reels Vignette)
export const STUDIO_VIGNETTES = {
    'blush-rose': {
        id: 'blush-rose',
        name: 'الوردي والبيج الدافئ (كالأصل)',
        badge: '🌸 الأكثر تطابقاً',
        topColorRgb: '228, 196, 184',
        bottomColorRgb: '224, 187, 174',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(228, 196, 184, 0.95) 0%, rgba(228, 196, 184, 0.8) 35%, rgba(228, 196, 184, 0.3) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(224, 187, 174, 0.96) 0%, rgba(224, 187, 174, 0.88) 40%, rgba(224, 187, 174, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 10px rgba(0,0,0,0.4)',
        handleColor: '#5c453d'
    },
    'royal-burgundy': {
        id: 'royal-burgundy',
        name: 'العنابي الملكي والذهب',
        badge: '👑 فاخر ملكي',
        topColorRgb: '43, 6, 19',
        bottomColorRgb: '43, 6, 19',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(43, 6, 19, 0.95) 0%, rgba(43, 6, 19, 0.8) 35%, rgba(43, 6, 19, 0.3) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(43, 6, 19, 0.96) 0%, rgba(43, 6, 19, 0.88) 40%, rgba(43, 6, 19, 0.45) 75%, transparent 100%)',
        phraseColor: '#fde047',
        phraseShadow: '0 2px 12px rgba(0,0,0,0.7)',
        handleColor: '#f3cf7a'
    },
    'obsidian-gold': {
        id: 'obsidian-gold',
        name: 'الأوبسيديان الفاخر الداكن',
        badge: '🖤 فخامة داكنة',
        topColorRgb: '12, 13, 16',
        bottomColorRgb: '10, 11, 14',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(12, 13, 16, 0.95) 0%, rgba(12, 13, 16, 0.8) 35%, rgba(12, 13, 16, 0.3) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(10, 11, 14, 0.96) 0%, rgba(10, 11, 14, 0.88) 40%, rgba(10, 11, 14, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 12px rgba(0,0,0,0.7)',
        handleColor: '#e5b842'
    },
    'warm-ivory': {
        id: 'warm-ivory',
        name: 'العاجي والذهب الدافئ',
        badge: '✨ نهاري مشرق',
        topColorRgb: '235, 225, 212',
        bottomColorRgb: '230, 218, 202',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(235, 225, 212, 0.95) 0%, rgba(235, 225, 212, 0.8) 35%, rgba(235, 225, 212, 0.3) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(230, 218, 202, 0.96) 0%, rgba(230, 218, 202, 0.88) 40%, rgba(230, 218, 202, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 10px rgba(0,0,0,0.4)',
        handleColor: '#4a382e'
    }
};

// 2. ثيمات نمط كارت السجادة الملكي (Card Mode)
export const STUDIO_THEMES = {
    'royal-burgundy': {
        id: 'royal-burgundy',
        name: 'العنابي الملكي والذهب',
        badge: '👑 فاخر وأيقوني',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #2b0613 0%, #681530 45%, #8a1d41 70%, #1f030c 100%)',
        textColor: '#ffffff',
        accentColor: '#f3cf7a',
        cardBg: 'rgba(28, 6, 14, 0.65)',
        cardBorder: 'rgba(243, 207, 122, 0.35)',
        badgeBg: 'rgba(243, 207, 122, 0.18)',
        badgeText: '#f8deb0'
    },
    'warm-mocha': {
        id: 'warm-mocha',
        name: 'الموكا الدافئ والعاجي',
        badge: '☕ دافئ ومتناسق',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #1c1310 0%, #3d2a23 45%, #593e34 70%, #150d0a 100%)',
        textColor: '#fffbf7',
        accentColor: '#fbbf24',
        cardBg: 'rgba(30, 20, 16, 0.7)',
        cardBorder: 'rgba(251, 191, 36, 0.35)',
        badgeBg: 'rgba(251, 191, 36, 0.16)',
        badgeText: '#fef3c7'
    },
    'obsidian-gold': {
        id: 'obsidian-gold',
        name: 'الأوبسيديان الفاخر والذهب',
        badge: '🖤 فخامة داكنة',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #090a0d 0%, #161b22 50%, #21262d 75%, #050608 100%)',
        textColor: '#ffffff',
        accentColor: '#e5b842',
        cardBg: 'rgba(10, 12, 16, 0.75)',
        cardBorder: 'rgba(229, 184, 66, 0.4)',
        badgeBg: 'rgba(229, 184, 66, 0.2)',
        badgeText: '#fcedbb'
    },
    'majlis-marble': {
        id: 'majlis-marble',
        name: 'المجلس الرخامي الإيطالي',
        badge: '🏛️ موك آب واقعي',
        bgType: 'image',
        bgValue: '../images/studio_marble_majlis.jpg',
        textColor: '#ffffff',
        accentColor: '#f7d382',
        cardBg: 'rgba(15, 12, 10, 0.78)',
        cardBorder: 'rgba(247, 211, 130, 0.45)',
        badgeBg: 'rgba(247, 211, 130, 0.22)',
        badgeText: '#fae6b8'
    },
    'modern-parquet': {
        id: 'modern-parquet',
        name: 'الباركيه الفرنسي الفاخر',
        badge: '🪵 استوديو خشبي',
        bgType: 'image',
        bgValue: '../images/studio_parquet_wood.jpg',
        textColor: '#ffffff',
        accentColor: '#fad074',
        cardBg: 'rgba(25, 20, 16, 0.75)',
        cardBorder: 'rgba(250, 208, 116, 0.4)',
        badgeBg: 'rgba(250, 208, 116, 0.2)',
        badgeText: '#fce4a6'
    }
};

// 3. مقاسات ونسب الأبعاد
export const STUDIO_RATIOS = {
    '1:1': {
        id: '1:1',
        name: 'مربع (1:1)',
        subtitle: 'إنستقرام وفيسبوك وتويتر',
        width: 1080,
        height: 1080,
        aspectClass: 'aspect-square',
        canvasW: 1080,
        canvasH: 1080
    },
    '9:16': {
        id: '9:16',
        name: 'ستوري / حالة (9:16)',
        subtitle: 'واتساب وريلز وتيك توك',
        width: 1080,
        height: 1920,
        aspectClass: 'aspect-[9/16]',
        canvasW: 1080,
        canvasH: 1920
    },
    '4:5': {
        id: '4:5',
        name: 'إنستقرام طولي (4:5)',
        subtitle: 'الأكثر جاذبية في التغذية',
        width: 1080,
        height: 1350,
        aspectClass: 'aspect-[4/5]',
        canvasW: 1080,
        canvasH: 1350
    }
};

// ==========================================
// حالة الاستوديو الحالية
// ==========================================
let studioState = {
    // النمط الرئيسي: 'story_vignette' (ستوري إنستقرام شادو ناعم) أو 'card' (بوست الكارت الملكي)
    layoutMode: 'story_vignette',
    
    // الوسائط
    mediaType: 'image', // 'image' أو 'video'
    selectedCarpetId: '',
    customImageSrc: '',
    videoSrc: '',
    
    // تحكم كامل بحجم وحركة الصورة (Pan & Zoom)
    mediaZoom: 100, // نسبة التكبير: من 70% إلى 250% (افتراضي 100%)
    mediaPanX: 0,   // إزاحة أفقية يمين/يسار: من -50% إلى +50%
    mediaPanY: 0,   // إزاحة رأسية فوق/تحت: من -50% إلى +50%

    // إعدادات نمط ستوري إنستقرام كامل الشاشة
    storyPhrase: '- 🌟 عمل مُتقن -',
    storyHandle: '@TATRIZA_22',
    vignetteTheme: 'blush-rose',
    showTopVignette: true,
    showBottomVignette: true,
    showStoryPhrase: true,
    showStoryHandle: true,
    
    // الأبعاد والثيمات
    ratio: '9:16', // افتراضي 9:16 ليتطابق مع الستوري المطلوب
    theme: 'royal-burgundy',
    
    // إعدادات نمط كارت السجادة الملكي
    title: '',
    subtitle: 'حياكة يدوية متقنة تفيض بالأصالة والفخامة',
    dimensions: '',
    material: '',
    price: '',
    currency: 'ر.ع.',
    sticker: 'exclusive',
    whatsapp: '968XXXXXXXX',
    showLogo: true,
    showPrice: true,
    showDimensions: true,
    showMaterial: true,
    showSticker: true,
    showWhatsApp: true,
    carpetScale: 88,
    carpetShadow: true,
    carpetTilt: false
};

// ==========================================
// فتح وإغلاق نافذة الاستوديو
// ==========================================
export function openTatrizaStudioModal(preselectedCarpetId = '', customCarpets = null) {
    const modal = document.getElementById('tatriza-studio-modal');
    if (!modal) return;

    // استخراج قائمة السجاد من سياق البوابة
    const carpets = customCarpets || window.allPortalCarpets || [];

    // تعيين القطعة المحددة أو الأولى افتراضياً
    let targetCarpet = null;
    if (preselectedCarpetId) {
        targetCarpet = carpets.find(c => c.id === preselectedCarpetId);
    }
    if (!targetCarpet && carpets.length > 0) {
        targetCarpet = carpets[0];
    }

    if (targetCarpet) {
        applyCarpetToStudioState(targetCarpet);
    } else {
        studioState.title = 'تحفة فنية يدوية ملكية';
        studioState.dimensions = '200 × 300 سم';
        studioState.material = 'صوف طبيعي 100% مع حرير';
        studioState.price = '180';
        studioState.customImageSrc = '../images/client_room1.jpg';
    }

    populateCarpetDropdown(carpets);
    syncStudioControlsFromState();
    updateStudioPreview();
    renderStudioDraftsList();

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
}

export function closeTatrizaStudioModal() {
    const modal = document.getElementById('tatriza-studio-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    
    // إيقاف تشغيل أي فيديو نشط في المعاينة
    const videoEl = document.getElementById('studio-live-video');
    if (videoEl) {
        try { videoEl.pause(); } catch(e) {}
    }
}

function applyCarpetToStudioState(carpet) {
    studioState.selectedCarpetId = carpet.id;
    studioState.title = carpet.title || 'سجادة فاخرة';
    studioState.dimensions = carpet.dimensions || '200 × 300 سم';
    studioState.material = carpet.material || 'صوف طبيعي فاخر';
    studioState.price = carpet.price ? String(carpet.price) : '0';
    studioState.currency = carpet.currency || 'ر.ع.';

    // جلب أفضل صورة متوفرة
    if (carpet.images && carpet.images.length > 0) {
        studioState.customImageSrc = carpet.images[0];
    } else if (carpet.image) {
        studioState.customImageSrc = carpet.image;
    } else {
        studioState.customImageSrc = '../images/client_room1.jpg';
    }

    // فحص ما إذا كان للسجادة فيديو مرفق
    if (carpet.videoUrl) {
        studioState.videoSrc = carpet.videoUrl;
    }
}

// تعبئة قائمة اختيار السجاد
function populateCarpetDropdown(carpets) {
    const select = document.getElementById('studio-carpet-select');
    if (!select) return;

    if (!carpets || carpets.length === 0) {
        select.innerHTML = '<option value="">لا توجد قطع حالية (استخدم رفع صورة)</option>';
        return;
    }

    select.innerHTML = carpets.map(c => `
        <option value="${c.id}" ${c.id === studioState.selectedCarpetId ? 'selected' : ''}>
            ${c.id} - ${c.title} (${c.price || 0} ر.ع.)
        </option>
    `).join('');
}

// مزامنة حقول الإدخال مع الحالة الحالية
function syncStudioControlsFromState() {
    // 1. مزامنة تبديل النمط (Layout Mode Switcher)
    updateLayoutButtonStates();

    // 2. إظهار/إخفاء الحاويات المناسبة للنمط
    const controlsStory = document.getElementById('studio-controls-story');
    const controlsCard = document.getElementById('studio-controls-card');
    if (controlsStory && controlsCard) {
        if (studioState.layoutMode === 'story_vignette') {
            controlsStory.classList.remove('hidden');
            controlsCard.classList.add('hidden');
        } else {
            controlsStory.classList.add('hidden');
            controlsCard.classList.remove('hidden');
        }
    }

    // 3. مزامنة أشرطة التحريك والتكبير (Pan & Zoom)
    syncPanZoomSlidersOnly();

    // 4. مزامنة حقول الستوري كامل الشاشة
    const phraseInput = document.getElementById('studio-input-story-phrase');
    const handleInput = document.getElementById('studio-input-story-handle');
    if (phraseInput) phraseInput.value = studioState.storyPhrase || '';
    if (handleInput) handleInput.value = studioState.storyHandle || '';

    const toggleTopVig = document.getElementById('studio-toggle-top-vig');
    const toggleBotVig = document.getElementById('studio-toggle-bot-vig');
    const toggleStoryPhrase = document.getElementById('studio-toggle-story-phrase');
    const toggleStoryHandle = document.getElementById('studio-toggle-story-handle');
    if (toggleTopVig) toggleTopVig.checked = studioState.showTopVignette;
    if (toggleBotVig) toggleBotVig.checked = studioState.showBottomVignette;
    if (toggleStoryPhrase) toggleStoryPhrase.checked = studioState.showStoryPhrase;
    if (toggleStoryHandle) toggleStoryHandle.checked = studioState.showStoryHandle;

    updateVignetteButtonStates();
    updateMediaButtonStates();

    // 5. مزامنة حقول نمط الكارت الملكي
    const titleIn = document.getElementById('studio-input-title');
    const subtitleIn = document.getElementById('studio-input-subtitle');
    const dimIn = document.getElementById('studio-input-dim');
    const matIn = document.getElementById('studio-input-mat');
    const priceIn = document.getElementById('studio-input-price');
    const currIn = document.getElementById('studio-input-curr');
    const waIn = document.getElementById('studio-input-wa');
    const scaleIn = document.getElementById('studio-input-scale');
    const scaleVal = document.getElementById('studio-scale-val');
    const stickerIn = document.getElementById('studio-select-sticker');

    if (titleIn) titleIn.value = studioState.title;
    if (subtitleIn) subtitleIn.value = studioState.subtitle;
    if (dimIn) dimIn.value = studioState.dimensions;
    if (matIn) matIn.value = studioState.material;
    if (priceIn) priceIn.value = studioState.price;
    if (currIn) currIn.value = studioState.currency;
    if (waIn) waIn.value = studioState.whatsapp;
    if (scaleIn) scaleIn.value = studioState.carpetScale;
    if (scaleVal) scaleVal.innerText = `${studioState.carpetScale}%`;
    if (stickerIn) stickerIn.value = studioState.sticker;

    // أزرار الاختيار للكارت
    const toggleLogo = document.getElementById('studio-toggle-logo');
    const togglePrice = document.getElementById('studio-toggle-price');
    const toggleDim = document.getElementById('studio-toggle-dim');
    const toggleMat = document.getElementById('studio-toggle-mat');
    const toggleWA = document.getElementById('studio-toggle-wa');
    const toggleShadow = document.getElementById('studio-toggle-shadow');

    if (toggleLogo) toggleLogo.checked = studioState.showLogo;
    if (togglePrice) togglePrice.checked = studioState.showPrice;
    if (toggleDim) toggleDim.checked = studioState.showDimensions;
    if (toggleMat) toggleMat.checked = studioState.showMaterial;
    if (toggleWA) toggleWA.checked = studioState.showWhatsApp;
    if (toggleShadow) toggleShadow.checked = studioState.carpetShadow;

    // تفعيل أزرار الأبعاد والثيمات
    updateRatioButtonStates();
    updateThemeButtonStates();
    renderCarpetGalleryThumbs();

    // تحديث زر التصدير
    updateExportButtonText();
}

function syncPanZoomSlidersOnly() {
    const zoomIn = document.getElementById('studio-input-zoom');
    const zoomVal = document.getElementById('studio-zoom-val');
    const panXIn = document.getElementById('studio-input-panx');
    const panXVal = document.getElementById('studio-panx-val');
    const panYIn = document.getElementById('studio-input-pany');
    const panYVal = document.getElementById('studio-pany-val');

    if (zoomIn) zoomIn.value = studioState.mediaZoom || 100;
    if (zoomVal) zoomVal.innerText = `${studioState.mediaZoom || 100}%`;
    if (panXIn) panXIn.value = studioState.mediaPanX || 0;
    if (panXVal) panXVal.innerText = `${(studioState.mediaPanX || 0) > 0 ? '+' : ''}${studioState.mediaPanX || 0}%`;
    if (panYIn) panYIn.value = studioState.mediaPanY || 0;
    if (panYVal) panYVal.innerText = `${(studioState.mediaPanY || 0) > 0 ? '+' : ''}${studioState.mediaPanY || 0}%`;
}

function updateLayoutButtonStates() {
    document.querySelectorAll('.studio-layout-btn').forEach(btn => {
        const layout = btn.getAttribute('data-layout');
        if (layout === studioState.layoutMode) {
            btn.classList.add('border-amber-500', 'ring-2', 'ring-amber-400/30', 'bg-amber-500/10');
            btn.classList.remove('border-stone-200', 'opacity-80', 'bg-white');
        } else {
            btn.classList.remove('border-amber-500', 'ring-2', 'ring-amber-400/30', 'bg-amber-500/10');
            btn.classList.add('border-stone-200', 'opacity-80', 'bg-white');
        }
    });
}

function updateMediaButtonStates() {
    document.querySelectorAll('.studio-media-btn').forEach(btn => {
        const media = btn.getAttribute('data-media');
        if (media === studioState.mediaType) {
            btn.classList.add('bg-stone-900', 'text-white', 'shadow-xs');
            btn.classList.remove('bg-stone-100', 'text-stone-700', 'hover:bg-stone-200');
        } else {
            btn.classList.remove('bg-stone-900', 'text-white', 'shadow-xs');
            btn.classList.add('bg-stone-100', 'text-stone-700', 'hover:bg-stone-200');
        }
    });

    const photoUploadBox = document.getElementById('studio-box-photo-upload');
    const videoUploadBox = document.getElementById('studio-box-video-upload');
    if (photoUploadBox && videoUploadBox) {
        if (studioState.mediaType === 'video') {
            photoUploadBox.classList.add('hidden');
            videoUploadBox.classList.remove('hidden');
        } else {
            photoUploadBox.classList.remove('hidden');
            videoUploadBox.classList.add('hidden');
        }
    }
}

function updateRatioButtonStates() {
    document.querySelectorAll('.studio-ratio-btn').forEach(btn => {
        const ratio = btn.getAttribute('data-ratio');
        if (ratio === studioState.ratio) {
            btn.classList.add('border-brand', 'bg-brand/10', 'text-brand', 'ring-2', 'ring-brand/20');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-brand', 'bg-brand/10', 'text-brand', 'ring-2', 'ring-brand/20');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });
}

function updateVignetteButtonStates() {
    document.querySelectorAll('.studio-vignette-card').forEach(card => {
        const vigId = card.getAttribute('data-vignette');
        if (vigId === studioState.vignetteTheme) {
            card.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        } else {
            card.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        }
    });
}

function updateThemeButtonStates() {
    document.querySelectorAll('.studio-theme-card').forEach(card => {
        const themeId = card.getAttribute('data-theme');
        if (themeId === studioState.theme) {
            card.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        } else {
            card.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        }
    });
}

function updateExportButtonText() {
    const btn = document.getElementById('studio-btn-export');
    if (!btn) return;
    if (studioState.layoutMode === 'story_vignette') {
        if (studioState.mediaType === 'video') {
            btn.innerHTML = `<span class="text-base sm:text-lg">📸</span><span>التقاط غلاف الستوري بدقة فائقة (HD PNG)</span>`;
        } else {
            btn.innerHTML = `<span class="text-base sm:text-lg">📥</span><span>تحميل صورة ستوري بدقة فائقة (HD 1080×1920)</span>`;
        }
    } else {
        btn.innerHTML = `<span class="text-base sm:text-lg">📥</span><span>تحميل تصميم البوست بدقة فائقة (HD PNG)</span>`;
    }
}

// تطبيق التحويل (Zoom & Pan) على عنصر المعاينة مباشرة بسرعة فائقة
function applyLiveTransformOnly() {
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    const transformStyle = `translate3d(${panX}%, ${panY}%, 0) scale(${zoom})`;

    const img = document.getElementById('studio-live-img');
    if (img) img.style.transform = transformStyle;

    const vid = document.getElementById('studio-live-video');
    if (vid) vid.style.transform = transformStyle;

    const carpetWrap = document.getElementById('studio-carpet-center-wrap');
    if (carpetWrap) {
        carpetWrap.style.transform = `translate3d(${panX}%, ${panY}%, 0) scale(${((studioState.carpetScale || 88) / 100) * zoom})`;
    }
}

// عرض مصغرات صور القطعة المختارة للتنقل بينها
function renderCarpetGalleryThumbs() {
    const container = document.getElementById('studio-thumbs-container');
    if (!container) return;

    const carpets = window.allPortalCarpets || [];
    const currentCarpet = carpets.find(c => c.id === studioState.selectedCarpetId);

    if (!currentCarpet || !currentCarpet.images || currentCarpet.images.length <= 1) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = currentCarpet.images.map((imgSrc, idx) => {
        const isSelected = imgSrc === studioState.customImageSrc;
        return `
            <button type="button" onclick="window.selectStudioImageFromThumb('${imgSrc}')" class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${isSelected ? 'border-amber-500 ring-2 ring-amber-400/40 scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'}">
                <img src="${imgSrc}" class="w-full h-full object-cover">
            </button>
        `;
    }).join('');
}

// ==========================================
// تحديث المعاينة الحية الفورية (WYSIWYG Live Preview)
// ==========================================
export function updateStudioPreview() {
    const stage = document.getElementById('studio-live-stage');
    if (!stage) return;

    const ratio = STUDIO_RATIOS[studioState.ratio] || STUDIO_RATIOS['9:16'];
    const carpetImg = studioState.customImageSrc || '../images/client_room1.jpg';

    // حساب نسبة التكبير والإزاحة
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    const transformStyle = `translate3d(${panX}%, ${panY}%, 0) scale(${zoom})`;

    // -------------------------------------------------------------
    // الحالة الأولى: نمط ستوري وريلز إنستقرام كامل الشاشة مع الشادو الناعم
    // -------------------------------------------------------------
    if (studioState.layoutMode === 'story_vignette') {
        const vig = STUDIO_VIGNETTES[studioState.vignetteTheme] || STUDIO_VIGNETTES['blush-rose'];
        
        // تعيين نسبة الأبعاد للحاوية
        stage.className = `relative w-full max-w-[340px] sm:max-w-[360px] mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between p-0 select-none ${ratio.aspectClass} bg-stone-900 cursor-grab active:cursor-grabbing`;
        stage.style.background = '#1a1a1a';
        stage.style.backgroundImage = 'none';

        // محتوى الميديا (فيديو أو صورة) داخل غلاف قابل للقص
        let mediaHtml = '';
        if (studioState.mediaType === 'video' && studioState.videoSrc) {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <video id="studio-live-video" src="${studioState.videoSrc}" autoplay loop muted playsinline class="w-full h-full object-cover select-none transition-transform duration-75" style="transform: ${transformStyle}; transform-origin: center center;"></video>
                </div>
                <div class="absolute top-3 left-3 z-30 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                    <span>🎥</span>
                    <span>معاينة فيديو حية</span>
                </div>
            `;
        } else {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <img id="studio-live-img" src="${carpetImg}" alt="Story Carpet" class="w-full h-full object-cover select-none transition-transform duration-75 pointer-events-none" style="transform: ${transformStyle}; transform-origin: center center;">
                </div>
            `;
        }

        // الشادو الدائري الناعم بالأعلى مع اللوجو
        const topVignetteHtml = studioState.showTopVignette ? `
            <div class="absolute top-0 inset-x-0 h-44 sm:h-52 pointer-events-none z-10 transition-all duration-300" style="background: ${vig.topVignetteCss};"></div>
        ` : '';

        // اللوجو الرسمي في الأعلى
        const logoHtml = studioState.showLogo ? `
            <div class="relative z-20 pt-6 sm:pt-8 flex flex-col items-center justify-center pointer-events-none">
                <img src="../images/logo.jpg" class="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm select-none" style="mix-blend-mode: multiply;" alt="TATRIZA Logo">
            </div>
        ` : '';

        // الشادو الدائري الناعم بالأسفل
        const botVignetteHtml = studioState.showBottomVignette ? `
            <div class="absolute bottom-0 inset-x-0 h-56 sm:h-64 pointer-events-none z-10 transition-all duration-300" style="background: ${vig.botVignetteCss};"></div>
        ` : '';

        // العبارة المميزة واسم الحساب بالأسفل
        const bottomContentHtml = `
            <div class="relative z-20 pb-7 sm:pb-9 px-4 flex flex-col items-center justify-center text-center space-y-3 mt-auto pointer-events-none">
                ${studioState.showStoryPhrase && studioState.storyPhrase ? `
                    <div class="font-royal-carpet font-bold text-lg sm:text-xl tracking-wide select-none" style="color: ${vig.phraseColor}; text-shadow: ${vig.phraseShadow};">
                        ${studioState.storyPhrase}
                    </div>
                ` : ''}

                ${studioState.showStoryHandle && studioState.storyHandle ? `
                    <div class="font-mono uppercase font-bold text-[11px] sm:text-[12px] tracking-[0.28em] select-none" style="color: ${vig.handleColor}; text-shadow: 0 1px 2px rgba(255,255,255,0.6);">
                        ${studioState.storyHandle}
                    </div>
                ` : ''}
            </div>
        `;

        stage.innerHTML = `
            ${mediaHtml}
            ${topVignetteHtml}
            ${logoHtml}
            ${botVignetteHtml}
            ${bottomContentHtml}
        `;

        // إتاحة السحب المباشر باللمس أو الماوس
        setupStageDragAndZoom();
        return;
    }

    // -------------------------------------------------------------
    // الحالة الثانية: نمط بوست الكارت الملكي (مع بطاقة المواصفات والسعر)
    // -------------------------------------------------------------
    const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];

    stage.className = `relative w-full max-w-[360px] mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 select-none ${ratio.aspectClass} cursor-grab active:cursor-grabbing`;

    // تعيين الخلفية
    if (theme.bgType === 'gradient') {
        stage.style.background = theme.bgValue;
        stage.style.backgroundImage = theme.bgValue;
    } else {
        stage.style.background = `url("${theme.bgValue}") center/cover no-repeat`;
    }

    // بناء نص الشارة
    let stickerHtml = '';
    if (studioState.showSticker && studioState.sticker !== 'none') {
        const stickersMap = {
            'exclusive': '🏷️ قطعة حصرية فريدة (1 of 1)',
            'silk': '💎 حرير طبيعي خالص 100%',
            'wool': '🐑 صوف جبلي مغزول يدوياً',
            'oman': '✨ صنعت بشغف في سلطنة عُمان',
            'artisan': '🌟 تحفة نادرة من أرشيف الدار',
            'limited': '⏳ عرض خاص لفترة محدودة'
        };
        const stickerText = stickersMap[studioState.sticker] || '✨ إصدار يدوي خاص';
        stickerHtml = `
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide shadow-md backdrop-blur-md border border-white/20 animate-pulse pointer-events-none" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                <span>${stickerText}</span>
            </div>
        `;
    }

    // شعار الدار بالأعلى
    let logoHtml = '';
    if (studioState.showLogo) {
        logoHtml = `
            <div class="flex items-center gap-2 pointer-events-none">
                <img src="../images/logo.jpg" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-amber-300/40 shadow-xs" alt="Logo">
                <div class="text-right leading-none">
                    <span class="font-display font-black text-xs sm:text-sm tracking-wider text-white block">TATRIZA</span>
                    <span class="text-[8.5px] sm:text-[9.5px] font-medium" style="color: ${theme.accentColor};">دار تطريز للسجاد الملكي</span>
                </div>
            </div>
        `;
    }

    // السجادة في المنتصف مع دعم التحريك الحر والتكبير
    const scaleFactor = ((studioState.carpetScale || 88) / 100) * zoom;
    const shadowStyle = studioState.carpetShadow ? 'filter: drop-shadow(0 20px 25px rgba(0,0,0,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.3));' : '';

    // قسم البيانات السفلي
    const showPrice = studioState.showPrice && studioState.price;
    const showDim = studioState.showDimensions && studioState.dimensions;
    const showMat = studioState.showMaterial && studioState.material;

    stage.innerHTML = `
        <!-- شريط الرأس في التصميم -->
        <div class="w-full flex items-center justify-between gap-2 relative z-10 pointer-events-none">
            ${logoHtml}
            ${stickerHtml}
        </div>

        <!-- مسرح السجادة المركزي -->
        <div class="flex-1 flex items-center justify-center p-2 relative z-10 my-auto overflow-hidden pointer-events-none">
            <div id="studio-carpet-center-wrap" class="transition-transform duration-75 max-w-full max-h-full flex items-center justify-center" style="transform: translate3d(${panX}%, ${panY}%, 0) scale(${scaleFactor}); transform-origin: center center;">
                <img 
                    src="${carpetImg}" 
                    alt="${studioState.title}" 
                    class="max-w-full max-h-[220px] sm:max-h-[300px] object-contain rounded-2xl border border-white/20 transition-all duration-300"
                    style="${shadowStyle}">
            </div>
        </div>

        <!-- بطاقة المعلومات والدعوة للطلب -->
        <div class="w-full rounded-2xl p-3 sm:p-3.5 backdrop-blur-md relative z-10 space-y-2 border transition-all pointer-events-none" style="background: ${theme.cardBg}; border-color: ${theme.cardBorder}; color: ${theme.textColor};">
            <div>
                <h3 class="font-royal-carpet font-bold text-sm sm:text-base leading-snug line-clamp-1" style="color: ${theme.accentColor};">
                    ${studioState.title || 'سجادة ملكية فاخرة'}
                </h3>
                ${studioState.subtitle ? `
                    <p class="text-[9.5px] sm:text-[10.5px] text-stone-200/90 leading-tight mt-0.5 line-clamp-1">
                        ${studioState.subtitle}
                    </p>
                ` : ''}
            </div>

            <!-- المقاس والخامة والسعر -->
            <div class="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                <div class="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px] text-stone-300">
                    ${showDim ? `<span class="bg-black/40 px-2 py-0.5 rounded-md border border-white/10">📐 ${studioState.dimensions}</span>` : ''}
                    ${showMat ? `<span class="bg-black/40 px-2 py-0.5 rounded-md border border-white/10">🧵 ${studioState.material}</span>` : ''}
                </div>

                ${showPrice ? `
                    <div class="flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-400/30 border border-amber-300/40 text-amber-300 shrink-0">
                        <span class="font-display font-black text-sm sm:text-base leading-none">${studioState.price}</span>
                        <span class="text-[8.5px] font-bold">${studioState.currency}</span>
                    </div>
                ` : ''}
            </div>

            <!-- شريط الواتساب -->
            ${studioState.showWhatsApp ? `
                <div class="pt-1 flex items-center justify-between text-[9px] sm:text-[10px] text-emerald-300 border-t border-white/10">
                    <span class="font-bold flex items-center gap-1">
                        <span>💬</span>
                        <span>للطلب والاستفسار الفوري عبر الواتساب</span>
                    </span>
                    <span class="font-display font-bold text-white tracking-wider" dir="ltr">${studioState.whatsapp || '+968'}</span>
                </div>
            ` : ''}
        </div>
    `;

    setupStageDragAndZoom();
}

// ==========================================
// التفاعل المباشر: السحب بالماوس أو اللمس (Direct Drag to Pan & Wheel to Zoom)
// ==========================================
let isDraggingStage = false;
let dragStartX = 0;
let dragStartY = 0;
let initialPanX = 0;
let initialPanY = 0;

function setupStageDragAndZoom() {
    const stage = document.getElementById('studio-live-stage');
    if (!stage || stage.dataset.dragInitialized) return;
    stage.dataset.dragInitialized = 'true';

    stage.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        isDraggingStage = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialPanX = studioState.mediaPanX || 0;
        initialPanY = studioState.mediaPanY || 0;
        try { stage.setPointerCapture(e.pointerId); } catch(err){}
        stage.style.cursor = 'grabbing';
    });

    stage.addEventListener('pointermove', (e) => {
        if (!isDraggingStage) return;
        const rect = stage.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;

        // تحويل بكسلات السحب إلى نسبة مئوية سلسة
        const deltaXPercent = (deltaX / rect.width) * 100;
        const deltaYPercent = (deltaY / rect.height) * 100;

        studioState.mediaPanX = Math.round(Math.max(-50, Math.min(50, initialPanX + deltaXPercent)));
        studioState.mediaPanY = Math.round(Math.max(-50, Math.min(50, initialPanY + deltaYPercent)));

        // تحديث حي فوري بدون إعادة بناء الـ DOM
        applyLiveTransformOnly();
        syncPanZoomSlidersOnly();
    });

    const endDrag = (e) => {
        if (isDraggingStage) {
            isDraggingStage = false;
            try { stage.releasePointerCapture(e.pointerId); } catch(err){}
            stage.style.cursor = 'grab';
        }
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    // التكبير والتصغير بعجلة الماوس
    stage.addEventListener('wheel', (e) => {
        e.preventDefault();
        const step = e.deltaY < 0 ? 5 : -5;
        const newZoom = Math.max(70, Math.min(250, (studioState.mediaZoom || 100) + step));
        studioState.mediaZoom = newZoom;
        applyLiveTransformOnly();
        syncPanZoomSlidersOnly();
    }, { passive: false });
}

// ==========================================
// تصدير الصورة بدقة عالية جداً عبر Canvas (HD Export)
// ==========================================
export async function exportStudioHDImage() {
    const exportBtn = document.getElementById('studio-btn-export');
    const originalText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = `<span>⏳</span><span>جارٍ التصدير بدقة فائقة...</span>`;
    }

    try {
        const ratio = STUDIO_RATIOS[studioState.ratio] || STUDIO_RATIOS['9:16'];
        const canvas = document.createElement('canvas');
        canvas.width = ratio.canvasW;
        canvas.height = ratio.canvasH;
        const ctx = canvas.getContext('2d');

        // تنعيم جودة الرسم
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // -------------------------------------------------------------
        // تصدير نمط ستوري إنستقرام كامل الشاشة مع الشادو الدائري والتوقيع
        // -------------------------------------------------------------
        if (studioState.layoutMode === 'story_vignette') {
            await exportStoryVignetteHD(canvas, ctx);
            return;
        }

        // -------------------------------------------------------------
        // تصدير نمط كارت السجادة الملكي
        // -------------------------------------------------------------
        const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];

        // 1. رسم الخلفية
        if (theme.bgType === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            if (studioState.theme === 'royal-burgundy') {
                grad.addColorStop(0, '#2b0613');
                grad.addColorStop(0.45, '#681530');
                grad.addColorStop(0.7, '#8a1d41');
                grad.addColorStop(1, '#1f030c');
            } else if (studioState.theme === 'warm-mocha') {
                grad.addColorStop(0, '#1c1310');
                grad.addColorStop(0.45, '#3d2a23');
                grad.addColorStop(0.7, '#593e34');
                grad.addColorStop(1, '#150d0a');
            } else {
                grad.addColorStop(0, '#090a0d');
                grad.addColorStop(0.5, '#161b22');
                grad.addColorStop(0.75, '#21262d');
                grad.addColorStop(1, '#050608');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            await drawImageOnCanvas(ctx, theme.bgValue, 0, 0, canvas.width, canvas.height, true);
        }

        // 2. رسم شعار الدار بالأعلى
        if (studioState.showLogo) {
            await drawRoundedImage(ctx, '../images/logo.jpg', canvas.width - 160, 60, 100, 100, 24);
            ctx.font = 'bold 36px Tajawal, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText('TATRIZA', canvas.width - 180, 105);

            ctx.font = '22px Tajawal, sans-serif';
            ctx.fillStyle = theme.accentColor;
            ctx.fillText('دار تطريز للسجاد الملكي', canvas.width - 180, 145);
        }

        // 3. رسم شارة التميز (Sticker)
        if (studioState.showSticker && studioState.sticker !== 'none') {
            const stickersMap = {
                'exclusive': '🏷️ قطعة حصرية فريدة (1 of 1)',
                'silk': '💎 حرير طبيعي خالص 100%',
                'wool': '🐑 صوف جبلي مغزول يدوياً',
                'oman': '✨ صنعت بشغف في سلطنة عُمان',
                'artisan': '🌟 تحفة نادرة من أرشيف الدار',
                'limited': '⏳ عرض خاص لفترة محدودة'
            };
            const stickerText = stickersMap[studioState.sticker] || '✨ إصدار يدوي خاص';

            ctx.save();
            ctx.font = 'bold 24px Tajawal, sans-serif';
            const textMetrics = ctx.measureText(stickerText);
            const badgeW = textMetrics.width + 50;
            const badgeH = 50;
            const badgeX = 60;
            const badgeY = 75;

            drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 25);
            ctx.fillStyle = theme.badgeBg;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = theme.badgeText;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(stickerText, badgeX + (badgeW / 2), badgeY + (badgeH / 2));
            ctx.restore();
        }

        // 4. رسم صورة السجادة في المنتصف مع دعم التحريك والتكبير
        const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';
        const zoom = (studioState.mediaZoom || 100) / 100;
        const scale = ((studioState.carpetScale || 88) / 100) * zoom;
        const maxImgW = (canvas.width - 160) * scale;
        const maxImgH = (canvas.height * (studioState.ratio === '9:16' ? 0.5 : 0.45)) * scale;

        const panOffsetX = (canvas.width * ((studioState.mediaPanX || 0) / 100));
        const panOffsetY = (canvas.height * ((studioState.mediaPanY || 0) / 100));

        ctx.save();
        if (studioState.carpetShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 45;
            ctx.shadowOffsetY = 25;
        }

        await drawContainedImage(ctx, carpetSrc, ((canvas.width - maxImgW) / 2) + panOffsetX, (canvas.height * 0.22) + panOffsetY, maxImgW, maxImgH);
        ctx.restore();

        // 5. رسم بطاقة المعلومات السفلية
        const cardMargin = 60;
        const cardW = canvas.width - (cardMargin * 2);
        const cardH = studioState.ratio === '9:16' ? 360 : 300;
        const cardY = canvas.height - cardH - cardMargin;

        ctx.save();
        drawRoundedRect(ctx, cardMargin, cardY, cardW, cardH, 30);
        ctx.fillStyle = theme.cardBg;
        ctx.fill();
        ctx.strokeStyle = theme.cardBorder;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // عنوان السجادة
        ctx.font = 'bold 44px Tajawal, sans-serif';
        ctx.fillStyle = theme.accentColor;
        ctx.textAlign = 'right';
        ctx.fillText(studioState.title || 'سجادة ملكية فاخرة', canvas.width - cardMargin - 40, cardY + 70);

        // الوصف
        if (studioState.subtitle) {
            ctx.font = '24px Tajawal, sans-serif';
            ctx.fillStyle = '#e5e7eb';
            ctx.fillText(studioState.subtitle, canvas.width - cardMargin - 40, cardY + 115);
        }

        // خط فاصل
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(cardMargin + 40, cardY + 145);
        ctx.lineTo(canvas.width - cardMargin - 40, cardY + 145);
        ctx.stroke();

        // الأبعاد والخامة
        let pillsText = '';
        if (studioState.showDimensions && studioState.dimensions) pillsText += `📐 ${studioState.dimensions}   `;
        if (studioState.showMaterial && studioState.material) pillsText += `🧵 ${studioState.material}`;

        if (pillsText) {
            ctx.font = 'bold 24px Tajawal, sans-serif';
            ctx.fillStyle = '#d1d5db';
            ctx.textAlign = 'right';
            ctx.fillText(pillsText, canvas.width - cardMargin - 40, cardY + 195);
        }

        // السعر
        if (studioState.showPrice && studioState.price) {
            const priceText = `${studioState.price} ${studioState.currency}`;
            drawRoundedRect(ctx, cardMargin + 40, cardY + 160, 220, 60, 20);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'black 34px Tajawal, sans-serif';
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText(priceText, cardMargin + 150, cardY + 203);
        }

        // شريط الواتساب
        if (studioState.showWhatsApp) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.moveTo(cardMargin + 40, cardY + 235);
            ctx.lineTo(canvas.width - cardMargin - 40, cardY + 235);
            ctx.stroke();

            ctx.font = 'bold 22px Tajawal, sans-serif';
            ctx.fillStyle = '#6ee7b7';
            ctx.textAlign = 'right';
            ctx.fillText('💬 للطلب والاستفسار الفوري عبر الواتساب', canvas.width - cardMargin - 40, cardY + cardH - 35);

            ctx.font = 'bold 22px Tajawal, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(studioState.whatsapp || '+968', cardMargin + 40, cardY + cardH - 35);
        }

        ctx.restore();

        // تحميل الصورة كملف PNG
        downloadCanvasAsPNG(canvas, `TATRIZA-Post-${studioState.ratio.replace(':', 'x')}.png`);
        showToast('تم تحميل تصميم البوست بدقة فائقة HD بنجاح!', 'success', 'استوديو تطريز');
    } catch (err) {
        console.error('Studio export error:', err);
        showToast('تعذر تصدير الصورة، يرجى المحاولة مرة أخرى.', 'error', 'خطأ في التصدير');
    } finally {
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalText;
        }
    }
}

// دالة تصدير نمط ستوري إنستقرام والريلز عالي الدقة (Story Vignette HD)
async function exportStoryVignetteHD(canvas, ctx) {
    const vig = STUDIO_VIGNETTES[studioState.vignetteTheme] || STUDIO_VIGNETTES['blush-rose'];
    const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';

    // 1. رسم الصورة بكامل الشاشة مع التحجيم والإزاحة الدقيقة (Zoom & Pan)
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    await drawCoverImageOnCanvas(ctx, carpetSrc, 0, 0, canvas.width, canvas.height, zoom, panX, panY);

    // 2. رسم الشادو الدائري الناعم بالأعلى
    if (studioState.showTopVignette !== false) {
        const topH = canvas.height * 0.42;
        const topGrad = ctx.createRadialGradient(canvas.width / 2, 0, 0, canvas.width / 2, 0, topH);
        topGrad.addColorStop(0, `rgba(${vig.topColorRgb}, 0.96)`);
        topGrad.addColorStop(0.35, `rgba(${vig.topColorRgb}, 0.82)`);
        topGrad.addColorStop(0.7, `rgba(${vig.topColorRgb}, 0.35)`);
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, topH);
    }

    // 3. رسم الشادو الدائري الناعم بالأسفل
    if (studioState.showBottomVignette !== false) {
        const botH = canvas.height * 0.52;
        const botY = canvas.height - botH;
        const botGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height, 0, canvas.width / 2, canvas.height, botH);
        botGrad.addColorStop(0, `rgba(${vig.bottomColorRgb}, 0.98)`);
        botGrad.addColorStop(0.42, `rgba(${vig.bottomColorRgb}, 0.88)`);
        botGrad.addColorStop(0.75, `rgba(${vig.bottomColorRgb}, 0.4)`);
        botGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, botY, canvas.width, botH);
    }

    // 4. رسم لوجو الدار شفافاً في المنتصف بالأعلى
    if (studioState.showLogo) {
        try {
            const logoImg = await loadImageAsync('../images/logo.jpg');
            const transLogoCanvas = getTransparentLogoCanvas(logoImg);
            const logoW = 210;
            const logoH = 210;
            const logoX = (canvas.width - logoW) / 2;
            const logoY = 95;
            ctx.drawImage(transLogoCanvas, logoX, logoY, logoW, logoH);
        } catch(e) {
            console.warn('Logo render fallback:', e);
        }
    }

    // 5. رسم العبارة المميزة في الأسفل
    if (studioState.showStoryPhrase && studioState.storyPhrase) {
        ctx.save();
        ctx.font = 'bold 50px Tajawal, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = vig.phraseColor || '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 3;
        ctx.fillText(studioState.storyPhrase, canvas.width / 2, canvas.height - 200);
        ctx.restore();
    }

    // 6. رسم توقيع حساب الإنستقرام
    if (studioState.showStoryHandle && studioState.storyHandle) {
        ctx.save();
        ctx.font = 'bold 28px "Courier New", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = vig.handleColor || '#5c453d';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        drawSpacedText(ctx, studioState.storyHandle, canvas.width / 2, canvas.height - 110, 8);
        ctx.restore();
    }

    // تنزيل الصورة
    downloadCanvasAsPNG(canvas, `TATRIZA-Story-1080x1920.png`);
    showToast('تم تحميل ستوري إنستقرام فائق الدقة (1080×1920) بنجاح!', 'success', 'تطريز ستوديو');
}

function downloadCanvasAsPNG(canvas, fileName) {
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// دالة تفريغ خلفية اللوجو البيج/البيضاء لجعلها شفافة بالكامل
function getTransparentLogoCanvas(logoImg) {
    const oc = document.createElement('canvas');
    oc.width = logoImg.naturalWidth || logoImg.width;
    oc.height = logoImg.naturalHeight || logoImg.height;
    const octx = oc.getContext('2d');
    octx.drawImage(logoImg, 0, 0);

    const imgData = octx.getImageData(0, 0, oc.width, oc.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 230 && g > 220 && b > 210) {
            const avg = (r + g + b) / 3;
            if (avg > 240) {
                data[i + 3] = 0;
            } else {
                data[i + 3] = Math.round(((240 - avg) / 20) * 255);
            }
        }
    }
    octx.putImageData(imgData, 0, 0);
    return oc;
}

// دالة كتابة نص متباعد الحروف (Letter Spacing) على الكانفاس
function drawSpacedText(ctx, text, centerX, centerY, spacing) {
    const chars = text.split('');
    let totalWidth = 0;
    const charWidths = chars.map(c => {
        const w = ctx.measureText(c).width;
        totalWidth += w;
        return w;
    });
    totalWidth += (chars.length - 1) * spacing;
    let startX = centerX - (totalWidth / 2);
    for (let i = 0; i < chars.length; i++) {
        ctx.fillText(chars[i], startX + (charWidths[i] / 2), centerY);
        startX += charWidths[i] + spacing;
    }
}

function loadImageAsync(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
    });
}

// رسم الصورة مع دعم التكبير والتحريك الأفقي والرأسي الدقيق
function drawCoverImageOnCanvas(ctx, src, x, y, w, h, zoom = 1.0, panXPercent = 0, panYPercent = 0) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();

            const imgRatio = img.width / img.height;
            const targetRatio = w / h;
            let baseW, baseH;

            if (imgRatio > targetRatio) {
                baseH = h;
                baseW = h * imgRatio;
            } else {
                baseW = w;
                baseH = w / imgRatio;
            }

            const finalW = baseW * zoom;
            const finalH = baseH * zoom;

            const centerX = x + (w - finalW) / 2;
            const centerY = y + (h - finalH) / 2;

            const offsetX = (w * (panXPercent / 100));
            const offsetY = (h * (panYPercent / 100));

            ctx.drawImage(img, centerX + offsetX, centerY + offsetY, finalW, finalH);
            ctx.restore();
            resolve();
        };
        img.onerror = () => resolve();
    });
}

// مساعدة لرسم مستطيل بحواف دائرية
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawRoundedImage(ctx, src, x, y, w, h, radius) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            ctx.save();
            drawRoundedRect(ctx, x, y, w, h, radius);
            ctx.clip();
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
            resolve();
        };
        img.onerror = () => resolve();
    });
}

function drawImageOnCanvas(ctx, src, x, y, w, h, cover = false) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            if (cover) {
                const scale = Math.max(w / img.width, h / img.height);
                const nw = img.width * scale;
                const nh = img.height * scale;
                const nx = x + (w - nw) / 2;
                const ny = y + (h - nh) / 2;
                ctx.drawImage(img, nx, ny, nw, nh);
            } else {
                ctx.drawImage(img, x, y, w, h);
            }
            resolve();
        };
        img.onerror = () => resolve();
    });
}

function drawContainedImage(ctx, src, x, y, maxW, maxH) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            const scale = Math.min(maxW / img.width, maxH / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const nx = x + (maxW - w) / 2;
            const ny = y + (maxH - h) / 2;

            ctx.save();
            drawRoundedRect(ctx, nx, ny, w, h, 24);
            ctx.clip();
            ctx.drawImage(img, nx, ny, w, h);
            ctx.restore();
            resolve();
        };
        img.onerror = () => resolve();
    });
}

// ==========================================
// نسخ نص البوست التسويقي الجاهز (Caption & Hashtags)
// ==========================================
export function copyStudioCaption() {
    let caption = '';
    const cleanWa = (studioState.whatsapp || '+968').replace(/[^0-9]/g, '');

    if (studioState.layoutMode === 'story_vignette') {
        const phrase = studioState.storyPhrase || '- 🌟 عمل مُتقن -';
        caption = `✨ دار تطريز للسجاد الملكي | TATRIZA
${phrase}

حياكة يدوية متقنة تفيض بالفخامة والأصالة العُمانية 👑
تصاميم حصرية تُنسج بشغف لتليق بأرقى المجالس والقصور.

📍 حسابنا على الإنستغرام: ${studioState.storyHandle || '@TATRIZA_22'}
💬 للطلب والاستفسار المباشر عبر الواتساب:
https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً دار تطريز، أرغب بالاستفسار عن القطعة الفنية: ${phrase}`)}

#تطريز #سجاد_ملكي #سجاد_يدوي #ديكور_فاخر #مجالس_عمان #سلطنة_عمان #مسقط #TATRIZA #LuxuryCarpet #HandmadeRug`;
    } else {
        const title = studioState.title || 'سجادة يدوية ملكية فاخرة';
        const dim = studioState.dimensions ? `📐 المقاس: ${studioState.dimensions}` : '';
        const mat = studioState.material ? `🧵 الخامة: ${studioState.material}` : '';
        const price = studioState.price ? `💰 السعر: ${studioState.price} ${studioState.currency}` : '';

        caption = `✨ دار تطريز TATRIZA | تحف فنية تنبض بالهوية والتطريز ✨

🏷️ ${title}
${studioState.subtitle ? `«${studioState.subtitle}»` : ''}

${dim}
${mat}
${price}

💎 قطعة يدوية أصلية تحاكي أرقى فنون الحياكة التراثية لتضفي لمسة فخامة استثنائية على منزلك ومجلسك.

📲 للطلب الفوري والاستفسار عبر الواتساب:
https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً دار تطريز، أرغب بالاستفسار عن القطعة: ${title}`)}

#تطريز #سجاد_يدوي #سجاد_ملكي #تحف_منزلية #ديكور_فاخر #مجالس_عربية #سلطنة_عمان #مسقط #Tatriza #HandmadeRug #LuxuryLiving`;
    }

    navigator.clipboard.writeText(caption).then(() => {
        showToast('تم نسخ نص البوست والكابشن والهاشتاقات بنجاح! جاهز للصق في إنستقرام والواتساب.', 'success', 'نسخ النص الإعلاني');
    }).catch(() => {
        showToast('تعذر النسخ التلقائي، يمكنك نسخه يدوياً.', 'info', 'تنبيه');
    });
}

// ==========================================
// مشاركة فورية على الواتساب
// ==========================================
export function shareStudioToWhatsApp() {
    const wa = studioState.whatsapp ? studioState.whatsapp.replace(/[^0-9]/g, '') : '';
    let msg = '';
    if (studioState.layoutMode === 'story_vignette') {
        msg = `شاهد هذا العمل المتقن من دار تطريز: ${studioState.storyPhrase || 'تحفة يدوية ملكية'}\nحساب الإنستغرام: ${studioState.storyHandle || '@TATRIZA_22'}`;
    } else {
        msg = `شاهد هذه التحفة الفنية الفاخرة من دار تطريز: ${studioState.title || 'سجادة ملكية'}\nالسعر: ${studioState.price} ${studioState.currency}`;
    }
    const text = encodeURIComponent(msg);
    const url = wa ? `https://wa.me/${wa}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
}

// ==========================================
// حفظ واسترجاع المسودات (Drafts System)
// ==========================================
export function saveStudioDraft() {
    try {
        const drafts = getSavedStudioDrafts();
        const draftId = 'draft_' + Date.now();
        const draftTitle = studioState.layoutMode === 'story_vignette' 
            ? (studioState.storyPhrase || 'ستوري إنستقرام') 
            : (studioState.title || 'بوست كارت');

        const draftObj = {
            id: draftId,
            timestamp: Date.now(),
            dateFormatted: new Date().toLocaleDateString('ar-OM', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            state: { ...studioState }
        };

        drafts.unshift(draftObj);
        if (drafts.length > 15) drafts.pop();

        localStorage.setItem('tatr_studio_drafts', JSON.stringify(drafts));
        renderStudioDraftsList();
        showToast(`تم حفظ تصميم «${draftTitle}» في مسوداتك بنجاح!`, 'success', 'حفظ المسودة');
    } catch (e) {
        console.error('Draft save error:', e);
        showToast('تعذر حفظ المسودة محلياً.', 'error', 'خطأ');
    }
}

export function getSavedStudioDrafts() {
    try {
        const raw = localStorage.getItem('tatr_studio_drafts');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

export function loadStudioDraft(draftId) {
    const drafts = getSavedStudioDrafts();
    const draft = drafts.find(d => d.id === draftId);
    if (!draft || !draft.state) return;

    studioState = { ...draft.state };
    syncStudioControlsFromState();
    updateStudioPreview();
    showToast(`تم استرجاع التصميم: «${studioState.layoutMode === 'story_vignette' ? studioState.storyPhrase : studioState.title}»`, 'info', 'استرجاع المسودة');
}

export function deleteStudioDraft(draftId) {
    let drafts = getSavedStudioDrafts();
    drafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem('tatr_studio_drafts', JSON.stringify(drafts));
    renderStudioDraftsList();
    showToast('تم حذف المسودة بنجاح.', 'info', 'حذف');
}

function renderStudioDraftsList() {
    const container = document.getElementById('studio-drafts-list');
    if (!container) return;

    const drafts = getSavedStudioDrafts();
    if (drafts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-stone-400 text-xs">
                لا توجد مسودات محفوظة حتى الآن
            </div>
        `;
        return;
    }

    container.innerHTML = drafts.map(d => {
        const isStory = d.state.layoutMode === 'story_vignette';
        const titleText = isStory ? (d.state.storyPhrase || 'ستوري إنستقرام') : (d.state.title || 'بوست كارت');
        const badgeIcon = isStory ? '📱' : '🏷️';
        const badgeLabel = isStory ? 'ستوري' : 'كارت';

        return `
            <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-stone-200/80 hover:border-amber-300 transition text-xs">
                <button type="button" onclick="window.loadStudioDraft('${d.id}')" class="flex items-center gap-2 text-right flex-1 min-w-0 cursor-pointer">
                    <span class="text-base shrink-0">${badgeIcon}</span>
                    <div class="truncate">
                        <span class="font-bold text-stone-900 block truncate">${titleText}</span>
                        <span class="text-[10px] text-stone-400 block">${badgeLabel} • ${d.dateFormatted} • ${d.state.ratio}</span>
                    </div>
                </button>
                <button type="button" onclick="window.deleteStudioDraft('${d.id}')" class="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition text-xs shrink-0 cursor-pointer" title="حذف المسودة">
                    ✕
                </button>
            </div>
        `;
    }).join('');
}

// ==========================================
// ربط الأحداث مع واجهة المستخدم
// ==========================================
export function initStudioEvents() {
    // 1. أزرار اختيار نمط الإخراج (ستوري إنستقرام مقابل كارت ملكي)
    document.querySelectorAll('.studio-layout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.getAttribute('data-layout');
            if (layout) {
                studioState.layoutMode = layout;
                if (layout === 'story_vignette') {
                    studioState.ratio = '9:16';
                }
                syncStudioControlsFromState();
                updateStudioPreview();
            }
        });
    });

    // 2. أزرار اختيار نوع الوسائط (صورة مقابل فيديو)
    document.querySelectorAll('.studio-media-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const media = btn.getAttribute('data-media');
            if (media) {
                studioState.mediaType = media;
                updateMediaButtonStates();
                updateExportButtonText();
                updateStudioPreview();
            }
        });
    });

    // 3. أزرار نسب الأبعاد (1:1, 9:16, 4:5)
    document.querySelectorAll('.studio-ratio-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ratio = btn.getAttribute('data-ratio');
            if (ratio && STUDIO_RATIOS[ratio]) {
                studioState.ratio = ratio;
                updateRatioButtonStates();
                updateStudioPreview();
            }
        });
    });

    // 4. أزرار وأشرطة التحكم بالتكبير والحركة (Pan & Zoom Controls)
    const zoomInput = document.getElementById('studio-input-zoom');
    const zoomVal = document.getElementById('studio-zoom-val');
    if (zoomInput) {
        zoomInput.addEventListener('input', (e) => {
            studioState.mediaZoom = Number(e.target.value);
            if (zoomVal) zoomVal.innerText = `${studioState.mediaZoom}%`;
            applyLiveTransformOnly();
        });
    }

    const btnZoomIn = document.getElementById('studio-btn-zoom-in');
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            studioState.mediaZoom = Math.min(250, (studioState.mediaZoom || 100) + 10);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    const btnZoomOut = document.getElementById('studio-btn-zoom-out');
    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            studioState.mediaZoom = Math.max(70, (studioState.mediaZoom || 100) - 10);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    const panXInput = document.getElementById('studio-input-panx');
    const panXVal = document.getElementById('studio-panx-val');
    if (panXInput) {
        panXInput.addEventListener('input', (e) => {
            studioState.mediaPanX = Number(e.target.value);
            if (panXVal) panXVal.innerText = `${studioState.mediaPanX > 0 ? '+' : ''}${studioState.mediaPanX}%`;
            applyLiveTransformOnly();
        });
    }

    const panYInput = document.getElementById('studio-input-pany');
    const panYVal = document.getElementById('studio-pany-val');
    if (panYInput) {
        panYInput.addEventListener('input', (e) => {
            studioState.mediaPanY = Number(e.target.value);
            if (panYVal) panYVal.innerText = `${studioState.mediaPanY > 0 ? '+' : ''}${studioState.mediaPanY}%`;
            applyLiveTransformOnly();
        });
    }

    // أزرار لوحة الأسهم الرباعية (D-Pad)
    const btnUp = document.getElementById('studio-btn-dpad-up');
    if (btnUp) {
        btnUp.addEventListener('click', () => {
            studioState.mediaPanY = Math.max(-50, (studioState.mediaPanY || 0) - 5);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    const btnDown = document.getElementById('studio-btn-dpad-down');
    if (btnDown) {
        btnDown.addEventListener('click', () => {
            studioState.mediaPanY = Math.min(50, (studioState.mediaPanY || 0) + 5);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    const btnRight = document.getElementById('studio-btn-dpad-right');
    if (btnRight) {
        btnRight.addEventListener('click', () => {
            studioState.mediaPanX = Math.min(50, (studioState.mediaPanX || 0) + 5);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    const btnLeft = document.getElementById('studio-btn-dpad-left');
    if (btnLeft) {
        btnLeft.addEventListener('click', () => {
            studioState.mediaPanX = Math.max(-50, (studioState.mediaPanX || 0) - 5);
            syncPanZoomSlidersOnly();
            applyLiveTransformOnly();
        });
    }

    // زر إعادة ضبط الموضع والتكبير (Reset)
    const resetTransform = () => {
        studioState.mediaZoom = 100;
        studioState.mediaPanX = 0;
        studioState.mediaPanY = 0;
        syncPanZoomSlidersOnly();
        applyLiveTransformOnly();
        showToast('تمت إعادة ضبط موضع وحجم الصورة للوضع الافتراضي.', 'info', 'إعادة ضبط');
    };

    const btnReset = document.getElementById('studio-btn-reset-transform');
    if (btnReset) btnReset.addEventListener('click', resetTransform);

    const btnDpadCenter = document.getElementById('studio-btn-dpad-center');
    if (btnDpadCenter) btnDpadCenter.addEventListener('click', resetTransform);

    // 5. بطاقات ثيمات الشادو الدائري (Vignette Presets)
    document.querySelectorAll('.studio-vignette-card').forEach(card => {
        card.addEventListener('click', () => {
            const vigId = card.getAttribute('data-vignette');
            if (vigId && STUDIO_VIGNETTES[vigId]) {
                studioState.vignetteTheme = vigId;
                updateVignetteButtonStates();
                updateStudioPreview();
            }
        });
    });

    // 6. بطاقات ثيمات الكارت الملكي
    document.querySelectorAll('.studio-theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.getAttribute('data-theme');
            if (themeId && STUDIO_THEMES[themeId]) {
                studioState.theme = themeId;
                updateThemeButtonStates();
                updateStudioPreview();
            }
        });
    });

    // 7. حقول نصوص ستوري إنستقرام
    const storyPhraseInput = document.getElementById('studio-input-story-phrase');
    if (storyPhraseInput) {
        storyPhraseInput.addEventListener('input', (e) => {
            studioState.storyPhrase = e.target.value;
            updateStudioPreview();
        });
    }

    const storyHandleInput = document.getElementById('studio-input-story-handle');
    if (storyHandleInput) {
        storyHandleInput.addEventListener('input', (e) => {
            studioState.storyHandle = e.target.value;
            updateStudioPreview();
        });
    }

    // 8. شرائح الاقتراحات السريعة للعبارة المميزة
    document.querySelectorAll('.studio-phrase-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const txt = chip.getAttribute('data-phrase');
            if (txt) {
                studioState.storyPhrase = txt;
                if (storyPhraseInput) storyPhraseInput.value = txt;
                updateStudioPreview();
            }
        });
    });

    // 9. مفاتيح إظهار/إخفاء عناصر الستوري
    const bindToggle = (id, prop) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                studioState[prop] = e.target.checked;
                updateStudioPreview();
            });
        }
    };

    bindToggle('studio-toggle-top-vig', 'showTopVignette');
    bindToggle('studio-toggle-bot-vig', 'showBottomVignette');
    bindToggle('studio-toggle-story-phrase', 'showStoryPhrase');
    bindToggle('studio-toggle-story-handle', 'showStoryHandle');

    // 10. حقول نصوص الكارت المباشرة
    const bindInput = (id, prop) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                studioState[prop] = e.target.value;
                updateStudioPreview();
            });
        }
    };

    bindInput('studio-input-title', 'title');
    bindInput('studio-input-subtitle', 'subtitle');
    bindInput('studio-input-dim', 'dimensions');
    bindInput('studio-input-mat', 'material');
    bindInput('studio-input-price', 'price');
    bindInput('studio-input-curr', 'currency');
    bindInput('studio-input-wa', 'whatsapp');

    // 11. شريط تحجيم السجادة في الكارت (Scale)
    const scaleInput = document.getElementById('studio-input-scale');
    const scaleVal = document.getElementById('studio-scale-val');
    if (scaleInput) {
        scaleInput.addEventListener('input', (e) => {
            studioState.carpetScale = Number(e.target.value);
            if (scaleVal) scaleVal.innerText = `${studioState.carpetScale}%`;
            updateStudioPreview();
        });
    }

    // 12. اختيار الشارة الترويجية (Sticker)
    const stickerSelect = document.getElementById('studio-select-sticker');
    if (stickerSelect) {
        stickerSelect.addEventListener('change', (e) => {
            studioState.sticker = e.target.value;
            updateStudioPreview();
        });
    }

    // 13. مفاتيح عناصر الكارت (Toggles)
    bindToggle('studio-toggle-logo', 'showLogo');
    bindToggle('studio-toggle-price', 'showPrice');
    bindToggle('studio-toggle-dim', 'showDimensions');
    bindToggle('studio-toggle-mat', 'showMaterial');
    bindToggle('studio-toggle-wa', 'showWhatsApp');
    bindToggle('studio-toggle-shadow', 'carpetShadow');

    // 14. اختيار السجادة من القائمة المنسدلة
    const carpetSelect = document.getElementById('studio-carpet-select');
    if (carpetSelect) {
        carpetSelect.addEventListener('change', (e) => {
            const carpetId = e.target.value;
            const carpets = window.allPortalCarpets || [];
            const carpet = carpets.find(c => c.id === carpetId);
            if (carpet) {
                applyCarpetToStudioState(carpet);
                syncStudioControlsFromState();
                updateStudioPreview();
            }
        });
    }

    // 15. رفع صورة مخصصة من الجهاز
    const fileUpload = document.getElementById('studio-file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                showToast('يرجى اختيار ملف صورة صالح.', 'error', 'تنبيه');
                return;
            }

            const reader = new FileReader();
            reader.onload = (evt) => {
                studioState.customImageSrc = evt.target.result;
                updateStudioPreview();
                showToast('تم تحميل صورتك بنجاح في الاستوديو!', 'success', 'صورة مخصصة');
            };
            reader.readAsDataURL(file);
        });
    }

    // 16. رفع فيديو مخصص من الجهاز
    const videoUpload = document.getElementById('studio-video-upload');
    if (videoUpload) {
        videoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('video/')) {
                showToast('يرجى اختيار ملف فيديو صالح (MP4 أو WebM أو MOV).', 'error', 'تنبيه');
                return;
            }

            const videoBlobUrl = URL.createObjectURL(file);
            studioState.videoSrc = videoBlobUrl;
            studioState.mediaType = 'video';
            updateMediaButtonStates();
            updateExportButtonText();
            updateStudioPreview();
            showToast('تم تحميل مقطع الفيديو في الاستوديو بنجاح!', 'success', 'فيديو ريلز/ستوري');
        });
    }

    // تصدير دوال الاستوديو إلى window للاستدعاء السريع
    window.selectStudioImageFromThumb = (imgSrc) => {
        studioState.customImageSrc = imgSrc;
        renderCarpetGalleryThumbs();
        updateStudioPreview();
    };

    window.saveStudioDraft = saveStudioDraft;
    window.loadStudioDraft = loadStudioDraft;
    window.deleteStudioDraft = deleteStudioDraft;
    window.exportStudioHDImage = exportStudioHDImage;
    window.copyStudioCaption = copyStudioCaption;
    window.shareStudioToWhatsApp = shareStudioToWhatsApp;
}
