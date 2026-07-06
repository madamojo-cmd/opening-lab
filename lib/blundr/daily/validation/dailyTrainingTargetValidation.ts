import { DAILY_TRAINING_TARGET_REGISTRY } from "../trainingTargets/dailyTrainingTargetRegistry";
import type {
  DailyTrainingTargetDefinition,
  DailyTrainingTargetGenerationContext,
  DailyTrainingTargetState,
  DailyBlundrTrainingTargetCard,
} from "../trainingTargets/dailyTrainingTargetTypes";
import { validateFen, validateFenSideToMove } from "./dailyFenValidation";
import { validateDailyCardConcepts } from "./dailyConceptValidation";
import type { DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { isDailyBlundrDifficulty, makeValidationIssue, toValidationResult } from "./dailyValidationUtils";

function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function validateDifficultyBand(value: unknown): DailyValidationResult {
  if (isDailyBlundrDifficulty(value)) return toValidationResult([]);
  return toValidationResult([
    makeValidationIssue({
      severity: "error",
      category: "difficulty",
      code: "invalid_difficulty",
      message: `Invalid difficulty: ${String(value ?? "")}`,
      suggestion: "Use a Daily Blundr difficulty band.",
    }),
  ]);
}

export function validateTrainingTargetDefinition(definition: DailyTrainingTargetDefinition): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (!String(definition.id ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_definition_id",
        message: "Training-target definition id is missing.",
      }),
    );
  }
  if (!String(definition.title ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_title",
        message: `Training target ${definition.id} is missing a title.`,
      }),
    );
  }
  if (!String(definition.summary ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_summary",
        message: `Training target ${definition.id} is missing a summary.`,
      }),
    );
  }
  if (!Array.isArray(definition.skillIds) || definition.skillIds.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_skill_ids",
        message: `Training target ${definition.id} must define at least one skillId.`,
      }),
    );
  }
  if (!Array.isArray(definition.recommendedFor) || definition.recommendedFor.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_recommended_for",
        message: `Training target ${definition.id} must define at least one recommended difficulty band.`,
      }),
    );
  } else {
    for (const difficulty of definition.recommendedFor) {
      issues.push(...validateDifficultyBand(difficulty).issues.map((issue) => ({ ...issue, itemId: definition.id, path: "recommendedFor" })));
    }
  }
  if (typeof definition.generate !== "function") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_generate",
        message: `Training target ${definition.id} must expose a generate() function.`,
      }),
    );
  }
  if (typeof definition.scoreAttempt !== "function") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_score_attempt",
        message: `Training target ${definition.id} must expose a scoreAttempt() function.`,
      }),
    );
  }
  return toValidationResult(issues);
}

export function validateTrainingTargetRegistry(): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  const seenIds = new Set<string>();
  for (const definition of DAILY_TRAINING_TARGET_REGISTRY) {
    issues.push(...validateTrainingTargetDefinition(definition).issues.map((issue) => ({ ...issue, itemId: definition.id })));
    if (seenIds.has(definition.id)) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "registry",
          code: "duplicate_training_target_id",
          message: `Duplicate training target id: ${definition.id}`,
          itemId: definition.id,
        }),
      );
    } else {
      seenIds.add(definition.id);
    }
  }
  return toValidationResult(issues);
}

function validateInteractionRequirements(state: DailyTrainingTargetState): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (state.interactionKind === "move_input") {
    const hasExpectedMove = Boolean(String(state.expectedMoveUci ?? "").trim());
    const hasCandidates = Array.isArray(state.candidateMoves) && state.candidateMoves.length > 0;
    if (!hasExpectedMove && !hasCandidates) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "training_target",
          code: "missing_move_input_answer",
          message: `Training target ${state.trainingTargetId} requires an expected move or candidate moves.`,
        }),
      );
    }
  }

  if (state.interactionKind === "multiple_choice") {
    const candidateMoves = state.candidateMoves ?? [];
    if (candidateMoves.length === 0 || !candidateMoves.some((candidate) => candidate.isCorrect)) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "training_target",
          code: "missing_correct_multiple_choice",
          message: `Training target ${state.trainingTargetId} requires at least one correct multiple-choice candidate.`,
        }),
      );
    }
  }

  if (state.interactionKind === "square_click") {
    const correctSquares = uniqueStrings([...(state.correctSquareKeys ?? []), ...(state.targetSquares ?? [])]);
    if (correctSquares.length === 0) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "training_target",
          code: "missing_square_targets",
          message: `Training target ${state.trainingTargetId} requires square targets.`,
        }),
      );
    }
  }

  if (state.interactionKind === "sequence") {
    if (!Array.isArray(state.expectedSequenceUci) || state.expectedSequenceUci.length < 2) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "training_target",
          code: "missing_sequence",
          message: `Training target ${state.trainingTargetId} requires an expectedSequenceUci with at least two moves.`,
        }),
      );
    }
  }

  return toValidationResult(issues);
}

