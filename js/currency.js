// ==========================================
// محرك العملات الذكي المعتمد لدار التطريز (currency.js)
// دعم الريال العماني، الريال السعودي، والدرهم الإماراتي بالشعارات الرسمية المعتمدة
// ==========================================

// 1. الشعار الرسمي المعتمد للريال العُماني (CBO - البنك المركزي العُماني)
export const OMR_OFFICIAL_SVG = `
<svg class="omr-official-symbol currency-official-symbol inline-block align-middle" viewBox="0 0 922.01 479.53" fill="currentColor" aria-label="شعار الريال العماني الرسمي" aria-hidden="true">
    <path d="M409.56,478.8h-125.86c41.94-.01,83.93,0,125.86,0Z" opacity="0.95"/>
    <path d="M922.01,236.09l-59.34,95.95-333.24-.07c25.34,15.62,52.07,30.01,80.14,40.23,7.12,2.58,30.02,10.71,36.24,10.71h179.3l-56.94,96.38c-12.64.7-651.61-.33-755.19-.49-5.78,0-9.89,0-12.13,0h-.85l55.44-95.88h343.63c.12,0-26.38-33.78-38.46-50.94l-264.7-.49,56.43-95.39h173.31c-.8-61.59,16.04-121.33,49.53-172.7,31.83-48.8,63.2-75.17,125.05-58.28,41.3,11.29,78.52,39.73,107.65,70.21l-36.5,142.79c-1.77.36-12.58-12.88-16.95-17.5-37.63-39.81-102.37-90.88-160.53-66.57-14.35,6-29.47,19.14-30.02,35.91-.73,22.61,27.02,49.43,40.69,65.64l517.44.5Z"/>
</svg>
`;

// 2. الشعار الرسمي المعتمد للريال السعودي (SAMA - البنك المركزي السعودي U+20C1)
export const SAR_OFFICIAL_SVG = `
<svg class="sar-official-symbol currency-official-symbol inline-block align-middle" viewBox="0 0 1124.14 1256.39" fill="currentColor" aria-label="شعار الريال السعودي الرسمي" aria-hidden="true">
    <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
    <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
</svg>
`;

