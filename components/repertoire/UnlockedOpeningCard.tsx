"use client";

import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";

type UnlockedOpeningCardProps = {
  card: RepertoireOpeningCard;
  onTrain?: () => void;
  actionLabel?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function UnlockedOpeningCard({ card, onTrain, actionLabel = "Train" }: UnlockedOpeningCardProps) {
  const sideLabel = card.side === "white" ? "White" : card.side === "black" ? "Black" : "Any side";

  return (
    <article className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-stone-950">{card.openingName}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={sideLabel === "Black" ? "inline-flex items-center rounded-full bg-stone-900 px-2 py-1 text-[11px] font-semibold text-white" : "inline-flex items-center rounded-full bg-[#f4f1e8] px-2 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200"}>
              {sideLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ebf5ef] px-2 py-1 text-[11px] font-semibold text-[#2e6b4f]">
              <CheckCircle2 size={11} />
              Ready
            </span>
          </div>
          <div className="mt-3 text-sm leading-5 text-stone-500">{card.description ?? "Ready to train"}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-stone-500">Ready to train</div>
        {onTrain ? (
          <button
            type="button"
            onClick={onTrain}
            className={classNames("inline-flex items-center gap-2 rounded-xl bg-[#2e6b4f] px-3 py-2 text-sm font-semibold text-white shadow-sm")}
          >
            <PlayCircle size={16} />
            {actionLabel}
            <ChevronRight size={14} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
