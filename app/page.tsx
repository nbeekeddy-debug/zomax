import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { SectionSkeleton } from "@/components/section-skeleton";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";

async function FeaturedProducts() {
  const catalog = await getCatalog();
  const featured = catalog.products.slice(0, 8);

  return (
    <SectionErrorBoundary name="Featured products">
      {catalog.degraded ? <p className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live catalog is temporarily unavailable, so Zomax is showing its safe fallback catalog.</p> : null}
      {featured.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : <div className="rounded-[32px] bg-white p-8 text-center text-sm text-slate-500">No products are available yet.</div>}
    </SectionErrorBoundary>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="pb-16">
      <section className="mx-auto max-w-[1480px] px-3 pt-5 md:px-6 md:pt-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-[38px] bg-[#151c2b] p-7 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] md:p-11">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-orange-300 ring-1 ring-white/10">ZOMAX / MARKET MODE</div>
              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] md:text-6xl">Find what fits your life, not just your cart.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">A marketplace shaped around discovery: real seller details, clear pricing, local context and faster paths from browsing to buying.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-950/20 hover:bg-orange-600">Explore the market</Link>
                <Link href="/sell" className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15">Start selling</Link>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-orange-500/35 blur-3xl" />
            <div className="absolute right-10 top-10 hidden h-44 w-44 rotate-12 rounded-[42px] border border-white/10 bg-white/[0.04] lg:block" />
            <div className="absolute bottom-8 right-8 hidden w-52 rounded-[28px] bg-white/10 p-4 backdrop-blur-xl ring-1 ring-white/10 md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">Zomax signal</p>
              <p className="mt-2 text-sm font-bold">Products, sellers and locations stay visible while you browse.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/shop" className="group rounded-[34px] bg-[#fff1e7] p-6 ring-1 ring-orange-100 transition hover:-translate-y-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">Quick route</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950">Browse everything</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Jump into the full catalog and shape results with search, category, price and sort controls.</p>
              <span className="mt-8 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white">Open shop →</span>
            </Link>
            <Link href="/seller" className="group rounded-[34px] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">For sellers</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950">Run your Zomax store</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Listings, store details, orders and analytics stay in the existing seller flow.</p>
              <span className="mt-8 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">Seller studio →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1480px] px-3 md:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Browse by mood</p>
            <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950 md:text-3xl">Pick a lane</h2>
          </div>
          <Link href="/shop" className="text-sm font-black text-slate-600 hover:text-orange-600">All categories →</Link>
        </div>
        <SectionErrorBoundary name="Categories">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.slice(0, 10).map((category, index) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="group min-w-[190px] rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-orange-200">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-lg font-black text-slate-950">{category}</h3>
                <p className="mt-2 text-xs font-bold text-orange-600">Explore →</p>
              </Link>
            ))}
          </div>
        </SectionErrorBoundary>
      </section>

      <section className="mx-auto mt-10 max-w-[1480px] px-3 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Fresh on Zomax</p>
            <h2 className="mt-1 text-3xl font-black tracking-[-0.035em] text-slate-950">Worth a closer look</h2>
          </div>
          <Link href="/shop" className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-orange-600">See the full market</Link>
        </div>
        <Suspense fallback={<SectionSkeleton cards={4} />}><FeaturedProducts /></Suspense>
      </section>

      <section className="mx-auto mt-10 max-w-[1480px] px-3 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Search with context", "Find by product, seller, category or location."],
            ["02", "See the seller", "Seller and location details stay attached to product discovery."],
            ["03", "Move without friction", "Keep the existing cart, checkout, wishlist and order flows."],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-[30px] bg-[#f7f3ef] p-6 ring-1 ring-[#ebe2db]">
              <p className="text-xs font-black text-orange-600">{number}</p>
              <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
