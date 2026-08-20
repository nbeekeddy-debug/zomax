"use client";

import { useMarketplace } from "@/components/marketplace-provider";

export function ProductActions({ productId }: { productId: number }) {
  const { addToCart, toggleWishlist, wishlist } = useMarketplace();
  const saved = wishlist.includes(productId);

  return (
    <div className="flex w-full items-center gap-2">
      <button
        type="button"
        onClick={() => addToCart(productId)}
        className="min-h-11 flex-1 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Add to cart
      </button>
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg font-black transition ring-1 ${saved ? "bg-rose-50 text-rose-600 ring-rose-200" : "bg-[#f7f3ef] text-slate-600 ring-[#ebe2db] hover:text-orange-600"}`}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}
