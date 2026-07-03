import type {
  DailyBlundrDifficulty,
  DailyBlundrDomain,
  DailyBlundrMasteryTarget,
} from "./dailyBlundrTypes";
import {
  DAILY_BLUNDR_REVIEW_SCHEMA_VERSION,
  type DailyBlundrFailureType,
  type DailyBlundrPromptKind,
  type DailyBlundrReviewAttempt,
  type DailyBlundrReviewCard,
  type DailyBlundrReviewCardStatus,
} from "./dailyBlundrReviewTypes";
import { upsertDailyBlundrReviewCards as mergeDailyBlundrReviewCards } from "./dailyBlundrReviewCards";

export const DAILY_BLUNDR_REVIEW_CARDS_KEY = "blundr.daily.reviewCards.v1";
export const DAILY_BLUNDR_REVIEW_ATTEMPTS_KEY = "blundr.daily.reviewAttempts.v1";

type ReviewCardStore = {
  schemaVersion: typeof DAILY_BLUNDR_REVIEW_SCHEMA_VERSION;
  cards: DailyBlundrReviewCard[];
  updatedAt: string | null;
};

type ReviewAttemptStore = {
  schemaVersion: typeof DAILY_BLUNDR_REVIEW_SCHEMA_VERSION;
  attempts: DailyBlundrReviewAttempt[];
  updatedAt: string | null;
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

function normalizeDomain(value: unknown): DailyBlundrDomain {
  return value === "opening_review" ||
    value === "daily_recall" ||
    value === "mini_game" ||
    value === "training_target" ||
    value === "training_game" ||
    value === "pawn_structure" ||
    value === "key_square" ||
    value === "piece_imbalance" ||
    value === "tactical_idea" ||
    value === "special_technique"
    ? value
    : "daily_recall";
}

function normalizeDifficulty(value: unknown): DailyBlundrDifficulty {
  return value === "intro" || value === "beginner" || value === "early_intermediate" || value === "intermediate" || value === "advanced" || value === "expert"
    ? value
    : "beginner";
}

function normalizePromptKind(value: unknown): DailyBlundrPromptKind {
  return value === "target_move_recall" || value === "review_prompt" || value === "reveal_review" ? value : "target_move_recall";
}

function normalizeFailureType(value: unknown): DailyBlundrFailureType {
  return value === "wrong_book_move" ||
    value === "hint_dependency" ||
    value === "reveal_dependency" ||
    value === "slow_recall" ||
    value === "wrong_piece_selected" ||
    value === "illegal_move_attempt" ||
    value === "other"
    ? value
    : "other";
}

function normalizeReviewCardStatus(value: unknown): DailyBlundrReviewCardStatus {
  return value === "new" || value === "learning" || value === "review" || value === "mastered" || value === "leech" || value === "suspended"
    ? value
    : "new";
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

function normalizeReviewCard(raw: unknown): DailyBlundrReviewCard | null {
  if (!raw || typeof raw !== "object") return null;
  const card = raw as Partial<DailyBlundrReviewCard> & Record<string, unknown>;
  const id = normalizeText(card.id);
  const dedupeKey = normalizeText(card.dedupeKey);
  const fen = normalizeText(card.fen);
  const positionHash = normalizeText(card.positionHash);
  const createdAt = normalizeText(card.createdAt) || nowIso();
  const updatedAt = normalizeText(card.updatedAt) || createdAt;
  const dueAt = normalizeText(card.dueAt) || createdAt;
  if (!id || !dedupeKey || !fen || !positionHash) return null;
  const masteryTargets = Array.isArray(card.masteryTargets)
    ? card.masteryTargets.map(normalizeMasteryTarget).filter((target): target is DailyBlundrMasteryTarget => Boolean(target))
    : [];
  const signals = Array.isArray(card.signals) ? card.signals.map((signal) => normalizeText(signal)).filter(Boolean) : [];
  const sourceCard = card.sourceCard && typeof card.sourceCard === "object" ? (card.sourceCard as DailyBlundrReviewCard["sourceCard"]) : null;

  return {
    schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION,
    id,
    dedupeKey,
    status: normalizeReviewCardStatus(card.status),
    promptKind: normalizePromptKind(card.promptKind),
    sourceCard,
    source: card.source === "learning_event" || card.source === "progress_mistake" || card.source === "daily_attempt" || card.source === "merged" ? card.source : "progress_mistake",
    fen,
    positionHash,
    expectedMoveUci: normalizeText(card.expectedMoveUci) || null,
    expectedMoveSan: normalizeText(card.expectedMoveSan) || null,
    playedMoveUci: normalizeText(card.playedMoveUci) || null,
    playedMoveSan: normalizeText(card.playedMoveSan) || null,
    openingId: normalizeText(card.openingId) || null,
    repertoireId: normalizeText(card.repertoireId) || null,
    openingName: normalizeText(card.openingName) || null,
    domain: normalizeDomain(card.domain),
    masteryTargets,
    failureType: normalizeFailureType(card.failureType),
    severity: Math.min(5, Math.max(1, Number(card.severity ?? 1) || 1)) as DailyBlundrReviewCard["severity"],
    signals,
    dueAt,
    intervalDays: Math.max(0, Number(card.intervalDays ?? 0) || 0),
    ease: Math.max(1.3, Math.min(3, Number(card.ease ?? 2.35) || 2.35)),
    correctStreak: Math.max(0, Number(card.correctStreak ?? 0) || 0),
    lapses: Math.max(0, Number(card.lapses ?? 0) || 0),
    totalAttempts: Math.max(0, Number(card.totalAttempts ?? 0) || 0),
    revealUses: Math.max(0, Number(card.revealUses ?? 0) || 0),
    avgResponseTimeMs: typeof card.avgResponseTimeMs === "number" && Number.isFinite(card.avgResponseTimeMs) ? card.avgResponseTimeMs : null,
    lastReviewedAt: normalizeText(card.lastReviewedAt) || null,
    createdAt,
    updatedAt,
  };
}

function normalizeReviewAttempt(raw: unknown): DailyBlundrReviewAttempt | null {
  if (!raw || typeof raw !== "object") return null;
  const attempt = raw as Partial<DailyBlundrReviewAttempt>;
  const id = normalizeText(attempt.id);
  const reviewCardId = normalizeText(attempt.reviewCardId);
  const completedAt = normalizeText(attempt.completedAt);
  if (!id || !reviewCardId || !completedAt) return null;
  return {
    schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION,
    id,
    reviewCardId,
    sessionId: normalizeText(attempt.sessionId) || null,
    cardId: normalizeText(attempt.cardId) || null,
    startedAt: normalizeText(attempt.startedAt) || null,
    completedAt,
    grade: attempt.grade === "AGAIN" || attempt.grade === "HARD" || attempt.grade === "GOOD" || attempt.grade === "EASY" ? attempt.grade : "GOOD",
    score: typeof attempt.score === "number" && Number.isFinite(attempt.score) ? attempt.score : 0,
    correct: Boolean(attempt.correct),
    partialCredit: typeof attempt.partialCredit === "number" && Number.isFinite(attempt.partialCredit) ? attempt.partialCredit : 0,
    responseMoveUci: normalizeText(attempt.responseMoveUci) || null,
    usedReveal: Boolean(attempt.usedReveal),
    responseTimeMs: typeof attempt.responseTimeMs === "number" && Number.isFinite(attempt.responseTimeMs) ? attempt.responseTimeMs : null,
    failureType:
      attempt.failureType === "wrong_book_move" ||
      attempt.failureType === "hint_dependency" ||
      attempt.failureType === "reveal_dependency" ||
      attempt.failureType === "slow_recall" ||
      attempt.failureType === "wrong_piece_selected" ||
      attempt.failureType === "illegal_move_attempt" ||
      attempt.failureType === "other"
        ? attempt.failureType
        : null,
  };
}

function readStoredCards(): ReviewCardStore | ReviewAttemptStore | DailyBlundrReviewCard[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return parseJson(storage.getItem(DAILY_BLUNDR_REVIEW_CARDS_KEY), { schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION, cards: [], updatedAt: null });
  } catch {
    return null;
  }
}

function readStoredAttempts(): ReviewAttemptStore | DailyBlundrReviewAttempt[] | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return parseJson(storage.getItem(DAILY_BLUNDR_REVIEW_ATTEMPTS_KEY), { schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION, attempts: [], updatedAt: null });
  } catch {
    return null;
  }
}

