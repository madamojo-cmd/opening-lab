import type { DailyValidationContentItem, DailyValidationIssue, DailyValidationResult } from "./dailyValidationTypes";
import { bucketFromCount, makeValidationIssue, toValidationResult, normalizeText, sortByCountDesc } from "./dailyValidationUtils";

function normalizeFenKey(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeNoveltyKey(value: unknown): string {
  return normalizeText(value);
}

function normalizeDifficultyKey(value: unknown): string {
  return normalizeText(value);
}

function isHighMasteryItem(item: DailyValidationContentItem): boolean {
  const currentMastery = Number(item.currentMastery ?? 0);
  const masteryConfidence = Number(item.masteryConfidence ?? 0);
  return Number.isFinite(currentMastery) && Number.isFinite(masteryConfidence) && currentMastery > 0.8 && masteryConfidence > 0.6;
}

export function makeFormationKey(input: Pick<DailyValidationContentItem, "id" | "kind" | "fen" | "noveltyKey" | "formationHash">): string {
  const noveltyKey = normalizeNoveltyKey(input.noveltyKey);
  if (noveltyKey) return `novelty:${noveltyKey}`;
  const formationHash = normalizeText(input.formationHash);
  if (formationHash) return `formation:${formationHash}`;
  const fen = normalizeFenKey(input.fen);
  if (fen) return `fen:${fen}`;
  const kind = normalizeText(input.kind);
  const id = normalizeText(input.id);
  return [kind, id].filter(Boolean).join(":");
}

export function detectDuplicateFenKeys(items: readonly DailyValidationContentItem[]): Record<string, DailyValidationContentItem[]> {
  return Object.entries(
    items.reduce<Record<string, DailyValidationContentItem[]>>((acc, item) => {
      const key = normalizeFenKey(item.fen);
      if (!key) return acc;
      (acc[key] ??= []).push(item);
      return acc;
    }, {}),
  ).reduce<Record<string, DailyValidationContentItem[]>>((acc, [key, group]) => {
    if (group.length > 1) acc[key] = group;
    return acc;
  }, {});
}

export function detectDuplicateNoveltyKeys(items: readonly DailyValidationContentItem[]): Record<string, DailyValidationContentItem[]> {
  return Object.entries(
    items.reduce<Record<string, DailyValidationContentItem[]>>((acc, item) => {
      const key = normalizeNoveltyKey(item.noveltyKey);
      if (!key) return acc;
      (acc[key] ??= []).push(item);
      return acc;
    }, {}),
  ).reduce<Record<string, DailyValidationContentItem[]>>((acc, [key, group]) => {
    if (group.length > 1) acc[key] = group;
    return acc;
  }, {});
}

function duplicateGroupsToIssues(
  groups: Record<string, DailyValidationContentItem[]>,
  category: DailyValidationIssue["category"],
  code: string,
  severity: DailyValidationIssue["severity"],
  messageFactory: (key: string, count: number) => string,
): DailyValidationIssue[] {
  return Object.entries(groups).map(([key, group]) =>
    makeValidationIssue({
      severity,
      category,
      code,
      message: messageFactory(key, group.length),
      itemId: group[0]?.id,
      fen: group[0]?.fen ?? undefined,
      suggestion: "Deduplicate the formation before serving it again in Daily Blundr.",
    }),
  );
}

export function validateNoveltyKeys(items: readonly DailyValidationContentItem[]): DailyValidationResult {
  const issues: DailyValidationIssue[] = [];
  for (const item of items) {
    if ((item.kind === "mini_game" || item.kind === "training_target") && !normalizeNoveltyKey(item.noveltyKey)) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "novelty",
          code: "missing_novelty_key",
          message: `${item.kind} card ${item.id} is missing noveltyKey.`,
          itemId: item.id,
          fen: item.fen ?? undefined,
          suggestion: "Generate a stable noveltyKey for the item.",
        }),
      );
    }
  }

  const duplicateFenGroups = detectDuplicateFenKeys(items);
  const duplicateNoveltyGroups = detectDuplicateNoveltyKeys(items);
  issues.push(
    ...duplicateGroupsToIssues(
      duplicateFenGroups,
      "novelty",
      "duplicate_fen",
      "warning",
      (key, count) => `FEN ${key} appears ${count} times in the current content set.`,
    ),
  );
  issues.push(
    ...duplicateGroupsToIssues(
      duplicateNoveltyGroups,
      "novelty",
      "duplicate_novelty_key",
      "error",
      (key, count) => `noveltyKey ${key} appears ${count} times in the current content set.`,
    ),
  );

  for (const group of Object.values(duplicateNoveltyGroups)) {
    if (!group.length) continue;
    const first = group[0];
    const lowDifficulty = normalizeDifficultyKey(first?.difficulty) === "intro" || normalizeDifficultyKey(first?.difficulty) === "beginner";
    if (lowDifficulty && group.every((item) => isHighMasteryItem(item))) {
      issues.push(
        makeValidationIssue({
          severity: "warning",
          category: "novelty",
          code: "overused_easy_content",
          message: `High-mastery content with noveltyKey ${normalizeNoveltyKey(first?.noveltyKey)} is being repeated in an easy band.`,
          itemId: first?.id,
          fen: first?.fen ?? undefined,
          suggestion: "Advance the difficulty or swap in a different formation.",
        }),
      );
    }
  }

  return toValidationResult(issues);
}

export function summarizeNoveltyCoverage(items: readonly DailyValidationContentItem[]) {
  const total = Math.max(1, items.length);
  const duplicateFenGroups = detectDuplicateFenKeys(items);
  const duplicateNoveltyGroups = detectDuplicateNoveltyKeys(items);
  const duplicateFenCount = Object.values(duplicateFenGroups).reduce((sum, group) => sum + group.length, 0);
  const duplicateNoveltyCount = Object.values(duplicateNoveltyGroups).reduce((sum, group) => sum + group.length, 0);
  const noveltyBearingCount = items.filter((item) => Boolean(normalizeNoveltyKey(item.noveltyKey) || normalizeText(item.formationHash))).length;
  const missingNoveltyCount = items.filter((item) => (item.kind === "mini_game" || item.kind === "training_target") && !normalizeNoveltyKey(item.noveltyKey)).length;

  return sortByCountDesc([
    bucketFromCount("unique_novelty", "Unique novelty keys", Math.max(0, noveltyBearingCount - duplicateNoveltyCount), total),
    bucketFromCount("duplicate_novelty", "Duplicate novelty keys", duplicateNoveltyCount, total),
    bucketFromCount("duplicate_fen", "Duplicate FENs", duplicateFenCount, total),
    bucketFromCount("missing_novelty", "Missing novelty keys", missingNoveltyCount, total),
  ]);
}

export function summarizeNoveltyGroups(items: readonly DailyValidationContentItem[]): {
  duplicateFenGroups: Record<string, DailyValidationContentItem[]>;
  duplicateNoveltyGroups: Record<string, DailyValidationContentItem[]>;
} {
  return {
    duplicateFenGroups: detectDuplicateFenKeys(items),
    duplicateNoveltyGroups: detectDuplicateNoveltyKeys(items),
  };
}
