"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  ensureAuthPersistence,
  saveAuthSession,
  clearAuthSession,
  isFirebaseConfigured,
} from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  signupCustomer: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  signupShopKeeper: (data: {
    email: string;
    password: string;
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  loginCustomer: (email: string, password: string) => Promise<void>;
  loginShopKeeper: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
  updateShopProfile: (data: Partial<AppUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(data: Record<string, unknown>, uid: string): AppUser {
  return {
    uid,
    email: String(data.email ?? ""),
    role: (data.role as UserRole) || "user",
    name: String(data.name ?? data.ownerName ?? ""),
    phone: String(data.phone ?? ""),
    address: String(data.address ?? ""),
    shopName: String(data.shopName ?? ""),
    description: String(data.description ?? ""),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const signingUpRef = useRef(false);

  const loadProfile = async (firebaseUser: User) => {
    const db = getFirebaseDb();
    const userRef = doc(db, "users", firebaseUser.uid);

    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile(mapUser(snap.data(), firebaseUser.uid));
        return;
      }

      // Legacy shopKeepers collection
      const legacy = await getDoc(doc(db, "shopKeepers", firebaseUser.uid));
      if (legacy.exists()) {
        const mapped = mapUser(
          { ...legacy.data(), role: "shopKeeper" },
          firebaseUser.uid
        );
        await setDoc(userRef, mapped, { merge: true });
        setProfile(mapped);
        return;
      }

      if (signingUpRef.current) return;
      setProfile(null);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let unsub = () => {};
    let cancelled = false;

    (async () => {
      try {
        if (!isFirebaseConfigured()) {
          if (!cancelled) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const auth = await ensureAuthPersistence();

        unsub = onAuthStateChanged(auth, async (firebaseUser) => {
          if (cancelled) return;

          if (firebaseUser) {
            setUser(firebaseUser);
            setLoading(false);
            try {
              await saveAuthSession(firebaseUser);
              await loadProfile(firebaseUser);
            } catch {
              // Keep auth user even if profile fetch fails (network/rules)
            }
            return;
          }

          clearAuthSession();
          setUser(null);
          setProfile(null);
          setLoading(false);
        });
      } catch {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signupCustomer = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: string;
  }) => {
    signingUpRef.current = true;
    try {
      await ensureAuthPersistence();
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(cred.user, { displayName: data.name });

      const now = new Date().toISOString();
      const appUser: AppUser = {
        uid: cred.user.uid,
        email: data.email,
        role: "user",
        name: data.name,
        phone: data.phone,
        address: data.address,
        shopName: "",
        description: "",
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, "users", cred.user.uid), appUser);
      await saveAuthSession(cred.user);
      setProfile(appUser);
    } finally {
      signingUpRef.current = false;
    }
  };

  const signupShopKeeper = async (data: {
    email: string;
    password: string;
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
  }) => {
    signingUpRef.current = true;
    try {
      await ensureAuthPersistence();
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      const cred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(cred.user, { displayName: data.shopName });

      const now = new Date().toISOString();
      const appUser: AppUser = {
        uid: cred.user.uid,
        email: data.email,
        role: "shopKeeper",
        name: data.ownerName,
        phone: data.phone,
        address: data.address,
        shopName: data.shopName,
        description: "",
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, "users", cred.user.uid), appUser);
      await saveAuthSession(cred.user);
      setProfile(appUser);
    } finally {
      signingUpRef.current = false;
    }
  };

  const loginCustomer = async (email: string, password: string) => {
    await ensureAuthPersistence();
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );
    const snap = await getDoc(doc(getFirebaseDb(), "users", cred.user.uid));
    if (snap.exists() && snap.data().role === "shopKeeper") {
      await signOut(getFirebaseAuth());
      clearAuthSession();
      throw new Error(
        "This account is a shop keeper account. Please sign in at /admin."
      );
    }
    if (!snap.exists()) {
      await signOut(getFirebaseAuth());
      clearAuthSession();
      throw new Error(
        "Customer account not found. Please sign up on the website."
      );
    }
    await saveAuthSession(cred.user);
  };

  const loginShopKeeper = async (email: string, password: string) => {
    await ensureAuthPersistence();
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );
    const snap = await getDoc(doc(getFirebaseDb(), "users", cred.user.uid));
    if (snap.exists() && snap.data().role !== "shopKeeper") {
      await signOut(getFirebaseAuth());
      clearAuthSession();
      throw new Error(
        "This account is a customer account. Please sign in on the website."
      );
    }
    if (!snap.exists()) {
      const legacy = await getDoc(
        doc(getFirebaseDb(), "shopKeepers", cred.user.uid)
      );
      if (!legacy.exists()) {
        await signOut(getFirebaseAuth());
        clearAuthSession();
        throw new Error(
          "Shop keeper account not found. Please sign up at /admin/signup."
        );
      }
    }
    await saveAuthSession(cred.user);
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
    clearAuthSession();
    setProfile(null);
  };

  const updateUserProfile = async (data: Partial<AppUser>) => {
    if (!user) throw new Error("Not authenticated");
    const payload: AppUser = {
      uid: user.uid,
      email: user.email || profile?.email || "",
      role: "user",
      name: data.name ?? profile?.name ?? "",
      phone: data.phone ?? profile?.phone ?? "",
      address: data.address ?? profile?.address ?? "",
      shopName: "",
      description: data.description ?? profile?.description ?? "",
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(getFirebaseDb(), "users", user.uid), payload);
    setProfile(payload);
  };

  const updateShopProfile = async (data: Partial<AppUser>) => {
    if (!user) throw new Error("Not authenticated");
    const payload: AppUser = {
      uid: user.uid,
      email: user.email || profile?.email || "",
      role: "shopKeeper",
      name: data.name ?? profile?.name ?? "",
      phone: data.phone ?? profile?.phone ?? "",
      address: data.address ?? profile?.address ?? "",
      shopName: data.shopName ?? profile?.shopName ?? "",
      description: data.description ?? profile?.description ?? "",
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(getFirebaseDb(), "users", user.uid), payload);
    setProfile(payload);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signupCustomer,
        signupShopKeeper,
        loginCustomer,
        loginShopKeeper,
        logout,
        updateUserProfile,
        updateShopProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
