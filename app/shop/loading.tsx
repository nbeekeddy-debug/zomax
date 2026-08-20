import { SectionSkeleton } from "@/components/section-skeleton";

export default function ShopLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 h-24 animate-pulse rounded-[28px] bg-slate-200" />
      <SectionSkeleton cards={8} />
    </main>
  );
}
