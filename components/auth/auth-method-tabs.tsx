export type AuthMethod = "email" | "phone";

export function AuthMethodTabs({ method, onChange }: { method: AuthMethod; onChange: (method: AuthMethod) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-2xl bg-[#f7f2ee] p-1.5" role="tablist" aria-label="Sign-in method">
      <button type="button" role="tab" aria-selected={method === "email"} onClick={() => onChange("email")} className={`min-h-10 rounded-xl text-sm font-black transition ${method === "email" ? "bg-white text-[#2b211c] shadow-sm" : "text-[#8c786b] hover:text-[#2b211c]"}`}>Email</button>
      <button type="button" role="tab" aria-selected={method === "phone"} onClick={() => onChange("phone")} className={`min-h-10 rounded-xl text-sm font-black transition ${method === "phone" ? "bg-white text-[#2b211c] shadow-sm" : "text-[#8c786b] hover:text-[#2b211c]"}`}>Phone OTP</button>
    </div>
  );
}
