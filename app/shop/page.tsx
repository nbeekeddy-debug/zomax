import Link from "next/link";
import { LocalListingsSection } from "@/components/local-listings-section";
import { ProductCard } from "@/components/product-card";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";

export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [params, catalog] = await Promise.all([searchParams, getCatalog()]);
  const category = params.category;
  const filtered = category ? catalog.products.filter((product) => product.category === category) : catalog.products;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Marketplace</p><h1 className="mt-2 text-4xl font-black text-slate-950">{category || "Shop everything"}</h1><p className="mt-2 text-sm text-slate-500">{filtered.length} server catalog product{filtered.length === 1 ? "" : "s"} available.</p></div>
        <div className="flex flex-wrap gap-2 text-xs font-bold"><Link href="/shop" className="rounded-full bg-slate-900 px-4 py-2 text-white">All</Link>{categories.slice(0, 5).map((item) => <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm hover:text-orange-600">{item}</Link>)}</div>
      </div>
      {catalog.degraded ? <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">The live catalog pipeline failed safely. Showing the local fallback catalog instead.</p> : null}
      {!category ? <LocalListingsSection /> : null}
      <SectionErrorBoundary name="Product results"><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div></SectionErrorBoundary>
    </main>
  );
}
