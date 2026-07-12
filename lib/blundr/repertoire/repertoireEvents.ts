import type { RepertoirePointEvent, RepertoirePointSource, RepertoireUnlockEvent } from "./repertoireTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function safeIso(value: unknown, fallback = new Date().toISOString()): string {
  const text = normalizeText(value);
  if (!text) return fallback;
  const time = Date.parse(text);
  return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
}

function compareByCreatedAt<T extends { createdAt: string; id: string }>(a: T, b: T): number {
  const aTime = Date.parse(a.createdAt);
  const bTime = Date.parse(b.createdAt);
  if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
  return a.id.localeCompare(b.id);
}

export function createRepertoirePointEventId(args: {
  userId: string;
  source: RepertoirePointSource;
  points: number;
  openingId?: string;
  dailySessionId?: string;
  createdAt?: string;
}): string {
  return [
    normalizeText(args.userId) || "user",
    normalizeText(args.source) || "source",
    Math.max(0, Number(args.points) || 0),
    normalizeText(args.openingId) || "opening",
    normalizeText(args.dailySessionId) || "session",
    safeIso(args.createdAt),
  ].join(":");
}

export function createRepertoireUnlockEventId(args: {
  userId: string;
  openingId: string;
  unlockIndex: number;
  createdAt?: string;
  sourceEventId?: string;
}): string {
  return [
    normalizeText(args.userId) || "user",
    normalizeText(args.openingId) || "opening",
    Math.max(1, Number(args.unlockIndex) || 1),
    safeIso(args.createdAt),
    normalizeText(args.sourceEventId) || "attempt",
  ].join(":");
}

export function normalizeRepertoirePointEvent(raw: unknown): RepertoirePointEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Partial<RepertoirePointEvent> & Record<string, unknown>;
  const id = normalizeText(input.id);
  const userId = normalizeText(input.userId);
  const source =
    input.source === "opening_run_completed" ||
    input.source === "continuation_completed" ||
    input.source === "daily_blundr_deck_completed" ||
    input.source === "reward_bonus" ||
    input.source === "manual_dev_adjustment"
      ? input.source
      : "manual_dev_adjustment";
  if (!id || !userId) return null;
  return {
    id,
    userId,
    source,
    points: Math.max(0, Number(input.points) || 0),
    openingId: normalizeText(input.openingId) || undefined,
    dailySessionId: normalizeText(input.dailySessionId) || undefined,
    createdAt: safeIso(input.createdAt),
  };
}

export function normalizeRepertoireUnlockEvent(raw: unknown): RepertoireUnlockEvent | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const input = raw as Partial<RepertoireUnlockEvent> & Record<string, unknown>;
  const id = normalizeText(input.id);
  const userId = normalizeText(input.userId);
  const openingId = normalizeText(input.openingId);
  if (!id || !userId || !openingId) return null;
  return {
    id,
    userId,
    openingId,
    pointsSpent: Math.max(0, Number(input.pointsSpent) || 0),
    unlockIndex: Math.max(1, Number(input.unlockIndex) || 1),
    createdAt: safeIso(input.createdAt),
  };
}

export function sortRepertoirePointEvents(events: readonly RepertoirePointEvent[]): RepertoirePointEvent[] {
  const byId = new Map<string, RepertoirePointEvent>();
  for (const event of events) {
    const normalized = normalizeRepertoirePointEvent(event);
    if (!normalized) continue;
    byId.set(normalized.id, normalized);
  }
  return Array.from(byId.values()).sort(compareByCreatedAt);
}

export function sortRepertoireUnlockEvents(events: readonly RepertoireUnlockEvent[]): RepertoireUnlockEvent[] {
  const byId = new Map<string, RepertoireUnlockEvent>();
  for (const event of events) {
    const normalized = normalizeRepertoireUnlockEvent(event);
    if (!normalized) continue;
    byId.set(normalized.id, normalized);
  }
  return Array.from(byId.values()).sort(compareByCreatedAt);
}

export function getRepertoirePointEventTotal(events: readonly RepertoirePointEvent[]): number {
  return events.reduce((total, event) => total + Math.max(0, Number(event.points) || 0), 0);
}

export function getRepertoireUnlockSpendTotal(events: readonly RepertoireUnlockEvent[]): number {
  return events.reduce((total, event) => total + Math.max(0, Number(event.pointsSpent) || 0), 0);
}
