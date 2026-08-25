"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, RefreshCw, Settings } from "lucide-react";
import {
  BLUNDR_EMPTY_STATE_ASSETS,
} from "@/lib/blundr/assets/blundrAssetManifest";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { getStarterPackById } from "@/lib/blundr/onboarding/starterPacks";
import { RepertoireOpeningGrid } from "./RepertoireOpeningGrid";
import { RepertoireTempoCallout } from "./RepertoireTempoCallout";
import { RewardHistoryList } from "@/components/rewards/RewardHistoryList";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import { useDurableRepertoireProgress } from "./useDurableRepertoireProgress";
import styles from "./RepertoireProgressPanel.module.css";

type RepertoireProgressPanelProps = {
  onTrainOpening?: (openingId: string) => void;
  homeHref?: string;
  className?: string;
  embedded?: boolean;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireProgressPanel({
  onTrainOpening,
  homeHref = "/",
  className,
  embedded = false,
}: RepertoireProgressPanelProps) {
  const [repertoireState, refreshRepertoire] = useDurableRepertoireProgress();
  const progress =
    repertoireState.status === "ready" ? repertoireState.progress : null;
  const userId = progress?.userId ?? null;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockingOpeningId, setUnlockingOpeningId] = useState<string | null>(
    null,
  );

  const starterPack = useMemo(
    () =>
      progress ? getStarterPackById(progress.selectedStarterPackId) : null,
    [progress],
  );
  const unlockedCount = progress?.unlockedOpeningIds.length ?? 0;
  const lockedCount = progress?.lockedOpeningIds.length ?? 0;

  useEffect(() => {
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_PAGE_VIEWED, {
      userId: userId ?? "signed_out",
      unlockedCount,
      lockedCount,
    });
  }, [userId, unlockedCount, lockedCount]);

  async function handleUnlock(openingId: string) {
    if (!progress) return;
    setUnlockingOpeningId(openingId);
    setErrorMessage(null);
    setStatusMessage(null);
    trackBlundrAnalyticsEvent(
      BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_UNLOCK_ATTEMPTED,
      {
        userId,
        openingId,
      },
    );
    try {
      const result = await authenticatedApiFetch<{
        ok: true;
        data: unknown;
      }>("/api/blundr/repertoire/unlock", {
        method: "POST",
        body: JSON.stringify({
          openingId,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      void result;
      setStatusMessage("Opening unlocked.");
      await refreshRepertoire();
    } catch (error) {
      if (error instanceof AuthenticatedApiError) {
        setErrorMessage(error.message);
        trackBlundrAnalyticsEvent(
          BLUNDR_ANALYTICS_EVENTS.REPERTOIRE_UNLOCK_FAILED,
          {
            userId: userId ?? "signed_out",
            openingId,
            code: error.code,
          },
        );
        return;
      }
      setErrorMessage("Unlocking is temporarily unavailable.");
    } finally {
      setUnlockingOpeningId(null);
    }
  }

  function handleTrainOpening(openingId: string) {
    if (onTrainOpening) {
      onTrainOpening(openingId);
      return;
    }
    setStatusMessage("Open this opening from Home to start training.");
  }

  return (
    <section className={classNames(styles.panel, styles.stack, className)}>
      <header className={styles.hero}>
        <div className={styles.repHeader}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <BookOpen size={13} />
              Repertoire
            </div>
            <h1 className={styles.title}>Your opening library.</h1>
            <p className={styles.copy}>
              Points, unlock intelligence, starter pack, active lines and
              reward history—all without burying the openings.
            </p>
          </div>
          {!embedded ? (
            <div className={styles.actions}>
              <Link
                href="/settings"
                className={styles.iconButton}
                aria-label="Open settings"
              >
                <Settings size={18} />
              </Link>
              <Link
                href={homeHref}
                className={styles.iconButton}
                aria-label="Back to home"
              >
                <ArrowLeft size={18} />
              </Link>
            </div>
          ) : (
            <div className={styles.actions}>
              <Link
                href="/settings"
                className={styles.iconButton}
                aria-label="Open settings"
              >
                <Settings size={18} />
              </Link>
              <button
                type="button"
                onClick={() => void refreshRepertoire()}
                className={styles.iconButton}
                aria-label="Refresh repertoire"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          )}
        </div>

      </header>

      {statusMessage ? (
        <div className={styles.statusBanner}>{statusMessage}</div>
      ) : null}
      {errorMessage ? (
        <div className={styles.stateCard}>
          <div className={styles.errorBody}>
            <BlundrAssetImage
              asset={BLUNDR_EMPTY_STATE_ASSETS.errorSafeFallback}
              alt="Safe fallback"
              variant="emptyState"
            />
            <div className={styles.errorCopy}>
              <div className={styles.kicker}>Safe fallback</div>
              <p className={styles.stateText}>{errorMessage}</p>
            </div>
          </div>
        </div>
      ) : null}

      {repertoireState.status === "loading" ? (
        <div className={styles.stateCard}>
          <div className={styles.kicker}>Loading</div>
          <p className={styles.stateText}>
            Tempo is loading your repertoire.
          </p>
        </div>
      ) : repertoireState.status === "signed_out" ? (
        <div className={styles.stateCard}>
          <div className={styles.kicker}>Signed out</div>
          <p className={styles.stateText}>
            Sign in to load your saved repertoire.
          </p>
        </div>
      ) : repertoireState.status === "error" ? (
        <div
          className={classNames(styles.stateCard, styles.stateCardUnavailable)}
        >
          <div className={styles.kicker}>Unavailable</div>
          <p className={styles.stateText}>{repertoireState.error}</p>
          <button
            type="button"
            onClick={() => void refreshRepertoire()}
            className={styles.stateAction}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <article className={styles.summaryCard}>
            <div className={styles.summaryPoints}>
              <div className={styles.kicker}>Available points</div>
              <div className={styles.summaryBig}>{progress.availablePoints}</div>
            </div>
            <div className={styles.summaryUnlock}>
              <div className={styles.stateTitle}>
                {progress.nextUnlockCost > 0
                  ? `Next unlock · ${progress.availablePoints} / ${progress.nextUnlockCost}`
                  : "All MVP lines unlocked"}
              </div>
              <div className={styles.summaryTrack} aria-hidden="true">
                <div
                  className={styles.summaryFill}
                  style={{ width: `${progress.nextUnlockProgressPct}%` }}
                />
              </div>
              <p className={styles.stateText}>
                {progress.nextUnlockCost > 0
                  ? `${Math.max(0, progress.nextUnlockCost - progress.availablePoints)} points remaining`
                  : "Keep training for future repertoire packs."}
              </p>
            </div>
            <div className={classNames(styles.pill, styles.pillGreen)}>
              {unlockedCount} unlocked · {lockedCount} locked
            </div>
          </article>

          <RepertoireOpeningGrid
            progress={progress}
            onUnlock={handleUnlock}
            onTrainOpening={handleTrainOpening}
            unlockingOpeningId={unlockingOpeningId}
          />

          <RewardHistoryList className={styles.stack} />
          <RepertoireTempoCallout />

          <div className={styles.starterCard}>
            <div className={styles.currentRow}>
              <div>
                <div className={styles.kicker}>Starter pack</div>
                <div className={styles.starterTitle}>
                  {starterPack?.displayName ?? "Starter pack"}
                </div>
              </div>
              <div className={classNames(styles.pill, styles.pillGreen)}>
                {starterPack?.shortName ?? "Tempo"}
              </div>
            </div>
            {starterPack ? (
              <div className={styles.starterGrid}>
                <div className={styles.starterTile}>
                  <div className={styles.tileLabel}>White</div>
                  <div className={styles.tileValue}>
                    {starterPack.whiteOpeningName}
                  </div>
                </div>
                <div className={styles.starterTile}>
                  <div className={styles.tileLabel}>Black</div>
                  <div className={styles.tileValue}>
                    {starterPack.blackOpeningName}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
