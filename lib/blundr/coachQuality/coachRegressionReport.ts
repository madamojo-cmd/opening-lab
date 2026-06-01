import type { CoachBenchmarkResult } from "./coachBenchmarkTypes";

export function buildCoachRegressionReport(results: CoachBenchmarkResult[]): string {
  const lines: string[] = [];
  for (const result of results) {
    lines.push(`Fixture: ${result.fixtureId}`);
    lines.push(`Passed: ${result.passed ? "yes" : "no"} • score=${result.score}`);
    lines.push(`Mode: ${result.selectedMode ?? "n/a"}`);
    lines.push(`Opportunity: ${result.selectedOpportunity ?? "n/a"}`);
    lines.push(`Intent: ${result.selectedIntent ?? "n/a"}`);
    lines.push(`Buttons: ${(result.selectedButtons ?? []).join(",") || "none"}`);
    lines.push(`Text: ${result.selectedText ?? ""}`);
    lines.push(`Failures: ${result.failures.join(" | ") || "none"}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
