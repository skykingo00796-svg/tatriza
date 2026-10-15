// ==========================================
// ملف تكامل سحابة Google Firebase (firebase.js)
// دار التطريز TATRIZA
// ==========================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ==========================================
// إعدادات وبيانات مشروع Firebase الخاص بك
// يمكنك استبدال هذه القيم بالقيم الخاصة بمشروعك في Firebase Console
// أو حفظها مباشرة من لوحة الإدارة داخل الموقع
// ==========================================
export const defaultFirebaseConfig = {
    apiKey: "AIzaSyBwPKBQWX9JXCEKgSFFQYex05GqaytPtY4",
    authDomain: "tatriza-official.firebaseapp.com",
    projectId: "tatriza-official",
    storageBucket: "tatriza-official.firebasestorage.app",
    messagingSenderId: "7772757703",
    appId: "1:7772757703:web:758d02cd763e0e0260a8e2"
};

// قراءة الإعدادات من التخزين المحلي إن وُجدت، أو استخدام الافتراضية
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

export function saveFirebaseConfig(configObj) {
    localStorage.setItem('tatr_firebase_config', JSON.stringify(configObj));
}

export function isFirebaseConfigured() {
    const config = getActiveFirebaseConfig();
    return Boolean(config.apiKey && !config.apiKey.includes('YOUR_API_KEY') && config.projectId && !config.projectId.includes('YOUR_PROJECT'));
}

// تهيئة تطبيق Firebase وقواعد البيانات والمصادقة الآمنة
let app = null;
let db = null;
let storage = null;
let auth = null;
let cachedAuthUser = null;

export function initFirebaseServices() {
    if (!isFirebaseConfigured()) {
        return { app: null, db: null, storage: null, auth: null, isReady: false };
    }

    try {
        const config = getActiveFirebaseConfig();
        if (!getApps().length) {
            app = initializeApp(config);
        } else {
            app = getApps()[0];
        }
        db = getFirestore(app);
        if (!auth) {
            try {
                auth = getAuth(app);
                onAuthStateChanged(auth, (user) => {
                    cachedAuthUser = user;
                });
            } catch (authInitErr) {
                console.warn("Auth initialization error:", authInitErr);
                auth = null;
            }
        }
        try {
            storage = config.storageBucket ? getStorage(app) : null;
        } catch (storageInitErr) {
            console.warn("Storage not initialized (using 100% Free Firestore mode):", storageInitErr);
            storage = null;
        }
        return { app, db, storage, auth, isReady: true };
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        return { app: null, db: null, storage: null, auth: null, isReady: false };
    }
}

// ==========================================
// نظام المصادقة السحابي المعتمد للأدمن (Firebase Authentication Engine)
// حماية سيبرانية مشفرة بالكامل - لا توجد أي كلمات مرور في الكود إطلاقاً
// ==========================================

export async function adminLoginWithCloud(email, password) {
    const { auth, isReady } = initFirebaseServices();
    if (!isReady || !auth) {
        throw new Error("سحابة Firebase غير مهيأة بعد بمفاتيح مشروعك.");
    }
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
}

export async function adminLogoutFromCloud() {
    const { auth } = initFirebaseServices();
    if (!auth) return;
    await signOut(auth);
}

export const signInWithEmail = adminLoginWithCloud;
export const handleSignOut = adminLogoutFromCloud;

export function subscribeToAdminAuth(callback) {
    const { auth, isReady } = initFirebaseServices();
    if (!isReady || !auth) {
        if (callback) callback(null);
        return () => {};
    }
    return onAuthStateChanged(auth, (user) => {
        cachedAuthUser = user;
        if (callback) callback(user);
    });
}

export function getCurrentAdminUser() {
    const { auth } = initFirebaseServices();
    if (cachedAuthUser) return cachedAuthUser;
    return auth ? auth.currentUser : null;
}

// تحويل الملف إلى Base64 فائق السرعة
export function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
    });
}

