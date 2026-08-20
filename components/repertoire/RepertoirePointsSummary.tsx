"use client";

import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { formatRepertoirePoints } from "@/lib/blundr/presentation/userFacingNumbers";
import styles from "./RepertoireStats.module.css";

type RepertoirePointsSummaryProps = {
  progress: RepertoireProgress;
  className?: string;
  compact?: boolean;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

export function RepertoirePointsSummary({
  progress,
  className,
  compact,
}: RepertoirePointsSummaryProps) {
  return (
    <section className={classNames(styles.panel, className)}>
      <div className={styles.header}>
        <div>
          <div className={styles.kicker}>Repertoire points</div>
          <div
            className={classNames(
              styles.title,
              compact ? styles.titleCompact : styles.titleRegular,
            )}
          >
            Build your repertoire
          </div>
        </div>
        <div className={styles.pill}>
          {progress.unlockedOpeningIds.length} unlocked
        </div>
      </div>
      <div
        className={classNames(
          styles.statGrid,
          compact ? styles.statGridCompact : styles.statGridRegular,
        )}
      >
        <Stat
          label="Available"
          value={formatRepertoirePoints(progress.availablePoints)}
          sub="ready to spend"
        />
        <Stat
          label="Lifetime"
          value={formatRepertoirePoints(progress.lifetimePoints)}
          sub="all earned"
        />
        <Stat
          label="Spent"
          value={formatRepertoirePoints(progress.spentPoints)}
          sub="on unlocks"
        />
        <Stat
          label="Unlocked"
          value={progress.unlockedOpeningIds.length}
          sub="openings ready"
        />
      </div>
    </section>
  );
}
