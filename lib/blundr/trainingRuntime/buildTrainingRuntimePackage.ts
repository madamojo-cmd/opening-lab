import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildTranspositionGroups } from "./buildTranspositionGroups";
import { appendRuntimeMove, RUNTIME_STARTPOS_PLAY_KEY } from "./runtimePlayKey";
import {
  TRAINING_RUNTIME_BUILDER_VERSION,
  TRAINING_RUNTIME_BUILD_GIT_SHA,
  TRAINING_RUNTIME_FILES,
  TRAINING_RUNTIME_MAX_MOVES_PER_PARENT,
  TRAINING_RUNTIME_MAX_PLY,
  TRAINING_RUNTIME_MIN_TOTAL_GAMES,
  TRAINING_RUNTIME_OPENING_COUNT,
  TRAINING_RUNTIME_PACKAGE_ID,
  TRAINING_RUNTIME_PROFILE,
  TRAINING_RUNTIME_SCHEMA_VERSION,
  TRAINING_RUNTIME_SOURCE,
  TRAINING_RUNTIME_SOURCE_FILES,
  type RuntimeCandidateMove,
  type RuntimeOpeningNode,
  type RuntimeSourceFileIdentity,
  type TrainingRuntimeManifest,
  type TrainingRuntimeOpeningAvailability,
  type TrainingRuntimeOpeningIndex,
  type TrainingRuntimeValidationReport,
} from "./trainingRuntimeSchema";
import { validateCandidateMoves } from "./validateCandidateMoves";
import {
  validateOpeningNode,
  validateOpeningNodes,
} from "./validateOpeningNodes";

const DEFAULT_BUILT_AT = "2026-08-03T00:00:00.000Z";
const ROUNDING_POLICY = "preserve-source-play-pct-v1";

type SourceIdentity = {
  openingNodes: RuntimeSourceFileIdentity;
  candidateMoves: RuntimeSourceFileIdentity;
};

export type BuildTrainingRuntimePackageOptions = {
  openingNodesFile: string;
  candidateMovesFile: string;
  outputRoot: string;
  gitSha?: string;
  builtAt?: string;
  packageId?: string;
  profileId?: string;
  minimumTotalGames?: number;
  maximumMovesPerParent?: number;
  maximumPly?: number;
  expectedOpeningCount?: number;
  expectedSourceFiles?: SourceIdentity;
};

export type BuildTrainingRuntimePackageResult = {
  outputRoot: string;
  manifest: TrainingRuntimeManifest;
  validationReport: TrainingRuntimeValidationReport;
};

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseJsonl(raw: string, source: string): unknown[] {
  const rows: unknown[] = [];
  for (const [index, line] of raw.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line) as unknown);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `training_runtime_malformed_jsonl:${source}:${index + 1}:${detail}`,
      );
    }
  }
  return rows;
}

function assertSourceIdentity(
  name: keyof SourceIdentity,
  raw: string,
  rows: readonly unknown[],
  expected: RuntimeSourceFileIdentity,
): void {
  if (!raw.length) throw new Error(`training_runtime_source_empty:${name}`);
  if (rows.length !== expected.rows)
    throw new Error(
      `training_runtime_source_row_count_mismatch:${name}:${rows.length}:${expected.rows}`,
    );
  const checksum = sha256(raw);
  if (checksum !== expected.sha256)
    throw new Error(
      `training_runtime_source_checksum_mismatch:${name}:${checksum}:${expected.sha256}`,
    );
}

function nodeSourceKey(node: RuntimeOpeningNode): string {
  return `${node.openingId}:${node.playKey}:${node.profileId ?? ""}`;
}

function candidateSourceKey(candidate: RuntimeCandidateMove): string {
  return `${candidate.openingId}:${candidate.playKeyBefore}:${candidate.moveUci}:${candidate.profileId ?? ""}`;
}

function assertUnique<T>(
  values: readonly T[],
  key: (value: T) => string,
  reason: string,
): void {
  const seen = new Set<string>();
  for (const value of values) {
    const identity = key(value);
    if (seen.has(identity))
      throw new Error(`training_runtime_duplicate_${reason}:${identity}`);
    seen.add(identity);
  }
}

function candidateOrder(
  left: RuntimeCandidateMove,
  right: RuntimeCandidateMove,
): number {
  return (
    Number(right.playPct ?? -1) - Number(left.playPct ?? -1) ||
    Number(right.totalGames ?? -1) - Number(left.totalGames ?? -1) ||
    left.moveUci.localeCompare(right.moveUci)
  );
}