// 3. الشعار الرسمي المعتمد للدرهم الإماراتي (CBUAE - مصرف الإمارات المركزي U+20C3)
export const AED_OFFICIAL_SVG = `
<svg class="aed-official-symbol currency-official-symbol inline-block align-middle" viewBox="0 0 1000 870" fill="currentColor" aria-label="شعار الدرهم الإماراتي الرسمي" aria-hidden="true">
    <path d="m88.3 1c0.4 0.6 2.6 3.3 4.7 5.9 15.3 18.2 26.8 47.8 33 85.1 4.1 24.5 4.3 32.2 4.3 125.6v87h-41.8c-38.2 0-42.6-0.2-50.1-1.7-11.8-2.5-24-9.2-32.2-17.8-6.5-6.9-6.3-7.3-5.9 13.6 0.5 17.3 0.7 19.2 3.2 28.6 4 14.9 9.5 26 17.8 35.9 11.3 13.6 22.8 21.2 39.2 26.3 3.5 1 10.9 1.4 37.1 1.6l32.7 0.5v43.3 43.4l-46.1-0.3-46.3-0.3-8-3.2c-9.5-3.8-13.8-6.6-23.1-14.9l-6.8-6.1 0.4 19.1c0.5 17.7 0.6 19.7 3.1 28.7 8.7 31.8 29.7 54.5 57.4 61.9 6.9 1.9 9.6 2 38.5 2.4l30.9 0.4v89.6c0 54.1-0.3 94-0.8 100.8-0.5 6.2-2.1 17.8-3.5 25.9-6.5 37.3-18.2 65.4-35 83.6l-3.4 3.7h169.1c101.1 0 176.7-0.4 187.8-0.9 19.5-1 63-5.3 72.8-7.4 3.1-0.6 8.9-1.5 12.7-2.1 8.1-1.2 21.5-4 40.8-8.9 27.2-6.8 52-15.3 76.3-26.1 7.6-3.4 29.4-14.5 35.2-18 3.1-1.8 6.8-4 8.2-4.7 3.9-2.1 10.4-6.3 19.9-13.1 4.7-3.4 9.4-6.7 10.4-7.4 4.2-2.8 18.7-14.9 25.3-21 25.1-23.1 46.1-48.8 62.4-76.3 2.3-4 5.3-9 6.6-11.1 3.3-5.6 16.9-33.6 18.2-37.8 0.6-1.9 1.4-3.9 1.8-4.3 2.6-3.4 17.6-50.6 19.4-60.9 0.6-3.3 0.9-3.8 3.4-4.3 1.6-0.3 24.9-0.3 51.8-0.1 53.8 0.4 53.8 0.4 65.7 5.9 6.7 3.1 8.7 4.5 16.1 11.2 9.7 8.7 8.8 10.1 8.2-11.7-0.4-12.8-0.9-20.7-1.8-23.9-3.4-12.3-4.2-14.9-7.2-21.1-9.8-21.4-26.2-36.7-47.2-44l-8.2-3-33.4-0.4-33.3-0.5 0.4-11.7c0.4-15.4 0.4-45.9-0.1-61.6l-0.4-12.6 44.6-0.2c38.2-0.2 45.3 0 49.5 1.1 12.6 3.5 21.1 8.3 31.5 17.8l5.8 5.4v-14.8c0-17.6-0.9-25.4-4.5-37-7.1-23.5-21.1-41-41.1-51.8-13-7-13.8-7.2-58.5-7.5-26.2-0.2-39.9-0.6-40.6-1.2-0.6-0.6-1.1-1.6-1.1-2.4 0-0.8-1.5-7.1-3.5-13.9-23.4-82.7-67.1-148.4-131-197.1-8.7-6.7-30-20.8-38.6-25.6-3.3-1.9-6.9-3.9-7.8-4.5-4.2-2.3-28.3-14.1-34.3-16.6-3.6-1.6-8.3-3.6-10.4-4.4-35.3-15.3-94.5-29.8-139.7-34.3-7.4-0.7-17.2-1.8-21.7-2.2-20.4-2.3-48.7-2.6-209.4-2.6-135.8 0-169.9 0.3-169.4 1zm330.7 43.3c33.8 2 54.6 4.6 78.9 10.5 74.2 17.6 126.4 54.8 164.3 117 3.5 5.8 18.3 36 20.5 42.1 10.5 28.3 15.6 45.1 20.1 67.3 1.1 5.4 2.6 12.6 3.3 16 0.7 3.3 1 6.4 0.7 6.7-0.5 0.4-100.9 0.6-223.3 0.5l-222.5-0.2-0.3-128.5c-0.1-70.6 0-129.3 0.3-130.4l0.4-1.9h71.1c39 0 78 0.4 86.5 0.9zm297.5 350.3c0.7 4.3 0.7 77.3 0 80.9l-0.6 2.7-227.5-0.2-227.4-0.3-0.2-42.4c-0.2-23.3 0-42.7 0.2-43.1 0.3-0.5 97.2-0.8 227.7-0.8h227.2zm-10.2 171.7c0.5 1.5-1.9 13.8-6.8 33.8-5.6 22.5-13.2 45.2-20.9 62-3.8 8.6-13.3 27.2-15.6 30.7-1.1 1.6-4.3 6.7-7.1 11.2-18 28.2-43.7 53.9-73 72.9-10.7 6.8-32.7 18.4-38.6 20.2-1.2 0.3-2.5 0.9-3 1.3-0.7 0.6-9.8 4-20.4 7.8-19.5 6.9-56.6 14.4-86.4 17.5-19.3 1.9-22.4 2-96.7 2h-76.9v-129.7-129.8l220.9-0.4c121.5-0.2 221.6-0.5 222.4-0.7 0.9-0.1 1.8 0.5 2.1 1.2z"/>
</svg>
`;

/**
 * الحصول على الشعار الرسمي المعتمد للعملة إن وُجد (عُمان، السعودية، الإمارات)
 */
export function getOfficialCurrencySvg(currencyCode) {
    if (currencyCode === 'OMR') return OMR_OFFICIAL_SVG;
    if (currencyCode === 'SAR') return SAR_OFFICIAL_SVG;
    if (currencyCode === 'AED') return AED_OFFICIAL_SVG;
    return '';
}

