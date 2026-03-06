// ======================================================
// firebase.js - Firebase Configuration & Initialization
// ======================================================
// הוראות הגדרה:
// 1. לך ל: https://console.firebase.google.com
// 2. צור פרויקט חדש
// 3. הפעל Firestore Database
// 4. הפעל Authentication (Email/Password)
// 5. העתק את הגדרות הפרויקט לכאן
// ======================================================

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔴 החלף בפרטי Firebase האמיתיים שלך
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ======================================================
// Offline Persistence (משימה 1.3)
// מונע קריסות באזורים ללא קליטה
// ======================================================
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open - persistence can only be enabled in one tab at a time
    console.warn("Firebase persistence: multiple tabs open");
  } else if (err.code === "unimplemented") {
    // Browser doesn't support persistence
    console.warn("Firebase persistence: not supported in this browser");
  }
});

// ======================================================
// Firestore Collection References
// ======================================================
export const collectionsRef = {
  drivers: collection(db, "drivers"),
  routes: collection(db, "routes"),
  liveLocations: collection(db, "liveLocations"),
  stats: collection(db, "stats"),
};

// ======================================================
// Helper Functions
// ======================================================

/** מאזין לכל המסמכים באוסף */
export function listenToCollection(collectionName, callback) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/** מאזין למסמך יחיד */
export function listenToDoc(collectionName, docId, callback) {
  return onSnapshot(doc(db, collectionName, docId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

/** עדכון מיקום נהג ב-Firestore */
export async function updateDriverLocation(driverId, locationData) {
  await setDoc(doc(db, "liveLocations", driverId), {
    ...locationData,
    timestamp: serverTimestamp(),
  });
}

/** עדכון סטטוס נהג */
export async function setDriverStatus(driverId, status) {
  await updateDoc(doc(db, "drivers", driverId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export {
  collection, doc, onSnapshot, setDoc, updateDoc,
  deleteDoc, addDoc, serverTimestamp,
};