function runtimeCandidate(
  candidate: RuntimeCandidateMove,
  rank: number,
): RuntimeCandidateMove {
  return {
    nodeId: candidate.nodeId,
    openingId: candidate.openingId,
    playKeyBefore: candidate.playKeyBefore,
    moveUci: candidate.moveUci,
    moveSan: candidate.moveSan,
    ply: candidate.ply,
    totalGames: candidate.totalGames,
    playPct: candidate.playPct,
    averageRating: candidate.averageRating ?? null,
    learnerToMove: candidate.learnerToMove,
    isBookCandidate: candidate.isBookCandidate,
    blundrUse: candidate.blundrUse,
    profileId: candidate.profileId,
    profiles: candidate.profileId,
    source: candidate.source,
    sources: candidate.source,
    rank,
  };
}

function generatedNodeId(openingId: string, playKey: string): string {
  return createHash("sha1").update(`${openingId}:${playKey}`).digest("hex");
}

function generateTerminalNode(
  parent: RuntimeOpeningNode,
  candidate: RuntimeCandidateMove,
  maximumPly: number,
): RuntimeOpeningNode {
  const playKey = appendRuntimeMove(parent.playKey, candidate.moveUci);
  const result = validateOpeningNode(
    {
      nodeId: generatedNodeId(parent.openingId, playKey),
      openingId: parent.openingId,
      displayName: parent.displayName,
      learnerPerspective: parent.learnerPerspective,
      playKey,
      playSequenceUci: playKey,
      ply: parent.ply + 1,
      sideToMove: parent.sideToMove === "white" ? "black" : "white",
      source: candidate.source ?? parent.source,
      profileId: candidate.profileId ?? parent.profileId,
      totalGames: candidate.totalGames,
      trainerCutoff: parent.ply + 1 >= maximumPly,
      generatedFromCandidate: true,
    },
    0,
  );
  if ("rejection" in result)
    throw new Error(
      `training_runtime_generated_node_invalid:${parent.openingId}:${playKey}:${result.rejection.reason}`,
    );
  return result.node;
}

