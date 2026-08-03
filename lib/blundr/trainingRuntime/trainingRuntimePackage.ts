import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { appendRuntimeMove, RUNTIME_STARTPOS_PLAY_KEY } from "./runtimePlayKey";
import {
  TRAINING_RUNTIME_BUILD_GIT_SHA,
  TRAINING_RUNTIME_FILES,
  TRAINING_RUNTIME_MAX_MOVES_PER_PARENT,
  TRAINING_RUNTIME_MAX_PLY,
  TRAINING_RUNTIME_MIN_TOTAL_GAMES,
  TRAINING_RUNTIME_OPENING_COUNT,
  TRAINING_RUNTIME_PACKAGE_ID,
  TRAINING_RUNTIME_PACKAGE_ROOT,
  TRAINING_RUNTIME_PROFILE,
  TRAINING_RUNTIME_SCHEMA_VERSION,
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
import { validateOpeningNodes } from "./validateOpeningNodes";

export type TrainingRuntimePackage = {
  packageRoot: string;
  manifest: TrainingRuntimeManifest;
  nodes: readonly RuntimeOpeningNode[];
  candidates: readonly RuntimeCandidateMove[];
  openingIndex: TrainingRuntimeOpeningIndex;
  openingAvailability: TrainingRuntimeOpeningAvailability;
  validationReport: TrainingRuntimeValidationReport;
};

export type ExpectedTrainingRuntimeIdentity = {
  packageId: string;
  schemaVersion: string;
  gitSha: string;
  openingCount: number;
  maximumPly: number;
  profileId: string;
  minimumTotalGames: number;
  maximumMovesPerParent: number;
  sourceFiles: {
    openingNodes: RuntimeSourceFileIdentity;
    candidateMoves: RuntimeSourceFileIdentity;
  };
};

export const EXPECTED_TRAINING_RUNTIME_IDENTITY: ExpectedTrainingRuntimeIdentity =
  {
    packageId: TRAINING_RUNTIME_PACKAGE_ID,
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    gitSha: TRAINING_RUNTIME_BUILD_GIT_SHA,
    openingCount: TRAINING_RUNTIME_OPENING_COUNT,
    maximumPly: TRAINING_RUNTIME_MAX_PLY,
    profileId: TRAINING_RUNTIME_PROFILE,
    minimumTotalGames: TRAINING_RUNTIME_MIN_TOTAL_GAMES,
    maximumMovesPerParent: TRAINING_RUNTIME_MAX_MOVES_PER_PARENT,
    sourceFiles: TRAINING_RUNTIME_SOURCE_FILES,
  };

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function readRequiredFile(packageRoot: string, file: string) {
  let raw: string;
  try {
    raw = await readFile(path.join(packageRoot, file), "utf8");
  } catch {
    throw new Error(`training_runtime_file_missing:${file}`);
  }
  if (!raw.length) throw new Error(`training_runtime_file_empty:${file}`);
  return raw;
}

function parseJson<T>(raw: string, file: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`training_runtime_json_parse_error:${file}:${detail}`);
  }
}

function parseJsonl(raw: string, file: string): unknown[] {
  const rows: unknown[] = [];
  for (const [index, line] of raw.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line) as unknown);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `training_runtime_jsonl_parse_error:${file}:${index + 1}:${detail}`,
      );
    }
  }
  if (!rows.length) throw new Error(`training_runtime_file_empty:${file}`);
  return rows;
}

function parseChecksums(raw: string): Map<string, string> {
  const checksums = new Map<string, string>();
  for (const line of raw.split("\n").filter(Boolean)) {
    const match = /^([a-f0-9]{64})  ([^/]+)$/.exec(line);
    if (!match) throw new Error(`training_runtime_checksums_invalid:${line}`);
    if (checksums.has(match[2]))
      throw new Error(`training_runtime_checksums_duplicate:${match[2]}`);
    checksums.set(match[2], match[1]);
  }
  return checksums;
}

function assertEqual(label: string, actual: unknown, expected: unknown): void {
  if (actual !== expected)
    throw new Error(
      `training_runtime_identity_mismatch:${label}:${String(actual)}:${String(expected)}`,
    );
}

function assertSourceIdentity(
  actual: RuntimeSourceFileIdentity,
  expected: RuntimeSourceFileIdentity,
  label: string,
): void {
  assertEqual(`${label}.fileName`, actual?.fileName, expected.fileName);
  assertEqual(`${label}.rows`, actual?.rows, expected.rows);
  assertEqual(`${label}.sha256`, actual?.sha256, expected.sha256);
}

