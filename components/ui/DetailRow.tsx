type Props = {
  label: string;
  value: React.ReactNode;
  ltr?: boolean;
  /** Keep label + value on one horizontal line (truncate overflow). */
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
      <div className={`field-cell-row ${singleLine ? "flex-nowrap" : ""}`.trim()}>
        <span className={`field-cell-label ${singleLine ? "whitespace-nowrap" : ""}`.trim()}>
          {label}
        </span>
        <span
          className={`field-cell-value ${ltr ? "text-start" : ""} ${
            singleLine ? "truncate whitespace-nowrap break-normal" : ""
          }`.trim()}
          dir={ltr ? "ltr" : undefined}
          title={typeof value === "string" ? value : undefined}
        >
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}
