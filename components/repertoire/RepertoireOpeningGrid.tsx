"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import {
  getLockedOpeningCards,
  getUnlockedOpeningCards,
} from "@/lib/blundr/repertoire/repertoireUnlockService";
import { LockedOpeningCard } from "./LockedOpeningCard";
import { UnlockedOpeningCard } from "./UnlockedOpeningCard";
import styles from "./RepertoireOpeningGrid.module.css";

type RepertoireOpeningGridProps = {
  progress: RepertoireProgress;
  onUnlock?: (openingId: string) => void;
  onTrainOpening?: (openingId: string) => void;
  unlockingOpeningId?: string | null;
  className?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireOpeningGrid({
  progress,
  onUnlock,
  onTrainOpening,
  unlockingOpeningId,
  className,
}: RepertoireOpeningGridProps) {
  const unlockedCards = getUnlockedOpeningCards(progress);
  const lockedCards = getLockedOpeningCards(progress);
  const inventoryCards = [
    ...unlockedCards.map((card) => ({ card, locked: false as const })),
    ...lockedCards.map((card) => ({ card, locked: true as const })),
  ];

  return (
    <section className={classNames(styles.section, className)}>
      {inventoryCards.length > 0 ? (
        <>
          <div className={styles.inventoryBar}>
            <div className={styles.inventoryCopy}>
              <div className={styles.kicker}>Current inventory</div>
              <div className={styles.title}>
                {unlockedCards.length} ready · {lockedCards.length} locked
              </div>
            </div>
            <div className={styles.orderPill}>Tempo keeps unlock order</div>
          </div>
          <div className={styles.repGrid}>
            {inventoryCards.map(({ card, locked }) =>
              locked ? (
                <LockedOpeningCard
                  key={card.openingId}
                  card={card}
                  unlocking={unlockingOpeningId === card.openingId}
                  onUnlock={
                    onUnlock ? () => onUnlock(card.openingId) : undefined
                  }
                />
              ) : (
                <UnlockedOpeningCard
                  key={card.openingId}
                  card={card}
                  onTrain={
                    onTrainOpening
                      ? () => onTrainOpening(card.openingId)
                      : undefined
                  }
                />
              ),
            )}
          </div>
        </>
      ) : (
        <div className={styles.emptyCard}>
          All eligible MVP openings are unlocked. Tempo will keep widening the
          pool as you keep training.
        </div>
      )}
    </section>
  );
}
