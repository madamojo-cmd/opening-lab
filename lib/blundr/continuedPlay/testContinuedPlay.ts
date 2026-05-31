import { testContinuedPlayMovePolicy } from "./__tests__/continuedPlayMovePolicy.test";
import { testContinuedPlayMovePolicyDebug } from "./__tests__/continuedPlayMovePolicyDebug.test";

export function testContinuedPlay(): void {
  testContinuedPlayMovePolicy();
  testContinuedPlayMovePolicyDebug();
}
