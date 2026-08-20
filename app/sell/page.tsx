"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { categories } from "@/lib/products";

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85";

export default function SellPage() {
  const { account, saveSellerListing } = useMarketplace();
  const [savedId, setSavedId] = useState<number | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const listing = saveSellerListing({
      name: String(form.get("name") || "").trim(),
      category: String(form.get("category") || categories[0]),
      price: Math.max(0, Number(form.get("price")) || 0),
      oldPrice: undefined,
      seller: account.storeInfo?.storeName || account.name || "My Zomax Store",
      location: account.storeInfo?.storeLocation || "Nigeria",
      image: String(form.get("image") || "").trim() || fallbackImage,
      description: String(form.get("description") || "").trim(),
      stock: Math.max(0, Number(form.get("stock")) || 1),
    });
    setSavedId(listing.id);
    event.currentTarget.reset();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Create a listing</h1>
      <p className="mt-2 text-sm text-slate-500">Listings now persist locally and appear in the migrated shop/seller views until the production product API takes over.</p>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        <label className="block text-sm font-bold text-slate-700">Product name<input required name="name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-bold text-slate-700">Category<select name="category" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block text-sm font-bold text-slate-700">Price (₦)<input required min="0" type="number" name="price" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <label className="block text-sm font-bold text-slate-700">Stock<input required min="0" type="number" name="stock" defaultValue="1" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
        </div>
        <label className="block text-sm font-bold text-slate-700">Image URL<input type="url" name="image" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
        <label className="block text-sm font-bold text-slate-700">Description<textarea required rows={5} name="description" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
        <button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600">Save listing</button>
        {savedId ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Listing saved locally. <Link href="/shop" className="underline">View it in the shop.</Link></p> : null}
      </form>
    </main>
  );
}
