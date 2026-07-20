type Props = {
  cols?: 1 | 2;
  className?: string;
  children: React.ReactNode;
};

export default function FieldGrid({ cols = 2, className = "", children }: Props) {
  return (
    <div
      className={`field-grid ${cols === 1 ? "grid-cols-1" : "sm:grid-cols-2"} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
