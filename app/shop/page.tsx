import Link from "next/link";
import { LocalListingsSection } from "@/components/local-listings-section";
import { MobileFilterDrawer } from "@/components/mobile-filter-drawer";
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

  const priceItems = [
    { label: "Any price", href: hrefFor({ price: undefined }), active: !price },
    { label: "Under ₦50k", href: hrefFor({ price: "under-50" }), active: price === "under-50" },
    { label: "₦50k – ₦100k", href: hrefFor({ price: "50-100" }), active: price === "50-100" },
    { label: "Over ₦100k", href: hrefFor({ price: "over-100" }), active: price === "over-100" },
  ];

  const sortItems = [
    { label: "Popular", href: hrefFor({ sort: undefined }), active: sort === "featured" },
    { label: "Top rated", href: hrefFor({ sort: "rating" }), active: sort === "rating" },
    { label: "Price ↑", href: hrefFor({ sort: "price-asc" }), active: sort === "price-asc" },
    { label: "Price ↓", href: hrefFor({ sort: "price-desc" }), active: sort === "price-desc" },
  ];

  const heading = q ? `Results for “${q}”` : category || "Explore Zomax";

  return (
    <main id="main-content" className="mx-auto max-w-[1480px] px-3 py-6 md:px-6 md:py-8">
      <section className="overflow-hidden rounded-[34px] bg-[#2b211c] px-5 py-7 text-white md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Discovery studio</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-white md:text-5xl">{heading}</h1>
            <p className="mt-2 text-sm text-stone-200">{filtered.length} result{filtered.length === 1 ? "" : "s"} across products, sellers and locations.</p>
          </div>
          <div className="hidden flex-wrap gap-2 text-xs font-black lg:flex">
            {sortItems.map((item) => (
              <Link key={item.label} href={item.href} className={`rounded-full px-4 py-2 ring-1 transition ${item.active ? "bg-orange-500 text-white ring-orange-500" : "bg-white/10 text-white ring-white/15 hover:bg-white/15"}`}>{item.label}</Link>
            ))}
          </div>
        </div>
      </section>

      {catalog.degraded ? <p className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">The live catalog pipeline failed safely. Showing the local fallback catalog instead.</p> : null}

      <section className="mt-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={hrefFor({ category: undefined })} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${!category ? "bg-[#2b211c] text-white" : "bg-white text-[#493a31] ring-1 ring-[#dfd2ca]"}`}>All lanes</Link>
        {categories.map((item) => (
          <Link key={item} href={hrefFor({ category: item })} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${category === item ? "bg-orange-500 text-white" : "bg-white text-[#493a31] ring-1 ring-[#dfd2ca] hover:ring-orange-200"}`}>{item}</Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden h-fit rounded-[30px] bg-[#f7f3ef] p-5 ring-1 ring-[#ebe2db] lg:sticky lg:top-36 lg:block">
          <div className="flex items-center justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a63d08]">Refine</p><h2 className="mt-1 text-xl font-black text-[#261d19]">Shape the feed</h2></div>
            {(category || q || price || sort !== "featured") ? <Link href="/shop" className="text-xs font-black text-[#a63d08]">Reset</Link> : null}
          </div>

          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#66574d]">Price range</p>
            <div className="mt-3 grid gap-2">
              {priceItems.map((item) => (
                <Link key={item.label} href={item.href} className={`rounded-2xl px-3 py-2.5 text-sm font-bold ${item.active ? "bg-white text-[#a63d08] shadow-sm ring-1 ring-orange-200" : "text-[#493a31] hover:bg-white/70"}`}>{item.label}</Link>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/75 p-4">
            <p className="text-xs font-black text-[#342923]">Search context</p>
            <p className="mt-1 text-xs leading-5 text-[#66574d]">Zomax search matches product names, categories, sellers and locations.</p>
          </div>
        </aside>

        <div className="min-w-0">
          {!category && !q ? <LocalListingsSection /> : null}

          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a63d08]">Market feed</p>
              <p className="mt-1 text-sm font-semibold text-[#66574d]">Showing {filtered.length} product{filtered.length === 1 ? "" : "s"}</p>
            </div>
            <div className="flex items-center gap-2">
              <MobileFilterDrawer priceItems={priceItems} sortItems={sortItems} />
              <Link href="/sell" className="hidden rounded-full bg-white px-4 py-2 text-xs font-black text-[#493a31] shadow-sm ring-1 ring-[#dfd2ca] hover:text-[#a63d08] sm:block">List a product →</Link>
            </div>
          </div>

          <SectionErrorBoundary name="Product results">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <div className="rounded-[34px] bg-white p-10 text-center shadow-sm ring-1 ring-[#dfd2ca]">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-[#a63d08]">⌕</span>
                <h2 className="mt-4 text-xl font-black text-[#261d19]">Nothing matched that route</h2>
                <p className="mt-2 text-sm text-[#66574d]">Try another search, category or price range.</p>
                <Link href="/shop" className="mt-5 inline-block rounded-2xl bg-[#2b211c] px-5 py-2.5 text-sm font-black text-white">Reset discovery</Link>
              </div>
            )}
          </SectionErrorBoundary>
        </div>
      </div>
    </main>
  );
}
