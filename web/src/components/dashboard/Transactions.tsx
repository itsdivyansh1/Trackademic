"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type TxItem = {
  id: string;
  title: string;
  date: string; // ISO
  amount: number; // positive/negative
};

export function TransactionsList({ items }: { items: TxItem[] }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 font-medium">Recent Transactions</div>
      <ul className="space-y-3">
        {items.map((tx) => {
          const positive = tx.amount >= 0;
          return (
            <motion.li key={tx.id} className="flex items-center justify-between rounded-lg bg-background/60 p-3" whileHover={{ scale: 1.01 }}>
              <div className="flex items-center gap-3">
                <div className={cn("rounded-md p-2", positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}> 
                  {positive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium">{tx.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={cn("text-sm font-semibold", positive ? "text-emerald-600" : "text-rose-600")}> 
                {positive ? "+" : ""}{tx.amount.toLocaleString()}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}