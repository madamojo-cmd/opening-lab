import { getAllDailyConcepts } from "../concepts/dailyConceptRegistry";
import type { DailyCoverageReport, DailyValidationContentItem, DailyValidationIssue, DailyValidationIssueSummary, DailyValidationReportInput } from "./dailyValidationTypes";
import { countIssuesByCategory, countIssuesBySeverity, sortIssuesBySeverity } from "./dailyValidationUtils";
import { summarizeConceptCoverage } from "./dailyConceptCoverage";
import { summarizeDifficultyCoverage } from "./dailyDifficultyCoverage";
import { summarizeNoveltyCoverage } from "./dailyNoveltyValidation";

function uniqueStrings(values: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function countItemsByKind(items: readonly DailyValidationContentItem[], kind: string): number {
  return items.filter((item) => String(item.kind ?? "").trim() === kind).length;
}

function buildRecommendations(issues: readonly DailyValidationIssue[]): string[] {
  const suggestions = uniqueStrings(issues.map((issue) => issue.suggestion ?? ""));
  if (suggestions.length > 0) return suggestions.slice(0, 5);
  return ["No immediate fixes required."];
}

export function summarizeDailyValidationIssues(issues: readonly DailyValidationIssue[]): DailyValidationIssueSummary {
  const sorted = sortIssuesBySeverity(issues);
  const severityCounts = countIssuesBySeverity(issues);
  return {
    issueCount: issues.length,
    errorCount: severityCounts.error,
    warningCount: severityCounts.warning,
    infoCount: severityCounts.info,
    byCategory: countIssuesByCategory(issues),
    topErrors: sorted.filter((issue) => issue.severity === "error").slice(0, 5),
    topWarnings: sorted.filter((issue) => issue.severity === "warning").slice(0, 5),
  };
}

export function buildDailyCoverageReport(input: DailyValidationReportInput): DailyCoverageReport {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const items = input.items ?? [];
  const issues = [...(input.issues ?? [])];
  const conceptCoverage = summarizeConceptCoverage(items);
  const difficultyCoverage = summarizeDifficultyCoverage(items);
  const noveltyCoverage = summarizeNoveltyCoverage(items);
  const issueSummary = summarizeDailyValidationIssues(issues);
  const reportIssues = sortIssuesBySeverity(issues);
  const valid = !reportIssues.some((issue) => issue.severity === "error");

  return {
    generatedAt,
    valid,
    summary: {
      issueCount: issueSummary.issueCount,
      errorCount: issueSummary.errorCount,
      warningCount: issueSummary.warningCount,
      conceptCount: getAllDailyConcepts().length,
      miniGameCount: countItemsByKind(items, "mini_game"),
      trainingTargetCount: countItemsByKind(items, "training_target"),
    },
    conceptCoverage: conceptCoverage.conceptCoverage,
    difficultyCoverage,
    surfaceCoverage: conceptCoverage.surfaceCoverage,
    noveltyCoverage,
    issues: reportIssues,
  };
}

export function formatDailyCoverageReportMarkdown(report: DailyCoverageReport): string {
  const issueSummary = summarizeDailyValidationIssues(report.issues);
  const recommendations = buildRecommendations(report.issues);

  const lines: string[] = [
    "# Daily BLUNDR Content Validation Report",
    "",
    `Generated at: ${report.generatedAt}`,
    `Valid: ${report.valid ? "yes" : "no"}`,
    "",
    "## Summary",
    `- Issues: ${report.summary.issueCount}`,
    `- Errors: ${report.summary.errorCount}`,
    `- Warnings: ${report.summary.warningCount}`,
    `- Concepts: ${report.summary.conceptCount}`,
    `- Mini-games: ${report.summary.miniGameCount}`,
    `- Training targets: ${report.summary.trainingTargetCount}`,
    "",
    "## Concept Coverage",
    ...report.conceptCoverage.map((bucket) => `- ${bucket.label}: ${bucket.count}${bucket.percentage !== undefined ? ` (${bucket.percentage}%)` : ""}`),
    "",
    "## Difficulty Coverage",
    ...report.difficultyCoverage.map((bucket) => `- ${bucket.label}: ${bucket.count}${bucket.percentage !== undefined ? ` (${bucket.percentage}%)` : ""}`),
    "",
    "## Surface Coverage",
    ...report.surfaceCoverage.map((bucket) => `- ${bucket.label}: ${bucket.count}${bucket.percentage !== undefined ? ` (${bucket.percentage}%)` : ""}`),
    "",
    "## Novelty Coverage",
    ...report.noveltyCoverage.map((bucket) => `- ${bucket.label}: ${bucket.count}${bucket.percentage !== undefined ? ` (${bucket.percentage}%)` : ""}`),
    "",
    "## Top Errors",
    ...(issueSummary.topErrors.length ? issueSummary.topErrors.map((issue) => `- [${issue.category}/${issue.code}] ${issue.message}`) : ["- None"]),
    "",
    "## Top Warnings",
    ...(issueSummary.topWarnings.length ? issueSummary.topWarnings.map((issue) => `- [${issue.category}/${issue.code}] ${issue.message}`) : ["- None"]),
    "",
    "## Recommended Next Fixes",
    ...recommendations.map((line) => `- ${line}`),
  ];

  return lines.join("\n");
}
