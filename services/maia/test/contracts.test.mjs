import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ContractError, validateMoveRequest } from "../src/contracts.mjs";

const legalMovesUci = [
  "a2a3",
  "a2a4",
  "b2b3",
  "b2b4",
  "c2c3",
  "c2c4",
  "d2d3",
  "d2d4",
  "e2e3",
  "e2e4",
  "f2f3",
  "f2f4",
  "g2g3",
  "g2g4",
  "h2h3",
  "h2h4",
  "b1a3",
  "b1c3",
  "g1f3",
  "g1h3",
];

function request(overrides = {}) {
  return {
    requestId: 7,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci,
    skillLevel: "maia-1500",
    timeoutMs: 2_500,
    ratingBandId: "club",
    requestedRating: 1500,
    ...overrides,
  };
}

describe("move contract", () => {
  it("accepts an exact frame and complete legal set", () => {
    const validated = validateMoveRequest(request());
    assert.equal(validated.requestId, 7);
    assert.equal(validated.legalMoveSet.size, 20);
  });

  it("rejects an incomplete legal set", () => {
    assert.throws(
      () => validateMoveRequest(request({ legalMovesUci: ["e2e4"] })),
      (error) =>
        error instanceof ContractError && error.code === "legal_set_mismatch",
    );
  });

  it("rejects duplicate legal moves", () => {
    assert.throws(
      () =>
        validateMoveRequest(
          request({ legalMovesUci: [...legalMovesUci, "e2e4"] }),
        ),
      (error) =>
        error instanceof ContractError &&
        error.code === "duplicate_legal_moves",
    );
  });

  it("rejects a mismatched FEN4", () => {
    assert.throws(
      () => validateMoveRequest(request({ fen4: "wrong" })),
      (error) =>
        error instanceof ContractError && error.code === "fen_frame_mismatch",
    );
  });
});
