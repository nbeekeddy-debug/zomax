import type { AuthProvider } from "@/lib/auth-flow";

function GoogleMark() {
  return <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[#4285f4] ring-1 ring-[#e5e7eb]">G</span>;
}

function AppleMark() {
  return <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#2b211c] text-sm font-black text-white">●</span>;
}

export function SocialAuthButtons({ busy, onSelect }: { busy: boolean; onSelect: (provider: AuthProvider) => void }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button type="button" disabled={busy} onClick={() => onSelect("google")} className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#e6ddd7] bg-white px-3 text-sm font-black text-[#3e332d] transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
        <GoogleMark /><span className="truncate">Google</span>
      </button>
      <button type="button" disabled={busy} onClick={() => onSelect("apple")} className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#e6ddd7] bg-white px-3 text-sm font-black text-[#3e332d] transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
        <AppleMark /><span className="truncate">Apple</span>
      </button>
    </div>
  );
}
