import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBpPDmQmngqShh5SWYZpS008zQTW43c_2g",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "swanapp-9b41b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swanapp-9b41b",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "swanapp-9b41b.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_ID || "557847973376",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:557847973376:web:fcbbca18103a19cb3052e5",
};

// Temporary debugging - remove after fixing
console.log("Firebase Config Values:", {
  apiKey: firebaseConfig.apiKey
    ? `${firebaseConfig.apiKey.substring(0, 10)}...`
    : "UNDEFINED",
  authDomain: firebaseConfig.authDomain || "UNDEFINED",
  projectId: firebaseConfig.projectId || "UNDEFINED",
  storageBucket: firebaseConfig.storageBucket || "UNDEFINED",
  messagingSenderId: firebaseConfig.messagingSenderId || "UNDEFINED",
  appId: firebaseConfig.appId || "UNDEFINED",
});

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
