import Link from "next/link";
import { asc, sql } from "drizzle-orm";
import {
  Coins,
  Wrench,
  ShieldCheck,
  Strategy,
  Lightning,
  Cards,
  Flame,
  Medal,
  UsersThree,
  ArrowRight,
  CheckCircle,
  Infinity as InfinityIcon,
} from "@phosphor-icons/react/dist/ssr";
import { db } from "@/db";
import { lessons, models } from "@/db/schema";
import { Reveal } from "@/components/marketing/Reveal";
import { MagneticLink } from "@/components/marketing/MagneticLink";
import { CountUp } from "@/components/marketing/CountUp";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { ModelMarquee } from "@/components/marketing/ModelMarquee";

export const metadata = {
  title: "The Art of Money — Learn how money actually works",
  description:
    "A gamified course on how money actually works. 15 lessons, 76 models, written for Nigerians. Track your progress, master the models, stop being farmed.",
};

const PARTS = [
  {
    n: 1,
    title: "What Money Is",
    blurb:
      "Where money comes from, why the naira shrinks, and how booms and crashes actually work.",
    Icon: Coins,
    color: "var(--color-teal)",
    span: "sm:col-span-3",
  },
  {
    n: 2,
    title: "How You Make Money",
    blurb: "Earning, selling, business models, valuation, and reading the numbers.",
    Icon: Wrench,
    color: "var(--color-amber)",
    dark: true,
    span: "sm:col-span-2",
  },
  {
    n: 3,
    title: "How You Keep Money",
    blurb: "Saving, investing, and the one test that catches almost every scam.",
    Icon: ShieldCheck,
    color: "var(--color-teal)",
    span: "sm:col-span-2",
  },
  {
    n: 4,
    title: "The Whole Game",
    blurb:
      "Monopoly, moats, the hidden curriculum, and who really wins under capitalism.",
    Icon: Strategy,
    color: "var(--color-pink)",
    span: "sm:col-span-3",
  },
];

const FEATURES = [
  { Icon: Cards, title: "The 76-model deck", body: "Every big idea named and collectible. Flip a card, learn it, master it." },
  { Icon: Lightning, title: "Earn XP as you go", body: "Points for every video watched, model mastered, and lesson finished." },
  { Icon: Flame, title: "Build a streak", body: "Show up daily. Momentum is the whole game." },
  { Icon: Medal, title: "Unlock badges", body: "Real milestones, from your First Step to Un-Farmable." },
  { Icon: UsersThree, title: "Teach one person", body: "The single most effective study technique ever measured. Built in." },
];

