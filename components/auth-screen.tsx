"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { useMarketplace } from "@/components/marketplace-provider";

type Mode = "login" | "signup";
type Provider = "google" | "apple";

function GoogleMark() {
  return <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-white text-sm font-black text-[#4285f4] ring-1 ring-slate-200">G</span>;
}

function AppleMark() {
  return <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-[#2b211c] text-sm font-black text-white">●</span>;
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login } = useMarketplace();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [phone, setPhone] = useState("+234 ");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const isSignup = mode === "signup";

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const supabase = getSupabaseBrowserClient();

    try {
      if (!supabase) {
        login({ name: name || email.split("@")[0], email });
        setStatus("Secure auth is not configured on this deployment yet, so Zomax used the migration session instead.");
        router.push("/account");
        return;
      }

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;

        if (data.session) {
          login({ name, email });
          router.push("/account");
        } else {
          setStatus("Account created. Check your email to confirm your address, then sign in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        login({ name: String(data.user.user_metadata?.full_name || email.split("@")[0]), email });
        router.push("/account");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: Provider) {
    setBusy(true);
    setStatus("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setStatus(`${provider === "google" ? "Google" : "Apple"} sign-in is ready in the UI, but the Supabase environment keys and provider credentials still need to be connected.`);
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/account` },
    });

    if (error) {
      setStatus(error.message);
      setBusy(false);
    }
  }

  async function sendOtp() {
    setBusy(true);
    setStatus("");
    const supabase = getSupabaseBrowserClient();
    const normalized = phone.replace(/\s+/g, "");

    if (!/^\+\d{10,15}$/.test(normalized)) {
      setStatus("Enter a full phone number with country code, for example +2348012345678.");
      setBusy(false);
      return;
    }

    if (!supabase) {
      setStatus("Phone OTP needs the secure auth backend to be connected before SMS codes can be sent.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    if (error) setStatus(error.message);
    else {
      setOtpSent(true);
      setStatus("Code sent. Enter the 6-digit SMS code below.");
    }
    setBusy(false);
  }

  async function verifyOtp() {
    setBusy(true);
    setStatus("");
    const supabase = getSupabaseBrowserClient();
    const normalized = phone.replace(/\s+/g, "");

    if (!supabase) {
      setStatus("Phone OTP backend is not configured on this deployment.");
      setBusy(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone: normalized, token: otp.trim(), type: "sms" });
    if (error) setStatus(error.message);
    else if (data.user) {
      login({ name: data.user.phone || "Zomax user" });
      router.push("/account");
    }
    setBusy(false);
  }

  return (
    <main id="main-content" className="mx-auto grid min-h-[calc(100vh-120px)] max-w-6xl items-center gap-6 px-3 py-8 sm:px-5 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-12">
      <section className="order-2 rounded-[32px] bg-[#fff1e7] p-6 ring-1 ring-orange-100 sm:p-8 md:order-1 md:min-h-[590px] md:p-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-[#2b211c]">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-500 text-sm text-white">Z</span>
          zomax<span className="text-orange-500">.</span>
        </Link>
        <p className="mt-12 text-xs font-black uppercase tracking-[0.24em] text-orange-700">One account, whole marketplace</p>
        <h1 className="mt-4 max-w-md text-4xl font-black leading-[1.03] tracking-[-0.045em] text-[#2b211c] sm:text-5xl">
          {isSignup ? "Build your Zomax identity." : "Good to have you back."}
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-7 text-[#66574d] sm:text-base">
          Shop, save products, track orders and manage your seller profile from the same account. Use email, Google, Apple or a Nigerian phone number with OTP.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
          {["Orders stay together", "Saved items follow you", "Seller tools stay linked"].map((item) => (
            <div key={item} className="rounded-2xl bg-white/70 p-4 text-xs font-black text-[#594b42] ring-1 ring-white">{item}</div>
          ))}
        </div>
      </section>

      <section className="order-1 rounded-[32px] bg-white p-5 shadow-[0_24px_70px_rgba(88,66,51,0.10)] ring-1 ring-[#eadfd7] sm:p-8 md:order-2 md:p-10">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">{isSignup ? "Create account" : "Sign in"}</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#2b211c] sm:text-4xl">{isSignup ? "Start with Zomax" : "Continue to Zomax"}</h2>
          <p className="mt-2 text-sm text-slate-500">Choose the method that is easiest for you.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button disabled={busy} onClick={() => social("google")} className="flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
              <GoogleMark /> Continue with Google
            </button>
            <button disabled={busy} onClick={() => social("apple")} className="flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
              <AppleMark /> Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or email<span className="h-px flex-1 bg-slate-200" /></div>

          <form onSubmit={submitEmail} className="space-y-4">
            {isSignup ? <label className="block text-sm font-bold text-slate-700">Full name<input required name="name" autoComplete="name" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fffdfb] px-4 py-3.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label> : null}
            <label className="block text-sm font-bold text-slate-700">Email address<input required type="email" name="email" autoComplete="email" inputMode="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fffdfb] px-4 py-3.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
            <label className="block text-sm font-bold text-slate-700">Password<input required minLength={8} type="password" name="password" autoComplete={isSignup ? "new-password" : "current-password"} className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fffdfb] px-4 py-3.5 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" /></label>
            <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">{busy ? "Working…" : isSignup ? "Create account" : "Sign in"}</button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400"><span className="h-px flex-1 bg-slate-200" />or phone OTP<span className="h-px flex-1 bg-slate-200" /></div>

          <div className="rounded-3xl bg-[#faf7f4] p-4 ring-1 ring-[#eee4dd]">
            <label className="block text-sm font-bold text-slate-700">Phone number
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" aria-label="Phone number" className="min-h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
                <button type="button" disabled={busy} onClick={sendOtp} className="min-h-12 rounded-2xl border border-orange-200 bg-orange-50 px-5 text-sm font-black text-orange-700 hover:bg-orange-100 disabled:opacity-60">Send code</button>
              </div>
            </label>
            {otpSent ? <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" aria-label="SMS verification code" className="min-h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 tracking-[0.3em] outline-none focus:border-orange-400" /><button type="button" disabled={busy} onClick={verifyOtp} className="min-h-12 rounded-2xl bg-[#2b211c] px-5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60">Verify</button></div> : null}
          </div>

          {status ? <p role="status" className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold leading-5 text-amber-900 ring-1 ring-amber-200">{status}</p> : null}

          <p className="mt-6 text-center text-sm text-slate-600">
            {isSignup ? "Already have an account?" : "New to Zomax?"} <Link href={isSignup ? "/login" : "/signup"} className="font-black text-orange-600 hover:text-orange-700">{isSignup ? "Sign in" : "Create one"}</Link>
          </p>
          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">By continuing, you agree to Zomax account and marketplace policies. Google, Apple and SMS require provider configuration in the secure auth backend.</p>
        </div>
      </section>
    </main>
  );
}
