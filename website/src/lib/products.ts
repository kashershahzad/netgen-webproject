import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Product } from "./types";

const PRODUCTS = "products";

function mapProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    shopKeeperId: String(data.shopKeeperId ?? ""),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    price: Number(data.price ?? 0),
    stock: Number(data.stock ?? 0),
    category: String(data.category ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(collection(getFirebaseDb(), PRODUCTS));
  const products = snap.docs.map((d) => mapProduct(d.id, d.data()));
  return products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getFirebaseDb(), PRODUCTS, id));
  if (!snap.exists()) return null;
  return mapProduct(snap.id, snap.data());
}
