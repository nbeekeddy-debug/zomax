"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";

type FilterItem = { label: string; href: string; active?: boolean };

export function MobileFilterDrawer({ priceItems, sortItems }: { priceItems: FilterItem[]; sortItems: FilterItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#dfd2ca] bg-white px-4 text-xs font-black text-[#493a31] shadow-sm lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Refine <span aria-hidden>☰</span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Shop filters"
        overlayClassName="flex items-end lg:hidden"
        panelClassName="max-h-[84svh] w-full overflow-y-auto rounded-t-[30px] bg-[#fffdfb] p-5 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a63d08]">Refine</p>
            <h2 className="mt-1 text-xl font-black text-[#261d19]">Shape the feed</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-2xl border border-[#e5d9d1] bg-white text-lg font-black text-[#493a31]" aria-label="Close shop filters">×</button>
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#66574d]">Price range</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {priceItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} aria-current={item.active ? "true" : undefined} className={`rounded-2xl px-3 py-3 text-sm font-black ${item.active ? "bg-orange-50 text-[#a63d08] ring-1 ring-orange-200" : "bg-[#f7f3ef] text-[#493a31] ring-1 ring-[#ebe2db]"}`}>{item.label}</Link>)}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#66574d]">Sort by</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {sortItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} aria-current={item.active ? "true" : undefined} className={`rounded-2xl px-3 py-3 text-sm font-black ${item.active ? "bg-[#2b211c] text-white" : "bg-[#f7f3ef] text-[#493a31] ring-1 ring-[#ebe2db]"}`}>{item.label}</Link>)}
          </div>
        </div>
      </Dialog>
    </>
  );
}
