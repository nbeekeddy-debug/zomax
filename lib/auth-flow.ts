import { getSupabaseBrowserClient } from "@/lib/auth-client";

export type AuthProvider = "google" | "apple";
export type AuthSource = "email" | "phone" | AuthProvider;
export type AuthMode = "secure" | "preview" | "unavailable";

export type AuthUser = {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  authSource: AuthSource;
  preview?: boolean;
};

export type AuthResult =
  | { ok: true; user?: AuthUser; message?: string; needsEmailVerification?: boolean; previewCode?: string }
  | { ok: false; message: string };

export function getAuthMode(): AuthMode {
  if (getSupabaseBrowserClient()) return "secure";
  if (process.env.NEXT_PUBLIC_ZOMAX_AUTH_MODE === "preview" || process.env.NODE_ENV !== "production") return "preview";
  return "unavailable";
}

export function isSecureAuthConfigured() {
  return getAuthMode() === "secure";
}

function previewAllowed() {
  return getAuthMode() === "preview";
}

function backendUnavailable(): AuthResult {
  return {
    ok: false,
    message: "Secure sign-in is not configured on this deployment. Connect Supabase Auth or explicitly enable frontend preview mode.",
  };
}

function friendlyName(email: string) {
  const local = email.split("@")[0] || "Zomax user";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function previewId(source: AuthSource, value: string) {
  return `preview:${source}:${value.trim().toLowerCase()}`;
}

export async function signInWithEmail(input: { email: string; password: string }): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    return {
      ok: true,
      user: {
        id: previewId("email", input.email),
        name: friendlyName(input.email),
        email: input.email,
        authSource: "email",
        preview: true,
      },
      message: "Frontend preview session started. Your password was validated in the browser and was not stored.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { ok: false, message: error.message };

  return {
    ok: true,
    user: {
      id: data.user.id,
      name: String(data.user.user_metadata?.full_name || friendlyName(input.email)),
      email: data.user.email || input.email,
      phone: data.user.phone || undefined,
      authSource: "email",
    },
  };
}

export async function signUpWithEmail(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    return {
      ok: true,
      user: {
        id: previewId("email", input.email),
        name: input.name,
        email: input.email,
        authSource: "email",
        preview: true,
      },
      message: "Frontend preview account created. No password was stored. Connect the auth backend to persist a real account.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.name } },
  });
  if (error) return { ok: false, message: error.message };

  if (!data.session) {
    return { ok: true, needsEmailVerification: true, message: "Check your email to verify your address, then sign in." };
  }

  return {
    ok: true,
    user: { id: data.user?.id, name: input.name, email: input.email, authSource: "email" },
  };
}

export async function startSocialAuth(provider: AuthProvider): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    return {
      ok: true,
      user: {
        id: previewId(provider, "demo-user"),
        name: `${provider === "google" ? "Google" : "Apple"} preview user`,
        authSource: provider,
        preview: true,
      },
      message: `${provider === "google" ? "Google" : "Apple"} frontend preview completed locally. Add provider credentials to switch this exact flow to real OAuth.`,
    };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/account` },
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function sendPhoneOtp(phone: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    return {
      ok: true,
      previewCode: "246810",
      message: "Frontend preview code sent. Use 246810 to complete the flow.",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Code sent. Enter the 6-digit SMS code." };
}

export async function verifyPhoneOtp(input: { phone: string; token: string; previewCode?: string }): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    if (input.token !== (input.previewCode || "246810")) return { ok: false, message: "That preview code is not correct." };
    return {
      ok: true,
      user: {
        id: previewId("phone", input.phone),
        name: input.phone,
        phone: input.phone,
        authSource: "phone",
        preview: true,
      },
      message: "Phone frontend preview sign-in complete.",
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({ phone: input.phone, token: input.token, type: "sms" });
  if (error) return { ok: false, message: error.message };
  if (!data.user) return { ok: false, message: "Unable to verify that code." };

  return {
    ok: true,
    user: {
      id: data.user.id,
      name: data.user.phone || data.user.email || "Zomax user",
      email: data.user.email || undefined,
      phone: data.user.phone || input.phone,
      authSource: "phone",
    },
  };
}

export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (!previewAllowed()) return backendUnavailable();
    return {
      ok: true,
      message: `Frontend preview reset prepared for ${email}. Real email delivery starts when the auth backend is connected.`,
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account`,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password reset email sent." };
}
