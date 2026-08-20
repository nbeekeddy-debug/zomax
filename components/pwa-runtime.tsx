"use client";

import { useEffect, useState } from "react";

export function PwaRuntime() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const updateNetworkState = () => setOffline(!navigator.onLine);
    updateNetworkState();
    window.addEventListener("online", updateNetworkState);
    window.addEventListener("offline", updateNetworkState);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
            console.error("Zomax service worker registration failed", error);
          });
        },
        { once: true },
      );
    }

    return () => {
      window.removeEventListener("online", updateNetworkState);
      window.removeEventListener("offline", updateNetworkState);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[100] mx-auto w-[min(92vw,560px)] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900 shadow-xl" role="status">
      You are offline. Cached public pages remain available; account-changing actions will resume when your connection returns.
    </div>
  );
}
