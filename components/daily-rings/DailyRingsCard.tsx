"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Flame, RefreshCw, Sparkles, Target } from "lucide-react";

import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { getDailyRingSnapshotSummary, loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import type { DailyRingCompletionResultLike, DailyRingDayRecord, DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { DailyRingSummary } from "./DailyRingSummary";
import { DailyRingTempoCallout } from "./DailyRingTempoCallout";
import { DailyRingCompletionBanner } from "./DailyRingCompletionBanner";
import { StreakSummaryCard } from "@/components/streaks/StreakSummaryCard";
import { TempoCacheCard } from "@/components/rewards/TempoCacheCard";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

type DailyRingsCardProps = {
  repertoireProgress: RepertoireProgress;
  refreshKey?: string | number;
  completionResult?: DailyRingCompletionResultLike | null;
  onStartTraining?: () => void;
  dailyBlundrHref?: string;
  className?: string;
};

function getRingProgress(dayRecord: DailyRingDayRecord) {
  return [
    {
      ringId: "daily_tempo" as const,
      label: "Daily Tempo",
      description: "Train your opening rhythm.",
      progress: dayRecord.dailyTempo.progress,
      goal: dayRecord.dailyTempo.goal,
      closed: dayRecord.dailyTempo.closed,
      percent: Math.min(100, Math.round((Math.min(dayRecord.dailyTempo.progress, dayRecord.dailyTempo.goal) / Math.max(1, dayRecord.dailyTempo.goal)) * 100)),
    },
    {
      ringId: "daily_battery" as const,
      label: "Daily Battery",
      description: "Play the position after the book ends.",
      progress: dayRecord.dailyBattery.progress,
      goal: dayRecord.dailyBattery.goal,
      closed: dayRecord.dailyBattery.closed,
      percent: Math.min(100, Math.round((Math.min(dayRecord.dailyBattery.progress, dayRecord.dailyBattery.goal) / Math.max(1, dayRecord.dailyBattery.goal)) * 100)),
    },
    {
      ringId: "daily_blundr" as const,
      label: "Daily Blundr",
      description: "Review what needs to stick.",
      progress: dayRecord.dailyBlundr.progress,
      goal: dayRecord.dailyBlundr.goal,
      closed: dayRecord.dailyBlundr.closed,
      percent: Math.min(100, Math.round((Math.min(dayRecord.dailyBlundr.progress, dayRecord.dailyBlundr.goal) / Math.max(1, dayRecord.dailyBlundr.goal)) * 100)),
    },
  ];
}

export function DailyRingsCard({ repertoireProgress, refreshKey, completionResult, onStartTraining, dailyBlundrHref = "/daily", className }: DailyRingsCardProps) {
  const [snapshot, setSnapshot] = useState<DailyRingSnapshot>(() => loadDailyRingSnapshot({ userId: getLocalAccountCurrentUserId() }));
  const trackedViewKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const nextSnapshot = loadDailyRingSnapshot({ userId: getLocalAccountCurrentUserId() });
    setSnapshot(nextSnapshot);
  }, [refreshKey, repertoireProgress.updatedAt]);

  useEffect(() => {
    const viewKey = `${snapshot.userId}:${snapshot.localDate}`;
    if (trackedViewKeyRef.current === viewKey) return;
    trackedViewKeyRef.current = viewKey;
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.DAILY_RINGS_CARD_VIEWED, {
      userId: snapshot.userId,
      localDate: snapshot.localDate,
      currentStreakDays: snapshot.streakRecord.currentStreakDays,
      allRingsClosed: snapshot.dayRecord.allRingsClosed,
    });
  }, [snapshot.userId, snapshot.localDate, snapshot.streakRecord.currentStreakDays, snapshot.dayRecord.allRingsClosed]);

  const ringItems = getRingProgress(snapshot.dayRecord);
  const allClosed = snapshot.dayRecord.allRingsClosed;
  const incompleteDailyBlundr = !snapshot.dayRecord.dailyBlundr.closed;

  return (
    <section className={classNames("rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Today&apos;s Blundr</div>
          <h2 className="mt-1 text-lg font-black tracking-tight text-stone-950">Close your daily rings</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Do opening reps, continuations, and Daily Blundr to keep your streak alive.</p>
        </div>
        <button
          type="button"
          onClick={() => setSnapshot(loadDailyRingSnapshot({ userId: getLocalAccountCurrentUserId() }))}
          className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm"
          aria-label="Refresh daily rings"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {completionResult ? <DailyRingCompletionBanner result={completionResult} /> : null}
        {completionResult?.rewardGrants?.length ? (
          <TempoCacheCard
            state={completionResult.tempoCacheState ?? "applied"}
            rewardGrants={completionResult.rewardGrants}
            rewardHistory={completionResult.rewardHistory ?? null}
          />
        ) : null}
        {ringItems.map((ring) => (
          <DailyRingSummary key={ring.ringId} label={ring.label} description={ring.description} progress={ring.progress} goal={ring.goal} percent={ring.percent} closed={ring.closed} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StreakSummaryCard streakRecord={snapshot.streakRecord} />
        <div className="rounded-3xl border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
            <Sparkles size={14} />
            Repertoire points
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">{repertoireProgress.availablePoints}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {repertoireProgress.lockedOpeningIds.length > 0
              ? `${repertoireProgress.nextUnlockProgressPct}% toward the next unlock.`
              : "All eligible MVP openings are unlocked."}
          </p>
          <div className="mt-4 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-stone-600 ring-1 ring-stone-100">
            {getDailyRingSnapshotSummary(snapshot)}
          </div>
        </div>
      </div>

      <DailyRingTempoCallout className="mt-4" message={allClosed ? "All rings closed. Your Blundr habit is locked in for today." : "Close all three rings to keep your streak alive."} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onStartTraining}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
        >
          Continue training
          <ChevronRight size={16} />
        </button>
        <Link
          href={dailyBlundrHref}
          className={classNames(
            "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black shadow-sm",
            incompleteDailyBlundr ? "bg-white text-green-700 ring-1 ring-green-200" : "bg-stone-100 text-stone-500",
          )}
        >
          {incompleteDailyBlundr ? "Open Daily Blundr" : "Daily Blundr complete"}
          <Target size={16} />
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-500">
        <Flame size={14} className="text-green-700" />
        Current streak: <span className="font-black text-stone-700">{snapshot.streakRecord.currentStreakDays}</span>
        {" • "}
        Longest: <span className="font-black text-stone-700">{snapshot.streakRecord.longestStreakDays}</span>
      </div>
    </section>
  );
}
