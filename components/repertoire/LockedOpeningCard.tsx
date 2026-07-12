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

export function LockedOpeningCard({
  card,
  onUnlock,
  unlocking = false,
}: LockedOpeningCardProps) {
  const canUnlockNow = Boolean(onUnlock && !unlocking);
  const statusCopy = card.reason ?? "Choose how to unlock this opening.";
  const sideLabel = card.side === "white" ? "White" : card.side === "black" ? "Black" : "Any side";

  return (
    <article className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-stone-700">{card.openingName}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={sideLabel === "Black" ? "inline-flex items-center rounded-full bg-stone-900 px-2 py-1 text-[11px] font-semibold text-white" : "inline-flex items-center rounded-full bg-[#f4f1e8] px-2 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200"}>
              {sideLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-500">
              <Lock size={11} />
              Locked
            </span>
          </div>
          <div className="mt-3 text-sm leading-5 text-stone-500">{card.description ?? statusCopy}</div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold text-[#b8923a]">{card.pointsCost} points to unlock</div>
        </div>

        <div className="grid gap-2">
          {onUnlock ? (
            <button
              type="button"
              onClick={onUnlock}
              disabled={!canUnlockNow}
              className={classNames(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition",
                canUnlockNow ? "bg-[#b8923a] text-white" : "cursor-not-allowed bg-stone-100 text-stone-400",
              )}
            >
              {unlocking ? "Unlocking..." : "Unlock"}
              <ChevronRight size={14} />
            </button>
          ) : null}

          {!onUnlock ? (
            <div className="rounded-full bg-stone-100 px-3 py-2 text-xs font-black text-stone-500">{statusCopy}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
