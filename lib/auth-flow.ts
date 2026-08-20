import { getSupabaseBrowserClient } from "@/lib/auth-client";

export type AuthProvider = "google" | "apple";
export type AuthSource = "email" | "phone" | AuthProvider;

export type AuthUser = {
  name: string;
  email?: string;
  phone?: string;
  authSource: AuthSource;
  preview?: boolean;
};

export type AuthResult =
  | { ok: true; user?: AuthUser; message?: string; needsEmailVerification?: boolean; previewCode?: string }
  | { ok: false; message: string };

export function isSecureAuthConfigured() {
  return Boolean(getSupabaseBrowserClient());
}

function friendlyName(email: string) {
  const local = email.split("@")[0] || "Zomax user";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function signInWithEmail(input: { email: string; password: string }): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      ok: true,
      user: { name: friendlyName(input.email), email: input.email, authSource: "email", preview: true },
      message: "Preview session started. Your password was validated in the browser and was not stored.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
  if (error) return { ok: false, message: error.message };

  return {
    ok: true,
    user: {
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
    return {
      ok: true,
      user: { name: input.name, email: input.email, authSource: "email", preview: true },
      message: "Preview account created. No password was stored. Connect the auth backend to persist real accounts.",
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
    user: { name: input.name, email: input.email, authSource: "email" },
  };
}

export async function startSocialAuth(provider: AuthProvider): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      ok: true,
      user: {
        name: `${provider === "google" ? "Google" : "Apple"} preview user`,
        authSource: provider,
        preview: true,
      },
      message: `${provider === "google" ? "Google" : "Apple"} preview sign-in completed locally. Add provider credentials to switch this exact flow to real OAuth.`,
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
    return {
      ok: true,
      previewCode: "246810",
      message: "Preview code sent. Use 246810 to complete the frontend flow.",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Code sent. Enter the 6-digit SMS code." };
}

export async function verifyPhoneOtp(input: { phone: string; token: string; previewCode?: string }): Promise<AuthResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    if (input.token !== (input.previewCode || "246810")) return { ok: false, message: "That preview code is not correct." };
    return {
      ok: true,
      user: { name: input.phone, phone: input.phone, authSource: "phone", preview: true },
      message: "Phone preview sign-in complete.",
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({ phone: input.phone, token: input.token, type: "sms" });
  if (error) return { ok: false, message: error.message };
  if (!data.user) return { ok: false, message: "Unable to verify that code." };

  return {
    ok: true,
    user: {
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
    return {
      ok: true,
      message: `Preview reset link prepared for ${email}. Real email delivery starts when the auth backend is connected.`,
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/account`,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password reset email sent." };
}
