"use client";

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage, validateImageFile } from "@/lib/upload";
import type { ProductFormData } from "@/lib/types";

interface ProductFormProps {
  initial?: Partial<ProductFormData>;
  submitLabel: string;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Food & Grocery",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Other",
];

export default function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? ""));
  const [category, setCategory] = useState(initial?.category ?? "Other");
  const [existingImageUrl, setExistingImageUrl] = useState(initial?.imageUrl ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }
    setError("");
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setExistingImageUrl("");
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const priceNum = Number(price);
    const stockNum = Number(stock);

    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Enter a valid price");
      return;
    }
    if (Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setError("Enter a valid stock quantity");
      return;
    }
    if (!user) {
      setError("You must be logged in");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadProductImage(user.uid, imageFile);
      }

      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price: priceNum,
        stock: stockNum,
        category,
        imageUrl,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      if (
        message.includes("permission") ||
        message.includes("Permission")
      ) {
        setError(
          "Permission denied. Firebase Console → Firestore → Rules publish karo (firestore.rules)."
        );
      } else if (message.includes("Cloudinary")) {
        setError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Product Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="e.g. Cotton T-Shirt"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
          placeholder="Short product details..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Price (Rs) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="0"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? "bg-brand text-ink"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Product Image
        </label>
        <p className="mb-2 text-xs text-slate-500">
          JPG, PNG, WEBP or GIF · Max 5 MB · Best size 1200×900 (4:3)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Product preview"
              className="mx-auto max-h-56 w-full object-contain"
            />
            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-brand-dark hover:text-brand-dark"
              >
                Change image
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-slate-500 transition-colors hover:border-brand hover:bg-brand-muted/50 hover:text-brand-dark"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Click to upload from device</span>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60 transition-colors"
      >
        {loading ? (imageFile ? "Uploading..." : "Saving...") : submitLabel}
      </button>
    </form>
  );
}
