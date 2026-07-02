import {
  DAILY_BLUNDR_SCHEMA_VERSION,
  type DailyBlundrCard,
  type DailyBlundrCardProgress,
  type DailyBlundrDifficulty,
  type DailyBlundrDomain,
  type DailyBlundrMasteryTarget,
  type DailyBlundrMasteryState,
  type DailyBlundrProgress,
  type DailyBlundrSession,
  type DailyBlundrSessionStore,
  type DailyBlundrStore,
} from "./dailyBlundrTypes";

export type { DailyBlundrStore } from "./dailyBlundrTypes";

export const DAILY_BLUNDR_SESSIONS_KEY = "blundr.daily.sessions.v1";
export const DAILY_BLUNDR_PROGRESS_KEY = "blundr.daily.progress.v1";
export const DAILY_BLUNDR_MASTERY_KEY = "blundr.daily.mastery.v1";

const DEFAULT_PROGRESS: DailyBlundrProgress = {
  schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
  currentDailyStreak: 0,
  longestDailyStreak: 0,
  dailyStreak: 0,
  lastCompletedDateKey: null,
  lastRewardDateKey: null,
  completionCount: 0,
  localDailyXp: 0,
  lastRewardClaimedAt: null,
  updatedAt: null,
};

const DEFAULT_SESSION_STORE: DailyBlundrSessionStore = {
  schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
  sessionsByDate: {},
  updatedAt: null,
};

const DEFAULT_MASTERY: DailyBlundrMasteryState = {
  schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
  records: {},
  updatedAt: null,
};

function getStorage(): Storage | undefined {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return typeof globalThis !== "undefined" && "localStorage" in globalThis ? (globalThis as { localStorage?: Storage }).localStorage : undefined;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return cloneJson(fallback);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return cloneJson(fallback);
  }
}

