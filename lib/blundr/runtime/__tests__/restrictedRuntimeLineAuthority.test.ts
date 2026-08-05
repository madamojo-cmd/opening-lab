import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  buildRestrictedRuntimeLineRequestSnapshot,
  isStaleRestrictedRuntimeLineRequest,
  resolveRestrictedRuntimeLineAuthority,
  validateRestrictedRuntimeLineSession,
} from "../restrictedRuntimeLineAuthority";

const START_FEN = new Chess().fen();

const ITALIAN_WHITE = [
  "e2e4",
  "e7e5",
  "g1f3",
  "b8c6",
  "f1c4",
  "f8c5",
  "c2c3",
  "g8f6",
  "d2d4",
  "e5d4",
  "e1g1",
  "e8g8",
];

const FRENCH_BLACK_BG5 = [
  "e2e4",
  "e7e6",
  "g1f3",
  "d7d5",
  "e4d5",
  "e6d5",
  "d2d4",
  "g8f6",
  "b1c3",
  "f8d6",
  "c1g5",
  "c7c6",
];

const PROMOTION_LINE = [
  "a7a8q",
  "h7h6",
  "a8b8",
  "h6h5",
  "b8c8",
  "h5h4",
  "c8d8",
  "h4h3",
  "d8e8",
  "h3h2",
  "e8f8",
  "h2h1q",
];
const PROMOTION_START = "8/P6p/8/8/8/8/8/4K2k w - - 0 1";

function fenAfter(sequence: readonly string[], count: number, startFen = START_FEN): string {
  const game = new Chess(startFen);
  for (const uci of sequence.slice(0, count)) {
    const move = game.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    assert.ok(move, `move should apply:${uci}`);
  }
  return game.fen();
}

function baseInput(overrides: Partial<Parameters<typeof resolveRestrictedRuntimeLineAuthority>[0]> = {}) {
  return {
    trainingMode: "restricted",
    selectedRuntimeLineId: "italian-white:runtime:test",
    selectedRuntimeLineKey: `italian-white:runtime:test:${ITALIAN_WHITE.join(",")}`,
    selectedPlaySequenceUci: ITALIAN_WHITE,
    committedUciHistory: [],
    startingFen: START_FEN,
    currentFen: START_FEN,
    userColor: "w" as const,
    sessionId: "session-1",
    ...overrides,
  };
}

export function testRestrictedRuntimeLineAuthorityWhiteAndBlack(): void {
  const whiteInitial = resolveRestrictedRuntimeLineAuthority(baseInput());
  assert.equal(whiteInitial.kind, "user_target");
  assert.equal(whiteInitial.kind === "user_target" ? whiteInitial.move.uci : null, "e2e4");
  assert.deepEqual(whiteInitial.progress, { completedLearnerMoves: 0, totalLearnerMoves: 6 });

  const blackInitial = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedRuntimeLineId: "french-black:runtime:207",
    selectedRuntimeLineKey: `french-black:runtime:207:${FRENCH_BLACK_BG5.join(",")}`,
    selectedPlaySequenceUci: FRENCH_BLACK_BG5,
    userColor: "b",
  }));
  assert.equal(blackInitial.kind, "opponent_reply");
  assert.equal(blackInitial.kind === "opponent_reply" ? blackInitial.move.uci : null, "e2e4");
  assert.deepEqual(blackInitial.progress, { completedLearnerMoves: 0, totalLearnerMoves: 6 });
}

export function testRestrictedRuntimeLineAuthorityPrefixAndFenValidation(): void {
  const prefix = resolveRestrictedRuntimeLineAuthority(baseInput({
    committedUciHistory: ITALIAN_WHITE.slice(0, 4),
    currentFen: fenAfter(ITALIAN_WHITE, 4),
  }));
  assert.equal(prefix.kind, "user_target");
  assert.equal(prefix.kind === "user_target" ? prefix.move.uci : null, "f1c4");

  const wrongPrefix = resolveRestrictedRuntimeLineAuthority(baseInput({
    committedUciHistory: ["e2e4", "c7c5"],
    currentFen: fenAfter(["e2e4", "c7c5"], 2),
  }));
  assert.equal(wrongPrefix.kind, "diverged");
  assert.equal(wrongPrefix.reason, "committed_uci_history_not_selected_line_prefix");

  const wrongFen = resolveRestrictedRuntimeLineAuthority(baseInput({
    committedUciHistory: ITALIAN_WHITE.slice(0, 2),
    currentFen: START_FEN,
  }));
  assert.equal(wrongFen.kind, "diverged");
  assert.equal(wrongFen.reason, "current_fen_does_not_match_selected_line_prefix");
}

export function testRestrictedRuntimeLineAuthorityInvalidSequences(): void {
  const illegalNext = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedPlaySequenceUci: ["e2e4", "e7e5", "e2e4"],
    selectedRuntimeLineKey: "bad:e2e4,e7e5,e2e4",
    committedUciHistory: ["e2e4", "e7e5"],
    currentFen: fenAfter(["e2e4", "e7e5"], 2),
  }));
  assert.equal(illegalNext.kind, "invalid_line");
  assert.equal(illegalNext.reason, "selected_runtime_line_next_move_illegal");

  const truncated = validateRestrictedRuntimeLineSession({
    selectedRuntimeLineId: "italian-white:runtime:test",
    selectedRuntimeLineKey: "italian-white:runtime:test:e2e4,e7e5",
    selectedPlaySequenceUci: ["e2e4", "e7e5"],
    startingFen: START_FEN,
    userColor: "w",
    sessionId: "session-1",
  });
  assert.equal(truncated.ok, false);
  assert.equal(truncated.ok ? null : truncated.reason, "selected_runtime_line_wrong_length");
}

