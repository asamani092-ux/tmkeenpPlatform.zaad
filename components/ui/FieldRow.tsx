type Props = {
  label: string;
  htmlFor?: string;
  ltr?: boolean;
  align?: "center" | "start";
  className?: string;
  children: React.ReactNode;
};

export default function FieldRow({
  label,
  htmlFor,
  ltr,
  align = "center",
  className = "",
  children,
}: Props) {
  return (
    <div className={`field-cell ${className}`.trim()}>
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
