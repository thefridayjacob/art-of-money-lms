"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from "motion/react";

/**
 * A link that gently pulls toward the cursor — a decorative micro-interaction.
 * Uses motion values + spring (never React state) and a transform string so it
 * stays off the render path and hardware-accelerated. No-ops for reduced motion
 * and touch (mousemove doesn't fire on tap).
 */
export function MagneticLink({
  href,
  children,
  className,
  strength = 0.35,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const transform = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0)`;

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    // Cap the pull so it never drifts far.
    x.set(Math.max(-14, Math.min(14, dx * strength)));
    y.set(Math.max(-14, Math.min(14, dy * strength)));
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span style={{ transform }} className="inline-block will-change-transform">
      <Link
        ref={ref}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={reset}
        className={className}
      >
        {children}
      </Link>
    </motion.span>
  );
}
