"use client";

import { BadgeCheck, Eye, Sparkles } from "lucide-react";
import type { DailyBlundrSupportControlsProps } from "@/lib/blundr/daily/dailyBlundrPlayerTypes";

export function DailyBlundrSupportControls({
  usedReveal,
  answerShown,
  revealedAt,
  disabled,
  onReveal,
  onShowAnswer,
  onMarkReviewed,
}: DailyBlundrSupportControlsProps) {
  return (
    <div className="space-y-3 rounded-3xl bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Support</div>
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400">
          {usedReveal ? "Reveal used" : answerShown ? "Answer shown" : "No reveal yet"}
        </div>
      </div>
      {revealedAt ? <p className="text-xs font-semibold text-stone-500">Revealed at {new Date(revealedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.</p> : null}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onReveal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-green-700 ring-1 ring-green-200 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles size={15} />
          Reveal
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onShowAnswer}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eye size={15} />
          Show answer
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onMarkReviewed}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-700 px-3 py-3 text-sm font-black text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BadgeCheck size={15} />
          Mark reviewed
        </button>
      </div>
    </div>
  );
}
