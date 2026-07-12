import type { ReactNode } from "react";

import type { CurrentBlundrUser, UserRewardHistory } from "../accounts/accountTypes";
import type { RewardGrantRecord, TempoCacheState } from "./rewardTypes";
import type { RewardInventoryView } from "./rewardInventoryTypes";
import type { RepertoireOpeningCard, RepertoireProgress } from "../repertoire/repertoireTypes";
import type { RewardPresentationModel } from "./rewardPresentationAdapter";

export type RewardPopupVariant = "A" | "B" | "C";

export type RewardPopupFrame = "desktop" | "mobile-375" | "mobile-390" | "mobile-414";

export type RewardPopupChrome = {
  frame: RewardPopupFrame;
  reducedMotion: boolean;
  darkBackdrop: boolean;
};

type RewardPopupBase = {
  id: string;
  preview: boolean;
  title: string;
  description?: string;
  sourceLabel?: string;
  closeLabel?: string;
  createdAt: string;
  transactionId?: string;
  priority?: number;
};

export type RewardPopupRewardEvent = RewardPopupBase & {
  kind: "reward_popup";
  variant: RewardPopupVariant;
  /** Canonical types are preferred; arbitrary strings remain safe for future preview-only rewards. */
  rewardType: string;
  amount: number;
  rarity: RewardGrantRecord["rarity"];
  grant?: RewardGrantRecord;
  presentation?: RewardPresentationModel;
};

export type RewardPopupTempoCacheEvent = RewardPopupBase & {
  kind: "tempo_cache";
  variant: RewardPopupVariant;
  state: TempoCacheState;
  rewardGrants: readonly RewardGrantRecord[];
  rewardHistory: UserRewardHistory | null;
  presentation?: RewardPresentationModel;
  sharedSyncFailed?: boolean;
  sharedSyncFailureCode?: "shared_sync_failed";
  sharedSyncFailureMessage?: string;
};

export type RewardPopupStreakEvent = RewardPopupBase & {
  kind: "streak";
  variant: RewardPopupVariant;
  currentStreakDays: number;
  longestStreakDays: number;
};

export type RewardPopupOpeningUnlockEvent = RewardPopupBase & {
  kind: "opening_unlock";
  card: RepertoireOpeningCard;
  progress: RepertoireProgress;
  inventory: RewardInventoryView;
};

export type RewardPopupUnlockSuccessEvent = RewardPopupBase & {
  kind: "unlock_success";
  openingId: string;
  openingName: string;
  methodLabel: string;
  before: {
    points: number;
    fragments: number;
    tokens: number;
  };
  after: {
    points: number;
    fragments: number;
    tokens: number;
  };
};

export type RewardPopupFailureEvent = RewardPopupBase & {
  kind: "failure";
  code: string;
  message: string;
};

export type RewardPopupAdminGrantEvent = RewardPopupBase & {
  kind: "admin_grant";
  success: boolean;
  targetUserId: string;
  targetEmail?: string | null;
  grantType: string;
  amount: number;
  reason: string;
  auditId?: string;
  beforeSummary: string;
  afterSummary: string;
};

export type RewardPopupEvent =
  | RewardPopupRewardEvent
  | RewardPopupTempoCacheEvent
  | RewardPopupStreakEvent
  | RewardPopupOpeningUnlockEvent
  | RewardPopupUnlockSuccessEvent
  | RewardPopupFailureEvent
  | RewardPopupAdminGrantEvent;

export type RewardPopupRenderResult = {
  chrome: RewardPopupChrome;
  popup: ReactNode;
};

export type RewardPopupTargetUser = Pick<CurrentBlundrUser, "userId" | "email" | "mode">;
