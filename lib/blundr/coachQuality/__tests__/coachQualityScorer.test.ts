import assert from "node:assert/strict";
import { scoreCoachBenchmarkFixture } from "../coachQualityScorer";

export function testCoachQualityScorer(): void {
  const fixture: any = {
    id: "plain_no_answer",
    viewMode: "plain",
    bookStatus: "in_book",
    userState: { answerShown: false, hintUsed: false },
    expected: {
      exactMoveAllowed: false,
      shouldShowAnswerButton: true,
      shouldShowPlanButton: false,
      forbiddenTerms: ["stockfish"],
      allowedCoachModes: ["plain_prompt"],
    },
  };

  const pass = scoreCoachBenchmarkFixture(fixture, {
    mode: "plain_prompt",
    text: "Look for development and pressure on a target.",
    buttons: ["hint", "answer"],
    exactMoveAllowed: false,
    claimTypes: ["plan_principle"],
    silent: false,
  });
  assert.equal(pass.passed, true);

  const rawLabelFail = scoreCoachBenchmarkFixture(fixture, {
    mode: "plain_prompt",
    text: "Stockfish top two says this is best.",
    buttons: ["hint", "answer"],
    exactMoveAllowed: false,
    claimTypes: ["plan_principle"],
    silent: false,
  });
  assert.equal(rawLabelFail.passed, false);
  assert.equal(rawLabelFail.failures.includes("forbidden_term_detected"), true);

  const answerLeakFail = scoreCoachBenchmarkFixture(fixture, {
    mode: "plain_prompt",
    text: "Play Bc4 to pressure f7.",
    buttons: ["hint", "answer"],
    exactMoveAllowed: false,
    claimTypes: ["plan_principle"],
    silent: false,
  });
  assert.equal(answerLeakFail.passed, false);
  assert.equal(answerLeakFail.failures.includes("plain_view_answer_leak"), true);

  const outOfBookFixture: any = {
    ...fixture,
    id: "out_of_book_no_answer",
    bookStatus: "out_of_book",
    viewMode: "freeplay",
    expected: {
      exactMoveAllowed: false,
      shouldShowAnswerButton: false,
      shouldShowPlanButton: true,
      forbiddenTerms: ["stockfish"],
    },
  };
  const outOfBookFail = scoreCoachBenchmarkFixture(outOfBookFixture, {
    mode: "freeplay_principle",
    text: "The center is tense and your king safety matters.",
    buttons: ["hint", "answer"],
    exactMoveAllowed: false,
    claimTypes: ["plan_principle"],
    silent: false,
  });
  assert.equal(outOfBookFail.passed, false);
  assert.equal(outOfBookFail.failures.includes("answer_button_policy_mismatch:true"), true);
}
