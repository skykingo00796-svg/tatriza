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
