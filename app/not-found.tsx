import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">404</p>
      <h1 className="mt-4 text-4xl font-black text-slate-950">We could not find that page.</h1>
      <p className="mt-3 text-slate-500">The rest of the marketplace is still working normally.</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/" className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Home</Link>
        <Link href="/shop" className="rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Shop</Link>
      </div>
    </main>
  );
}
