import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildCurrentInstructionFrame, buildVerifiedMoveFacts, isBookLikeInstructionTarget } from "../currentInstructionFrame";

function fenAfterMoves(moves: string[]): string {
  const game = new Chess();
  for (const move of moves) game.move(move);
  return game.fen();
}

export function testCurrentInstructionFrame(): void {
  const baseFrame = {
    frameId: 1,
    trainingMode: "restricted" as const,
    trainerPhase: "ready_for_user",
    trainerView: "assisted" as const,
    isUserTurn: true,
  };

  const e5 = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: fenAfterMoves(["e4"]),
    guidedMove: { uci: "e7e5", source: "lesson_line" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(e5.target?.san, "e5");
  assert.equal(e5.target?.pieceType, "p");

  const f4 = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: new Chess().fen(),
    guidedMove: { uci: "f2f4", source: "lesson_line" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(f4.target?.san, "f4");
  assert.equal(f4.target?.pieceType, "p");

  const nf3 = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: new Chess().fen(),
    guidedMove: { uci: "g1f3", source: "lesson_line" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(nf3.target?.san, "Nf3");
  assert.equal(nf3.target?.pieceType, "n");

  const bc4 = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: fenAfterMoves(["e4", "e5", "Nf3", "Nc6"]),
    guidedMove: { uci: "f1c4", source: "lesson_line" },
  });
  assert.equal(bc4.target?.san, "Bc4");
  assert.equal(bc4.target?.pieceType, "b");

  const castle = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: fenAfterMoves(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]),
    guidedMove: { uci: "e1g1", source: "lesson_line" },
  });
  assert.equal(castle.target?.san, "O-O");
  assert.equal(castle.target?.pieceType, "k");
  assert.equal(castle.target?.isCastle, true);

  const nxc6Check = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: "8/4k3/2b5/8/1N6/8/8/4K3 w - - 0 1",
    guidedMove: { uci: "b4c6", source: "lesson_line" },
  });
  assert.equal(nxc6Check.target?.san, "Nxc6+");
  assert.equal(nxc6Check.target?.capture, true);
  assert.equal(nxc6Check.target?.check, true);
  assert.equal(nxc6Check.target?.pieceType, "n");

  const qxe7Mate = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: "2bk4/2ppn3/8/6B1/8/8/4Q3/4R1K1 w - - 0 1",
    guidedMove: { uci: "e2e7", source: "lesson_line" },
  });
  assert.equal(qxe7Mate.target?.san, "Qxe7#");
  assert.equal(qxe7Mate.target?.capture, true);
  assert.equal(qxe7Mate.target?.mate, true);
  assert.equal(qxe7Mate.target?.pieceType, "q");

  const promotion = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: "4k3/P7/8/8/8/8/8/K7 w - - 0 1",
    guidedMove: { uci: "a7a8q", source: "lesson_line" },
  });
  assert.equal(promotion.target?.san, "a8=Q+");
  assert.equal(promotion.target?.pieceType, "p");
  assert.equal(promotion.target?.isPromotion, true);
  assert.equal(promotion.target?.promotionPiece, "q");

  const facts = buildVerifiedMoveFacts({ fenBefore: new Chess().fen(), uci: "g1f3" });
  assert.equal(facts?.pieceType, "n");

  const lichessBranch = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: fenAfterMoves(["e4"]),
    guidedMove: { uci: "e7e5", source: "opening_branch", kind: "lichess_branch_move" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(lichessBranch.target?.kind, "lichess_branch_move");
  assert.equal(isBookLikeInstructionTarget(lichessBranch.target), true);

  const adaptiveBranch = buildCurrentInstructionFrame({
    ...baseFrame,
    fen: fenAfterMoves(["d4", "d5"]),
    guidedMove: { uci: "c2c4", source: "opening_family_plan", kind: "adaptive_branch_move" },
    preferredTargetKind: "guided_move",
  });
  assert.equal(adaptiveBranch.target?.kind, "adaptive_branch_move");
  assert.equal(isBookLikeInstructionTarget(adaptiveBranch.target), true);
}
