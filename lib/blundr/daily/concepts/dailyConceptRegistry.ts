import type { DailyConceptDefinition, DailyConceptDomain, DailyConceptId, DailyConceptTrainingSurface } from "./dailyConceptTypes";
import { PAWN_STRUCTURE_CONCEPTS } from "./pawnStructures";
import { KEY_SQUARE_CONCEPTS } from "./keySquares";
import { PIECE_IMBALANCE_CONCEPTS } from "./pieceImbalances";
import { TACTICAL_IDEA_CONCEPTS } from "./tacticalIdeas";
import { SPECIAL_TECHNIQUE_CONCEPTS } from "./specialTechniques";

export const DAILY_CONCEPT_REGISTRY: DailyConceptDefinition[] = [
  ...PAWN_STRUCTURE_CONCEPTS,
  ...KEY_SQUARE_CONCEPTS,
  ...PIECE_IMBALANCE_CONCEPTS,
  ...TACTICAL_IDEA_CONCEPTS,
  ...SPECIAL_TECHNIQUE_CONCEPTS,
];

const DAILY_CONCEPT_REGISTRY_BY_ID = new Map<DailyConceptId, DailyConceptDefinition>(
  DAILY_CONCEPT_REGISTRY.map((concept) => [concept.id, concept] as const),
);

function uniqueStrings(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function assertCondition(condition: unknown, message: string, issues: string[]): void {
  if (!condition) issues.push(message);
}

export function getAllDailyConcepts(): DailyConceptDefinition[] {
  return [...DAILY_CONCEPT_REGISTRY];
}

export function getDailyConceptById(id: DailyConceptId | string | null | undefined): DailyConceptDefinition | null {
  const key = String(id ?? "").trim();
  if (!key) return null;
  return DAILY_CONCEPT_REGISTRY_BY_ID.get(key as DailyConceptId) ?? null;
}

export function getDailyConceptsByDomain(domain: DailyConceptDomain): DailyConceptDefinition[] {
  return DAILY_CONCEPT_REGISTRY.filter((concept) => concept.domain === domain);
}

export function getDailyConceptsForSurface(surface: DailyConceptTrainingSurface): DailyConceptDefinition[] {
  return DAILY_CONCEPT_REGISTRY.filter((concept) => concept.trainedBy.includes(surface));
}

export function getRelatedDailyConcepts(id: DailyConceptId | string): DailyConceptDefinition[] {
  const concept = getDailyConceptById(id);
  if (!concept) return [];
  return uniqueStrings(concept.relatedConceptIds)
    .map((conceptId) => getDailyConceptById(conceptId))
    .filter((entry): entry is DailyConceptDefinition => Boolean(entry));
}

export function getPrerequisiteDailyConcepts(id: DailyConceptId | string): DailyConceptDefinition[] {
  const concept = getDailyConceptById(id);
  if (!concept) return [];
  return uniqueStrings(concept.prerequisiteConceptIds)
    .map((conceptId) => getDailyConceptById(conceptId))
    .filter((entry): entry is DailyConceptDefinition => Boolean(entry));
}

export function assertDailyConceptRegistryIsValid(): void {
  const issues: string[] = [];
  const ids = new Set<string>();
  const masteryKeys = new Set<string>();

  for (const concept of DAILY_CONCEPT_REGISTRY) {
    assertCondition(concept.id.startsWith("concept:"), `Concept id must start with "concept:": ${concept.id}`, issues);
    assertCondition(Boolean(concept.displayName.trim()), `Concept displayName is empty: ${concept.id}`, issues);
    assertCondition(Boolean(concept.summary.trim()), `Concept summary is empty: ${concept.id}`, issues);
    assertCondition(concept.trainedBy.length > 0, `Concept must define at least one trainedBy surface: ${concept.id}`, issues);
    assertCondition(concept.recommendedDifficulty.length > 0, `Concept must define at least one recommendedDifficulty band: ${concept.id}`, issues);
    assertCondition(concept.masteryKey === `${concept.id}:mastery`, `Concept masteryKey must stay stable: ${concept.id}`, issues);
    assertCondition(concept.tags.length > 0, `Concept must define at least one tag: ${concept.id}`, issues);

    if (ids.has(concept.id)) {
      issues.push(`Duplicate concept id: ${concept.id}`);
    } else {
      ids.add(concept.id);
    }

    if (masteryKeys.has(concept.masteryKey)) {
      issues.push(`Duplicate mastery key: ${concept.masteryKey}`);
    } else {
      masteryKeys.add(concept.masteryKey);
    }
  }

  for (const concept of DAILY_CONCEPT_REGISTRY) {
    for (const relatedId of concept.relatedConceptIds) {
      if (!DAILY_CONCEPT_REGISTRY_BY_ID.has(relatedId)) {
        issues.push(`Related concept does not exist for ${concept.id}: ${relatedId}`);
      }
    }
    for (const prereqId of concept.prerequisiteConceptIds) {
      if (!DAILY_CONCEPT_REGISTRY_BY_ID.has(prereqId)) {
        issues.push(`Prerequisite concept does not exist for ${concept.id}: ${prereqId}`);
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(`Daily concept registry validation failed:\n- ${issues.join("\n- ")}`);
  }
}
