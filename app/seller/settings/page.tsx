"use client";

import { type FormEvent, useState } from "react";
import { useMarketplace } from "@/components/marketplace-provider";
import type { StoreInfo } from "@/lib/marketplace-types";

export default function SellerSettingsPage() {
  const { account, updateAccount } = useMarketplace();
  const store = account.storeInfo || {};
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const storeInfo: StoreInfo = {
      storeName: String(form.get("storeName") || "").trim(), storeEmail: String(form.get("storeEmail") || "").trim(), storePhone: String(form.get("storePhone") || "").trim(), storeLocation: String(form.get("storeLocation") || "").trim(), storeDescription: String(form.get("storeDescription") || "").trim(), storeLogo: String(form.get("storeLogo") || "").trim(), businessType: String(form.get("businessType") || "Individual") as StoreInfo["businessType"], storeHours: String(form.get("storeHours") || "").trim(), shippingInfo: String(form.get("shippingInfo") || "").trim(), returnPolicy: String(form.get("returnPolicy") || "").trim(), taxId: String(form.get("taxId") || "").trim(), bankAccount: String(form.get("bankAccount") || "").trim(),
    };
    updateAccount({ storeInfo });
    setSaved(true);
  }

  const input = "mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3";
  return <main className="mx-auto max-w-4xl px-4 py-10 md:px-6"><p className="text-xs font-black uppercase tracking-[0.25em] text-orange-500">Seller center</p><h1 className="mt-2 text-4xl font-black text-slate-950">Store settings</h1><form onSubmit={submit} className="mt-8 grid gap-5 rounded-[32px] bg-white p-6 shadow-sm md:grid-cols-2 md:p-8"><label className="text-sm font-bold">Store name<input name="storeName" defaultValue={store.storeName || ""} className={input} /></label><label className="text-sm font-bold">Store email<input type="email" name="storeEmail" defaultValue={store.storeEmail || ""} className={input} /></label><label className="text-sm font-bold">Store phone<input name="storePhone" defaultValue={store.storePhone || ""} className={input} /></label><label className="text-sm font-bold">Location<input name="storeLocation" defaultValue={store.storeLocation || ""} className={input} /></label><label className="text-sm font-bold md:col-span-2">Description<textarea name="storeDescription" defaultValue={store.storeDescription || ""} rows={4} className={input} /></label><label className="text-sm font-bold">Logo URL<input type="url" name="storeLogo" defaultValue={store.storeLogo || ""} className={input} /></label><label className="text-sm font-bold">Business type<select name="businessType" defaultValue={store.businessType || "Individual"} className={input}><option>Individual</option><option>Business</option><option>Enterprise</option></select></label><label className="text-sm font-bold">Store hours<input name="storeHours" defaultValue={store.storeHours || ""} className={input} /></label><label className="text-sm font-bold">Shipping info<input name="shippingInfo" defaultValue={store.shippingInfo || ""} className={input} /></label><label className="text-sm font-bold">Return policy<input name="returnPolicy" defaultValue={store.returnPolicy || ""} className={input} /></label><label className="text-sm font-bold">Tax ID (optional)<input name="taxId" defaultValue={store.taxId || ""} className={input} /></label><label className="text-sm font-bold">Bank account last 4 digits<input name="bankAccount" inputMode="numeric" maxLength={4} defaultValue={store.bankAccount || ""} className={input} /></label><div className="md:col-span-2"><button className="w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white">Save store settings</button>{saved ? <p className="mt-3 text-center text-sm font-bold text-emerald-600">Store settings saved locally.</p> : null}</div></form></main>;
}
