import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LocalListingsSection } from "@/components/local-listings-section";
import { SectionErrorBoundary } from "@/components/section-error-boundary";
import { SectionSkeleton } from "@/components/section-skeleton";
import { getCatalog } from "@/lib/catalog";
import { money } from "@/lib/products";

export const metadata = { title: "Seller Center" };

async function SellerDashboardData() {
  const catalog = await getCatalog();
  const catalogValue = catalog.products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const inventory = catalog.products.reduce((sum, product) => sum + product.stock, 0);
  return <SectionErrorBoundary name="Seller dashboard data">{catalog.degraded ? <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">Live seller data is unavailable. Dashboard inventory is using the fallback catalog.</p> : null}<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Listings", catalog.products.length.toString()],["Units in stock", inventory.toString()],["Catalog value", money(catalogValue)],["Store health", catalog.degraded ? "Degraded" : "Good"]].map(([label, value]) => <div key={label} className="rounded-[28px] bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p><p className="mt-3 text-2xl font-black text-slate-950">{value}</p></div>)}</section><section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-950">Server catalog listings</h2><div className="mt-5 divide-y divide-slate-100">{catalog.products.map((product) => <div key={product.id} className="flex items-center gap-4 py-4"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100"><Image src={product.image} alt="" fill sizes="56px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate font-black text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.stock} in stock · {money(product.price)}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Active</span></div>)}</div></section></SectionErrorBoundary>;
}

export default function SellerPage() {
  return <main className="mx-auto max-w-7xl px-4 py-10 md:px-6"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p><h1 className="mt-2 text-4xl font-black text-slate-950">Store dashboard</h1><p className="mt-2 text-sm text-slate-500">Dashboard sections stream independently instead of blocking the whole page.</p></div><div className="flex flex-wrap gap-2"><Link href="/seller/analytics" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">Analytics</Link><Link href="/seller/settings" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">Store settings</Link><Link href="/sell" className="rounded-2xl bg-orange-500 px-5 py-3 text-center font-black text-white">Add product</Link></div></div><div className="mt-8"><Suspense fallback={<SectionSkeleton cards={4} />}><SellerDashboardData /></Suspense></div><LocalListingsSection mode="seller" /></main>;
}
