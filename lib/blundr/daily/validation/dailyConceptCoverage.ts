import { getAllDailyConcepts, getDailyConceptById } from "../concepts/dailyConceptRegistry";
import { normalizeConceptId } from "../concepts/dailyConceptTagging";
import type { DailyConceptDefinition } from "../concepts/dailyConceptTypes";
import type { DailyValidationContentItem, DailyCoverageBucket } from "./dailyValidationTypes";
import { bucketFromCount, getContentSurface, sortByCountDesc, normalizeText } from "./dailyValidationUtils";

type ConceptCountEntry = {
  concept: DailyConceptDefinition;
  count: number;
};

function getItemConceptIds(item: DailyValidationContentItem): string[] {
  const normalizedConceptIds = [
    ...(item.conceptIds ?? []),
    ...(item.primaryConceptId ? [item.primaryConceptId] : []),
    ...((item.conceptMasteryKeys ?? []).map((key) => normalizeConceptId(key))),
  ]
    .map((value) => normalizeConceptId(value))
    .filter(Boolean) as string[];

  return Array.from(new Set(normalizedConceptIds));
}

function getConceptUsageCounts(items: readonly DailyValidationContentItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const conceptId of getItemConceptIds(item)) {
      counts.set(conceptId, (counts.get(conceptId) ?? 0) + 1);
    }
  }
  return counts;
}

function getDomainCounts(items: readonly DailyValidationContentItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const domains = new Set<string>();
    for (const conceptId of getItemConceptIds(item)) {
      const concept = getDailyConceptById(conceptId);
      if (concept) domains.add(concept.domain);
    }
    for (const domain of domains) {
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
  }
  return counts;
}

function getSurfaceCounts(items: readonly DailyValidationContentItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const surface = getContentSurface(item);
    counts.set(surface, (counts.get(surface) ?? 0) + 1);
  }
  return counts;
}

function bucketizeConceptEntries(entries: readonly ConceptCountEntry[], total: number): DailyCoverageBucket[] {
  return sortByCountDesc(
    entries.map((entry) => bucketFromCount(entry.concept.id, entry.concept.shortName || entry.concept.displayName, entry.count, total)),
  );
}

export function findUntaggedContent(items: readonly DailyValidationContentItem[]): DailyValidationContentItem[] {
  return items.filter((item) => getItemConceptIds(item).length === 0);
}

export function summarizeConceptCoverageByDomain(items: readonly DailyValidationContentItem[]): DailyCoverageBucket[] {
  const counts = getDomainCounts(items);
  const conceptsByDomain = getAllDailyConcepts().reduce<Record<string, DailyConceptDefinition[]>>((acc, concept) => {
    (acc[concept.domain] ??= []).push(concept);
    return acc;
  }, {});
  const total = Math.max(1, items.length);
  const buckets: DailyCoverageBucket[] = [];
  for (const [domain, concepts] of Object.entries(conceptsByDomain)) {
    const count = counts.get(domain) ?? 0;
    buckets.push(bucketFromCount(domain, `${domain} (${concepts.length})`, count, total));
  }
  return sortByCountDesc(buckets);
}

export function summarizeConceptCoverageBySurface(items: readonly DailyValidationContentItem[]): DailyCoverageBucket[] {
  const counts = getSurfaceCounts(items);
  const total = Math.max(1, items.length);
  const surfaces = ["recall", "mini_game", "training_target", "future_content_bank"] as const;
  return sortByCountDesc(
    surfaces.map((surface) => bucketFromCount(surface, surface, counts.get(surface) ?? 0, total)),
  );
}

export function summarizeConceptCoverage(items: readonly DailyValidationContentItem[]): {
  conceptCoverage: DailyCoverageBucket[];
  domainCoverage: DailyCoverageBucket[];
  surfaceCoverage: DailyCoverageBucket[];
  untaggedContent: DailyValidationContentItem[];
  taggedContentCount: number;
  totalItems: number;
} {
  const conceptCounts = getConceptUsageCounts(items);
  const conceptEntries = getAllDailyConcepts().map((concept) => ({
    concept,
    count: conceptCounts.get(concept.id) ?? 0,
  }));
  const untaggedContent = findUntaggedContent(items);
  const totalItems = items.length;
  return {
    conceptCoverage: bucketizeConceptEntries(conceptEntries, Math.max(1, items.length)),
    domainCoverage: summarizeConceptCoverageByDomain(items),
    surfaceCoverage: summarizeConceptCoverageBySurface(items),
    untaggedContent,
    taggedContentCount: Math.max(0, totalItems - untaggedContent.length),
    totalItems,
  };
}

export function findOverrepresentedConcepts(items: readonly DailyValidationContentItem[], limit = 5): DailyCoverageBucket[] {
  const conceptCounts = getConceptUsageCounts(items);
  const entries = getAllDailyConcepts().map((concept) => ({
    concept,
    count: conceptCounts.get(concept.id) ?? 0,
  }));
  return bucketizeConceptEntries(entries, Math.max(1, items.length)).slice(0, Math.max(0, limit));
}

export function findUnderrepresentedConcepts(items: readonly DailyValidationContentItem[], limit = 5): DailyCoverageBucket[] {
  const conceptCounts = getConceptUsageCounts(items);
  const entries = getAllDailyConcepts().map((concept) => ({
    concept,
    count: conceptCounts.get(concept.id) ?? 0,
  }));
  return bucketizeConceptEntries(entries, Math.max(1, items.length))
    .sort((a, b) => a.count - b.count || normalizeText(a.label).localeCompare(normalizeText(b.label)))
    .slice(0, Math.max(0, limit));
}
