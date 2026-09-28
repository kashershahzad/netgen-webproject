"use client";

import Link from "next/link";
import { Pencil, Trash2, Package, ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  deleting?: boolean;
  onDelete: (id: string, name: string) => void;
}

function stockStyles(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of stock",
      className: "bg-red-500/90 text-white",
      text: "text-red-600",
    };
  }
  if (stock <= 5) {
    return {
      label: `${stock} left`,
      className: "bg-amber-500/90 text-white",
      text: "text-amber-600",
    };
  }
  return {
    label: `${stock} in stock`,
    className: "bg-emerald-500/90 text-white",
    text: "text-emerald-600",
  };
}

export default function ProductCard({
  product: p,
  deleting,
  onDelete,
}: ProductCardProps) {
  const stock = stockStyles(p.stock);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/5 hover:border-brand-light">
      <Link
        href={`/dashboard/products/${p.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
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

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
          {p.category}
        </span>

        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${stock.className}`}
        >
          {stock.label}
        </span>

        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-brand-dark opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/dashboard/products/${p.id}`} className="mb-1">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-brand-dark">
            {p.name}
          </h3>
        </Link>

        {p.description ? (
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {p.description}
          </p>
        ) : (
          <p className="mb-4 text-sm italic text-slate-400">No description</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Price
            </p>
            <p className="text-lg font-bold tabular-nums text-slate-900">
              Rs {p.price.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/products/${p.id}`}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand-muted transition-colors"
            >
              View
            </Link>
            <Link
              href={`/dashboard/products/${p.id}/edit`}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-dark transition-colors"
              title="Edit"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete(p.id, p.name);
              }}
              disabled={deleting}
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
