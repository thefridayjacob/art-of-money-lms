"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { toggleModelMastery } from "@/lib/progress-actions";
import { Markdown } from "@/components/Markdown";
import { useCelebrate } from "@/components/interactive/BadgeCelebration";

type Card = {
  id: string;
  number: number;
  title: string;
  body: string;
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  mastered: boolean;
};

export function ModelDeckCard({ card }: { card: Card }) {
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(card.mastered);
  const [pending, start] = useTransition();
  const celebrate = useCelebrate();

  const toggle = () =>
    start(async () => {
      const r = await toggleModelMastery(
        card.id,
        card.lessonId,
        card.lessonNumber,
      );
      setMastered(r.mastered);
      celebrate(r.newBadges);
    });

  return (
    <div style={{ perspective: 1200 }} className="h-60">
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        {/* Front */}
        <button
          type="button"
          onClick={() => setFlipped(true)}
          style={{ backfaceVisibility: "hidden" }}
          className={`absolute inset-0 flex flex-col rounded-2xl border p-4 text-left transition ${
            mastered
              ? "border-teal/50 bg-teal/[0.06]"
              : "border-border bg-card hover:border-teal/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex h-7 items-center rounded-full bg-ink px-2.5 font-display text-xs font-bold text-white">
              #{card.number}
            </span>
            {mastered && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-xs text-white">
                ✓
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display text-base font-bold leading-snug text-ink">
            {card.title}
          </h3>
          <span className="mt-auto font-display text-[11px] font-medium uppercase tracking-wide text-muted">
            Lesson {card.lessonNumber}
          </span>
          <span className="mt-1 font-display text-xs text-teal">Flip →</span>
        </button>

        {/* Back */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          className="absolute inset-0 flex flex-col rounded-2xl border border-ink bg-ink p-4"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 text-chalk [&_*]:!text-chalk/85 [&_strong]:!text-chalk">
            <p className="font-display text-sm font-bold text-chalk">
              {card.title}
            </p>
            <div className="prose-money mt-1.5 text-xs leading-relaxed">
              <Markdown>{card.body}</Markdown>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              disabled={pending}
              className={`press flex-1 rounded-full px-3 py-2 font-display text-xs font-semibold transition disabled:opacity-60 ${
                mastered
                  ? "bg-teal text-white"
                  : "bg-teal/15 text-teal-bright hover:bg-teal/25"
              }`}
            >
              {mastered ? "✓ Mastered" : "Mark mastered"}
            </button>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              className="press rounded-full border border-white/15 px-3 py-2 font-display text-xs font-semibold text-chalk/70 hover:text-chalk"
            >
              Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