function verifyRuntimeGraph(
  nodes: readonly RuntimeOpeningNode[],
  candidates: readonly RuntimeCandidateMove[],
  expected: ExpectedTrainingRuntimeIdentity,
): void {
  const nodesByKey = new Map(
    nodes.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  if (nodesByKey.size !== nodes.length)
    throw new Error("training_runtime_duplicate_runtime_node");
  const openingIds = new Set(nodes.map((node) => node.openingId));
  assertEqual("openingCount", openingIds.size, expected.openingCount);
  assertEqual(
    "maximumStoredPly",
    Math.max(...nodes.map((node) => node.ply)),
    expected.maximumPly,
  );
  for (const openingId of openingIds) {
    if (!nodesByKey.has(`${openingId}:${RUNTIME_STARTPOS_PLAY_KEY}`))
      throw new Error(`training_runtime_startpos_missing:${openingId}`);
  }
  const candidateIdentities = new Set<string>();
  const counts = new Map<string, number>();
  for (const candidate of candidates) {
    const identity = `${candidate.openingId}:${candidate.playKeyBefore}:${candidate.moveUci}:${candidate.profileId ?? ""}`;
    if (candidateIdentities.has(identity))
      throw new Error(
        `training_runtime_duplicate_runtime_candidate:${identity}`,
      );
    candidateIdentities.add(identity);
    assertEqual("candidateProfile", candidate.profileId, expected.profileId);
    if (Number(candidate.totalGames ?? -1) < expected.minimumTotalGames)
      throw new Error(
        `training_runtime_candidate_frequency_below_minimum:${identity}`,
      );
    if (
      typeof candidate.playPct !== "number" ||
      candidate.playPct < 0 ||
      candidate.playPct > 1
    )
      throw new Error(
        `training_runtime_candidate_play_pct_invalid:${identity}`,
      );
    const parentKey = `${candidate.openingId}:${candidate.playKeyBefore}`;
    const parent = nodesByKey.get(parentKey);
    if (!parent)
      throw new Error(`training_runtime_candidate_parent_missing:${identity}`);
    const childKey = `${candidate.openingId}:${appendRuntimeMove(candidate.playKeyBefore, candidate.moveUci)}`;
    const child = nodesByKey.get(childKey);
    if (!child || child.ply !== parent.ply + 1)
      throw new Error(`training_runtime_candidate_child_missing:${identity}`);
    counts.set(parentKey, (counts.get(parentKey) ?? 0) + 1);
  }
  for (const [parent, count] of counts) {
    if (count > expected.maximumMovesPerParent)
      throw new Error(
        `training_runtime_candidate_cap_exceeded:${parent}:${count}`,
      );
  }
}

export async function loadVerifiedTrainingRuntimePackage(options?: {
  packageRoot?: string;
  expectedIdentity?: ExpectedTrainingRuntimeIdentity;
}): Promise<TrainingRuntimePackage> {
  const packageRoot = path.resolve(
    options?.packageRoot ?? TRAINING_RUNTIME_PACKAGE_ROOT,
  );
  const expected =
    options?.expectedIdentity ?? EXPECTED_TRAINING_RUNTIME_IDENTITY;
  const requiredFiles = [
    TRAINING_RUNTIME_FILES.manifest,
    TRAINING_RUNTIME_FILES.nodes,
    TRAINING_RUNTIME_FILES.candidates,
    TRAINING_RUNTIME_FILES.openingIndex,
    TRAINING_RUNTIME_FILES.openingAvailability,
    TRAINING_RUNTIME_FILES.validationReport,
    TRAINING_RUNTIME_FILES.checksums,
  ];
  const contents = new Map<string, string>();
  await Promise.all(
    requiredFiles.map(async (file) => {
      contents.set(file, await readRequiredFile(packageRoot, file));
    }),
  );
  const checksums = parseChecksums(
    contents.get(TRAINING_RUNTIME_FILES.checksums)!,
  );
  for (const file of requiredFiles.filter(
    (entry) => entry !== TRAINING_RUNTIME_FILES.checksums,
  )) {
    const expectedChecksum = checksums.get(file);
    if (!expectedChecksum)
      throw new Error(`training_runtime_checksum_missing:${file}`);
    const actualChecksum = sha256(contents.get(file)!);
    if (actualChecksum !== expectedChecksum)
      throw new Error(
        `training_runtime_checksum_mismatch:${file}:${actualChecksum}:${expectedChecksum}`,
      );
  }
  if (checksums.size !== requiredFiles.length - 1)
    throw new Error("training_runtime_checksums_unexpected_entry");

  const manifest = parseJson<TrainingRuntimeManifest>(
    contents.get(TRAINING_RUNTIME_FILES.manifest)!,
    TRAINING_RUNTIME_FILES.manifest,
  );
  assertEqual("packageId", manifest.packageId, expected.packageId);
  assertEqual("schemaVersion", manifest.schemaVersion, expected.schemaVersion);
  assertEqual("gitSha", manifest.gitSha, expected.gitSha);
  assertEqual("openingCount", manifest.openingCount, expected.openingCount);
  assertEqual("maxPly", manifest.maxPly, expected.maximumPly);
  assertEqual("runtimeProfile", manifest.runtimeProfile, expected.profileId);
  assertEqual(
    "minimumTotalGames",
    manifest.minimumTotalGames,
    expected.minimumTotalGames,
  );
  assertEqual(
    "maximumMovesPerParent",
    manifest.maximumMovesPerParent,
    expected.maximumMovesPerParent,
  );
  assertSourceIdentity(
    manifest.sourceFiles.openingNodes,
    expected.sourceFiles.openingNodes,
    "sourceFiles.openingNodes",
  );
  assertSourceIdentity(
    manifest.sourceFiles.candidateMoves,
    expected.sourceFiles.candidateMoves,
    "sourceFiles.candidateMoves",
  );
  for (const [file, checksum] of Object.entries(manifest.files)) {
    assertEqual(`manifest.files.${file}`, checksums.get(file), checksum);
  }

  const validatedNodes = validateOpeningNodes(
    parseJsonl(
      contents.get(TRAINING_RUNTIME_FILES.nodes)!,
      TRAINING_RUNTIME_FILES.nodes,
    ),
  );
  if (validatedNodes.rejected.length)
    throw new Error(
      `training_runtime_nodes_invalid:${JSON.stringify(validatedNodes.rejected.slice(0, 3))}`,
    );
  const validatedCandidates = validateCandidateMoves(
    parseJsonl(
      contents.get(TRAINING_RUNTIME_FILES.candidates)!,
      TRAINING_RUNTIME_FILES.candidates,
    ),
    validatedNodes.accepted,
  );
  if (validatedCandidates.rejected.length)
    throw new Error(
      `training_runtime_candidates_invalid:${JSON.stringify(validatedCandidates.rejected.slice(0, 3))}`,
    );
  assertEqual(
    "acceptedCounts.nodes",
    validatedNodes.accepted.length,
    manifest.acceptedCounts.nodes,
  );
  assertEqual(
    "acceptedCounts.candidates",
    validatedCandidates.accepted.length,
    manifest.acceptedCounts.candidates,
  );
  assertEqual("rejectedCount", manifest.rejectedCount, 0);
  verifyRuntimeGraph(
    validatedNodes.accepted,
    validatedCandidates.accepted,
    expected,
  );

  const openingIndex = parseJson<TrainingRuntimeOpeningIndex>(
    contents.get(TRAINING_RUNTIME_FILES.openingIndex)!,
    TRAINING_RUNTIME_FILES.openingIndex,
  );
  const openingAvailability = parseJson<TrainingRuntimeOpeningAvailability>(
    contents.get(TRAINING_RUNTIME_FILES.openingAvailability)!,
    TRAINING_RUNTIME_FILES.openingAvailability,
  );
  const validationReport = parseJson<TrainingRuntimeValidationReport>(
    contents.get(TRAINING_RUNTIME_FILES.validationReport)!,
    TRAINING_RUNTIME_FILES.validationReport,
  );
  for (const artifact of [
    openingIndex,
    openingAvailability,
    validationReport,
  ]) {
    assertEqual("artifact.packageId", artifact.packageId, expected.packageId);
    assertEqual(
      "artifact.schemaVersion",
      artifact.schemaVersion,
      expected.schemaVersion,
    );
  }
  assertEqual(
    "openingIndex.openings",
    openingIndex.openings.length,
    expected.openingCount,
  );
  assertEqual(
    "openingAvailability.openings",
    openingAvailability.openings.length,
    expected.openingCount,
  );
  assertEqual("validationReport.valid", validationReport.valid, true);
  return {
    packageRoot,
    manifest,
    nodes: validatedNodes.accepted,
    candidates: validatedCandidates.accepted,
    openingIndex,
    openingAvailability,
    validationReport,
  };
}
