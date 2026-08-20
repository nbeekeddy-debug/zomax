"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { money, products } from "@/lib/products";

export default function CartPage() {
  const { cart, removeFromCart, setQuantity, sellerListings } = useMarketplace();
  const catalog = [...sellerListings, ...products];
  const items = cart.map((item) => ({ ...item, product: catalog.find((product) => product.id === item.id) }));
  const unresolved = items.filter((item) => !item.product);
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
            {items.map(({ product, qty, id }) => (
              <div key={id} className="flex gap-4 rounded-[26px] bg-white p-4 shadow-sm">
                {product ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt={product.name} loading="lazy" className="h-24 w-24 rounded-2xl object-cover" />
                ) : <div className="grid h-24 w-24 place-items-center rounded-2xl bg-amber-50 text-xs font-bold text-amber-700">Legacy item</div>}
                <div className="min-w-0 flex-1">
                  <h2 className="font-black text-slate-900">{product?.name || `Product #${id}`}</h2>
                  <p className="mt-1 text-sm font-bold text-orange-600">{product ? money(product.price) : "Price unavailable"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setQuantity(id, qty - 1)} className="rounded-lg bg-slate-100 px-3 py-1 font-black">−</button>
                    <span className="min-w-6 text-center font-black">{qty}</span>
                    <button onClick={() => setQuantity(id, qty + 1)} className="rounded-lg bg-slate-100 px-3 py-1 font-black">+</button>
                    <button onClick={() => removeFromCart(id)} className="ml-auto text-sm font-bold text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-[30px] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-slate-400">Order total</p>
            <p className="mt-2 text-3xl font-black">{money(total)}</p>
            {unresolved.length ? (
              <p className="mt-4 rounded-xl bg-amber-400/10 p-3 text-xs font-bold text-amber-200">{unresolved.length} legacy cart item has no migrated price. Remove or re-add it before checkout so Zomax cannot charge the wrong total.</p>
            ) : null}
            <Link aria-disabled={Boolean(unresolved.length)} href={unresolved.length ? "/cart" : "/checkout"} className={`mt-6 block w-full rounded-2xl px-5 py-3 text-center font-black ${unresolved.length ? "cursor-not-allowed bg-slate-700 text-slate-400" : "bg-orange-500 text-white hover:bg-orange-600"}`}>Continue checkout</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
