"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** A floating "+N XP" reward that springs up and fades. */
export function XpBurst({ show, amount }: { show: boolean; amount: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key="burst"
          initial={{ opacity: 0, y: 4, scale: 0.8 }}
          animate={{ opacity: 1, y: -24, scale: 1 }}
          exit={{ opacity: 0, y: -36 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber px-2.5 py-0.5 font-display text-xs font-extrabold text-ink shadow-lg"
        >
          +{amount} XP
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/** Manages a transient burst; call fire(amount) after an XP-awarding action. */
export function useBurst() {
  const [state, setState] = useState({ show: false, amount: 0 });
  const fire = (amount: number) => {
    if (amount <= 0) return;
    setState({ show: true, amount });
    setTimeout(() => setState((s) => ({ ...s, show: false })), 1100);
  };
  return { show: state.show, amount: state.amount, fire };
}
