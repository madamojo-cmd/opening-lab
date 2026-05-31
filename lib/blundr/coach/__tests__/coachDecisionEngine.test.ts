import assert from "node:assert/strict";
import { decideCoachOutput } from "../coachDecisionEngine";

function baseContext(partial: Record<string, unknown> = {}) {
  return {
    frameId: "70",
    fen: "fen",
    normalizedFen: "fen",
    viewMode: "assisted",
    revealState: "hidden",
    phase: "ready_for_user",
    userToMove: true,
    bookStatus: "in_book",
    conceptId: "develop_with_pressure",
    patternId: "italian:bc4",
    visualRecipeId: "vr:bc4",
    moveUci: "f1c4",
    moveSan: "Bc4",
    keySquares: ["f1", "c4", "f7"],
    keyPieces: ["bishop"],
    visualPrimitiveTypes: ["move_arrow", "pressure_line", "target_ring"],
    moveTrust: "engine_verified",
    contextTrust: "safe_context",
    attempts: 0,
    wrongAttempts: 0,
    hintUsed: false,
    answerShown: false,
    elapsedMs: 3000,
    priorPatternMisses: 0,
    priorPatternSuccesses: 1,
    recentUtteranceIds: [],
    recentUtteranceFamilies: [],
    recipeFrameMatchesBoard: true,
    recipeFenMatchesBoard: true,
    exactMoveAllowed: true,
    canShowAnswerMove: true,
    canShowContext: true,
    source: "visual_recipe",
    ...partial,
  } as any;
}

export function testCoachDecisionEngine(): void {
  const assisted = decideCoachOutput({
    context: baseContext({ viewMode: "assisted" }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(assisted.mode, "assisted_teach");
  assert.equal(assisted.buttons.join(","), "why,replay,hide");

  const plain = decideCoachOutput({
    context: baseContext({ viewMode: "plain", exactMoveAllowed: false }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(plain.mode, "plain_prompt");
  assert.equal((plain.body ?? "").toLowerCase().includes("bc4"), false);
  assert.equal(plain.buttons.includes("hint"), true);
  assert.equal(plain.buttons.includes("answer"), true);

  const softHint = decideCoachOutput({
    context: baseContext({ viewMode: "plain", exactMoveAllowed: false }),
    interaction: "hint",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(softHint.action, "show_soft_hint");
  assert.equal((softHint.body ?? "").toLowerCase().includes("bc4"), false);

  const strongHint = decideCoachOutput({
    context: baseContext({ viewMode: "plain", wrongAttempts: 1, exactMoveAllowed: false }),
    interaction: "hint",
    outcome: "wrong",
    hintRequestCount: 1,
    utteranceMemory: [],
  });
  assert.equal(strongHint.action, "show_strong_hint");
  assert.equal((strongHint.body ?? "").includes("f7") || (strongHint.body ?? "").includes("bishop"), true);

  const answer = decideCoachOutput({
    context: baseContext({ viewMode: "plain", revealState: "revealed", answerShown: true, exactMoveAllowed: true }),
    interaction: "answer",
    outcome: "none",
    hintRequestCount: 1,
    utteranceMemory: [],
  });
  assert.equal(answer.givesAnswer, true);
  assert.equal(answer.shouldMarkReviewWorthy, true);

  const c3 = decideCoachOutput({
    context: baseContext({ conceptId: "prepare_center_break", viewMode: "assisted" }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal((c3.body ?? "").toLowerCase().includes("d4"), true);

  const re1 = decideCoachOutput({
    context: baseContext({ conceptId: "rook_to_center", viewMode: "assisted" }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal((re1.body ?? "").toLowerCase().includes("fork") || (re1.body ?? "").toLowerCase().includes("pin"), false);

  const center = decideCoachOutput({
    context: baseContext({ conceptId: "center_tension", viewMode: "assisted", exactMoveAllowed: false }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal((center.body ?? "").toLowerCase().includes("play"), false);

  const stale = decideCoachOutput({
    context: baseContext({ recipeFrameMatchesBoard: false }),
    interaction: "none",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(stale.mode, "suppressed");

  const revealBlocked = decideCoachOutput({
    context: baseContext({ viewMode: "plain", revealState: "hidden", answerShown: false, exactMoveAllowed: false }),
    interaction: "answer",
    outcome: "none",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(revealBlocked.mode, "suppressed");

  const fast = decideCoachOutput({
    context: baseContext({ elapsedMs: 4000 }),
    interaction: "none",
    outcome: "correct",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(fast.mode, "correct_fast");

  const slow = decideCoachOutput({
    context: baseContext({ elapsedMs: 45000 }),
    interaction: "none",
    outcome: "correct",
    hintRequestCount: 0,
    utteranceMemory: [],
  });
  assert.equal(slow.mode, "correct_slow");
}
