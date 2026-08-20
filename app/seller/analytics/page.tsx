"use client";

import { useMarketplace } from "@/components/marketplace-provider";
import { money } from "@/lib/products";

export default function SellerAnalyticsPage() {
  const { orders, hydrated } = useMarketplace();
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const average = orders.length ? revenue / orders.length : 0;
  const max = Math.max(1, ...orders.slice(0, 8).map((order) => Number(order.total || 0)));

  return <main className="mx-auto max-w-6xl px-4 py-10 md:px-6"><p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p><h1 className="mt-2 text-4xl font-black text-slate-950">Analytics</h1><p className="mt-2 text-sm text-slate-500">Local migration analytics now use actual prototype orders; the documented revenue API remains the production target.</p>{!hydrated ? <div className="mt-8 h-64 animate-pulse rounded-[32px] bg-slate-200" /> : <><section className="mt-8 grid gap-4 sm:grid-cols-3">{[["Revenue", money(revenue)],["Orders", String(orders.length)],["Avg. order", money(average)]].map(([label, value]) => <div key={label} className="rounded-[28px] bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-3 text-2xl font-black text-slate-950">{value}</p></div>)}</section><section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Recent order values</h2><div className="mt-6 space-y-4">{orders.slice(0, 8).length ? orders.slice(0, 8).map((order) => <div key={String(order.id)}><div className="mb-1 flex justify-between text-xs font-bold text-slate-500"><span>#{order.id}</span><span>{money(Number(order.total || 0))}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(3, Number(order.total || 0) / max * 100)}%` }} /></div></div>) : <p className="text-sm text-slate-500">No order data yet.</p>}</div></section></>}</main>;
}
