"use client";

import { CheckCircle2, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { RepertoireOpeningCard } from "@/lib/blundr/repertoire/repertoireTypes";
import styles from "./RepertoireCards.module.css";

type UnlockedOpeningCardProps = {
  card: RepertoireOpeningCard;
  onTrain?: () => void;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function UnlockedOpeningCard({
  card,
  onTrain,
}: UnlockedOpeningCardProps) {
  return (
    <article className={classNames(styles.card, styles.unlocked)}>
      <div className={styles.cardTop}>
        <div className={styles.cardText}>
          <div className={styles.badge}>
            <CheckCircle2 size={12} />
            Unlocked
          </div>
          <Link
            href={`/repertoire/${encodeURIComponent(card.openingId)}`}
            className={styles.titleLink}
          >
            {card.openingName}
          </Link>
          <div className={styles.description}>
            {card.description ?? "Ready to train"}
          </div>
        </div>
        <div className={styles.sidePill}>{card.side}</div>
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.meta}>Ready to train</div>
        {onTrain ? (
          <button type="button" onClick={onTrain} className={styles.button}>
            <PlayCircle size={16} />
            Train
            <ChevronRight size={14} />
          </button>
        ) : null}
      </div>
    </article>
  );
}
