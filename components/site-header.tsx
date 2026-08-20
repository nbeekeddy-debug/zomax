"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { categories } from "@/lib/products";

export function SiteHeader() {
  const { cartCount, wishlist, currentUser } = useMarketplace();

  return (
    <header className="sticky top-0 z-50 shadow-md">
      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-3 py-2 md:px-5">
          <Link href="/" className="shrink-0 rounded-md px-2 py-1 text-2xl font-black tracking-tight hover:outline hover:outline-1 hover:outline-white/70">
            zomax<span className="text-orange-400">.</span>
          </Link>

          <div className="hidden min-w-[120px] leading-tight lg:block">
            <p className="text-[11px] text-slate-400">Deliver to</p>
            <p className="text-sm font-bold">Nigeria</p>
          </div>

          <form action="/shop" method="get" className="hidden min-w-0 flex-1 overflow-hidden rounded-xl bg-white ring-2 ring-transparent focus-within:ring-orange-400 sm:flex">
            <select name="category" defaultValue="" aria-label="Search category" className="hidden max-w-40 border-r border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-700 outline-none md:block">
              <option value="">All</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <input name="q" type="search" placeholder="Search Zomax products" className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400" />
            <button type="submit" aria-label="Search" className="grid w-12 place-items-center bg-orange-400 text-lg font-black text-slate-950 hover:bg-orange-500">⌕</button>
          </form>

          <nav className="ml-auto flex shrink-0 items-center gap-1 text-white">
            <Link href={currentUser ? "/account" : "/login"} className="hidden rounded-md px-2 py-1.5 leading-tight hover:outline hover:outline-1 hover:outline-white/70 md:block">
              <span className="block text-[11px] text-slate-300">Hello, {currentUser?.name?.split(" ")[0] || "sign in"}</span>
              <span className="block text-sm font-bold">Account</span>
            </Link>
            <Link href="/orders" className="hidden rounded-md px-2 py-1.5 leading-tight hover:outline hover:outline-1 hover:outline-white/70 lg:block">
              <span className="block text-[11px] text-slate-300">Returns</span>
              <span className="block text-sm font-bold">& Orders</span>
            </Link>
            <Link href="/wishlist" className="hidden rounded-md px-2 py-1.5 text-sm font-bold hover:outline hover:outline-1 hover:outline-white/70 md:block">Saved {wishlist.length ? `(${wishlist.length})` : ""}</Link>
            <Link href="/cart" className="flex items-end gap-1 rounded-md px-2 py-1.5 hover:outline hover:outline-1 hover:outline-white/70">
              <span className="text-xl">🛒</span>
              <span className="text-sm font-black">Cart{cartCount ? ` ${cartCount}` : ""}</span>
            </Link>
          </nav>
        </div>

        <form action="/shop" method="get" className="mx-3 mb-2 flex overflow-hidden rounded-xl bg-white ring-2 ring-transparent focus-within:ring-orange-400 sm:hidden">
          <input name="q" type="search" placeholder="Search Zomax products" className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-950 outline-none" />
          <button type="submit" aria-label="Search" className="grid w-12 place-items-center bg-orange-400 font-black text-slate-950">⌕</button>
        </form>
      </div>

      <div className="bg-slate-800 text-white">
        <nav className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-3 py-1.5 text-sm font-semibold md:px-5">
          <Link href="/shop" className="shrink-0 rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70">☰ All</Link>
          {categories.slice(0, 6).map((category) => (
            <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="shrink-0 rounded px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70">{category}</Link>
          ))}
          <Link href="/seller" className="ml-auto hidden shrink-0 rounded px-2 py-1 text-orange-300 hover:outline hover:outline-1 hover:outline-white/70 md:block">Seller Center</Link>
        </nav>
      </div>
    </header>
  );
}
