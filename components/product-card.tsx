"use client";

import { useMarketplace } from "@/components/marketplace-provider";
import { money, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, wishlist } = useMarketplace();
  const saved = wishlist.includes(product.id);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-2 text-sm font-black shadow"
          aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">{product.category}</p>
        <h3 className="mt-2 text-base font-black text-slate-900">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.seller} · {product.location}</p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-black text-amber-500">★ {product.rating}</span>
          <span className="text-slate-400">({product.reviews})</span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-black text-slate-950">{money(product.price)}</p>
            {product.oldPrice ? <p className="text-xs text-slate-400 line-through">{money(product.oldPrice)}</p> : null}
          </div>
          <button onClick={() => addToCart(product.id)} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-black text-white hover:bg-orange-600">
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
