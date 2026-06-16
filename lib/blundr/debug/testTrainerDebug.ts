import { testTrainerDebugEventLog } from "./__tests__/trainerDebugEventLog.test";
import { testFallbackCopyGuard } from "./__tests__/fallbackCopyGuard.test";
import { testStage2FeatureTrace } from "./__tests__/stage2FeatureTrace.test";
import { testTrainerDebugSanitizer } from "./__tests__/trainerDebugSanitizer.test";
import { testTrainerDebugSnapshot } from "./__tests__/trainerDebugSnapshot.test";
import { testTrainerFrameResolutionPageParity } from "../../../tests/coach/trainerFrameResolutionPageParity.test";
import { testStage2ContentDebugVisibility } from "./__tests__/stage2ContentDebugVisibility.test";
import { testRuntimeDataSourceDebug } from "../../../tests/coach/runtimeDataSourceDebug.test";
import { testMultiMoveTrainingQa } from "./testMultiMoveTrainingQa";
import { testCurrentInstructionFrame } from "../runtime/__tests__/currentInstructionFrame.test";
import { testOpponentReplyGuard } from "../runtime/__tests__/opponentReplyGuard.test";
import { testRestrictedLineExhaustionContract } from "../runtime/__tests__/restrictedLineExhaustionContract.test";
import { testContinuationCandidateVisual } from "../visual/__tests__/continuationCandidateVisual.test";
import { testCoachActionStylePolicy } from "../presentation/__tests__/coachActionStylePolicy.test";
import { testRenderedCoachCopyAuthority } from "../presentation/__tests__/renderedCoachCopyAuthority.test";
import { testPromotionPickerAuthority } from "../../../tests/coach/promotionPickerAuthority.test";

export function testTrainerDebug(): void {
  console.log("Running Blundr trainer debug QA...");
  testTrainerDebugSnapshot();
  console.log("✓ trainer debug snapshot passed");
  testStage2ContentDebugVisibility();
  console.log("✓ stage2 content debug visibility passed");
  testRuntimeDataSourceDebug();
  console.log("✓ runtime data source debug passed");
  testStage2FeatureTrace();
  console.log("✓ stage2 feature trace passed");
  testPromotionPickerAuthority();
  console.log("✓ promotion picker authority passed");
  testTrainerFrameResolutionPageParity();
  console.log("✓ trainer frame resolution page parity passed");
  testTrainerDebugSanitizer();
  console.log("✓ trainer debug sanitizer passed");
  testTrainerDebugEventLog();
  console.log("✓ trainer debug event log passed");
  testCurrentInstructionFrame();
  console.log("✓ current instruction frame passed");
  testOpponentReplyGuard();
  console.log("✓ opponent reply guard passed");
  testRestrictedLineExhaustionContract();
  console.log("✓ restricted line exhaustion contract passed");
  testContinuationCandidateVisual();
  console.log("✓ continuation candidate visual passed");
  testCoachActionStylePolicy();
  console.log("✓ coach action style policy passed");
  testRenderedCoachCopyAuthority();
  console.log("✓ rendered coach copy authority passed");
  testFallbackCopyGuard();
  console.log("✓ fallback copy guard passed");
  if (process.env.RUN_MULTI_MOVE_QA === "1") {
    testMultiMoveTrainingQa();
  }
  console.log("✓ Blundr trainer debug QA passed");
}

if (process.argv[1]?.endsWith("testTrainerDebug.ts")) {
  testTrainerDebug();
}
