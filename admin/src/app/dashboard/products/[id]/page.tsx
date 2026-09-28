"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Tag,
  Boxes,
  Calendar,
  Banknote,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, deleteProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

function formatDate(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getProduct(id)
      .then((p) => {
        if (!p) {
          setError("Product not found");
          return;
        }
        if (user && p.shopKeeperId !== user.uid) {
          setError("You do not have access to this product");
          return;
        }
        setProduct(p);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      router.push("/dashboard/products");
    } catch {
      alert("Failed to delete product");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Link
          href="/dashboard/products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock <= 5
        ? "Low stock"
        : "In stock";
  const stockClass =
    product.stock === 0
      ? "bg-red-50 text-red-700 ring-red-200"
      : product.stock <= 5
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit Product
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 lg:border-r lg:border-slate-100">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="block h-auto w-full object-contain"
              />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center">
                <Package className="h-20 w-20 text-slate-300" />
              </div>
            )}
          </div>

          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Tag className="h-3 w-3" />
                {product.category}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${stockClass}`}
              >
                <Boxes className="h-3 w-3" />
                {stockLabel}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-bold tabular-nums text-brand-dark">
              Rs {product.price.toLocaleString()}
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {product.description || "No description added."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Boxes className="h-3.5 w-3.5" />
                    Stock quantity
                  </div>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    {product.stock}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Banknote className="h-3.5 w-3.5" />
                    Inventory value
                  </div>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    Rs {(product.price * product.stock).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Created</p>
                    <p className="text-slate-700">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Last updated
                    </p>
                    <p className="text-slate-700">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
