import { isConsecutiveLocalDate } from "../daily-rings/dailyRingDate";
import { getStreakMilestoneBonusesForStreakDays } from "./streakMilestones";
import type { StreakMilestoneBonus, StreakProgressRecord } from "./streakTypes";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeDays(value: unknown): number {
  return Math.max(0, Number(value) || 0);
}

export function createDefaultStreakRecord(userId: string, now = nowIso()): StreakProgressRecord {
  return {
    userId: normalizeText(userId),
    currentStreakDays: 0,
    longestStreakDays: 0,
    totalAllRingsClosedDays: 0,
    updatedAt: now,
  };
}

export function applyAllRingsClosedDay(streakRecord: StreakProgressRecord, localDate: string, now = nowIso()): StreakProgressRecord {
  const normalizedDate = normalizeText(localDate);
  const previous = normalizeStreakRecord(streakRecord);
  if (!normalizedDate) return previous;
  if (previous.lastCompletedLocalDate === normalizedDate) {
    return {
      ...previous,
      updatedAt: now,
    };
  }
  const currentStreakDays = previous.lastCompletedLocalDate && isConsecutiveLocalDate(previous.lastCompletedLocalDate, normalizedDate)
    ? previous.currentStreakDays + 1
    : 1;
  return {
    ...previous,
    currentStreakDays,
    longestStreakDays: Math.max(previous.longestStreakDays, currentStreakDays),
    totalAllRingsClosedDays: previous.totalAllRingsClosedDays + 1,
    lastCompletedLocalDate: normalizedDate,
    updatedAt: now,
  };
}

export function getStreakMilestoneBonuses(streakRecord: StreakProgressRecord, localDate: string): StreakMilestoneBonus[] {
  const normalized = normalizeStreakRecord(streakRecord);
  return getStreakMilestoneBonusesForStreakDays({
    userId: normalized.userId,
    localDate: normalizeText(localDate),
    currentStreakDays: normalized.currentStreakDays,
  });
}

export function isConsecutiveLocalDateWrapper(previousDate: string | null | undefined, currentDate: string): boolean {
  return isConsecutiveLocalDate(previousDate, currentDate);
}

function normalizeStreakRecord(streakRecord: StreakProgressRecord): StreakProgressRecord {
  return {
    userId: normalizeText(streakRecord.userId),
    currentStreakDays: normalizeDays(streakRecord.currentStreakDays),
    longestStreakDays: normalizeDays(streakRecord.longestStreakDays),
    totalAllRingsClosedDays: normalizeDays(streakRecord.totalAllRingsClosedDays),
    lastCompletedLocalDate: normalizeText(streakRecord.lastCompletedLocalDate) || undefined,
    updatedAt: normalizeText(streakRecord.updatedAt) || nowIso(),
  };
}

