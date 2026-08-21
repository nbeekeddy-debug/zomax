"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type DialogProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
  closeOnBackdrop?: boolean;
};

export function Dialog({
  open,
  onClose,
  ariaLabel,
  children,
  overlayClassName = "grid place-items-center p-4",
  panelClassName = "w-full max-w-xl rounded-[30px] bg-white shadow-2xl",
  closeOnBackdrop = true,
}: DialogProps) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(focusableSelector);
      (first || panel).focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
      );

      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] ${overlayClassName}`}
      role="presentation"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) closeRef.current();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={panelClassName}
      >
        {children}
      </section>
    </div>,
    document.body
  );
}
