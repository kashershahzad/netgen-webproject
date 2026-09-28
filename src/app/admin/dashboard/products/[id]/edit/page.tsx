"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getProduct, updateProduct } from "@/lib/products";
import ProductForm from "@/components/ProductForm";
import type { Product, ProductFormData } from "@/lib/types";

export default function EditProductPage({
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

  const handleSubmit = async (data: ProductFormData) => {
    await updateProduct(id, data);
    router.push("/admin/dashboard/products");
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
          href="/admin/dashboard/products"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/dashboard/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Product</h1>
      <p className="text-sm text-slate-500 mb-8">Update details for {product.name}</p>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ProductForm
          initial={product}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
