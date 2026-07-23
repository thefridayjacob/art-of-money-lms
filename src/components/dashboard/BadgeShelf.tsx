"use client";

import { motion } from "motion/react";

type Badge = {
  key: string;
  name: string;
  emoji: string;
  color: string;
  earned: boolean;
};

const COLORS: Record<string, string> = {
  teal: "var(--color-teal)",
  pink: "var(--color-pink)",
  amber: "var(--color-amber)",
};

export function BadgeShelf({ badges }: { badges: Badge[] }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="flex flex-wrap gap-2.5"
    >
      {badges.map((b) => (
        <motion.li
          key={b.key}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 22 },
            },
          }}
          title={b.name}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-xs font-semibold ${
            b.earned ? "text-white" : "text-muted/60"
          }`}
          style={{
            backgroundColor: b.earned ? COLORS[b.color] : "var(--color-border)",
            opacity: b.earned ? 1 : 0.55,
          }}
        >
          <span
            className={b.earned ? "" : "grayscale"}
            style={{ filter: b.earned ? "none" : "grayscale(1)" }}
          >
            {b.earned ? b.emoji : "🔒"}
          </span>
          {b.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
