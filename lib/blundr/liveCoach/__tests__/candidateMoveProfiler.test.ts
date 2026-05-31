import assert from "node:assert/strict";
import { profileCandidateMoves } from "../candidateMoveProfiler";

export function testCandidateMoveProfiler(): void {
  const profiles = profileCandidateMoves({
    frameId: "1",
    fen: "8/8/8/8/8/8/8/8 w - -",
    normalizedFen: "8/8/8/8/8/8/8/8 w - -",
    sideToMove: "w",
    moveHistorySan: [],
    phase: "opening",
    bookStatus: "out_of_book",
    legalMoves: [
      { moveUci: "a2a4", moveSan: "a4", from: "a2", to: "a4", piece: "p", isCapture: false, isCheck: false },
      { moveUci: "e2e4", moveSan: "e4", from: "e2", to: "e4", piece: "p", isCapture: false, isCheck: false },
    ],
    positionFeatures: {
      centerState: "tense",
      kingSafety: "watch_center",
      developmentStatus: "behind",
      leastActivePieces: [],
      openFiles: [],
      semiOpenFiles: [],
      plausiblePawnBreaks: ["d4"],
      castlingStatus: { white: "uncastled", black: "uncastled" },
      materialTension: "medium",
      pieceCoordinationTags: [],
      tacticalAlert: "none",
    },
    maiaSignals: {
      status: "available",
      source: "mock",
      userElo: 1500,
      opponentElo: 1500,
      topMoves: [
        { moveUci: "a2a4", probability: 0.35, rank: 1 },
        { moveUci: "e2e4", probability: 0.03, rank: 2 },
      ],
      moveProbabilities: { a2a4: 0.35, e2e4: 0.03 },
      entropy: 1.2,
      topMoveProbability: 0.35,
      humanConsensus: "high",
      skillGradients: [],
    },
    engineSignals: {
      status: "available",
      candidates: [
        { moveUci: "a2a4", safety: "mistake", isTopEngineMove: false },
        { moveUci: "e2e4", safety: "safe", isTopEngineMove: true },
      ],
    } as any,
    stale: false,
    evidenceStatus: "ready",
  } as any);

  assert.equal(profiles.find((p) => p.moveUci === "a2a4")?.moveClass, "predictable_human_mistake");
  assert.equal(profiles.find((p) => p.moveUci === "e2e4")?.moveClass, "hard_to_find_good_move");
}
