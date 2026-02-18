"use client";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
} from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase app immediately (only in browser)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined" && firebaseConfig.apiKey) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    functions = getFunctions(app);
    storage = getStorage(app);
    
    // Set auth persistence
    setPersistence(auth, browserLocalPersistence).catch(console.error);
    
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error);
  }
} else if (typeof window !== "undefined") {
  console.error("❌ Firebase API key missing! Check .env.local");
}

// Getter functions
export function getFirebaseApp(): FirebaseApp {
  if (!app) throw new Error("Firebase app not initialized");
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new Error("Firebase auth not initialized");
  return auth;
}

export function getFirebaseFunctions(): Functions {
  if (!functions) throw new Error("Firebase functions not initialized");
  return functions;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) throw new Error("Firebase storage not initialized");
  return storage;
}

// Export instances directly
export { app, auth, functions, storage };
