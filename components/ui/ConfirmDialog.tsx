"use client";

import FloatingModal from "@/components/admin/FloatingModal";
import SubmitButton from "@/components/ui/SubmitButton";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "confirm" | "destructive";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** عقد 1.10 Dialog variant confirm/destructive — الإجراء الأساسي جهة البدء. O(1). */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "confirm",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  const destructive = variant === "destructive";

  return (
    <FloatingModal title={title} onClose={onClose}>
      <div className="space-y-4 text-start">
        {body ? (
          <div
            className="flex items-start gap-3 rounded-lg px-3 py-2 text-sm"
            style={
              destructive
                ? {
                    background: "var(--danger-surface)",
                    color: "var(--danger-text)",
                    border: "var(--border-hairline) solid var(--danger-border)",
                  }
                : {
                    background: "var(--surface-sunken)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {destructive ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            ) : null}
            <p>{body}</p>
          </div>
        ) : null}
        <div className="flex gap-2">
          <SubmitButton
            loading={loading}
            onClick={onConfirm}
            className={`flex-1 !py-2.5 text-sm ${
              destructive ? "btn-primary" : "btn-primary"
            }`}
            style={
              destructive
                ? { background: "var(--danger-solid)" }
                : undefined
            }
          >
            {confirmLabel}
          </SubmitButton>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 !py-2.5 text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </FloatingModal>
  );
}
