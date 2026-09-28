"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import StoreProductCard from "@/components/StoreProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isCustomer = Boolean(user && profile?.role === "user");

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load products")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white">
      {/* Hero: image left, content right */}
      <section className="border-b border-black/8">
        <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl grid-cols-1 lg:grid-cols-2">
          <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden lg:min-h-full">
            <Image
              src="/hero-graphic.svg?v=2"
              alt="Netgen shopping graphic"
              width={560}
              height={560}
              priority
              className="h-auto w-[88%] max-w-[560px]"
            />
          </div>

          <div className="flex flex-col items-start justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-14">
            <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight text-ink sm:text-6xl md:text-7xl">
              Netgen
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink/55 sm:text-xl">
              Discover products from local shop keepers.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-brand-light"
              >
                Browse products
              </a>
              {!authLoading && isCustomer && (
                <Link
                  href="/account"
                  className="rounded-lg border border-black/10 bg-white px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-brand/40"
                >
                  My account
                </Link>
              )}
              {!authLoading && !user && (
                <Link
                  href="/signup"
                  className="rounded-lg border border-black/10 bg-white px-7 py-3.5 text-base font-medium text-ink transition-colors hover:border-brand/40"
                >
                  Create account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-16 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-ink sm:text-2xl">
                All products
              </h2>
              <p className="mt-1 text-sm text-ink/50">
                Everything available across Netgen shops
              </p>
            </div>
            {!loading && !error && (
              <p className="text-sm text-ink/40">
                {products.length} item{products.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <Package className="mb-3 h-10 w-10 text-ink/20" />
              <p className="text-sm font-medium text-ink/70">No products yet</p>
              <p className="mt-1 text-sm text-ink/40">
                Check back soon for new listings
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <StoreProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
