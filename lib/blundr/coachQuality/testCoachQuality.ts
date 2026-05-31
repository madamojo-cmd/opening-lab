import { testCoachExplanationPipeline } from "../coachBrain/__tests__/coachExplanationPipeline.test";

export function testCoachQuality(): void {
  console.log("Running Blundr coach-quality QA...");
  testCoachExplanationPipeline();
  console.log("✓ coach explanation pipeline passed");
  console.log("✓ Blundr coach-quality QA passed");
}

if (process.argv[1]?.endsWith("testCoachQuality.ts")) {
  testCoachQuality();
}
