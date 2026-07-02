"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Sparkles, Target, Flame, CheckCircle2 } from "lucide-react";
import { loadDailyBlundrOverview } from "@/lib/blundr/daily/dailyBlundrReadModel";

function resolvePrimaryLabel(hasCards: boolean, started: boolean, pendingCompletion: boolean): string {
  if (!hasCards) return "Start";
  if (pendingCompletion) return "Complete";
  if (started) return "Resume";
  return "Start";
}

export function TempoDailyBlundrCard() {
  const [overview, setOverview] = useState<ReturnType<typeof loadDailyBlundrOverview> | null>(null);

  useEffect(() => {
    setOverview(loadDailyBlundrOverview(5));
  }, []);

  const deck = overview?.deck.cards ?? [];
  const session = overview?.currentSession ?? null;
  const hasCards = deck.length > 0;
  const started = Boolean(session?.startedAt);
  const complete = Boolean(session && deck.length > 0 && session.completedCardIds.length >= deck.length);
  const rewardClaimed = Boolean(overview && session?.rewardClaimedAt && overview.store.progress.lastRewardDateKey === overview.dateKey);
  const pendingCompletion = Boolean(complete && !rewardClaimed);
  const primaryLabel = resolvePrimaryLabel(hasCards, started, pendingCompletion);
  const cardCount = deck.length;
  const doneCount = session?.completedCardIds.length ?? 0;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
            <Sparkles size={14} />
            Daily BLUNDR
          </div>
          <h2 className="mt-3 text-lg font-black text-stone-950">Tempo picked today’s smartest training.</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">A small local recall deck built from the positions most likely to slip.</p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{primaryLabel}</div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Target size={15} className="mx-auto mb-1 text-green-700" />
          {cardCount} cards
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Flame size={15} className="mx-auto mb-1 text-orange-600" />
          {overview?.store.progress.currentDailyStreak ?? overview?.store.progress.dailyStreak ?? 0} streak
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <CheckCircle2 size={15} className="mx-auto mb-1 text-green-700" />
          {doneCount}/{cardCount || 0}
        </div>
      </div>

      <Link href="/daily" className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm">
        <span>{primaryLabel}</span>
        <ChevronRight size={18} />
      </Link>

      {!hasCards ? <p className="mt-3 text-xs leading-5 text-stone-400">Queue clear for now. Train an opening and Tempo will start building today’s recall deck.</p> : null}
    </section>
  );
}
