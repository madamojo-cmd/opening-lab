import { COACH_BENCHMARK_FIXTURES } from "./coachBenchmarkFixtures";
import { runCoachBenchmark } from "./coachBenchmarkRunner";
import { lintCoachCopy } from "./coachCopyLint";

export function testCoachBenchmark(): void {
  const lintIssues = lintCoachCopy();
  if (lintIssues.length) {
    throw new Error(`Coach copy lint failed: ${lintIssues.map((issue) => `${issue.id}:${issue.issue}`).join(" | ")}`);
  }

  const results = runCoachBenchmark(COACH_BENCHMARK_FIXTURES);
  const failed = results.filter((result) => !result.passed);
  if (failed.length) {
    throw new Error(`Coach benchmark failed: ${failed.map((result) => `${result.fixtureId}:${result.failures.join(",")}`).join(" | ")}`);
  }
}
