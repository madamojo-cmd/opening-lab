import assert from "node:assert/strict";
import { COACH_BENCHMARK_FIXTURES } from "../coachBenchmarkFixtures";
import { runCoachBenchmark } from "../coachBenchmarkRunner";

export function testCoachBenchmarkRunner(): void {
  const results = runCoachBenchmark(COACH_BENCHMARK_FIXTURES);
  assert.equal(results.length, COACH_BENCHMARK_FIXTURES.length);
  assert.equal(results.some((result) => result.fixtureId === "italian_bishop_pressure_assisted"), true);
  assert.equal(results.some((result) => result.fixtureId === "stale_frame_fen" && result.passed), true);
}
