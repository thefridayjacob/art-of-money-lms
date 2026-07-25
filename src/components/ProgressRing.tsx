"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function ProgressRing({
  progress,
  size = 120,
  stroke = 10,
  color = "var(--color-teal)",
  children,
}: {
  progress: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const target = c * (1 - clamped);

  const reduce = useReducedMotion();
  // React state so the final offset lives in the DOM even if paint is throttled.
  const [offset, setOffset] = useState(reduce ? target : c);

  useEffect(() => {
    if (reduce) {
      setOffset(target);
      return;
    }
    const t = setTimeout(() => setOffset(target), 60);
    return () => clearTimeout(t);
  }, [target, reduce]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{
            strokeDashoffset: offset,
            transition: reduce
              ? undefined
              : "stroke-dashoffset 1s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
