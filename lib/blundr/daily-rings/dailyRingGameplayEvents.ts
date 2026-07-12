import { getDailyBlundrDateKey } from "@/lib/blundr/daily/dailyBlundrStorage";
import { resolveStage2CanonicalOpeningId } from "@/lib/blundr/openings/openingIdentity";
import type { UserTrainingProfile } from "@/lib/blundr/accounts/accountTypes";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type { DailyRingCompletionResultLike } from "./dailyRingTypes";
import { markDailyBatteryComplete, markDailyBlundrComplete, markDailyTempoComplete } from "./dailyRingService";

type DailyRingGameplayProfile = Pick<UserTrainingProfile, "dailyTempoGoal" | "dailyBatteryGoal" | "dailyBlundrGoal">;

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function safeToken(value: unknown, fallback: string): string {
  const text = normalizeText(value);
  return encodeURIComponent(text || fallback);
}

function normalizeOpeningId(openingId?: string | null): string {
  const normalized = normalizeText(openingId);
  return resolveStage2CanonicalOpeningId(normalized) ?? (normalized || "unknown-opening");
}

function normalizeCompletionIndex(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const next = Math.max(0, Math.floor(Number(value) || 0));
  return Number.isFinite(next) ? String(next) : null;
}

export function buildDailyRingGameplayCompletionId(args: {
  dateKey?: string | null;
  ringId: "daily_tempo" | "daily_battery" | "daily_blundr";
  openingId?: string | null;
  sessionId?: string | null;
  fingerprint?: string | null;
}): string {
  return [
    safeToken(args.dateKey, getDailyBlundrDateKey()),
    safeToken(args.ringId, "ring"),
    safeToken(normalizeOpeningId(args.openingId), "opening"),
    safeToken(args.sessionId, "session"),
    safeToken(args.fingerprint, "fingerprint"),
  ].join(":");
}

export function buildTempoRunCompletionId(args: {
  dateKey?: string | null;
  openingId?: string | null;
  runSessionId?: string | null;
  terminalFen?: string | null;
  completionIndex?: number | null;
}): string {
  const completionIndex = normalizeCompletionIndex(args.completionIndex);
  const fingerprint = [completionIndex ? `index-${completionIndex}` : null, normalizeText(args.terminalFen) || null]
    .filter(Boolean)
    .join("|") || null;
  return buildDailyRingGameplayCompletionId({
    dateKey: args.dateKey,
    ringId: "daily_tempo",
    openingId: args.openingId,
    sessionId: args.runSessionId,
    fingerprint,
  });
}

export function buildTempoContinuationPauseCompletionId(args: {
  dateKey?: string | null;
  openingId?: string | null;
  runSessionId?: string | null;
  lineId?: string | null;
  terminalFen?: string | null;
  completionIndex?: number | null;
  pauseOccurrenceIndex?: number | null;
}): string {
  const completionIndex = normalizeCompletionIndex(args.completionIndex);
  const pauseOccurrenceIndex = normalizeCompletionIndex(args.pauseOccurrenceIndex);
  const fingerprint = [
    "tempo-continuation-pause",
    normalizeText(args.lineId) || null,
    completionIndex ? `ply-${completionIndex}` : null,
    pauseOccurrenceIndex ? `pause-${pauseOccurrenceIndex}` : null,
    normalizeText(args.terminalFen) || null,
  ]
    .filter(Boolean)
    .join("|") || null;
  return buildDailyRingGameplayCompletionId({
    dateKey: args.dateKey,
    ringId: "daily_tempo",
    openingId: args.openingId,
    sessionId: args.runSessionId,
    fingerprint,
  });
}

export function buildBatteryLineCompletionId(args: {
  dateKey?: string | null;
  openingId?: string | null;
  continuationRunId?: string | null;
  lineId?: string | null;
  checkmateFen?: string | null;
  completionIndex?: number | null;
}): string {
  const completionIndex = normalizeCompletionIndex(args.completionIndex);
  const fingerprint = [normalizeText(args.lineId) || null, normalizeText(args.checkmateFen) || null, completionIndex ? `index-${completionIndex}` : null]
    .filter(Boolean)
    .join("|") || null;
  return buildDailyRingGameplayCompletionId({
    dateKey: args.dateKey,
    ringId: "daily_battery",
    openingId: args.openingId,
    sessionId: args.continuationRunId,
    fingerprint,
  });
}

