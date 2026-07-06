"use client";

import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { REWARD_KIND_ASSETS } from "@/lib/blundr/rewards/rewardConstants";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";

type RewardIconReward = Pick<RewardGrantRecord, "rarity" | "rewardType" | "displayName" | "description" | "amount"> & {
  id?: string;
};

type RewardIconProps = {
  reward?: RewardIconReward | null;
  alt?: string;
  variant?: "rewardIcon" | "rewardCard" | "rewardHero";
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function resolveRewardAsset(reward: RewardIconReward | null | undefined): string {
  if (!reward) return BLUNDR_REWARD_ASSETS.pointsToken;
  if (reward.rarity === "epic") return BLUNDR_REWARD_ASSETS.epicBonus;
  if (reward.rewardType === "choice_token") return REWARD_KIND_ASSETS.choice_token;
  if (reward.rewardType === "opening_fragment") return REWARD_KIND_ASSETS.opening_fragment;
  if (reward.rewardType === "opening_preview_card") return REWARD_KIND_ASSETS.opening_preview_card;
  if (reward.rewardType === "style_pack_progress") return REWARD_KIND_ASSETS.style_pack_progress;
  return REWARD_KIND_ASSETS.unlock_points;
}

export function RewardIcon({ reward, alt, variant = "rewardIcon", className }: RewardIconProps) {
  const asset = resolveRewardAsset(reward);
  const label = alt ?? reward?.displayName ?? "Reward";

  return (
    <BlundrAssetImage
      asset={asset}
      alt={label}
      variant={variant}
      className={classNames("shrink-0", className)}
      fallbackAsset={BLUNDR_REWARD_ASSETS.pointsToken}
    />
  );
}