export function validateTrainingTargetState(state: DailyTrainingTargetState | null | undefined): DailyValidationResult {
  if (!state) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_state",
        message: "Training-target state is missing.",
        suggestion: "Attach a generated trainingTarget state to the card.",
      }),
    ]);
  }

  const issues: DailyValidationIssue[] = [];
  if (!String(state.trainingTargetId ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_training_target_id",
        message: "Training-target state is missing trainingTargetId.",
      }),
    );
  }
  if (!Array.isArray(state.skillIds) || state.skillIds.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_skill_ids",
        message: `Training target ${state.trainingTargetId} must define skillIds.`,
      }),
    );
  }
  if (!String(state.prompt ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_prompt",
        message: `Training target ${state.trainingTargetId} must include a prompt.`,
      }),
    );
  }
  if (!Number.isFinite(state.plyCount) || state.plyCount < 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "invalid_ply_count",
        message: `Training target ${state.trainingTargetId} must use a non-negative plyCount.`,
      }),
    );
  }
  if (!Number.isFinite(state.moveLimit) || (state.moveLimit ?? 0) <= 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "invalid_move_limit",
        message: `Training target ${state.trainingTargetId} must define a positive moveLimit.`,
      }),
    );
  }
  if (!String(state.formationHash ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "novelty",
        code: "missing_formation_hash",
        message: `Training target ${state.trainingTargetId} must define a formationHash.`,
      }),
    );
  }
  if (!String(state.noveltyKey ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "novelty",
        code: "missing_novelty_key",
        message: `Training target ${state.trainingTargetId} is missing a noveltyKey.`,
        suggestion: "Generate a stable noveltyKey for the training-target formation.",
      }),
    );
  }

  issues.push(...validateFen(state.startFen).issues.map((issue) => ({ ...issue, path: issue.path ? `startFen.${issue.path}` : "startFen" })));
  issues.push(...validateFen(state.currentFen).issues.map((issue) => ({ ...issue, path: issue.path ? `currentFen.${issue.path}` : "currentFen" })));
  issues.push(...validateFenSideToMove(state.currentFen, state.sideToMove).issues.map((issue) => ({ ...issue, path: issue.path ? `currentFen.${issue.path}` : "currentFen" })));
  issues.push(...validateInteractionRequirements(state).issues);
  return toValidationResult(issues);
}

export function validateTrainingTargetCard(card: Pick<DailyBlundrTrainingTargetCard, "id" | "cardKey" | "kind" | "source" | "difficulty" | "masteryTargets" | "trainingTarget" | "conceptIds" | "primaryConceptId" | "conceptMasteryKeys" | "fen">): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (card.kind !== "training_target") {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "invalid_kind",
        message: `Expected a training_target card, received ${String(card.kind ?? "")}.`,
      }),
    );
  }
  if (!String(card.source ?? "").trim()) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "card",
        code: "missing_source",
        message: "Training-target card source is missing.",
      }),
    );
  }
  if (!Array.isArray(card.masteryTargets) || card.masteryTargets.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "training_target",
        code: "missing_mastery_targets",
        message: `Training target ${card.cardKey} must define masteryTargets.`,
      }),
    );
  }
  issues.push(...validateTrainingTargetState(card.trainingTarget).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  issues.push(...validateDailyCardConcepts(card).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  return toValidationResult(issues);
}

export function validateGeneratedTrainingTargets(context: DailyTrainingTargetGenerationContext): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  for (const definition of DAILY_TRAINING_TARGET_REGISTRY) {
    issues.push(...validateTrainingTargetDefinition(definition).issues.map((issue) => ({ ...issue, itemId: definition.id })));
    const card = definition.generate(context);
    if (!card) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "training_target",
          code: "generated_null_card",
          message: `Training target generator ${definition.id} returned null for the validation context.`,
          itemId: definition.id,
        }),
      );
      continue;
    }
    issues.push(...validateTrainingTargetCard(card).issues.map((issue) => ({ ...issue, itemId: card.cardKey })));
  }
  return toValidationResult(issues);
}
