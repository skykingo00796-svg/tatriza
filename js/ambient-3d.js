// ==========================================================================
// دار تطريز TATRIZA - محرك الجزيئات ثلاثية الأبعاد التفاعلية (Ambient 3D Engine)
// مستوحى من تقنيات ThreeUI (ConstellationField & ParticleDrift)
// فائق الخفة والأداء (60 FPS) ويتجاوب مع حركة الماوس واللمس وألوان الثيم
// ==========================================================================

let canvas = null;
let ctx = null;
let particles = [];
let animFrameId = null;
let mouse = { x: -1000, y: -1000, radius: 120, active: false };
let isRunning = false;
let currentThemeColor = { r: 197, g: 155, b: 39 }; // ذهبي ملكي افتراضي

// فحص تفضيل المستخدم لتقليل الحركة
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class GoldenParticle {
    constructor(w, h) {
        this.reset(w, h, true);
    }

    reset(w, h, randomY = false) {
        this.x = Math.random() * w;
        this.y = randomY ? Math.random() * h : h + 10;
        // حجم الجزيء بين ذرات دقيقة ولمعان بارز
        this.size = Math.random() * 2.2 + 0.6;
        this.baseSize = this.size;
        // سرعة بطيئة تحاكي ذرات الغبار المضاء في القصور الملكية
        this.speedY = -(Math.random() * 0.45 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.baseAlpha = this.alpha;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulseVal = Math.random() * Math.PI;
        // عمق ثلاثي الأبعاد وهمي (Z-depth)
        this.z = Math.random() * 0.8 + 0.2; 
    }

    update(w, h) {
        this.pulseVal += this.pulseSpeed;
        this.alpha = this.baseAlpha + Math.sin(this.pulseVal) * 0.2;
        if (this.alpha < 0.1) this.alpha = 0.1;

        // تفاعل ناعم جداً مع الماوس أو إصبع اللمس
        if (mouse.active) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius) {
                const force = (1 - dist / mouse.radius) * 1.5;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }
        }

        this.x += this.speedX * this.z;
        this.y += this.speedY * this.z;

        // إعادة التدوير عند الخروج من الشاشة
        if (this.y < -15 || this.x < -15 || this.x > w + 15) {
            this.reset(w, h, false);
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentThemeColor.r}, ${currentThemeColor.g}, ${currentThemeColor.b}, ${this.alpha * this.z})`;
        ctx.fill();

        // هالة ضوئية ناعمة للجزيئات القريبة فقط
        if (this.z > 0.6) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.z * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${currentThemeColor.r}, ${currentThemeColor.g}, ${currentThemeColor.b}, ${this.alpha * this.z * 0.25})`;
            ctx.fill();
        }
    }
}

export function initAmbient3D(targetCanvasId = 'ambient-3d-canvas') {
    if (prefersReducedMotion) return;

    canvas = document.getElementById(targetCanvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    resizeCanvas();
    window.addEventListener('resize', debounceResize, { passive: true });

    // تفاعل الماوس واللمس
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.active = true;
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        mouse.active = false;
    }, { passive: true });

    // إيقاف المحرك عند إخفاء الصفحة لتوفير البطارية
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopEngine();
        } else {
            startEngine();
        }
    });

    createParticles();
    startEngine();
}

function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    if (ctx) ctx.scale(dpr, dpr);
}

let resizeTimeout = null;
function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        createParticles();
    }, 150);
}

function createParticles() {
    if (!canvas) return;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    
    // عدد الجزيئات يتكيف مع حجم الشاشة لضمان أداء خارق دائماً
    const count = Math.min(Math.floor((w * h) / 16000), 55);
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new GoldenParticle(w, h));
    }
}

function renderLoop() {
    if (!isRunning || !ctx || !canvas) return;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // رسم خيوط التطريز المتشابكة عندما تقترب الجزيئات من بعضها
    const pLen = particles.length;
    for (let i = 0; i < pLen; i++) {
        const p1 = particles[i];
        p1.update(w, h);
        p1.draw(ctx);

        for (let j = i + 1; j < pLen; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // خيط ذهبي رفيع إذا كانت المسافة قريبة (محاكاة نسج الخيوط)
            if (dist < 75) {
                const lineAlpha = (1 - dist / 75) * 0.18 * Math.min(p1.alpha, p2.alpha);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${currentThemeColor.r}, ${currentThemeColor.g}, ${currentThemeColor.b}, ${lineAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    animFrameId = requestAnimationFrame(renderLoop);
}

function startEngine() {
    if (isRunning) return;
    isRunning = true;
    renderLoop();
}

function stopEngine() {
    isRunning = false;
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
}

// دالة تحديث ألوان الجزيئات والخيوط بما ينسجم مع ثيم الدار النشط
export function updateAmbient3DColor(hexColor) {
    if (!hexColor) return;
    const hex = hexColor.replace('#', '');
    if (hex.length === 6) {
        currentThemeColor = {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
}
