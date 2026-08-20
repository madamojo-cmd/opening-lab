"use client";

import { Lock, ChevronRight } from "lucide-react";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";
import styles from "./RepertoireCards.module.css";

type LockedOpeningCardProps = {
  card: RepertoireOpeningCard;
  onUnlock?: () => void;
  unlocking?: boolean;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function LockedOpeningCard({
  card,
  onUnlock,
  unlocking = false,
}: LockedOpeningCardProps) {
  const canUnlockNow = Boolean(
    onUnlock && (card.availablePoints ?? 0) >= card.pointsCost && !unlocking,
  );
  const statusCopy = canUnlockNow
    ? "Unlock now"
    : (card.reason ?? "Keep training to unlock this opening.");

  return (
    <article className={classNames(styles.card, styles.locked)}>
      <div className={styles.cardTop}>
        <div className={styles.cardText}>
          <div className={classNames(styles.badge, styles.badgeLocked)}>
            <Lock size={12} />
            Locked
          </div>
          <h3 className={styles.title}>{card.openingName}</h3>
          <div className={styles.description}>
            {card.description ?? statusCopy}
          </div>
        </div>
        <div className={styles.sidePill}>{card.side}</div>
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.meta}>{card.pointsCost} points to unlock</div>
        {onUnlock ? (
          <button
            type="button"
            onClick={onUnlock}
            disabled={!canUnlockNow}
            className={classNames(
              styles.button,
              canUnlockNow ? undefined : styles.buttonDisabled,
            )}
          >
            {unlocking ? "Unlocking..." : "Unlock"}
            <ChevronRight size={14} />
          </button>
        ) : (
          <div className={styles.secondaryPill}>{statusCopy}</div>
        )}
      </div>
    </article>
  );
}
