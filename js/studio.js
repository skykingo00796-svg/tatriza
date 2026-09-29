// ==========================================================================
// استوديو تصاميم ونشر السوشيال ميديا وحالات الواتساب (Tatriza Creative Studio)
// دار تطريز TATRIZA — تصميم وتصدير بوستات وستوريات احترافية بدقة فائقة
// تحكم كامل بحجم وحركة الصورة (تكبير، تصغير، يمين، يسار، أعلى، أسفل)
// ==========================================================================

import { showToast } from './modals.js';

// ==========================================
// الإعدادات والقوالب وثيمات التصميم
// ==========================================

// 1. خيارات وألوان شعار الدار والعلامة المائية (Transparent & Multi-Color Logos)
export const STUDIO_LOGO_OPTIONS = {
    'transparent-burgundy': {
        id: 'transparent-burgundy',
        name: 'عنابي تطريز الرسمي (شفاف)',
        sub: 'الهوية الرسمية للدار بدون خلفية',
        badge: '🍷 عنابي الدار',
        src: '../images/logo_transparent.png',
        colorDot: '#7c1d3c'
    },
    'transparent-gold': {
        id: 'transparent-gold',
        name: 'ذهبي وهيبة الملكي (شفاف)',
        sub: 'اللوجو الذهبي رمال وهيبة بدون خلفية',
        badge: '👑 ذهبي ملكي',
        src: '../images/logoY_transparent.png',
        colorDot: '#c59b27'
    },
    'transparent-emerald': {
        id: 'transparent-emerald',
        name: 'زمردي واحة ظفار (شفاف)',
        sub: 'اللوجو الأخضر بدون خلفية',
        badge: '🌿 أخضر ظفار',
        src: '../images/logoG_transparent.png',
        colorDot: '#435838'
    },
    'transparent-navy': {
        id: 'transparent-navy',
        name: 'كحلي بحر مسقط (شفاف)',
        sub: 'اللوجو الكحلي النيلي بدون خلفية',
        badge: '🌊 أزرق مسقط',
        src: '../images/logoB_transparent.png',
        colorDot: '#2d5f75'
    },
    'white': {
        id: 'white',
        name: 'أبيض ناصع نقي',
        sub: 'الأكثر فخامة على الستوري والشادو',
        badge: '✨ موصى به',
        src: '../images/logo_white.png',
        colorDot: '#ffffff'
    },
    'gold': {
        id: 'gold',
        name: 'مُذهّب ملكي خالص',
        sub: 'فخامة ذهبية ملكية ثلاثية الأبعاد',
        badge: '👑 فاخر',
        src: '../images/logo_gold.png',
        colorDot: '#d4af37'
    },
    'black': {
        id: 'black',
        name: 'أسود فحمي فاخر',
        sub: 'مناسب للخلفيات الفاتحة والبوستات',
        badge: '⚫ نقي',
        src: '../images/logo_black.png',
        colorDot: '#18181b'
    },
    'custom': {
        id: 'custom',
        name: 'لون مخصص للشعار',
        sub: 'اختر أي لون تريده للشعار بالكامل',
        badge: '🎨 مخصص',
        src: '../images/logo_white.png',
        colorDot: '#fef08a'
    },
    'original': {
        id: 'original',
        name: 'اللوجو الأصلي (بخلفية بيج)',
        sub: 'الشعار بصيغته الكلاسيكية',
        badge: '📜 أصلي',
        src: '../images/logo.jpg',
        colorDot: '#7c1d3c'
    }
};

// اختصارات وتوافق لأسماء الثيمات الأربعة
STUDIO_LOGO_OPTIONS['burgundy'] = STUDIO_LOGO_OPTIONS['transparent-burgundy'];
STUDIO_LOGO_OPTIONS['emerald'] = STUDIO_LOGO_OPTIONS['transparent-emerald'];
STUDIO_LOGO_OPTIONS['green'] = STUDIO_LOGO_OPTIONS['transparent-emerald'];
STUDIO_LOGO_OPTIONS['navy'] = STUDIO_LOGO_OPTIONS['transparent-navy'];
STUDIO_LOGO_OPTIONS['blue'] = STUDIO_LOGO_OPTIONS['transparent-navy'];

