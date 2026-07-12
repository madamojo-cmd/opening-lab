"use client";

import { CheckCircle2, Play } from "lucide-react";
import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import { BLUNDR_REWARD_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { REWARD_CACHE_COPY } from "@/lib/blundr/rewards/rewardConstants";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RewardAnimation } from "./RewardAnimation";
import { RewardIcon } from "./RewardIcon";
import { RewardRarityBadge } from "./RewardRarityBadge";

type RewardRevealCardProps = {
  grant: Omit<RewardGrantRecord, "rewardType"> & { rewardType: string };
  className?: string;
  compact?: boolean;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getRewardSummary(grant: Omit<RewardGrantRecord, "rewardType"> & { rewardType: string }): string {
  if (grant.rewardType === "opening_fragment") {
    return "Opening fragment added to inventory. Collect 3 to choose a locked opening.";
  }
  if (grant.rewardType === "choice_token") {
    return "Choice token added to inventory. Pick one locked opening to unlock.";
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
        "relative overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      {showRareGlow ? (
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[1.5rem]">
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheGlow}
            alt=""
            variant="rewardHero"
            className="absolute -right-8 -top-8 opacity-45 !h-[12rem] !w-[12rem] !max-w-none !rounded-[1.5rem] !p-0"
          />
        </div>
      ) : null}

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <div className="blundr-reward-pulse absolute h-40 w-40 rounded-full bg-[#2e6b4f]/[0.08]" />
            <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.reward} alt="Tempo holding a reward" variant="rewardHero" className="blundr-reward-float relative !h-36 !w-36 !max-w-none !p-0" />
          </div>
          <RewardRarityBadge rarity={grant.rarity} />
          <h3 className="mt-2 text-xl font-semibold text-stone-950">{grant.displayName}</h3>
          <p className="mt-1 max-w-[17rem] text-sm leading-6 text-stone-600">{getRewardSummary(grant)}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-stone-200">
          <BlundrAssetImage asset={BLUNDR_REWARD_ASSETS.cardBackground} alt="" variant="rewardHero" className="pointer-events-none absolute right-0 top-0 h-full !w-1/2 opacity-15" />
          <div className="relative flex items-center gap-3">
            <RewardIcon reward={grant} variant="rewardIcon" />
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs font-medium text-stone-500">Reward earned</div>
              <div className="truncate text-base font-bold text-stone-950">{grant.description}</div>
            </div>
            <div className="shrink-0 text-xl font-extrabold text-[#b8923a]">+{grant.pointsApplied || grant.amount}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-stone-500">
          {grant.applied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ebf5ef] px-3 py-1 text-[#2e6b4f] ring-1 ring-[#cfe6d8]">
              <CheckCircle2 size={13} />
              Reward applied
            </span>
          ) : null}
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

      <div className="pointer-events-none absolute left-4 top-4 z-0 opacity-5">
        <RewardAnimation kind="rewardPop" ariaLabel="Reward reveal animation" className="!w-24 !max-w-none" />
      </div>
    </article>
  );
}
