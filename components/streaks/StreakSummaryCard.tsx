"use client";

import { Flame } from "lucide-react";

import type { StreakProgressRecord } from "@/lib/blundr/streaks/streakTypes";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type StreakSummaryCardProps = {
  streakRecord: StreakProgressRecord | null | undefined;
  className?: string;
};

export function StreakSummaryCard({ streakRecord, className }: StreakSummaryCardProps) {
  const current = Math.max(0, Number(streakRecord?.currentStreakDays) || 0);
  const longest = Math.max(0, Number(streakRecord?.longestStreakDays) || 0);
  const total = Math.max(0, Number(streakRecord?.totalAllRingsClosedDays) || 0);

  return (
    <div className={classNames("rounded-3xl border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-stone-950">
            <Flame size={15} className="text-green-700" />
            Streak
          </div>
          {current > 0 ? (
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Current streak: <span className="font-black text-stone-900">{current} days</span>
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-stone-600">Close all three rings to start your streak.</p>
          )}
        </div>
        <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">{total} all-ring days</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl bg-stone-50 px-3 py-3">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Current</div>
          <div className="mt-1 text-xl font-black text-stone-950">{current}</div>
        </div>
        <div className="rounded-2xl bg-stone-50 px-3 py-3">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Longest</div>
          <div className="mt-1 text-xl font-black text-stone-950">{longest}</div>
        </div>
      </div>
    </div>
  );
}
