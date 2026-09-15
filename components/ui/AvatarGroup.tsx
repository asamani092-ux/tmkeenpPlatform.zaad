type Props = {
  names: string[];
  max?: number;
  size?: "sm" | "md";
};

/** ألوان دوائر ثابتة من سلالم التوكنات — بلا قيم خارج النظام. */
const CIRCLE_TOKENS = [
  "var(--primary-300)",
  "var(--secondary-300)",
  "var(--primary-500)",
  "var(--secondary-500)",
  "var(--neutral-400)",
] as const;

/** عقد 6.4 AssigneeAvatar group — دوائر متراكبة + «+N». O(min(n,max)). */
export default function AvatarGroup({ names, max = 4, size = "md" }: Props) {
  const dim = size === "sm" ? 24 : 30;
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  if (names.length === 0) return null;

  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`المستفيدون: ${names.join("، ")}`}
    >
      {shown.map((name, i) => (
        <span
          key={`${name}-${i}`}
          title={name}
          className="inline-flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: dim,
            height: dim,
            background: CIRCLE_TOKENS[i % CIRCLE_TOKENS.length],
            border: "2px solid var(--surface-raised)",
            marginInlineStart: i === 0 ? 0 : `calc(-1 * var(--space-2))`,
          }}
        />
      ))}
      {extra > 0 ? (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
          style={{
            width: dim,
            height: dim,
            marginInlineStart: `calc(-1 * var(--space-2))`,
            background: "var(--surface-sunken)",
            color: "var(--text-secondary)",
            border: "2px solid var(--surface-raised)",
            fontSize: "var(--text-2xs)",
          }}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  );
}
