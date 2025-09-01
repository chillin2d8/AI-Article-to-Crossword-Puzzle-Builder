// IMPORTANT: Replace the placeholder values below with your actual
// Firebase project's configuration. You can find this in the
// Firebase Console > Project Settings > General > Your apps > Web app.

// FIX: Updated Firebase imports to use @firebase scoped packages to resolve module export errors.
import { initializeApp, type FirebaseApp } from "@firebase/app";
import { getAuth, type Auth } from "@firebase/auth";
import { getFirestore, type Firestore } from "@firebase/firestore";
import { getFunctions, type Functions } from "@firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyABCDEFGHIJKLmnopqrstuvwxyz1234567890",
  authDomain: "play-app-dev.firebaseapp.com",
  projectId: "play-app-dev",
  storageBucket: "play-app-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0"
};

// This check is a safeguard. If the apiKey is still the default example, we don't initialize.
const isPlaceholderConfig = firebaseConfig.apiKey === "AIzaSyABCDEFGHIJKLmnopqrstuvwxyz1234567890";

export const isFirebaseConfigured = !isPlaceholderConfig;

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let functionsInstance: Functions | null = null;


if (isFirebaseConfigured) {
  try {
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    functionsInstance = getFunctions(appInstance);
  } catch (error) {
      console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn(
      "FIREBASE NOT CONFIGURED: Authentication is disabled. Using simulated mode. " +
      "Please update firebaseConfig.ts with your project credentials to enable real login."
    );
}

// Export the instances (which may be null) for use in other parts of the app
export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const functions = functionsInstance;
