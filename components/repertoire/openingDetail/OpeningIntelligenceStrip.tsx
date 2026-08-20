import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import styles from "./OpeningDetail.module.css";
export function OpeningIntelligenceStrip({
  model,
}: {
  model: MasteryMapReadModel;
}) {
  const values = [
    ["Mastered", model.masteredPositions],
    ["Learning", model.learningPositions],
    ["Weak", model.weakPositions],
    ["Unseen", model.unseenPositions],
    ["Imported games", model.importedGameMatchCount],
    [
      "Unaided accuracy",
      model.firstAttemptUnaidedAccuracy === null
        ? "—"
        : `${Math.round(model.firstAttemptUnaidedAccuracy * 100)}%`,
    ],
  ] as const;
  return (
    <section aria-label="Opening intelligence" className={styles.metricsGrid}>
      {values.map(([label, value]) => (
        <div key={label} className={styles.metricCard}>
          <p className={styles.metricLabel}>{label}</p>
          <p className={styles.metricValue}>{value}</p>
        </div>
      ))}
    </section>
  );
}
