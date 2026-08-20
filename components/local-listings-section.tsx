"use client";

import { ProductActions } from "@/components/product-actions";
import { useMarketplace } from "@/components/marketplace-provider";
import { money } from "@/lib/products";

export function LocalListingsSection({ mode = "shop" }: { mode?: "shop" | "seller" }) {
  const { sellerListings } = useMarketplace();
  if (!sellerListings.length) return null;

  if (mode === "seller") {
    return (
      <section className="mt-8 rounded-[32px] border border-orange-100 bg-orange-50/50 p-6">
        <h2 className="text-xl font-black text-slate-950">Local migration listings</h2>
        <p className="mt-1 text-xs text-slate-500">Stored in this browser until the production product database is connected.</p>
        <div className="mt-4 divide-y divide-orange-100">
          {sellerListings.map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">{product.stock} in stock · {money(product.price)}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700">Local</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">From this browser</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Your migrated seller listings</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sellerListings.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              {/* Local seller URLs may use hosts not configured for next/image yet. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">{product.category}</p>
              <h3 className="mt-2 font-black text-slate-900">{product.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{product.seller} · {product.location}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="font-black text-slate-950">{money(product.price)}</p>
                <ProductActions productId={product.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
