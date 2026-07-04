import {
  createDefaultDailyRetentionProgress,
  createDefaultOpeningUnlockEvent,
  createDefaultOpeningUnlockProgress,
  createDefaultRewardHistory,
  createDefaultRewardRoll,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
  createDefaultUserRepertoire,
  normalizeRatingBandId,
  normalizeStarterPackId,
} from "./accountDefaults";
import type {
  DailyRetentionProgress,
  DeveloperAuditLogEntry,
  OpeningUnlockEvent,
  OpeningUnlockProgress,
  RewardRoll,
  RewardRarity,
  VariableReward,
  StreakRecord,
  UserRepertoire,
  UserRewardHistory,
  UserTrainingProfile,
  ValidationSnapshot,
} from "./accountTypes";
import { BLUNDR_LOCAL_ACCOUNT_STORAGE_KEY, BLUNDR_LOCAL_DEMO_USER_ID } from "../persistence/persistenceKeys";
import { normalizeRepertoirePointEvent, normalizeRepertoireUnlockEvent, sortRepertoirePointEvents, sortRepertoireUnlockEvents } from "../repertoire/repertoireEvents";
import type { RepertoirePointEvent, RepertoireUnlockEvent } from "../repertoire/repertoireTypes";

export type LocalAccountBundle = {
  schemaVersion: 1;
  currentUserId: string | null;
  trainingProfilesByUserId: Record<string, UserTrainingProfile>;
  repertoiresByUserId: Record<string, UserRepertoire>;
  repertoirePointEventsByUserId: Record<string, RepertoirePointEvent[]>;
  repertoireUnlockEventsByUserId: Record<string, RepertoireUnlockEvent[]>;
  dailyRetentionProgressByKey: Record<string, DailyRetentionProgress>;
  openingUnlockProgressByUserId: Record<string, OpeningUnlockProgress[]>;
  openingUnlockEventsByUserId: Record<string, OpeningUnlockEvent[]>;
  streakRecordsByUserId: Record<string, StreakRecord>;
  rewardHistoryByUserId: Record<string, UserRewardHistory>;
  rewardRollsByUserId: Record<string, RewardRoll[]>;
  validationSnapshotsById: Record<string, ValidationSnapshot>;
  developerAuditLogById: Record<string, DeveloperAuditLogEntry>;
  updatedAt: string | null;
};

const DEFAULT_BUNDLE: LocalAccountBundle = {
  schemaVersion: 1,
  currentUserId: BLUNDR_LOCAL_DEMO_USER_ID,
  trainingProfilesByUserId: {},
  repertoiresByUserId: {},
  repertoirePointEventsByUserId: {},
  repertoireUnlockEventsByUserId: {},
  dailyRetentionProgressByKey: {},
  openingUnlockProgressByUserId: {},
  openingUnlockEventsByUserId: {},
  streakRecordsByUserId: {},
  rewardHistoryByUserId: {},
  rewardRollsByUserId: {},
  validationSnapshotsById: {},
  developerAuditLogById: {},
  updatedAt: null,
};

let memoryBundle: LocalAccountBundle | null = null;

function nowIso(): string {
  return new Date().toISOString();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function getStorage(): Storage | undefined {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return (globalThis as { localStorage?: Storage }).localStorage;
  }
  return undefined;
}

