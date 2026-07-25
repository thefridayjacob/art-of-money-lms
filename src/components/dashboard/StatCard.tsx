import Link from "next/link";
import { AnimatedBar } from "./anim";

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
  icon,
}: {
  label: string;
  done: number;
  total: number;
  color?: "teal" | "pink" | "amber";
  pct: number;
  href?: string;
  icon?: React.ReactNode;
}) {
  const inner = (
    <div className="h-full rounded-2xl border border-border bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-[0_10px_30px_-16px_rgba(21,21,21,0.35)]">
      <div className="flex items-start justify-between">
        <p className="font-display text-2xl font-extrabold text-ink">
          {done}
          <span className="text-base font-semibold text-muted">/{total}</span>
        </p>
        {icon && (
          <span style={{ color: COLORS[color] }} aria-hidden>
            {icon}
          </span>
        )}
      </div>
      <p className="font-display text-xs font-medium text-muted">{label}</p>
      <div className="mt-2.5">
        <AnimatedBar value={pct} color={COLORS[color]} />
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
