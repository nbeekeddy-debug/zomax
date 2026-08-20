import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/product-actions";
import { ProductReviews } from "@/components/product-reviews";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { getProductById } from "@/lib/catalog";
import { money, products as seedProducts } from "@/lib/products";

type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return seedProducts.map((product) => ({ id: String(product.id) })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { id } = await params; const { product } = await getProductById(Number(id)); return product ? { title: product.name, description: product.description } : { title: "Product not found" }; }

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();
  const { product, catalog } = await getProductById(numericId);
  if (!product) notFound();
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  const discount = product.oldPrice ? Math.round((savings / product.oldPrice) * 100) : 0;

  return (
    <main id="main-content" className="mx-auto max-w-[1380px] px-3 py-6 md:px-6 md:py-8">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/shop" className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 hover:text-orange-700">← Market</Link>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-700">{product.category}</Link>
        <span>/</span><span className="line-clamp-1 text-slate-700">{product.name}</span>
      </nav>

      {catalog.degraded ? <p className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live product data is unavailable; this is the safe fallback copy.</p> : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="overflow-hidden rounded-[38px] bg-[#f2ece6] p-4 md:p-7">
          <div className="relative aspect-square overflow-hidden rounded-[30px] bg-white">
            <Image src={product.image} alt={product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-3 py-1.5 text-slate-700">{product.category}</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-slate-700">{product.location}</span>
            <span className="rounded-full bg-slate-950 px-3 py-1.5 text-white">{product.stock} in stock</span>
          </div>
        </section>

        <section className="flex flex-col rounded-[38px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-9">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{product.seller.trim().charAt(0).toUpperCase()}</span>
            <div><p className="text-xs font-black text-slate-900">{product.seller}</p><p className="text-[11px] font-semibold text-slate-400">Seller · {product.location}</p></div>
          </div>

          <h1 className="mt-7 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-amber-50 px-3 py-1.5 font-black text-amber-700">★ {product.rating}</span>
            <span className="font-semibold text-slate-400">{product.reviews} reviews</span>
          </div>

          <p className="mt-7 text-base leading-7 text-slate-600">{product.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] bg-[#fff1e7] p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">Price</p><p className="mt-2 text-2xl font-black text-slate-950">{money(product.price)}</p></div>
            <div className="rounded-[24px] bg-[#f7f3ef] p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Stock</p><p className="mt-2 text-lg font-black text-slate-950">{product.stock} units</p></div>
            <div className="rounded-[24px] bg-[#eef6f2] p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Seller location</p><p className="mt-2 text-lg font-black text-slate-950">{product.location}</p></div>
          </div>

          {product.oldPrice ? <div className="mt-4 flex items-center gap-3 text-sm"><span className="font-semibold text-slate-400 line-through">{money(product.oldPrice)}</span>{discount > 0 ? <span className="rounded-full bg-orange-100 px-2.5 py-1 font-black text-orange-700">Save {discount}%</span> : null}{savings > 0 ? <span className="font-bold text-emerald-700">{money(savings)} less</span> : null}</div> : null}

          <div className="mt-auto pt-9">
            <div className="rounded-[28px] bg-slate-950 p-4 text-white sm:flex sm:items-center sm:gap-5 sm:p-5">
              <div className="mb-4 sm:mb-0 sm:flex-1"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Ready when you are</p><p className="mt-1 text-sm text-slate-300">Uses the existing Zomax cart and checkout flow.</p></div>
              <div className="sm:w-64"><ProductActions productId={product.id} /></div>
            </div>
          </div>
        </section>
      </div>

      <SectionErrorBoundary name="Reviews"><ProductReviews productId={product.id} /></SectionErrorBoundary>
    </main>
  );
}
