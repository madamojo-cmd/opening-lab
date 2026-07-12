"use client";
import { Flame } from "lucide-react";
import { RewardModalBase } from "../RewardModalBase";
export function MilestonePopup({ title, description, onDismiss }: { title: string; description?: string; onDismiss: () => void }) {
  return <RewardModalBase open title={title} description={description} onClose={onDismiss} primaryLabel="Continue" onPrimaryAction={onDismiss}><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#edf5ef] text-[#2e6b4f]"><Flame size={38} aria-hidden="true" /></div></RewardModalBase>;
}
