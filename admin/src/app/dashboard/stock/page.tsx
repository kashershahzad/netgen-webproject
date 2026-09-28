"use client";

import { useEffect, useState } from "react";
import { Boxes, Minus, Plus, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getShopProducts, updateStock } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function StockPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  /** Draft values as strings so empty input is allowed while typing */
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    getShopProducts(user.uid)
      .then((list) => {
        setProducts(list);
        const map: Record<string, string> = {};
        list.forEach((p) => {
          map[p.id] = String(p.stock);
        });
        setDrafts(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const parseDraft = (id: string): number => {
    const raw = drafts[id];
    if (raw === undefined || raw.trim() === "") return 0;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) || n < 0 ? 0 : n;
  };

  const adjust = (id: string, delta: number) => {
    setDrafts((prev) => {
      const current =
        prev[id] === undefined || prev[id].trim() === ""
          ? 0
          : parseInt(prev[id], 10) || 0;
      return {
        ...prev,
        [id]: String(Math.max(0, current + delta)),
      };
    });
  };

  const setValue = (id: string, value: string) => {
    // Allow empty while typing; only keep digits
    if (value === "") {
      setDrafts((prev) => ({ ...prev, [id]: "" }));
      return;
    }
    if (!/^\d+$/.test(value)) return;
    setDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const save = async (id: string) => {
    const stock = parseDraft(id);
    setSavingId(id);
    setMessage("");
    try {
      await updateStock(id, stock);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock } : p))
      );
      setDrafts((prev) => ({ ...prev, [id]: String(stock) }));
      setMessage("Stock updated successfully");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to update stock");
    } finally {
      setSavingId(null);
    }
  };

  const hasChange = (p: Product) => {
    const draft = drafts[p.id];
    if (draft === undefined || draft.trim() === "") return p.stock !== 0;
    return parseInt(draft, 10) !== p.stock;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Stock Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update inventory quantities for your products
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
          <Boxes className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No products to manage</p>
          <p className="text-sm text-slate-500 mt-1">
            Add products first, then manage their stock here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Current</th>
                  <th className="px-5 py-3 font-medium">Adjust Stock</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{p.category}</td>
                    <td className="px-5 py-4">
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
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjust(p.id, -1)}
                          className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 text-slate-600"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={drafts[p.id] ?? String(p.stock)}
                          onChange={(e) => setValue(p.id, e.target.value)}
                          placeholder="0"
                          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={() => adjust(p.id, 1)}
                          className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 text-slate-600"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => save(p.id)}
                        disabled={!hasChange(p) || savingId === p.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-ink hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingId === p.id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
