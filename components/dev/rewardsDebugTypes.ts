import type { DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import type { RewardRoll, StreakRecord, UserRewardHistory, UserTrainingProfile, VariableRewardType } from "@/lib/blundr/accounts/accountTypes";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type { RewardGrantRecord, TempoCacheState } from "@/lib/blundr/rewards/rewardTypes";
import type { RewardInventoryEvent, RewardInventoryView } from "@/lib/blundr/rewards/rewardInventoryTypes";

export type RewardsPreviewKind =
  | { kind: "none" }
  | {
      kind: "reward";
      title: string;
      rarity: "common" | "uncommon" | "rare" | "epic";
      rewardType: VariableRewardType | "future_reward";
      amount: number;
      description: string;
    }
  | {
      kind: "tempo_cache";
      title: string;
      variant: "A" | "B" | "C";
      description: string;
    }
  | {
      kind: "streak";
      title: string;
      variant: "A" | "B" | "C";
      description: string;
    }
  | {
      kind: "opening_unlock";
      title: string;
      description: string;
      openingId?: string | null;
    }
  | {
      kind: "unlock_success";
      title: string;
      openingId: string;
      openingName: string;
      methodLabel: string;
      before: { points: number; fragments: number; tokens: number };
      after: { points: number; fragments: number; tokens: number };
      description: string;
    }
  | {
      kind: "failure";
      title: string;
      code: string;
      message: string;
    }
  | {
      kind: "admin_grant";
      title: string;
      success: boolean;
      targetUserId: string;
      targetEmail?: string | null;
      grantType: string;
      amount: number;
      reason: string;
      auditId?: string;
      beforeSummary: string;
      afterSummary: string;
      description: string;
    };

export type RewardsEventLogEntry = {
  id: string;
  timestamp: string;
  trigger: string;
  action: string;
  rewardGenerated: string;
  storageUpdated: string;
  popupShown: string;
  persistenceTarget: string;
  idempotencyKey: string;
  beforeSummary: string;
  afterSummary: string;
  success: boolean;
  error?: string;
};

export type RewardsDebugSnapshot = {
  userId: string;
  profile: UserTrainingProfile | null;
  daily: DailyRingSnapshot;
  repertoire: RepertoireProgress;
  rewardHistory: UserRewardHistory;
  rewardRolls: RewardRoll[];
  rewardInventory: RewardInventoryView;
  rewardInventoryEvents: RewardInventoryEvent[];
  streak: StreakRecord | null;
  tempoCacheState: TempoCacheState;
  recentRewardGrantSummary: string[];
  recentRewardRollSummary: string[];
  appliedRewardIdsCount: number;
  pendingPopupLabel: string | null;
};

export type RewardsMockGrant = Omit<RewardGrantRecord, "rewardType"> & { rewardType: string };
