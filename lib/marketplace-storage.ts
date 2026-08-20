import type { CartItem, UserProfile } from "@/lib/marketplace-types";

export type PrivateStoreKey = "cart" | "wishlist" | "orders" | "account" | "seller-products";

const STORAGE_VERSION = "zomax:v2";

export function userIdentity(user: UserProfile | null | undefined) {
  if (!user) return "guest";
  if (user.id?.trim()) return user.id.trim();
  if (user.email?.trim()) return `email:${user.email.trim().toLowerCase()}`;
  if (user.phone?.trim()) return `phone:${user.phone.replace(/\s+/g, "")}`;
  return `name:${(user.name || "anonymous").trim().toLowerCase()}`;
}

export function storageScope(user: UserProfile | null | undefined) {
  if (!user) return "guest";
  return `user:${encodeURIComponent(userIdentity(user))}`;
}

export function scopedStorageKey(scope: string, key: PrivateStoreKey) {
  return `${STORAGE_VERSION}:${scope}:${key}`;
}

export const sharedReviewsKey = `${STORAGE_VERSION}:shared:reviews`;
export const sessionUserKey = `${STORAGE_VERSION}:session-user`;
export const migrationMarkerKey = `${STORAGE_VERSION}:legacy-migrated`;

export function mergeCart(primary: CartItem[], incoming: CartItem[]) {
  const quantities = new Map<number, number>();
  for (const item of [...primary, ...incoming]) {
    if (!Number.isFinite(item.id) || !Number.isFinite(item.qty) || item.qty <= 0) continue;
    quantities.set(item.id, (quantities.get(item.id) || 0) + Math.floor(item.qty));
  }
  return [...quantities.entries()].map(([id, qty]) => ({ id, qty }));
}

export function mergeWishlist(primary: number[], incoming: number[]) {
  return [...new Set([...primary, ...incoming].filter((id) => Number.isFinite(id)))];
}
