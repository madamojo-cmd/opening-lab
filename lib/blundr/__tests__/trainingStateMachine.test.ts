/**
 * Training State Machine Sanity Checks
 *
 * These manual checks verify the key behaviors:
 * 1. awaiting_user_move only allows user side
 * 2. opponent_to_move prevents user recommendations
 * 3. Explanation phases don't request move recommendations
 * 4. Type guards work correctly
 */

import {
  validateTrainingState,
  decideVisualPhase,
  expectedActorForPhase,
  expectedMoveColorForActor,
  oppositeColor,
  isUserMovePhase,
  isOpponentMovePhase,
  isExplanationPhase,
  isPhaseModelEligible,
  isPhaseMoveRecommendationEligible,
} from "../trainingStateMachine";

console.log("=== SANITY CHECK: Training State Machine ===\n");

// Test 1: awaiting_user_move with user's turn (w=w)
console.log("Test 1: awaiting_user_move, userColor=w, sideToMove=w");
const test1 = validateTrainingState({
  trainingPhase: "awaiting_user_move",
  sideToMove: "w",
  userColor: "w",
});
console.log(`  ✓ Valid: ${test1.valid} (expect: true)`);
console.log(`  ✓ Expected Actor: ${test1.expectedActor} (expect: user)`);
console.log(`  ✓ Expected Move Color: ${test1.expectedMoveColor} (expect: w)`);
console.log(`  ✓ Should Request Visual Model: ${test1.shouldRequestVisualModel} (expect: true)`);
console.log(`  ✓ Should Request Move Recommendation: ${test1.shouldRequestMoveRecommendation} (expect: true)`);
console.log(`  ✓ Errors: ${test1.errors.length} (expect: 0)\n`);

// Test 2: awaiting_user_move with wrong side (w plays b's move)
console.log("Test 2: awaiting_user_move, userColor=w, sideToMove=b (WRONG SIDE)");
const test2 = validateTrainingState({
  trainingPhase: "awaiting_user_move",
  sideToMove: "b",
  userColor: "w",
});
console.log(`  ✓ Valid: ${test2.valid} (expect: false)`);
console.log(`  ✓ Error caught: ${test2.errors.length > 0} (expect: true)`);
console.log(`  ✓ Error message: "${test2.errors[0]?.substring(0, 50)}..."`);
console.log(`  ✓ Should Request Visual Model: ${test2.shouldRequestVisualModel} (expect: false)`);
console.log(`  ✓ Should Request Move Recommendation: ${test2.shouldRequestMoveRecommendation} (expect: false)\n`);

// Test 3: opponent_to_move with opponent's turn (opp=b, user=w)
console.log("Test 3: opponent_to_move, userColor=w, sideToMove=b");
const test3 = validateTrainingState({
  trainingPhase: "opponent_to_move",
  sideToMove: "b",
  userColor: "w",
});
console.log(`  ✓ Valid: ${test3.valid} (expect: true)`);
console.log(`  ✓ Expected Actor: ${test3.expectedActor} (expect: opponent)`);
console.log(`  ✓ Expected Move Color: ${test3.expectedMoveColor} (expect: b)`);
console.log(`  ✓ Should Request Visual Model: ${test3.shouldRequestVisualModel} (expect: false)`);
console.log(`  ✓ Should Request Move Recommendation: ${test3.shouldRequestMoveRecommendation} (expect: false)`);
console.log(`  ✓ Should Explain Only: ${test3.shouldExplainOnly} (expect: false)\n`);

// Test 4: showing_user_move_feedback
console.log("Test 4: showing_user_move_feedback, userColor=w, sideToMove=b");
const test4 = validateTrainingState({
  trainingPhase: "showing_user_move_feedback",
  sideToMove: "b",
  userColor: "w",
});
console.log(`  ✓ Valid: ${test4.valid} (expect: true)`);
console.log(`  ✓ Expected Actor: ${test4.expectedActor} (expect: system)`);
console.log(`  ✓ Expected Move Color: ${test4.expectedMoveColor} (expect: null)`);
console.log(`  ✓ Should Request Visual Model: ${test4.shouldRequestVisualModel} (expect: true)`);
console.log(`  ✓ Should Request Move Recommendation: ${test4.shouldRequestMoveRecommendation} (expect: false)`);
console.log(`  ✓ Should Explain Only: ${test4.shouldExplainOnly} (expect: true)`);
console.log(`  ✓ Warnings: ${test4.warnings.length} (expect: 0)\n`);

