"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";

export function SiteHeader() {
  const { cartCount, wishlist } = useMarketplace();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-slate-950">
          zomax<span className="text-orange-500">.</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm font-bold text-slate-600 md:gap-5">
          <Link href="/shop" className="hover:text-orange-500">Shop</Link>
          <Link href="/seller" className="hover:text-orange-500">Seller</Link>
          <Link href="/sell" className="hover:text-orange-500">Sell</Link>
          <Link href="/wishlist" className="rounded-full bg-slate-100 px-3 py-2 hover:bg-orange-50 hover:text-orange-600">
            Saved {wishlist.length ? `(${wishlist.length})` : ""}
          </Link>
          <Link href="/cart" className="rounded-full bg-orange-500 px-3 py-2 text-white hover:bg-orange-600">
            Cart {cartCount ? `(${cartCount})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
