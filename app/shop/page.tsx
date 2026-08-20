import Link from "next/link";
import { LocalListingsSection } from "@/components/local-listings-section";
import { ProductCard } from "@/components/product-card";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";

export const metadata = { title: "Shop" };

type ShopParams = { category?: string; q?: string; price?: string; sort?: string };

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopParams> }) {
  const [params, catalog] = await Promise.all([searchParams, getCatalog()]);
  const category = params.category?.trim();
  const q = params.q?.trim() || "";
  const price = params.price || "";
  const sort = params.sort || "featured";
  const query = q.toLowerCase();

  let filtered = catalog.products.filter((product) => {
    if (category && product.category !== category) return false;
    if (query && !`${product.name} ${product.category} ${product.seller} ${product.location}`.toLowerCase().includes(query)) return false;
    if (price === "under-50" && product.price >= 50000) return false;
    if (price === "50-100" && (product.price < 50000 || product.price > 100000)) return false;
    if (price === "over-100" && product.price <= 100000) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  function hrefFor(updates: Partial<ShopParams>) {
    const values: ShopParams = { category, q: q || undefined, price: price || undefined, sort: sort === "featured" ? undefined : sort, ...updates };
    const search = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => { if (value) search.set(key, value); });
    const text = search.toString();
    return text ? `/shop?${text}` : "/shop";
  }

  const heading = q ? `Results for “${q}”` : category || "All products";

  return (
    <main id="main-content" className="mx-auto max-w-[1500px] px-3 py-5 md:px-5">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-orange-700 hover:underline">Home</Link><span>›</span>
        <Link href="/shop" className="hover:text-orange-700 hover:underline">Shop</Link>
        {category ? <><span>›</span><span className="font-semibold text-slate-700">{category}</span></> : null}
      </div>

      <div className="border-b border-slate-300 pb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Zomax Marketplace</p>
        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950 md:text-3xl">{heading}</h1>
            <p className="mt-1 text-sm text-slate-600">{filtered.length} result{filtered.length === 1 ? "" : "s"} · seller and location information preserved</p>
          </div>
          {(category || q || price || sort !== "featured") ? <Link href="/shop" className="text-sm font-bold text-sky-700 hover:text-orange-700 hover:underline">Clear all filters</Link> : null}
        </div>
      </div>

      {catalog.degraded ? <p className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">The live catalog pipeline failed safely. Showing the local fallback catalog instead.</p> : null}

      <div className="mt-4 flex gap-5">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 pr-5 md:block">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-sm font-black text-slate-950">Department</h2>
            <div className="mt-2 space-y-1.5 text-sm">
              <Link href={hrefFor({ category: undefined })} className={`block hover:text-orange-700 hover:underline ${!category ? "font-black" : ""}`}>All departments</Link>
              {categories.map((item) => <Link key={item} href={hrefFor({ category: item })} className={`block hover:text-orange-700 hover:underline ${category === item ? "font-black text-orange-700" : "text-slate-700"}`}>{item}</Link>)}
            </div>
          </div>

          <div className="border-b border-slate-200 py-5">
            <h2 className="text-sm font-black text-slate-950">Price</h2>
            <div className="mt-2 space-y-1.5 text-sm text-slate-700">
              <Link href={hrefFor({ price: undefined })} className={`block hover:text-orange-700 hover:underline ${!price ? "font-black" : ""}`}>Any price</Link>
              <Link href={hrefFor({ price: "under-50" })} className={`block hover:text-orange-700 hover:underline ${price === "under-50" ? "font-black text-orange-700" : ""}`}>Under ₦50,000</Link>
              <Link href={hrefFor({ price: "50-100" })} className={`block hover:text-orange-700 hover:underline ${price === "50-100" ? "font-black text-orange-700" : ""}`}>₦50,000 – ₦100,000</Link>
              <Link href={hrefFor({ price: "over-100" })} className={`block hover:text-orange-700 hover:underline ${price === "over-100" ? "font-black text-orange-700" : ""}`}>Over ₦100,000</Link>
            </div>
          </div>

          <div className="py-5">
            <h2 className="text-sm font-black text-slate-950">Customer rating</h2>
            <Link href={hrefFor({ sort: "rating" })} className="mt-2 block text-sm font-bold text-amber-500 hover:text-orange-700">★★★★☆ <span className="font-medium text-slate-600">sort by rating</span></Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-3 border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto text-xs font-semibold md:hidden">
              <Link href="/shop" className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5">All</Link>
              {categories.slice(0, 6).map((item) => <Link key={item} href={hrefFor({ category: item })} className="shrink-0 rounded-full border border-slate-300 px-3 py-1.5">{item}</Link>)}
            </div>
            <p className="text-xs font-semibold text-slate-600">Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Sort:</span>
              {[["featured", "Featured"], ["rating", "Rating"], ["price-asc", "Price: Low to High"], ["price-desc", "Price: High to Low"]].map(([value, label]) => (
                <Link key={value} href={hrefFor({ sort: value === "featured" ? undefined : value })} className={`rounded-full border px-3 py-1.5 ${sort === value ? "border-orange-500 bg-orange-50 font-black text-orange-800" : "border-slate-300 bg-white text-slate-700 hover:border-orange-400"}`}>{label}</Link>
              ))}
            </div>
          </div>

          {!category && !q ? <LocalListingsSection /> : null}

          <SectionErrorBoundary name="Product results">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="border border-slate-200 bg-white p-10 text-center">
                <h2 className="text-lg font-black text-slate-950">No matching products</h2>
                <p className="mt-2 text-sm text-slate-500">Try another search, department or price range.</p>
                <Link href="/shop" className="mt-5 inline-block rounded-full bg-orange-400 px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-orange-500">Reset shop</Link>
              </div>
            )}
          </SectionErrorBoundary>
        </div>
      </div>
    </main>
  );
}
