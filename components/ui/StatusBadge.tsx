type Tone = "brand" | "success" | "warning" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  brand: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

type Props = {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
};

/** شارة حالة من عقد نظام الزاد — O(1) */
export default function StatusBadge({
  tone = "brand",
  children,
  className = "",
}: Props) {
  return (
    <span className={`${TONE_CLASS[tone]} ${className}`.trim()}>{children}</span>
  );
}
