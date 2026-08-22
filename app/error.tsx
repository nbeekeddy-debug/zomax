"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Zomax route error", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <div role="alert" className="rounded-[32px] border border-rose-200 bg-white p-8 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-rose-500">Route recovered safely</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">This page hit a problem.</h1>
        <p className="mt-3 text-slate-600">The failure was isolated to this route. Your cart and the rest of Zomax remain available.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={reset} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Try this page again</button>
          <Link href="/shop" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-950 transition hover:border-slate-400">Return to shop</Link>
        </div>
      </div>
    </main>
  );
}
