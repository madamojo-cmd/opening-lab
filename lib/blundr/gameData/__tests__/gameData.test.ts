import assert from "node:assert/strict";
import test from "node:test";
import { ChessComClient } from "../providers/chessCom";
import { adaptChessComGame } from "../providers/chessCom/chessComGameAdapter";
import { boundedArchiveMonths } from "../providers/chessCom";
import { chessComRetryDecision } from "../providers/chessCom";
import { parseLichessNdjson } from "../providers/lichess";
import { lichessRetryDelay } from "../providers/lichess";
import { normalizeProviderGame } from "../gameNormalizer";
import { replayPgn } from "../pgnReplay";
import { matchOpeningSegments } from "../openingSegmentMatcher";
import { extractDeterministicFindings } from "../findingExtractor";
import { dedupeFindings } from "../findingDedupe";
import { normalizeProviderUsername } from "../gameFingerprint";
import { InMemoryImportJobRepository } from "../inMemoryImportJobRepository";
import { buildImportedFindingLearningEventInput } from "../importedFindingProjection";
import { buildSuccessfulProviderSyncAccount } from "../providerAccountSync";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";

const pgn = `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. c4 e6`;
const divergentPgn = `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. f3 e6`;

function trainerFixture(openingId = "london-white") {
  const nodes: RuntimeOpeningNode[] = [
    {
      nodeId: "parent",
      openingId,
      playKey: "d2d4,d7d5",
      playSequenceUci: "d2d4,d7d5",
      ply: 2,
      sideToMove: "white",
    },
    {
      nodeId: "child",
      openingId,
      playKey: "d2d4,d7d5,c2c4",
      playSequenceUci: "d2d4,d7d5,c2c4",
      ply: 3,
      sideToMove: "black",
    },
  ];
  const candidates: RuntimeCandidateMove[] = [
    {
      openingId,
      playKeyBefore: "d2d4,d7d5",
      moveUci: "c2c4",
      rank: 1,
    },
  ];
  return {
    nodes,
    trainer: createRuntimeEvidenceIndices(nodes, candidates).trainer,
  };
}

test("PGN replay records exact pre-move FEN and player color", () => {
  const replay = replayPgn(pgn, "white");
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  assert.equal(
    replay.plies[0].fenBefore,
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  assert.equal(replay.plies[0].moveUci, "d2d4");
  assert.equal(replay.plies[0].isPlayerMove, true);
  assert.equal(replay.plies[1].isPlayerMove, false);
});

test("golden provider fixture matches a node-backed position and produces one deterministic finding", () => {
  const game = normalizeProviderGame({
    provider: "lichess",
    externalId: "abc",
    username: "Alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-07-14T00:00:00Z",
    result: "1-0",
    timeControl: "rapid",
    rated: true,
    variant: "standard",
    pgn: divergentPgn,
    moves: ["d2d4", "d7d5", "f2f3", "e7e6"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const runtime = trainerFixture();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: new Date().toISOString(),
    authorityVersion: "test",
    expiresAt: null,
  };
  const segments = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: runtime.nodes,
    access: () => access,
  });
  assert.equal(segments.length, 1);
  const findings = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment: segments[0],
    plies: replay.plies,
    trainer: runtime.trainer,
    access,
  });
  assert.equal(dedupeFindings([...findings, ...findings]).length, 1);
  assert.equal(findings[0].status, "active");
  assert.equal(findings[0].position.expectedMoveUci, "c2c4");
  assert.equal(findings[0].position.moveOrderKey, "d2d4,d7d5");
  const projection = buildImportedFindingLearningEventInput(
    "user-a",
    findings[0],
  );
  assert.equal(projection?.source, "imported_game");
  assert.equal(projection?.taxonomy, "move_incorrect");
  assert.equal(projection?.position.openingId, "london-white");
  assert.equal(projection?.position.moveOrderKey, "d2d4,d7d5");
  assert.equal(projection?.correct, false);
});

