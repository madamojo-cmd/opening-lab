import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildOpeningTree } from "../openingTree";
import { resolveExpectedMoveForFrame } from "../expectedMoveResolver";
import type { RepertoireLineInput } from "../openingTypes";
import type { PreferredMoveAuthorityIndex } from "../preferredMoveAuthority";

function tree(lines: string[][], id = "fixture"): ReturnType<typeof buildOpeningTree> {
  return buildOpeningTree(lines.map((movesSan, index): RepertoireLineInput => ({
    openingId: id,
    lineId: `${id}:${index}`,
    openingName: id,
    sideToTrain: "white",
    movesSan,
  })));
}

function fenAfter(moves: string[]): string {
  const game = new Chess();
  for (const san of moves) game.move(san);
  return game.fen();
}

function authority(openingId: string, fen: string, side: "white" | "black", selectedUci: string, rank: 1 | 2 = 1): PreferredMoveAuthorityIndex {
  const fen4 = fen.split(/\s+/).slice(0, 4).join(" ");
  return {
    schemaVersion: "blundr-preferred-move-authority.v1",
    authorityKey: "openingId+canonicalFen4+repertoireSide",
    engine: { name: "stockfish", version: "18.0.7", depth: 10, multiPv: 2 },
    runtime: { packageId: "fixture", schemaVersion: "fixture", sourceFiles: {} },
    generatedAt: "2026-08-03T00:00:00.000Z",
    counts: {
      positionGroupsAnalyzed: 1,
      rankOneSelections: rank === 1 ? 1 : 0,
      rankTwoSelections: rank === 2 ? 1 : 0,
      omittedNoApprovedMatch: 0,
      illegalOrMalformedGroups: 0,
      duplicateCandidatesCollapsed: 0,
    },
    openings: [openingId],
    entries: [{
      key: `${openingId}|${fen4}|${side}`,
      openingId,
      canonicalFen4: fen4,
      repertoireSide: side,
      selectedUci,
      stockfishRank: rank,
      approvedCandidateUcis: [selectedUci],
      sourcePlayKeys: ["fixture"],
    }],
  };
}

export function testExpectedMoveResolver(): void {
  const exactTree = tree([["e4", "e5", "Nf3"]], "ruy-fixture");
  const exact = resolveExpectedMoveForFrame({
    openingTree: exactTree,
    fen: fenAfter(["e4", "e5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(exact.source, "lesson_line");
  assert.equal(exact.expectedMoveSan, "Nf3");
  assert.equal(exact.bookResolutionState, "user_move_available");

  const exhausted = resolveExpectedMoveForFrame({
    openingTree: tree([["d4", "d5"]], "qg-terminal"),
    fen: fenAfter(["d4", "d5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.equal(exhausted.source, "guided_branch_needs_continuation");
  assert.equal(exhausted.bookResolutionState, "guided_branch_needs_continuation");
  assert.equal(exhausted.shouldTransitionToContinuation, true);

  const regressionFen = "rn1qkbnr/pp2ppp1/2p3bp/8/3P3P/6N1/PPP2PP1/R1BQKBNR w KQkq - 0 7";
  const regression = resolveExpectedMoveForFrame({
    openingTree: tree([["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5", "Ng3", "Bg6", "h4", "h6"]], "italian-family-fixture"),
    fen: regressionFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
  });
  assert.notEqual(regression.source, "none");
  assert.equal(regression.source, "guided_branch_needs_continuation");

  const engineGuard = resolveExpectedMoveForFrame({
    openingTree: tree([["d4", "d5", "c4"]], "qg-engine-guard"),
    fen: fenAfter(["d4", "d5"]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    enginePreview: { pvs: [{ san: "Nf3", uci: "g1f3" }] },
  });
  assert.equal(engineGuard.source, "lesson_line");
  assert.equal(engineGuard.expectedMoveSan, "c4");
  assert.equal(engineGuard.bookResolutionState, "user_move_available");

  const multiFen = fenAfter(["e4", "e5"]);
  const multiTree = tree([["e4", "e5", "Nf3"], ["e4", "e5", "Bc4"]], "multi-fixture");
  const multi = resolveExpectedMoveForFrame({
    openingTree: multiTree,
    fen: multiFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    preferredMoveAuthorityIndex: authority("multi-fixture", multiFen, "white", "f1c4", 2),
  });
  assert.equal(multi.expectedMoveUci, "f1c4");
  assert.deepEqual(multi.candidateMoves.map((move) => move.uci), ["f1c4"]);
  assert.equal(multi.debug.preferredMoveAuthorityRank, 2);

  const noTopTwo = resolveExpectedMoveForFrame({
    openingTree: multiTree,
    fen: multiFen,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    preferredMoveAuthorityIndex: authority("multi-fixture", multiFen, "white", "b1c3", 1),
  });
  assert.equal(noTopTwo.source, "none");
  assert.equal(noTopTwo.reason, "preferred_move_authority_unresolved");

  const sameFenItalian = resolveExpectedMoveForFrame({
    openingTree: tree([["e4"], ["d4"]], "italian-white"),
    fen: fenAfter([]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    preferredMoveAuthorityIndex: authority("italian-white", fenAfter([]), "white", "e2e4"),
  });
  const sameFenColle = resolveExpectedMoveForFrame({
    openingTree: tree([["e4"], ["d4"]], "colle-white"),
    fen: fenAfter([]),
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    preferredMoveAuthorityIndex: authority("colle-white", fenAfter([]), "white", "d2d4"),
  });
  assert.equal(sameFenItalian.expectedMoveUci, "e2e4");
  assert.equal(sameFenColle.expectedMoveUci, "d2d4");

  const alteredFen4 = multiFen.replace("KQkq", "-");
  const transposition = resolveExpectedMoveForFrame({
    openingTree: multiTree,
    fen: alteredFen4,
    trainerPhase: "ready_for_user",
    trainingMode: "restricted",
    trainerView: "assisted",
    isUserTurn: true,
    userColor: "w",
    opponentColor: "b",
    preferredMoveAuthorityIndex: authority("multi-fixture", alteredFen4, "white", "g1f3"),
  });
  assert.equal(transposition.source, "transposition");
  assert.equal(transposition.expectedMoveUci, "g1f3");
}
