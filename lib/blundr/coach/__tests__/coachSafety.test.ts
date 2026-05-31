import assert from "node:assert/strict";
import { validateCoachCopyEntry, validateCoachDecision } from "../coachSafety";

export function testCoachSafety(): void {
  const goodEntry = validateCoachCopyEntry({
    utteranceId: "ok",
    utteranceFamily: "fam",
    conceptId: "develop_with_pressure",
    text: "The bishop increases pressure on f7.",
    allowedModes: ["assisted_teach"],
    requiredConcreteObjects: ["bishop"],
    claimTypes: ["opening_pattern"],
    revealRisk: "low",
    givesAnswer: false,
    requiresAnswerPermission: false,
  } as any);
  assert.equal(goodEntry.allowed, true);

  const badEntry = validateCoachCopyEntry({
    utteranceId: "bad",
    utteranceFamily: "fam",
    conceptId: "x",
    text: "Stockfish top two says this is best",
    allowedModes: ["assisted_teach"],
    requiredConcreteObjects: [],
    claimTypes: ["plan_principle"],
    revealRisk: "low",
    givesAnswer: false,
    requiresAnswerPermission: false,
  } as any);
  assert.equal(badEntry.allowed, false);

  const decisionBlocked = validateCoachDecision(
    {
      viewMode: "plain",
      revealState: "hidden",
      answerShown: false,
      exactMoveAllowed: false,
      recipeFrameMatchesBoard: true,
      recipeFenMatchesBoard: true,
    } as any,
    {
      title: "Coach",
      body: "Play Bc4.",
      givesAnswer: true,
      claimTypes: ["engine_safe_recommendation"],
    } as any,
  );
  assert.equal(decisionBlocked.allowed, false);
}
