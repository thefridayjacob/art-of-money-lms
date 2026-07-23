"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toggleModelMastery } from "@/lib/progress-actions";
import { XpBurst, useBurst } from "./XpBurst";
import { useCelebrate } from "./BadgeCelebration";

export function MasterToggle({
  modelId,
  lessonId,
  lessonNumber,
  initialMastered,
}: {
  modelId: string;
  lessonId: string;
  lessonNumber: number;
  initialMastered: boolean;
}) {
  const [mastered, setMastered] = useState(initialMastered);
  const [pending, start] = useTransition();
  const burst = useBurst();
  const celebrate = useCelebrate();

  const onClick = () =>
    start(async () => {
      const res = await toggleModelMastery(modelId, lessonId, lessonNumber);
      setMastered(res.mastered);
      burst.fire(res.xp);
      celebrate(res.newBadges);
    });

  return (
    <div className="relative inline-block">
      <XpBurst show={burst.show} amount={burst.amount} />
      <motion.button
        type="button"
        onClick={onClick}
        disabled={pending}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        aria-pressed={mastered}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-xs font-semibold transition disabled:opacity-60 ${
          mastered
            ? "bg-teal text-white"
            : "border border-border bg-card text-muted hover:border-teal/50 hover:text-ink"
        }`}
      >
        <motion.span
          key={mastered ? "on" : "off"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          {mastered ? "✓" : "＋"}
        </motion.span>
        {mastered ? "Mastered" : "Mark mastered"}
      </motion.button>
    </div>
  );
}
