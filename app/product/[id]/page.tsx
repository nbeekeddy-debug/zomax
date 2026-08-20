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
    <main id="main-content" className="mx-auto max-w-[1500px] px-3 py-5 md:px-5">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-orange-700 hover:underline">Home</Link><span>›</span>
        <Link href="/shop" className="hover:text-orange-700 hover:underline">Shop</Link><span>›</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-700 hover:underline">{product.category}</Link><span>›</span>
        <span className="line-clamp-1 text-slate-700">{product.name}</span>
      </nav>

      {catalog.degraded ? <p className="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live product data is unavailable; this is the safe fallback copy.</p> : null}

      <div className="grid gap-6 bg-white p-4 shadow-sm lg:grid-cols-[minmax(320px,42%)_1fr_300px] lg:p-6">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="relative aspect-square overflow-hidden border border-slate-200 bg-white">
            <Image src={product.image} alt={product.name} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-contain p-4" />
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">Roll over image to inspect product details</p>
        </div>

        <section className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{product.category}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">{product.name}</h1>
          <Link href="/seller" className="mt-2 inline-block text-sm font-semibold text-sky-700 hover:text-orange-700 hover:underline">Visit {product.seller}</Link>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4 text-sm">
            <span className="font-bold text-slate-800">{product.rating}</span>
            <span className="font-black text-amber-500">★★★★★</span>
            <span className="font-semibold text-sky-700">{product.reviews} ratings</span>
          </div>

          <div className="border-b border-slate-200 py-5">
            {discount > 0 ? <p className="text-lg font-medium text-red-700">-{discount}%</p> : null}
            <p className="text-3xl font-black text-slate-950">{money(product.price)}</p>
            {product.oldPrice ? <p className="mt-1 text-sm text-slate-500">List price: <span className="line-through">{money(product.oldPrice)}</span></p> : null}
            {savings > 0 ? <p className="mt-1 text-sm font-semibold text-emerald-700">You save {money(savings)}</p> : null}
            <p className="mt-3 text-sm text-slate-600">All product, seller and location information remains from the Zomax catalog.</p>
          </div>

          <div className="py-5">
            <h2 className="text-base font-black text-slate-950">About this item</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li className="flex gap-2"><span>•</span><span>{product.description}</span></li>
              <li className="flex gap-2"><span>•</span><span>Sold by <strong>{product.seller}</strong> in {product.location}.</span></li>
              <li className="flex gap-2"><span>•</span><span>{product.stock} units currently available in the catalog.</span></li>
              <li className="flex gap-2"><span>•</span><span>Eligible for Zomax marketplace delivery flow.</span></li>
            </ul>
          </div>
        </section>

        <aside className="h-fit border border-slate-300 bg-white p-5 shadow-sm lg:sticky lg:top-32">
          <p className="text-2xl font-black text-slate-950">{money(product.price)}</p>
          <p className="mt-4 text-sm font-semibold text-sky-700">FREE delivery eligible</p>
          <p className="mt-1 text-sm text-slate-600">Ships from {product.location}</p>
          <p className={`mt-4 text-lg font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-red-700"}`}>{product.stock > 0 ? "In stock" : "Out of stock"}</p>
          <dl className="mt-4 grid grid-cols-[80px_1fr] gap-y-2 text-xs">
            <dt className="text-slate-500">Ships from</dt><dd className="font-semibold text-slate-800">{product.location}</dd>
            <dt className="text-slate-500">Sold by</dt><dd className="font-semibold text-sky-700">{product.seller}</dd>
            <dt className="text-slate-500">Returns</dt><dd className="font-semibold text-slate-800">Zomax order policy</dd>
          </dl>
          <div className="mt-5"><ProductActions productId={product.id} /></div>
          <Link href="/cart" className="mt-3 block rounded-full border border-orange-400 bg-orange-50 px-4 py-2.5 text-center text-sm font-black text-slate-950 hover:bg-orange-100">Go to cart</Link>
          <p className="mt-4 text-xs leading-5 text-slate-500">Secure checkout is handled through the existing Zomax cart and checkout flow.</p>
        </aside>
      </div>

      <SectionErrorBoundary name="Reviews"><ProductReviews productId={product.id} /></SectionErrorBoundary>
    </main>
  );
}
