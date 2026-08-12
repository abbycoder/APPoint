import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

// These come from Firebase Console → Project settings → Your apps → SDK config.
// Set them in a .env file at the project root (see .env.example).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let signedInPromise: Promise<void> | null = null;

/** Resolves once this device has an (anonymous) Firebase session. Every
 * Firestore call in this app waits on this first, so nothing reads or
 * writes before the security rules would allow it to anyway. */
export function ensureSignedIn(): Promise<void> {
  if (!signedInPromise) {
    signedInPromise = new Promise((resolve, reject) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve();
        } else {
          signInAnonymously(auth).catch(reject);
        }
      });
    });
  }
  return signedInPromise;
}