export const SUPPORTED_CURRENCIES = {
    OMR: {
        code: 'OMR',
        name: 'الريال العُماني',
        shortName: 'ريال عماني',
        symbolText: 'ر.ع',
        rate: 1.0,
        flag: '🇴🇲',
        decimals: 0,
        hasOfficialSvg: true,
        authority: 'CBO',
        desc: 'العملة الرسمية لسلطنة عُمان'
    },
    SAR: {
        code: 'SAR',
        name: 'الريال السعودي',
        shortName: 'ريال سعودي',
        symbolText: 'ر.س',
        rate: 9.75,
        flag: '🇸🇦',
        decimals: 0,
        hasOfficialSvg: true,
        authority: 'SAMA',
        desc: 'المملكة العربية السعودية'
    },
    AED: {
        code: 'AED',
        name: 'الدرهم الإماراتي',
        shortName: 'درهم إماراتي',
        symbolText: 'د.إ',
        rate: 9.55,
        flag: '🇦🇪',
        decimals: 0,
        hasOfficialSvg: true,
        authority: 'CBUAE',
        desc: 'دولة الإمارات العربية المتحدة'
    },
    QAR: {
        code: 'QAR',
        name: 'الريال القطري',
        shortName: 'ريال قطري',
        symbolText: 'ر.ق',
        rate: 9.47,
        flag: '🇶🇦',
        decimals: 0,
        hasOfficialSvg: false,
        desc: 'دولة قطر'
    },
    KWD: {
        code: 'KWD',
        name: 'الدينار الكويتي',
        shortName: 'دينار كويتي',
        symbolText: 'د.ك',
        rate: 0.80,
        flag: '🇰🇼',
        decimals: 1,
        hasOfficialSvg: false,
        desc: 'دولة الكويت'
    },
    BHD: {
        code: 'BHD',
        name: 'الدينار البحريني',
        shortName: 'دينار بحريني',
        symbolText: 'د.ب',
        rate: 0.98,
        flag: '🇧🇭',
        decimals: 1,
        hasOfficialSvg: false,
        desc: 'مملكة البحرين'
    },
    USD: {
        code: 'USD',
        name: 'الدولار الأمريكي',
        shortName: 'دولار أمريكي',
        symbolText: '$',
        rate: 2.60,
        flag: '🇺🇸',
        decimals: 0,
        hasOfficialSvg: false,
        desc: 'عملة عالمية (USD)'
    }
};

const STORAGE_KEY = 'tatr_currency';

// استرجاع العملة المفضلة الحالية للمستخدم
export function getCurrentCurrency() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_CURRENCIES[saved]) {
            return SUPPORTED_CURRENCIES[saved];
        }
    } catch (e) {}
    return SUPPORTED_CURRENCIES.OMR;
}

// تغيير وتثبيت العملة المختارة مع إطلاق حدث تحديث فوري
export function setCurrentCurrency(currencyCode) {
    if (!SUPPORTED_CURRENCIES[currencyCode]) return;
    try {
        localStorage.setItem(STORAGE_KEY, currencyCode);
    } catch (e) {}
    
    // إشعار التطبيق بتحديث العملة
    window.dispatchEvent(new CustomEvent('tatriza:currency-changed', {
        detail: { currency: SUPPORTED_CURRENCIES[currencyCode] }
    }));
    
    updateAllPricesOnPage();
}

// تحويل وحساب السعر بناءً على العملة الحالية
export function convertFromOMR(amountInOMR, targetCurrency = null) {
    const cur = targetCurrency || getCurrentCurrency();
    const numericAmount = Number(amountInOMR) || 0;
    const converted = numericAmount * cur.rate;
    
    // تقريب السعر بطريقة راقية مناسبة للمنتجات الفاخرة
    if (cur.decimals > 0) {
        return Math.round(converted * 10) / 10;
    }
    return Math.round(converted);
}

/**
 * الحصول على رمز العملة الدقيق للعرض (مصدر الحقيقة الموحد للنظام):
 * - إذا كان للعملة شعار رسمي معتمد (OMR, SAR, AED): يعيد الشعار الفكتوري الرسمي فقط (SVG) بدون أي نص نهائياً!
 * - إذا لم يكن لها شعار رسمي (BHD, KWD, QAR, USD): يعيد الرمز النصي المعتمد فقط (مثل د.ب، د.ك، ر.ق، $).
 */
export function getCurrencySymbolHTML(targetCurrency = null) {
    const cur = targetCurrency || getCurrentCurrency();
    const svg = getOfficialCurrencySvg(cur.code);
    if (cur.hasOfficialSvg && svg) {
        return svg;
    }
    return cur.symbolText;
}

// توليد وسم العملة الكامل للعرض
export function getCurrencyBadgeHTML(targetCurrency = null, options = { showFlag: false, compact: false }) {
    const cur = targetCurrency || getCurrentCurrency();
    const symbolHtml = getCurrencySymbolHTML(cur);
    
    if (options.compact) {
        return `<span class="inline-flex items-center">${symbolHtml}</span>`;
    }
    return `
        <span class="inline-flex items-center gap-1 font-bold">
            ${options.showFlag ? `<span class="text-xs">${cur.flag}</span>` : ''}
            ${symbolHtml}
        </span>
    `;
}

