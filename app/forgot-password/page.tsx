"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/auth-flow";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setBusy(true);
    const result = await requestPasswordReset(email.trim());
    if (result.ok) setMessage(result.message || "Reset instructions sent.");
    else setError(result.message);
    setBusy(false);
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100svh-76px)] max-w-xl items-center px-4 py-8 sm:px-6">
      <section className="w-full rounded-[30px] border border-[#eadfd7] bg-white p-6 shadow-[0_24px_70px_rgba(88,66,51,0.10)] sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2b211c] sm:text-4xl">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-[#7b6a60]">Enter the email connected to your Zomax account. The backend-ready flow will send recovery instructions when secure auth is configured.</p>

        <form noValidate onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-bold text-[#4a3d35]">Email address
            <input value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} type="email" autoComplete="email" inputMode="email" placeholder="name@example.com" className={`mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-[16px] outline-none transition ${error ? "border-rose-300 ring-4 ring-rose-50" : "border-[#e6ddd7] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"}`} />
          </label>
          {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">{error}</p> : null}
          {message ? <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-800">{message}</p> : null}
          <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-60">{busy ? "Sending…" : "Send reset instructions"}</button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <Link href="/login" className="font-black text-orange-600 hover:text-orange-700">← Back to sign in</Link>
          <Link href="/signup" className="font-bold text-[#806c60] hover:text-orange-600">Create account</Link>
        </div>
      </section>
    </main>
  );
}