function getLocalDateParts(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function formatDateKey(date: Date): string {
  const { year, month, day } = getLocalDateParts(date);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addLocalDays(dateKey: string, days: number): string | null {
  const parts = dateKey.split("-").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day + days);
  return formatDateKey(date);
}

function normalizeDateKey(value: unknown): string | null {
  const text = normalizeText(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  return text;
}

function normalizeDifficulty(value: unknown): DailyBlundrDifficulty {
  return value === "intro" || value === "beginner" || value === "early_intermediate" || value === "intermediate" || value === "advanced" || value === "expert"
    ? value
    : "beginner";
}

function normalizeDomain(value: unknown): DailyBlundrDomain {
  return value === "opening_review" ||
    value === "daily_recall" ||
    value === "mini_game" ||
    value === "training_game" ||
    value === "pawn_structure" ||
    value === "key_square" ||
    value === "piece_imbalance" ||
    value === "tactical_idea" ||
    value === "special_technique"
    ? value
    : "daily_recall";
}

function normalizeMasteryTarget(raw: unknown): DailyBlundrMasteryTarget | null {
  if (!raw || typeof raw !== "object") return null;
  const target = raw as Partial<DailyBlundrMasteryTarget>;
  const conceptKey = normalizeText(target.conceptKey);
  if (!conceptKey) return null;
  return {
    conceptKey,
    domain: normalizeDomain(target.domain),
    label: normalizeText(target.label) || null,
    difficultyHint: normalizeText(target.difficultyHint) ? normalizeDifficulty(target.difficultyHint) : null,
  };
}

function normalizeCard(raw: unknown): DailyBlundrCard | null {
  if (!raw || typeof raw !== "object") return null;
  const card = raw as Partial<DailyBlundrCard> & Record<string, unknown>;
  const cardKey = normalizeText(card.cardKey ?? card.id);
  const fen = normalizeText(card.fen);
  if (!cardKey || !fen) return null;
  const masteryTargets = Array.isArray(card.masteryTargets)
    ? card.masteryTargets.map(normalizeMasteryTarget).filter((entry): entry is NonNullable<ReturnType<typeof normalizeMasteryTarget>> => Boolean(entry))
    : [];
  const signals = Array.isArray(card.signals) ? card.signals.map((entry) => normalizeText(entry)).filter(Boolean) : [];
  const source = card.source === "learning_event" || card.source === "progress_mistake" || card.source === "merged" ? card.source : "progress_mistake";
  const confidence = card.confidence === "high" || card.confidence === "medium" || card.confidence === "low" ? card.confidence : "medium";
  const difficulty = normalizeDifficulty(card.difficulty);

  return {
    source,
    cardKey,
    positionKey: normalizeText(card.positionKey) || cardKey,
    fen,
    expectedMoveUci: normalizeText(card.expectedMoveUci) || null,
    expectedMoveSan: normalizeText(card.expectedMoveSan) || null,
    playedMoveUci: normalizeText(card.playedMoveUci) || null,
    playedMoveSan: normalizeText(card.playedMoveSan) || null,
    openingId: normalizeText(card.openingId) || null,
    openingName: normalizeText(card.openingName) || null,
    patternId: normalizeText(card.patternId) || null,
    concept: normalizeText(card.concept) || null,
    count: Math.max(0, Number(card.count ?? 0) || 0),
    weight: Math.max(0, Number(card.weight ?? 0) || 0),
    lastSeenAt: normalizeText(card.lastSeenAt) || null,
    note: normalizeText(card.note) || null,
    signals,
    masteryTargets,
    confidence,
    difficulty,
    id: normalizeText(card.id) || cardKey,
    kind: card.kind === "recall" || card.kind === "mastery" || card.kind === "weak_spot" || card.kind === "mini_game" || card.kind === "training_game" ? card.kind : "recall",
    title: normalizeText(card.title) || normalizeText(card.openingName) || "Daily recall",
    prompt: normalizeText(card.prompt) || "Recall the move.",
    repertoireId: normalizeText(card.repertoireId) || null,
    deckRank: Math.max(0, Number(card.deckRank ?? 0) || 0),
    priority: Math.max(0, Number(card.priority ?? 0) || 0),
    masteryKey: normalizeText(card.masteryKey) || cardKey,
    sourceCount: Math.max(0, Number(card.sourceCount ?? 0) || 0),
    summary: normalizeText(card.summary) || normalizeText(card.title) || "Daily recall",
  };
}

function normalizeCardProgress(raw: unknown): DailyBlundrCardProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const progress = raw as Partial<DailyBlundrCardProgress>;
  return {
    attempts: Number(progress.attempts ?? 0) || 0,
    correct: Number(progress.correct ?? 0) || 0,
    incorrect: Number(progress.incorrect ?? 0) || 0,
    completed: Boolean(progress.completed),
    lastAttemptAt: normalizeText(progress.lastAttemptAt) || null,
    lastAttemptOutcome:
      progress.lastAttemptOutcome === "correct" ||
      progress.lastAttemptOutcome === "incorrect" ||
      progress.lastAttemptOutcome === "skip" ||
      progress.lastAttemptOutcome === "reveal"
        ? progress.lastAttemptOutcome
        : null,
    lastAttemptMoveUci: normalizeText(progress.lastAttemptMoveUci) || null,
    lastAttemptMoveSan: normalizeText(progress.lastAttemptMoveSan) || null,
    completedAt: normalizeText(progress.completedAt) || null,
  };
}

function normalizeAttempt(raw: unknown): DailyBlundrSession["attempts"][number] | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<DailyBlundrSession["attempts"][number]>;
  const id = normalizeText(entry.id);
  const cardId = normalizeText(entry.cardId);
  if (!id || !cardId) return null;
  const outcome = entry.outcome === "correct" || entry.outcome === "incorrect" || entry.outcome === "skip" || entry.outcome === "reveal" ? entry.outcome : "skip";
  const completedAt = normalizeText(entry.completedAt) || normalizeText(entry.createdAt) || nowIso();
  const attemptedMoveUci = normalizeText(entry.attemptedMoveUci) || normalizeText(entry.responseMoveUci) || null;
  const attemptedMoveSan = normalizeText(entry.attemptedMoveSan) || normalizeText(entry.responseMoveSan) || null;
  const responseMoveUci = normalizeText(entry.responseMoveUci) || attemptedMoveUci;
  const responseMoveSan = normalizeText(entry.responseMoveSan) || attemptedMoveSan;
  return {
    id,
    cardId,
    source: entry.source === "learning_event" || entry.source === "progress_mistake" || entry.source === "merged" ? entry.source : "progress_mistake",
    createdAt: normalizeText(entry.createdAt) || completedAt,
    completedAt,
    outcome,
    correct: Boolean(entry.correct ?? outcome === "correct"),
    attemptedMoveUci,
    attemptedMoveSan,
    responseMoveUci,
    responseMoveSan,
    expectedMoveUci: normalizeText(entry.expectedMoveUci) || null,
    expectedMoveSan: normalizeText(entry.expectedMoveSan) || null,
    usedReveal: Boolean(entry.usedReveal ?? outcome === "reveal"),
    responseTimeMs: typeof entry.responseTimeMs === "number" && Number.isFinite(entry.responseTimeMs) ? entry.responseTimeMs : null,
    note: normalizeText(entry.note) || null,
  };
}

