"use client";

import { useState, type FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BrandLogo from "@/components/BrandLogo";

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Try again.";
      setError(
        message.includes("invalid-credential") ||
          message.includes("wrong-password") ||
          message.includes("user-not-found")
          ? "Invalid email or password"
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
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-1/2">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(201,162,39,0.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(201,162,39,0.15), transparent 45%)",
          }}
        />
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-12 text-center">
          <BrandLogo height={260} priority className="mb-6 drop-shadow-lg" />
          <p className="max-w-xs text-base text-brand-light/90">
            Manage your shop products, stock and profile from one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo height={110} priority />
          </div>

          <h2 className="mb-1 text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mb-8 text-sm text-slate-500">
            Sign in to your Netgen shop keeper account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                placeholder="you@shop.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-light disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand-dark hover:text-brand"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
