"use client";

import { X } from "lucide-react";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import type {
  RewardGrantRecord,
  TempoCacheState,
} from "@/lib/blundr/rewards/rewardTypes";
import type { UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import { TempoCacheCard } from "./TempoCacheCard";
import styles from "./RewardSurface.module.css";

type TempoCacheModalProps = {
  open: boolean;
  userId?: string;
  localDate?: string;
  state: TempoCacheState;
  rewardGrants?: readonly RewardGrantRecord[];
  rewardHistory?: UserRewardHistory | null;
  onClose: () => void;
  onPrimaryAction?: () => void;
};

export function TempoCacheModal({
  open,
  userId,
  localDate,
  state,
  rewardGrants = [],
  rewardHistory,
  onClose,
  onPrimaryAction,
}: TempoCacheModalProps) {
  const hasPendingChoice = rewardGrants.some(
    (grant) => grant.pendingChoice && !grant.applied,
  );

  if (!open) return null;

  function handleClose() {
    if (userId && localDate) {
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.TEMPO_CACHE_DISMISSED, {
        userId,
        localDate,
        state,
        rewardCount: rewardGrants.length,
      });
    }
    onClose();
  }

  return (
    <div
      className={styles.fixedOverlay}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={styles.tempoModal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tempo Cache reward"
      >
        <div className={styles.modalTopbar}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
          >
            <X size={14} />
            Close
          </button>
        </div>
        <TempoCacheCard
          state={state}
          rewardGrants={rewardGrants}
          rewardHistory={rewardHistory}
          onPrimaryAction={onPrimaryAction ?? handleClose}
          primaryActionLabel={hasPendingChoice ? "Apply Reward" : "Done"}
        />
      </div>
    </div>
  );
}
