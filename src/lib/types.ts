export type UserRole = "shopKeeper" | "user";

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  address: string;
  shopName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated use AppUser — kept for older imports */
export type ShopKeeper = AppUser;

export interface Product {
  id: string;
  shopKeeperId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<
  Product,
  "id" | "shopKeeperId" | "createdAt" | "updatedAt"
>;

export type OrderStatus = "on_the_way" | "completed";

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  shopKeeperId: string;
  sellerName: string;
  shopName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
