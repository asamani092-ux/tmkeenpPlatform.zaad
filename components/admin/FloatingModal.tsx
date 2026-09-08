"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export default function FloatingModal({ title, onClose, children, wide }: Props) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ background: "var(--tmkeen-overlay)", zIndex: "var(--z-modal)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border-0 bg-surface text-start shadow-xl sm:mx-4 sm:max-h-[90vh] sm:rounded-xl sm:border-2 sm:border-surface-border ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-surface-border px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-base font-bold leading-snug text-primary sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ms-auto shrink-0 rounded-lg p-1.5 text-brand-gray hover:bg-surface-muted"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