// ==========================================
// محرك ضغط الصور الذكي (Image Compression Engine)
// يقوم بتصغير الصور العالية جداً (10MB -> ~150-200KB)
// داخل المتصفح قبل الرفع للحفاظ التام على المساحة وسرعة التحميل
// ==========================================
export async function compressImage(file, maxWidth = 1400, maxHeight = 1400, quality = 0.80) {
    return new Promise((resolve) => {
        if (!file || !file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // الحفاظ على الشفافية إذا كانت الصورة مفرغة (PNG أو WebP) لتفادي تحول الخلفية إلى أسود نهائياً
                const isTransparentFormat = file.type === 'image/png' || file.type === 'image/webp';
                const outputType = isTransparentFormat ? 'image/webp' : 'image/jpeg';
                const outputExt = isTransparentFormat ? '.webp' : '.jpg';

                // إذا كانت الصورة بصيغة JPEG ولا تدعم الشفافية، نملأ الخلفية بلون عاجي فاتح دافئ بدل الأسود
                if (!isTransparentFormat) {
                    ctx.fillStyle = '#fffbf7';
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, outputExt), {
                            type: outputType,
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(file);
                    }
                }, outputType, quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
}

// ==========================================
// دوال رفع وتخزين الصور السحابية مع بديل فوري وآمن
// ==========================================

let _storageBucketReadyCache = null;

// التحقق السريع من جاهزية وتفعيل Cloud Storage (بدون أي تعليق أو تأخير)
export async function isStorageBucketReady() {
    if (_storageBucketReadyCache !== null) return _storageBucketReadyCache;
    try {
        const config = getActiveFirebaseConfig();
        const bucket = config.storageBucket || `${config.projectId}.firebasestorage.app`;
        // فحص سريع لحاوية التخزين السحابي - يستغرق أقل من 100ms
        const res = await fetch(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o`, { method: 'GET' });
        // إذا كان الرد 404، فالحاوية لم يتم النقر على تفعيلها بعد في كونسول فايربيس
        _storageBucketReadyCache = (res.status !== 404);
        return _storageBucketReadyCache;
    } catch (e) {
        _storageBucketReadyCache = false;
        return false;
    }
}

export async function uploadCarpetImages(carpetId, files, onProgress) {
    const { storage, isReady } = initFirebaseServices();
    if (!files || files.length === 0) {
        return [];
    }

    const hasStorage = isReady && storage ? await isStorageBucketReady() : false;
    const downloadUrls = [];

    for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        if (onProgress) onProgress(`جاري ضغط وتحسين جودة الصورة (${i + 1} من ${files.length})...`);
        
        // ضغط فائق الجودة والسرعة (~80-120KB) لتوفير سعة Firestore المجانية
        const compressed = await compressImage(rawFile, 1200, 1200, 0.76);
        let uploadedUrl = null;

        if (hasStorage && storage) {
            try {
                const fileExt = compressed.name.split('.').pop() || 'jpg';
                const fileName = `${Date.now()}_img_${i + 1}.${fileExt}`;
                const storageRef = ref(storage, `carpets/${carpetId}/${fileName}`);
                const snapshot = await uploadBytes(storageRef, compressed, {
                    contentType: 'image/jpeg'
                });
                uploadedUrl = await getDownloadURL(snapshot.ref);
            } catch (storageErr) {
                console.warn('Storage image upload error, using local base64:', storageErr);
            }
        }

        if (uploadedUrl) {
            downloadUrls.push(uploadedUrl);
        } else {
            if (onProgress) onProgress(`جاري معالجة الصورة (${i + 1} من ${files.length})...`);
            const base64 = await fileToBase64(compressed);
            if (base64) downloadUrls.push(base64);
        }
    }

    return downloadUrls;
}

// ==========================================
// إدارة تخزين الفيديو محلياً عبر IndexedDB لتفادي سقف 1MB في Firestore
// ==========================================
export function saveVideoToIndexedDB(carpetId, videoFile) {
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
                const tx = db.transaction('videos', 'readwrite');
                const store = tx.objectStore('videos');
                const cleanId = String(carpetId).replace(/^idb:\/\/video_/, '');
                store.put({
                    id: cleanId,
                    file: videoFile,
                    type: videoFile.type || 'video/mp4',
                    timestamp: Date.now()
                });
                tx.oncomplete = () => {
                    resolve(`idb://video_${cleanId}`);
                };
                tx.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        } catch (err) {
            resolve(null);
        }
    });
}

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
                        const blobUrl = URL.createObjectURL(getReq.result.file);
                        resolve(blobUrl);
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
// رفع الفيديو الاستعراضي للسجادة إلى Cloud Storage أو حفظه الآمن
// ==========================================
export async function uploadCarpetVideo(carpetId, videoFile, onProgress) {
    if (!videoFile) return null;

    const { storage, isReady } = initFirebaseServices();
    if (onProgress) onProgress('جاري فحص نظام التخزين السحابي...');

    const hasStorage = isReady && storage ? await isStorageBucketReady() : false;

    if (hasStorage && storage) {
        try {
            if (onProgress) onProgress('جاري بدء رفع الفيديو إلى سحابة Google Cloud...');
            const fileExt = videoFile.name.split('.').pop() || 'mp4';
            const fileName = `video_${Date.now()}.${fileExt}`;
            const storageRef = ref(storage, `carpets/${carpetId}/${fileName}`);
            
            const uploadTask = uploadBytesResumable(storageRef, videoFile, {
                contentType: videoFile.type || 'video/mp4'
            });

            let lastPercent = -1;
            const downloadUrl = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        if (progress !== lastPercent && (progress % 4 === 0 || progress === 100 || progress <= 4)) {
                            lastPercent = progress;
                            if (onProgress) onProgress(`جاري رفع الفيديو السحابي: ${progress}%...`);
                        }
                    },
                    (error) => reject(error),
                    async () => {
                        try {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        } catch (err) {
                            reject(err);
                        }
                    }
                );
            });

            if (downloadUrl) return downloadUrl;
        } catch (e) {
            console.warn('Storage upload error:', e);
        }
    }

    // تنبيه حاسم: وثيقة Cloud Firestore ترفض أي حجم أكبر من 1MB!
    // لا نقوم إطلاقاً بإرسال ملف فيديو بحجم عدة ميجابايت إلى Firestore لتفادي تعليق وانهيار الحفظ
    // بدلاً من ذلك، نحفظ الفيديو محلياً عبر IndexedDB بدون قيود حجم وبأقصى سرعة
    if (onProgress) onProgress('جاري حفظ الفيديو في التخزين الآمن فائق السرعة...');
    return await saveVideoToIndexedDB(carpetId, videoFile);
}

