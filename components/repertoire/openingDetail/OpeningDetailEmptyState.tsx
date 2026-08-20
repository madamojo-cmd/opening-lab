import styles from "./OpeningDetail.module.css";

export function OpeningDetailEmptyState() {
  return (
    <section className={styles.stateCard}>
      <h2 className={styles.sectionTitle}>No mastery evidence yet</h2>
      <p className={styles.bodyCopy}>Train this opening to begin the map.</p>
    </section>
  );
}
