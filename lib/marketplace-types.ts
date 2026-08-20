import type { Product } from "@/lib/products";

export type CartItem = { id: number; qty: number };
export type UserProfile = { name?: string; email?: string };

export type StoreInfo = {
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeLocation?: string;
  storeDescription?: string;
  storeLogo?: string;
  businessType?: "Individual" | "Business" | "Enterprise";
  storeHours?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  taxId?: string;
  bankAccount?: string;
};

export type Account = {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  addresses?: Array<{ label?: string; address: string }>;
  paymentMethod?: string;
  paymentMethods?: Array<{ label?: string; type?: string; last4?: string }>;
  memberSince?: string;
  preferences?: { newsletter?: boolean };
  storeInfo?: StoreInfo;
};

export type Order = {
  id: string | number;
  items: CartItem[];
  total?: number;
  customer?: { name?: string; email?: string; address?: string };
  paymentMethod?: string;
  status?: string;
  date?: string;
};

export type Review = {
  author: string;
  rating: number;
  text: string;
  createdAt: number;
};

export type ReviewsStore = Record<string, Review[]>;
export type SellerListing = Product;
