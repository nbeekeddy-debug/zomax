"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ProductActions } from "@/components/product-actions";
import { money, type Product } from "@/lib/products";

export function ProductQuickView({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-[11px] font-black text-[#342923] shadow-sm backdrop-blur transition hover:bg-white"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Quick view
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel={`Quick view ${product.name}`}
        overlayClassName="grid place-items-end p-0 sm:place-items-center sm:p-5"
        panelClassName="max-h-[92svh] w-full overflow-y-auto rounded-t-[30px] bg-[#fffdfb] shadow-2xl outline-none sm:max-w-4xl sm:rounded-[32px]"
      >
        <div className="flex items-center justify-between border-b border-[#eadfd7] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a63d08]">Quick view</p>
            <p className="mt-1 text-sm font-bold text-[#594b42]">See the essentials without leaving the feed.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-[#e5d9d1] bg-white text-lg font-black text-[#493a31] hover:bg-[#f7f2ee]" aria-label="Close quick view">×</button>
        </div>

        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[300px] bg-[#f2ece7] sm:min-h-[390px]">
            <Image src={product.image} alt={product.name} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f4eee9] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#594b42]">{product.category}</span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">★ {product.rating} · {product.reviews} reviews</span>
            </div>

            <h2 className="mt-5 text-2xl font-black leading-tight tracking-[-0.035em] text-[#261d19] sm:text-3xl">{product.name}</h2>
            <p className="mt-3 text-sm leading-6 text-[#594b42]">{product.description}</p>

            <div className="mt-5 rounded-[24px] bg-[#f8f4f0] p-4 ring-1 ring-[#eadfd7]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#75655b]">Seller</p>
                  <p className="mt-1 font-black text-[#261d19]">{product.seller}</p>
                  <p className="mt-1 text-xs font-semibold text-[#66574d]">{product.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black tracking-[-0.035em] text-[#261d19]">{money(product.price)}</p>
                  {product.oldPrice ? <p className="mt-1 text-xs font-bold text-[#75655b] line-through">{money(product.oldPrice)}</p> : null}
                  <p className="mt-1 text-xs font-bold text-emerald-700">{product.stock} in stock</p>
                </div>
              </div>
            </div>

            <div className="mt-5"><ProductActions productId={product.id} /></div>
            <Link href={`/product/${product.id}`} onClick={() => setOpen(false)} className="mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-[#dfd2ca] bg-white px-4 text-sm font-black text-[#493a31] hover:border-orange-300 hover:text-[#a63d08]">Open full product page →</Link>
          </div>
        </div>
      </Dialog>
    </>
  );
}