function normalizeMap<T>(value: unknown): Record<string, T> {
  if (!value || typeof value !== "object") return {};
  return { ...(value as Record<string, T>) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeTrainingProfile(raw: unknown): UserTrainingProfile | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  if (!userId) return null;
  const base = createDefaultTrainingProfile(userId, normalizeText(raw.createdAt) || nowIso());
  return {
    ...base,
    onboardingCompleted: Boolean(raw.onboardingCompleted),
    ratingBandId: normalizeRatingBandId(raw.ratingBandId),
    ratingSource:
      raw.ratingSource === "manual" ||
      raw.ratingSource === "chesscom" ||
      raw.ratingSource === "lichess" ||
      raw.ratingSource === "default"
        ? raw.ratingSource
        : "default",
    rawRating: typeof raw.rawRating === "number" && Number.isFinite(raw.rawRating) ? raw.rawRating : undefined,
    ratingTimeControl:
      raw.ratingTimeControl === "rapid" ||
      raw.ratingTimeControl === "blitz" ||
      raw.ratingTimeControl === "classical" ||
      raw.ratingTimeControl === "bullet" ||
      raw.ratingTimeControl === "unknown"
        ? raw.ratingTimeControl
        : undefined,
    preferredTrainingMode: raw.preferredTrainingMode === "plain" ? "plain" : "assisted",
    dailyTempoGoal: Math.max(1, Number(raw.dailyTempoGoal) || base.dailyTempoGoal),
    dailyBatteryGoal: Math.max(1, Number(raw.dailyBatteryGoal) || base.dailyBatteryGoal),
    dailyBlundrGoal: Math.max(1, Number(raw.dailyBlundrGoal) || base.dailyBlundrGoal),
    selectedStarterPackId: normalizeStarterPackId(raw.selectedStarterPackId),
    createdAt: normalizeText(raw.createdAt) || base.createdAt,
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeRepertoire(raw: unknown): UserRepertoire | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  if (!userId) return null;
  const base = createDefaultUserRepertoire(userId, normalizeText(raw.updatedAt) || nowIso());
  return {
    ...base,
    selectedStarterPackId: normalizeStarterPackId(raw.selectedStarterPackId),
    unlockedOpeningIds: Array.isArray(raw.unlockedOpeningIds)
      ? Array.from(new Set(raw.unlockedOpeningIds.map((entry) => normalizeText(entry)).filter(Boolean)))
      : [],
    lockedOpeningIds: Array.isArray(raw.lockedOpeningIds)
      ? Array.from(new Set(raw.lockedOpeningIds.map((entry) => normalizeText(entry)).filter(Boolean)))
      : [],
    openingUnlockPoints: Math.max(0, Number(raw.openingUnlockPoints) || 0),
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeRingProgress(raw: unknown, fallback: { type: "daily_tempo" | "daily_battery" | "daily_blundr"; goal: number }) {
  if (!isRecord(raw)) {
    return { type: fallback.type, goal: Math.max(1, fallback.goal), progress: 0, completed: false } as const;
  }
  return {
    type: raw.type === "daily_tempo" || raw.type === "daily_battery" || raw.type === "daily_blundr" ? raw.type : fallback.type,
    goal: Math.max(1, Number(raw.goal) || fallback.goal),
    progress: Math.max(0, Number(raw.progress) || 0),
    completed: Boolean(raw.completed),
    completedAt: normalizeText(raw.completedAt) || undefined,
  };
}

function normalizeDailyRetentionProgress(raw: unknown): DailyRetentionProgress | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  const localDate = normalizeText(raw.localDate);
  if (!userId || !localDate) return null;
  const tempoGoal = Math.max(1, Number(raw.dailyTempoGoal) || 10);
  const batteryGoal = Math.max(1, Number(raw.dailyBatteryGoal) || 3);
  const blundrGoal = Math.max(1, Number(raw.dailyBlundrGoal) || 1);
  const base = createDefaultDailyRetentionProgress(userId, localDate, {
    dailyTempoGoal: tempoGoal,
    dailyBatteryGoal: batteryGoal,
    dailyBlundrGoal: blundrGoal,
  }, normalizeText(raw.updatedAt) || nowIso());
  return {
    ...base,
    rings: {
      dailyTempo: normalizeRingProgress(raw.rings && isRecord(raw.rings) ? raw.rings.dailyTempo : null, { type: "daily_tempo", goal: tempoGoal }),
      dailyBattery: normalizeRingProgress(raw.rings && isRecord(raw.rings) ? raw.rings.dailyBattery : null, { type: "daily_battery", goal: batteryGoal }),
      dailyBlundr: normalizeRingProgress(raw.rings && isRecord(raw.rings) ? raw.rings.dailyBlundr : null, { type: "daily_blundr", goal: blundrGoal }),
    },
    allRingsClosed: Boolean(raw.allRingsClosed),
    xpEarned: Math.max(0, Number(raw.xpEarned) || 0),
    openingPointsEarned: Math.max(0, Number(raw.openingPointsEarned) || 0),
    streakEligible: Boolean(raw.streakEligible),
    completedAt: normalizeText(raw.completedAt) || undefined,
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeOpeningUnlockProgress(raw: unknown): OpeningUnlockProgress | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  const openingId = normalizeText(raw.openingId);
  if (!userId || !openingId) return null;
  const base = createDefaultOpeningUnlockProgress(userId, openingId, normalizeText(raw.updatedAt) || nowIso());
  return {
    ...base,
    pointsEarned: Math.max(0, Number(raw.pointsEarned) || 0),
    requiredPoints: Math.max(1, Number(raw.requiredPoints) || base.requiredPoints),
    status: raw.status === "locked" || raw.status === "in_progress" || raw.status === "unlocked" ? raw.status : "locked",
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeOpeningUnlockEvent(raw: unknown): OpeningUnlockEvent | null {
  if (!isRecord(raw)) return null;
  const id = normalizeText(raw.id);
  const userId = normalizeText(raw.userId);
  const openingId = normalizeText(raw.openingId);
  if (!id || !userId || !openingId) return null;
  return {
    ...createDefaultOpeningUnlockEvent(userId, openingId, raw.source === "daily_tempo" || raw.source === "daily_battery" || raw.source === "daily_blundr" || raw.source === "all_rings_closed" || raw.source === "reward_roll" || raw.source === "weekly_milestone" || raw.source === "monthly_milestone" || raw.source === "manual_admin_unlock" ? raw.source : "daily_blundr", Math.max(0, Number(raw.openingPointsEarned) || 0), id, normalizeText(raw.createdAt) || nowIso()),
    openingPointsEarned: Math.max(0, Number(raw.openingPointsEarned) || 0),
    createdAt: normalizeText(raw.createdAt) || nowIso(),
  };
}

function normalizeRepertoirePointEventEntry(raw: unknown): RepertoirePointEvent | null {
  return normalizeRepertoirePointEvent(raw);
}

function normalizeRepertoireUnlockEventEntry(raw: unknown): RepertoireUnlockEvent | null {
  return normalizeRepertoireUnlockEvent(raw);
}

function normalizeStreakRecord(raw: unknown): StreakRecord | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  if (!userId) return null;
  const base = createDefaultStreakRecord(userId, normalizeText(raw.updatedAt) || nowIso());
  return {
    ...base,
    currentStreak: Math.max(0, Number(raw.currentStreak) || 0),
    longestStreak: Math.max(0, Number(raw.longestStreak) || 0),
    lastCompletedLocalDate: normalizeText(raw.lastCompletedLocalDate) || undefined,
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeRewardHistory(raw: unknown): UserRewardHistory | null {
  if (!isRecord(raw)) return null;
  const userId = normalizeText(raw.userId);
  if (!userId) return null;
  const base = createDefaultRewardHistory(userId, normalizeText(raw.updatedAt) || nowIso());
  return {
    ...base,
    randomBonusPityCounter: Math.max(0, Number(raw.randomBonusPityCounter) || 0),
    lastRandomBonusAt: normalizeText(raw.lastRandomBonusAt) || undefined,
    updatedAt: normalizeText(raw.updatedAt) || base.updatedAt,
  };
}

function normalizeRewardRoll(raw: unknown): RewardRoll | null {
  if (!isRecord(raw)) return null;
  const id = normalizeText(raw.id);
  const userId = normalizeText(raw.userId);
  const trigger =
    raw.trigger === "daily_tempo_ring_closed" ||
    raw.trigger === "daily_battery_ring_closed" ||
    raw.trigger === "daily_blundr_ring_closed" ||
    raw.trigger === "all_rings_closed" ||
    raw.trigger === "three_day_streak" ||
    raw.trigger === "seven_day_streak" ||
    raw.trigger === "thirty_day_streak"
      ? raw.trigger
      : "daily_blundr_ring_closed";
  if (!id || !userId) return null;
  const reward = isRecord(raw.reward)
    ? ({
        id: normalizeText(raw.reward.id),
        rarity:
          raw.reward.rarity === "common" || raw.reward.rarity === "uncommon" || raw.reward.rarity === "rare" || raw.reward.rarity === "epic"
            ? (raw.reward.rarity as RewardRarity)
            : "common",
        rewardType:
          raw.reward.rewardType === "unlock_points" ||
          raw.reward.rewardType === "opening_fragment" ||
          raw.reward.rewardType === "opening_preview_card" ||
          raw.reward.rewardType === "choice_token" ||
          raw.reward.rewardType === "style_pack_progress"
            ? raw.reward.rewardType
            : "unlock_points",
        amount: typeof raw.reward.amount === "number" && Number.isFinite(raw.reward.amount) ? raw.reward.amount : undefined,
        openingId: normalizeText(raw.reward.openingId) || undefined,
        displayName: normalizeText(raw.reward.displayName) || "Reward",
        description: normalizeText(raw.reward.description) || "Reward granted.",
      } satisfies VariableReward)
    : undefined;
  return {
    ...createDefaultRewardRoll(userId, trigger, normalizeText(raw.seed) || id, normalizeText(raw.rolledAt) || nowIso(), Boolean(raw.didReward), reward),
    id,
    reward,
  };
}

function normalizeValidationSnapshot(raw: unknown): ValidationSnapshot | null {
  if (!isRecord(raw)) return null;
  const id = normalizeText(raw.id);
  const generatedAt = normalizeText(raw.generatedAt);
  if (!id || !generatedAt) return null;
  return {
    id,
    userId: normalizeText(raw.userId) || undefined,
    generatedAt,
    valid: Boolean(raw.valid),
    issueCount: Math.max(0, Number(raw.issueCount) || 0),
    errorCount: Math.max(0, Number(raw.errorCount) || 0),
    warningCount: Math.max(0, Number(raw.warningCount) || 0),
    reportJson: raw.reportJson ?? null,
  };
}

function normalizeDeveloperAuditLogEntry(raw: unknown): DeveloperAuditLogEntry | null {
  if (!isRecord(raw)) return null;
  const id = normalizeText(raw.id);
  if (!id) return null;
  return {
    id,
    actorUserId: normalizeText(raw.actorUserId) || null,
    targetUserId: normalizeText(raw.targetUserId) || null,
    action: normalizeText(raw.action) || "unknown",
    payload: raw.payload ?? null,
    createdAt: normalizeText(raw.createdAt) || nowIso(),
  };
}

function normalizeBundle(raw: unknown): LocalAccountBundle {
  if (!isRecord(raw)) return cloneJson(DEFAULT_BUNDLE);
  const next: LocalAccountBundle = {
    schemaVersion: 1,
    currentUserId: normalizeText(raw.currentUserId) || BLUNDR_LOCAL_DEMO_USER_ID,
    trainingProfilesByUserId: {},
    repertoiresByUserId: {},
    repertoirePointEventsByUserId: {},
    repertoireUnlockEventsByUserId: {},
    dailyRetentionProgressByKey: {},
    openingUnlockProgressByUserId: {},
    openingUnlockEventsByUserId: {},
    streakRecordsByUserId: {},
    rewardHistoryByUserId: {},
    rewardRollsByUserId: {},
    validationSnapshotsById: {},
    developerAuditLogById: {},
    updatedAt: normalizeText(raw.updatedAt) || null,
  };

  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.trainingProfilesByUserId))) {
    const profile = normalizeTrainingProfile(value);
    if (profile) next.trainingProfilesByUserId[normalizeText(userId) || profile.userId] = profile;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.repertoiresByUserId))) {
    const repertoire = normalizeRepertoire(value);
    if (repertoire) next.repertoiresByUserId[normalizeText(userId) || repertoire.userId] = repertoire;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.repertoirePointEventsByUserId))) {
    const items = Array.isArray(value) ? value.map(normalizeRepertoirePointEventEntry).filter((entry): entry is RepertoirePointEvent => Boolean(entry)) : [];
    if (items.length) next.repertoirePointEventsByUserId[normalizeText(userId)] = sortRepertoirePointEvents(items);
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.repertoireUnlockEventsByUserId))) {
    const items = Array.isArray(value) ? value.map(normalizeRepertoireUnlockEventEntry).filter((entry): entry is RepertoireUnlockEvent => Boolean(entry)) : [];
    if (items.length) next.repertoireUnlockEventsByUserId[normalizeText(userId)] = sortRepertoireUnlockEvents(items);
  }
  for (const [key, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.dailyRetentionProgressByKey))) {
    const progress = normalizeDailyRetentionProgress(value);
    if (progress) next.dailyRetentionProgressByKey[normalizeText(key) || `${progress.userId}:${progress.localDate}`] = progress;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.openingUnlockProgressByUserId))) {
    const items = Array.isArray(value) ? value.map(normalizeOpeningUnlockProgress).filter((entry): entry is OpeningUnlockProgress => Boolean(entry)) : [];
    if (items.length) next.openingUnlockProgressByUserId[normalizeText(userId)] = items;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.openingUnlockEventsByUserId))) {
    const items = Array.isArray(value) ? value.map(normalizeOpeningUnlockEvent).filter((entry): entry is OpeningUnlockEvent => Boolean(entry)) : [];
    if (items.length) next.openingUnlockEventsByUserId[normalizeText(userId)] = items;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.streakRecordsByUserId))) {
    const record = normalizeStreakRecord(value);
    if (record) next.streakRecordsByUserId[normalizeText(userId) || record.userId] = record;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.rewardHistoryByUserId))) {
    const history = normalizeRewardHistory(value);
    if (history) next.rewardHistoryByUserId[normalizeText(userId) || history.userId] = history;
  }
  for (const [userId, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.rewardRollsByUserId))) {
    const items = Array.isArray(value) ? value.map(normalizeRewardRoll).filter((entry): entry is RewardRoll => Boolean(entry)) : [];
    if (items.length) next.rewardRollsByUserId[normalizeText(userId)] = items;
  }
  for (const [id, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.validationSnapshotsById))) {
    const snapshot = normalizeValidationSnapshot(value);
    if (snapshot) next.validationSnapshotsById[normalizeText(id) || snapshot.id] = snapshot;
  }
  for (const [id, value] of Object.entries(normalizeMap<Record<string, unknown>>(raw.developerAuditLogById))) {
    const entry = normalizeDeveloperAuditLogEntry(value);
    if (entry) next.developerAuditLogById[normalizeText(id) || entry.id] = entry;
  }
  return next;
}

