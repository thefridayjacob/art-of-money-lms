import Link from "next/link";
import {
  CheckCircle,
  Circle,
  Target,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import type { TodayGoal } from "@/lib/dashboard-extra";

export function TodayGoals({
  goals,
  doneCount,
  total,
}: {
  goals: TodayGoal[];
  doneCount: number;
  total: number;
}) {
  const allDone = doneCount === total;

  return (
    <div className="rounded-3xl border border-teal/25 bg-teal/[0.05] p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal/20 text-teal">
            <Target size={16} weight="fill" />
          </span>
          Today&apos;s goals
        </h2>
        <span className="font-display text-xs font-semibold text-muted">
          {doneCount}/{total}
        </span>
      </div>
      <p className="prose-money mt-1 text-xs text-muted">
        Earn each one today to keep the momentum going.
      </p>

      <ul className="mt-4 space-y-2">
        {goals.map((g) => {
          const row = (
            <div
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                g.done
                  ? "border-teal/30 bg-teal/[0.06]"
                  : "border-border bg-background hover:border-teal/40"
              }`}
            >
              {g.done ? (
                <CheckCircle
                  size={20}
                  weight="fill"
                  className="pop-in shrink-0 text-teal"
                />
              ) : (
                <Circle size={20} weight="regular" className="shrink-0 text-muted/50" />
              )}
              <span
                className={`flex-1 font-display text-sm ${
                  g.done ? "text-muted line-through" : "text-ink"
                }`}
              >
                {g.label}
              </span>
              <span
                className={`font-display text-xs font-bold ${
                  g.done ? "text-teal" : "text-muted"
                }`}
              >
                +{g.points}
              </span>
            </div>
          );
          return (
            <li key={g.key}>
              {g.done ? row : <Link href="/learn">{row}</Link>}
            </li>
          );
        })}
      </ul>

      {allDone && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber/15 px-3 py-2.5">
          <Trophy size={18} weight="fill" className="shrink-0 text-amber-ink" />
          <p className="font-display text-xs font-semibold text-amber-ink">
            All goals cleared today. Come back tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}
