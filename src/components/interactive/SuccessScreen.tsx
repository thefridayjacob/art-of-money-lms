"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Lightning, ArrowRight, Trophy } from "@phosphor-icons/react";

type Badge = {
  key: string;
  name: string;
  emoji: string;
  color: string;
};

const BADGE_COLORS: Record<string, string> = {
  teal: "var(--color-teal)",
  pink: "var(--color-pink)",
  amber: "var(--color-amber)",
};

export function SuccessScreen({
  open,
  xp,
  streak,
  badges,
  lessonNumber,
  next,
  onClose,
}: {
  open: boolean;
  xp: number;
  streak: number;
  badges: Badge[];
  lessonNumber: number;
  next: { number: number; title: string } | null;
  onClose: () => void;
}) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 460,
        y: -120 - Math.random() * 320,
        rotate: Math.random() * 540,
        delay: Math.random() * 0.25,
        color: [
          "var(--color-teal)",
          "var(--color-pink)",
          "var(--color-amber)",
        ][i % 3],
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-border bg-card p-7 text-center shadow-2xl"
          >
            {/* Confetti */}
            <div className="pointer-events-none absolute left-1/2 top-24">
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  className="absolute rounded-[2px]"
                  style={{
                    width: c.size,
                    height: c.size,
                    backgroundColor: c.color,
                  }}
                  initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  animate={{ opacity: 0, x: c.x, y: c.y, rotate: c.rotate }}
                  transition={{ duration: 1.3, delay: c.delay, ease: "easeOut" }}
                />
              ))}
            </div>

            {/* Illustration: amber sunburst + teal medal (visible by default) */}
            <div className="relative mx-auto mt-1 flex h-32 w-32 items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                className="absolute inset-0 h-full w-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <rect
                    key={i}
                    x="58"
                    y="4"
                    width="4"
                    height="16"
                    rx="2"
                    fill="var(--color-amber)"
                    transform={`rotate(${i * 30} 60 60)`}
                  />
                ))}
              </svg>
              <div className="pop-in relative flex h-20 w-20 items-center justify-center rounded-full bg-teal shadow-lg">
                <Trophy size={38} weight="fill" className="text-white" />
              </div>
            </div>

            <p className="mt-5 font-display text-xs font-semibold uppercase tracking-[0.25em] text-teal">
              Lesson {lessonNumber} complete
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-ink">
              Nicely done.
            </h2>

            {/* Rewards */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl bg-teal/10 px-3.5 py-2.5">
                <Lightning size={18} weight="fill" className="text-teal" />
                <span className="font-display text-lg font-extrabold text-teal">
                  +{xp}
                </span>
                <span className="font-display text-xs font-semibold text-teal/70">
                  XP
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-amber/15 px-3.5 py-2.5">
                <Flame size={18} weight="fill" className="text-amber-ink" />
                <span className="font-display text-lg font-extrabold text-amber-ink">
                  {streak}
                </span>
                <span className="font-display text-xs font-semibold text-amber-ink/70">
                  day{streak === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {badges.length > 0 && (
              <div className="mt-4">
                <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Badge{badges.length > 1 ? "s" : ""} unlocked
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {badges.map((b) => (
                    <span
                      key={b.key}
                      className="peel text-xs"
                      style={{
                        backgroundColor: BADGE_COLORS[b.color] ?? "var(--color-teal)",
                      }}
                    >
                      {b.emoji} {b.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-2">
              {next ? (
                <Link
                  href={`/learn/${next.number}`}
                  onClick={onClose}
                  className="press inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-3.5 font-display font-semibold text-white transition hover:bg-teal-bright"
                >
                  Next: Lesson {next.number}
                  <ArrowRight size={16} weight="bold" />
                </Link>
              ) : (
                <p className="prose-money text-sm text-muted">
                  That was the final lesson. You&apos;re un-farmable now.
                </p>
              )}
              <Link
                href="/dashboard"
                onClick={onClose}
                className="press rounded-2xl border border-border px-5 py-3 font-display text-sm font-semibold text-muted transition hover:text-ink"
              >
                Back to dashboard
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
