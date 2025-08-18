import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration - environment variables required
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_ID,
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID,
};

// Validate required config
if (!firebaseConfig.apiKey) {
  throw new Error("VITE_FIREBASE_API_KEY environment variable is required");
}

if (!firebaseConfig.authDomain) {
  throw new Error("VITE_FIREBASE_AUTH_DOMAIN environment variable is required");
}

if (!firebaseConfig.projectId) {
  throw new Error("VITE_FIREBASE_PROJECT_ID environment variable is required");
}

if (!firebaseConfig.storageBucket) {
  throw new Error(
    "VITE_FIREBASE_STORAGE_BUCKET environment variable is required"
  );
}

if (!firebaseConfig.messagingSenderId) {
  throw new Error(
    "VITE_FIREBASE_MESSAGING_ID environment variable is required"
  );
}

if (!firebaseConfig.appId) {
  throw new Error("VITE_FIREBASE_APP_ID environment variable is required");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
