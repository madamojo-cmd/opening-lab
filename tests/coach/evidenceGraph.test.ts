import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { buildCurrentInstructionFrame } from "../../lib/blundr/runtime/currentInstructionFrame";
import { lockInstructionTarget } from "../../lib/blundr/runtime/instructionFrameLock";

function frameWithTarget(input: {
  fen: string;
  uci: string;
  san: string;
  pieceType: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";
  source?: "opening_tree" | "continuation_policy" | "lichess_branch" | "adaptive_branch";
}) {
  return buildCurrentInstructionFrame({
    kind: "guided_move",
    fenBefore: input.fen,
    ply: 0,
    sideToMove: input.fen.split(" ")[1] === "b" ? "black" : "white",
    target: lockInstructionTarget({
      uci: input.uci,
      san: input.san,
      pieceType: input.pieceType,
      color: input.fen.split(" ")[1] === "b" ? "black" : "white",
      source: input.source ?? "opening_tree",
      reason: "test",
    }),
    mode: "guided",
    source: input.source ?? "opening_tree",
  });
}

export function testEvidenceGraph(): void {
  const bc4Frame = frameWithTarget({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
    uci: "f1c4",
    san: "Bc4",
    pieceType: "bishop",
  });
  const bc4 = buildEvidenceGraph({ frame: bc4Frame, openingKey: "italian_game", openingName: "Italian Game" });
  assert.equal(bc4.targetUci, "f1c4");
  assert.equal(bc4.boardTruth.sourcePiece?.type, "b");
  assert.equal(bc4.claims.some((c) => c.id.includes("bishop_development") || c.textSafeSummary.toLowerCase().includes("bishop")), true);
  assert.equal(bc4.claims.some((c) => c.type === "pressure" || String(c.machineFacts?.diagonalControl) === "true"), true);
  assert.equal(bc4.claims.some((c) => c.textSafeSummary.toLowerCase().includes("knight")), false);
  assert.equal(bc4.claims.some((c) => c.textSafeSummary.toLowerCase().includes("wins material")), false);
  assert.equal(bc4.claims.some((c) => c.textSafeSummary.toLowerCase().includes("checkmate")), false);

  const nf3Frame = frameWithTarget({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    uci: "g1f3",
    san: "Nf3",
    pieceType: "knight",
  });
  const nf3 = buildEvidenceGraph({ frame: nf3Frame });
  assert.equal(nf3.claims.some((c) => c.id.includes("knight_development")), true);
  assert.equal(nf3.claims.some((c) => c.id.includes("bishop_development")), false);

  const castleFrame = frameWithTarget({
    fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
    uci: "e1g1",
    san: "O-O",
    pieceType: "king",
  });
  const castle = buildEvidenceGraph({ frame: castleFrame });
  assert.equal(castle.claims.some((c) => c.type === "castling"), true);
  assert.equal(castle.claims.some((c) => c.type === "king_safety"), true);

  const e4Frame = frameWithTarget({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    uci: "e2e4",
    san: "e4",
    pieceType: "pawn",
  });
  const e4 = buildEvidenceGraph({ frame: e4Frame });
  assert.equal(e4.claims.some((c) => c.type === "center_control"), true);
  assert.equal(e4.claims.some((c) => c.id.includes("pawn_push") || c.type === "pawn_break"), true);

  const d4Frame = frameWithTarget({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    uci: "d2d4",
    san: "d4",
    pieceType: "pawn",
  });
  const d4 = buildEvidenceGraph({ frame: d4Frame });
  assert.equal(d4.claims.some((c) => c.type === "center_control"), true);

  const captureFrame = frameWithTarget({
    fen: "4k3/8/8/2p5/3P4/8/8/4K3 w - - 0 1",
    uci: "d4c5",
    san: "dxc5",
    pieceType: "pawn",
  });
  const capture = buildEvidenceGraph({ frame: captureFrame });
  assert.equal(capture.claims.some((c) => c.type === "capture"), true);

  const checkFrame = frameWithTarget({
    fen: "4k3/8/8/8/8/8/4Q3/4K3 w - - 0 1",
    uci: "e2e7",
    san: "Qe7+",
    pieceType: "queen",
  });
  const check = buildEvidenceGraph({ frame: checkFrame });
  assert.equal(check.claims.some((c) => c.type === "check"), true);

  const branchComplete = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: e4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchGraph = buildEvidenceGraph({ frame: branchComplete });
  assert.equal(branchGraph.targetUci, null);
  assert.equal(branchGraph.claims.length, 0);

  const opponent = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: e4Frame.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponentGraph = buildEvidenceGraph({ frame: opponent });
  assert.equal(opponentGraph.claims.length, 0);

  const illegalFrame = frameWithTarget({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    uci: "e2e5",
    san: "e5",
    pieceType: "pawn",
  });
  const illegal = buildEvidenceGraph({ frame: illegalFrame });
  assert.equal(illegal.blockedClaims.length > 0, true);

  const hasCoachCopyFields = JSON.stringify(illegal).includes("assisted") || JSON.stringify(illegal).includes("plain.hint") || JSON.stringify(illegal).includes("showMore");
  assert.equal(hasCoachCopyFields, false);

  assert.equal(illegal.providerStatus.stockfish, "not_applicable");
  assert.equal(illegal.providerStatus.maia, "not_applicable");
}

testEvidenceGraph();
console.log("evidenceGraph ok");
