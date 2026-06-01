import assert from "node:assert/strict";

import { recognizeStrategicPlans } from "../planRecognitionEngine";

export function testPlanRecognitionEngine(): void {
  const bc4 = recognizeStrategicPlans({
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    openingId: "italian",
    conceptId: "develop_with_pressure",
    moveUci: "f1c4",
    moveSan: "Bc4",
  });
  assert.equal(bc4.plans.some((plan) => plan.type === "bishop_diagonal_pressure"), true);
  const c3 = recognizeStrategicPlans({
    fen: "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6",
    openingId: "italian",
    conceptId: "prepare_center_break",
    moveUci: "c2c3",
    moveSan: "c3",
  });
  assert.equal(c3.plans.some((plan) => plan.type === "central_break_preparation"), true);
}
