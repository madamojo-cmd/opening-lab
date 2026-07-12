"use client";
import { AlertTriangle } from "lucide-react";
import { RewardModalBase } from "../RewardModalBase";
import type { RewardPopupFailureEvent } from "@/lib/blundr/rewards/rewardPopupTypes";
export function RewardFailurePopup({ event, onDismiss }: { event: RewardPopupFailureEvent; onDismiss: () => void }) {
  return <RewardModalBase open title={event.title} description={event.message} onClose={onDismiss} primaryLabel="Dismiss" onPrimaryAction={onDismiss}><div className="rounded-2xl bg-red-50 p-4 text-red-900 ring-1 ring-red-200" data-success="false"><AlertTriangle aria-hidden="true" /><div className="mt-2 text-xs font-bold uppercase tracking-wider">{event.code}</div></div></RewardModalBase>;
}
