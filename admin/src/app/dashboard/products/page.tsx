"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getShopProducts, deleteProduct } from "@/lib/products";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getShopProducts(user.uid);
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add and manage products in your shop
          </p>
        </div>
        <Link
          href="/dashboard/products/add"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="mb-1 font-medium text-slate-600">No products yet</p>
          <p className="mb-5 text-sm text-slate-500">
            Start by adding your first product to the shop.
          </p>
          <Link
            href="/dashboard/products/add"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              deleting={deletingId === p.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
