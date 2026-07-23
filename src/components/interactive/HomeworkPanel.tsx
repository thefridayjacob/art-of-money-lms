"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { setHomework } from "@/lib/progress-actions";
import { Markdown } from "@/components/Markdown";
import { XpBurst, useBurst } from "./XpBurst";
import { useCelebrate } from "./BadgeCelebration";

export function HomeworkPanel({
  lessonId,
  lessonNumber,
  homework,
  initialDone,
  initialNotes,
}: {
  lessonId: string;
  lessonNumber: number;
  homework: string;
  initialDone: boolean;
  initialNotes: string | null;
}) {
  const [done, setDone] = useState(initialDone);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const burst = useBurst();
  const celebrate = useCelebrate();

  const persist = (nextDone: boolean) =>
    start(async () => {
      const res = await setHomework(lessonId, nextDone, notes, lessonNumber);
      setDone(res.done);
      burst.fire(res.xp);
      celebrate(res.newBadges);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
    });

  return (
    <div className="rounded-2xl border border-dashed border-teal/40 bg-teal/[0.04] p-5">
      <div className="prose-money">
        <Markdown>{homework}</Markdown>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative">
          <XpBurst show={burst.show} amount={burst.amount} />
          <motion.button
            type="button"
            onClick={() => persist(!done)}
            disabled={pending}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-pressed={done}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-semibold transition disabled:opacity-60 ${
              done
                ? "bg-teal text-white"
                : "border border-teal/40 bg-card text-teal hover:bg-teal/5"
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-[5px] text-[11px] ${
                done ? "bg-white text-teal" : "border-2 border-teal/50"
              }`}
            >
              {done && "✓"}
            </span>
            {done ? "Homework done" : "Mark homework done"}
          </motion.button>
        </div>
        {saved && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-xs text-muted"
          >
            Saved
          </motion.span>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => persist(done)}
        placeholder="Your working / notes (optional) — saved automatically"
        rows={3}
        className="prose-money mt-4 w-full resize-y rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-teal focus:ring-2 focus:ring-teal/30"
      />
    </div>
  );
}
