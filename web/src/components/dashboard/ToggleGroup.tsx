"use client";

import { motion } from "motion/react";

export function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-md border bg-card p-1 text-xs shadow-sm">
      {options.map((opt) => (
        <button
          key={opt}
          className={`relative rounded-sm px-3 py-1 transition ${value === opt ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => onChange(opt)}
        >
          {value === opt && (
            <motion.span layoutId="toggle-pill" className="absolute inset-0 -z-10 rounded-sm bg-accent" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
          )}
          {opt}
        </button>
      ))}
    </div>
  );
}