function deriveSessionStatus(input: {
  cardOrder: string[];
  completedCardIds: string[];
  startedAt: string | null;
  attempts: DailyBlundrSession["attempts"];
}): DailyBlundrSession["status"] {
  if (!input.cardOrder.length) return "not_started";
  if (input.cardOrder.length > 0 && input.completedCardIds.length >= input.cardOrder.length) return "completed";
  if (input.startedAt || input.attempts.length > 0 || input.completedCardIds.length > 0) return "in_progress";
  return "not_started";
}

function normalizeSession(raw: unknown): DailyBlundrSession | null {
  if (!raw || typeof raw !== "object") return null;
  const session = raw as Partial<DailyBlundrSession>;
  const dateKey = normalizeDateKey(session.dateKey);
  if (!dateKey) return null;

  const cards = Array.isArray(session.cards) ? session.cards.map(normalizeCard).filter((entry): entry is DailyBlundrCard => Boolean(entry)) : [];
  const cardIds = Array.isArray(session.cardIds) ? session.cardIds.map((entry) => normalizeText(entry)).filter(Boolean) : [];
  const cardOrder = Array.isArray(session.cardOrder)
    ? session.cardOrder.map((entry) => normalizeText(entry)).filter(Boolean)
    : (cardIds.length ? cardIds.slice() : cards.map((card) => card.id));
  const completedCardIds = Array.isArray(session.completedCardIds) ? session.completedCardIds.map((entry) => normalizeText(entry)).filter(Boolean) : [];
  const attempts = Array.isArray(session.attempts) ? session.attempts.map(normalizeAttempt).filter((entry): entry is DailyBlundrSession["attempts"][number] => Boolean(entry)) : [];
  const cardProgressById: Record<string, DailyBlundrCardProgress> = {};
  if (session.cardProgressById && typeof session.cardProgressById === "object") {
    for (const [cardId, progress] of Object.entries(session.cardProgressById)) {
      const sanitized = normalizeCardProgress(progress);
      if (sanitized) cardProgressById[normalizeText(cardId)] = sanitized;
    }
  }

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    dateKey,
    status: session.status === "completed" || session.status === "in_progress" || session.status === "not_started"
      ? session.status
      : deriveSessionStatus({ cardOrder, completedCardIds, startedAt: normalizeText(session.startedAt) || null, attempts }),
    cardIds: uniqueNonEmpty(cardIds.length ? cardIds : cardOrder.length ? cardOrder : cards.map((card) => card.id)),
    cards,
    deckFingerprint: normalizeText(session.deckFingerprint),
    cardOrder,
    completedCardIds,
    currentCardId: normalizeText(session.currentCardId) || null,
    startedAt: normalizeText(session.startedAt) || null,
    completedAt: normalizeText(session.completedAt) || null,
    rewardClaimedAt: normalizeText(session.rewardClaimedAt) || normalizeText(session.rewardAwardedAt) || null,
    rewardAwardedAt: normalizeText(session.rewardAwardedAt) || normalizeText(session.rewardClaimedAt) || null,
    attempts,
    cardProgressById,
    updatedAt: normalizeText(session.updatedAt) || null,
  };
}

