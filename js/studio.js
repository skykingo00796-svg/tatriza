// ==========================================================================
// استوديو تصاميم ونشر السوشيال ميديا وحالات الواتساب (Tatriza Creative Studio)
// دار تطريز TATRIZA — تصميم وتصدير بوستات وستوريات احترافية بدقة فائقة
// ==========================================================================

import { showToast } from './modals.js';

// ==========================================
// الإعدادات والقوالب الافتراضية
// ==========================================
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
        badgeBg: 'rgba(247, 211, 130, 0.2)',
        badgeText: '#fff1c7'
    },
    'modern-parquet': {
        id: 'modern-parquet',
        name: 'الباركيه الخشبي العصري',
        badge: '🪵 استوديو فخم',
        bgType: 'image',
        bgValue: '../images/studio_parquet_wood.jpg',
        textColor: '#ffffff',
        accentColor: '#fcd34d',
        cardBg: 'rgba(24, 18, 14, 0.78)',
        cardBorder: 'rgba(252, 211, 77, 0.4)',
        badgeBg: 'rgba(252, 211, 77, 0.2)',
        badgeText: '#fef9c3'
    }
};

export const STUDIO_RATIOS = {
    '1:1': {
        id: '1:1',
        name: 'بوست مربع (1:1)',
        subtitle: 'إنستقرام وفيس بوك',
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
    selectedCarpetId: '',
    customImageSrc: '',
    ratio: '1:1',
    theme: 'royal-burgundy',
    title: '',
    subtitle: 'حياكة يدوية متقنة تفيض بالأصالة والفخامة',
    dimensions: '',
    material: '',
    price: '',
    currency: 'ر.ع.',
    sticker: 'exclusive', // 'none', 'exclusive', 'silk', 'wool', 'oman', 'artisan'
    whatsapp: '968XXXXXXXX',
    showLogo: true,
    showPrice: true,
    showDimensions: true,
    showMaterial: true,
    showSticker: true,
    showWhatsApp: true,
    carpetScale: 88, // نسبة الحجم 60% إلى 100%
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

    // مزامنة أزرار الاختيار (Toggles)
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

// عرض مصغرات صور القطعة المختارة للتنقل بينها
function renderCarpetGalleryThumbs() {
    const container = document.getElementById('studio-thumbs-container');
    if (!container) return;

    const carpets = window.allPortalCarpets || [];
    const currentCarpet = carpets.find(c => c.id === studioState.selectedCarpetId);

    if (!currentCarpet || !currentCarpet.images || currentCarpet.images.length <= 1) {
        container.innerHTML = '';
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

    const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];
    const ratio = STUDIO_RATIOS[studioState.ratio] || STUDIO_RATIOS['1:1'];

    // تعيين نسبة الأبعاد للحاوية
    stage.className = `relative w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 select-none ${ratio.aspectClass}`;

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
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide shadow-md backdrop-blur-md border border-white/20 animate-pulse" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                <span>${stickerText}</span>
            </div>
        `;
    }

    // شعار الدار بالأعلى
    let logoHtml = '';
    if (studioState.showLogo) {
        logoHtml = `
            <div class="flex items-center gap-2">
                <img src="../images/logo.jpg" class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-amber-300/40 shadow-xs">
                <div class="text-right leading-none">
                    <span class="font-display font-black text-xs sm:text-sm tracking-wider text-white block">TATRIZA</span>
                    <span class="text-[8.5px] sm:text-[9.5px] font-medium" style="color: ${theme.accentColor};">دار تطريز للسجاد الملكي</span>
                </div>
            </div>
        `;
    }

    // السجادة في المنتصف
    const scaleFactor = (studioState.carpetScale || 88) / 100;
    const shadowStyle = studioState.carpetShadow ? 'filter: drop-shadow(0 20px 25px rgba(0,0,0,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.3));' : '';
    const carpetImg = studioState.customImageSrc || '../images/client_room1.jpg';

    // قسم البيانات السفلي
    const showPrice = studioState.showPrice && studioState.price;
    const showDim = studioState.showDimensions && studioState.dimensions;
    const showMat = studioState.showMaterial && studioState.material;

    stage.innerHTML = `
        <!-- شريط الرأس في التصميم -->
        <div class="w-full flex items-center justify-between gap-2 relative z-10">
            ${logoHtml}
            ${stickerHtml}
        </div>

        <!-- مسرح السجادة المركزي -->
        <div class="flex-1 flex items-center justify-center p-2 relative z-10 my-auto overflow-hidden">
            <div class="transition-transform duration-300 max-w-full max-h-full flex items-center justify-center" style="transform: scale(${scaleFactor});">
                <img 
                    src="${carpetImg}" 
                    alt="${studioState.title}" 
                    class="max-w-full max-h-[220px] sm:max-h-[300px] object-contain rounded-2xl border border-white/20 transition-all duration-300"
                    style="${shadowStyle}">
            </div>
        </div>

        <!-- بطاقة المعلومات والدعوة للطلب -->
        <div class="w-full rounded-2xl p-3 sm:p-3.5 backdrop-blur-md relative z-10 space-y-2 border transition-all" style="background: ${theme.cardBg}; border-color: ${theme.cardBorder}; color: ${theme.textColor};">
            <!-- العنوان والوصف -->
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
}

// ==========================================
// تصدير الصورة بدقة عالية جداً عبر Canvas (HD Export)
// ==========================================
export async function exportStudioHDImage() {
    const exportBtn = document.getElementById('studio-btn-export');
    const originalText = exportBtn ? exportBtn.innerHTML : '';
    if (exportBtn) {
        exportBtn.disabled = true;
        exportBtn.innerHTML = '<span>⏳</span><span>جارٍ التوليد بدقة HD...</span>';
    }

    try {
        const ratio = STUDIO_RATIOS[studioState.ratio] || STUDIO_RATIOS['1:1'];
        const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];

        const canvas = document.createElement('canvas');
        canvas.width = ratio.canvasW;
        canvas.height = ratio.canvasH;
        const ctx = canvas.getContext('2d');

        // 1. رسم الخلفية
        if (theme.bgType === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            if (theme.id === 'royal-burgundy') {
                grad.addColorStop(0, '#2b0613');
                grad.addColorStop(0.45, '#681530');
                grad.addColorStop(0.75, '#8a1d41');
                grad.addColorStop(1, '#1f030c');
            } else if (theme.id === 'warm-mocha') {
                grad.addColorStop(0, '#1c1310');
                grad.addColorStop(0.45, '#3d2a23');
                grad.addColorStop(0.75, '#593e34');
                grad.addColorStop(1, '#150d0a');
            } else {
                grad.addColorStop(0, '#090a0d');
                grad.addColorStop(0.5, '#161b22');
                grad.addColorStop(0.8, '#21262d');
                grad.addColorStop(1, '#050608');
            }
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            // رسم صورة الخلفية
            await drawImageOnCanvas(ctx, theme.bgValue, 0, 0, canvas.width, canvas.height, true);
            // إضافة طبقة تعتيم ناعمة لضمان قراءة النصوص بوضوح
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. رسم شعار الدار والاسم في الأعلى
        if (studioState.showLogo) {
            ctx.save();
            await drawRoundedImage(ctx, '../images/logo.jpg', 60, 60, 90, 90, 20);
            ctx.font = 'bold 36px Tajawal, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText('TATRIZA', canvas.width - 60, 100);
            ctx.font = '22px Tajawal, sans-serif';
            ctx.fillStyle = theme.accentColor;
            ctx.fillText('دار تطريز للسجاد والتحف الملكية', canvas.width - 60, 135);
            ctx.restore();
        }

        // 3. رسم شارة التميز (Sticker) إن وجدت
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

        // 4. رسم صورة السجادة في المنتصف
        const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';
        const scale = (studioState.carpetScale || 88) / 100;
        const maxImgW = (canvas.width - 160) * scale;
        const maxImgH = (canvas.height * (studioState.ratio === '9:16' ? 0.5 : 0.45)) * scale;

        ctx.save();
        if (studioState.carpetShadow) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
            ctx.shadowBlur = 45;
            ctx.shadowOffsetY = 25;
        }

        await drawContainedImage(ctx, carpetSrc, (canvas.width - maxImgW) / 2, (canvas.height * 0.22), maxImgW, maxImgH);
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

        // الأبعاد والخامة (يمين)
        let pillsText = '';
        if (studioState.showDimensions && studioState.dimensions) pillsText += `📐 ${studioState.dimensions}   `;
        if (studioState.showMaterial && studioState.material) pillsText += `🧵 ${studioState.material}`;

        if (pillsText) {
            ctx.font = 'bold 24px Tajawal, sans-serif';
            ctx.fillStyle = '#d1d5db';
            ctx.textAlign = 'right';
            ctx.fillText(pillsText, canvas.width - cardMargin - 40, cardY + 195);
        }

        // السعر (يسار)
        if (studioState.showPrice && studioState.price) {
            const priceText = `${studioState.price} ${studioState.currency}`;
            drawRoundedRect(ctx, cardMargin + 40, cardY + 160, 220, 60, 20);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.font = 'bold 32px Tajawal, sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.fillText(priceText, cardMargin + 150, cardY + 202);
        }

        // شريط الواتساب في أسفل الكارد
        if (studioState.showWhatsApp) {
            ctx.font = 'bold 22px Tajawal, sans-serif';
            ctx.fillStyle = '#34d399';
            ctx.textAlign = 'right';
            ctx.fillText('💬 للطلب المباشر والاستفسار عبر الواتساب', canvas.width - cardMargin - 40, cardY + cardH - 35);

            ctx.font = 'bold 22px Tajawal, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(studioState.whatsapp || '+968', cardMargin + 40, cardY + cardH - 35);
        }

        ctx.restore();

        // 6. تحميل الصورة للمستخدم فوراً
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const cleanTitle = (studioState.title || 'tatriza-post').replace(/\s+/g, '-').toLowerCase();
        link.download = `TATRIZA-${cleanTitle}-${studioState.ratio.replace(':', 'x')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('تم تحميل التصميم بدقة عالية HD بنجاح!', 'success', 'استوديو تطريز');
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
    const title = studioState.title || 'سجادة يدوية ملكية فاخرة';
    const dim = studioState.dimensions ? `📐 المقاس: ${studioState.dimensions}` : '';
    const mat = studioState.material ? `🧵 الخامة: ${studioState.material}` : '';
    const price = studioState.price ? `💰 السعر: ${studioState.price} ${studioState.currency}` : '';
    const wa = studioState.whatsapp || '+968';

    const caption = `✨ دار تطريز TATRIZA | تحف فنية تنبض بالهوية والتطريز ✨

🏷️ ${title}
${studioState.subtitle ? `«${studioState.subtitle}»` : ''}

${dim}
${mat}
${price}

💎 قطعة يدوية أصلية تحاكي أرقى فنون الحياكة التراثية لتضفي لمسة فخامة استثنائية على منزلك ومجلسك.

📲 للطلب الفوري والاستفسار عبر الواتساب:
https://wa.me/${wa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً دار تطريز، أرغب بالاستفسار عن القطعة: ${title}`)}

#تطريز #سجاد_يدوي #سجاد_ملكي #تحف_منزلية #ديكور_فاخر #مجالس_عربية #سلطنة_عمان #مسقط #Tatriza #HandmadeRug #LuxuryLiving`;

    navigator.clipboard.writeText(caption).then(() => {
        showToast('تم نسخ نص البوست والهاشتاقات بنجاح! جاهز للصق في إنستقرام والواتساب.', 'success', 'نسخ النص الإعلاني');
    }).catch(() => {
        showToast('تعذر النسخ التلقائي، يمكنك نسخه يدوياً.', 'info', 'تنبيه');
    });
}

// ==========================================
// مشاركة فورية على الواتساب
// ==========================================
export function shareStudioToWhatsApp() {
    const title = studioState.title || 'تحفة دار تطريز';
    const wa = studioState.whatsapp ? studioState.whatsapp.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(`شاهد هذه التحفة الفنية الفاخرة من دار تطريز: ${title}\nالسعر: ${studioState.price} ${studioState.currency}`);
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
        const draftTitle = studioState.title || 'تصميم غير معنون';

        const draftObj = {
            id: draftId,
            timestamp: Date.now(),
            dateFormatted: new Date().toLocaleDateString('ar-OM', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            state: { ...studioState }
        };

        drafts.unshift(draftObj);
        // الاحتفاظ بآخر 12 مسودة
        if (drafts.length > 12) drafts.pop();

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
    showToast(`تم استرجاع التصميم: «${studioState.title}»`, 'info', 'استرجاع المسودة');
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

    container.innerHTML = drafts.map(d => `
        <div class="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-stone-200/80 hover:border-amber-300 transition text-xs">
            <button type="button" onclick="window.loadStudioDraft('${d.id}')" class="flex items-center gap-2 text-right flex-1 min-w-0 cursor-pointer">
                <span class="text-base shrink-0">🎨</span>
                <div class="truncate">
                    <span class="font-bold text-stone-900 block truncate">${d.state.title || 'تصميم مسودة'}</span>
                    <span class="text-[10px] text-stone-400 block">${d.dateFormatted} • ${d.state.ratio}</span>
                </div>
            </button>
            <button type="button" onclick="window.deleteStudioDraft('${d.id}')" class="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition text-xs shrink-0 cursor-pointer" title="حذف المسودة">
                ✕
            </button>
        </div>
    `).join('');
}

// ==========================================
// ربط الأحداث مع واجهة المستخدم
// ==========================================
export function initStudioEvents() {
    // 1. اختيار القطعة من القائمة
    const carpetSelect = document.getElementById('studio-carpet-select');
    if (carpetSelect) {
        carpetSelect.addEventListener('change', (e) => {
            const carpets = window.allPortalCarpets || [];
            const target = carpets.find(c => c.id === e.target.value);
            if (target) {
                applyCarpetToStudioState(target);
                syncStudioControlsFromState();
                updateStudioPreview();
            }
        });
    }

    // 2. رفع صورة مخصصة من الجهاز
    const fileIn = document.getElementById('studio-file-upload');
    if (fileIn) {
        fileIn.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    studioState.customImageSrc = ev.target.result;
                    updateStudioPreview();
                    renderCarpetGalleryThumbs();
                    showToast('تم تحميل وتعيين صورتك في الاستوديو!', 'success', 'صورة مخصصة');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. أزرار الأبعاد
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

    // 4. بطاقات الثيمات
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

    // 5. حقول النصوص المباشرة
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

    // 6. مقياس حجم السجادة (Zoom Slider)
    const scaleIn = document.getElementById('studio-input-scale');
    if (scaleIn) {
        scaleIn.addEventListener('input', (e) => {
            studioState.carpetScale = Number(e.target.value);
            const scaleVal = document.getElementById('studio-scale-val');
            if (scaleVal) scaleVal.innerText = `${studioState.carpetScale}%`;
            updateStudioPreview();
        });
    }

    // 7. الشارة الترويجية (Sticker)
    const stickerIn = document.getElementById('studio-select-sticker');
    if (stickerIn) {
        stickerIn.addEventListener('change', (e) => {
            studioState.sticker = e.target.value;
            updateStudioPreview();
        });
    }

    // 8. مفاتيح التبديل (Toggles)
    const bindToggle = (id, prop) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                studioState[prop] = e.target.checked;
                updateStudioPreview();
            });
        }
    };

    bindToggle('studio-toggle-logo', 'showLogo');
    bindToggle('studio-toggle-price', 'showPrice');
    bindToggle('studio-toggle-dim', 'showDimensions');
    bindToggle('studio-toggle-mat', 'showMaterial');
    bindToggle('studio-toggle-wa', 'showWhatsApp');
    bindToggle('studio-toggle-shadow', 'carpetShadow');
}

// جعل الدوال الأساسية متاحة على window
window.openTatrizaStudioModal = openTatrizaStudioModal;
window.closeTatrizaStudioModal = closeTatrizaStudioModal;
window.exportStudioHDImage = exportStudioHDImage;
window.copyStudioCaption = copyStudioCaption;
window.shareStudioToWhatsApp = shareStudioToWhatsApp;
window.saveStudioDraft = saveStudioDraft;
window.loadStudioDraft = loadStudioDraft;
window.deleteStudioDraft = deleteStudioDraft;
window.selectStudioImageFromThumb = function(imgSrc) {
    studioState.customImageSrc = imgSrc;
    renderCarpetGalleryThumbs();
    updateStudioPreview();
};
