"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock3, History, Sparkles } from "lucide-react";
import { getLocalAccountCurrentUserId } from "@/lib/blundr/accounts/localAccountStorage";
import { loadRewardHistorySnapshot } from "@/lib/blundr/rewards/rewardHistoryService";
import { getRewardTriggerLabel } from "@/lib/blundr/rewards/rewardRollService";
import { BLUNDR_REWARD_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { RewardIcon } from "./RewardIcon";
import { RewardRarityBadge } from "./RewardRarityBadge";

type RewardHistoryListProps = {
  className?: string;
  limit?: number;
  title?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function formatTimestamp(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return value;
  return new Date(time).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RewardHistoryList({ className, limit = 6, title = "Reward history" }: RewardHistoryListProps) {
  const [snapshot, setSnapshot] = useState(() => loadRewardHistorySnapshot(getLocalAccountCurrentUserId()));

  useEffect(() => {
    setSnapshot(loadRewardHistorySnapshot(getLocalAccountCurrentUserId()));
  }, [limit]);

  const rows = useMemo(() => {
    return snapshot.rewardRolls
      .filter((roll) => Boolean(roll.didReward && roll.reward))
      .slice()
      .sort((a, b) => Date.parse(b.rolledAt) - Date.parse(a.rolledAt))
      .slice(0, limit);
  }, [limit, snapshot.rewardRolls]);

  return (
    <section className={classNames("rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
            <History size={13} />
            {title}
          </div>
          <h3 className="mt-3 text-lg font-black tracking-tight text-stone-950">Recent Tempo Cache results</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Rewards stay rare and deterministic. Training still drives the main progression loop.
          </p>
        </div>
        <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-stone-600">
          {rows.length} shown
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {rows.map((roll) => {
            const reward = roll.reward!;
            const applied = snapshot.history.appliedRewardIds.includes(reward.id);
            return (
              <div key={roll.id} className="flex items-start gap-3 rounded-[1.5rem] bg-[#fbfcf7] p-3 ring-1 ring-stone-200">
                <RewardIcon reward={reward} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-black text-stone-950">{reward.displayName}</div>
                    <RewardRarityBadge rarity={reward.rarity} />
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-600 ring-1 ring-stone-200">
                      {applied ? "Applied" : "Granted"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{reward.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-stone-200">
                      <Sparkles size={12} />
                      {getRewardTriggerLabel(roll.trigger)}
                    </span>
                    {reward.amount ? <span className="rounded-full bg-white px-3 py-1 ring-1 ring-stone-200">+{reward.amount}</span> : null}
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-stone-200">
                      <Clock3 size={12} />
                      {formatTimestamp(roll.rolledAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.75rem] border border-stone-200 bg-[#fbfcf7] p-4 text-center shadow-sm">
          <BlundrAssetImage
            asset={BLUNDR_REWARD_ASSETS.tempoCacheClosed}
            alt="No reward history yet"
            variant="emptyState"
            className="mx-auto"
          />
          <div className="mt-4 text-sm font-black text-stone-950">Tempo Cache history is empty</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            When a rare bonus lands, it will appear here with the trigger that opened it.
          </p>
        </div>
      )}

      <div className="mt-4 rounded-[1.5rem] bg-stone-50 p-3 text-xs leading-5 text-stone-600 ring-1 ring-stone-200">
        <div className="font-black uppercase tracking-[0.18em] text-stone-500">Pity status</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 font-black text-stone-700 ring-1 ring-stone-200">
            {snapshot.history.allRingsDaysSinceRandomReward} all-ring days since random bonus
          </span>
          {snapshot.history.lastRandomRewardLocalDate ? (
            <span className="rounded-full bg-white px-3 py-1 font-black text-stone-700 ring-1 ring-stone-200">
              Last random bonus {snapshot.history.lastRandomRewardLocalDate}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
