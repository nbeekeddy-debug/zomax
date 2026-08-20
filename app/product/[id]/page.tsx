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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <Link href="/shop" className="text-sm font-black text-orange-600">← Back to shop</Link>
      {catalog.degraded ? <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live product data is unavailable; this is the safe fallback copy.</p> : null}
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-[36px] bg-slate-100 shadow-xl"><Image src={product.image} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
        <section className="rounded-[36px] bg-white p-7 shadow-sm md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">{product.category}</p><h1 className="mt-3 text-4xl font-black text-slate-950">{product.name}</h1><p className="mt-3 text-sm font-bold text-amber-500">★ {product.rating} · {product.reviews} catalog reviews</p><p className="mt-6 text-3xl font-black text-slate-950">{money(product.price)}</p>{product.oldPrice ? <p className="mt-1 text-sm text-slate-400 line-through">{money(product.oldPrice)}</p> : null}<p className="mt-6 leading-7 text-slate-600">{product.description}</p><p className="mt-5 text-sm font-bold text-slate-500">Sold by {product.seller} · {product.location}</p><p className="mt-2 text-sm font-bold text-slate-500">{product.stock} units currently in stock</p><div className="mt-7"><ProductActions productId={product.id} /></div>
        </section>
      </div>
      <SectionErrorBoundary name="Reviews"><ProductReviews productId={product.id} /></SectionErrorBoundary>
    </main>
  );
}
