import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";

export const metadata = { title: "Categories" };

const categoryNotes: Record<string, string> = {
  Fashion: "Everyday style, footwear and accessories.",
  Electronics: "Devices, audio and useful tech.",
  "Home & Living": "Furniture, lighting and home essentials.",
  Beauty: "Beauty, grooming and personal care.",
  "Food & Groceries": "Pantry, staples and everyday food items.",
  Sports: "Fitness, training and recreation.",
  Automotive: "Car care, parts and accessories.",
  Kids: "Products for children and family life.",
  Services: "Local services and skilled providers.",
  "Phones & Tablets": "Mobile devices and accessories.",
};

export default async function CategoriesPage() {
  const catalog = await getCatalog();

  return (
    <main className="mx-auto max-w-[1480px] px-3 py-6 md:px-6 md:py-8">
      <section className="rounded-[34px] bg-white p-6 ring-1 ring-[#e8ddd5] md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a63d08]">Browse Zomax</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h1 className="text-4xl font-black tracking-[-0.045em] text-[#261d19] md:text-5xl">Shop by category</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#594b42]">Start broad, then narrow with price, seller, rating and location inside the marketplace feed.</p></div>
          <Link href="/shop" className="w-fit rounded-2xl bg-[#2b211c] px-5 py-3 text-sm font-black text-white">Open full market →</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category, index) => {
          const count = catalog.products.filter((product) => product.category === category).length;
          return (
            <Link key={category} href={`/shop?category=${encodeURIComponent(category)}`} className="group rounded-[30px] bg-[#fffdfb] p-5 ring-1 ring-[#e8ddd5] transition hover:-translate-y-1 hover:ring-orange-200 sm:p-6">
              <div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2b211c] text-xs font-black text-white">{String(index + 1).padStart(2, "0")}</span><span className="rounded-full bg-[#f7f2ee] px-3 py-1 text-xs font-black text-[#66574d]">{count} listed</span></div>
              <h2 className="mt-8 text-xl font-black tracking-[-0.025em] text-[#261d19]">{category}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#594b42]">{categoryNotes[category] || "Explore products and sellers in this category."}</p>
              <span className="mt-6 inline-flex text-sm font-black text-[#a63d08]">Explore category →</span>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
