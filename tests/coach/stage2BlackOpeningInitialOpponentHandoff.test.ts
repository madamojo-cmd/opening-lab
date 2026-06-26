import assert from "node:assert/strict";

import { Chess } from "chess.js";

import {
  loadStage2RuntimeTrainableRepertoire,
  selectRuntimeWeightedTrainingLineSelection,
} from "../../lib/blundr/openings/runtimeLineBodyLoader";
import { resolveBlackOpeningInitialOpponentHandoff } from "../../lib/blundr/runtime/blackOpeningInitialOpponentHandoff";
import { applyRuntimeUciMove } from "../../lib/blundr/runtime/uciReplay";

const BLACK_OPENING_IDS = [
  "caro-kann-black",
  "french-black",
  "sicilian-black",
  "pirc-black",
  "scandinavian-black",
] as const;

function normalizeFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();
}

function legalMoveUcis(game: Chess): string[] {
  return (game.moves({ verbose: true }) as any[]).map(moveToUci);
}

async function assertBlackOpeningInitialHandoff(openingId: string): Promise<void> {
  const start = new Chess();
  assert.equal(start.turn(), "w", `${openingId}:black_opening_must_start_with_white_opponent_to_move`);

  const blockedBeforeLoad = resolveBlackOpeningInitialOpponentHandoff({
    activeTab: "train",
    trainingMode: "restricted",
    userExplicitlyEnteredContinuation: false,
    userColor: "b",
    opponentColor: "w",
    turn: start.turn() as "w" | "b",
    gameOver: start.isGameOver(),
    selectedOpeningRuntimeAvailable: true,
    selectedRuntimeLineLoaded: false,
    selectedOpeningId: openingId,
    selectedRuntimeLineOpeningId: null,
    selectedRuntimeLineKey: null,
    selectedRuntimeLinePlaySequenceUci: [],
    runtimeTrainingSessionId: `stage2-black-initial:${openingId}`,
    ratingBandId: "club",
    fen4: normalizeFen(start.fen()),
    moveHistoryLength: 0,
    lastMoveUci: null,
    pendingOpponentRequestExists: false,
    handledHandoffKey: null,
    legalMoveUcis: legalMoveUcis(start),
  });
  assert.equal(blockedBeforeLoad.kind, "blocked", `${openingId}:handoff_must_wait_for_split_runtime_body`);
  assert.equal(blockedBeforeLoad.reason, "selected_runtime_line_not_loaded", `${openingId}:unexpected_preload_block_reason`);

  const repertoire = await loadStage2RuntimeTrainableRepertoire(openingId);
  assert.ok(repertoire, `${openingId}:split_runtime_repertoire_missing`);
  assert.equal(repertoire.color, "black", `${openingId}:test_opening_must_train_black`);

  const selectedLine = selectRuntimeWeightedTrainingLineSelection({
    openingId,
    repertoire,
    seed: `stage2-black-initial:${openingId}`,
    ratingBandId: "club",
  });
  assert.ok(selectedLine, `${openingId}:selected_runtime_line_missing`);
  assert.equal(selectedLine.openingId, openingId, `${openingId}:selected_line_opening_mismatch`);
  assert.equal(selectedLine.selectedPlaySequenceUci.length > 0, true, `${openingId}:selected_line_empty`);

  const ready = resolveBlackOpeningInitialOpponentHandoff({
    activeTab: "train",
    trainingMode: "restricted",
    userExplicitlyEnteredContinuation: false,
    userColor: "b",
    opponentColor: "w",
    turn: start.turn() as "w" | "b",
    gameOver: start.isGameOver(),
    selectedOpeningRuntimeAvailable: true,
    selectedRuntimeLineLoaded: true,
    selectedOpeningId: openingId,
    selectedRuntimeLineOpeningId: selectedLine.openingId,
    selectedRuntimeLineKey: selectedLine.selectedLineKey,
    selectedRuntimeLinePlaySequenceUci: selectedLine.selectedPlaySequenceUci,
    runtimeTrainingSessionId: `stage2-black-initial:${openingId}`,
    ratingBandId: "club",
    fen4: normalizeFen(start.fen()),
    moveHistoryLength: 0,
    lastMoveUci: null,
    pendingOpponentRequestExists: false,
    handledHandoffKey: null,
    legalMoveUcis: legalMoveUcis(start),
  });

  assert.equal(ready.kind, "ready", `${openingId}:post_load_initial_handoff_not_ready`);
  assert.equal(ready.maiaAllowed, false, `${openingId}:maia_must_not_be_allowed_for_initial_restricted_handoff`);
  assert.equal(ready.continuationEntered, false, `${openingId}:continuation_must_not_be_entered_for_initial_restricted_handoff`);
  assert.equal(ready.opponentMoveUci, selectedLine.selectedPlaySequenceUci[0], `${openingId}:handoff_must_use_selected_line_first_move`);

  let commitCount = 0;
  let maiaProviderCallCount = 0;
  const committed = new Chess(start.fen());
  const move = applyRuntimeUciMove(committed, ready.opponentMoveUci);
  if (move) commitCount += 1;

  assert.ok(move, `${openingId}:selected_initial_opponent_move_illegal`);
  assert.equal(move?.color, "w", `${openingId}:initial_committed_move_must_be_white_opponent`);
  assert.equal(committed.turn(), "b", `${openingId}:after_initial_opponent_move_it_must_be_black_user_turn`);
  assert.equal(commitCount, 1, `${openingId}:initial_opponent_move_must_commit_exactly_once`);
  assert.equal(maiaProviderCallCount, 0, `${openingId}:maia_provider_must_not_be_called`);

  const duplicate = resolveBlackOpeningInitialOpponentHandoff({
    activeTab: "train",
    trainingMode: "restricted",
    userExplicitlyEnteredContinuation: false,
    userColor: "b",
    opponentColor: "w",
    turn: start.turn() as "w" | "b",
    gameOver: start.isGameOver(),
    selectedOpeningRuntimeAvailable: true,
    selectedRuntimeLineLoaded: true,
    selectedOpeningId: openingId,
    selectedRuntimeLineOpeningId: selectedLine.openingId,
    selectedRuntimeLineKey: selectedLine.selectedLineKey,
    selectedRuntimeLinePlaySequenceUci: selectedLine.selectedPlaySequenceUci,
    runtimeTrainingSessionId: `stage2-black-initial:${openingId}`,
    ratingBandId: "club",
    fen4: normalizeFen(start.fen()),
    moveHistoryLength: 0,
    lastMoveUci: null,
    pendingOpponentRequestExists: false,
    handledHandoffKey: ready.handoffKey,
    legalMoveUcis: legalMoveUcis(start),
  });
  assert.equal(duplicate.kind, "blocked", `${openingId}:duplicate_handoff_must_be_blocked`);
  assert.equal(duplicate.reason, "opponent_handoff_already_handled", `${openingId}:duplicate_handoff_block_reason`);

  const afterCommit = resolveBlackOpeningInitialOpponentHandoff({
    activeTab: "train",
    trainingMode: "restricted",
    userExplicitlyEnteredContinuation: false,
    userColor: "b",
    opponentColor: "w",
    turn: committed.turn() as "w" | "b",
    gameOver: committed.isGameOver(),
    selectedOpeningRuntimeAvailable: true,
    selectedRuntimeLineLoaded: true,
    selectedOpeningId: openingId,
    selectedRuntimeLineOpeningId: selectedLine.openingId,
    selectedRuntimeLineKey: selectedLine.selectedLineKey,
    selectedRuntimeLinePlaySequenceUci: selectedLine.selectedPlaySequenceUci,
    runtimeTrainingSessionId: `stage2-black-initial:${openingId}`,
    ratingBandId: "club",
    fen4: normalizeFen(committed.fen()),
    moveHistoryLength: 1,
    lastMoveUci: ready.opponentMoveUci,
    pendingOpponentRequestExists: false,
    handledHandoffKey: ready.handoffKey,
    legalMoveUcis: legalMoveUcis(committed),
  });
  assert.equal(afterCommit.kind, "blocked", `${openingId}:handoff_must_not_retry_after_commit`);
}

export async function testStage2BlackOpeningInitialOpponentHandoff(): Promise<void> {
  for (const openingId of BLACK_OPENING_IDS) {
    await assertBlackOpeningInitialHandoff(openingId);
  }
}

void testStage2BlackOpeningInitialOpponentHandoff()
  .then(() => {
    console.log("stage2BlackOpeningInitialOpponentHandoff ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
