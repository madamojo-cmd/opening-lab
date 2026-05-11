import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { buildFeaturePacket, verifyVisualOutput } from "../../featurePacketBuilder";
import { salienceVisualSelector } from "../salienceVisualSelector";

export function testSalienceVisualSelector(): void {
  const start = new Chess();

  const nf3 = salienceVisualSelector({
    fen: start.fen(),
    expectedMove: { uci: "g1f3", san: "Nf3" },
    openingName: "Italian Game",
    userColor: "w",
  });
  assert.equal(nf3.planArrows[0].from, "g1");
  assert.equal(nf3.planArrows[0].to, "f3");
  assert.equal(nf3.keySquares.includes("f3"), true);
  assert.equal(["knight_pressure_center", "quiet_development"].includes(String(nf3.debug?.concept)), true);

  const e4 = salienceVisualSelector({
    fen: start.fen(),
    expectedMove: { uci: "e2e4", san: "e4" },
    openingName: "Italian Game",
    userColor: "w",
  });
  assert.equal(e4.keySquares.includes("e4"), true);
  assert.equal(["center_control", "center_tension", "prepare_center_break", "pawn_break"].includes(String(e4.debug?.concept)), true);

  const italian = new Chess();
  italian.move("e4");
  italian.move("e5");
  italian.move("Nf3");
  italian.move("Nc6");
  const bishopPacket = buildFeaturePacket({
    fen: italian.fen(),
    expectedMove: { uci: "f1c4", san: "Bc4" },
    openingName: "Italian Game",
    userColor: "w",
  });
  const bishop = salienceVisualSelector(bishopPacket);
  assert.equal(bishop.planArrows[0].from, "f1");
  assert.equal(bishop.planArrows[0].to, "c4");
  assert.equal(bishop.keySquares.includes("c4"), true);
  if (bishop.debug?.concept === "development_with_f7_pressure") {
    assert.equal(bishop.planArrows.some((arrow) => arrow.from === "c4" && arrow.to === "f7"), true);
  }
  assert.doesNotThrow(() => verifyVisualOutput(bishop, bishopPacket, { mode: "test" }));

  const castle = new Chess();
  castle.move("e4");
  castle.move("e5");
  castle.move("Nf3");
  castle.move("Nc6");
  castle.move("Bc4");
  castle.move("Bc5");
  const castleOutput = salienceVisualSelector({
    fen: castle.fen(),
    expectedMove: { uci: "e1g1", san: "O-O" },
    openingName: "Italian Game",
    userColor: "w",
  });
  assert.equal(castleOutput.debug?.concept, "castle_for_safety");
  assert.equal(castleOutput.planArrows[0].from, "e1");
  assert.equal(castleOutput.planArrows[0].to, "g1");

  const pending = salienceVisualSelector({ fen: start.fen(), candidateMoves: ["e2e5"] });
  assert.equal(pending.suppress?.includes("recommendation_pending"), true);
  assert.equal(pending.debug?.fallbackUsed, true);

  const budget = salienceVisualSelector({
    fen: start.fen(),
    expectedMove: { uci: "d2d4", san: "d4" },
    openingName: "Queen's Gambit",
    userColor: "w",
  });
  assert.equal(budget.planArrows.length <= 2, true);
  assert.equal(budget.keySquares.length <= 4, true);
  assert.equal(budget.plan.cues.length <= 4, true);
}
