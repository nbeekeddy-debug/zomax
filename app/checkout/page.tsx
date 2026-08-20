"use client";

import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { money, products } from "@/lib/products";

export default function CheckoutPage() {
  const router = useRouter();
  const { account, cart, hydrated, placeOrder, sellerListings } = useMarketplace();
  const catalog = [...sellerListings, ...products];
  const items = cart.map((item) => ({ ...item, product: catalog.find((product) => product.id === item.id) }));
  const unresolved = items.some((item) => !item.product);
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart.length || unresolved) return;
    const form = new FormData(event.currentTarget);
    const order = placeOrder({
      total,
      customer: {
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        address: String(form.get("address") || "").trim(),
      },
      paymentMethod: "Pay on delivery",
    });
    router.push(`/confirmation?order=${encodeURIComponent(String(order.id))}`);
  }

  if (!hydrated) return <main className="mx-auto max-w-5xl px-4 py-10 md:px-6"><div className="h-80 animate-pulse rounded-[32px] bg-slate-200" /></main>;
  if (!cart.length) return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-3xl font-black">Your cart is empty.</h1><Link href="/shop" className="mt-6 inline-block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Shop products</Link></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Checkout</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Delivery details</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-4 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <label className="block text-sm font-bold text-slate-700">Full name<input required name="name" defaultValue={account.name || ""} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <label className="block text-sm font-bold text-slate-700">Email<input required type="email" name="email" defaultValue={account.email || ""} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <label className="block text-sm font-bold text-slate-700">Delivery address<textarea required name="address" defaultValue={account.address || ""} rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-black text-emerald-900">Pay on delivery</p>
            <p className="mt-1 text-xs text-emerald-800">No card details are collected in the browser prototype. A real payment gateway will replace this before production launch.</p>
          </div>
          {unresolved ? <p className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Checkout is blocked because a legacy cart item has no migrated price.</p> : null}
          <button disabled={unresolved} className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">Place order</button>
        </form>
        <aside className="h-fit rounded-[30px] bg-slate-950 p-6 text-white">
          <h2 className="font-black">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="text-slate-300">{item.product?.name || `Product #${item.id}`} × {item.qty}</span><b>{item.product ? money(item.product.price * item.qty) : "—"}</b></div>)}
          </div>
          <div className="mt-5 border-t border-white/10 pt-5"><div className="flex justify-between"><span className="text-slate-400">Total</span><b className="text-xl">{money(total)}</b></div></div>
        </aside>
      </div>
    </main>
  );
}
