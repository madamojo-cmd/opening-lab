// Server/request-time loader for the built versioned runtime package only.
import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
  TrainingRuntimeManifest,
} from "./trainingRuntimeSchema";

const PACKAGE_ROOT = path.resolve(
  process.cwd(),
  "data/blundr/stage2-21-opening-stepdown-runtime-v1",
);
const cache = new Map<string, Promise<TrainingRuntimePackage>>();

export type TrainingRuntimePackage = {
  manifest: TrainingRuntimeManifest;
  nodes: readonly RuntimeOpeningNode[];
  candidates: readonly RuntimeCandidateMove[];
};
async function readJsonl<T>(file: string): Promise<T[]> {
  const raw = await readFile(file, "utf8");
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export function loadTrainingRuntimePackage(
  packageRoot = PACKAGE_ROOT,
): Promise<TrainingRuntimePackage> {
  const existing = cache.get(packageRoot);
  if (existing) return existing;
  const loading = Promise.all([
    readFile(
      path.join(packageRoot, "manifests/stage2-stepdown-runtime-manifest.json"),
      "utf8",
    ).then((raw) => JSON.parse(raw) as TrainingRuntimeManifest),
    readJsonl<RuntimeOpeningNode>(
      path.join(packageRoot, "runtime/opening-book.nodes.runtime.v1.jsonl"),
    ),
    readJsonl<RuntimeCandidateMove>(
      path.join(packageRoot, "runtime/opening-book.moves.runtime.v1.jsonl"),
    ),
  ]).then(([manifest, nodes, candidates]) => ({ manifest, nodes, candidates }));
  cache.set(packageRoot, loading);
  return loading;
}
