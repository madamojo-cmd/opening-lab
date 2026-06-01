import { testOpeningPlanRegistry } from "./__tests__/openingPlanRegistry.test";
import { testPlanFeatureMapper } from "./__tests__/planFeatureMapper.test";
import { testPlanMatcherRules } from "./__tests__/planMatcherRules.test";
import { testPlanRecognitionEngine } from "./__tests__/planRecognitionEngine.test";

export function testPlanRecognition(): void {
  testOpeningPlanRegistry();
  testPlanFeatureMapper();
  testPlanMatcherRules();
  testPlanRecognitionEngine();
}
