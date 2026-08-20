import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import styles from "./OpeningDetail.module.css";

export function OpeningHeroCard({ model }: { model: MasteryMapReadModel }) {
  const mastery = model.nodes.length
    ? Math.round((model.masteredPositions / model.nodes.length) * 100)
    : null;
  const masteryPct = mastery ?? 0;
  return (
    <header className={styles.masteryHero}>
      <div className={styles.heroMain}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Unlocked repertoire opening</p>
          <h2 className={styles.heroTitle}>
            {mastery === null ? "—" : `${mastery}%`}
          </h2>
          <p className={styles.heroMeta}>
            {model.side} · Active access · current durable mastery evidence.
          </p>
          <div
            className={styles.heroProgressTrack}
            role="presentation"
            aria-hidden="true"
          >
            <span style={{ width: `${masteryPct}%` }} />
          </div>
        </div>
        <BlundrAssetImage
          asset={BLUNDR_TEMPO_ASSETS.coach}
          alt=""
          aria-hidden="true"
          variant="tempoHero"
          className={styles.heroMascot}
        />
      </div>
      <div className={styles.heroAside}>
        <div className={styles.scoreLabel}>Access</div>
        <div className={styles.accessName}>{model.openingName}</div>
        <p className={styles.accessCopy}>Unlocked · active · ready for mastery detail.</p>
        <span className={styles.readyPill}>Ready</span>
      </div>
    </header>
  );
}
