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
      items: items.flatMap((item) => item.product ? [{
        id: item.id,
        qty: item.qty,
        name: item.product.name,
        unitPrice: item.product.price,
        seller: item.product.seller,
        image: item.product.image,
      }] : []),
    });
    router.push(`/confirmation?order=${encodeURIComponent(String(order.id))}`);
  }

  if (!hydrated) return (
    <main className="mx-auto max-w-5xl px-3 py-8 sm:px-4 md:px-6" aria-busy="true">
      <div className="h-80 animate-pulse rounded-[28px] bg-[#eee4dd]" aria-hidden="true" />
      <p role="status" aria-live="polite" className="sr-only">Loading checkout details…</p>
    </main>
  );
  if (!cart.length) return <main className="mx-auto max-w-3xl px-3 py-14 text-center sm:px-4"><h1 className="text-3xl font-black text-[#2b211c]">Your cart is empty.</h1><Link href="/shop" className="mt-6 inline-block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Shop products</Link></main>;

  return (
    <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-600">Checkout</p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#2b211c] sm:text-4xl">Delivery details</h1>
      <div className="mt-6 grid gap-5 lg:mt-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-4 rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#eadfd7] sm:p-6 md:rounded-[32px] md:p-8">
          <label className="block text-sm font-bold text-[#5f5046]">Full name<input required name="name" defaultValue={account.name || ""} autoComplete="name" className="mt-2 w-full rounded-2xl border border-[#eadfd7] bg-[#fffdfb] px-4 py-3.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
          <label className="block text-sm font-bold text-[#5f5046]">Email<input required type="email" name="email" defaultValue={account.email || ""} autoComplete="email" className="mt-2 w-full rounded-2xl border border-[#eadfd7] bg-[#fffdfb] px-4 py-3.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
          <label className="block text-sm font-bold text-[#5f5046]">Delivery address<textarea required name="address" defaultValue={account.address || ""} rows={4} autoComplete="street-address" className="mt-2 w-full resize-y rounded-2xl border border-[#eadfd7] bg-[#fffdfb] px-4 py-3.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-black text-emerald-900">Pay on delivery</p>
            <p className="mt-1 text-xs leading-5 text-emerald-800">No card details are collected in the browser prototype. A real payment gateway will replace this before production launch.</p>
          </div>
          {unresolved ? <p role="alert" className="rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-900">Checkout is blocked because a legacy cart item has no migrated price.</p> : null}
          <button disabled={unresolved} className="min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300">Place order</button>
        </form>

        <aside className="h-fit rounded-[28px] bg-[#fff1e7] p-5 text-[#2b211c] ring-1 ring-orange-100 sm:p-6 lg:sticky lg:top-36">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-black">Order summary</h2><span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-orange-700 ring-1 ring-orange-100">ZOMAX</span></div>
          <div className="mt-4 space-y-3 text-sm">
            {items.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="min-w-0 text-[#6b5a4f]">{item.product?.name || `Product #${item.id}`} × {item.qty}</span><b className="shrink-0">{item.product ? money(item.product.price * item.qty) : "—"}</b></div>)}
          </div>
          <div className="mt-5 border-t border-orange-200 pt-5"><div className="flex justify-between gap-3"><span className="text-[#7a685d]">Total</span><b className="text-xl">{money(total)}</b></div></div>
        </aside>
      </div>
    </main>
  );
}
