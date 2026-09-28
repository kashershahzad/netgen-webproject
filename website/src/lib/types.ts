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
