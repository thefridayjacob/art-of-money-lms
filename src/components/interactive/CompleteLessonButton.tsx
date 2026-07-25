"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { completeLesson } from "@/lib/progress-actions";
import { SuccessScreen } from "./SuccessScreen";

type Badge = { key: string; name: string; emoji: string; color: string };

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
  const [success, setSuccess] = useState<{
    xp: number;
    streak: number;
    badges: Badge[];
  } | null>(null);

  const onComplete = () =>
    start(async () => {
      const res = await completeLesson(lessonId, lessonNumber);
      setCompleted(true);
      setSuccess({
        xp: res.xpAwarded,
        streak: res.streak,
        badges: res.newBadges,
      });
    });

  return (
    <>
      <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-border bg-card px-6 py-8 text-center">
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white">
                <CheckCircle size={30} weight="fill" />
              </span>
              <p className="font-display text-lg font-extrabold text-ink">
                Lesson {lessonNumber} complete
              </p>
              {next ? (
                <Link
                  href={`/learn/${next.number}`}
                  className="press mt-1 inline-flex items-center gap-2 rounded-full bg-teal px-5 py-3 font-display text-sm font-semibold text-white transition hover:bg-teal-bright"
                >
                  Next: {next.title}
                  <ArrowRight size={15} weight="bold" />
                </Link>
              ) : (
                <p className="prose-money text-sm text-muted">
                  That was the final lesson. You&apos;re un-farmable now.
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
              <motion.button
                type="button"
                onClick={onComplete}
                disabled={pending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="rounded-full bg-teal px-7 py-3.5 font-display font-semibold text-white shadow-lg shadow-teal/20 transition hover:bg-teal-bright disabled:opacity-60"
              >
                {pending ? "Saving…" : "Mark lesson complete"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SuccessScreen
        open={success !== null}
        xp={success?.xp ?? 0}
        streak={success?.streak ?? 0}
        badges={success?.badges ?? []}
        lessonNumber={lessonNumber}
        next={next}
        onClose={() => setSuccess(null)}
      />
    </>
  );
}
