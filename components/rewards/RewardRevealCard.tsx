"use client";

import { CheckCircle2, Play } from "lucide-react";
import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { REWARD_CACHE_COPY } from "@/lib/blundr/rewards/rewardConstants";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RewardAnimation } from "./RewardAnimation";
import { RewardIcon } from "./RewardIcon";
import { RewardPointsFloat } from "./RewardPointsFloat";
import { RewardRarityBadge } from "./RewardRarityBadge";
import styles from "./RewardSurface.module.css";

type RewardRevealCardProps = {
  grant: RewardGrantRecord;
  className?: string;
  compact?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function getRewardSummary(grant: RewardGrantRecord): string {
  if (grant.pendingChoice && !grant.applied) {
    return REWARD_CACHE_COPY.choiceTokenLimit;
  }
  if (grant.pointsApplied > 0) {
    return `Tempo turned this into +${grant.pointsApplied} repertoire points.`;
  }
  return grant.description;
}

export function RewardRevealCard({
  grant,
  className,
  compact = false,
  onPrimaryAction,
  primaryActionLabel,
}: RewardRevealCardProps) {
  const pendingChoice = grant.pendingChoice && !grant.applied;
  const showRareGlow = grant.rarity === "rare" || grant.rarity === "epic";

  return (
    <article
      className={classNames(
        styles.revealCard,
        compact && styles.revealCardCompact,
        className,
      )}
    >
      {showRareGlow ? (
        <div className={styles.rareGlow}>
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheGlow}
            alt=""
            variant="rewardHero"
            className={styles.rareGlowAsset}
          />
        </div>
      ) : null}

      <div className={styles.revealLayout}>
        <div className={styles.revealArt} aria-hidden="true">
          <RewardAnimation
            kind="rewardPop"
            ariaLabel="Reward reveal animation"
            className={styles.revealMotion}
          />
          <RewardIcon
            reward={grant}
            alt=""
            variant="rewardHero"
            className={styles.revealHeroAsset}
          />
        </div>

        <div className={styles.revealContent}>
          <div className="space-y-4">
            <div>
              <RewardRarityBadge rarity={grant.rarity} />
              <h3 className="mt-2 text-lg font-black tracking-tight text-stone-950">
                {grant.displayName}
              </h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                {getRewardSummary(grant)}
              </p>
            </div>

            <div className="grid gap-3">
              <div className={styles.detailPanel}>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                  Reward detail
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-700">
                  {grant.description}
                </p>
              </div>
              <RewardPointsFloat points={grant.pointsApplied} />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-stone-500">
              {grant.applied ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-800 ring-1 ring-green-200">
                  <CheckCircle2 size={13} />
                  Reward applied
                </span>
              ) : null}
              {grant.trigger ? (
                <span className="rounded-full bg-stone-50 px-3 py-1 ring-1 ring-stone-200">
                  {grant.trigger}
                </span>
              ) : null}
              {grant.amount > 0 ? (
                <span className="rounded-full bg-stone-50 px-3 py-1 ring-1 ring-stone-200">
                  +{grant.amount}
                </span>
              ) : null}
            </div>

            {pendingChoice ? (
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                {REWARD_CACHE_COPY.choiceTokenLimit}
              </div>
            ) : null}

            {grant.applied ? (
              <div className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-green-50 p-3 ring-1 ring-green-200">
                <div className="flex items-center gap-2 text-sm font-black text-green-900">
                  <Play size={15} />
                  Reward applied.
                </div>
                {onPrimaryAction ? (
                  <button
                    type="button"
                    onClick={onPrimaryAction}
                    className={styles.primaryButton}
                  >
                    {primaryActionLabel ?? "Done"}
                  </button>
                ) : null}
              </div>
            ) : onPrimaryAction ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className={styles.primaryButton}
              >
                {primaryActionLabel ?? "Apply reward"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