// دوال إدارة منتجات السجاد في Cloud Firestore
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
            // ترتيب تلقائي حسب تاريخ الإنشاء لظهور الأحدث أولاً
            carpets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            deliverCarpets(carpets);
        }, (err) => {
            console.warn("Firestore snapshot error, trying simple fetch:", err);
            getDocs(carpetsCol).then((fallbackSnap) => {
                const carpets = [];
                fallbackSnap.forEach((docSnap) => {
                    carpets.push({ id: docSnap.id, ...docSnap.data() });
                });
                carpets.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                deliverCarpets(carpets);
            }).catch((fallbackErr) => {
                if (onError) onError(fallbackErr);
            });
        });
    } catch (e) {
        if (onError) onError(e);
        return () => {};
    }
}

// ==========================================
// تنسيق التواريخ بشكل مقروء وواضح داخل السحابة (Formatted Readable Dates)
// ==========================================
export function formatReadableDate(timestamp = Date.now()) {
    if (!timestamp || timestamp === 0) return '';
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        
        return `${year}-${month}-${day} | ${formattedTime}`;
    } catch (e) {
        return '';
    }
}

export async function saveCarpetToCloud(carpetData, imageFiles, onProgress) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        throw new Error("سحابة Firebase غير مهيأة بعد بمفاتيح مشروعك.");
    }

    const carpetId = carpetData.id || `TATR-${Date.now()}`;
    let uploadedUrls = [];

    if (imageFiles && imageFiles.length > 0) {
        uploadedUrls = await uploadCarpetImages(carpetId, imageFiles, onProgress);
    }

    if (uploadedUrls.length === 0 && (!carpetData.images || carpetData.images.length === 0)) {
        uploadedUrls = [carpetData.image || 'https://placehold.co/800x600/7c1d3c/ffffff?text=Tatriza'];
    }

    const now = Date.now();
    const readableCreated = carpetData.createdDate || formatReadableDate(carpetData.createdAt || now);
    const readableUpdated = carpetData.updatedDate || formatReadableDate(carpetData.updatedAt || now);

    // حماية سحابية: نمنع إرسال سلاسل Base64 الضخمة داخل وثيقة Firestore تجنباً لتجاوز حد 1MB
    let cloudVideoValue = carpetData.video || null;
    if (cloudVideoValue && (cloudVideoValue.startsWith('idb://') || cloudVideoValue.length > 300000)) {
        cloudVideoValue = null; // نرسل null في السحابة إن لم يكن رابطاً سحابياً حقيقياً (https://)
    }

    const docPayload = {
        id: carpetId,
        itemNumber: carpetData.itemNumber || 1,
        title: carpetData.title,
        price: Number(carpetData.price),
        category: carpetData.category || 'traditional',
        dimensions: carpetData.dimensions || '200 × 300 سم',
        material: carpetData.material || 'صوف طبيعي',
        description: carpetData.description || '',
        status: carpetData.status || 'available',
        image: uploadedUrls[0] || carpetData.image || '',
        images: uploadedUrls.length > 0 ? uploadedUrls : (carpetData.images || [carpetData.image]),
        video: cloudVideoValue,
        videoDuration: carpetData.videoDuration || null,
        createdAt: carpetData.createdAt || now,
        createdDate: readableCreated,
        updatedAt: carpetData.updatedAt || now,
        updatedDate: readableUpdated
    };

    if (onProgress) onProgress("جاري حفظ بيانات السجادة في قاعدة البيانات السحابية...");

    const carpetRef = doc(db, "carpets", carpetId);
    await setDoc(carpetRef, docPayload, { merge: true });

    // إعادة الكائن مع الفيديو المحلي الأصلي ليعمل مباشرة في المتصفح
    return { id: carpetId, ...docPayload, video: carpetData.video };
}

