// ==========================================
// محرك سحابة Google Firebase العام للزوار (firebase-public.js)
// دار تطريز TATRIZA - وضع العرض العام الآمن (Read-Only)
// ==========================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// إعدادات وبيانات مشروع Firebase الخاص بك
// ==========================================
export const defaultFirebaseConfig = {
    apiKey: "AIzaSyCKxYambmNaovoKKmAjsh7Myu7V1ojI25o",
    authDomain: "tatriza-store.firebaseapp.com",
    projectId: "tatriza-store",
    storageBucket: "tatriza-store.firebasestorage.app",
    messagingSenderId: "713788035615",
    appId: "1:713788035615:web:b81a2460fe4bfc0cd27b2a"
};

export function getActiveFirebaseConfig() {
    try {
        const stored = localStorage.getItem('tatr_firebase_config');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.apiKey && !parsed.apiKey.includes('YOUR_API_KEY')) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not read stored Firebase config:", e);
    }
    return defaultFirebaseConfig;
}

export function isFirebaseConfigured() {
    const config = getActiveFirebaseConfig();
    return Boolean(config.apiKey && !config.apiKey.includes('YOUR_API_KEY') && config.projectId && !config.projectId.includes('YOUR_PROJECT'));
}

// تهيئة تطبيق Firebase لقراءة البيانات وعرضها للزوار فقط
let app = null;
let db = null;

export function initFirebaseServices() {
    if (!isFirebaseConfigured()) {
        return { app: null, db: null, isReady: false };
    }

    try {
        const config = getActiveFirebaseConfig();
        if (!getApps().length) {
            app = initializeApp(config);
        } else {
            app = getApps()[0];
        }
        db = getFirestore(app);
        return { app, db, isReady: true };
    } catch (error) {
        console.error("Firebase public initialization failed:", error);
        return { app: null, db: null, isReady: false };
    }
}

// ==========================================
// قراءة الفيديوهات المخزنة محلياً عبر IndexedDB
// ==========================================
export function getVideoFromIndexedDB(carpetId) {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open('TatrizaMediaDB', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('videos')) {
                    db.createObjectStore('videos', { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('videos')) {
                    resolve(null);
                    return;
                }
                const tx = db.transaction('videos', 'readonly');
                const store = tx.objectStore('videos');
                const cleanId = String(carpetId).replace(/^idb:\/\/video_/, '');
                const getReq = store.get(cleanId);
                getReq.onsuccess = () => {
                    if (getReq.result && getReq.result.file) {
                        resolve(URL.createObjectURL(getReq.result.file));
                    } else {
                        resolve(null);
                    }
                };
                getReq.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        } catch (err) {
            resolve(null);
        }
    });
}

export function getAllStoredVideoIds() {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open('TatrizaMediaDB', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('videos')) {
                    db.createObjectStore('videos', { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('videos')) {
                    resolve(new Set());
                    return;
                }
                const tx = db.transaction('videos', 'readonly');
                const store = tx.objectStore('videos');
                const keysReq = store.getAllKeys();
                keysReq.onsuccess = () => resolve(new Set(keysReq.result || []));
                keysReq.onerror = () => resolve(new Set());
            };
            request.onerror = () => resolve(new Set());
        } catch (err) {
            resolve(new Set());
        }
    });
}

