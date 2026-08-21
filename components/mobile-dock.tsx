"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketplace } from "@/components/marketplace-provider";
import { isRouteActive } from "@/lib/navigation";
import { Icon } from "@/components/ui/icon";

const baseItemClass = "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-black transition active:bg-orange-50";
const authPaths = ["/login", "/signup", "/forgot-password"];

export function MobileDock() {
  const pathname = usePathname();
  const { cartCount, wishlist, currentUser } = useMarketplace();

  if (authPaths.some((path) => pathname.startsWith(path))) return null;

  const itemClass = (href: string) => `${baseItemClass} ${isRouteActive(pathname, href) ? "bg-orange-50 text-[#a63d08]" : "text-[#6b5a4f]"}`;
  const current = (href: string) => isRouteActive(pathname, href) ? "page" as const : undefined;
  const accountHref = currentUser ? "/account" : "/login";

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[24px] border border-[#eadfd7] bg-white/95 p-1.5 shadow-[0_18px_50px_rgba(88,66,51,0.18)] backdrop-blur-xl md:hidden">
      <Link href="/" aria-current={current("/")} className={itemClass("/")}><Icon name="home" size={18} /><span>Home</span></Link>
      <Link href="/shop" aria-current={current("/shop")} className={itemClass("/shop")}><Icon name="search" size={18} /><span>Discover</span></Link>
      <Link href="/wishlist" aria-current={current("/wishlist")} className={`${itemClass("/wishlist")} relative`} aria-label={`Saved items${wishlist.length ? `, ${wishlist.length}` : ""}`}><Icon name="heart" size={18} /><span>Saved</span>{wishlist.length ? <span aria-hidden className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[8px] text-white">{wishlist.length}</span> : null}</Link>
      <Link href="/cart" aria-current={current("/cart")} className={`${itemClass("/cart")} relative`} aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`}><Icon name="shopping-bag" size={18} /><span>Cart</span>{cartCount ? <span aria-hidden className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[8px] text-white">{cartCount}</span> : null}</Link>
      <Link href={accountHref} aria-current={current(accountHref)} className={itemClass(accountHref)}><Icon name="user" size={18} /><span>{currentUser ? "Account" : "Sign in"}</span></Link>
    </nav>
  );
}