export default async function Landing() {
  const [[{ lessonCount }], [{ modelCount }], modelRows] = await Promise.all([
    db.select({ lessonCount: sql<number>`count(*)::int` }).from(lessons),
    db.select({ modelCount: sql<number>`count(*)::int` }).from(models),
    db
      .select({ title: models.title })
      .from(models)
      .orderBy(asc(models.number))
      .limit(30),
  ]);
  const modelNames = modelRows.map((m) => m.title);

  return (
    <main className="flex-1 bg-ink text-chalk">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-sm font-extrabold tracking-tight text-chalk">
          The Art of <span className="text-teal-bright">Money</span>
        </span>
        <div className="flex items-center gap-3 font-display text-sm">
          <Link href="/login" className="text-chalk/70 transition hover:text-chalk">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="press rounded-full bg-teal px-4 py-2 font-semibold text-white transition hover:bg-teal-bright"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero: asymmetric split. Rendered visible by default (no reveal
          gating) so the most important content never depends on JS. */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-teal-bright">
            The missing curriculum
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-chalk sm:text-6xl">
            Nobody teaches you{" "}
            <span className="marker">
              <span>money</span>
            </span>
            .
            <span className="block text-teal-bright">This does.</span>
          </h1>
          <p className="prose-money mt-6 max-w-md text-lg text-chalk/70">
            A course on how money actually works. {lessonCount} lessons,{" "}
            {modelCount} models, written for Nigerians tired of staying broke for
            bad reasons.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticLink
              href="/signup"
              className="press inline-flex items-center gap-2 rounded-full bg-teal px-7 py-3.5 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright"
            >
              Start learning <ArrowRight size={16} weight="bold" />
            </MagneticLink>
            <Link
              href="/login"
              className="font-display text-sm font-semibold text-chalk/60 transition hover:text-chalk"
            >
              Already learning? Sign in
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-4 font-display text-sm text-chalk/60">
            {["No pitch, no coin, no mentorship", "Nigerian numbers, Nigerian problems"].map(
              (t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={16} weight="fill" className="text-teal" />
                  {t}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Real product-preview cluster — floats + tilts toward the cursor */}
        <div className="relative hidden lg:block">
          <HeroPreview />
        </div>
      </section>

      {/* Stats band — real course numbers, counting up on scroll */}
      <section className="border-y border-white/10 bg-ink-soft">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-5 py-12 sm:grid-cols-4 sm:divide-x sm:divide-white/10">
          {[
            { value: lessonCount, suffix: "", label: "Lessons, in order" },
            { value: modelCount, suffix: "", label: "Named models to collect" },
            { value: 4, suffix: "", label: "Parts, one system" },
            { icon: true, label: "Lifetime access" },
          ].map((s, i) => (
            <div key={i} className="px-2 text-center sm:px-6">
              <div className="font-display text-5xl font-extrabold tracking-tight text-chalk">
                {s.icon ? (
                  <InfinityIcon
                    size={48}
                    weight="bold"
                    className="mx-auto text-teal-bright"
                  />
                ) : (
                  <span className="text-teal-bright">
                    <CountUp value={s.value as number} suffix={s.suffix} />
                  </span>
                )}
              </div>
              <p className="mt-2 font-display text-xs font-semibold uppercase tracking-wide text-chalk/50">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The 76-model deck — a living marquee of real model names */}
      <section className="overflow-hidden py-14">
        <Reveal className="mx-auto max-w-6xl px-5">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-teal-bright">
            {modelCount} models, all named
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-chalk sm:text-3xl">
            Every big idea is a card you collect.
          </h2>
        </Reveal>
        <div className="mt-8">
          <ModelMarquee items={modelNames} />
        </div>
      </section>

      {/* Manifesto */}
      <section className="border-y border-white/10 bg-ink-soft">
        <div className="mx-auto max-w-4xl px-5 py-20">
          <Reveal>
            <p className="prose-money text-2xl font-medium leading-snug text-chalk sm:text-3xl">
              You left school knowing the mitochondria is the powerhouse of the
              cell, and not knowing how to read a bank statement.{" "}
              <span className="text-teal-bright">
                That is a curriculum problem.
              </span>{" "}
              This is the missing curriculum.
            </p>
          </Reveal>
        </div>
      </section>

      {/* What you'll learn: asymmetric grid */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight text-chalk sm:text-4xl">
            Fifteen lessons, from what money is to how the whole game is rigged.
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-5">
          {PARTS.map((p, i) => (
            <Reveal
              key={p.n}
              delay={i * 0.05}
              className={p.span}
            >
              <div
                className={`group flex h-full flex-col rounded-3xl border p-6 transition duration-300 ease-out hover:-translate-y-1 ${
                  p.dark
                    ? "border-transparent bg-chalk text-ink hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6)]"
                    : "border-white/10 bg-ink-soft text-chalk hover:border-teal/40"
                }`}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
                  style={{ backgroundColor: p.color, color: p.dark ? "#151515" : "#fff" }}
                >
                  <p.Icon size={22} weight="duotone" />
                </span>
                <p
                  className={`mt-4 font-display text-xs font-semibold uppercase tracking-wide ${
                    p.dark ? "text-ink/50" : "text-chalk/40"
                  }`}
                >
                  Part {p.n}
                </p>
                <p className="mt-1 font-display text-xl font-bold">{p.title}</p>
                <p
                  className={`prose-money mt-2 text-sm ${
                    p.dark ? "text-ink/70" : "text-chalk/60"
                  }`}
                >
                  {p.blurb}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gamification feature strip */}
      <section className="border-t border-white/10 bg-ink-soft">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-teal-bright">
              Built to make it stick
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-chalk sm:text-4xl">
              Learning money should not feel like homework.
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04}>
                <div className="group flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal/15 text-teal-bright transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110">
                    <f.Icon size={22} weight="duotone" />
                  </span>
                  <div>
                    <p className="font-display text-base font-bold text-chalk">
                      {f.title}
                    </p>
                    <p className="prose-money mt-1 text-sm text-chalk/60">
                      {f.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-chalk sm:text-5xl">
            Stop being farmed.
            <span className="block text-teal-bright">Start learning.</span>
          </h2>
          <p className="prose-money mx-auto mt-5 max-w-md text-lg text-chalk/70">
            The frameworks last a lifetime. Fifteen lessons, one week at a time.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticLink
              href="/signup"
              className="press inline-flex items-center gap-2 rounded-full bg-teal px-8 py-4 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright"
            >
              Create your account <ArrowRight size={17} weight="bold" />
            </MagneticLink>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center">
          <p className="font-display text-sm font-bold text-chalk">
            The Art of <span className="text-teal-bright">Money</span>
          </p>
          <p className="prose-money text-xs text-chalk/40">
            Not financial advice. It is an education, which is better. Built by
            fryvstudio.
          </p>
        </div>
      </footer>
    </main>
  );
}
