import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildCurrentInstructionFrame } from "../../runtime/currentInstructionFrame";
import { buildCoachExplanationPipeline, lintCoachExplanation } from "../coachExplanationPipeline";

function makeTarget(fen: string, uci: string) {
  const frame = buildCurrentInstructionFrame({
    frameId: 1,
    fen,
    trainingMode: "restricted",
    trainerPhase: "ready_for_user",
    trainerView: "assisted",
    isUserTurn: true,
    guidedMove: { uci, kind: "guided_move", source: "test", trust: "book_verified" },
    preferredTargetKind: "guided_move",
  });
  assert.ok(frame.target);
  return frame.target!;
}

export function testCoachExplanationPipeline(): void {
  const start = new Chess();
  const nc3Target = makeTarget(start.fen(), "b1c3");
  const nc3 = buildCoachExplanationPipeline({
    fenBefore: start.fen(),
    target: nc3Target,
    trainerMode: "restricted",
    trainerPhase: "ready_for_user",
    isContinuation: false,
    openingId: "italian-white",
    lineId: "italian-white:0",
  });
  assert.notEqual(nc3.coachExplanation.title, "Supported continuation");
  assert.equal(/Verified move:/i.test(nc3.coachExplanation.body), false);
  assert.equal(/knight from/i.test(nc3.coachExplanation.body), false);
  assert.equal(/knight|develop|center/i.test(nc3.coachExplanation.body), true);
  assert.equal(/\bbishop\b/i.test(nc3.coachExplanation.body), false);
  assert.equal(nc3.coachExplanation.coachMoveUci, "b1c3");
  assert.equal(nc3.coachExplanation.coachPieceType, "n");
  assert.equal(nc3.coachQuality.qualityScore >= 80, true);
  assert.equal(nc3.coachExplanation.selectedTheme, "minor_piece_development");
  assert.equal(nc3.coachExplanation.selectedOpportunityId, "minor_piece_development");
  assert.equal(nc3.coachExplanation.selectedOpportunityLayer, "development");
  assert.equal(Number(nc3.coachExplanation.selectedOpportunityScore) >= 320, true);
  assert.equal(String(nc3.coachExplanation.selectedTemplateId).includes("minor_piece_development"), true);

  const e4e5Fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1";
  const e5Target = makeTarget(e4e5Fen, "e4e5");
  const e5 = buildCoachExplanationPipeline({
    fenBefore: e4e5Fen,
    target: e5Target,
    trainerMode: "restricted",
    trainerPhase: "ready_for_user",
    isContinuation: false,
  });
  assert.equal(/center|space|respond/i.test(e5.coachExplanation.body), true);
  assert.equal(/Verified move:|pawn from/i.test(e5.coachExplanation.body), false);
  assert.equal(["central_pawn_advance", "center_support"].includes(String(e5.coachExplanation.selectedTheme)), true);
  if (e5.coachExplanation.selectedTheme === "central_pawn_advance") {
    assert.equal(e5.coachExplanation.selectedOpportunityId, "central_pawn_advance");
    assert.equal(e5.coachExplanation.selectedOpportunityLayer, "center");
    assert.equal(Number(e5.coachExplanation.selectedOpportunityScore) >= 330, true);
    assert.equal(String(e5.coachExplanation.selectedTemplateId).includes("central_pawn_advance"), true);
  }

  const nxa8Fen = "r6k/8/1N6/8/8/8/8/4K3 w - - 0 1";
  const nxa8Target = makeTarget(nxa8Fen, "b6a8");
  const nxa8 = buildCoachExplanationPipeline({
    fenBefore: nxa8Fen,
    target: nxa8Target,
    trainerMode: "restricted",
    trainerPhase: "ready_for_user",
    isContinuation: false,
  });
  assert.equal(nxa8.coachExplanation.selectedTheme, "capture_or_recapture");
  assert.equal(nxa8.coachExplanation.selectedOpportunityId, "capture_or_recapture");
  assert.equal(nxa8.coachExplanation.selectedOpportunityLayer, "tactical");
  assert.equal(Number(nxa8.coachExplanation.selectedOpportunityScore) >= 450, true);
  assert.equal(String(nxa8.coachExplanation.selectedTemplateId).includes("capture_or_recapture"), true);
  assert.equal(/\binitiative\b/i.test(nxa8.coachExplanation.body), false);

  const bc4Fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1";
  const bc4Target = makeTarget(bc4Fen, "f1c4");
  const bc4 = buildCoachExplanationPipeline({
    fenBefore: bc4Fen,
    target: bc4Target,
    trainerMode: "restricted",
    trainerPhase: "ready_for_user",
    isContinuation: false,
  });
  assert.equal(/bishop|diagonal/i.test(bc4.coachExplanation.body), true);
  assert.equal(bc4.coachExplanation.selectedTheme, "bishop_activation");
  assert.equal(/knight from|pawn from/i.test(bc4.coachExplanation.body), false);

  const mateFen = "7k/6Q1/6K1/8/8/8/8/8 w - - 0 1";
  const mateTarget = makeTarget(mateFen, "g7f8");
  const mate = buildCoachExplanationPipeline({
    fenBefore: mateFen,
    target: mateTarget,
    trainerMode: "continuation",
    trainerPhase: "ready_for_user",
    isContinuation: true,
  });
  assert.equal(/checkmate/i.test(mate.coachExplanation.body), true);
  assert.equal(mate.coachExplanation.selectedTheme, "checkmate");
  assert.equal(mate.coachExplanation.usedFallback, false);

  const hallucinationCheck = lintCoachExplanation(
    {
      ...nc3.coachExplanation,
      body: "Play Nf3. This develops the bishop and wins material immediately.",
      selectedTheme: "minor_piece_development",
    },
    nc3.moveFactPacket,
  );
  assert.equal(hallucinationCheck.safe, false);
  assert.equal(hallucinationCheck.blockedReasons.some((reason) => reason.includes("bishop")), true);

  const debugLeak = lintCoachExplanation(
    {
      ...nc3.coachExplanation,
      body: "Verified move: Nc3 (b1c3) knight from b1 moves to c3.",
    },
    nc3.moveFactPacket,
  );
  assert.equal(debugLeak.safe, false);
  assert.equal(debugLeak.containsDebugLeak, true);
  assert.equal(nc3.coachExplanation.usedFallback, false);
  assert.notEqual(nc3.coachExplanation.source, "verified_safe_fallback");

  assert.notEqual(nc3.featurePacket.status, "skipped_no_target");
  assert.notEqual(nc3.planPacket.status, "skipped_no_target");
  assert.equal(nc3.opportunityPacket.opportunities.length > 0, true);
}
