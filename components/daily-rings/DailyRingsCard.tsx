"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Flame, RefreshCw, Sparkles, Target } from "lucide-react";

import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { getBlundrStorageModeSetting } from "@/lib/blundr/backend/backendEnv";
import { createDefaultDailyRingDay } from "@/lib/blundr/daily-rings/dailyRingProgress";
import { getLocalDateKey } from "@/lib/blundr/daily-rings/dailyRingDate";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "@/lib/blundr/persistence/persistenceKeys";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { formatProgressPercentage, formatRepertoirePoints } from "@/lib/blundr/presentation/userFacingNumbers";
import { getDailyRingSnapshotSummary, loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import type { DailyRingCompletionResultLike, DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import { createDefaultStreakRecord } from "@/lib/blundr/streaks/streakService";
import { DailyRingTempoCallout } from "./DailyRingTempoCallout";
import { DailyRingCompletionBanner } from "./DailyRingCompletionBanner";
import { NestedDailyRings, getNestedDailyRingStatusLabel, getNestedDailyRingStyle } from "./NestedDailyRings";
import { StreakSummaryCard } from "@/components/streaks/StreakSummaryCard";
import { TempoCacheCard } from "@/components/rewards/TempoCacheCard";

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const PLACEHOLDER_ISO = "1970-01-01T00:00:00.000Z";
const PLACEHOLDER_LOCAL_DATE = "1970-01-01";

type DailyRingsCardProps = {
  repertoireProgress: RepertoireProgress;
  refreshKey?: string | number;
  completionResult?: DailyRingCompletionResultLike | null;
  onStartTraining?: () => void;
  dailyBlundrHref?: string;
  className?: string;
};

function getRingProgress(snapshot: DailyRingSnapshot) {
  return [
    {
      ringId: "daily_tempo" as const,
      label: "Tempo",
      description: "Train your opening rhythm.",
      progress: snapshot.tempo.current,
      goal: snapshot.tempo.target,
      percent: snapshot.tempo.percent,
      closed: snapshot.tempo.complete,
    },
    {
      ringId: "daily_battery" as const,
      label: "Battery",
      description: "Play the position after the book ends.",
      progress: snapshot.battery.current,
      goal: snapshot.battery.target,
      percent: snapshot.battery.percent,
      closed: snapshot.battery.complete,
    },
    {
      ringId: "daily_blundr" as const,
      label: "Blundr",
      description: "Review what needs to stick.",
      progress: snapshot.blundr.current,
      goal: snapshot.blundr.target,
      percent: snapshot.blundr.percent,
      closed: snapshot.blundr.complete,
    },
  ];
}

function buildLoadingDailyRingSnapshot(): DailyRingSnapshot {
  const userId = BLUNDR_LOCAL_DEMO_USER_ID;
  const localDate = PLACEHOLDER_LOCAL_DATE;
  const dayRecord = createDefaultDailyRingDay({
    userId,
    localDate,
    dailyTempoGoal: 10,
    dailyBatteryGoal: 3,
    dailyBlundrGoal: 1,
    now: PLACEHOLDER_ISO,
  });
  const streakRecord = createDefaultStreakRecord(userId, PLACEHOLDER_ISO);
  return {
    userId,
    localDate,
    dayRecord,
    streakRecord,
    tempo: {
      current: 0,
      target: dayRecord.dailyTempo.goal,
      percent: 0,
      complete: false,
    },
    battery: {
      current: 0,
      target: dayRecord.dailyBattery.goal,
      percent: 0,
      complete: false,
    },
    blundr: {
      current: 0,
      target: dayRecord.dailyBlundr.goal,
      percent: 0,
      complete: false,
    },
    allComplete: false,
    updatedAt: dayRecord.updatedAt,
  };
}

function isNamedLocalDemo(userId: string): boolean {
  return process.env.NODE_ENV !== "production" && getBlundrStorageModeSetting() === "local_demo" && userId === BLUNDR_LOCAL_DEMO_USER_ID;
}

function toAuthoritativeDailyRingSnapshot(summary: BlundrProgressSummary): DailyRingSnapshot {
  const ring = (ringId: "daily_tempo" | "daily_battery" | "daily_blundr") => summary.today.rings.find((item) => item.ringId === ringId) ?? { ringId, label: ringId, progress: 0, goal: 1, percent: 0, closed: false };
  const tempo = ring("daily_tempo");
  const battery = ring("daily_battery");
  const blundr = ring("daily_blundr");
  return {
    userId: summary.userId,
    localDate: summary.todayDateKey,
    dayRecord: {
      userId: summary.userId, localDate: summary.todayDateKey,
      dailyTempo: { ringId: "daily_tempo", progress: tempo.progress, goal: tempo.goal, closed: tempo.closed },
      dailyBattery: { ringId: "daily_battery", progress: battery.progress, goal: battery.goal, closed: battery.closed },
      dailyBlundr: { ringId: "daily_blundr", progress: blundr.progress, goal: blundr.goal, closed: blundr.closed },
      allRingsClosed: summary.today.allRingsClosed, xpEarnedToday: 0, repertoirePointsEarnedToday: 0, activityEventIds: [], createdAt: summary.generatedAt, updatedAt: summary.generatedAt,
    },
    streakRecord: { userId: summary.userId, currentStreakDays: summary.streak.currentDays, longestStreakDays: summary.streak.bestDays, totalAllRingsClosedDays: summary.streak.totalAllRingsClosedDays, updatedAt: summary.generatedAt },
    tempo: { current: tempo.progress, target: tempo.goal, percent: tempo.percent, complete: tempo.closed },
    battery: { current: battery.progress, target: battery.goal, percent: battery.percent, complete: battery.closed },
    blundr: { current: blundr.progress, target: blundr.goal, percent: blundr.percent, complete: blundr.closed },
    allComplete: summary.today.allRingsClosed,
    updatedAt: summary.generatedAt,
  };
}

export function DailyRingsCard({ repertoireProgress, refreshKey, completionResult, onStartTraining, dailyBlundrHref = "/daily", className }: DailyRingsCardProps) {
  const [snapshot, setSnapshot] = useState<DailyRingSnapshot>(() => buildLoadingDailyRingSnapshot());
  const [projectionUnavailable, setProjectionUnavailable] = useState(false);
  const trackedViewKeyRef = useRef<string | null>(null);
  const isPlaceholderSnapshot = snapshot.userId === BLUNDR_LOCAL_DEMO_USER_ID && snapshot.localDate === PLACEHOLDER_LOCAL_DATE && snapshot.updatedAt === PLACEHOLDER_ISO;
  const successfulCompletion = completionResult?.ok === true ? completionResult : null;

  async function refreshSnapshot() {
    const userId = getLocalAccountCurrentUserId();
    if (isNamedLocalDemo(userId)) {
      setProjectionUnavailable(false);
      setSnapshot(loadDailyRingSnapshot({ userId }));
      return;
    }
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: BlundrProgressSummary }>(`/api/blundr/progress/summary?localDate=${encodeURIComponent(getLocalDateKey())}`, { cache: "no-store" });
      setSnapshot(toAuthoritativeDailyRingSnapshot(response.data));
      setProjectionUnavailable(false);
    } catch {
      setProjectionUnavailable(true);
    }
  }

  useEffect(() => {
    void refreshSnapshot();
  }, [refreshKey, repertoireProgress.updatedAt, successfulCompletion?.activityEvent.id, successfulCompletion?.activityAlreadyApplied, completionResult?.ok]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleRefresh = () => {
      void refreshSnapshot();
    };
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshSnapshot();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (isPlaceholderSnapshot) return;
    const viewKey = `${snapshot.userId}:${snapshot.localDate}`;
    if (trackedViewKeyRef.current === viewKey) return;
    trackedViewKeyRef.current = viewKey;
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.DAILY_RINGS_CARD_VIEWED, {
      userId: snapshot.userId,
      localDate: snapshot.localDate,
      currentStreakDays: snapshot.streakRecord.currentStreakDays,
      allRingsClosed: snapshot.allComplete,
    });
  }, [isPlaceholderSnapshot, snapshot.userId, snapshot.localDate, snapshot.streakRecord.currentStreakDays, snapshot.allComplete]);

  const ringItems = getRingProgress(snapshot);
  const allClosed = snapshot.allComplete;
  const incompleteDailyBlundr = !snapshot.blundr.complete;
  const closedRingCount = ringItems.filter((ring) => ring.closed).length;
  const remainingRingCount = Math.max(0, ringItems.length - closedRingCount);
  const tempoCalloutMessage = allClosed
    ? "All rings closed. Your Blundr habit is closed for today."
    : `Close ${remainingRingCount} more ring${remainingRingCount === 1 ? "" : "s"} to keep your streak alive.`;

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
          onClick={() => {
            void refreshSnapshot();
          }}
          className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm"
          aria-label="Refresh daily rings"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {projectionUnavailable ? <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">Daily rings are temporarily unavailable. Retry to refresh them.</p> : null}
        {completionResult ? <DailyRingCompletionBanner result={completionResult} /> : null}
        {successfulCompletion?.rewardGrants?.length ? (
          <TempoCacheCard
            state={successfulCompletion.tempoCacheState ?? "applied"}
            rewardGrants={successfulCompletion.rewardGrants}
            rewardHistory={successfulCompletion.rewardHistory ?? null}
          />
        ) : null}
        <div className="rounded-[1.5rem] bg-[#f8f5ef] px-4 py-5 ring-1 ring-stone-100">
          <NestedDailyRings rings={ringItems} closedCount={closedRingCount} totalCount={ringItems.length} allClosed={allClosed} streakDays={snapshot.streakRecord.currentStreakDays} />
        </div>
        <div className="grid gap-2">
        {ringItems.map((ring, index) => {
            const ringStyle = getNestedDailyRingStyle(ring, index);
            return (
            <div key={ring.ringId} className="rounded-2xl bg-[#fbfcf7] px-3 py-3 ring-1 ring-stone-100">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-black text-stone-950">{ring.label}</div>
                  <div className="mt-0.5 truncate text-xs font-medium text-stone-500">{ring.description}</div>
                </div>
                <div className={classNames("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black", ring.closed ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500")}>
                  {ring.progress}/{ring.goal}
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: ringStyle.track }}>
                <div className="h-full rounded-full" style={{ width: `${ring.percent}%`, backgroundColor: ringStyle.stroke }} />
              </div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
                {getNestedDailyRingStatusLabel(ring)}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StreakSummaryCard streakRecord={snapshot.streakRecord} />
        <div className="rounded-3xl border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
            <Sparkles size={14} />
            Repertoire points
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">{formatRepertoirePoints(repertoireProgress.availablePoints)}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {repertoireProgress.lockedOpeningIds.length > 0
              ? `${formatProgressPercentage(repertoireProgress.nextUnlockProgressPct)} toward the next unlock.`
              : "All current openings are unlocked."}
          </p>
          <div className="mt-4 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-stone-600 ring-1 ring-stone-100">
            {getDailyRingSnapshotSummary(snapshot)}
          </div>
        </div>
      </div>

      <DailyRingTempoCallout className="mt-4" message={tempoCalloutMessage} />

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
          {incompleteDailyBlundr ? "Complete Daily Blundr" : "Daily Blundr complete"}
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
