import type { UserProfile } from "@/lib/marketplace-types";

export function CurrentSessionBanner({ user, onContinue, onUseAnother }: { user: UserProfile; onContinue: () => void; onUseAnother: () => void }) {
  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Already signed in</p>
        <p className="mt-1 truncate text-sm font-bold text-emerald-950">{user.email || user.phone || user.name}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={onContinue} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white">Continue</button>
        <button type="button" onClick={onUseAnother} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800">Use another</button>
      </div>
    </div>
  );
}
