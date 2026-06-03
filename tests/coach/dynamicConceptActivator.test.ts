import assert from "node:assert/strict";

import { buildEvidenceGraph } from "../../lib/blundr/brain/buildEvidenceGraph";
import { activateTeachingConcepts } from "../../lib/blundr/concepts/dynamicConceptActivator";
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

function activatedIds(activated: ReturnType<typeof activateTeachingConcepts>): string[] {
  return activated.activated.map((entry) => entry.conceptId);
}

export function testDynamicConceptActivator(): void {
  const bc4Graph = buildEvidenceGraph({
    frame: frameWithTarget({
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 4 3",
      uci: "f1c4",
      san: "Bc4",
      pieceType: "bishop",
    }),
    openingKey: "italian_game",
    openingName: "Italian Game",
  });
  const bc4Activated = activateTeachingConcepts({ graph: bc4Graph, mode: "assisted", maxConcepts: 30 });
  assert.equal(activatedIds(bc4Activated).includes("bishop_development"), true);
  assert.equal(activatedIds(bc4Activated).includes("italian_bishop_c4_pressure"), true);
  assert.equal(activatedIds(bc4Activated).includes("knight_development"), false);

  const nf3Graph = buildEvidenceGraph({
    frame: frameWithTarget({
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      uci: "g1f3",
      san: "Nf3",
      pieceType: "knight",
    }),
  });
  const nf3Activated = activateTeachingConcepts({ graph: nf3Graph, mode: "assisted", maxConcepts: 30 });
  assert.equal(activatedIds(nf3Activated).includes("knight_development"), true);
  assert.equal(activatedIds(nf3Activated).includes("bishop_development"), false);

  const castleGraph = buildEvidenceGraph({
    frame: frameWithTarget({
      fen: "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 6 4",
      uci: "e1g1",
      san: "O-O",
      pieceType: "king",
    }),
  });
  const castleActivated = activateTeachingConcepts({ graph: castleGraph, mode: "assisted", maxConcepts: 30 });
  assert.equal(activatedIds(castleActivated).includes("kingside_castling"), true);
  assert.equal(activatedIds(castleActivated).includes("king_safety"), true);

  const e4Graph = buildEvidenceGraph({
    frame: frameWithTarget({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "e2e4",
      san: "e4",
      pieceType: "pawn",
    }),
  });
  const e4Activated = activateTeachingConcepts({ graph: e4Graph, mode: "assisted", maxConcepts: 30 });
  assert.equal(activatedIds(e4Activated).includes("central_pawn_advance") || activatedIds(e4Activated).includes("occupy_center"), true);

  const d4Graph = buildEvidenceGraph({
    frame: frameWithTarget({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      uci: "d2d4",
      san: "d4",
      pieceType: "pawn",
    }),
  });
  const d4Activated = activateTeachingConcepts({ graph: d4Graph, mode: "assisted", maxConcepts: 30 });
  assert.equal(activatedIds(d4Activated).includes("challenge_center") || activatedIds(d4Activated).includes("central_pawn_break"), true);

  const branchCompleteFrame = buildCurrentInstructionFrame({
    kind: "branch_complete",
    fenBefore: e4Graph.boardTruth.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
    branchComplete: { isComplete: true, continueFromHereAvailable: true },
  });
  const branchGraph = buildEvidenceGraph({ frame: branchCompleteFrame });
  const branchActivated = activateTeachingConcepts({ graph: branchGraph, mode: "assisted", maxConcepts: 20 });
  assert.equal(
    branchActivated.activated.every((entry) =>
      [
        "continue_from_here_available",
        "branch_complete_no_target",
        "opponent_reply_no_user_target",
        "no_candidate_before_continue",
        "plain_mode_recall",
        "safety_fallback_explain_legal_move",
      ].includes(entry.conceptId),
    ),
    true,
  );

  const opponentFrame = buildCurrentInstructionFrame({
    kind: "opponent_replying",
    fenBefore: e4Graph.boardTruth.fenBefore,
    ply: 1,
    sideToMove: "black",
    target: null,
    mode: "blocked",
    source: "none",
  });
  const opponentGraph = buildEvidenceGraph({ frame: opponentFrame });
  const opponentActivated = activateTeachingConcepts({ graph: opponentGraph, mode: "assisted", maxConcepts: 20 });
  assert.equal(opponentActivated.activated.some((entry) => entry.concept.requiredEvidence.requiredPieceTypes?.length), false);

  assert.equal(activatedIds(bc4Activated).includes("tactic_blocked_insufficient_evidence"), false);
  assert.equal(activatedIds(bc4Activated).includes("sacrifice_requires_proof"), false);

  const bc4Plain = activateTeachingConcepts({ graph: bc4Graph, mode: "plain", maxConcepts: 30 });
  assert.equal(activatedIds(bc4Plain).includes("show_more_reveal"), false);

  const bc4ShowMore = activateTeachingConcepts({ graph: bc4Graph, mode: "show_more", maxConcepts: 30 });
  assert.equal(bc4ShowMore.activated.length > 0, true);

  for (const entry of bc4Activated.activated) {
    assert.equal(entry.evidenceClaimIds.every((id) => bc4Graph.claims.some((claim) => claim.id === id)), true, `${entry.conceptId}: evidenceClaimIds must map to graph claims`);
    assert.equal(
      entry.evidenceClaimIds.every((id) => {
        const claim = bc4Graph.claims.find((item) => item.id === id);
        return claim ? claim.targetUci === bc4Graph.targetUci : false;
      }),
      true,
      `${entry.conceptId}: claim target must match graph target`,
    );
  }
}

testDynamicConceptActivator();
console.log("dynamicConceptActivator ok");
