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
            box.style.borderColor = 'var(--brand-color)';
            box.style.backgroundColor = '#f5efe6';
        } else {
            box.style.borderColor = 'transparent';
            box.style.backgroundColor = '#f9f9f9';
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
            box.style.borderColor = 'var(--brand-color)';
            box.style.backgroundColor = '#f5efe6';
        } else {
            box.style.borderColor = 'transparent';
            box.style.backgroundColor = '#f9f9f9';
        }
    });
}

export function applyTheme() {
    document.body.className = `theme-${pendingTheme}`;
    localStorage.setItem('tatr_theme', pendingTheme);
    localStorage.setItem('tatr_logo', pendingLogo);

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
    
    document.body.className = `theme-${savedTheme}`;
    
    document.querySelectorAll('img[alt="Tatriza Logo"]').forEach(img => {
        img.src = savedLogo;
    });

    document.querySelectorAll('.theme-bg-logo').forEach(el => {
        el.style.backgroundImage = `url('${savedLogo}')`;
    });
}