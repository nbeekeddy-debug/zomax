"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { money } from "@/lib/products";

export default function OrdersPage() {
  const { orders, hydrated } = useMarketplace();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-black text-slate-950">Orders</h1>
      <p className="mt-2 text-sm text-slate-500">Prototype orders remain compatible with the existing `zomax_orders` browser storage key.</p>
      <div className="mt-8 space-y-4">
        {!hydrated ? <div className="h-40 animate-pulse rounded-[30px] bg-slate-200" /> : orders.length ? orders.map((order) => (
          <Link href={`/confirmation?order=${encodeURIComponent(String(order.id))}`} key={String(order.id)} className="block rounded-[28px] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-900">Order #{order.id}</p>
                <p className="mt-1 text-sm text-slate-500">{order.date || "Date unavailable"} · {order.items?.length || 0} items · {money(Number(order.total || 0))}</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">{order.status || "Placed"}</span>
            </div>
          </Link>
        )) : <div className="rounded-[30px] bg-white p-10 text-center text-slate-500 shadow-sm">No orders yet.</div>}
      </div>
    </main>
  );
}
