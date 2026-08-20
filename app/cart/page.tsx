"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { money, products } from "@/lib/products";

export default function CartPage() {
  const { cart, removeFromCart, setQuantity } = useMarketplace();
  const items = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.qty, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-black text-slate-950">Your cart</h1>
      {!items.length ? (
        <div className="mt-8 rounded-[30px] bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map(({ product, qty }) => product && (
              <div key={product.id} className="flex gap-4 rounded-[26px] bg-white p-4 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-slate-900">{product.name}</h2>
                  <p className="mt-1 text-sm font-bold text-orange-600">{money(product.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setQuantity(product.id, qty - 1)} className="rounded-lg bg-slate-100 px-3 py-1 font-black">−</button>
                    <span className="min-w-6 text-center font-black">{qty}</span>
                    <button onClick={() => setQuantity(product.id, qty + 1)} className="rounded-lg bg-slate-100 px-3 py-1 font-black">+</button>
                    <button onClick={() => removeFromCart(product.id)} className="ml-auto text-sm font-bold text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-[30px] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-slate-400">Order total</p>
            <p className="mt-2 text-3xl font-black">{money(total)}</p>
            <button className="mt-6 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black hover:bg-orange-600">Continue checkout</button>
          </aside>
        </div>
      )}
    </main>
  );
}
