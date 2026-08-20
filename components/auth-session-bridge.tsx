"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { useMarketplace } from "@/components/marketplace-provider";

export function AuthSessionBridge() {
  const { login } = useMarketplace();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    function sync(session: Session | null) {
      const user = session?.user;
      if (!user) return;
      login({
        name: String(user.user_metadata?.full_name || user.user_metadata?.name || user.phone || user.email?.split("@")[0] || "Zomax user"),
        email: user.email || undefined,
      });
    }

    void supabase.auth.getSession().then(({ data }) => sync(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => sync(session));
    return () => data.subscription.unsubscribe();
  }, [login]);

  return null;
}
