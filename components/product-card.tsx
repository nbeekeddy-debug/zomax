import Image from "next/image";
import Link from "next/link";
import { ProductActions } from "@/components/product-actions";
import { money, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice ? Math.max(0, Math.round((1 - product.price / product.oldPrice) * 100)) : 0;
  const sellerInitial = product.seller.trim().charAt(0).toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)] hover:ring-orange-200">
      <Link href={`/product/${product.id}`} className="relative block aspect-[5/4] overflow-hidden bg-[#f6f2ed]">
        <Image src={product.image} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.035]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 backdrop-blur">{product.category}</span>
          {discount > 0 ? <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white">-{discount}%</span> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-slate-950 text-[10px] font-black text-white">{sellerInitial}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-slate-800">{product.seller}</p>
            <p className="text-[10px] font-semibold text-slate-400">{product.location}</p>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="mt-4 line-clamp-2 min-h-12 text-base font-black leading-6 tracking-[-0.02em] text-slate-950 hover:text-orange-700">
          {product.name}
        </Link>

        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="rounded-full bg-amber-50 px-2 py-1 font-black text-amber-700">★ {product.rating}</span>
          <span className="font-semibold text-slate-400">{product.reviews} reviews</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xl font-black tracking-[-0.03em] text-slate-950">{money(product.price)}</p>
            {product.oldPrice ? <p className="mt-0.5 text-[11px] font-semibold text-slate-400 line-through">{money(product.oldPrice)}</p> : <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{product.stock} in stock</p>}
          </div>
        </div>

        <div className="mt-auto pt-4"><ProductActions productId={product.id} /></div>
      </div>
    </article>
  );
}
