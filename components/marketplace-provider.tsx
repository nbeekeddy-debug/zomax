"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = { id: number; qty: number };

type MarketplaceContextValue = {
  cart: CartItem[];
  wishlist: number[];
  addToCart: (id: number) => void;
  removeFromCart: (id: number) => void;
  setQuantity: (id: number, qty: number) => void;
  toggleWishlist: (id: number) => void;
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

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readLocal<CartItem[]>("zomax_cart", []));
    setWishlist(readLocal<number[]>("zomax_wishlist", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("zomax_cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("zomax_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const value = useMemo<MarketplaceContextValue>(() => ({
    cart,
    wishlist,
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
    toggleWishlist(id) {
      setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    },
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
  }), [cart, wishlist]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error("useMarketplace must be used inside MarketplaceProvider");
  return value;
}
