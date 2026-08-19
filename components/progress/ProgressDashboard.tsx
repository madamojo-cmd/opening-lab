"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ChevronRight,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { getLocalDateKey } from "@/lib/blundr/daily-rings/dailyRingDate";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "@/lib/blundr/persistence/persistenceKeys";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { NestedDailyRings } from "@/components/daily-rings/NestedDailyRings";
import {
  formatProgressPercentage,
  formatRepertoirePoints,
} from "@/lib/blundr/presentation/userFacingNumbers";

type ProgressDashboardProps = {
  embedded?: boolean;
  homeHref?: string;
  settingsHref?: string;
  className?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function buildPendingWeek(): BlundrProgressSummary["streak"]["week"] {
  return Array.from({ length: 7 }, (_, index) => ({
    localDate: `pending-${index}`,
    label: "—",
    hasTraining: false,
    allRingsClosed: false,
    reviewCount: 0,
  }));
}

function buildEmptySummary(): BlundrProgressSummary {
  const week = buildPendingWeek();

  return {
    userId: BLUNDR_LOCAL_DEMO_USER_ID,
    generatedAt: "Pending refresh",
    todayDateKey: "pending",
    today: {
      rings: [
        {
          ringId: "daily_tempo",
          label: "Tempo",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
        {
          ringId: "daily_battery",
          label: "Battery",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
        {
          ringId: "daily_blundr",
          label: "Blundr",
          progress: 0,
          goal: 0,
          percent: 0,
          closed: false,
        },
      ],
      allRingsClosed: false,
      nextBestAction: "Progress will load after mount.",
    },
    streak: {
      currentDays: 0,
      bestDays: 0,
      totalAllRingsClosedDays: 0,
      daysTrainedThisWeek: 0,
      week,
    },
    trainingVolume: {
      openingRunsToday: 0,
      openingRunsWeek: 0,
      batteryToday: 0,
      batteryWeek: 0,
      dailyBlundrToday: 0,
      dailyBlundrWeek: 0,
      reviewAttemptsToday: 0,
      reviewAttemptsWeek: 0,
      minigamesToday: 0,
      minigamesWeek: 0,
    },
    accuracy: {
      correct: 0,
      incorrect: 0,
      accuracyPct: null,
      enoughData: false,
      message: "Finish a few sessions and Tempo will fill in accuracy here.",
    },
    repertoire: {
      unlockedOpenings: 0,
      lockedOpenings: 0,
      availablePoints: 0,
      nextUnlockCost: 0,
      nextUnlockProgressPct: 0,
      mostTrainedOpeningId: null,
      mostTrainedOpeningName: null,
      recommendedOpeningId: null,
      recommendedOpeningName: null,
    },
    weakAreas: {
      items: [],
      message:
        "Tempo will show weak areas after there is enough training data.",
    },
    milestones: [
      {
        title: "Start here",
        message:
          "Finish an opening run and Daily Blundr session, then check back for milestone progress.",
      },
    ],
    recentActivity: [],
    nextActions: [
      {
        title: "Open Daily Blundr",
        href: "/daily",
        description: "Load today's review loop.",
      },
    ],
  };
}

function ProgressStatCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClasses =
    tone === "positive"
      ? "border-green-200 bg-green-50 text-green-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-stone-200 bg-white text-stone-700";

  return (
    <div
      className={classNames(
        "rounded-[1.5rem] border p-4 shadow-sm",
        toneClasses,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] opacity-80">
            {label}
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">
            {value}
          </div>
        </div>
        <div className="rounded-full bg-white p-2 ring-1 ring-stone-200">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">{detail}</p>
    </div>
  );
}

function SectionHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">
        {title}
      </div>
      <p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p>
    </div>
  );
}

export function ProgressDashboard({
  embedded = false,
  homeHref = "/",
  settingsHref = "/settings",
  className,
}: ProgressDashboardProps) {
  const [summary, setSummary] = useState<BlundrProgressSummary>(() =>
    buildEmptySummary(),
  );
  const [refreshCount, setRefreshCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const visibleActions = useMemo(
    () => summary.nextActions.slice(0, 5),
    [summary.nextActions],
  );
  const todayRingItems = summary.today.rings;
  const todayClosedCount = todayRingItems.filter((ring) => ring.closed).length;
  const todayRingStatus = summary.today.allRingsClosed
    ? "Complete"
    : todayClosedCount > 0
      ? "In progress"
      : "Open";

  async function refreshSummary() {
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: BlundrProgressSummary;
      }>(
        `/api/blundr/progress/summary?localDate=${encodeURIComponent(getLocalDateKey())}`,
        { cache: "no-store" },
      );
      if (!isMountedRef.current) return;
      setSummary(response.data);
      setLoadError(null);
      setRefreshCount((count) => count + 1);
    } catch {
      if (!isMountedRef.current) return;
      setLoadError(
        "Progress could not be confirmed from durable storage. Try again.",
      );
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void refreshSummary();
    if (typeof window === "undefined") return;

    const handleRefresh = () => {
      void refreshSummary();
    };
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(
        BLUNDR_DAILY_RING_REFRESH_EVENT,
        handleRefresh,
      );
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  return (
    <section className={classNames("w-full space-y-6 overflow-x-hidden", className)}>
      {!embedded ? (
        <header className="flex flex-col gap-5 rounded-[2rem] border border-stone-200/80 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(52,40,24,0.08)] backdrop-blur sm:px-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <BarChart3 size={14} />
              Progress
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Training momentum
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              {summary.today.nextBestAction}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProfileSettingsIcon />
            <button
              type="button"
              onClick={() => {
                void refreshSummary();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
              aria-label="Refresh progress"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <section className="rounded-[2rem] border border-stone-200/80 bg-white/85 px-5 py-5 shadow-[0_18px_40px_rgba(52,40,24,0.08)] backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                Today
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                Daily rings
              </h2>
            </div>
            <div
              className={classNames(
                "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
                todayRingStatus === "Complete"
                  ? "bg-green-50 text-green-700"
                  : todayRingStatus === "In progress"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-stone-100 text-stone-500",
              )}
            >
              {todayRingStatus}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
            <div>
              <NestedDailyRings
                className="w-full"
                rings={todayRingItems}
                closedCount={todayClosedCount}
                totalCount={todayRingItems.length}
                allClosed={summary.today.allRingsClosed}
                streakDays={summary.streak.currentDays}
              />
              <div className="mt-4 grid gap-2">
                {todayRingItems.map((ring) => (
                  <div
                    key={ring.ringId}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-stone-950">
                        {ring.label}
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-stone-500">
                        {ring.closed
                          ? "Complete"
                          : ring.percent > 0
                            ? "In progress"
                            : "Open"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-stone-950">
                        {ring.goal > 0
                          ? `${ring.progress}/${ring.goal}`
                          : "Loading"}
                      </div>
                      <div
                        className={classNames(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]",
                          ring.closed
                            ? "bg-green-50 text-green-700"
                            : ring.percent > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-stone-100 text-stone-500",
                        )}
                      >
                        {ring.closed
                          ? "Complete"
                          : ring.percent > 0
                            ? "In progress"
                            : "Open"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                  Next step
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {summary.today.nextBestAction}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    Ring summary
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-stone-200">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                        Closed
                      </div>
                      <div className="mt-1 text-lg font-semibold text-stone-950">
                        {todayClosedCount}/{todayRingItems.length}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-3 py-3 ring-1 ring-stone-200">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                        Streak
                      </div>
                      <div className="mt-1 text-lg font-semibold text-stone-950">
                        {summary.streak.currentDays}
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  href={summary.today.allRingsClosed ? "/daily" : "/"}
                  className="inline-flex min-h-11 items-center justify-between gap-2 rounded-[1.5rem] bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
                >
                  {summary.today.allRingsClosed
                    ? "Open Daily Blundr"
                    : "Continue Training"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <ProgressStatCard
            label="Current streak"
            value={`${summary.streak.currentDays}`}
            detail={`${summary.streak.daysTrainedThisWeek} training day${summary.streak.daysTrainedThisWeek === 1 ? "" : "s"} this week`}
            icon={<Flame size={16} className="text-green-700" />}
            tone="positive"
          />
          <ProgressStatCard
            label="Best streak"
            value={`${summary.streak.bestDays}`}
            detail="Longest verified cadence"
            icon={<Trophy size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="All-rings days"
            value={`${summary.streak.totalAllRingsClosedDays}`}
            detail="Total clean Daily completions"
            icon={<Sparkles size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Training days"
            value={`${summary.streak.daysTrainedThisWeek}`}
            detail="Distinct days with training this week"
            icon={<Target size={16} className="text-green-700" />}
            tone={
              summary.streak.daysTrainedThisWeek > 0 ? "positive" : "neutral"
            }
          />
        </aside>
      </div>

      {loadError ? (
        <div
          role="status"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950"
        >
          {loadError}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Streak and consistency"
          copy="Keep the cadence gentle, steady, and repeatable."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Current streak
                </div>
                <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">
                  {summary.streak.currentDays}
                </div>
              </div>
              <div className="rounded-full bg-white p-2 text-green-700 ring-1 ring-stone-200">
                <Flame size={18} />
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Best streak:{" "}
              <span className="font-black text-stone-900">
                {summary.streak.bestDays}
              </span>{" "}
              days. Tempo prefers consistency over sprinting.
            </p>
            <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
              {summary.streak.daysTrainedThisWeek > 0 ? (
                <>
                  <span className="font-black text-stone-900">
                    {summary.streak.daysTrainedThisWeek}
                  </span>{" "}
                  training day
                  {summary.streak.daysTrainedThisWeek === 1 ? "" : "s"} this
                  week.
                </>
              ) : (
                "Start with one clean session and the week will begin to fill in."
              )}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Weekly grid
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {summary.streak.week.map((day) => (
                <div
                  key={day.localDate}
                  className={classNames(
                    "rounded-2xl px-2 py-3 text-center text-[11px] font-black uppercase tracking-[0.18em]",
                    day.allRingsClosed
                      ? "bg-green-50 text-green-700"
                      : day.hasTraining
                        ? "bg-white text-stone-700 ring-1 ring-stone-200"
                        : "bg-stone-100 text-stone-400",
                  )}
                >
                  <div>{day.label}</div>
                  <div className="mt-2 text-[10px] leading-4 normal-case tracking-normal">
                    {day.allRingsClosed
                      ? "All rings"
                      : day.hasTraining
                        ? `${day.reviewCount} review${day.reviewCount === 1 ? "" : "s"}`
                        : "Rest"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Training volume"
          copy="Volume is a useful signal, but Tempo only counts what matters."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ProgressStatCard
            label="Opening runs"
            value={`${summary.trainingVolume.openingRunsToday}`}
            detail={`${summary.trainingVolume.openingRunsWeek} this week`}
            icon={<BookOpen size={16} className="text-green-700" />}
            tone="positive"
          />
          <ProgressStatCard
            label="Battery sessions"
            value={`${summary.trainingVolume.batteryToday}`}
            detail={`${summary.trainingVolume.batteryWeek} this week`}
            icon={<Target size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Daily Blundr"
            value={`${summary.trainingVolume.dailyBlundrToday}`}
            detail={`${summary.trainingVolume.dailyBlundrWeek} this week`}
            icon={<Sparkles size={16} className="text-green-700" />}
            tone={
              summary.trainingVolume.dailyBlundrToday > 0
                ? "positive"
                : "neutral"
            }
          />
          <ProgressStatCard
            label="Minigames"
            value={`${summary.trainingVolume.minigamesToday}`}
            detail={`${summary.trainingVolume.minigamesWeek} this week`}
            icon={<Trophy size={16} className="text-green-700" />}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Accuracy and recall"
          copy="Tempo only shows this when there is enough signal."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Quality
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {summary.accuracy.message}
            </p>
            {summary.accuracy.accuracyPct !== null ? (
              <div className="mt-3 text-3xl font-black tracking-tight text-stone-950">
                {summary.accuracy.accuracyPct}%
              </div>
            ) : null}
            <div className="mt-2 text-sm font-semibold text-stone-500">
              {summary.accuracy.correct} correct, {summary.accuracy.incorrect}{" "}
              incorrect today.
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              Next unlock
            </div>
            <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">
              {formatProgressPercentage(
                summary.repertoire.nextUnlockProgressPct,
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {formatRepertoirePoints(summary.repertoire.availablePoints)}{" "}
              points ready. {summary.repertoire.lockedOpenings} openings remain
              locked.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Repertoire progress"
          copy="Keep building points and Tempo will widen the pool."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ProgressStatCard
            label="Unlocked openings"
            value={`${summary.repertoire.unlockedOpenings}`}
            detail={`${summary.repertoire.lockedOpenings} still locked`}
            icon={<BookOpen size={16} className="text-green-700" />}
            tone="positive"
          />
          <ProgressStatCard
            label="Repertoire points"
            value={formatRepertoirePoints(summary.repertoire.availablePoints)}
            detail={`${formatRepertoirePoints(summary.repertoire.nextUnlockCost)} needed next`}
            icon={<Sparkles size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Most trained"
            value={summary.repertoire.mostTrainedOpeningName ?? "None yet"}
            detail={
              summary.repertoire.mostTrainedOpeningId
                ? `Opening ID: ${summary.repertoire.mostTrainedOpeningId}`
                : "Train a line and Tempo will learn it."
            }
            icon={<Trophy size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Recommended"
            value={summary.repertoire.recommendedOpeningName ?? "None yet"}
            detail={
              summary.repertoire.recommendedOpeningId
                ? `Opening ID: ${summary.repertoire.recommendedOpeningId}`
                : "Tempo will surface a target when it has enough data."
            }
            icon={<Target size={16} className="text-green-700" />}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Weak areas"
          copy="Tempo prefers calm, specific feedback over generic shame."
        />
        <div className="mt-4 space-y-3">
          {summary.weakAreas.items.length > 0 &&
          summary.weakAreas.items[0].openingId !== "none" ? (
            summary.weakAreas.items.map((item) => (
              <div
                key={item.openingId}
                className="flex items-start justify-between gap-3 rounded-[1.5rem] bg-stone-50 px-4 py-3 ring-1 ring-stone-200"
              >
                <div>
                  <div className="text-sm font-black text-stone-950">
                    {item.openingName}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-stone-500">
                    {item.misses} missed idea{item.misses === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                  Focus
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
              {summary.weakAreas.message}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Achievements"
          copy="Small milestones keep the loop visible."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.milestones.map((milestone) => (
            <div
              key={milestone.title}
              className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200"
            >
              <div className="text-sm font-black text-stone-950">
                {milestone.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {milestone.message}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Recent activity"
          copy="A compact history of what Tempo noticed recently."
        />
        <div className="mt-4 space-y-3">
          {summary.recentActivity.length > 0 ? (
            summary.recentActivity.map((item) => (
              <div
                key={item.key}
                className="rounded-[1.5rem] bg-stone-50 px-4 py-3 ring-1 ring-stone-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-stone-950">
                      {item.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-stone-600">
                      {item.message}
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                    {item.tone ?? "neutral"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
              Tempo has not recorded a recent activity yet. Finish one opening
              run or Daily Blundr session and this area will fill in.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader
          title="Next actions"
          copy="Fast paths back into the training loop."
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {visibleActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm transition hover:border-green-200 hover:bg-green-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-stone-950">
                    {action.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {action.description}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-400 transition group-hover:text-green-700"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-xs font-semibold text-stone-500 shadow-sm">
        <span>Last refreshed: {summary.generatedAt}</span>
        <span>Refreshes this session: {refreshCount}</span>
      </div>
    </section>
  );
}
