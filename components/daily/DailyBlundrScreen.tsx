"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, CheckCircle2, Clock3, Flame, Sparkles, Target } from "lucide-react";
import { DailyBlundrPlayer } from "@/components/daily/DailyBlundrPlayer";
import { loadDailyBlundrOverview } from "@/lib/blundr/daily/dailyBlundrReadModel";
import { buildDailyBlundrProgressAfterCompletion, markDailyBlundrSessionStarted, saveDailyBlundrStore, upsertDailyBlundrSessionStore } from "@/lib/blundr/daily/dailyBlundrStorage";
import { isDailyBlundrSessionComplete } from "@/lib/blundr/daily/dailyBlundrSessionController";
import { summarizeDailyBlundrMastery } from "@/lib/blundr/daily/dailyBlundrMastery";
import type { DailyBlundrPlayerAttemptCommit } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";
import { writeDailyBlundrReviewAttempts, writeDailyBlundrReviewCards } from "@/lib/blundr/daily/dailyBlundrReviewStorage";

type DailyBlundrOverview = ReturnType<typeof loadDailyBlundrOverview>;

const EMPTY_STATE_COPY = "Queue clear. Tempo does not have missed moves to review yet. Train an opening and Daily BLUNDR will start building your smart review loop.";
const COMPLETION_COPY = "Daily BLUNDR complete. Tempo saved the important mistakes for future review.";

const EMPTY_REVIEW_STATS = {
  totalReviewCards: 0,
  dueToday: 0,
  overdue: 0,
  completedToday: 0,
  savedForReview: 0,
  mastered: 0,
  leech: 0,
  suspended: 0,
  readyToday: 0,
  selectedToday: 0,
};

function nowIso(): string {
  return new Date().toISOString();
}

function mergeDailyBlundrOverview(
  previous: DailyBlundrOverview,
  next: {
    session: DailyBlundrOverview["currentSession"];
    progress?: DailyBlundrOverview["store"]["progress"];
    mastery?: DailyBlundrOverview["store"]["mastery"];
    reviewCards?: readonly DailyBlundrOverview["reviewCards"][number][];
    reviewAttempts?: readonly DailyBlundrOverview["reviewAttempts"][number][];
    reviewStats?: DailyBlundrOverview["reviewStats"];
  },
): DailyBlundrOverview {
  return {
    ...previous,
    currentSession: next.session,
    reviewCards: next.reviewCards ? [...next.reviewCards] : previous.reviewCards,
    reviewAttempts: next.reviewAttempts ? [...next.reviewAttempts] : previous.reviewAttempts,
    reviewStats: next.reviewStats ?? previous.reviewStats,
    deck: {
      ...previous.deck,
      reviewCards: next.reviewCards ? [...next.reviewCards] : previous.deck.reviewCards,
      reviewAttempts: next.reviewAttempts ? [...next.reviewAttempts] : previous.deck.reviewAttempts,
      reviewStats: next.reviewStats ?? previous.deck.reviewStats,
    },
    store: {
      ...previous.store,
      sessions: upsertDailyBlundrSessionStore(previous.store.sessions, next.session),
      progress: next.progress ?? previous.store.progress,
      mastery: next.mastery ?? previous.store.mastery,
    },
  };
}

