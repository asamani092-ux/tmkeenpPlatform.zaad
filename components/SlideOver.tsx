"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function SlideOver({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slideover-title"
        className="absolute inset-y-0 start-0 flex w-full max-w-full flex-col bg-surface shadow-2xl sm:max-w-md lg:max-w-lg"
      >
        <div className="flex shrink-0 items-center gap-4 border-b border-surface-border px-4 py-4 sm:px-6">
          <h2 id="slideover-title" className="flex-1 text-lg font-bold text-primary sm:text-xl">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ms-auto shrink-0 rounded-lg p-1 text-brand-gray hover:bg-surface-muted"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 text-start sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
