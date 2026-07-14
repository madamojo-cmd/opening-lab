import assert from "node:assert/strict";
import test from "node:test";
import { ChessComClient } from "../providers/chessCom";
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
import type { RuntimeOpeningNode } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";

const pgn = `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. c4 e6`;

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

test("golden provider fixture normalizes, matches, and produces one deterministic finding", () => {
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
    pgn,
    moves: ["d2d4", "d7d5", "c2c4", "e7e6"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const node: RuntimeOpeningNode = {
    nodeId: "node-1",
    openingId: "london-white",
    playKey: replay.plies[0].fenBefore.split(" ").slice(0, 4).join(" "),
    playSequenceUci: "e2e4",
    ply: 0,
    sideToMove: "white",
  };
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
    nodes: [node],
    access: () => access,
  });
  assert.equal(segments.length, 1);
  const findings = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment: segments[0],
    plies: replay.plies,
    nodes: [node],
    access,
  });
  assert.equal(dedupeFindings([...findings, ...findings]).length, 1);
  assert.equal(findings[0].status, "active");
  assert.equal(findings[0].position.expectedMoveUci, "e2e4");
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
    pgn,
    moves: ["d2d4"],
  });
  assert.ok(game);
  if (!game) return;
  const replay = replayPgn(game.pgn, game.playerColor);
  assert.equal(replay.ok, true);
  if (!replay.ok) return;
  const node: RuntimeOpeningNode = {
    nodeId: "node-1",
    openingId: "locked-opening",
    playKey: replay.plies[0].fenBefore.split(" ").slice(0, 4).join(" "),
    playSequenceUci: "e2e4",
    ply: 0,
    sideToMove: "white",
  };
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
    nodes: [node],
    access: () => access,
  })[0];
  const findings = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment,
    plies: replay.plies,
    nodes: [node],
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
