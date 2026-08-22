"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { useMarketplace } from "@/components/marketplace-provider";
import { categories } from "@/lib/products";

const fallbackImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85";

function SellForm() {
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

  const input = "mt-2 w-full rounded-2xl border border-[#dfd2ca] bg-[#fffdfb] px-4 py-3.5 text-[#342923] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a63d08]">Seller center</p>
      <h1 className="mt-2 text-4xl font-black text-[#261d19]">Create a listing</h1>
      <p className="mt-2 text-sm leading-6 text-[#594b42]">This listing is isolated to your signed-in frontend account until the production product database is connected.</p>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-[#eadfd7] md:p-8">
        <label className="block text-sm font-bold text-[#493a31]">Product name<input required name="name" className={input} /></label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-bold text-[#493a31]">Category<select name="category" className={input}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block text-sm font-bold text-[#493a31]">Price (₦)<input required min="0" type="number" name="price" className={input} /></label>
          <label className="block text-sm font-bold text-[#493a31]">Stock<input required min="0" type="number" name="stock" defaultValue="1" className={input} /></label>
        </div>
        <label className="block text-sm font-bold text-[#493a31]">Image URL<input type="url" name="image" placeholder="https://…" className={input} /></label>
        <label className="block text-sm font-bold text-[#493a31]">Description<textarea required rows={5} name="description" className={input} /></label>
        <button type="submit" className="w-full rounded-2xl bg-[#c94b0b] px-5 py-3 font-black text-white hover:bg-[#a83a08]">Save listing</button>
        {savedId ? <p role="status" aria-live="polite" className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Listing saved to this account. <Link href="/shop" className="underline">View it in the shop.</Link></p> : null}
      </form>
    </main>
  );
}

export default function SellPage() {
  return (
    <AuthGate
      title="Sign in before listing a product"
      description="Zomax needs an account identity so seller inventory cannot leak between people using the same browser."
    >
      <SellForm />
    </AuthGate>
  );
}
