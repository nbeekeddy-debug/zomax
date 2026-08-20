"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";

export function SiteHeader() {
  const { cartCount, wishlist, currentUser } = useMarketplace();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-slate-950">
          zomax<span className="text-orange-500">.</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-xs font-bold text-slate-600 sm:gap-2 md:gap-4 md:text-sm">
          <Link href="/shop" className="rounded-xl px-2 py-2 hover:bg-orange-50 hover:text-orange-500">Shop</Link>
          <Link href="/seller" className="hidden rounded-xl px-2 py-2 hover:bg-orange-50 hover:text-orange-500 sm:inline-block">Seller</Link>
          <Link href="/wishlist" className="rounded-xl bg-slate-100 px-2.5 py-2 hover:bg-orange-50 hover:text-orange-600">
            Saved{wishlist.length ? ` ${wishlist.length}` : ""}
          </Link>
          <Link href="/cart" className="rounded-xl bg-orange-500 px-2.5 py-2 text-white hover:bg-orange-600">
            Cart{cartCount ? ` ${cartCount}` : ""}
          </Link>
          <Link href={currentUser ? "/account" : "/login"} className="hidden rounded-xl border border-slate-200 px-3 py-2 hover:border-orange-200 hover:text-orange-600 md:inline-block">
            {currentUser ? currentUser.name || "Account" : "Login"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
