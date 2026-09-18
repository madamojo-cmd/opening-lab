import styles from "./OpeningDetail.module.css";

export function OpeningGameIntelligence({
  matchedGameCount,
  freshness,
}: {
  matchedGameCount: number;
  freshness: string;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Real-game intelligence</h2>
        </div>
      </div>
      <div className={styles.intelligenceBody}>
        <p className={styles.bodyCopy}>
          {matchedGameCount
            ? `${matchedGameCount} matched game segments. Freshness: ${freshness}.`
            : "No imported games match this opening yet."}
        </p>
      </div>
    </section>
  );
}
