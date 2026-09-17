import { updateAmbient3DColor } from './ambient-3d.js';
// ==========================================
// ملف إدارة الثيمات والهوية البصرية (theme.js)
// ==========================================

let pendingTheme = 'burgundy';
let pendingLogo = '../images/logo.jpg';

export function openThemeModal() {
    const currentTheme = localStorage.getItem('tatr_theme') || 'burgundy';
    const currentLogo = localStorage.getItem('tatr_logo') || '../images/logo.jpg';
    
    pendingTheme = currentTheme;
    pendingLogo = currentLogo;
    
    document.querySelectorAll('.theme-box').forEach(box => {
        if (box.getAttribute('data-theme') === currentTheme) {
            box.classList.add('active-theme');
            box.style.borderColor = 'var(--brand-color)';
        } else {
            box.classList.remove('active-theme');
            box.style.borderColor = 'rgba(220, 210, 198, 0.75)';
        }
    });

    const modal = document.getElementById('theme-modal');
    if (modal) modal.classList.remove('hidden');
}

export function closeThemeModal() {
    const modal = document.getElementById('theme-modal');
    if (modal) modal.classList.add('hidden');
}

export function selectThemeOption(themeName, logoSrc) {
    pendingTheme = themeName;
    pendingLogo = logoSrc;
    
    document.querySelectorAll('.theme-box').forEach(box => {
        if (box.getAttribute('data-theme') === themeName) {
            box.classList.add('active-theme');
            box.style.borderColor = 'var(--brand-color)';
        } else {
            box.classList.remove('active-theme');
            box.style.borderColor = 'rgba(220, 210, 198, 0.75)';
        }
    });
}

export function applyTheme() {
    document.documentElement.className = `theme-${pendingTheme}`;
    document.body.className = `theme-${pendingTheme}`;
    localStorage.setItem('tatr_theme', pendingTheme);
    localStorage.setItem('tatr_logo', pendingLogo);

    // تحديث نمط الألوان الفوري
    const injected = document.getElementById('early-theme-inject');
    const palette = {
        burgundy: { color: '#7c1d3c', hover: '#631730', border: '#96264a' },
        green:    { color: '#435838', hover: '#33432a', border: '#56714a' },
        blue:     { color: '#2d5f75', hover: '#204557', border: '#3d7a96' },
        gold:     { color: '#c59b27', hover: '#9e771c', border: '#d6af3d' }
    };
    const active = palette[pendingTheme] || palette.burgundy;
    if (injected) {
        injected.textContent = `:root, html, body { --brand-color: ${active.color} !important; --brand-hover: ${active.hover} !important; --brand-border: ${active.border} !important; }`;
    }

    // تحديث لون الجزيئات ثلاثية الأبعاد في الخلفية ليتطابق مع الثيم
    try {
        updateAmbient3DColor(active.color);
    } catch(e) {}

    document.querySelectorAll('img[alt="Tatriza Logo"]').forEach(img => {
        img.src = pendingLogo;
    });

    document.querySelectorAll('.theme-bg-logo').forEach(el => {
        el.style.backgroundImage = `url('${pendingLogo}')`;
    });

    closeThemeModal();
}

export function initTheme() {
    const savedTheme = localStorage.getItem('tatr_theme') || 'burgundy';
    const savedLogo = localStorage.getItem('tatr_logo') || '../images/logo.jpg';
    
    document.documentElement.className = `theme-${savedTheme}`;
    document.body.className = `theme-${savedTheme}`;
    
    document.querySelectorAll('img[alt="Tatriza Logo"]').forEach(img => {
        img.src = savedLogo;
    });

    document.querySelectorAll('.theme-bg-logo').forEach(el => {
        el.style.backgroundImage = `url('${savedLogo}')`;
    });

    const palette = {
        burgundy: '#7c1d3c',
        green: '#435838',
        blue: '#2d5f75',
        gold: '#c59b27'
    };
    try {
        updateAmbient3DColor(palette[savedTheme] || '#c59b27');
    } catch(e) {}
}