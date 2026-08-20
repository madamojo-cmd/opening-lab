import styles from "./OpeningDetail.module.css";

export function OpeningDetailStaleState() {
  return (
    <section role="status" className={styles.stateCard}>
      <h2 className={styles.sectionTitle}>Snapshot is stale</h2>
      <p className={styles.bodyCopy}>
        Some connected-game data needs a refresh.
      </p>
    </section>
  );
}