function readStoredBundle(): LocalAccountBundle {
  const storage = getStorage();
  if (!storage) return memoryBundle ? cloneJson(memoryBundle) : cloneJson(DEFAULT_BUNDLE);
  try {
    const raw = storage.getItem(BLUNDR_LOCAL_ACCOUNT_STORAGE_KEY);
    if (!raw) return memoryBundle ? cloneJson(memoryBundle) : cloneJson(DEFAULT_BUNDLE);
    return normalizeBundle(JSON.parse(raw));
  } catch {
    return memoryBundle ? cloneJson(memoryBundle) : cloneJson(DEFAULT_BUNDLE);
  }
}

function writeStoredBundle(bundle: LocalAccountBundle): LocalAccountBundle {
  const normalized = normalizeBundle(bundle);
  memoryBundle = cloneJson(normalized);
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(BLUNDR_LOCAL_ACCOUNT_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // local storage is optional for local demo and test flows
    }
  }
  return cloneJson(normalized);
}

export function readLocalAccountBundle(): LocalAccountBundle {
  return readStoredBundle();
}

export function writeLocalAccountBundle(bundle: LocalAccountBundle): LocalAccountBundle {
  return writeStoredBundle(bundle);
}

export function updateLocalAccountBundle(updater: (bundle: LocalAccountBundle) => LocalAccountBundle): LocalAccountBundle {
  return writeStoredBundle(updater(readStoredBundle()));
}

