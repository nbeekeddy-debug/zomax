"use client";

import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMarketplace } from "@/components/marketplace-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useMarketplace();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login({ name: String(form.get("name") || "").trim(), email: String(form.get("email") || "").trim() });
    router.push("/account");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-14 md:px-6">
      <div className="rounded-[36px] bg-white p-7 shadow-xl md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Migration session</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Continue to your account</h1>
        <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-xs font-bold leading-5 text-amber-900">This preserves the old prototype session behavior only. It is not password authentication and will be replaced by secure server-side auth before production.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Name<input required name="name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <label className="block text-sm font-bold text-slate-700">Email<input required type="email" name="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" /></label>
          <button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Continue</button>
        </form>
      </div>
    </main>
  );
}
