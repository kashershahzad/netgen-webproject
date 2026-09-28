"use client";

import { useState, type FormEvent, useEffect } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, profile, updateShopProfile } = useAuth();
  const [form, setForm] = useState({
    shopName: "",
    name: "",
    phone: "",
    address: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile && !user) return;
    setForm({
      shopName: profile?.shopName || user?.displayName || "",
      name: profile?.name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      description: profile?.description || "",
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
      await updateShopProfile(form);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const displayShop = form.shopName || profile?.shopName || "Your Shop";
  const displayOwner = form.name || profile?.name || "Shop Keeper";
  const displayEmail = profile?.email || user?.email || "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Shop Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your shop keeper profile and shop details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-muted text-brand-dark mb-4">
            <User className="h-9 w-9" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{displayShop}</h2>
          <p className="text-sm text-slate-500 mt-1">{displayOwner}</p>
          <p className="text-xs text-slate-400 mt-3 break-all">{displayEmail}</p>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => update("shopName", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={displayEmail}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Shop Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
                placeholder="Tell customers about your shop..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
