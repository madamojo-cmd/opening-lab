"use client";

import { Lock, ChevronRight } from "lucide-react";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";

type LockedOpeningCardProps = {
  card: RepertoireOpeningCard;
  onUnlock?: () => void;
  unlocking?: boolean;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function LockedOpeningCard({ card, onUnlock, unlocking = false }: LockedOpeningCardProps) {
  const canUnlockNow = Boolean(onUnlock && (card.availablePoints ?? 0) >= card.pointsCost && !unlocking);
  const statusCopy = canUnlockNow ? "Unlock now" : card.reason ?? "Keep training to unlock this opening.";

  return (
    <article className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">
            <Lock size={12} />
            Locked
          </div>
          <h3 className="mt-3 text-base font-black tracking-tight text-stone-950">{card.openingName}</h3>
          <div className="mt-1 text-sm font-semibold text-stone-500">{card.description ?? statusCopy}</div>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">{card.side}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-stone-500">{card.pointsCost} points to unlock</div>
        {onUnlock ? (
          <button
            type="button"
            onClick={onUnlock}
            disabled={!canUnlockNow}
            className={classNames(
              "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black shadow-sm transition",
              canUnlockNow ? "bg-green-700 text-white" : "cursor-not-allowed bg-stone-100 text-stone-400",
            )}
          >
            {unlocking ? "Unlocking..." : "Unlock"}
            <ChevronRight size={14} />
          </button>
        ) : (
          <div className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-500">{statusCopy}</div>
        )}
      </div>
    </article>
  );
}
