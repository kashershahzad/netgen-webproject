"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

function stockStyles(stock: number) {
  if (stock === 0) {
    return { label: "Out of stock", className: "bg-red-500/90 text-white" };
  }
  if (stock <= 5) {
    return { label: `${stock} left`, className: "bg-amber-500/90 text-white" };
  }
  return {
    label: `${stock} in stock`,
    className: "bg-emerald-500/90 text-white",
  };
}

export default function HomePage() {
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

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at 25% 35%, rgba(201,162,39,0.4), transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(201,162,39,0.18), transparent 45%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
          <BrandLogo height={140} priority className="mb-5 drop-shadow-lg" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Netgen
          </h1>
          <p className="mt-3 max-w-md text-sm text-brand-light/90 sm:text-base">
            Discover products from local shop keepers — all in one place.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              All products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Browse everything available across Netgen shops
            </p>
          </div>
          {!loading && (
            <p className="text-sm font-medium text-slate-400">
              {products.length} item{products.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No products yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Check back soon for new listings
            </p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const stock = stockStyles(p.stock);
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-light hover:shadow-lg hover:shadow-ink/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-14 w-14 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    {p.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
                        {p.category}
                      </span>
                    )}
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${stock.className}`}
                    >
                      {stock.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-dark">
                      {p.name}
                    </h3>
                    <p className="mt-auto border-t border-slate-100 pt-3 text-lg font-bold tabular-nums text-slate-900">
                      Rs {p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
