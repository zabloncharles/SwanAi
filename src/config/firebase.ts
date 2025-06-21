import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - using environment variables with fallbacks
const firebaseConfig = {
  apiKey:
    (import.meta as any).env?.VITE_FIREBASE_API_KEY ||
    "AIzaSyBpPDmQmngqShh5SWYZpS008zQTW43c_2g",
  authDomain:
    (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN ||
    "swanapp-9b41b.firebaseapp.com",
  projectId:
    (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "swanapp-9b41b",
  storageBucket:
    (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET ||
    "swanapp-9b41b.firebasestorage.app",
  messagingSenderId:
    (import.meta as any).env?.VITE_FIREBASE_MESSAGING_ID || "557847973376",
  appId:
    (import.meta as any).env?.VITE_FIREBASE_APP_ID ||
    "1:557847973376:web:fcbbca18103a19cb3052e5",
};

// Validate required config
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API Key is required");
}

if (!firebaseConfig.authDomain) {
  throw new Error("Firebase Auth Domain is required");
}

if (!firebaseConfig.projectId) {
  throw new Error("Firebase Project ID is required");
}

if (!firebaseConfig.storageBucket) {
  throw new Error("Firebase Storage Bucket is required");
}

if (!firebaseConfig.messagingSenderId) {
  throw new Error("Firebase Messaging Sender ID is required");
}

if (!firebaseConfig.appId) {
  throw new Error("Firebase App ID is required");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
