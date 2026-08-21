"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteAnnouncer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const title = document.title?.trim();
      setMessage(title ? `${title} loaded` : "Page loaded");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, searchParams]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