export async function updateCarpetStatusInCloud(carpetId, newStatus) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        throw new Error("Firebase is not ready.");
    }

    const now = Date.now();
    const carpetRef = doc(db, "carpets", carpetId);
    await setDoc(carpetRef, {
        status: newStatus,
        updatedAt: now,
        updatedDate: formatReadableDate(now)
    }, { merge: true });
}

export async function updateCarpetImagesInCloud(carpetId, newImagesList, primaryImage) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        throw new Error("سحابة Firebase غير مهيأة بعد بمفاتيح مشروعك.");
    }

    const now = Date.now();
    const carpetRef = doc(db, "carpets", carpetId);
    await setDoc(carpetRef, {
        image: primaryImage || newImagesList[0],
        images: newImagesList,
        updatedAt: now,
        updatedDate: formatReadableDate(now)
    }, { merge: true });
}

export async function updateCarpetInCloud(carpetId, updatedFields) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        throw new Error("سحابة Firebase غير مهيأة بعد بمفاتيح مشروعك.");
    }

    const now = Date.now();
    const carpetRef = doc(db, "carpets", carpetId);
    const payload = {
        ...updatedFields,
        updatedAt: now,
        updatedDate: formatReadableDate(now)
    };
    // حماية وثيقة Firestore من تجاوز حد 1MB
    if (payload.video && (payload.video.startsWith('idb://') || payload.video.length > 300000)) {
        payload.video = null;
    }
    await setDoc(carpetRef, payload, { merge: true });
    return payload;
}

export async function deleteCarpetFromCloud(carpetId) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        throw new Error("Firebase is not ready.");
    }

    const carpetRef = doc(db, "carpets", carpetId);
    await deleteDoc(carpetRef);
}

