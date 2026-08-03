import path from "node:path";
import { buildTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/buildTrainingRuntimePackage";
import {
  TRAINING_RUNTIME_BUILD_GIT_SHA,
  TRAINING_RUNTIME_PACKAGE_ROOT,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";

function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

async function main() {
  const openingNodesFile = arg("--nodes");
  const candidateMovesFile = arg("--candidates");
  if (!openingNodesFile || !candidateMovesFile)
    throw new Error(
      "Authoritative --nodes and --candidates JSONL inputs are required.",
    );
  const result = await buildTrainingRuntimePackage({
    openingNodesFile: path.resolve(openingNodesFile),
    candidateMovesFile: path.resolve(candidateMovesFile),
    outputRoot: path.resolve(arg("--out") ?? TRAINING_RUNTIME_PACKAGE_ROOT),
    gitSha: arg("--git-sha") ?? TRAINING_RUNTIME_BUILD_GIT_SHA,
    builtAt: arg("--built-at") ?? undefined,
  });
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
