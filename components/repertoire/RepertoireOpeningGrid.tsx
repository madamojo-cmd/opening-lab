"use client";

import type { ReactNode } from "react";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { getLockedOpeningCards, getUnlockedOpeningCards } from "@/lib/blundr/repertoire/repertoireUnlockService";
import { LockedOpeningCard } from "./LockedOpeningCard";
import { UnlockedOpeningCard } from "./UnlockedOpeningCard";

type RepertoireOpeningGridProps = {
  progress: RepertoireProgress;
  onUnlock?: (openingId: string) => void;
  onTrainOpening?: (openingId: string) => void;
  unlockingOpeningId?: string | null;
  className?: string;
  emptyLockedState?: ReactNode;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireOpeningGrid({
  progress,
  onUnlock,
  onTrainOpening,
  unlockingOpeningId,
  className,
  emptyLockedState,
}: RepertoireOpeningGridProps) {
  const unlockedCards = getUnlockedOpeningCards(progress);
  const lockedCards = getLockedOpeningCards(progress);

  return (
    <section className={classNames("space-y-4", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Unlocked</div>
            <div className="mt-1 text-lg font-black tracking-tight text-stone-950">{unlockedCards.length} openings ready to train</div>
          </div>
        </div>
        <div className="grid gap-3">
          {unlockedCards.map((card) => (
            <UnlockedOpeningCard
              key={card.openingId}
              card={card}
              onTrain={onTrainOpening ? () => onTrainOpening(card.openingId) : undefined}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Locked</div>
            <div className="mt-1 text-lg font-black tracking-tight text-stone-950">{lockedCards.length} openings waiting</div>
          </div>
          <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">Tempo will open them in order</div>
        </div>
        {lockedCards.length > 0 ? (
          <div className="grid gap-3">
            {lockedCards.map((card) => (
              <LockedOpeningCard
                key={card.openingId}
                card={card}
                unlocking={unlockingOpeningId === card.openingId}
                onUnlock={onUnlock ? () => onUnlock(card.openingId) : undefined}
              />
            ))}
          </div>
        ) : (
          emptyLockedState ?? (
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600 shadow-sm">
              All eligible MVP openings are unlocked. Tempo will keep widening the pool as you keep training.
            </div>
          )
        )}
      </div>
    </section>
  );
}