export function exportCarpetsBackup(carpetsList) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(carpetsList, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tatriza_carpets_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// ==========================================
// دوال إدارة ومزامنة التصنيفات في سحابة Cloud Firestore
// دار التطريز TATRIZA
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

export async function saveCategoryToCloud(catObj) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return;
    try {
        const catRef = doc(db, "categories", catObj.id);
        await setDoc(catRef, {
            ...catObj,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (e) {
        console.warn("Could not save category to Firestore:", e);
    }
}

export async function deleteCategoryFromCloud(catId) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return;
    try {
        const catRef = doc(db, "categories", catId);
        await deleteDoc(catRef);
    } catch (e) {
        console.warn("Could not delete category from Firestore:", e);
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

export async function saveCategorySettingsToCloud(settingsObj) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return;
    try {
        const settingsRef = doc(db, "settings", "categories");
        await setDoc(settingsRef, {
            ...settingsObj,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (e) {
        console.warn("Could not save category settings to Firestore:", e);
    }
}

// ==========================================
// إدارة إعدادات وتخصيص البنرات الترويجية سحابياً (Showcase CMS)
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
                title: "1. اختبار التصميم وتناغم ألوان الصوف",
                subtitle: "🎨 الخطوة الأولى • دقة الأبعاد وانتقاء الخامات",
                quote: "«تبدأ كل قطعة بدراسة الأبعاد بدقة هندسية، ومطابقة درجات خيوط الصوف الفاخرة لتجسد طلب الزبون وذوقه الخاص بحذافيره.»",
                videoUrl: "",
                posterUrl: "../images/step1_design.jpg",
                caption: "تحديد المقاسات وتنسيق ألوان الصوف الطبيعي بعناية تامة",
                stats: { hours: "+3 ساعات", material: "صوف 100%", knots: "مطابقة تامة" },
                isActive: true
            },
            {
                id: "scene-2",
                title: "2. شد القماش ورسم المخطط على الفريم",
                subtitle: "📐 الخطوة الثانية • الشد الهندسي المتين",
                quote: "«نثبت قماش التفتنج الأساسي ونشده بقوة على الفريم الخشبي، ثم ننقل التصميم بأبعاده الدقيقة لنضمن انسيابية كل تفصيلة.»",
                videoUrl: "",
                posterUrl: "../images/step2_frame.jpg",
                caption: "رسم حدود الزخارف بالمليمتر على فريم الحياكة القماشي",
                stats: { hours: "+5 ساعات", material: "فريم خشبي", knots: "دقة 100%" },
                isActive: false
            },
            {
                id: "scene-3",
                title: "3. الحياكة المكثفة بمسدس التطريز اليدوي",
                subtitle: "🔫 الخطوة الثالثة • انطلاق مسدس التطريز",
                quote: "«تجهيز مسدس التطريز وأدوات القص والملاقط، وبدء ضخ آلاف غرز الصوف المتراصة لبناء ملمس مخملي سميك وعالي الكثافة.»",
                videoUrl: "",
                posterUrl: "../images/step3_tufting.jpg",
                caption: "ضخ غرز الصوف المتراصة بحرفية وسرعة فائقة الإتقان",
                stats: { hours: "+35 ساعة", material: "صوف فاخر", knots: "+80K غرزة" },
                isActive: false
            },
            {
                id: "scene-4",
                title: "4. طلاء الغراء الخلفي لتثبيت وتماسك الصوف",
                subtitle: "🛡️ الخطوة الرابعة • التماسك والمتانة الفائقة",
                quote: "«بعد اكتمال الحياكة، نوزع غراء اللاتكس الخاص على الوجه الخلفي ليتغلغل في جذور الصوف ويمنح السجادة ثباتاً أسطورياً يدوم طويلاً.»",
                videoUrl: "",
                posterUrl: "../images/step4_glue.jpg",
                caption: "تثبيت جذور الخيوط بغراء خاص لمنع التساقط وضمان الصلابة",
                stats: { hours: "+24 ساعة", material: "غراء مقوى", knots: "ثبات دائم" },
                isActive: false
            },
            {
                id: "scene-5",
                title: "5. النحت اليدوي الدقيق بماكينة حلاقة الصوف",
                subtitle: "✂️ الخطوة الخامسة • النحت والبروز 3D",
                quote: "«أدق مراحل العمل وأصعبها؛ بماكينة حلاقة وتشذيب الصوف ننحت حدود الألوان لنصنع بروزاً ثلاثي الأبعاد يُبرز تفاصيل السجادة بدقة أخّاذة.»",
                videoUrl: "",
                posterUrl: "../images/step5_carving.jpg",
                caption: "صقل وحلاقة فنية مجهرية لإبراز الأبعاد والخطوط بدقة استثنائية",
                stats: { hours: "+18 ساعة", material: "نحت مجهري", knots: "بروز 3D" },
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

export async function saveShowcaseSettingsToCloud(settingsObj) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return;
    try {
        const settingsRef = doc(db, "settings", "showcase");
        await setDoc(settingsRef, {
            ...settingsObj,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (e) {
        console.warn("Could not save showcase settings to Firestore:", e);
    }
}

// ==========================================
// رفع ومعالجة صور البنرات الترويجية (سحابياً أو مضغوطة محلياً)
// ==========================================
export async function uploadShowcaseImage(file, subfolder = 'showcase', onProgress) {
    if (!file) return null;

    if (onProgress) onProgress('جاري تحسين وضغط الصورة المرفوعة...');
    const compressed = await compressImage(file, 1200, 1200, 0.78);

    const { storage, isReady } = initFirebaseServices();
    const hasStorage = isReady && storage ? await isStorageBucketReady() : false;

    if (hasStorage && storage) {
        try {
            if (onProgress) onProgress('جاري رفع الصورة إلى التخزين السحابي...');
            const fileExt = compressed.name.split('.').pop() || 'jpg';
            const fileName = `${subfolder}_${Date.now()}.${fileExt}`;
            const storageRef = ref(storage, `showcase/${subfolder}/${fileName}`);
            const snapshot = await uploadBytes(storageRef, compressed, {
                contentType: 'image/jpeg'
            });
            const downloadUrl = await getDownloadURL(snapshot.ref);
            if (downloadUrl) return downloadUrl;
        } catch (e) {
            console.warn('Storage image upload error for showcase, falling back to base64:', e);
        }
    }

    if (onProgress) onProgress('جاري حفظ الصورة بجودة فائقة...');
    return await fileToBase64(compressed);
}

// ==========================================
// إدارة الطلبات والمهام والمبيعات (Orders Management)
// ==========================================

export function subscribeToOrders(onUpdate, onError) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        if (onError) onError(new Error("Firebase services not ready"));
        return () => {};
    }

    try {
        const ordersCol = collection(db, "orders");
        return onSnapshot(ordersCol, (snapshot) => {
            const orders = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                orders.push({
                    id: docSnap.id,
                    ...data
                });
            });
            // ترتيب تنازلي حسب تاريخ الإنشاء (الأحدث أولاً)
            orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            if (onUpdate) onUpdate(orders);
        }, (err) => {
            console.error("Orders sync error:", err);
            if (onError) onError(err);
        });
    } catch(err) {
        console.error("Failed to subscribe to orders:", err);
        if (onError) onError(err);
        return () => {};
    }
}

export async function confirmOrderPayment(orderId, paymentNote = '', customData = {}) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) throw new Error("Firebase services not ready");

    const orderRef = doc(db, "orders", orderId);
    const auth = getAuth();
    const adminEmail = auth.currentUser ? auth.currentUser.email : 'admin';

    const updatePayload = {
        status: 'confirmed',
        confirmedAt: Date.now(),
        confirmedBy: adminEmail,
        paymentNotes: (paymentNote || '').trim(),
        ...customData
    };

    await updateDoc(orderRef, updatePayload);

    return { success: true, orderId };
}

export async function cancelAndPermanentlyDeleteOrder(orderId) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) throw new Error("Firebase services not ready");

    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);

    return { success: true, orderId };
}

