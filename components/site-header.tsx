"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketplace } from "@/components/marketplace-provider";
import { isRouteActive } from "@/lib/navigation";
import { categories } from "@/lib/products";

const authPaths = ["/login", "/signup", "/forgot-password"];

function Brand() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2 rounded-2xl px-1.5 py-1" aria-label="Zomax home">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#2b211c] text-sm font-black text-white shadow-sm transition group-hover:-rotate-3 group-hover:bg-orange-600" aria-hidden>Z</span>
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
        <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" />
        <div className="mx-auto flex min-h-[70px] max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
          <Brand />
          <div className="flex items-center gap-2">
            <Link href="/shop" className="hidden rounded-xl px-3 py-2 text-xs font-black text-[#66574d] hover:bg-white hover:text-[#a63d08] sm:block">← Back to marketplace</Link>
            <Link href={signup ? "/login" : "/signup"} className="rounded-2xl border border-[#e4d8d0] bg-white px-4 py-2.5 text-xs font-black text-[#493a31] shadow-sm hover:border-orange-200 hover:text-[#a63d08] sm:text-sm">
              {signup ? "Sign in" : "Create account"}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#eadfd7]/90 bg-[#fffaf5]/95 backdrop-blur-xl">
      <div className="h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300" />

      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-2.5 px-3 py-2.5 sm:gap-3 md:flex-nowrap md:px-6 md:py-3">
        <Brand />

        <form action="/shop" method="get" role="search" aria-label="Search Zomax marketplace" className="order-3 flex min-w-0 basis-full items-center rounded-[20px] border border-[#e8ddd5] bg-white p-1.5 shadow-[0_8px_26px_rgba(88,66,51,0.06)] focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100 md:order-none md:mx-auto md:max-w-2xl md:flex-1 md:basis-auto">
          <span className="pl-3 text-[#66574d]" aria-hidden>⌕</span>
          <label htmlFor="zomax-search" className="sr-only">Search products, sellers or locations</label>
          <input id="zomax-search" name="q" type="search" placeholder="Find products, sellers or locations" className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[16px] text-[#2b211c] outline-none placeholder:text-[#75655b] sm:px-3 sm:text-sm" />
          <button type="submit" className="rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-black text-white transition hover:bg-orange-600 sm:px-5 sm:text-sm">Search</button>
        </form>

        <nav aria-label="Account and shopping" className="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#594b42] sm:gap-2">
          <Link href={currentUser ? "/account" : "/login"} aria-current={currentUser ? current("/account") : current("/login")} className="hidden rounded-2xl px-3 py-2 hover:bg-white hover:text-[#a63d08] lg:block">
            <span className="block text-[10px] font-semibold text-[#75655b]">{currentUser ? `Hi, ${currentUser.name?.split(" ")[0] || "there"}` : "Welcome"}</span>
            <span>{currentUser ? "Account" : "Sign in"}</span>
          </Link>
          <Link href="/wishlist" aria-current={current("/wishlist")} className="relative hidden h-10 w-10 place-items-center rounded-2xl bg-white text-lg text-[#493a31] shadow-sm ring-1 ring-[#eadfd7] hover:text-[#a63d08] sm:grid" aria-label={`Wishlist${wishlist.length ? `, ${wishlist.length} saved` : ""}`}>
            <span aria-hidden>♡</span>
            {wishlist.length ? <span aria-hidden className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-black text-white">{wishlist.length}</span> : null}
          </Link>
          <Link href="/cart" aria-current={current("/cart")} className="relative flex h-10 items-center gap-2 rounded-2xl bg-[#2b211c] px-3 text-white shadow-sm hover:bg-orange-600" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}>
            <span aria-hidden>◫</span><span className="hidden sm:inline">Cart</span>
            {cartCount ? <span aria-hidden className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] text-white">{cartCount}</span> : null}
          </Link>
        </nav>
      </div>

      <div className="border-t border-[#eee3dc] bg-white/80">
        <nav aria-label="Marketplace sections" className="mx-auto flex max-w-[1480px] items-center gap-2 overflow-x-auto px-3 py-2 text-xs font-bold [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <Link href="/shop" aria-current={current("/shop")} className="shrink-0 rounded-full bg-[#2b211c] px-4 py-2 text-white hover:bg-orange-600">Discover</Link>
          <Link href="/deals" aria-current={current("/deals")} className="shrink-0 rounded-full bg-orange-50 px-4 py-2 text-[#a63d08] ring-1 ring-orange-100 hover:bg-orange-100">Deals</Link>
          <Link href="/categories" aria-current={current("/categories")} className="shrink-0 rounded-full border border-[#eadfd7] bg-white px-4 py-2 text-[#493a31] hover:border-orange-200 hover:text-[#a63d08]">Categories</Link>
          {categories.slice(0, 4).map((category) => (
            <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="shrink-0 rounded-full border border-[#eadfd7] bg-white px-4 py-2 text-[#493a31] hover:border-orange-200 hover:bg-orange-50 hover:text-[#a63d08]">{category}</Link>
          ))}
          <Link href="/sellers" aria-current={current("/sellers")} className="shrink-0 rounded-full border border-[#eadfd7] bg-white px-4 py-2 text-[#493a31] hover:border-orange-200 hover:text-[#a63d08]">Sellers</Link>
          <Link href="/help" aria-current={current("/help")} className="shrink-0 rounded-full border border-[#eadfd7] bg-white px-4 py-2 text-[#493a31] hover:border-orange-200 hover:text-[#a63d08]">Help</Link>
          <Link href="/seller" aria-current={current("/seller")} className="ml-auto hidden shrink-0 rounded-full bg-[#f8efe8] px-4 py-2 text-[#9a3a0a] hover:bg-orange-100 md:block">Seller studio →</Link>
        </nav>
      </div>
    </header>
  );
}