test("approved and candidate-only moves do not create false imported findings", () => {
  const game = normalizeProviderGame({
    provider: "lichess",
    externalId: "correct",
    username: "Alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-07-14T00:00:00Z",
    result: "1-0",
    timeControl: "rapid",
    rated: true,
    variant: "standard",
    pgn,
    moves: ["d2d4", "d7d5", "c2c4", "e7e6"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const runtime = trainerFixture();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: new Date().toISOString(),
    authorityVersion: "test",
    expiresAt: null,
  };
  const segment = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: runtime.nodes,
    access: () => access,
  })[0];
  assert.deepEqual(
    extractDeterministicFindings({
      userId: "user-a",
      game,
      segment,
      plies: replay.plies,
      trainer: runtime.trainer,
      access,
    }),
    [],
  );

  const candidateOnly = createRuntimeEvidenceIndices(runtime.nodes, [
    {
      openingId: "london-white",
      playKeyBefore: "d2d4,d7d5",
      moveUci: "f2f3",
      rank: 2,
    },
  ]).trainer;
  assert.equal(
    candidateOnly.childMovesByParent.get("london-white:d2d4,d7d5")?.length ?? 0,
    0,
  );
  const candidateOnlyGame = normalizeProviderGame({
    provider: "lichess",
    externalId: "candidate-only",
    username: "Alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-07-14T00:00:00Z",
    result: "1-0",
    timeControl: "rapid",
    rated: true,
    variant: "standard",
    pgn: divergentPgn,
    moves: ["d2d4", "d7d5", "f2f3", "e7e6"],
  });
  assert.ok(candidateOnlyGame);
  if (!candidateOnlyGame) return;
  const candidateReplay = replayPgn(
    candidateOnlyGame.pgn,
    candidateOnlyGame.playerColor,
  );
  assert.equal(candidateReplay.ok, true);
  if (!candidateReplay.ok) return;
  const candidateSegment = matchOpeningSegments({
    game: candidateOnlyGame,
    plies: candidateReplay.plies,
    nodes: runtime.nodes,
    access: () => access,
  })[0];
  assert.deepEqual(
    extractDeterministicFindings({
      userId: "user-a",
      game: candidateOnlyGame,
      segment: candidateSegment,
      plies: candidateReplay.plies,
      trainer: candidateOnly,
      access,
    }),
    [],
  );
});

test("locked matching segment stays gated and cannot become an active finding", () => {
  const game = normalizeProviderGame({
    provider: "chesscom",
    externalId: "abc",
    username: "Alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-07-14T00:00:00Z",
    result: "1-0",
    variant: "standard",
    pgn: divergentPgn,
    moves: ["d2d4", "d7d5", "f2f3", "e7e6"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const runtime = trainerFixture("locked-opening");
  const access = {
    openingId: "locked-opening",
    repertoireSide: "white" as const,
    decision: "gated_pending" as const,
    checkedAt: new Date().toISOString(),
    authorityVersion: "test",
    expiresAt: null,
  };
  const segment = matchOpeningSegments({
    game,
    plies: replay.plies,
    nodes: runtime.nodes,
    access: () => access,
  })[0];
  const findings = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment,
    plies: replay.plies,
    trainer: runtime.trainer,
    access,
  });
  assert.equal(segment.accessState, "gated_pending");
  assert.equal(findings[0].status, "gated_pending");
});

test("Chess.com client sends conditional headers and handles 304", async () => {
  const calls: RequestInit[] = [];
  const client = new ChessComClient(async (_input, init) => {
    calls.push(init ?? {});
    return new Response(null, { status: 304 });
  });
  const result = await client.fetchArchivePage("alice", "2026/07", {
    etag: "etag-1",
    lastModified: "yesterday",
  });
  assert.equal(result.notModified, true);
  const headers = calls[0].headers as Record<string, string>;
  assert.equal(headers["If-None-Match"], "etag-1");
  assert.equal(headers["If-Modified-Since"], "yesterday");
});

test("Chess.com adapter accepts the public API nested player shape", () => {
  const game = adaptChessComGame(
    {
      uuid: "game-1",
      white: { username: "Alice", result: "win", rating: 1500 },
      black: { username: "Bob", result: "checkmated", rating: 1490 },
      rules: "chess",
      time_control: "600",
      end_time: 1_784_000_000,
      rated: true,
      pgn,
    },
    "alice",
  );
  assert.ok(game);
  assert.equal(game.white, "Alice");
  assert.equal(game.black, "Bob");
  assert.equal(game.result, "1-0");
  assert.equal(game.variant, "standard");
  assert.deepEqual(game.moves, ["d2d4", "d7d5", "c2c4", "e7e6"]);
  assert.ok(normalizeProviderGame(game));
});

test("Lichess parser accepts CRLF and records split across chunks", async () => {
  const line = JSON.stringify({
    id: "g1",
    createdAt: Date.now(),
    winner: "white",
    players: {
      white: { user: { name: "alice" } },
      black: { user: { name: "bob" } },
    },
    pgn,
    moves: "d2d4 d7d5",
    variant: "standard",
  });
  const encoder = new TextEncoder();
  const bytes = encoder.encode(`${line}\r\n`);
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.slice(0, 17));
      controller.enqueue(bytes.slice(17));
      controller.close();
    },
  });
  const games = [];
  for await (const game of parseLichessNdjson(stream, "alice"))
    games.push(game);
  assert.equal(games.length, 1);
  assert.equal(games[0].provider, "lichess");
});

