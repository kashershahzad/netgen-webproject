"use client";

import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";

interface StoreProductCardProps {
  product: Product;
}

function stockStyles(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "bg-red-500/90 text-white",
    };
  }
  if (stock <= 5) {
    return {
      label: `${stock} left`,
      className: "bg-amber-500/90 text-white",
    };
  }
  return {
    label: `${stock} in stock`,
    className: "bg-emerald-500/90 text-white",
  };
}

export default function StoreProductCard({ product: p }: StoreProductCardProps) {
  const stock = stockStyles(p.stock);

  return (
    <Link
      href={`/products/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-light hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="relative block aspect-[4/3] overflow-hidden bg-brand-muted/40">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-14 w-14 text-black/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {p.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink shadow-sm backdrop-blur">
            {p.category}
          </span>
        )}

        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${stock.className}`}
        >
          {stock.label}
        </span>

        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-brand-dark opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-base font-semibold tracking-tight text-ink transition-colors group-hover:text-brand-dark">
          {p.name}
        </h3>

        {p.description ? (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink/50">
            {p.description}
          </p>
        ) : (
          <p className="mb-4 text-sm italic text-ink/35">No description</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-black/5 pt-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink/40">
              Price
            </p>
            <p className="text-lg font-bold tabular-nums text-ink">
              Rs {p.price.toLocaleString()}
            </p>
          </div>
          <span className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-dark transition-colors group-hover:bg-brand-muted">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
