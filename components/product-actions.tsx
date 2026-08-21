"use client";

import { useEffect, useState } from "react";
import { useMarketplace } from "@/components/marketplace-provider";
import { Button } from "@/components/ui/button";

export function ProductActions({ productId }: { productId: number }) {
  const { addToCart, toggleWishlist, wishlist } = useMarketplace();
  const [message, setMessage] = useState("");
  const saved = wishlist.includes(productId);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <>
      <div className="flex w-full items-center gap-2">
        <Button
          onClick={() => { addToCart(productId); setMessage("Added to your cart"); }}
          className="flex-1"
        >
          Add to cart
        </Button>
        <button
          type="button"
          onClick={() => { toggleWishlist(productId); setMessage(saved ? "Removed from saved items" : "Saved for later"); }}
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg font-black transition ring-1 ${saved ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-[#f7f3ef] text-[#594b42] ring-[#ebe2db] hover:text-[#a63d08]"}`}
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={saved}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>

      {message ? (
        <div aria-live="polite" role="status" className="fixed bottom-24 right-3 z-[100] max-w-[calc(100vw-24px)] rounded-2xl bg-[#2b211c] px-4 py-3 text-sm font-black text-white shadow-2xl sm:bottom-6 sm:right-6">
          {message}
        </div>
      ) : null}
    </>
  );
}
