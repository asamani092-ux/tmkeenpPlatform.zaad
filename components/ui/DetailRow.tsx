type Props = {
  label: string;
  value: React.ReactNode;
  ltr?: boolean;
  className?: string;
};

export default function DetailRow({ label, value, ltr, className = "" }: Props) {
  return (
    <div className={`field-cell ${className}`.trim()}>
      <div className="field-cell-row">
        <span className="field-cell-label">{label}</span>
        <span
          className={`field-cell-value ${ltr ? "text-start" : ""}`}
          dir={ltr ? "ltr" : undefined}
        >
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
}
