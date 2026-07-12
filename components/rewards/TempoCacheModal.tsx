"use client";

import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import type { RewardGrantRecord, TempoCacheState } from "@/lib/blundr/rewards/rewardTypes";
import type { UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import { TempoCacheDeckPopup } from "./popups/TempoCacheDeckPopup";
import { adaptRewardGrantToPresentation } from "@/lib/blundr/rewards/rewardPresentationAdapter";

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

export function TempoCacheModal({ open, userId, localDate, state, rewardGrants = [], rewardHistory, onClose, onPrimaryAction }: TempoCacheModalProps) {
  if (!open) return null;

  const reward = rewardGrants[0];
  if (!reward) return null;

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
    <TempoCacheDeckPopup reward={adaptRewardGrantToPresentation(reward)} reducedMotion={false} onDismiss={() => { handleClose(); onPrimaryAction?.(); }} />
  );
}