export async function revertOrderToPending(orderId) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) throw new Error("Firebase services not ready");

    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
        status: 'pending',
        confirmedAt: null,
        confirmedBy: null
    });

    return { success: true, orderId };
}

export async function updateOrderStage(orderId, stageId, trackingDetails = {}) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) throw new Error("Firebase services not ready");

    const orderRef = doc(db, "orders", orderId);
    const now = Date.now();
    const auth = getAuth();
    const adminEmail = auth.currentUser ? auth.currentUser.email : 'admin';

    const updatePayload = {
        stage: stageId,
        stageUpdatedAt: now,
        stageUpdatedBy: adminEmail,
        trackingNumber: (trackingDetails.trackingNumber || '').trim(),
        carrierName: (trackingDetails.carrierName || '').trim(),
        stageNotes: (trackingDetails.notes || '').trim()
    };

    await updateDoc(orderRef, updatePayload);
    return { success: true, orderId, stage: stageId };
}

export async function updateOrderCustomerInfo(orderId, customerName, customerPhone) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) throw new Error("Firebase services not ready");

    const orderRef = doc(db, "orders", orderId);
    const updatePayload = {};
    if (customerName !== undefined) {
        updatePayload.customerName = (customerName || '').trim();
    }
    if (customerPhone !== undefined) {
        updatePayload.customerPhone = (customerPhone || '').trim();
    }

    await updateDoc(orderRef, updatePayload);
    return { success: true, orderId };
}

