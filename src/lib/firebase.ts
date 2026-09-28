import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  onIdTokenChanged,
  type Auth,
  type User,
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

const AUTH_SESSION_KEY = "netgen_auth_session";

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _tokenListenerAttached = false;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.projectId !== "undefined" &&
      firebaseConfig.appId
  );
}

export function getFirebaseConfigStatus(): {
  ok: boolean;
  missing: string[];
} {
  const required: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId],
  ];
  const missing = required
    .filter(([, value]) => !value || value === "undefined")
    .map(([key]) => key);
  return { ok: missing.length === 0, missing };
}

function getAppInstance(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars in Vercel, then redeploy."
    );
  }
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

/**
 * Client-only Auth with durable local persistence (IndexedDB + localStorage).
 * This is what keeps users logged in across page refresh on Vercel.
 */
export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be used in the browser");
  }

  if (_auth) return _auth;

  const appInstance = getAppInstance();

  try {
    _auth = initializeAuth(appInstance, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } catch {
    // Auth already initialized in this tab (HMR / Strict Mode)
    _auth = getAuth(appInstance);
  }

  if (!_tokenListenerAttached) {
    _tokenListenerAttached = true;
    onIdTokenChanged(_auth, async (user) => {
      if (user) await saveAuthSession(user);
      else clearAuthSession();
    });
  }

  return _auth;
}

export async function ensureAuthPersistence(): Promise<Auth> {
  return getFirebaseAuth();
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getAppInstance());
  return _db;
}

export async function saveAuthSession(user: User): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const token = await user.getIdToken(/* forceRefresh */ false);
    const payload = {
      uid: user.uid,
      email: user.email || "",
      token,
      savedAt: Date.now(),
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
    // legacy keys (optional helpers)
    localStorage.setItem("netgen_auth_token", token);
    localStorage.setItem("netgen_auth_uid", user.uid);
  } catch {
    // storage may be blocked
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem("netgen_auth_token");
  localStorage.removeItem("netgen_auth_uid");
}

export function getStoredAuthSession(): {
  uid: string;
  email: string;
  token: string;
  savedAt: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      uid: string;
      email: string;
      token: string;
      savedAt: number;
    };
  } catch {
    return null;
  }
}

export function getStoredAuthUid(): string | null {
  return getStoredAuthSession()?.uid ?? null;
}
