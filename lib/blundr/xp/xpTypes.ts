export type XpSource =
  | "opening_run_completed"
  | "continuation_completed"
  | "daily_blundr_deck_completed"
  | "all_rings_closed"
  | "streak_milestone"
  | "manual_dev_adjustment";

export type XpEvent = {
  id: string;
  userId: string;
  source: XpSource;
  xp: number;
  createdAt: string;
  localDate?: string;
  milestoneDays?: 7 | 30;
  activityId?: string;
};

export type XpProgress = {
  userId: string;
  localDate: string;
  xpEarnedToday: number;
  xpLifetime: number;
  eventIds: string[];
  updatedAt: string;
};

