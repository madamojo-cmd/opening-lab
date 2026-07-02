import type { DailyBlundrMasteryState, DailyBlundrCard } from "./dailyBlundrTypes";
import { dailyBlundrReviewCardToDailyCard, makeDailyBlundrReviewCardFromDailyCard, upsertDailyBlundrReviewCards } from "./dailyBlundrReviewCards";
import type { DailyBlundrReviewCard } from "./dailyBlundrReviewTypes";

export type DailyBlundrReviewDeckSelectionMode = "due" | "bootstrap" | "empty";

export type DailyBlundrReviewDeckBuildInput = {
  dateKey: string;
  existingReviewCards: readonly DailyBlundrReviewCard[];
  candidateDailyCards: readonly DailyBlundrCard[];
  mastery?: DailyBlundrMasteryState | null;
  limit?: number;
  now?: string;
};

export type DailyBlundrReviewDeckBuildResult = {
  reviewCards: DailyBlundrReviewCard[];
  selectedReviewCards: DailyBlundrReviewCard[];
  cards: DailyBlundrCard[];
  dueReviewCount: number;
  bootstrapUsed: boolean;
  selectionMode: DailyBlundrReviewDeckSelectionMode;
};

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseIso(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clampLimit(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  return Math.max(1, Math.min(5, Math.floor(value)));
}

function resolveMasteryPenalty(card: DailyBlundrReviewCard, mastery: DailyBlundrMasteryState | null | undefined): number {
  if (!mastery?.records) return 0;
  const records = [card.id, card.dedupeKey, ...card.masteryTargets.map((target) => target.conceptKey)].map((key) => mastery.records[key]).filter(Boolean);
  if (!records.length) return 0;
  const strongest = records.reduce(
    (best, record) => Math.max(best, record.currentMastery ?? record.confidence ?? 0),
    0,
  );
  const confidence = records.reduce((best, record) => Math.max(best, record.confidence ?? 0), 0);
  return strongest >= 0.9 && confidence >= 0.6 ? 1 : strongest >= 0.8 ? 0.6 : strongest >= 0.65 ? 0.3 : 0;
}

function isMasteredCard(card: DailyBlundrReviewCard, mastery: DailyBlundrMasteryState | null | undefined): boolean {
  if (card.status === "suspended") return false;
  const masteredByCard = card.status === "mastered";
  const masteredByMastery = resolveMasteryPenalty(card, mastery) >= 1;
  return masteredByCard || masteredByMastery;
}

function isRecentlyFailed(card: DailyBlundrReviewCard, now: string): boolean {
  if (card.lapses <= 0) return false;
  const lastReviewedAt = parseIso(card.lastReviewedAt);
  if (!lastReviewedAt) return false;
  return Math.max(0, parseIso(now) - lastReviewedAt) <= 3 * 86_400_000;
}

function isSelectable(card: DailyBlundrReviewCard, mastery: DailyBlundrMasteryState | null | undefined, now: string): boolean {
  if (card.status === "suspended") return false;
  if (card.status === "mastered" && !isDue(card, now) && !isRecentlyFailed(card, now)) return false;
  if (isMasteredCard(card, mastery) && !isDue(card, now) && !isRecentlyFailed(card, now)) return false;
  return true;
}

function isSelectableForDueDeck(card: DailyBlundrReviewCard, mastery: DailyBlundrMasteryState | null | undefined, now: string): boolean {
  return isSelectable(card, mastery, now) && (isDue(card, now) || isRecentlyFailed(card, now));
}

function isDue(card: DailyBlundrReviewCard, now: string): boolean {
  return parseIso(card.dueAt) <= parseIso(now);
}

function compareReviewCards(a: DailyBlundrReviewCard, b: DailyBlundrReviewCard, mastery: DailyBlundrMasteryState | null | undefined, now: string): number {
  const dueA = isDue(a, now);
  const dueB = isDue(b, now);
  if (dueA !== dueB) return dueA ? -1 : 1;
  const overdueA = parseIso(now) - parseIso(a.dueAt);
  const overdueB = parseIso(now) - parseIso(b.dueAt);
  if (overdueA !== overdueB) return overdueB - overdueA;
  if (a.status === "leech" || b.status === "leech") {
    if (a.status !== b.status) return a.status === "leech" ? 1 : -1;
  }
  if (a.severity !== b.severity) return b.severity - a.severity;
  const failureA = isRecentlyFailed(a, now) ? parseIso(a.lastReviewedAt) : 0;
  const failureB = isRecentlyFailed(b, now) ? parseIso(b.lastReviewedAt) : 0;
  if (failureA !== failureB) return failureB - failureA;
  const expectedMoveA = a.expectedMoveUci ? 1 : 0;
  const expectedMoveB = b.expectedMoveUci ? 1 : 0;
  if (expectedMoveA !== expectedMoveB) return expectedMoveB - expectedMoveA;
  const masteryPenaltyA = resolveMasteryPenalty(a, mastery);
  const masteryPenaltyB = resolveMasteryPenalty(b, mastery);
  if (masteryPenaltyA !== masteryPenaltyB) return masteryPenaltyA - masteryPenaltyB;
  if (a.totalAttempts !== b.totalAttempts) return b.totalAttempts - a.totalAttempts;
  if (parseIso(a.createdAt) !== parseIso(b.createdAt)) return parseIso(a.createdAt) - parseIso(b.createdAt);
  return a.id.localeCompare(b.id);
}

function filterSelectableCards(cards: readonly DailyBlundrReviewCard[], mastery: DailyBlundrMasteryState | null | undefined, now: string): DailyBlundrReviewCard[] {
  return cards.filter((card) => isSelectable(card, mastery, now));
}

function sortSelectableCards(cards: readonly DailyBlundrReviewCard[], mastery: DailyBlundrMasteryState | null | undefined, now: string): DailyBlundrReviewCard[] {
  return [...cards].sort((a, b) => compareReviewCards(a, b, mastery, now));
}

function bootstrapReviewCards(cards: readonly DailyBlundrReviewCard[], mastery: DailyBlundrMasteryState | null | undefined, now: string, limit: number): DailyBlundrReviewCard[] {
  return sortSelectableCards(filterSelectableCards(cards, mastery, now), mastery, now).slice(0, Math.max(1, Math.min(3, limit)));
}

export function selectDueDailyBlundrReviewCards(input: {
  reviewCards: readonly DailyBlundrReviewCard[];
  mastery?: DailyBlundrMasteryState | null;
  now?: string;
  limit?: number;
}): DailyBlundrReviewCard[] {
  const now = normalizeText(input.now) || nowIso();
  const limit = clampLimit(input.limit ?? 5);
  return sortSelectableCards(
    filterSelectableCards(input.reviewCards, input.mastery ?? null, now).filter((card) => isSelectableForDueDeck(card, input.mastery ?? null, now)),
    input.mastery ?? null,
    now,
  ).filter((card, index, cards) => {
    if (index >= limit) return false;
    if (card.status === "leech") {
      const leechCount = cards.slice(0, index + 1).filter((entry) => entry.status === "leech").length;
      return leechCount <= 1;
    }
    return true;
  });
}

export function buildDailyBlundrDeckFromReviews(input: DailyBlundrReviewDeckBuildInput): DailyBlundrReviewDeckBuildResult {
  const now = normalizeText(input.now) || nowIso();
  const limit = clampLimit(input.limit ?? 5);
  const candidateReviewCards = input.candidateDailyCards.map((card) =>
    makeDailyBlundrReviewCardFromDailyCard({
      sourceCard: card,
      now,
    }),
  );
  const mergedReviewCards = upsertDailyBlundrReviewCards(input.existingReviewCards, candidateReviewCards);
  const dueReviewCards = selectDueDailyBlundrReviewCards({
    reviewCards: mergedReviewCards,
    mastery: input.mastery ?? null,
    now,
    limit,
  });

  const selectedReviewCards = dueReviewCards.length > 0 ? dueReviewCards : bootstrapReviewCards(candidateReviewCards, input.mastery ?? null, now, limit);
  const cards = selectedReviewCards.map((reviewCard, index) => {
    const dailyCard = dailyBlundrReviewCardToDailyCard(reviewCard);
    return {
      ...dailyCard,
      deckRank: index + 1,
      priority: Math.max(1, 100 - index * 10 + reviewCard.severity * 3),
      reviewCardId: reviewCard.id,
      reviewDedupeKey: reviewCard.dedupeKey,
      reviewPromptKind: reviewCard.promptKind,
      reviewStatus: reviewCard.status,
      reviewDueAt: reviewCard.dueAt,
    };
  });

  return {
    reviewCards: mergedReviewCards,
    selectedReviewCards,
    cards,
    dueReviewCount: dueReviewCards.length,
    bootstrapUsed: dueReviewCards.length === 0 && selectedReviewCards.length > 0,
    selectionMode: dueReviewCards.length > 0 ? "due" : selectedReviewCards.length > 0 ? "bootstrap" : "empty",
  };
}
