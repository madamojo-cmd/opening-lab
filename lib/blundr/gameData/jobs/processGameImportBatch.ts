import "server-only";
import { replayPgn } from "../pgnReplay";
import {
  normalizeProviderGame,
  shouldIncludeTimeControl,
} from "../gameNormalizer";
import { dedupeGames } from "../findingDedupe";
import { matchOpeningSegments } from "../openingSegmentMatcher";
import { extractDeterministicFindings } from "../findingExtractor";
import { addImportMetrics } from "../importMetrics";
import { ExternalGameRepository } from "../externalGameRepository";
import { ImportJobRepository } from "../importJobRepository";
import type {
  OpeningAccessSnapshot,
  ProviderKind,
} from "@/lib/blundr/contracts";
import type { TrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import type { ProviderRequestBounds } from "../gameDataTypes";
import type { RawProviderGame } from "../gameNormalizer";
import type {
  ProviderAccountRecord,
  GameImportJob,
  ImportMetrics,
} from "../gameDataTypes";

export type GameDataSource = {
  streamGames(
    username: string,
    bounds: ProviderRequestBounds,
  ): AsyncGenerator<RawProviderGame>;
};

export type GameImportProcessorDeps = {
  jobs?: ImportJobRepository;
  games?: ExternalGameRepository;
  runtime: TrainingRuntimePackage;
  source: GameDataSource;
  access: (
    userId: string,
    openingId: string,
    side: "white" | "black",
  ) => OpeningAccessSnapshot;
  workerId: string;
  now?: () => Date;
  maxGames?: number;
};

export async function processGameImportBatch(
  job: GameImportJob,
  account: ProviderAccountRecord,
  deps: GameImportProcessorDeps,
): Promise<{
  status: "completed" | "partially_completed";
  counts: ImportMetrics;
}> {
  const jobs = deps.jobs ?? new ImportJobRepository();
  const games = deps.games ?? new ExternalGameRepository();
  const now = deps.now ?? (() => new Date());
  const maxGames = Math.min(Math.max(deps.maxGames ?? 25, 1), 100);
  await jobs.update(job.id, { status: "running" });
  let counts: ImportMetrics = job.counts;
  const acceptedGames = [] as ReturnType<typeof normalizeProviderGame>[];
  const bounds: ProviderRequestBounds = {
    from: new Date(job.cursor.requestedFrom),
    to: new Date(job.cursor.requestedTo),
    maxGames,
  };
  for await (const raw of deps.source.streamGames(account.username, bounds)) {
    counts = addImportMetrics(counts, { fetched: 1 });
    const normalized = normalizeProviderGame(raw);
    if (!normalized || !shouldIncludeTimeControl(normalized.timeControl)) {
      counts = addImportMetrics(counts, { excluded: 1 });
      continue;
    }
    const fingerprint =
      normalized.providerFingerprint ?? normalized.fallbackFingerprint;
    if (await games.hasGame(job.userId, fingerprint)) {
      counts = addImportMetrics(counts, { duplicate: 1 });
      continue;
    }
    acceptedGames.push(normalized);
    counts = addImportMetrics(counts, { accepted: 1 });
  }
  for (const game of dedupeGames(acceptedGames)) {
    const replay = replayPgn(game.pgn, game.playerColor);
    if (!replay.ok) {
      counts = addImportMetrics(counts, { excluded: 1 });
      continue;
    }
    await games.saveGame(job.userId, game);
    const segments = matchOpeningSegments({
      game,
      plies: replay.plies,
      nodes: deps.runtime.nodes,
      access: (openingId, side) => deps.access(job.userId, openingId, side),
    });
    counts = addImportMetrics(counts, {
      matched: segments.length,
      gated: segments.filter((segment) => segment.accessState !== "active")
        .length,
    });
    for (const segment of segments) {
      await games.saveSegment(job.userId, segment);
      const access = deps.access(
        job.userId,
        segment.openingId,
        segment.repertoireSide,
      );
      const findings = extractDeterministicFindings({
        userId: job.userId,
        game,
        segment,
        plies: replay.plies,
        nodes: deps.runtime.nodes,
        access,
      });
      for (const finding of findings) {
        const inserted = await games.saveFinding(job.userId, finding);
        if (inserted) counts = addImportMetrics(counts, { findings: 1 });
      }
    }
    counts = addImportMetrics(counts, { analyzed: 1 });
  }
  const status =
    counts.fetched >= maxGames ? "partially_completed" : "completed";
  await jobs.update(job.id, {
    status,
    counts,
    leaseOwner: null,
    leaseExpiresAt: null,
  });
  return { status, counts };
}

export function createProviderSource(
  provider: ProviderKind,
  clients: { chesscom: GameDataSource; lichess: GameDataSource },
): GameDataSource {
  return provider === "chesscom" ? clients.chesscom : clients.lichess;
}
