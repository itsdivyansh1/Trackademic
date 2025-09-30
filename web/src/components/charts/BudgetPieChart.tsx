"use client";

import * as React from "react";
import { motion } from "motion/react";

export function BudgetPieChart({ used, total, className }: { used: number; total: number; className?: string }) {
  const size = 140;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, used / total));

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} className="stroke-muted fill-none" />
      <motion.circle
        cx={size/2}
        cy={size/2}
        r={r}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        className="stroke-violet-500 fill-none rotate-[-90deg] origin-center"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}