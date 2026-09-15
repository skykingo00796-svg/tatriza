// ==========================================
// الملف الرئيسي ونقطة التوصيل (main.js)
// ==========================================

import { checkAdminPermission, initAdminShortcut, handleMobileAdminTap, toggleStockStatus, deleteCarpet, handleAddProduct, openAddModal, closeAddModal, openAdminAuthModal } from './admin.js';
import { initTheme, openThemeModal, closeThemeModal, selectThemeOption, applyTheme } from './theme.js';
import { 
    openModal, closeModal, handleModalScroll, 
    addToCart, openCartModal, closeCartModal, removeFromCart, sendCartToWhatsApp, 
    openCustomOrderModal, closeCustomOrderModal, submitCustomOrder, 
    openLightboxFromModal, openCurrentLogoLightbox, closeLightbox, handleLightboxScroll 
} from './modals.js';

let allCarpets = [];
let currentFilter = 'all';
let currentSearchQuery = '';
let currentSortOption = 'default';

// ربط الدوال بالـ window لتعمل عبر الأحداث المباشرة في ملفات الـ HTML
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
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
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
window.openLightboxFromModalExternal = (id, idx) => openLightboxFromModal(id, idx, allCarpets);
window.resetSearchAndFilters = resetSearchAndFilters;
window.handleImageScroll = handleImageScrollForGrid;
window.handleMobileAdminTap = handleMobileAdminTap;

// تحميل بيانات السجاد من مجلد data بالمسار الصحيح ../data/
async function loadCarpets() {
    try {
        let carpetsData = [];
        const savedCarpets = localStorage.getItem('tatr_carpets');
        if (savedCarpets) {
            carpetsData = JSON.parse(savedCarpets);
        } else {
            const response = await fetch('../data/carpets.json');
            carpetsData = await response.json();
        }
        
        allCarpets = carpetsData.map(c => {
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

        localStorage.setItem('tatr_carpets', JSON.stringify(allCarpets));
        updateCategoryCounts();
        filterAndDisplayCarpets();
        setupFilters();
        setupSearchAndSort();
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
        const hasMultipleImages = images.length > 1;
        const isOutOfStock = carpet.status === 'out_of_stock';

        let imagesHtml = '';
        images.forEach((img) => {
            imagesHtml += `<img src="${img}" alt="${carpet.title}" class="w-full h-full object-cover shrink-0 snap-center card-img-zoom ${isOutOfStock ? 'grayscale-[30%]' : ''}">`;
        });

        const card = document.createElement('div');
        card.className = "carpet-card bg-[#fffbf7] rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm flex flex-col justify-between cursor-pointer group relative";
        card.onclick = () => openModal(carpet.id, allCarpets);

        card.innerHTML = `
            <div class="relative w-full h-72 md:h-80 bg-stone-100 overflow-hidden">
                <div class="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full" dir="ltr" onscroll="handleImageScroll(this, '${carpet.id}')" onclick="event.stopPropagation()">
                    ${imagesHtml}
                </div>
                
                <!-- أبعاد السجادة في أعلى اليمين -->
                <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs z-10 pointer-events-none border border-stone-200/50">
                    ${carpet.dimensions}
                </span>

                <!-- أزرار تحكم الأدمين في أعلى اليسار مقابل الأبعاد -->
                ${isAdmin ? `
                    <div class="absolute top-3 left-3 flex items-center gap-1.5 z-20" onclick="event.stopPropagation()">
                        <button onclick="toggleStockStatus('${carpet.id}')" class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md backdrop-blur-md flex items-center justify-center text-xs transition transform hover:scale-110 border border-stone-200/80 cursor-pointer" title="${isOutOfStock ? 'إعادة توفير المنتج' : 'تعليم كـ نفدت الكمية'}">
                            ${isOutOfStock ? '🟢' : '🔄'}
                        </button>
                        <button onclick="deleteCarpet('${carpet.id}')" class="w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white shadow-md backdrop-blur-md flex items-center justify-center text-xs transition transform hover:scale-110 cursor-pointer" title="حذف نهائي من المعرض">
                            🗑️
                        </button>
                    </div>
                ` : ''}

                ${isOutOfStock ? `
                    <div class="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
                        <span class="bg-stone-900/90 text-amber-300 border border-amber-300/30 text-xs font-bold px-4 py-2 rounded-2xl shadow-lg">
                            نفدت الكمية - تتوفر قريباً
                        </span>
                    </div>
                ` : ''}

                <div id="counter-wrapper-${carpet.id}" class="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none z-10 ${hasMultipleImages && !isOutOfStock ? '' : 'hidden'}">
                    <span id="counter-${carpet.id}">1</span> / <span id="total-${carpet.id}">${images.length}</span>
                </div>
            </div>

            <div class="p-4 md:p-5 flex flex-col justify-between bg-stone-50/60 border-t border-stone-200/50">
                <div class="mb-3">
                    <h4 class="font-bold text-stone-900 text-sm md:text-base truncate group-hover:text-brand transition">${carpet.title}</h4>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1">
                        <span class="text-base md:text-lg font-black text-brand">${carpet.price}</span>
                        <span class="text-brand text-xs font-bold">ر.ع.</span>
                    </div>
                    
                    ${isOutOfStock && !isAdmin ? `
                        <span class="bg-stone-200 text-stone-700 text-xs font-bold px-3.5 py-2 rounded-xl">غير متوفر</span>
                    ` : `
                        <button onclick="event.stopPropagation(); openModal('${carpet.id}')" class="bg-brand hover:bg-brand-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm">
                            التفاصيل
                        </button>
                    `}
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

function handleImageScrollForGrid(container, carpetId) {
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const activeIndex = Math.round(scrollLeft / width);
    
    const counterSpan = document.getElementById(`counter-${carpetId}`);
    if (counterSpan) {
        counterSpan.innerText = activeIndex + 1;
    }
}

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
    initAdminShortcut();

    const isAdmin = checkAdminPermission();
    const addCarpetBtn = document.querySelector('button[onclick="openAddModal()"]');
    if (addCarpetBtn) {
        addCarpetBtn.style.display = isAdmin ? 'flex' : 'none';
    }

    loadCarpets();
});