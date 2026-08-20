"use client";

import { useEffect, useState } from "react";

type Order = { id: string | number; total?: number; status?: string; date?: string; items?: unknown[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try { setOrders(JSON.parse(localStorage.getItem("zomax_orders") || "[]")); } catch { setOrders([]); }
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-black text-slate-950">Orders</h1>
      <p className="mt-2 text-sm text-slate-500">Existing prototype orders are read from the same Zomax storage key during migration.</p>
      <div className="mt-8 space-y-4">
        {orders.length ? orders.map((order) => (
          <div key={String(order.id)} className="rounded-[28px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-900">Order #{order.id}</p>
                <p className="mt-1 text-sm text-slate-500">{order.date || "Date unavailable"} · {order.items?.length || 0} items</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">{order.status || "Placed"}</span>
            </div>
          </div>
        )) : (
          <div className="rounded-[30px] bg-white p-10 text-center text-slate-500 shadow-sm">No orders yet.</div>
        )}
      </div>
    </main>
  );
}
