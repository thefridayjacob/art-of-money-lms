"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { CheckCircle, Flame } from "@phosphor-icons/react";
import { ProgressRing } from "@/components/ProgressRing";

const BADGES = [
  { t: "Scam-Proof", c: "var(--color-pink)" },
  { t: "Deck Starter", c: "var(--color-amber)", dark: true },
  { t: "First Step", c: "var(--color-teal)" },
];

/** The hero's product preview: a stack of cards that gently floats and tilts
 * toward the cursor in 3D. Purely decorative. */
export function HeroPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18, mass: 0.5 });
  const transform = useMotionTemplate`perspective(1000px) rotateX(${srx}deg) rotateY(${sry}deg)`;

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 12);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className="animate-float [transform-style:preserve-3d]">
      {/* Depth card behind */}
      <div
        aria-hidden
        className="absolute inset-x-6 -top-4 h-40 rounded-3xl border border-white/10 bg-ink-soft/70"
        style={{ transform: "translateZ(-40px)" }}
      />
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ transform }}
        className="relative rounded-3xl border border-white/10 bg-ink-soft p-6 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] will-change-transform"
      >
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
            <p className="font-display text-xl font-extrabold text-chalk">420 XP</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber/20 px-2.5 py-1 font-display text-xs font-semibold text-amber">
              <Flame size={13} weight="fill" /> 9-day streak
            </span>
          </div>
        </div>

        <div
          className="mt-5 rounded-2xl border border-teal/40 bg-teal/[0.08] p-4"
          style={{ transform: "translateZ(30px)" }}
        >
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

        <div
          className="mt-4 flex flex-wrap gap-2"
          style={{ transform: "translateZ(20px)" }}
        >
          {BADGES.map((b) => (
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
      </motion.div>
    </div>
  );
}
