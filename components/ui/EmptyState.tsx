import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  compact?: boolean;
};

/** عقد 1.13 EmptyState — أيقونة + عنوان + نص + إجراء حقيقي. O(1). */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  body,
  action,
  compact,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-center ${
        compact ? "py-6" : "py-10"
      }`}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--surface-sunken)", color: "var(--text-muted)" }}
        aria-hidden
      >
        <Icon className="h-6 w-6" />
      </span>
      <p
        className="font-semibold"
        style={{ color: "var(--text-primary)", fontSize: "var(--text-sm)" }}
      >
        {title}
      </p>
      {body ? (
        <p
          className="max-w-sm"
          style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}
        >
          {body}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
