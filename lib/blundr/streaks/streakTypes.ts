export type StreakProgressRecord = {
  userId: string;
  currentStreakDays: number;
  longestStreakDays: number;
  totalAllRingsClosedDays: number;
  lastCompletedLocalDate?: string;
  updatedAt: string;
};

export type StreakMilestoneBonus = {
  milestoneDays: 7 | 30;
  pointsAwarded: number;
  xpAwarded: number;
  eventId: string;
};

