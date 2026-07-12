"use client";

import type { StreakProgressRecord } from "@/lib/blundr/streaks/streakTypes";
import { MilestonePopup } from "./popups/MilestonePopup";

type StreakModalProps = {
  open: boolean;
  streakRecord: StreakProgressRecord | null;
  onClose: () => void;
};

export function StreakModal({ open, streakRecord, onClose }: StreakModalProps) {
  const current = Math.max(0, Number(streakRecord?.currentStreakDays) || 0);
  if (!open) return null;
  return <MilestonePopup title={current > 0 ? `${current}-day streak` : "Streak ready"} description="Keep your training rhythm going." onDismiss={onClose} />;
}
