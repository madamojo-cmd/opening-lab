import { testCoachCardPresenter } from "./__tests__/coachCardPresenter.test";
import { testCoachContextBuilder } from "./__tests__/coachContextBuilder.test";
import { testCoachDecisionEngine } from "./__tests__/coachDecisionEngine.test";
import { testCoachHintEngine } from "./__tests__/coachHintEngine.test";
import { testCoachSafety } from "./__tests__/coachSafety.test";
import { testCoachUtteranceMemory } from "./__tests__/coachUtteranceMemory.test";
import { testCoachVariationPolicy } from "./__tests__/coachVariationPolicy.test";
import { testCoachBrain } from "../coachBrain/testCoachBrain";
import { testCoachSurface } from "../coachSurface/testCoachSurface";

export function testAdaptiveCoach(): void {
  testCoachCardPresenter();
  testCoachContextBuilder();
  testCoachDecisionEngine();
  testCoachHintEngine();
  testCoachSafety();
  testCoachUtteranceMemory();
  testCoachVariationPolicy();
  testCoachBrain();
  testCoachSurface();
}
