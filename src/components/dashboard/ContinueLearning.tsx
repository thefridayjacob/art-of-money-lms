import Link from "next/link";
import Image from "next/image";
import {
  PlayCircle,
  BookOpen,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import type { ContinueCard } from "@/lib/dashboard-extra";
import { AnimatedBar } from "./anim";

export function ContinueLearning({ cards }: { cards: ContinueCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold text-ink">
          Continue learning
        </h2>
        <Link
          href="/learn"
          className="font-display text-xs font-semibold text-teal hover:underline"
        >
          All lessons
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.number}
            href={`/learn/${c.number}`}
            className="press group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition duration-200 hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_14px_36px_-18px_rgba(20,148,144,0.4)]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-ink">
              {c.thumb ? (
                <Image
                  src={c.thumb}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen size={30} weight="duotone" className="text-teal-bright" />
                </div>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 font-display text-[11px] font-semibold text-white backdrop-blur-sm">
                Lesson {c.number}
              </span>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal">
                  <PlayCircle size={26} weight="fill" className="text-white" />
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <p className="font-display text-[11px] font-medium uppercase tracking-wide text-muted">
                {c.partTitle}
              </p>
              <p className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-ink">
                {c.title}
              </p>
              <div className="mt-auto pt-3">
                <div className="mb-1.5 flex items-center justify-between font-display text-[11px] text-muted">
                  <span>
                    {c.status === "in_progress" ? "In progress" : "Not started"}
                  </span>
                  {c.totalModels > 0 && (
                    <span>
                      {c.masteredModels}/{c.totalModels} models
                    </span>
                  )}
                </div>
                <AnimatedBar value={c.pct} />
              </div>
              <span className="mt-3 inline-flex items-center gap-1 font-display text-xs font-semibold text-teal">
                {c.status === "in_progress" ? "Resume" : "Start"}
                <ArrowRight
                  size={13}
                  weight="bold"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
