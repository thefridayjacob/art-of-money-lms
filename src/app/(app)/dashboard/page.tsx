import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Flame,
  GraduationCap,
  Brain,
  UsersThree,
  LinkSimple,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/stats";
import { ProgressRing } from "@/components/ProgressRing";
import { BadgeShelf } from "@/components/dashboard/BadgeShelf";
import { StatCard } from "@/components/dashboard/StatCard";
import { XpLegend } from "@/components/dashboard/XpLegend";
import { AnimatedNumber, AnimatedBar } from "@/components/dashboard/anim";

export const metadata = { title: "Dashboard · The Art of Money" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const d = await getDashboardData(session.user.id);
  const name = session.user.displayName || session.user.name || "";
  const firstName = name ? name.split(" ")[0] : "";
  const xpToNext = d.xpForLevel - d.xpIntoLevel;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        Welcome back{firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="prose-money mt-1 text-muted">
        {d.lessons.done === 0
          ? "Your first lesson is waiting. One a week is the pace."
          : d.lessons.done === d.lessons.total
            ? "You finished the whole course. Nobody farms you now."
            : "Pick up where you left off. Momentum is the whole game."}
      </p>

      {/* Hero: level + streak + continue */}
      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex items-center gap-5 rounded-3xl border border-border bg-card p-5 sm:p-6">
            <ProgressRing progress={d.levelProgress} size={104} stroke={9}>
              <span className="font-display text-[10px] font-semibold uppercase tracking-wide text-muted">
                Level
              </span>
              <span className="font-display text-3xl font-extrabold leading-none text-ink">
                {d.level}
              </span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="font-display text-2xl font-extrabold text-ink">
                <AnimatedNumber value={d.xp} />{" "}
                <span className="text-base font-bold text-muted">XP</span>
              </p>
              <p className="prose-money text-sm text-muted">
                {xpToNext} XP to Level {d.level + 1}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1">
                <Flame size={15} weight="fill" className="text-amber-ink" />
                <span className="font-display text-xs font-semibold text-amber-ink">
                  {d.currentStreak}-day streak
                </span>
              </div>
            </div>
          </div>

          <Link
            href={d.nextLesson ? `/learn/${d.nextLesson.number}` : "/learn"}
            className="press group flex flex-col justify-between gap-4 rounded-3xl bg-ink p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(20,148,144,0.6)] sm:p-6"
          >
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-teal-bright">
                {d.lessons.done === 0 ? "Start here" : "Continue"}
              </p>
              <p className="mt-2 font-display text-lg font-bold leading-snug text-chalk sm:text-xl">
                {d.nextLesson
                  ? `Lesson ${d.nextLesson.number}: ${d.nextLesson.title}`
                  : "Revisit the course"}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-teal px-4 py-2 font-display text-sm font-semibold text-white transition group-hover:bg-teal-bright">
              {d.lessons.done === 0 ? "Begin" : "Resume"}
              <ArrowRight
                size={15}
                weight="bold"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </section>

      {/* Stat cards */}
        <section className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Lessons done"
            done={d.lessons.done}
            total={d.lessons.total}
            color="teal"
            pct={d.lessons.total ? d.lessons.done / d.lessons.total : 0}
            icon={<GraduationCap size={20} weight="duotone" />}
          />
          <StatCard
            label="Models mastered"
            done={d.models.done}
            total={d.models.total}
            color="pink"
            pct={d.models.total ? d.models.done / d.models.total : 0}
            icon={<Brain size={20} weight="duotone" />}
          />
          <StatCard
            label="People taught"
            done={d.taught.done}
            total={d.taught.total}
            color="amber"
            pct={d.taught.total ? d.taught.done / d.taught.total : 0}
            icon={<UsersThree size={20} weight="duotone" />}
          />
          <StatCard
            label="Links opened"
            done={d.resources.done}
            total={d.resources.total}
            color="teal"
            pct={d.resources.total ? d.resources.done / d.resources.total : 0}
            icon={<LinkSimple size={20} weight="duotone" />}
          />
        </section>

      {/* XP explainer + Journey */}
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <XpLegend />
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="font-display text-sm font-bold text-ink">
              Your journey
            </p>
            <div className="mt-3 space-y-3">
              {d.parts.map((p) => {
                const pct = p.total ? p.done / p.total : 0;
                return (
                  <div key={p.partNumber}>
                    <div className="flex items-center justify-between">
                      <p className="truncate font-display text-sm text-ink">
                        Part {p.partNumber} · {p.partTitle}
                      </p>
                      <span className="ml-2 shrink-0 font-display text-xs font-semibold text-muted">
                        {p.done}/{p.total}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <AnimatedBar value={pct} />
                    </div>
                  </div>
                );
              })}
            </div>
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
              {d.earnedCount}/{d.badgeTotal} earned
            </Link>
          </div>
          <div className="mt-3">
            <BadgeShelf badges={d.badges} />
          </div>
        </section>
    </main>
  );
}
