import { testGenericCoachRepetitionGuard } from "./__tests__/genericCoachRepetitionGuard.test";
import { testGenericDominancePolicy } from "./__tests__/genericDominancePolicy.test";
import { testIntentFirstCoachEngine } from "./__tests__/intentFirstCoachEngine.test";
import { testSessionCoachMemory } from "./__tests__/sessionCoachMemory.test";
import { testSpecificityScorer } from "./__tests__/specificityScorer.test";
import { testTeachingIntent } from "./__tests__/teachingIntent.test";

export function testIntentFirstCoach(): void {
  testTeachingIntent();
  testSpecificityScorer();
  testGenericCoachRepetitionGuard();
  testSessionCoachMemory();
  testIntentFirstCoachEngine();
  testGenericDominancePolicy();
}
