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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization variables
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _functions: Functions | undefined;
let _storage: FirebaseStorage | undefined;
let _isInitialized = false;

// Initialize Firebase only in browser
function initializeFirebase() {
  if (_isInitialized || typeof window === "undefined") {
    return;
  }

  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _functions = getFunctions(_app);
  _storage = getStorage(_app);

  // Set auth persistence
  setPersistence(_auth, browserLocalPersistence).catch((err) => {
    console.error("Error setting auth persistence:", err);
  });

  _isInitialized = true;
}

// Getter functions that initialize on first access
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    initializeFirebase();
  }
  return _app!;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    initializeFirebase();
  }
  return _auth!;
}

export function getFirebaseFunctions(): Functions {
  if (!_functions) {
    initializeFirebase();
  }
  return _functions!;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    initializeFirebase();
  }
  return _storage!;
}

// Legacy exports for backward compatibility
export const auth = new Proxy({} as Auth, {
  get(target, prop) {
    return getFirebaseAuth()[prop as keyof Auth];
  },
});

export const functions = new Proxy({} as Functions, {
  get(target, prop) {
    return getFirebaseFunctions()[prop as keyof Functions];
  },
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(target, prop) {
    return getFirebaseStorage()[prop as keyof FirebaseStorage];
  },
});

export const app = new Proxy({} as FirebaseApp, {
  get(target, prop) {
    return getFirebaseApp()[prop as keyof FirebaseApp];
  },
});
