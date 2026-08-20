"use client";

import { FormEvent, useState } from "react";
import { categories } from "@/lib/products";

export default function SellPage() {
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Create a listing</h1>
      <p className="mt-2 text-sm text-slate-500">This React form is ready to be connected to the real product API/database next.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        <label className="block text-sm font-bold text-slate-700">Product name
          <input required name="name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Category
            <select name="category" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold text-slate-700">Price (₦)
            <input required min="0" type="number" name="price" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
        </div>
        <label className="block text-sm font-bold text-slate-700">Image URL
          <input type="url" name="image" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
        </label>
        <label className="block text-sm font-bold text-slate-700">Description
          <textarea required rows={5} name="description" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
        </label>
        <button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600">Save listing</button>
        {saved ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">Form captured in the migrated UI. Database persistence is intentionally not faked yet.</p> : null}
      </form>
    </main>
  );
}
