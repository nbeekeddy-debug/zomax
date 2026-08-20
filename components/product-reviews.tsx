"use client";

import { type FormEvent, useState } from "react";
import { useMarketplace } from "@/components/marketplace-provider";

export function ProductReviews({ productId }: { productId: number }) {
  const { reviews, addReview, updateReview, deleteReview, currentUser, account } = useMarketplace();
  const list = reviews[String(productId)] || [];
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") || "").trim();
    const rating = Math.min(5, Math.max(1, Number(form.get("rating")) || 5));
    if (!text) return;
    addReview(productId, {
      author: currentUser?.name || account.name || "Anonymous",
      rating,
      text,
    });
    event.currentTarget.reset();
  }

  return (
    <section className="mt-10 rounded-[32px] bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Community</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Reviews</h2>
        </div>
        <span className="text-sm font-bold text-slate-400">{list.length} local review{list.length === 1 ? "" : "s"}</span>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[120px_1fr_auto]">
        <select name="rating" defaultValue="5" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
        </select>
        <input name="text" required maxLength={500} placeholder="Share your experience" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm" />
        <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white">Post review</button>
      </form>

      <div className="mt-6 space-y-3">
        {list.length ? list.slice().reverse().map((review, reverseIndex) => {
          const index = list.length - 1 - reverseIndex;
          return (
            <article key={`${review.createdAt}-${index}`} className="rounded-2xl border border-slate-100 p-4">
              {editing === index ? (
                <div className="space-y-3">
                  <select value={editRating} onChange={(event) => setEditRating(Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                  </select>
                  <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { updateReview(productId, index, { rating: editRating, text: editText.trim() }); setEditing(null); }} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Save</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-slate-900">{review.author}</p>
                      <p className="mt-1 text-sm font-black text-amber-500">{"★".repeat(review.rating)}</p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString("en-NG")}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
                  <div className="mt-3 flex gap-3 text-xs font-bold">
                    <button type="button" onClick={() => { setEditing(index); setEditText(review.text); setEditRating(review.rating); }} className="text-slate-600 hover:text-orange-600">Edit</button>
                    <button type="button" onClick={() => deleteReview(productId, index)} className="text-rose-500">Delete</button>
                  </div>
                </>
              )}
            </article>
          );
        }) : <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">No reviews yet. Be the first to leave one.</p>}
      </div>
    </section>
  );
}
