import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getCatalog } from "@/lib/catalog";
import { money } from "@/lib/products";

export const metadata = { title: "Deals" };

export default async function DealsPage() {
  const catalog = await getCatalog();
  const deals = catalog.products
    .filter((product) => product.oldPrice && product.oldPrice > product.price)
    .sort((a, b) => ((b.oldPrice! - b.price) / b.oldPrice!) - ((a.oldPrice! - a.price) / a.oldPrice!));
  const biggest = deals[0];

  return (
    <main className="mx-auto max-w-[1480px] px-3 py-6 md:px-6 md:py-8">
      <section className="grid gap-4 overflow-hidden rounded-[34px] bg-gradient-to-br from-[#ffe7d3] via-[#fff8f2] to-[#f4e3d7] p-6 ring-1 ring-orange-100 md:grid-cols-[1fr_320px] md:p-9">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a63d08]">Zomax deals</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-[#261d19] md:text-6xl">Good prices, easy to scan.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#594b42] md:text-base">Discounted products stay connected to seller, rating, location and stock information so the deal never hides the context.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/shop" className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Browse all products</Link>
            <Link href="/categories" className="rounded-2xl border border-[#dfd2ca] bg-white px-5 py-3 text-sm font-black text-[#493a31]">Browse categories</Link>
          </div>
        </div>
        <div className="rounded-[28px] bg-[#2b211c] p-5 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Best current markdown</p>
          {biggest ? <><p className="mt-5 text-2xl font-black text-white">{biggest.name}</p><p className="mt-2 text-sm text-stone-200">Now {money(biggest.price)} · was {money(biggest.oldPrice!)}</p><Link href={`/product/${biggest.id}`} className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[#2b211c]">View deal →</Link></> : <p className="mt-5 text-sm text-stone-200">New markdowns will appear here as the catalog grows.</p>}
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {[['Price drops', 'Products with a clear before-and-after price.'], ['Trusted context', 'Seller, location and rating stay visible.'], ['Fast actions', 'Quick view, save and cart controls stay one tap away.']].map(([title, text]) => <div key={title} className="rounded-[26px] bg-white p-5 ring-1 ring-[#e8ddd5]"><h2 className="font-black text-[#261d19]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#594b42]">{text}</p></div>)}
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d08]">Live markdowns</p><h2 className="mt-1 text-2xl font-black text-[#261d19] sm:text-3xl">Deals worth checking</h2></div><span className="text-sm font-bold text-[#66574d]">{deals.length} active</span></div>
        {deals.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{deals.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-[30px] bg-white p-8 text-center ring-1 ring-[#dfd2ca]"><p className="font-black text-[#261d19]">No active markdowns yet.</p><p className="mt-2 text-sm text-[#594b42]">The deals page is ready for catalog pricing rules when the backend lands.</p></div>}
      </section>
    </main>
  );
}
