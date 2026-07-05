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
    ? "[&_.input-field]:border-red-800 [&_.input-field]:ring-2 [&_.input-field]:ring-red-800/25 [&_.input-field-auth]:border-red-800 [&_.input-field-auth]:ring-2 [&_.input-field-auth]:ring-red-800/25"
    : "";
  return (
    <div className={`${cellClass} ${className}`.trim()}>
      <div
        className={`field-cell-row ${align === "start" ? "items-start" : "items-center"}`}
      >
        <label htmlFor={htmlFor} className="field-cell-label">
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