// توليد النص الصافي للعملة (مناسب لنصوص الواتساب ومشاركات الرسائل)
export function getCurrencyText(targetCurrency = null) {
    const cur = targetCurrency || getCurrentCurrency();
    if (cur.code === 'OMR') {
        return 'ر.ع (ريال عماني)';
    }
    return `${cur.symbolText} (${cur.shortName})`;
}

// تحديث كافة الأسعار الموجودة في الشاشة الحالية ديناميكياً
export function updateAllPricesOnPage() {
    const cur = getCurrentCurrency();
    const curSvg = getOfficialCurrencySvg(cur.code);
    const symbolHtml = getCurrencySymbolHTML(cur);
    
    // 1. تحديث زر العملة في الهيدر (إما الشعار الرسمي فقط أو الرمز النصي فقط، ولا يظهران معاً إطلاقاً)
    const headerBtn = document.getElementById('header-currency-btn');
    if (headerBtn) {
        const flagSpan = headerBtn.querySelector('.currency-btn-flag');
        const codeSpan = headerBtn.querySelector('.currency-btn-code');
        const svgSpan = headerBtn.querySelector('.currency-btn-svg');
        
        if (flagSpan) flagSpan.innerText = cur.flag;
        
        if (cur.hasOfficialSvg && curSvg) {
            // عملة بشعار رسمي معتمد: تفريغ النص بالكامل وإخفاؤه، وعرض الشعار فقط
            if (codeSpan) {
                codeSpan.innerText = '';
                codeSpan.style.display = 'none';
                codeSpan.classList.add('hidden');
            }
            if (svgSpan) {
                svgSpan.innerHTML = curSvg;
                svgSpan.style.display = 'inline-flex';
                svgSpan.classList.remove('hidden');
            }
        } else {
            // عملة برمز نصي: تفريغ الشعار بالكامل وإخفاؤه، وعرض الرمز النصي فقط
            if (codeSpan) {
                codeSpan.innerText = cur.symbolText;
                codeSpan.style.display = 'inline-block';
                codeSpan.classList.remove('hidden');
            }
            if (svgSpan) {
                svgSpan.innerHTML = '';
                svgSpan.style.display = 'none';
                svgSpan.classList.add('hidden');
            }
        }
    }

    // 2. تحديث بطاقة العملة في درج الخيارات (Options Drawer)
    const drawerCurrentText = document.getElementById('drawer-current-currency-text');
    if (drawerCurrentText) {
        drawerCurrentText.innerHTML = `${cur.flag} ${cur.name} (${cur.symbolText})`;
    }

    // 3. تحديث بطاقات المعرض الرئيسية (Grid Cards)
    document.querySelectorAll('.carpet-card').forEach(card => {
        const basePrice = card.getAttribute('data-base-price');
        if (basePrice !== null) {
            const priceValEl = card.querySelector('.card-price-val');
            const priceCurrEl = card.querySelector('.card-price-curr');
            if (priceValEl) {
                priceValEl.innerText = convertFromOMR(basePrice, cur);
            }
            if (priceCurrEl) {
                priceCurrEl.innerHTML = symbolHtml;
            }
        }
    });

    // 4. تحديث نافذة التفاصيل إذا كانت مفتوحة
    const modal = document.getElementById('product-modal');
    if (modal && !modal.classList.contains('hidden')) {
        const modalCarpetId = window._currentModalCarpetId;
        if (modalCarpetId && window._currentModalBasePrice !== undefined) {
            const modalPriceEl = document.getElementById('modal-price');
            const modalCurrEl = document.getElementById('modal-currency-label');
            if (modalPriceEl) {
                modalPriceEl.innerText = convertFromOMR(window._currentModalBasePrice, cur);
            }
            if (modalCurrEl) {
                modalCurrEl.innerHTML = symbolHtml;
            }
        }
    }

    // 5. تحديث سلة المشتريات
    if (typeof window.updateCartDisplay === 'function') {
        window.updateCartDisplay();
    }
}

// نافذة اختيار العملة الفاخرة (Royal Currency Modal)
export function openCurrencyModal() {
    let modal = document.getElementById('currency-modal');
    if (!modal) {
        createCurrencyModalDOM();
        modal = document.getElementById('currency-modal');
    }
    renderCurrencyOptions();
    if (modal) modal.classList.remove('hidden');
}

export function closeCurrencyModal() {
    const modal = document.getElementById('currency-modal');
    if (modal) modal.classList.add('hidden');
}

