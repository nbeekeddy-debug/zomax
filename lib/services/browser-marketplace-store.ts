import type { Account, CartItem, Order, SellerListing } from "@/lib/marketplace-types";
import { scopedStorageKey, type PrivateStoreKey } from "@/lib/marketplace-storage";

export type PrivateSnapshot = {
  cart: CartItem[];
  wishlist: number[];
  orders: Order[];
  account: Account;
  sellerListings: SellerListing[];
};

const privateKeys: PrivateStoreKey[] = ["cart", "wishlist", "orders", "account", "seller-products"];

export function readBrowserValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeBrowserValue(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to persist ${key}`, error);
  }
}

export function readPrivateSnapshot(scope: string, useLegacyFallback = false): PrivateSnapshot {
  const fallback = <T,>(legacyKey: string, empty: T) => useLegacyFallback ? readBrowserValue<T>(legacyKey, empty) : empty;
  return {
    cart: readBrowserValue(scopedStorageKey(scope, "cart"), fallback("zomax_cart", [] as CartItem[])),
    wishlist: readBrowserValue(scopedStorageKey(scope, "wishlist"), fallback("zomax_wishlist", [] as number[])),
    orders: readBrowserValue(scopedStorageKey(scope, "orders"), fallback("zomax_orders", [] as Order[])),
    account: readBrowserValue(scopedStorageKey(scope, "account"), fallback("zomax_account", {} as Account)),
    sellerListings: readBrowserValue(scopedStorageKey(scope, "seller-products"), fallback("zomax_seller_products", [] as SellerListing[])),
  };
}

export function removePrivateSnapshot(scope: string) {
  if (typeof window === "undefined") return;
  for (const key of privateKeys) window.localStorage.removeItem(scopedStorageKey(scope, key));
}
