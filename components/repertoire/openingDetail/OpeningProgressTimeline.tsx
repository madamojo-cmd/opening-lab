import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import styles from "./OpeningDetail.module.css";
export function OpeningProgressTimeline({
  model,
}: {
  model: MasteryMapReadModel;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Progress</h2>
          <p className={styles.sectionCopy}>
            Retention trends appear after enough dated attempts.
          </p>
        </div>
      </div>
      <div className={styles.timelineGrid}>
        <div className={styles.timelineItem}>
          <div className={styles.microLabel}>First-attempt accuracy</div>
          <p className={styles.timelineCopy}>
            {model.firstAttemptUnaidedAccuracy === null
              ? "not enough data"
              : `${Math.round(model.firstAttemptUnaidedAccuracy * 100)}%`}
          </p>
        </div>
        <div className={styles.timelineItem}>
          <div className={styles.microLabel}>Next due</div>
          <p className={styles.timelineCopy}>
            {model.nextDueAt ?? "No due position yet"}
          </p>
        </div>
      </div>
    </section>
  );
}
