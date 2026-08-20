"use client";

import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { BlundrStateCard } from "@/components/blundr/ui";
import { getUnlockedOpeningCards } from "@/lib/blundr/repertoire/repertoireUnlockService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";

type HomeCurrentOpeningsCardProps = {
  progress: RepertoireProgress;
  onPlayOpening: (openingId: string) => void;
  className?: string;
};

export function HomeCurrentOpeningsCard({ progress, onPlayOpening, className }: HomeCurrentOpeningsCardProps) {
  const openings = getUnlockedOpeningCards(progress);
  const title = openings.length === 1 ? "Current Opening" : "Current Openings";
  const primaryOpening = openings[0] ?? null;

  return (
    <section
      className={[
        "rounded-[20px] border border-stone-200/80 bg-white/90 p-4 shadow-[0_10px_24px_rgba(16,20,17,0.06)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
            Openings
          </p>
          <h2 className="mt-1.5 text-[15px] font-black tracking-[-0.03em] text-stone-950">
            {title}
          </h2>
        </div>
        <Link
          href="/repertoire"
          className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 text-[11px] font-black text-stone-800 shadow-sm"
        >
          View repertoire
          <ChevronRight size={14} />
        </Link>
      </div>

      {openings.length > 0 ? (
        <div className="divide-y divide-stone-200">
          {openings.map((opening) => (
            <article
              key={opening.openingId}
              className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 py-3.5"
            >
              <div
                className={
                  opening.side === "black"
                    ? "grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-stone-950 text-white"
                    : "grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#f8f8f5] text-stone-950 ring-1 ring-stone-200"
                }
                aria-hidden="true"
              >
                {opening.side === "black" ? "♟" : "♙"}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[13px] font-black tracking-[-0.02em] text-stone-950">
                  {opening.openingName}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-stone-600">
                  <span>{opening.side === "black" ? "Black" : "White"}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-green-700">
                    <CheckCircle2 size={11} />
                    Ready
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onPlayOpening(opening.openingId)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-green-800 px-3.5 text-[11px] font-black text-white shadow-sm"
              >
                <PlayCircle size={15} />
                Train
              </button>
            </article>
          ))}
        </div>
      ) : (
        <BlundrStateCard
          className="mt-4"
          kind="empty"
          eyebrow="No openings ready"
          title="Unlock an opening first."
          copy="Repertoire points will add more training options."
          cta={{ label: "Open repertoire", href: "/repertoire" }}
        />
      )}

      {primaryOpening ? (
        <div className="mt-4 rounded-[16px] border border-green-900/10 bg-[#eef7f1] px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
                Next action
              </span>
              <p className="mt-2 text-sm font-black text-stone-950">
                Continue {primaryOpening.openingName}.
              </p>
              <p className="mt-1 text-[11px] leading-[1.45] text-stone-600">
                Open the first ready line from Home or go to the full repertoire.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPlayOpening(primaryOpening.openingId)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[13px] bg-green-800 px-4 text-sm font-black text-white shadow-sm"
            >
              Train now
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
