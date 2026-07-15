import assert from "node:assert/strict";
import test from "node:test";
import { buildMixedTestItems } from "../mixedTestBlueprint";
import { createMixedTestState, reduceMixedTest } from "../mixedTestReducer";
import { scoreMixedTest } from "../mixedTestScoring";

const items = [
  "daily_recall",
  "daily_recall",
  "daily_plan_recall",
  "daily_candidate_choice",
  "daily_continuation_challenge",
].map((activityId, index) => ({
  itemId: `i${index}`,
  activityId,
  openingId: "italian-white",
  positionKey: `p${index}`,
  prompt: "Choose the move.",
}));
test("Mixed Test reserves exactly five unique positions and summarizes outcomes", () => {
  const selected = buildMixedTestItems(items);
  assert.equal(selected?.length, 5);
  if (!selected) return;
  let state = createMixedTestState(selected);
  for (let index = 0; index < 5; index += 1)
    state = reduceMixedTest(state, {
      type: "submit",
      correct: index < 3,
      now: `2026-07-14T00:0${index}:00Z`,
    });
  assert.equal(state.state, "completed");
  assert.deepEqual(scoreMixedTest(state).outcomes, [
    "correct",
    "correct",
    "correct",
    "incorrect",
    "incorrect",
  ]);
  assert.equal(state.score, 3);
});
test("Mixed Test reveal and retry preserve first attempt semantics", () => {
  const selected = buildMixedTestItems(items)!;
  let state = createMixedTestState(selected);
  state = reduceMixedTest(state, {
    type: "reveal",
    now: "2026-07-14T00:00:00Z",
  });
  assert.deepEqual(state.firstAttemptOutcomes, ["reveal"]);
  state = reduceMixedTest(state, { type: "retry" });
  assert.equal(state.retryCount, 1);
});