function normalizeSessionStore(raw: unknown): DailyBlundrSessionStore {
  if (!raw || typeof raw !== "object") return cloneJson(DEFAULT_SESSION_STORE);
  const candidate = raw as Partial<DailyBlundrSessionStore> & Record<string, unknown>;
  const sessionsByDate: Record<string, DailyBlundrSession> = {};

  if (candidate.sessionsByDate && typeof candidate.sessionsByDate === "object") {
    for (const [dateKey, value] of Object.entries(candidate.sessionsByDate)) {
      const sanitized = normalizeSession(value);
      if (sanitized) sessionsByDate[sanitized.dateKey] = sanitized;
    }
  } else {
    for (const [dateKey, value] of Object.entries(candidate)) {
      const sanitized = normalizeSession(value);
      if (sanitized) sessionsByDate[normalizeDateKey(dateKey) ?? sanitized.dateKey] = sanitized;
    }
  }

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    sessionsByDate,
    updatedAt: normalizeText(candidate.updatedAt) || null,
  };
}

function normalizeProgress(raw: unknown): DailyBlundrProgress {
  if (!raw || typeof raw !== "object") return cloneJson(DEFAULT_PROGRESS);
  const candidate = raw as Partial<DailyBlundrProgress> & Record<string, unknown>;
  const currentDailyStreak = Math.max(0, Number(candidate.currentDailyStreak ?? candidate.dailyStreak ?? 0) || 0);
  const longestDailyStreak = Math.max(currentDailyStreak, Number(candidate.longestDailyStreak ?? currentDailyStreak) || 0);
  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    currentDailyStreak,
    longestDailyStreak,
    dailyStreak: currentDailyStreak,
    lastCompletedDateKey: normalizeDateKey(candidate.lastCompletedDateKey) || null,
    lastRewardDateKey: normalizeDateKey(candidate.lastRewardDateKey) || null,
    completionCount: Math.max(0, Number(candidate.completionCount ?? 0) || 0),
    localDailyXp: Math.max(0, Number(candidate.localDailyXp ?? 0) || 0),
    lastRewardClaimedAt: normalizeText(candidate.lastRewardClaimedAt) || null,
    updatedAt: normalizeText(candidate.updatedAt) || null,
  };
}

function normalizeMastery(raw: unknown): DailyBlundrMasteryState {
  if (!raw || typeof raw !== "object") return cloneJson(DEFAULT_MASTERY);
  const candidate = raw as Partial<DailyBlundrMasteryState>;
  const records: DailyBlundrMasteryState["records"] = {};
  const rawRecords = candidate.records && typeof candidate.records === "object" ? candidate.records : {};

  for (const [key, value] of Object.entries(rawRecords)) {
    if (!value || typeof value !== "object") continue;
    const record = value as DailyBlundrMasteryState["records"][string];
    const currentMastery = Math.max(0, Math.min(1, Number(record.currentMastery ?? record.confidence ?? 0) || 0));
    const confidence = Math.max(0, Math.min(1, Number(record.confidence ?? currentMastery) || 0));
    const attempts = Math.max(0, Number(record.attempts ?? record.attemptCount ?? 0) || 0);
    const correct = Math.max(0, Number(record.correct ?? record.correctCount ?? 0) || 0);
    const incorrect = Math.max(0, Number(record.incorrect ?? record.incorrectCount ?? 0) || 0);
    records[normalizeText(key)] = {
      key: normalizeText(record.key) || normalizeText(key),
      label: normalizeText(record.label) || normalizeText(key),
      domain:
        record.domain === "opening_review" ||
        record.domain === "daily_recall" ||
        record.domain === "mini_game" ||
        record.domain === "training_game" ||
        record.domain === "pawn_structure" ||
        record.domain === "key_square" ||
        record.domain === "piece_imbalance" ||
        record.domain === "tactical_idea" ||
        record.domain === "special_technique"
          ? record.domain
          : "daily_recall",
      cardKind:
        record.cardKind === "recall" ||
        record.cardKind === "mastery" ||
        record.cardKind === "weak_spot" ||
        record.cardKind === "mini_game" ||
          record.cardKind === "training_game"
          ? record.cardKind
          : "recall",
      sources: Array.isArray(record.sources)
        ? record.sources.filter((source): source is DailyBlundrMasteryState["records"][string]["sources"][number] => source === "learning_event" || source === "progress_mistake" || source === "merged")
        : [],
      exposureCount: Math.max(0, Number(record.exposureCount ?? attempts) || 0),
      attemptCount: attempts,
      attempts,
      correctCount: correct,
      correct,
      incorrectCount: incorrect,
      incorrect,
      recentAccuracy: Math.max(0, Math.min(1, Number(record.recentAccuracy ?? 0) || 0)),
      lifetimeAccuracy: Math.max(0, Math.min(1, Number(record.lifetimeAccuracy ?? 0) || 0)),
      avgResponseTimeMs: typeof record.avgResponseTimeMs === "number" && Number.isFinite(record.avgResponseTimeMs) ? record.avgResponseTimeMs : null,
      hintRate: Math.max(0, Math.min(1, Number(record.hintRate ?? 0) || 0)),
      revealRate: Math.max(0, Math.min(1, Number(record.revealRate ?? 0) || 0)),
      currentMastery,
      confidence,
      currentDifficulty:
        record.currentDifficulty === "intro" ||
        record.currentDifficulty === "beginner" ||
        record.currentDifficulty === "early_intermediate" ||
        record.currentDifficulty === "intermediate" ||
        record.currentDifficulty === "advanced" ||
        record.currentDifficulty === "expert"
          ? record.currentDifficulty
          : currentMastery >= 0.9
            ? "expert"
            : currentMastery >= 0.78
              ? "advanced"
              : currentMastery >= 0.62
                ? "intermediate"
                : currentMastery >= 0.48
                  ? "early_intermediate"
                  : currentMastery >= 0.25
                    ? "beginner"
                    : "intro",
      streak: Math.max(0, Number(record.streak ?? 0) || 0),
      lapses: Math.max(0, Number(record.lapses ?? 0) || 0),
      firstSeenAt: normalizeText(record.firstSeenAt) || null,
      lastSeenAt: normalizeText(record.lastSeenAt) || null,
      lastAttemptAt: normalizeText(record.lastAttemptAt) || null,
      lastCorrectAt: normalizeText(record.lastCorrectAt) || null,
      lastIncorrectAt: normalizeText(record.lastIncorrectAt) || null,
      updatedAt: normalizeText(record.updatedAt) || null,
    };
  }

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    records,
    updatedAt: normalizeText(candidate.updatedAt) || null,
  };
}

