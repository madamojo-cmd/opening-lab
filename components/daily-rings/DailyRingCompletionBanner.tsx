"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import type { DailyRingCompletionResultLike } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { XpGainPill } from "@/components/xp/XpGainPill";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type DailyRingCompletionBannerProps = {
  result: DailyRingCompletionResultLike | null;
  className?: string;
};

export function DailyRingCompletionBanner({ result, className }: DailyRingCompletionBannerProps) {
  if (!result) return null;

  if (!result.ok) {
    return (
      <div className={classNames("rounded-3xl border border-stone-200 bg-white p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2 text-sm font-black text-stone-900">
          <XCircle size={16} className="text-stone-500" />
          Completion unavailable
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-600">{result.message}</p>
      </div>
    );
  }

  return (
    <div className={classNames("rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-green-900">
            <CheckCircle2 size={16} />
            {result.summaryTitle}
          </div>
          <p className="mt-2 text-sm leading-6 text-green-800">{result.tempoMessage}</p>
        </div>
        <XpGainPill xp={result.xpAwarded} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-green-200">+{result.repertoirePointsAwarded} points</span>
        {result.allRingsClosedThisAction ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-green-200">All rings closed</span> : null}
        {result.streakMilestones?.length ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-green-200">{result.streakMilestones[0].milestoneDays}-day streak</span> : null}
      </div>
    </div>
  );
}
