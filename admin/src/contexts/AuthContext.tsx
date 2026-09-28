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
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import type { AppUser, UserRole } from "@/lib/types";

const ROLE: UserRole = "shopKeeper";

interface AuthContextValue {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  signup: (data: {
    email: string;
    password: string;
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateShopProfile: (data: Partial<AppUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(data: Record<string, unknown>, uid: string): AppUser {
  return {
    uid,
    email: String(data.email ?? ""),
    role: (data.role as UserRole) || "shopKeeper",
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
        const mapped = mapUser(snap.data(), firebaseUser.uid);
        if (mapped.role !== "shopKeeper") {
          await signOut(getFirebaseAuth());
          setUser(null);
          setProfile(null);
          throw new Error(
            "This account is a customer account. Please use the Netgen website to sign in."
          );
        }
        setProfile(mapped);
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
    } catch (err) {
      if (err instanceof Error && err.message.includes("customer account")) {
        throw err;
      }
      setProfile(null);
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await loadProfile(firebaseUser);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signup = async (data: {
    email: string;
    password: string;
    shopName: string;
    ownerName: string;
    phone: string;
    address: string;
  }) => {
    signingUpRef.current = true;
    try {
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
        role: ROLE, // shopKeeper — set from admin code only
        name: data.ownerName,
        phone: data.phone,
        address: data.address,
        shopName: data.shopName,
        description: "",
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, "users", cred.user.uid), appUser);
      setProfile(appUser);
    } finally {
      signingUpRef.current = false;
    }
  };

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email,
      password
    );
    const snap = await getDoc(doc(getFirebaseDb(), "users", cred.user.uid));
    if (snap.exists() && snap.data().role !== "shopKeeper") {
      await signOut(getFirebaseAuth());
      throw new Error(
        "This account is a customer account. Please use the Netgen website to sign in."
      );
    }
    // Legacy: shopKeepers without users doc is OK
    if (!snap.exists()) {
      const legacy = await getDoc(
        doc(getFirebaseDb(), "shopKeepers", cred.user.uid)
      );
      if (!legacy.exists()) {
        await signOut(getFirebaseAuth());
        throw new Error(
          "Shop keeper account not found. Please sign up as a shop keeper."
        );
      }
    }
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
    setProfile(null);
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
        signup,
        login,
        logout,
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
