"use client";

import { useEffect } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { isDailyRingCompletionFailure, isDailyRingCompletionSuccess, type DailyRingCompletionResultLike } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { DailyRingCompletionBanner } from "@/components/daily-rings/DailyRingCompletionBanner";
import { StreakSummaryCard } from "@/components/streaks/StreakSummaryCard";
import { enqueueRewardPopup } from "@/lib/blundr/rewards/rewardPopupBus";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type TrainingCompletionSummaryProps = {
  result: DailyRingCompletionResultLike | null;
  className?: string;
};

export function TrainingCompletionSummary({ result, className }: TrainingCompletionSummaryProps) {
  useEffect(() => {
    if (!result || !result.ok) return;
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.TRAINING_COMPLETION_SUMMARY_VIEWED, {
      userId: result.userId,
      localDate: result.localDate,
      source: result.source,
      repertoirePointsAwarded: result.repertoirePointsAwarded,
      xpAwarded: result.xpAwarded,
    });
  }, [result]);

  useEffect(() => {
    if (!result || !isDailyRingCompletionSuccess(result)) return;
    if (result.sharedSyncFailed || !result.rewardGrants?.length) return;
    const grant = result.rewardGrants.find((entry) => entry.applied);
    if (!grant) return;
    enqueueRewardPopup({ id: grant.triggerEventId || grant.id, transactionId: grant.triggerEventId, kind: "tempo_cache", preview: false, title: "Tempo Cache", description: "Reveal your persisted reward.", createdAt: grant.createdAt, variant: "B", state: result.tempoCacheState ?? "applied", rewardGrants: [grant], rewardHistory: result.rewardHistory ?? null });
  }, [result]);

  if (!result) return null;

  if (isDailyRingCompletionFailure(result)) {
    return (
      <div className={classNames("rounded-3xl border border-stone-200 bg-white p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2 text-sm font-black text-stone-900">
          <CheckCircle2 size={16} className="text-stone-500" />
          Training update
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-600">{result.message}</p>
      </div>
    );
  }

  return (
    <section className={classNames("rounded-3xl border border-green-200 bg-green-50 p-4 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.reward} alt="Tempo reward" variant="tempoInline" className="mx-auto sm:mx-0 sm:shrink-0" />
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-green-900">
              <Sparkles size={16} />
              {result.summaryTitle}
            </div>
            <p className="mt-2 text-sm leading-6 text-green-800">{result.tempoMessage}</p>
          </div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700 ring-1 ring-green-200">
          +{result.repertoirePointsAwarded} pts
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <DailyRingCompletionBanner result={result} />
        <StreakSummaryCard streakRecord={result.streakRecord} />
        <div className="rounded-3xl bg-white p-4 ring-1 ring-green-100">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">What happened</div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
            {result.summaryLines.map((line) => (
              <li key={line} className="rounded-2xl bg-stone-50 px-3 py-2">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-stone-600">{result.nextRecommendedAction}</p>
        </div>
      </div>
    </section>
  );
}