function normalizeCardEnvelope(raw: unknown): DailyBlundrReviewCard[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeReviewCard).filter((card): card is DailyBlundrReviewCard => Boolean(card));
  }
  if (typeof raw !== "object") return [];
  const candidate = raw as Partial<ReviewCardStore> & Record<string, unknown>;
  if (Array.isArray(candidate.cards)) {
    return candidate.cards.map(normalizeReviewCard).filter((card): card is DailyBlundrReviewCard => Boolean(card));
  }
  if (Array.isArray(candidate.reviewCards)) {
    return candidate.reviewCards.map(normalizeReviewCard).filter((card): card is DailyBlundrReviewCard => Boolean(card));
  }
  return [];
}

function normalizeAttemptEnvelope(raw: unknown): DailyBlundrReviewAttempt[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(normalizeReviewAttempt).filter((attempt): attempt is DailyBlundrReviewAttempt => Boolean(attempt));
  }
  if (typeof raw !== "object") return [];
  const candidate = raw as Partial<ReviewAttemptStore> & Record<string, unknown>;
  if (Array.isArray(candidate.attempts)) {
    return candidate.attempts.map(normalizeReviewAttempt).filter((attempt): attempt is DailyBlundrReviewAttempt => Boolean(attempt));
  }
  if (Array.isArray(candidate.reviewAttempts)) {
    return candidate.reviewAttempts.map(normalizeReviewAttempt).filter((attempt): attempt is DailyBlundrReviewAttempt => Boolean(attempt));
  }
  return [];
}

