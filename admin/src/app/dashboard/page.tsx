"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Boxes, Plus, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getShopProducts } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getShopProducts(user.uid)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock = products.filter((p) => p.stock === 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "bg-brand-muted text-brand-dark",
    },
    {
      label: "Total Stock Units",
      value: totalStock,
      icon: Boxes,
      color: "bg-sky-50 text-sky-700",
    },
    {
      label: "Inventory Value",
      value: `Rs ${inventoryValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.ownerName || "Shop Keeper"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {profile?.shopName
              ? `${profile.shopName} — overview of your shop`
              : "Overview of your shop"}
          </p>
        </div>
        <Link
          href="/dashboard/products/add"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className={`rounded-lg p-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          {outOfStock.length > 0 && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
              <p className="text-sm font-medium text-red-800">
                {outOfStock.length} product{outOfStock.length > 1 ? "s" : ""} out
                of stock:{" "}
                {outOfStock.map((p) => p.name).join(", ")}
              </p>
              <Link
                href="/dashboard/stock"
                className="text-sm font-semibold text-red-700 underline mt-1 inline-block"
              >
                Update stock →
              </Link>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Recent Products</h2>
              <Link
                href="/dashboard/products"
                className="text-sm font-medium text-brand-dark hover:text-brand-dark"
              >
                View all
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-4">
                  No products yet. Add your first product to get started.
                </p>
                <Link
                  href="/dashboard/products/add"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-dark"
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Price</th>
                      <th className="px-5 py-3 font-medium">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-slate-900">
                          {p.name}
                        </td>
                        <td className="px-5 py-3 text-slate-500">{p.category}</td>
                        <td className="px-5 py-3 text-slate-700">
                          Rs {p.price.toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              p.stock === 0
                                ? "bg-red-50 text-red-700"
                                : p.stock <= 5
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
