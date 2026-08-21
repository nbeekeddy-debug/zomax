import Link from "next/link";

export function AuthAside({ isSignup }: { isSignup: boolean }) {
  return (
    <aside className="relative hidden overflow-hidden bg-[#fff1e7] p-8 lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-[#2b211c]">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-500 text-sm text-white">Z</span>
          zomax<span className="text-orange-500">.</span>
        </Link>
        <p className="mt-16 text-xs font-black uppercase tracking-[0.24em] text-orange-700">One account, whole marketplace</p>
        <h1 className="mt-4 text-[42px] font-black leading-[1.02] tracking-[-0.05em] text-[#2b211c]">
          {isSignup ? "Your market, one identity." : "Pick up where you left off."}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#6e5d52]">Save products, follow orders, manage your store and move between buyer and seller tools without creating separate accounts.</p>
      </div>

      <div className="space-y-3">
        {["Your saved items stay with you", "Orders and seller tools stay linked", "Phone, email and social sign-in ready"].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/75 p-3.5 text-xs font-black text-[#594b42] ring-1 ring-white">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">✓</span>
            {item}
          </div>
        ))}
      </div>
    </aside>
  );
}
