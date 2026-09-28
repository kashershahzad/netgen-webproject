"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  Truck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCustomerOrders } from "@/lib/orders";
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

export default function CustomerOrdersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== "user") {
      router.replace("/login?next=/orders");
      return;
    }

    getCustomerOrders(user.uid)
      .then(setOrders)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders")
      )
      .finally(() => setLoading(false));
  }, [user, profile, authLoading, router]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">My Orders</h1>
        <p className="mt-1 text-sm text-ink/50">
          Track the status of products you ordered
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

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <ClipboardList className="mb-3 h-12 w-12 text-ink/20" />
          <p className="text-sm font-medium text-ink/70">No orders yet</p>
          <p className="mt-1 text-sm text-ink/40">
            Browse products and place your first order
          </p>
          <Link
            href="/#products"
            className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-light"
          >
            Browse products
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="divide-y divide-black/5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-muted/40">
                    {order.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-6 w-6 text-ink/20" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/products/${order.productId}`}
                      className="truncate font-semibold text-ink hover:text-brand-dark"
                    >
                      {order.productName}
                    </Link>
                    <p className="mt-0.5 text-sm tabular-nums text-ink/70">
                      Rs {order.price.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-ink/55">
                      Seller:{" "}
                      <Link
                        href={`/sellers/${order.shopKeeperId}`}
                        className="font-medium text-brand-dark hover:underline"
                      >
                        {order.sellerName || order.shopName || "Shop"}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs text-ink/40">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