export function getDailyBlundrDateKey(date = new Date()): string {
  return formatDateKey(date);
}

export function isConsecutiveDailyBlundrDateKey(previousDateKey: string | null | undefined, currentDateKey: string): boolean {
  if (!previousDateKey) return false;
  return addLocalDays(previousDateKey, 1) === currentDateKey;
}

export function getDailyBlundrStorageBundle(): DailyBlundrStore {
  return {
    sessions: loadDailyBlundrSessionStore(),
    progress: loadDailyBlundrProgress(),
    mastery: loadDailyBlundrMastery(),
  };
}

export function loadDailyBlundrStore(): DailyBlundrStore {
  return getDailyBlundrStorageBundle();
}

export function loadDailyBlundrSessionStore(): DailyBlundrSessionStore {
  const storage = getStorage();
  if (!storage) return cloneJson(DEFAULT_SESSION_STORE);
  try {
    return normalizeSessionStore(parseJson(storage.getItem(DAILY_BLUNDR_SESSIONS_KEY), DEFAULT_SESSION_STORE));
  } catch {
    return cloneJson(DEFAULT_SESSION_STORE);
  }
}

export function loadDailyBlundrProgress(): DailyBlundrProgress {
  const storage = getStorage();
  if (!storage) return cloneJson(DEFAULT_PROGRESS);
  try {
    return normalizeProgress(parseJson(storage.getItem(DAILY_BLUNDR_PROGRESS_KEY), DEFAULT_PROGRESS));
  } catch {
    return cloneJson(DEFAULT_PROGRESS);
  }
}

export function loadDailyBlundrMastery(): DailyBlundrMasteryState {
  const storage = getStorage();
  if (!storage) return cloneJson(DEFAULT_MASTERY);
  try {
    return normalizeMastery(parseJson(storage.getItem(DAILY_BLUNDR_MASTERY_KEY), DEFAULT_MASTERY));
  } catch {
    return cloneJson(DEFAULT_MASTERY);
  }
}

export function saveDailyBlundrSessionStore(store: DailyBlundrSessionStore): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DAILY_BLUNDR_SESSIONS_KEY, JSON.stringify(store));
  } catch {
    // local storage is optional for this local-first feature
  }
}

export function saveDailyBlundrProgress(progress: DailyBlundrProgress): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DAILY_BLUNDR_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // local storage is optional for this local-first feature
  }
}

