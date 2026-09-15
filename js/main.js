// ==========================================
// الملف الرئيسي ونقطة التوصيل (main.js)
// ==========================================

import { checkAdminPermission, initAdminShortcut, handleMobileAdminTap, toggleStockStatus, deleteCarpet, handleAddProduct, openAddModal, closeAddModal } from './admin.js';
import { initTheme, openThemeModal, closeThemeModal, selectThemeOption, applyTheme } from './theme.js';
import { 
    openModal, closeModal, handleModalScroll, 
    addToCart, openCartModal, closeCartModal, removeFromCart, sendCartToWhatsApp, 
    openCustomOrderModal, closeCustomOrderModal, submitCustomOrder, 
    openLightboxFromModal, openCurrentLogoLightbox, closeLightbox, handleLightboxScroll 
} from './modals.js';

let allCarpets = [];

// ربط الدوال بالـ window لتعمل عبر الأحداث المباشرة في ملفات الـ HTML
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
    displayCarpets(allCarpets);
});
window.toggleStockStatus = (id) => toggleStockStatus(id, allCarpets, (updated) => {
    allCarpets = updated;
    displayCarpets(allCarpets);
});
window.deleteCarpet = (id) => deleteCarpet(id, allCarpets, (updated) => {
    allCarpets = updated;
    displayCarpets(allCarpets);
});
window.openLightboxFromModalExternal = (id, idx) => openLightboxFromModal(id, idx, allCarpets);
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
        displayCarpets(allCarpets);
        setupFilters();
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
            <div class="col-span-full text-center py-16 text-stone-600 bg-stone-50/50 rounded-3xl border border-stone-200">
                <p class="text-lg font-semibold">لا توجد قطع مطابقة للبحث أو التصنيف الحالي</p>
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
                
                <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs z-10 pointer-events-none">
                    ${carpet.dimensions}
                </span>

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
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-bold text-stone-900 text-sm md:text-base truncate group-hover:text-brand transition flex-1">${carpet.title}</h4>
                    
                    ${isAdmin ? `
                        <div class="flex items-center gap-1 mr-2" onclick="event.stopPropagation()">
                            <button onclick="toggleStockStatus('${carpet.id}')" class="p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-xs transition" title="${isOutOfStock ? 'إعادة توفير المنتج' : 'تعليم كـ نفدت الكمية'}">
                                🔄
                            </button>
                            <button onclick="deleteCarpet('${carpet.id}')" class="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs transition" title="حذف نهائي">
                                🗑️
                            </button>
                        </div>
                    ` : ''}
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1">
                        <span class="text-base md:text-lg font-black text-brand">${carpet.price}</span>
                        <span class="text-brand text-xs font-bold">ر.ع.</span>
                    </div>
                    
                    ${isOutOfStock && !isAdmin ? `
                        <span class="bg-stone-200 text-stone-700 text-xs font-bold px-3.5 py-2 rounded-xl">غير متوفر</span>
                    ` : `
                        <!-- تم تصحيح استدعاء زر التفاصيل ليعمل بكفاءة عبر window.openModal -->
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

// فلاتر التصنيفات مع تصحيح الألوان الديناميكية للثيمات وحالة الأزرار النشطة
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            buttons.forEach(btn => {
                btn.classList.remove('bg-brand', 'text-white', 'shadow-xs');
                btn.classList.add('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]');
            });
            
            const activeBtn = e.currentTarget;
            activeBtn.classList.remove('bg-[#fffbf7]', 'text-stone-700', 'border', 'border-stone-300', 'hover:bg-[#ebe1d3]');
            activeBtn.classList.add('bg-brand', 'text-white', 'shadow-xs');

            const filter = activeBtn.getAttribute('data-filter');
            if (filter === 'all') {
                displayCarpets(allCarpets);
            } else {
                const filtered = allCarpets.filter(c => c.category === filter);
                displayCarpets(filtered);
            }
        });
    });
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