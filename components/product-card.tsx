import Image from "next/image";
import Link from "next/link";
import { ProductActions } from "@/components/product-actions";
import { money, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-300 hover:scale-[1.02]"
        />
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">{product.category}</p>
        <Link href={`/product/${product.id}`} className="mt-2 block text-base font-black text-slate-900 hover:text-orange-600">
          {product.name}
        </Link>
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
          <ProductActions productId={product.id} />
        </div>
      </div>
    </article>
  );
}
