"use client";

import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import { BlundrButton, BlundrSectionHeader, BlundrStateCard } from "@/components/blundr/ui";
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

  return (
    <section className={className}>
      <BlundrSectionHeader
        eyebrow="Openings"
        title={title}
        copy="Tap Play to launch opening reps for any current opening."
        action={<BlundrButton href="/repertoire" variant="secondary" size="md" iconTrailing={<ChevronRight size={14} />}>View repertoire</BlundrButton>}
      />

      {openings.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {openings.map((opening) => (
            <article key={opening.openingId} className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-black tracking-tight text-stone-950">{opening.openingName}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={
                        opening.side === "black"
                          ? "inline-flex items-center rounded-full bg-stone-900 px-2 py-1 text-[11px] font-semibold text-white"
                          : "inline-flex items-center rounded-full bg-[#f4f1e8] px-2 py-1 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-200"
                      }
                    >
                      {opening.side === "white" ? "White" : opening.side === "black" ? "Black" : "Any side"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ebf5ef] px-2 py-1 text-[11px] font-semibold text-[#2e6b4f]">
                      <CheckCircle2 size={11} />
                      Ready
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-500">{opening.description ?? "Ready to train."}</p>
                </div>
              </div>
              <div className="mt-4">
                <BlundrButton
                  fullWidth
                  variant="primary"
                  size="md"
                  iconLeading={<PlayCircle size={16} />}
                  iconTrailing={<ChevronRight size={14} />}
                  onClick={() => onPlayOpening(opening.openingId)}
                >
                  Play
                </BlundrButton>
              </div>
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
    </section>
  );
}
