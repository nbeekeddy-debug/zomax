export function SectionSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <section aria-label="Loading section" aria-busy="true">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <div className="aspect-[4/3] animate-pulse rounded-[22px] bg-slate-200" />
            <div className="mt-4 h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-10 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
