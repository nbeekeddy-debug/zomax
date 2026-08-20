"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { money } from "@/lib/products";

export function ConfirmationClient({ orderId }: { orderId: string }) {
  const { orders, hydrated } = useMarketplace();
  const order = orders.find((item) => String(item.id) === orderId);

  if (!hydrated) return <div className="rounded-[32px] bg-white p-8 shadow-sm">Loading order…</div>;
  if (!order) {
    return (
      <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Order not found in this browser.</h1>
        <p className="mt-3 text-sm text-slate-500">The order may belong to another device or a future server-backed account.</p>
        <Link href="/orders" className="mt-6 inline-block rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">View orders</Link>
      </div>
    );
  }

  return (
    <div className="rounded-[36px] bg-white p-8 shadow-xl md:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div>
      <h1 className="mt-5 text-center text-3xl font-black text-slate-950">Order placed</h1>
      <p className="mt-2 text-center text-sm text-slate-500">Order #{order.id}</p>
      <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-sm">
        <div className="flex justify-between gap-4"><span className="text-slate-500">Total</span><b>{money(Number(order.total || 0))}</b></div>
        <div className="mt-3 flex justify-between gap-4"><span className="text-slate-500">Status</span><b>{order.status || "Placed"}</b></div>
        <div className="mt-3 flex justify-between gap-4"><span className="text-slate-500">Payment</span><b>{order.paymentMethod || "Pay on delivery"}</b></div>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">View orders</Link>
        <Link href="/shop" className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Keep shopping</Link>
      </div>
    </div>
  );
}
