"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { completeLesson } from "@/lib/progress-actions";
import { XpBurst, useBurst } from "./XpBurst";
import { useCelebrate } from "./BadgeCelebration";

export function CompleteLessonButton({
  lessonId,
  lessonNumber,
  initialCompleted,
  next,
}: {
  lessonId: string;
  lessonNumber: number;
  initialCompleted: boolean;
  next: { number: number; title: string } | null;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, start] = useTransition();
  const burst = useBurst();
  const celebrate = useCelebrate();

  const onComplete = () =>
    start(async () => {
      const res = await completeLesson(lessonId, lessonNumber);
      setCompleted(true);
      burst.fire(res.xpAwarded);
      celebrate(res.newBadges);
    });

  return (
    <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-8 text-center">
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 12 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-2xl text-white"
            >
              ✓
            </motion.div>
            <p className="font-display text-lg font-extrabold text-ink">
              Lesson {lessonNumber} complete
            </p>
            {next ? (
              <Link
                href={`/learn/${next.number}`}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 font-display text-sm font-semibold text-white transition hover:bg-teal-bright"
              >
                Next: {next.title} →
              </Link>
            ) : (
              <p className="prose-money text-sm text-muted">
                That was the final lesson. You&apos;re un-farmable now. 🏆
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <p className="prose-money text-sm text-muted">
              Done reading? Lock it in and unlock the next lesson.
            </p>
            <div className="relative">
              <XpBurst show={burst.show} amount={burst.amount} />
              <motion.button
                type="button"
                onClick={onComplete}
                disabled={pending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="rounded-full bg-teal px-7 py-3.5 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright disabled:opacity-60"
              >
                {pending ? "Saving…" : "Mark lesson complete ✓"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
