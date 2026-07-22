type Props = {
  label: string;
  value: React.ReactNode;
  ltr?: boolean;
  /** Keep label + value on one horizontal line (no mid-word wrap; show full text). */
  singleLine?: boolean;
  className?: string;
};

export default function DetailRow({
  label,
  value,
  ltr,
  singleLine = false,
  className = "",
}: Props) {
  return (
    <div className={`field-cell ${className}`.trim()}>
      <div
        className={`field-cell-row ${singleLine ? "field-cell-row--inline flex-nowrap" : ""}`.trim()}
      >
        <span className={`field-cell-label ${singleLine ? "whitespace-nowrap" : ""}`.trim()}>
          {label}
        </span>
        <span
          className={[
            "field-cell-value",
            // Unify: values hug the label side (RTL start). LTR content uses text-end
            // so email/phone sit on the same edge as Arabic values.
            ltr ? "text-end" : "text-start",
            // One line without ellipsis — full email/phone stays visible.
            singleLine ? "whitespace-nowrap break-normal" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          dir={ltr ? "ltr" : "rtl"}
          title={typeof value === "string" ? value : undefined}
        >
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}
