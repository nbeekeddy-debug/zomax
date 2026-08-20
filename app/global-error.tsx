"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 p-6 font-sans text-slate-900">
        <main className="mx-auto mt-20 max-w-xl rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Zomax recovery</p>
          <h1 className="mt-3 text-3xl font-black">The app shell encountered an error.</h1>
          <p className="mt-3 text-sm text-slate-600">Reloading this boundary is safe and does not clear locally saved cart or wishlist data.</p>
          <button onClick={reset} className="mt-6 rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Recover Zomax</button>
        </main>
      </body>
    </html>
  );
}
