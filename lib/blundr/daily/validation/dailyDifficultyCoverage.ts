import { getDailyConceptById } from "../concepts/dailyConceptRegistry";
import type { DailyValidationContentItem, DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { bucketFromCount, getContentSurface, makeValidationIssue, toValidationResult } from "./dailyValidationUtils";

const DIFFICULTY_ORDER = ["intro", "beginner", "early_intermediate", "intermediate", "advanced", "expert"] as const;
type CoverageDifficulty = (typeof DIFFICULTY_ORDER)[number];

function normalizeDifficulty(value: unknown): CoverageDifficulty | "unknown" {
  return DIFFICULTY_ORDER.includes(String(value ?? "").trim() as CoverageDifficulty) ? (String(value ?? "").trim() as CoverageDifficulty) : "unknown";
}

function bucketLabel(key: CoverageDifficulty): string {
  switch (key) {
    case "intro":
      return "Intro";
    case "beginner":
      return "Beginner";
    case "early_intermediate":
      return "Early Intermediate";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    case "expert":
      return "Expert";
  }
}

export function getDifficultyCoverageBuckets(items: readonly DailyValidationContentItem[]) {
  const counts = DIFFICULTY_ORDER.reduce<Record<CoverageDifficulty, number>>((acc, difficulty) => {
    acc[difficulty] = 0;
    return acc;
  }, {} as Record<CoverageDifficulty, number>);
  for (const item of items) {
    const difficulty = normalizeDifficulty(item.difficulty);
    if (difficulty === "unknown") continue;
    counts[difficulty] += 1;
  }
  const total = Math.max(1, items.length);
  return DIFFICULTY_ORDER.map((difficulty) => bucketFromCount(difficulty, bucketLabel(difficulty), counts[difficulty], total));
}

export function summarizeDifficultyCoverage(items: readonly DailyValidationContentItem[]) {
  return getDifficultyCoverageBuckets(items);
}

function hasBeginnerSafeContent(items: readonly DailyValidationContentItem[]): boolean {
  return items.some((item) => {
    const difficulty = normalizeDifficulty(item.difficulty);
    return difficulty === "intro" || difficulty === "beginner";
  });
}

function hasIntermediatePlusContent(items: readonly DailyValidationContentItem[]): boolean {
  return items.some((item) => {
    const difficulty = normalizeDifficulty(item.difficulty);
    return difficulty === "intermediate" || difficulty === "advanced" || difficulty === "expert";
  });
}

function difficultyGroupHasOnlyIntro(items: readonly DailyValidationContentItem[]): boolean {
  const nonUnknown = items.filter((item) => normalizeDifficulty(item.difficulty) !== "unknown");
  return nonUnknown.length > 0 && nonUnknown.every((item) => normalizeDifficulty(item.difficulty) === "intro");
}

function difficultyGroupHasOnlyAdvancedPlus(items: readonly DailyValidationContentItem[]): boolean {
  const nonUnknown = items.filter((item) => normalizeDifficulty(item.difficulty) !== "unknown");
  return nonUnknown.length > 0 && nonUnknown.every((item) => normalizeDifficulty(item.difficulty) === "advanced" || normalizeDifficulty(item.difficulty) === "expert");
}

function groupBySurface(items: readonly DailyValidationContentItem[]): Record<string, DailyValidationContentItem[]> {
  return items.reduce<Record<string, DailyValidationContentItem[]>>((acc, item) => {
    const surface = getContentSurface(item);
    (acc[surface] ??= []).push(item);
    return acc;
  }, {});
}

function groupByDomain(items: readonly DailyValidationContentItem[]): Record<string, DailyValidationContentItem[]> {
  return items.reduce<Record<string, DailyValidationContentItem[]>>((acc, item) => {
    const conceptIds = item.conceptIds ?? [];
    if (!conceptIds.length) return acc;
    const domains = new Set<string>();
    for (const conceptId of conceptIds) {
      const concept = getDailyConceptById(conceptId);
      if (concept) domains.add(concept.domain);
    }
    for (const domain of domains) {
      (acc[domain] ??= []).push(item);
    }
    return acc;
  }, {});
}

export function validateDifficultyDistribution(items: readonly DailyValidationContentItem[]): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  if (!items.length) {
    return toValidationResult([]);
  }

  if (difficultyGroupHasOnlyIntro(items)) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "difficulty",
        code: "all_intro_content",
        message: "All Daily Blundr content is in the intro band.",
        suggestion: "Add beginner and intermediate content to widen the training ladder.",
      }),
    );
  }

  if (difficultyGroupHasOnlyAdvancedPlus(items)) {
    issues.push(
      makeValidationIssue({
        severity: "warning",
        category: "difficulty",
        code: "all_advanced_expert_content",
        message: "All Daily Blundr content is in the advanced or expert bands.",
        suggestion: "Add beginner-safe content so Daily Blundr can serve lighter sessions.",
      }),
    );
  }

  const surfaceGroups = groupBySurface(items);
  for (const [surface, group] of Object.entries(surfaceGroups)) {
    if (!hasBeginnerSafeContent(group)) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "difficulty",
          code: "surface_missing_beginner_safe_content",
          message: `Surface ${surface} has no intro or beginner content.`,
          suggestion: "Make sure each Daily surface can serve at least one beginner-safe item.",
        }),
      );
    }
  }

  const domainGroups = groupByDomain(items);
  for (const [domain, group] of Object.entries(domainGroups)) {
    if (!hasIntermediatePlusContent(group)) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "difficulty",
          code: "domain_missing_intermediate_content",
          message: `Concept domain ${domain} has no intermediate-or-higher content.`,
          suggestion: "Add at least one intermediate, advanced, or expert item for this domain.",
        }),
      );
    }
  }

  return toValidationResult(issues);
}
