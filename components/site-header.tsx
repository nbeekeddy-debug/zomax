"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { categories } from "@/lib/products";

export function SiteHeader() {
  const { cartCount, wishlist, currentUser } = useMarketplace();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#fffaf5]/95 backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" />

      <div className="mx-auto flex max-w-[1480px] items-center gap-3 px-3 py-3 md:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-2xl px-2 py-1.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-sm transition group-hover:-rotate-3">Z</span>
          <span className="hidden text-2xl font-black tracking-[-0.04em] text-slate-950 sm:block">zomax<span className="text-orange-500">.</span></span>
        </Link>

        <form action="/shop" method="get" className="mx-auto flex min-w-0 max-w-2xl flex-1 items-center rounded-[22px] border border-slate-200 bg-white p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100">
          <span className="pl-3 text-slate-400">⌕</span>
          <input name="q" type="search" placeholder="Find products, sellers or locations" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400" />
          <button type="submit" className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-orange-600 sm:text-sm">Search</button>
        </form>

        <nav className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-700 sm:gap-2">
          <Link href={currentUser ? "/account" : "/login"} className="hidden rounded-2xl px-3 py-2 hover:bg-white hover:text-orange-600 md:block">
            <span className="block text-[10px] font-semibold text-slate-400">{currentUser ? `Hi, ${currentUser.name?.split(" ")[0] || "there"}` : "Welcome"}</span>
            <span>{currentUser ? "Account" : "Sign in"}</span>
          </Link>
          <Link href="/wishlist" className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white text-lg shadow-sm ring-1 ring-slate-200 hover:text-orange-600" aria-label="Wishlist">
            ♡
            {wishlist.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{wishlist.length}</span> : null}
          </Link>
          <Link href="/cart" className="relative flex h-10 items-center gap-2 rounded-2xl bg-orange-500 px-3 text-white shadow-sm hover:bg-orange-600">
            <span>◫</span><span className="hidden sm:inline">Cart</span>
            {cartCount ? <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{cartCount}</span> : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-200/70 bg-white/80">
        <nav className="mx-auto flex max-w-[1480px] items-center gap-2 overflow-x-auto px-3 py-2 text-xs font-bold md:px-6">
          <Link href="/shop" className="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-white">Discover</Link>
          {categories.slice(0, 7).map((category) => (
            <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">{category}</Link>
          ))}
          <Link href="/seller" className="ml-auto hidden shrink-0 rounded-full bg-orange-50 px-4 py-2 text-orange-700 hover:bg-orange-100 md:block">Seller studio →</Link>
        </nav>
      </div>
    </header>
  );
}
