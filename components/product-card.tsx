import Image from "next/image";
import Link from "next/link";
import { ProductActions } from "@/components/product-actions";
import { money, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const discount = product.oldPrice ? Math.max(0, Math.round((1 - product.price / product.oldPrice) * 100)) : 0;

  return (
    <article className="group flex h-full flex-col border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-4">
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-2 transition duration-300 group-hover:scale-[1.025]"
        />
        {discount > 0 ? <span className="absolute left-0 top-0 bg-orange-600 px-2 py-1 text-[11px] font-black text-white">-{discount}%</span> : null}
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-600">{product.category}</p>
        <Link href={`/product/${product.id}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 hover:text-orange-700 hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-slate-500">by {product.seller}</p>

        <div className="mt-2 flex items-center gap-1 text-sm">
          <span className="font-black text-amber-500">★★★★★</span>
          <span className="text-xs font-semibold text-sky-700">{product.rating} ({product.reviews})</span>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-black text-slate-950">{money(product.price)}</p>
            {product.oldPrice ? <p className="text-xs text-slate-500 line-through">{money(product.oldPrice)}</p> : null}
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-700">FREE delivery eligible</p>
          <p className="text-xs text-slate-500">Ships from {product.location}</p>
        </div>

        <div className="mt-auto pt-4">
          <ProductActions productId={product.id} />
        </div>
      </div>
    </article>
  );
}
