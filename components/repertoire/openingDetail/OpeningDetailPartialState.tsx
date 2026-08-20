import styles from "./OpeningDetail.module.css";

export function OpeningDetailPartialState() {
  return (
    <section role="status" className={styles.stateCard}>
      <h2 className={styles.sectionTitle}>Partial intelligence</h2>
      <p className={styles.bodyCopy}>
        Some source data is still being processed.
      </p>
    </section>
  );
}
