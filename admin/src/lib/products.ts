import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { Product, ProductFormData } from "./types";

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

export async function getShopProducts(shopKeeperId: string): Promise<Product[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, PRODUCTS),
    where("shopKeeperId", "==", shopKeeperId)
  );
  const snap = await getDocs(q);
  const products = snap.docs.map((d) => mapProduct(d.id, d.data()));
  return products.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(getFirebaseDb(), PRODUCTS, id));
  if (!snap.exists()) return null;
  return mapProduct(snap.id, snap.data());
}

export async function addProduct(
  shopKeeperId: string,
  data: ProductFormData
): Promise<string> {
  const now = Timestamp.now().toDate().toISOString();
  const ref = await addDoc(collection(getFirebaseDb(), PRODUCTS), {
    ...data,
    shopKeeperId,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), PRODUCTS, id), {
    ...data,
    updatedAt: Timestamp.now().toDate().toISOString(),
  });
}

export async function updateStock(id: string, stock: number): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), PRODUCTS, id), {
    stock,
    updatedAt: Timestamp.now().toDate().toISOString(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), PRODUCTS, id));
}
