import assert from "node:assert/strict";
import { isSupportedContinuationCandidate, selectContinuedPlayMove, shouldForceContinuationPause } from "../continuedPlayMovePolicy";

export function testContinuedPlayMovePolicy(): void {
  const fen = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";

  const book = selectContinuedPlayMove({
    fen,
    bookCandidates: [{ uci: "e1g1", san: "O-O", source: "book", supported: true }],
    engineTop: { uci: "c2c3", san: "c3", source: "engine" },
  });
  assert.equal(book?.source, "book_supported");

  const lichessNotAutoSafe = selectContinuedPlayMove({
    fen,
    lichessCandidates: [{ uci: "a2a4", san: "a4", source: "lichess", supported: false, engineSafe: false }],
    engineTop: { uci: "e1g1", san: "O-O", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(lichessNotAutoSafe?.source, "engine_top");

  const engineTop = selectContinuedPlayMove({
    fen,
    engineTop: { uci: "e1g1", san: "O-O", source: "engine", supported: true, engineSafe: true },
  });
  assert.equal(engineTop?.source, "engine_top");

  const emergency = selectContinuedPlayMove({
    fen,
    lichessCandidates: [],
    engineTop: null,
  });
  assert.equal(Boolean(emergency), true);
  assert.equal(emergency?.source, "emergency_legal_fallback");


  assert.equal(isSupportedContinuationCandidate({ uci: "e1g1", source: "lichess", games: 499, playRate: 0.30 }), false);
  assert.equal(isSupportedContinuationCandidate({ uci: "e1g1", source: "lichess", games: 600, playRate: 0.17 }), false);
  assert.equal(isSupportedContinuationCandidate({ uci: "e1g1", source: "lichess", games: 500, playRate: 0.18 }), true);

  const strictBelowGames = selectContinuedPlayMove({
    fen,
    requireReliableDatabaseMove: true,
    lichessCandidates: [{ uci: "e1g1", san: "O-O", source: "lichess", games: 499, playRate: 0.30, stockfishInTop10: true, stockfishRank: 1, engineSafe: true }],
  });
  assert.equal(strictBelowGames?.source, "no_reliable_continuation");
  assert.equal(strictBelowGames?.debug.candidates[0]?.rejectionReason, "below_500_games");

  const strictBelowShare = selectContinuedPlayMove({
    fen,
    requireReliableDatabaseMove: true,
    lichessCandidates: [{ uci: "e1g1", san: "O-O", source: "lichess", games: 600, playRate: 0.17, stockfishInTop10: true, stockfishRank: 1, engineSafe: true }],
  });
  assert.equal(strictBelowShare?.source, "no_reliable_continuation");
  assert.equal(strictBelowShare?.debug.candidates[0]?.rejectionReason, "below_18_percent");

  const strictNotTop10 = selectContinuedPlayMove({
    fen,
    requireReliableDatabaseMove: true,
    lichessCandidates: [{ uci: "e1g1", san: "O-O", source: "lichess", games: 600, playRate: 0.22, stockfishInTop10: false, engineSafe: false }],
  });
  assert.equal(strictNotTop10?.source, "no_reliable_continuation");
  assert.equal(strictNotTop10?.debug.candidates[0]?.rejectionReason, "not_stockfish_top10");

  const strictAccepted = selectContinuedPlayMove({
    fen,
    requireReliableDatabaseMove: true,
    lichessCandidates: [
      { uci: "a2a4", san: "a4", source: "lichess", games: 1200, playRate: 0.25, stockfishInTop10: true, stockfishRank: 5, engineSafe: true },
      { uci: "e1g1", san: "O-O", source: "lichess", games: 500, playRate: 0.18, stockfishInTop10: true, stockfishRank: 2, engineSafe: true },
    ],
  });
  assert.equal(strictAccepted?.source, "lichess_engine_validated");
  assert.equal(strictAccepted?.selectedUci, "e1g1");

  const pause21 = shouldForceContinuationPause({ plyCount: 21, continuationPauseClicked: false });
  assert.equal(pause21.pauseRequired, false);
  assert.equal(pause21.pauseReason, null);

  const pause22 = shouldForceContinuationPause({ plyCount: 22, continuationPauseClicked: false });
  assert.equal(pause22.pauseRequired, true);
  assert.equal(pause22.pauseReason, "move_11_hard_stop");

  const pause23Clicked = shouldForceContinuationPause({ plyCount: 23, continuationPauseClicked: true });
  assert.equal(pause23Clicked.pauseRequired, false);
  assert.equal(pause23Clicked.pauseReason, "move_11_hard_stop");

  const linePause = shouldForceContinuationPause({ plyCount: 4, lineExhausted: true, continuationPauseClicked: false });
  assert.equal(linePause.pauseRequired, true);
  assert.equal(linePause.pauseReason, "line_complete");

  const branchPause = shouldForceContinuationPause({ plyCount: 4, branchExhausted: true, continuationPauseClicked: false });
  assert.equal(branchPause.pauseRequired, true);
  assert.equal(branchPause.pauseReason, "branch_exhausted");
}
