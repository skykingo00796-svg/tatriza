// ==========================================
// محرك سحابة Google Firebase العام للزوار (firebase-public.js)
// دار التطريز TATRIZA - وضع العرض العام الآمن (Read-Only)
// ==========================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    setDoc,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ==========================================
// إعدادات وبيانات مشروع Firebase الخاص بك
// ==========================================
export const defaultFirebaseConfig = {
    apiKey: "AIzaSyBwPKBQWX9JXCEKgSFFQYex05GqaytPtY4",
    authDomain: "tatriza-official.firebaseapp.com",
    projectId: "tatriza-official",
    storageBucket: "tatriza-official.firebasestorage.app",
    messagingSenderId: "7772757703",
    appId: "1:7772757703:web:758d02cd763e0e0260a8e2"
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
        version: 2,
        marqueeItems: [
            { id: "mq-1", icon: "⚜️", title: "حياكة يدوية 100%", desc: "صوف طبيعي وحرير خالص" },
            { id: "mq-2", icon: "🚚", title: "شحن وتوصيل مؤمن", desc: "لكافة محافظات سلطنة عُمان والخليج" },
            { id: "mq-3", icon: "🎨", title: "تفصيل حصري حسب الطلب", desc: "ألوان ومقاسات وزخارف خاصة بك" },
            { id: "mq-4", icon: "💎", title: "شهادة أصالة وضمان", desc: "توثيق دقيق واعتماد لكل قطعة" },
            { id: "mq-5", icon: "🪄", title: "مرايا وسجاد جداري", desc: "تحف معلقة تزين أفخم الصالات" },
            { id: "mq-6", icon: "🎁", title: "تغليف ملكي فاخر", desc: "جاهز للإهداء في كبرى المناسبات" }
        ],
        cinemaVideos: [
            {
                id: "scene-1",
                title: "1. اختبار التصميم والأبعاد وانتقاء الصوف",
                subtitle: "🎨 الخطوة الأولى • هندسة الفكرة والألوان",
                quote: "«تبدأ الحكاية بتحويل فكرتك ومقاسات مساحتك بدقة مليمترية، مع فرز وانتقاء خيوط الصوف الطبيعي بعناية فائقة لتطابق ذوقك الرفيع بدقة متناهية.»",
                videoUrl: "",
                posterUrl: "../images/step1_design.jpg",
                caption: "تحديد المقاسات والأبعاد واختيار تدرجات الصوف المخصصة",
                stats: { hours: "دقة 100%", material: "صوف نقي", knots: "مطابقة تامة" },
                isActive: true
            },
            {
                id: "scene-2",
                title: "2. شد القماش ورسم المخطط على الفريم",
                subtitle: "📐 الخطوة الثانية • الأساس الهندسي المتين",
                quote: "«شد قماش التفتنج الأساسي على فريم خشبي محكم لضمان استواء السطح، ثم إسقاط ورسم الخطوط بدقة هندسية بالغة لضمان انسيابية العمل.»",
                videoUrl: "",
                posterUrl: "../images/step2_frame.jpg",
                caption: "تثبيت القماش على الفريم الخشبي ورسم التصميم بالمليمتر",
                stats: { hours: "+5 ساعات", material: "فريم متين", knots: "ثبات فائق" },
                isActive: false
            },
            {
                id: "scene-3",
                title: "3. التطريز بمسدس الحياكة وضخ آلاف الغرز",
                subtitle: "🔫 الخطوة الثالثة • نبض الحرفة وكثافة الصوف",
                quote: "«باستخدام مسدس التطريز الكهربائي والملاقط الحرفية، تُضخ آلاف الغرز الصوفية المتراصة بدقة متناهية لصناعة كثافة مخملية سميكة وفائقة النعومة.»",
                videoUrl: "",
                posterUrl: "../images/step3_tufting.jpg",
                caption: "حياكة يدوية متقنة بمسدس التطريز وبناء الكثافة المخملية",
                stats: { hours: "+40 ساعة", material: "صوف طبيعي", knots: "+80K غرزة" },
                isActive: false
            },
            {
                id: "scene-4",
                title: "4. طلاء الغراء الخلفي لتماسك الجذور",
                subtitle: "🛡️ الخطوة الرابعة • المتانة والصلابة الأبدية",
                quote: "«نضع طبقة سخية ومتجانسة من غراء اللاتكس المقوى على ظهر السجادة، ليتغلغل عميقاً في أصول الخيوط ويمنح السجادة تماسكاً حديدياً يعيش لأجيال.»",
                videoUrl: "",
                posterUrl: "../images/step4_glue.jpg",
                caption: "توزيع غراء اللاتكس المخصص لتماسك الخيوط مع القماش بقوة",
                stats: { hours: "+24 ساعة جفاف", material: "لاتكس مقوى", knots: "عمر مديد" },
                isActive: false
            },
            {
                id: "scene-5",
                title: "5. النحت بماكينة حلاقة الصوف (3D Carving)",
                subtitle: "✂️ الخطوة الخامسة • سحر النحت ثلاثي الأبعاد",
                quote: "«أصعب وأدق مراحل الحرفة؛ نستخدم ماكينات حلاقة الصوف التخصصية لقص الفواصل ونحت الحواف بدقة جراحية، مما يبرز التفاصيل بعمق ثلاثي الأبعاد يبهر الأنظار.»",
                videoUrl: "",
                posterUrl: "../images/step5_carving.jpg",
                caption: "نحت مجهري وحلاقة متقنة لإبراز التدرجات والبروز الفني",
                stats: { hours: "+15 ساعة نحت", material: "نحت يدوي", knots: "عمق 3D ساحر" },
                isActive: false
            },
            {
                id: "scene-6",
                title: "6. تركيب البطانة الخلفية والتنظيف والكنس",
                subtitle: "🧹 الخطوة السادسة • التشطيبات الملكية",
                quote: "«إلصاق القماش الخلفي الفاخر المانع للانزلاق بالغراء المخصص، والقيام بالتنظيف والكنس الدقيق لإبراز رونق القطعة المخملي الأنيق.»",
                videoUrl: "",
                posterUrl: "../images/step6_finishing.jpg",
                caption: "تثبيت البطانة المانعة للانزلاق وكنس وتمشيط الألياف بدقة",
                stats: { hours: "+4 ساعات", material: "قماش مانع للانزلاق", knots: "نعومة حريرية" },
                isActive: false
            },
            {
                id: "scene-7",
                title: "7. التغليف الاحترافي والتأمين للشحن الفاخر",
                subtitle: "📦 الخطوة السابعة • فخامة التسليم والأمان",
                quote: "«تغليف السجادة بأغلفة واقية وشريط الحرير وشهادة الأصالة، داخل صناديق محكمة تضمن وصول التحفة إلى باب بيتك بحالة سليمة وفاخرة.»",
                videoUrl: "",
                posterUrl: "../images/step7_packaging.jpg",
                caption: "تغليف ملكي مؤمن بالكامل لرحلة شحن آمنة حتى باب منزلك",
                stats: { hours: "شحن سريع", material: "تغليف مؤمن", knots: "ضمان 100%" },
                isActive: false
            }
        ],
        journeySteps: [
            {
                id: "step-1",
                stepNum: "01",
                title: "تجهيز التصميم وانتقاء ألوان الصوف",
                desc: "تحويل رؤيتك وأبعاد القطعة المطلوبة إلى مخطط هندسي دقيق، مع انتقاء وتطابق ألوان الصوف الطبيعي الفاخر بعناية حسب طلبك تماماً.",
                tag: "🎨 مطابقة الألوان ودقة الأبعاد",
                imgUrl: "../images/step1_design.jpg"
            },
            {
                id: "step-2",
                stepNum: "02",
                title: "شد القماش ورسم المخطط على الفريم",
                desc: "تثبيت قماش التفتنج الأساسي وشده بإحكام على فريم خشبي متين، ثم رسم التصميم بالمليمتر لضمان انسيابية وتناسق كافة الخطوط والزخارف.",
                tag: "📐 شد مشدود ورسم مليمتر فائق الدقة",
                imgUrl: "../images/step2_frame.jpg"
            },
            {
                id: "step-3",
                stepNum: "03",
                title: "تجهيز مسدس التطريز وبدء الحياكة",
                desc: "تجهيز مسدس التطريز الكهربائي والمقصات والملاقط المتخصصة، وضخ آلاف غرز الصوف المتراصة لصناعة كثافة مخملية سميكة وفائقة الدفء.",
                tag: "🔫 حياكة بمسدس التطريز وكثافة غرز فاخرة",
                imgUrl: "../images/step3_tufting.jpg"
            },
            {
                id: "step-4",
                stepNum: "04",
                title: "طلاء الغراء الخلفي لتثبيت الصوف",
                desc: "وضع طبقة متجانسة من غراء اللاتكس المقوى على الوجه الخلفي ليتغلغل في جذور الخيوط ويضمن تماسكاً حديدياً وثباتاً يدوم لعشرات السنين.",
                tag: "🛡️ تماسك حديدي ومتانة تدوم لأجيال",
                imgUrl: "../images/step4_glue.jpg"
            },
            {
                id: "step-5",
                stepNum: "05",
                title: "النحت بماكينة حلاقة الصوف (3D Carving)",
                desc: "أدق مراحل الحرفة؛ نستخدم ماكينات حلاقة وتشذيب الصوف المجهرية لفصل الألوان وحفر الحواف، مما يمنح السجادة عمقاً ثلاثي الأبعاد ساحراً.",
                tag: "✂️ صقل ثلاثي الأبعاد وبروز حواف فني",
                imgUrl: "../images/step5_carving.jpg"
            },
            {
                id: "step-6",
                stepNum: "06",
                title: "تركيب القماش الخلفي والكنس العميق",
                desc: "إلصاق البطانة الخلفية المانعة للانزلاق بأشرطة التثبيت المحبوكة، والقيام بالكنس والتمشيط الدقيق لإزالة الوبر وإبراز بريق الصوف الناعم.",
                tag: "🧹 بطانة فاخرة مانعة للانزلاق ونعومة مخملية",
                imgUrl: "../images/step6_finishing.jpg"
            },
            {
                id: "step-7",
                stepNum: "07",
                title: "التغليف الملكي والشحن المؤمّن",
                desc: "لف السجادة بأغلفة واقية عازلة مع شريط الحرير الذهبي وشهادة الأصالة، وتأمينها داخل صندوق شحن فاخر لتصلك بسلامة تامة ورونق ملكي.",
                tag: "📦 تغليف هدايا ملكي وشحن مؤمّن لباب بيتك",
                imgUrl: "../images/step7_packaging.jpg"
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
                orderType: "عميل دار التطريز الدائم",
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

// ==========================================
// تسجيل وحفظ طلب جديد للعميل في سحابة Firestore (orders collection)
// ==========================================
export async function recordCustomerOrder(orderPayload) {
    try {
        const { db, isReady } = initFirebaseServices();
        if (!isReady || !db) {
            console.warn("⚠️ Firebase not ready to record order document.");
            return { success: false, orderId: orderPayload.orderId || null };
        }

        // توليد رقم طلب فريد ومرتب (مثال: TATR-841920)
        const orderId = orderPayload.orderId || ('TATR-' + Math.floor(100000 + Math.random() * 900000));
        const now = Date.now();
        const dateFormatted = new Intl.DateTimeFormat('ar-OM', {
            dateStyle: 'full',
            timeStyle: 'short'
        }).format(new Date(now));

        const orderDoc = {
            orderId: orderId,
            type: orderPayload.type || 'cart', // 'cart' | 'custom_order' | 'product_inquiry'
            status: 'pending', // 'pending' (قيد المراجعة في الواتساب) | 'confirmed' (تم الدفع والتأكيد)
            createdAt: now,
            createdAtFormatted: dateFormatted,
            customerName: (orderPayload.customerName || 'عميل دار التطريز').trim(),
            customerPhone: (orderPayload.customerPhone || '').trim(),
            customerNotes: (orderPayload.customerNotes || '').trim(),
            items: Array.isArray(orderPayload.items) ? orderPayload.items : [],
            totalPrice: Number(orderPayload.totalPrice) || 0,
            currency: 'ر.ع.',
            confirmedAt: null,
            confirmedBy: null,
            paymentNotes: ''
        };

        const docRef = doc(db, "orders", orderId);
        await setDoc(docRef, orderDoc);
        console.log("✅ تم حفظ الطلب بنجاح في سحابة دار التطريز:", orderId);
        return { success: true, orderId: orderId, order: orderDoc };
    } catch (err) {
        console.error("❌ فشل تسجيل الطلب في سحابة Firestore:", err);
        return { success: false, orderId: orderPayload.orderId || null, error: err.message };
    }
}

