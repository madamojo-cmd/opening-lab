import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveMasteryStatus,
  joinOpeningTreeToMastery,
  buildMasteryMapReadModel,
} from "../index";

test("Mastery Map status precedence is deterministic", () => {
  assert.equal(resolveMasteryStatus({ mastered: true, weak: true }), "weak");
  assert.equal(resolveMasteryStatus({ due: true, learning: true }), "due");
  assert.equal(
    resolveMasteryStatus({ repeatedLapse: true, mastered: true }),
    "repeated_lapse",
  );
  assert.equal(resolveMasteryStatus({}), "unseen");
});

test("runtime tree joins canonical mastery and preserves route badges", () => {
  const now = Date.parse("2026-07-20T00:00:00Z");
  const nodes = joinOpeningTreeToMastery({
    openingId: "italian-white",
    runtimeNodes: [
      {
        nodeId: "n1",
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
        firstAttemptResult: "correct",
        confidence: 0.9,
        updatedAt: "2026-07-14T00:00:00Z",
      },
    ],
    weaknesses: [],
    evidence: [
      {
        positionKey: "e2e4",
        evidenceCount: 2,
        importedGameEvidenceCount: 1,
        alternateRoute: true,
      },
    ],
    now,
  });
  assert.equal(nodes[0].status, "mastered");
  assert.equal(nodes[0].alternateRoute, true);
  assert.equal(
    buildMasteryMapReadModel({
      openingId: "italian-white",
      openingName: "Italian Game",
      side: "white",
      nodes,
      importedGameMatchCount: 1,
    }).masteredPositions,
    1,
  );
});
