import assert from "node:assert/strict";
import { describe, expect, it } from "vitest";
import {
  buildMasteryMapReadModel,
  joinOpeningTreeToMastery,
} from "@/lib/blundr/masteryMap";
import {
  buildMixedTestItems,
  createMixedTestState,
  reduceMixedTest,
} from "@/lib/blundr/daily/activities/mixedTest";
import { buildDeepTacticShots } from "@/lib/blundr/daily/miniGames/deep";
describe("Step 4 intelligence journeys", () => {
  it("reconciles mastery, Mixed Test, and verified deep content", () => {
    const nodes = joinOpeningTreeToMastery({
      openingId: "italian-white",
      runtimeNodes: [
        {
          nodeId: "n",
          openingId: "italian-white",
          playKey: "e2e4",
          playSequenceUci: "e2e4",
          ply: 1,
          sideToMove: "black",
        },
      ],
      mastery: [
        {
          positionKey: "e2e4",
          attempts: 2,
          firstAttemptAt: null,
          firstAttemptResult: "incorrect",
          confidence: 0.2,
          updatedAt: "2026-07-14T00:00:00Z",
        },
      ],
      weaknesses: [
        {
          positionKey: "e2e4",
          category: "opening_move",
          score: 0.9,
          confidence: 0.8,
          explanation: "Repeated lapse",
          recommendedDailyIntervention: "review_position",
          access: "active",
        },
      ],
      evidence: [
        {
          positionKey: "e2e4",
          evidenceCount: 3,
          importedGameEvidenceCount: 2,
          alternateRoute: false,
        },
      ],
    });
    const model = buildMasteryMapReadModel({
      openingId: "italian-white",
      openingName: "Italian Game",
      side: "white",
      nodes,
      importedGameMatchCount: 2,
    });
    assert.equal(model.nodes[0].status, "repeated_lapse");
    assert.equal(model.weakBranches.length, 1);
    const items = buildMixedTestItems(
      [
        "daily_recall",
        "daily_recall",
        "daily_plan_recall",
        "daily_candidate_choice",
        "daily_continuation_challenge",
      ].map((activityId, index) => ({
        itemId: `${index}`,
        activityId,
        openingId: "italian-white",
        positionKey: `${index}`,
        prompt: "p",
      })),
    );
    assert.equal(items?.length, 5);
    let mixed = createMixedTestState(items!);
    for (let i = 0; i < 5; i += 1)
      mixed = reduceMixedTest(mixed, {
        type: "submit",
        correct: true,
        now: "2026-07-14T00:00:00Z",
      });
    assert.equal(mixed.score, 5);
    const deep = buildDeepTacticShots({
      openingId: "italian-white",
      positionKey: "e2e4",
      startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      userMoves: ["e2e4", "g1f3"],
      opponentReplies: ["e7e5", "b8c6"],
      access: {
        decision: "active",
        checkedAt: "2026-07-14T00:00:00Z",
        expiresAt: null,
      },
    });
    expect(deep.ok).toBe(true);
  });
});
