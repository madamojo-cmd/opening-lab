"use client";
import { RewardIcon } from "../RewardIcon";
import { RewardModalBase } from "../RewardModalBase";
import type { RewardPresentationModel } from "@/lib/blundr/rewards/rewardPresentationAdapter";
export function RewardGrantedPopup({ reward, title, onDismiss }: { reward: RewardPresentationModel; title: string; onDismiss: () => void }) {
  return <RewardModalBase open title={title} description={reward.description} onClose={onDismiss} primaryLabel="Done" onPrimaryAction={onDismiss}>
    <div className="text-center" data-reward-type={reward.rawRewardType} data-rarity={reward.rarity} aria-live="polite"><RewardIcon reward={{ rewardType: reward.rawRewardType, rarity: reward.rarity, displayName: reward.displayName }} variant="rewardIcon" /><div className="mt-4 text-[40px] font-extrabold leading-none text-[#24583f]">+{reward.amount}</div><div className="mt-3 text-xl font-bold text-[#173c2b]">{reward.displayName}</div></div>
  </RewardModalBase>;
}
