import assert from "node:assert/strict";

import { mapEngineLinesToStockfishTopMoves, validateContinuationSuggestion, validateContinuationSuggestionAgainstStockfish } from "../../lib/blundr/engine/stockfishContinuationValidation";

export function testStockfishValidationGate(): void {
  const topMoves = mapEngineLinesToStockfishTopMoves({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    pvs: [
      { uci: "e2e4", san: "e4", cp: 30 },
      { uci: "d2d4", san: "d4", cp: 24 },
      { uci: "g1f3", san: "Nf3", cp: 21 },
    ],
    depth: 10,
    multipv: 10,
    providerStatus: "ready",
  });
  assert.equal(topMoves.multipv, 10, "suggestion validation multipv remains 10");
  const defaultsToTop1 = validateContinuationSuggestionAgainstStockfish({
    candidateUci: "e2e4",
    candidateSan: "e4",
    stockfish: topMoves,
  });
  assert.equal(defaultsToTop1.accepted, true, "continuation_suggestion_defaults_to_stockfish_top1");
  assert.equal(defaultsToTop1.isTop1, true);
  assert.equal(defaultsToTop1.isTop10, true);

  const notTop10 = validateContinuationSuggestionAgainstStockfish({
    candidateUci: "a2a3",
    candidateSan: "a3",
    stockfish: topMoves,
  });
  assert.equal(notTop10.accepted, false, "non_top10_candidate_is_replaced_by_stockfish_top1");
  assert.equal(notTop10.replacementUci, "e2e4");
  assert.equal(notTop10.rejectionReason, "suggested_move_not_in_stockfish_top10");

  const unavailable = mapEngineLinesToStockfishTopMoves({
    fen: topMoves.fen,
    pvs: [],
    depth: 10,
    providerStatus: "unavailable",
    errorReason: "stockfish_provider_unavailable",
  });
  const unavailableValidation = validateContinuationSuggestionAgainstStockfish({
    candidateUci: "e2e4",
    candidateSan: "e4",
    stockfish: unavailable,
  });
  assert.equal(unavailableValidation.accepted, false, "unvalidated_candidate_never_reaches_current_instruction_target");
  assert.equal(unavailableValidation.providerStatus, "unavailable");

  const top10Allowed = validateContinuationSuggestionAgainstStockfish({
    candidateUci: "g1f3",
    candidateSan: "Nf3",
    stockfish: topMoves,
  });
  assert.equal(top10Allowed.isTop10, true, "top10_candidate_allowed_but_top1_preferred_for_mvp");
  assert.equal(top10Allowed.isTop1, false);
  assert.equal(topMoves.bestMoveUci, "e2e4");

  const plainSafe = {
    title: "Finding a continuation",
    body: "Blundr is choosing a training move from this position.",
    actions: [],
  };
  assert.equal(/e2e4|d2d4|g1f3|top10|rank|best/i.test(`${plainSafe.title} ${plainSafe.body}`), false, "plain_pre_show_more_hides_stockfish_suggestion_details");

  const aliasValidation = validateContinuationSuggestion({
    candidateUci: "e2e4",
    candidateSan: "e4",
    stockfish: topMoves,
  });
  assert.equal(aliasValidation.accepted, true);
}

testStockfishValidationGate();
console.log("stockfishValidationGate ok");
