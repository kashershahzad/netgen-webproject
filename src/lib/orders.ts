import {
  collection,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  runTransaction,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";
import type { AppUser, Order, OrderStatus, Product } from "./types";

const ORDERS = "orders";
const PRODUCTS = "products";
const USERS = "users";

function mapOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    productId: String(data.productId ?? ""),
    productName: String(data.productName ?? ""),
    productImage: String(data.productImage ?? ""),
    price: Number(data.price ?? 0),
    quantity: Number(data.quantity ?? 1),
    shopKeeperId: String(data.shopKeeperId ?? ""),
    sellerName: String(data.sellerName ?? ""),
    shopName: String(data.shopName ?? ""),
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? ""),
    customerEmail: String(data.customerEmail ?? ""),
    customerPhone: String(data.customerPhone ?? ""),
    customerAddress: String(data.customerAddress ?? ""),
    status: (data.status as OrderStatus) || "on_the_way",
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

export async function getSellerProfile(
  shopKeeperId: string
): Promise<AppUser | null> {
  const snap = await getDoc(doc(getFirebaseDb(), USERS, shopKeeperId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: shopKeeperId,
    email: String(data.email ?? ""),
    role: "shopKeeper",
    name: String(data.name ?? data.ownerName ?? ""),
    phone: String(data.phone ?? ""),
    address: String(data.address ?? ""),
    shopName: String(data.shopName ?? ""),
    description: String(data.description ?? ""),
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const q = query(
    collection(getFirebaseDb(), ORDERS),
    where("customerId", "==", customerId)
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => mapOrder(d.id, d.data()));
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function placeOrder(input: {
  product: Product;
  sellerName: string;
  shopName: string;
  customer: {
    uid: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}): Promise<string> {
  const db = getFirebaseDb();
  const productRef = doc(db, PRODUCTS, input.product.id);
  const now = Timestamp.now().toDate().toISOString();

  const orderId = await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);
    if (!productSnap.exists()) throw new Error("Product not found");

    const stock = Number(productSnap.data().stock ?? 0);
    if (stock < 1) throw new Error("This product is out of stock");

    const orderRef = doc(collection(db, ORDERS));
    tx.set(orderRef, {
      productId: input.product.id,
      productName: input.product.name,
      productImage: input.product.imageUrl,
      price: input.product.price,
      quantity: 1,
      shopKeeperId: input.product.shopKeeperId,
      sellerName: input.sellerName,
      shopName: input.shopName,
      customerId: input.customer.uid,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      customerAddress: input.customer.address,
      status: "on_the_way" satisfies OrderStatus,
      createdAt: now,
      updatedAt: now,
    });

    tx.update(productRef, {
      stock: stock - 1,
      updatedAt: now,
    });

    return orderRef.id;
  });

  return orderId;
}

export async function getShopOrders(shopKeeperId: string): Promise<Order[]> {
  const q = query(
    collection(getFirebaseDb(), ORDERS),
    where("shopKeeperId", "==", shopKeeperId)
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map((d) => mapOrder(d.id, d.data()));
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function completeOrder(orderId: string): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), ORDERS, orderId), {
    status: "completed" satisfies OrderStatus,
    updatedAt: Timestamp.now().toDate().toISOString(),
  });
}
