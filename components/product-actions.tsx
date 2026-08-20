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
        className="min-h-10 flex-1 rounded-full bg-orange-400 px-4 py-2 text-sm font-black text-slate-950 shadow-sm transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Add to cart
      </button>
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-300 bg-white text-lg font-black text-slate-600 transition hover:border-orange-400 hover:text-orange-600"
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}
