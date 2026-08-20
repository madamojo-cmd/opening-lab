import styles from "./OpeningDetail.module.css";

export function OpeningDetailErrorState() {
  return (
    <section role="alert" className={styles.stateCard}>
      <h2 className={styles.sectionTitle}>Opening detail unavailable</h2>
      <p className={styles.bodyCopy}>Try again later.</p>
    </section>
  );
}
