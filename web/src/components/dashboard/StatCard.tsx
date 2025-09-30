"use client";

import { motion, AnimatePresence } from "motion/react";
import * as React from "react";

export function useCounter(value: number, duration = 0.6) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = display;
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round((from + (value - from) * eased) * 100) / 100);
      if (t < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return display;
}

export function StatCard({
  title,
  value,
  delta,
  icon,
  accent = "bg-emerald-500/15 text-emerald-500",
}: {
  title: string;
  value: number;
  delta?: number; // + or - percentage
  icon?: React.ReactNode;
  accent?: string;
}) {
  const number = useCounter(value);
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      className="rounded-xl border bg-card p-4 shadow-sm"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-md ${accent} p-2`}>{icon}</div>
        {typeof delta === "number" && (
          <span className={`text-xs ${positive ? "text-emerald-600" : "text-rose-600"}`}>
            {positive ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{title}</div>
      <div className="text-2xl font-semibold">
        <AnimatePresence mode="popLayout">
          <motion.span key={number} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}>
            {number.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}