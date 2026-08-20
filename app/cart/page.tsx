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
    <main id="main-content" className="mx-auto max-w-[1500px] px-3 py-5 md:px-5">
      {!items.length ? (
        <div className="border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Your Zomax Cart is empty</h1>
          <p className="mt-2 text-sm text-slate-600">Browse the marketplace and add products from trusted sellers.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-full bg-orange-400 px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-orange-500">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <section className="border border-slate-200 bg-white shadow-sm">
            <div className="flex items-end justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h1 className="text-2xl font-black text-slate-950 md:text-3xl">Shopping Cart</h1>
                <p className="mt-1 text-sm text-slate-500">{itemCount} item{itemCount === 1 ? "" : "s"}</p>
              </div>
              <span className="hidden text-sm text-slate-500 sm:block">Price</span>
            </div>

            <div className="divide-y divide-slate-200 px-4 md:px-5">
              {items.map(({ product, qty, id }) => (
                <article key={id} className="flex gap-4 py-5">
                  {product ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.name} loading="lazy" className="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36" />
                  ) : <div className="grid h-28 w-28 shrink-0 place-items-center bg-amber-50 text-xs font-bold text-amber-700 sm:h-36 sm:w-36">Legacy item</div>}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                      <div>
                        <h2 className="text-base font-semibold leading-6 text-slate-950">{product?.name || `Product #${id}`}</h2>
                        {product ? <p className="mt-1 text-xs text-slate-500">Sold by {product.seller} · {product.location}</p> : null}
                        {product ? <p className="mt-2 text-sm font-semibold text-emerald-700">In stock</p> : <p className="mt-2 text-sm font-semibold text-amber-700">Needs migration check</p>}
                        <p className="mt-1 text-xs font-semibold text-slate-600">FREE delivery eligible</p>
                      </div>
                      <p className="shrink-0 text-lg font-black text-slate-950">{product ? money(product.price) : "Price unavailable"}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                      <div className="flex items-center rounded-full border border-slate-300 bg-white shadow-sm">
                        <button onClick={() => setQuantity(id, qty - 1)} className="grid h-9 w-9 place-items-center rounded-l-full font-black hover:bg-slate-100" aria-label="Decrease quantity">−</button>
                        <span className="min-w-9 text-center text-sm font-black">{qty}</span>
                        <button onClick={() => setQuantity(id, qty + 1)} className="grid h-9 w-9 place-items-center rounded-r-full font-black hover:bg-slate-100" aria-label="Increase quantity">+</button>
                      </div>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => removeFromCart(id)} className="font-semibold text-sky-700 hover:text-orange-700 hover:underline">Delete</button>
                      {product ? <><span className="text-slate-300">|</span><Link href={`/product/${product.id}`} className="font-semibold text-sky-700 hover:text-orange-700 hover:underline">View product</Link></> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-slate-200 px-5 py-4 text-right">
              <p className="text-lg text-slate-800">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"}): <strong className="text-xl text-slate-950">{money(total)}</strong></p>
            </div>
          </section>

          <aside className="h-fit border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-32">
            <p className="text-sm font-semibold text-emerald-700">✓ Your order is eligible for the Zomax checkout flow.</p>
            <p className="mt-4 text-lg text-slate-800">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"}):</p>
            <p className="text-2xl font-black text-slate-950">{money(total)}</p>
            {unresolved.length ? (
              <p className="mt-4 border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800">{unresolved.length} legacy cart item has no migrated price. Remove or re-add it before checkout so Zomax cannot charge the wrong total.</p>
            ) : null}
            <Link aria-disabled={Boolean(unresolved.length)} href={unresolved.length ? "/cart" : "/checkout"} className={`mt-5 block w-full rounded-full px-5 py-3 text-center text-sm font-black ${unresolved.length ? "cursor-not-allowed bg-slate-200 text-slate-500" : "bg-orange-400 text-slate-950 hover:bg-orange-500"}`}>Proceed to checkout</Link>
            <Link href="/shop" className="mt-3 block text-center text-sm font-semibold text-sky-700 hover:text-orange-700 hover:underline">Continue shopping</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