export function readDailyBlundrReviewCards(): DailyBlundrReviewCard[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = readStoredCards();
  return normalizeCardEnvelope(raw);
}

export function writeDailyBlundrReviewCards(cards: readonly DailyBlundrReviewCard[]): DailyBlundrReviewCard[] {
  const storage = getStorage();
  const normalized = normalizeCardEnvelope({ schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION, cards: cloneJson(cards), updatedAt: nowIso() });
  if (!storage) return normalized;
  try {
    storage.setItem(
      DAILY_BLUNDR_REVIEW_CARDS_KEY,
      JSON.stringify({
        schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION,
        cards: normalized,
        updatedAt: nowIso(),
      }),
    );
  } catch {
    // local storage is optional for this local-first feature
  }
  return normalized;
}

export function readDailyBlundrReviewAttempts(): DailyBlundrReviewAttempt[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = readStoredAttempts();
  return normalizeAttemptEnvelope(raw);
}

export function writeDailyBlundrReviewAttempts(attempts: readonly DailyBlundrReviewAttempt[]): DailyBlundrReviewAttempt[] {
  const storage = getStorage();
  const normalized = normalizeAttemptEnvelope({ schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION, attempts: cloneJson(attempts), updatedAt: nowIso() });
  if (!storage) return normalized;
  try {
    storage.setItem(
      DAILY_BLUNDR_REVIEW_ATTEMPTS_KEY,
      JSON.stringify({
        schemaVersion: DAILY_BLUNDR_REVIEW_SCHEMA_VERSION,
        attempts: normalized,
        updatedAt: nowIso(),
      }),
    );
  } catch {
    // local storage is optional for this local-first feature
  }
  return normalized;
}

export function appendDailyBlundrReviewAttempt(attempt: DailyBlundrReviewAttempt): DailyBlundrReviewAttempt[] {
  const attempts = readDailyBlundrReviewAttempts();
  const next = [...attempts, attempt];
  return writeDailyBlundrReviewAttempts(next);
}

export function upsertDailyBlundrReviewCards(cards: readonly DailyBlundrReviewCard[]): DailyBlundrReviewCard[] {
  const existing = readDailyBlundrReviewCards();
  const next = mergeDailyBlundrReviewCards(existing, cards);
  return writeDailyBlundrReviewCards(next);
}

export function loadDailyBlundrReviewStore(): {
  reviewCards: DailyBlundrReviewCard[];
  reviewAttempts: DailyBlundrReviewAttempt[];
} {
  return {
    reviewCards: readDailyBlundrReviewCards(),
    reviewAttempts: readDailyBlundrReviewAttempts(),
  };
}
