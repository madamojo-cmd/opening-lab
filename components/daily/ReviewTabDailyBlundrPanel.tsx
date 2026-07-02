"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronRight, Sparkles } from "lucide-react";
import { loadDailyBlundrOverview } from "@/lib/blundr/daily/dailyBlundrReadModel";

function resolvePrimaryLabel(hasCards: boolean, started: boolean, pendingCompletion: boolean): string {
  if (!hasCards) return "Start";
  if (pendingCompletion) return "Complete";
  if (started) return "Resume";
  return "Start";
}

export function ReviewTabDailyBlundrPanel() {
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
  const dailyStreak = overview?.store.progress.currentDailyStreak ?? overview?.store.progress.dailyStreak ?? 0;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-green-700">
            <Sparkles size={14} />
            Daily BLUNDR
          </div>
          <h2 className="mt-3 text-lg font-black tracking-tight text-stone-950">Tempo picked today’s smartest training.</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">Today’s smart reviews are built from the positions most likely to slip.</p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">{primaryLabel}</div>
      </div>

      <div className="mt-4 rounded-2xl bg-stone-50 p-3">
        <div className="flex items-center gap-2 text-sm font-black text-stone-900">
          <BadgeCheck size={16} className="text-green-700" />
          Review
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-600">Daily BLUNDR sits on top of Review, while the existing mistake queue stays unchanged below.</p>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-900">
          <span>{hasCards ? `${deck.length} recall cards ready` : "Queue clear for today"}</span>
        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide">
          {primaryLabel}
          <ChevronRight size={14} />
        </span>
      </div>

      <div className="mt-3 rounded-2xl bg-stone-50 px-3 py-3 text-sm leading-6 text-stone-600">
        Later: mastery, weak spots, mini-game mastery, training-game mastery.
      </div>

      <div className="mt-3 rounded-2xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-900">
        Daily streak {dailyStreak}
      </div>

      <Link href="/daily" className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm">
        <span>{hasCards ? `${primaryLabel} Daily BLUNDR` : "Open Daily BLUNDR"}</span>
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
