import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
import { processGameImportBatch } from "../jobs/processGameImportBatch";
import {
  createImportProviderAbortSignal,
  hasImportBatchBudget,
  IMPORT_WORKER_MIN_JOB_START_MS,
  sanitizeImportWorkerError,
  shouldStartImportJob,
} from "../importWorkerBudget";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
import type {
  GameImportJob,
  ProviderAccountRecord,
  ProviderGameRecord,
  OpeningSegmentRecord,
  ExtractedFinding,
} from "../gameDataTypes";
import type { TrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";

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

function runtimePackageFixture(openingId = "london-white") {
  const runtime = trainerFixture(openingId);
  return {
    nodes: runtime.nodes,
    candidates: [
      {
        openingId,
        playKeyBefore: "d2d4,d7d5",
        moveUci: "c2c4",
        rank: 1,
      },
    ],
  } as unknown as TrainingRuntimePackage;
}

function importJobFixture(
  overrides: Partial<GameImportJob> = {},
): GameImportJob {
  const now = "2026-07-14T00:00:00.000Z";
  return {
    id: overrides.id ?? `job-${crypto.randomUUID()}`,
    userId: "user-a",
    provider: "lichess",
    status: "leased",
    cursor: {
      provider: "lichess",
      cursor: null,
      requestedFrom: "2026-07-01T00:00:00.000Z",
      requestedTo: "2026-07-31T23:59:59.000Z",
      updatedAt: now,
      ...overrides.cursor,
    },
    attemptCount: 1,
    leaseOwner: "worker-a",
    leaseExpiresAt: "2026-07-14T00:01:00.000Z",
    correlationId: "correlation-a",
    counts: {
      fetched: 0,
      accepted: 0,
      duplicate: 0,
      excluded: 0,
      matched: 0,
      gated: 0,
      analyzed: 0,
      findings: 0,
      ...overrides.counts,
    },
    errorCode: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const providerAccountFixture: ProviderAccountRecord = {
  id: "provider-account-a",
  userId: "user-a",
  provider: "lichess",
  username: "alice",
  externalPlayerId: "alice",
  verificationState: "verified",
  connectedAt: "2026-07-01T00:00:00.000Z",
  lastSuccessfulSyncAt: null,
  nextEligibleSyncAt: null,
  sanitizedErrorCode: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

function rawGameFixture(id: string, gamePgn: string, moves: readonly string[]) {
  return {
    provider: "lichess" as const,
    externalId: id,
    username: "Alice",
    white: "alice",
    black: "bob",
    playedAt: "2026-07-14T00:00:00Z",
    result: "1-0" as const,
    timeControl: "rapid",
    rated: true,
    variant: "standard",
    pgn: gamePgn,
    moves,
  };
}

class TestImportJobRepository {
  readonly jobs = new Map<string, GameImportJob>();

  constructor(job: GameImportJob) {
    this.jobs.set(job.id, job);
  }

  async update(jobId: string, patch: Partial<GameImportJob>) {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("job_not_found");
    this.jobs.set(jobId, { ...job, ...patch });
  }

  async heartbeat(jobId: string, workerId: string) {
    const job = this.jobs.get(jobId);
    return (
      Boolean(job) && job?.status === "running" && job.leaseOwner === workerId
    );
  }
}

class TestExternalGameRepository {
  readonly games = new Map<string, ProviderGameRecord>();
  readonly findings = new Map<string, ExtractedFinding>();
  readonly segments = new Map<string, OpeningSegmentRecord>();

  async hasGame(
    userId: string,
    provider: ProviderGameRecord["provider"],
    fingerprint: string,
  ) {
    return this.games.has(`${userId}:${provider}:${fingerprint}`);
  }

  async saveGame(userId: string, game: ProviderGameRecord) {
    const fingerprint = game.providerFingerprint ?? game.fallbackFingerprint;
    this.games.set(`${userId}:${game.provider}:${fingerprint}`, game);
  }

  async saveSegment(userId: string, segment: OpeningSegmentRecord) {
    this.segments.set(`${userId}:${segment.segmentId}`, segment);
  }

  async saveFinding(userId: string, finding: ExtractedFinding) {
    const key = `${userId}:${finding.fingerprint}`;
    const duplicate = this.findings.has(key);
    this.findings.set(key, finding);
    return !duplicate;
  }
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

test("approved moves create positive audit evidence but no negative projection", () => {
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
  const positiveFindings = extractDeterministicFindings({
    userId: "user-a",
    game,
    segment,
    plies: replay.plies,
    trainer: runtime.trainer,
    access,
  });
  assert.equal(positiveFindings.length, 1);
  assert.equal(positiveFindings[0].outcome, "followed_known_repertoire");
  assert.equal(
    buildImportedFindingLearningEventInput("user-a", positiveFindings[0]),
    null,
  );
});

test("candidate-only moves do not create false imported findings", () => {
  const runtime = trainerFixture();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: new Date().toISOString(),
    authorityVersion: "test",
    expiresAt: null,
  };

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
  assert.equal(game.terminationReason, "white:win,black:checkmated");
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
    status: "mate",
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
  repository.recoverStranded(new Date("2026-01-01T00:02:00Z"));
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

test("partially completed import jobs remain active and resumable", async () => {
  const repository = new InMemoryImportJobRepository();
  const cursor = {
    provider: "chesscom" as const,
    cursor: JSON.stringify({ processedFingerprints: ["game-a"] }),
    requestedFrom: "2026-01-01T00:00:00Z",
    requestedTo: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-01T00:01:00Z",
  };
  const job = await repository.enqueue({
    userId: "resume-user",
    provider: "chesscom",
    cursor,
    correlationId: "resume",
  });
  await repository.update(job.id, {
    status: "partially_completed",
    leaseOwner: null,
    leaseExpiresAt: null,
  });

  const duplicateEnqueue = await repository.enqueue({
    userId: "resume-user",
    provider: "chesscom",
    cursor: { ...cursor, cursor: null },
    correlationId: "resume-duplicate",
  });
  assert.equal(duplicateEnqueue.id, job.id);

  const pending = await repository.nextPending(3);
  assert.equal(
    pending.some((candidate) => candidate.id === job.id),
    true,
  );
  const leased = await repository.lease(
    job.id,
    "worker-resume",
    new Date("2026-01-01T00:02:00Z"),
  );
  assert.equal(leased?.status, "leased");
  assert.equal(leased?.attemptCount, 1);
  assert.equal(leased?.cursor.cursor, cursor.cursor);
});

test("protected import worker route uses existing job lease and batch authorities", () => {
  const source = readFileSync(
    resolve(process.cwd(), "app/api/blundr/jobs/process-game-import/route.ts"),
    "utf8",
  );
  assert.match(source, /authorization/);
  assert.match(source, /x-blundr-cron-secret/);
  assert.match(source, /isGameDataWorkerEnabled/);
  assert.match(source, /importWorkerDeadline/);
  assert.match(source, /shouldStartImportJob/);
  assert.match(source, /jobs\.nextPending\(1\)/);
  assert.match(source, /jobs\.lease\(/);
  assert.match(source, /processGameImportBatch/);
  assert.match(source, /deadlineAt/);
  assert.match(source, /retryable_error/);
  assert.match(source, /dead_letter/);
});

test("worker budget helpers leave room for checkpointing and prevent another job", () => {
  const deadlineAt = Date.parse("2026-07-14T00:04:00.000Z");
  assert.equal(
    shouldStartImportJob({
      deadlineAt,
      nowMs: deadlineAt - IMPORT_WORKER_MIN_JOB_START_MS - 1,
    }),
    true,
  );
  assert.equal(
    shouldStartImportJob({
      deadlineAt,
      nowMs: deadlineAt - IMPORT_WORKER_MIN_JOB_START_MS,
    }),
    false,
  );
  assert.equal(
    hasImportBatchBudget({
      deadlineAt,
      nowMs: deadlineAt - 45_001,
      minRemainingMs: 45_000,
    }),
    true,
  );
  assert.equal(
    hasImportBatchBudget({
      deadlineAt,
      nowMs: deadlineAt - 45_000,
      minRemainingMs: 45_000,
    }),
    false,
  );
});

test("provider timeout signal aborts before route hard deadline and sanitizes", async () => {
  const signal = createImportProviderAbortSignal({
    deadlineAt: Date.now() + 50,
    timeoutBufferMs: 45,
  });
  assert.ok(signal);
  const reason = await new Promise<string>((resolve) => {
    signal.addEventListener(
      "abort",
      () => resolve(sanitizeImportWorkerError(signal.reason)),
      { once: true },
    );
  });
  assert.equal(reason, "network_timeout");
});

test("long import exits with a graceful checkpoint before worker budget is exhausted", async () => {
  const job = importJobFixture({ id: "job-budget" });
  const jobs = new TestImportJobRepository(job);
  const games = new TestExternalGameRepository();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: "2026-07-14T00:00:00.000Z",
    authorityVersion: "test",
    expiresAt: null,
  };
  let nowMs = Date.parse("2026-07-14T00:00:00.000Z");
  const gameA = rawGameFixture("budget-a", pgn, [
    "d2d4",
    "d7d5",
    "c2c4",
    "e7e6",
  ]);
  const gameB = rawGameFixture("budget-b", divergentPgn, [
    "d2d4",
    "d7d5",
    "f2f3",
    "e7e6",
  ]);

  const result = await processGameImportBatch(job, providerAccountFixture, {
    runtime: runtimePackageFixture(),
    jobs: jobs as never,
    games: games as never,
    workerId: "worker-a",
    maxGames: 10,
    deadlineAt: nowMs + 25_000,
    minRemainingMs: 10_000,
    now: () => new Date(nowMs),
    access: () => access,
    source: {
      async *streamGames(_username, bounds) {
        assert.ok(bounds.signal, "provider stream should receive abort signal");
        nowMs += 10_000;
        yield gameA;
        nowMs += 10_000;
        yield gameB;
      },
    },
  });

  assert.equal(result.status, "partially_completed");
  assert.equal(games.games.size, 1);
  assert.equal(games.findings.size, 1);
  const checkpoint = jobs.jobs.get(job.id);
  assert.equal(checkpoint?.status, "partially_completed");
  assert.equal(checkpoint?.leaseOwner, null);
  assert.equal(checkpoint?.leaseExpiresAt, null);
  assert.ok(checkpoint?.cursor.cursor);
  assert.equal(checkpoint?.counts.analyzed, 1);
});

test("budget checkpoint resumes from cursor without duplicate games or findings", async () => {
  const initialJob = importJobFixture({ id: "job-budget-resume" });
  const jobs = new TestImportJobRepository(initialJob);
  const games = new TestExternalGameRepository();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: "2026-07-14T00:00:00.000Z",
    authorityVersion: "test",
    expiresAt: null,
  };
  const gameA = rawGameFixture("budget-resume-a", pgn, [
    "d2d4",
    "d7d5",
    "c2c4",
    "e7e6",
  ]);
  const gameB = rawGameFixture("budget-resume-b", divergentPgn, [
    "d2d4",
    "d7d5",
    "f2f3",
    "e7e6",
  ]);
  const gameC = rawGameFixture(
    "budget-resume-c",
    `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. c4 e6 3. Nc3 Nf6`,
    ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6"],
  );
  let nowMs = Date.parse("2026-07-14T00:00:00.000Z");
  await processGameImportBatch(initialJob, providerAccountFixture, {
    runtime: runtimePackageFixture(),
    jobs: jobs as never,
    games: games as never,
    workerId: "worker-a",
    maxGames: 10,
    deadlineAt: nowMs + 25_000,
    minRemainingMs: 10_000,
    now: () => new Date(nowMs),
    access: () => access,
    source: {
      async *streamGames() {
        nowMs += 10_000;
        yield gameA;
        nowMs += 10_000;
        yield gameB;
      },
    },
  });
  const firstCounts = {
    games: games.games.size,
    findings: games.findings.size,
  };
  assert.deepEqual(firstCounts, { games: 1, findings: 1 });

  await jobs.update(initialJob.id, {
    status: "leased",
    leaseOwner: "worker-a",
    leaseExpiresAt: "2026-07-14T00:01:00.000Z",
  });
  const resumed = jobs.jobs.get(initialJob.id)!;
  const secondResult = await processGameImportBatch(
    resumed,
    providerAccountFixture,
    {
      runtime: runtimePackageFixture(),
      jobs: jobs as never,
      games: games as never,
      workerId: "worker-a",
      maxGames: 10,
      deadlineAt: Date.parse("2026-07-14T00:10:00.000Z"),
      minRemainingMs: 10_000,
      now: () => new Date("2026-07-14T00:02:00.000Z"),
      access: () => access,
      source: {
        async *streamGames() {
          yield gameA;
          yield gameB;
          yield gameC;
        },
      },
    },
  );

  assert.equal(secondResult.status, "completed");
  assert.equal(secondResult.counts.duplicate, 1);
  assert.equal(games.games.size, 3);
  assert.equal(games.findings.size, 3);
  assert.equal(jobs.jobs.get(initialJob.id)?.cursor.cursor, null);
});

test("game import processor resumes by stable game identity and does not duplicate evidence", async () => {
  const firstJob = importJobFixture();
  const jobs = new TestImportJobRepository(firstJob);
  const games = new TestExternalGameRepository();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: "2026-07-14T00:00:00.000Z",
    authorityVersion: "test",
    expiresAt: null,
  };
  const gameA = rawGameFixture("game-a", pgn, ["d2d4", "d7d5", "c2c4", "e7e6"]);
  const gameB = rawGameFixture("game-b", divergentPgn, [
    "d2d4",
    "d7d5",
    "f2f3",
    "e7e6",
  ]);
  const gameC = rawGameFixture(
    "game-c",
    `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. c4 e6 3. Nc3 Nf6`,
    ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6"],
  );

  const firstResult = await processGameImportBatch(
    firstJob,
    providerAccountFixture,
    {
      runtime: runtimePackageFixture(),
      jobs: jobs as never,
      games: games as never,
      workerId: "worker-a",
      maxGames: 2,
      now: () => new Date("2026-07-14T00:00:00.000Z"),
      access: () => access,
      source: {
        async *streamGames() {
          yield gameA;
          yield gameB;
          yield gameC;
        },
      },
    },
  );
  assert.equal(firstResult.status, "partially_completed");
  assert.equal(games.games.size, 2);
  assert.equal(games.findings.size, 2);
  const resumedJob = jobs.jobs.get(firstJob.id);
  assert.ok(resumedJob?.cursor.cursor);

  await jobs.update(firstJob.id, {
    status: "leased",
    leaseOwner: "worker-a",
    leaseExpiresAt: "2026-07-14T00:01:00.000Z",
  });
  const secondResult = await processGameImportBatch(
    jobs.jobs.get(firstJob.id)!,
    providerAccountFixture,
    {
      runtime: runtimePackageFixture(),
      jobs: jobs as never,
      games: games as never,
      workerId: "worker-a",
      maxGames: 2,
      now: () => new Date("2026-07-14T00:02:00.000Z"),
      access: () => access,
      source: {
        async *streamGames() {
          yield gameC;
          yield gameB;
          yield gameA;
        },
      },
    },
  );
  assert.equal(secondResult.status, "completed");
  assert.equal(games.games.size, 3);
  assert.equal(games.findings.size, 3);
  assert.equal(jobs.jobs.get(firstJob.id)?.cursor.cursor, null);
  const findingsBeforeReimport = games.findings.size;

  const reimportJob = importJobFixture({ id: "job-reimport" });
  const reimportJobs = new TestImportJobRepository(reimportJob);
  const reimportResult = await processGameImportBatch(
    reimportJob,
    providerAccountFixture,
    {
      runtime: runtimePackageFixture(),
      jobs: reimportJobs as never,
      games: games as never,
      workerId: "worker-a",
      maxGames: 10,
      now: () => new Date("2026-07-14T00:03:00.000Z"),
      access: () => access,
      source: {
        async *streamGames() {
          yield gameA;
          yield gameB;
          yield gameC;
        },
      },
    },
  );
  assert.equal(reimportResult.status, "completed");
  assert.equal(reimportResult.counts.duplicate, 3);
  assert.equal(games.games.size, 3);
  assert.equal(games.findings.size, findingsBeforeReimport);
});

test("game import processor isolates malformed PGN and continues remaining games", async () => {
  const job = importJobFixture({ id: "job-malformed" });
  const jobs = new TestImportJobRepository(job);
  const games = new TestExternalGameRepository();
  const access = {
    openingId: "london-white",
    repertoireSide: "white" as const,
    decision: "active" as const,
    checkedAt: "2026-07-14T00:00:00.000Z",
    authorityVersion: "test",
    expiresAt: null,
  };
  const result = await processGameImportBatch(job, providerAccountFixture, {
    runtime: runtimePackageFixture(),
    jobs: jobs as never,
    games: games as never,
    workerId: "worker-a",
    maxGames: 10,
    now: () => new Date("2026-07-14T00:00:00.000Z"),
    access: () => access,
    source: {
      async *streamGames() {
        yield rawGameFixture(
          "bad-game",
          `[Event "fixture"]\n[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. e4 e5 2. e5`,
          ["e2e4", "e7e5", "e4e5"],
        );
        yield rawGameFixture("good-game", divergentPgn, [
          "d2d4",
          "d7d5",
          "f2f3",
          "e7e6",
        ]);
      },
    },
  });
  assert.equal(result.status, "completed");
  assert.equal(result.counts.excluded, 1);
  assert.equal(result.counts.analyzed, 1);
  assert.equal(games.games.size, 1);
  assert.equal(games.findings.size, 1);
});

test("game import processor leaves provider failures retryable by preserving cursor state", async () => {
  const job = importJobFixture({ id: "job-provider-error" });
  const jobs = new TestImportJobRepository(job);
  await assert.rejects(
    processGameImportBatch(job, providerAccountFixture, {
      runtime: runtimePackageFixture(),
      jobs: jobs as never,
      games: new TestExternalGameRepository() as never,
      workerId: "worker-a",
      maxGames: 10,
      now: () => new Date("2026-07-14T00:00:00.000Z"),
      access: () => ({
        openingId: "london-white",
        repertoireSide: "white" as const,
        decision: "active" as const,
        checkedAt: "2026-07-14T00:00:00.000Z",
        authorityVersion: "test",
        expiresAt: null,
      }),
      source: {
        async *streamGames() {
          throw new Error("provider_unavailable");
        },
      },
    }),
    /provider_unavailable/,
  );
  assert.equal(jobs.jobs.get(job.id)?.status, "running");
  assert.equal(jobs.jobs.get(job.id)?.cursor.cursor, null);
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
