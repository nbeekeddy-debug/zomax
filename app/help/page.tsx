import Link from "next/link";

export const metadata = { title: "Help" };

const faqs = [
  ["How do I place an order?", "Add products to your cart, review the order and continue through checkout. Payment and final fulfillment rules will be connected to the production backend."],
  ["How do I contact a seller?", "Seller identity and location are already visible. Direct messaging is reserved for the backend phase so conversations can be authenticated and moderated correctly."],
  ["How do saved items work?", "Saved products stay in your local Zomax account state today and are ready to move to a server-backed wishlist later."],
  ["Can I sell on Zomax?", "Yes. The seller studio, listing form, store settings and analytics UI are already in the frontend and ready for server persistence."],
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-6xl px-3 py-6 md:px-6 md:py-8">
      <section className="rounded-[34px] bg-gradient-to-br from-[#fff0e4] via-white to-[#f7ede6] p-6 ring-1 ring-orange-100 md:p-9">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a63d08]">Zomax help</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[#261d19] md:text-5xl">Get unstuck quickly.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#594b42]">Clear routes for shopping, accounts, seller tools and marketplace safety. Support actions that require identity or messaging stay backend-ready instead of being faked in the browser.</p>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Orders", "Track purchases and order status.", "/orders"],
          ["Account", "Profile, saved details and sign-in.", "/account"],
          ["Seller studio", "Listings, store and analytics.", "/seller"],
          ["Browse", "Return to products and categories.", "/shop"],
        ].map(([title, text, href]) => <Link key={title} href={href} className="rounded-[26px] bg-white p-5 ring-1 ring-[#e8ddd5] transition hover:-translate-y-1 hover:ring-orange-200"><h2 className="font-black text-[#261d19]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#594b42]">{text}</p><span className="mt-5 inline-flex text-xs font-black text-[#a63d08]">Open →</span></Link>)}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[30px] bg-white p-5 ring-1 ring-[#e8ddd5] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#a63d08]">Common questions</p>
          <div className="mt-4 divide-y divide-[#eee5df]">
            {faqs.map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none pr-4 font-black text-[#261d19] marker:hidden">{question}<span className="float-right text-[#a63d08] group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-[#594b42]">{answer}</p></details>)}
          </div>
        </div>

        <aside className="h-fit rounded-[30px] bg-[#2b211c] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Safety first</p>
          <h2 className="mt-3 text-2xl font-black text-white">Keep sensitive actions server-side.</h2>
          <p className="mt-3 text-sm leading-6 text-stone-200">Payments, private messages, identity checks, dispute evidence and seller authorization should never rely only on browser state.</p>
          <Link href="/account" className="mt-6 inline-flex rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#2b211c]">Review account →</Link>
        </aside>
      </section>
    </main>
  );
}
