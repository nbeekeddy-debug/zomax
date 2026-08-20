"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { categories } from "@/lib/products";

export function SiteHeader() {
  const { cartCount, wishlist, currentUser } = useMarketplace();

  return (
    <header className="sticky top-0 z-40 border-b border-[#eadfd7]/90 bg-[#fffaf5]/95 backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" />

      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-2.5 px-3 py-2.5 sm:gap-3 md:flex-nowrap md:px-6 md:py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-2xl px-1.5 py-1">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#2b211c] text-sm font-black text-white shadow-sm transition group-hover:-rotate-3 group-hover:bg-orange-600">Z</span>
          <span className="hidden text-2xl font-black tracking-[-0.04em] text-[#2b211c] xs:block sm:block">zomax<span className="text-orange-500">.</span></span>
        </Link>

        <form action="/shop" method="get" className="order-3 flex min-w-0 basis-full items-center rounded-[20px] border border-[#e8ddd5] bg-white p-1.5 shadow-[0_8px_26px_rgba(88,66,51,0.06)] focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 md:order-none md:mx-auto md:max-w-2xl md:flex-1 md:basis-auto">
          <span className="pl-3 text-[#9a887c]">⌕</span>
          <input name="q" type="search" placeholder="Find products, sellers or locations" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-[#2b211c] outline-none placeholder:text-[#9a887c] sm:px-3" />
          <button type="submit" className="rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-black text-white transition hover:bg-orange-600 sm:px-5 sm:text-sm">Search</button>
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#6b5a4f] sm:gap-2">
          <Link href={currentUser ? "/account" : "/login"} className="hidden rounded-2xl px-3 py-2 hover:bg-white hover:text-orange-600 lg:block">
            <span className="block text-[10px] font-semibold text-[#a08d80]">{currentUser ? `Hi, ${currentUser.name?.split(" ")[0] || "there"}` : "Welcome"}</span>
            <span>{currentUser ? "Account" : "Sign in"}</span>
          </Link>
          <Link href="/wishlist" className="relative hidden h-10 w-10 place-items-center rounded-2xl bg-white text-lg shadow-sm ring-1 ring-[#eadfd7] hover:text-orange-600 sm:grid" aria-label="Wishlist">
            ♡
            {wishlist.length ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{wishlist.length}</span> : null}
          </Link>
          <Link href="/cart" className="relative flex h-10 items-center gap-2 rounded-2xl bg-[#2b211c] px-3 text-white shadow-sm hover:bg-orange-600">
            <span>◫</span><span className="hidden sm:inline">Cart</span>
            {cartCount ? <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{cartCount}</span> : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-[#eee3dc] bg-white/75">
        <nav className="mx-auto flex max-w-[1480px] items-center gap-2 overflow-x-auto px-3 py-2 text-xs font-bold [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <Link href="/shop" className="shrink-0 rounded-full bg-[#2b211c] px-4 py-2 text-white hover:bg-orange-600">Discover</Link>
          {categories.slice(0, 7).map((category) => (
            <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="shrink-0 rounded-full border border-[#eadfd7] bg-white px-4 py-2 text-[#66574d] hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">{category}</Link>
          ))}
          <Link href="/seller" className="ml-auto hidden shrink-0 rounded-full bg-orange-50 px-4 py-2 text-orange-700 hover:bg-orange-100 md:block">Seller studio →</Link>
        </nav>
      </div>
    </header>
  );
}
