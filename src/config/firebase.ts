import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration - fetched from public config file
const firebaseConfig = {
  apiKey: "AIzaSyBpPDmQmngqShh5SWYZpS008zQTW43c_2g",
  authDomain: "swanapp-9b41b.firebaseapp.com",
  projectId: "swanapp-9b41b",
  storageBucket: "swanapp-9b41b.firebasestorage.app",
  messagingSenderId: "557847973376",
  appId: "1:557847973376:web:fcbbca18103a19cb3052e5",
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
