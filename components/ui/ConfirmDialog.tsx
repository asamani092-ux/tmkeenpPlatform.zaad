"use client";

import FloatingModal from "@/components/admin/FloatingModal";
import SubmitButton from "@/components/ui/SubmitButton";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  /** Preferred copy prop (design-system callers). */
  body?: string;
  /** Alias used by beneficiary delete flow on master. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "confirm" | "destructive";
  loading?: boolean;
  /** Alias for loading. */
  pending?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
  /** Alias for onClose. */
  onCancel?: () => void;
};

/**
 * Confirm / destructive dialog — supports both design-system props
 * (body/loading/onClose) and master aliases (message/pending/onCancel).
 * Time O(1), Space O(1).
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "confirm",
  loading = false,
  pending = false,
  onConfirm,
  onClose,
  onCancel,
}: Props) {
  if (!open) return null;

  const text = body ?? message ?? "";
  const busy = loading || pending;
  const close = onClose ?? onCancel ?? (() => undefined);
  const destructive = variant === "destructive" || Boolean(message);

  return (
    <FloatingModal title={title} onClose={() => {
      if (!busy) close();
    }}>
      <div className="space-y-4 text-start">
        {text ? (
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
            <p>{text}</p>
          </div>
        ) : null}
        <div className="flex gap-2">
          <SubmitButton
            loading={busy}
            onClick={onConfirm}
            className="btn-primary flex-1 !py-2.5 text-sm"
            style={
              destructive
                ? { background: "var(--danger-solid)" }
                : undefined
            }
          >
            {busy ? "جاري التنفيذ..." : confirmLabel}
          </SubmitButton>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="btn-secondary flex-1 !py-2.5 text-sm disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </FloatingModal>
  );
}