function renderCurrencyOptions() {
    const listContainer = document.getElementById('currency-options-list');
    if (!listContainer) return;
    const current = getCurrentCurrency();

    listContainer.innerHTML = '';
    Object.values(SUPPORTED_CURRENCIES).forEach(cur => {
        const isSelected = cur.code === current.code;
        const curSvg = getOfficialCurrencySvg(cur.code);
        const card = document.createElement('div');
        card.className = `currency-option-card flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
            isSelected 
                ? 'bg-amber-50/80 border-amber-400/80 shadow-xs ring-1 ring-amber-400/40' 
                : 'bg-white/80 border-stone-200/80 hover:bg-stone-50 hover:border-stone-300'
        }`;
        
        card.onclick = () => {
            setCurrentCurrency(cur.code);
            closeCurrencyModal();
            if (typeof window.showToast === 'function') {
                window.showToast('success', `تم تحويل العملة إلى ${cur.name} ${cur.flag}`, 'عملة العرض');
            }
        };

        // وسام التوثيق الرسمي للعملات المعتمدة بشعار رسمي
        let badgeTag = '';
        if (cur.code === 'OMR') {
            badgeTag = `<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">العملة الأساسية (CBO)</span>`;
        } else if (cur.code === 'SAR') {
            badgeTag = `<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300">شعار معتمد (SAMA)</span>`;
        } else if (cur.code === 'AED') {
            badgeTag = `<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-50 text-sky-800 border border-sky-300">شعار معتمد (CBUAE)</span>`;
        }

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-stone-100 border border-stone-200/80 shrink-0">
                    ${cur.flag}
                </div>
                <div class="text-right">
                    <div class="flex items-center gap-1.5">
                        <span class="font-display font-black text-xs sm:text-sm text-stone-900">${cur.name}</span>
                        ${badgeTag}
                    </div>
                    <span class="text-[10px] sm:text-[11px] text-stone-500 font-medium block mt-0.5">${cur.desc}</span>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <div class="text-left font-mono font-bold text-xs sm:text-sm text-stone-700 flex items-center justify-center min-w-[2.2rem]">
                    ${curSvg ? curSvg : `<span>${cur.symbolText}</span>`}
                </div>
                ${isSelected ? `
                    <div class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        ✓
                    </div>
                ` : `
                    <div class="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center text-xs text-transparent">
                        ○
                    </div>
                `}
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function createCurrencyModalDOM() {
    const modalHTML = `
    <div id="currency-modal" class="hidden fixed inset-0 z-[150] modal-glass-backdrop flex items-center justify-center p-3 sm:p-4">
        <div class="lux-modal-box w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative" dir="rtl">
            <div class="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg border border-amber-300/60 shadow-2xs">
                        💱
                    </div>
                    <div>
                        <h4 class="font-display text-sm sm:text-base font-black text-stone-900">اختيار عملة العرض</h4>
                        <p class="text-[10px] sm:text-[11px] text-stone-500 font-medium">الأسعار تحسب تلقائياً بأسعار الصرف المعتمدة</p>
                    </div>
                </div>
                <button onclick="window.closeCurrencyModal()" class="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-300/80 text-stone-600 hover:text-stone-900 flex items-center justify-center transition cursor-pointer text-sm font-bold" title="إغلاق">
                    ✕
                </button>
            </div>

            <div id="currency-options-list" class="space-y-2 max-h-[60vh] overflow-y-auto pl-1">
                <!-- تحقن الخيارات برمجياً -->
            </div>

            <div class="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-center text-[10px] text-amber-900 font-medium leading-relaxed">
                💡 جميع المعاملات وتأكيدات الحياكة المباشرة تصدر بالريال العماني <strong>(${OMR_OFFICIAL_SVG})</strong> كمرجع أساسي موثق للدار.
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// تصدير الدوال للنطاق العام للمتصفح
window.getCurrentCurrency = getCurrentCurrency;
window.setCurrentCurrency = setCurrentCurrency;
window.convertFromOMR = convertFromOMR;
window.getCurrencyBadgeHTML = getCurrencyBadgeHTML;
window.getCurrencySymbolHTML = getCurrencySymbolHTML;
window.getOfficialCurrencySvg = getOfficialCurrencySvg;
window.OMR_OFFICIAL_SVG = OMR_OFFICIAL_SVG;
window.SAR_OFFICIAL_SVG = SAR_OFFICIAL_SVG;
window.AED_OFFICIAL_SVG = AED_OFFICIAL_SVG;
window.getCurrencyText = getCurrencyText;
window.openCurrencyModal = openCurrencyModal;
window.closeCurrencyModal = closeCurrencyModal;
window.updateAllPricesOnPage = updateAllPricesOnPage;

// تشغيل التحديث فور تحميل السكريبت وتجهيز المستند
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => updateAllPricesOnPage());
    } else {
        updateAllPricesOnPage();
    }
}