// ==========================================
// مزامنة قوالب وأنماط استوديو تطريز السحابية (Studio Presets Cloud Sync)
// دار التطريز TATRIZA
// ==========================================

function sanitizeForFirestore(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeForFirestore(item));
    }
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
            clean[key] = (typeof value === 'object' && value !== null) 
                ? sanitizeForFirestore(value) 
                : value;
        }
    }
    return clean;
}

export function subscribeToStudioPresets(onSuccess, onError) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) {
        if (onError) onError(new Error("Firebase is not configured yet."));
        return () => {};
    }

    try {
        const presetsCol = collection(db, "studio_presets");
        return onSnapshot(presetsCol, (snapshot) => {
            const presets = [];
            snapshot.forEach((docSnap) => {
                presets.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            });
            // ترتيب القوالب من الأحدث للأقدم
            presets.sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
            // مزامنة الذاكرة المحلية كـ Cache سريع وفوري
            try {
                localStorage.setItem('tatr_studio_style_presets', JSON.stringify(presets));
            } catch (e) {}
            if (onSuccess) onSuccess(presets);
        }, (err) => {
            console.warn("Firestore presets snapshot error, trying fallback fetch:", err);
            getDocs(presetsCol).then((fallbackSnap) => {
                const presets = [];
                fallbackSnap.forEach((docSnap) => {
                    presets.push({ id: docSnap.id, ...docSnap.data() });
                });
                presets.sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
                try {
                    localStorage.setItem('tatr_studio_style_presets', JSON.stringify(presets));
                } catch (e) {}
                if (onSuccess) onSuccess(presets);
            }).catch((fallbackErr) => {
                if (onError) onError(fallbackErr);
            });
        });
    } catch (e) {
        if (onError) onError(e);
        return () => {};
    }
}

export async function saveStudioPresetToCloud(presetObj) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return false;
    try {
        const presetId = presetObj.id || ('preset_' + Date.now());
        const presetRef = doc(db, "studio_presets", presetId);
        const cleanPayload = sanitizeForFirestore({
            ...presetObj,
            id: presetId,
            updatedAt: Date.now()
        });
        await setDoc(presetRef, cleanPayload, { merge: true });
        return true;
    } catch (e) {
        console.warn("Could not save studio preset to Firestore:", e);
        return false;
    }
}

export async function deleteStudioPresetFromCloud(presetId) {
    const { db, isReady } = initFirebaseServices();
    if (!isReady || !db) return false;
    try {
        const presetRef = doc(db, "studio_presets", presetId);
        await deleteDoc(presetRef);
        return true;
    } catch (e) {
        console.warn("Could not delete studio preset from Firestore:", e);
        return false;
    }
}
