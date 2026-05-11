import { buildFeaturePacket, normalizeFen } from "../featurePacketBuilder";

function expect(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const afterE4Fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";

const userPacket = buildFeaturePacket({
  fen: startFen,
  moveHistory: [],
  userColor: "w",
  userRatingBucket: "beginner",
  trainingPhase: "awaiting_user_move",
  bookStatus: "in_book",
  expectedMove: "e2e4",
  stockfish: {
    bestMove: "e2e4",
    multiPV: [{ move: "d2d4", evalCp: 18, pv: ["d2d4", "d7d5"] }],
  },
  humanMoves: [{ move: "g1f3", frequency: 0.12 }],
});

const sameUserPacket = buildFeaturePacket({
  fen: startFen,
  moveHistory: [],
  userColor: "w",
  userRatingBucket: "beginner",
  trainingPhase: "awaiting_user_move",
  bookStatus: "in_book",
  expectedMove: "e2e4",
  stockfish: {
    bestMove: "e2e4",
    multiPV: [{ move: "d2d4", evalCp: 18, pv: ["d2d4", "d7d5"] }],
  },
  humanMoves: [{ move: "g1f3", frequency: 0.12 }],
});

expect(
  JSON.stringify(userPacket) === JSON.stringify(sameUserPacket),
  "buildFeaturePacket should be deterministic for identical input"
);

expect(
  JSON.parse(JSON.stringify(userPacket)).schemaVersion === "blundr-feature-packet-v0",
  "feature packet should be JSON serializable"
);

expect(userPacket.normalizedFen === normalizeFen(startFen), "normalizedFen should be stable");
expect(userPacket.state.expectedActor === "user", "user phase expectedActor should be user");
expect(userPacket.state.expectedMoveColor === "w", "user phase expectedMoveColor should be userColor");
expect(userPacket.state.shouldRequestVisualModel, "user phase should request visual model");
expect(
  userPacket.state.shouldRequestMoveRecommendation,
  "user phase should request move recommendation"
);
expect(
  userPacket.derived.candidateMoves.includes("e2e4"),
  "legal expected book move should be included as a candidate"
);

const opponentPacket = buildFeaturePacket({
  fen: afterE4Fen,
  moveHistory: ["e4"],
  userColor: "w",
  userRatingBucket: "beginner",
  trainingPhase: "opponent_to_move",
  bookStatus: "in_book",
  expectedMove: "e7e5",
});

expect(opponentPacket.state.valid, "opponent_to_move should be valid when sideToMove is opponent");
expect(opponentPacket.state.expectedActor === "opponent", "opponent_to_move actor should be opponent");
expect(opponentPacket.state.expectedMoveColor === "b", "opponent expectedMoveColor should be opposite userColor");
expect(
  !opponentPacket.state.shouldRequestVisualModel,
  "opponent_to_move should not request BlundrOneNet visual model"
);
expect(
  !opponentPacket.state.shouldRequestMoveRecommendation,
  "opponent_to_move should not request a move recommendation"
);

const systemPacket = buildFeaturePacket({
  fen: afterE4Fen,
  moveHistory: ["e4"],
  userColor: "w",
  userRatingBucket: "beginner",
  trainingPhase: "showing_user_move_feedback",
  lastMove: { from: "e2", to: "e4", san: "e4", by: "user" },
});

expect(systemPacket.state.expectedActor === "system", "system phase expectedActor should be system");
expect(systemPacket.state.expectedMoveColor === null, "system phase expectedMoveColor should be null");
expect(systemPacket.state.shouldExplainOnly, "system phase should be explain-only");
expect(
  !systemPacket.state.shouldRequestMoveRecommendation,
  "system phase should not request a move recommendation"
);
