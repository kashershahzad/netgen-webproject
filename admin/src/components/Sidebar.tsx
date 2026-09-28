"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/stock", label: "Stock", icon: Boxes },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const nav = (
    <>
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <BrandLogo height={44} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">
              {profile?.shopName || "Netgen"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {profile?.ownerName || "Shop Keeper"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(href)
                ? "bg-brand-muted text-brand-dark"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            }`}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg border border-slate-200 bg-white p-2 shadow lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 text-slate-500 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>
    </>
  );
}
