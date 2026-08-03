import path from "node:path";
import { loadVerifiedTrainingRuntimePackage } from "../trainingRuntime/trainingRuntimePackage";
import { TRAINING_RUNTIME_PACKAGE_ROOT } from "../trainingRuntime/trainingRuntimeSchema";
import type { Stage2RuntimeBookLoadResult } from "./runtimeBookTypes";

const DEFAULT_PACKAGE_ROOT = path.join(
  process.cwd(),
  TRAINING_RUNTIME_PACKAGE_ROOT,
);

export async function loadStage2RuntimeBook(options?: {
  packageRoot?: string;
}): Promise<Stage2RuntimeBookLoadResult> {
  const packageRoot = options?.packageRoot ?? DEFAULT_PACKAGE_ROOT;
  const runtime = await loadVerifiedTrainingRuntimePackage({ packageRoot });
  return {
    packageRoot: runtime.packageRoot,
    runtimeDir: runtime.packageRoot,
    nodeFilePath: path.join(
      runtime.packageRoot,
      "opening-book.nodes.runtime.v1.jsonl",
    ),
    moveFilePath: path.join(
      runtime.packageRoot,
      "opening-book.candidates.runtime.v1.jsonl",
    ),
    nodes: [...runtime.nodes],
    moves: [...runtime.candidates],
  };
}
