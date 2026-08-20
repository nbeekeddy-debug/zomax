"use client";

import { useMarketplace } from "@/components/marketplace-provider";

export function ProductActions({ productId }: { productId: number }) {
  const { addToCart, toggleWishlist, wishlist } = useMarketplace();
  const saved = wishlist.includes(productId);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-600 hover:border-rose-200 hover:text-rose-600"
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
      >
        {saved ? "♥" : "♡"}
      </button>
      <button
        type="button"
        onClick={() => addToCart(productId)}
        className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600"
      >
        Add
      </button>
    </div>
  );
}
