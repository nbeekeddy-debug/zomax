import { SectionSkeleton } from "@/components/section-skeleton";
import Image from "next/image";

export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6" aria-busy="true" aria-label="Loading marketplace">
      <div role="status" aria-live="polite" className="mb-6 flex items-center gap-3 text-sm font-black text-[#594b42]"><Image src="/icon.svg" alt="" width={38} height={38} className="animate-pulse rounded-xl" /> Loading products</div>
      <div className="mb-8 h-24 animate-pulse rounded-[28px] bg-slate-200" />
      <SectionSkeleton cards={8} />
    </main>
  );
}