export function buildBlundrTaskCompletionId(args: {
  dateKey?: string | null;
  deckId?: string | null;
  reviewSessionId?: string | null;
  taskId?: string | null;
  completionIndex?: number | null;
}): string {
  const completionIndex = normalizeCompletionIndex(args.completionIndex);
  const fingerprint = [normalizeText(args.deckId) || null, normalizeText(args.taskId) || null, completionIndex ? `index-${completionIndex}` : null]
    .filter(Boolean)
    .join("|") || null;
  return buildDailyRingGameplayCompletionId({
    dateKey: args.dateKey,
    ringId: "daily_blundr",
    openingId: "daily-blundr",
    sessionId: args.reviewSessionId,
    fingerprint,
  });
}

export async function recordTempoRunCompleted(args: {
  userId?: string | null;
  openingId?: string | null;
  runSessionId?: string | null;
  terminalFen?: string | null;
  completionIndex?: number | null;
  dateKey?: string | null;
  completionId?: string | null;
  repertoireProgress?: RepertoireProgress | null;
  profile?: DailyRingGameplayProfile | null;
  now?: string;
}): Promise<DailyRingCompletionResultLike> {
  const completionId = normalizeText(args.completionId) || buildTempoRunCompletionId({
    dateKey: args.dateKey ?? undefined,
    openingId: args.openingId,
    runSessionId: args.runSessionId,
    terminalFen: args.terminalFen,
    completionIndex: args.completionIndex,
  });
  return markDailyTempoComplete({
    userId: args.userId,
    openingId: normalizeOpeningId(args.openingId),
    dailySessionId: normalizeText(args.runSessionId) || undefined,
    completionId,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
  });
}

export async function recordBatteryLineCompleted(args: {
  userId?: string | null;
  openingId?: string | null;
  continuationRunId?: string | null;
  lineId?: string | null;
  checkmateFen?: string | null;
  completionIndex?: number | null;
  dateKey?: string | null;
  completionId?: string | null;
  repertoireProgress?: RepertoireProgress | null;
  profile?: DailyRingGameplayProfile | null;
  now?: string;
}): Promise<DailyRingCompletionResultLike> {
  const completionId = normalizeText(args.completionId) || buildBatteryLineCompletionId({
    dateKey: args.dateKey ?? undefined,
    openingId: args.openingId,
    continuationRunId: args.continuationRunId,
    lineId: args.lineId,
    checkmateFen: args.checkmateFen,
    completionIndex: args.completionIndex,
  });
  return markDailyBatteryComplete({
    userId: args.userId,
    openingId: normalizeOpeningId(args.openingId),
    dailySessionId: normalizeText(args.continuationRunId) || undefined,
    completionId,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
  });
}

export async function recordBlundrTaskCompleted(args: {
  userId?: string | null;
  deckId?: string | null;
  reviewSessionId?: string | null;
  taskId?: string | null;
  completionIndex?: number | null;
  dateKey?: string | null;
  completionId?: string | null;
  repertoireProgress?: RepertoireProgress | null;
  profile?: DailyRingGameplayProfile | null;
  now?: string;
}): Promise<DailyRingCompletionResultLike> {
  const completionId = normalizeText(args.completionId) || buildBlundrTaskCompletionId({
    dateKey: args.dateKey ?? undefined,
    deckId: args.deckId,
    reviewSessionId: args.reviewSessionId,
    taskId: args.taskId,
    completionIndex: args.completionIndex,
  });
  return markDailyBlundrComplete({
    userId: args.userId,
    dailySessionId: normalizeText(args.reviewSessionId) || normalizeText(args.deckId) || undefined,
    completionId,
    repertoireProgress: args.repertoireProgress ?? undefined,
    profile: args.profile ?? undefined,
    now: args.now,
  });
}
