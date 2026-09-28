"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { user, profile, logout, loading } = useAuth();
  const pathname = usePathname();

  const hideOnAuth = pathname === "/login" || pathname === "/signup";
  if (hideOnAuth) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo height={40} />
          <span className="text-lg font-bold tracking-tight text-ink">
            Netgen
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-brand-muted text-brand-dark"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            }`}
          >
            Shop
          </Link>

          {!loading && user ? (
            <>
              <Link
                href="/account"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/account"
                    ? "bg-brand-muted text-brand-dark"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {profile?.name || "Account"}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-light"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
