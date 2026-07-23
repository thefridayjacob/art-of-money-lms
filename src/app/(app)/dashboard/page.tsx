import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/stats";
import { ProgressRing } from "@/components/ProgressRing";
import { BadgeShelf } from "@/components/dashboard/BadgeShelf";
import { StatCard } from "@/components/dashboard/StatCard";

export const metadata = { title: "Dashboard · The Art of Money" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const d = await getDashboardData(session.user.id);
  const name = session.user.displayName || session.user.name || "learner";
  const overallPct = d.lessons.total
    ? d.lessons.done / d.lessons.total
    : 0;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        Welcome back{name ? `, ${name.split(" ")[0]}` : ""}.
      </h1>
      <p className="prose-money mt-1 text-muted">
        {d.lessons.done === 0
          ? "Your first lesson is waiting. One a week is the pace."
          : d.lessons.done === d.lessons.total
            ? "You finished the whole course. You're un-farmable now. 🏆"
            : "Pick up where you left off — momentum is the whole game."}
      </p>

      {/* Hero: level + streak + continue */}
      <section className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6">
          <ProgressRing progress={d.levelProgress} size={104} stroke={9}>
            <span className="font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
              Level
            </span>
            <span className="font-display text-3xl font-extrabold leading-none text-ink">
              {d.level}
            </span>
          </ProgressRing>
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">
              {d.xp.toLocaleString()} XP
            </p>
            <p className="prose-money text-sm text-muted">
              {d.xpForLevel - d.xpIntoLevel} XP to level {d.level + 1}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="font-display text-sm font-semibold text-ink">
                {d.currentStreak}-day streak
              </span>
              {d.longestStreak > d.currentStreak && (
                <span className="font-display text-xs text-muted">
                  · best {d.longestStreak}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          href={d.nextLesson ? `/learn/${d.nextLesson.number}` : "/learn"}
          className="press group flex flex-col justify-between rounded-3xl bg-ink p-6 text-left"
        >
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-teal-bright">
              {d.lessons.done === 0 ? "Start here" : "Continue"}
            </p>
            <p className="mt-2 font-display text-xl font-bold text-chalk">
              {d.nextLesson
                ? `Lesson ${d.nextLesson.number}: ${d.nextLesson.title}`
                : "Revisit the course"}
            </p>
          </div>
          <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-teal px-4 py-2 font-display text-sm font-semibold text-white transition group-hover:bg-teal-bright">
            {d.lessons.done === 0 ? "Begin →" : "Resume →"}
          </span>
        </Link>
      </section>

      {/* Stat cards */}
      <section className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Lessons"
          done={d.lessons.done}
          total={d.lessons.total}
          color="teal"
          pct={overallPct}
        />
        <StatCard
          label="Models"
          done={d.models.done}
          total={d.models.total}
          color="pink"
          pct={d.models.total ? d.models.done / d.models.total : 0}
          href="/deck"
        />
        <StatCard
          label="Taught"
          done={d.taught.done}
          total={d.taught.total}
          color="amber"
          pct={d.taught.total ? d.taught.done / d.taught.total : 0}
        />
        <StatCard
          label="Links opened"
          done={d.resources.done}
          total={d.resources.total}
          color="teal"
          pct={d.resources.total ? d.resources.done / d.resources.total : 0}
        />
      </section>

      {/* Parts progress */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-ink">Your journey</h2>
        <div className="mt-3 space-y-3">
          {d.parts.map((p) => {
            const pct = p.total ? p.done / p.total : 0;
            return (
              <div
                key={p.partNumber}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold text-ink">
                    Part {p.partNumber} · {p.partTitle}
                  </p>
                  <span className="font-display text-xs text-muted">
                    {p.done}/{p.total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Badges</h2>
          <Link
            href="/badges"
            className="font-display text-xs font-semibold text-teal hover:underline"
          >
            {d.earnedCount}/{d.badgeTotal} earned →
          </Link>
        </div>
        <div className="mt-3">
          <BadgeShelf badges={d.badges} />
        </div>
      </section>
    </main>
  );
}
