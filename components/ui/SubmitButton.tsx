"use client";

import { Loader2 } from "lucide-react";

type Props = {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  type?: "submit" | "button" | "reset";
  onClick?: () => void;
};

export default function SubmitButton({
  loading = false,
  disabled = false,
  children,
  className = "btn-primary w-full",
  type = "submit",
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
