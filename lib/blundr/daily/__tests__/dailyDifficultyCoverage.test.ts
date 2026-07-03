import assert from "node:assert/strict";

import { getDifficultyCoverageBuckets, summarizeDifficultyCoverage, validateDifficultyDistribution } from "../validation/dailyDifficultyCoverage";

export function testDailyDifficultyCoverage(): void {
  const counts = getDifficultyCoverageBuckets([
    { id: "a", kind: "recall", difficulty: "intro" },
    { id: "b", kind: "mini_game", difficulty: "beginner" },
    { id: "c", kind: "training_target", difficulty: "early_intermediate" },
    { id: "d", kind: "recall", difficulty: "intermediate" },
    { id: "e", kind: "recall", difficulty: "advanced" },
    { id: "f", kind: "recall", difficulty: "expert" },
  ]);
  assert.equal(counts.find((bucket) => bucket.key === "intro")?.count, 1);
  assert.equal(counts.find((bucket) => bucket.key === "beginner")?.count, 1);
  assert.equal(counts.find((bucket) => bucket.key === "early_intermediate")?.count, 1);
  assert.equal(counts.find((bucket) => bucket.key === "intermediate")?.count, 1);
  assert.equal(counts.find((bucket) => bucket.key === "advanced")?.count, 1);
  assert.equal(counts.find((bucket) => bucket.key === "expert")?.count, 1);
  assert.equal(summarizeDifficultyCoverage([]).length, 6);

  const allIntro = validateDifficultyDistribution([
    { id: "a", kind: "recall", difficulty: "intro" },
    { id: "b", kind: "mini_game", difficulty: "intro" },
  ]);
  assert.ok(allIntro.issues.some((issue) => issue.code === "all_intro_content"));
  assert.ok(allIntro.valid);

  const mixed = validateDifficultyDistribution([
    { id: "a", kind: "recall", difficulty: "intro" },
    { id: "b", kind: "mini_game", difficulty: "beginner" },
    { id: "c", kind: "training_target", difficulty: "beginner" },
    { id: "d", kind: "recall", difficulty: "intermediate" },
  ]);
  assert.ok(mixed.valid);

  const noBeginnerSurface = validateDifficultyDistribution([
    { id: "a", kind: "mini_game", difficulty: "advanced" },
    { id: "b", kind: "mini_game", difficulty: "expert" },
  ]);
  assert.ok(noBeginnerSurface.issues.some((issue) => issue.code === "surface_missing_beginner_safe_content"));
  assert.ok(noBeginnerSurface.valid);
}

testDailyDifficultyCoverage();
console.log("dailyDifficultyCoverage ok");
