import { SectionSkeleton } from "@/components/section-skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-10 h-36 animate-pulse rounded-[32px] bg-slate-200" />
      <SectionSkeleton cards={4} />
    </main>
  );
}
