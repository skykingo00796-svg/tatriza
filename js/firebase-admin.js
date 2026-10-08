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
                id: "vid-1",
                title: "حكاية كل خيط تحفة.. وصبر يصنع الفخامة",
                subtitle: "✨ أصالة المشغل اليدوي",
                quote: "«كل سجادة تخرج من دار التطريز ليست مجرد غطاء للأرضية، بل لوحة فنية عريقة استغرقت مئات الساعات من الدقة والشغف لتمنح مساحتك روحاً دافئة ومتميزة لا تتكرر في أي مكان آخر.»",
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


