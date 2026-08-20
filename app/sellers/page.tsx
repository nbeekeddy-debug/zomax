import Link from "next/link";
import { getCatalog } from "@/lib/catalog";

export const metadata = { title: "Sellers" };

export default async function SellersPage() {
  const catalog = await getCatalog();
  const groups = new Map<string, typeof catalog.products>();
  for (const product of catalog.products) {
    const items = groups.get(product.seller) || [];
    items.push(product);
    groups.set(product.seller, items);
  }

  const sellers = [...groups.entries()].map(([name, items]) => ({
    name,
    items,
    location: items[0]?.location || "Nigeria",
    rating: items.reduce((sum, item) => sum + item.rating, 0) / Math.max(1, items.length),
    reviews: items.reduce((sum, item) => sum + item.reviews, 0),
  })).sort((a, b) => b.rating - a.rating);

  return (
    <main className="mx-auto max-w-[1480px] px-3 py-6 md:px-6 md:py-8">
      <section className="grid gap-4 rounded-[34px] bg-[#2b211c] p-6 text-white md:grid-cols-[1fr_auto] md:items-end md:p-9">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">Seller directory</p><h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white md:text-5xl">Meet the stores behind the products.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-stone-200">Seller identity, location, reviews and listings stay visible before a buyer commits.</p></div>
        <Link href="/sell" className="w-fit rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Open a seller listing →</Link>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sellers.map((seller) => {
          const initial = seller.name.charAt(0).toUpperCase();
          return (
            <article key={seller.name} className="rounded-[30px] bg-white p-5 ring-1 ring-[#e8ddd5] sm:p-6">
              <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#2b211c] text-sm font-black text-white">{initial}</span><div className="min-w-0"><h2 className="truncate text-xl font-black text-[#261d19]">{seller.name}</h2><p className="mt-1 text-sm font-semibold text-[#66574d]">{seller.location}</p></div></div>
              <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-2xl bg-[#f7f3ef] p-3"><p className="text-[10px] font-black uppercase tracking-wide text-[#75655b]">Rating</p><p className="mt-1 font-black text-[#261d19]">★ {seller.rating.toFixed(1)}</p></div><div className="rounded-2xl bg-[#f7f3ef] p-3"><p className="text-[10px] font-black uppercase tracking-wide text-[#75655b]">Reviews</p><p className="mt-1 font-black text-[#261d19]">{seller.reviews}</p></div><div className="rounded-2xl bg-[#f7f3ef] p-3"><p className="text-[10px] font-black uppercase tracking-wide text-[#75655b]">Listings</p><p className="mt-1 font-black text-[#261d19]">{seller.items.length}</p></div></div>
              <div className="mt-5 flex flex-wrap gap-2">{[...new Set(seller.items.map((item) => item.category))].slice(0, 3).map((category) => <span key={category} className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-[#a63d08]">{category}</span>)}</div>
              <Link href={`/shop?q=${encodeURIComponent(seller.name)}`} className="mt-6 flex min-h-11 items-center justify-center rounded-2xl border border-[#dfd2ca] bg-white px-4 text-sm font-black text-[#493a31] hover:border-orange-300 hover:text-[#a63d08]">View seller products →</Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
