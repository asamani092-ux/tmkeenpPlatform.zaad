type Props = {
  label: string;
  htmlFor?: string;
  ltr?: boolean;
  align?: "center" | "start";
  variant?: "default" | "auth";
  className?: string;
  children: React.ReactNode;
};

export default function FieldRow({
  label,
  htmlFor,
  ltr,
  align = "center",
  variant = "default",
  className = "",
  children,
}: Props) {
  const cellClass = variant === "auth" ? "auth-field" : "field-cell";
  return (
    <div className={`${cellClass} ${className}`.trim()}>
      <div
        className={`field-cell-row ${align === "start" ? "items-start" : "items-center"}`}
      >
        <label htmlFor={htmlFor} className="field-cell-label">
          {label}
        </label>
        <div className={`field-cell-control ${ltr ? "[&_.input-field]:text-start" : ""}`} dir={ltr ? "ltr" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}
