import type {
  DailyCoverageBucket,
  DailyValidationCategory,
  DailyValidationIssue,
  DailyValidationResult,
  DailyValidationSeverity,
} from "./dailyValidationTypes";

export function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function severityRank(severity: DailyValidationSeverity): number {
  if (severity === "error") return 2;
  if (severity === "warning") return 1;
  return 0;
}

export function buildValidationIssueId(parts: readonly (string | number | boolean | null | undefined)[]): string {
  const normalized = parts
    .map((part) => normalizeText(part))
    .filter(Boolean)
    .join("|");
  return normalized || `validation|${Date.now().toString(36)}`;
}

export function makeValidationIssue(input: {
  severity: DailyValidationSeverity;
  category: DailyValidationCategory;
  code: string;
  message: string;
  path?: string;
  itemId?: string;
  conceptId?: string;
  fen?: string;
  suggestion?: string;
}): DailyValidationIssue {
  return {
    id: buildValidationIssueId([
      input.category,
      input.code,
      input.itemId,
      input.path,
      input.conceptId,
      input.fen,
    ]),
    severity: input.severity,
    category: input.category,
    code: input.code,
    message: input.message,
    path: input.path,
    itemId: input.itemId,
    conceptId: input.conceptId,
    fen: input.fen,
    suggestion: input.suggestion,
  };
}

export function toValidationResult(issues: readonly DailyValidationIssue[]): DailyValidationResult {
  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues: [...issues],
  };
}

export function mergeValidationResults(...results: readonly DailyValidationResult[]): DailyValidationResult {
  return toValidationResult(results.flatMap((result) => result.issues));
}

export function countIssuesBySeverity(issues: readonly DailyValidationIssue[]): Record<DailyValidationSeverity, number> {
  return issues.reduce(
    (acc, issue) => {
      acc[issue.severity] += 1;
      return acc;
    },
    { info: 0, warning: 0, error: 0 } as Record<DailyValidationSeverity, number>,
  );
}

export function sortIssuesBySeverity(issues: readonly DailyValidationIssue[]): DailyValidationIssue[] {
  return [...issues].sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.category.localeCompare(b.category) || a.code.localeCompare(b.code) || a.id.localeCompare(b.id));
}

export function countByKey<T>(items: readonly T[], keyFn: (item: T) => string): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = normalizeText(keyFn(item));
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function bucketsFromCounts(
  counts: Record<string, number>,
  labels?: Record<string, string>,
  total: number = Object.values(counts).reduce((sum, count) => sum + count, 0),
): DailyCoverageBucket[] {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      key,
      label: labels?.[key] ?? key,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));
}

export function bucketFromCount(key: string, label: string, count: number, total: number): DailyCoverageBucket {
  return {
    key,
    label,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  };
}

