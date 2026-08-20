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
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <main id="main-content" className="mx-auto max-w-[1380px] px-3 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Your picks</p>
          <h1 className="mt-1 text-4xl font-black tracking-[-0.04em] text-slate-950">Zomax cart</h1>
        </div>
        <Link href="/shop" className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-orange-700">Keep exploring →</Link>
      </div>

      {!items.length ? (
        <div className="rounded-[36px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-[22px] bg-orange-50 text-2xl">◫</span>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Nothing here yet</h2>
          <p className="mt-2 text-sm text-slate-500">Your saved shopping flow is ready when you are.</p>
          <Link href="/shop" className="mt-6 inline-block rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white">Browse Zomax</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            {items.map(({ product, qty, id }) => (
              <article key={id} className="grid gap-4 rounded-[32px] bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-[150px_1fr] sm:p-5">
                <div className="overflow-hidden rounded-[24px] bg-[#f5efe9]">
                  {product ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.name} loading="lazy" className="h-40 w-full object-cover sm:h-full" />
                  ) : <div className="grid h-40 place-items-center text-xs font-bold text-amber-700 sm:h-full">Legacy item</div>}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{product?.name || `Product #${id}`}</h2>
                      {product ? <p className="mt-1 text-xs font-semibold text-slate-400">{product.seller} · {product.location}</p> : null}
                    </div>
                    <p className="text-xl font-black text-slate-950">{product ? money(product.price) : "Price unavailable"}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <span className={`rounded-full px-3 py-1.5 ${product ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{product ? "In stock" : "Needs migration check"}</span>
                    {product ? <span className="rounded-full bg-[#f7f3ef] px-3 py-1.5 text-slate-600">{product.category}</span> : null}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-2xl bg-[#f7f3ef] p-1 ring-1 ring-[#ebe2db]">
                      <button onClick={() => setQuantity(id, qty - 1)} className="grid h-9 w-9 place-items-center rounded-xl font-black hover:bg-white" aria-label="Decrease quantity">−</button>
                      <span className="min-w-10 text-center text-sm font-black">{qty}</span>
                      <button onClick={() => setQuantity(id, qty + 1)} className="grid h-9 w-9 place-items-center rounded-xl font-black hover:bg-white" aria-label="Increase quantity">+</button>
                    </div>
                    <button onClick={() => removeFromCart(id)} className="text-sm font-black text-slate-500 hover:text-red-600">Remove</button>
                    {product ? <Link href={`/product/${product.id}`} className="text-sm font-black text-orange-600">View item →</Link> : null}
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.18)] lg:sticky lg:top-36">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Checkout lane</p>
            <p className="mt-3 text-sm text-slate-400">{itemCount} item{itemCount === 1 ? "" : "s"} ready in your cart</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.04em]">{money(total)}</p>

            <div className="mt-6 space-y-3 rounded-[24px] bg-white/5 p-4 text-xs text-slate-300 ring-1 ring-white/10">
              <div className="flex justify-between gap-3"><span>Cart items</span><strong className="text-white">{itemCount}</strong></div>
              <div className="flex justify-between gap-3"><span>Pricing source</span><strong className="text-white">Zomax catalog</strong></div>
              <div className="flex justify-between gap-3"><span>Checkout</span><strong className="text-white">Existing flow</strong></div>
            </div>

            {unresolved.length ? <p className="mt-4 rounded-2xl bg-amber-400/10 p-3 text-xs font-bold text-amber-200">{unresolved.length} legacy cart item has no migrated price. Remove or re-add it before checkout so Zomax cannot charge the wrong total.</p> : null}

            <Link aria-disabled={Boolean(unresolved.length)} href={unresolved.length ? "/cart" : "/checkout"} className={`mt-6 block w-full rounded-2xl px-5 py-3 text-center text-sm font-black ${unresolved.length ? "cursor-not-allowed bg-white/10 text-slate-500" : "bg-orange-500 text-white hover:bg-orange-600"}`}>Continue to checkout</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
