import { SectionSkeleton } from "@/components/section-skeleton";
import Image from "next/image";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6" aria-busy="true" aria-label="Loading Zomax">
      <div className="mb-8 flex items-center gap-3 text-sm font-black text-[#594b42]"><Image src="/icon.svg" alt="" width={42} height={42} className="animate-pulse rounded-2xl" /> Loading your marketplace</div>
      <div className="mb-10 h-36 animate-pulse rounded-[32px] bg-slate-200" />
      <SectionSkeleton cards={4} />
    </main>
  );
}
