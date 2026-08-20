"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useMarketplace } from "@/components/marketplace-provider";
import { products } from "@/lib/products";

export default function WishlistPage() {
  const { wishlist } = useMarketplace();
  const saved = products.filter((product) => wishlist.includes(product.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-black text-slate-950">Saved products</h1>
      <p className="mt-2 text-sm text-slate-500">Your wishlist is preserved using the existing Zomax browser storage key.</p>
      {saved.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-[30px] bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">Nothing saved yet.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Explore the shop</Link>
        </div>
      )}
    </main>
  );
}
