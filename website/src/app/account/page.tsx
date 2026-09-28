"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
  const { user, profile, loading: authLoading, updateUserProfile, logout } =
    useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!profile && !user) return;
    setForm({
      name: profile?.name || user?.displayName || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    });
  }, [profile, user]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await updateUserProfile(form);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  const displayName = form.name || profile?.name || "Customer";
  const displayEmail = profile?.email || user.email || "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your customer profile
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-brand-dark hover:text-brand"
        >
          Back to shop
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-muted text-brand-dark">
            <User className="h-9 w-9" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{displayName}</h2>
          <p className="mt-3 break-all text-xs text-slate-400">{displayEmail}</p>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="mt-5 text-sm font-medium text-slate-500 hover:text-ink"
          >
            Log out
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={displayEmail}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
