"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Package,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { completeOrder, getShopOrders } from "@/lib/orders";
import type { Order } from "@/lib/types";

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

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadOrders = async (uid: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getShopOrders(uid);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadOrders(user.uid);
  }, [user]);

  const handleComplete = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await completeOrder(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "completed", updatedAt: new Date().toISOString() }
            : o
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete order");
    } finally {
      setUpdatingId("");
    }
  };

  const onTheWay = orders.filter((o) => o.status === "on_the_way");
  const completed = orders.filter((o) => o.status === "completed");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customer orders for your shop — mark as complete when delivered
        </p>
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

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <ClipboardList className="mb-3 h-12 w-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No orders yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Orders will appear here when customers buy your products
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Truck className="h-4 w-4 text-amber-600" />
                On the way
              </div>
              <p className="text-2xl font-bold text-slate-900">{onTheWay.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Completed
              </div>
              <p className="text-2xl font-bold text-slate-900">{completed.length}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">All orders</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {order.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={order.productImage}
                          alt={order.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {order.productName}
                      </p>
                      <p className="mt-0.5 text-sm tabular-nums text-slate-700">
                        Rs {order.price.toLocaleString()} × {order.quantity}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Customer:{" "}
                        <span className="font-medium">{order.customerName}</span>
                      </p>
                      {(order.customerPhone || order.customerAddress) && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {[order.customerPhone, order.customerAddress]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        order.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status === "completed" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Truck className="h-3.5 w-3.5" />
                          On the way
                        </>
                      )}
                    </span>

                    {order.status === "on_the_way" && (
                      <button
                        type="button"
                        onClick={() => handleComplete(order.id)}
                        disabled={updatingId === order.id}
                        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-light disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? "Updating..."
                          : "Mark complete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
