"use client";

import { motion } from "motion/react";

export function WelcomeHeader() {
  return (
    <motion.div className="rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900 p-6 text-neutral-100 shadow-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Welcome to Trackademic</h1>
        <p className="text-neutral-300">You’re just a few steps away from mastering your workflow.</p>
      </div>
    </motion.div>
  );
}