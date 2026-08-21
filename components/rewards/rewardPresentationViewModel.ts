import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";

export type RewardPresentation = {
  id: string;
  presentation_kind?: string;
  presentation_key?: string;
  priority?: number;
  envelope?: Record<string, unknown>;
};

export type RewardPresentationViewModel = {
  title: string;
  body: string;
  asset: string;
  alt: string;
  rarityLabel?: string;
};

type RewardGrantEnvelope = {
  rarity?: string;
  rewardType?: string;
  amount?: number;
  displayName?: string;
  description?: string;
};

const RARITY_LABELS: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
};

const REWARD_TYPE_LABELS: Record<string, string> = {
  opening_fragment: "Opening Fragment",
  choice_token: "Choice Token",
  opening_preview_card: "Opening Preview",
  style_pack_progress: "Style Pack Progress",
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function prettifyId(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function firstGrant(envelope: Record<string, unknown>): RewardGrantEnvelope | null {
  const grants = envelope.rewardGrants;
  if (!Array.isArray(grants)) return null;
  const grant = grants.find(
    (item): item is Record<string, unknown> =>
      !!item && typeof item === "object" && !Array.isArray(item),
  );
  if (!grant) return null;
  return {
    rarity: text(grant.rarity),
    rewardType: text(grant.rewardType),
    amount: positiveNumber(grant.amount) ?? undefined,
    displayName: text(grant.displayName),
    description: text(grant.description),
  };
}

function rarityLabel(rarity: string): string | undefined {
  return RARITY_LABELS[rarity];
}

function isStreakPresentation(
  presentation: RewardPresentation,
  envelope: Record<string, unknown>,
): boolean {
  const trigger = text(envelope.trigger).toLowerCase();
  const key = text(presentation.presentation_key).toLowerCase();
  return (
    trigger.includes("streak") ||
    trigger.includes("weekly") ||
    trigger.includes("monthly") ||
    key.includes("streak") ||
    key.includes("weekly") ||
    key.includes("monthly") ||
    positiveNumber(envelope.streakDays) !== null
  );
}

function rewardAsset(
  presentation: RewardPresentation,
  envelope: Record<string, unknown>,
  grant: RewardGrantEnvelope | null,
): string {
  if (text(envelope.openingId) || presentation.presentation_kind === "unlock")
    return BLUNDR_REWARD_ASSETS.openingUnlocked;
  if (isStreakPresentation(presentation, envelope))
    return BLUNDR_REWARD_ASSETS.streakReward;
  if (!grant) return BLUNDR_REWARD_ASSETS.allRingsComplete;
  if (grant.rarity === "epic") return BLUNDR_REWARD_ASSETS.epicReward;
  if (
    grant.rarity === "uncommon" ||
    grant.rarity === "rare" ||
    grant.rewardType === "opening_fragment" ||
    grant.rewardType === "choice_token"
  )
    return BLUNDR_REWARD_ASSETS.rareReward;
  return BLUNDR_REWARD_ASSETS.commonReward;
}

function rewardBody(grant: RewardGrantEnvelope): string {
  if (grant.rewardType === "unlock_points" && grant.amount)
    return `+${grant.amount} repertoire points`;
  const label =
    grant.displayName ||
    REWARD_TYPE_LABELS[grant.rewardType ?? ""] ||
    "Reward";
  return grant.amount && grant.amount > 1
    ? `${grant.amount} ${label}s earned`
    : `${label} earned`;
}

export function buildRewardPresentationViewModel(
  presentation: RewardPresentation,
): RewardPresentationViewModel {
  const envelope = presentation.envelope ?? {};
  const grant = firstGrant(envelope);
  const asset = rewardAsset(presentation, envelope, grant);
  const rarity = rarityLabel(grant?.rarity ?? text(envelope.rarity));

  if (text(envelope.openingId) || presentation.presentation_kind === "unlock") {
    const openingName = text(envelope.openingName) || prettifyId(envelope.openingId);
    return {
      title: "Opening unlocked",
      body: openingName
        ? `${openingName} is ready to train.`
        : "Your opening is ready to train.",
      asset,
      alt: "Opening unlocked reward",
    };
  }

  if (isStreakPresentation(presentation, envelope)) {
    const days = positiveNumber(envelope.streakDays);
    return {
      title: days ? `${days}-day streak` : "Streak reward",
      body: grant ? rewardBody(grant) : "Your consistency paid off.",
      asset,
      alt: "Streak reward",
      rarityLabel: rarity,
    };
  }

  if (grant) {
    const label = rarity ?? "Reward";
    return {
      title: rarity === "Common" ? "Reward earned" : `${label} reward`,
      body: rewardBody(grant),
      asset,
      alt: `${label} reward`,
      rarityLabel: rarity,
    };
  }

  const quantity = positiveNumber(envelope.quantity ?? envelope.amount);
  return {
    title: "Reward earned",
    body: quantity ? `+${quantity} repertoire points` : "Your reward is ready.",
    asset,
    alt: "All rings complete reward",
    rarityLabel: rarity,
  };
}
