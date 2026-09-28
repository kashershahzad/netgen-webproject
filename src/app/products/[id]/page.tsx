"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Tag,
  Boxes,
  Banknote,
  Store,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct } from "@/lib/products";
import { getSellerProfile, placeOrder } from "@/lib/orders";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState("");

  const isCustomer = Boolean(user && profile?.role === "user");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProduct(id)
      .then(async (p) => {
        if (!p) {
          setError("Product not found");
          return;
        }
        setProduct(p);
        const seller = await getSellerProfile(p.shopKeeperId);
        setSellerName(seller?.name || "Shop keeper");
        setShopName(seller?.shopName || "");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load product")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    setOrderError("");
    setOrderMessage("");

    if (authLoading) return;

    if (!user || !isCustomer) {
      router.push(`/login?next=/products/${id}`);
      return;
    }

    if (!product) return;
    if (product.stock < 1) {
      setOrderError("This product is out of stock");
      return;
    }

    setOrdering(true);
    try {
      await placeOrder({
        product,
        sellerName,
        shopName,
        customer: {
          uid: user.uid,
          name: profile?.name || user.displayName || "Customer",
          email: profile?.email || user.email || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
        },
      });
      setProduct((prev) =>
        prev ? { ...prev, stock: Math.max(0, prev.stock - 1) } : prev
      );
      setOrderMessage("Order placed! Status: On the way");
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : "Failed to place order"
      );
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/#products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink"
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <Link
          href="/#products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
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
              {product.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Tag className="h-3 w-3" />
                  {product.category}
                </span>
              )}
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

            <Link
              href={`/sellers/${product.shopKeeperId}`}
              className="mt-5 block space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-brand/40 hover:bg-brand-muted/30"
            >
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <UserIcon className="h-4 w-4 text-brand-dark" />
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Seller
                </span>
                <span className="font-semibold">{sellerName}</span>
              </div>
              {shopName && (
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Store className="h-4 w-4 text-brand-dark" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Shop
                  </span>
                  <span className="font-semibold">{shopName}</span>
                </div>
              )}
              <p className="text-xs font-medium text-brand-dark">
                View seller profile →
              </p>
            </Link>

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
                    Price
                  </div>
                  <p className="text-xl font-bold tabular-nums text-slate-900">
                    Rs {product.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {orderMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {orderMessage}
                </div>
              )}
              {orderError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {orderError}
                </div>
              )}

              <button
                type="button"
                onClick={handleOrder}
                disabled={ordering || product.stock < 1}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <ShoppingBag className="h-4 w-4" />
                {product.stock < 1
                  ? "Out of stock"
                  : ordering
                    ? "Placing order..."
                    : "Order now"}
              </button>

              {!authLoading && !isCustomer && (
                <p className="text-xs text-slate-500">
                  <Link href="/login" className="font-medium text-brand-dark hover:underline">
                    Sign in
                  </Link>{" "}
                  as a customer to place an order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
