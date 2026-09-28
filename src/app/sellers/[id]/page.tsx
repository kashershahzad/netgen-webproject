"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Package,
  Phone,
  Store,
  User,
} from "lucide-react";
import StoreProductCard from "@/components/StoreProductCard";
import { getSellerProfile } from "@/lib/orders";
import { getShopProducts } from "@/lib/products";
import type { AppUser, Product } from "@/lib/types";

export default function SellerProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [seller, setSeller] = useState<AppUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([getSellerProfile(id), getShopProducts(id)])
      .then(([profile, shopProducts]) => {
        if (!profile) {
          setError("Seller not found");
          return;
        }
        setSeller(profile);
        setProducts(shopProducts);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load seller")
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/#products"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Seller not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/#products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="mb-10 overflow-hidden rounded-2xl border border-black/10 bg-white">
        <div className="border-b border-black/5 bg-brand-muted/30 px-6 py-8 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-ink">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
                {seller.shopName || seller.name}
              </h1>
              {seller.shopName && (
                <p className="mt-1 text-sm text-ink/55">Owner: {seller.name}</p>
              )}
              {seller.description && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">
                  {seller.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          <div className="rounded-xl border border-black/5 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/40">
              <User className="h-3.5 w-3.5" />
              Name
            </div>
            <p className="font-medium text-ink">{seller.name || "—"}</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/40">
              <Mail className="h-3.5 w-3.5" />
              Email
            </div>
            <p className="break-all font-medium text-ink">{seller.email || "—"}</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/40">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </div>
            <p className="font-medium text-ink">{seller.phone || "—"}</p>
          </div>
          <div className="rounded-xl border border-black/5 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink/40">
              <MapPin className="h-3.5 w-3.5" />
              Address
            </div>
            <p className="font-medium text-ink">{seller.address || "—"}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Products</h2>
          <p className="mt-1 text-sm text-ink/50">
            All listings from this seller
          </p>
        </div>
        <p className="text-sm text-ink/40">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Package className="mb-3 h-12 w-12 text-ink/20" />
          <p className="text-sm font-medium text-ink/70">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <StoreProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
