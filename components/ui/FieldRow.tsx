type Props = {
  label: string;
  htmlFor?: string;
  ltr?: boolean;
  align?: "center" | "start";
  variant?: "default" | "auth";
  className?: string;
  error?: string;
  children: React.ReactNode;
};

export default function FieldRow({
  label,
  htmlFor,
  ltr,
  align = "center",
  variant = "default",
  className = "",
  error,
  children,
}: Props) {
  const cellClass = variant === "auth" ? "auth-field" : "field-cell";
  const invalidClass = error
    ? variant === "auth"
      ? "" // auth: text error only — no red ring/border
      : "[&_.input-field]:border-red-800 [&_.input-field]:ring-2 [&_.input-field]:ring-red-800/25"
    : "";
  /* Auth: stretch on small screens so labels stay RTL-start (right), not centered */
  const rowAlign =
    variant === "auth"
      ? align === "start"
        ? "items-stretch sm:items-start"
        : "items-stretch sm:items-center"
      : align === "start"
        ? "items-start"
        : "items-center";
  return (
    <div className={`${cellClass} ${className}`.trim()}>
      <div className={`field-cell-row ${rowAlign}`}>
        <label
          htmlFor={htmlFor}
          className={`field-cell-label${variant === "auth" ? " w-full text-start" : ""}`}
        >
          {label}
        </label>
        <div
          className={`field-cell-control ${invalidClass} ${ltr ? "[&_.input-field]:text-start" : ""}`}
          dir={ltr ? "ltr" : undefined}
        >
          {children}
          {error && <p className="mt-1 text-xs font-medium text-red-800">{error}</p>}
        </div>
      </div>
    </div>
  );
}