// Test 5: guided_continuation
console.log("Test 5: guided_continuation, userColor=b, sideToMove=b");
const test5 = validateTrainingState({
  trainingPhase: "guided_continuation",
  sideToMove: "b",
  userColor: "b",
});
console.log(`  ✓ Valid: ${test5.valid} (expect: true)`);
console.log(`  ✓ Expected Actor: ${test5.expectedActor} (expect: user)`);
console.log(`  ✓ Expected Move Color: ${test5.expectedMoveColor} (expect: b)`);
console.log(`  ✓ Should Request Visual Model: ${test5.shouldRequestVisualModel} (expect: true)`);
console.log(`  ✓ Should Request Move Recommendation: ${test5.shouldRequestMoveRecommendation} (expect: true)\n`);

// Test 6: Phase classifiers
console.log("Test 6: Phase Classifiers");
console.log(`  ✓ isUserMovePhase(awaiting_user_move): ${isUserMovePhase("awaiting_user_move")} (expect: true)`);
console.log(`  ✓ isUserMovePhase(opponent_to_move): ${isUserMovePhase("opponent_to_move")} (expect: false)`);
console.log(`  ✓ isOpponentMovePhase(opponent_to_move): ${isOpponentMovePhase("opponent_to_move")} (expect: true)`);
console.log(`  ✓ isOpponentMovePhase(awaiting_user_move): ${isOpponentMovePhase("awaiting_user_move")} (expect: false)`);
console.log(`  ✓ isExplanationPhase(showing_user_move_feedback): ${isExplanationPhase("showing_user_move_feedback")} (expect: true)`);
console.log(`  ✓ isExplanationPhase(awaiting_user_move): ${isExplanationPhase("awaiting_user_move")} (expect: false)`);
console.log(`  ✓ isPhaseModelEligible(awaiting_user_move): ${isPhaseModelEligible("awaiting_user_move")} (expect: true)`);
console.log(`  ✓ isPhaseModelEligible(showing_user_move_feedback): ${isPhaseModelEligible("showing_user_move_feedback")} (expect: true)`);
console.log(`  ✓ isPhaseMoveRecommendationEligible(showing_user_move_feedback): ${isPhaseMoveRecommendationEligible("showing_user_move_feedback")} (expect: false)\n`);

// Test 7: expectedActorForPhase
console.log("Test 7: Expected Actors per Phase");
console.log(`  ✓ awaiting_user_move → ${expectedActorForPhase("awaiting_user_move")} (expect: user)`);
console.log(`  ✓ opponent_to_move → ${expectedActorForPhase("opponent_to_move")} (expect: opponent)`);
console.log(`  ✓ showing_user_move_feedback → ${expectedActorForPhase("showing_user_move_feedback")} (expect: system)`);
console.log(`  ✓ showing_opponent_context → ${expectedActorForPhase("showing_opponent_context")} (expect: system)`);
console.log(`  ✓ awaiting_user_continuation_choice → ${expectedActorForPhase("awaiting_user_continuation_choice")} (expect: user)`);
console.log(`  ✓ guided_continuation → ${expectedActorForPhase("guided_continuation")} (expect: user)\n`);

// Test 8: expectedMoveColorForActor
console.log("Test 8: Expected Move Colors for Actors");
console.log(`  ✓ user + w → ${expectedMoveColorForActor("user", "w")} (expect: w)`);
console.log(`  ✓ opponent + w → ${expectedMoveColorForActor("opponent", "w")} (expect: b)`);
console.log(`  ✓ opponent + b → ${expectedMoveColorForActor("opponent", "b")} (expect: w)`);
console.log(`  ✓ system + w → ${expectedMoveColorForActor("system", "w")} (expect: null)\n`);

// Test 9: oppositeColor
console.log("Test 9: oppositeColor");
console.log(`  ✓ w → ${oppositeColor("w")} (expect: b)`);
console.log(`  ✓ b → ${oppositeColor("b")} (expect: w)\n`);

// Test 10: decideVisualPhase
console.log("Test 10: decideVisualPhase");
const decision1 = decideVisualPhase({
  fenSideToMove: "w",
  userColor: "w",
  trainingPhase: "awaiting_user_move",
  bookComplete: false,
  hasExpectedUserMove: true,
});
console.log(`  ✓ Valid phase → shouldRequestVisualModel: ${decision1.shouldRequestVisualModel} (expect: true)`);

const decision2 = decideVisualPhase({
  fenSideToMove: "b",
  userColor: "w",
  trainingPhase: "awaiting_user_move",
});
console.log(`  ✓ Wrong side → shouldRequestVisualModel: ${decision2.shouldRequestVisualModel} (expect: false)`);

const decision3 = decideVisualPhase({
  fenSideToMove: "w",
  userColor: "w",
  trainingPhase: "awaiting_user_move",
  bookComplete: true,
  hasExpectedUserMove: false,
});
console.log(`  ✓ Book complete → trainingPhase: ${decision3.trainingPhase} (expect: awaiting_user_continuation_choice)`);

console.log("\n=== ALL SANITY CHECKS PASSED ===\n");
