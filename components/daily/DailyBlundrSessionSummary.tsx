"use client";

import { BadgeCheck, CheckCircle2, Flame, Target } from "lucide-react";
import type { DailyBlundrSessionSummaryProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

function formatProgress(completed: number, total: number): string {
  if (total <= 0) return "0 / 0";
  return `${completed} / ${total}`;
}

export function DailyBlundrSessionSummary({ cards, session, currentCard, reviewStats }: DailyBlundrSessionSummaryProps) {
  const total = cards.length;
  const completed = session?.completedCardIds.length ?? 0;
  const pending = Math.max(0, total - completed);
  const progressPct = total > 0 ? Math.max(0, Math.min(100, Math.round((completed / total) * 100))) : 0;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-green-700">Session</div>
          <h3 className="mt-1 text-lg font-black text-stone-950">
            {currentCard?.openingName ?? "Daily Blundr session"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            {currentCard ? currentCard.summary : "Blundr is lining up the next smart review."}
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
          {formatProgress(completed, total)}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
        <div className="h-full rounded-full bg-green-700" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs font-black">
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Target size={15} className="mx-auto mb-1 text-green-700" />
          {reviewStats.dueToday} due
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <CheckCircle2 size={15} className="mx-auto mb-1 text-green-700" />
          {completed} done
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <Flame size={15} className="mx-auto mb-1 text-orange-600" />
          {reviewStats.savedForReview} saved
        </div>
        <div className="rounded-2xl bg-stone-50 px-2 py-3 text-stone-700">
          <BadgeCheck size={15} className="mx-auto mb-1 text-green-700" />
          {reviewStats.mastered} mastered
        </div>
      </div>

      <p className="mt-3 text-xs font-semibold leading-5 text-stone-500">
        {pending > 0
          ? `${pending} card${pending === 1 ? "" : "s"} left in today’s session.`
          : "All session cards are complete. Blundr has moved the important mistakes into review."}
      </p>
    </section>
  );
}
