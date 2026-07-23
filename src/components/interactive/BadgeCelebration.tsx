"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";

type Badge = {
  key: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
};

const COLORS: Record<string, string> = {
  teal: "var(--color-teal)",
  pink: "var(--color-pink)",
  amber: "var(--color-amber)",
};

const CelebrateContext = createContext<(badges: Badge[]) => void>(() => {});

export function useCelebrate() {
  return useContext(CelebrateContext);
}

export function BadgeCelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<Badge[]>([]);

  const celebrate = useCallback((badges: Badge[]) => {
    if (badges?.length) setQueue((q) => [...q, ...badges]);
  }, []);

  const current = queue[0];
  const dismiss = () => setQueue((q) => q.slice(1));

  return (
    <CelebrateContext.Provider value={celebrate}>
      {children}
      <AnimatePresence>
        {current && (
          <BadgeOverlay
            key={current.key}
            badge={current}
            more={queue.length - 1}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
    </CelebrateContext.Provider>
  );
}

function BadgeOverlay({
  badge,
  more,
  onDismiss,
}: {
  badge: Badge;
  more: number;
  onDismiss: () => void;
}) {
  const color = COLORS[badge.color] ?? "var(--color-teal)";
  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 260,
        y: -80 - Math.random() * 160,
        rotate: Math.random() * 360,
        color: [
          "var(--color-teal)",
          "var(--color-pink)",
          "var(--color-amber)",
        ][i % 3],
        delay: Math.random() * 0.15,
      })),
    [],
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="relative w-full max-w-xs rounded-3xl border border-border bg-card p-7 text-center shadow-2xl"
      >
        {/* confetti burst */}
        <div className="pointer-events-none absolute left-1/2 top-16">
          {confetti.map((c) => (
            <motion.span
              key={c.id}
              className="absolute h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: c.color }}
              initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 0, x: c.x, y: c.y, rotate: c.rotate }}
              transition={{ duration: 1.1, delay: c.delay, ease: "easeOut" }}
            />
          ))}
        </div>

        <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Badge unlocked
        </p>

        <motion.div
          initial={{ scale: 0.4, rotate: -18 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
          className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-lg"
          style={{ backgroundColor: color }}
        >
          {badge.emoji}
        </motion.div>

        <h2 className="mt-5 font-display text-2xl font-extrabold text-ink">
          {badge.name}
        </h2>
        <p className="prose-money mt-1.5 text-sm text-muted">
          {badge.description}
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="press mt-6 w-full rounded-full bg-ink py-3 font-display text-sm font-semibold text-white"
        >
          {more > 0 ? `Next (${more} more) →` : "Nice 🎉"}
        </button>
      </motion.div>
    </motion.div>
  );
}
