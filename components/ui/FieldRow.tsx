type Props = {
  label: string;
  htmlFor?: string;
  ltr?: boolean;
  align?: "center" | "start";
  variant?: "default" | "auth" | "plain";
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
  const cellClass =
    variant === "auth" ? "auth-field" : variant === "plain" ? "field-plain" : "field-cell";
  const invalidClass = error
    ? variant === "auth" || variant === "plain"
      ? ""
      : "[&_.input-field]:border-red-800 [&_.input-field]:ring-2 [&_.input-field]:ring-red-800/25"
    : "";
  /* Auth mobile: stretch so label is full-width RTL-start; desktop keeps side-by-side */
  const rowAlign =
    variant === "plain"
      ? "items-stretch"
      : variant === "auth"
        ? align === "start"
          ? "max-sm:items-stretch sm:items-start"
          : "max-sm:items-stretch sm:items-center"
        : align === "start"
          ? "items-start"
          : "items-center";
  const rowClass =
    variant === "plain"
      ? "flex flex-col items-stretch gap-1.5 text-start"
      : `field-cell-row ${rowAlign}`;
  return (
    <div className={`${cellClass} ${className}`.trim()}>
      <div className={rowClass}>
        <label
          htmlFor={htmlFor}
          className={
            variant === "plain"
              ? "w-full text-start text-sm font-semibold text-primary"
              : `field-cell-label${
                  variant === "auth" ? " w-full text-start sm:w-auto" : ""
                }`
          }
        >
          {label}
        </label>
        <div
          className={`field-cell-control w-full min-w-0 ${invalidClass} ${ltr ? "[&_.input-field]:text-start" : ""}`}
          dir={ltr ? "ltr" : undefined}
        >
          {children}
          {error && <p className="mt-1 text-xs font-medium text-red-800">{error}</p>}
        </div>
      </div>
    </div>
  );
}
