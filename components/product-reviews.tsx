"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/components/marketplace-provider";
import { userIdentity } from "@/lib/marketplace-storage";

export function ProductReviews({ productId }: { productId: number }) {
  const { reviews, addReview, updateReview, deleteReview, currentUser } = useMarketplace();
  const list = reviews[String(productId)] || [];
  const ownerId = currentUser ? userIdentity(currentUser) : null;
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUser) return;
    const form = new FormData(event.currentTarget);
    const text = String(form.get("text") || "").trim();
    const rating = Math.min(5, Math.max(1, Number(form.get("rating")) || 5));
    if (!text) return;
    addReview(productId, {
      author: currentUser.name || currentUser.email || currentUser.phone || "Zomax user",
      rating,
      text,
    });
    event.currentTarget.reset();
  }

  return (
    <section className="mt-10 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-[#eadfd7] md:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#a63d08]">Community</p>
          <h2 className="mt-2 text-2xl font-black text-[#261d19]">Reviews</h2>
        </div>
        <span className="text-sm font-bold text-[#66574d]">{list.length} review{list.length === 1 ? "" : "s"}</span>
      </div>

      {currentUser ? (
        <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl bg-[#f8f4f0] p-4 md:grid-cols-[120px_1fr_auto]">
          <select name="rating" defaultValue="5" className="rounded-xl border border-[#dfd2ca] bg-white px-3 py-2 text-sm font-bold text-[#342923]">
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
          </select>
          <input name="text" required maxLength={500} placeholder="Share your experience" className="rounded-xl border border-[#dfd2ca] bg-white px-4 py-2 text-sm text-[#342923]" />
          <button className="rounded-xl bg-[#c94b0b] px-4 py-2 text-sm font-black text-white hover:bg-[#a83a08]">Post review</button>
        </form>
      ) : (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-[#342923]">Sign in before reviewing</p>
            <p className="mt-1 text-xs leading-5 text-[#66574d]">This lets Zomax attach edit/delete rights to the account that created the review.</p>
          </div>
          <Link href="/login" className="shrink-0 rounded-xl bg-[#2b211c] px-4 py-2 text-center text-xs font-black text-white">Sign in</Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {list.length ? list.slice().reverse().map((review, reverseIndex) => {
          const index = list.length - 1 - reverseIndex;
          const owned = Boolean(ownerId && review.authorId && review.authorId === ownerId);
          return (
            <article key={`${review.createdAt}-${index}`} className="rounded-2xl border border-[#eee6e0] p-4">
              {editing === index && owned ? (
                <div className="space-y-3">
                  <select value={editRating} onChange={(event) => setEditRating(Number(event.target.value))} className="rounded-xl border border-[#dfd2ca] px-3 py-2 text-sm">
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
                  </select>
                  <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={3} className="w-full rounded-xl border border-[#dfd2ca] p-3 text-sm" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { if (editText.trim()) updateReview(productId, index, { rating: editRating, text: editText.trim() }); setEditing(null); }} className="rounded-xl bg-[#2b211c] px-3 py-2 text-xs font-black text-white">Save</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-xl bg-[#f4eee9] px-3 py-2 text-xs font-black text-[#493a31]">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-[#342923]">{review.author}</p>
                        {owned ? <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-[#a63d08]">Your review</span> : null}
                      </div>
                      <p className="mt-1 text-sm font-black text-amber-600">{"★".repeat(review.rating)}</p>
                    </div>
                    <span className="text-xs text-[#75655b]">{new Date(review.createdAt).toLocaleDateString("en-NG")}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#594b42]">{review.text}</p>
                  {owned ? (
                    <div className="mt-3 flex gap-3 text-xs font-bold">
                      <button type="button" onClick={() => { setEditing(index); setEditText(review.text); setEditRating(review.rating); }} className="text-[#594b42] hover:text-[#a63d08]">Edit</button>
                      <button type="button" onClick={() => deleteReview(productId, index)} className="text-rose-600">Delete</button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          );
        }) : <p className="rounded-2xl bg-[#f8f4f0] p-5 text-sm text-[#66574d]">No reviews yet. Be the first to leave one.</p>}
      </div>
    </section>
  );
}
