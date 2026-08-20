"use client";

import Link from "next/link";
import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import { OpeningHeroCard } from "./OpeningHeroCard";
import { OpeningIntelligenceStrip } from "./OpeningIntelligenceStrip";
import { OpeningMasteryMap } from "./OpeningMasteryMap";
import { OpeningGameIntelligence } from "./OpeningGameIntelligence";
import { WeakBranchCards } from "./WeakBranchCards";
import { OpeningProgressTimeline } from "./OpeningProgressTimeline";
import { OpeningDetailEmptyState } from "./OpeningDetailEmptyState";
import { OpeningDetailStaleState } from "./OpeningDetailStaleState";
import { OpeningDetailPartialState } from "./OpeningDetailPartialState";
import { OpeningDetailErrorState } from "./OpeningDetailErrorState";
import styles from "./OpeningDetail.module.css";

export function OpeningDetailPage({ model }: { model: MasteryMapReadModel }) {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.pageHeader}>
          <div>
            <p className={styles.pageKicker}>
              Repertoire · Opening intelligence
            </p>
            <h1 className={styles.pageTitle} aria-label={model.openingName}>
              {model.openingName} <span aria-hidden="true">mastery.</span>
            </h1>
            <p className={styles.pageCopy}>
              Access, intelligence values, Mastery Map, weak branches,
              connected-game intelligence and progress stay backed by the live
              opening model.
            </p>
          </div>
          <div className={styles.pageActions}>
            <Link href="/repertoire" className={styles.headerButton}>
              ← Repertoire
            </Link>
            <Link href="/daily" className={styles.headerButton}>
              Practice today&apos;s weaknesses
            </Link>
            <Link
              href={`/train?openingId=${encodeURIComponent(model.openingId)}`}
              className={styles.headerPrimary}
            >
              Train opening →
            </Link>
          </div>
        </header>
        <OpeningHeroCard model={model} />
        <OpeningIntelligenceStrip model={model} />
        {model.state === "empty" ? <OpeningDetailEmptyState /> : null}
        {model.state === "stale" ? <OpeningDetailStaleState /> : null}
        {model.state === "partial" ? <OpeningDetailPartialState /> : null}
        {model.state === "error" ? <OpeningDetailErrorState /> : null}
        {model.state === "ready" ? (
          <>
            <OpeningMasteryMap nodes={model.nodes} />
            <WeakBranchCards
              openingId={model.openingId}
              branches={model.weakBranches}
            />
            <OpeningGameIntelligence
              matchedGameCount={model.importedGameMatchCount}
              freshness={model.state}
            />
            <OpeningProgressTimeline model={model} />
          </>
        ) : null}
      </div>
    </main>
  );
}
