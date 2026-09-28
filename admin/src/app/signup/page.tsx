"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function SignupPage() {
  const { signup, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        shopName: form.shopName,
        ownerName: form.ownerName,
        phone: form.phone,
        address: form.address,
      });
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Signup failed. Try again.";
      setError(
        message.includes("email-already-in-use")
          ? "This email is already registered"
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-2/5">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(201,162,39,0.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(201,162,39,0.15), transparent 45%)",
          }}
        />
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-10 text-center">
          <BrandLogo height={240} priority className="mb-6 drop-shadow-lg" />
          <p className="max-w-xs text-sm text-brand-light/90">
            Create your shop keeper account and start managing products today.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo height={100} priority />
          </div>

          <h2 className="mb-1 text-2xl font-bold text-ink">
            Create your shop account
          </h2>
          <p className="mb-8 text-sm text-slate-500">
            Register as a Netgen shop keeper
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Shop Name *
                </label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => update("shopName", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="My Shop"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                placeholder="you@shop.com"
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
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="03XX-XXXXXXX"
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
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="Shop address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-light disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-dark hover:text-brand"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