export function saveDailyBlundrMastery(mastery: DailyBlundrMasteryState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DAILY_BLUNDR_MASTERY_KEY, JSON.stringify(mastery));
  } catch {
    // local storage is optional for this local-first feature
  }
}

export function saveDailyBlundrStore(store: DailyBlundrStore): void {
  saveDailyBlundrSessionStore(store.sessions);
  saveDailyBlundrProgress(store.progress);
  saveDailyBlundrMastery(store.mastery);
}

export function createEmptyDailyBlundrSession(dateKey: string, deckFingerprint = ""): DailyBlundrSession {
  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    dateKey,
    status: "not_started",
    cardIds: [],
    cards: [],
    deckFingerprint,
    cardOrder: [],
    completedCardIds: [],
    currentCardId: null,
    startedAt: null,
    completedAt: null,
    rewardClaimedAt: null,
    rewardAwardedAt: null,
    attempts: [],
    cardProgressById: {},
    updatedAt: null,
  };
}

function buildDefaultCardProgress(): DailyBlundrCardProgress {
  return {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    completed: false,
    lastAttemptAt: null,
    lastAttemptOutcome: null,
    lastAttemptMoveUci: null,
    lastAttemptMoveSan: null,
    completedAt: null,
  };
}

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function buildDeckFingerprint(cardIds: string[]): string {
  return uniqueNonEmpty(cardIds).join("|");
}

export function reconcileDailyBlundrSession(input: {
  dateKey: string;
  deck: DailyBlundrCard[];
  existing?: DailyBlundrSession | null;
}): DailyBlundrSession {
  const deckFingerprint = buildDeckFingerprint(input.deck.map((card) => card.id ?? card.cardKey));
  const deckIds = input.deck.map((card) => card.id ?? card.cardKey);
  const existing = input.existing && input.existing.dateKey === input.dateKey ? input.existing : null;
  const cardOrder = existing ? uniqueNonEmpty([...existing.cardOrder, ...deckIds]) : deckIds;
  const completedCardIds = existing ? uniqueNonEmpty(existing.completedCardIds.filter((cardId) => cardOrder.includes(cardId))) : [];
  const cardProgressById: Record<string, DailyBlundrCardProgress> = {};

  for (const cardId of cardOrder) {
    const existingProgress = existing?.cardProgressById?.[cardId];
    cardProgressById[cardId] = existingProgress ? { ...buildDefaultCardProgress(), ...existingProgress } : buildDefaultCardProgress();
    cardProgressById[cardId].completed = completedCardIds.includes(cardId) || Boolean(cardProgressById[cardId].completed);
    if (cardProgressById[cardId].completed && !cardProgressById[cardId].completedAt) {
      cardProgressById[cardId].completedAt = existing?.completedAt ?? null;
    }
  }

  const currentCards = input.deck.map((card) => ({ ...card }));
  const status = deriveSessionStatus({
    cardOrder,
    completedCardIds,
    startedAt: existing?.startedAt ?? null,
    attempts: existing?.attempts ?? [],
  });

  const currentCardId = existing?.currentCardId && cardOrder.includes(existing.currentCardId)
    ? existing.currentCardId
    : cardOrder.find((cardId) => !completedCardIds.includes(cardId)) ?? null;

  const isComplete = cardOrder.length > 0 && completedCardIds.length === cardOrder.length;

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    dateKey: input.dateKey,
    status: isComplete ? "completed" : status,
    cardIds: deckIds,
    cards: currentCards,
    deckFingerprint,
    cardOrder,
    completedCardIds,
    currentCardId: isComplete ? null : currentCardId,
    startedAt: existing?.startedAt ?? null,
    completedAt: isComplete ? existing?.completedAt ?? null : null,
    rewardClaimedAt: existing?.rewardClaimedAt ?? null,
    rewardAwardedAt: existing?.rewardAwardedAt ?? existing?.rewardClaimedAt ?? null,
    attempts: existing?.attempts ? [...existing.attempts] : [],
    cardProgressById,
    updatedAt: nowIso(),
  };
}

export function markDailyBlundrSessionStarted(session: DailyBlundrSession, at = nowIso()): DailyBlundrSession {
  return {
    ...session,
    status: session.cardOrder.length > 0 ? "in_progress" : session.status,
    startedAt: session.startedAt ?? at,
    updatedAt: at,
  };
}

