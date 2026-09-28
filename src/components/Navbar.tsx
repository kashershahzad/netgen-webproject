"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, LogOut, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { user, profile, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  if (pathname.startsWith("/admin")) return null;

  const hideOnAuth = pathname === "/login" || pathname === "/signup";
  if (hideOnAuth) return null;

  const isCustomer = profile?.role === "user";

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo height={72} />
        </Link>

        <form
          onSubmit={handleSearch}
          className="mx-auto hidden min-w-0 max-w-md flex-1 md:block"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-black/10 bg-white py-2 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-ink/35 focus:border-brand"
            />
          </label>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            className="rounded-lg p-2 text-ink/55 transition-colors hover:text-ink md:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {!loading && user && isCustomer ? (
            <>
              <Link
                href="/orders"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  pathname === "/orders"
                    ? "font-medium text-ink"
                    : "text-ink/55 hover:text-ink"
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Orders</span>
              </Link>
              <Link
                href="/account"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                  pathname === "/account"
                    ? "font-medium text-ink"
                    : "text-ink/55 hover:text-ink"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {profile?.name || "Account"}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink/55 transition-colors hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm text-ink/55 transition-colors hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="ml-1 rounded-md bg-brand px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-light"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      {/* Mobile search */}
      <div className="border-t border-black/5 px-4 py-2 md:hidden">
        <form onSubmit={handleSearch}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-black/10 bg-white py-2 pr-3 pl-9 text-sm outline-none placeholder:text-ink/35 focus:border-brand"
            />
          </label>
        </form>
      </div>
    </header>
  );
}