// 2. ثيمات الشادو الدائري لنمط الستوري كامل الشاشة (Story / Reels Vignette)
export const STUDIO_VIGNETTES = {
    // ألوان وأنماط الموقع المعتمدة
    'site-burgundy': {
        id: 'site-burgundy',
        name: 'عنابي دار تطريز الكلاسيكي',
        badge: '🏛️ هوية الموقع',
        category: 'site',
        topColorRgb: '124, 29, 60',
        bottomColorRgb: '110, 22, 52',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(124, 29, 60, 0.95) 0%, rgba(124, 29, 60, 0.82) 35%, rgba(124, 29, 60, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(110, 22, 52, 0.96) 0%, rgba(110, 22, 52, 0.88) 40%, rgba(110, 22, 52, 0.45) 75%, transparent 100%)',
        phraseColor: '#fde047',
        phraseShadow: '0 2px 14px rgba(0,0,0,0.7)',
        handleColor: '#fde68a'
    },
    'site-emerald': {
        id: 'site-emerald',
        name: 'زمردي واحة ظفار الملكي',
        badge: '🌿 أخضر الموقع',
        category: 'site',
        topColorRgb: '55, 75, 46',
        bottomColorRgb: '42, 58, 35',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(55, 75, 46, 0.95) 0%, rgba(55, 75, 46, 0.82) 35%, rgba(55, 75, 46, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(42, 58, 35, 0.96) 0%, rgba(42, 58, 35, 0.88) 40%, rgba(42, 58, 35, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 14px rgba(0,0,0,0.65)',
        handleColor: '#d1fae5'
    },
    'site-navy': {
        id: 'site-navy',
        name: 'كحلي ليالي وبحر مسقط',
        badge: '🌊 أزرق الموقع',
        category: 'site',
        topColorRgb: '36, 75, 94',
        bottomColorRgb: '28, 58, 74',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(36, 75, 94, 0.95) 0%, rgba(36, 75, 94, 0.82) 35%, rgba(36, 75, 94, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(28, 58, 74, 0.96) 0%, rgba(28, 58, 74, 0.88) 40%, rgba(28, 58, 74, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 14px rgba(0,0,0,0.65)',
        handleColor: '#bae6fd'
    },
    'site-gold': {
        id: 'site-gold',
        name: 'كهرماني رمال وهيبة الذهبي',
        badge: '🏜️ ذهبي الموقع',
        category: 'site',
        topColorRgb: '185, 142, 30',
        bottomColorRgb: '158, 119, 20',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(185, 142, 30, 0.95) 0%, rgba(185, 142, 30, 0.82) 35%, rgba(185, 142, 30, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(158, 119, 20, 0.96) 0%, rgba(158, 119, 20, 0.88) 40%, rgba(158, 119, 20, 0.45) 75%, transparent 100%)',
        phraseColor: '#2b1b06',
        phraseShadow: '0 1px 8px rgba(255,255,255,0.4)',
        handleColor: '#3a260d'
    },

    // تدرجات إنستقرام وريلز الفاخرة
    'blush-rose': {
        id: 'blush-rose',
        name: 'الوردي والتوتي الدافئ (كالأصل)',
        badge: '🌸 المطابق للبوست',
        category: 'luxury',
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
        name: 'العنابي الداكن المذهب',
        badge: '🍷 مخملي فاخر',
        category: 'luxury',
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
        name: 'الأوبسيديان الفاحم والذهب',
        badge: '🖤 سينمائي داكن',
        category: 'luxury',
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
        name: 'العاجي والبيج المخملي',
        badge: '🕊️ نهاري مشرق',
        category: 'luxury',
        topColorRgb: '235, 225, 212',
        bottomColorRgb: '230, 218, 202',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(235, 225, 212, 0.95) 0%, rgba(235, 225, 212, 0.8) 35%, rgba(235, 225, 212, 0.3) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(230, 218, 202, 0.96) 0%, rgba(230, 218, 202, 0.88) 40%, rgba(230, 218, 202, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 10px rgba(0,0,0,0.4)',
        handleColor: '#4a382e'
    },
    'amethyst-violet': {
        id: 'amethyst-violet',
        name: 'البنفسجي الإمبراطوري',
        badge: '🔮 ملكي نادر',
        category: 'luxury',
        topColorRgb: '58, 16, 68',
        bottomColorRgb: '46, 12, 54',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(58, 16, 68, 0.95) 0%, rgba(58, 16, 68, 0.82) 35%, rgba(58, 16, 68, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(46, 12, 54, 0.96) 0%, rgba(46, 12, 54, 0.88) 40%, rgba(46, 12, 54, 0.45) 75%, transparent 100%)',
        phraseColor: '#f3e8ff',
        phraseShadow: '0 2px 14px rgba(0,0,0,0.7)',
        handleColor: '#d8b4fe'
    },
    'terracotta-copper': {
        id: 'terracotta-copper',
        name: 'النحاسي والبرونزي التراثي',
        badge: '🏺 دافئ وتراثي',
        category: 'luxury',
        topColorRgb: '168, 72, 48',
        bottomColorRgb: '142, 58, 38',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(168, 72, 48, 0.95) 0%, rgba(168, 72, 48, 0.82) 35%, rgba(168, 72, 48, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(142, 58, 38, 0.96) 0%, rgba(142, 58, 38, 0.88) 40%, rgba(142, 58, 38, 0.45) 75%, transparent 100%)',
        phraseColor: '#ffffff',
        phraseShadow: '0 2px 12px rgba(0,0,0,0.5)',
        handleColor: '#fed7aa'
    },
    'midnight-sapphire': {
        id: 'midnight-sapphire',
        name: 'الياقوتي الأزرق الليلي',
        badge: '🌌 فخامة ليلية',
        category: 'luxury',
        topColorRgb: '12, 24, 46',
        bottomColorRgb: '8, 16, 32',
        topVignetteCss: 'radial-gradient(ellipse 110% 75% at 50% 0%, rgba(12, 24, 46, 0.95) 0%, rgba(12, 24, 46, 0.82) 35%, rgba(12, 24, 46, 0.35) 70%, transparent 100%)',
        botVignetteCss: 'radial-gradient(ellipse 120% 90% at 50% 100%, rgba(8, 16, 32, 0.96) 0%, rgba(8, 16, 32, 0.88) 40%, rgba(8, 16, 32, 0.45) 75%, transparent 100%)',
        phraseColor: '#e0f2fe',
        phraseShadow: '0 2px 14px rgba(0,0,0,0.7)',
        handleColor: '#93c5fd'
    },
    'custom': {
        id: 'custom',
        name: 'تخصيص حر بالألوان',
        badge: '🎨 منتقي ألوان حر',
        category: 'custom',
        topColorRgb: '124, 29, 60',
        bottomColorRgb: '110, 22, 52',
        phraseColor: '#ffffff',
        handleColor: '#fde047'
    }
};

// ==========================================
// مكتبة الخطوط المعتمدة للاستوديو (عربية، إنجليزية، تواقيع، ومخصص)
// ==========================================
export const STUDIO_FONTS = {
    // خطوط عربية فاخرة
    'el-messiri': {
        id: 'el-messiri',
        name: 'المسيري الملكي',
        family: "'El Messiri', serif",
        category: 'arabic',
        badge: 'المسيري 👑'
    },
    'tajawal': {
        id: 'tajawal',
        name: 'تجوال العصري',
        family: "'Tajawal', sans-serif",
        category: 'arabic',
        badge: 'تجوال ✨'
    },
    'amiri': {
        id: 'amiri',
        name: 'أميري كلاسيك',
        family: "'Amiri', serif",
        category: 'arabic',
        badge: 'أميري 📜'
    },
    'cairo': {
        id: 'cairo',
        name: 'القاهرة العريض',
        family: "'Cairo', sans-serif",
        category: 'arabic',
        badge: 'القاهرة 🔥'
    },
    'alexandria': {
        id: 'alexandria',
        name: 'الإسكندرية الهندسي',
        family: "'Alexandria', sans-serif",
        category: 'arabic',
        badge: 'الإسكندرية 🏛️'
    },
    'aref-ruqaa': {
        id: 'aref-ruqaa',
        name: 'عارف رقعة الأصيل',
        family: "'Aref Ruqaa', serif",
        category: 'arabic',
        badge: 'رقعة ✍️'
    },
    'reem-kufi': {
        id: 'reem-kufi',
        name: 'ريم كوفي الفني',
        family: "'Reem Kufi', sans-serif",
        category: 'arabic',
        badge: 'كوفي 📐'
    },
    'kufam': {
        id: 'kufam',
        name: 'كوفام المعاصر',
        family: "'Kufam', sans-serif",
        category: 'arabic',
        badge: 'كوفام 🎨'
    },
    'noto-serif': {
        id: 'noto-serif',
        name: 'نوتو سيريف الوقور',
        family: "'Noto Serif Arabic', serif",
        category: 'arabic',
        badge: 'نوتو 📖'
    },
    'almarai': {
        id: 'almarai',
        name: 'المراعي الهادئ',
        family: "'Almarai', sans-serif",
        category: 'arabic',
        badge: 'المراعي 🌿'
    },
    'marhey': {
        id: 'marhey',
        name: 'مرحي الديناميكي',
        family: "'Marhey', cursive",
        category: 'arabic',
        badge: 'مرحي 🎉'
    },

    // خطوط إنجليزية وتواقيع عالمية
    'playfair': {
        id: 'playfair',
        name: 'Playfair Display',
        family: "'Playfair Display', serif",
        category: 'english',
        badge: 'Playfair 👑'
    },
    'cinzel': {
        id: 'cinzel',
        name: 'Cinzel Roman',
        family: "'Cinzel', serif",
        category: 'english',
        badge: 'Cinzel 🏛️'
    },
    'great-vibes': {
        id: 'great-vibes',
        name: 'Great Vibes Script',
        family: "'Great Vibes', cursive",
        category: 'english',
        badge: 'Great Vibes ✒️'
    },
    'montserrat': {
        id: 'montserrat',
        name: 'Montserrat Modern',
        family: "'Montserrat', sans-serif",
        category: 'english',
        badge: 'Montserrat 💎'
    },
    'outfit': {
        id: 'outfit',
        name: 'Outfit Minimal',
        family: "'Outfit', sans-serif",
        category: 'english',
        badge: 'Outfit ⚡'
    },
    'mono': {
        id: 'mono',
        name: 'Space Mono / Courier',
        family: "'Courier New', Courier, monospace",
        category: 'english',
        badge: 'Mono 💻'
    },
    'custom': {
        id: 'custom',
        name: 'خط مخصص',
        family: '',
        category: 'custom',
        badge: '✏️ مخصص'
    }
};

export function getStudioFontFamily(fontId, customFont = '') {
    if (fontId === 'custom' && customFont && customFont.trim()) {
        return `"${customFont.trim()}", sans-serif`;
    }
    const font = STUDIO_FONTS[fontId];
    if (font && font.family) return font.family;
    return "'El Messiri', serif";
}

export function getStudioCanvasFont(fontId, sizePx, isBold = true, customFont = '') {
    const weight = isBold ? 'bold' : 'normal';
    if (fontId === 'custom' && customFont && customFont.trim()) {
        return `${weight} ${sizePx}px "${customFont.trim()}", sans-serif`;
    }
    const font = STUDIO_FONTS[fontId];
    if (font) {
        if (fontId === 'great-vibes') {
            return `${Math.round(sizePx * 1.15)}px 'Great Vibes', cursive`;
        }
        if (fontId === 'mono') {
            return `${weight} ${sizePx}px "Courier New", monospace`;
        }
        return `${weight} ${sizePx}px ${font.family}`;
    }
    return `${weight} ${sizePx}px 'El Messiri', serif`;
}

export function hexToRgbString(hex) {
    if (!hex) return '124, 29, 60';
    let c = hex.replace('#', '').trim();
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return '124, 29, 60';
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(255, 255, 255, ${alpha})`;
    if (hex.startsWith('rgba')) return hex;
    if (hex.startsWith('rgb(')) return hex.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    const rgb = hexToRgbString(hex);
    return `rgba(${rgb}, ${alpha})`;
}

export function getActiveVignette() {
    let base;
    if (studioState.vignetteTheme === 'custom') {
        const topHex = studioState.customVigTopColor || '#7c1d3c';
        const botHex = studioState.customVigBotColor || '#6e1634';
        const topRgb = hexToRgbString(topHex);
        const botRgb = hexToRgbString(botHex);
        base = {
            id: 'custom',
            name: 'تخصيص حر بالألوان',
            badge: '🎨 مخصص',
            topColorRgb: topRgb,
            bottomColorRgb: botRgb,
            phraseColor: '#ffffff',
            phraseShadow: '0 2px 14px rgba(0,0,0,0.7)',
            handleColor: '#fde047'
        };
    } else {
        base = STUDIO_VIGNETTES[studioState.vignetteTheme] || STUDIO_VIGNETTES['site-burgundy'];
    }

    // استخراج معايير التحكم الدقيق بالشادو (شفافية، تحريك للأعلى/الأسفل، بروز، حدة)
    const opacity = (studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95) / 100;
    const offsetY = studioState.vignetteOffsetY || 0; // -40px إلى +40px
    const spread = (studioState.vignetteSpread || 100) / 100; // 0.4 إلى 1.6
    const sharpness = (studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40) / 100; // 0 إلى 1

    // حساب الشفافية وقوة الألوان ومواقع التوقف بدقة
    const topA1 = Math.min(1, 0.96 * opacity).toFixed(3);
    const topA2 = Math.min(1, (0.78 + 0.16 * sharpness) * opacity).toFixed(3);
    const topA3 = Math.max(0, (0.35 - 0.22 * sharpness) * opacity).toFixed(3);

    const botA1 = Math.min(1, 0.98 * opacity).toFixed(3);
    const botA2 = Math.min(1, (0.84 + 0.14 * sharpness) * opacity).toFixed(3);
    const botA3 = Math.max(0, (0.40 - 0.24 * sharpness) * opacity).toFixed(3);

    const stop1 = Math.max(12, Math.round(35 * (1 - sharpness * 0.45)));
    const stop2 = Math.min(94, Math.round(70 + (1 - sharpness) * 15));

    // أبعاد وتمركز نقطة بداية الشادو (تحريك للأعلى والأسفل)
    const topYOrigin = Math.round(offsetY * 0.5);
    const botYOrigin = Math.round(100 - offsetY * 0.5);
    const topEllipseH = Math.round(75 * spread);
    const topEllipseW = Math.round(110 * Math.sqrt(spread));
    const botEllipseH = Math.round(90 * spread);
    const botEllipseW = Math.round(120 * Math.sqrt(spread));

    const topVignetteCss = `radial-gradient(ellipse ${topEllipseW}% ${topEllipseH}% at 50% ${topYOrigin}%, rgba(${base.topColorRgb}, ${topA1}) 0%, rgba(${base.topColorRgb}, ${topA2}) ${stop1}%, rgba(${base.topColorRgb}, ${topA3}) ${stop2}%, transparent 100%)`;
    const botVignetteCss = `radial-gradient(ellipse ${botEllipseW}% ${botEllipseH}% at 50% ${botYOrigin}%, rgba(${base.bottomColorRgb}, ${botA1}) 0%, rgba(${base.bottomColorRgb}, ${botA2}) ${stop1}%, rgba(${base.bottomColorRgb}, ${botA3}) ${stop2}%, transparent 100%)`;

    return {
        ...base,
        topVignetteCss,
        botVignetteCss
    };
}

export function getLogoHtmlForPreview() {
    if (!studioState.showLogo) return '';
    const logoOption = STUDIO_LOGO_OPTIONS[studioState.logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];
    const sizeClasses = {
        'small': 'w-14 h-14 sm:w-16 sm:h-16',
        'medium': 'w-20 h-20 sm:w-24 sm:h-24',
        'large': 'w-28 h-28 sm:w-32 sm:h-32'
    };
    const sizeClass = sizeClasses[studioState.logoSize] || sizeClasses['medium'];
    const opacityStyle = `opacity: ${(studioState.logoOpacity || 100) / 100};`;

    if (studioState.logoVariant === 'custom') {
        const color = studioState.logoCustomColor || '#7c1d3c';
        return `
            <div class="relative z-20 pt-5 sm:pt-7 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                <div 
                    class="${sizeClass} drop-shadow-md select-none transition-all duration-150" 
                    style="background-color: ${color}; -webkit-mask-image: url('../images/logo_white.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('../images/logo_white.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; ${opacityStyle}">
                </div>
            </div>
        `;
    }

    const blendStyle = studioState.logoVariant === 'original' ? 'mix-blend-mode: multiply;' : '';

    return `
        <div class="relative z-20 pt-5 sm:pt-7 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
            <img 
                src="${logoOption.src}" 
                class="${sizeClass} object-contain drop-shadow-md select-none transition-all duration-150" 
                style="${blendStyle} ${opacityStyle}" 
                alt="TATRIZA Logo">
        </div>
    `;
}

export function getCardLogoElementHtml() {
    if (!studioState.showLogo) return '';
    const logoOption = STUDIO_LOGO_OPTIONS[studioState.logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];
    const opacityStyle = `opacity: ${(studioState.logoOpacity || 100) / 100};`;

    if (studioState.logoVariant === 'custom') {
        const color = studioState.logoCustomColor || '#7c1d3c';
        return `
            <div class="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-xs" style="background-color: ${color}; -webkit-mask-image: url('../images/logo_white.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('../images/logo_white.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; ${opacityStyle}"></div>
        `;
    }

    const blendStyle = studioState.logoVariant === 'original' ? 'mix-blend-mode: multiply;' : '';
    return `
        <img src="${logoOption.src}" class="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs shrink-0" style="${blendStyle} ${opacityStyle}" alt="Logo">
    `;
}

export function getTintedLogoCanvas(logoImg, color) {
    const oc = document.createElement('canvas');
    oc.width = logoImg.naturalWidth || logoImg.width;
    oc.height = logoImg.naturalHeight || logoImg.height;
    const octx = oc.getContext('2d');
    
    octx.drawImage(logoImg, 0, 0);
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = color;
    octx.fillRect(0, 0, oc.width, oc.height);
    
    return oc;
}

export function getMinimalLogoPreviewHtml() {
    if (!studioState.showLogo) return '';
    const logoOption = STUDIO_LOGO_OPTIONS[studioState.logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];
    
    // أبعاد دقيقة ومطلقة بالبكسل - ثابتة تماماً ومستقلة عن التحريك الأفقي
    const dimMap = {
        'small': 46,
        'medium': 64,
        'large': 86
    };
    const dim = dimMap[studioState.logoSize || 'small'] || 46;
    const opacity = (studioState.logoOpacity || 100) / 100;
    const topY = studioState.minimalLogoOffsetY || 25;
    const offsetPercent = studioState.minimalLogoOffsetPercent || 0;

    // تثبيت العرض والارتفاع بدقة مع max-width: none لمنع أي انضغاط عند أطراف الكانفاس
    const boxStyle = `width: ${dim}px !important; height: ${dim}px !important; min-width: ${dim}px !important; max-width: none !important; min-height: ${dim}px !important; max-height: none !important; flex-shrink: 0;`;
    const positionStyle = `top: ${topY}px; left: calc(50% + ${offsetPercent}%); transform: translateX(-50%); ${boxStyle}`;

    if (studioState.logoVariant === 'custom') {
        const color = studioState.logoCustomColor || '#7c1d3c';
        return `
            <div class="absolute z-20 pointer-events-none transition-all duration-150 flex items-center justify-center" style="${positionStyle}">
                <div 
                    class="drop-shadow-xs select-none block" 
                    style="${boxStyle} background-color: ${color}; -webkit-mask-image: url('../images/logo_white.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('../images/logo_white.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; opacity: ${opacity};">
                </div>
            </div>
        `;
    }

    const blendStyle = studioState.logoVariant === 'original' ? 'mix-blend-mode: multiply;' : '';

    return `
        <div class="absolute z-20 pointer-events-none transition-all duration-150 flex items-center justify-center" style="${positionStyle}">
            <img 
                src="${logoOption.src}" 
                class="object-contain drop-shadow-xs select-none block" 
                style="${boxStyle} ${blendStyle} opacity: ${opacity};" 
                alt="TATRIZA Logo">
        </div>
    `;
}

export function getMinimalHandlePreviewHtml() {
    if (!studioState.showStoryHandle || !studioState.storyHandle) return '';
    const bottomY = studioState.minimalHandleOffsetY || 25;
    const color = studioState.minimalHandleColor || '#6b7280';
    const handleText = studioState.storyHandle.trim();
    const fontFamily = getStudioFontFamily(studioState.storyHandleFont || 'mono', studioState.storyHandleCustomFont);

    let positionStyle = '';
    if (studioState.minimalHandleAlign === 'right') {
        positionStyle = `bottom: ${bottomY}px; right: 24px;`;
    } else if (studioState.minimalHandleAlign === 'left') {
        positionStyle = `bottom: ${bottomY}px; left: 24px;`;
    } else {
        const offsetPercent = studioState.minimalHandleOffsetPercent || 0;
        positionStyle = `bottom: ${bottomY}px; left: calc(50% + ${offsetPercent}%); transform: translateX(-50%);`;
    }

    if (studioState.minimalHandleStyle === 'pill') {
        return `
            <div class="absolute z-20 pointer-events-none transition-all duration-150" style="${positionStyle}">
                <div class="px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-xs border border-stone-200/60 shadow-2xs font-bold text-[10px] sm:text-[11px] tracking-[0.25em] select-none text-center" style="font-family: ${fontFamily}; color: ${color};">
                    ${handleText}
                </div>
            </div>
        `;
    }

    return `
        <div class="absolute z-20 pointer-events-none transition-all duration-150" style="${positionStyle}">
            <div class="font-bold text-[11px] sm:text-[12px] tracking-[0.25em] select-none drop-shadow-2xs text-center" style="font-family: ${fontFamily}; color: ${color}; text-shadow: 0 1px 2px rgba(255,255,255,0.7);">
                ${handleText}
            </div>
        </div>
    `;
}

export function getStoryLogoPreviewHtml() {
    if (!studioState.showLogo) return '';
    const logoOption = STUDIO_LOGO_OPTIONS[studioState.logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];
    
    // أبعاد دقيقة ومطلقة بالبكسل - ثابتة تماماً ومستقلة عن التحريك الأفقي
    const dimMap = {
        'small': 52,
        'medium': 74,
        'large': 98
    };
    const dim = dimMap[studioState.logoSize || 'medium'] || 74;
    const opacity = (studioState.logoOpacity || 100) / 100;
    const topY = studioState.storyLogoOffsetY || 25;
    const offsetPercent = studioState.storyLogoOffsetPercent || 0;

    // تثبيت العرض والارتفاع بدقة مع max-width: none لمنع أي انضغاط عند أطراف الكانفاس
    const boxStyle = `width: ${dim}px !important; height: ${dim}px !important; min-width: ${dim}px !important; max-width: none !important; min-height: ${dim}px !important; max-height: none !important; flex-shrink: 0;`;
    const positionStyle = `top: ${topY}px; left: calc(50% + ${offsetPercent}%); transform: translateX(-50%); ${boxStyle}`;

    if (studioState.logoVariant === 'custom') {
        const color = studioState.logoCustomColor || '#fef08a';
        return `
            <div class="absolute z-20 pointer-events-none transition-all duration-150 flex items-center justify-center" style="${positionStyle}">
                <div 
                    class="drop-shadow-md select-none block" 
                    style="${boxStyle} background-color: ${color}; -webkit-mask-image: url('../images/logo_white.png'); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center; mask-image: url('../images/logo_white.png'); mask-size: contain; mask-repeat: no-repeat; mask-position: center; opacity: ${opacity};">
                </div>
            </div>
        `;
    }

    const blendStyle = studioState.logoVariant === 'original' ? 'mix-blend-mode: multiply;' : '';

    return `
        <div class="absolute z-20 pointer-events-none transition-all duration-150 flex items-center justify-center" style="${positionStyle}">
            <img 
                src="${logoOption.src}" 
                class="object-contain drop-shadow-md select-none block" 
                style="${boxStyle} ${blendStyle} opacity: ${opacity};" 
                alt="TATRIZA Logo">
        </div>
    `;
}

export function getStoryPhrasePreviewHtml(vig) {
    if (!studioState.showStoryPhrase || !studioState.storyPhrase) return '';
    const bottomY = studioState.storyPhraseOffsetY || 68;
    const phraseColor = (studioState.storyPhraseColor && studioState.storyPhraseColor !== 'default') 
        ? studioState.storyPhraseColor 
        : (vig.phraseColor || '#ffffff');
    const sizeMap = {
        'sm': 'text-sm sm:text-base',
        'md': 'text-base sm:text-lg',
        'lg': 'text-lg sm:text-xl',
        'xl': 'text-xl sm:text-2xl'
    };
    const sizeClass = sizeMap[studioState.storyPhraseSize || 'md'] || 'text-base sm:text-lg';
    const fontFamily = getStudioFontFamily(studioState.storyPhraseFont || 'el-messiri', studioState.storyPhraseCustomFont);

    let positionStyle = '';
    let alignClass = 'text-center';
    if (studioState.storyPhraseAlign === 'right') {
        positionStyle = `bottom: ${bottomY}px; right: 20px;`;
        alignClass = 'text-right';
    } else if (studioState.storyPhraseAlign === 'left') {
        positionStyle = `bottom: ${bottomY}px; left: 20px;`;
        alignClass = 'text-left';
    } else {
        const offsetPercent = studioState.storyPhraseOffsetPercent || 0;
        positionStyle = `bottom: ${bottomY}px; left: calc(50% + ${offsetPercent}%); transform: translateX(-50%);`;
        alignClass = 'text-center';
    }

    return `
        <div class="absolute z-20 pointer-events-none transition-all duration-150 px-3 max-w-[88%] w-max" style="${positionStyle}">
            <div class="font-bold ${sizeClass} tracking-wide select-none ${alignClass} drop-shadow-md" style="font-family: ${fontFamily}; color: ${phraseColor}; text-shadow: ${vig.phraseShadow};">
                ${studioState.storyPhrase}
            </div>
        </div>
    `;
}

export function getStoryHandlePreviewHtml(vig) {
    if (!studioState.showStoryHandle || !studioState.storyHandle) return '';
    const bottomY = studioState.storyHandleOffsetY || 25;
    const handleColor = (studioState.storyHandleColor && studioState.storyHandleColor !== 'default') 
        ? studioState.storyHandleColor 
        : (vig.handleColor || '#fde68a');
    const handleText = studioState.storyHandle.trim();
    const fontFamily = getStudioFontFamily(studioState.storyHandleFont || 'mono', studioState.storyHandleCustomFont);

    let positionStyle = '';
    let alignClass = 'text-center';
    if (studioState.storyHandleAlign === 'right') {
        positionStyle = `bottom: ${bottomY}px; right: 20px;`;
        alignClass = 'text-right';
    } else if (studioState.storyHandleAlign === 'left') {
        positionStyle = `bottom: ${bottomY}px; left: 20px;`;
        alignClass = 'text-left';
    } else {
        const offsetPercent = studioState.storyHandleOffsetPercent || 0;
        positionStyle = `bottom: ${bottomY}px; left: calc(50% + ${offsetPercent}%); transform: translateX(-50%);`;
        alignClass = 'text-center';
    }

    if (studioState.storyHandleStyle === 'pill') {
        return `
            <div class="absolute z-20 pointer-events-none transition-all duration-150" style="${positionStyle}">
                <div class="px-3.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 shadow-lg font-bold text-[10px] sm:text-[11px] tracking-[0.25em] select-none text-center" style="font-family: ${fontFamily}; color: ${handleColor};">
                    ${handleText}
                </div>
            </div>
        `;
    }

    return `
        <div class="absolute z-20 pointer-events-none transition-all duration-150" style="${positionStyle}">
            <div class="font-bold text-[11px] sm:text-[12px] tracking-[0.28em] select-none ${alignClass} drop-shadow-sm" style="font-family: ${fontFamily}; color: ${handleColor}; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                ${handleText}
            </div>
        </div>
    `;
}

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
        cardBg: 'rgba(28, 6, 14, 0.72)',
        cardBorder: 'rgba(243, 207, 122, 0.45)',
        badgeBg: 'rgba(243, 207, 122, 0.18)',
        badgeText: '#f8deb0'
    },
    'obsidian-gold': {
        id: 'obsidian-gold',
        name: 'الأوبسيديان الفاخر والذهب',
        badge: '🖤 فخامة داكنة',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #090a0d 0%, #161b22 50%, #21262d 75%, #050608 100%)',
        textColor: '#ffffff',
        accentColor: '#e5b842',
        cardBg: 'rgba(10, 12, 16, 0.78)',
        cardBorder: 'rgba(229, 184, 66, 0.45)',
        badgeBg: 'rgba(229, 184, 66, 0.2)',
        badgeText: '#fcedbb'
    },
    'emerald-oasis': {
        id: 'emerald-oasis',
        name: 'الزمردي الملكي وظفار',
        badge: '🌿 أخضر ملكي',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #07150c 0%, #142e1b 45%, #244b2c 70%, #050e08 100%)',
        textColor: '#ffffff',
        accentColor: '#fde047',
        cardBg: 'rgba(7, 21, 12, 0.78)',
        cardBorder: 'rgba(253, 224, 71, 0.4)',
        badgeBg: 'rgba(253, 224, 71, 0.18)',
        badgeText: '#fef08a'
    },
    'sapphire-night': {
        id: 'sapphire-night',
        name: 'الياقوتي الكحلي ومسقط',
        badge: '🌊 نيلي فاخر',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #060e18 0%, #112035 45%, #1d3656 70%, #03070d 100%)',
        textColor: '#ffffff',
        accentColor: '#93c5fd',
        cardBg: 'rgba(6, 14, 24, 0.78)',
        cardBorder: 'rgba(147, 197, 253, 0.4)',
        badgeBg: 'rgba(147, 197, 253, 0.18)',
        badgeText: '#dbeafe'
    },
    'imperial-amethyst': {
        id: 'imperial-amethyst',
        name: 'البنفسجي الإمبراطوري',
        badge: '🔮 ملكي نادر',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #16051b 0%, #350f42 45%, #4e1761 70%, #0e0312 100%)',
        textColor: '#ffffff',
        accentColor: '#f5d0fe',
        cardBg: 'rgba(22, 5, 27, 0.78)',
        cardBorder: 'rgba(245, 208, 254, 0.4)',
        badgeBg: 'rgba(245, 208, 254, 0.18)',
        badgeText: '#fae8ff'
    },
    'warm-mocha': {
        id: 'warm-mocha',
        name: 'الموكا الدافئ والعاجي',
        badge: '☕ دافئ ومتناسق',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #1c1310 0%, #3d2a23 45%, #593e34 70%, #150d0a 100%)',
        textColor: '#fffbf7',
        accentColor: '#fbbf24',
        cardBg: 'rgba(30, 20, 16, 0.75)',
        cardBorder: 'rgba(251, 191, 36, 0.4)',
        badgeBg: 'rgba(251, 191, 36, 0.16)',
        badgeText: '#fef3c7'
    },
    'majlis-marble': {
        id: 'majlis-marble',
        name: 'المجلس الرخامي الإيطالي',
        badge: '🏛️ موك آب واقعي',
        bgType: 'image',
        bgValue: '../images/studio_marble_majlis.jpg',
        textColor: '#ffffff',
        accentColor: '#f7d382',
        cardBg: 'rgba(15, 12, 10, 0.8)',
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
        cardBg: 'rgba(25, 20, 16, 0.8)',
        cardBorder: 'rgba(250, 208, 116, 0.45)',
        badgeBg: 'rgba(250, 208, 116, 0.2)',
        badgeText: '#fce4a6'
    },
    'studio-minimal': {
        id: 'studio-minimal',
        name: 'استوديو نقي محايد',
        badge: '⚡ نقي وهادئ',
        bgType: 'gradient',
        bgValue: 'linear-gradient(145deg, #18181b 0%, #27272a 50%, #3f3f46 75%, #09090b 100%)',
        textColor: '#ffffff',
        accentColor: '#f4f4f5',
        cardBg: 'rgba(24, 24, 27, 0.82)',
        cardBorder: 'rgba(255, 255, 255, 0.3)',
        badgeBg: 'rgba(255, 255, 255, 0.15)',
        badgeText: '#ffffff'
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

    // إعدادات الشعار والعلامة المائية
    showLogo: true,
    logoVariant: 'transparent-burgundy', // 'transparent-burgundy', 'transparent-gold', 'transparent-emerald', 'transparent-navy', 'white', 'gold', 'black', 'custom', 'original'
    logoCustomColor: '#7c1d3c',
    logoSize: 'medium', // 'small', 'medium', 'large'
    logoOpacity: 100, // 40 to 100

    // إعدادات نمط ستوري إنستقرام كامل الشاشة
    storyPhrase: '- 🌟 عمل مُتقن -',
    storyHandle: '@TATRIZA_22',
    vignetteTheme: 'site-burgundy',
    customVigTopColor: '#7c1d3c',
    customVigBotColor: '#6e1634',
    showTopVignette: true,
    showBottomVignette: true,
    showStoryPhrase: true,
    showStoryHandle: true,

    // خصائص وتحكم الشادو الدقيق والمتقدم (Shadow Precision & Dynamics)
    vignetteOpacity: 95, // قوة اللون والشفافية: من 10% إلى 100%
    vignetteOffsetY: 0, // تحريك للأعلى والأسفل: من -40px إلى +40px
    vignetteSpread: 100, // البروز ومساحة الامتداد: من 40% إلى 160%
    vignetteSharpness: 40, // الحدة مقابل النعومة: من 0% إلى 100%

    // إعدادات تموضع وألوان ومسافات نمط ستوري وريلز إنستقرام
    storyLogoAlign: 'center', // 'right', 'center', 'left', 'custom'
    storyLogoOffsetPercent: 0, // -45 to +45
    storyLogoOffsetY: 25, // 10 to 140 px
    storyPhraseAlign: 'center', // 'right', 'center', 'left', 'custom'
    storyPhraseOffsetPercent: 0, // -40 to +40
    storyPhraseOffsetY: 68, // 35 to 220 px
    storyPhraseColor: 'default', // 'default' أو hex
    storyPhraseSize: 'md', // 'sm', 'md', 'lg', 'xl'
    storyPhraseFont: 'el-messiri', // نوع خط العبارة التسويقية
    storyPhraseCustomFont: '', // اسم خط مخصص
    storyHandleAlign: 'center', // 'right', 'center', 'left', 'custom'
    storyHandleOffsetPercent: 0, // -40 to +40
    storyHandleOffsetY: 25, // 10 to 120 px
    storyHandleColor: 'default', // 'default' أو hex
    storyHandleFont: 'mono', // نوع خط توقيع الحساب
    storyHandleCustomFont: '', // اسم خط مخصص للتوقيع
    storyHandleStyle: 'plain', // 'plain' أو 'pill'
    storyFitMode: 'cover', // 'cover' أو 'contain'
    storyBgColor: '#121214',

    // إعدادات قالب العرض النقي والعلامة المائية (المطابق لبوست الفراولة بدون شادو)
    minimalLogoAlign: 'center', // 'right', 'center', 'left', 'custom'
    minimalLogoOffsetPercent: 0, // -45 to +45
    minimalLogoOffsetY: 25, // 10 to 90 px
    minimalHandleAlign: 'center', // 'right', 'center', 'left', 'custom'
    minimalHandleOffsetPercent: 0, // -45 to +45
    minimalHandleOffsetY: 25, // 15 to 90 px
    minimalHandleColor: '#6b7280', // رمادي كالأصل أو أحد ألوان الموقع الأربعة
    minimalHandleStyle: 'plain', // 'plain' أو 'pill'
    minimalFitMode: 'contain', // 'contain' أو 'cover'
    minimalBgColor: '#ffffff', // أبيض كالأصل
    
    // لون وتأطير خلفية المنشور الموحد لجميع الأنماط
    postBgColor: '#ffffff',
    postBgName: 'أبيض ناصع',
    postBgCustomized: false,
    imageFitMode: 'contain', // 'contain' (احتواء مؤطر) أو 'cover' (ملء كامل)
    imageFramePadding: 0, // 0 to 25%
    imageCornerRadius: 0, // 0 to 32px
    imageElevationShadow: true,
    mobileViewMode: 'split', // 'split' أو 'expanded'
    mobileActiveTab: 'edit', // 'edit' أو 'preview' للجوال
    savedEditScrollY: 0, // حفظ موضع السكرول الدقيق أثناء التعديل

    // وضع تشغيل الاستوديو: 'custom' (تصميم حر من الجهاز) أو 'product' (تصميم لمنتج محدد من المتجر)
    studioMode: 'custom',
    selectedCarpetId: null,

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
    showPrice: true,
    showDimensions: true,
    showMaterial: true,
    showSticker: true,
    showWhatsApp: true,
    carpetScale: 88,
    carpetShadow: true,
    carpetTilt: false,

    // إعدادات وتخصيصات بوست الكارت الملكي المتقدمة (Advanced Royal Card Customization)
    cardPosition: 'bottom', // 'bottom', 'dock', 'top', 'center'
    cardAlign: 'right', // 'right', 'center', 'left'
    cardWidthPercent: 92, // 75 to 100%
    cardPadding: 'balanced', // 'compact', 'balanced', 'spacious'
    cardRadius: 'rounded', // 'sharp' (12px), 'rounded' (22px), 'pill' (34px)
    cardOffsetY: 16, // 0 to 60 px
    cardGlassOpacity: 75, // 20 to 95%
    cardGlassBlur: 16, // 0 to 30 px
    cardBorderStyle: 'gold-glow', // 'gold-glow', 'white-subtle', 'solid-accent', 'none'
    cardTitleFont: 'el-messiri', // خط عنوان القطعة
    cardTitleCustomFont: '',
    cardTitleSize: 'md', // 'sm', 'md', 'lg', 'xl'
    cardTitleColor: 'default', // 'default' أو hex
    cardPriceSize: 'md', // 'sm', 'md', 'lg'
    cardPriceColor: 'default', // 'default' أو hex
    cardSpecsStyle: 'pills', // 'pills' أو 'inline'
    cardSpotlight: true // هالة إضاءة ملكية خلف السجادة
};

// ==========================================
// شاشة استوديو التصاميم المستقلة (Dedicated Tatriza Studio Screen)
// تفصل كلياً بين:
// 1. وضع التصميم الحر من الجهاز (عند الدخول من الزر العلوي) - شاشة فارغة دون وصول للمنتجات
// 2. وضع تصميم منتج محدد (عند الدخول من بطاقة المنتج) - مخصص ومقفل لتلك القطعة فقط
// ==========================================

export function resetStudioToBlankCustomMode() {
    studioState.studioMode = 'custom';
    studioState.selectedCarpetId = null;
    studioState.customImageSrc = ''; // خالية من صور المتجر تماماً!
    studioState.videoSrc = '';
    studioState.title = '';
    studioState.subtitle = 'تصميم حصري ومميز من دار تطريز';
    studioState.dimensions = '';
    studioState.material = '';
    studioState.price = '';
    studioState.mediaType = 'image';
    studioState.mediaZoom = 100;
    studioState.mediaPanX = 0;
    studioState.mediaPanY = 0;
    studioState.postBgColor = '#ffffff';
    studioState.postBgName = 'أبيض ناصع';
    studioState.postBgCustomized = false;
    studioState.imageFitMode = 'contain';
    studioState.imageFramePadding = 0;
    studioState.imageCornerRadius = 0;
    studioState.imageElevationShadow = true;
}

export function clearStudioCustomMedia() {
    resetStudioToBlankCustomMode();
    renderStudioMediaSelectorArea();
    renderCarpetGalleryThumbs();
    syncStudioControlsFromState();
    updateStudioPreview();
    if (typeof showToast === 'function') {
        showToast('تم إفراغ الشاشة بنجاح، يمكنك بدء تصميم جديد!', 'info', 'استوديو فارغ');
    }
}
window.clearStudioCustomMedia = clearStudioCustomMedia;

// ==============================================
// الخيار الثاني: نظام التبويب السلس مع الزر العائم والذاكرة الذكية لموضع التمرير
// (Option 2: Mobile Tabbed System, Floating Switcher & Smart Scroll Memory)
// ==============================================

let isRestoringEditScroll = false;

// حفظ موضع التمرير بشكل دائم ومستمر أثناء تصفح خيارات التعديل على الجوال
window.addEventListener('scroll', () => {
    if (isRestoringEditScroll) return;
    if (window.innerWidth < 1024 && studioState && studioState.mobileActiveTab === 'edit') {
        const sy = window.pageYOffset || document.documentElement.scrollTop || 0;
        studioState.savedEditScrollY = sy;
    }
}, { passive: true });

export function switchStudioMobileTab(tab = 'edit', options = {}) {
    const previousTab = studioState.mobileActiveTab || 'edit';
    const source = options.source || (tab === 'edit' ? 'bottom' : 'default');

    // إذا كان الانتقال من التعديل إلى المعاينة، نحفظ فوراً إحداثيات السكرول قبل إخفاء لوحة التحكم
    if (previousTab === 'edit' && tab === 'preview') {
        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
        if (currentY > 0) {
            studioState.savedEditScrollY = currentY;
        }
    }

    studioState.mobileActiveTab = tab;

    const previewCol = document.getElementById('studio-preview-col');
    const controlsCol = document.getElementById('studio-controls-col');
    const tabBtnEdit = document.getElementById('studio-tab-btn-edit');
    const tabBtnPreview = document.getElementById('studio-tab-btn-preview');
    const jumpBar = document.getElementById('studio-mobile-jump-bar');
    const fabToPreview = document.getElementById('studio-fab-to-preview');
    const fabToEdit = document.getElementById('studio-fab-to-edit');

    if (!previewCol || !controlsCol) return;

    if (tab === 'preview') {
        // إظهار عمود المعاينة الكامل وإخفاء لوحة التحكم على الجوال فقط
        previewCol.classList.remove('hidden');
        previewCol.classList.add('block');
        controlsCol.classList.add('hidden');
        controlsCol.classList.remove('block');

        // تحديث مظهر زر تبويب المعاينة
        if (tabBtnPreview) {
            tabBtnPreview.className = "flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white shadow-xs";
        }
        if (tabBtnEdit) {
            tabBtnEdit.className = "flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900";
        }

        // إخفاء شريط القفز الخاص بالأدوات في وضع المعاينة
        if (jumpBar) jumpBar.classList.add('hidden');

        // تحديث الأزرار العائمة
        if (fabToPreview) fabToPreview.classList.add('hidden');
        if (fabToEdit) fabToEdit.classList.remove('hidden');

        // تحديث المعاينة الحية فوراً
        updateStudioPreview();

        // التمرير لأعلى الشاشة لعرض التصميم كاملاً
        window.scrollTo({ top: 0, behavior: 'instant' });

    } else {
        // وضع التعديل (Edit Mode): إتاحة 100% من مساحة الشاشة للتمرير السلس
        previewCol.classList.add('hidden');
        previewCol.classList.remove('block');
        controlsCol.classList.remove('hidden');
        controlsCol.classList.add('block');

        // تحديث مظهر زر تبويب التعديل
        if (tabBtnEdit) {
            tabBtnEdit.className = "flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white shadow-xs";
        }
        if (tabBtnPreview) {
            tabBtnPreview.className = "flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900";
        }

        // إظهار شريط القفز للأقسام
        if (jumpBar) jumpBar.classList.remove('hidden');

        // تحديث الأزرار العائمة
        if (fabToPreview) fabToPreview.classList.remove('hidden');
        if (fabToEdit) fabToEdit.classList.add('hidden');

        // إدارة موضع التمرير الذكي (Smart Scroll Restoration):
        // إذا ضغط المستخدم على التاب العلوي "خيارات التعديل": يبدأ من البداية وأعلى الصفحة
        // إذا ضغط على الزر السفلي (العائم أو داخل الكرت): يعود لنفس المكان الدقيق الذي كان يعدل فيه
        if (source === 'top') {
            studioState.savedEditScrollY = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (source === 'bottom') {
            const targetY = studioState.savedEditScrollY || 0;
            if (targetY > 0) {
                isRestoringEditScroll = true;
                requestAnimationFrame(() => {
                    window.scrollTo({ top: targetY, behavior: 'instant' });
                    setTimeout(() => {
                        window.scrollTo({ top: targetY, behavior: 'instant' });
                        setTimeout(() => {
                            isRestoringEditScroll = false;
                        }, 120);
                    }, 40);
                });
            }
        }
    }
}
window.switchStudioMobileTab = switchStudioMobileTab;

export function scrollStudioSection(category = 'theme') {
    // إذا كان المستخدم في وضع المعاينة، نحوله أولاً لوضع التعديل
    if (window.innerWidth < 1024 && studioState.mobileActiveTab === 'preview') {
        switchStudioMobileTab('edit', { source: 'jump' });
    }

    // البحث عن القسم المستهدف
    const targetEl = document.querySelector(`[data-studio-category="${category}"]`);
    if (targetEl) {
        const headerContainer = document.getElementById('studio-sticky-header-container');
        const offsetHeight = (headerContainer && headerContainer.offsetHeight > 0) ? headerContainer.offsetHeight : 150;
        const yOffset = -offsetHeight - 12; // مسافة كافية ودقيقة لتفادي التوب بار وشريط التبويب
        const y = Math.max(0, targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset);
        studioState.savedEditScrollY = y;
        window.scrollTo({ top: y, behavior: 'smooth' });

        // وميض تأكيدي بصري جميل
        targetEl.classList.add('ring-2', 'ring-amber-500', 'transition-all');
        setTimeout(() => {
            targetEl.classList.remove('ring-2', 'ring-amber-500');
        }, 1200);
    }

    // تحديث الشريحة النشطة في شريط القفز
    document.querySelectorAll('.studio-jump-pill').forEach(pill => {
        if (pill.getAttribute('data-jump') === category) {
            pill.classList.add('bg-amber-500', 'text-white', 'border-amber-600');
            pill.classList.remove('bg-white', 'text-stone-700', 'border-stone-200');
        } else {
            pill.classList.remove('bg-amber-500', 'text-white', 'border-amber-600');
            pill.classList.add('bg-white', 'text-stone-700', 'border-stone-200');
        }
    });
}
window.scrollStudioSection = scrollStudioSection;

// توفير دوال التوافق للخلف
export function openStudioMobileDrawer(category = 'bg') {
    switchStudioMobileTab('edit');
    if (category) scrollStudioSection(category);
}
window.openStudioMobileDrawer = openStudioMobileDrawer;
export function closeStudioMobileDrawer() {
    switchStudioMobileTab('preview');
}
window.closeStudioMobileDrawer = closeStudioMobileDrawer;
export function switchStudioMobileDrawerTab(category = 'bg') {
    scrollStudioSection(category);
}
window.switchStudioMobileDrawerTab = switchStudioMobileDrawerTab;
window.toggleStudioMobileView = function() {
    const nextTab = studioState.mobileActiveTab === 'preview' ? 'edit' : 'preview';
    switchStudioMobileTab(nextTab);
};

export async function pickStudioColorFromStage() {
    if (window.EyeDropper) {
        try {
            const eyeDropper = new EyeDropper();
            const result = await eyeDropper.open();
            if (result && result.sRGBHex) {
                setStudioPostBgColor(result.sRGBHex, 'لون مسحوب من السجادة');
                showToast(`تم التقاط اللون ${result.sRGBHex} بنجاح من صورتك!`, 'success', 'قطارة اللون');
            }
        } catch (e) {
            // Canceled
        }
    } else {
        const colorInput = document.getElementById('studio-input-post-bg-color');
        if (colorInput) {
            colorInput.click();
        }
    }
}
window.pickStudioColorFromStage = pickStudioColorFromStage;

export function setStudioPostBgColor(color, name = '') {
    if (!color) return;
    studioState.postBgColor = color;
    studioState.postBgName = name || color;
    studioState.storyBgColor = color;
    studioState.minimalBgColor = color;
    studioState.postBgCustomized = true;

    updatePostBgControlStates();
    updateStudioPreview();
}
window.setStudioPostBgColor = setStudioPostBgColor;


export function renderStudioHeaderModeBanner() {
    const titleEl = document.getElementById('studio-header-title');
    const badgeEl = document.getElementById('studio-header-badge');
    const subtitleEl = document.getElementById('studio-header-subtitle');

    if (studioState.studioMode === 'custom') {
        if (titleEl) titleEl.innerText = 'استوديو التصميم الحر';
        if (badgeEl) badgeEl.innerHTML = '<span class="hidden sm:inline">تصميم جديد </span><span>📱</span>';
        if (subtitleEl) subtitleEl.innerText = 'تصميم بوستات وستوريات حرة من صور وفيديوهات جهازك وهاتفك دون تقييد';
    } else {
        const carpets = window.allPortalCarpets || [];
        const currentCarpet = carpets.find(c => String(c.id) === String(studioState.selectedCarpetId));
        const carpetName = currentCarpet ? currentCarpet.title : (studioState.title || 'المنتج المحدد');
        if (titleEl) titleEl.innerText = `تصميم: ${carpetName}`;
        if (badgeEl) badgeEl.innerHTML = `<span class="hidden sm:inline">منتج محدد </span><span>🔒</span>`;
        if (subtitleEl) subtitleEl.innerText = `جلسة تصميم وبوست مخصصة حصرياً لقطعة السجادة المحددة`;
    }
}

export function renderStudioMediaSelectorArea(carpets = null) {
    const selectorWrapper = document.getElementById('studio-carpet-selector-wrapper') || document.getElementById('studio-carpet-select')?.parentElement;
    if (!selectorWrapper) return;

    const allCarpets = carpets || window.allPortalCarpets || [];

    if (studioState.studioMode === 'custom') {
        // وضع التصميم الحر الجديد من الجهاز (دون إمكانية الوصول لقائمة منتجات المتجر)
        selectorWrapper.innerHTML = `
            <div id="studio-mode-indicator-box" class="p-3 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/15 rounded-xl border border-amber-300/80 flex items-center justify-between gap-2 shadow-2xs">
                <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-rose-500/25 text-amber-900 border border-amber-400/50 flex items-center justify-center text-lg shrink-0 shadow-2xs">
                        ✨
                    </div>
                    <div class="min-w-0">
                        <span class="text-xs sm:text-[13px] font-black text-amber-950 block truncate">وضع التصميم الحر الجديد</span>
                        <span class="text-[10px] sm:text-[10.5px] text-stone-600 font-semibold block truncate">ارفع صورة أو فيديو من جهازك وصمم بحرية دون قيود المنتجات</span>
                    </div>
                </div>
                <span class="text-[9.5px] font-extrabold px-2.5 py-1 bg-amber-200 text-amber-950 rounded-lg border border-amber-300/60 shrink-0 shadow-2xs whitespace-nowrap">
                    رفع حر 📱
                </span>
            </div>
            ${(studioState.customImageSrc || studioState.videoSrc) ? `
                <div class="flex items-center justify-between mt-2 px-1 text-[11px]">
                    <span class="text-emerald-800 font-bold flex items-center gap-1">
                        <span>✅</span>
                        <span>تم تجهيز وسائطك بنجاح</span>
                    </span>
                    <button type="button" onclick="window.clearStudioCustomMedia()" class="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer transition" title="إفراغ الشاشة للبدء من جديد">
                        <span>🗑️</span>
                        <span>تفريغ وبدء تصميم جديد</span>
                    </button>
                </div>
            ` : ''}
        `;
    } else {
        // وضع تصميم لمنتج محدد من المتجر (مقفل على السجادة المحددة فقط)
        const currentCarpet = allCarpets.find(c => String(c.id) === String(studioState.selectedCarpetId));
        if (currentCarpet) {
            const thumbImg = (currentCarpet.images && currentCarpet.images[0]) || currentCarpet.image || '../images/logo.jpg';
            selectorWrapper.innerHTML = `
                <div id="studio-mode-indicator-box" class="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 flex items-center justify-between gap-2 shadow-2xs">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <img src="${thumbImg}" alt="${currentCarpet.title}" class="w-10 h-10 rounded-lg object-cover border border-amber-300/80 bg-white shrink-0 shadow-2xs">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="text-xs sm:text-[13px] font-black text-amber-950 truncate">${currentCarpet.title}</span>
                                <span class="text-[9.5px] font-black px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded shrink-0">${Number(currentCarpet.price || 0).toLocaleString()} ر.ع.</span>
                            </div>
                            <span class="text-[10px] text-stone-600 font-bold block truncate">القطعة: #${currentCarpet.id} ${currentCarpet.dimensions ? `| المقاس: ${currentCarpet.dimensions}` : ''}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <span class="text-[9.5px] font-extrabold px-2 py-1 bg-amber-200/80 text-amber-950 border border-amber-300 rounded-lg flex items-center gap-1 shadow-2xs whitespace-nowrap" title="هذه الجلسة مقفلة حصرياً على تصميم هذه القطعة">
                            <span>🔒</span>
                            <span>منتج محدد</span>
                        </span>
                    </div>
                </div>
            `;
        }
    }
}

export function getStudioEmptyDropzoneHtml() {
    return `
        <div id="studio-empty-dropzone" class="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer bg-gradient-to-b from-stone-900/90 via-stone-900/95 to-black/95 select-none" onclick="document.getElementById('studio-file-upload').click()">
            <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-amber-500/30 border border-amber-400/40 text-amber-300 flex items-center justify-center text-3xl mb-3 shadow-xl ring-4 ring-amber-400/10">
                📷
            </div>
            <h3 class="text-white font-black text-sm sm:text-base mb-1 tracking-wide">شاشة التصميم فارغة وجاهزة</h3>
            <p class="text-stone-300 text-xs max-w-[260px] leading-relaxed mb-4">ارفع صورة أو فيديو من جهازك أو هاتفك للبدء فوراً في التعديل والتصميم</p>
            <div class="flex items-center gap-2">
                <button type="button" onclick="event.stopPropagation(); document.getElementById('studio-file-upload').click()" class="btn-liquid-metal text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                    <span>📷</span>
                    <span>رفع صورة</span>
                </button>
                <button type="button" onclick="event.stopPropagation(); document.getElementById('studio-video-upload').click()" class="bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-300/40 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition">
                    <span>🎥</span>
                    <span>رفع فيديو</span>
                </button>
            </div>
            <span class="text-[10px] text-stone-400 mt-4 flex items-center gap-1">
                <span>✨</span>
                <span>أو اسحب وأفلت الملف هنا مباشرة</span>
            </span>
        </div>
    `;
}

export function setupStageDragAndDropFile() {
    const stage = document.getElementById('studio-live-stage');
    if (!stage || stage.dataset.dndSetup) return;
    stage.dataset.dndSetup = 'true';

    stage.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stage.classList.add('ring-4', 'ring-amber-400');
    });

    stage.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stage.classList.remove('ring-4', 'ring-amber-400');
    });

    stage.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        stage.classList.remove('ring-4', 'ring-amber-400');

        const files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                studioState.customImageSrc = evt.target.result;
                studioState.videoSrc = null;
                studioState.mediaType = 'image';
                updateMediaButtonStates();
                renderStudioMediaSelectorArea();
                renderCarpetGalleryThumbs();
                updateStudioPreview();
                showToast('تم تحميل الصورة المسحوبة بنجاح!', 'success', 'صورة مخصصة');
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const blobUrl = URL.createObjectURL(file);
            studioState.videoSrc = blobUrl;
            studioState.customImageSrc = '';
            studioState.mediaType = 'video';
            updateMediaButtonStates();
            updateExportButtonText();
            renderStudioMediaSelectorArea();
            renderCarpetGalleryThumbs();
            updateStudioPreview();
            showToast('تم تحميل الفيديو المسحوب بنجاح!', 'success', 'فيديو مخصص');
        } else {
            showToast('يرجى سحب ملف صورة أو فيديو صالح فقط.', 'error', 'تنبيه');
        }
    });
}

export function initStudioScreen(preselectedCarpetId = '', customCarpets = null) {
    // استخراج قائمة السجاد من سياق البوابة
    const carpets = customCarpets || window.allPortalCarpets || [];

    if (preselectedCarpetId) {
        // ==========================================
        // 1. وضع تصميم منتج محدد (Product Card Mode)
        // مقفل حصرياً على تعديل وتصميم بوست هذه القطعة فقط
        // ==========================================
        const targetCarpet = carpets.find(c => String(c.id) === String(preselectedCarpetId));
        if (targetCarpet) {
            studioState.studioMode = 'product';
            studioState.selectedCarpetId = targetCarpet.id;
            applyCarpetToStudioState(targetCarpet);
        } else {
            studioState.studioMode = 'custom';
            studioState.selectedCarpetId = null;
            resetStudioToBlankCustomMode();
        }
    } else {
        // ==========================================
        // 2. وضع التصميم الحر الجديد (Top Big Button Mode)
        // شاشة خالية من أي صور، لا إمكانية للوصول لمنتجات المتجر، رفع حر من الجهاز
        // ==========================================
        studioState.studioMode = 'custom';
        studioState.selectedCarpetId = null;
        resetStudioToBlankCustomMode();
    }

    renderStudioHeaderModeBanner();
    renderStudioMediaSelectorArea(carpets);
    syncStudioControlsFromState();
    updateStudioPreview();
    renderStudioDraftsList();
    setupStageDragAndDropFile();

    // ضبط التبويب النشط على الجوال (معاينة إذا كان لمنتج وتعديل إذا كان تصميم حر)
    if (window.innerWidth < 1024) {
        switchStudioMobileTab(preselectedCarpetId ? 'preview' : 'edit');
    }
}
window.initStudioScreen = initStudioScreen;

export function openTatrizaStudioModal(preselectedCarpetId = '', customCarpets = null) {
    if (typeof window.switchPortalScreen === 'function') {
        window.switchPortalScreen('studio', preselectedCarpetId, customCarpets);
        return;
    }
    initStudioScreen(preselectedCarpetId, customCarpets);
    const screenEl = document.getElementById('portal-view-studio') || document.getElementById('tatriza-studio-modal');
    if (screenEl) screenEl.classList.remove('hidden');
}

export function closeTatrizaStudioModal() {
    if (typeof window.switchPortalScreen === 'function') {
        window.switchPortalScreen('carpets');
        return;
    }
    const screenEl = document.getElementById('portal-view-studio') || document.getElementById('tatriza-studio-modal');
    if (screenEl) screenEl.classList.add('hidden');
    
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
        studioState.customImageSrc = '';
    }

    // فحص ما إذا كان للسجادة فيديو مرفق
    if (carpet.videoUrl || carpet.video) {
        studioState.videoSrc = carpet.videoUrl || carpet.video;
    } else {
        studioState.videoSrc = '';
    }

    studioState.postBgColor = '#ffffff';
    studioState.postBgName = 'أبيض ناصع';
    studioState.postBgCustomized = false;
    studioState.imageFitMode = 'contain';
    studioState.imageFramePadding = 0;
    studioState.imageCornerRadius = 0;
    studioState.imageElevationShadow = true;
}

// مزامنة حقول الإدخال مع الحالة الحالية
function syncStudioControlsFromState() {
    // 1. مزامنة تبديل النمط (Layout Mode Switcher)
    updateLayoutButtonStates();

    // 2. إظهار/إخفاء الحاويات المناسبة للنمط
    const controlsStory = document.getElementById('studio-controls-story');
    const controlsCard = document.getElementById('studio-controls-card');
    const controlsMinimal = document.getElementById('studio-controls-minimal');
    if (controlsStory) controlsStory.classList.toggle('hidden', studioState.layoutMode !== 'story_vignette');
    if (controlsCard) controlsCard.classList.toggle('hidden', studioState.layoutMode !== 'card');
    if (controlsMinimal) controlsMinimal.classList.toggle('hidden', studioState.layoutMode !== 'minimal_showcase');

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

    updateLogoControlStates();
    updateVignetteButtonStates();
    updateMediaButtonStates();
    updateMinimalControlStates();
    updateStoryControlStates();
    updateCardControlStates();

    // مزامنة أشرطة التحكم الدقيق بالشادو (شفافية، تحريك، بروز، حدة)
    const vigOpacityIn = document.getElementById('studio-slider-vig-opacity');
    const vigOpacityVal = document.getElementById('studio-vig-opacity-val');
    const vigOffsetYIn = document.getElementById('studio-slider-vig-offsety');
    const vigOffsetYVal = document.getElementById('studio-vig-offsety-val');
    const vigSpreadIn = document.getElementById('studio-slider-vig-spread');
    const vigSpreadVal = document.getElementById('studio-vig-spread-val');
    const vigSharpnessIn = document.getElementById('studio-slider-vig-sharpness');
    const vigSharpnessVal = document.getElementById('studio-vig-sharpness-val');

    if (vigOpacityIn) vigOpacityIn.value = studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95;
    if (vigOpacityVal) vigOpacityVal.innerText = `${studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95}%`;
    if (vigOffsetYIn) vigOffsetYIn.value = studioState.vignetteOffsetY !== undefined ? studioState.vignetteOffsetY : 0;
    if (vigOffsetYVal) vigOffsetYVal.innerText = `${studioState.vignetteOffsetY !== undefined ? studioState.vignetteOffsetY : 0}px`;
    if (vigSpreadIn) vigSpreadIn.value = studioState.vignetteSpread !== undefined ? studioState.vignetteSpread : 100;
    if (vigSpreadVal) vigSpreadVal.innerText = `${studioState.vignetteSpread !== undefined ? studioState.vignetteSpread : 100}%`;
    if (vigSharpnessIn) vigSharpnessIn.value = studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40;
    if (vigSharpnessVal) vigSharpnessVal.innerText = `${studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40}%`;

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
    updatePostBgControlStates();
    renderCarpetGalleryThumbs();

    // تحديث زر التصدير
    updateExportButtonText();
}

export function updatePostBgControlStates() {
    const postBgColorIn = document.getElementById('studio-input-post-bg-color');
    const postBgHexIn = document.getElementById('studio-input-post-bg-hex');
    const postBgNameEl = document.getElementById('studio-active-post-bg-name');
    const postBgPrevEl = document.getElementById('studio-active-post-bg-preview');
    if (postBgColorIn) postBgColorIn.value = studioState.postBgColor || '#ffffff';
    if (postBgHexIn) postBgHexIn.value = (studioState.postBgColor || '#FFFFFF').toUpperCase();
    if (postBgNameEl) postBgNameEl.innerText = studioState.postBgName || 'أبيض ناصع';
    if (postBgPrevEl) postBgPrevEl.style.backgroundColor = studioState.postBgColor || '#ffffff';

    const framePadIn = document.getElementById('studio-slider-frame-padding');
    const framePadVal = document.getElementById('studio-frame-padding-val');
    if (framePadIn) framePadIn.value = studioState.imageFramePadding || 0;
    if (framePadVal) framePadVal.innerText = `${studioState.imageFramePadding || 0}%`;

    const cornerRadIn = document.getElementById('studio-slider-corner-radius');
    const cornerRadVal = document.getElementById('studio-corner-radius-val');
    if (cornerRadIn) cornerRadIn.value = studioState.imageCornerRadius || 0;
    if (cornerRadVal) cornerRadVal.innerText = `${studioState.imageCornerRadius || 0}px`;

    const imgShadowToggle = document.getElementById('studio-toggle-image-shadow');
    if (imgShadowToggle) imgShadowToggle.checked = studioState.imageElevationShadow !== false;

    // أزرار ملاءمة الصورة (احتواء مؤطر / ملء الإطار)
    document.querySelectorAll('.studio-fit-mode-btn').forEach(btn => {
        const fit = btn.getAttribute('data-fit');
        if (fit === studioState.imageFitMode) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950', 'shadow-2xs');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950', 'shadow-2xs');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // أزرار باليتات ألوان الخلفية
    const isBgActive = studioState.layoutMode !== 'card' || studioState.postBgCustomized;
    document.querySelectorAll('.studio-post-bg-btn').forEach(btn => {
        const bg = btn.getAttribute('data-post-bg');
        if (isBgActive && bg && bg.toLowerCase() === (studioState.postBgColor || '').toLowerCase()) {
            btn.classList.add('border-amber-500', 'ring-2', 'ring-amber-400/40', 'scale-[1.02]');
            btn.classList.remove('border-stone-200');
        } else {
            btn.classList.remove('border-amber-500', 'ring-2', 'ring-amber-400/40', 'scale-[1.02]');
            btn.classList.add('border-stone-200');
        }
    });
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

function updateLogoControlStates() {
    ['studio-toggle-logo-main', 'studio-toggle-logo', 'studio-toggle-logo-card-head', 'studio-toggle-logo-story', 'studio-toggle-logo-minimal'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = studioState.showLogo;
    });

    const activeLogoOpt = STUDIO_LOGO_OPTIONS[studioState.logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];
    document.querySelectorAll('#studio-logo-variant-title, .studio-logo-variant-title').forEach(el => {
        el.innerText = activeLogoOpt.name;
    });

    document.querySelectorAll('.studio-logo-btn').forEach(btn => {
        const v = btn.getAttribute('data-logo-variant');
        if (v === studioState.logoVariant) {
            btn.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
            if (!btn.classList.contains('bg-stone-900') && !btn.classList.contains('bg-black') && !btn.classList.contains('bg-gradient-to-br')) {
                btn.classList.add('bg-amber-50', 'text-amber-950');
            }
        } else {
            btn.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
            if (!btn.classList.contains('bg-stone-900') && !btn.classList.contains('bg-black') && !btn.classList.contains('bg-gradient-to-br')) {
                btn.classList.remove('bg-amber-50', 'text-amber-950');
            }
        }
    });

    document.querySelectorAll('.studio-input-logo-custom-color, #studio-input-logo-custom-color').forEach(inp => {
        if (studioState.logoCustomColor) inp.value = studioState.logoCustomColor;
    });

    document.querySelectorAll('.studio-logo-size-btn').forEach(btn => {
        const s = btn.getAttribute('data-logo-size');
        if (s === (studioState.logoSize || 'medium')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const logoOpacityIn = document.getElementById('studio-input-logo-opacity');
    const logoOpacityVal = document.getElementById('studio-logo-opacity-val');
    if (logoOpacityIn) logoOpacityIn.value = studioState.logoOpacity || 100;
    if (logoOpacityVal) logoOpacityVal.innerText = `${studioState.logoOpacity || 100}%`;
}

function updateMinimalControlStates() {
    // 1. عنوان وأزرار محاذاة الشعار
    const logoPosTitle = document.getElementById('studio-minimal-logo-pos-title');
    const alignNames = { 'right': 'محاذاة لليمين', 'center': 'بالمنتصف', 'left': 'محاذاة لليسار', 'custom': 'إزاحة دقيقة' };
    if (logoPosTitle) logoPosTitle.innerText = alignNames[studioState.minimalLogoAlign] || 'بالمنتصف';

    document.querySelectorAll('.studio-minimal-logo-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === studioState.minimalLogoAlign) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const logoXIn = document.getElementById('studio-input-minimal-logo-x');
    const logoXVal = document.getElementById('studio-minimal-logo-x-val');
    if (logoXIn) logoXIn.value = studioState.minimalLogoOffsetPercent || 0;
    if (logoXVal) logoXVal.innerText = `${(studioState.minimalLogoOffsetPercent || 0) > 0 ? '+' : ''}${studioState.minimalLogoOffsetPercent || 0}%`;

    const logoYIn = document.getElementById('studio-input-minimal-logo-y');
    const logoYVal = document.getElementById('studio-minimal-logo-y-val');
    if (logoYIn) logoYIn.value = studioState.minimalLogoOffsetY || 25;
    if (logoYVal) logoYVal.innerText = `${studioState.minimalLogoOffsetY || 25}px`;

    // 2. حساب وتوقيع الإنستقرام
    const handleIn = document.getElementById('studio-input-minimal-handle');
    if (handleIn) handleIn.value = studioState.storyHandle || '@TATRIZA_22';

    const handlePosTitle = document.getElementById('studio-minimal-handle-pos-title');
    if (handlePosTitle) handlePosTitle.innerText = alignNames[studioState.minimalHandleAlign] || 'بالمنتصف';

    document.querySelectorAll('.studio-minimal-handle-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === studioState.minimalHandleAlign) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const handleXIn = document.getElementById('studio-input-minimal-handle-x');
    const handleXVal = document.getElementById('studio-minimal-handle-x-val');
    if (handleXIn) handleXIn.value = studioState.minimalHandleOffsetPercent || 0;
    if (handleXVal) handleXVal.innerText = `${(studioState.minimalHandleOffsetPercent || 0) > 0 ? '+' : ''}${studioState.minimalHandleOffsetPercent || 0}%`;

    const handleYIn = document.getElementById('studio-input-minimal-handle-y');
    const handleYVal = document.getElementById('studio-minimal-handle-y-val');
    if (handleYIn) handleYIn.value = studioState.minimalHandleOffsetY || 25;
    if (handleYVal) handleYVal.innerText = `${studioState.minimalHandleOffsetY || 25}px`;

    // لون التوقيع
    document.querySelectorAll('.studio-handle-color-btn').forEach(btn => {
        const c = btn.getAttribute('data-handle-color');
        if (c === studioState.minimalHandleColor) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white');
        }
    });

    // شكل التوقيع
    document.querySelectorAll('.studio-minimal-handle-style-btn').forEach(btn => {
        const s = btn.getAttribute('data-style');
        if (s === studioState.minimalHandleStyle) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // طريقة الاحتواء
    document.querySelectorAll('.studio-minimal-fit-btn').forEach(btn => {
        const f = btn.getAttribute('data-fit');
        if (f === studioState.minimalFitMode) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // لون الخلفية
    document.querySelectorAll('.studio-minimal-bg-btn').forEach(btn => {
        const b = btn.getAttribute('data-bg');
        if (b === studioState.minimalBgColor) {
            btn.classList.add('border-2', 'border-amber-500', 'ring-2', 'ring-amber-400/40', 'scale-110');
            btn.classList.remove('border-stone-300');
        } else {
            btn.classList.remove('border-2', 'border-amber-500', 'ring-2', 'ring-amber-400/40', 'scale-110');
            btn.classList.add('border-stone-300');
        }
    });
}

function updateStoryControlStates() {
    const alignNames = { 'right': 'محاذاة لليمين', 'center': 'بالمنتصف', 'left': 'محاذاة لليسار', 'custom': 'إزاحة دقيقة' };

    // 1. موضع وإزاحة شعار الستوري
    const storyLogoPosTitle = document.getElementById('studio-story-logo-pos-title');
    if (storyLogoPosTitle) storyLogoPosTitle.innerText = alignNames[studioState.storyLogoAlign] || 'بالمنتصف';

    document.querySelectorAll('.studio-story-logo-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === studioState.storyLogoAlign) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const storyLogoXIn = document.getElementById('studio-input-story-logo-x');
    const storyLogoXVal = document.getElementById('studio-story-logo-x-val');
    if (storyLogoXIn) storyLogoXIn.value = studioState.storyLogoOffsetPercent || 0;
    if (storyLogoXVal) storyLogoXVal.innerText = `${(studioState.storyLogoOffsetPercent || 0) > 0 ? '+' : ''}${studioState.storyLogoOffsetPercent || 0}%`;

    const storyLogoYIn = document.getElementById('studio-input-story-logo-y');
    const storyLogoYVal = document.getElementById('studio-story-logo-y-val');
    if (storyLogoYIn) storyLogoYIn.value = studioState.storyLogoOffsetY || 25;
    if (storyLogoYVal) storyLogoYVal.innerText = `${studioState.storyLogoOffsetY || 25}px`;

    // 2. موضع وإزاحة العبارة المميزة
    const storyPhrasePosTitle = document.getElementById('studio-story-phrase-pos-title');
    if (storyPhrasePosTitle) storyPhrasePosTitle.innerText = alignNames[studioState.storyPhraseAlign] || 'بالمنتصف';

    document.querySelectorAll('.studio-story-phrase-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === studioState.storyPhraseAlign) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const storyPhraseXIn = document.getElementById('studio-input-story-phrase-x');
    const storyPhraseXVal = document.getElementById('studio-story-phrase-x-val');
    if (storyPhraseXIn) storyPhraseXIn.value = studioState.storyPhraseOffsetPercent || 0;
    if (storyPhraseXVal) storyPhraseXVal.innerText = `${(studioState.storyPhraseOffsetPercent || 0) > 0 ? '+' : ''}${studioState.storyPhraseOffsetPercent || 0}%`;

    const storyPhraseYIn = document.getElementById('studio-input-story-phrase-y');
    const storyPhraseYVal = document.getElementById('studio-story-phrase-y-val');
    if (storyPhraseYIn) storyPhraseYIn.value = studioState.storyPhraseOffsetY || 68;
    if (storyPhraseYVal) storyPhraseYVal.innerText = `${studioState.storyPhraseOffsetY || 68}px`;

    // حجم خط العبارة
    document.querySelectorAll('.studio-story-phrase-size-btn').forEach(btn => {
        const size = btn.getAttribute('data-size');
        if (size === (studioState.storyPhraseSize || 'md')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // لون العبارة
    document.querySelectorAll('.studio-story-phrase-color-btn').forEach(btn => {
        const color = btn.getAttribute('data-color');
        if (color === (studioState.storyPhraseColor || 'default')) {
            btn.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.remove('border-stone-200');
        } else {
            btn.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.add('border-stone-200');
        }
    });

    // نوع خط العبارة التسويقية
    const phraseFontSelect = document.getElementById('studio-select-story-phrase-font');
    const phraseFontBadge = document.getElementById('studio-story-phrase-font-badge');
    const phraseCustomFontWrap = document.getElementById('studio-story-phrase-custom-font-wrap');
    const phraseCustomFontIn = document.getElementById('studio-input-story-phrase-custom-font');

    const curPhraseFont = studioState.storyPhraseFont || 'el-messiri';
    if (phraseFontSelect) phraseFontSelect.value = curPhraseFont;
    if (phraseFontBadge) {
        const fontObj = STUDIO_FONTS[curPhraseFont];
        phraseFontBadge.innerText = fontObj ? (fontObj.badge || fontObj.name) : 'المسيري 👑';
    }
    if (phraseCustomFontWrap) {
        if (curPhraseFont === 'custom') {
            phraseCustomFontWrap.classList.remove('hidden');
        } else {
            phraseCustomFontWrap.classList.add('hidden');
        }
    }
    if (phraseCustomFontIn) phraseCustomFontIn.value = studioState.storyPhraseCustomFont || '';

    document.querySelectorAll('.studio-phrase-font-chip').forEach(chip => {
        const f = chip.getAttribute('data-font');
        if (f === curPhraseFont) {
            chip.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            chip.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 3. موضع وإزاحة حساب الإنستقرام
    const storyHandlePosTitle = document.getElementById('studio-story-handle-pos-title');
    if (storyHandlePosTitle) storyHandlePosTitle.innerText = alignNames[studioState.storyHandleAlign] || 'بالمنتصف';

    document.querySelectorAll('.studio-story-handle-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === studioState.storyHandleAlign) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    const storyHandleXIn = document.getElementById('studio-input-story-handle-x');
    const storyHandleXVal = document.getElementById('studio-story-handle-x-val');
    if (storyHandleXIn) storyHandleXIn.value = studioState.storyHandleOffsetPercent || 0;
    if (storyHandleXVal) storyHandleXVal.innerText = `${(studioState.storyHandleOffsetPercent || 0) > 0 ? '+' : ''}${studioState.storyHandleOffsetPercent || 0}%`;

    const storyHandleYIn = document.getElementById('studio-input-story-handle-y');
    const storyHandleYVal = document.getElementById('studio-story-handle-y-val');
    if (storyHandleYIn) storyHandleYIn.value = studioState.storyHandleOffsetY || 25;
    if (storyHandleYVal) storyHandleYVal.innerText = `${studioState.storyHandleOffsetY || 25}px`;

    // ألوان حساب الإنستقرام
    document.querySelectorAll('.studio-story-handle-color-btn').forEach(btn => {
        const color = btn.getAttribute('data-color');
        if (color === (studioState.storyHandleColor || 'default')) {
            btn.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.remove('border-stone-200');
        } else {
            btn.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.add('border-stone-200');
        }
    });

    // نمط عرض الحساب
    document.querySelectorAll('.studio-story-handle-style-btn').forEach(btn => {
        const style = btn.getAttribute('data-style');
        if (style === (studioState.storyHandleStyle || 'plain')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-900');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // نوع خط توقيع الحساب
    const handleFontSelect = document.getElementById('studio-select-story-handle-font');
    const handleFontBadge = document.getElementById('studio-story-handle-font-badge');
    const handleCustomFontWrap = document.getElementById('studio-story-handle-custom-font-wrap');
    const handleCustomFontIn = document.getElementById('studio-input-story-handle-custom-font');

    const curHandleFont = studioState.storyHandleFont || 'mono';
    if (handleFontSelect) handleFontSelect.value = curHandleFont;
    if (handleFontBadge) {
        const fontObj = STUDIO_FONTS[curHandleFont];
        handleFontBadge.innerText = fontObj ? (fontObj.badge || fontObj.name) : 'Mono 💻';
    }
    if (handleCustomFontWrap) {
        if (curHandleFont === 'custom') {
            handleCustomFontWrap.classList.remove('hidden');
        } else {
            handleCustomFontWrap.classList.add('hidden');
        }
    }
    if (handleCustomFontIn) handleCustomFontIn.value = studioState.storyHandleCustomFont || '';

    document.querySelectorAll('.studio-handle-font-chip').forEach(chip => {
        const f = chip.getAttribute('data-font');
        if (f === curHandleFont) {
            chip.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            chip.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 4. خيارات احتواء الستوري
    document.querySelectorAll('.studio-story-fit-btn').forEach(btn => {
        const fit = btn.getAttribute('data-fit');
        if (fit === (studioState.storyFitMode || 'cover')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });
}

function updateCardControlStates() {
    const posTitles = {
        'bottom': 'أسفل عائم ⬇️',
        'dock': 'شريط ممتد 🔲',
        'top': 'أعلى الكارت ⬆️',
        'center': 'بالمنتصف ⏺️'
    };
    const cardPosBadge = document.getElementById('studio-card-pos-badge');
    if (cardPosBadge) cardPosBadge.innerText = posTitles[studioState.cardPosition] || 'أسفل عائم ⬇️';

    // 1. أزرار الموضع
    document.querySelectorAll('.studio-card-pos-btn').forEach(btn => {
        const pos = btn.getAttribute('data-pos');
        if (pos === (studioState.cardPosition || 'bottom')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 2. أزرار المحاذاة
    document.querySelectorAll('.studio-card-align-btn').forEach(btn => {
        const align = btn.getAttribute('data-align');
        if (align === (studioState.cardAlign || 'right')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 3. عرض الكارد والمسافة
    const cardWidthIn = document.getElementById('studio-input-card-width');
    const cardWidthVal = document.getElementById('studio-card-width-val');
    if (cardWidthIn) cardWidthIn.value = studioState.cardWidthPercent || 92;
    if (cardWidthVal) cardWidthVal.innerText = `${studioState.cardWidthPercent || 92}%`;

    const cardOffsetYIn = document.getElementById('studio-input-card-offset-y');
    const cardOffsetYVal = document.getElementById('studio-card-offset-y-val');
    if (cardOffsetYIn) cardOffsetYIn.value = studioState.cardOffsetY !== undefined ? studioState.cardOffsetY : 16;
    if (cardOffsetYVal) cardOffsetYVal.innerText = `${studioState.cardOffsetY !== undefined ? studioState.cardOffsetY : 16}px`;

    // 4. الحشوة والاستدارة
    document.querySelectorAll('.studio-card-pad-btn').forEach(btn => {
        const pad = btn.getAttribute('data-pad');
        if (pad === (studioState.cardPadding || 'balanced')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    document.querySelectorAll('.studio-card-radius-btn').forEach(btn => {
        const r = btn.getAttribute('data-radius');
        if (r === (studioState.cardRadius || 'rounded')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 5. الزجاج والتمويه
    const cardGlassOpIn = document.getElementById('studio-input-card-glass-opacity');
    const cardGlassOpVal = document.getElementById('studio-card-glass-opacity-val');
    if (cardGlassOpIn) cardGlassOpIn.value = studioState.cardGlassOpacity || 75;
    if (cardGlassOpVal) cardGlassOpVal.innerText = `${studioState.cardGlassOpacity || 75}%`;

    const cardGlassBlurIn = document.getElementById('studio-input-card-glass-blur');
    const cardGlassBlurVal = document.getElementById('studio-card-glass-blur-val');
    if (cardGlassBlurIn) cardGlassBlurIn.value = studioState.cardGlassBlur !== undefined ? studioState.cardGlassBlur : 16;
    if (cardGlassBlurVal) cardGlassBlurVal.innerText = `${studioState.cardGlassBlur !== undefined ? studioState.cardGlassBlur : 16}px`;

    // 6. نمط الإطار
    const borderTitles = {
        'gold-glow': 'توهج ذهبي ملكي ✨',
        'white-subtle': 'أبيض شفاف ناعم 🤍',
        'solid-accent': 'لون هوية الثيم 🎨',
        'none': 'بدون إطار 🚫'
    };
    const cardBorderBadge = document.getElementById('studio-card-border-badge');
    if (cardBorderBadge) cardBorderBadge.innerText = borderTitles[studioState.cardBorderStyle] || 'توهج ذهبي ملكي ✨';

    document.querySelectorAll('.studio-card-border-btn').forEach(btn => {
        const b = btn.getAttribute('data-border');
        if (b === (studioState.cardBorderStyle || 'gold-glow')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950', 'ring-2', 'ring-amber-400/30');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 7. نوع خط العنوان
    const cardTitleFontSelect = document.getElementById('studio-select-card-title-font');
    const cardTitleFontBadge = document.getElementById('studio-card-title-font-badge');
    const cardTitleCustomFontWrap = document.getElementById('studio-card-title-custom-font-wrap');
    const cardTitleCustomFontIn = document.getElementById('studio-input-card-title-custom-font');

    const curCardTitleFont = studioState.cardTitleFont || 'el-messiri';
    if (cardTitleFontSelect) cardTitleFontSelect.value = curCardTitleFont;
    if (cardTitleFontBadge) {
        const fObj = STUDIO_FONTS[curCardTitleFont];
        cardTitleFontBadge.innerText = fObj ? (fObj.badge || fObj.name) : 'المسيري 👑';
    }
    if (cardTitleCustomFontWrap) {
        if (curCardTitleFont === 'custom') {
            cardTitleCustomFontWrap.classList.remove('hidden');
        } else {
            cardTitleCustomFontWrap.classList.add('hidden');
        }
    }
    if (cardTitleCustomFontIn) cardTitleCustomFontIn.value = studioState.cardTitleCustomFont || '';

    document.querySelectorAll('.studio-card-title-font-chip').forEach(chip => {
        const f = chip.getAttribute('data-font');
        if (f === curCardTitleFont) {
            chip.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            chip.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            chip.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 8. حجم خط العنوان
    document.querySelectorAll('.studio-card-title-size-btn').forEach(btn => {
        const sz = btn.getAttribute('data-size');
        if (sz === (studioState.cardTitleSize || 'md')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 9. حجم شارة السعر
    document.querySelectorAll('.studio-card-price-size-btn').forEach(btn => {
        const sz = btn.getAttribute('data-size');
        if (sz === (studioState.cardPriceSize || 'md')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 10. نمط المواصفات
    document.querySelectorAll('.studio-card-specs-style-btn').forEach(btn => {
        const st = btn.getAttribute('data-style');
        if (st === (studioState.cardSpecsStyle || 'pills')) {
            btn.classList.add('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
        } else {
            btn.classList.remove('border-amber-500', 'bg-amber-50', 'text-amber-950');
            btn.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
        }
    });

    // 11. ألوان العنوان والسعر
    document.querySelectorAll('.studio-card-title-color-btn').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c === (studioState.cardTitleColor || 'default')) {
            btn.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.remove('border-stone-200');
        } else {
            btn.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.add('border-stone-200');
        }
    });

    document.querySelectorAll('.studio-card-price-color-btn').forEach(btn => {
        const c = btn.getAttribute('data-color');
        if (c === (studioState.cardPriceColor || 'default')) {
            btn.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.remove('border-stone-200');
        } else {
            btn.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'bg-amber-50');
            btn.classList.add('border-stone-200');
        }
    });

    // 12. الهالة الضوئية
    const toggleSpot = document.getElementById('studio-toggle-card-spotlight');
    if (toggleSpot) toggleSpot.checked = studioState.cardSpotlight !== false;
}

function updateVignetteButtonStates() {
    const activeVig = getActiveVignette();
    const vigNameEl = document.getElementById('studio-active-vignette-name');
    if (vigNameEl) vigNameEl.innerText = activeVig.name;

    document.querySelectorAll('.studio-vignette-card').forEach(card => {
        const vigId = card.getAttribute('data-vignette');
        if (vigId === studioState.vignetteTheme) {
            card.classList.add('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        } else {
            card.classList.remove('ring-2', 'ring-amber-500', 'border-amber-500', 'scale-[1.02]');
        }
    });

    const customVigBox = document.getElementById('studio-custom-vig-box');
    if (customVigBox) {
        if (studioState.vignetteTheme === 'custom') {
            customVigBox.classList.remove('hidden');
        } else {
            customVigBox.classList.add('hidden');
        }
    }
    const vigTopIn = document.getElementById('studio-input-vig-top');
    const vigBotIn = document.getElementById('studio-input-vig-bot');
    if (vigTopIn && studioState.customVigTopColor) vigTopIn.value = studioState.customVigTopColor;
    if (vigBotIn && studioState.customVigBotColor) vigBotIn.value = studioState.customVigBotColor;
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
    } else if (studioState.layoutMode === 'minimal_showcase') {
        btn.innerHTML = `<span class="text-base sm:text-lg">📥</span><span>تحميل صورة العرض النقي بدقة فائقة (HD PNG)</span>`;
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

    if (studioState.studioMode !== 'product') {
        container.classList.add('hidden');
        return;
    }

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
    const carpetImg = studioState.customImageSrc || '';

    // حساب نسبة التكبير والإزاحة
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    const transformStyle = `translate3d(${panX}%, ${panY}%, 0) scale(${zoom})`;

    // إعدادات حجم مسرح المعاينة المريح لشاشات الجوال وخلفية المنشور (في وضع المعاينة المستقل مساحة مريحة وكاملة)
    const mobileStageClass = 'max-h-[66vh] lg:max-h-none';
    const activeBgColor = studioState.postBgColor || '#ffffff';

    const isContain = studioState.imageFitMode === 'contain';
    const padVal = isContain ? (studioState.imageFramePadding || 0) : 0;
    const radVal = isContain ? (studioState.imageCornerRadius || 0) : 0;
    const shadowFilter = (isContain && studioState.imageElevationShadow !== false) ? 'drop-shadow(0 15px 35px rgba(0,0,0,0.42))' : '';
    const mediaStyle = `transform: ${transformStyle}; transform-origin: center center; padding: ${padVal}%; border-radius: ${radVal}px; filter: ${shadowFilter};`;

    // -------------------------------------------------------------
    // الحالة الأولى: نمط ستوري وريلز إنستقرام كامل الشاشة مع الشادو الناعم
    // -------------------------------------------------------------
    if (studioState.layoutMode === 'story_vignette') {
        const vig = getActiveVignette();
        
        // تعيين نسبة الأبعاد للحاوية
        stage.className = `relative w-full max-w-[340px] sm:max-w-[360px] ${mobileStageClass} mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between p-0 select-none ${ratio.aspectClass} cursor-grab active:cursor-grabbing`;
        stage.style.background = activeBgColor;
        stage.style.backgroundImage = 'none';

        // محتوى الميديا (فيديو أو صورة) داخل غلاف قابل للقص أو احتواء كامل
        const fitClass = isContain ? 'object-contain' : 'object-cover';
        let mediaHtml = '';
        if (studioState.mediaType === 'video' && studioState.videoSrc) {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none flex items-center justify-center">
                    <video id="studio-live-video" src="${studioState.videoSrc}" autoplay loop muted playsinline class="w-full h-full ${fitClass} select-none transition-transform duration-75" style="${mediaStyle}"></video>
                </div>
                <div class="absolute top-3 left-3 z-30 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                    <span>🎥</span>
                    <span>معاينة فيديو حية</span>
                </div>
            `;
        } else if (studioState.customImageSrc) {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none flex items-center justify-center">
                    <img id="studio-live-img" src="${studioState.customImageSrc}" alt="Story Carpet" class="w-full h-full ${fitClass} select-none transition-transform duration-75 pointer-events-none" style="${mediaStyle}">
                </div>
            `;
        } else {
            mediaHtml = getStudioEmptyDropzoneHtml();
        }

        // الشادو الدائري الناعم بالأعلى والأسفل مع تطبيق التحريك والبروز
        const vigSpread = (studioState.vignetteSpread || 100) / 100;
        const vigOffsetY = studioState.vignetteOffsetY || 0;
        const topHRem = (11 * vigSpread).toFixed(2);
        const botHRem = (14 * vigSpread).toFixed(2);
        const topTransY = Math.round(vigOffsetY * 0.4);
        const botTransY = Math.round(vigOffsetY * 0.4);

        const topVignetteHtml = studioState.showTopVignette ? `
            <div class="absolute top-0 inset-x-0 pointer-events-none z-10 transition-all duration-300" style="height: ${topHRem}rem; transform: translateY(${topTransY}px); background: ${vig.topVignetteCss};"></div>
        ` : '';

        // اللوجو الرسمي في الأعلى مع الموضع والمسافة واللون المحدد
        const logoHtml = getStoryLogoPreviewHtml();

        const botVignetteHtml = studioState.showBottomVignette ? `
            <div class="absolute bottom-0 inset-x-0 pointer-events-none z-10 transition-all duration-300" style="height: ${botHRem}rem; transform: translateY(${botTransY}px); background: ${vig.botVignetteCss};"></div>
        ` : '';

        // العبارة المميزة واسم الحساب بالأسفل مع الموضع والمسافات والألوان المستقلة
        const phraseHtml = getStoryPhrasePreviewHtml(vig);
        const handleHtml = getStoryHandlePreviewHtml(vig);

        stage.innerHTML = `
            ${mediaHtml}
            ${topVignetteHtml}
            ${logoHtml}
            ${botVignetteHtml}
            ${phraseHtml}
            ${handleHtml}
        `;

        // إتاحة السحب المباشر باللمس أو الماوس
        setupStageDragAndZoom();
        return;
    }

    // -------------------------------------------------------------
    // الحالة الثانية: نمط العرض النقي والعلامة المائية (Minimal Clean Showcase)
    // المطابق لبوست الفراولة tufted بدون شادو مع تحكم كامل بموضع الشعار والحساب
    // -------------------------------------------------------------
    if (studioState.layoutMode === 'minimal_showcase') {
        const fitClass = isContain ? 'object-contain' : 'object-cover';
        const minPadVal = isContain ? (studioState.imageFramePadding !== undefined ? studioState.imageFramePadding : 6) : 0;
        const minMediaStyle = `transform: ${transformStyle}; transform-origin: center center; padding: ${minPadVal}%; border-radius: ${radVal}px; filter: ${shadowFilter};`;

        stage.className = `relative w-full max-w-[340px] sm:max-w-[360px] ${mobileStageClass} mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between p-0 select-none ${ratio.aspectClass} cursor-grab active:cursor-grabbing`;
        stage.style.background = activeBgColor;
        stage.style.backgroundImage = 'none';

        // محتوى الميديا (صورة أو فيديو)
        let mediaHtml = '';
        if (studioState.mediaType === 'video' && studioState.videoSrc) {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none flex items-center justify-center">
                    <video id="studio-live-video" src="${studioState.videoSrc}" autoplay loop muted playsinline class="w-full h-full ${fitClass} select-none transition-transform duration-75" style="${minMediaStyle}"></video>
                </div>
                <div class="absolute top-3 left-3 z-30 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                    <span>🎥</span>
                    <span>معاينة فيديو</span>
                </div>
            `;
        } else if (studioState.customImageSrc) {
            mediaHtml = `
                <div class="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none flex items-center justify-center">
                    <img id="studio-live-img" src="${studioState.customImageSrc}" alt="Minimal Carpet" class="w-full h-full ${fitClass} select-none transition-transform duration-75 pointer-events-none" style="${minMediaStyle}">
                </div>
            `;
        } else {
            mediaHtml = getStudioEmptyDropzoneHtml();
        }

        // شعار الدار في الأعلى مع التحكم بالموضع الأفقي (يمين أو وسط أو يسار)
        let logoHtml = '';
        if (studioState.showLogo) {
            logoHtml = getMinimalLogoPreviewHtml();
        }

        // حساب وتوقيع الإنستقرام بالأسفل مع التحكم بالموضع الأفقي
        let handleHtml = '';
        if (studioState.showStoryHandle && studioState.storyHandle) {
            handleHtml = getMinimalHandlePreviewHtml();
        }

        stage.innerHTML = `
            ${mediaHtml}
            ${logoHtml}
            ${handleHtml}
        `;

        // إتاحة السحب المباشر باللمس أو الماوس
        setupStageDragAndZoom();
        return;
    }

    // -------------------------------------------------------------
    // الحالة الثالثة: نمط بوست الكارت الملكي المطور (مع بطاقة المواصفات والسعر والتحكم الكامل)
    // -------------------------------------------------------------
    const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];

    stage.className = `relative w-full max-w-[360px] ${mobileStageClass} mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between select-none ${ratio.aspectClass} cursor-grab active:cursor-grabbing`;

    // تعيين الخلفية
    if (studioState.postBgCustomized && studioState.postBgColor) {
        stage.style.background = studioState.postBgColor;
        stage.style.backgroundImage = 'none';
    } else if (theme.bgType === 'gradient') {
        stage.style.background = theme.bgValue;
        stage.style.backgroundImage = theme.bgValue;
    } else {
        stage.style.background = `url("${theme.bgValue}") center/cover no-repeat`;
    }

    // هالة إضاءة ملكية خلف السجادة (3D Ambient Spotlight)
    let spotlightHtml = '';
    if (studioState.cardSpotlight !== false) {
        spotlightHtml = `
            <div class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
                <div class="w-[85%] h-[85%] rounded-full opacity-65 filter blur-3xl pointer-events-none" style="background: radial-gradient(circle, ${theme.accentColor} 0%, rgba(243, 207, 122, 0.15) 40%, transparent 70%);"></div>
            </div>
        `;
    }

    // بناء نص الشارة الترويجية
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

    // شعار الدار بالأعلى شفاف مع اللون المختار
    let logoHtml = '';
    if (studioState.showLogo) {
        logoHtml = `
            <div class="flex items-center gap-2 pointer-events-none">
                ${getCardLogoElementHtml()}
                <div class="text-right leading-none">
                    <span class="font-display font-black text-xs sm:text-sm tracking-wider text-white block">TATRIZA</span>
                    <span class="text-[8.5px] sm:text-[9.5px] font-medium" style="color: ${theme.accentColor};">دار تطريز للسجاد الملكي</span>
                </div>
            </div>
        `;
    }

    const topHeaderHtml = `
        <div class="w-full shrink-0 flex items-center justify-between gap-2 p-3 sm:p-5 relative z-10 pointer-events-none">
            ${logoHtml}
            ${stickerHtml}
        </div>
    `;

    // السجادة في المنتصف مع دعم التحريك الحر والتكبير
    const scaleFactor = ((studioState.carpetScale || 88) / 100) * zoom;
    const cardVigOpacity = (studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95) / 100;
    const cardVigOffsetY = studioState.vignetteOffsetY || 0;
    const cardVigSpread = (studioState.vignetteSpread || 100) / 100;
    const cardVigSharpness = (studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40) / 100;
    const cardShadowY = Math.round(20 + cardVigOffsetY * 0.5);
    const cardShadowBlur = Math.round((25 * cardVigSpread) * (1.2 - cardVigSharpness * 0.5));
    const cardShadowAlpha = Math.min(0.95, 0.55 * (cardVigOpacity / 0.95)).toFixed(2);
    const shadowStyle = studioState.carpetShadow ? `filter: drop-shadow(0 ${cardShadowY}px ${cardShadowBlur}px rgba(0,0,0,${cardShadowAlpha}));` : '';

    let carpetStageHtml = '';
    if (studioState.customImageSrc) {
        carpetStageHtml = `
            <div class="flex-1 min-h-0 flex items-center justify-center p-2 relative z-10 my-auto overflow-hidden pointer-events-none">
                <div id="studio-carpet-center-wrap" class="transition-transform duration-75 max-w-full max-h-full flex items-center justify-center" style="transform: translate3d(${panX}%, ${panY}%, 0) scale(${scaleFactor}); transform-origin: center center;">
                    <img 
                        src="${studioState.customImageSrc}" 
                        alt="${studioState.title}" 
                        class="max-w-full max-h-full object-contain rounded-2xl border border-white/20 transition-all duration-300"
                        style="${shadowStyle} border-radius: ${studioState.imageCornerRadius || 16}px; padding: ${studioState.imageFramePadding || 0}%;">
                </div>
            </div>
        `;
    } else {
        carpetStageHtml = `
            <div class="flex-1 min-h-0 flex items-center justify-center p-2 relative z-10 my-auto overflow-hidden">
                <div onclick="document.getElementById('studio-file-upload').click()" class="cursor-pointer border-2 border-dashed border-amber-300/50 hover:border-amber-400 bg-black/30 hover:bg-black/40 backdrop-blur-md rounded-2xl p-5 text-center text-amber-200 transition flex flex-col items-center justify-center gap-2 max-w-[260px] select-none shadow-lg">
                    <span class="text-3xl animate-bounce">📷</span>
                    <span class="text-xs font-bold text-white">انقر لرفع صورة من جهازك</span>
                    <span class="text-[10px] text-amber-200/80">أو اسحب وأفلت الصورة هنا</span>
                </div>
            </div>
        `;
    }

    // إعدادات وتخصيصات الكارد الملكي
    const pos = studioState.cardPosition || 'bottom';
    const isDock = pos === 'dock';
    const isTop = pos === 'top';
    const isCenter = pos === 'center';

    const widthPercent = isDock ? 100 : (studioState.cardWidthPercent || 92);
    const offsetY = studioState.cardOffsetY !== undefined ? studioState.cardOffsetY : 16;
    const padType = studioState.cardPadding || 'balanced';
    const radiusType = studioState.cardRadius || 'rounded';
    const borderType = studioState.cardBorderStyle || 'gold-glow';
    const alignType = studioState.cardAlign || 'right';

    // كلاسات الحواف
    let radiusClass = 'rounded-2xl';
    if (radiusType === 'sharp') radiusClass = 'rounded-xl';
    else if (radiusType === 'pill') radiusClass = 'rounded-3xl';
    if (isDock) radiusClass += ' rounded-b-none';

    // كلاسات الحشوة
    let paddingClass = 'p-3.5 sm:p-4 space-y-2.5';
    if (padType === 'compact') paddingClass = 'p-2.5 sm:p-3 space-y-1.5';
    else if (padType === 'spacious') paddingClass = 'p-4 sm:p-5 space-y-3';

    // نمط الزجاج والشفافية
    const cardOpacity = (studioState.cardGlassOpacity !== undefined ? studioState.cardGlassOpacity : 75) / 100;
    const cardBlur = studioState.cardGlassBlur !== undefined ? studioState.cardGlassBlur : 16;
    const cardBgRgb = hexToRgbString(theme.cardBg || '#1c060e');

    let borderCss = 'border: 1.5px solid rgba(243, 207, 122, 0.45); box-shadow: 0 0 25px rgba(243, 207, 122, 0.18), 0 20px 50px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.25);';
    if (borderType === 'white-subtle') {
        borderCss = 'border: 1px solid rgba(255, 255, 255, 0.22); box-shadow: 0 20px 45px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.18);';
    } else if (borderType === 'solid-accent') {
        borderCss = `border: 1.5px solid ${theme.accentColor}; box-shadow: 0 15px 40px rgba(0,0,0,0.6);`;
    } else if (borderType === 'none') {
        borderCss = 'border: none; box-shadow: 0 20px 45px rgba(0,0,0,0.6);';
    }

    const cardBoxStyles = `
        background: rgba(${cardBgRgb}, ${cardOpacity});
        backdrop-filter: blur(${cardBlur}px);
        -webkit-backdrop-filter: blur(${cardBlur}px);
        ${borderCss}
        width: ${widthPercent}%;
        ${isDock ? 'margin-bottom: 0;' : (isTop ? `margin-top: ${offsetY}px; margin-bottom: 0;` : (isCenter ? 'margin: auto;' : `margin-bottom: ${offsetY}px;`))}
        margin-left: auto;
        margin-right: auto;
    `;

    // نصوص وخطوط الكارت
    const titleFontFamily = getStudioFontFamily(studioState.cardTitleFont, studioState.cardTitleCustomFont);
    const titleColor = studioState.cardTitleColor === 'default' ? theme.accentColor : studioState.cardTitleColor;
    const subtitleColor = studioState.cardSubtitleColor === 'default' ? '#e2e8f0' : studioState.cardSubtitleColor;
    const priceColor = studioState.cardPriceColor === 'default' ? '#fde047' : studioState.cardPriceColor;

    // أحجام الخطوط
    let titleSizeClass = 'text-sm sm:text-base';
    if (studioState.cardTitleSize === 'sm') titleSizeClass = 'text-xs sm:text-sm';
    else if (studioState.cardTitleSize === 'lg') titleSizeClass = 'text-base sm:text-lg';
    else if (studioState.cardTitleSize === 'xl') titleSizeClass = 'text-lg sm:text-xl';

    // حجم شارة السعر
    let priceBadgeClass = 'px-2.5 py-1 text-xs sm:text-sm';
    if (studioState.cardPriceSize === 'sm') priceBadgeClass = 'px-2 py-0.5 text-[11px] sm:text-xs';
    else if (studioState.cardPriceSize === 'lg') priceBadgeClass = 'px-3.5 py-1.5 text-sm sm:text-base font-black';

    // المحاذاة
    const textAlignClass = alignType === 'center' ? 'text-center' : (alignType === 'left' ? 'text-left' : 'text-right');
    const flexJustifyClass = alignType === 'center' ? 'justify-center' : (alignType === 'left' ? 'justify-start' : 'justify-end');

    const showPrice = studioState.showPrice && studioState.price;
    const showDim = studioState.showDimensions && studioState.dimensions;
    const showMat = studioState.showMaterial && studioState.material;
    const hasSpecs = showDim || showMat;
    const specsStyle = studioState.cardSpecsStyle || 'pills';

    let specsHtml = '';
    if (hasSpecs) {
        if (specsStyle === 'pills') {
            specsHtml = `
                <div class="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/12 ${flexJustifyClass}">
                    ${showDim ? `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold bg-white/10 border border-white/15 backdrop-blur-md shadow-2xs text-stone-200">
                            <span>📐</span>
                            <span>${studioState.dimensions}</span>
                        </span>
                    ` : ''}
                    ${showMat ? `
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold bg-white/10 border border-white/15 backdrop-blur-md shadow-2xs text-stone-200">
                            <span>🧵</span>
                            <span>${studioState.material}</span>
                        </span>
                    ` : ''}
                </div>
            `;
        } else {
            specsHtml = `
                <div class="pt-1.5 border-t border-white/12 text-[9.5px] sm:text-[10.5px] text-stone-300 font-medium ${textAlignClass}">
                    ${showDim ? `<span>📐 ${studioState.dimensions}</span>` : ''}
                    ${showDim && showMat ? `<span class="mx-1.5 opacity-40">•</span>` : ''}
                    ${showMat ? `<span>🧵 ${studioState.material}</span>` : ''}
                </div>
            `;
        }
    }

    let waHtml = '';
    if (studioState.showWhatsApp) {
        waHtml = `
            <div class="pt-1.5 flex items-center justify-between text-[9px] sm:text-[10px] border-t border-white/12 text-emerald-300">
                <span class="font-bold flex items-center gap-1.5">
                    <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-400/30">💬</span>
                    <span>للطلب والاستفسار الفوري عبر الواتساب</span>
                </span>
                <span class="font-display font-bold text-white tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10" dir="ltr">${studioState.whatsapp || '+968'}</span>
            </div>
        `;
    }

    const cardBoxHtml = `
        <div id="studio-royal-card-box" class="relative z-10 shrink-0 transition-all duration-200 pointer-events-none ${radiusClass} ${paddingClass}" style="${cardBoxStyles}">
            <div class="flex items-start justify-between gap-2.5">
                <div class="flex-1 min-w-0 ${textAlignClass}">
                    <h3 class="font-bold leading-tight line-clamp-1 ${titleSizeClass}" style="font-family: ${titleFontFamily}; color: ${titleColor};">
                        ${studioState.title || 'سجادة ملكية فاخرة'}
                    </h3>
                    ${studioState.subtitle ? `
                        <p class="text-[9.5px] sm:text-[10.5px] leading-tight mt-1 line-clamp-1" style="color: ${subtitleColor};">
                            ${studioState.subtitle}
                        </p>
                    ` : ''}
                </div>

                ${showPrice ? `
                    <div class="shrink-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-400/30 border border-amber-300/40 text-amber-300 shadow-md ${priceBadgeClass}">
                        <div class="flex items-baseline gap-1" dir="ltr">
                            <span class="font-display font-black leading-none" style="color: ${priceColor};">${studioState.price}</span>
                            <span class="text-[8.5px] font-bold" style="color: ${priceColor};">${studioState.currency}</span>
                        </div>
                    </div>
                ` : ''}
            </div>

            ${specsHtml}
            ${waHtml}
        </div>
    `;

    // ترتيب العناصر بناءً على موضع الكارد (أعلى، أسفل، أو وسط)
    if (isTop) {
        stage.innerHTML = `
            ${spotlightHtml}
            ${cardBoxHtml}
            ${carpetStageHtml}
            ${topHeaderHtml}
        `;
    } else {
        stage.innerHTML = `
            ${spotlightHtml}
            ${topHeaderHtml}
            ${carpetStageHtml}
            ${cardBoxHtml}
        `;
    }

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
        if (!studioState.customImageSrc && !studioState.videoSrc) return;
        if (e.target.closest('button, input, select, label, a, .cursor-pointer, #studio-empty-dropzone')) return;
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
        if (!studioState.customImageSrc && !studioState.videoSrc) return;
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
    if (!studioState.customImageSrc && !studioState.videoSrc) {
        showToast('يرجى رفع صورة أو مقطع فيديو من جهازك أولاً لتصميم وتصدير البوست', 'error', 'شاشة فارغة');
        return;
    }

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

        // التحقق من اكتمال تحميل الخطوط في الكانفاس قبل الرسم
        if (document.fonts && document.fonts.ready) {
            try {
                await document.fonts.ready;
            } catch (fontErr) {
                console.warn('Canvas fonts ready check skipped:', fontErr);
            }
        }

        // -------------------------------------------------------------
        // تصدير نمط ستوري إنستقرام كامل الشاشة مع الشادو الدائري والتوقيع
        // -------------------------------------------------------------
        if (studioState.layoutMode === 'story_vignette') {
            await exportStoryVignetteHD(canvas, ctx);
            return;
        }

        if (studioState.layoutMode === 'minimal_showcase') {
            await exportMinimalShowcaseHD(canvas, ctx);
            return;
        }

        // -------------------------------------------------------------
        // تصدير نمط كارت السجادة الملكي الفاخر بدقة عالية جداً
        // -------------------------------------------------------------
        await exportRoyalCardHD(canvas, ctx);
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

// دالة تصدير كارد البوست الملكي الفاخر عالي الدقة (Royal Card HD Export)
async function exportRoyalCardHD(canvas, ctx) {
    const theme = STUDIO_THEMES[studioState.theme] || STUDIO_THEMES['royal-burgundy'];

    // 1. رسم خلفية الكانفاس (إما لون المنشور المختار أو تدرج الثيم الملكي)
    if (studioState.postBgCustomized && studioState.postBgColor) {
        ctx.fillStyle = studioState.postBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (theme.bgType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        if (studioState.theme === 'royal-burgundy') {
            grad.addColorStop(0, '#2b0613');
            grad.addColorStop(0.45, '#681530');
            grad.addColorStop(0.7, '#8a1d41');
            grad.addColorStop(1, '#1f030c');
        } else if (studioState.theme === 'obsidian-gold') {
            grad.addColorStop(0, '#090a0d');
            grad.addColorStop(0.5, '#161b22');
            grad.addColorStop(0.75, '#21262d');
            grad.addColorStop(1, '#050608');
        } else if (studioState.theme === 'emerald-oasis') {
            grad.addColorStop(0, '#07150c');
            grad.addColorStop(0.45, '#142e1b');
            grad.addColorStop(0.7, '#244b2c');
            grad.addColorStop(1, '#050e08');
        } else if (studioState.theme === 'sapphire-night') {
            grad.addColorStop(0, '#060e18');
            grad.addColorStop(0.45, '#112035');
            grad.addColorStop(0.7, '#1d3656');
            grad.addColorStop(1, '#03070d');
        } else if (studioState.theme === 'imperial-amethyst') {
            grad.addColorStop(0, '#16051b');
            grad.addColorStop(0.45, '#350f42');
            grad.addColorStop(0.7, '#4e1761');
            grad.addColorStop(1, '#0e0312');
        } else if (studioState.theme === 'warm-mocha') {
            grad.addColorStop(0, '#1c1310');
            grad.addColorStop(0.45, '#3d2a23');
            grad.addColorStop(0.7, '#593e34');
            grad.addColorStop(1, '#150d0a');
        } else if (studioState.theme === 'studio-minimal') {
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(0.45, '#1e293b');
            grad.addColorStop(0.7, '#334155');
            grad.addColorStop(1, '#020617');
        } else {
            grad.addColorStop(0, '#2b0613');
            grad.addColorStop(0.5, '#681530');
            grad.addColorStop(1, '#1f030c');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        await drawImageOnCanvas(ctx, theme.bgValue, 0, 0, canvas.width, canvas.height, true);
    }

    // 2. الهالة الضوئية ثلاثية الأبعاد (3D Ambient Spotlight)
    if (studioState.cardSpotlight !== false) {
        ctx.save();
        const spotX = canvas.width / 2;
        const spotY = canvas.height * (studioState.cardPosition === 'top' ? 0.62 : 0.4);
        const spotRadius = canvas.width * 0.68;
        const spotGrad = ctx.createRadialGradient(spotX, spotY, 30, spotX, spotY, spotRadius);
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        spotGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.06)');
        spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // 3. رسم ترويسة الشعار وشارة التميز بالأعلى
    if (studioState.showLogo) {
        ctx.save();
        const logoOpacity = (studioState.logoOpacity || 100) / 100;
        ctx.globalAlpha = logoOpacity;
        const logoVariant = studioState.logoVariant || 'transparent-burgundy';
        const logoOpt = STUDIO_LOGO_OPTIONS[logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];

        if (logoVariant === 'custom') {
            const whiteLogo = await loadImageAsync('../images/logo_white.png');
            const tinted = getTintedLogoCanvas(whiteLogo, studioState.logoCustomColor || '#fef08a');
            ctx.drawImage(tinted, canvas.width - 150, 50, 95, 95);
        } else if (logoVariant === 'original') {
            await drawRoundedImage(ctx, '../images/logo.jpg', canvas.width - 150, 50, 95, 95, 22);
        } else {
            const img = await loadImageAsync(logoOpt.src);
            ctx.drawImage(img, canvas.width - 150, 50, 95, 95);
        }
        ctx.restore();

        ctx.font = 'bold 34px Tajawal, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText('TATRIZA', canvas.width - 170, 95);

        ctx.font = '21px Tajawal, sans-serif';
        ctx.fillStyle = theme.accentColor;
        ctx.fillText('دار تطريز للسجاد الملكي', canvas.width - 170, 132);
    }

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
        ctx.font = 'bold 22px Tajawal, sans-serif';
        const textMetrics = ctx.measureText(stickerText);
        const badgeW = textMetrics.width + 44;
        const badgeH = 46;
        const badgeX = 50;
        const badgeY = 65;

        drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
        ctx.fillStyle = theme.badgeBg;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = theme.badgeText;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stickerText, badgeX + (badgeW / 2), badgeY + (badgeH / 2));
        ctx.restore();
    }

    // 4. حساب أبعاد وإحداثيات الكارد الملكي بدقة فائقة
    const pos = studioState.cardPosition || 'bottom';
    const isDock = pos === 'dock';
    const isTop = pos === 'top';
    const isCenter = pos === 'center';

    const widthPercent = isDock ? 100 : (studioState.cardWidthPercent || 92);
    const cardW = canvas.width * (widthPercent / 100);
    const cardX = (canvas.width - cardW) / 2;

    const padType = studioState.cardPadding || 'balanced';
    let vPad = 46;
    let hPad = 50;
    let itemGap = 20;
    if (padType === 'compact') {
        vPad = 32;
        hPad = 38;
        itemGap = 15;
    } else if (padType === 'spacious') {
        vPad = 58;
        hPad = 62;
        itemGap = 26;
    }

    const radiusType = studioState.cardRadius || 'rounded';
    let cardRadius = 36;
    if (radiusType === 'sharp') cardRadius = 20;
    else if (radiusType === 'pill') cardRadius = 56;

    // أحجام النصوص وشارة السعر
    let titleFontSize = 44;
    if (studioState.cardTitleSize === 'sm') titleFontSize = 36;
    else if (studioState.cardTitleSize === 'lg') titleFontSize = 52;
    else if (studioState.cardTitleSize === 'xl') titleFontSize = 62;

    let priceBadgeW = 210;
    let priceBadgeH = 64;
    let priceFontSize = 34;
    if (studioState.cardPriceSize === 'sm') {
        priceBadgeW = 175;
        priceBadgeH = 54;
        priceFontSize = 28;
    } else if (studioState.cardPriceSize === 'lg') {
        priceBadgeW = 250;
        priceBadgeH = 76;
        priceFontSize = 42;
    }

    const showPrice = studioState.showPrice && studioState.price;
    const showDim = studioState.showDimensions && studioState.dimensions;
    const showMat = studioState.showMaterial && studioState.material;
    const hasSpecs = showDim || showMat;
    const showWa = studioState.showWhatsApp;
    const hasSubtitle = Boolean(studioState.subtitle && studioState.subtitle.trim());

    // ارتفاع صف العنوان والسعر
    const titleBlockH = hasSubtitle ? (titleFontSize + 34) : titleFontSize;
    const headerRowH = Math.max(titleBlockH, showPrice ? priceBadgeH : 0);

    // ارتفاع صف المواصفات
    const specsRowH = hasSpecs ? (itemGap + 40) : 0;

    // ارتفاع شريط الواتساب
    const waRowH = showWa ? (itemGap + 42) : 0;

    // الارتفاع الإجمالي للكارد
    const cardH = (vPad * 2) + headerRowH + specsRowH + waRowH;

    const scaledOffsetY = (studioState.cardOffsetY !== undefined ? studioState.cardOffsetY : 16) * (canvas.width / 420);
    let cardY = canvas.height - cardH - scaledOffsetY;
    if (isDock) {
        cardY = canvas.height - cardH;
    } else if (isTop) {
        cardY = (studioState.showLogo ? 175 : 60) + scaledOffsetY;
    } else if (isCenter) {
        cardY = (canvas.height - cardH) / 2;
    }

    // 5. رسم السجادة مع الحفاظ على المساحة الآمنة وعدم التداخل
    let carpetTopY = 175;
    let carpetMaxH = 480;
    if (isTop) {
        carpetTopY = cardY + cardH + 30;
        carpetMaxH = canvas.height - carpetTopY - 50;
    } else {
        carpetTopY = (studioState.showLogo ? 175 : 80);
        carpetMaxH = cardY - carpetTopY - 30;
    }
    if (carpetMaxH < 200) carpetMaxH = 200;

    const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';
    const zoom = (studioState.mediaZoom || 100) / 100;
    const scale = ((studioState.carpetScale || 88) / 100) * zoom;
    const maxImgW = (canvas.width - 120) * scale;
    const maxImgH = carpetMaxH * scale;

    const panOffsetX = canvas.width * ((studioState.mediaPanX || 0) / 100);
    const panOffsetY = canvas.height * ((studioState.mediaPanY || 0) / 100);

    ctx.save();
    if (studioState.carpetShadow) {
        const cardVigOpacity = (studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95) / 100;
        const cardVigOffsetY = studioState.vignetteOffsetY || 0;
        const cardVigSpread = (studioState.vignetteSpread || 100) / 100;
        const cardVigSharpness = (studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40) / 100;
        const cardShadowY = Math.round(25 + cardVigOffsetY * 0.7);
        const cardShadowBlur = Math.round((45 * cardVigSpread) * (1.2 - cardVigSharpness * 0.5));
        const cardShadowAlpha = Math.min(0.95, 0.65 * (cardVigOpacity / 0.95));

        ctx.shadowColor = `rgba(0, 0, 0, ${cardShadowAlpha})`;
        ctx.shadowBlur = cardShadowBlur;
        ctx.shadowOffsetY = cardShadowY;
    }
    const carpetDrawY = carpetTopY + ((carpetMaxH - maxImgH) / 2) + panOffsetY;
    await drawContainedImage(ctx, carpetSrc, ((canvas.width - maxImgW) / 2) + panOffsetX, carpetDrawY, maxImgW, maxImgH);
    ctx.restore();

    // 6. رسم جسم الكارد الملكي الزجاجي مع الإطار والتوهج
    ctx.save();
    const cardOpacity = (studioState.cardGlassOpacity !== undefined ? studioState.cardGlassOpacity : 75) / 100;
    const cardBgRgb = hexToRgbString(theme.cardBg || '#1c060e');

    // الظل الخارجي للكارد
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 18;

    if (isDock) {
        ctx.beginPath();
        ctx.moveTo(cardX, cardY + cardH);
        ctx.lineTo(cardX, cardY + cardRadius);
        ctx.arcTo(cardX, cardY, cardX + cardRadius, cardY, cardRadius);
        ctx.lineTo(cardX + cardW - cardRadius, cardY);
        ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardRadius, cardRadius);
        ctx.lineTo(cardX + cardW, cardY + cardH);
        ctx.closePath();
    } else {
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    }
    ctx.fillStyle = `rgba(${cardBgRgb}, ${cardOpacity})`;
    ctx.fill();

    // رسم الإطار والتوهج الملكي (Border Glow)
    const borderType = studioState.cardBorderStyle || 'gold-glow';
    if (borderType === 'gold-glow') {
        ctx.shadowColor = 'rgba(243, 207, 122, 0.45)';
        ctx.shadowBlur = 28;
        ctx.strokeStyle = 'rgba(243, 207, 122, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
    } else if (borderType === 'white-subtle') {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 18;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    } else if (borderType === 'solid-accent') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = theme.accentColor;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();

    // 7. رسم نصوص ومحتويات الكارد
    const alignType = studioState.cardAlign || 'right';
    const titleFont = getStudioCanvasFont(studioState.cardTitleFont, titleFontSize, true, studioState.cardTitleCustomFont);
    const titleColor = studioState.cardTitleColor === 'default' ? theme.accentColor : studioState.cardTitleColor;
    const priceColor = studioState.cardPriceColor === 'default' ? '#fde047' : studioState.cardPriceColor;

    let contentTopY = cardY + vPad;

    // حساب إحداثيات العنوان والشارة بناءً على المحاذاة
    let titleX = cardX + cardW - hPad;
    let titleAlign = 'right';
    let priceX = cardX + hPad;

    if (alignType === 'left') {
        titleX = cardX + hPad;
        titleAlign = 'left';
        priceX = cardX + cardW - hPad - priceBadgeW;
    } else if (alignType === 'center') {
        titleX = cardX + (cardW / 2);
        titleAlign = 'center';
        priceX = cardX + hPad;
    }

    // عنوان السجادة
    ctx.save();
    ctx.font = titleFont;
    ctx.fillStyle = titleColor;
    ctx.textAlign = titleAlign;
    ctx.textBaseline = 'top';
    ctx.fillText(studioState.title || 'سجادة ملكية فاخرة', titleX, contentTopY);

    // العبارة الفرعية
    if (hasSubtitle) {
        ctx.font = getStudioCanvasFont('tajawal', 23, false);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(studioState.subtitle, titleX, contentTopY + titleFontSize + 8);
    }
    ctx.restore();

    // شارة السعر
    if (showPrice) {
        const priceY = contentTopY + ((headerRowH - priceBadgeH) / 2);
        ctx.save();
        drawRoundedRect(ctx, priceX, priceY, priceBadgeW, priceBadgeH, 18);
        const pGrad = ctx.createLinearGradient(priceX, priceY, priceX + priceBadgeW, priceY + priceBadgeH);
        pGrad.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
        pGrad.addColorStop(1, 'rgba(251, 191, 36, 0.18)');
        ctx.fillStyle = pGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = `bold ${priceFontSize}px Tajawal, sans-serif`;
        ctx.fillStyle = priceColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${studioState.price} ${studioState.currency}`, priceX + (priceBadgeW / 2), priceY + (priceBadgeH / 2));
        ctx.restore();
    }

    contentTopY += headerRowH;

    // المواصفات (الأبعاد والخامة)
    if (hasSpecs) {
        contentTopY += itemGap;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(cardX + hPad, contentTopY);
        ctx.lineTo(cardX + cardW - hPad, contentTopY);
        ctx.stroke();

        contentTopY += 12;

        const specsStyle = studioState.cardSpecsStyle || 'pills';
        if (specsStyle === 'pills') {
            ctx.font = 'bold 22px Tajawal, sans-serif';
            let pillCursorX = (alignType === 'left') ? (cardX + hPad) : (cardX + cardW - hPad);

            const drawSpecPill = (txt) => {
                const tw = ctx.measureText(txt).width;
                const pW = tw + 36;
                const pH = 40;
                let pX = (alignType === 'left') ? pillCursorX : (pillCursorX - pW);

                ctx.save();
                drawRoundedRect(ctx, pX, contentTopY, pW, pH, 12);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = '#e2e8f0';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(txt, pX + (pW / 2), contentTopY + (pH / 2));
                ctx.restore();

                if (alignType === 'left') {
                    pillCursorX += pW + 12;
                } else {
                    pillCursorX -= (pW + 12);
                }
            };

            if (showDim) drawSpecPill(`📐 ${studioState.dimensions}`);
            if (showMat) drawSpecPill(`🧵 ${studioState.material}`);
        } else {
            let inlineText = '';
            if (showDim) inlineText += `📐 ${studioState.dimensions}`;
            if (showDim && showMat) inlineText += `   •   `;
            if (showMat) inlineText += `🧵 ${studioState.material}`;

            ctx.font = 'bold 22px Tajawal, sans-serif';
            ctx.fillStyle = '#cbd5e1';
            ctx.textAlign = titleAlign;
            ctx.textBaseline = 'top';
            ctx.fillText(inlineText, titleX, contentTopY + 6);
        }
        contentTopY += 28;
        ctx.restore();
    }

    // شريط الواتساب
    if (showWa) {
        contentTopY += itemGap;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.moveTo(cardX + hPad, contentTopY);
        ctx.lineTo(cardX + cardW - hPad, contentTopY);
        ctx.stroke();

        contentTopY += 12;

        ctx.font = 'bold 22px Tajawal, sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('💬 للطلب والاستفسار الفوري عبر الواتساب', cardX + cardW - hPad, contentTopY + 16);

        const phone = studioState.whatsapp || '+968';
        ctx.font = 'bold 22px "Courier New", monospace';
        const ptw = ctx.measureText(phone).width;
        const phW = ptw + 28;
        const phH = 34;
        const phX = cardX + hPad;
        const phY = contentTopY;

        drawRoundedRect(ctx, phX, phY, phW, phH, 10);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(phone, phX + (phW / 2), phY + (phH / 2));

        ctx.restore();
    }

    // 8. تنزيل الصورة الناتجة فائقة الدقة
    downloadCanvasAsPNG(canvas, `TATRIZA-Royal-Card-${studioState.ratio.replace(':', 'x')}.png`);
    showToast('تم تحميل تصميم البوست الملكي بدقة فائقة HD بنجاح!', 'success', 'استوديو تطريز');
}

// دالة تصدير نمط ستوري إنستقرام والريلز عالي الدقة (Story Vignette HD)
async function exportStoryVignetteHD(canvas, ctx) {
    const vig = getActiveVignette();
    const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';

    // 1. رسم الصورة بكامل الشاشة أو باحتواء نقي مع التحجيم والإزاحة الدقيقة (Zoom & Pan)
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    const activeBg = studioState.postBgColor || studioState.storyBgColor || '#121214';
    const isContain = studioState.imageFitMode === 'contain' || studioState.storyFitMode === 'contain';
    
    if (isContain) {
        ctx.fillStyle = activeBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const pad = studioState.imageFramePadding || 0;
        const rad = studioState.imageCornerRadius || 0;
        const shadow = studioState.imageElevationShadow !== false;
        await drawContainImageOnCanvas(ctx, carpetSrc, 0, 0, canvas.width, canvas.height, zoom, panX, panY, pad, rad, shadow);
    } else {
        await drawCoverImageOnCanvas(ctx, carpetSrc, 0, 0, canvas.width, canvas.height, zoom, panX, panY);
    }

    // استخراج معايير التحكم بالشادو بدقة متناهية (شفافية، تحريك للأعلى والأسفل، بروز، حدة)
    const vigOpacity = (studioState.vignetteOpacity !== undefined ? studioState.vignetteOpacity : 95) / 100;
    const vigOffsetY = studioState.vignetteOffsetY || 0; // -40 إلى +40
    const vigSpread = (studioState.vignetteSpread || 100) / 100; // 0.4 إلى 1.6
    const vigSharpness = (studioState.vignetteSharpness !== undefined ? studioState.vignetteSharpness : 40) / 100; // 0 إلى 1

    const topA1 = Math.min(1, 0.96 * vigOpacity);
    const topA2 = Math.min(1, (0.78 + 0.16 * vigSharpness) * vigOpacity);
    const topA3 = Math.max(0, (0.35 - 0.22 * vigSharpness) * vigOpacity);

    const botA1 = Math.min(1, 0.98 * vigOpacity);
    const botA2 = Math.min(1, (0.84 + 0.14 * vigSharpness) * vigOpacity);
    const botA3 = Math.max(0, (0.40 - 0.24 * vigSharpness) * vigOpacity);

    const stop1 = Math.max(0.12, 0.35 * (1 - vigSharpness * 0.45));
    const stop2 = Math.min(0.94, 0.70 + (1 - vigSharpness) * 0.15);

    const canvasOffsetY = canvas.height * (vigOffsetY / 580);

    // 2. رسم الشادو الدائري الناعم بالأعلى
    if (studioState.showTopVignette !== false) {
        const topH = Math.min(canvas.height, canvas.height * 0.42 * vigSpread);
        const originY = Math.max(-topH * 0.5, canvasOffsetY);
        const topGrad = ctx.createRadialGradient(canvas.width / 2, originY, 0, canvas.width / 2, originY, topH);
        topGrad.addColorStop(0, `rgba(${vig.topColorRgb}, ${topA1})`);
        topGrad.addColorStop(stop1, `rgba(${vig.topColorRgb}, ${topA2})`);
        topGrad.addColorStop(stop2, `rgba(${vig.topColorRgb}, ${topA3})`);
        topGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, topH + Math.max(0, canvasOffsetY));
    }

    // 3. رسم الشادو الدائري الناعم بالأسفل
    if (studioState.showBottomVignette !== false) {
        const botH = Math.min(canvas.height, canvas.height * 0.52 * vigSpread);
        const originY = canvas.height + canvasOffsetY;
        const botY = Math.max(0, canvas.height - botH + Math.min(0, canvasOffsetY));
        const botGrad = ctx.createRadialGradient(canvas.width / 2, originY, 0, canvas.width / 2, originY, botH);
        botGrad.addColorStop(0, `rgba(${vig.bottomColorRgb}, ${botA1})`);
        botGrad.addColorStop(stop1, `rgba(${vig.bottomColorRgb}, ${botA2})`);
        botGrad.addColorStop(stop2, `rgba(${vig.bottomColorRgb}, ${botA3})`);
        botGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, botY, canvas.width, canvas.height - botY);
    }

    // 4. رسم لوجو الدار شفافاً في الموضع المحدد بالأبعاد والشفافية واللون
    if (studioState.showLogo) {
        try {
            ctx.save();
            const logoOpacity = (studioState.logoOpacity || 100) / 100;
            ctx.globalAlpha = logoOpacity;
            const logoVariant = studioState.logoVariant || 'transparent-burgundy';
            const logoOpt = STUDIO_LOGO_OPTIONS[logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];

            // تحجيم الشعار بدقة متناسبة مع الأبعاد
            const sizeMap = {
                'small': 160,
                'medium': 225,
                'large': 295
            };
            const logoDim = sizeMap[studioState.logoSize || 'medium'] || 225;
            
            // حساب موضع X للشعار في HD مطابق تماماً للمعاينة الحية
            const offsetPercent = studioState.storyLogoOffsetPercent || 0;
            const logoCenterX = (canvas.width / 2) + (canvas.width * (offsetPercent / 100));
            const logoX = logoCenterX - (logoDim / 2);

            // حساب موضع Y للشعار في HD (منسوب لارتفاع المعاينة)
            const topYPercent = (studioState.storyLogoOffsetY || 25) / 580;
            const logoY = canvas.height * topYPercent;

            if (logoVariant === 'custom') {
                const whiteLogo = await loadImageAsync('../images/logo_white.png');
                const tinted = getTintedLogoCanvas(whiteLogo, studioState.logoCustomColor || '#fef08a');
                ctx.drawImage(tinted, logoX, logoY, logoDim, logoDim);
            } else if (logoVariant === 'original') {
                const origImg = await loadImageAsync('../images/logo.jpg');
                ctx.drawImage(origImg, logoX, logoY, logoDim, logoDim);
            } else {
                const logoImg = await loadImageAsync(logoOpt.src);
                ctx.drawImage(logoImg, logoX, logoY, logoDim, logoDim);
            }
            ctx.restore();
        } catch(e) {
            console.warn('Logo render fallback:', e);
        }
    }

    // 5. رسم العبارة المميزة في الموضع المحدد واللون والحجم
    if (studioState.showStoryPhrase && studioState.storyPhrase) {
        ctx.save();
        const phraseSizeMap = {
            'sm': 38,
            'md': 50,
            'lg': 62,
            'xl': 74
        };
        const pSize = phraseSizeMap[studioState.storyPhraseSize || 'md'] || 50;
        ctx.font = getStudioCanvasFont(studioState.storyPhraseFont || 'el-messiri', pSize, true, studioState.storyPhraseCustomFont);

        let phraseX = canvas.width / 2;
        if (studioState.storyPhraseAlign === 'right') {
            phraseX = canvas.width - 80;
            ctx.textAlign = 'right';
        } else if (studioState.storyPhraseAlign === 'left') {
            phraseX = 80;
            ctx.textAlign = 'left';
        } else {
            const offsetPercent = studioState.storyPhraseOffsetPercent || 0;
            phraseX = (canvas.width / 2) + (canvas.width * (offsetPercent / 100));
            ctx.textAlign = 'center';
        }
        ctx.textBaseline = 'middle';

        const pColor = (studioState.storyPhraseColor && studioState.storyPhraseColor !== 'default') 
            ? studioState.storyPhraseColor 
            : (vig.phraseColor || '#ffffff');
        ctx.fillStyle = pColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 4;

        const phraseBottomPercent = (studioState.storyPhraseOffsetY || 68) / 580;
        const phraseY = canvas.height - (canvas.height * phraseBottomPercent);

        ctx.fillText(studioState.storyPhrase, phraseX, phraseY);
        ctx.restore();
    }

    // 6. رسم توقيع حساب الإنستقرام
    if (studioState.showStoryHandle && studioState.storyHandle) {
        ctx.save();
        ctx.font = getStudioCanvasFont(studioState.storyHandleFont || 'mono', 28, true, studioState.storyHandleCustomFont);
        
        let handleX = canvas.width / 2;
        if (studioState.storyHandleAlign === 'right') {
            handleX = canvas.width - 80;
            ctx.textAlign = 'right';
        } else if (studioState.storyHandleAlign === 'left') {
            handleX = 80;
            ctx.textAlign = 'left';
        } else {
            const offsetPercent = studioState.storyHandleOffsetPercent || 0;
            handleX = (canvas.width / 2) + (canvas.width * (offsetPercent / 100));
            ctx.textAlign = 'center';
        }
        ctx.textBaseline = 'middle';

        const hColor = (studioState.storyHandleColor && studioState.storyHandleColor !== 'default') 
            ? studioState.storyHandleColor 
            : (vig.handleColor || '#fde68a');

        const handleBottomPercent = (studioState.storyHandleOffsetY || 25) / 580;
        const handleY = canvas.height - (canvas.height * handleBottomPercent);

        if (studioState.storyHandleStyle === 'pill') {
            ctx.save();
            const textMetrics = ctx.measureText(studioState.storyHandle);
            const pillW = textMetrics.width + (studioState.storyHandle.length * 8) + 60;
            const pillH = 54;
            const pillX = handleX - (pillW / 2);
            const pillY = handleY - (pillH / 2);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 27);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = hColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        const letterSpacing = (studioState.storyHandleFont === 'great-vibes') ? 2 : 8;
        drawSpacedText(ctx, studioState.storyHandle, handleX, handleY, letterSpacing);
        ctx.restore();
    }

    // تنزيل الصورة
    downloadCanvasAsPNG(canvas, `TATRIZA-Story-1080x1920.png`);
    showToast('تم تحميل ستوري إنستقرام فائق الدقة (1080×1920) بنجاح!', 'success', 'تطريز ستوديو');
}

// دالة تصدير قالب العرض النقي والعلامة المائية عالي الدقة (Minimal Clean Showcase HD)
async function exportMinimalShowcaseHD(canvas, ctx) {
    const carpetSrc = studioState.customImageSrc || '../images/client_room1.jpg';
    const bgColor = studioState.postBgColor || studioState.minimalBgColor || '#ffffff';

    // 1. رسم خلفية الكانفاس النقية
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. رسم الصورة أو مقطع الفيديو مع التحجيم والإزاحة
    const zoom = (studioState.mediaZoom || 100) / 100;
    const panX = studioState.mediaPanX || 0;
    const panY = studioState.mediaPanY || 0;
    const isContain = (studioState.imageFitMode || studioState.minimalFitMode || 'contain') === 'contain';

    if (isContain) {
        const pad = studioState.imageFramePadding !== undefined ? studioState.imageFramePadding : 6;
        const rad = studioState.imageCornerRadius || 0;
        const shadow = studioState.imageElevationShadow !== false;
        await drawContainImageOnCanvas(ctx, carpetSrc, 0, 0, canvas.width, canvas.height, zoom, panX, panY, pad, rad, shadow);
    } else {
        await drawCoverImageOnCanvas(ctx, carpetSrc, 0, 0, canvas.width, canvas.height, zoom, panX, panY);
    }

    // 3. رسم اللوجو العلوي المفرغ مع الموضع الأفقي المختار (يمين / وسط / يسار)
    if (studioState.showLogo) {
        try {
            ctx.save();
            const logoOpacity = (studioState.logoOpacity || 100) / 100;
            ctx.globalAlpha = logoOpacity;
            const logoVariant = studioState.logoVariant || 'transparent-burgundy';
            const logoOpt = STUDIO_LOGO_OPTIONS[logoVariant] || STUDIO_LOGO_OPTIONS['transparent-burgundy'];

            // حجم الشعار في النمط النقي (حجم صغير وأنيق)
            const sizesMap = {
                'small': 120,
                'medium': 175,
                'large': 235
            };
            const logoDim = sizesMap[studioState.logoSize || 'small'] || 120;
            
            // حساب موضع X للشعار مطابق تماماً للمعاينة الحية
            const offsetPercent = studioState.minimalLogoOffsetPercent || 0;
            const logoCenterX = (canvas.width / 2) + (canvas.width * (offsetPercent / 100));
            const logoX = logoCenterX - (logoDim / 2);
            const logoY = Number(studioState.minimalLogoOffsetY || 25) * (canvas.height / 500);

            if (logoVariant === 'custom') {
                const whiteLogo = await loadImageAsync('../images/logo_white.png');
                const tinted = getTintedLogoCanvas(whiteLogo, studioState.logoCustomColor || '#7c1d3c');
                ctx.drawImage(tinted, logoX, logoY, logoDim, logoDim);
            } else if (logoVariant === 'original') {
                const origImg = await loadImageAsync('../images/logo.jpg');
                ctx.drawImage(origImg, logoX, logoY, logoDim, logoDim);
            } else {
                const logoImg = await loadImageAsync(logoOpt.src);
                ctx.drawImage(logoImg, logoX, logoY, logoDim, logoDim);
            }
            ctx.restore();
        } catch (e) {
            console.warn('Minimal logo export error:', e);
        }
    }

    // 4. رسم حساب الإنستقرام السفلي مع الموضع الأفقي المختار (يمين / وسط / يسار)
    if (studioState.showStoryHandle && studioState.storyHandle) {
        ctx.save();
        const handleText = studioState.storyHandle.trim();
        const handleColor = studioState.minimalHandleColor || '#6b7280';

        // حساب موضع X لحساب الإنستقرام
        let handleCenterX = canvas.width / 2;
        if (studioState.minimalHandleAlign === 'right') {
            handleCenterX = canvas.width - 240;
        } else if (studioState.minimalHandleAlign === 'left') {
            handleCenterX = 240;
        } else {
            handleCenterX = (canvas.width / 2) + (canvas.width * ((studioState.minimalHandleOffsetPercent || 0) / 100));
        }

        const handleY = canvas.height - (Number(studioState.minimalHandleOffsetY || 25) * (canvas.height / 500));

        const handleFont = getStudioCanvasFont(studioState.storyHandleFont || 'mono', 28, true, studioState.storyHandleCustomFont);
        const letterSpacing = (studioState.storyHandleFont === 'great-vibes') ? 2 : 8;

        // نمط كبسولة زجاجية اختيارية أو نص مباشر نقي كالصورة
        if (studioState.minimalHandleStyle === 'pill') {
            ctx.font = handleFont;
            const metrics = ctx.measureText(handleText);
            const textWidth = metrics.width + (handleText.length * letterSpacing);
            const pillW = textWidth + 60;
            const pillH = 54;
            drawRoundedRect(ctx, handleCenterX - (pillW / 2), handleY - (pillH / 2), pillW, pillH, 27);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.font = handleFont;
        ctx.fillStyle = handleColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawSpacedText(ctx, handleText, handleCenterX, handleY, letterSpacing);
        ctx.restore();
    }

    // تنزيل الصورة
    const ratioStr = studioState.ratio.replace(':', 'x');
    downloadCanvasAsPNG(canvas, `TATRIZA-Minimal-${ratioStr}.png`);
    showToast(`تم تحميل تصميم العرض النقي (${canvas.width}×${canvas.height}) بنجاح!`, 'success', 'تطريز ستوديو');
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

// رسم الصورة في وضع الاحتواء (Contain) للحفاظ على الحواف النقية والخلفية وتأطير السجاد المربع
function drawContainImageOnCanvas(ctx, src, x, y, w, h, zoom = 1.0, panXPercent = 0, panYPercent = 0, paddingPercent = 0, cornerRadius = 0, hasShadow = false) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => {
            ctx.save();

            const padX = w * ((paddingPercent || 0) / 100);
            const padY = h * ((paddingPercent || 0) / 100);
            const availW = w - (padX * 2);
            const availH = h - (padY * 2);

            const imgRatio = img.width / img.height;
            const targetRatio = availW / availH;
            let baseW, baseH;

            if (imgRatio > targetRatio) {
                baseW = availW * 0.94;
                baseH = baseW / imgRatio;
            } else {
                baseH = availH * 0.88;
                baseW = baseH * imgRatio;
            }

            const finalW = baseW * zoom;
            const finalH = baseH * zoom;

            const centerX = x + padX + (availW - finalW) / 2;
            const centerY = y + padY + (availH - finalH) / 2;

            const offsetX = (w * (panXPercent / 100));
            const offsetY = (h * (panYPercent / 100));

            const drawX = centerX + offsetX;
            const drawY = centerY + offsetY;

            if (hasShadow) {
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                ctx.shadowBlur = Math.round(w * 0.035);
                ctx.shadowOffsetY = Math.round(h * 0.02);
                if (cornerRadius > 0) {
                    drawRoundedRect(ctx, drawX, drawY, finalW, finalH, cornerRadius);
                    ctx.fillStyle = 'rgba(0,0,0,0.01)';
                    ctx.fill();
                } else {
                    ctx.fillStyle = 'rgba(0,0,0,0.01)';
                    ctx.fillRect(drawX, drawY, finalW, finalH);
                }
                ctx.restore();
            }

            if (cornerRadius > 0) {
                ctx.save();
                drawRoundedRect(ctx, drawX, drawY, finalW, finalH, cornerRadius);
                ctx.clip();
                ctx.drawImage(img, drawX, drawY, finalW, finalH);
                ctx.restore();
            } else {
                ctx.drawImage(img, drawX, drawY, finalW, finalH);
            }

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

    if (studioState.layoutMode === 'minimal_showcase') {
        const handle = studioState.minimalHandle || '@TATRIZA_22';
        caption = `✨ دار تطريز | TATRIZA
${studioState.title ? `🏷️ ${studioState.title}\n` : ''}
حياكة متقنة وإبداع يدوي يجسد أدق التفاصيل بأعلى معايير الجودة 🧵✨
نسعد دائماً بمشاركتكم أعمالنا الفنية الحصرية والمصممة خصيصاً لكم.

📍 حسابنا الرسمي على الإنستغرام: ${handle}
💬 للطلب والاستفسار المباشر عبر الواتساب:
https://wa.me/${cleanWa}?text=${encodeURIComponent(`مرحباً دار تطريز، أود الاستفسار والطلب:`)}

#تطريز #سجاد_يدوي #حرف_يدوية #تصميم_خاص #سلطنة_عمان #مسقط #TATRIZA #Tufting #Handmade`;
    } else if (studioState.layoutMode === 'story_vignette') {
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
    // 1. أزرار اختيار نمط الإخراج (ستوري إنستقرام مقابل كارت ملكي مقابل قالب نقي)
    document.querySelectorAll('.studio-layout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.getAttribute('data-layout');
            if (layout) {
                studioState.layoutMode = layout;
                if (layout === 'story_vignette') {
                    studioState.ratio = '9:16';
                } else if (layout === 'minimal_showcase') {
                    studioState.ratio = '1:1';
                    studioState.logoSize = 'small';
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

    // 5. التحكم بشعار الدار والعلامة المائية (Logo Controls)
    ['studio-toggle-logo-main', 'studio-toggle-logo', 'studio-toggle-logo-card-head', 'studio-toggle-logo-story', 'studio-toggle-logo-minimal'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                studioState.showLogo = e.target.checked;
                ['studio-toggle-logo-main', 'studio-toggle-logo', 'studio-toggle-logo-card-head', 'studio-toggle-logo-story', 'studio-toggle-logo-minimal'].forEach(otherId => {
                    const other = document.getElementById(otherId);
                    if (other) other.checked = studioState.showLogo;
                });
                updateStudioPreview();
            });
        }
    });

    document.querySelectorAll('.studio-logo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const variant = btn.getAttribute('data-logo-variant');
            if (variant && STUDIO_LOGO_OPTIONS[variant]) {
                studioState.logoVariant = variant;
                if (variant === 'custom') {
                    const customColorInput = btn.querySelector('.studio-input-logo-custom-color') || document.getElementById('studio-input-logo-custom-color');
                    if (customColorInput) customColorInput.click();
                }
                updateLogoControlStates();
                updateStudioPreview();
            }
        });
    });

    const handleCustomLogoColor = (e) => {
        studioState.logoCustomColor = e.target.value;
        studioState.logoVariant = 'custom';
        document.querySelectorAll('.studio-input-logo-custom-color, #studio-input-logo-custom-color').forEach(inp => {
            inp.value = e.target.value;
        });
        updateLogoControlStates();
        updateStudioPreview();
    };

    document.querySelectorAll('.studio-input-logo-custom-color, #studio-input-logo-custom-color').forEach(inp => {
        inp.addEventListener('input', handleCustomLogoColor);
        inp.addEventListener('change', handleCustomLogoColor);
    });

    document.querySelectorAll('.studio-logo-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-logo-size');
            if (size) {
                studioState.logoSize = size;
                updateLogoControlStates();
                updateStudioPreview();
            }
        });
    });

    const logoOpacityIn = document.getElementById('studio-input-logo-opacity');
    const logoOpacityVal = document.getElementById('studio-logo-opacity-val');
    if (logoOpacityIn) {
        logoOpacityIn.addEventListener('input', (e) => {
            studioState.logoOpacity = Number(e.target.value);
            if (logoOpacityVal) logoOpacityVal.innerText = `${studioState.logoOpacity}%`;
            updateStudioPreview();
        });
    }

    // 6. بطاقات ثيمات الشادو الدائري (Vignette Presets)
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

    // منتقيات ألوان الشادو المخصص (Top & Bottom Custom Vignette)
    const vigTopIn = document.getElementById('studio-input-vig-top');
    if (vigTopIn) {
        const handleTopVig = (e) => {
            studioState.customVigTopColor = e.target.value;
            studioState.vignetteTheme = 'custom';
            updateVignetteButtonStates();
            updateStudioPreview();
        };
        vigTopIn.addEventListener('input', handleTopVig);
        vigTopIn.addEventListener('change', handleTopVig);
    }

    const vigBotIn = document.getElementById('studio-input-vig-bot');
    if (vigBotIn) {
        const handleBotVig = (e) => {
            studioState.customVigBotColor = e.target.value;
            studioState.vignetteTheme = 'custom';
            updateVignetteButtonStates();
            updateStudioPreview();
        };
        vigBotIn.addEventListener('input', handleBotVig);
        vigBotIn.addEventListener('change', handleBotVig);
    }

    // أحداث التحكم الدقيق بالشادو (شفافية، تحريك للأعلى/الأسفل، بروز، حدة)
    const vigOpacityIn = document.getElementById('studio-slider-vig-opacity');
    const vigOpacityVal = document.getElementById('studio-vig-opacity-val');
    if (vigOpacityIn) {
        vigOpacityIn.addEventListener('input', (e) => {
            studioState.vignetteOpacity = Number(e.target.value);
            if (vigOpacityVal) vigOpacityVal.innerText = `${studioState.vignetteOpacity}%`;
            updateStudioPreview();
        });
    }

    const vigOffsetYIn = document.getElementById('studio-slider-vig-offsety');
    const vigOffsetYVal = document.getElementById('studio-vig-offsety-val');
    if (vigOffsetYIn) {
        vigOffsetYIn.addEventListener('input', (e) => {
            studioState.vignetteOffsetY = Number(e.target.value);
            if (vigOffsetYVal) vigOffsetYVal.innerText = `${studioState.vignetteOffsetY > 0 ? '+' : ''}${studioState.vignetteOffsetY}px`;
            updateStudioPreview();
        });
    }

    const vigSpreadIn = document.getElementById('studio-slider-vig-spread');
    const vigSpreadVal = document.getElementById('studio-vig-spread-val');
    if (vigSpreadIn) {
        vigSpreadIn.addEventListener('input', (e) => {
            studioState.vignetteSpread = Number(e.target.value);
            if (vigSpreadVal) vigSpreadVal.innerText = `${studioState.vignetteSpread}%`;
            updateStudioPreview();
        });
    }

    const vigSharpnessIn = document.getElementById('studio-slider-vig-sharpness');
    const vigSharpnessVal = document.getElementById('studio-vig-sharpness-val');
    if (vigSharpnessIn) {
        vigSharpnessIn.addEventListener('input', (e) => {
            studioState.vignetteSharpness = Number(e.target.value);
            if (vigSharpnessVal) vigSharpnessVal.innerText = `${studioState.vignetteSharpness}%`;
            updateStudioPreview();
        });
    }

    // أزرار الاختصارات السريعة لإعدادات الشادو
    document.querySelectorAll('.studio-vig-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            const val = Number(btn.getAttribute('data-val'));
            if (target === 'opacity') {
                studioState.vignetteOpacity = val;
                if (vigOpacityIn) vigOpacityIn.value = val;
                if (vigOpacityVal) vigOpacityVal.innerText = `${val}%`;
            } else if (target === 'offsety') {
                studioState.vignetteOffsetY = val;
                if (vigOffsetYIn) vigOffsetYIn.value = val;
                if (vigOffsetYVal) vigOffsetYVal.innerText = `${val > 0 ? '+' : ''}${val}px`;
            } else if (target === 'spread') {
                studioState.vignetteSpread = val;
                if (vigSpreadIn) vigSpreadIn.value = val;
                if (vigSpreadVal) vigSpreadVal.innerText = `${val}%`;
            } else if (target === 'sharpness') {
                studioState.vignetteSharpness = val;
                if (vigSharpnessIn) vigSharpnessIn.value = val;
                if (vigSharpnessVal) vigSharpnessVal.innerText = `${val}%`;
            }
            updateStudioPreview();
        });
    });

    // زر إعادة ضبط الشادو للإعدادات الملكية الافتراضية
    const resetVigBtn = document.getElementById('studio-btn-reset-vignette');
    if (resetVigBtn) {
        resetVigBtn.addEventListener('click', () => {
            studioState.vignetteOpacity = 95;
            studioState.vignetteOffsetY = 0;
            studioState.vignetteSpread = 100;
            studioState.vignetteSharpness = 40;
            if (vigOpacityIn) vigOpacityIn.value = 95;
            if (vigOpacityVal) vigOpacityVal.innerText = '95%';
            if (vigOffsetYIn) vigOffsetYIn.value = 0;
            if (vigOffsetYVal) vigOffsetYVal.innerText = '0px';
            if (vigSpreadIn) vigSpreadIn.value = 100;
            if (vigSpreadVal) vigSpreadVal.innerText = '100%';
            if (vigSharpnessIn) vigSharpnessIn.value = 40;
            if (vigSharpnessVal) vigSharpnessVal.innerText = '40%';
            updateStudioPreview();
            showToast('تمت إعادة ضبط معايير الشادو للوضع الملكي القياسي.', 'info', 'إعادة ضبط الشادو');
        });
    }

    // 6.5 أحداث وتخصيصات موضع وألوان ومسافات الستوري والريلز (Story & Reels Controls)
    // أزرار محاذاة الشعار في الستوري
    document.querySelectorAll('.studio-story-logo-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.storyLogoAlign = align;
                if (align === 'center') studioState.storyLogoOffsetPercent = 0;
                else if (align === 'right') studioState.storyLogoOffsetPercent = 35;
                else if (align === 'left') studioState.storyLogoOffsetPercent = -35;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const storyLogoXIn = document.getElementById('studio-input-story-logo-x');
    if (storyLogoXIn) {
        storyLogoXIn.addEventListener('input', (e) => {
            studioState.storyLogoOffsetPercent = Number(e.target.value);
            studioState.storyLogoAlign = 'custom';
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    const storyLogoYIn = document.getElementById('studio-input-story-logo-y');
    if (storyLogoYIn) {
        storyLogoYIn.addEventListener('input', (e) => {
            studioState.storyLogoOffsetY = Number(e.target.value);
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    // أزرار محاذاة العبارة المميزة
    document.querySelectorAll('.studio-story-phrase-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.storyPhraseAlign = align;
                if (align === 'center') studioState.storyPhraseOffsetPercent = 0;
                else if (align === 'right') studioState.storyPhraseOffsetPercent = 30;
                else if (align === 'left') studioState.storyPhraseOffsetPercent = -30;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const storyPhraseXIn = document.getElementById('studio-input-story-phrase-x');
    if (storyPhraseXIn) {
        storyPhraseXIn.addEventListener('input', (e) => {
            studioState.storyPhraseOffsetPercent = Number(e.target.value);
            studioState.storyPhraseAlign = 'custom';
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    const storyPhraseYIn = document.getElementById('studio-input-story-phrase-y');
    if (storyPhraseYIn) {
        storyPhraseYIn.addEventListener('input', (e) => {
            studioState.storyPhraseOffsetY = Number(e.target.value);
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-story-phrase-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-size');
            if (size) {
                studioState.storyPhraseSize = size;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    document.querySelectorAll('.studio-story-phrase-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            if (color) {
                studioState.storyPhraseColor = color;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const storyPhraseCustomColorIn = document.getElementById('studio-input-story-phrase-custom-color');
    if (storyPhraseCustomColorIn) {
        const handlePhraseCustomColor = (e) => {
            studioState.storyPhraseColor = e.target.value;
            updateStoryControlStates();
            updateStudioPreview();
        };
        storyPhraseCustomColorIn.addEventListener('input', handlePhraseCustomColor);
        storyPhraseCustomColorIn.addEventListener('change', handlePhraseCustomColor);
    }

    // أحداث اختيار نوع خط العبارة التسويقية
    const phraseFontSelect = document.getElementById('studio-select-story-phrase-font');
    if (phraseFontSelect) {
        phraseFontSelect.addEventListener('change', (e) => {
            studioState.storyPhraseFont = e.target.value;
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-phrase-font-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const font = chip.getAttribute('data-font');
            if (font) {
                studioState.storyPhraseFont = font;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const phraseCustomFontIn = document.getElementById('studio-input-story-phrase-custom-font');
    if (phraseCustomFontIn) {
        phraseCustomFontIn.addEventListener('input', (e) => {
            studioState.storyPhraseCustomFont = e.target.value;
            studioState.storyPhraseFont = 'custom';
            updateStudioPreview();
        });
    }

    // أزرار محاذاة توقيع الحساب
    document.querySelectorAll('.studio-story-handle-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.storyHandleAlign = align;
                if (align === 'center') studioState.storyHandleOffsetPercent = 0;
                else if (align === 'right') studioState.storyHandleOffsetPercent = 30;
                else if (align === 'left') studioState.storyHandleOffsetPercent = -30;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const storyHandleXIn = document.getElementById('studio-input-story-handle-x');
    if (storyHandleXIn) {
        storyHandleXIn.addEventListener('input', (e) => {
            studioState.storyHandleOffsetPercent = Number(e.target.value);
            studioState.storyHandleAlign = 'custom';
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    const storyHandleYIn = document.getElementById('studio-input-story-handle-y');
    if (storyHandleYIn) {
        storyHandleYIn.addEventListener('input', (e) => {
            studioState.storyHandleOffsetY = Number(e.target.value);
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-story-handle-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            if (color) {
                studioState.storyHandleColor = color;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const storyHandleCustomColorIn = document.getElementById('studio-input-story-handle-custom-color');
    if (storyHandleCustomColorIn) {
        const handleStoryCustomColor = (e) => {
            studioState.storyHandleColor = e.target.value;
            updateStoryControlStates();
            updateStudioPreview();
        };
        storyHandleCustomColorIn.addEventListener('input', handleStoryCustomColor);
        storyHandleCustomColorIn.addEventListener('change', handleStoryCustomColor);
    }

    document.querySelectorAll('.studio-story-handle-style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');
            if (style) {
                studioState.storyHandleStyle = style;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    // أحداث اختيار نوع خط توقيع الحساب
    const handleFontSelect = document.getElementById('studio-select-story-handle-font');
    if (handleFontSelect) {
        handleFontSelect.addEventListener('change', (e) => {
            studioState.storyHandleFont = e.target.value;
            updateStoryControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-handle-font-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const font = chip.getAttribute('data-font');
            if (font) {
                studioState.storyHandleFont = font;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    const handleCustomFontIn = document.getElementById('studio-input-story-handle-custom-font');
    if (handleCustomFontIn) {
        handleCustomFontIn.addEventListener('input', (e) => {
            studioState.storyHandleCustomFont = e.target.value;
            studioState.storyHandleFont = 'custom';
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-story-fit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fit = btn.getAttribute('data-fit');
            if (fit) {
                studioState.storyFitMode = fit;
                updateStoryControlStates();
                updateStudioPreview();
            }
        });
    });

    // 7. أحداث قالب العرض النقي والعلامة المائية (Minimal Showcase Events)
    document.querySelectorAll('.studio-minimal-logo-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.minimalLogoAlign = align;
                if (align === 'center') studioState.minimalLogoOffsetPercent = 0;
                else if (align === 'right') studioState.minimalLogoOffsetPercent = 35;
                else if (align === 'left') studioState.minimalLogoOffsetPercent = -35;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    const minLogoXIn = document.getElementById('studio-input-minimal-logo-x');
    if (minLogoXIn) {
        minLogoXIn.addEventListener('input', (e) => {
            studioState.minimalLogoOffsetPercent = Number(e.target.value);
            studioState.minimalLogoAlign = 'custom';
            updateMinimalControlStates();
            updateStudioPreview();
        });
    }

    const minLogoYIn = document.getElementById('studio-input-minimal-logo-y');
    if (minLogoYIn) {
        minLogoYIn.addEventListener('input', (e) => {
            studioState.minimalLogoOffsetY = Number(e.target.value);
            updateMinimalControlStates();
            updateStudioPreview();
        });
    }

    const minHandleIn = document.getElementById('studio-input-minimal-handle');
    if (minHandleIn) {
        minHandleIn.addEventListener('input', (e) => {
            studioState.storyHandle = e.target.value;
            const storyHandleInput = document.getElementById('studio-input-story-handle');
            if (storyHandleInput) storyHandleInput.value = e.target.value;
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-minimal-handle-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.minimalHandleAlign = align;
                if (align === 'center') studioState.minimalHandleOffsetPercent = 0;
                else if (align === 'right') studioState.minimalHandleOffsetPercent = 35;
                else if (align === 'left') studioState.minimalHandleOffsetPercent = -35;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    const minHandleXIn = document.getElementById('studio-input-minimal-handle-x');
    if (minHandleXIn) {
        minHandleXIn.addEventListener('input', (e) => {
            studioState.minimalHandleOffsetPercent = Number(e.target.value);
            studioState.minimalHandleAlign = 'custom';
            updateMinimalControlStates();
            updateStudioPreview();
        });
    }

    const minHandleYIn = document.getElementById('studio-input-minimal-handle-y');
    if (minHandleYIn) {
        minHandleYIn.addEventListener('input', (e) => {
            studioState.minimalHandleOffsetY = Number(e.target.value);
            updateMinimalControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-handle-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-handle-color');
            if (color) {
                studioState.minimalHandleColor = color;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    document.querySelectorAll('.studio-minimal-handle-style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');
            if (style) {
                studioState.minimalHandleStyle = style;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    document.querySelectorAll('.studio-minimal-fit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fit = btn.getAttribute('data-fit');
            if (fit) {
                studioState.minimalFitMode = fit;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    document.querySelectorAll('.studio-minimal-bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bg = btn.getAttribute('data-bg');
            if (bg) {
                studioState.minimalBgColor = bg;
                updateMinimalControlStates();
                updateStudioPreview();
            }
        });
    });

    const minCustomBgIn = document.getElementById('studio-input-minimal-custom-bg');
    if (minCustomBgIn) {
        minCustomBgIn.addEventListener('input', (e) => {
            studioState.minimalBgColor = e.target.value;
            updateMinimalControlStates();
            updateStudioPreview();
        });
    }

    // أحداث لون وتأطير خلفية المنشور (Post Background Color & Framing Events)
    document.querySelectorAll('.studio-post-bg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const bg = btn.getAttribute('data-post-bg');
            const name = btn.getAttribute('data-name');
            if (bg) {
                setStudioPostBgColor(bg, name);
            }
        });
    });

    const postBgColorIn = document.getElementById('studio-input-post-bg-color');
    if (postBgColorIn) {
        postBgColorIn.addEventListener('input', (e) => {
            setStudioPostBgColor(e.target.value, 'لون مخصص');
        });
    }

    const postBgHexIn = document.getElementById('studio-input-post-bg-hex');
    if (postBgHexIn) {
        const handleHex = (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                setStudioPostBgColor(val, val.toUpperCase());
            }
        };
        postBgHexIn.addEventListener('change', handleHex);
        postBgHexIn.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleHex(e);
        });
    }

    document.querySelectorAll('.studio-fit-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fit = btn.getAttribute('data-fit');
            if (fit) {
                studioState.imageFitMode = fit;
                updatePostBgControlStates();
                updateStudioPreview();
            }
        });
    });

    const framePadIn = document.getElementById('studio-slider-frame-padding');
    const framePadVal = document.getElementById('studio-frame-padding-val');
    if (framePadIn) {
        framePadIn.addEventListener('input', (e) => {
            studioState.imageFramePadding = Number(e.target.value);
            if (framePadVal) framePadVal.innerText = `${studioState.imageFramePadding}%`;
            updateStudioPreview();
        });
    }

    const cornerRadIn = document.getElementById('studio-slider-corner-radius');
    const cornerRadVal = document.getElementById('studio-corner-radius-val');
    if (cornerRadIn) {
        cornerRadIn.addEventListener('input', (e) => {
            studioState.imageCornerRadius = Number(e.target.value);
            if (cornerRadVal) cornerRadVal.innerText = `${studioState.imageCornerRadius}px`;
            updateStudioPreview();
        });
    }

    const imgShadowToggle = document.getElementById('studio-toggle-image-shadow');
    if (imgShadowToggle) {
        imgShadowToggle.addEventListener('change', (e) => {
            studioState.imageElevationShadow = e.target.checked;
            updateStudioPreview();
        });
    }

    // 8. بطاقات ثيمات الكارت الملكي
    document.querySelectorAll('.studio-theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const themeId = card.getAttribute('data-theme');
            if (themeId && STUDIO_THEMES[themeId]) {
                studioState.theme = themeId;
                studioState.postBgCustomized = false;
                updateThemeButtonStates();
                updatePostBgControlStates();
                updateStudioPreview();
            }
        });
    });

    // -------------------------------------------------------------
    // أحداث كارد البوست الملكي الفاخر (Royal Card Customizer Events)
    // -------------------------------------------------------------
    // 1. زر موضع الكارد (أعلى، أسفل عائم، شريط ممتد، بالمنتصف)
    document.querySelectorAll('.studio-card-pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pos = btn.getAttribute('data-pos');
            if (pos) {
                studioState.cardPosition = pos;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 2. زر محاذاة نصوص الكارد (يمين، وسط، يسار)
    document.querySelectorAll('.studio-card-align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const align = btn.getAttribute('data-align');
            if (align) {
                studioState.cardAlign = align;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 3. عرض الكارد ونسبة العرض
    const cardWidthIn = document.getElementById('studio-input-card-width');
    if (cardWidthIn) {
        cardWidthIn.addEventListener('input', (e) => {
            studioState.cardWidthPercent = Number(e.target.value);
            updateCardControlStates();
            updateStudioPreview();
        });
    }

    // 4. إزاحة الكارد الرأسية (Offset Y)
    const cardOffsetYIn = document.getElementById('studio-input-card-offset-y');
    if (cardOffsetYIn) {
        cardOffsetYIn.addEventListener('input', (e) => {
            studioState.cardOffsetY = Number(e.target.value);
            updateCardControlStates();
            updateStudioPreview();
        });
    }

    // 5. حجم الحشوة الداخلية للكارد (Padding)
    document.querySelectorAll('.studio-card-pad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pad = btn.getAttribute('data-pad');
            if (pad) {
                studioState.cardPadding = pad;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 6. استدارة حواف الكارد (Radius)
    document.querySelectorAll('.studio-card-radius-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const radius = btn.getAttribute('data-radius');
            if (radius) {
                studioState.cardRadius = radius;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 7. شفافية الزجاج والتمويه (Glassmorphism Opacity & Blur)
    const cardGlassOpIn = document.getElementById('studio-input-card-glass-opacity');
    if (cardGlassOpIn) {
        cardGlassOpIn.addEventListener('input', (e) => {
            studioState.cardGlassOpacity = Number(e.target.value);
            updateCardControlStates();
            updateStudioPreview();
        });
    }

    const cardGlassBlurIn = document.getElementById('studio-input-card-glass-blur');
    if (cardGlassBlurIn) {
        cardGlassBlurIn.addEventListener('input', (e) => {
            studioState.cardGlassBlur = Number(e.target.value);
            updateCardControlStates();
            updateStudioPreview();
        });
    }

    // 8. نمط إطار الكارد والتوهج الملكي (Border Style)
    document.querySelectorAll('.studio-card-border-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const border = btn.getAttribute('data-border');
            if (border) {
                studioState.cardBorderStyle = border;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 9. نوع خط عنوان القطعة في الكارد
    const cardTitleFontSelect = document.getElementById('studio-select-card-title-font');
    if (cardTitleFontSelect) {
        cardTitleFontSelect.addEventListener('change', (e) => {
            studioState.cardTitleFont = e.target.value;
            updateCardControlStates();
            updateStudioPreview();
        });
    }

    document.querySelectorAll('.studio-card-title-font-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const font = chip.getAttribute('data-font');
            if (font) {
                studioState.cardTitleFont = font;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    const cardTitleCustomFontIn = document.getElementById('studio-input-card-title-custom-font');
    if (cardTitleCustomFontIn) {
        cardTitleCustomFontIn.addEventListener('input', (e) => {
            studioState.cardTitleCustomFont = e.target.value;
            studioState.cardTitleFont = 'custom';
            updateStudioPreview();
        });
    }

    // 10. حجم خط العنوان
    document.querySelectorAll('.studio-card-title-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-size');
            if (size) {
                studioState.cardTitleSize = size;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 11. حجم شارة السعر
    document.querySelectorAll('.studio-card-price-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.getAttribute('data-size');
            if (size) {
                studioState.cardPriceSize = size;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 12. نمط عرض المواصفات
    document.querySelectorAll('.studio-card-specs-style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');
            if (style) {
                studioState.cardSpecsStyle = style;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    // 13. ألوان عنوان القطعة
    document.querySelectorAll('.studio-card-title-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            if (color) {
                studioState.cardTitleColor = color;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    const cardTitleCustomColorIn = document.getElementById('studio-input-card-title-custom-color');
    if (cardTitleCustomColorIn) {
        const handleCardTitleCustomColor = (e) => {
            studioState.cardTitleColor = e.target.value;
            updateCardControlStates();
            updateStudioPreview();
        };
        cardTitleCustomColorIn.addEventListener('input', handleCardTitleCustomColor);
        cardTitleCustomColorIn.addEventListener('change', handleCardTitleCustomColor);
    }

    // 14. ألوان شارة السعر
    document.querySelectorAll('.studio-card-price-color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            if (color) {
                studioState.cardPriceColor = color;
                updateCardControlStates();
                updateStudioPreview();
            }
        });
    });

    const cardPriceCustomColorIn = document.getElementById('studio-input-card-price-custom-color');
    if (cardPriceCustomColorIn) {
        const handleCardPriceCustomColor = (e) => {
            studioState.cardPriceColor = e.target.value;
            updateCardControlStates();
            updateStudioPreview();
        };
        cardPriceCustomColorIn.addEventListener('input', handleCardPriceCustomColor);
        cardPriceCustomColorIn.addEventListener('change', handleCardPriceCustomColor);
    }

    // 15. مفتاح الهالة الضوئية ثلاثية الأبعاد (3D Ambient Spotlight)
    const toggleCardSpotlight = document.getElementById('studio-toggle-card-spotlight');
    if (toggleCardSpotlight) {
        toggleCardSpotlight.addEventListener('change', (e) => {
            studioState.cardSpotlight = e.target.checked;
            updateCardControlStates();
            updateStudioPreview();
        });
    }

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
                studioState.videoSrc = null;
                studioState.mediaType = 'image';
                renderStudioMediaSelectorArea();
                renderCarpetGalleryThumbs();
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
            studioState.customImageSrc = '';
            studioState.mediaType = 'video';
            renderStudioMediaSelectorArea();
            renderCarpetGalleryThumbs();
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

    window.clearStudioCustomMedia = clearStudioCustomMedia;
    window.switchStudioMobileTab = switchStudioMobileTab;
    window.scrollStudioSection = scrollStudioSection;
    window.openStudioMobileDrawer = openStudioMobileDrawer;
    window.closeStudioMobileDrawer = closeStudioMobileDrawer;
    window.switchStudioMobileDrawerTab = switchStudioMobileDrawerTab;
    window.toggleStudioMobileView = toggleStudioMobileView;
    window.pickStudioColorFromStage = pickStudioColorFromStage;
    window.setStudioPostBgColor = setStudioPostBgColor;
    window.saveStudioDraft = saveStudioDraft;
    window.loadStudioDraft = loadStudioDraft;
    window.deleteStudioDraft = deleteStudioDraft;
    window.exportStudioHDImage = exportStudioHDImage;
    window.copyStudioCaption = copyStudioCaption;
    window.shareStudioToWhatsApp = shareStudioToWhatsApp;

    // مراقبة حجم الشاشة للتنقل السلس بين وضع الجوال والكمبيوتر
    window.addEventListener('resize', () => {
        const previewCol = document.getElementById('studio-preview-col');
        const controlsCol = document.getElementById('studio-controls-col');
        if (window.innerWidth >= 1024) {
            if (previewCol) previewCol.classList.remove('hidden');
            if (controlsCol) controlsCol.classList.remove('hidden');
        } else {
            if (studioState.mobileActiveTab) {
                switchStudioMobileTab(studioState.mobileActiveTab);
            }
        }
    });
}
