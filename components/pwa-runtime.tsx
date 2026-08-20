"use client";

import { useEffect, useState } from "react";

export function PwaRuntime() {
  const [offline, setOffline] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const updateNetworkState = () => setOffline(!navigator.onLine);
    updateNetworkState();
    window.addEventListener("online", updateNetworkState);
    window.addEventListener("offline", updateNetworkState);

    let registration: ServiceWorkerRegistration | undefined;
    let installingWorker: ServiceWorker | null = null;
    let reloading = false;

    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    async function registerServiceWorker() {
      if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (registration.waiting && navigator.serviceWorker.controller) setWaitingWorker(registration.waiting);

        registration.addEventListener("updatefound", () => {
          installingWorker = registration?.installing || null;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (installingWorker?.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(installingWorker);
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
        void registration.update().catch(() => undefined);
      } catch (error) {
        console.error("Zomax service worker registration failed", error);
      }
    }

    void registerServiceWorker();

    return () => {
      window.removeEventListener("online", updateNetworkState);
      window.removeEventListener("offline", updateNetworkState);
      if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  function activateUpdate() {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
  }

  if (!offline && !waitingWorker) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] mx-auto flex w-[min(92vw,580px)] flex-col gap-2 md:bottom-4">
      {offline ? (
        <div className="pointer-events-auto rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-950 shadow-xl" role="status">
          You are offline. Cached public pages remain available; account-changing actions should be retried after your connection returns.
        </div>
      ) : null}

      {waitingWorker ? (
        <div className="pointer-events-auto flex flex-col gap-3 rounded-2xl border border-[#eadfd7] bg-[#fffdfb] px-4 py-3 shadow-xl sm:flex-row sm:items-center sm:justify-between" role="status">
          <div>
            <p className="text-sm font-black text-[#261d19]">A newer Zomax version is ready.</p>
            <p className="mt-0.5 text-xs font-semibold text-[#66574d]">Refresh into the new app shell without waiting for the old cache to expire.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setWaitingWorker(null)} className="rounded-xl border border-[#dfd2ca] bg-white px-3 py-2 text-xs font-black text-[#493a31]">Later</button>
            <button type="button" onClick={activateUpdate} className="rounded-xl bg-[#c94b0b] px-3 py-2 text-xs font-black text-white hover:bg-[#a83a08]">Update</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
