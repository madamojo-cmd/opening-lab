import assert from "node:assert/strict";
import { Chess } from "chess.js";

import { normalizeFen4, shouldFlagStaleOpponentReplyCommit } from "../opponentReplyGuard";

export function testOpponentReplyGuard(): void {
  const game = new Chess();
  game.move("e4");
  const fenAfterE4 = game.fen();
  const baseFen = normalizeFen4(fenAfterE4);

  const validPending = { requestId: 1, baseFen };
  assert.equal(
    shouldFlagStaleOpponentReplyCommit({
      request: validPending,
      currentPendingRequest: validPending,
      liveFen: fenAfterE4,
    }),
    false,
  );

  assert.equal(
    shouldFlagStaleOpponentReplyCommit({
      request: validPending,
      currentPendingRequest: { requestId: 2, baseFen },
      liveFen: fenAfterE4,
    }),
    true,
  );

  game.move("e5");
  assert.equal(
    shouldFlagStaleOpponentReplyCommit({
      request: validPending,
      currentPendingRequest: validPending,
      liveFen: game.fen(),
    }),
    true,
  );

  assert.equal(
    shouldFlagStaleOpponentReplyCommit({
      request: validPending,
      currentPendingRequest: null,
      liveFen: fenAfterE4,
    }),
    false,
  );
}
