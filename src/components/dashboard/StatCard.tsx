import Link from "next/link";

const COLORS: Record<string, string> = {
  teal: "var(--color-teal)",
  pink: "var(--color-pink)",
  amber: "var(--color-amber)",
};

export function StatCard({
  label,
  done,
  total,
  color = "teal",
  pct,
  href,
}: {
  label: string;
  done: number;
  total: number;
  color?: "teal" | "pink" | "amber";
  pct: number;
  href?: string;
}) {
  const inner = (
    <div className="h-full rounded-2xl border border-border bg-card p-4 transition hover:shadow-sm">
      <p className="font-display text-2xl font-extrabold text-ink">
        {done}
        <span className="text-base font-semibold text-muted">/{total}</span>
      </p>
      <p className="font-display text-xs font-medium text-muted">{label}</p>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(pct * 100)}%`,
            backgroundColor: COLORS[color],
          }}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="press block">
        {inner}
      </Link>
    );
  }
  return inner;
}
