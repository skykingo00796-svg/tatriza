// ==========================================
// محرك تتبع مراحل الطلب وتحديثات الواتساب (tracking.js)
// دار التطريز TATRIZA - نظام المتابعة الحرفية واللوجستية
// ==========================================

export const ORDER_STAGES = {
    order_received: {
        id: 'order_received',
        stepIndex: 1,
        title: 'تم استلام وتأكيد الطلب',
        shortTitle: 'تأكيد الطلب',
        desc: 'تم اعتماد تفاصيل ومواصفات القطعة وتثبيت موعد الحياكة اليدوية وسجلات الدار.',
        icon: '📋',
        badgeColor: 'amber',
        statusNotice: 'الطلب مسجل ومعتمد في خطة الحياكة الرسمية لدار التطريز.'
    },
    in_weaving: {
        id: 'in_weaving',
        stepIndex: 2,
        title: 'جاري الحياكة اليدوية واختيار الغزل',
        shortTitle: 'الحياكة اليدوية',
        desc: 'يباشر الحرفيون حياكة تحفتكم الفنية بأيدي ماهرة باستخدام أجود خيوط القطن والصوف النقي.',
        icon: '🧵',
        badgeColor: 'sky',
        statusNotice: 'القطعة حالياً على نول الحياكة اليدوية وتُحاك بدقة واهتمام فائق.'
    },
    quality_finishing: {
        id: 'quality_finishing',
        stepIndex: 3,
        title: 'الصقل ثلاثي الأبعاد وضبط الجودة',
        shortTitle: 'الصقل والجودة',
        desc: 'مرحلة النحت اليدوي للحواف والقص الدقيق وتثبيت القاعدة الفاخرة والفحص النهائي لشهادة الأصالة.',
        icon: '✨',
        badgeColor: 'purple',
        statusNotice: 'تخضع القطعة الآن لعمليات الصقل النهائي والحلاقة الدقيقة للتفاصيل ثلاثية الأبعاد.'
    },
    shipped: {
        id: 'shipped',
        stepIndex: 4,
        title: 'تم التجهيز وفي الطريق إليك',
        shortTitle: 'الشحن والتسليم',
        desc: 'تم تغليف التحفة الفنية بعناية ملكية فائقة وتسليمها لمندوب الشحن المؤمّن.',
        icon: '🚚',
        badgeColor: 'indigo',
        statusNotice: 'الشحنة خرجت مع شركة التوصيل المؤمّن وهي في طريقها إلى عنوانكم الكريم.'
    },
    delivered: {
        id: 'delivered',
        stepIndex: 5,
        title: 'تم التسليم بنجاح واقتناء التحفة',
        shortTitle: 'تم التسليم',
        desc: 'وصلت التحفة الفنية بحمد الله لعميلنا الكريم مع شهادة الأصالة الملكية المعتمدة.',
        icon: '🏛️',
        badgeColor: 'emerald',
        statusNotice: 'مبارك اقتناؤكم تحفة دار التطريز، نتمنى أن تضفي رونقاً وفخامة استثنائية لمكانكم.'
    }
};

export const ORDER_STAGES_ARRAY = [
    ORDER_STAGES.order_received,
    ORDER_STAGES.in_weaving,
    ORDER_STAGES.quality_finishing,
    ORDER_STAGES.shipped,
    ORDER_STAGES.delivered
];

/**
 * معرفة المرحلة الحالية للطلب بدقة
 */
export function getOrderStage(order) {
    if (!order) return ORDER_STAGES.order_received;
    
    // إذا كان مسجلاً صراحة بحقل stage
    if (order.stage && ORDER_STAGES[order.stage]) {
        return ORDER_STAGES[order.stage];
    }

    // مطابقة افتراضية بناءً على حالة الطلب العامة إذا لم تكن المرحلة محددة بعد
    if (order.status === 'confirmed') {
        return ORDER_STAGES.in_weaving;
    }

    return ORDER_STAGES.order_received;
}

/**
 * توليد رابط صفحة التتبع المباشرة
 */
export function getOrderTrackingUrl(orderId, customOrigin = null) {
    const origin = customOrigin || (typeof window !== 'undefined' ? window.location.origin : 'https://tatriza-official.web.app');
    const isScreenPath = typeof window !== 'undefined' && window.location.pathname.includes('/screen');
    const pathPrefix = isScreenPath ? '/screen' : '';
    return `${origin}${pathPrefix}/track.html?order=${encodeURIComponent(orderId)}`;
}

/**
 * صياغة رسالة واتساب ملكية واحترافية لتحديث حالة الطلب وإرسالها للعميل بنقرة واحدة
 */
export function buildWhatsAppStatusUpdateMessage(order, newStageId, trackingDetails = {}, customOrigin = null) {
    const orderId = order.orderId || order.id || 'TATR-ORDER';
    const clientName = (order.customerName || 'عميلنا العزيز').trim();
    const stage = ORDER_STAGES[newStageId] || getOrderStage(order);
    const trackingUrl = getOrderTrackingUrl(orderId, customOrigin);

    let itemsTitles = "مقتنياتكم الفنية";
    if (Array.isArray(order.items) && order.items.length > 0) {
        itemsTitles = order.items.map(it => it.title).join(' • ');
    }

    let msg = `السلام عليكم ورحمة الله وبركاته 🏛️✨\n`;
    msg += `*عزيزنا الكريم: ${clientName}*\n`;
    msg += `تحية طيبة من *دار التطريز TATRIZA* 🇴🇲\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `يسعدنا إحاطتكم بآخر تحديثات مرحلة طلبكم رقم \`#${orderId}\`:\n\n`;
    msg += `📍 *المرحلة الحالية:* ${stage.icon} *${stage.title}*\n`;
    msg += `💬 ${stage.desc}\n\n`;
    msg += `▫️ *القطعة:* ${itemsTitles}\n`;

    if (trackingDetails.trackingNumber) {
        msg += `📦 *رقم بوليصة الشحن والتتبع:* \`${trackingDetails.trackingNumber}\`\n`;
    }
    if (trackingDetails.carrierName) {
        msg += `🚚 *شركة الشحن والتوصيل:* ${trackingDetails.carrierName}\n`;
    }
    if (trackingDetails.notes) {
        msg += `📝 *ملاحظة الدار:* ${trackingDetails.notes}\n`;
    }

    msg += `\n📲 *رابط تتبع مراحل الطلب والحياكة مباشرة:*\n`;
    msg += `${trackingUrl}\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `✨ نسعد دائماً بخدمتكم وتلبية تطلعاتكم الراقية. شكراً لثقتكم الغالية بدار التطريز! 🌿`;

    return msg;
}

if (typeof window !== 'undefined') {
    window.ORDER_STAGES = ORDER_STAGES;
    window.ORDER_STAGES_ARRAY = ORDER_STAGES_ARRAY;
    window.getOrderStage = getOrderStage;
    window.getOrderTrackingUrl = getOrderTrackingUrl;
    window.buildWhatsAppStatusUpdateMessage = buildWhatsAppStatusUpdateMessage;
}
