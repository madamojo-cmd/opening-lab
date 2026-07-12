import type { RewardGrantRecord } from "./rewardTypes";

export type RewardPresentationType =
  | "repertoire_points"
  | "opening_fragment"
  | "choice_token"
  | "epic_bonus"
  | "unknown";

export type RewardPresentationModel = {
  eventId: string;
  rewardType: RewardPresentationType;
  rawRewardType: string;
  amount: number;
  displayName: string;
  description: string;
  rarity: RewardGrantRecord["rarity"];
  sourceLabel?: string;
  grantedAt: string;
};

export type RewardPresentationSource = Omit<RewardGrantRecord, "rewardType"> & { rewardType: string };

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export function adaptRewardGrantToPresentation(
  grant: RewardPresentationSource,
  sourceLabel?: string,
): RewardPresentationModel {
  const amount = Number(grant.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("A persisted reward must have a positive finite amount.");
  }

  const rawRewardType = clean(grant.rewardType) || "unknown";
  const isEpicPoints = rawRewardType === "unlock_points" && grant.rarity === "epic";
  const rewardType: RewardPresentationType =
    rawRewardType === "opening_fragment"
      ? "opening_fragment"
      : rawRewardType === "choice_token"
        ? "choice_token"
        : isEpicPoints
          ? "epic_bonus"
          : rawRewardType === "unlock_points"
            ? "repertoire_points"
            : "unknown";

  const defaults = {
    repertoire_points: ["Repertoire Points", "Added to your balance"],
    opening_fragment: ["Opening Fragment", "Saved to your opening inventory"],
    choice_token: ["Choice Token", "Choose one locked opening to unlock"],
    epic_bonus: ["Repertoire Points", "Epic bonus added to your balance"],
    unknown: ["Reward", "Added to your account"],
  } as const;
  const [defaultName, defaultDescription] = defaults[rewardType];

  return {
    eventId: clean(grant.triggerEventId) || clean(grant.id),
    rewardType,
    rawRewardType,
    amount,
    displayName: clean(grant.displayName) || defaultName,
    description: clean(grant.description) || defaultDescription,
    rarity: grant.rarity,
    sourceLabel: clean(sourceLabel) || undefined,
    grantedAt: clean(grant.createdAt) || new Date(0).toISOString(),
  };
}
