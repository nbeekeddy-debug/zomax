"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  isSecureAuthConfigured,
  sendPhoneOtp,
  signInWithEmail,
  signUpWithEmail,
  startSocialAuth,
  verifyPhoneOtp,
  type AuthProvider,
  type AuthResult,
} from "@/lib/auth-flow";
import {
  normalizeNigerianPhone,
  passwordStrengthScore,
  validateEmailCredentials,
  validateOtp,
  validatePhoneInput,
  type AuthFieldErrors,
} from "@/lib/auth-validation";
import { useMarketplace } from "@/components/marketplace-provider";

type Mode = "login" | "signup";
type Method = "email" | "phone";
type Notice = { tone: "error" | "success" | "info"; text: string } | null;

function GoogleMark() {
  return <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-[#4285f4] ring-1 ring-[#e5e7eb]">G</span>;
}

function AppleMark() {
  return <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#2b211c] text-sm font-black text-white">●</span>;
}

function fieldClass(hasError?: boolean) {
  return `mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-[16px] text-[#2b211c] outline-none transition placeholder:text-[#aa9a8f] ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-50 focus:border-rose-400"
      : "border-[#e6ddd7] focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
  }`;
}

function noticeClass(tone: "error" | "success" | "info") {
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-orange-200 bg-orange-50 text-orange-800";
}

export function AuthScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, logout, currentUser } = useMarketplace();
  const secureAuth = isSecureAuthConfigured();
  const isSignup = mode === "signup";

  const [method, setMethod] = useState<Method>("email");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | undefined>();

  const passwordScore = passwordStrengthScore(password);

  function complete(result: AuthResult, successDestination = "/account") {
    if (!result.ok) {
      setNotice({ tone: "error", text: result.message });
      return;
    }

    if (result.previewCode) setPreviewCode(result.previewCode);
    if (result.user) {
      login(result.user);
      setNotice({ tone: "success", text: result.message || "You are signed in." });
      router.push(successDestination);
      return;
    }

    if (result.needsEmailVerification) {
      setNotice({ tone: "success", text: result.message || "Check your email to continue." });
      return;
    }

    if (result.message) setNotice({ tone: "info", text: result.message });
  }

  function validateEmailForm() {
    const next = validateEmailCredentials({
      signup: isSignup,
      name,
      email,
      password,
      confirmPassword,
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!validateEmailForm()) return;

    setBusy(true);
    const result = isSignup
      ? await signUpWithEmail({ name: name.trim(), email: email.trim(), password })
      : await signInWithEmail({ email: email.trim(), password });
    complete(result);
    setBusy(false);
  }

  async function social(provider: AuthProvider) {
    setBusy(true);
    setNotice(null);
    const result = await startSocialAuth(provider);
    complete(result);
    setBusy(false);
  }

  async function requestOtp() {
    const next = validatePhoneInput(phone);
    if (next.phone) {
      setErrors(next);
      return;
    }

    const normalized = normalizeNigerianPhone(phone);
    setErrors({});
    setNotice(null);
    setBusy(true);
    const result = await sendPhoneOtp(normalized);
    if (result.ok) {
      setOtpSent(true);
      if (result.previewCode) setPreviewCode(result.previewCode);
      setNotice({ tone: "success", text: result.message || "Code sent." });
    } else {
      setNotice({ tone: "error", text: result.message });
    }
    setBusy(false);
  }

  async function confirmOtp() {
    const next = validateOtp(otp);
    if (next.otp) {
      setErrors(next);
      return;
    }

    setErrors({});
    setNotice(null);
    setBusy(true);
    const result = await verifyPhoneOtp({ phone: normalizeNigerianPhone(phone), token: otp, previewCode });
    complete(result);
    setBusy(false);
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-[calc(100svh-76px)] max-w-[1080px] items-center px-3 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
      <div className="grid w-full overflow-hidden rounded-[30px] border border-[#eadfd7] bg-white shadow-[0_28px_90px_rgba(88,66,51,0.10)] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="relative hidden overflow-hidden bg-[#fff1e7] p-8 lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-[#2b211c]">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-orange-500 text-sm text-white">Z</span>
              zomax<span className="text-orange-500">.</span>
            </Link>
            <p className="mt-16 text-xs font-black uppercase tracking-[0.24em] text-orange-700">One account, whole marketplace</p>
            <h1 className="mt-4 text-[42px] font-black leading-[1.02] tracking-[-0.05em] text-[#2b211c]">
              {isSignup ? "Your market, one identity." : "Pick up where you left off."}
            </h1>
            <p className="mt-5 text-sm leading-7 text-[#6e5d52]">Save products, follow orders, manage your store and move between buyer and seller tools without creating separate accounts.</p>
          </div>

          <div className="space-y-3">
            {["Your saved items stay with you", "Orders and seller tools stay linked", "Phone, email and social sign-in ready"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/75 p-3.5 text-xs font-black text-[#594b42] ring-1 ring-white">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">✓</span>
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="min-w-0 p-5 sm:p-8 lg:p-10 xl:p-12">
          <div className="mx-auto max-w-[520px]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">{isSignup ? "Create account" : "Welcome back"}</p>
                  {!secureAuth ? <span className="rounded-full bg-[#f6f1ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#8a776a]">Frontend preview</span> : null}
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2b211c] sm:text-4xl">{isSignup ? "Join Zomax" : "Sign in to Zomax"}</h2>
                <p className="mt-2 text-sm leading-6 text-[#7b6a60]">Use the account method you already trust.</p>
              </div>
            </div>

            {currentUser ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Already signed in</p>
                  <p className="mt-1 truncate text-sm font-bold text-emerald-950">{currentUser.email || currentUser.phone || currentUser.name}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => router.push("/account")} className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white">Continue</button>
                  <button type="button" onClick={logout} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-black text-emerald-800">Use another</button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" disabled={busy} onClick={() => social("google")} className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#e6ddd7] bg-white px-3 text-sm font-black text-[#3e332d] transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
                <GoogleMark /><span className="truncate">Google</span>
              </button>
              <button type="button" disabled={busy} onClick={() => social("apple")} className="flex min-h-12 items-center justify-center gap-2.5 rounded-2xl border border-[#e6ddd7] bg-white px-3 text-sm font-black text-[#3e332d] transition hover:border-orange-200 hover:bg-orange-50 disabled:opacity-60">
                <AppleMark /><span className="truncate">Apple</span>
              </button>
            </div>

            <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#eee5df]" /><span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a18e81]">or continue with</span><span className="h-px flex-1 bg-[#eee5df]" /></div>

            <div className="grid grid-cols-2 rounded-2xl bg-[#f7f2ee] p-1.5">
              <button type="button" onClick={() => { setMethod("email"); setErrors({}); setNotice(null); }} className={`min-h-10 rounded-xl text-sm font-black transition ${method === "email" ? "bg-white text-[#2b211c] shadow-sm" : "text-[#8c786b] hover:text-[#2b211c]"}`}>Email</button>
              <button type="button" onClick={() => { setMethod("phone"); setErrors({}); setNotice(null); }} className={`min-h-10 rounded-xl text-sm font-black transition ${method === "phone" ? "bg-white text-[#2b211c] shadow-sm" : "text-[#8c786b] hover:text-[#2b211c]"}`}>Phone OTP</button>
            </div>

            {method === "email" ? (
              <form noValidate onSubmit={submitEmail} className="mt-5 space-y-4">
                {isSignup ? (
                  <label className="block text-sm font-bold text-[#4a3d35]">Full name
                    <input value={name} onChange={(event) => { setName(event.target.value); setErrors((value) => ({ ...value, name: undefined })); }} name="name" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} className={fieldClass(Boolean(errors.name))} />
                    {errors.name ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.name}</span> : null}
                  </label>
                ) : null}

                <label className="block text-sm font-bold text-[#4a3d35]">Email address
                  <input value={email} onChange={(event) => { setEmail(event.target.value); setErrors((value) => ({ ...value, email: undefined })); }} type="email" name="email" autoComplete="email" inputMode="email" placeholder="name@example.com" aria-invalid={Boolean(errors.email)} className={fieldClass(Boolean(errors.email))} />
                  {errors.email ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.email}</span> : null}
                </label>

                <label className="block text-sm font-bold text-[#4a3d35]">Password
                  <div className="relative">
                    <input value={password} onChange={(event) => { setPassword(event.target.value); setErrors((value) => ({ ...value, password: undefined })); }} type={showPassword ? "text" : "password"} name="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Your password"} aria-invalid={Boolean(errors.password)} className={`${fieldClass(Boolean(errors.password))} pr-20`} />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute bottom-2 right-2 rounded-xl px-3 py-2 text-xs font-black text-[#806c60] hover:bg-[#f6f1ed]">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                  {errors.password ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.password}</span> : null}
                  {isSignup && password ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((step) => <span key={step} className={`h-1.5 flex-1 rounded-full ${passwordScore >= step ? "bg-orange-500" : "bg-[#eadfd7]"}`} />)}</div>
                      <span className="text-[10px] font-black uppercase text-[#8c786b]">{passwordScore <= 1 ? "Weak" : passwordScore <= 3 ? "Good" : "Strong"}</span>
                    </div>
                  ) : null}
                </label>

                {isSignup ? (
                  <label className="block text-sm font-bold text-[#4a3d35]">Confirm password
                    <input value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setErrors((value) => ({ ...value, confirmPassword: undefined })); }} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Repeat password" aria-invalid={Boolean(errors.confirmPassword)} className={fieldClass(Boolean(errors.confirmPassword))} />
                    {errors.confirmPassword ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.confirmPassword}</span> : null}
                  </label>
                ) : (
                  <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-black text-orange-600 hover:text-orange-700">Forgot password?</Link></div>
                )}

                <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white shadow-[0_10px_24px_rgba(249,115,22,0.20)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}</button>
              </form>
            ) : (
              <div className="mt-5">
                <label className="block text-sm font-bold text-[#4a3d35]">Mobile number
                  <div className="mt-2 flex rounded-2xl border border-[#e6ddd7] bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100">
                    <span className="flex min-h-12 items-center border-r border-[#eee5df] px-4 text-sm font-black text-[#5f4f45]">🇳🇬 +234</span>
                    <input value={phone} onChange={(event) => { setPhone(event.target.value); setErrors((value) => ({ ...value, phone: undefined })); }} inputMode="tel" autoComplete="tel-national" placeholder="801 234 5678" aria-label="Nigerian mobile number" className="min-h-12 min-w-0 flex-1 rounded-r-2xl bg-transparent px-4 text-[16px] outline-none" />
                  </div>
                  {errors.phone ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.phone}</span> : <span className="mt-1.5 block text-xs text-[#9b887c]">You can also enter a number starting with 0.</span>}
                </label>

                {!otpSent ? (
                  <button type="button" disabled={busy} onClick={requestOtp} className="mt-4 min-h-12 w-full rounded-2xl bg-orange-500 px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-60">{busy ? "Sending…" : "Send 6-digit code"}</button>
                ) : (
                  <div className="mt-4 rounded-2xl bg-[#faf7f4] p-4 ring-1 ring-[#eee4dd]">
                    <div className="flex items-center justify-between gap-3">
                      <div><p className="text-sm font-black text-[#3d312a]">Enter verification code</p><p className="mt-1 text-xs text-[#8c786b]">Sent to {normalizeNigerianPhone(phone)}</p></div>
                      <button type="button" disabled={busy} onClick={requestOtp} className="text-xs font-black text-orange-600">Resend</button>
                    </div>
                    <input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setErrors((value) => ({ ...value, otp: undefined })); }} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" aria-label="SMS verification code" className={`${fieldClass(Boolean(errors.otp))} text-center text-xl font-black tracking-[0.35em]`} />
                    {errors.otp ? <span className="mt-1.5 block text-xs font-bold text-rose-600">{errors.otp}</span> : null}
                    <button type="button" disabled={busy} onClick={confirmOtp} className="mt-3 min-h-12 w-full rounded-2xl bg-[#3b2d25] px-5 py-3 font-black text-white hover:bg-orange-600 disabled:opacity-60">{busy ? "Checking…" : "Verify and continue"}</button>
                  </div>
                )}
              </div>
            )}

            {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-2xl border px-4 py-3 text-xs font-bold leading-5 ${noticeClass(notice.tone)}`}>{notice.text}</p> : null}

            <p className="mt-6 text-center text-sm text-[#75645a]">{isSignup ? "Already have an account?" : "New to Zomax?"} <Link href={isSignup ? "/login" : "/signup"} className="font-black text-orange-600 hover:text-orange-700">{isSignup ? "Sign in" : "Create account"}</Link></p>
            <p className="mt-4 text-center text-[11px] leading-5 text-[#a18e81]">By continuing, you agree to Zomax account terms and privacy policy. Preview mode simulates the frontend flow only and never stores your password.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
