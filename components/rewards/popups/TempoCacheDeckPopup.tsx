"use client";
import { useState } from "react";
import { RewardModalBase } from "../RewardModalBase";
import { TempoCacheRewardCard } from "./TempoCacheRewardCard";
import type { RewardPresentationModel } from "@/lib/blundr/rewards/rewardPresentationAdapter";
export function TempoCacheDeckPopup({ reward, reducedMotion, onDismiss }: { reward: RewardPresentationModel; reducedMotion: boolean; onDismiss: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return <RewardModalBase open title="Tempo Cache" description={revealed ? "Your reward is shown on the card." : "A reward is ready to reveal."} onClose={onDismiss} primaryLabel={revealed ? "Done" : "Reveal reward"} onPrimaryAction={() => revealed ? onDismiss() : setRevealed(true)}><TempoCacheRewardCard reward={reward} revealed={revealed} reducedMotion={reducedMotion} /><span className="sr-only" aria-live="polite">{revealed ? `${reward.amount} ${reward.displayName}. ${reward.description}` : "Reward hidden until reveal."}</span></RewardModalBase>;
}
