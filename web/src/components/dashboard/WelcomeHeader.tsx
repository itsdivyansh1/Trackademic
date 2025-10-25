"use client";

import { motion } from "motion/react";

export function WelcomeHeader() {
  return (
    <motion.div
      className="rounded-2xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Welcome to Trackademic</h1>
        <p className="text-muted-foreground">
          You’re just a few steps away from mastering your workflow.
        </p>
      </div>
    </motion.div>
  );
}
