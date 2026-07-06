"use client";

import { X } from "lucide-react";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import type { RewardGrantRecord, TempoCacheState } from "@/lib/blundr/rewards/rewardTypes";
import type { UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import { TempoCacheCard } from "./TempoCacheCard";

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

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function TempoCacheModal({ open, userId, localDate, state, rewardGrants = [], rewardHistory, onClose, onPrimaryAction }: TempoCacheModalProps) {
  const hasPendingChoice = rewardGrants.some((grant) => grant.pendingChoice && !grant.applied);

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/30 px-4 py-4 backdrop-blur-[2px] sm:items-center"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tempo Cache reward"
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-700 shadow-sm ring-1 ring-stone-200"
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
