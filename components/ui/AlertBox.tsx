type Tone = "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  success: "alert-box alert-box--success",
  warning: "alert-box alert-box--warning",
  danger: "alert-box alert-box--danger",
  info: "alert-box alert-box--info",
};

type Props = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  role?: "status" | "alert";
};

/** تنبيه سطحي من توكنات النظام — O(1) */
export default function AlertBox({
  tone = "warning",
  children,
  className = "",
  role,
}: Props) {
  const a11yRole = role ?? (tone === "danger" ? "alert" : "status");
  return (
    <div role={a11yRole} className={`${TONE_CLASS[tone]} ${className}`.trim()}>
      {children}
    </div>
  );
}
