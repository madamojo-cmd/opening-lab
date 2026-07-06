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

type RewardRevealCardProps = {
  grant: RewardGrantRecord;
  className?: string;
  compact?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
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

export function RewardRevealCard({ grant, className, compact = false, onPrimaryAction, primaryActionLabel }: RewardRevealCardProps) {
  const pendingChoice = grant.pendingChoice && !grant.applied;
  const showRareGlow = grant.rarity === "rare" || grant.rarity === "epic";

  return (
    <article
      className={classNames(
        "relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      {showRareGlow ? (
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[2rem]">
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheGlow}
            alt=""
            variant="rewardHero"
            className="absolute -right-8 -top-8 opacity-55 !h-[12rem] !w-[12rem] !max-w-none !rounded-[2rem] !p-0"
          />
        </div>
      ) : null}

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <RewardIcon reward={grant} variant="rewardIcon" />
            <div>
              <RewardRarityBadge rarity={grant.rarity} />
              <h3 className="mt-2 text-lg font-black tracking-tight text-stone-950">{grant.displayName}</h3>
              <p className="mt-1 text-sm leading-6 text-stone-600">{getRewardSummary(grant)}</p>
            </div>
          </div>
          <RewardPointsFloat points={grant.pointsApplied} className="hidden min-w-[11rem] sm:block" />
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Reward detail</div>
            <p className="mt-2 text-sm leading-6 text-stone-700">{grant.description}</p>
          </div>
          <RewardPointsFloat points={grant.pointsApplied} className="sm:hidden" />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-stone-500">
          {grant.applied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-green-800 ring-1 ring-green-200">
              <CheckCircle2 size={13} />
              Reward applied
            </span>
          ) : null}
          {grant.trigger ? <span className="rounded-full bg-stone-50 px-3 py-1 ring-1 ring-stone-200">{grant.trigger}</span> : null}
          {grant.amount > 0 ? <span className="rounded-full bg-stone-50 px-3 py-1 ring-1 ring-stone-200">+{grant.amount}</span> : null}
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
                className="rounded-full bg-green-700 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-sm"
              >
                {primaryActionLabel ?? "Done"}
              </button>
            ) : null}
          </div>
        ) : onPrimaryAction ? (
          <button
            type="button"
            onClick={onPrimaryAction}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
          >
            {primaryActionLabel ?? "Apply reward"}
          </button>
        ) : null}
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-0 opacity-10">
        <RewardAnimation kind="rewardPop" ariaLabel="Reward reveal animation" className="!w-24 !max-w-none" />
      </div>
    </article>
  );
}