// ==========================================
// قراءة وتزامن معروضات السجاد للزوار (Real-time Live Sync)
// ==========================================
export function subscribeToCarpets(onSuccess, onError) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        if (onError) onError(new Error("Firebase is not configured yet."));
        return () => {};
    }

    try {
        const carpetsCol = collection(db, "carpets");
        
        const deliverCarpets = (list) => {
            getAllStoredVideoIds().then(localVideoIds => {
                if (localVideoIds && localVideoIds.size > 0) {
                    list.forEach(c => {
                        if (!c.video && localVideoIds.has(c.id)) {
                            c.video = `idb://video_${c.id}`;
                        }
                    });
                }
                onSuccess(list);
            }).catch(() => onSuccess(list));
        };

        return onSnapshot(carpetsCol, (snapshot) => {
            const carpets = [];
            snapshot.forEach((docSnap) => {
                carpets.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            deliverCarpets(carpets);
        }, (error) => {
            console.warn("Real-time public sync fallback:", error);
            getDocs(carpetsCol).then((snapshot) => {
                const carpets = [];
                snapshot.forEach((docSnap) => {
                    carpets.push({
                        id: docSnap.id,
                        ...docSnap.data()
                    });
                });
                deliverCarpets(carpets);
            }).catch((err) => {
                if (onError) onError(err);
            });
        });
    } catch (e) {
        if (onError) onError(e);
        return () => {};
    }
}

// ==========================================
// قراءة وتزامن التصنيفات للزوار
// ==========================================
export function subscribeToCategories(onSuccess, onError) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        if (onError) onError(new Error("Firebase is not configured yet."));
        return () => {};
    }

    try {
        const categoriesCol = collection(db, "categories");
        return onSnapshot(categoriesCol, (snapshot) => {
            const categories = [];
            snapshot.forEach((docSnap) => {
                categories.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            categories.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            onSuccess(categories);
        }, (err) => {
            console.warn("Firestore categories snapshot error, trying fallback fetch:", err);
            getDocs(categoriesCol).then((fallbackSnap) => {
                const categories = [];
                fallbackSnap.forEach((docSnap) => {
                    categories.push({ id: docSnap.id, ...docSnap.data() });
                });
                categories.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
                onSuccess(categories);
            }).catch((fallbackErr) => {
                if (onError) onError(fallbackErr);
            });
        });
    } catch (e) {
        if (onError) onError(e);
        return () => {};
    }
}

export function subscribeToCategorySettings(onSuccess) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return () => {};
    try {
        const settingsRef = doc(db, "settings", "categories");
        return onSnapshot(settingsRef, (snap) => {
            if (snap.exists()) {
                onSuccess(snap.data());
            }
        }, (err) => console.warn("Category settings sync error:", err));
    } catch (e) {
        return () => {};
    }
}

