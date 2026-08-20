import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/products";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const category = params.category;
  const filtered = category ? products.filter((product) => product.category === category) : products;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Marketplace</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{category || "Shop everything"}</h1>
          <p className="mt-2 text-sm text-slate-500">{filtered.length} products available in this migration dataset.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <a href="/shop" className="rounded-full bg-slate-900 px-4 py-2 text-white">All</a>
          {categories.slice(0, 5).map((item) => (
            <a key={item} href={`/shop?category=${encodeURIComponent(item)}`} className="rounded-full bg-white px-4 py-2 text-slate-700 shadow-sm hover:text-orange-600">{item}</a>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}
