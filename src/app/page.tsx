const TAGS = [
  { label: "15 lessons", color: "var(--color-teal)", rotate: -4 },
  { label: "76 models", color: "var(--color-pink)", rotate: 3 },
  { label: "Track progress", color: "var(--color-amber)", rotate: -2, dark: true },
  { label: "Master the deck", color: "var(--color-teal)", rotate: 5 },
  { label: "Get un-farmable", color: "var(--color-pink)", rotate: -3 },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-ink px-6 py-24 text-center">
      <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-teal-bright">
        fryvstudio · coming soon
      </span>

      <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] text-chalk sm:text-7xl">
        The Art of <span className="text-teal-bright">Money</span>.
      </h1>

      <p className="prose-money mt-6 max-w-xl text-lg text-chalk/70">
        A free, gamified course on how money actually works — 15 lessons, 76
        models, written for Nigerians tired of staying broke for bad reasons.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {TAGS.map((t) => (
          <span
            key={t.label}
            className="peel"
            style={{
              backgroundColor: t.color,
              color: t.dark ? "var(--color-ink)" : "#fff",
              transform: `rotate(${t.rotate}deg)`,
            }}
          >
            {t.label}
          </span>
        ))}
      </div>

      <p className="mt-14 font-display text-sm text-chalk/40">
        Learning platform in the works. Everything ships on Friday.
      </p>
    </main>
  );
}