export function DailyBlundrScreen() {
  const [overview, setOverview] = useState<DailyBlundrOverview | null>(null);
  const playerSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setOverview(loadDailyBlundrOverview(5));
  }, []);

  useEffect(() => {
    if (!overview) return;
    saveDailyBlundrStore(overview.store);
    writeDailyBlundrReviewCards(overview.reviewCards);
    writeDailyBlundrReviewAttempts(overview.reviewAttempts);
  }, [overview]);

  const deck = overview?.deck.cards ?? [];
  const session = overview?.currentSession ?? null;
  const reviewStats = overview?.reviewStats ?? EMPTY_REVIEW_STATS;
  const masterySummary = summarizeDailyBlundrMastery(overview?.store.mastery ?? null);
  const hasMiniGame = deck.some((card) => card.kind === "mini_game");
  const hasTrainingTarget = deck.some((card) => card.kind === "training_target");
  const hasCards = deck.length > 0;
  const started = Boolean(session?.startedAt);
  const complete = Boolean(session && isDailyBlundrSessionComplete(session));
  const rewardClaimed = Boolean(overview && session?.rewardClaimedAt && overview.store.progress.lastRewardDateKey === overview.dateKey);
  const pendingCompletion = Boolean(complete && !rewardClaimed);
  const primaryStateLabel = !hasCards ? "Start" : rewardClaimed ? "Done" : pendingCompletion ? "Complete" : started ? "Resume" : "Start";
  const primaryActionLabel = !hasCards ? "Back to Home" : rewardClaimed ? "Daily BLUNDR complete" : pendingCompletion ? "Complete Daily BLUNDR" : started ? "Resume Daily BLUNDR" : "Start Daily BLUNDR";
  const canClaim = Boolean(pendingCompletion && session);
  const completionButtonTone = canClaim ? "bg-green-700 text-white shadow-sm" : "bg-stone-200 text-stone-500";

  function applyOverviewUpdate(next: {
    session: DailyBlundrOverview["currentSession"];
    progress?: DailyBlundrOverview["store"]["progress"];
    mastery?: DailyBlundrOverview["store"]["mastery"];
    reviewCards?: readonly DailyBlundrOverview["reviewCards"][number][];
    reviewAttempts?: readonly DailyBlundrOverview["reviewAttempts"][number][];
    reviewStats?: DailyBlundrOverview["reviewStats"];
  }) {
    setOverview((previous) => {
      if (!previous) return previous;
      return mergeDailyBlundrOverview(previous, next);
    });
  }

  function startOrResume() {
    if (!overview || !session || !hasCards || rewardClaimed) return;
    if (!started) {
      const nextSession = markDailyBlundrSessionStarted(session, nowIso());
      applyOverviewUpdate({ session: nextSession });
    }
    playerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function claimCompletion() {
    if (!overview || !session) return;
    if (!complete) return;
    if (rewardClaimed) return;
    const now = nowIso();
    const nextProgress = buildDailyBlundrProgressAfterCompletion({
      previous: overview.store.progress,
      dateKey: overview.dateKey,
      claimAt: now,
    });
    const nextSession = {
      ...session,
      rewardClaimedAt: session.rewardClaimedAt ?? now,
      completedAt: session.completedAt ?? now,
      updatedAt: now,
    };
    applyOverviewUpdate({
      session: nextSession,
      progress: nextProgress,
    });
  }

  function handlePlayerCommit(commit: DailyBlundrPlayerAttemptCommit) {
    if (!overview) return;
    applyOverviewUpdate({
      session: commit.session,
      mastery: commit.mastery,
      reviewCards: commit.reviewCards,
      reviewAttempts: commit.reviewAttempts,
      reviewStats: commit.reviewStats,
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.28em] text-green-700">Daily BLUNDR</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Daily BLUNDR</h1>
            <p className="mt-1 text-sm text-stone-500">Tempo picked today’s smartest training.</p>
          </div>
          <Link href="/" className="rounded-2xl bg-white px-3 py-3 text-sm font-black text-stone-700 shadow-sm ring-1 ring-stone-200">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Home
            </span>
          </Link>
        </header>

        <section className="mt-5 space-y-4 rounded-3xl bg-stone-900 p-4 text-white shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-300">
                <Sparkles size={14} />
                Today’s Smart Reviews
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {reviewStats.dueToday > 0
                  ? "Today’s smart reviews are built from the positions most likely to slip."
                  : hasTrainingTarget
                    ? "Queue clear. Tempo found a training target from your recent openings."
                    : hasMiniGame
                    ? "Queue clear. Tempo picked a skill game to sharpen your board vision."
                    : "Queue clear. Tempo is waiting for a fresh training seed."}
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">{primaryStateLabel}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <Target size={14} /> Due today
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.dueToday}</div>
              <div className="text-xs text-stone-400">reviews ready</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <CheckCircle2 size={14} /> Completed
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.completedToday}</div>
              <div className="text-xs text-stone-400">today</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <Flame size={14} /> Daily streak
              </div>
              <div className="mt-2 text-lg font-black">{overview?.store.progress.currentDailyStreak ?? overview?.store.progress.dailyStreak ?? 0}</div>
              <div className="text-xs text-stone-400">local completions</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <BadgeCheck size={14} /> Saved
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.savedForReview}</div>
              <div className="text-xs text-stone-400">for review</div>
            </div>
            <div className="rounded-2xl bg-white/8 p-3">
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-stone-400">
                <BadgeCheck size={14} /> Mastered
              </div>
              <div className="mt-2 text-lg font-black">{reviewStats.mastered}</div>
              <div className="text-xs text-stone-400">review cards</div>
            </div>
          </div>

          {hasCards ? (
            <button
              type="button"
              onClick={pendingCompletion ? claimCompletion : startOrResume}
              disabled={rewardClaimed}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-black ${completionButtonTone}`}
            >
              {primaryActionLabel}
            </button>
          ) : null}
        </section>

        {!hasCards ? (
          <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircle2 size={20} />
              <div className="text-sm font-black uppercase tracking-wide">Queue clear</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">{EMPTY_STATE_COPY}</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-stone-50 px-3 py-3 text-sm text-stone-500">
              <Clock3 size={16} />
              Build a few mistakes in the trainer and Daily BLUNDR will light up here.
            </div>
            <Link href="/" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 font-black text-white shadow-sm">
              Back to Home
            </Link>
          </section>
        ) : (
          <section ref={playerSectionRef} className="mt-5">
            <DailyBlundrPlayer
              cards={deck}
              session={session}
              reviewCards={overview?.reviewCards ?? []}
              reviewAttempts={overview?.reviewAttempts ?? []}
              mastery={overview?.store.mastery ?? null}
              onAttemptComplete={handlePlayerCommit}
            />
          </section>
        )}

        {session?.completedAt ? (
          <section className="mt-5 rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 size={18} />
              <div className="text-xs font-black uppercase tracking-wide">Session complete</div>
            </div>
            <h2 className="mt-2 text-lg font-black text-green-950">Tempo has all required cards.</h2>
            <p className="mt-2 text-sm leading-6 text-green-800">
              {rewardClaimed ? COMPLETION_COPY : "All required cards are done. Tap Complete Daily BLUNDR to bank the streak."}
            </p>
            <button
              type="button"
              onClick={claimCompletion}
              disabled={!canClaim}
              className={`mt-4 w-full rounded-2xl px-4 py-3 font-black ${rewardClaimed ? "bg-white text-green-800 ring-1 ring-green-200" : canClaim ? "bg-green-700 text-white shadow-sm" : "bg-stone-200 text-stone-500"}`}
            >
              Complete Daily BLUNDR
            </button>
          </section>
        ) : null}

        <section className="mt-5 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black text-stone-900">
            <BadgeCheck size={16} className="text-green-700" />
            Mastery scaffold
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Daily-local mastery keeps track of what Tempo has already seen, what still feels shaky, and what can fade out later.
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs font-black">
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Fresh {masterySummary.fresh}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Grow {masterySummary.growing}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Steady {masterySummary.steady}</div>
            <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">Mastered {masterySummary.mastered}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
