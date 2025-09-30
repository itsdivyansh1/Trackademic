"use client";

import { motion } from "motion/react";

export function SidebarProgress({ items }: { items: { label: string; value: number; color?: string }[] }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 font-medium">Projects</div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{it.label}</span>
              <span className="font-medium">{it.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <motion.div
                className={`h-2 rounded-full ${it.color ?? "bg-blue-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${it.value}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}