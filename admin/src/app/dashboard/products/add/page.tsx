"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { addProduct } from "@/lib/products";
import ProductForm from "@/components/ProductForm";
import type { ProductFormData } from "@/lib/types";

export default function AddProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: ProductFormData) => {
    if (!user) throw new Error("Not authenticated");
    await addProduct(user.uid, data);
    router.push("/dashboard/products");
  };

  return (
    <div>
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Add Product</h1>
      <p className="text-sm text-slate-500 mb-8">
        Add a new product to your shop inventory
      </p>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ProductForm submitLabel="Add Product" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
