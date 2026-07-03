import assert from "node:assert/strict";

import { buildDailyCoverageReport, formatDailyCoverageReportMarkdown, summarizeDailyValidationIssues } from "../validation/dailyCoverageReport";
import { makeValidationIssue } from "../validation/dailyValidationUtils";
import { makeSampleDeckCards } from "./dailyValidationFixtures";

export function testDailyCoverageReport(): void {
  const items = makeSampleDeckCards();
  const report = buildDailyCoverageReport({ generatedAt: "2026-07-02T12:00:00.000Z", items, issues: [] });

  assert.ok(report.valid);
  assert.equal(report.summary.conceptCount, 68);
  assert.ok(report.surfaceCoverage.length > 0);
  assert.ok(report.difficultyCoverage.length > 0);
  assert.ok(report.noveltyCoverage.length > 0);

  const markdown = formatDailyCoverageReportMarkdown(report);
  assert.ok(markdown.includes("Daily BLUNDR Content Validation Report"));
  assert.ok(markdown.includes("## Concept Coverage"));
  assert.ok(markdown.includes("## Recommended Next Fixes"));

  const warningReport = buildDailyCoverageReport({
    generatedAt: "2026-07-02T12:00:00.000Z",
    items,
    issues: [
      makeValidationIssue({
        severity: "warning",
        category: "coverage",
        code: "test_warning",
        message: "Test warning.",
        suggestion: "Suggested fix.",
      }),
    ],
  });
  assert.ok(warningReport.valid);
  assert.equal(warningReport.summary.warningCount, 1);
  assert.equal(warningReport.summary.errorCount, 0);

  const issueSummary = summarizeDailyValidationIssues(warningReport.issues);
  assert.equal(issueSummary.warningCount, 1);
  assert.equal(issueSummary.errorCount, 0);
}

testDailyCoverageReport();
console.log("dailyCoverageReport ok");

