"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import type { Account, CartItem, Order, Review, ReviewsStore, SellerListing, UserProfile } from "@/lib/marketplace-types";

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
  placeOrder: (input: { total: number; customer: NonNullable<Order["customer"]>; paymentMethod: string }) => Order;
  updateAccount: (patch: Partial<Account>) => void;
  replaceAccount: (account: Account) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  deactivateLocalAccount: () => void;
  addReview: (productId: number, input: Omit<Review, "createdAt">) => void;
  updateReview: (productId: number, index: number, input: Pick<Review, "rating" | "text">) => void;
  deleteReview: (productId: number, index: number) => void;
  saveSellerListing: (listing: Omit<Product, "id" | "rating" | "reviews">) => Product;
  cartCount: number;
};

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

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

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [account, setAccount] = useState<Account>({});
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewsStore>({});
  const [sellerListings, setSellerListings] = useState<SellerListing[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readLocal<CartItem[]>("zomax_cart", []));
    setWishlist(readLocal<number[]>("zomax_wishlist", []));
    setOrders(readLocal<Order[]>("zomax_orders", []));
    setAccount(readLocal<Account>("zomax_account", {}));
    setCurrentUser(readLocal<UserProfile | null>("zomax_currentUser", null));
    setReviews(readLocal<ReviewsStore>("zomax_reviews", {}));
    setSellerListings(readLocal<SellerListing[]>("zomax_seller_products", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeLocal("zomax_cart", cart);
    writeLocal("zomax_wishlist", wishlist);
    writeLocal("zomax_orders", orders);
    writeLocal("zomax_account", account);
    if (currentUser) writeLocal("zomax_currentUser", currentUser);
    else window.localStorage.removeItem("zomax_currentUser");
    writeLocal("zomax_reviews", reviews);
    writeLocal("zomax_seller_products", sellerListings);
  }, [account, cart, currentUser, hydrated, orders, reviews, sellerListings, wishlist]);

  useEffect(() => {
    function syncAcrossTabs(event: StorageEvent) {
      if (!event.key) return;
      if (event.key === "zomax_cart") setCart(readLocal("zomax_cart", []));
      if (event.key === "zomax_wishlist") setWishlist(readLocal("zomax_wishlist", []));
      if (event.key === "zomax_orders") setOrders(readLocal("zomax_orders", []));
      if (event.key === "zomax_account") setAccount(readLocal("zomax_account", {}));
      if (event.key === "zomax_currentUser") setCurrentUser(readLocal("zomax_currentUser", null));
      if (event.key === "zomax_reviews") setReviews(readLocal("zomax_reviews", {}));
      if (event.key === "zomax_seller_products") setSellerListings(readLocal("zomax_seller_products", []));
    }
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

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
    placeOrder({ total, customer, paymentMethod }) {
      const order: Order = {
        id: `ZMX-${Date.now().toString(36).toUpperCase()}`,
        items: cart.map((item) => ({ ...item })),
        total,
        customer,
        paymentMethod,
        status: "Placed",
        date: new Date().toLocaleString("en-NG"),
      };
      setOrders((items) => [order, ...items]);
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
      setCurrentUser(user);
      setAccount((value) => ({
        ...value,
        name: value.name || user.name,
        email: value.email || user.email,
        memberSince: value.memberSince || new Date().toISOString().slice(0, 10),
      }));
    },
    logout() {
      setCurrentUser(null);
    },
    deactivateLocalAccount() {
      setCurrentUser(null);
      setAccount({});
    },
    addReview(productId, input) {
      const id = String(productId);
      setReviews((store) => ({
        ...store,
        [id]: [...(store[id] || []), { ...input, createdAt: Date.now() }],
      }));
    },
    updateReview(productId, index, input) {
      const id = String(productId);
      setReviews((store) => ({
        ...store,
        [id]: (store[id] || []).map((review, reviewIndex) => reviewIndex === index ? { ...review, ...input } : review),
      }));
    },
    deleteReview(productId, index) {
      const id = String(productId);
      setReviews((store) => ({
        ...store,
        [id]: (store[id] || []).filter((_, reviewIndex) => reviewIndex !== index),
      }));
    },
    saveSellerListing(listing) {
      const product: Product = { ...listing, id: Date.now(), rating: 0, reviews: 0 };
      setSellerListings((items) => [product, ...items]);
      return product;
    },
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
  }), [account, cart, currentUser, hydrated, orders, reviews, sellerListings, wishlist]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error("useMarketplace must be used inside MarketplaceProvider");
  return value;
}
