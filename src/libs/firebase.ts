// src/libs/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAWXzE1xdVa7XQruWlQHLK9JtgW-uqkv_4",
  authDomain: "list-iphone-store.firebaseapp.com",
  databaseURL: "https://list-iphone-store-default-rtdb.firebaseio.com",
  projectId: "list-iphone-store",
  storageBucket: "list-iphone-store.firebasestorage.app",
  messagingSenderId: "98895176605",
  appId: "1:98895176605:web:dda51bbe9524d406d00574",
  measurementId: "G-314BSY59BL"
};

// Garante que o app não será inicializado mais de uma vez (Next.js faz hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Analytics só no client
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, auth, analytics };