// ==========================================
// قراءة وتحديث الأقسام الترويجية للمتجر (Showcase CMS)
// ==========================================
export function getDefaultShowcaseSettings() {
    return {
        marqueeItems: [
            { id: "mq-1", icon: "⚜️", title: "حياكة يدوية 100%", desc: "صوف طبيعي وحرير خالص" },
            { id: "mq-2", icon: "🚚", title: "شحن وتوصيل مؤمن", desc: "لكافة محافظات سلطنة عُمان والخليج" },
            { id: "mq-3", icon: "🎨", title: "تفصيل حصري على الطلب", desc: "ألوان ومقاسات وزخارف خاصة بك" },
            { id: "mq-4", icon: "💎", title: "شهادة أصالة وضمان", desc: "توثيق دقيق واعتماد لكل قطعة" },
            { id: "mq-5", icon: "🪄", title: "مرايا وسجاد جداري", desc: "تحف معلقة تزين أفخم الصالات" },
            { id: "mq-6", icon: "🎁", title: "تغليف ملكي فاخر", desc: "جاهز للإهداء في كبرى المناسبات" }
        ],
        cinemaVideos: [
            {
                id: "vid-1",
                title: "حكاية كل خيط تحفة.. وصبر يصنع الفخامة",
                subtitle: "✨ أصالة المشغل اليدوي",
                quote: "«كل سجادة تخرج من دار تطريز ليست مجرد غطاء للأرضية، بل لوحة فنية عريقة استغرقت مئات الساعات من الدقة والشغف لتمنح مساحتك روحاً دافئة ومتميزة لا تتكرر في أي مكان آخر.»",
                videoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/Weaving_Carpet_at_Lachen.webm",
                posterUrl: "../images/craft_video_poster.jpg",
                caption: "توثيق حي لحركات الأنامل وشد الغرز اليدوية على الأنوال التقليدية",
                stats: { hours: "+500", material: "100%", knots: "120K" },
                isActive: true
            }
        ],
        journeySteps: [
            {
                id: "step-1",
                stepNum: "01",
                title: "الرسم والتخطيط الرقمي",
                desc: "تحويل رؤيتك الخاصة أو الزخارف التراثية إلى مخطط خيوط دقيق يحدد درجات الألوان وتوزيع العُقد وسماكة الحياكة.",
                tag: "📐 دقة هندسية ومطابقة تامة",
                imgUrl: "../images/step1_sketch.jpg"
            },
            {
                id: "step-2",
                stepNum: "02",
                title: "انتقاء الخامات الطبيعية",
                desc: "غزل يدوي لأجود أنواع الصوف الطبيعي 100% وخيوط الحرير المختارة بعناية بأصباغ نباتية ثابتة لبريق يدوم لأجيال.",
                tag: "🧶 صوف طبيعي وحرير نقي",
                imgUrl: "../images/step2_materials.jpg"
            },
            {
                id: "step-3",
                stepNum: "03",
                title: "الحياكة والعقد اليدوي",
                desc: "شد الخيوط آلاف المرات بإبر الغزل اليدوي على أنوال مخصصة، لبناء طبقة صوفية كثيفة وثقيلة تمنح دفئاً وفخامة حقيقية.",
                tag: "🪡 مئات الساعات من الصبر",
                imgUrl: "../images/step3_weaving.jpg"
            },
            {
                id: "step-4",
                stepNum: "04",
                title: "الصقل والتشطيب الملكي",
                desc: "حلاقة دقيقة ونحت الحواف بالمقصات المنحنية لإبراز الأبعاد ثلاثية الأبعاد، وتثبيت المرايا والفحص النهائي لشهادة الأصالة.",
                tag: "✨ بروز ثلاثي الأبعاد وشهادة جودة",
                imgUrl: "../images/step4_finishing.jpg"
            }
        ],
        lookbookItems: [
            {
                id: "look-1",
                clientName: "م. ريم البلوشية",
                location: "فيلا عصرية • مسقط",
                carpetTitle: "سجاد مرايا جداري متموج",
                orderType: "طلب تفصيل خاص",
                rating: 5,
                reviewText: "القطعة تفوق كل التوقعات! ملمس الصوف المخملي مع تموجات الإطار وانعكاس المرآة جعل مدخل المنزل يبدو وكأنه متحف فني معاصر. حرفية متقنة ترفع الرأس.",
                imgUrl: "../images/client_room1.jpg"
            },
            {
                id: "look-2",
                clientName: "الشيخ أحمد الحوسني",
                location: "مجلس ضيافة رسمي • صحار",
                carpetTitle: "سجادة عجمية ملكية كبرى",
                orderType: "عميل دار تطريز الدائم",
                rating: 5,
                reviewText: "طلبنا سجادة بمقاس 4 × 3 متر لتتوسط المجلس الرئيسي، كثافة الصوف وثبات الألوان أضفت هيبة تاريخية ودفئاً استثنائياً للمكان. شكراً لاهتمامكم بأدق التفاصيل.",
                imgUrl: "../images/client_room2.jpg"
            }
        ]
    };
}

export function subscribeToShowcaseSettings(onSuccess) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return () => {};
    try {
        const settingsRef = doc(db, "settings", "showcase");
        return onSnapshot(settingsRef, (snap) => {
            if (snap.exists()) {
                onSuccess(snap.data());
            }
        }, (err) => console.warn("Showcase settings sync error:", err));
    } catch (e) {
        return () => {};
    }
}


// ==========================================
// دوال التنسيق المساعدة
// ==========================================
export function formatReadableDate(timestamp) {
    if (!timestamp) return '';
    try {
        const d = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
        return d.toLocaleDateString('ar-OM', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return '';
    }
}
