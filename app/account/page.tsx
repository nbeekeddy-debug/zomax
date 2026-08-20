"use client";

import { FormEvent, useEffect, useState } from "react";

type Account = { name?: string; email?: string; phone?: string; address?: string };

export default function AccountPage() {
  const [account, setAccount] = useState<Account>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setAccount(JSON.parse(localStorage.getItem("zomax_account") || "{}")); } catch { setAccount({}); }
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem("zomax_account", JSON.stringify(account));
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-4xl font-black text-slate-950">Account</h1>
      <p className="mt-2 text-sm text-slate-500">Profile data remains compatible with your existing prototype while the real auth/database layer is prepared.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        {([
          ["name", "Full name", "text"],
          ["email", "Email", "email"],
          ["phone", "Phone", "tel"],
          ["address", "Address", "text"],
        ] as const).map(([key, label, type]) => (
          <label key={key} className="block text-sm font-bold text-slate-700">{label}
            <input type={type} value={account[key] || ""} onChange={(event) => setAccount((value) => ({ ...value, [key]: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400" />
          </label>
        ))}
        <button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Save profile</button>
        {saved ? <p className="text-center text-sm font-bold text-emerald-600">Profile saved.</p> : null}
      </form>
    </main>
  );
}
