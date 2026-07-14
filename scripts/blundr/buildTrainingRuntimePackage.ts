import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateCandidateMoves } from "@/lib/blundr/trainingRuntime/validateCandidateMoves";
import { validateOpeningNodes } from "@/lib/blundr/trainingRuntime/validateOpeningNodes";
import { buildTranspositionGroups } from "@/lib/blundr/trainingRuntime/buildTranspositionGroups";
import { TRAINING_RUNTIME_SCHEMA_VERSION } from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";

const DEFAULT_SOURCE = path.resolve(
  "data/blundr/stage2-21-opening-stepdown-runtime-v1",
);
function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
async function jsonl<T>(file: string): Promise<T[]> {
  return (await readFile(file, "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

async function main() {
  const source = path.resolve(arg("--source") ?? DEFAULT_SOURCE);
  const output = arg("--out");
  if (!output)
    throw new Error(
      "Refusing to write a runtime package without explicit --out.",
    );
  const outputRoot = path.resolve(output);
  const [rawNodes, rawCandidates] = await Promise.all([
    jsonl<unknown>(
      path.join(source, "runtime/opening-book.nodes.runtime.v1.jsonl"),
    ),
    jsonl<unknown>(
      path.join(source, "runtime/opening-book.moves.runtime.v1.jsonl"),
    ),
  ]);
  const nodes = validateOpeningNodes(rawNodes);
  const nodeIndex = new Map(
    nodes.accepted.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  const candidates = validateCandidateMoves(rawCandidates, nodes.accepted);
  const dedupedNodes = [
    ...new Map(
      nodes.accepted.map((node) => [`${node.openingId}:${node.playKey}`, node]),
    ).values(),
  ].sort((a, b) =>
    `${a.openingId}:${a.playKey}`.localeCompare(`${b.openingId}:${b.playKey}`),
  );
  const dedupedCandidates = [
    ...new Map(
      candidates.accepted.map((candidate) => [
        `${candidate.openingId}:${candidate.playKeyBefore}:${candidate.moveUci}`,
        candidate,
      ]),
    ).values(),
  ].sort((a, b) =>
    `${a.openingId}:${a.playKeyBefore}:${a.rank ?? 0}:${a.moveUci}`.localeCompare(
      `${b.openingId}:${b.playKeyBefore}:${b.rank ?? 0}:${b.moveUci}`,
    ),
  );
  const nodeJsonl =
    dedupedNodes.map((row) => JSON.stringify(row)).join("\n") + "\n";
  const candidateJsonl =
    dedupedCandidates.map((row) => JSON.stringify(row)).join("\n") + "\n";
  const rejectionRows = [...nodes.rejected, ...candidates.rejected];
  const rejectionJsonl =
    rejectionRows.map((row) => JSON.stringify(row)).join("\n") +
    (rejectionRows.length ? "\n" : "");
  const manifest = {
    schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
    packageId: "blundr-training-runtime-v1",
    sourceVersion: path.basename(source),
    generatedAt: "deterministic",
    checksums: {
      nodes: sha256(nodeJsonl),
      candidates: sha256(candidateJsonl),
      rejections: sha256(rejectionJsonl),
    },
    acceptedCounts: {
      nodes: dedupedNodes.length,
      candidates: dedupedCandidates.length,
    },
    rejectedCount: rejectionRows.length,
    transpositionGroupCount: buildTranspositionGroups(dedupedNodes).length,
  };
  await mkdir(path.join(outputRoot, "runtime"), { recursive: true });
  await mkdir(path.join(outputRoot, "manifests"), { recursive: true });
  await mkdir(path.join(outputRoot, "reports"), { recursive: true });
  await Promise.all([
    writeFile(
      path.join(outputRoot, "runtime/opening-nodes.v1.jsonl"),
      nodeJsonl,
    ),
    writeFile(
      path.join(outputRoot, "runtime/candidate-moves.v1.jsonl"),
      candidateJsonl,
    ),
    writeFile(
      path.join(outputRoot, "reports/rejected-rows.jsonl"),
      rejectionJsonl,
    ),
    writeFile(
      path.join(outputRoot, "manifests/manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    ),
  ]);
  void nodeIndex;
  console.log(JSON.stringify({ outputRoot, manifest }, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
