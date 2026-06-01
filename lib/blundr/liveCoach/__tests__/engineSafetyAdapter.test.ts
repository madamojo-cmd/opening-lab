import assert from "node:assert/strict";
import { adaptEngineSafety } from "../engineSafetyAdapter";

export function testEngineSafetyAdapter(): void {
  const adapted = adaptEngineSafety({
    status: "available",
    evalBeforeCp: 20,
    bestMoveUci: "e2e4",
    candidates: [
      { moveUci: "e2e4", evalAfterCp: 25, rank: 1 },
      { moveUci: "d2d4", evalAfterCp: -150, rank: 2 },
      { moveUci: "a2a3", evalAfterCp: -400, rank: 3 },
    ],
  });
  assert.equal(adapted.candidates[0]?.safety, "best");
  assert.equal(["inaccuracy", "mistake", "blunder"].includes(adapted.candidates[1]?.safety ?? ""), true);
  assert.equal(adapted.candidates[2]?.safety === "blunder" || adapted.candidates[2]?.safety === "mistake", true);
}
