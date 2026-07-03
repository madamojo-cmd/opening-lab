import type { DailyBlundrCard } from "../dailyBlundrTypes";
import { getDailyConceptById, assertDailyConceptRegistryIsValid } from "../concepts/dailyConceptRegistry";
import { makeConceptMasteryKey, normalizeConceptId } from "../concepts/dailyConceptTagging";
import type { DailyConceptId, DailyConceptTrainingSurface } from "../concepts/dailyConceptTypes";
import type { DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { makeValidationIssue, toValidationResult, uniqueStrings } from "./dailyValidationUtils";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function uniqueConceptIds(values: readonly (string | null | undefined)[]): DailyConceptId[] {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeConceptId(value))
        .filter((value): value is DailyConceptId => Boolean(value)),
    ),
  );
}

function surfaceForCardKind(kind: DailyBlundrCard["kind"] | string | null | undefined): DailyConceptTrainingSurface {
  if (kind === "mini_game") return "mini_game";
  if (kind === "training_target") return "training_target";
  return "recall";
}

export function validateConceptRegistry(): DailyValidationResult {
  try {
    assertDailyConceptRegistryIsValid();
    return toValidationResult([]);
  } catch (error) {
    return toValidationResult([
      makeValidationIssue({
        severity: "error",
        category: "registry",
        code: "concept_registry_invalid",
        message: error instanceof Error ? error.message : "Daily concept registry validation failed.",
        suggestion: "Fix the concept registry definitions before serving Daily BLUNDR content.",
      }),
    ]);
  }
}

export function validateConceptIds(conceptIds: readonly (string | null | undefined)[], surface?: DailyConceptTrainingSurface | null): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  const seen = new Set<string>();

  for (const rawId of conceptIds) {
    const text = normalizeText(rawId);
    if (!text) continue;
    const conceptId = normalizeConceptId(text);
    if (!conceptId) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "concept",
          code: "unknown_concept_id",
          message: `Unknown concept id: ${text}`,
          conceptId: text,
          suggestion: "Use a concept id from the Stage 6 registry.",
        }),
      );
      continue;
    }
    if (seen.has(conceptId)) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "concept",
          code: "duplicate_concept_id",
          message: `Duplicate concept id: ${conceptId}`,
          conceptId,
        }),
      );
      continue;
    }
    seen.add(conceptId);
    if (surface) {
      const concept = getDailyConceptById(conceptId);
      if (concept && !concept.trainedBy.includes(surface)) {
        issues.push(
          makeValidationIssue({
            severity: "error",
            category: "concept",
            code: "concept_surface_mismatch",
            message: `Concept ${conceptId} is not trained by the ${surface} surface.`,
            conceptId,
            suggestion: `Update the concept metadata or stop tagging ${surface} content with this concept.`,
          }),
        );
      }
    }
  }

  return toValidationResult(issues);
}

export function validateConceptSurfaceUse(conceptId: string, surface: DailyConceptTrainingSurface): DailyValidationResult {
  return validateConceptIds([conceptId], surface);
}

export function validateDailyCardConcepts(card: Pick<DailyBlundrCard, "kind" | "conceptIds" | "primaryConceptId" | "conceptMasteryKeys">): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  const conceptIds = uniqueConceptIds(card.conceptIds ?? []);
  const masteryKeys = uniqueStrings(card.conceptMasteryKeys ?? []);
  const surface = surfaceForCardKind(card.kind);
  issues.push(...validateConceptIds(card.conceptIds ?? [], surface).issues);

  if ((card.kind === "mini_game" || card.kind === "training_target") && conceptIds.length === 0) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: card.kind,
        code: "missing_concept_tags",
        message: `A ${card.kind} card must include at least one concept tag.`,
        suggestion: "Attach conceptIds when generating the card.",
      }),
    );
  }

  if (card.primaryConceptId && conceptIds.length > 0 && !conceptIds.includes(card.primaryConceptId)) {
    issues.push(
      makeValidationIssue({
        severity: "error",
        category: "concept",
        code: "primary_concept_not_tagged",
        message: "primaryConceptId must be included in conceptIds.",
        conceptId: card.primaryConceptId,
        suggestion: "Make conceptIds and primaryConceptId consistent.",
      }),
    );
  }

  if (conceptIds.length > 0 && masteryKeys.length > 0) {
    const expectedKeys = conceptIds.map((conceptId) => makeConceptMasteryKey(conceptId));
    const normalizedExpected = uniqueStrings(expectedKeys);
    const normalizedActual = uniqueStrings(masteryKeys);
    if (normalizedExpected.length !== normalizedActual.length || normalizedExpected.some((key) => !normalizedActual.includes(key))) {
      issues.push(
        makeValidationIssue({
          severity: "error",
          category: "concept",
          code: "concept_mastery_key_mismatch",
          message: "conceptMasteryKeys must match the card conceptIds.",
          suggestion: "Regenerate conceptMasteryKeys from conceptIds.",
        }),
      );
    }
  }

  if (masteryKeys.length > 0) {
    for (const key of masteryKeys) {
      const normalized = normalizeConceptId(key);
      if (!normalized) {
        issues.push(
          makeValidationIssue({
            severity: "error",
            category: "concept",
            code: "invalid_concept_mastery_key",
            message: `Invalid concept mastery key: ${key}`,
            suggestion: "Use a stable concept mastery key for a real concept id.",
          }),
        );
      }
    }
  }

  return toValidationResult(issues);
}

export function validateDailyCardConceptTags(card: Pick<DailyBlundrCard, "kind" | "conceptIds" | "primaryConceptId" | "conceptMasteryKeys">): DailyValidationResult {
  return validateDailyCardConcepts(card);
}
