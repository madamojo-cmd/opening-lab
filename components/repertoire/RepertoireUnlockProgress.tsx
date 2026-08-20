"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import {
  clampProgressPercentage,
  formatProgressPercentage,
  formatRepertoirePoints,
} from "@/lib/blundr/presentation/userFacingNumbers";
import styles from "./RepertoireStats.module.css";

type RepertoireUnlockProgressProps = {
  progress: RepertoireProgress;
  className?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireUnlockProgress({
  progress,
  className,
}: RepertoireUnlockProgressProps) {
  const hasLocked = progress.lockedOpeningIds.length > 0;
  const pct = clampProgressPercentage(progress.nextUnlockProgressPct);
  const displayPct = formatProgressPercentage(pct);
  const nextCost = hasLocked ? progress.nextUnlockCost : 0;
  const label = hasLocked
    ? `${formatRepertoirePoints(progress.availablePoints)} / ${formatRepertoirePoints(nextCost)} points toward the next unlock`
    : "All eligible openings are unlocked.";

  return (
    <section className={classNames(styles.panel, className)}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Next unlock</div>
          <div className={classNames(styles.title, styles.titleCompact)}>
            {label}
          </div>
        </div>
        <div className={styles.pill}>{displayPct}</div>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.progressFooter}>
        <span>
          {hasLocked
            ? "Keep training to unlock the next opening."
            : "No locked openings remain in the MVP pool."}
        </span>
        <span>
          {nextCost > 0
            ? `${formatRepertoirePoints(nextCost)} points`
            : "Ready"}
        </span>
      </div>
    </section>
  );
}
