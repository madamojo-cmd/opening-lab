import type { StarterPackId } from "../accounts/accountTypes";

export type RepertoirePointSource =
  | "opening_run_completed"
  | "continuation_completed"
  | "daily_blundr_deck_completed"
  | "reward_bonus"
  | "manual_dev_adjustment";

export type RepertoirePointEvent = {
  id: string;
  userId: string;
  source: RepertoirePointSource;
  points: number;
  openingId?: string;
  dailySessionId?: string;
  createdAt: string;
};

export type RepertoireUnlockEvent = {
  id: string;
  userId: string;
  openingId: string;
  pointsSpent: number;
  unlockIndex: number;
  createdAt: string;
};

export type RepertoireOpeningSide = "white" | "black" | "unknown";

export type RepertoireOpeningCardStatus = "unlocked" | "locked";

export type RepertoireOpeningCard = {
  openingId: string;
  openingName: string;
  side: RepertoireOpeningSide;
  status: RepertoireOpeningCardStatus;
  pointsCost: number;
  unlockIndex?: number;
  description?: string;
  availablePoints?: number;
  reason?: string;
};

export type RepertoireProgress = {
  userId: string;
  selectedStarterPackId: StarterPackId;
  unlockedOpeningIds: string[];
  lockedOpeningIds: string[];
  availablePoints: number;
  lifetimePoints: number;
  spentPoints: number;
  nextUnlockCost: number;
  nextUnlockProgressPct: number;
  pointEvents: RepertoirePointEvent[];
  unlockEvents: RepertoireUnlockEvent[];
  updatedAt: string;
};

export type RepertoireUnlockResult =
  | {
      ok: true;
      progress: RepertoireProgress;
      event: RepertoireUnlockEvent;
    }
  | {
      ok: false;
      code: "opening_not_locked" | "opening_not_found" | "insufficient_points" | "invalid_repertoire";
      message: string;
    };
