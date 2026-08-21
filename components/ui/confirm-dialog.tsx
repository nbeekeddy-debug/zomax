"use client";

import { Dialog } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      ariaLabel={title}
      panelClassName="w-[min(92vw,460px)] rounded-[30px] bg-[#fffdfb] p-6 shadow-2xl ring-1 ring-[#eadfd7] sm:p-7"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a63d08]">Please confirm</p>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-[#261d19]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#594b42]">{description}</p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-2xl border border-[#dfd2ca] bg-white px-5 py-2.5 text-sm font-black text-[#493a31] hover:bg-[#f7f3ef]"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`min-h-11 rounded-2xl px-5 py-2.5 text-sm font-black text-white ${
            destructive ? "bg-rose-700 hover:bg-rose-800" : "bg-[#c94b0b] hover:bg-[#a83a08]"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
