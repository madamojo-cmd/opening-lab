import assert from "node:assert/strict";

import { buildCoachUtteranceRecordKey, parseCoachUtteranceMemory } from "../coachUtteranceMemory";

export function testCoachUtteranceMemory(): void {
  const keyA = buildCoachUtteranceRecordKey({
    frameId: "70",
    normalizedFen: "fenA",
    viewMode: "assisted",
    coachMode: "assisted_teach",
    coachAction: "show_explanation",
    utteranceId: "dwp_a1",
  });
  const keyB = buildCoachUtteranceRecordKey({
    frameId: 70,
    normalizedFen: "fenA",
    viewMode: "assisted",
    coachMode: "assisted_teach",
    coachAction: "show_explanation",
    utteranceId: "dwp_a1",
  });
  assert.equal(keyA, keyB);

  const keyC = buildCoachUtteranceRecordKey({
    frameId: "71",
    normalizedFen: "fenA",
    viewMode: "assisted",
    coachMode: "assisted_teach",
    coachAction: "show_explanation",
    utteranceId: "dwp_a1",
  });
  assert.notEqual(keyA, keyC);

  const parsed = parseCoachUtteranceMemory(
    JSON.stringify(
      Array.from({ length: 110 }).map((_, i) => ({
        patternId: `p${i}`,
        conceptId: "develop_with_pressure",
        visualRecipeId: "vr",
        coachMode: "assisted_teach",
        coachAction: "show_explanation",
        utteranceId: `u${i}`,
        utteranceFamily: "fam",
        text: "The bishop develops with pressure.",
        shownAt: i,
      })),
    ),
  );
  assert.equal(parsed.length, 100);
}
