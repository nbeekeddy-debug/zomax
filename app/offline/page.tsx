import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
      <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Offline mode</p>
        <h1 className="mt-4 text-3xl font-black text-slate-950">Zomax cannot reach the network.</h1>
        <p className="mt-3 text-slate-600">Previously cached public pages may still work. We deliberately do not cache private API responses or account-changing requests.</p>
        <Link href="/" className="mt-6 inline-block rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Try home</Link>
      </div>
    </main>
  );
}
