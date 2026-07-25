"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { formatNumber } from "@/lib/format";

const EASE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Counts up to `value`. Uses React state (not a motion value) so the final
 * number is committed to the real DOM and stays correct even if rAF/paint is
 * throttled. A setTimeout fallback guarantees the final value; rAF only makes
 * the count-up smooth when the tab is actually visible.
 */
export function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const safety = setTimeout(() => setN(value), 1400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [value, reduce]);

  return <span className={className}>{formatNumber(n)}</span>;
}

/**
 * A progress bar that fills to `value` (0..1) via a CSS width transition. The
 * width is React state, so the DOM holds the final value regardless of paint
 * throttling; the CSS transition animates it when visible.
 */
export function AnimatedBar({
  value,
  color = "var(--color-teal)",
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const [w, setW] = useState(reduce ? pct : 0);

  useEffect(() => {
    if (reduce) {
      setW(pct);
      return;
    }
    const t = setTimeout(() => setW(pct), 60);
    return () => clearTimeout(t);
  }, [pct, reduce]);

  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-ink/10 ${className ?? ""}`}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${w}%`,
          backgroundColor: color,
          transition: reduce ? undefined : `width 0.9s ${EASE_CSS}`,
        }}
      />
    </div>
  );
}