export function markDailyBlundrSessionCardComplete(session: DailyBlundrSession, cardId: string, at = nowIso()): DailyBlundrSession {
  const currentProgress = session.cardProgressById[cardId] ?? buildDefaultCardProgress();
  const completedCardIds = uniqueNonEmpty([...session.completedCardIds, cardId]);
  const cardProgressById = {
    ...session.cardProgressById,
    [cardId]: {
      ...currentProgress,
      completed: true,
      completedAt: currentProgress.completedAt ?? at,
    },
  };
  const nextCardId = session.cardOrder.find((id) => !completedCardIds.includes(id)) ?? null;
  const isComplete = session.cardOrder.length > 0 && completedCardIds.length === session.cardOrder.length;

  return {
    ...session,
    completedCardIds,
    currentCardId: isComplete ? null : nextCardId,
    completedAt: isComplete ? session.completedAt ?? at : session.completedAt,
    rewardAwardedAt: session.rewardAwardedAt ?? session.rewardClaimedAt ?? null,
    status: isComplete ? "completed" : session.status === "not_started" ? "in_progress" : session.status,
    cardProgressById,
    updatedAt: at,
  };
}

export function addDailyBlundrAttempt(session: DailyBlundrSession, attempt: DailyBlundrSession["attempts"][number]): DailyBlundrSession {
  const currentProgress = session.cardProgressById[attempt.cardId] ?? buildDefaultCardProgress();
  const cardProgressById = {
    ...session.cardProgressById,
    [attempt.cardId]: {
      ...currentProgress,
      attempts: currentProgress.attempts + 1,
      correct: currentProgress.correct + (attempt.outcome === "correct" ? 1 : 0),
      incorrect: currentProgress.incorrect + (attempt.outcome === "incorrect" ? 1 : 0),
      completed: attempt.outcome === "correct" ? true : currentProgress.completed,
      lastAttemptAt: attempt.createdAt,
      lastAttemptOutcome: attempt.outcome,
      lastAttemptMoveUci: attempt.attemptedMoveUci,
      lastAttemptMoveSan: attempt.attemptedMoveSan,
      completedAt: attempt.outcome === "correct" ? currentProgress.completedAt ?? attempt.createdAt : currentProgress.completedAt,
    },
  };

  return {
    ...session,
    attempts: [...session.attempts, attempt],
    status: deriveSessionStatus({
      cardOrder: session.cardOrder,
      completedCardIds: session.completedCardIds,
      startedAt: session.startedAt,
      attempts: [...session.attempts, attempt],
    }),
    cardProgressById,
    updatedAt: attempt.createdAt,
  };
}

export function buildDailyBlundrProgressAfterCompletion(input: {
  previous: DailyBlundrProgress;
  dateKey: string;
  claimAt?: string;
}): DailyBlundrProgress {
  const claimAt = input.claimAt ?? nowIso();
  const lastCompletedDateKey = input.dateKey;
  const isStreakContinuation = isConsecutiveDailyBlundrDateKey(input.previous.lastCompletedDateKey, input.dateKey);
  const previousDailyStreak = input.previous.currentDailyStreak ?? input.previous.dailyStreak ?? 0;
  const nextDailyStreak = input.previous.lastRewardDateKey === input.dateKey
    ? previousDailyStreak
    : isStreakContinuation
      ? previousDailyStreak + 1
      : 1;
  const longestDailyStreak = Math.max(input.previous.longestDailyStreak ?? 0, nextDailyStreak);
  const nextLocalDailyXp = input.previous.lastRewardDateKey === input.dateKey ? input.previous.localDailyXp ?? 0 : (input.previous.localDailyXp ?? 0) + 10;

  return {
    schemaVersion: DAILY_BLUNDR_SCHEMA_VERSION,
    currentDailyStreak: nextDailyStreak,
    longestDailyStreak,
    dailyStreak: nextDailyStreak,
    lastCompletedDateKey,
    lastRewardDateKey: input.dateKey,
    completionCount: input.previous.lastRewardDateKey === input.dateKey ? input.previous.completionCount : input.previous.completionCount + 1,
    localDailyXp: nextLocalDailyXp,
    lastRewardClaimedAt: claimAt,
    updatedAt: claimAt,
  };
}
