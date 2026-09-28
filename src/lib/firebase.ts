import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const AUTH_TOKEN_KEY = "netgen_auth_token";
const AUTH_UID_KEY = "netgen_auth_uid";

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _persistenceReady: Promise<void> | null = null;

function getAppInstance(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getAppInstance());
    if (typeof window !== "undefined") {
      _persistenceReady = setPersistence(_auth, browserLocalPersistence).catch(
        () => undefined
      );
    }
  }
  return _auth;
}

/** Ensures local persistence is applied before auth calls */
export async function ensureAuthPersistence(): Promise<void> {
  getFirebaseAuth();
  if (_persistenceReady) await _persistenceReady;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getAppInstance());
  return _db;
}

export async function saveAuthSession(user: {
  uid: string;
  getIdToken: () => Promise<string>;
}): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const token = await user.getIdToken();
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_UID_KEY, user.uid);
  } catch {
    // ignore storage errors
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_UID_KEY);
}

export function getStoredAuthUid(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_UID_KEY);
}
