"use client";

import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";

type UnlockedOpeningCardProps = {
  card: RepertoireOpeningCard;
  onTrain?: () => void;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function UnlockedOpeningCard({ card, onTrain }: UnlockedOpeningCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-green-200 bg-green-50/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-green-700">
            <CheckCircle2 size={12} />
            Unlocked
          </div>
          <Link href={`/repertoire/${encodeURIComponent(card.openingId)}`} className="mt-3 block text-base font-black tracking-tight text-stone-950 underline-offset-4 hover:underline">{card.openingName}</Link>
          <div className="mt-1 text-sm font-semibold text-stone-600">{card.description ?? "Ready to train"}</div>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600">{card.side}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-stone-500">Ready to train</div>
        {onTrain ? (
          <button
            type="button"
            onClick={onTrain}
            className={classNames("inline-flex items-center gap-2 rounded-full bg-green-700 px-3 py-2 text-sm font-black text-white shadow-sm")}
          >
            <PlayCircle size={16} />
            Train
            <ChevronRight size={14} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
