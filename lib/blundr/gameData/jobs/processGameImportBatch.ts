import "server-only";
import { replayPgn } from "../pgnReplay";
import {
  normalizeProviderGame,
  shouldIncludeTimeControl,
} from "../gameNormalizer";
import { matchOpeningSegments } from "../openingSegmentMatcher";
import { extractDeterministicFindings } from "../findingExtractor";
import { addImportMetrics } from "../importMetrics";
import { ExternalGameRepository } from "../externalGameRepository";
import { ImportJobRepository } from "../importJobRepository";
import {
  createImportProviderAbortSignal,
  hasImportBatchBudget,
  IMPORT_BATCH_CHECKPOINT_BUFFER_MS,
} from "../importWorkerBudget";
import type {
  OpeningAccessSnapshot,
  ProviderKind,
} from "@/lib/blundr/contracts";
import type { TrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import type { ProviderRequestBounds } from "../gameDataTypes";
import type { RawProviderGame } from "../gameNormalizer";
import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";
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
  deadlineAt?: number;
  minRemainingMs?: number;
};

type ProcessedCursorState = {
  processedFingerprints: readonly string[];
};

function processedCursorState(cursor: string | null): ProcessedCursorState {
  if (!cursor) return { processedFingerprints: [] };
  try {
    const parsed = JSON.parse(cursor) as {
      processed?: unknown;
      processedFingerprints?: unknown;
    };
    const fingerprints = Array.isArray(parsed.processedFingerprints)
      ? parsed.processedFingerprints
          .filter((value): value is string => typeof value === "string")
          .filter(Boolean)
      : [];
    return { processedFingerprints: fingerprints };
  } catch {
    return { processedFingerprints: [] };
  }
}

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
  const minRemainingMs =
    deps.minRemainingMs ?? IMPORT_BATCH_CHECKPOINT_BUFFER_MS;
  const processedState = processedCursorState(job.cursor.cursor);
  const processedFingerprints = new Set(processedState.processedFingerprints);
  const batchFingerprints = new Set<string>();
  const runtimeIndices = createRuntimeEvidenceIndices(
    deps.runtime.nodes,
    deps.runtime.candidates,
  );
  await jobs.update(job.id, { status: "running" });
  if (!(await jobs.heartbeat(job.id, deps.workerId, now())))
    throw new Error("lease_lost");
  let counts: ImportMetrics = job.counts;
  let budgetExhausted = false;
  const bounds: ProviderRequestBounds = {
    from: new Date(job.cursor.requestedFrom),
    to: new Date(job.cursor.requestedTo),
    maxGames: maxGames + processedFingerprints.size,
    signal: createImportProviderAbortSignal({
      deadlineAt: deps.deadlineAt,
      nowMs: now().valueOf(),
    }),
  };
  let processed = 0;
  const nextFingerprints = new Set(processedFingerprints);
  const checkpoint = async (
    status: "completed" | "partially_completed",
  ): Promise<{
    status: "completed" | "partially_completed";
    counts: ImportMetrics;
  }> => {
    await jobs.update(job.id, {
      status,
      cursor: {
        ...job.cursor,
        cursor:
          status === "partially_completed"
            ? JSON.stringify({ processedFingerprints: [...nextFingerprints] })
            : null,
        updatedAt: now().toISOString(),
      },
      counts,
      leaseOwner: null,
      leaseExpiresAt: null,
    });
    return { status, counts };
  };
  try {
    for await (const raw of deps.source.streamGames(account.username, bounds)) {
      if (
        !hasImportBatchBudget({
          deadlineAt: deps.deadlineAt,
          nowMs: now().valueOf(),
          minRemainingMs,
        })
      ) {
        budgetExhausted = true;
        break;
      }
      if (!(await jobs.heartbeat(job.id, deps.workerId, now())))
        throw new Error("lease_lost");
      if (processed >= maxGames) break;
      counts = addImportMetrics(counts, { fetched: 1 });
      const normalized = normalizeProviderGame(raw);
      if (!normalized || !shouldIncludeTimeControl(normalized.timeControl)) {
        counts = addImportMetrics(counts, { excluded: 1 });
        processed += 1;
        continue;
      }
      const fingerprint =
        normalized.providerFingerprint ?? normalized.fallbackFingerprint;
      if (batchFingerprints.has(fingerprint)) {
        counts = addImportMetrics(counts, { duplicate: 1 });
        continue;
      }
      if (processedFingerprints.has(fingerprint)) {
        counts = addImportMetrics(counts, { duplicate: 1 });
        continue;
      }
      processed += 1;
      if (await games.hasGame(job.userId, normalized.provider, fingerprint)) {
        counts = addImportMetrics(counts, { duplicate: 1 });
        nextFingerprints.add(fingerprint);
        batchFingerprints.add(fingerprint);
        continue;
      }
      counts = addImportMetrics(counts, { accepted: 1 });
      const replay = replayPgn(normalized.pgn, normalized.playerColor);
      if (!replay.ok) {
        counts = addImportMetrics(counts, { excluded: 1 });
        nextFingerprints.add(fingerprint);
        batchFingerprints.add(fingerprint);
        continue;
      }
      const segments = matchOpeningSegments({
        game: normalized,
        plies: replay.plies,
        nodes: deps.runtime.nodes,
        access: (openingId, side) => deps.access(job.userId, openingId, side),
      });
      await games.saveGame(job.userId, normalized);
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
          game: normalized,
          segment,
          plies: replay.plies,
          trainer: runtimeIndices.trainer,
          access,
        });
        for (const finding of findings) {
          const inserted = await games.saveFinding(job.userId, finding);
          if (inserted) counts = addImportMetrics(counts, { findings: 1 });
        }
      }
      nextFingerprints.add(fingerprint);
      batchFingerprints.add(fingerprint);
      counts = addImportMetrics(counts, { analyzed: 1 });
    }
  } catch (error) {
    if (nextFingerprints.size > processedFingerprints.size)
      return checkpoint("partially_completed");
    throw error;
  }
  return checkpoint(
    budgetExhausted || processed >= maxGames
      ? "partially_completed"
      : "completed",
  );
}

export function createProviderSource(
  provider: ProviderKind,
  clients: { chesscom: GameDataSource; lichess: GameDataSource },
): GameDataSource {
  return provider === "chesscom" ? clients.chesscom : clients.lichess;
}
