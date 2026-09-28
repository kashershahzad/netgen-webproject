"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { getProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

function stockStyles(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }
  if (stock <= 5) {
    return {
      label: `${stock} left`,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return {
    label: `${stock} in stock`,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then((p) => {
        if (!p) setError("Product not found");
        else setProduct(p);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load product")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const stock = stockStyles(product.stock);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-20 w-20 text-slate-300" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-dark">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {product.name}
          </h1>
          <p className="mt-3 text-3xl font-bold tabular-nums text-ink">
            Rs {product.price.toLocaleString()}
          </p>
          <span
            className={`mt-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${stock.className}`}
          >
            {stock.label}
          </span>

          {product.description ? (
            <p className="mt-6 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
              {product.description}
            </p>
          ) : (
            <p className="mt-6 text-sm italic text-slate-400">
              No description available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
