"use client";

import type { RewardGrantRecord, TempoCacheState } from "@/lib/blundr/rewards/rewardTypes";
import type { UserRewardHistory } from "@/lib/blundr/accounts/accountTypes";
import { BLUNDR_REWARD_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { REWARD_CACHE_COPY } from "@/lib/blundr/rewards/rewardConstants";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RewardAnimation } from "./RewardAnimation";
import { RewardRevealCard } from "./RewardRevealCard";

type TempoCacheCardProps = {
  state: TempoCacheState;
  rewardGrants?: readonly RewardGrantRecord[];
  rewardHistory?: UserRewardHistory | null;
  className?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function isStreakCache(rewardGrants: readonly RewardGrantRecord[]): boolean {
  return rewardGrants.some((grant) => grant.trigger === "weekly_cache" || grant.trigger === "monthly_cache");
}

function hasRareReward(rewardGrants: readonly RewardGrantRecord[]): boolean {
  return rewardGrants.some((grant) => grant.rarity === "rare" || grant.rarity === "epic");
}

export function TempoCacheCard({ state, rewardGrants = [], rewardHistory, className, onPrimaryAction, primaryActionLabel }: TempoCacheCardProps) {
  const streakCache = isStreakCache(rewardGrants);
  const rareReward = hasRareReward(rewardGrants);
  const hasRewards = rewardGrants.length > 0;
  const actionLabel =
    primaryActionLabel ??
    (hasRewards ? "Done" : state === "closed" ? "Keep training" : streakCache ? "Close" : "Done");

  return (
    <section className={classNames("relative overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm", className)}>
      {rareReward ? (
        <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[2rem]">
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheGlow}
            alt=""
            variant="rewardHero"
            className="absolute -right-10 -top-8 opacity-60 !h-[14rem] !w-[14rem] !max-w-none !rounded-[2rem] !p-0"
          />
        </div>
      ) : null}

      <div className="relative z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <BlundrAssetImage asset={BLUNDR_TEMPO_ASSETS.reward} alt="Tempo reward" variant="tempoInline" className="shrink-0" />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Tempo Cache</div>
              <h3 className="mt-1 text-xl font-black tracking-tight text-stone-950">{REWARD_CACHE_COPY.intro}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {state === "closed"
                  ? "The cache is waiting for a ring closure or streak milestone."
                  : streakCache
                    ? "A streak milestone opened this cache."
                    : "Tempo found a bonus for your training."}
              </p>
            </div>
          </div>
          <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700 ring-1 ring-green-200">
            {state}
          </div>
        </div>

        {state === "closed" && !hasRewards ? (
          <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
            <BlundrAssetImage
              asset={BLUNDR_REWARD_ASSETS.tempoCacheClosed}
              alt="Closed Tempo Cache"
              variant="rewardCard"
              className="mx-auto"
            />
            <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                Closed state
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Tempo Cache rewards never replace deterministic training. They only add extra repertoire points on top of your regular progress.
              </p>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                If a future reward lands, Tempo will reveal it here and apply it through repertoire points.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <RewardAnimation
              kind={streakCache ? "streakFlare" : "tempoCacheOpen"}
              ariaLabel="Tempo Cache reveal animation"
              className="mx-auto"
            />
            {hasRewards ? (
              <div className="grid gap-3">
                {rewardGrants.map((grant) => (
                  <RewardRevealCard
                    key={grant.id}
                    grant={grant}
                    compact
                    onPrimaryAction={onPrimaryAction}
                    primaryActionLabel={actionLabel}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Opening</div>
                <p className="mt-2 text-sm leading-6 text-stone-700">Tempo is checking the cache and preparing the bonus reveal.</p>
              </div>
            )}

            {rewardHistory ? (
              <div className="rounded-[1.5rem] bg-stone-50 p-3 text-xs leading-5 text-stone-600 ring-1 ring-stone-200">
                <div className="font-black uppercase tracking-[0.18em] text-stone-500">Pity tracker</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 font-black text-stone-700 ring-1 ring-stone-200">
                    {rewardHistory.allRingsDaysSinceRandomReward} all-ring days since random bonus
                  </span>
                  {rewardHistory.lastRandomRewardLocalDate ? (
                    <span className="rounded-full bg-white px-3 py-1 font-black text-stone-700 ring-1 ring-stone-200">
                      Last random bonus {rewardHistory.lastRandomRewardLocalDate}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {onPrimaryAction ? (
              <button
                type="button"
                onClick={onPrimaryAction}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
