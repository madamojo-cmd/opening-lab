import assert from "node:assert/strict";

import {
  normalizeFenForVisualFrame,
  shouldIgnoreStaleOverlay,
  shouldRenderAssistedContextOverlay,
  shouldRenderMoveTeachingOverlay,
  shouldRenderOpponentLastMoveHighlight,
  visualFrameMatches,
} from "../overlayLifecycle";

export function testOverlayLifecycle(): void {
  assert.equal(
    shouldRenderMoveTeachingOverlay({
      phase: "opponent_selecting",
      userToMove: true,
      viewMode: "assisted",
      mode: "move_teaching",
      expectedUserMoveUci: "f1e1",
      moveTrust: "repertoire_supported",
      contextFen: "fen",
      boardFen: "fen",
    }),
    false,
  );

  assert.equal(
    shouldRenderMoveTeachingOverlay({
      phase: "opponent_animating",
      userToMove: true,
      viewMode: "assisted",
      mode: "move_teaching",
      expectedUserMoveUci: "f1e1",
      moveTrust: "book_supported",
      contextFen: "fen",
      boardFen: "fen",
    }),
    false,
  );

  assert.equal(
    shouldRenderMoveTeachingOverlay({
      phase: "ready_for_user",
      userToMove: true,
      viewMode: "plain",
      mode: "move_teaching",
      expectedUserMoveUci: "f1e1",
      moveTrust: "engine_verified",
      contextFen: "fen",
      boardFen: "fen",
    }),
    false,
  );

  assert.equal(
    shouldRenderAssistedContextOverlay({
      phase: "ready_for_user",
      viewMode: "assisted",
      mode: "assisted_context",
      contextTrust: "safe_context",
      hasAnswerArrow: true,
    }),
    false,
  );

  assert.equal(
    shouldRenderOpponentLastMoveHighlight({
      committed: false,
      cueFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      boardFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    }),
    false,
  );
  assert.equal(
    shouldRenderOpponentLastMoveHighlight({
      committed: true,
      cueFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      boardFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -",
    }),
    true,
  );

  assert.equal(
    shouldIgnoreStaleOverlay({
      trainerFrameId: 8,
      overlayFrameId: 7,
      overlayFen: "fenA",
      boardFen: "fenA",
    }),
    true,
  );
  assert.equal(
    shouldIgnoreStaleOverlay({
      trainerFrameId: 8,
      overlayFrameId: 8,
      overlayFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      boardFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2",
    }),
    false,
  );
  assert.equal(
    shouldIgnoreStaleOverlay({
      trainerFrameId: 8,
      overlayFrameId: 8,
      overlayFen: "fenOld",
      boardFen: "fenNew",
    }),
    true,
  );
  assert.equal(normalizeFenForVisualFrame("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
  assert.equal(visualFrameMatches(70, "70"), true);
}
