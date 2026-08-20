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
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live catalog is temporarily unavailable, so Zomax is showing its safe fallback catalog.</p>
      ) : null}
      {featured.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="rounded-[28px] bg-white p-8 text-center text-sm text-slate-500">No products are available yet.</div>
      )}
    </SectionErrorBoundary>
  );
}

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.15fr_.85fr] md:px-6 md:py-16">
        <div className="rounded-[36px] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Zomax marketplace</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Shop great products from trusted sellers.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">A faster marketplace rebuilt with isolated routes, resilient sections and a production-ready migration path.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-2xl bg-orange-500 px-6 py-3 font-black hover:bg-orange-600">Start shopping</Link>
            <Link href="/sell" className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 font-black hover:bg-white/15">Become a seller</Link>
          </div>
        </div>

        <SectionErrorBoundary name="Categories">
          <div className="grid grid-cols-2 gap-3 rounded-[36px] bg-white p-4 shadow-xl">
            {categories.slice(0, 6).map((category) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 font-black text-slate-800 transition hover:border-orange-200 hover:bg-orange-50">
                <span className="text-sm">{category}</span>
              </Link>
            ))}
          </div>
        </SectionErrorBoundary>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Popular now</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Featured products</h2>
          </div>
          <Link href="/shop" className="text-sm font-black text-orange-600">View all →</Link>
        </div>
        <Suspense fallback={<SectionSkeleton cards={4} />}>
          <FeaturedProducts />
        </Suspense>
      </section>
    </main>
  );
}