test("provider boundaries normalize usernames, bound archive traversal, and retry safely", async () => {
  assert.equal(normalizeProviderUsername(" Alice Smith "), "alicesmith");
  assert.deepEqual(
    boundedArchiveMonths(new Date("2026-01-01"), new Date("2027-12-01"), 13)
      .length,
    13,
  );
  assert.equal(chessComRetryDecision(404, 0).retry, false);
  assert.equal(chessComRetryDecision(429, 0, () => 0).retry, true);
  assert.ok(lichessRetryDelay(503, 0, () => 0));
});

test("in-memory import jobs deduplicate concurrent sync requests and lease takeover", async () => {
  const repository = new InMemoryImportJobRepository();
  const cursor = {
    provider: "lichess" as const,
    cursor: null,
    requestedFrom: "2026-01-01T00:00:00Z",
    requestedTo: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  const jobs = await Promise.all([
    repository.enqueue({
      userId: "u",
      provider: "lichess",
      cursor,
      correlationId: "a",
    }),
    repository.enqueue({
      userId: "u",
      provider: "lichess",
      cursor,
      correlationId: "b",
    }),
  ]);
  assert.equal(new Set(jobs.map((job) => job.id)).size, 1);
  assert.ok(
    await repository.lease(
      jobs[0].id,
      "worker-a",
      new Date("2026-01-01T00:00:00Z"),
    ),
  );
  assert.equal(
    await repository.lease(
      jobs[0].id,
      "worker-b",
      new Date("2026-01-01T00:00:30Z"),
    ),
    null,
  );
  assert.ok(
    await repository.lease(
      jobs[0].id,
      "worker-b",
      new Date("2026-01-01T00:02:00Z"),
    ),
  );
});

test("provider import jobs recover stranded work and retain cumulative attempts", async () => {
  const repository = new InMemoryImportJobRepository();
  const cursor = {
    provider: "lichess" as const,
    cursor: null,
    requestedFrom: "2026-01-01T00:00:00Z",
    requestedTo: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  const job = await repository.enqueue({
    userId: "recovery-user",
    provider: "lichess",
    cursor,
    correlationId: "recovery",
  });
  const firstLease = await repository.lease(
    job.id,
    "worker-a",
    new Date("2026-01-01T00:00:00Z"),
  );
  assert.equal(firstLease?.attemptCount, 1);
  await repository.update(job.id, { status: "running" });
  await repository.recoverStranded(new Date("2026-01-01T00:02:00Z"));
  const pending = await repository.nextPending(3);
  assert.equal(
    pending.some((candidate) => candidate.id === job.id),
    true,
  );
  const recovered = await repository.lease(
    job.id,
    "worker-b",
    new Date("2026-01-01T00:02:00Z"),
  );
  assert.equal(recovered?.attemptCount, 2);
  await repository.update(job.id, {
    status: "retryable_error",
    errorCode: "provider_unavailable",
    leaseOwner: null,
    leaseExpiresAt: null,
  });
  const retry = await repository.lease(
    job.id,
    "worker-c",
    new Date("2026-01-01T00:03:00Z"),
  );
  assert.equal(retry?.attemptCount, 3);
});

test("a completed provider worker records a truthful successful sync timestamp", () => {
  const synced = buildSuccessfulProviderSyncAccount(
    {
      id: "account-1",
      userId: "user-1",
      provider: "chesscom",
      username: "alice",
      externalPlayerId: null,
      verificationState: "retryable_error",
      connectedAt: "2026-07-01T00:00:00.000Z",
      lastSuccessfulSyncAt: null,
      nextEligibleSyncAt: null,
      sanitizedErrorCode: "provider_unavailable",
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    },
    "2026-07-20T12:00:00.000Z",
  );
  assert.equal(synced.verificationState, "verified");
  assert.equal(synced.lastSuccessfulSyncAt, "2026-07-20T12:00:00.000Z");
  assert.equal(synced.sanitizedErrorCode, null);
});
