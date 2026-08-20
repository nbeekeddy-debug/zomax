"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketplace } from "@/components/marketplace-provider";

const itemClass = "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-black text-[#6b5a4f] active:bg-orange-50";
const authPaths = ["/login", "/signup", "/forgot-password"];

export function MobileDock() {
  const pathname = usePathname();
  const { cartCount, wishlist, currentUser } = useMarketplace();

  if (authPaths.some((path) => pathname.startsWith(path))) return null;

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[24px] border border-[#eadfd7] bg-white/95 p-1.5 shadow-[0_18px_50px_rgba(88,66,51,0.18)] backdrop-blur-xl md:hidden">
      <Link href="/" className={itemClass}><span className="text-base">⌂</span><span>Home</span></Link>
      <Link href="/shop" className={itemClass}><span className="text-base">⌕</span><span>Discover</span></Link>
      <Link href="/wishlist" className={`${itemClass} relative`}><span className="text-base">♡</span><span>Saved</span>{wishlist.length ? <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[8px] text-white">{wishlist.length}</span> : null}</Link>
      <Link href="/cart" className={`${itemClass} relative`}><span className="text-base">◫</span><span>Cart</span>{cartCount ? <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[8px] text-white">{cartCount}</span> : null}</Link>
      <Link href={currentUser ? "/account" : "/login"} className={itemClass}><span className="text-base">○</span><span>{currentUser ? "Account" : "Sign in"}</span></Link>
    </nav>
  );
}
