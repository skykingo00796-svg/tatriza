// ==========================================
// محرك العملات الذكي المعتمد لدار التطريز (currency.js)
// دعم الريال العماني بالشعار الرسمي المعتمد والعملات الخليجية والعالمية
// ==========================================

export const OMR_OFFICIAL_SVG = `
<svg class="omr-official-symbol inline-block align-baseline" viewBox="0 0 922.01 479.53" fill="currentColor" style="height: 0.9em; width: auto; max-width: 1.8em; margin-inline-start: 2px; vertical-align: -0.1em;" aria-hidden="true">
    <path d="M409.56,478.8h-125.86c41.94-.01,83.93,0,125.86,0Z" opacity="0.95"/>
    <path d="M922.01,236.09l-59.34,95.95-333.24-.07c25.34,15.62,52.07,30.01,80.14,40.23,7.12,2.58,30.02,10.71,36.24,10.71h179.3l-56.94,96.38c-12.64.7-651.61-.33-755.19-.49-5.78,0-9.89,0-12.13,0h-.85l55.44-95.88h343.63c.12,0-26.38-33.78-38.46-50.94l-264.7-.49,56.43-95.39h173.31c-.8-61.59,16.04-121.33,49.53-172.7,31.83-48.8,63.2-75.17,125.05-58.28,41.3,11.29,78.52,39.73,107.65,70.21l-36.5,142.79c-1.77.36-12.58-12.88-16.95-17.5-37.63-39.81-102.37-90.88-160.53-66.57-14.35,6-29.47,19.14-30.02,35.91-.73,22.61,27.02,49.43,40.69,65.64l517.44.5Z"/>
</svg>
`;

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
        hasOfficialSvg: false,
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
        hasOfficialSvg: false,
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

// توليد رمز العملة (شعار الريال العماني الجديد + ر.ع، أو الرمز النصي المعتمد لبقية العملات)
export function getCurrencyBadgeHTML(targetCurrency = null, options = { showFlag: false, compact: false }) {
    const cur = targetCurrency || getCurrentCurrency();
    
    if (cur.code === 'OMR') {
        if (options.compact) {
            return `<span class="inline-flex items-center gap-0.5">${cur.symbolText} ${OMR_OFFICIAL_SVG}</span>`;
        }
        return `
            <span class="inline-flex items-center gap-1 font-bold">
                ${options.showFlag ? `<span class="text-xs">${cur.flag}</span>` : ''}
                <span>${cur.symbolText}</span>
                ${OMR_OFFICIAL_SVG}
            </span>
        `;
    }

    return `
        <span class="inline-flex items-center gap-1 font-bold">
            ${options.showFlag ? `<span class="text-xs">${cur.flag}</span>` : ''}
            <span>${cur.symbolText}</span>
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
    
    // 1. تحديث زر العملة في الهيدر
    const headerBtn = document.getElementById('header-currency-btn');
    if (headerBtn) {
        const flagSpan = headerBtn.querySelector('.currency-btn-flag');
        const codeSpan = headerBtn.querySelector('.currency-btn-code');
        const svgSpan = headerBtn.querySelector('.currency-btn-svg');
        
        if (flagSpan) flagSpan.innerText = cur.flag;
        if (codeSpan) codeSpan.innerText = cur.code === 'OMR' ? 'ر.ع' : cur.symbolText;
        if (svgSpan) {
            svgSpan.innerHTML = cur.code === 'OMR' ? OMR_OFFICIAL_SVG : '';
            svgSpan.style.display = cur.code === 'OMR' ? 'inline-block' : 'none';
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
                priceCurrEl.innerHTML = cur.code === 'OMR' ? `ر.ع ${OMR_OFFICIAL_SVG}` : cur.symbolText;
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
                modalCurrEl.innerHTML = cur.code === 'OMR' ? `ريال عماني ${OMR_OFFICIAL_SVG}` : cur.name;
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

        card.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-stone-100 border border-stone-200/80 shrink-0">
                    ${cur.flag}
                </div>
                <div class="text-right">
                    <div class="flex items-center gap-1.5">
                        <span class="font-display font-black text-xs sm:text-sm text-stone-900">${cur.name}</span>
                        ${cur.code === 'OMR' ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">العملة الرسمية</span>` : ''}
                    </div>
                    <span class="text-[10px] sm:text-[11px] text-stone-500 font-medium block mt-0.5">${cur.desc}</span>
                </div>
            </div>
            
            <div class="flex items-center gap-2">
                <div class="text-left font-mono font-bold text-xs sm:text-sm text-stone-700 flex items-center gap-1">
                    <span>${cur.symbolText}</span>
                    ${cur.code === 'OMR' ? OMR_OFFICIAL_SVG : ''}
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

            <div class="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-center text-[10px] text-amber-900 font-medium">
                💡 جميع المعاملات وتأكيدات الحياكة المباشرة تصدر بالريال العماني <strong>(ر.ع ${OMR_OFFICIAL_SVG})</strong> كمرجع أساسي موثق للدار.
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
window.getCurrencyText = getCurrencyText;
window.openCurrencyModal = openCurrencyModal;
window.closeCurrencyModal = closeCurrencyModal;
window.updateAllPricesOnPage = updateAllPricesOnPage;
