"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import type { Account, CartItem, Order, OrderItem, Review, ReviewsStore, SellerListing, UserProfile } from "@/lib/marketplace-types";
import {
  mergeCart,
  mergeWishlist,
  migrationMarkerKey,
  scopedStorageKey,
  sessionUserKey,
  sharedReviewsKey,
  storageScope,
  userIdentity,
  type PrivateStoreKey,
} from "@/lib/marketplace-storage";

type MarketplaceContextValue = {
  hydrated: boolean;
  cart: CartItem[];
  wishlist: number[];
  orders: Order[];
  account: Account;
  currentUser: UserProfile | null;
  reviews: ReviewsStore;
  sellerListings: SellerListing[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  setQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  placeOrder: (input: { total: number; customer: NonNullable<Order["customer"]>; paymentMethod: string; items?: OrderItem[] }) => Order;
  updateAccount: (patch: Partial<Account>) => void;
  replaceAccount: (account: Account) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  deactivateLocalAccount: () => void;
  addReview: (productId: number, input: Omit<Review, "createdAt" | "authorId">) => void;
  updateReview: (productId: number, index: number, input: Pick<Review, "rating" | "text">) => void;
  deleteReview: (productId: number, index: number) => void;
  saveSellerListing: (listing: Omit<Product, "id" | "rating" | "reviews">) => SellerListing;
  cartCount: number;
};

type PrivateSnapshot = {
  cart: CartItem[];
  wishlist: number[];
  orders: Order[];
  account: Account;
  sellerListings: SellerListing[];
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);
const privateKeys: PrivateStoreKey[] = ["cart", "wishlist", "orders", "account", "seller-products"];

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to persist ${key}`, error);
  }
}

function readPrivateSnapshot(scope: string, useLegacyFallback = false): PrivateSnapshot {
  const fallback = <T,>(legacyKey: string, empty: T) => useLegacyFallback ? readLocal<T>(legacyKey, empty) : empty;
  return {
    cart: readLocal(scopedStorageKey(scope, "cart"), fallback("zomax_cart", [] as CartItem[])),
    wishlist: readLocal(scopedStorageKey(scope, "wishlist"), fallback("zomax_wishlist", [] as number[])),
    orders: readLocal(scopedStorageKey(scope, "orders"), fallback("zomax_orders", [] as Order[])),
    account: readLocal(scopedStorageKey(scope, "account"), fallback("zomax_account", {} as Account)),
    sellerListings: readLocal(scopedStorageKey(scope, "seller-products"), fallback("zomax_seller_products", [] as SellerListing[])),
  };
}

function removePrivateSnapshot(scope: string) {
  for (const key of privateKeys) window.localStorage.removeItem(scopedStorageKey(scope, key));
}

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [scope, setScope] = useState("guest");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [account, setAccount] = useState<Account>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewsStore>({});
  const [sellerListings, setSellerListings] = useState<SellerListing[]>([]);
  const [hydrated, setHydrated] = useState(false);

  function applyPrivateSnapshot(next: PrivateSnapshot) {
    setCart(next.cart);
    setWishlist(next.wishlist);
    setOrders(next.orders);
    setAccount(next.account);
    setSellerListings(next.sellerListings);
  }

  useEffect(() => {
    const legacyMigrated = window.localStorage.getItem(migrationMarkerKey) === "1";
    const legacyUser = legacyMigrated ? null : readLocal<UserProfile | null>("zomax_currentUser", null);
    const sessionUser = readLocal<UserProfile | null>(sessionUserKey, legacyUser);
    const initialScope = storageScope(sessionUser);

    setCurrentUser(sessionUser);
    setScope(initialScope);
    applyPrivateSnapshot(readPrivateSnapshot(initialScope, !legacyMigrated));
    setReviews(readLocal<ReviewsStore>(sharedReviewsKey, readLocal<ReviewsStore>("zomax_reviews", {})));

    if (!legacyMigrated) {
      window.localStorage.setItem(migrationMarkerKey, "1");
      window.localStorage.removeItem("zomax_currentUser");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocal(scopedStorageKey(scope, "cart"), cart);
    writeLocal(scopedStorageKey(scope, "wishlist"), wishlist);
    writeLocal(scopedStorageKey(scope, "orders"), orders);
    writeLocal(scopedStorageKey(scope, "account"), account);
    writeLocal(scopedStorageKey(scope, "seller-products"), sellerListings);
    writeLocal(sharedReviewsKey, reviews);
    if (currentUser) writeLocal(sessionUserKey, currentUser);
    else window.localStorage.removeItem(sessionUserKey);
  }, [account, cart, currentUser, hydrated, orders, reviews, scope, sellerListings, wishlist]);

  useEffect(() => {
    function syncAcrossTabs(event: StorageEvent) {
      if (!event.key) return;

      if (event.key === sessionUserKey) {
        const nextUser = readLocal<UserProfile | null>(sessionUserKey, null);
        const nextScope = storageScope(nextUser);
        setCurrentUser(nextUser);
        setScope(nextScope);
        applyPrivateSnapshot(readPrivateSnapshot(nextScope));
        return;
      }

      if (event.key === sharedReviewsKey) {
        setReviews(readLocal(sharedReviewsKey, {}));
        return;
      }

      if (event.key === scopedStorageKey(scope, "cart")) setCart(readLocal(event.key, []));
      if (event.key === scopedStorageKey(scope, "wishlist")) setWishlist(readLocal(event.key, []));
      if (event.key === scopedStorageKey(scope, "orders")) setOrders(readLocal(event.key, []));
      if (event.key === scopedStorageKey(scope, "account")) setAccount(readLocal(event.key, {}));
      if (event.key === scopedStorageKey(scope, "seller-products")) setSellerListings(readLocal(event.key, []));
    }

    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, [scope]);

  const value = useMemo<MarketplaceContextValue>(() => ({
    hydrated,
    cart,
    wishlist,
    orders,
    account,
    currentUser,
    reviews,
    sellerListings,
    addToCart(id) {
      setCart((items) => {
        const existing = items.find((item) => item.id === id);
        return existing
          ? items.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)
          : [...items, { id, qty: 1 }];
      });
    },
    removeFromCart(id) {
      setCart((items) => items.filter((item) => item.id !== id));
    },
    setQuantity(id, qty) {
      if (qty <= 0) {
        setCart((items) => items.filter((item) => item.id !== id));
        return;
      }
      setCart((items) => items.map((item) => item.id === id ? { ...item, qty } : item));
    },
    clearCart() {
      setCart([]);
    },
    toggleWishlist(id) {
      setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    },
    placeOrder({ total, customer, paymentMethod, items }) {
      const order: Order = {
        id: `ZMX-${Date.now().toString(36).toUpperCase()}`,
        items: items?.map((item) => ({ ...item })) || cart.map((item) => ({ ...item })),
        total,
        customer,
        paymentMethod,
        status: "Placed",
        date: new Date().toLocaleString("en-NG"),
      };
      setOrders((existing) => [order, ...existing]);
      setCart([]);
      return order;
    },
    updateAccount(patch) {
      setAccount((value) => ({ ...value, ...patch }));
    },
    replaceAccount(nextAccount) {
      setAccount(nextAccount);
    },
    login(user) {
      const nextScope = storageScope(user);
      if (nextScope === scope) {
        setCurrentUser(user);
        setAccount((value) => ({
          ...value,
          name: value.name || user.name,
          email: value.email || user.email,
          phone: value.phone || user.phone,
          memberSince: value.memberSince || new Date().toISOString().slice(0, 10),
        }));
        return;
      }

      const next = readPrivateSnapshot(nextScope);
      const fromGuest = scope === "guest";
      const mergedCart = fromGuest ? mergeCart(next.cart, cart) : next.cart;
      const mergedWishlist = fromGuest ? mergeWishlist(next.wishlist, wishlist) : next.wishlist;

      if (fromGuest) {
        writeLocal(scopedStorageKey("guest", "cart"), []);
        writeLocal(scopedStorageKey("guest", "wishlist"), []);
      }

      applyPrivateSnapshot({
        ...next,
        cart: mergedCart,
        wishlist: mergedWishlist,
        account: {
          ...next.account,
          name: next.account.name || user.name,
          email: next.account.email || user.email,
          phone: next.account.phone || user.phone,
          memberSince: next.account.memberSince || new Date().toISOString().slice(0, 10),
        },
      });
      setScope(nextScope);
      setCurrentUser(user);
    },
    logout() {
      const guest = readPrivateSnapshot("guest");
      applyPrivateSnapshot(guest);
      setScope("guest");
      setCurrentUser(null);
    },
    deactivateLocalAccount() {
      if (scope !== "guest") removePrivateSnapshot(scope);
      applyPrivateSnapshot(readPrivateSnapshot("guest"));
      setScope("guest");
      setCurrentUser(null);
    },
    addReview(productId, input) {
      if (!currentUser) return;
      const id = String(productId);
      const review: Review = {
        ...input,
        authorId: userIdentity(currentUser),
        createdAt: Date.now(),
      };
      setReviews((store) => ({ ...store, [id]: [...(store[id] || []), review] }));
    },
    updateReview(productId, index, input) {
      if (!currentUser) return;
      const id = String(productId);
      const ownerId = userIdentity(currentUser);
      setReviews((store) => ({
        ...store,
        [id]: (store[id] || []).map((review, reviewIndex) =>
          reviewIndex === index && review.authorId === ownerId ? { ...review, ...input } : review
        ),
      }));
    },
    deleteReview(productId, index) {
      if (!currentUser) return;
      const id = String(productId);
      const ownerId = userIdentity(currentUser);
      setReviews((store) => ({
        ...store,
        [id]: (store[id] || []).filter((review, reviewIndex) => reviewIndex !== index || review.authorId !== ownerId),
      }));
    },
    saveSellerListing(listing) {
      if (!currentUser) throw new Error("Sign in before creating a seller listing.");
      const product: SellerListing = {
        ...listing,
        id: Date.now(),
        rating: 0,
        reviews: 0,
        ownerId: userIdentity(currentUser),
      };
      setSellerListings((items) => [product, ...items]);
      return product;
    },
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
  }), [account, cart, currentUser, hydrated, orders, reviews, scope, sellerListings, wishlist]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error("useMarketplace must be used inside MarketplaceProvider");
  return value;
}
