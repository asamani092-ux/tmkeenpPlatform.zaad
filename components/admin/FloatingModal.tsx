"use client";

import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

export default function FloatingModal({ title, onClose, children, wide }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`card max-h-[90vh] w-full overflow-y-auto text-start shadow-xl mx-2 sm:mx-4 ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-4">
          <h2 className="flex-1 text-xl font-bold text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ms-auto shrink-0 rounded-lg p-1 text-brand-gray hover:bg-surface-muted"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
