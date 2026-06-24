import assert from "node:assert/strict";

import { Chess } from "chess.js";

import { resolveRestrictedOpponentReplyAuthority } from "../../lib/blundr/runtime/restrictedOpponentReplyAuthority";

export function testStage2ItalianWhiteDoesNotUseArbitraryRb8Fallback(): void {
  const game = new Chess();
  for (const san of ["e4", "e5", "Nf3", "Nc6", "Bc4"]) {
    const move = game.move(san);
    assert.ok(move, `legal_move_missing:${san}`);
  }

  const legalMoves = game.moves({ verbose: true }) as Array<{ from: string; to: string; san: string }>;
  assert.equal(game.turn(), "b");
  assert.equal(legalMoves.length > 0, true);
  assert.equal(legalMoves.some((move) => move.from === "a8" && move.to === "b8"), true, "rb8_legal_move_missing");

  const authority = resolveRestrictedOpponentReplyAuthority({
    currentOpponentBookOptionCount: 0,
    legalMoveCount: legalMoves.length,
  });

  assert.equal(authority.kind, "blocked");
  assert.equal(authority.reason, "no_runtime_backed_opponent_reply_available");
  assert.equal(authority.blockedReason, "missing_runtime_backed_opponent_reply");
}

testStage2ItalianWhiteDoesNotUseArbitraryRb8Fallback();
console.log("stage2ItalianWhiteDoesNotUseArbitraryRb8Fallback ok");
