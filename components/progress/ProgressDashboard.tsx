"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, BarChart3, BookOpen, ChevronRight, Flame, RefreshCw, Settings, Sparkles, Target, Trophy } from "lucide-react";

import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { loadBlundrProgressSummary } from "@/lib/blundr/progress/progressSummaryService";
import type { BlundrProgressSummary } from "@/lib/blundr/progress/progressTypes";

type ProgressDashboardProps = {
  embedded?: boolean;
  homeHref?: string;
  settingsHref?: string;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function nowIso(): string {
  return new Date().toISOString();
}

function percentLabel(ring: BlundrProgressSummary["today"]["rings"][number]): string {
  return `${ring.percent}%`;
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
    <div className={classNames("rounded-[1.5rem] border p-4 shadow-sm", toneClasses)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] opacity-80">{label}</div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">{value}</div>
        </div>
        <div className="rounded-full bg-white p-2 ring-1 ring-stone-200">{icon}</div>
      </div>
      <p className="mt-2 text-xs leading-5 text-stone-500">{detail}</p>
    </div>
  );
}

function SectionHeader({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">{title}</div>
      <p className="mt-1 text-sm leading-6 text-stone-600">{copy}</p>
    </div>
  );
}

export function ProgressDashboard({ embedded = false, homeHref = "/", settingsHref = "/settings", className }: ProgressDashboardProps) {
  const [summary, setSummary] = useState<BlundrProgressSummary>(() =>
    loadBlundrProgressSummary({ userId: getLocalAccountCurrentUserId(), now: nowIso() }),
  );
  const [refreshCount, setRefreshCount] = useState(0);

  const visibleActions = useMemo(() => summary.nextActions.slice(0, 5), [summary.nextActions]);

  function refreshSummary() {
    setSummary(loadBlundrProgressSummary({ userId: getLocalAccountCurrentUserId(), now: nowIso() }));
    setRefreshCount((count) => count + 1);
  }

  useEffect(() => {
    refreshSummary();
    if (typeof window === "undefined") return;

    const handleRefresh = () => refreshSummary();
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={classNames("space-y-4", className)}>
      <header className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              <BarChart3 size={14} />
              Progress
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-stone-950">Training momentum</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">{summary.today.nextBestAction}</p>
          </div>
          <div className="flex items-center gap-2">
            {settingsHref ? (
              <Link href={settingsHref} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Open settings">
                <Settings size={18} />
              </Link>
            ) : null}
            <button type="button" onClick={refreshSummary} className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Refresh progress">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {summary.today.rings.map((ring) => (
            <div key={ring.ringId} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">{ring.label}</div>
                  <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">
                    {ring.progress}/{ring.goal}
                  </div>
                </div>
                <div className={classNames("rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]", ring.closed ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500")}>
                  {ring.closed ? "Closed" : percentLabel(ring)}
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-200">
                <div
                  className={classNames("h-2 rounded-full", ring.closed ? "bg-green-700" : "bg-stone-900")}
                  style={{ width: `${ring.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Today snapshot</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {summary.today.allRingsClosed
                ? "All three rings are closed. Tempo will keep the streak and reward loop alive."
                : "Keep training moving. Tempo closes the habit loop when the last ring fills."}
            </p>
          </div>
          <Link href={summary.today.allRingsClosed ? "/daily" : "/"} className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
            {summary.today.allRingsClosed ? "Open Daily Blundr" : "Continue Training"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Streak and consistency" copy="Keep the cadence gentle, steady, and repeatable." />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Current streak</div>
                <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">{summary.streak.currentDays}</div>
              </div>
              <div className="rounded-full bg-white p-2 text-green-700 ring-1 ring-stone-200">
                <Flame size={18} />
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Best streak: <span className="font-black text-stone-900">{summary.streak.bestDays}</span> days. Tempo prefers consistency over sprinting.
            </p>
            <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
              {summary.streak.daysTrainedThisWeek > 0 ? (
                <>
                  <span className="font-black text-stone-900">{summary.streak.daysTrainedThisWeek}</span> training day
                  {summary.streak.daysTrainedThisWeek === 1 ? "" : "s"} this week.
                </>
              ) : (
                "Start with one clean session and the week will begin to fill in."
              )}
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Weekly grid</div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {summary.streak.week.map((day) => (
                <div
                  key={day.localDate}
                  className={classNames(
                    "rounded-2xl px-2 py-3 text-center text-[11px] font-black uppercase tracking-[0.18em]",
                    day.allRingsClosed ? "bg-green-50 text-green-700" : day.hasTraining ? "bg-white text-stone-700 ring-1 ring-stone-200" : "bg-stone-100 text-stone-400",
                  )}
                >
                  <div>{day.label}</div>
                  <div className="mt-2 text-[10px] leading-4 normal-case tracking-normal">
                    {day.allRingsClosed ? "All rings" : day.hasTraining ? `${day.reviewCount} review${day.reviewCount === 1 ? "" : "s"}` : "Rest"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Training volume" copy="Volume is a useful signal, but Tempo only counts what matters." />
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
            tone={summary.trainingVolume.dailyBlundrToday > 0 ? "positive" : "neutral"}
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
        <SectionHeader title="Accuracy and recall" copy="Tempo only shows this when there is enough signal." />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Quality</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">{summary.accuracy.message}</p>
            {summary.accuracy.accuracyPct !== null ? (
              <div className="mt-3 text-3xl font-black tracking-tight text-stone-950">{summary.accuracy.accuracyPct}%</div>
            ) : null}
            <div className="mt-2 text-sm font-semibold text-stone-500">
              {summary.accuracy.correct} correct, {summary.accuracy.incorrect} incorrect today.
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Next unlock</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-stone-950">{summary.repertoire.nextUnlockProgressPct}%</div>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {summary.repertoire.availablePoints} points ready. {summary.repertoire.lockedOpenings} openings remain locked.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Repertoire progress" copy="Keep building points and Tempo will widen the pool." />
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
            value={`${summary.repertoire.availablePoints}`}
            detail={`${summary.repertoire.nextUnlockCost} needed next`}
            icon={<Sparkles size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Most trained"
            value={summary.repertoire.mostTrainedOpeningName ?? "None yet"}
            detail={summary.repertoire.mostTrainedOpeningId ? `Opening ID: ${summary.repertoire.mostTrainedOpeningId}` : "Train a line and Tempo will learn it."}
            icon={<Trophy size={16} className="text-green-700" />}
          />
          <ProgressStatCard
            label="Recommended"
            value={summary.repertoire.recommendedOpeningName ?? "None yet"}
            detail={summary.repertoire.recommendedOpeningId ? `Opening ID: ${summary.repertoire.recommendedOpeningId}` : "Tempo will surface a target when it has enough data."}
            icon={<Target size={16} className="text-green-700" />}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Weak areas" copy="Tempo prefers calm, specific feedback over generic shame." />
        <div className="mt-4 space-y-3">
          {summary.weakAreas.items.length > 0 && summary.weakAreas.items[0].openingId !== "none" ? (
            summary.weakAreas.items.map((item) => (
              <div key={item.openingId} className="flex items-start justify-between gap-3 rounded-[1.5rem] bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
                <div>
                  <div className="text-sm font-black text-stone-950">{item.openingName}</div>
                  <div className="mt-1 text-xs leading-5 text-stone-500">{item.misses} missed idea{item.misses === 1 ? "" : "s"}</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">Focus</div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">{summary.weakAreas.message}</div>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Achievements" copy="Small milestones keep the loop visible." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {summary.milestones.map((milestone) => (
            <div key={milestone.title} className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
              <div className="text-sm font-black text-stone-950">{milestone.title}</div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{milestone.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Recent activity" copy="A compact history of what Tempo noticed recently." />
        <div className="mt-4 space-y-3">
          {summary.recentActivity.length > 0 ? (
            summary.recentActivity.map((item) => (
              <div key={item.key} className="rounded-[1.5rem] bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-stone-950">{item.title}</div>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{item.message}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                    {item.tone ?? "neutral"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-stone-50 p-4 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
              Tempo has not recorded a recent activity yet. Finish one opening run or Daily Blundr session and this area will fill in.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <SectionHeader title="Next actions" copy="Fast paths back into the training loop." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {visibleActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm transition hover:border-green-200 hover:bg-green-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-stone-950">{action.title}</div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{action.description}</p>
                </div>
                <ChevronRight size={16} className="text-stone-400 transition group-hover:text-green-700" />
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
