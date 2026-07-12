"use client";

import { Gift, KeyRound } from "lucide-react";
import type { RewardInventoryView } from "@/lib/blundr/rewards/rewardInventoryTypes";
import { BlundrCard, BlundrChip } from "@/components/blundr/ui";

type RepertoireRewardInventoryCardProps = {
  inventory: RewardInventoryView;
  className?: string;
};

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function RepertoireRewardInventoryCard({ inventory, className }: RepertoireRewardInventoryCardProps) {
  const fragmentCredits = inventory.availableFragmentUnlockCredits;
  const fragmentRemainder = inventory.openingFragments % 3;
  const fragmentProgress = `${fragmentRemainder === 0 && fragmentCredits > 0 ? 3 : fragmentRemainder} / 3`;
  const hasFragmentUnlock = fragmentCredits > 0;
  const hasChoiceToken = inventory.choiceTokens > 0;

  return (
    <BlundrCard className={classNames("space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Reward inventory</div>
          <h3 className="mt-1 text-lg font-black tracking-tight text-stone-950">Fragments and choice tokens</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Opening Fragments and Choice Tokens unlock openings you pick yourself. Repertoire Points stay the main progression currency.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <BlundrChip tone={hasFragmentUnlock ? "green" : "stone"} icon={<Gift size={13} />}>
            {inventory.openingFragments} fragment{inventory.openingFragments === 1 ? "" : "s"}
          </BlundrChip>
          <BlundrChip tone={hasChoiceToken ? "gold" : "stone"} icon={<KeyRound size={13} />}>
            {inventory.choiceTokens} token{inventory.choiceTokens === 1 ? "" : "s"}
          </BlundrChip>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Opening Fragments</div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">{inventory.openingFragments}</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">Collect 3 to choose a new opening.</p>
          <div className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-600 ring-1 ring-stone-200">
            {fragmentProgress} fragments
            {hasFragmentUnlock ? ` • ${fragmentCredits} unlock${fragmentCredits === 1 ? "" : "s"} available` : " • choose an opening when you reach 3"}
          </div>
        </div>

        <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Choice Tokens</div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-950">{inventory.choiceTokens}</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">Choose one locked opening to unlock immediately.</p>
          <div className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-600 ring-1 ring-stone-200">
            {hasChoiceToken ? "Pick your next repertoire line." : "No token ready yet."}
          </div>
        </div>
      </div>
    </BlundrCard>
  );
}