export function getLocalAccountCurrentUserId(): string {
  return normalizeText(readStoredBundle().currentUserId) || BLUNDR_LOCAL_DEMO_USER_ID;
}

export function setLocalAccountCurrentUserId(userId: string): string {
  const normalized = normalizeText(userId) || BLUNDR_LOCAL_DEMO_USER_ID;
  updateLocalAccountBundle((bundle) => ({ ...bundle, currentUserId: normalized, updatedAt: nowIso() }));
  return normalized;
}

export function resetLocalAccountState(userId?: string): LocalAccountBundle {
  const next = cloneJson(DEFAULT_BUNDLE);
  if (userId) next.currentUserId = normalizeText(userId) || BLUNDR_LOCAL_DEMO_USER_ID;
  return writeStoredBundle(next);
}

export function getLocalTrainingProfile(userId: string): UserTrainingProfile | null {
  return cloneJson(readStoredBundle().trainingProfilesByUserId[normalizeText(userId)] ?? null);
}

export function upsertLocalTrainingProfile(profile: UserTrainingProfile): UserTrainingProfile {
  const normalized = normalizeTrainingProfile(profile) ?? createDefaultTrainingProfile(normalizeText(profile.userId) || getLocalAccountCurrentUserId());
  updateLocalAccountBundle((bundle) => {
    bundle.trainingProfilesByUserId[normalized.userId] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalUserRepertoire(userId: string): UserRepertoire | null {
  return cloneJson(readStoredBundle().repertoiresByUserId[normalizeText(userId)] ?? null);
}

export function upsertLocalUserRepertoire(repertoire: UserRepertoire): UserRepertoire {
  const normalized = normalizeRepertoire(repertoire) ?? createDefaultUserRepertoire(normalizeText(repertoire.userId) || getLocalAccountCurrentUserId());
  updateLocalAccountBundle((bundle) => {
    bundle.repertoiresByUserId[normalized.userId] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalRepertoirePointEvents(userId: string): RepertoirePointEvent[] {
  return cloneJson(readStoredBundle().repertoirePointEventsByUserId[normalizeText(userId)] ?? []);
}

export function appendLocalRepertoirePointEvent(event: RepertoirePointEvent): RepertoirePointEvent {
  const normalized = normalizeRepertoirePointEventEntry(event) ?? {
    ...event,
    id: String(event.id ?? "").trim() || `${normalizeText(event.userId)}:${Date.now()}`,
    userId: normalizeText(event.userId) || getLocalAccountCurrentUserId(),
    source: event.source,
    points: Math.max(0, Number(event.points) || 0),
    openingId: normalizeText(event.openingId) || undefined,
    dailySessionId: normalizeText(event.dailySessionId) || undefined,
    createdAt: normalizeText(event.createdAt) || nowIso(),
  };
  const current = getLocalRepertoirePointEvents(normalized.userId);
  const next = sortRepertoirePointEvents([...current.filter((entry) => entry.id !== normalized.id), normalized]);
  updateLocalAccountBundle((bundle) => {
    bundle.repertoirePointEventsByUserId[normalized.userId] = next;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.createdAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalRepertoireUnlockEvents(userId: string): RepertoireUnlockEvent[] {
  return cloneJson(readStoredBundle().repertoireUnlockEventsByUserId[normalizeText(userId)] ?? []);
}

export function appendLocalRepertoireUnlockEvent(event: RepertoireUnlockEvent): RepertoireUnlockEvent {
  const normalized = normalizeRepertoireUnlockEventEntry(event) ?? {
    ...event,
    id: String(event.id ?? "").trim() || `${normalizeText(event.userId)}:${normalizeText(event.openingId)}:${Date.now()}`,
    userId: normalizeText(event.userId) || getLocalAccountCurrentUserId(),
    openingId: normalizeText(event.openingId) || "unknown",
    pointsSpent: Math.max(0, Number(event.pointsSpent) || 0),
    unlockIndex: Math.max(1, Number(event.unlockIndex) || 1),
    createdAt: normalizeText(event.createdAt) || nowIso(),
  };
  const current = getLocalRepertoireUnlockEvents(normalized.userId);
  const next = sortRepertoireUnlockEvents([...current.filter((entry) => entry.id !== normalized.id), normalized]);
  updateLocalAccountBundle((bundle) => {
    bundle.repertoireUnlockEventsByUserId[normalized.userId] = next;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.createdAt;
    return bundle;
  });
  return cloneJson(normalized);
}

function dailyRetentionKey(userId: string, localDate: string): string {
  return `${normalizeText(userId)}:${normalizeText(localDate)}`;
}

export function getLocalDailyRetentionProgress(userId: string, localDate: string): DailyRetentionProgress | null {
  return cloneJson(readStoredBundle().dailyRetentionProgressByKey[dailyRetentionKey(userId, localDate)] ?? null);
}

export function upsertLocalDailyRetentionProgress(progress: DailyRetentionProgress): DailyRetentionProgress {
  const normalized = normalizeDailyRetentionProgress(progress) ?? createDefaultDailyRetentionProgress(normalizeText(progress.userId) || getLocalAccountCurrentUserId(), normalizeText(progress.localDate) || new Date().toISOString().slice(0, 10));
  updateLocalAccountBundle((bundle) => {
    bundle.dailyRetentionProgressByKey[dailyRetentionKey(normalized.userId, normalized.localDate)] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalOpeningUnlockProgress(userId: string): OpeningUnlockProgress[] {
  return cloneJson(readStoredBundle().openingUnlockProgressByUserId[normalizeText(userId)] ?? []);
}

export function upsertLocalOpeningUnlockProgress(progress: OpeningUnlockProgress): OpeningUnlockProgress[] {
  const normalized = normalizeOpeningUnlockProgress(progress) ?? createDefaultOpeningUnlockProgress(normalizeText(progress.userId) || getLocalAccountCurrentUserId(), normalizeText(progress.openingId) || "unknown");
  const current = getLocalOpeningUnlockProgress(normalized.userId);
  const next = [...current.filter((entry) => entry.openingId !== normalized.openingId), normalized];
  updateLocalAccountBundle((bundle) => {
    bundle.openingUnlockProgressByUserId[normalized.userId] = next;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(next);
}

export function getLocalOpeningUnlockEvents(userId: string): OpeningUnlockEvent[] {
  return cloneJson(readStoredBundle().openingUnlockEventsByUserId[normalizeText(userId)] ?? []);
}

export function appendLocalOpeningUnlockEvent(event: OpeningUnlockEvent): OpeningUnlockEvent {
  const normalized = normalizeOpeningUnlockEvent(event) ?? createDefaultOpeningUnlockEvent(normalizeText(event.userId) || getLocalAccountCurrentUserId(), normalizeText(event.openingId) || "unknown", event.source, Math.max(0, Number(event.openingPointsEarned) || 0), normalizeText(event.id) || `${normalizeText(event.userId)}:${normalizeText(event.openingId)}:${Date.now()}`, normalizeText(event.createdAt) || nowIso());
  const current = getLocalOpeningUnlockEvents(normalized.userId);
  updateLocalAccountBundle((bundle) => {
    bundle.openingUnlockEventsByUserId[normalized.userId] = [...current.filter((entry) => entry.id !== normalized.id), normalized];
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.createdAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalStreakRecord(userId: string): StreakRecord | null {
  return cloneJson(readStoredBundle().streakRecordsByUserId[normalizeText(userId)] ?? null);
}

export function upsertLocalStreakRecord(record: StreakRecord): StreakRecord {
  const normalized = normalizeStreakRecord(record) ?? createDefaultStreakRecord(normalizeText(record.userId) || getLocalAccountCurrentUserId());
  updateLocalAccountBundle((bundle) => {
    bundle.streakRecordsByUserId[normalized.userId] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalRewardHistory(userId: string): UserRewardHistory | null {
  return cloneJson(readStoredBundle().rewardHistoryByUserId[normalizeText(userId)] ?? null);
}

export function upsertLocalRewardHistory(history: UserRewardHistory): UserRewardHistory {
  const normalized = normalizeRewardHistory(history) ?? createDefaultRewardHistory(normalizeText(history.userId) || getLocalAccountCurrentUserId());
  updateLocalAccountBundle((bundle) => {
    bundle.rewardHistoryByUserId[normalized.userId] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.updatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function getLocalRewardRolls(userId: string): RewardRoll[] {
  return cloneJson(readStoredBundle().rewardRollsByUserId[normalizeText(userId)] ?? []);
}

export function appendLocalRewardRoll(roll: RewardRoll): RewardRoll {
  const normalized = normalizeRewardRoll(roll) ?? createDefaultRewardRoll(normalizeText(roll.userId) || getLocalAccountCurrentUserId(), roll.trigger, normalizeText(roll.seed) || normalizeText(roll.id) || nowIso(), normalizeText(roll.rolledAt) || nowIso(), Boolean(roll.didReward), roll.reward);
  const current = getLocalRewardRolls(normalized.userId);
  updateLocalAccountBundle((bundle) => {
    bundle.rewardRollsByUserId[normalized.userId] = [...current.filter((entry) => entry.id !== normalized.id), normalized];
    bundle.currentUserId = bundle.currentUserId ?? normalized.userId;
    bundle.updatedAt = normalized.rolledAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function saveLocalValidationSnapshot(snapshot: ValidationSnapshot): ValidationSnapshot {
  const normalized = normalizeValidationSnapshot(snapshot) ?? cloneJson(snapshot);
  updateLocalAccountBundle((bundle) => {
    bundle.validationSnapshotsById[normalized.id] = normalized;
    bundle.currentUserId = bundle.currentUserId ?? (normalizeText(normalized.userId) || bundle.currentUserId);
    bundle.updatedAt = normalized.generatedAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function readLocalValidationSnapshots(): ValidationSnapshot[] {
  return Object.values(readStoredBundle().validationSnapshotsById).map((snapshot) => cloneJson(snapshot));
}

export function appendLocalDeveloperAuditLog(entry: DeveloperAuditLogEntry): DeveloperAuditLogEntry {
  const normalized = normalizeDeveloperAuditLogEntry(entry) ?? { ...entry, id: normalizeText(entry.id) || `${normalizeText(entry.actorUserId)}:${normalizeText(entry.action)}:${nowIso()}`, action: normalizeText(entry.action) || "unknown", createdAt: normalizeText(entry.createdAt) || nowIso(), actorUserId: normalizeText(entry.actorUserId) || null, targetUserId: normalizeText(entry.targetUserId) || null, payload: entry.payload ?? null };
  updateLocalAccountBundle((bundle) => {
    bundle.developerAuditLogById[normalized.id] = normalized;
    bundle.updatedAt = normalized.createdAt;
    return bundle;
  });
  return cloneJson(normalized);
}

export function readLocalDeveloperAuditLog(): DeveloperAuditLogEntry[] {
  return Object.values(readStoredBundle().developerAuditLogById).map((entry) => cloneJson(entry));
}

export function getLocalDemoUserId(): string {
  const current = getLocalAccountCurrentUserId();
  if (current) return current;
  return setLocalAccountCurrentUserId(BLUNDR_LOCAL_DEMO_USER_ID);
}