export function testRestrictedRuntimeLineAuthorityStaleRequests(): void {
  const authority = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedRuntimeLineId: "french-black:runtime:207",
    selectedRuntimeLineKey: `french-black:runtime:207:${FRENCH_BLACK_BG5.join(",")}`,
    selectedPlaySequenceUci: FRENCH_BLACK_BG5,
    userColor: "b",
  }));
  const snapshot = buildRestrictedRuntimeLineRequestSnapshot({ authority, baseFen: START_FEN });
  assert.ok(snapshot);
  assert.equal(isStaleRestrictedRuntimeLineRequest({ request: snapshot, current: snapshot }), false);
  assert.equal(isStaleRestrictedRuntimeLineRequest({
    request: snapshot,
    current: snapshot ? { ...snapshot, sessionId: "session-2" } : null,
  }), true);
  assert.equal(isStaleRestrictedRuntimeLineRequest({
    request: snapshot,
    current: snapshot ? { ...snapshot, cursor: snapshot.cursor + 1 } : null,
  }), true);
}

export function testRestrictedRuntimeLineAuthorityCompletion(): void {
  const afterFinalLearnerMove = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedPlaySequenceUci: ITALIAN_WHITE.slice(0, 11),
    selectedRuntimeLineKey: `italian-white:runtime:test:${ITALIAN_WHITE.slice(0, 11).join(",")}`,
    committedUciHistory: ITALIAN_WHITE.slice(0, 11),
    currentFen: fenAfter(ITALIAN_WHITE, 11),
  }));
  assert.equal(afterFinalLearnerMove.kind, "complete");
  assert.deepEqual(afterFinalLearnerMove.progress, { completedLearnerMoves: 6, totalLearnerMoves: 6 });

  const afterFinalOpponentMove = resolveRestrictedRuntimeLineAuthority(baseInput({
    committedUciHistory: ITALIAN_WHITE,
    currentFen: fenAfter(ITALIAN_WHITE, 12),
  }));
  assert.equal(afterFinalOpponentMove.kind, "complete");
  assert.deepEqual(afterFinalOpponentMove.progress, { completedLearnerMoves: 6, totalLearnerMoves: 6 });
}

export function testRestrictedRuntimeLineAuthorityFrenchBg5Regression(): void {
  const afterBg5 = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedRuntimeLineId: "french-black:runtime:207",
    selectedRuntimeLineKey: `french-black:runtime:207:${FRENCH_BLACK_BG5.join(",")}`,
    selectedPlaySequenceUci: FRENCH_BLACK_BG5,
    committedUciHistory: FRENCH_BLACK_BG5.slice(0, 11),
    startingFen: START_FEN,
    currentFen: fenAfter(FRENCH_BLACK_BG5, 11),
    userColor: "b",
    sessionId: "french-bg5-session",
  }));
  assert.equal(afterBg5.kind, "user_target");
  assert.equal(afterBg5.kind === "user_target" ? afterBg5.move.uci : null, "c7c6");
  assert.equal(afterBg5.kind === "user_target" ? afterBg5.move.san : null, "c6");
  assert.deepEqual(afterBg5.progress, { completedLearnerMoves: 5, totalLearnerMoves: 6 });

  const complete = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedRuntimeLineId: "french-black:runtime:207",
    selectedRuntimeLineKey: `french-black:runtime:207:${FRENCH_BLACK_BG5.join(",")}`,
    selectedPlaySequenceUci: FRENCH_BLACK_BG5,
    committedUciHistory: FRENCH_BLACK_BG5,
    startingFen: START_FEN,
    currentFen: fenAfter(FRENCH_BLACK_BG5, 12),
    userColor: "b",
    sessionId: "french-bg5-session",
  }));
  assert.equal(complete.kind, "complete");
  assert.deepEqual(complete.progress, { completedLearnerMoves: 6, totalLearnerMoves: 6 });
}

export function testRestrictedRuntimeLineAuthorityPromotionUci(): void {
  const promoted = resolveRestrictedRuntimeLineAuthority(baseInput({
    selectedRuntimeLineId: "promotion-white:runtime:test",
    selectedRuntimeLineKey: `promotion-white:runtime:test:${PROMOTION_LINE.join(",")}`,
    selectedPlaySequenceUci: PROMOTION_LINE,
    startingFen: PROMOTION_START,
    currentFen: PROMOTION_START,
    userColor: "w",
    sessionId: "promotion-session",
  }));
  assert.equal(promoted.kind, "user_target");
  assert.equal(promoted.kind === "user_target" ? promoted.move.uci : null, "a7a8q");
  assert.equal(promoted.kind === "user_target" ? promoted.move.san : null, "a8=Q+");
}

testRestrictedRuntimeLineAuthorityWhiteAndBlack();
testRestrictedRuntimeLineAuthorityPrefixAndFenValidation();
testRestrictedRuntimeLineAuthorityInvalidSequences();
testRestrictedRuntimeLineAuthorityStaleRequests();
testRestrictedRuntimeLineAuthorityCompletion();
testRestrictedRuntimeLineAuthorityFrenchBg5Regression();
testRestrictedRuntimeLineAuthorityPromotionUci();

console.log("restrictedRuntimeLineAuthority ok");
