"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export type Project = {
  id: string;
  title: string;
  status: "In Progress" | "On Hold" | "Completed" | "Proposal Review" | "Awaiting Approval";
  progress?: number; // 0-100
  budget?: number;
  spent?: number;
  team?: number;
  deadline?: string;
  description?: string;
};

export function ProjectCard({ project, upcoming = false }: { project: Project; upcoming?: boolean }) {
  const p = project;
  const statusColor =
    p.status === "Completed"
      ? "bg-emerald-500/15 text-emerald-400"
      : p.status === "On Hold"
      ? "bg-amber-500/15 text-amber-400"
      : p.status === "Proposal Review"
      ? "bg-violet-500/15 text-violet-400"
      : p.status === "Awaiting Approval"
      ? "bg-orange-500/15 text-orange-400"
      : "bg-blue-500/15 text-blue-400";

  return (
    <motion.div className="rounded-xl border bg-card p-4 shadow-sm" whileHover={{ y: -2 }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{p.title}</div>
        <span className={`rounded-md px-2 py-0.5 text-xs ${statusColor}`}>{p.status}</span>
      </div>
      {p.description && <div className="text-muted-foreground mb-3 text-xs">{p.description}</div>}
      {!upcoming && p.progress !== undefined && (
        <div className="mb-2">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="text-foreground font-medium">{p.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-md bg-muted">
            <motion.div className="h-2 rounded-md bg-blue-500" initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} />
          </div>
        </div>
      )}
      <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        {p.budget && (
          <div>
            <div className="text-foreground font-medium">Budget</div>
            <div>${p.budget.toLocaleString()}</div>
          </div>
        )}
        {p.spent && (
          <div>
            <div className="text-foreground font-medium">Spent</div>
            <div>${p.spent.toLocaleString()}</div>
          </div>
        )}
        {p.team && (
          <div>
            <div className="text-foreground font-medium">Team Size</div>
            <div>{p.team} members</div>
          </div>
        )}
        {p.deadline && (
          <div>
            <div className="text-foreground font-medium">Deadline</div>
            <div>{new Date(p.deadline).toLocaleDateString()}</div>
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
          View Details
        </Button>
        <Button size="sm" variant="outline">
          {upcoming ? "Review" : "Edit"}
        </Button>
        {!upcoming && p.status === "In Progress" && (
          <Button size="sm" variant="secondary">Update Progress</Button>
        )}
      </div>
    </motion.div>
  );
}