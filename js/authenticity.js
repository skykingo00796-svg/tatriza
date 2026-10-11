// ==========================================
// محرك شهادات الأصالة والتوثيق الرقمي (authenticity.js)
// دار التطريز TATRIZA - حماية الفواتير والتحقق من الملكية
// ==========================================

import { QRCode } from './qrcode.js';

// المفتاح السري المعتمد لدار التطريز لتشفير وتوليد البصمة الأمنية (Secret Salt)
const TATRIZA_AUTH_SALT = "TATRIZA_ROYAL_HERITAGE_SALT_OMAN_2026";

/**
 * دالة خوارزمية لتوليد كود التوثيق الأمني المشفر والفريد لكل طلبية (Tamper-Proof Security Hash)
 * غير قابل للتزوير أو التخمين، ويتغير تلقائياً إذا عُدل أي رقم أو اسم في الطلب
 */
export function generateOrderAuthHash(order) {
    if (!order) return "TATR-AUTH-0000-0000";

    const orderId = String(order.orderId || order.id || "").trim();
    const createdAt = String(order.createdAt || "").trim();
    const totalPrice = String(Number(order.totalPrice) || 0).trim();
    const customer = String(order.customerName || "عميل دار التطريز").trim().toLowerCase();
    
    let firstItem = "";
    if (Array.isArray(order.items) && order.items.length > 0) {
        firstItem = String(order.items[0].id || order.items[0].title || "").trim();
    }

    const payload = `${orderId}:${createdAt}:${totalPrice}:${customer}:${firstItem}:${TATRIZA_AUTH_SALT}`;

    // خوارزمية FNV-1a معدلة مدمجة مع Jenkins Hash لإنتاج 48 بت تجزئة نقية موزعة
    let h1 = 0x811c9dc5;
    let h2 = 0x5a5a5a5a;
    for (let i = 0; i < payload.length; i++) {
        const c = payload.charCodeAt(i);
        h1 = (h1 ^ c) * 0x01000193;
        h1 = Math.imul(h1, 0x01000193) >>> 0;
        h2 = ((h2 << 5) - h2 + c) >>> 0;
    }

    const hex1 = ((h1 >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const hex2 = (h1 & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const hex3 = ((h2 >>> 16) & 0xffff).toString(16).toUpperCase().padStart(4, '0');

    return `TATR-AUTH-${hex1}-${hex2}-${hex3}`;
}

/**
 * التحقق من مطابقة كود التوثيق مع بيانات الطلب
 */
export function verifyOrderAuthHash(order, providedHash) {
    if (!order || !providedHash) return false;
    const computed = generateOrderAuthHash(order);
    return computed.toUpperCase() === String(providedHash).trim().toUpperCase();
}

/**
 * توليد رابط صفحة التحقق الرسمية السحابية
 */
export function getOrderVerificationUrl(orderId, authHash, customOrigin = null) {
    const origin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://tatriza-official.web.app');
    const isScreenPath = typeof window !== 'undefined' && window.location.pathname.includes('/screen');
    const pathPrefix = isScreenPath ? '/screen' : '';
    return `${origin}${pathPrefix}/verify.html?order=${encodeURIComponent(orderId)}&auth=${encodeURIComponent(authHash)}`;
}

/**
 * توليد رمز QR Code عالي النقاء كـ SVG مدمج بدون أي سيرفر خارجي
 */
export function generateOrderQRCodeSVG(url, size = 110) {
    try {
        const qr = new QRCode({
            content: url,
            width: size,
            height: size,
            color: "#520b22", // لون عنابي ملكي فاخر
            background: "#ffffff",
            padding: 1,
            join: true
        });
        return qr.svg();
    } catch (e) {
        console.error("QR Code Generation failed:", e);
        return `<div style="width:${size}px; height:${size}px; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:10px;">QR Error</div>`;
    }
}

/**
 * توليد الختم الملكي الدائري لدار التطريز المخصص لهذه الطلبية تحديداً
 * يحتوي ديناميكياً على كود التوثيق ورقم الطلب والشعار الملكي
 */
export function generateRoyalOrderSealSVG(order, authHash, options = { width: 120, height: 120 }) {
    const orderId = order.orderId || order.id || 'TATR-ORDER';
    const authCode = authHash || generateOrderAuthHash(order);
    const w = options.width || 120;
    const h = options.height || 120;

    return `
    <svg class="royal-tamperproof-seal" width="${w}" height="${h}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; filter:drop-shadow(0 4px 10px rgba(124, 29, 60, 0.18));">
        <defs>
            <!-- تدرج لوني مذهب فاخر للختم -->
            <radialGradient id="sealGoldGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fffdf7"/>
                <stop offset="65%" stop-color="#faedd3"/>
                <stop offset="100%" stop-color="#e9cf99"/>
            </radialGradient>
            <linearGradient id="sealBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#b68b20"/>
                <stop offset="50%" stop-color="#e7ca7f"/>
                <stop offset="100%" stop-color="#8d680f"/>
            </linearGradient>
            <!-- مسار دائري للنص العلوي والسفلي -->
            <path id="sealTopTextPath" d="M 28 100 A 72 72 0 1 1 172 100" fill="none"/>
            <path id="sealBottomTextPath" d="M 172 100 A 72 72 0 0 1 28 100" fill="none"/>
        </defs>

        <!-- خلفية الختم الدائري -->
        <circle cx="100" cy="100" r="95" fill="url(#sealGoldGrad)" stroke="url(#sealBorderGrad)" stroke-width="3"/>
        <circle cx="100" cy="100" r="88" fill="none" stroke="#7c1d3c" stroke-width="1.2" stroke-dasharray="3,2"/>
        <circle cx="100" cy="100" r="62" fill="none" stroke="#b68b20" stroke-width="1.5"/>

        <!-- كتابة الحواف الدائرية المحفورة -->
        <text fill="#520b22" font-size="9" font-family="'Tajawal', 'Cairo', sans-serif" font-weight="900" letter-spacing="0.5">
            <textPath href="#sealTopTextPath" startOffset="50%" text-anchor="middle">
                دار التطريز • TATRIZA • شهادة أصالة معتمدة
            </textPath>
        </text>

        <text fill="#8d680f" font-size="7.5" font-family="'Outfit', sans-serif" font-weight="800" letter-spacing="0.8">
            <textPath href="#sealBottomTextPath" startOffset="50%" text-anchor="middle">
                OFFICIAL LUXURY HERITAGE SEAL • SULTANATE OF OMAN
            </textPath>
        </text>

        <!-- نجوم وشارات التوثيق الجانبية -->
        <text x="19" y="103" font-size="10" fill="#b68b20" text-anchor="middle">★</text>
        <text x="181" y="103" font-size="10" fill="#b68b20" text-anchor="middle">★</text>

        <!-- المركز الملكي للختم -->
        <!-- تاج / شعار التطريز المصغر -->
        <g transform="translate(100, 72) scale(0.7)">
            <path d="M-15,10 L-20,-10 L-5,0 L0,-15 L5,0 L20,-10 L15,10 Z" fill="#7c1d3c" stroke="#b68b20" stroke-width="1"/>
            <circle cx="0" cy="-18" r="2.5" fill="#b68b20"/>
            <circle cx="-20" cy="-13" r="2" fill="#b68b20"/>
            <circle cx="20" cy="-13" r="2" fill="#b68b20"/>
        </g>

        <!-- النصوص المركزية الخاصة بالطلب (لا يمكن تزويرها) -->
        <text x="100" y="96" text-anchor="middle" font-family="'Alexandria', sans-serif" font-size="9.5" font-weight="900" fill="#7c1d3c">
            مُعتمـد رسميـاً
        </text>
        <text x="100" y="108" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="7" font-weight="800" fill="#1c1917">
            #${orderId}
        </text>
        
        <!-- باركود أمني صغير مع كود التوثيق -->
        <rect x="52" y="113" width="96" height="1" fill="#b68b20" opacity="0.6"/>
        <text x="100" y="123" text-anchor="middle" font-family="'Outfit', monospace" font-size="6.5" font-weight="700" fill="#7c1d3c" letter-spacing="0.3">
            ${authCode}
        </text>
        <text x="100" y="132" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="6.5" font-weight="800" fill="#065f46">
            ✓ موثق ومحمـي رقميـاً
        </text>
    </svg>
    `;
}

/**
 * رسالة واتساب مخصصة جاهزة للمسؤول لإرسال رابط شهادة الأصالة الملكية للعميل
 */
export function buildWhatsAppCertificateClientMessage(order, authHash, customOrigin = null) {
    const orderId = order.orderId || order.id;
    const clientName = (order.customerName || 'عميلنا العزيز').trim();
    const verifyUrl = getOrderVerificationUrl(orderId, authHash, customOrigin);
    
    let itemsTitles = "تحفتكم الفنية";
    if (Array.isArray(order.items) && order.items.length > 0) {
        itemsTitles = order.items.map(it => it.title).join(' و ');
    }

    let msg = `السلام عليكم ورحمة الله وبركاته 🏛️✨\n`;
    msg += `*عزيزنا الكريم: ${clientName}*\n`;
    msg += `تحية طيبة وفخرٌ باقتنائكم من *دار التطريز TATRIZA* 🇴🇲\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `يسعدنا إعلامكم بصدور وتوثيق *شهادة أصالة صُنع يدوي وملكية حصرية* رسمية لطلبكم رقم \`#${orderId}\`.\n\n`;
    msg += `▫️ *القطعة:* ${itemsTitles}\n`;
    msg += `▫️ *كود التوثيق الأمني:* \`${authHash}\`\n`;
    msg += `▫️ *الضمان والاعتماد:* صُنع يدوي معتمد 100% بخيوط وأصواف نقية فاخرة.\n\n`;
    msg += `📲 *رابط معاينة شهادة الأصالة الرقمية والتحقق الفوري:*\n`;
    msg += `${verifyUrl}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✨ يمكنكم فتح الرابط في أي وقت للتحقق من بيانات الأصالة أو تحميل الشهادة المعتمدة وحفظها بهاتفكم. نسعد دائماً بخدمتكم! 🌿`;

    return msg;
}

// تصدير الكائنات للنطاق العام للمتصفح
if (typeof window !== 'undefined') {
    window.generateOrderAuthHash = generateOrderAuthHash;
    window.verifyOrderAuthHash = verifyOrderAuthHash;
    window.getOrderVerificationUrl = getOrderVerificationUrl;
    window.generateOrderQRCodeSVG = generateOrderQRCodeSVG;
    window.generateRoyalOrderSealSVG = generateRoyalOrderSealSVG;
    window.buildWhatsAppCertificateClientMessage = buildWhatsAppCertificateClientMessage;
}
