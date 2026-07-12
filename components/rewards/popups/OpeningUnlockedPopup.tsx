"use client";
import { CheckCircle2 } from "lucide-react";
import { RewardModalBase } from "../RewardModalBase";
import type { RewardPopupUnlockSuccessEvent } from "@/lib/blundr/rewards/rewardPopupTypes";
export function OpeningUnlockedPopup({ event, onDismiss }: { event: RewardPopupUnlockSuccessEvent; onDismiss: () => void }) {
  return <RewardModalBase open title="Opening unlocked" description="Your selected opening has been unlocked." onClose={onDismiss} primaryLabel="Done" onPrimaryAction={onDismiss}><div className="text-center"><CheckCircle2 className="mx-auto text-[#2e6b4f]" size={48} /><h3 className="mt-3 text-xl font-bold">{event.openingName}</h3><p className="mt-2 text-sm text-stone-600">Unlocked with {event.methodLabel}.</p></div></RewardModalBase>;
}