function serializeJsonl(rows: readonly unknown[]): string {
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function buildTrainingRuntimePackage(
  options: BuildTrainingRuntimePackageOptions,
): Promise<BuildTrainingRuntimePackageResult> {
  const expectedSources =
    options.expectedSourceFiles ?? TRAINING_RUNTIME_SOURCE_FILES;
  const profileId = options.profileId ?? TRAINING_RUNTIME_PROFILE;
  const minimumTotalGames =
    options.minimumTotalGames ?? TRAINING_RUNTIME_MIN_TOTAL_GAMES;
  const maximumMovesPerParent =
    options.maximumMovesPerParent ?? TRAINING_RUNTIME_MAX_MOVES_PER_PARENT;
  const maximumPly = options.maximumPly ?? TRAINING_RUNTIME_MAX_PLY;
  const expectedOpeningCount =
    options.expectedOpeningCount ?? TRAINING_RUNTIME_OPENING_COUNT;
  const packageId = options.packageId ?? TRAINING_RUNTIME_PACKAGE_ID;
  const gitSha = options.gitSha ?? TRAINING_RUNTIME_BUILD_GIT_SHA;
  const builtAt = options.builtAt ?? DEFAULT_BUILT_AT;
  const [rawNodeText, rawCandidateText] = await Promise.all([
    readFile(options.openingNodesFile, "utf8"),
    readFile(options.candidateMovesFile, "utf8"),
  ]);
  const rawNodes = parseJsonl(rawNodeText, "openingNodes");
  const rawCandidates = parseJsonl(rawCandidateText, "candidateMoves");
  assertSourceIdentity(
    "openingNodes",
    rawNodeText,
    rawNodes,
    expectedSources.openingNodes,
  );
  assertSourceIdentity(
    "candidateMoves",
    rawCandidateText,
    rawCandidates,
    expectedSources.candidateMoves,
  );

  const validatedNodes = validateOpeningNodes(rawNodes);
  if (validatedNodes.rejected.length)
    throw new Error(
      `training_runtime_invalid_opening_nodes:${JSON.stringify(validatedNodes.rejected.slice(0, 5))}`,
    );
  assertUnique(validatedNodes.accepted, nodeSourceKey, "opening_node");
  const validatedCandidates = validateCandidateMoves(
    rawCandidates,
    validatedNodes.accepted,
  );
  if (validatedCandidates.rejected.length)
    throw new Error(
      `training_runtime_invalid_candidate_moves:${JSON.stringify(validatedCandidates.rejected.slice(0, 5))}`,
    );
  assertUnique(
    validatedCandidates.accepted,
    candidateSourceKey,
    "candidate_move",
  );

  const profileNodes = validatedNodes.accepted.filter(
    (node) => node.profileId === profileId,
  );
  const nodesByKey = new Map(
    profileNodes.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  const groupedCandidates = new Map<string, RuntimeCandidateMove[]>();
  for (const candidate of validatedCandidates.accepted) {
    const parent = nodesByKey.get(
      `${candidate.openingId}:${candidate.playKeyBefore}`,
    );
    if (
      candidate.profileId !== profileId ||
      candidate.isBookCandidate !== true ||
      Number(candidate.totalGames ?? -1) < minimumTotalGames ||
      !parent ||
      parent.ply >= maximumPly
    )
      continue;
    const key = `${candidate.openingId}:${candidate.playKeyBefore}`;
    groupedCandidates.set(key, [
      ...(groupedCandidates.get(key) ?? []),
      candidate,
    ]);
  }
  const rankedCandidatesByParent = new Map(
    [...groupedCandidates].map(([key, group]) => [
      key,
      [...group]
        .sort(candidateOrder)
        .slice(0, maximumMovesPerParent)
        .map((candidate, index) => runtimeCandidate(candidate, index + 1)),
    ]),
  );
  const roots = profileNodes
    .filter((node) => node.playKey === RUNTIME_STARTPOS_PLAY_KEY)
    .sort((left, right) => left.openingId.localeCompare(right.openingId));
  const runtimeNodesByKey = new Map(
    roots.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  const runtimeCandidates: RuntimeCandidateMove[] = [];
  const pending = [...roots];
  let generatedTerminalNodeCount = 0;
  while (pending.length) {
    const parent = pending.shift()!;
    const parentKey = `${parent.openingId}:${parent.playKey}`;
    for (const candidate of rankedCandidatesByParent.get(parentKey) ?? []) {
      runtimeCandidates.push(candidate);
      const childKey = `${candidate.openingId}:${appendRuntimeMove(candidate.playKeyBefore, candidate.moveUci)}`;
      if (runtimeNodesByKey.has(childKey)) continue;
      const authoritativeChild = nodesByKey.get(childKey);
      if (authoritativeChild) {
        runtimeNodesByKey.set(childKey, authoritativeChild);
        pending.push(authoritativeChild);
      } else {
        runtimeNodesByKey.set(
          childKey,
          generateTerminalNode(parent, candidate, maximumPly),
        );
        generatedTerminalNodeCount += 1;
      }
    }
  }
  runtimeCandidates.sort(
    (left, right) =>
      left.openingId.localeCompare(right.openingId) ||
      left.playKeyBefore.localeCompare(right.playKeyBefore) ||
      Number(left.rank) - Number(right.rank) ||
      left.moveUci.localeCompare(right.moveUci),
  );
  const runtimeNodes = [...runtimeNodesByKey.values()].sort(
    (left, right) =>
      left.openingId.localeCompare(right.openingId) ||
      left.ply - right.ply ||
      left.playKey.localeCompare(right.playKey),
  );
  assertUnique(
    runtimeNodes,
    (node) => `${node.openingId}:${node.playKey}`,
    "runtime_node",
  );
  assertUnique(
    runtimeCandidates,
    (candidate) =>
      `${candidate.openingId}:${candidate.playKeyBefore}:${candidate.moveUci}:${candidate.profileId ?? ""}`,
    "runtime_candidate",
  );

  const openingIds = [
    ...new Set(runtimeNodes.map((node) => node.openingId)),
  ].sort();
  if (openingIds.length !== expectedOpeningCount)
    throw new Error(
      `training_runtime_opening_count_mismatch:${openingIds.length}:${expectedOpeningCount}`,
    );
  const maximumStoredPly = Math.max(...runtimeNodes.map((node) => node.ply));
  if (maximumStoredPly !== maximumPly)
    throw new Error(
      `training_runtime_maximum_ply_mismatch:${maximumStoredPly}:${maximumPly}`,
    );
  for (const openingId of openingIds) {
    if (!runtimeNodesByKey.has(`${openingId}:${RUNTIME_STARTPOS_PLAY_KEY}`))
      throw new Error(`training_runtime_startpos_missing:${openingId}`);
  }

  const openingIndex: TrainingRuntimeOpeningIndex = {
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    packageId,
    openings: openingIds.map((openingId) => {
      const nodes = runtimeNodes.filter((node) => node.openingId === openingId);
      const root = runtimeNodesByKey.get(
        `${openingId}:${RUNTIME_STARTPOS_PLAY_KEY}`,
      )!;
      return {
        openingId,
        displayName: root.displayName ?? openingId,
        learnerPerspective: root.learnerPerspective ?? "white",
        rootPlayKey: RUNTIME_STARTPOS_PLAY_KEY,
        nodeCount: nodes.length,
        candidateCount: runtimeCandidates.filter(
          (candidate) => candidate.openingId === openingId,
        ).length,
        maximumStoredPly: Math.max(...nodes.map((node) => node.ply)),
      };
    }),
  };
  const openingAvailability: TrainingRuntimeOpeningAvailability = {
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    packageId,
    openings: openingIds.map((openingId) => ({
      openingId,
      available: true,
      reason: "runtime_verified",
    })),
  };
  const validationReport: TrainingRuntimeValidationReport = {
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    packageId,
    valid: true,
    sourceRows: {
      openingNodes: rawNodes.length,
      candidateMoves: rawCandidates.length,
    },
    runtimeRows: {
      nodes: runtimeNodes.length,
      candidates: runtimeCandidates.length,
    },
    openingCount: openingIds.length,
    maximumStoredPly,
    generatedTerminalNodeCount,
    checks: [
      "source_checksums",
      "source_row_counts",
      "authoritative_jsonl_schema",
      "canonical_startpos",
      "canonical_uci_replay",
      "candidate_parent_identity",
      "candidate_uniqueness",
      "candidate_frequency_bounds",
      "maximum_eight_moves_per_parent",
      "maximum_twelve_plies",
      "twenty_one_openings",
    ],
  };

  const nodeJsonl = serializeJsonl(runtimeNodes);
  const candidateJsonl = serializeJsonl(runtimeCandidates);
  const openingIndexJson = serializeJson(openingIndex);
  const availabilityJson = serializeJson(openingAvailability);
  const validationJson = serializeJson(validationReport);
  const fileChecksums: Record<string, string> = {
    [TRAINING_RUNTIME_FILES.nodes]: sha256(nodeJsonl),
    [TRAINING_RUNTIME_FILES.candidates]: sha256(candidateJsonl),
    [TRAINING_RUNTIME_FILES.openingIndex]: sha256(openingIndexJson),
    [TRAINING_RUNTIME_FILES.openingAvailability]: sha256(availabilityJson),
    [TRAINING_RUNTIME_FILES.validationReport]: sha256(validationJson),
  };
  const manifest: TrainingRuntimeManifest = {
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    packageId,
    source: TRAINING_RUNTIME_SOURCE,
    sourceFiles: {
      openingNodes: { ...expectedSources.openingNodes },
      candidateMoves: { ...expectedSources.candidateMoves },
    },
    openingCount: openingIds.length,
    maxPly: maximumPly,
    builtAt,
    builderVersion: TRAINING_RUNTIME_BUILDER_VERSION,
    gitSha,
    runtimeProfile: profileId,
    minimumTotalGames,
    maximumMovesPerParent,
    roundingPolicy: ROUNDING_POLICY,
    files: fileChecksums,
    acceptedCounts: {
      nodes: runtimeNodes.length,
      candidates: runtimeCandidates.length,
    },
    rejectedCount: 0,
    transpositionGroupCount: buildTranspositionGroups(runtimeNodes).length,
  };
  const manifestJson = serializeJson(manifest);
  const checksumEntries = {
    ...fileChecksums,
    [TRAINING_RUNTIME_FILES.manifest]: sha256(manifestJson),
  };
  const checksums = `${Object.entries(checksumEntries)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, checksum]) => `${checksum}  ${file}`)
    .join("\n")}\n`;
  const outputRoot = path.resolve(options.outputRoot);
  await mkdir(outputRoot, { recursive: true });
  await Promise.all([
    writeFile(path.join(outputRoot, TRAINING_RUNTIME_FILES.nodes), nodeJsonl),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.candidates),
      candidateJsonl,
    ),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.openingIndex),
      openingIndexJson,
    ),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.openingAvailability),
      availabilityJson,
    ),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.validationReport),
      validationJson,
    ),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.manifest),
      manifestJson,
    ),
    writeFile(
      path.join(outputRoot, TRAINING_RUNTIME_FILES.checksums),
      checksums,
    ),
  ]);
  return { outputRoot, manifest, validationReport };
}
