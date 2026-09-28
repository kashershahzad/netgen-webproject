"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Search } from "lucide-react";
import StoreProductCard from "@/components/StoreProductCard";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load products")
      )
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => {
    if (!q) return products;
    const needle = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle)
    );
  }, [products, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Search className="h-6 w-6 text-brand-dark" />
          Search
        </h1>
        <p className="mt-1 text-sm text-ink/50">
          {q
            ? `Results for “${q}”`
            : "Browse all products or type a search above"}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Package className="mb-3 h-12 w-12 text-ink/20" />
          <p className="text-sm font-medium text-ink/70">No products found</p>
          <Link
            href="/#products"
            className="mt-4 text-sm font-medium text-brand-dark hover:underline"
          >
            Back to shop
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="mb-6 text-sm text-ink/40">
            {results.length} item{results.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
