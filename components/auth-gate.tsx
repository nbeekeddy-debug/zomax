"use client";

import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";

export function AuthGate({ children, title = "Sign in to continue", description = "This area belongs to your Zomax account." }: { children: React.ReactNode; title?: string; description?: string }) {
  const { hydrated, currentUser } = useMarketplace();

  if (!hydrated) {
    return <div className="mx-auto max-w-5xl px-4 py-10 md:px-6"><div className="h-72 animate-pulse rounded-[32px] bg-[#eee4dd]" /></div>;
  }

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6">
        <section className="rounded-[34px] border border-[#eadfd7] bg-white p-8 shadow-sm sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-lg font-black text-[#a63d08]">Z</span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] text-[#261d19]">{title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#594b42]">{description}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded-2xl bg-[#c94b0b] px-6 py-3 text-sm font-black text-white hover:bg-[#a83a08]">Sign in</Link>
            <Link href="/signup" className="rounded-2xl border border-[#dfd2ca] bg-[#fffdfb] px-6 py-3 text-sm font-black text-[#493a31]">Create account</Link>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
