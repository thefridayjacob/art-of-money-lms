"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toggleTeach } from "@/lib/progress-actions";
import { XpBurst, useBurst } from "./XpBurst";
import { useCelebrate } from "./BadgeCelebration";

export function TeachPanel({
  lessonId,
  lessonNumber,
  initialTaught,
}: {
  lessonId: string;
  lessonNumber: number;
  initialTaught: boolean;
}) {
  const [taught, setTaught] = useState(initialTaught);
  const [who, setWho] = useState("");
  const [pending, start] = useTransition();
  const burst = useBurst();
  const celebrate = useCelebrate();

  const onToggle = () =>
    start(async () => {
      const res = await toggleTeach(lessonId, who, lessonNumber);
      setTaught(res.taught);
      burst.fire(res.xp);
      celebrate(res.newBadges);
    });

  return (
    <div className="rounded-2xl border border-pink/30 bg-pink/[0.05] p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-2xl">
          🗣️
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ink">
            Teach one person
          </h3>
          <p className="prose-money mt-1 text-sm text-muted">
            You don&apos;t understand something until you can explain it. Teach
            this lesson to one person — a friend, a sibling, a cousin — then log
            it here. It&apos;s the single most effective study technique measured.
          </p>
        </div>
      </div>

      {!taught && (
        <input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Who did you teach? (optional)"
          className="prose-money mt-4 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-pink focus:ring-2 focus:ring-pink/25"
        />
      )}

      <div className="relative mt-4 inline-block">
        <XpBurst show={burst.show} amount={burst.amount} />
        <motion.button
          type="button"
          onClick={onToggle}
          disabled={pending}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          aria-pressed={taught}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm font-semibold transition disabled:opacity-60 ${
            taught
              ? "bg-pink text-white"
              : "border border-pink/40 bg-card text-pink hover:bg-pink/5"
          }`}
        >
          {taught ? "✓ Taught someone" : "I taught someone"}
        </motion.button>
      </div>
    </div>
  );
}
