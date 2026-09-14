import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";
import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { normalizeProviderGame } from "../gameNormalizer";
import { replayPgn } from "../pgnReplay";
import { matchOpeningSegments } from "../openingSegmentMatcher";
import { extractDeterministicFindings } from "../findingExtractor";
import { buildImportedFindingLearningEventInput } from "../importedFindingProjection";

function fenAfter(moves: readonly string[]): string {
  const chess = new Chess();
  for (const move of moves) chess.move(move);
  return chess.fen();
}

function runtimeFixture() {
  const openingId = "reti-white";
  const parentPlayKey = "g1f3,g8f6,g2g3,g7g6";
  const childPlayKey = `${parentPlayKey},f1g2`;
  const nodes: RuntimeOpeningNode[] = [
    {
      nodeId: "parent",
      openingId,
      playKey: parentPlayKey,
      playSequenceUci: parentPlayKey,
      ply: 4,
      sideToMove: "white",
      canonicalFen: fenAfter(["Nf3", "Nf6", "g3", "g6"]),
    },
    {
      nodeId: "child",
      openingId,
      playKey: childPlayKey,
      playSequenceUci: childPlayKey,
      ply: 5,
      sideToMove: "black",
      canonicalFen: fenAfter(["Nf3", "Nf6", "g3", "g6", "Bg2"]),
    },
    {
      nodeId: "alt-child",
      openingId,
      playKey: `${parentPlayKey},c2c4`,
      playSequenceUci: `${parentPlayKey},c2c4`,
      ply: 5,
      sideToMove: "black",
      canonicalFen: fenAfter(["Nf3", "Nf6", "g3", "g6", "c4"]),
    },
  ];
  const candidates: RuntimeCandidateMove[] = [
    { openingId, playKeyBefore: parentPlayKey, moveUci: "f1g2", rank: 1 },
    { openingId, playKeyBefore: parentPlayKey, moveUci: "c2c4", rank: 2 },
  ];
  return {
    openingId,
    nodes,
    trainer: createRuntimeEvidenceIndices(nodes, candidates).trainer,
  };
}

function access(decision: "active" | "gated_pending" = "active") {
  return {
    openingId: "reti-white",
    repertoireSide: "white" as const,
    decision,
    checkedAt: "2026-09-14T00:00:00.000Z",
    authorityVersion: "test",
    expiresAt: null,
  };
}

test("transposed imported game resolves to the same unlocked runtime node", () => {
  const game = normalizeProviderGame({
    provider: "lichess",
    externalId: "transposed",
    username: "alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-09-14T00:00:00.000Z",
    result: "1-0",
    terminationReason: "resign",
    variant: "standard",
    timeControl: "rapid",
    pgn: `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. g3 g6 2. Nf3 Nf6 3. Bg2 Bg7`,
    moves: ["g2g3", "g7g6", "g1f3", "g8f6", "f1g2", "f8g7"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const runtime = runtimeFixture();
  const segments = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: runtime.nodes,
    access: () => access(),
  });
  assert.equal(segments.length, 1);
  const evidence = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment: segments[0],
    plies: replay.plies,
    trainer: runtime.trainer,
    access: access(),
  });
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].outcome, "followed_known_repertoire");
  assert.equal(evidence[0].position.moveOrderKey, "g1f3,g8f6,g2g3,g7g6");
  assert.equal(
    buildImportedFindingLearningEventInput("user-a", evidence[0]),
    null,
  );
});

test("alternate unlocked continuation and deviation are classified without opponent scoring", () => {
  const runtime = runtimeFixture();
  const alternate = normalizeProviderGame({
    provider: "chesscom",
    externalId: "alternate",
    username: "alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-09-14T00:00:00.000Z",
    result: "1-0",
    terminationReason: "white:win,black:resigned",
    variant: "standard",
    pgn: `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. g3 g6 2. Nf3 Nf6 3. c4 Bg7`,
    moves: ["g2g3", "g7g6", "g1f3", "g8f6", "c2c4", "f8g7"],
  });
  assert.ok(alternate);
  if (!alternate) return;
  const alternateReplay = replayPgn(alternate.pgn, alternate.playerColor);
  assert.equal(alternateReplay.ok, true);
  if (!alternateReplay.ok) return;
  const alternateSegment = matchOpeningSegments({
    game: alternate,
    plies: alternateReplay.plies,
    nodes: runtime.nodes,
    access: () => access(),
  })[0];
  const alternateEvidence = extractDeterministicFindings({
    userId: "user-a",
    game: alternate,
    segment: alternateSegment,
    plies: alternateReplay.plies,
    trainer: runtime.trainer,
    access: access(),
  });
  assert.equal(alternateEvidence[0].outcome, "alternate_unlocked_continuation");

  const deviation = normalizeProviderGame({
    provider: "chesscom",
    externalId: "deviation",
    username: "alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-09-14T00:00:00.000Z",
    result: "0-1",
    terminationReason: "white:timeout,black:win",
    variant: "standard",
    pgn: `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "0-1"]\n\n1. g3 g6 2. Nf3 Nf6 3. h4 Bg7`,
    moves: ["g2g3", "g7g6", "g1f3", "g8f6", "h2h4", "f8g7"],
  });
  assert.ok(deviation);
  if (!deviation) return;
  const deviationReplay = replayPgn(deviation.pgn, deviation.playerColor);
  assert.equal(deviationReplay.ok, true);
  if (!deviationReplay.ok) return;
  const deviationSegment = matchOpeningSegments({
    game: deviation,
    plies: deviationReplay.plies,
    nodes: runtime.nodes,
    access: () => access(),
  })[0];
  const deviationEvidence = extractDeterministicFindings({
    userId: "user-a",
    game: deviation,
    segment: deviationSegment,
    plies: deviationReplay.plies,
    trainer: runtime.trainer,
    access: access(),
  });
  assert.equal(deviationEvidence.length, 1);
  assert.equal(deviationEvidence[0].outcome, "missed_known_move");
  assert.ok(
    buildImportedFindingLearningEventInput("user-a", deviationEvidence[0]),
  );
});

test("locked and off-book positions do not become active personalization evidence", () => {
  const runtime = runtimeFixture();
  const game = normalizeProviderGame({
    provider: "lichess",
    externalId: "locked",
    username: "alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-09-14T00:00:00.000Z",
    result: "1-0",
    variant: "standard",
    pgn: `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. g3 g6 2. Nf3 Nf6 3. h4 Bg7`,
    moves: ["g2g3", "g7g6", "g1f3", "g8f6", "h2h4", "f8g7"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const lockedSegment = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: runtime.nodes,
    access: () => access("gated_pending"),
  })[0];
  const lockedEvidence = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment: lockedSegment,
    plies: replay.plies,
    trainer: runtime.trainer,
    access: access("gated_pending"),
  });
  assert.equal(lockedEvidence[0].status, "gated_pending");
  assert.equal(
    buildImportedFindingLearningEventInput("user-a", lockedEvidence[0]),
    null,
  );

  const offBookSegments = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: [],
    access: () => access(),
  });
  assert.deepEqual(offBookSegments, []);
});
