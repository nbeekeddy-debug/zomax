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
      {catalog.degraded ? (
        <p className="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live catalog is temporarily unavailable, so Zomax is showing its safe fallback catalog.</p>
      ) : null}
      {featured.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="bg-white p-8 text-center text-sm text-slate-500">No products are available yet.</div>
      )}
    </SectionErrorBoundary>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="pb-12">
      <section className="mx-auto max-w-[1500px]">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 pb-24 pt-12 text-white md:px-10 md:pb-28 md:pt-16">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-400">Zomax marketplace</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Everything you need, from sellers you can trust.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Search, compare and buy across Zomax with clearer prices, seller information and a faster shopping flow.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-orange-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-orange-500">Shop all products</Link>
              <Link href="/sell" className="rounded-full border border-white/40 px-6 py-3 text-sm font-black hover:bg-white/10">Sell on Zomax</Link>
            </div>
          </div>
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        </div>

        <SectionErrorBoundary name="Categories">
          <div className="relative z-10 -mt-16 grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:px-5">
            {categories.slice(0, 10).map((category) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="group min-h-32 border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-lg">◈</span>
                    <h2 className="mt-3 text-sm font-black text-slate-950 md:text-base">{category}</h2>
                  </div>
                  <span className="mt-3 text-xs font-bold text-sky-700 group-hover:text-orange-700">Explore category →</span>
                </div>
              </Link>
            ))}
          </div>
        </SectionErrorBoundary>
      </section>

      <section className="mx-auto mt-6 max-w-[1500px] px-3 md:px-5">
        <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Secure shopping", "Clear checkout and order flow"],
            ["Trusted sellers", "Seller and location details shown"],
            ["Fast discovery", "Search, filter and compare quickly"],
            ["Sell with Zomax", "Manage listings from Seller Center"],
          ].map(([title, text]) => (
            <div key={title} className="bg-white px-5 py-4">
              <p className="text-sm font-black text-slate-950">{title}</p>
              <p className="mt-1 text-xs text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-7 max-w-[1500px] px-3 md:px-5">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Popular on Zomax</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950 md:text-3xl">Top picks for you</h2>
          </div>
          <Link href="/shop" className="shrink-0 text-sm font-bold text-sky-700 hover:text-orange-700 hover:underline">See all products</Link>
        </div>
        <Suspense fallback={<SectionSkeleton cards={5} />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section className="mx-auto mt-8 max-w-[1500px] px-3 md:px-5">
        <div className="flex flex-col justify-between gap-5 bg-slate-900 px-6 py-7 text-white md:flex-row md:items-center md:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Seller center</p>
            <h2 className="mt-2 text-2xl font-black">Grow your store on Zomax.</h2>
            <p className="mt-2 text-sm text-slate-300">Keep your existing seller information, listings and analytics in one place.</p>
          </div>
          <Link href="/seller" className="shrink-0 rounded-full bg-orange-400 px-6 py-3 text-center text-sm font-black text-slate-950 hover:bg-orange-500">Open Seller Center</Link>
        </div>
      </section>
    </main>
  );
}
