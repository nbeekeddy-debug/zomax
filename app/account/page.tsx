"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useMarketplace } from "@/components/marketplace-provider";
import type { Account } from "@/lib/marketplace-types";

export default function AccountPage() {
  const { account, currentUser, updateAccount, replaceAccount, logout, deactivateLocalAccount } = useMarketplace();
  const [draft, setDraft] = useState<Account>(account);
  const [message, setMessage] = useState("");

  useEffect(() => setDraft(account), [account]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateAccount(draft);
    setMessage("Profile saved in this browser.");
  }

  function exportAccount() {
    const blob = new Blob([JSON.stringify({ account, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "zomax-account-export.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importAccount(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { account?: Account } | Account;
      const nextAccount = "account" in parsed && parsed.account ? parsed.account : parsed as Account;
      if (!nextAccount || typeof nextAccount !== "object") throw new Error("Invalid account export");
      replaceAccount(nextAccount);
      setMessage("Account import completed.");
    } catch {
      setMessage("That file is not a valid Zomax account export.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <div><h1 className="text-4xl font-black text-slate-950">Account</h1><p className="mt-2 text-sm text-slate-500">Browser-compatible profile migration while secure server auth is built.</p></div>
        {currentUser ? <button onClick={logout} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black">Log out</button> : null}
      </div>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
        {([
          ["name", "Full name", "text"], ["email", "Email", "email"], ["phone", "Phone", "tel"], ["address", "Primary address", "text"],
        ] as const).map(([key, label, type]) => (
          <label key={key} className="block text-sm font-bold text-slate-700">{label}<input type={type} value={draft[key] || ""} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400" /></label>
        ))}
        <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.preferences?.newsletter)} onChange={(event) => setDraft((value) => ({ ...value, preferences: { ...value.preferences, newsletter: event.target.checked } }))} /> Email me Zomax updates</label>
        <button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Save profile</button>
        {message ? <p className="text-center text-sm font-bold text-emerald-600">{message}</p> : null}
      </form>
      <section className="mt-6 rounded-[28px] bg-white p-6 shadow-sm">
        <h2 className="font-black text-slate-950">Data tools</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={exportAccount} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white">Export account</button>
          <label className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-sm font-black">Import account<input type="file" accept="application/json" onChange={importAccount} className="hidden" /></label>
          <button onClick={() => { if (window.confirm("Clear the local Zomax profile and session on this device?")) { deactivateLocalAccount(); setMessage("Local account cleared."); } }} className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-black text-rose-700">Deactivate local profile</button>
        </div>
      </section>
    </main>
  );
}
