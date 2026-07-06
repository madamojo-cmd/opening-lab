"use client";

import { BLUNDR_REWARD_ANIMATIONS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrVideoAsset } from "@/components/assets/BlundrVideoAsset";

export type RewardAnimationKind = "tempoCacheOpen" | "rewardPop" | "pointsFloat" | "streakFlare";

type RewardAnimationProps = {
  kind: RewardAnimationKind;
  ariaLabel: string;
  className?: string;
};

const ANIMATION_SRC: Record<RewardAnimationKind, { src: string; fallbackSrc: string }> = {
  tempoCacheOpen: {
    src: BLUNDR_REWARD_ANIMATIONS.tempoCacheOpen,
    fallbackSrc: BLUNDR_REWARD_ANIMATIONS.tempoCacheOpenFallback,
  },
  rewardPop: {
    src: BLUNDR_REWARD_ANIMATIONS.rewardPop,
    fallbackSrc: BLUNDR_REWARD_ANIMATIONS.rewardPopFallback,
  },
  pointsFloat: {
    src: BLUNDR_REWARD_ANIMATIONS.pointsFloat,
    fallbackSrc: BLUNDR_REWARD_ANIMATIONS.pointsFloatFallback,
  },
  streakFlare: {
    src: BLUNDR_REWARD_ANIMATIONS.streakFlare,
    fallbackSrc: BLUNDR_REWARD_ANIMATIONS.streakFlareFallback,
  },
};

export function RewardAnimation({ kind, ariaLabel, className }: RewardAnimationProps) {
  const asset = ANIMATION_SRC[kind];
  return <BlundrVideoAsset src={asset.src} fallbackSrc={asset.fallbackSrc} ariaLabel={ariaLabel} className={className} />;
}

