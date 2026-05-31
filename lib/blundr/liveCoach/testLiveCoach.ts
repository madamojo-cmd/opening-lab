import { testCandidateMoveProfiler } from "./__tests__/candidateMoveProfiler.test";
import { testEngineSafetyAdapter } from "./__tests__/engineSafetyAdapter.test";
import { testHumanEngineDivergence } from "./__tests__/humanEngineDivergence.test";
import { testLiveCoachCommentRanker } from "./__tests__/liveCoachCommentRanker.test";
import { testLiveCoachSafety } from "./__tests__/liveCoachSafety.test";
import { testLiveCoachSilencePolicy } from "./__tests__/liveCoachSilencePolicy.test";
import { testMaiaSignalAdapter } from "./__tests__/maiaSignalAdapter.test";
import { testPatternTransferMatcher } from "./__tests__/patternTransferMatcher.test";
import { testPedagogicalOpportunityEngine } from "./__tests__/pedagogicalOpportunityEngine.test";
import { testPositionEvidenceBuilder } from "./__tests__/positionEvidenceBuilder.test";
import { testPositionFeatureExtractor } from "./__tests__/positionFeatureExtractor.test";
import { testSkillGradientAnalyzer } from "./__tests__/skillGradientAnalyzer.test";
import { testContinuedPlay } from "../continuedPlay/testContinuedPlay";

export function testLiveCoach(): void {
  testCandidateMoveProfiler();
  testEngineSafetyAdapter();
  testHumanEngineDivergence();
  testLiveCoachCommentRanker();
  testLiveCoachSafety();
  testLiveCoachSilencePolicy();
  testMaiaSignalAdapter();
  testPatternTransferMatcher();
  testPedagogicalOpportunityEngine();
  testPositionEvidenceBuilder();
  testPositionFeatureExtractor();
  testSkillGradientAnalyzer();
  testContinuedPlay();
}
