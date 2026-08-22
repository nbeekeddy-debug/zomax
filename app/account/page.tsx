"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import type { Account } from "@/lib/marketplace-types";

export default function AccountPage() {
  const { account, currentUser, updateAccount, replaceAccount, logout, deactivateLocalAccount } = useMarketplace();
  const [draft, setDraft] = useState<Account>(account);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"status" | "error">("status");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => setDraft(account), [account]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateAccount(draft);
    setMessageKind("status");
    setMessage("Profile saved.");
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    logout();
    setMessageKind("status");
    setMessage("Signed out on this device.");
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
      setMessageKind("status");
      setMessage("Account import completed.");
    } catch {
      setMessageKind("error");
      setMessage("That file is not a valid Zomax account export.");
    } finally {
      event.target.value = "";
    }
  }

  if (!currentUser) {
    return (
      <main className="mx-auto max-w-3xl px-3 py-12 text-center sm:px-4 md:px-6">
        <div className="rounded-[30px] bg-white p-7 shadow-sm ring-1 ring-[#eadfd7] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Your Zomax space</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#2b211c] sm:text-4xl">Sign in to continue</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6b5a4f]">Keep orders, saved products and seller tools tied to the same account.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600">Sign in</Link>
            <Link href="/signup" className="rounded-2xl bg-[#fff1e7] px-6 py-3 text-sm font-black text-orange-700 ring-1 ring-orange-100">Create account</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Profile</p><h1 className="mt-1 text-3xl font-black tracking-[-0.03em] text-[#2b211c] sm:text-4xl">Your account</h1><p className="mt-2 text-sm text-[#7a685d]">Account details used across shopping and seller flows.</p></div>
        <button onClick={signOut} className="min-h-11 rounded-2xl border border-[#eadfd7] bg-white px-4 py-2 text-sm font-black text-[#5f5046] hover:border-orange-200 hover:text-orange-600">Log out</button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
        <form onSubmit={submit} className="space-y-4 rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-[#eadfd7] sm:p-6 md:p-8">
          {([
            ["name", "Full name", "text", "name"], ["email", "Email", "email", "email"], ["phone", "Phone", "tel", "tel"], ["address", "Primary address", "text", "street-address"],
          ] as const).map(([key, label, type, autoComplete]) => (
            <label key={key} className="block text-sm font-bold text-[#5f5046]">{label}<input type={type} autoComplete={autoComplete} value={draft[key] || ""} onChange={(event) => setDraft((value) => ({ ...value, [key]: event.target.value }))} className="mt-2 w-full rounded-2xl border border-[#eadfd7] bg-[#fffdfb] px-4 py-3.5 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
          ))}
          <label className="flex items-start gap-3 rounded-2xl bg-[#faf7f4] p-4 text-sm font-bold text-[#5f5046]"><input type="checkbox" className="mt-1" checked={Boolean(draft.preferences?.newsletter)} onChange={(event) => setDraft((value) => ({ ...value, preferences: { ...value.preferences, newsletter: event.target.checked } }))} /><span>Email me useful Zomax updates</span></label>
          <button className="min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600">Save profile</button>
          {message ? (
            <p role={messageKind === "error" ? "alert" : "status"} className={`text-center text-sm font-bold ${messageKind === "error" ? "text-rose-700" : "text-emerald-700"}`}>
              {message}
            </p>
          ) : null}
        </form>

        <aside className="space-y-4">
          <section className="rounded-[28px] bg-[#fff1e7] p-5 ring-1 ring-orange-100">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Account access</p>
            <p className="mt-3 text-sm leading-6 text-[#6b5a4f]">Google, Apple, email/password and phone OTP are supported when the secure auth provider is configured.</p>
            <Link href="/login" className="mt-4 inline-flex text-sm font-black text-orange-700">Manage sign-in →</Link>
          </section>
          <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-[#eadfd7]">
            <h2 className="font-black text-[#2b211c]">Data tools</h2>
            <div className="mt-4 grid gap-2">
              <button onClick={exportAccount} className="min-h-11 rounded-2xl bg-[#2b211c] px-4 py-2 text-sm font-black text-white hover:bg-orange-600">Export account</button>
              <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-2xl bg-[#faf7f4] px-4 py-2 text-sm font-black text-[#5f5046] ring-1 ring-[#eadfd7]">Import account<input type="file" accept="application/json" onChange={importAccount} className="hidden" /></label>
              <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 hover:bg-rose-100">Clear local profile</button>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={deactivateLocalAccount}
        title="Clear this local Zomax profile?"
        description="This removes this account’s locally stored Zomax profile, orders and seller listings from this browser. It does not delete a future server-backed account."
        confirmLabel="Clear local profile"
        destructive
      />
    </main>
  );
}
