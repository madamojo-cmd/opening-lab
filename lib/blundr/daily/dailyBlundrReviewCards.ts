import type { DailyBlundrAttempt, DailyBlundrCard } from "./dailyBlundrTypes";
import { buildDailyBlundrMoveKey } from "./adapters/progressMistakeAdapter";
import type {
  DailyBlundrFailureType,
  DailyBlundrPromptKind,
  DailyBlundrReviewCard,
  DailyBlundrReviewCardStatus,
  DailyBlundrSrsGrade,
} from "./dailyBlundrReviewTypes";
import { DAILY_BLUNDR_DEFAULT_EASE, gradeDailyBlundrAttempt, scheduleDailyBlundrReview } from "./dailyBlundrSrs";

type MakeDailyBlundrReviewCardFromDailyCardInput = {
  sourceCard: DailyBlundrCard;
  now?: string;
  source?: DailyBlundrReviewCard["source"];
  promptKind?: DailyBlundrPromptKind;
  failureType?: DailyBlundrFailureType;
};

type MakeDailyBlundrReviewCardFromAttemptInput = {
  sourceCard: DailyBlundrCard;
  attempt: DailyBlundrAttempt;
  existingCard?: DailyBlundrReviewCard | null;
  now?: string;
};

type ReviewDedupeInput = {
  positionHash: string;
  expectedMoveUci?: string | null;
  expectedMoveSan?: string | null;
  promptKind: DailyBlundrPromptKind;
  failureType: DailyBlundrFailureType;
  primaryMasteryKey: string;
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

function clampSeverity(value: number): 1 | 2 | 3 | 4 | 5 {
  if (!Number.isFinite(value)) return 1;
  if (value <= 1) return 1;
  if (value <= 2) return 2;
  if (value <= 3) return 3;
  if (value <= 4) return 4;
  return 5;
}

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function selectPrimaryMasteryTarget(card: DailyBlundrCard): DailyBlundrCard["masteryTargets"][number] | null {
  return card.masteryTargets.find((target) => target.domain !== "daily_recall") ?? card.masteryTargets[0] ?? null;
}

function resolvePrimaryMasteryKey(card: DailyBlundrCard): string {
  return selectPrimaryMasteryTarget(card)?.conceptKey || normalizeText(card.masteryKey) || normalizeText(card.cardKey) || normalizeText(card.id);
}

function resolvePromptKindFromDailyCard(card: DailyBlundrCard): DailyBlundrPromptKind {
  if (card.reviewPromptKind) return card.reviewPromptKind;
  if (card.signals.some((signal) => signal.includes("cue_revealed") || signal.includes("trainer_view_changed"))) return "review_prompt";
  if (card.signals.some((signal) => signal.includes("reveal_dependency"))) return "reveal_review";
  return "target_move_recall";
}

function resolveFailureTypeFromDailyCard(card: DailyBlundrCard): DailyBlundrFailureType {
  if (card.signals.some((signal) => signal.includes("cue_revealed") || signal.includes("trainer_view_changed"))) return "hint_dependency";
  if (card.source === "learning_event" && card.signals.some((signal) => signal.includes("move_incorrect"))) return "wrong_book_move";
  if (card.playedMoveUci || card.playedMoveSan) return "wrong_book_move";
  return "other";
}

function severityFromDailyCard(card: DailyBlundrCard, promptKind: DailyBlundrPromptKind, failureType: DailyBlundrFailureType): 1 | 2 | 3 | 4 | 5 {
  const sourceCount = Math.max(1, Number(card.sourceCount ?? card.count ?? 1) || 1);
  let severity = sourceCount >= 5 ? 5 : sourceCount >= 4 ? 4 : sourceCount >= 3 ? 3 : sourceCount >= 2 ? 2 : 1;
  if (promptKind !== "target_move_recall") severity += 1;
  if (failureType === "hint_dependency" || failureType === "reveal_dependency" || failureType === "slow_recall" || failureType === "illegal_move_attempt") severity += 1;
  if (card.confidence === "low") severity += 1;
  return clampSeverity(severity);
}

function resolveInitialStatus(card: DailyBlundrCard, promptKind: DailyBlundrPromptKind, severity: 1 | 2 | 3 | 4 | 5): DailyBlundrReviewCardStatus {
  if (severity >= 5 || card.sourceCount >= 4) return "review";
  if (promptKind !== "target_move_recall") return "learning";
  if (card.count >= 2) return "learning";
  return "new";
}

function resolveInitialSignals(card: DailyBlundrCard, promptKind: DailyBlundrPromptKind, failureType: DailyBlundrFailureType): string[] {
  return uniqueStrings([
    ...card.signals,
    `review_source:${card.source}`,
    `review_prompt:${promptKind}`,
    `failure:${failureType}`,
  ]);
}

function resolveInitialScheduleCard(input: MakeDailyBlundrReviewCardFromDailyCardInput, promptKind: DailyBlundrPromptKind, failureType: DailyBlundrFailureType, severity: 1 | 2 | 3 | 4 | 5): DailyBlundrReviewCard {
  const now = normalizeText(input.now) || nowIso();
  const card = input.sourceCard;
  const primaryKey = resolvePrimaryMasteryKey(card);
  const dedupeKey = dailyBlundrReviewDedupeKey({
    positionHash: card.positionKey,
    expectedMoveUci: card.expectedMoveUci,
    expectedMoveSan: card.expectedMoveSan,
    promptKind,
    failureType,
    primaryMasteryKey: primaryKey,
  });
  const createdAt = now;
  const source = input.source ?? card.source;
  const sourceCard = {
    ...card,
    reviewCardId: `review:${dedupeKey}`,
    reviewDedupeKey: dedupeKey,
    reviewPromptKind: promptKind,
    reviewStatus: resolveInitialStatus(card, promptKind, severity),
    reviewDueAt: now,
  };
  return {
    schemaVersion: 1,
    id: `review:${dedupeKey}`,
    dedupeKey,
    status: resolveInitialStatus(card, promptKind, severity),
    promptKind,
    sourceCard,
    source,
    fen: card.fen,
    positionHash: card.positionKey,
    expectedMoveUci: card.expectedMoveUci || null,
    expectedMoveSan: card.expectedMoveSan || null,
    playedMoveUci: card.playedMoveUci || null,
    playedMoveSan: card.playedMoveSan || null,
    openingId: card.openingId || null,
    repertoireId: card.repertoireId || null,
    openingName: card.openingName || null,
    domain: selectPrimaryMasteryTarget(card)?.domain ?? "daily_recall",
    masteryTargets: card.masteryTargets.length ? card.masteryTargets.map((target) => ({ ...target })) : [],
    failureType,
    severity,
    signals: resolveInitialSignals(card, promptKind, failureType),
    dueAt: now,
    intervalDays: 0,
    ease: DAILY_BLUNDR_DEFAULT_EASE,
    correctStreak: 0,
    lapses: 0,
    totalAttempts: 0,
    revealUses: 0,
    avgResponseTimeMs: null,
    lastReviewedAt: null,
    createdAt,
    updatedAt: createdAt,
  };
}

function resolvePromptKindFromAttempt(sourceCard: DailyBlundrCard, attempt: DailyBlundrAttempt, existingCard?: DailyBlundrReviewCard | null): DailyBlundrPromptKind {
  if (existingCard?.promptKind) return existingCard.promptKind;
  if (attempt.usedReveal) return "reveal_review";
  if (attempt.responseTimeMs !== null && attempt.responseTimeMs !== undefined && attempt.responseTimeMs >= 6000) return "review_prompt";
  if (sourceCard.reviewPromptKind) return sourceCard.reviewPromptKind;
  if (sourceCard.signals.some((signal) => signal.includes("cue_revealed") || signal.includes("trainer_view_changed"))) return "review_prompt";
  return "target_move_recall";
}

function resolveFailureTypeFromAttempt(sourceCard: DailyBlundrCard, attempt: DailyBlundrAttempt): DailyBlundrFailureType {
  if (attempt.usedReveal) return "reveal_dependency";
  if (attempt.note === "manual_review") return "hint_dependency";
  if (attempt.responseTimeMs !== null && attempt.responseTimeMs !== undefined && attempt.responseTimeMs >= 12000) return "slow_recall";
  if (!attempt.correct && attempt.outcome === "incorrect" && attempt.attemptedMoveUci && !sourceCard.expectedMoveUci) return "wrong_piece_selected";
  if (!attempt.correct && attempt.outcome === "incorrect") return "wrong_book_move";
  return "other";
}

function severityBumpForAttempt(previousSeverity: number, grade: DailyBlundrSrsGrade): 1 | 2 | 3 | 4 | 5 {
  const next = previousSeverity + (grade === "AGAIN" ? 1 : grade === "HARD" ? 1 : 0);
  return clampSeverity(next);
}

function mergeSignals(existing: readonly string[], incoming: readonly string[]): string[] {
  return uniqueStrings([...existing, ...incoming]);
}

function mergeMasteryTargets(existing: DailyBlundrReviewCard["masteryTargets"], incoming: DailyBlundrReviewCard["masteryTargets"]): DailyBlundrReviewCard["masteryTargets"] {
  const map = new Map<string, DailyBlundrReviewCard["masteryTargets"][number]>();
  for (const target of existing) map.set(target.conceptKey, { ...target });
  for (const target of incoming) map.set(target.conceptKey, { ...target });
  return Array.from(map.values());
}

function promptPriority(promptKind: DailyBlundrPromptKind): number {
  if (promptKind === "reveal_review") return 3;
  if (promptKind === "review_prompt") return 2;
  return 1;
}

function failurePriority(failureType: DailyBlundrFailureType): number {
  if (failureType === "reveal_dependency") return 5;
  if (failureType === "hint_dependency") return 4;
  if (failureType === "illegal_move_attempt" || failureType === "wrong_piece_selected") return 3;
  if (failureType === "slow_recall") return 2;
  if (failureType === "wrong_book_move") return 1;
  return 0;
}

function choosePromptKind(existing: DailyBlundrPromptKind, incoming: DailyBlundrPromptKind): DailyBlundrPromptKind {
  return promptPriority(incoming) > promptPriority(existing) ? incoming : existing;
}

function chooseFailureType(existing: DailyBlundrFailureType, incoming: DailyBlundrFailureType): DailyBlundrFailureType {
  return failurePriority(incoming) > failurePriority(existing) ? incoming : existing;
}

function chooseDomain(existing: DailyBlundrReviewCard["domain"], incoming: DailyBlundrReviewCard["domain"]): DailyBlundrReviewCard["domain"] {
  if (existing === "daily_recall" && incoming !== "daily_recall") return incoming;
  return existing;
}

function chooseStatus(existing: DailyBlundrReviewCardStatus, incoming: DailyBlundrReviewCardStatus): DailyBlundrReviewCardStatus {
  const priority: Record<DailyBlundrReviewCardStatus, number> = {
    mastered: 0,
    new: 1,
    review: 2,
    learning: 3,
    leech: 4,
    suspended: 5,
  };
  return priority[incoming] > priority[existing] ? incoming : existing;
}

function shouldAdoptIncomingSchedule(existing: DailyBlundrReviewCard, incoming: DailyBlundrReviewCard): boolean {
  if (incoming.totalAttempts > existing.totalAttempts) return true;
  if (incoming.totalAttempts < existing.totalAttempts) return false;
  const incomingReviewed = parseIso(incoming.lastReviewedAt);
  const existingReviewed = parseIso(existing.lastReviewedAt);
  if (incomingReviewed > existingReviewed) return true;
  if (incomingReviewed < existingReviewed) return false;
  const incomingCreated = parseIso(incoming.createdAt);
  const existingCreated = parseIso(existing.createdAt);
  if (incomingCreated < existingCreated) return true;
  if (incomingCreated > existingCreated) return false;
  return parseIso(incoming.dueAt) < parseIso(existing.dueAt);
}

function buildFallbackCardFromReviewCard(reviewCard: DailyBlundrReviewCard): DailyBlundrCard {
  const sourceCard = reviewCard.sourceCard;
  if (sourceCard) return { ...sourceCard };
  const title = reviewCard.openingName || "Daily recall";
  return {
    source: reviewCard.source,
    cardKey: reviewCard.id,
    positionKey: reviewCard.positionHash,
    fen: reviewCard.fen,
    expectedMoveUci: reviewCard.expectedMoveUci ?? null,
    expectedMoveSan: reviewCard.expectedMoveSan ?? null,
    playedMoveUci: reviewCard.playedMoveUci ?? null,
    playedMoveSan: reviewCard.playedMoveSan ?? null,
    openingId: reviewCard.openingId ?? null,
    openingName: reviewCard.openingName ?? null,
    patternId: null,
    concept: null,
    count: Math.max(1, reviewCard.totalAttempts || reviewCard.severity),
    weight: reviewCard.severity + reviewCard.totalAttempts * 0.25,
    lastSeenAt: reviewCard.lastReviewedAt ?? reviewCard.createdAt,
    note: reviewCard.failureType,
    signals: [...reviewCard.signals],
    masteryTargets: reviewCard.masteryTargets.map((target) => ({ ...target })),
    confidence: reviewCard.status === "mastered" ? "high" : reviewCard.status === "review" ? "medium" : "low",
    difficulty: reviewCard.status === "mastered" ? "advanced" : reviewCard.status === "review" ? "intermediate" : "beginner",
    id: reviewCard.id,
    kind: "recall",
    title,
    prompt: reviewCard.promptKind === "reveal_review"
      ? `Recall after reveal for ${title}`
      : reviewCard.promptKind === "review_prompt"
        ? `Review ${title}`
        : `Recall the move for ${title}`,
    reviewCardId: reviewCard.id,
    reviewDedupeKey: reviewCard.dedupeKey,
    reviewPromptKind: reviewCard.promptKind,
    reviewStatus: reviewCard.status,
    reviewDueAt: reviewCard.dueAt,
    repertoireId: reviewCard.repertoireId ?? reviewCard.openingId ?? null,
    deckRank: 0,
    priority: reviewCard.severity,
    masteryKey: reviewCard.sourceCard?.masteryKey ?? reviewCard.id,
    sourceCount: Math.max(1, reviewCard.totalAttempts || reviewCard.signals.length || 1),
    summary: `${title} • ${reviewCard.status}`,
  };
}

export function dailyBlundrReviewDedupeKey(input: ReviewDedupeInput): string {
  const moveKey = buildDailyBlundrMoveKey(input.expectedMoveUci ?? input.expectedMoveSan ?? null) || "target";
  return [
    normalizeText(input.positionHash) || "position",
    moveKey,
    input.promptKind,
    input.failureType,
    normalizeText(input.primaryMasteryKey) || "mastery",
  ].join("|");
}

export function makeDailyBlundrReviewCardFromDailyCard(input: MakeDailyBlundrReviewCardFromDailyCardInput): DailyBlundrReviewCard {
  const promptKind = input.promptKind ?? resolvePromptKindFromDailyCard(input.sourceCard);
  const failureType = input.failureType ?? resolveFailureTypeFromDailyCard(input.sourceCard);
  const severity = severityFromDailyCard(input.sourceCard, promptKind, failureType);
  return resolveInitialScheduleCard(input, promptKind, failureType, severity);
}

export function makeDailyBlundrReviewCardFromAttempt(input: MakeDailyBlundrReviewCardFromAttemptInput): DailyBlundrReviewCard {
  const existingCard = input.existingCard ?? null;
  const promptKind = resolvePromptKindFromAttempt(input.sourceCard, input.attempt, existingCard);
  const failureType = resolveFailureTypeFromAttempt(input.sourceCard, input.attempt);
  const grade = gradeDailyBlundrAttempt({
    promptKind,
    correct: input.attempt.correct,
    partialCredit: input.attempt.usedReveal ? 0.55 : input.attempt.correct ? 1 : 0,
    usedReveal: Boolean(input.attempt.usedReveal),
    responseTimeMs: input.attempt.responseTimeMs ?? null,
    previousCorrectStreak: existingCard?.correctStreak ?? 0,
  });
  const sourceCard = input.sourceCard.reviewCardId
    ? {
        ...input.sourceCard,
        reviewCardId: input.sourceCard.reviewCardId,
        reviewDedupeKey: input.sourceCard.reviewDedupeKey ?? existingCard?.dedupeKey ?? null,
        reviewPromptKind: promptKind,
        reviewStatus: existingCard?.status ?? input.sourceCard.reviewStatus ?? "new",
        reviewDueAt: existingCard?.dueAt ?? input.attempt.completedAt,
      }
    : {
        ...input.sourceCard,
        reviewCardId: existingCard?.id ?? `review:${input.sourceCard.cardKey}`,
        reviewDedupeKey: existingCard?.dedupeKey ?? null,
        reviewPromptKind: promptKind,
        reviewStatus: existingCard?.status ?? "new",
        reviewDueAt: existingCard?.dueAt ?? input.attempt.completedAt,
      };
  const baseCard: DailyBlundrReviewCard = existingCard ?? {
    schemaVersion: 1,
    id: `review:${input.sourceCard.cardKey}`,
    dedupeKey: dailyBlundrReviewDedupeKey({
      positionHash: input.sourceCard.positionKey,
      expectedMoveUci: input.sourceCard.expectedMoveUci,
      expectedMoveSan: input.sourceCard.expectedMoveSan,
      promptKind,
      failureType,
      primaryMasteryKey: resolvePrimaryMasteryKey(input.sourceCard),
    }),
    status: "learning",
    promptKind,
    sourceCard,
    source: input.sourceCard.source,
    fen: input.sourceCard.fen,
    positionHash: input.sourceCard.positionKey,
    expectedMoveUci: input.sourceCard.expectedMoveUci || null,
    expectedMoveSan: input.sourceCard.expectedMoveSan || null,
    playedMoveUci: input.sourceCard.playedMoveUci || null,
    playedMoveSan: input.sourceCard.playedMoveSan || null,
    openingId: input.sourceCard.openingId || null,
    repertoireId: input.sourceCard.repertoireId || null,
    openingName: input.sourceCard.openingName || null,
    domain: selectPrimaryMasteryTarget(input.sourceCard)?.domain ?? "daily_recall",
    masteryTargets: input.sourceCard.masteryTargets.map((target) => ({ ...target })),
    failureType,
    severity: severityFromDailyCard(input.sourceCard, promptKind, failureType),
    signals: resolveInitialSignals(input.sourceCard, promptKind, failureType),
    dueAt: input.attempt.completedAt,
    intervalDays: 0,
    ease: DAILY_BLUNDR_DEFAULT_EASE,
    correctStreak: 0,
    lapses: 0,
    totalAttempts: 0,
    revealUses: 0,
    avgResponseTimeMs: null,
    lastReviewedAt: null,
    createdAt: input.attempt.completedAt,
    updatedAt: input.attempt.completedAt,
  };

  const scheduled = scheduleDailyBlundrReview({
    card: baseCard,
    completedAt: input.attempt.completedAt,
    now: input.now,
    grade,
    correct: input.attempt.correct,
    partialCredit: input.attempt.usedReveal ? 0.55 : input.attempt.correct ? 1 : 0,
    usedReveal: Boolean(input.attempt.usedReveal),
    responseTimeMs: input.attempt.responseTimeMs ?? null,
    failureType,
    promptKind,
    previousCorrectStreak: existingCard?.correctStreak ?? 0,
    moveReason: input.attempt.note ?? null,
  });

  return {
    ...scheduled.card,
    sourceCard,
    promptKind,
    failureType: scheduled.failureType,
    severity: severityBumpForAttempt(baseCard.severity, scheduled.grade),
    source: existingCard?.source === input.sourceCard.source ? existingCard.source : existingCard ? "merged" : input.sourceCard.source,
  };
}

export function mergeDailyBlundrReviewCard(existing: DailyBlundrReviewCard, incoming: DailyBlundrReviewCard): DailyBlundrReviewCard {
  const adoptIncomingSchedule = shouldAdoptIncomingSchedule(existing, incoming);
  const mergedPromptKind = choosePromptKind(existing.promptKind, incoming.promptKind);
  const mergedFailureType = chooseFailureType(existing.failureType, incoming.failureType);
  const mergedSeverity = clampSeverity(Math.max(existing.severity, incoming.severity));
  const mergedSignals = mergeSignals(existing.signals, incoming.signals);
  const mergedTargets = mergeMasteryTargets(existing.masteryTargets, incoming.masteryTargets);
  const mergedSource = existing.source === incoming.source ? existing.source : "merged";
  const mergedSourceCard = existing.sourceCard ?? incoming.sourceCard ?? null;
  const mergedDomain = chooseDomain(existing.domain, incoming.domain);
  const mergedExpectedMoveUci = incoming.expectedMoveUci || existing.expectedMoveUci || null;
  const mergedExpectedMoveSan = mergedExpectedMoveUci ? incoming.expectedMoveSan || existing.expectedMoveSan || null : incoming.expectedMoveSan || existing.expectedMoveSan || null;
  const mergedPlayedMoveUci = incoming.playedMoveUci || existing.playedMoveUci || null;
  const mergedPlayedMoveSan = incoming.playedMoveSan || existing.playedMoveSan || null;
  const preserveExistingSchedule = !adoptIncomingSchedule && existing.totalAttempts > 0;
  const chosenStatus = preserveExistingSchedule ? existing.status : chooseStatus(existing.status, incoming.status);
  const chosenPromptKind = mergedPromptKind;
  const createdAt = parseIso(existing.createdAt) && parseIso(incoming.createdAt)
    ? new Date(Math.min(parseIso(existing.createdAt), parseIso(incoming.createdAt))).toISOString()
    : existing.createdAt || incoming.createdAt;
  const updatedAt = new Date(Math.max(parseIso(existing.updatedAt), parseIso(incoming.updatedAt), Date.now())).toISOString();

  if (preserveExistingSchedule) {
    return {
      ...existing,
      id: existing.id,
      dedupeKey: existing.dedupeKey,
      status: existing.status,
      promptKind: chosenPromptKind,
      sourceCard: mergedSourceCard,
      source: mergedSource,
      fen: existing.fen || incoming.fen,
      positionHash: existing.positionHash || incoming.positionHash,
      expectedMoveUci: mergedExpectedMoveUci,
      expectedMoveSan: mergedExpectedMoveSan,
      playedMoveUci: mergedPlayedMoveUci,
      playedMoveSan: mergedPlayedMoveSan,
      openingId: existing.openingId || incoming.openingId || null,
      repertoireId: existing.repertoireId || incoming.repertoireId || null,
      openingName: existing.openingName || incoming.openingName || null,
      domain: mergedDomain,
      masteryTargets: mergedTargets,
      failureType: mergedFailureType,
      severity: mergedSeverity,
      signals: mergedSignals,
      dueAt: existing.dueAt,
      intervalDays: existing.intervalDays,
      ease: existing.ease,
      correctStreak: existing.correctStreak,
      lapses: existing.lapses,
      totalAttempts: existing.totalAttempts,
      revealUses: existing.revealUses,
      avgResponseTimeMs: existing.avgResponseTimeMs,
      lastReviewedAt: existing.lastReviewedAt,
      createdAt,
      updatedAt,
    };
  }

  return {
    ...incoming,
    id: existing.id || incoming.id,
    dedupeKey: existing.dedupeKey || incoming.dedupeKey,
    status: chosenStatus,
    promptKind: chosenPromptKind,
    sourceCard: mergedSourceCard,
    source: mergedSource,
    fen: existing.fen || incoming.fen,
    positionHash: existing.positionHash || incoming.positionHash,
    expectedMoveUci: mergedExpectedMoveUci,
    expectedMoveSan: mergedExpectedMoveSan,
    playedMoveUci: mergedPlayedMoveUci,
    playedMoveSan: mergedPlayedMoveSan,
    openingId: existing.openingId || incoming.openingId || null,
    repertoireId: existing.repertoireId || incoming.repertoireId || null,
    openingName: existing.openingName || incoming.openingName || null,
    domain: mergedDomain,
    masteryTargets: mergedTargets,
    failureType: mergedFailureType,
    severity: mergedSeverity,
    signals: mergedSignals,
    dueAt: parseIso(incoming.dueAt) < parseIso(existing.dueAt) ? incoming.dueAt : existing.dueAt,
    intervalDays: adoptIncomingSchedule ? incoming.intervalDays : existing.intervalDays,
    ease: adoptIncomingSchedule ? incoming.ease : existing.ease,
    correctStreak: adoptIncomingSchedule ? incoming.correctStreak : existing.correctStreak,
    lapses: adoptIncomingSchedule ? incoming.lapses : existing.lapses,
    totalAttempts: adoptIncomingSchedule ? incoming.totalAttempts : existing.totalAttempts,
    revealUses: adoptIncomingSchedule ? incoming.revealUses : existing.revealUses,
    avgResponseTimeMs: adoptIncomingSchedule ? incoming.avgResponseTimeMs : existing.avgResponseTimeMs,
    lastReviewedAt: adoptIncomingSchedule ? incoming.lastReviewedAt : existing.lastReviewedAt,
    createdAt,
    updatedAt,
  };
}

export function upsertDailyBlundrReviewCards(existingCards: readonly DailyBlundrReviewCard[], incomingCards: readonly DailyBlundrReviewCard[]): DailyBlundrReviewCard[] {
  const merged = new Map<string, DailyBlundrReviewCard>();
  for (const card of existingCards) {
    merged.set(card.dedupeKey, { ...card, signals: [...card.signals], masteryTargets: card.masteryTargets.map((target) => ({ ...target })) });
  }
  for (const card of incomingCards) {
    const existing = merged.get(card.dedupeKey);
    if (!existing) {
      merged.set(card.dedupeKey, { ...card, signals: [...card.signals], masteryTargets: card.masteryTargets.map((target) => ({ ...target })) });
      continue;
    }
    merged.set(card.dedupeKey, mergeDailyBlundrReviewCard(existing, card));
  }

  return Array.from(merged.values()).sort((a, b) =>
    parseIso(a.dueAt) - parseIso(b.dueAt) ||
    b.severity - a.severity ||
    b.totalAttempts - a.totalAttempts ||
    parseIso(b.updatedAt) - parseIso(a.updatedAt) ||
    a.id.localeCompare(b.id),
  );
}

export function dailyBlundrReviewCardToDailyCard(reviewCard: DailyBlundrReviewCard): DailyBlundrCard {
  const fallback = buildFallbackCardFromReviewCard(reviewCard);
  return {
    ...fallback,
    id: fallback.id,
    cardKey: fallback.cardKey,
    reviewCardId: reviewCard.id,
    reviewDedupeKey: reviewCard.dedupeKey,
    reviewPromptKind: reviewCard.promptKind,
    reviewStatus: reviewCard.status,
    reviewDueAt: reviewCard.dueAt,
  };
}
