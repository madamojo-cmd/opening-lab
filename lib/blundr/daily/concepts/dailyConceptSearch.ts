import type { DailyBlundrCard } from "../dailyBlundrTypes";
import type { DailyMiniGameState } from "../miniGames/dailyMiniGameTypes";
import type { DailyTrainingTargetState } from "../trainingTargets/dailyTrainingTargetTypes";
import { getAllDailyConcepts, getDailyConceptById } from "./dailyConceptRegistry";
import { getConceptIdsForMasteryTargets, inferConceptTagsForMiniGame, inferConceptTagsForTrainingTarget, normalizeConceptId } from "./dailyConceptTagging";
import type { DailyConceptDefinition, DailyConceptDifficulty, DailyConceptDomain, DailyConceptId, DailyConceptTrainingSurface } from "./dailyConceptTypes";

export type DailyConceptFilterArgs = {
  query?: string;
  domains?: readonly DailyConceptDomain[];
  surfaces?: readonly DailyConceptTrainingSurface[];
  difficulties?: readonly DailyConceptDifficulty[];
  conceptIds?: readonly DailyConceptId[];
  limit?: number;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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

function conceptText(concept: DailyConceptDefinition): string {
  return normalizeText([
    concept.id,
    concept.slug,
    concept.displayName,
    concept.shortName,
    concept.summary,
    concept.whyItMatters,
    concept.tags.join(" "),
  ].join(" "));
}

function scoreConcept(concept: DailyConceptDefinition, query: string): number {
  if (!query) return 1;
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 1;
  const text = conceptText(concept);
  if (text === normalizedQuery) return 100;
  let score = 0;
  if (concept.id.toLowerCase() === normalizedQuery) score += 100;
  if (concept.displayName.toLowerCase() === normalizedQuery) score += 80;
  if (concept.shortName.toLowerCase() === normalizedQuery) score += 70;
  if (concept.slug.toLowerCase() === normalizedQuery) score += 60;
  if (text.includes(normalizedQuery)) score += 25;
  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    if (text.includes(token)) score += 8;
  }
  return score;
}

function matchesFilter(concept: DailyConceptDefinition, args: DailyConceptFilterArgs): boolean {
  if (args.domains?.length && !args.domains.includes(concept.domain)) return false;
  if (args.surfaces?.length && !args.surfaces.some((surface) => concept.trainedBy.includes(surface))) return false;
  if (args.difficulties?.length && !args.difficulties.some((difficulty) => concept.recommendedDifficulty.includes(difficulty))) return false;
  if (args.conceptIds?.length && !args.conceptIds.includes(concept.id)) return false;
  return true;
}

export function searchDailyConcepts(query: string): DailyConceptDefinition[] {
  const normalizedQuery = normalizeText(query);
  return getAllDailyConcepts()
    .map((concept) => ({ concept, score: scoreConcept(concept, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.concept.displayName.localeCompare(b.concept.displayName) || a.concept.id.localeCompare(b.concept.id))
    .map((entry) => entry.concept);
}

export function filterDailyConcepts(args: DailyConceptFilterArgs): DailyConceptDefinition[] {
  const searchResults = args.query ? searchDailyConcepts(args.query) : getAllDailyConcepts();
  const limit = typeof args.limit === "number" && Number.isFinite(args.limit) ? Math.max(0, Math.floor(args.limit)) : null;
  const filtered = searchResults.filter((concept) => matchesFilter(concept, args));
  return limit === null ? filtered : filtered.slice(0, limit);
}

function suggestionsFromConceptIds(conceptIds: readonly (string | null | undefined)[]): DailyConceptId[] {
  return uniqueConceptIds(conceptIds).filter((conceptId) => Boolean(getDailyConceptById(conceptId)));
}

export function getConceptSuggestionsForMiniGame(miniGame: Pick<DailyMiniGameState, "miniGameId" | "skillIds"> & { conceptIds?: readonly DailyConceptId[] | null }): DailyConceptId[] {
  return uniqueConceptIds([
    ...(miniGame.conceptIds ?? []),
    ...inferConceptTagsForMiniGame(miniGame.miniGameId, miniGame.skillIds),
  ]).filter((conceptId) => Boolean(getDailyConceptById(conceptId)));
}

export function getConceptSuggestionsForTrainingTarget(
  target: Pick<DailyTrainingTargetState, "trainingTargetId" | "skillIds"> & { conceptIds?: readonly DailyConceptId[] | null },
): DailyConceptId[] {
  return uniqueConceptIds([
    ...(target.conceptIds ?? []),
    ...inferConceptTagsForTrainingTarget(target.trainingTargetId, target.skillIds),
  ]).filter((conceptId) => Boolean(getDailyConceptById(conceptId)));
}

export function getConceptSuggestionsForDailyCard(
  card: DailyBlundrCard,
): DailyConceptId[] {
  const suggestions = [
    ...(card.conceptIds ?? []),
    ...(card.primaryConceptId ? [card.primaryConceptId] : []),
    ...((card.conceptMasteryKeys ?? []).map((key) => normalizeConceptId(key))),
    ...getConceptIdsForMasteryTargets(card.masteryTargets),
  ];

  if (card.kind === "mini_game" && card.miniGame) {
    suggestions.push(...getConceptSuggestionsForMiniGame(card.miniGame));
  } else if (card.kind === "training_target" && card.trainingTarget) {
    suggestions.push(...getConceptSuggestionsForTrainingTarget(card.trainingTarget));
  } else if (card.concept) {
    const normalized = normalizeConceptId(card.concept);
    if (normalized) suggestions.push(normalized);
  }

  return suggestionsFromConceptIds(suggestions);
}
