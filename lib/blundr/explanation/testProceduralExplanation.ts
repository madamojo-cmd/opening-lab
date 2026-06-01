import { testChessLanguageLibrary } from "./__tests__/chessLanguageLibrary.test";
import { testCoachTemplateLibrary } from "./__tests__/coachTemplateLibrary.test";
import { testExplanationSafetyLinter } from "./__tests__/explanationSafetyLinter.test";
import { testProceduralExplanationEngine } from "./__tests__/proceduralExplanationEngine.test";
import { testRatingDepthPolicy } from "./__tests__/ratingDepthPolicy.test";
import { testTemplateRegistryStats } from "./__tests__/templateRegistryStats.test";
import { testTemplateVariableResolver } from "./__tests__/templateVariableResolver.test";

export function testProceduralExplanation(): void {
  testCoachTemplateLibrary();
  testTemplateVariableResolver();
  testExplanationSafetyLinter();
  testProceduralExplanationEngine();
  testRatingDepthPolicy();
  testChessLanguageLibrary();
  testTemplateRegistryStats();
}
