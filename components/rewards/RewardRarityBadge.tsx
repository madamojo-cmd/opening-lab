"use client";

import type { RewardRarity } from "@/lib/blundr/accounts/accountTypes";
import { REWARD_RARITY_ASSETS, REWARD_RARITY_LABELS } from "@/lib/blundr/rewards/rewardConstants";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";

type RewardRarityBadgeProps = {
  rarity: RewardRarity;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const TONE_CLASSES: Record<RewardRarity, string> = {
  common: "border-green-200 bg-green-50 text-green-800",
  uncommon: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rare: "border-amber-200 bg-amber-50 text-amber-800",
  epic: "border-stone-200 bg-stone-950 text-white",
};

export function RewardRarityBadge({ rarity, className }: RewardRarityBadgeProps) {
  const label = REWARD_RARITY_LABELS[rarity];
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em]",
        TONE_CLASSES[rarity],
        className,
      )}
    >
      <BlundrAssetImage
        asset={REWARD_RARITY_ASSETS[rarity]}
        alt={`${label} reward rarity`}
        variant="rewardIcon"
        className="!h-5 !w-5 !rounded-full !p-0.5"
        priority={false}
      />
      <span>{label}</span>
    </span>
  );
}

