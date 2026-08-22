"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketplace } from "@/components/marketplace-provider";
import { isRouteActive } from "@/lib/navigation";
import { categories } from "@/lib/products";
import { Icon } from "@/components/ui/icon";

const authPaths = ["/login", "/signup", "/forgot-password"];

function Brand() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-2xl px-1.5 py-1" aria-label="Zomax home">
      <Image src="/icon.svg" alt="" width={36} height={36} className="rounded-2xl shadow-sm transition group-hover:-rotate-3" priority />
      <span className="text-2xl font-black tracking-[-0.04em] text-[#2b211c]">zomax<span className="text-orange-500">.</span></span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, wishlist, currentUser } = useMarketplace();
  const authPage = authPaths.some((path) => pathname.startsWith(path));
  const current = (href: string) => isRouteActive(pathname, href) ? "page" as const : undefined;

  if (authPage) {
    const signup = pathname.startsWith("/signup");
    return (
      <header className="sticky top-0 z-40 border-b border-[#eadfd7]/90 bg-[#fffaf5]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Brand />
          <Link href={signup ? "/login" : "/signup"} className="rounded-2xl border border-[#dfd2ca] bg-white px-4 py-2 text-xs font-black text-[#493a31] shadow-sm hover:border-orange-300 hover:text-[#a63d08] sm:text-sm">{signup ? "Sign in" : "Create account"}</Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#eadfd7]/90 bg-[#fffaf5]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:flex-nowrap md:px-6">
          <Brand />

          <form action="/shop" method="get" role="search" aria-label="Search Zomax marketplace" className="order-3 flex min-w-0 basis-full items-center rounded-[20px] border border-[#e8ddd5] bg-white p-1.5 shadow-[0_8px_26px_rgba(88,66,51,0.06)] focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 md:order-none md:mx-auto md:max-w-2xl md:flex-1 md:basis-auto">
            <Icon name="search" size={18} className="ml-2 text-[#66574d]" />
            <label htmlFor="zomax-search" className="sr-only">Search products, sellers or locations</label>
            <input id="zomax-search" name="q" type="search" placeholder="Find products, sellers or locations" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[16px] text-[#2b211c] outline-none placeholder:text-[#75655b] sm:px-3 sm:text-sm" />
            <button type="submit" className="rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-black text-white transition hover:bg-orange-600 sm:px-5 sm:text-sm">Search</button>
          </form>

          <nav aria-label="Account and cart" className="ml-auto flex items-center gap-2">
            <Link href={currentUser ? "/account" : "/login"} aria-current={current(currentUser ? "/account" : "/login")} className="hidden rounded-2xl border border-[#dfd2ca] bg-white px-3 py-2 text-xs font-black text-[#493a31] shadow-sm hover:border-orange-300 hover:text-[#a63d08] lg:inline-flex">
              <span>{currentUser ? "Account" : "Sign in"}</span>
            </Link>
            <Link href="/wishlist" aria-current={current("/wishlist")} className="relative hidden h-10 w-10 place-items-center rounded-2xl bg-white text-lg text-[#493a31] shadow-sm ring-1 ring-[#eadfd7] hover:text-[#a63d08] sm:grid" aria-label={`Wishlist${wishlist.length ? `, ${wishlist.length} saved` : ""}`}>
              <Icon name="heart" size={19} />
              {wishlist.length ? <span aria-hidden className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{wishlist.length}</span> : null}
            </Link>
            <Link href="/cart" aria-current={current("/cart")} className="relative flex h-10 items-center gap-2 rounded-2xl bg-[#2b211c] px-3 text-white shadow-sm hover:bg-orange-600" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}>
              <Icon name="shopping-bag" size={18} /><span className="hidden sm:inline">Cart</span>
              {cartCount ? <span aria-hidden className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white">{cartCount}</span> : null}
            </Link>
          </nav>
        </div>

        <div className="hidden border-t border-[#eee3dc] md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-2 text-xs font-black text-[#67574e]">
            <Link href="/shop" className="shrink-0 rounded-full px-3 py-1.5 hover:bg-orange-50 hover:text-[#a63d08]">Shop all</Link>
            {categories.filter((category) => category !== "All").map((category) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="shrink-0 rounded-full px-3 py-1.5 hover:bg-orange-50 hover:text-[#a63d08]">{category}</Link>
            ))}
            <Link href="/seller" className="ml-auto shrink-0 rounded-full bg-[#2b211c] px-3 py-1.5 text-white hover:bg-orange-600">Sell on Zomax</Link>
          </div>
        </div>
      </header>
    </>
  );
}
