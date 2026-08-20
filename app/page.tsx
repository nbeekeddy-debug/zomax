import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { SectionSkeleton } from "@/components/section-skeleton";
import { getCatalog } from "@/lib/catalog";
import { categories, money } from "@/lib/products";

async function FeaturedProducts() {
  const catalog = await getCatalog();
  const featured = catalog.products.slice(0, 8);

  return (
    <SectionErrorBoundary name="Featured products">
      {catalog.degraded ? <p className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live catalog is temporarily unavailable, so Zomax is showing its safe fallback catalog.</p> : null}
      {featured.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : <div className="rounded-[32px] bg-white p-8 text-center text-sm text-[#66574d]">No products are available yet.</div>}
    </SectionErrorBoundary>
  );
}

async function MarketExtras() {
  const catalog = await getCatalog();
  const deals = catalog.products.filter((product) => product.oldPrice && product.oldPrice > product.price).slice(0, 2);
  const sellers = [...catalog.products]
    .sort((a, b) => b.rating - a.rating)
    .filter((product, index, items) => items.findIndex((item) => item.seller === product.seller) === index)
    .slice(0, 3);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-[32px] bg-[#2b211c] p-5 text-white sm:p-7">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Price drops</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">Deals with context</h2></div>
          <Link href="/deals" className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-black text-[#2b211c]">All deals →</Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {deals.length ? deals.map((product) => {
            const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
            return <Link key={product.id} href={`/product/${product.id}`} className="rounded-[24px] bg-white/10 p-4 text-white ring-1 ring-white/10 transition hover:bg-white/15"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white">-{discount}%</span><span className="text-xs font-bold text-stone-300">{product.location}</span></div><h3 className="mt-6 text-lg font-black text-white">{product.name}</h3><div className="mt-3 flex items-end gap-2"><span className="text-xl font-black text-white">{money(product.price)}</span><span className="text-xs font-bold text-stone-400 line-through">{money(product.oldPrice!)}</span></div><p className="mt-2 text-xs font-semibold text-stone-200">{product.seller} · ★ {product.rating}</p></Link>;
          }) : <div className="sm:col-span-2 rounded-[24px] bg-white/10 p-5 text-sm text-stone-200">New price drops will appear here automatically as the catalog grows.</div>}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-5 ring-1 ring-[#e8ddd5] sm:p-7">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d08]">Seller spotlight</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#261d19] sm:text-3xl">Know who you buy from</h2></div><Link href="/sellers" className="text-xs font-black text-[#a63d08]">Directory →</Link></div>
        <div className="mt-5 space-y-3">
          {sellers.map((seller) => <Link key={seller.seller} href={`/shop?q=${encodeURIComponent(seller.seller)}`} className="flex items-center gap-3 rounded-[22px] bg-[#f8f4f0] p-3.5 ring-1 ring-[#eee5df] transition hover:ring-orange-200"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#2b211c] text-xs font-black text-white">{seller.seller.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate font-black text-[#261d19]">{seller.seller}</p><p className="mt-1 text-xs font-semibold text-[#66574d]">{seller.location} · {seller.category}</p></div><span className="shrink-0 text-xs font-black text-amber-800">★ {seller.rating}</span></Link>)}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="pb-16">
      <section className="mx-auto max-w-[1480px] px-3 pt-4 sm:pt-5 md:px-6 md:pt-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="relative min-h-[390px] overflow-hidden rounded-[30px] bg-gradient-to-br from-[#fff0e4] via-[#fffaf5] to-[#f3dfd1] p-6 text-[#2b211c] shadow-[0_28px_80px_rgba(88,66,51,0.11)] sm:rounded-[38px] sm:p-8 md:min-h-[430px] md:p-11">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-black text-[#a63d08] ring-1 ring-orange-100">ZOMAX / MARKET MODE</div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:mt-6 md:text-6xl">Find what fits your life, not just your cart.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#594b42] md:text-base">A marketplace shaped around discovery: real seller details, clear pricing, local context and faster paths from browsing to buying.</p>
              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row sm:mt-8 sm:flex-wrap">
                <Link href="/shop" className="rounded-2xl bg-orange-500 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-orange-950/10 hover:bg-orange-600">Explore the market</Link>
                <Link href="/deals" className="rounded-2xl bg-white/80 px-6 py-3 text-center text-sm font-black text-[#4b3d34] ring-1 ring-[#e7d7cc] hover:bg-white">See deals</Link>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-orange-400/30 blur-3xl" />
            <div className="absolute right-10 top-10 hidden h-44 w-44 rotate-12 rounded-[42px] border border-white/60 bg-white/20 lg:block" />
            <div className="absolute bottom-8 right-8 hidden w-52 rounded-[28px] bg-white/70 p-4 text-[#514238] backdrop-blur-xl ring-1 ring-white md:block">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a63d08]">Zomax signal</p>
              <p className="mt-2 text-sm font-bold">Products, sellers and locations stay visible while you browse.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/categories" className="group rounded-[30px] bg-[#fff1e7] p-5 ring-1 ring-orange-100 transition hover:-translate-y-1 sm:rounded-[34px] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d08]">Quick route</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#2b211c] sm:text-3xl">Start with a category</h2>
              <p className="mt-3 text-sm leading-6 text-[#594b42]">Browse the marketplace by what you need, then refine by price, seller or location.</p>
              <span className="mt-6 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white sm:mt-8">Browse categories →</span>
            </Link>
            <Link href="/seller" className="group rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-[#eadfd7] transition hover:-translate-y-1 sm:rounded-[34px] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#66574d]">For sellers</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#2b211c] sm:text-3xl">Run your Zomax store</h2>
              <p className="mt-3 text-sm leading-6 text-[#594b42]">Listings, store details, orders and analytics stay in the existing seller flow.</p>
              <span className="mt-6 inline-flex rounded-full bg-[#2b211c] px-4 py-2 text-sm font-black text-white sm:mt-8">Seller studio →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1480px] px-3 md:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#a63d08]">Browse by mood</p><h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-[#2b211c] md:text-3xl">Pick a lane</h2></div>
          <Link href="/categories" className="text-sm font-black text-[#594b42] hover:text-[#a63d08]">All categories →</Link>
        </div>
        <SectionErrorBoundary name="Categories">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.slice(0, 10).map((category, index) => (
              <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="group min-w-[165px] rounded-[26px] bg-white p-4 shadow-sm ring-1 ring-[#eadfd7] transition hover:-translate-y-1 hover:ring-orange-200 sm:min-w-[190px] sm:rounded-[28px] sm:p-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2b211c] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 text-base font-black text-[#2b211c] sm:mt-6 sm:text-lg">{category}</h3>
                <p className="mt-2 text-xs font-bold text-[#a63d08]">Explore →</p>
              </Link>
            ))}
          </div>
        </SectionErrorBoundary>
      </section>

      <section className="mx-auto mt-10 max-w-[1480px] px-3 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#a63d08]">Fresh on Zomax</p><h2 className="mt-1 text-2xl font-black tracking-[-0.035em] text-[#2b211c] sm:text-3xl">Worth a closer look</h2></div><Link href="/shop" className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-black text-[#594b42] shadow-sm ring-1 ring-[#eadfd7] hover:text-[#a63d08] sm:px-4 sm:text-sm">See all</Link></div>
        <Suspense fallback={<SectionSkeleton cards={4} />}><FeaturedProducts /></Suspense>
      </section>

      <section className="mx-auto mt-10 max-w-[1480px] px-3 md:px-6"><Suspense fallback={<SectionSkeleton cards={2} />}><MarketExtras /></Suspense></section>

      <section className="mx-auto mt-10 max-w-[1480px] px-3 md:px-6">
        <div className="mb-4"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d08]">Marketplace essentials</p><h2 className="mt-1 text-2xl font-black text-[#261d19] sm:text-3xl">More than a product grid</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Deals", "Track products with clear markdowns.", "/deals"],
            ["Seller directory", "See stores, locations and ratings.", "/sellers"],
            ["Your account", "Orders, saved items and profile tools.", "/account"],
            ["Help & safety", "Understand flows and get unstuck.", "/help"],
          ].map(([title, text, href]) => <Link key={title} href={href} className="rounded-[26px] bg-[#f7f3ef] p-5 ring-1 ring-[#ebe2db] transition hover:-translate-y-1 hover:ring-orange-200"><h3 className="font-black text-[#261d19]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#594b42]">{text}</p><span className="mt-5 inline-flex text-xs font-black text-[#a63d08]">Open →</span></Link>)}
        </div>
      </section>
    </main>
  );
}
