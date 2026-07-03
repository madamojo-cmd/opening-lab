import type { DailyBlundrCard } from "../dailyBlundrTypes";
import { resolveDailyBlundrCardPlayMode } from "../dailyBlundrPlayerTypes";
import { validateDailyCardFen } from "./dailyFenValidation";
import { validateDailyCardConceptTags as validateConceptTagsForCard } from "./dailyConceptValidation";
import { validateMiniGameState } from "./dailyMiniGameValidation";
import { validateTrainingTargetState } from "./dailyTrainingTargetValidation";
import type { DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { isDailyBlundrDifficulty, makeValidationIssue, toValidationResult } from "./dailyValidationUtils";

const VALID_CARD_KINDS = new Set<DailyBlundrCard["kind"]>([
  "recall",
  "mastery",
  "weak_spot",
  "mini_game",
  "training_target",
  "training_game",
]);

const VALID_CARD_SOURCES = new Set<DailyBlundrCard["source"]>([
  "learning_event",
  "progress_mistake",
  "merged",
  "daily_attempt",
]);

function mergeResults(...results: readonly DailyValidationResult[]): DailyValidationResult {
  return toValidationResult(results.flatMap((result) => result.issues));
}

export function validateDailyCardIdentity(card: Pick<DailyBlundrCard, "id" | "cardKey" | "kind" | "source">): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (!String(card.cardKey ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "missing_card_key",
        message: "Daily card is missing cardKey.",
      }),
    );
  }
  if (!String(card.id ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "missing_id",
        message: `Daily card ${String(card.cardKey ?? "")} is missing id.`,
      }),
    );
  }
  if (!VALID_CARD_KINDS.has(card.kind)) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "invalid_kind",
        message: `Invalid Daily card kind: ${String(card.kind ?? "")}.`,
      }),
    );
  }
  if (!VALID_CARD_SOURCES.has(card.source)) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "invalid_source",
        message: `Invalid Daily card source: ${String(card.source ?? "")}.`,
      }),
    );
  }
  if (String(card.id ?? "").trim() && String(card.cardKey ?? "").trim() && card.id !== card.cardKey) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "card",
        code: "id_cardkey_mismatch",
        message: `Daily card id (${card.id}) does not match cardKey (${card.cardKey}).`,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateDailyCardDifficulty(card: Pick<DailyBlundrCard, "difficulty">): DailyValidationResult {
  if (isDailyBlundrDifficulty(card.difficulty)) return toValidationResult([]);
  return toValidationResult([
    makeValidationIssue({
      severity: "error",
      category: "difficulty",
      code: "invalid_difficulty",
      message: `Invalid Daily card difficulty: ${String(card.difficulty ?? "")}.`,
    }),
  ]);
}

export function validateDailyCardConceptTags(card: Pick<DailyBlundrCard, "kind" | "conceptIds" | "primaryConceptId" | "conceptMasteryKeys">): DailyValidationResult {
  return validateConceptTagsForCard(card);
}

function validateKindSpecificState(card: DailyBlundrCard): DailyValidationResult {
  if (card.kind === "mini_game") {
    return validateMiniGameState(card.miniGame);
  }
  if (card.kind === "training_target") {
    return validateTrainingTargetState(card.trainingTarget);
  }
  return toValidationResult([]);
}

function validateRecallStyleCard(card: DailyBlundrCard): DailyValidationResult {
  if (card.kind === "mini_game" || card.kind === "training_target") return toValidationResult([]);
  const playMode = resolveDailyBlundrCardPlayMode(card);
  if (playMode === "uci_graded" && !String(card.expectedMoveUci ?? "").trim()) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "missing_expected_move",
        message: `UCI-graded Daily card ${card.cardKey} requires expectedMoveUci.`,
        suggestion: "Populate expectedMoveUci for recall cards that require answer grading.",
      }),
    ]);
  }
  return toValidationResult([]);
}

export function validateDailyCard(card: DailyBlundrCard): DailyValidationResult {
  return mergeResults(
    validateDailyCardIdentity(card),
    validateDailyCardDifficulty(card),
    validateDailyCardFen(card),
    validateDailyCardConceptTags(card),
    validateRecallStyleCard(card),
    validateKindSpecificState(card),
    validateMasteryTargets(card),
  );
}

function validateMasteryTargets(card: DailyBlundrCard): DailyValidationResult {
  if (card.kind === "mini_game" || card.kind === "training_target") {
    if (!Array.isArray(card.masteryTargets) || card.masteryTargets.length === 0) {
      return toValidationResult([
        makeValidationIssue({
          severity: "error",
          category: card.kind,
          code: "missing_mastery_targets",
          message: `${card.kind} cards must include masteryTargets.`,
        }),
      ]);
    }
  }
  return toValidationResult([]);
}

export function validateDailyCards(cards: readonly DailyBlundrCard[]): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  cards.forEach((card, index) => {
    issues.push(...validateDailyCard(card).issues.map((issue) => ({
      ...issue,
      itemId: issue.itemId ?? card.cardKey,
      path: issue.path ? `cards[${index}].${issue.path}` : `cards[${index}]`,
    })));
  });
  return toValidationResult(issues);
}
