"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import { isDailyRingCompletionFailure, type DailyRingCompletionResultLike } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
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

  if (isDailyRingCompletionFailure(result)) {
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

  if (result.sharedSyncFailed) {
    return (
      <div className={classNames("rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2 text-sm font-black text-amber-900">
          <XCircle size={16} className="text-amber-600" />
          Reward sync failed
        </div>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          {result.sharedSyncFailureMessage ?? "Shared reward persistence failed. Please retry."}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Daily ring progress stayed recorded.
        </p>
      </div>
    );
  }

  return (
    <div className={classNames("rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <BlundrAssetImage
            asset={result.allRingsClosedThisAction || result.streakMilestones?.length ? BLUNDR_TEMPO_ASSETS.celebrate : BLUNDR_TEMPO_ASSETS.success}
            alt="Tempo celebration"
            variant="tempoInline"
            className="mx-auto sm:mx-0 sm:shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-green-900">
              <CheckCircle2 size={16} />
              {result.summaryTitle}
            </div>
            <p className="mt-2 text-sm leading-6 text-green-800">{result.tempoMessage}</p>
          </div>
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
