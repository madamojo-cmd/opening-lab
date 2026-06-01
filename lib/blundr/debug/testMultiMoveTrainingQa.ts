import { testMultiMoveTrainingQa as runMultiMoveTrainingQa } from "./__tests__/multiMoveTrainingQa.test";

export function testMultiMoveTrainingQa(): void {
  console.log("Running Blundr multi-move QA...");
  runMultiMoveTrainingQa();
  console.log("✓ Blundr multi-move QA passed");
}

if (process.argv[1]?.endsWith("testMultiMoveTrainingQa.ts")) {
  testMultiMoveTrainingQa();
}
