import Link from "next/link";
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
} from "@phosphor-icons/react/dist/ssr";
import { ProgressRing } from "@/components/ProgressRing";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata = {
  title: "The Art of Money — Learn how money actually works",
  description:
    "A free, gamified course on how money actually works. 15 lessons, 76 models, written for Nigerians. Track your progress, master the models, stop being farmed.",
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

export default function Landing() {
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
            Start free
          </Link>
        </div>
      </header>

      {/* Hero: asymmetric split */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <Reveal>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-teal-bright">
            Free, forever
          </p>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-chalk sm:text-6xl">
            Nobody teaches you money.
            <span className="block text-teal-bright">This does.</span>
          </h1>
          <p className="prose-money mt-6 max-w-md text-lg text-chalk/70">
            A course on how money actually works. 15 lessons, 76 models, written
            for Nigerians tired of staying broke for bad reasons.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="press inline-flex items-center gap-2 rounded-full bg-teal px-7 py-3.5 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright"
            >
              Start learning free <ArrowRight size={16} weight="bold" />
            </Link>
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
        </Reveal>

        {/* Real product-preview cluster */}
        <Reveal delay={0.15} className="relative hidden lg:block">
          <div className="rounded-3xl border border-white/10 bg-ink-soft p-6">
            <div className="flex items-center gap-4">
              <ProgressRing progress={0.62} size={84} stroke={8} color="var(--color-teal)">
                <span className="font-display text-[9px] font-semibold uppercase text-chalk/50">
                  Level
                </span>
                <span className="font-display text-2xl font-extrabold leading-none text-chalk">
                  3
                </span>
              </ProgressRing>
              <div>
                <p className="font-display text-xl font-extrabold text-chalk">
                  420 XP
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-2.5 py-1 font-display text-xs font-semibold text-amber">
                  <Flame size={13} weight="fill" /> 9-day streak
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-teal/40 bg-teal/[0.08] p-4">
              <div className="flex items-center justify-between">
                <span className="flex h-6 items-center rounded-full bg-chalk px-2 font-display text-[11px] font-bold text-ink">
                  #9
                </span>
                <CheckCircle size={18} weight="fill" className="text-teal-bright" />
              </div>
              <p className="mt-2 font-display text-sm font-bold text-chalk">
                Real vs Nominal
              </p>
              <p className="prose-money mt-1 text-xs text-chalk/60">
                Real return = nominal return minus inflation. The most important
                arithmetic in the course.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { t: "Scam-Proof", c: "var(--color-pink)" },
                { t: "Deck Starter", c: "var(--color-amber)", dark: true },
                { t: "First Step", c: "var(--color-teal)" },
              ].map((b) => (
                <span
                  key={b.t}
                  className="peel text-[11px]"
                  style={{
                    backgroundColor: b.c,
                    color: b.dark ? "var(--color-ink)" : "#fff",
                  }}
                >
                  {b.t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
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
                className={`flex h-full flex-col rounded-3xl border p-6 ${
                  p.dark
                    ? "border-transparent bg-chalk text-ink"
                    : "border-white/10 bg-ink-soft text-chalk"
                }`}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
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
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal/15 text-teal-bright">
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
          <p className="prose-money mx-auto mt-5 max-w-md text-lg text-chalk/60">
            Free, forever. The frameworks last a lifetime. The only cost is an
            hour a week.
          </p>
          <Link
            href="/signup"
            className="press mt-8 inline-flex items-center gap-2 rounded-full bg-teal px-8 py-4 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright"
          >
            Create your free account <ArrowRight size={17} weight="bold" />
          </Link>
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
