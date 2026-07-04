import type { StreakMilestoneBonus } from "./streakTypes";

export const STREAK_MILESTONES = {
  sevenDay: {
    milestoneDays: 7,
    pointsAwarded: 35,
    xpAwarded: 250,
  },
  thirtyDay: {
    milestoneDays: 30,
    pointsAwarded: 150,
    xpAwarded: 1000,
  },
} as const satisfies Record<string, StreakMilestoneBonus>;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeDays(days: number): number {
  return Math.max(1, Math.floor(Number(days) || 1));
}

export function getAllStreakMilestones(): readonly StreakMilestoneBonus[] {
  return [STREAK_MILESTONES.sevenDay, STREAK_MILESTONES.thirtyDay];
}

export function getStreakMilestoneByDays(days: number): StreakMilestoneBonus | null {
  const normalized = normalizeDays(days);
  if (normalized === 7) return STREAK_MILESTONES.sevenDay;
  if (normalized === 30) return STREAK_MILESTONES.thirtyDay;
  return null;
}

export function buildStreakMilestoneEventId(userId: string, localDate: string, milestoneDays: 7 | 30, currentStreakDays: number): string {
  return `streak-${milestoneDays}:${normalizeText(userId) || "user"}:${normalizeText(localDate) || "date"}:${normalizeDays(currentStreakDays)}`;
}

export function getStreakMilestoneBonusesForStreakDays(args: {
  userId: string;
  localDate: string;
  currentStreakDays: number;
  alreadyAwardedEventIds?: readonly string[];
}): StreakMilestoneBonus[] {
  const currentStreakDays = normalizeDays(args.currentStreakDays);
  const alreadyAwardedEventIds = new Set((args.alreadyAwardedEventIds ?? []).map((entry) => normalizeText(entry)).filter(Boolean));
  const bonuses: StreakMilestoneBonus[] = [];
  for (const milestone of getAllStreakMilestones()) {
    const eventId = buildStreakMilestoneEventId(args.userId, args.localDate, milestone.milestoneDays, currentStreakDays);
    if (alreadyAwardedEventIds.has(eventId)) continue;
    if (currentStreakDays >= milestone.milestoneDays && currentStreakDays % milestone.milestoneDays === 0) {
      bonuses.push({
        milestoneDays: milestone.milestoneDays,
        pointsAwarded: milestone.pointsAwarded,
        xpAwarded: milestone.xpAwarded,
        eventId,
      });
    }
  }
  return bonuses;
}

