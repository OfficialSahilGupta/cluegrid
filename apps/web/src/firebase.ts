import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";


// Firebase Configuration (Values will be populated via import.meta.env, falling back to live project credentials)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBrm1nPXz_ZBTdC3hjq55rlCfBX3btUGeY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cluegird-proj.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cluegird-proj",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cluegird-proj.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1024989209731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1024989209731:web:5bf73daf1d9276aab6a7b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WT49KVFH6V",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Safe initialization of Firebase Analytics
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;
