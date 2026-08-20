import Link from "next/link";
import { money, products } from "@/lib/products";

export default function SellerPage() {
  const catalogValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const inventory = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Store dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">The old dashboard is being split into focused Next.js seller routes.</p>
        </div>
        <Link href="/sell" className="rounded-2xl bg-orange-500 px-5 py-3 text-center font-black text-white">Add product</Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Listings", products.length.toString()],
          ["Units in stock", inventory.toString()],
          ["Catalog value", money(catalogValue)],
          ["Store health", "Good"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[28px] bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Recent listings</h2>
        <div className="mt-5 divide-y divide-slate-100">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-500">{product.stock} in stock · {money(product.price)}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Active</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
